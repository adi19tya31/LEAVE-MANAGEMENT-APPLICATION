import axios from 'axios'

export interface ApplicationAuthorization {
  employeeId: number
  keycloakId: string
  application: string
  applicationId: number | null
  hasAccess: boolean
  roles: string[]
}

export class AuthorizationServiceError extends Error {
  statusCode: number

  constructor(statusCode: number, message: string) {
    super(message)
    this.statusCode = statusCode
  }
}

export async function getLeaveApplicationAuthorization(
  keycloakSub: string,
  bearerToken: string
): Promise<ApplicationAuthorization> {
  const authorizationUrl = process.env.USER_MANAGEMENT_AUTHORIZATION_URL

  if (!authorizationUrl) {
    throw new AuthorizationServiceError(
      503,
      'User Management authorization endpoint is not configured.'
    )
  }

  try {
    const response = await axios.get(authorizationUrl, {
      headers: {
        Authorization: `Bearer ${bearerToken}`,
      },
      timeout: Number(process.env.USER_MANAGEMENT_AUTHORIZATION_TIMEOUT_MS || 5000),
      validateStatus: () => true,
    })

    if (response.status === 401) {
      throw new AuthorizationServiceError(
        401,
        'User Management rejected the Keycloak token.'
      )
    }
    if (response.status === 403) {
      throw new AuthorizationServiceError(
        403,
        'The employee does not have active Leave Management access.'
      )
    }
    if (response.status === 404) {
      throw new AuthorizationServiceError(
        404,
        'No central employee authorization record was found.'
      )
    }
    if (response.status >= 500) {
      throw new AuthorizationServiceError(
        503,
        'User Management authorization service is unavailable.'
      )
    }
    if (response.status < 200 || response.status >= 300) {
      throw new AuthorizationServiceError(
        502,
        'User Management returned an invalid authorization response.'
      )
    }

    const data = response.data?.data
    if (
      !data ||
      response.data.success !== true ||
      typeof data.employeeId !== 'number' ||
      !Number.isFinite(data.employeeId) ||
      typeof data.keycloakId !== 'string' ||
      typeof data.application !== 'string' ||
      typeof data.hasAccess !== 'boolean'
    ) {
      throw new AuthorizationServiceError(
        502,
        'User Management returned an invalid authorization response.'
      )
    }

    if (data.keycloakId !== keycloakSub) {
      throw new AuthorizationServiceError(
        403,
        'The central employee identity does not match the verified Keycloak identity.'
      )
    }

    const configuredApplicationName =
      process.env.USER_MANAGEMENT_LEAVE_APPLICATION_NAME || 'Leave Management'
    if (
      data.application.trim().toLowerCase() !==
      configuredApplicationName.trim().toLowerCase()
    ) {
      throw new AuthorizationServiceError(
        403,
        'The authorization response is not for Leave Management.'
      )
    }
    if (data.hasAccess !== true) {
      throw new AuthorizationServiceError(
        403,
        'The employee does not have active Leave Management access.'
      )
    }

    if (!Array.isArray(data.roles)) {
      throw new AuthorizationServiceError(
        403,
        'No valid Leave application roles are assigned.'
      )
    }

    const validRoles = new Set(['employee', 'manager', 'owner'])
    const rawRoles: unknown[] = data.roles
    const roles: string[] = [
      ...new Set(
        rawRoles
          .filter((role): role is string => typeof role === 'string')
          .map((role) => role.trim().toLowerCase())
      ),
    ]

    if (
      roles.length === 0 ||
      roles.some((role) => !validRoles.has(role))
    ) {
      throw new AuthorizationServiceError(
        403,
        'No valid Leave application roles are assigned.'
      )
    }

    const applicationId =
      typeof data.applicationId === 'number'
        ? data.applicationId
        : process.env.USER_MANAGEMENT_LEAVE_APPLICATION_ID
          ? Number(process.env.USER_MANAGEMENT_LEAVE_APPLICATION_ID)
          : null

    return {
      employeeId: data.employeeId,
      keycloakId: data.keycloakId,
      application: data.application,
      applicationId:
        applicationId !== null && Number.isFinite(applicationId)
          ? applicationId
          : null,
      hasAccess: data.hasAccess,
      roles,
    }
  } catch (error) {
    if (error instanceof AuthorizationServiceError) {
      throw error
    }

    throw new AuthorizationServiceError(
      503,
      'User Management authorization service is unavailable.'
    )
  }
}
