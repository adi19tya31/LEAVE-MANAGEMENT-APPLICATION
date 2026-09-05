import { Router } from "express";
import { register } from "../controllers/employeeController";
import { requireManagerOrBootstrap } from "../middleware/employeeAccess";

const router = Router();

// Open only when no employees exist yet (bootstrapping the first user).
// After that, only an existing manager or CEO can register new employees.
router.post("/employees", requireManagerOrBootstrap, register);

export default router;
