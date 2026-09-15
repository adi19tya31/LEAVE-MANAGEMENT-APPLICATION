import leaveTypeModel from "../models/leaveTypeModel";
import { LeaveType } from "../types";

// Lightweight error class carrying an HTTP status code, so the controller
// can translate it directly into a response (or your global error handler
// can, if you already have one that reads err.statusCode).
export class AppError extends Error {
  statusCode: number;
  constructor(message: string, statusCode = 500) {
    super(message);
    this.statusCode = statusCode;
    this.name = "AppError";
  }
}

export async function getAllLeaveTypes(): Promise<LeaveType[]> {
  return leaveTypeModel.findAll();
}

export async function getLeaveTypeById(id: number): Promise<LeaveType> {
  const leaveType = await leaveTypeModel.findById(id);
  if (!leaveType) {
    throw new AppError("Leave type not found.", 404);
  }
  return leaveType;
}

export async function getLeaveTypeByName(name: string): Promise<LeaveType> {
  const trimmed = name.trim();
  if (!trimmed) {
    throw new AppError("name is required.", 400);
  }

  const leaveType = await leaveTypeModel.findByName(trimmed);
  if (!leaveType) {
    throw new AppError("Leave type not found.", 404);
  }
  return leaveType;
}

export async function createLeaveType(input: {
  name: string;
  maxDaysPerYear: number;
}): Promise<LeaveType> {
  const name = input.name?.trim();
  if (!name) {
    throw new AppError("name is required.", 400);
  }
  if (
    typeof input.maxDaysPerYear !== "number" ||
    Number.isNaN(input.maxDaysPerYear) ||
    input.maxDaysPerYear < 0
  ) {
    throw new AppError("maxDaysPerYear must be a non-negative number.", 400);
  }

  const existing = await leaveTypeModel.findByName(name);
  if (existing) {
    throw new AppError("A leave type with this name already exists.", 409);
  }

  const created = await leaveTypeModel.create({
    name,
    maxDaysPerYear: input.maxDaysPerYear,
  });
  if (!created) {
    throw new AppError("Failed to create leave type.", 500);
  }
  return created;
}

export async function updateLeaveType(
  id: number,
  input: { name?: string; maxDaysPerYear?: number }
): Promise<LeaveType> {
  const existing = await leaveTypeModel.findById(id);
  if (!existing) {
    throw new AppError("Leave type not found.", 404);
  }

  let name: string | undefined;
  if (input.name !== undefined) {
    name = input.name.trim();
    if (!name) {
      throw new AppError("name cannot be empty.", 400);
    }
    const nameOwner = await leaveTypeModel.findByName(name);
    if (nameOwner && nameOwner.id !== id) {
      throw new AppError("A leave type with this name already exists.", 409);
    }
  }

  if (
    input.maxDaysPerYear !== undefined &&
    (typeof input.maxDaysPerYear !== "number" ||
      Number.isNaN(input.maxDaysPerYear) ||
      input.maxDaysPerYear < 0)
  ) {
    throw new AppError("maxDaysPerYear must be a non-negative number.", 400);
  }

  const updated = await leaveTypeModel.update(id, {
    name,
    maxDaysPerYear: input.maxDaysPerYear,
  });
  if (!updated) {
    throw new AppError("Failed to update leave type.", 500);
  }
  return updated;
}

export async function deleteLeaveType(id: number): Promise<void> {
  const existing = await leaveTypeModel.findById(id);
  if (!existing) {
    throw new AppError("Leave type not found.", 404);
  }

  try {
    await leaveTypeModel.remove(id);
  } catch (err) {
    // Thrown by MySQL when leave_type_id is a foreign key still referenced
    // by rows in leave_applications.
    if ((err as { code?: string }).code === "ER_ROW_IS_REFERENCED_2") {
      throw new AppError(
        "This leave type is used by existing leave applications and can't be deleted.",
        409
      );
    }
    throw err;
  }
}