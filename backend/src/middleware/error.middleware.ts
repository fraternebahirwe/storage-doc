import type { NextFunction, Request, Response } from "express";
import { ZodError } from "zod";
import { ApiError } from "../utils/ApiError.js";
import { isProduction } from "../config/env.js";

export function notFoundMiddleware(req: Request, res: Response) {
  res.status(404).json({
    error: { code: "NOT_FOUND", message: "That page or resource doesn't exist." },
  });
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function errorMiddleware(err: unknown, req: Request, res: Response, next: NextFunction) {
  if (err instanceof ZodError) {
    res.status(400).json({
      error: {
        code: "VALIDATION_ERROR",
        message: "Some of the information you submitted isn't valid.",
        fields: err.flatten().fieldErrors,
      },
    });
    return;
  }

  if (err instanceof ApiError) {
    res.status(err.statusCode).json({
      error: { code: err.code, message: err.message },
    });
    return;
  }

  console.error(err);
  res.status(500).json({
    error: {
      code: "INTERNAL_ERROR",
      message: "Something went wrong on our end. Please try again in a moment.",
      ...(isProduction ? {} : { detail: err instanceof Error ? err.message : String(err) }),
    },
  });
}
