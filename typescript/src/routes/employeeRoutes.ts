import { Router } from "express";

import { register } from "../controllers/employeeController";

import { changePassword } from "../controllers/changePasswordController";

import { requireAuth } from "../middleware/authMiddleware";

import { requireManagerOrBootstrap } from "../middleware/employeeAccess";

const router = Router();


// Register Employee

router.post(
  "/employees",
  requireManagerOrBootstrap,
  register,
);


// Change Password

router.patch(
  "/employees/change-password",
  requireAuth,
  changePassword,
);


export default router;