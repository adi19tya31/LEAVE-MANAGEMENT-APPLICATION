import assert from 'node:assert/strict'
import test from 'node:test'
import {
  createEmployeeBalanceProvisioner,
  createLeaveBalanceProvisioner,
  LeaveBalanceProvisioningError,
  provisionBalancesWithoutBlockingAuthentication,
  ProvisionLeaveBalanceResult,
} from '../src/services/leaveBalanceProvisioningService'
import { LeaveBalance, LeaveType } from '../src/types'

const leaveType: LeaveType = {
  id: 1,
  name: 'Casual Leave',
  max_days_per_year: 12,
}
const secondLeaveType: LeaveType = {
  id: 2,
  name: 'Sick Leave',
  max_days_per_year: 10,
}

function createTestProvisioner(initialBalances: LeaveBalance[] = []): {
  provision: ReturnType<typeof createLeaveBalanceProvisioner>
  balances: LeaveBalance[]
  getCreateCalls(): number
  getLastInput(): {
    employeeId: number
    leaveTypeId: number
    year: number
    allocatedDays: number
  } | null
} {
  const balances = [...initialBalances]
  let createCalls = 0
  let lastInput: {
    employeeId: number
    leaveTypeId: number
    year: number
    allocatedDays: number
  } | null = null

  const provision = createLeaveBalanceProvisioner({
    findLeaveType: async (id) =>
      id === leaveType.id
        ? leaveType
        : id === secondLeaveType.id
          ? secondLeaveType
          : null,
    createIfMissing: async (input): Promise<ProvisionLeaveBalanceResult> => {
      createCalls += 1
      lastInput = input
      const existing = balances.find(
        (balance) =>
          balance.employee_id === input.employeeId &&
          balance.leave_type_id === input.leaveTypeId &&
          balance.year === input.year
      )
      if (existing) return { created: false, balance: existing }

      const balance: LeaveBalance = {
        id: balances.length + 1,
        employee_id: input.employeeId,
        leave_type_id: input.leaveTypeId,
        year: input.year,
        allocated_days: input.allocatedDays,
        used_days: 0,
      }
      balances.push(balance)
      return { created: true, balance }
    },
  })

  return {
    provision,
    balances,
    getCreateCalls: () => createCalls,
    getLastInput: () => lastInput,
  }
}

test('provisions an explicitly approved balance for a central employee ID', async () => {
  const provisioner = createTestProvisioner()

  const first = await provisioner.provision({
    centralEmployeeId: 25,
    leaveTypeId: 1,
    year: 2026,
    allocatedDays: 12,
  })
  const duplicate = await provisioner.provision({
    centralEmployeeId: 25,
    leaveTypeId: 1,
    year: 2026,
    allocatedDays: 12,
  })

  assert.equal(first.created, true)
  assert.equal(duplicate.created, false)
  assert.deepEqual(provisioner.getLastInput(), {
    employeeId: 25,
    leaveTypeId: 1,
    year: 2026,
    allocatedDays: 12,
  })
  assert.equal(first.balance.used_days, 0)
  assert.equal(provisioner.balances.length, 1)
})

test('keeps leave type and supported year balances distinct', async () => {
  const provisioner = createTestProvisioner()

  await provisioner.provision({
    centralEmployeeId: 25,
    leaveTypeId: 1,
    year: 2026,
    allocatedDays: 12,
  })
  await provisioner.provision({
    centralEmployeeId: 25,
    leaveTypeId: 2,
    year: 2025,
    allocatedDays: 10,
  })

  assert.deepEqual(
    provisioner.balances.map(({ employee_id, leave_type_id, year }) => ({
      employee_id,
      leave_type_id,
      year,
    })),
    [
      { employee_id: 25, leave_type_id: 1, year: 2026 },
      { employee_id: 25, leave_type_id: 2, year: 2025 },
    ]
  )
})

test('repeated provisioning leaves an existing allocation and used days unchanged', async () => {
  const existing: LeaveBalance = {
    id: 11,
    employee_id: 25,
    leave_type_id: 1,
    year: 2026,
    allocated_days: 8,
    used_days: 3,
  }
  const provisioner = createTestProvisioner([existing])

  const first = await provisioner.provision({
    centralEmployeeId: 25,
    leaveTypeId: 1,
    year: 2026,
    allocatedDays: 12,
  })
  const second = await provisioner.provision({
    centralEmployeeId: 25,
    leaveTypeId: 1,
    year: 2026,
    allocatedDays: 12,
  })

  assert.equal(first.created, false)
  assert.equal(second.created, false)
  assert.deepEqual(first.balance, existing)
  assert.deepEqual(second.balance, existing)
  assert.equal(provisioner.balances.length, 1)
})

test('rejects allocations that differ from the approved leave type entitlement', async () => {
  const provisioner = createTestProvisioner()

  await assert.rejects(
    provisioner.provision({
      centralEmployeeId: 25,
      leaveTypeId: 1,
      year: 2026,
      allocatedDays: 10,
    }),
    (error: unknown) =>
      error instanceof LeaveBalanceProvisioningError && error.statusCode === 400
  )

  assert.equal(provisioner.getCreateCalls(), 0)
})

test('does not provision Comp-Off through leave balances', async () => {
  const provisioner = createLeaveBalanceProvisioner({
    findLeaveType: async () => ({
      id: 3,
      name: 'Comp-Off Leave',
      max_days_per_year: 15,
    }),
    createIfMissing: async () => {
      throw new Error('createIfMissing must not be called')
    },
  })

  await assert.rejects(
    provisioner({
      centralEmployeeId: 25,
      leaveTypeId: 3,
      year: 2026,
      allocatedDays: 15,
    }),
    (error: unknown) =>
      error instanceof LeaveBalanceProvisioningError && error.statusCode === 400
  )
})

test('rejects invalid IDs, years, and allocation amounts', async () => {
  const provisioner = createTestProvisioner()

  await assert.rejects(
    provisioner.provision({
      centralEmployeeId: 0,
      leaveTypeId: 1,
      year: 2026,
      allocatedDays: 12,
    }),
    (error: unknown) =>
      error instanceof LeaveBalanceProvisioningError && error.statusCode === 400
  )
  await assert.rejects(
    provisioner.provision({
      centralEmployeeId: 25,
      leaveTypeId: 1,
      year: 2026,
      allocatedDays: -1,
    }),
    (error: unknown) =>
      error instanceof LeaveBalanceProvisioningError && error.statusCode === 400
  )
  assert.equal(provisioner.getCreateCalls(), 0)
})

test('provisions regular balances after Leave Management access is confirmed', async () => {
  const requested: Array<{
    centralEmployeeId: number
    leaveTypeId: number
    year: number
    allocatedDays: number
  }> = []
  const provision = createEmployeeBalanceProvisioner({
    findLeaveTypes: async () => [
      leaveType,
      secondLeaveType,
      { id: 3, name: 'Comp-Off Leave', max_days_per_year: 15 },
    ],
    hasExistingBalances: async () => false,
    provisionBalance: async (input) => {
      requested.push(input)
      return {
        created: true,
        balance: {
          id: requested.length,
          employee_id: input.centralEmployeeId,
          leave_type_id: input.leaveTypeId,
          year: input.year,
          allocated_days: input.allocatedDays,
          used_days: 0,
        },
      }
    },
  })

  const result = await provision({
    centralEmployeeId: 25,
    hasLeaveManagementAccess: true,
    year: 2026,
  })

  assert.equal(result.createdCount, 2)
  assert.deepEqual(requested, [
    {
      centralEmployeeId: 25,
      leaveTypeId: 1,
      year: 2026,
      allocatedDays: 12,
    },
    {
      centralEmployeeId: 25,
      leaveTypeId: 2,
      year: 2026,
      allocatedDays: 10,
    },
  ])
})

test('does not provision employees without Leave Management access', async () => {
  let lookupCalls = 0
  const provision = createEmployeeBalanceProvisioner({
    findLeaveTypes: async () => {
      lookupCalls += 1
      return [leaveType]
    },
    hasExistingBalances: async () => false,
    provisionBalance: async () => {
      throw new Error('provisionBalance must not be called')
    },
  })

  const result = await provision({
    centralEmployeeId: 25,
    hasLeaveManagementAccess: false,
    year: 2026,
  })

  assert.deepEqual(result, { createdCount: 0, balances: [] })
  assert.equal(lookupCalls, 0)
})

test('keeps historical local ID balances 3–10 unchanged', async () => {
  const historicalBalances: LeaveBalance[] = Array.from(
    { length: 8 },
    (_, index) => ({
      id: index + 1,
      employee_id: index + 3,
      leave_type_id: 1,
      year: 2026,
      allocated_days: 12,
      used_days: index,
    })
  )
  const provisioner = createTestProvisioner(historicalBalances)
  const employeeProvisioner = createEmployeeBalanceProvisioner({
    findLeaveTypes: async () => [leaveType, secondLeaveType],
    hasExistingBalances: async () => false,
    provisionBalance: (input) =>
      provisioner.provision({
        centralEmployeeId: input.centralEmployeeId,
        leaveTypeId: input.leaveTypeId,
        year: input.year,
        allocatedDays: input.allocatedDays,
      }),
  })

  await employeeProvisioner({
    centralEmployeeId: 25,
    hasLeaveManagementAccess: true,
    year: 2026,
  })

  assert.deepEqual(provisioner.balances.slice(0, 8), historicalBalances)
})

test('does not provision against ambiguous historical balances for central IDs 3–10', async () => {
  let findLeaveTypesCalls = 0
  let provisionCalls = 0
  const employeeProvisioner = createEmployeeBalanceProvisioner({
    findLeaveTypes: async () => {
      findLeaveTypesCalls += 1
      return [leaveType]
    },
    hasExistingBalances: async (centralEmployeeId, year) =>
      centralEmployeeId === 3 && year === 2026,
    provisionBalance: async () => {
      provisionCalls += 1
      throw new Error('provisionBalance must not be called')
    },
  })

  await assert.rejects(
    employeeProvisioner({
      centralEmployeeId: 3,
      hasLeaveManagementAccess: true,
      year: 2026,
    }),
    (error: unknown) =>
      error instanceof LeaveBalanceProvisioningError && error.statusCode === 409
  )

  assert.equal(findLeaveTypesCalls, 0)
  assert.equal(provisionCalls, 0)
})

test('retries provisioning failures without failing authentication', async () => {
  const reportedErrors: Array<{ error: unknown; employeeId: number }> = []

  await assert.doesNotReject(
    provisionBalancesWithoutBlockingAuthentication(
      25,
      true,
      async () => {
        throw new Error('database unavailable')
      },
      (error, employeeId) => reportedErrors.push({ error, employeeId })
    )
  )

  assert.equal(reportedErrors.length, 1)
  assert.equal(reportedErrors[0].employeeId, 25)
  assert.match(String(reportedErrors[0].error), /database unavailable/)
})
