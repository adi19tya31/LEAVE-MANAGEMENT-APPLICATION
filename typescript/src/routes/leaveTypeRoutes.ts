import { Router } from "express";
import * as leaveTypeController from "../controllers/leaveTypeController";
import { requireAuth,requireRole } from "../middleware/authMiddleware";

const router = Router();

router.get("/leave-types/name", leaveTypeController.getLeaveTypeByName);

router.get("/leave-types", leaveTypeController.getAllLeaveTypes);
router.get("/leave-types/:id", leaveTypeController.getLeaveTypeById);


router.post("/leave-types", requireAuth, requireRole("owner","manager"), leaveTypeController.createLeaveType);
router.put("/leave-types/:id",requireAuth,requireRole("owner","manager"), leaveTypeController.updateLeaveType);
router.delete("/leave-types/:id", requireAuth,requireRole("owner","manager"),leaveTypeController.deleteLeaveType);

// Only needed if you don't already have a global error-handling middleware
// in app.ts/server.ts that reads err.statusCode.
router.use(leaveTypeController.handleLeaveTypeError);

export default router;