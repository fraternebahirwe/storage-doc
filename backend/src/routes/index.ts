import { Router } from "express";
import authRoutes from "./auth.routes.js";

const router = Router();

router.use("/auth", authRoutes);

// Mounted in later phases: /files, /folders, /search, /share, /users

export default router;
