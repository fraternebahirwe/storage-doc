import { Router } from "express";
import authRoutes from "./auth.routes.js";
import fileRoutes from "./file.routes.js";
import folderRoutes from "./folder.routes.js";
import storageRoutes from "./storage.routes.js";
import searchRoutes from "./search.routes.js";

const router = Router();

router.use("/auth", authRoutes);
router.use("/files", fileRoutes);
router.use("/folders", folderRoutes);
router.use("/storage", storageRoutes);
router.use("/search", searchRoutes);

// Mounted in a later phase: /share

export default router;
