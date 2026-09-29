import pool from "../config/db";
import compOffModel from "../models/compOffModel";
import { addCompOffBalance , getCompOffBalance} from "../models/compoffBalancesModel";


export async function markCompOffAsWorked(
  compOffId: number,
  employeeId: number,
) {
  const existing = await compOffModel.findById(compOffId);

  if (!existing) {
    throw new Error("Comp-Off request not found.");
  }

  if (existing.employee_id !== employeeId) {
    throw new Error(
      "You are not authorized to update this Comp-Off request.",
    );
  }

  if (existing.status !== "approved") {
    throw new Error(
      "Only approved Comp-Off requests can be marked as worked.",
    );
  }

  if (existing.completed_at) {
    throw new Error(
      "This Comp-Off has already been marked as worked.",
    );
  }

  const workDate = new Date(`${existing.work_date}T00:00:00`);
  const today = new Date();

  workDate.setHours(0, 0, 0, 0);
  today.setHours(0, 0, 0, 0);

  if (workDate > today) {
    throw new Error(
      "Comp-Off cannot be marked as worked before the work date.",
    );
  }

  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    const marked = await compOffModel.markAsWorked(
      existing.id,
      employeeId,
      connection,
    );

    if (!marked) {
      throw new Error(
        "Comp-Off could not be marked as worked.",
      );
    }

    const year = Number(existing.work_date.substring(0, 4));

    await addCompOffBalance(
      existing.employee_id,
      year,
      1,
      connection,
    );

    await connection.commit();

    return await compOffModel.findById(existing.id);
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

//get compoffBalance
export async function getMyCompOffBalance(employeeId: number) {
  const year = new Date().getFullYear();

  return await getCompOffBalance(employeeId, year);
}