import pool from "../config/db";
import { PublicHoliday } from "../types";
import { RowDataPacket, ResultSetHeader } from "mysql2";

async function findAll(): Promise<PublicHoliday[]> {
  const [rows] = await pool.query<(PublicHoliday & RowDataPacket)[]>(
    "SELECT id, holiday_date, name FROM public_holidays ORDER BY holiday_date ASC",
  );
  return rows;
}

async function findBetween(
  startDate: string,
  endDate: string,
): Promise<PublicHoliday[]> {
  const [rows] = await pool.query<(PublicHoliday & RowDataPacket)[]>(
    `SELECT id, holiday_date, name
     FROM public_holidays
     WHERE holiday_date BETWEEN ? AND ?`,
    [startDate, endDate],
  );
  return rows;
}

async function findById(id: number): Promise<PublicHoliday | null> {
  const [rows] = await pool.query<(PublicHoliday & RowDataPacket)[]>(
    "SELECT id, holiday_date, name FROM public_holidays WHERE id = ?",
    [id],
  );
  return rows[0] ?? null;
}

async function create(
  holidayDate: string,
  name: string,
): Promise<PublicHoliday | null> {
  const [result] = await pool.query<ResultSetHeader>(
    "INSERT INTO public_holidays (holiday_date, name) VALUES (?, ?)",
    [holidayDate, name],
  );
  return findById(result.insertId);
}

async function remove(id: number): Promise<void> {
  await pool.query("DELETE FROM public_holidays WHERE id = ?", [id]);
}

export default { findAll, findBetween, create, findById, remove };
