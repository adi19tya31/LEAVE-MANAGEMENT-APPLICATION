import pool from "../config/db";
import {
  Pool,
  PoolConnection,
  RowDataPacket
} from "mysql2/promise";

export async function addCompOffBalance(
  empId: number,
  year: number,
  days: number,
  connection: Pool | PoolConnection = pool,
): Promise<void> {
  await connection.execute(
    `
    INSERT INTO compoff_balances
    (Emp_id, year, total_days, used_days)
    VALUES (?, ?, ?, 0)
    ON DUPLICATE KEY UPDATE
      total_days = total_days + VALUES(total_days)
    `,
    [empId, year, days],
  );
}

export async function getCompOffBalance(
  empId: number,
  year: number,
): Promise<{
  total_days: number;
  used_days: number;
  available_days: number;
}> {
  const [rows] = await pool.execute<RowDataPacket[]>(
    `
    SELECT
      total_days,
      used_days,
      (total_days - used_days) AS available_days
    FROM compoff_balances
    WHERE Emp_id = ?
      AND year = ?
    `,
    [empId, year],
  );

  if (rows.length === 0) {
    return {
      total_days: 0,
      used_days: 0,
      available_days: 0,
    };
  }

  return {
    total_days: Number(rows[0].total_days),
    used_days: Number(rows[0].used_days),
    available_days: Number(rows[0].available_days),
  };
}

//logic for the use compoff balances
export async function useCompOffBalance(
  empId: number,
  year: number,
  usedDays: number,
  connection: Pool | PoolConnection = pool,
): Promise<boolean> {
  const [result]: any = await connection.execute(
    `
    UPDATE compoff_balances
    SET used_days = used_days + ?
    WHERE Emp_id = ?
      AND year = ?
      AND total_days - used_days >= ?
    `,
    [usedDays, empId, year, usedDays],
  );

  return result.affectedRows > 0;
}

export async function refundCompOffBalance(
  empId: number,
  year: number,
  days: number,
  connection: Pool | PoolConnection = pool,
): Promise<boolean> {
  const [result]: any = await connection.execute(
    `
    UPDATE compoff_balances
    SET used_days = used_days - ?
    WHERE Emp_id = ?
      AND year = ?
      AND used_days >= ?
    `,
    [days, empId, year, days],
  );

  return result.affectedRows > 0;
}

export default {
  addCompOffBalance,
  getCompOffBalance,
  useCompOffBalance,
  refundCompOffBalance,
};