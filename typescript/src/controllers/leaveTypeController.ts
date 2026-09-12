import { Request, Response, NextFunction } from "express";
import * as leaveTypeService from "../services/leaveTypeServices";
import { AppError } from "../services/leaveTypeServices";

interface LeaveTypeBody {
  name: string;
  maxDaysPerYear: number;
}

// GET /api/leave-types
export async function getAllLeaveTypes(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const rows = await leaveTypeService.getAllLeaveTypes();
    res.json(rows);
  } catch (err) {
    next(err);
  }
}

// GET /api/leave-types/search?name=...
// NOTE: register this route before "/:id" so "search" isn't parsed as an id.
export async function getLeaveTypeByName(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const name = typeof req.query.name === "string" ? req.query.name : "";
    const leaveType = await leaveTypeService.getLeaveTypeByName(name);
    res.json(leaveType);
  } catch (err) {
    next(err);
  }
}

// GET /api/leave-types/:id
export async function getLeaveTypeById(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const id = Number(req.params.id);
    if (Number.isNaN(id)) {
      res.status(400).json({ message: "id must be a number." });
      return;
    }

    const leaveType = await leaveTypeService.getLeaveTypeById(id);
    res.json(leaveType);
  } catch (err) {
    next(err);
  }
}

// POST /api/leave-types
export async function createLeaveType(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const body = req.body as LeaveTypeBody;
    const created = await leaveTypeService.createLeaveType(body);
    res.status(201).json(created);
  } catch (err) {
    next(err);
  }
}

// PUT /api/leave-types/:id
export async function updateLeaveType(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const id = Number(req.params.id);
    if (Number.isNaN(id)) {
      res.status(400).json({ message: "id must be a number." });
      return;
    }

    const body = req.body as Partial<LeaveTypeBody>;
    const updated = await leaveTypeService.updateLeaveType(id, body);
    res.json(updated);
  } catch (err) {
    next(err);
  }
}

// DELETE /api/leave-types/:id
export async function deleteLeaveType(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const id = Number(req.params.id);
    if (Number.isNaN(id)) {
      res.status(400).json({ message: "id must be a number." });
      return;
    }

    await leaveTypeService.deleteLeaveType(id);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}

// Fallback error handler for this router, in case you don't already have a
// global one that reads err.statusCode. Wire it up in your route file with
// router.use(handleLeaveTypeError) after all routes, or skip this if your
// app already has a shared error-handling middleware.
export function handleLeaveTypeError(
  err: unknown,
  req: Request,
  res: Response,
  next: NextFunction
): void {
  if (err instanceof AppError) {
    res.status(err.statusCode).json({ message: err.message });
    return;
  }
  next(err);
}