import pool from "../config/db";
import { RowDataPacket, ResultSetHeader } from "mysql2";
import { Department } from "../types";

async function findAll(): Promise<Department[]> {
  const [rows] = await pool.query<(Department & RowDataPacket)[]>(
    "SELECT * FROM departments",
  );
  return rows;
}

async function findById(id: number): Promise<Department | null> {
  const [rows] = await pool.query<(Department & RowDataPacket)[]>(
    "SELECT * FROM departments WHERE id = ?",
    [id],
  );
  return rows[0] ?? null;
}

async function findByName(name: string): Promise<Department | null> {
  const [rows] = await pool.query<(Department & RowDataPacket)[]>(
    "SELECT * FROM departments WHERE name = ?",
    [name],
  );
  return rows[0] ?? null;
}

async function create(name: string): Promise<Department | null> {
  const [result] = await pool.query<ResultSetHeader>(
    "INSERT INTO departments (name) VALUES (?)",
    [name],
  );
  return findById(result.insertId);
}

async function updateName(
  id: number,
  name: string,
): Promise<Department | null> {
  await pool.query("UPDATE departments SET name = ? WHERE id = ?", [name, id]);
  return findById(id);
}

// Owner-only: set or change who manages this department.
async function setManager(
  id: number,
  managerId: number,
): Promise<Department | null> {
  await pool.query("UPDATE departments SET manager_id = ? WHERE id = ?", [
    managerId,
    id,
  ]);
  return findById(id);
}

// Manager-or-Owner: reversible — just flips status, data stays intact.
async function deactivate(id: number): Promise<Department | null> {
  await pool.query("UPDATE departments SET status = 'inactive' WHERE id = ?", [
    id,
  ]);
  return findById(id);
}

async function reactivate(id: number): Promise<Department | null> {
  await pool.query("UPDATE departments SET status = 'active' WHERE id = ?", [
    id,
  ]);
  return findById(id);
}

// Owner-only: permanent, irreversible row removal.
async function remove(id: number): Promise<void> {
  await pool.query("DELETE FROM departments WHERE id = ?", [id]);
}

export default {
  findAll,
  findById,
  findByName,
  create,
  updateName,
  setManager,
  deactivate,
  reactivate,
  remove,
};
