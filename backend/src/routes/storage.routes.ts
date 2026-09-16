import { Router } from "express";
import { requireAuth } from "../middleware/auth.middleware.js";
import { storageSummary } from "../controllers/file.controller.js";

const router = Router();

router.get("/summary", requireAuth, storageSummary);

export default router;
