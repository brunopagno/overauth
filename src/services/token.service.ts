import * as jwt from "jsonwebtoken";

const ONE_DAY = 60 * 60 * 24;
const TWO_MINUTES = 60 * 2;

export function generateAccessToken(key: string, secret: string): string {
  return generateToken(key, "access", secret, TWO_MINUTES);
}

export function generateRefreshToken(key: string, secret: string) {
  return generateToken(key, "refresh", secret, ONE_DAY);
}

export function generateToken(
  key: string,
  type: "access" | "refresh",
  secret: string,
  expiresIn: number
): string {
  return jwt.sign({ type }, secret, {
    algorithm: "HS256",
    subject: key,
    expiresIn,
  });
}

/**
 * @param token
 * @param secret
 * @returns null if token is invalid, otherwise the token type
 */
export function validateToken(
  token: string,
  secret: string
): jwt.JwtPayload | null {
  try {
    return jwt.verify(token, secret) as jwt.JwtPayload;
  } catch (e) {
    return null;
  }
}
