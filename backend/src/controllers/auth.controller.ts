import type { CookieOptions, Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler.js";
import { env, isProduction } from "../config/env.js";
import { signToken } from "../utils/jwt.js";
import {
  forgotPasswordSchema,
  loginSchema,
  registerSchema,
  resetPasswordSchema,
} from "../validation/auth.validation.js";
import {
  createPasswordResetToken,
  getUserById,
  registerUser,
  resetPassword,
  serializeUser,
  verifyCredentials,
} from "../services/auth.service.js";
import { sendPasswordResetEmail } from "../services/email.service.js";

const SESSION_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000; // 7 days
const REMEMBER_MAX_AGE_MS = 30 * 24 * 60 * 60 * 1000; // 30 days

function cookieOptions(maxAgeMs?: number): CookieOptions {
  return {
    httpOnly: true,
    secure: isProduction,
    sameSite: "lax",
    path: "/",
    ...(maxAgeMs ? { maxAge: maxAgeMs } : {}),
  };
}

function setSessionCookie(res: Response, userId: string, remember: boolean) {
  const maxAgeMs = remember ? REMEMBER_MAX_AGE_MS : SESSION_MAX_AGE_MS;
  const token = signToken({ userId }, `${Math.floor(maxAgeMs / 1000)}s`);
  res.cookie(env.COOKIE_NAME, token, cookieOptions(maxAgeMs));
}

export const register = asyncHandler(async (req: Request, res: Response) => {
  const input = registerSchema.parse(req.body);
  const user = await registerUser(input);
  setSessionCookie(res, user.id, false);
  res.status(201).json({ user });
});

export const login = asyncHandler(async (req: Request, res: Response) => {
  const input = loginSchema.parse(req.body);
  const user = await verifyCredentials(input);
  setSessionCookie(res, user.id, input.remember);
  res.status(200).json({ user: serializeUser(user) });
});

export const logout = asyncHandler(async (_req: Request, res: Response) => {
  res.clearCookie(env.COOKIE_NAME, cookieOptions());
  res.status(200).json({ ok: true });
});

export const me = asyncHandler(async (req: Request, res: Response) => {
  const user = await getUserById(req.userId!);
  res.status(200).json({ user });
});

export const forgotPassword = asyncHandler(async (req: Request, res: Response) => {
  const input = forgotPasswordSchema.parse(req.body);
  const token = await createPasswordResetToken(input);

  if (token) {
    const resetUrl = `${env.CLIENT_URL}/reset-password?token=${token}`;
    await sendPasswordResetEmail(input.email, resetUrl);
  }

  // Always respond the same way, whether or not the email is registered,
  // so this endpoint can't be used to discover which emails have accounts.
  res.status(200).json({
    message: "If an account exists for that email, a reset link has been sent.",
  });
});

export const resetPasswordHandler = asyncHandler(async (req: Request, res: Response) => {
  const input = resetPasswordSchema.parse(req.body);
  await resetPassword(input);
  res.status(200).json({ message: "Your password has been reset. You can now log in." });
});
