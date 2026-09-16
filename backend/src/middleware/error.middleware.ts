import type { NextFunction, Request, Response } from "express";
import { ZodError } from "zod";
import { MulterError } from "multer";
import { ApiError } from "../utils/ApiError.js";
import { env, isProduction } from "../config/env.js";

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

  if (err instanceof MulterError) {
    const tooLarge = err.code === "LIMIT_FILE_SIZE";
    res.status(tooLarge ? 413 : 400).json({
      error: {
        code: tooLarge ? "FILE_TOO_LARGE" : "UPLOAD_ERROR",
        message: tooLarge
          ? `That file is larger than the ${Math.round(env.MAX_FILE_SIZE_BYTES / (1024 * 1024))} MB limit.`
          : "That upload couldn't be processed.",
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
