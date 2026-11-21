import axios from 'axios'

interface ReportingManagerResponse {
  success: boolean
  data?: {
    employeeId?: unknown
    employeeName?: unknown
    reportingManager?: unknown
  }
}

interface ReportingManagerDetails {
  employeeId: number
  employeeName: string
  email: string
}

export class ReportingManagerServiceError extends Error {
  constructor(
    readonly statusCode: number,
    message: string
  ) {
    super(message)
    this.name = 'ReportingManagerServiceError'
  }
}

function getReportingManagerUrl(): string {
  const configuredBaseUrl = process.env.USER_MANAGEMENT_BASE_URL
  const authorizationUrl = process.env.USER_MANAGEMENT_AUTHORIZATION_URL
  let baseUrl = configuredBaseUrl
  const endpointPath =
    process.env.USER_MANAGEMENT_REPORTING_MANAGER_PATH ||
    '/api/employee/me/reporting-manager'

  if (!baseUrl && authorizationUrl) {
    try {
      baseUrl = new URL(authorizationUrl).origin
    } catch {
      throw new ReportingManagerServiceError(
        500,
        'User Management authorization endpoint configuration is invalid.'
      )
    }
  }

  if (!baseUrl) {
    throw new ReportingManagerServiceError(
      503,
      'User Management reporting endpoint is not configured.'
    )
  }

  try {
    const parsedBaseUrl = new URL(baseUrl)
    const parsedEndpointUrl = new URL(endpointPath, parsedBaseUrl)
    if (
      !['http:', 'https:'].includes(parsedBaseUrl.protocol) ||
      parsedBaseUrl.username !== '' ||
      parsedBaseUrl.password !== '' ||
      parsedEndpointUrl.origin !== parsedBaseUrl.origin
    ) {
      throw new Error('Invalid reporting endpoint configuration.')
    }
    return parsedEndpointUrl.toString()
  } catch {
    throw new ReportingManagerServiceError(
      500,
      'User Management reporting endpoint configuration is invalid.'
    )
  }
}

function isReportingManagerDetails(
  value: unknown
): value is ReportingManagerDetails {
  if (!value || typeof value !== 'object') return false
  const manager = value as Record<string, unknown>
  return (
    Number.isSafeInteger(manager.employeeId) &&
    Number(manager.employeeId) > 0 &&
    typeof manager.employeeName === 'string' &&
    typeof manager.email === 'string'
  )
}

export async function getReportingManagerEmployeeId(
  employeeId: number,
  bearerToken: string
): Promise<number | null> {
  const timeout = Number(
    process.env.USER_MANAGEMENT_REPORTING_TIMEOUT_MS || 5000
  )
  if (!Number.isSafeInteger(timeout) || timeout <= 0) {
    throw new ReportingManagerServiceError(
      500,
      'User Management reporting timeout configuration is invalid.'
    )
  }

  let response
  try {
    response = await axios.get<ReportingManagerResponse>(
      getReportingManagerUrl(),
      {
        headers: { Authorization: `Bearer ${bearerToken}` },
        timeout,
        validateStatus: () => true,
      }
    )
  } catch (error) {
    if (
      axios.isAxiosError(error) &&
      (error.code === 'ECONNABORTED' || error.code === 'ETIMEDOUT')
    ) {
      throw new ReportingManagerServiceError(
        504,
        'User Management reporting request timed out.'
      )
    }
    throw new ReportingManagerServiceError(
      503,
      'User Management reporting service is unavailable.'
    )
  }

  if (response.status < 200 || response.status >= 300) {
    if (response.status >= 500) {
      throw new ReportingManagerServiceError(
        503,
        'User Management reporting service is unavailable.'
      )
    }
    throw new ReportingManagerServiceError(
      502,
      'User Management rejected the reporting-manager request.'
    )
  }

  const { success, data } = response.data ?? {}
  if (
    success !== true ||
    !data ||
    data.employeeId !== employeeId ||
    typeof data.employeeName !== 'string' ||
    !Object.prototype.hasOwnProperty.call(data, 'reportingManager')
  ) {
    throw new ReportingManagerServiceError(
      502,
      'User Management returned an invalid reporting-manager response.'
    )
  }

  if (data.reportingManager === null) return null
  if (
    !isReportingManagerDetails(data.reportingManager) ||
    data.reportingManager.employeeId === employeeId
  ) {
    throw new ReportingManagerServiceError(
      502,
      'User Management returned an invalid reporting-manager response.'
    )
  }

  return data.reportingManager.employeeId
}
