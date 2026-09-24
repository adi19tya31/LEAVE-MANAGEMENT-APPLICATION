import { Request, Response, NextFunction } from "express";
import {
  createRemoteJWKSet,
  jwtVerify,
  JWTPayload,
} from "jose";

import employeeModel from "../models/employeeModel";
import { AuthPayload } from "../types";

const KEYCLOAK_URL = process.env.KEYCLOAK_URL!;
const KEYCLOAK_REALM = process.env.KEYCLOAK_REALM!;
const KEYCLOAK_CLIENT_ID =
  process.env.KEYCLOAK_CLIENT_ID!;

const KEYCLOAK_ISSUER =
  `${KEYCLOAK_URL}/realms/${KEYCLOAK_REALM}`;

const KEYCLOAK_JWKS = createRemoteJWKSet(
  new URL(
    `${KEYCLOAK_ISSUER}/protocol/openid-connect/certs`
  )
);

interface KeycloakToken extends JWTPayload {
  email?: string;
  preferred_username?: string;
  name?: string;
  azp?: string;

  realm_access?: {
    roles?: string[];
  };

  resource_access?: {
    [clientId: string]: {
      roles?: string[];
    };
  };
}

export async function requireAuth(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {

  const header =
    req.headers.authorization;

  // ------------------------------------
  // Check Authorization header
  // ------------------------------------

  if (
    !header ||
    !header.startsWith("Bearer ")
  ) {
    res.status(401).json({
      error:
        "Missing or malformed Authorization header.",
    });

    return;
  }

  const token =
    header.substring(7);

  try {

    // ------------------------------------
    // Verify Keycloak JWT
    // ------------------------------------

    const { payload } =
      await jwtVerify<KeycloakToken>(
        token,
        KEYCLOAK_JWKS,
        {
          issuer: KEYCLOAK_ISSUER,
          algorithms: ["RS256"],
        }
      );

    // ------------------------------------
    // Verify application/client
    // ------------------------------------

    if (
      payload.azp !== KEYCLOAK_CLIENT_ID
    ) {
      res.status(401).json({
        error:
          "Token was not issued for this application.",
      });

      return;
    }

    // ------------------------------------
    // Get email from Keycloak
    // ------------------------------------

    const email =
      payload.email ||
      payload.preferred_username;

    if (!email) {
      res.status(401).json({
        error:
          "Keycloak token does not contain an email.",
      });

      return;
    }

    // console.log(
    //   "Authenticated Keycloak email:",
    //   email
    // );

    // ------------------------------------
    // IMPORTANT:
    // Keycloak roles are NOT used for
    // application authorization.
    //
    // MySQL is the source of truth for
    // employee / manager / owner.
    // ------------------------------------

    // ------------------------------------
    // Find employee in MySQL
    // ------------------------------------

    const employee =
      await employeeModel.findAuthUserByEmail(
        email
      );

    if (!employee) {
      res.status(403).json({
        error:
          "Authenticated Keycloak user is not registered as an employee.",
      });

      return;
    }

    // ------------------------------------
    // Check employee status
    // ------------------------------------

    if (
      employee.status !== "active"
    ) {
      res.status(403).json({
        error:
          "Employee account is not active.",
      });

      return;
    }

    // ------------------------------------
    // Get application role from MySQL
    // ------------------------------------

    const roleId =
      Number(employee.role_id);

    const applicationRole =
      employee.role_name;

    // ------------------------------------
    // Validate database role
    // ------------------------------------

    const validRoles = [
      "employee",
      "manager",
      "owner",
    ];

    if (
      !validRoles.includes(
        applicationRole
      )
    ) {
      res.status(403).json({
        error:
          "Invalid application role configured for this employee.",
      });

      return;
    }

    if (
      ![1, 2, 3].includes(roleId)
    ) {
      res.status(403).json({
        error:
          "Invalid application role ID configured for this employee.",
      });

      return;
    }

    // ------------------------------------
    // Create existing application
    // authentication payload
    // ------------------------------------

    const authPayload: AuthPayload = {
      id: Number(employee.Emp_id),

      roleId: roleId,

      role: applicationRole,

      name: employee.name,
    };

    // ------------------------------------
    // Attach user to request
    // ------------------------------------

    req.user =
      authPayload;

    // console.log(
    //   "Authenticated application user:",
    //   authPayload
    // );

    // ------------------------------------
    // Continue request
    // ------------------------------------

    next();

  } catch (error) {

    console.error(
      "Keycloak authentication failed:",
      error
    );

    res.status(401).json({
      error:
        "Invalid or expired Keycloak token.",
    });

    return;
  }
}


// ========================================
// ROLE AUTHORIZATION
// ========================================

export function requireRole(
  ...allowedRoles: string[]
) {

  return (
    req: Request,
    res: Response,
    next: NextFunction
  ): void => {

    const role =
      req.user?.role;

    if (
      !role ||
      !allowedRoles.includes(role)
    ) {

      res.status(403).json({
        error:
          `This action requires one of these roles: ` +
          `${allowedRoles.join(", ")}.`,
      });

      return;
    }

    next();
  };
}