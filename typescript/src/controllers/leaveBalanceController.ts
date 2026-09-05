import { Request, Response, NextFunction } from "express";
import leaveBalanceModel from "../models/leaveBalanceModel";
import leaveTypeModel from "../models/leaveTypeModel";
import { currentYear } from "../utils/dateUtils";

// GET /api/leave-balances/me — feeds the balance chips at the top of the form
export async function myBalances(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const year = Number(req.query.year) || currentYear();
    const balances = await leaveBalanceModel.listForEmployee(req.user!.id, year);
    res.json(balances);
  } catch (err) {
    next(err);
  }
}

// GET /api/leave-types — populates the leave-type dropdown/chips
export async function listLeaveTypes(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const types = await leaveTypeModel.findAll();
    res.json(types);
  } catch (err) {
    next(err);
  }
}
