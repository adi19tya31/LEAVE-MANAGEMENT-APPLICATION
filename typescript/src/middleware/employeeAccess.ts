import { Request, Response, NextFunction } from "express";
import employeeModel from "../models/employeeModel";
import { requireAuth, requireRole } from "./authMiddleware";

// Registration needs to be open exactly once — when there are zero employees,
// so the very first one (typically the CEO) can be created without a token
// that can't possibly exist yet. Every registration after that must come
// from an already-logged-in manager or CEO.
export async function requireManagerOrBootstrap(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const existing = await employeeModel.findAll();
    if (existing.length === 0) {
      next(); // bootstrap case — table is empty, allow this one through unauthenticated
      return;
    }
  } catch (err) {
    next(err);
    return;
  }

  // Not the bootstrap case — enforce real auth + role manually,
  // since we're past the point routes normally chain these as separate middleware.
  requireAuth(req, res, () => {
    requireRole("manager", "owner")(req, res, next);
  });
}
