import { Request, Response, NextFunction } from 'express'
import {
  createRemoteJWKSet,
  jwtVerify,
  JWTPayload
} from 'jose'

import { AuthPayload } from '../types'

import {
  AuthorizationServiceError,
  getLeaveApplicationAuthorization
} from '../services/userManagementAuthorizationService'
import {
  getReportingManagerEmployeeId,
  ReportingManagerServiceError
} from '../services/userManagementReportingService'

// Keycloak configuration
const KEYCLOAK_URL = process.env.KEYCLOAK_URL!
const KEYCLOAK_REALM = process.env.KEYCLOAK_REALM!
const KEYCLOAK_CLIENT_ID = process.env.KEYCLOAK_CLIENT_ID!

const NORMALIZED_KEYCLOAK_URL = KEYCLOAK_URL.replace(/\/+$/, '')

const KEYCLOAK_ISSUER =
  `${NORMALIZED_KEYCLOAK_URL}/realms/${KEYCLOAK_REALM}`

const KEYCLOAK_JWKS_URL =
  `${KEYCLOAK_ISSUER}/protocol/openid-connect/certs`

const KEYCLOAK_JWKS =
  createRemoteJWKSet(new URL(KEYCLOAK_JWKS_URL))

interface KeycloakToken extends JWTPayload {
  email?: string
  preferred_username?: string
  name?: string
  azp?: string

  realm_access?: {
    roles?: string[]
  }

  resource_access?: {
    [clientId: string]: {
      roles?: string[]
    }
  }
}

// Authentication middleware
export async function requireAuth(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {

  const header = req.headers.authorization

  if (!header || !header.startsWith('Bearer ')) {
    res.status(401).json({
      error: 'Missing or malformed Authorization header.'
    })
    return
  }

  const token = header.substring(7)

  try {

    // 1. Verify Keycloak token
    const { payload } = await jwtVerify<KeycloakToken>(
      token,
      KEYCLOAK_JWKS,
      {
        issuer: KEYCLOAK_ISSUER,
        algorithms: ['RS256']
      }
    )

    // 2. Validate authorized client
    if (payload.azp !== KEYCLOAK_CLIENT_ID) {
      res.status(401).json({
        error: 'Token was not issued for this application.'
      })
      return
    }

    // 3. Extract verified Keycloak identity
    if (typeof payload.sub !== 'string' || !payload.sub.trim()) {
      res.status(401).json({
        error: 'Keycloak subject is missing.'
      })
      return
    }

    const keycloakId = payload.sub

    // 4. Get central authorization from User Management
    const authorization =
      await getLeaveApplicationAuthorization(keycloakId, token)

    // 5. Verify central identity
    if (authorization.keycloakId !== keycloakId) {
      res.status(403).json({
        error: 'Keycloak identity does not match central employee identity.'
      })
      return
    }

    if (!authorization.hasAccess) {
      res.status(403).json({
        error: 'Leave Management access is not granted.'
      })
      return
    }

    // 6. Validate central application roles
    const validRoles = ['employee', 'manager', 'owner']

    const applicationRoles = [
      ...new Set(
        authorization.roles.map(role => role.trim().toLowerCase())
      )
    ]

    if (
      applicationRoles.length === 0 ||
      applicationRoles.some(role => !validRoles.includes(role))
    ) {
      res.status(403).json({
        error: 'No valid Leave Management roles assigned.'
      })
      return
    }

    // 7. Determine primary role for backward compatibility
    const applicationRole =
      applicationRoles.includes('owner')
        ? 'owner'
        : applicationRoles.includes('manager')
          ? 'manager'
          : 'employee'

    const reportingManagerEmployeeId =
      await getReportingManagerEmployeeId(authorization.employeeId, token)

    // 8. Create authentication payload from central data
    const authPayload: AuthPayload = {
      id: authorization.employeeId,

      centralEmployeeId: authorization.employeeId,

      keycloakId,

      name:
        payload.name ||
        payload.preferred_username ||
        'User',

      role: applicationRole,

      applicationRoles,

      applicationId: authorization.applicationId,

      reportingManagerEmployeeId,
    }

    // 9. Attach authenticated user
    req.user = authPayload
    req.leaveManagementAccessGranted = authorization.hasAccess

    next()

  } catch (error) {

    if (error instanceof AuthorizationServiceError) {
      res.status(error.statusCode).json({
        error: error.message
      })
      return
    }

    if (error instanceof ReportingManagerServiceError) {
      res.status(error.statusCode).json({
        error: error.message
      })
      return
    }

    console.error('Authentication failed:', error)

    res.status(401).json({
      error: 'Invalid or expired Keycloak token.'
    })
  }
}

// Central application role authorization
export function requireRole(...allowedRoles: string[]) {

  return (
    req: Request,
    res: Response,
    next: NextFunction
  ): void => {

    const applicationRoles =
      req.user?.applicationRoles || []

    const authorized = applicationRoles.some(role =>
      allowedRoles.includes(role)
    )

    if (!authorized) {
      res.status(403).json({
        error:
          `This action requires one of these roles: ${allowedRoles.join(', ')}.`
      })
      return
    }

    next()
  }
}