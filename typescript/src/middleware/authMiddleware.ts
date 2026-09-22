import { Request, Response, NextFunction } from "express";
import { createRemoteJWKSet, jwtVerify, JWTPayload } from "jose";

import employeeModel from "../models/employeeModel";
import { AuthPayload } from "../types";

const KEYCLOAK_URL = process.env.KEYCLOAK_URL!;
const KEYCLOAK_REALM = process.env.KEYCLOAK_REALM!;
const KEYCLOAK_CLIENT_ID = process.env.KEYCLOAK_CLIENT_ID!;

const KEYCLOAK_ISSUER = `${KEYCLOAK_URL}/realms/${KEYCLOAK_REALM}`;
// console.log("Keycloak Issuer URL:", KEYCLOAK_ISSUER);

const KEYCLOAK_JWKS = createRemoteJWKSet(
  new URL(`${KEYCLOAK_ISSUER}/protocol/openid-connect/certs`),
);

interface KeycloakToken extends JWTPayload {
  email?: string;
  preferred_username?: string;
  name?: string;
  azp?: string;
}

export async function requireAuth(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  const header = req.headers.authorization;

  if (!header || !header.startsWith("Bearer ")) {
    res.status(401).json({
      error: "Missing or malformed Authorization header.",
    });
    return;
  }

  const token = header.substring(7);

  try {
    console.log("========== KEYCLOAK AUTH ==========");
    console.log("Token received:", token.substring(0, 30) + "...");

    const { payload } = await jwtVerify<KeycloakToken>(token, KEYCLOAK_JWKS, {
      issuer: KEYCLOAK_ISSUER,
      algorithms: ["RS256"],
    });

    console.log("Keycloak token verified");
    console.log("Issuer:", payload.iss);
    console.log("Audience:", payload.aud);
    console.log("AZP:", payload.azp);
    console.log("Email:", payload.email);

    const audience = Array.isArray(payload.aud)
      ? payload.aud
      : payload.aud
        ? [payload.aud]
        : [];

    if (
      payload.azp !== KEYCLOAK_CLIENT_ID &&
      !audience.includes(KEYCLOAK_CLIENT_ID)
    ) {
      console.log(
        "AZP mismatch:",
        payload.azp,
        "expected:",
        KEYCLOAK_CLIENT_ID,
      );

      res.status(401).json({
        error: "Token was not issued for this application.",
      });

      return;
    }

    const email = payload.email || payload.preferred_username;

    if (!email) {
      res.status(401).json({
        error: "Keycloak token does not contain an email.",
      });

      return;
    }

    console.log("Searching employee:", email);

    const employee = await employeeModel.findAuthUserByEmail(email);

    if (!employee) {
      console.log("Employee not found in database:", email);

      res.status(403).json({
        error: "Authenticated Keycloak user is not registered as an employee.",
      });

      return;
    }

    if (employee.status !== "active") {
      res.status(403).json({
        error: "Employee account is not active.",
      });

      return;
    }

    const authPayload: AuthPayload = {
      id: Number(employee.Emp_id),
      roleId: Number(employee.role_id),
      role: employee.role_name,
      name: employee.name,
    };

    req.user = authPayload;

    console.log("Application user:", authPayload);
    console.log("==================================");

    next();
  } catch (error) {
    console.error("========== KEYCLOAK AUTH ERROR ==========");

    console.error(error);

    console.error("=========================================");

    res.status(401).json({
      error: "Invalid or expired Keycloak token.",
    });

    return;
  }
}

export function requireRole(...allowedRoles: string[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const role = req.user?.role;

    if (!role || !allowedRoles.includes(role)) {
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
