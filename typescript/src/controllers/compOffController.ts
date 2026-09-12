import { Request, Response, NextFunction } from "express";
import compOffModel from "../models/compOffModel";
import employeeModel from "../models/employeeModel";
import pool from "../config/db";
import { sendNotification } from "../services/notificationServices";

function validDate(value: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(new Date(`${value}T00:00:00Z`).getTime());
}

export async function applyCompOff(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { workDate, reason } = req.body as { workDate?: string; reason?: string };
    if (!workDate || !reason?.trim()) {
      res.status(400).json({ error: "workDate and reason are required." });
      return;
    }
    if (!validDate(workDate)) {
      res.status(400).json({ error: "workDate must be a valid date in YYYY-MM-DD format." });
      return;
    }

    const employee = await employeeModel.findById(req.user!.id);
    if (!employee) {
      res.status(404).json({ error: "Employee not found." });
      return;
    }
    if (!employee.reporting_to) {
      res.status(422).json({ error: "No manager found for this employee." });
      return;
    }

    const created = await compOffModel.create({
      employeeId: req.user!.id,
      workDate,
      reason: reason.trim(),
      approverId: employee.reporting_to,
    });

    const recipientIds = new Set([
      employee.reporting_to,
      ...(await employeeModel.findOwnerIds()),
    ]);

    await Promise.all(
      [...recipientIds].map((recipientId) =>
        sendNotification(
          recipientId,
          "New Comp-Off Request",
          `${employee.name} has submitted a comp-off request for ${workDate}.`,
          "COMPOFF_APPLIED",
          created?.id,
        ),
      ),
    );

    res.status(201).json(created);
  } catch (err) {
    next(err);
  }
}

export async function myCompOffHistory(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    res.json(await compOffModel.findByEmployee(req.user!.id));
  } catch (err) {
    next(err);
  }
}

export async function pendingCompOffs(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    res.json(await compOffModel.findPendingForApprover(req.user!.id));
  } catch (err) {
    next(err);
  }
}

export async function compOffTeamHistory(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const role = req.user!.role;
    if (role === "owner") {
      res.json(await compOffModel.findAllHistory());
      return;
    }
    res.json(await compOffModel.findTeamHistory(req.user!.id));
  } catch (err) {
    next(err);
  }
}

export async function decideCompOff(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { action, remarks } = req.body as { action?: "approved" | "rejected"; remarks?: string };
    if (action !== "approved" && action !== "rejected") {
      res.status(400).json({ error: "action must be 'approved' or 'rejected'." });
      return;
    }
    const existing = await compOffModel.findById(Number(req.params.id));
    if (!existing) {
      res.status(404).json({ error: "Comp-Off request not found." });
      return;
    }
    if (existing.approver_id !== req.user!.id) {
      res.status(403).json({ error: "You are not the assigned approver for this request." });
      return;
    }
    if (existing.status !== "pending") {
      res.status(409).json({ error: `This request is already ${existing.status}.` });
      return;
    }

    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();
      await compOffModel.updateDecision(
        existing.id,
        req.user!.id,
        action,
        remarks?.trim() || null,
        connection,
      );
      await connection.commit();

      const approver = await employeeModel.findById(req.user!.id);
      const notificationTitle =
        action === "approved"
          ? "Comp-Off Request Approved"
          : "Comp-Off Request Rejected";
      const notificationMessage =
        action === "approved"
          ? `Your comp-off request has been approved by ${approver?.name || "your manager"}.`
          : `Your comp-off request has been rejected by ${approver?.name || "your manager"}.`;

      await sendNotification(
        existing.employee_id,
        notificationTitle,
        notificationMessage,
        action === "approved" ? "COMPOFF_APPROVED" : "COMPOFF_REJECTED",
        existing.id,
      );

      res.json(await compOffModel.findById(existing.id));
    } catch (err) {
      await connection.rollback();
      throw err;
    } finally {
      connection.release();
    }
  } catch (err) {
    next(err);
  }
}
