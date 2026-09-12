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

async function update(
  id: number,
  input: { name?: string; maxDaysPerYear?: number }
): Promise<LeaveType | null> {
  // Build the SET clause dynamically so a partial update (e.g. only
  // maxDaysPerYear) doesn't overwrite the other column with undefined.
  const fields: string[] = [];
  const values: (string | number)[] = [];
 
  if (input.name !== undefined) {
    fields.push("name = ?");
    values.push(input.name);
  }
  if (input.maxDaysPerYear !== undefined) {
    fields.push("max_days_per_year = ?");
    values.push(input.maxDaysPerYear);
  }
 
  if (fields.length === 0) {
    // Nothing to update — just return the current row.
    return findById(id);
  }
 
  values.push(id);
  await pool.query<ResultSetHeader>(
    `UPDATE leave_types SET ${fields.join(", ")} WHERE id = ?`,
    values
  );
  return findById(id);
}

async function remove(id: number): Promise<boolean> {
  const [result] = await pool.query<ResultSetHeader>(
    "DELETE FROM leave_types WHERE id = ?",
    [id]
  );
  return result.affectedRows > 0;
}

export default { findAll, findById, findByName, create , update, remove };
