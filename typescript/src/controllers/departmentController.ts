import { Request, Response, NextFunction } from "express";
import departmentModel from "../models/departmentModel";
import employeeModel from "../models/employeeModel";

// GET /api/departments — Owner ✅  Manager ✅  Employee ❌
export async function listDepartments(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const departments = await departmentModel.findAll();
    res.json(departments);
  } catch (err) {
    next(err);
  }
}

// POST /api/departments — Owner ✅  Manager ✅  Employee ❌
export async function createDepartment(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const { name } = req.body as { name?: string };
    if (!name || !name.trim()) {
      res.status(400).json({ error: "name is required." });
      return;
    }

    const existing = await departmentModel.findByName(name);
    if (existing) {
      res.status(409).json({ error: `Department '${name}' already exists.` });
      return;
    }

    const department = await departmentModel.create(name.trim());
    res.status(201).json(department);
  } catch (err) {
    next(err);
  }
}

// PATCH /api/departments/:id — rename — Owner ✅  Manager ✅  Employee ❌
export async function renameDepartment(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const id = Number(req.params.id);
    const { name } = req.body as { name?: string };
    if (!name || !name.trim()) {
      res.status(400).json({ error: "name is required." });
      return;
    }

    const department = await departmentModel.findById(id);
    if (!department) {
      res.status(404).json({ error: "Department not found." });
      return;
    }

    const updated = await departmentModel.updateName(id, name.trim());
    res.json(updated);
  } catch (err) {
    next(err);
  }
}

// PATCH /api/departments/:id/manager — assign or change manager — Owner ✅ ONLY
export async function setDepartmentManager(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const id = Number(req.params.id);
    const { managerId } = req.body as { managerId?: number };
    if (!managerId) {
      res.status(400).json({ error: "managerId is required." });
      return;
    }

    const department = await departmentModel.findById(id);
    if (!department) {
      res.status(404).json({ error: "Department not found." });
      return;
    }

    const manager = await employeeModel.findById(managerId);
    if (!manager) {
      res
        .status(400)
        .json({ error: `No employee found with Emp_id = ${managerId}.` });
      return;
    }

    const updated = await departmentModel.setManager(id, managerId);
    res.json(updated);
  } catch (err) {
    next(err);
  }
}

// PATCH /api/departments/:id/deactivate — Owner ✅  Manager ⚠️ (reversible only)
// PATCH /api/departments/:id/reactivate — same access level, undoes it
export async function deactivateDepartment(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const id = Number(req.params.id);
    const department = await departmentModel.findById(id);
    if (!department) {
      res.status(404).json({ error: "Department not found." });
      return;
    }
    const updated = await departmentModel.deactivate(id);
    res.json(updated);
  } catch (err) {
    next(err);
  }
}

export async function reactivateDepartment(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const id = Number(req.params.id);
    const department = await departmentModel.findById(id);
    if (!department) {
      res.status(404).json({ error: "Department not found." });
      return;
    }
    const updated = await departmentModel.reactivate(id);
    res.json(updated);
  } catch (err) {
    next(err);
  }
}

// DELETE /api/departments/:id — permanent — Owner ✅ ONLY, Manager ❌
export async function deleteDepartment(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const id = Number(req.params.id);
    const department = await departmentModel.findById(id);
    if (!department) {
      res.status(404).json({ error: "Department not found." });
      return;
    }
    await departmentModel.remove(id);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}
