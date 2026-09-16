import { Router } from "express";
import authRoutes from "./auth.routes.js";
import fileRoutes from "./file.routes.js";
import storageRoutes from "./storage.routes.js";

const router = Router();

router.use("/auth", authRoutes);
router.use("/files", fileRoutes);
router.use("/storage", storageRoutes);

// Mounted in later phases: /folders, /search, /share

export default router;
