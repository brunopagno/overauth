import * as jwt from "jsonwebtoken";

export function generateAccessToken(key: string, secret: string): string {
  return generateToken(
    key,
    "access",
    secret,
    60 * 2, // two minutes
  );
}

export function generateRefreshToken(key: string, secret: string) {
  return generateToken(
    key,
    "refresh",
    secret,
    60 * 60 * 24, // one day
  );
}

export function generateToken(
  key: string,
  type: "access" | "refresh",
  secret: string,
  expiresIn: number,
): string {
  return jwt.sign({ type }, secret, {
    algorithm: "HS256",
    subject: key,
    expiresIn,
  });
}
