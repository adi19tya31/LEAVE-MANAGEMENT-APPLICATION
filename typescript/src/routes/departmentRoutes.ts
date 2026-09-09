import { Router } from "express";
import { requireAuth, requireRole } from "../middleware/authMiddleware";
import {
  listDepartments,
  createDepartment,
  renameDepartment,
  setDepartmentManager,
  deactivateDepartment,
  reactivateDepartment,
  deleteDepartment,
} from "../controllers/departmentController";

const router = Router();

router.use(requireAuth); // every department route requires a logged-in employee

router.get("/departments", requireRole("owner", "manager"), listDepartments);

router.post("/departments", requireRole("owner", "manager"), createDepartment);

  
router.patch("/departments/:id", requireRole("owner", "manager"), renameDepartment);


router.patch("/departments/:id/manager", requireRole("owner"), setDepartmentManager);


router.patch("/departments/:id/deactivate", requireRole("owner", "manager"), deactivateDepartment);
router.patch("/departments/:id/reactivate", requireRole("owner", "manager"), reactivateDepartment);
router.delete("/departments/:id", requireRole("owner"), deleteDepartment);

export default router;