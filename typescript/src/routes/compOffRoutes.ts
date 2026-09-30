import { Router } from "express";
import { requireAuth, requireRole } from "../middleware/authMiddleware";
import {
  applyCompOff,
  myCompOffHistory,
  cancelCompOffRequest,
  pendingCompOffs,
  compOffTeamHistory,
  decideCompOff,
  markCompOffAsWorked,
  myCompOffBalance
} from "../controllers/compOffController";

const router = Router();
router.use(requireAuth);

router.post("/comp-offs", applyCompOff);
router.get("/comp-offs/me", myCompOffHistory);
router.patch("/comp-offs/:id/cancel", cancelCompOffRequest);
router.get("/comp-offs/pending", requireRole("manager", "owner"), pendingCompOffs);
router.get("/comp-offs/team-history", requireRole("manager", "owner"), compOffTeamHistory);
router.patch("/comp-offs/:id/decision", requireRole("manager", "owner"), decideCompOff);
router.patch("/comp-offs/:id/worked", markCompOffAsWorked);
router.get("/compoff-balances/me", myCompOffBalance);



export default router;
