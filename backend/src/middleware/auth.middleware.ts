import type { NextFunction, Request, Response } from "express";
import { env } from "../config/env.js";
import { verifyToken } from "../utils/jwt.js";
import { ApiError } from "../utils/ApiError.js";

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      userId?: string;
    }
  }
}

/** Requires a valid session; attaches `req.userId`. Rejects with 401 otherwise. */
export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const token = req.cookies?.[env.COOKIE_NAME];

  if (!token) {
    next(ApiError.unauthorized());
    return;
  }

  try {
    const payload = verifyToken(token);
    req.userId = payload.userId;
    next();
  } catch {
    next(ApiError.unauthorized("Your session has expired. Please log in again.", "SESSION_EXPIRED"));
  }
}
