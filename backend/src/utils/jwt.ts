import jwt from "jsonwebtoken";
import { env } from "../config/env.js";

export type JwtPayload = { userId: string };

export function signToken(payload: JwtPayload, expiresIn: string = env.JWT_EXPIRES_IN): string {
  return jwt.sign(payload, env.AUTH_SECRET, { expiresIn } as jwt.SignOptions);
}

export function verifyToken(token: string): JwtPayload {
  return jwt.verify(token, env.AUTH_SECRET) as JwtPayload;
}
