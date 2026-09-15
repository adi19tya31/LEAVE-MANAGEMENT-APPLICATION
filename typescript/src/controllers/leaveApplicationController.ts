import { Request, Response, NextFunction } from "express";
import * as leaveService from "../services/leaveService";
import leaveApplicationModel from "../models/leaveApplicationModel";
import leaveTypeModel from "../models/leaveTypeModel";
interface SubmitApplicationBody {
  leaveTypeId: number;

  startDate: string;

  endDate: string;

  startDayType: "FULL_DAY" | "FIRST_HALF" | "SECOND_HALF";

  endDayType: "FULL_DAY" | "FIRST_HALF" | "SECOND_HALF";

  reason: string;
}

// POST /api/leave-applications — employee submits the form
export async function submitApplication(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const {
      leaveTypeId,
      startDate,
      endDate,
      startDayType,
      endDayType,
      reason,
    } = req.body as SubmitApplicationBody;
    const employeeId = req.user!.id; // taken from the JWT, never trusted from the body

    const { application, remainingLeaves } = await leaveService.applyForLeave({
      employeeId,

      leaveTypeId,

      startDate,

      endDate,

      startDayType,

      endDayType,

      reason,
    });

    // This is the shape the React form's "result" panel expects
    res.status(201).json({
      status: application.status, // 'pending'
      applicationId: application.id,
      leaveTypeId: application.leave_type_id,
      appliedDays: application.total_days,
      remainingLeaves,
      submittedOn: application.applied_on,
      approverId: application.approver_id,
    });
  } catch (err) {
    next(err);
  }
}

// GET /api/leave-applications/me — employee's own application history
export async function myApplications(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const rows = await leaveApplicationModel.findByEmployee(req.user!.id);
    res.json(rows);
  } catch (err) {
    next(err);
  }
}

// GET /api/leave-applications/:id/status — poll status + remaining balance
export async function getStatus(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const result = await leaveService.getApplicationStatus(
      Number(req.params.id),
      req.user!.id,
    );
    res.json({
      status: result.application.status,
      applicationId: result.application.id,
      remainingLeaves: result.remainingLeaves,
    });
  } catch (err) {
    next(err);
  }
}

// GET /api/leave-applications/team-history — manager/owner history
export async function teamHistory(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const rows =
      req.user!.role === "owner"
        ? await leaveApplicationModel.findAllHistory()
        : await leaveApplicationModel.findTeamHistory(req.user!.id);
    res.json(rows);
  } catch (err) {
    next(err);
  }
}

// GET /api/leave-applications/pending — approver's queue
export async function pendingForApprover(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const rows = await leaveService.getPendingApprovals(req.user!.id);
    res.json(rows);
  } catch (err) {
    next(err);
  }
}

// GET /api/leave-applications/calendar
export async function calendarLeaves(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const rows =
      req.user!.role === "owner"
        ? await leaveApplicationModel.findForCalendar()
        : await leaveApplicationModel.findForCalendar(req.user!.id);

    res.json(rows);
  } catch (err) {
    next(err);
  }
}

// PATCH /api/leave-applications/:id/decision — approver approves/rejects
export async function decide(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const { action, remarks } = req.body as {
      action: "approved" | "rejected";
      remarks?: string;
    };
    const updated = await leaveService.decideApplication({
      applicationId: Number(req.params.id),
      approverId: req.user!.id,
      action,
      remarks,
    });
    res.json(updated);
  } catch (err) {
    next(err);
  }
}
