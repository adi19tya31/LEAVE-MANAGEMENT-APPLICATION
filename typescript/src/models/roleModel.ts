import pool from "../config/db";
import { RowDataPacket, ResultSetHeader } from "mysql2";
import { Role } from "../types";

async function findAll(): Promise<Role[]> {
  const [rows] = await pool.query<(Role & RowDataPacket)[]>("SELECT * FROM roles");
  return rows;
}

async function findById(id: number): Promise<Role | null> {
  const [rows] = await pool.query<(Role & RowDataPacket)[]>(
    "SELECT * FROM roles WHERE id = ?",
    [id]
  );
  return rows[0] ?? null;
}

async function findByName(name: string): Promise<Role | null> {
  const [rows] = await pool.query<(Role & RowDataPacket)[]>(
    "SELECT * FROM roles WHERE name = ?",
    [name]
  );
  return rows[0] ?? null;
}

async function create(name: string): Promise<Role | null> {
  const [result] = await pool.query<ResultSetHeader>(
    "INSERT INTO roles (name) VALUES (?)",
    [name]
  );
  return findById(result.insertId);
}

export default { findAll, findById, findByName, create };
