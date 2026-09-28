import { Router } from "express";

import {
  login,
  forgotPassword,
  verifyResetOtp,
  resetPassword,
} from "../controllers/authController";
import { requireAuth } from "../middleware/authMiddleware";

const router = Router();

router.get(
  "/me",
  requireAuth,
  (req, res) => {
    res.json({
      user: req.user,
    });
  }
);

// PUBLIC ROUTES
router.post("/login", login);
router.post("/forgot-password", forgotPassword);

router.post("/verify-reset-otp", verifyResetOtp);

router.post("/reset-password", resetPassword);

export default router;