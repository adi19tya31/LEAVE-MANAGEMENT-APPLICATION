import assert from 'node:assert/strict'
import { createServer, IncomingMessage, ServerResponse } from 'node:http'
import test from 'node:test'
import {
  getReportingManagerEmployeeId,
  ReportingManagerServiceError,
} from '../src/services/userManagementReportingService'

const employeeId = 101
const bearerToken = 'test-user-token'

async function withReportingServer(
  handler: (
    request: IncomingMessage,
    response: ServerResponse<IncomingMessage>
  ) => void,
  run: () => Promise<void>,
  timeout = 100
): Promise<void> {
  const server = createServer(handler)
  await new Promise<void>((resolve, reject) => {
    server.once('error', reject)
    server.listen(0, '127.0.0.1', resolve)
  })

  const address = server.address()
  if (!address || typeof address === 'string') {
    await new Promise<void>((resolve) => server.close(() => resolve()))
    throw new Error('Test server did not bind to a TCP address.')
  }

  const savedEnvironment = {
    baseUrl: process.env.USER_MANAGEMENT_BASE_URL,
    endpointPath: process.env.USER_MANAGEMENT_REPORTING_MANAGER_PATH,
    timeout: process.env.USER_MANAGEMENT_REPORTING_TIMEOUT_MS,
  }
  process.env.USER_MANAGEMENT_BASE_URL = `http://127.0.0.1:${address.port}`
  process.env.USER_MANAGEMENT_REPORTING_MANAGER_PATH = '/reporting-manager'
  process.env.USER_MANAGEMENT_REPORTING_TIMEOUT_MS = String(timeout)

  try {
    await run()
  } finally {
    const closeServer = new Promise<void>((resolve, reject) => {
      server.close((error) => (error ? reject(error) : resolve()))
    })
    if (savedEnvironment.baseUrl === undefined) {
      delete process.env.USER_MANAGEMENT_BASE_URL
    } else {
      process.env.USER_MANAGEMENT_BASE_URL = savedEnvironment.baseUrl
    }
    if (savedEnvironment.endpointPath === undefined) {
      delete process.env.USER_MANAGEMENT_REPORTING_MANAGER_PATH
    } else {
      process.env.USER_MANAGEMENT_REPORTING_MANAGER_PATH =
        savedEnvironment.endpointPath
    }
    if (savedEnvironment.timeout === undefined) {
      delete process.env.USER_MANAGEMENT_REPORTING_TIMEOUT_MS
    } else {
      process.env.USER_MANAGEMENT_REPORTING_TIMEOUT_MS = savedEnvironment.timeout
    }
    await closeServer
  }
}

function respond(
  response: ServerResponse<IncomingMessage>,
  data: unknown,
  statusCode = 200
): void {
  response.writeHead(statusCode, { 'content-type': 'application/json' })
  response.end(JSON.stringify(data))
}

test('resolves only the authenticated employee reporting manager', async (t) => {
  await t.test('validates identity and forwards the bearer token', async () => {
    await withReportingServer((request, response) => {
      assert.equal(request.url, '/reporting-manager')
      assert.equal(request.headers.authorization, `Bearer ${bearerToken}`)
      respond(response, {
        success: true,
        data: {
          employeeId,
          employeeName: 'Employee',
          reportingManager: {
            employeeId: 201,
            employeeName: 'Manager',
            email: 'manager@example.com',
          },
        },
      })
    }, async () => {
      assert.equal(
        await getReportingManagerEmployeeId(employeeId, bearerToken),
        201
      )
    })
  })

  await t.test('returns null when the employee has no manager', async () => {
    await withReportingServer((_request, response) => {
      respond(response, {
        success: true,
        data: {
          employeeId,
          employeeName: 'Employee',
          reportingManager: null,
        },
      })
    }, async () => {
      assert.equal(
        await getReportingManagerEmployeeId(employeeId, bearerToken),
        null
      )
    })
  })

  await t.test('rejects mismatched employee identities', async () => {
    await withReportingServer((_request, response) => {
      respond(response, {
        success: true,
        data: {
          employeeId: 102,
          employeeName: 'Other Employee',
          reportingManager: null,
        },
      })
    }, async () => {
      await assert.rejects(
        getReportingManagerEmployeeId(employeeId, bearerToken),
        (error: unknown) =>
          error instanceof ReportingManagerServiceError &&
          error.statusCode === 502
      )
    })
  })

  await t.test('rejects an invalid manager reference', async () => {
    await withReportingServer((_request, response) => {
      respond(response, {
        success: true,
        data: {
          employeeId,
          employeeName: 'Employee',
          reportingManager: {
            employeeId: 0,
            employeeName: 'Invalid Manager',
            email: 'manager@example.com',
          },
        },
      })
    }, async () => {
      await assert.rejects(
        getReportingManagerEmployeeId(employeeId, bearerToken),
        (error: unknown) =>
          error instanceof ReportingManagerServiceError &&
          error.statusCode === 502
      )
    })
  })

  await t.test('surfaces reporting API authorization failures', async () => {
    await withReportingServer((_request, response) => {
      respond(response, { success: false }, 403)
    }, async () => {
      await assert.rejects(
        getReportingManagerEmployeeId(employeeId, bearerToken),
        (error: unknown) =>
          error instanceof ReportingManagerServiceError &&
          error.statusCode === 502
      )
    })
  })

  await t.test('surfaces reporting API timeouts', async () => {
    await withReportingServer((_request, _response) => {}, async () => {
      await assert.rejects(
        getReportingManagerEmployeeId(employeeId, bearerToken),
        (error: unknown) =>
          error instanceof ReportingManagerServiceError &&
          error.statusCode === 504
      )
    }, 20)
  })
})
