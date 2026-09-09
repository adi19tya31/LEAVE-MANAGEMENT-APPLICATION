import { Router } from "express";
import { requireAuth, requireRole } from "../middleware/authMiddleware";
import {
  applyCompOff,
  myCompOffHistory,
  pendingCompOffs,
  compOffTeamHistory,
  decideCompOff,
} from "../controllers/compOffController";

const router = Router();
router.use(requireAuth);

router.post("/comp-offs", applyCompOff);
router.get("/comp-offs/me", myCompOffHistory);
router.get("/comp-offs/pending", requireRole("manager", "owner"), pendingCompOffs);
router.get("/comp-offs/team-history", requireRole("manager", "owner"), compOffTeamHistory);
router.patch("/comp-offs/:id/decision", requireRole("manager", "owner"), decideCompOff);

export default router;
