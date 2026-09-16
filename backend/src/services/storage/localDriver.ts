import { createReadStream } from "fs";
import { mkdir, stat, unlink } from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";
import type { Response } from "express";
import multer from "multer";
import { env } from "../../config/env.js";
import { extensionOf, isAllowedExtension } from "../../config/fileTypes.js";
import { ApiError } from "../../utils/ApiError.js";
import type { StorageDriver } from "./types.js";

const UPLOAD_ROOT = path.resolve(process.cwd(), env.STORAGE_LOCAL_DIR);

function userDir(userId: string) {
  return path.join(UPLOAD_ROOT, userId);
}

function filePathFor(userId: string, storageKey: string) {
  return path.join(userDir(userId), storageKey);
}

const multerUpload = multer({
  storage: multer.diskStorage({
    destination: (req, _file, callback) => {
      const userId = req.userId;
      if (!userId) {
        callback(new Error("Upload attempted without an authenticated user."), "");
        return;
      }
      const dir = userDir(userId);
      mkdir(dir, { recursive: true })
        .then(() => callback(null, dir))
        .catch((err) => callback(err, dir));
    },
    filename: (_req, file, callback) => {
      const ext = extensionOf(file.originalname);
      callback(null, `${randomUUID()}${ext ? `.${ext}` : ""}`);
    },
  }),
  limits: { fileSize: env.MAX_FILE_SIZE_BYTES },
  fileFilter: (_req, file, callback) => {
    const ext = extensionOf(file.originalname);
    if (!isAllowedExtension(ext)) {
      callback(ApiError.badRequest(`"${ext || "that"}" files aren't supported.`, "UNSUPPORTED_FILE_TYPE"));
      return;
    }
    callback(null, true);
  },
}).single("file");

export const localStorageDriver: StorageDriver = {
  uploadMiddleware: multerUpload,

  async streamToResponse(userId, storageKey, res: Response) {
    const filePath = filePathFor(userId, storageKey);
    const stats = await stat(filePath).catch(() => null);
    if (!stats) {
      throw ApiError.notFound("This file is missing from storage.", "FILE_MISSING");
    }
    res.setHeader("Content-Length", String(stats.size));
    await new Promise<void>((resolve, reject) => {
      const stream = createReadStream(filePath);
      stream.on("error", reject);
      stream.on("close", resolve);
      stream.pipe(res);
    });
  },

  async deleteFile(userId, storageKey) {
    try {
      await unlink(filePathFor(userId, storageKey));
    } catch (err) {
      if ((err as NodeJS.ErrnoException).code !== "ENOENT") throw err;
    }
  },
};
