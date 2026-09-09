import { Router } from "express";
import { requireAuth, requireRole } from "../middleware/authMiddleware";
import {
  listPublicHolidays,
  createPublicHoliday,
  deletePublicHoliday,
} from "../controllers/publicHolidayController";

const router = Router();

router.use(requireAuth);
router.get("/public-holidays", listPublicHolidays);
router.post(
  "/public-holidays",
  requireRole("owner", "manager", "ceo"),
  createPublicHoliday,
);
router.delete(
  "/public-holidays/:id",
  requireRole("owner", "manager", "ceo"),
  deletePublicHoliday,
);

// Keep the shorter resource name available for clients using /api/holidays.
router.get("/holidays", listPublicHolidays);
router.post(
  "/holidays",
  requireRole("owner", "manager", "ceo"),
  createPublicHoliday,
);
router.delete(
  "/holidays/:id",
  requireRole("owner", "manager", "ceo"),
  deletePublicHoliday,
);

export default router;
