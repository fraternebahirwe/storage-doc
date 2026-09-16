import { env } from "../../config/env.js";
import { localStorageDriver } from "./localDriver.js";
import type { StorageDriver } from "./types.js";

function resolveDriver(): StorageDriver {
  switch (env.STORAGE_DRIVER) {
    case "local":
      return localStorageDriver;
    case "s3":
      throw new Error(
        "STORAGE_DRIVER=s3 is not implemented yet. Set STORAGE_DRIVER=local, or add an S3-compatible " +
          "driver in backend/src/services/storage/ (implementing StorageDriver) before switching to it.",
      );
  }
}

export const storage = resolveDriver();
export type { StorageDriver } from "./types.js";
