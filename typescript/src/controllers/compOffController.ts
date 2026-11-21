import { Request, Response, NextFunction } from 'express'
import {compOffModel} from '../models'
import pool from '../config/db'
import { sendNotification } from '../services'
import * as compoffServices from '../services'


function validDate(value: string): boolean {
  return (
    /^\d{4}-\d{2}-\d{2}$/.test(value) &&
    !Number.isNaN(new Date(`${value}T00:00:00Z`).getTime())
  )
}

export async function applyCompOff(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { workDate, reason } = req.body as {
      workDate?: string
      reason?: string
    }
    if (!workDate || !reason?.trim()) {
      res.status(400).json({ error: 'workDate and reason are required.' })
      return
    }
    if (!validDate(workDate)) {
      res
        .status(400)
        .json({ error: 'workDate must be a valid date in YYYY-MM-DD format.' })
      return
    }

    const employeeId = req.user!.centralEmployeeId
    const approverId = req.user!.reportingManagerEmployeeId
    if (!approverId) {
      res.status(422).json({ error: 'No manager found for this employee.' })
      return
    }

    const created = await compOffModel.create({
      employeeId,
      workDate,
      reason: reason.trim(),
      approverId,
    })

    await sendNotification(
      approverId,
      'New Comp-Off Request',
      `${req.user!.name} has submitted a comp-off request for ${workDate}.`,
      'COMPOFF_APPLIED',
      created?.id
    )

    res.status(201).json(created)
  } catch (err) {
    next(err)
  }
}

export async function myCompOffHistory(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    res.json(await compOffModel.findByEmployee(req.user!.centralEmployeeId))
  } catch (err) {
    next(err)
  }
}

export async function cancelCompOffRequest(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const compOffId = Number(req.params.id)

    if (!Number.isInteger(compOffId) || compOffId <= 0) {
      res.status(400).json({ error: 'Invalid Comp-Off request ID.' })
      return
    }

    const request = await compoffServices.cancelCompOffRequest(
      compOffId,
      req.user!.centralEmployeeId
    )

    res.json({
      message: 'Comp-Off request cancelled successfully.',
      request,
    })
  } catch (err) {
    next(err)
  }
}

export async function pendingCompOffs(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    res.json(
      await compOffModel.findPendingForApprover(req.user!.centralEmployeeId)
    )
  } catch (err) {
    next(err)
  }
}

export async function compOffTeamHistory(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const role = req.user!.applicationRoles?.includes('owner')
      ? 'owner'
      : null
    if (role === 'owner') {
      res.json(await compOffModel.findAllHistory())
      return
    }
    res.json(
      await compOffModel.findTeamHistory(req.user!.centralEmployeeId)
    )
  } catch (err) {
    next(err)
  }
}

export async function decideCompOff(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { action, remarks } = req.body as {
      action?: 'approved' | 'rejected'
      remarks?: string
    }
    if (action !== 'approved' && action !== 'rejected') {
      res
        .status(400)
        .json({ error: "action must be 'approved' or 'rejected'." })
      return
    }
    const existing = await compOffModel.findById(Number(req.params.id))
    if (!existing) {
      res.status(404).json({ error: 'Comp-Off request not found.' })
      return
    }
    if (existing.approver_id !== req.user!.centralEmployeeId) {
      res
        .status(403)
        .json({ error: 'You are not the assigned approver for this request.' })
      return
    }
    if (existing.status !== 'pending') {
      res
        .status(409)
        .json({ error: `This request is already ${existing.status}.` })
      return
    }

    const connection = await pool.getConnection()
    try {
      await connection.beginTransaction()
      await compOffModel.updateDecision(
        existing.id,
        req.user!.centralEmployeeId,
        action,
        remarks?.trim() || null,
        connection
      )
      await connection.commit()

      const notificationTitle =
        action === 'approved'
          ? 'Comp-Off Request Approved'
          : 'Comp-Off Request Rejected'
      const notificationMessage =
        action === 'approved'
          ? `Your comp-off request has been approved by ${req.user!.name || 'your manager'}.`
          : `Your comp-off request has been rejected by ${req.user!.name || 'your manager'}.`

      await sendNotification(
        existing.employee_id,
        notificationTitle,
        notificationMessage,
        action === 'approved' ? 'COMPOFF_APPROVED' : 'COMPOFF_REJECTED',
        existing.id
      )

      res.json(await compOffModel.findById(existing.id))
    } catch (err) {
      await connection.rollback()
      throw err
    } finally {
      connection.release()
    }
  } catch (err) {
    next(err)
  }
}

// mark compoff as completed
export async function markCompOffAsWorked(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const compOffId = Number(req.params.id)

    if (!Number.isInteger(compOffId) || compOffId <= 0) {
      res.status(400).json({
        error: 'Invalid Comp-Off request ID.',
      })
      return
    }

    const result = await compoffServices.markCompOffAsWorked(
      compOffId,
      req.user!.centralEmployeeId
    )

    res.json({
      message: 'Comp-Off marked as worked successfully.',
      data: result,
    })
  } catch (err) {
    next(err)
  }
}

//compoff Balance logic
// get current employee's Comp-Off balance
export async function myCompOffBalance(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const balance = await compoffServices.getMyCompOffBalance(
      req.user!.centralEmployeeId
    )

    res.json(balance)
  } catch (err) {
    next(err)
  }
}
