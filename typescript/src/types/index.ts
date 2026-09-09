// One interface per table — field names match the DB columns exactly
// so query results can be typed directly without extra mapping.

export interface Role {
  id: number;
  name: string;
}

export interface Department {
  id: number;
  name: string;
}

export interface Employee {
  Emp_id: number;
  name: string;
  company: string | null;
  employee_code: string | null;
  aadhar_no: string | null;
  pan_no: string | null;
  email: string;
  password_hash: string;
  role_id: number;
  Dept_id: number | null;
  reporting_to: number | null;
  status: "active" | "inactive";
  created_at: string;
}

export interface LeaveType {
  id: number;
  name: string;
  max_days_per_year: number;
}

export interface PublicHoliday {
  id: number;
  holiday_date: string;
  name: string;
}

export interface LeaveBalance {
  id: number;
  employee_id: number;
  leave_type_id: number;
  year: number;
  allocated_days: number;
  used_days: number;
}

export interface LeaveBalanceWithType extends LeaveBalance {
  leave_type_name: string;
  max_days_per_year: number;
  remaining_days: number;
}

export type LeaveApplicationStatus =
  | "pending"
  | "approved"
  | "rejected"
  | "cancelled";

export interface LeaveApplication {

  id: number;

  employee_id: number;

  leave_type_id: number;

  start_date: string;

  end_date: string;


  start_day_type:
    | "FULL_DAY"
    | "FIRST_HALF"
    | "SECOND_HALF";


  end_day_type:
    | "FULL_DAY"
    | "FIRST_HALF"
    | "SECOND_HALF";


  duration_type: string;


  total_days: number;

  reason: string | null;

  status: LeaveApplicationStatus;

  approver_id: number;

  applied_on: string;

  decided_on: string | null;

}

export interface LeaveApplicationWithNames extends LeaveApplication {
  leave_type_name: string;
  applicant_name?: string;
}

export type ApprovalAction = "approved" | "rejected";

export interface LeaveApprovalLog {
  id: number;
  leave_application_id: number;
  approver_id: number;
  action: ApprovalAction;
  remarks: string | null;
  action_date: string;
}

// What we sign into the JWT, and what req.user holds after auth middleware runs
export interface AuthPayload {
  id: number;
  roleId: number;
  role: string | null;
  name: string;
}
