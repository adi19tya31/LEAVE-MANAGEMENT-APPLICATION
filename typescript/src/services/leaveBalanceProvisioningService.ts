import { leaveBalanceModel, leaveTypeModel } from '../models'
import { LeaveBalance, LeaveType } from '../types'
import { isCompOffLeaveType } from './leaveService'
import { currentYear } from '../utils/dateUtils'

export class LeaveBalanceProvisioningError extends Error {
  constructor(
    readonly statusCode: number,
    message: string
  ) {
    super(message)
    this.name = 'LeaveBalanceProvisioningError'
  }
}

export interface ProvisionLeaveBalanceInput {
  centralEmployeeId: number
  leaveTypeId: number
  year: number
  allocatedDays: number
}

export interface ProvisionLeaveBalanceResult {
  created: boolean
  balance: LeaveBalance
}

interface ProvisioningDependencies {
  findLeaveType(leaveTypeId: number): Promise<LeaveType | null>
  createIfMissing(input: {
    employeeId: number
    leaveTypeId: number
    year: number
    allocatedDays: number
  }): Promise<ProvisionLeaveBalanceResult>
}

interface EmployeeProvisioningDependencies {
  findLeaveTypes(): Promise<LeaveType[]>
  hasExistingBalances(centralEmployeeId: number, year: number): Promise<boolean>
  provisionBalance(
    input: ProvisionLeaveBalanceInput
  ): Promise<ProvisionLeaveBalanceResult>
}

export interface ProvisionEmployeeBalancesInput {
  centralEmployeeId: number
  hasLeaveManagementAccess: boolean
  year: number
}

export interface ProvisionEmployeeBalancesResult {
  createdCount: number
  balances: LeaveBalance[]
}

export function createEmployeeBalanceProvisioner(
  dependencies: EmployeeProvisioningDependencies
): (
  input: ProvisionEmployeeBalancesInput
) => Promise<ProvisionEmployeeBalancesResult> {
  return async (input) => {
    if (!input.hasLeaveManagementAccess) {
      return { createdCount: 0, balances: [] }
    }

    if (
      !Number.isSafeInteger(input.centralEmployeeId) ||
      input.centralEmployeeId <= 0 ||
      !Number.isSafeInteger(input.year) ||
      input.year <= 0
    ) {
      throw new LeaveBalanceProvisioningError(
        400,
        'centralEmployeeId and year must be valid integers.'
      )
    }

    if (
      input.centralEmployeeId >= 3 &&
      input.centralEmployeeId <= 10 &&
      (await dependencies.hasExistingBalances(
        input.centralEmployeeId,
        input.year
      ))
    ) {
      throw new LeaveBalanceProvisioningError(
        409,
        'Balance provisioning is paused because this central employee ID overlaps unreconciled historical balances.'
      )
    }

    const leaveTypes = await dependencies.findLeaveTypes()
    const balances: LeaveBalance[] = []
    let createdCount = 0

    for (const leaveType of leaveTypes) {
      if (isCompOffLeaveType(leaveType.name)) {
        continue
      }

      const result = await dependencies.provisionBalance({
        centralEmployeeId: input.centralEmployeeId,
        leaveTypeId: leaveType.id,
        year: input.year,
        allocatedDays: leaveType.max_days_per_year,
      })
      balances.push(result.balance)
      if (result.created) {
        createdCount += 1
      }
    }

    return { createdCount, balances }
  }
}

export function createLeaveBalanceProvisioner(
  dependencies: ProvisioningDependencies
): (input: ProvisionLeaveBalanceInput) => Promise<ProvisionLeaveBalanceResult> {
  return async (input) => {
    const { centralEmployeeId, leaveTypeId, year, allocatedDays } = input
    if (
      !Number.isSafeInteger(centralEmployeeId) ||
      centralEmployeeId <= 0 ||
      !Number.isSafeInteger(leaveTypeId) ||
      leaveTypeId <= 0 ||
      !Number.isSafeInteger(year) ||
      year <= 0 ||
      !Number.isSafeInteger(allocatedDays) ||
      allocatedDays < 0
    ) {
      throw new LeaveBalanceProvisioningError(
        400,
        'centralEmployeeId, leaveTypeId, year, and allocatedDays must be valid integers.'
      )
    }

    const leaveType = await dependencies.findLeaveType(leaveTypeId)
    if (!leaveType) {
      throw new LeaveBalanceProvisioningError(404, 'Leave type not found.')
    }
    if (isCompOffLeaveType(leaveType.name)) {
      throw new LeaveBalanceProvisioningError(
        400,
        'Comp-Off balances must be managed through the Comp-Off balance workflow.'
      )
    }
    if (allocatedDays !== leaveType.max_days_per_year) {
      throw new LeaveBalanceProvisioningError(
        400,
        `allocatedDays must match the approved entitlement of ${leaveType.max_days_per_year} for this leave type.`
      )
    }

    return dependencies.createIfMissing({
      employeeId: centralEmployeeId,
      leaveTypeId,
      year,
      allocatedDays,
    })
  }
}

export const provisionLeaveBalance = createLeaveBalanceProvisioner({
  findLeaveType: (leaveTypeId) => leaveTypeModel.findById(leaveTypeId),
  createIfMissing: (input) => leaveBalanceModel.createIfMissing(input),
})

const provisionEmployeeBalances = createEmployeeBalanceProvisioner({
  findLeaveTypes: () => leaveTypeModel.findAll(),
  hasExistingBalances: (centralEmployeeId, year) =>
    leaveBalanceModel.hasBalancesForEmployee(centralEmployeeId, year),
  provisionBalance: provisionLeaveBalance,
})

export async function provisionAuthorizedEmployeeBalances(
  centralEmployeeId: number,
  hasLeaveManagementAccess: boolean,
  year = currentYear()
): Promise<ProvisionEmployeeBalancesResult> {
  return provisionEmployeeBalances({
    centralEmployeeId,
    hasLeaveManagementAccess,
    year,
  })
}

export async function provisionBalancesWithoutBlockingAuthentication(
  centralEmployeeId: number,
  hasLeaveManagementAccess: boolean,
  provision: (
    employeeId: number
  ) => Promise<ProvisionEmployeeBalancesResult> = (employeeId) =>
    provisionAuthorizedEmployeeBalances(employeeId, true),
  reportError: (error: unknown, employeeId: number) => void = (
    error,
    employeeId
  ) =>
    console.error('Leave balance provisioning failed after authentication.', {
      centralEmployeeId: employeeId,
      error,
    })
): Promise<void> {
  if (!hasLeaveManagementAccess) {
    return
  }

  try {
    await provision(centralEmployeeId)
  } catch (error) {
    reportError(error, centralEmployeeId)
  }
}
