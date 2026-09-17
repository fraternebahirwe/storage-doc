import { Router } from "express";
import { requireAuth } from "../middleware/auth.middleware.js";
import { runSearch } from "../controllers/search.controller.js";

const router = Router();

router.get("/", requireAuth, runSearch);

export default router;
