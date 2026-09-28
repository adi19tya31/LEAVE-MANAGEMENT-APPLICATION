import { Request, Response, NextFunction } from "express";
import { createRemoteJWKSet, jwtVerify, JWTPayload } from "jose";

import employeeModel from "../models/employeeModel";
import { AuthPayload } from "../types";

// ======================================================
// TEMPORARY TLS CONFIGURATION
// ======================================================
//
// Your Keycloak server:
//
// https://bookstack.insightirs.com/keycloak
//
// Node.js is currently returning:
//
// UNABLE_TO_VERIFY_LEAF_SIGNATURE
//
// This disables TLS certificate verification for the
// Node.js process.
//
// You have confirmed that you are okay with this for
// your current internal/development environment.
//
// IMPORTANT:
// Do NOT use this in production.
// The production solution is to install/trust the
// correct CA certificate chain.
// ======================================================

process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

// ======================================================
// KEYCLOAK CONFIGURATION
// ======================================================

const KEYCLOAK_URL = process.env.KEYCLOAK_URL!;

const KEYCLOAK_REALM = process.env.KEYCLOAK_REALM!;

const KEYCLOAK_CLIENT_ID = process.env.KEYCLOAK_CLIENT_ID!;

// Remove trailing slash from Keycloak URL
//
// Example:
//
// https://bookstack.insightirs.com/keycloak/
// becomes:
//
// https://bookstack.insightirs.com/keycloak

const NORMALIZED_KEYCLOAK_URL = KEYCLOAK_URL.replace(/\/+$/, "");

// ======================================================
// KEYCLOAK ISSUER
// ======================================================

const KEYCLOAK_ISSUER = `${NORMALIZED_KEYCLOAK_URL}/realms/${KEYCLOAK_REALM}`;

// ======================================================
// KEYCLOAK JWKS URL
// ======================================================
//
// Keycloak exposes its public signing keys at:
//
// /protocol/openid-connect/certs
//
// Final URL:
//
// https://bookstack.insightirs.com/keycloak/
// realms/<realm>/protocol/openid-connect/certs
// ======================================================

const KEYCLOAK_JWKS_URL = `${KEYCLOAK_ISSUER}/protocol/openid-connect/certs`;

console.log("Keycloak URL:", NORMALIZED_KEYCLOAK_URL);

console.log("Keycloak Realm:", KEYCLOAK_REALM);

console.log("Keycloak Issuer:", KEYCLOAK_ISSUER);

console.log("Keycloak JWKS:", KEYCLOAK_JWKS_URL);

// ======================================================
// KEYCLOAK JWKS
// ======================================================
//
// jose will automatically fetch the Keycloak public
// keys when jwtVerify() needs them.
//
// Because NODE_TLS_REJECT_UNAUTHORIZED=0 is set above,
// Node will accept the current certificate chain.
// ======================================================

const KEYCLOAK_JWKS = createRemoteJWKSet(new URL(KEYCLOAK_JWKS_URL));

// ======================================================
// KEYCLOAK TOKEN TYPE
// ======================================================

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

// ======================================================
// AUTHENTICATION MIDDLEWARE
// ======================================================

export async function requireAuth(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  // ====================================================
  // CHECK AUTHORIZATION HEADER
  // ====================================================

  const header = req.headers.authorization;

  if (!header || !header.startsWith("Bearer ")) {
    res.status(401).json({
      error: "Missing or malformed Authorization header.",
    });

    return;
  }

  // ====================================================
  // EXTRACT JWT
  // ====================================================

  const token = header.substring(7);

  try {
    // ==================================================
    // VERIFY KEYCLOAK JWT
    // ==================================================

    const { payload } = await jwtVerify<KeycloakToken>(token, KEYCLOAK_JWKS, {
      issuer: KEYCLOAK_ISSUER,

      algorithms: ["RS256"],
    });

    // ==================================================
    // VERIFY CLIENT
    // ==================================================

    if (payload.azp !== KEYCLOAK_CLIENT_ID) {
      res.status(401).json({
        error: "Token was not issued for this application.",
      });

      return;
    }

    // ==================================================
    // GET EMAIL FROM KEYCLOAK
    // ==================================================

    const email = payload.email || payload.preferred_username;

    if (!email) {
      res.status(401).json({
        error: "Keycloak token does not contain an email.",
      });

      return;
    }

    // ==================================================
    // FIND EMPLOYEE IN MYSQL
    // ==================================================

    const employee = await employeeModel.findAuthUserByEmail(email);

    if (!employee) {
      res.status(403).json({
        error: "Authenticated Keycloak user is not registered as an employee.",
      });

      return;
    }

    // ==================================================
    // CHECK EMPLOYEE STATUS
    // ==================================================

    if (employee.status !== "active") {
      res.status(403).json({
        error: "Employee account is not active.",
      });

      return;
    }

    // ==================================================
    // GET APPLICATION ROLE FROM MYSQL
    // ==================================================

    const roleId = Number(employee.role_id);

    const applicationRole = employee.role_name;

    // ==================================================
    // VALID APPLICATION ROLES
    // ==================================================

    const validRoles = ["employee", "manager", "owner"];

    if (!validRoles.includes(applicationRole)) {
      res.status(403).json({
        error: "Invalid application role configured for this employee.",
      });

      return;
    }

    // ==================================================
    // VALID ROLE IDs
    // ==================================================

    if (![1, 2, 3].includes(roleId)) {
      res.status(403).json({
        error: "Invalid application role ID configured for this employee.",
      });

      return;
    }

    // ==================================================
    // CREATE APPLICATION AUTH PAYLOAD
    // ==================================================

    const authPayload: AuthPayload = {
      id: Number(employee.Emp_id),

      roleId: roleId,

      role: applicationRole,

      name: employee.name,
    };

    // ==================================================
    // ATTACH USER TO EXPRESS REQUEST
    // ==================================================

    req.user = authPayload;

    // ==================================================
    // CONTINUE REQUEST
    // ==================================================

    next();
  } catch (error) {
    // ==================================================
    // KEYCLOAK AUTHENTICATION ERROR
    // ==================================================

    console.error("Keycloak authentication failed:", error);

    res.status(401).json({
      error: "Invalid or expired Keycloak token.",
    });

    return;
  }
}

// ======================================================
// ROLE AUTHORIZATION
// ======================================================

export function requireRole(...allowedRoles: string[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    // ==================================================
    // GET APPLICATION ROLE
    // ==================================================

    const role = req.user?.role;

    // ==================================================
    // CHECK ROLE
    // ==================================================

    if (!role || !allowedRoles.includes(role)) {
      res.status(403).json({
        error:
          `This action requires one of these roles: ` +
          `${allowedRoles.join(", ")}.`,
      });

      return;
    }

    // ==================================================
    // CONTINUE REQUEST
    // ==================================================

    next();
  };
}
