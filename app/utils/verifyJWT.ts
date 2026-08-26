import { NextRequest } from "next/server";
import jwt, { JwtPayload } from "jsonwebtoken";

export interface AuthTokenPayload extends JwtPayload {
  sub: string;
  email: string;
  name: string;
  roles: string[];
}

function isAuthTokenPayload(payload: string | JwtPayload): payload is AuthTokenPayload {
  return (
    typeof payload !== "string" &&
    typeof payload.sub === "string" &&
    typeof payload.email === "string" &&
    typeof payload.name === "string" &&
    Array.isArray(payload.roles) &&
    payload.roles.every((role) => typeof role === "string")
  );
}

export function verifyJWT(req: NextRequest): AuthTokenPayload | null {
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    throw new Error("JWT_SECRET is not defined");
  }

  const token = req.cookies.get("token")?.value;

  if (!token) {
    return null;
  }

  try {
    const payload = jwt.verify(token, secret, { algorithms: ["HS256"] });
    return isAuthTokenPayload(payload) ? payload : null;
  } catch {
    return null;
  }
}