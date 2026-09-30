import { Request, Response, NextFunction } from "express";
import leaveBalanceModel from "../models/leaveBalanceModel";
import leaveTypeModel from "../models/leaveTypeModel";
import { getCompOffBalance } from "../models/compoffBalancesModel";
import { currentYear } from "../utils/dateUtils";

function isCompOffLeaveType(name: string): boolean {
  return /^comp[\s_-]*off(?:[\s_-]+leave)?$/i.test(name.trim());
}

// GET /api/leave-balances/me — feeds the balance chips at the top of the form
export async function myBalances(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const year = Number(req.query.year) || currentYear();
    const [balances, leaveTypes, compOffBalance] = await Promise.all([
      leaveBalanceModel.listForEmployee(req.user!.id, year),
      leaveTypeModel.findAll(),
      getCompOffBalance(req.user!.id, year),
    ]);
    const compOffType = leaveTypes.find((type) =>
      isCompOffLeaveType(type.name),
    );

    if (!compOffType) {
      res.json(balances);
      return;
    }

    res.json([
      ...balances.filter((balance) => balance.leave_type_id !== compOffType.id),
      {
        employee_id: req.user!.id,
        leave_type_id: compOffType.id,
        year,
        allocated_days: compOffBalance.total_days,
        used_days: compOffBalance.used_days,
        remaining_days: compOffBalance.available_days,
        leave_type_name: compOffType.name,
        max_days_per_year: compOffType.max_days_per_year,
      },
    ]);
  } catch (err) {
    next(err);
  }
}

// GET /api/leave-types — populates the leave-type dropdown/chips
export async function listLeaveTypes(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const types = await leaveTypeModel.findAll();
    res.json(types);
  } catch (err) {
    next(err);
  }
}
