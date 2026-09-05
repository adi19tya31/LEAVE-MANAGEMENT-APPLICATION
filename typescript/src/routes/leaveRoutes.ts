import { Router } from "express";
import { requireAuth } from "../middleware/authMiddleware";
import {
  submitApplication,
  myApplications,
  getStatus,
  pendingForApprover,
  decide,
} from "../controllers/leaveApplicationController";
import { myBalances, listLeaveTypes } from "../controllers/leaveBalanceController";

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
router.get("/leave-applications/pending", pendingForApprover);
router.patch("/leave-applications/:id/decision", decide);

// shared — applicant or approver can poll status
router.get("/leave-applications/:id/status", getStatus);

export default router;
