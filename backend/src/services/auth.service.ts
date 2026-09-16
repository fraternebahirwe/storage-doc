import bcrypt from "bcryptjs";
import crypto from "crypto";
import { prisma } from "../lib/prisma.js";
import { ApiError } from "../utils/ApiError.js";
import { env } from "../config/env.js";
import type { ForgotPasswordInput, LoginInput, RegisterInput, ResetPasswordInput } from "../validation/auth.validation.js";

const PASSWORD_RESET_TTL_MS = 1000 * 60 * 30; // 30 minutes

export function serializeUser(user: {
  id: string;
  name: string;
  email: string;
  avatarUrl: string | null;
  storageLimit: bigint;
  createdAt: Date;
}) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    avatarUrl: user.avatarUrl,
    storageLimit: Number(user.storageLimit),
    createdAt: user.createdAt,
  };
}

export async function registerUser(input: RegisterInput) {
  const existing = await prisma.user.findUnique({ where: { email: input.email } });
  if (existing) {
    throw ApiError.conflict("An account with that email already exists.", "EMAIL_TAKEN");
  }

  const passwordHash = await bcrypt.hash(input.password, 12);
  const user = await prisma.user.create({
    data: {
      name: input.name,
      email: input.email,
      passwordHash,
      storageLimit: BigInt(env.DEFAULT_STORAGE_LIMIT_BYTES),
    },
  });

  return serializeUser(user);
}

export async function verifyCredentials(input: LoginInput) {
  const user = await prisma.user.findUnique({ where: { email: input.email } });
  if (!user) {
    throw ApiError.unauthorized("That email or password is incorrect.", "INVALID_CREDENTIALS");
  }

  const valid = await bcrypt.compare(input.password, user.passwordHash);
  if (!valid) {
    throw ApiError.unauthorized("That email or password is incorrect.", "INVALID_CREDENTIALS");
  }

  return user;
}

export async function getUserById(userId: string) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    throw ApiError.unauthorized();
  }
  return serializeUser(user);
}

function hashToken(token: string) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

/**
 * Generates a password reset token. Always returns null for unknown emails
 * (callers must not leak whether an email is registered).
 */
export async function createPasswordResetToken(input: ForgotPasswordInput): Promise<string | null> {
  const user = await prisma.user.findUnique({ where: { email: input.email } });
  if (!user) return null;

  const token = crypto.randomBytes(32).toString("hex");
  await prisma.user.update({
    where: { id: user.id },
    data: {
      passwordResetTokenHash: hashToken(token),
      passwordResetExpiresAt: new Date(Date.now() + PASSWORD_RESET_TTL_MS),
    },
  });

  return token;
}

export async function resetPassword(input: ResetPasswordInput) {
  const tokenHash = hashToken(input.token);
  const user = await prisma.user.findFirst({
    where: {
      passwordResetTokenHash: tokenHash,
      passwordResetExpiresAt: { gt: new Date() },
    },
  });

  if (!user) {
    throw ApiError.badRequest(
      "This password reset link is invalid or has expired. Request a new one.",
      "INVALID_RESET_TOKEN",
    );
  }

  const passwordHash = await bcrypt.hash(input.password, 12);
  await prisma.user.update({
    where: { id: user.id },
    data: {
      passwordHash,
      passwordResetTokenHash: null,
      passwordResetExpiresAt: null,
    },
  });
}
