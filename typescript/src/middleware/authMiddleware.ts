import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { AuthPayload } from "../types";

export function requireAuth(req: Request, res: Response, next: NextFunction): void {
  const header = req.headers.authorization;
  if (!header || !header.startsWith("Bearer ")) {
    res.status(401).json({ error: "Missing or malformed Authorization header." });
    return;
  }

  const token = header.split(" ")[1];
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET as string) as AuthPayload;
    req.user = payload;
    next();
  } catch (err) {
    res.status(401).json({ error: "Invalid or expired token." });
  }
}

// Gate a route to specific roles — always run AFTER requireAuth, since it
// reads req.user which requireAuth sets. Usage: requireAuth, requireRole("manager", "ceo")
export function requireRole(...allowedRoles: string[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const role = req.user?.role;
    if (!role || !allowedRoles.includes(role)) {
      res.status(403).json({
        error: `This action requires one of these roles: ${allowedRoles.join(", ")}.`,
      });
      return;
    }
    next();
  };
}