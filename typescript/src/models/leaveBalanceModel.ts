import pool from '../config/db'
import {
  Pool,
  RowDataPacket,
  ResultSetHeader,
  PoolConnection,
} from 'mysql2/promise'
import { LeaveBalance, LeaveBalanceWithType } from '../types'

async function getBalance(
  employeeId: number,
  leaveTypeId: number,
  year: number,
  connection: Pool | PoolConnection = pool
): Promise<LeaveBalance | null> {
  const [rows] = await connection.query<(LeaveBalance & RowDataPacket)[]>(
    'SELECT * FROM leave_balances WHERE employee_id = ? AND leave_type_id = ? AND year = ?',
    [employeeId, leaveTypeId, year]
  )
  return rows[0] ?? null
}

async function listForEmployee(
  employeeId: number,
  year: number
): Promise<LeaveBalanceWithType[]> {
  const [rows] = await pool.query<(LeaveBalanceWithType & RowDataPacket)[]>(
    `SELECT lb.*, lt.name AS leave_type_name, lt.max_days_per_year,
            (lb.allocated_days - lb.used_days) AS remaining_days
     FROM leave_balances lb
     JOIN leave_types lt ON lt.id = lb.leave_type_id
     WHERE lb.employee_id = ? AND lb.year = ?`,
    [employeeId, year]
  )
  return rows
}

async function hasBalancesForEmployee(
  employeeId: number,
  year: number
): Promise<boolean> {
  const [rows] = await pool.query<RowDataPacket[]>(
    'SELECT 1 FROM leave_balances WHERE employee_id = ? AND year = ? LIMIT 1',
    [employeeId, year]
  )
  return rows.length > 0
}

// Inserts an approved balance row using the caller's transaction.
async function create(input: {
  employeeId: number
  leaveTypeId: number
  year: number
  allocatedDays: number
},
  connection: Pool | PoolConnection = pool
): Promise<LeaveBalance> {
  const { employeeId, leaveTypeId, year, allocatedDays } = input
  const [result] = await connection.query<ResultSetHeader>(
    `INSERT INTO leave_balances (employee_id, leave_type_id, year, allocated_days, used_days)
     VALUES (?, ?, ?, ?, 0)`,
    [employeeId, leaveTypeId, year, allocatedDays]
  )
  const [rows] = await connection.query<(LeaveBalance & RowDataPacket)[]>(
    'SELECT * FROM leave_balances WHERE id = ?',
    [result.insertId]
  )
  if (!rows[0]) {
    throw new Error('Inserted leave balance could not be loaded.')
  }
  return rows[0]
}

async function createIfMissing(input: {
  employeeId: number
  leaveTypeId: number
  year: number
  allocatedDays: number
}): Promise<{ created: boolean; balance: LeaveBalance }> {
  const { employeeId, leaveTypeId, year } = input
  const connection = await pool.getConnection()
  let transactionStarted = false

  try {
    await connection.beginTransaction()
    transactionStarted = true

    const existing = await getBalance(
      employeeId,
      leaveTypeId,
      year,
      connection
    )
    if (existing) {
      await connection.commit()
      transactionStarted = false
      return { created: false, balance: existing }
    }

    const balance = await create(input, connection)
    await connection.commit()
    transactionStarted = false
    return { created: true, balance }
  } catch (error) {
    if (transactionStarted) {
      await connection.rollback()
      transactionStarted = false
    }

    if (isDuplicateEntryError(error)) {
      const existing = await getBalance(
        employeeId,
        leaveTypeId,
        year,
        connection
      )
      if (existing) {
        return { created: false, balance: existing }
      }
    }

    throw error
  } finally {
    connection.release()
  }
}

function isDuplicateEntryError(error: unknown): boolean {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    error.code === 'ER_DUP_ENTRY'
  )
}

// Called only when an application is APPROVED, never at submission time —
// balances should reflect confirmed leave, not pending requests.
// Accepts an optional transaction connection so it can participate in
// leaveService's approve/reject transaction.
async function incrementUsedDays(
  employeeId: number,
  leaveTypeId: number,
  year: number,
  days: number,
  connection: Pool | PoolConnection = pool
): Promise<void> {
  await connection.query(
    'UPDATE leave_balances SET used_days = used_days + ? WHERE employee_id = ? AND leave_type_id = ? AND year = ?',
    [days, employeeId, leaveTypeId, year]
  )
}

export async function refundLeaveBalance(
  employeeId: number,
  leaveTypeId: number,
  year: number,
  days: number,
  connection: Pool | PoolConnection = pool
): Promise<boolean> {
  const [result]: any = await connection.execute(
    `
    UPDATE leave_balances
    SET used_days = used_days - ?
    WHERE employee_id = ?
      AND leave_type_id = ?
      AND year = ?
      AND used_days >= ?
    `,
    [days, employeeId, leaveTypeId, year, days]
  )

  return result.affectedRows > 0
}

export default {
  getBalance,
  listForEmployee,
  hasBalancesForEmployee,
  createIfMissing,
  incrementUsedDays,
  refundLeaveBalance,
}
