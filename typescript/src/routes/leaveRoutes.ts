import { Router } from "express";
import { requireAuth, requireRole } from "../middleware/authMiddleware";
import {
  submitApplication,
  myApplications,
  getStatus,
  pendingForApprover,
  decide,
  teamHistory,
  calendarLeaves,
} from "../controllers/leaveApplicationController";
import {
  myBalances,
  listLeaveTypes,
} from "../controllers/leaveBalanceController";

const router = Router();

// every route below requires a logged-in employee
router.use(requireAuth);

// reference data for the form
router.get("/leave-types", listLeaveTypes);
router.get("/leave-balances/me", myBalances);

// applicant-facing
router.post("/leave-applications", submitApplication);
router.get("/leave-applications/me", myApplications);

// approver-facing — declared before the ':id' route so 'pending' isn't read as an id
router.get(
  "/leave-applications/team-history",
  requireRole("manager", "owner"),
  teamHistory,
);
router.get(
  "/leave-applications/pending",
  requireRole("manager", "owner"),
  pendingForApprover,
);

router.get(
  "/leave-applications/calendar",
  requireRole("manager", "owner"),
  calendarLeaves,
)


router.patch("/leave-applications/:id/decision", decide);

// shared — applicant or approver can poll status
router.get("/leave-applications/:id/status", getStatus);

export default router;
