import { Router } from "express";
import { requireAuth } from "../middleware/auth.middleware.js";
import { storage } from "../services/storage/index.js";
import { download, favorite, list, move, recent, remove, rename, upload } from "../controllers/file.controller.js";

const router = Router();

router.use(requireAuth);

router.get("/", list);
router.post("/", storage.uploadMiddleware, upload);
router.get("/recent", recent);
router.get("/:id", download);
router.patch("/:id", rename);
router.patch("/:id/move", move);
router.patch("/:id/favorite", favorite);
router.delete("/:id", remove);

export default router;
