import { Router } from "express";

import { getAllEmployees, register } from "../controllers/employeeController";

import { changePassword } from "../controllers/changePasswordController";

import { requireAuth, requireRole } from "../middleware/authMiddleware";

import { requireManagerOrBootstrap } from "../middleware/employeeAccess";

const router = Router();

// View all employees

router.get(
  "/employees",
  requireAuth,
  requireRole("manager", "owner"),
  getAllEmployees,
);

// Register Employee

router.post("/employees", requireManagerOrBootstrap, register);

// Change Password

router.patch("/employees/change-password", requireAuth, changePassword);

export default router;
