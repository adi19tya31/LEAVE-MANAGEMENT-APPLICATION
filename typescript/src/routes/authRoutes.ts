import { Router } from "express";

import {
  login,
  forgotPassword,
  verifyResetOtp,
  resetPassword,
} from "../controllers/authController";

const router = Router();

// PUBLIC ROUTES
router.post("/login", login);
router.post("/forgot-password", forgotPassword);

router.post("/verify-reset-otp", verifyResetOtp);

router.post("/reset-password", resetPassword);

export default router;