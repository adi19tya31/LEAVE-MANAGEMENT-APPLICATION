import pool from "../config/db";
import { RowDataPacket, ResultSetHeader } from "mysql2";
import { LeaveType } from "../types";

async function findAll(): Promise<LeaveType[]> {
  const [rows] = await pool.query<(LeaveType & RowDataPacket)[]>("SELECT * FROM leave_types");
  return rows;
}

async function findById(id: number): Promise<LeaveType | null> {
  const [rows] = await pool.query<(LeaveType & RowDataPacket)[]>(
    "SELECT * FROM leave_types WHERE id = ?",
    [id]
  );
  return rows[0] ?? null;
}

async function findByName(name: string): Promise<LeaveType | null> {
  const [rows] = await pool.query<(LeaveType & RowDataPacket)[]>(
    "SELECT * FROM leave_types WHERE name = ?",
    [name]
  );
  return rows[0] ?? null;
}

async function create(input: { name: string; maxDaysPerYear: number }): Promise<LeaveType | null> {
  const [result] = await pool.query<ResultSetHeader>(
    "INSERT INTO leave_types (name, max_days_per_year) VALUES (?, ?)",
    [input.name, input.maxDaysPerYear]
  );
  return findById(result.insertId);
}

export default { findAll, findById, findByName, create };
