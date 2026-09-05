import pool from "../config/db";
import employeeModel from "../models/employeeModel";
import leaveBalanceModel from "../models/leaveBalanceModel";
import leaveApplicationModel from "../models/leaveApplicationModel";
import leaveApprovalLogModel from "../models/leaveApprovalLogModel";
import publicHolidayModel from "../models/publicHolidayModel";
import { countLeaveDays } from "../utils/dateUtils";
import { ApprovalAction, LeaveApplicationWithNames } from "../types";

export class LeaveServiceError extends Error {
  statusCode: number;
  constructor(message: string, statusCode = 400) {
    super(message);
    this.statusCode = statusCode;
  }
}

interface ApplyForLeaveInput {
  employeeId: number;
  leaveTypeId: number;
  startDate: string;
  endDate: string;
  durationType: "FULL_DAY" | "HALF_DAY_FIRST" | "HALF_DAY_SECOND";
  reason: string;
}

interface ApplyForLeaveResult {
  application: LeaveApplicationWithNames;
  remainingLeaves: number;
}

/**
 * Employee submits a leave application.
 * Steps: validate dates -> check balance -> resolve approver from reporting_to -> insert.
 */
export async function applyForLeave(
  input: ApplyForLeaveInput,
): Promise<ApplyForLeaveResult> {
  const { employeeId, leaveTypeId, startDate, endDate, durationType, reason } = input;

  if (!startDate || !endDate || !leaveTypeId) {
    throw new LeaveServiceError(
      "leaveTypeId, startDate and endDate are required.",
    );
  }

  if (new Date(`${endDate}T00:00:00Z`) < new Date(`${startDate}T00:00:00Z`)) {
    throw new LeaveServiceError("End date must be on or after the start date.");
  }

  const holidayRows = await publicHolidayModel.findBetween(
  startDate,
  endDate
);

const holidayDates = holidayRows.map(
  (holiday) => holiday.holiday_date
);

let totalDays: number;

if (
  durationType === "HALF_DAY_FIRST" ||
  durationType === "HALF_DAY_SECOND"
) {
  // Half-day is allowed only for one working date
  if (startDate !== endDate) {
    throw new LeaveServiceError(
      "Half-day leave can only be applied for a single date."
    );
  }

  const date = new Date(`${startDate}T00:00:00Z`);
  const day = date.getUTCDay();

  const isSunday = day === 0;
  const isHoliday = holidayDates.some(
    (holiday) => holiday.slice(0, 10) === startDate
  );

  if (isSunday || isHoliday) {
    throw new LeaveServiceError(
      "Half-day leave cannot be applied on a Sunday or public holiday."
    );
  }

  totalDays = 0.5;
} else {
  totalDays = countLeaveDays(
    startDate,
    endDate,
    holidayDates
  );
};
  if (totalDays <= 0) {
    throw new LeaveServiceError(
      "The selected dates contain only Sundays and public holidays.",
    );
  }

  const year = new Date(startDate).getFullYear();

  // 1. Check balance
  const balance = await leaveBalanceModel.getBalance(
    employeeId,
    leaveTypeId,
    year,
  );
  if (!balance) {
    throw new LeaveServiceError(
      "No leave balance record for this leave type / year.",
    );
  }
  const remaining = balance.allocated_days - balance.used_days;
  if (totalDays > remaining) {
    throw new LeaveServiceError(
      `Only ${remaining} day(s) remaining for this leave type — cannot apply for ${totalDays}.`,
      409,
    );
  }

  // 2. Resolve approver — this is the whole hierarchy rule, one lookup
  const approverId = await employeeModel.getReportingTo(employeeId);
  if (!approverId) {
    throw new LeaveServiceError(
      "No approver found for this employee (they may be the top of the hierarchy).",
      422,
    );
  }

  // 3. Create the application (status defaults to 'pending')
  const application = await leaveApplicationModel.create({
    employeeId,
    leaveTypeId,
    startDate,
    endDate,
    totalDays,
    durationType,
    reason,
    approverId,
  });

  if (!application) {
    throw new LeaveServiceError("Failed to create leave application.", 500);
  }

  return {
    application,
    remainingLeaves: remaining, // balance is NOT deducted yet — only on approval
  };
}

/** Manager/Owner fetches everything waiting on their decision. */
export async function getPendingApprovals(
  approverId: number,
): Promise<LeaveApplicationWithNames[]> {
  return leaveApplicationModel.findPendingForApprover(approverId);
}

interface DecideApplicationInput {
  applicationId: number;
  approverId: number;
  action: ApprovalAction;
  remarks?: string;
}

/**
 * Approver approves or rejects. Runs as a transaction: status update,
 * balance deduction (only if approved), and the audit log all succeed together
 * or all roll back — a half-applied decision must never be possible.
 */
export async function decideApplication(
  input: DecideApplicationInput,
): Promise<LeaveApplicationWithNames | null> {
  const { applicationId, approverId, action, remarks } = input;

  if (!["approved", "rejected"].includes(action)) {
    throw new LeaveServiceError("action must be 'approved' or 'rejected'.");
  }

  const application = await leaveApplicationModel.findById(applicationId);
  if (!application)
    throw new LeaveServiceError("Leave application not found.", 404);
  if (application.status !== "pending") {
    throw new LeaveServiceError(
      `This application is already ${application.status}.`,
      409,
    );
  }
  if (application.approver_id !== approverId) {
    throw new LeaveServiceError(
      "You are not the assigned approver for this application.",
      403,
    );
  }

  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const updated = await leaveApplicationModel.updateStatus(
      applicationId,
      action,
      connection,
    );

    if (action === "approved") {
      const year = new Date(application.start_date).getFullYear();
      await leaveBalanceModel.incrementUsedDays(
        application.employee_id,
        application.leave_type_id,
        year,
        application.total_days,
        connection,
      );
    }

    await leaveApprovalLogModel.create(
      { leaveApplicationId: applicationId, approverId, action, remarks },
      connection,
    );

    await connection.commit();
    return updated;
  } catch (err) {
    await connection.rollback();
    throw err;
  } finally {
    connection.release();
  }
}

interface ApplicationStatusResult {
  application: LeaveApplicationWithNames;
  remainingLeaves: number | null;
}

/** Employee checks status + remaining balance for a specific application. */
export async function getApplicationStatus(
  applicationId: number,
  requesterId: number,
): Promise<ApplicationStatusResult> {
  const application = await leaveApplicationModel.findById(applicationId);
  if (!application)
    throw new LeaveServiceError("Leave application not found.", 404);

  // Only the applicant or the assigned approver may view it
  if (
    application.employee_id !== requesterId &&
    application.approver_id !== requesterId
  ) {
    throw new LeaveServiceError(
      "Not authorized to view this application.",
      403,
    );
  }

  const year = new Date(application.start_date).getFullYear();
  const balance = await leaveBalanceModel.getBalance(
    application.employee_id,
    application.leave_type_id,
    year,
  );

  return {
    application,
    remainingLeaves: balance
      ? balance.allocated_days - balance.used_days
      : null,
  };
}

export default {
  LeaveServiceError,
  applyForLeave,
  getPendingApprovals,
  decideApplication,
  getApplicationStatus,
};
