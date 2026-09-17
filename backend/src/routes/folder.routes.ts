import { Router } from "express";
import { requireAuth } from "../middleware/auth.middleware.js";
import { create, list, listAll, move, remove, rename } from "../controllers/folder.controller.js";

const router = Router();

router.use(requireAuth);

router.get("/", list);
router.get("/all", listAll);
router.post("/", create);
router.patch("/:id", rename);
router.patch("/:id/move", move);
router.delete("/:id", remove);

export default router;
