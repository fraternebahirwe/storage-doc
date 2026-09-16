import type { RequestHandler } from "express";

/**
 * A storage driver owns where uploaded bytes physically live. Swap the
 * `local` driver for an `s3` one (AWS S3 / Supabase Storage / Cloudinary...)
 * without touching any route, controller, or the database schema — files
 * are always addressed by `storageKey`, never a filesystem path directly.
 */
export interface StorageDriver {
  /** Express middleware (mounted after `requireAuth`) that parses a
   *  single-file multipart upload under field name "file" and writes it
   *  into this driver's storage for `req.userId`, populating `req.file`. */
  uploadMiddleware: RequestHandler;

  /** Streams a stored file back as an HTTP response. */
  streamToResponse(userId: string, storageKey: string, res: import("express").Response): Promise<void>;

  deleteFile(userId: string, storageKey: string): Promise<void>;
}
