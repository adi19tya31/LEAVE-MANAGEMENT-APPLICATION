import pool from '../config/db'
import { Pool, RowDataPacket, PoolConnection } from 'mysql2/promise'
import { LeaveApprovalLog, ApprovalAction } from '../types'

interface CreateLogInput {
  leaveApplicationId: number
  approverId: number
  action: ApprovalAction
  remarks?: string | null
}

async function create(
  input: CreateLogInput,
  connection: Pool | PoolConnection = pool
): Promise<void> {
  const { leaveApplicationId, approverId, action, remarks } = input
  await connection.query(
    `INSERT INTO leave_approval_logs (leave_application_id, approver_id, action, remarks)
     VALUES (?, ?, ?, ?)`,
    [leaveApplicationId, approverId, action, remarks ?? null]
  )
}

async function listForApplication(
  leaveApplicationId: number
): Promise<(LeaveApprovalLog & { approver_name: string })[]> {
  const [rows] = await pool.query<
    (LeaveApprovalLog & { approver_name: string } & RowDataPacket)[]
  >(
    `SELECT lal.*,
            CONCAT('Employee #', lal.approver_id) AS approver_name
     FROM leave_approval_logs lal
     WHERE lal.leave_application_id = ?
     ORDER BY lal.action_date ASC`,
    [leaveApplicationId]
  )
  return rows
}

export default { create, listForApplication }
