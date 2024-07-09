import { describe, expect, test, beforeAll, vi } from "vitest";
import {
  generateToken,
  generateAccessToken,
  generateRefreshToken,
  validateToken,
} from "../../src/services/token.service";
import * as crypto from "node:crypto";
import * as jwt from "jsonwebtoken";

describe("generateToken", () => {
  let key: string;
  let secret: string;
  const type = "access";
  const expiresIn = 60;
  let token: string;

  beforeAll(() => {
    key = crypto.randomBytes(20).toString("hex");
    secret = crypto.randomBytes(20).toString("hex");
    token = generateToken(key, type, secret, expiresIn);
  });

  test("generates token with the given parameters", () => {
    const decoded = jwt.decode(token) as jwt.JwtPayload;

    expect(decoded.sub).toEqual(key);
    expect(decoded.type).toEqual(type);
    expect(decoded.exp).toBeGreaterThan(Date.now() / 1000);
  });

  test("it's possible to verify with the secret", () => {
    expect(jwt.verify(token, secret)).toBeTruthy();
  });

  test("it fails to verify in case of different secret", () => {
    expect(() => jwt.verify(token, "different secret")).toThrowError(
      "invalid signature"
    );
  });
});

describe("accessToken", () => {
  let key: string;
  let secret: string;
  let token: string;

  beforeAll(() => {
    key = crypto.randomBytes(20).toString("hex");
    secret = crypto.randomBytes(20).toString("hex");
    token = generateAccessToken(key, secret);
  });

  test("generates an access token", () => {
    const decoded = jwt.decode(token) as jwt.JwtPayload;

    expect(decoded.sub).toEqual(key);
    expect(decoded.type).toEqual("access");
    expect(decoded.exp).toBeGreaterThan(Date.now() / 1000);
    expect(decoded.exp).toBeLessThan(Date.now() / 1000 + 60 * 2);
  });
});

describe("refreshToken", () => {
  let key: string;
  let secret: string;
  let token: string;

  beforeAll(() => {
    key = crypto.randomBytes(20).toString("hex");
    secret = crypto.randomBytes(20).toString("hex");
    token = generateRefreshToken(key, secret);
  });

  test("generates an access token", () => {
    const decoded = jwt.decode(token) as jwt.JwtPayload;

    expect(decoded.sub).toEqual(key);
    expect(decoded.type).toEqual("refresh");
    expect(decoded.exp).toBeGreaterThan(Date.now() / 1000);
    expect(decoded.exp).toBeLessThan(Date.now() / 1000 + 60 * 60 * 24);
  });
});

describe("validate token", () => {
  test("returns null for invalid token", () => {
    const token = validateToken("invalid", "secret");
    expect(token).toBeNull();
  });

  test("returns null for wrong secret", () => {
    const validToken = generateToken("1234", "access", "secret", 10);
    const token = validateToken(validToken, "wrong secret");
    expect(token).toBeNull();
  });

  test("returns null for expired token", () => {
    const validToken = generateToken("1234", "access", "secret", 10);

    vi.setSystemTime(Date.now() + 60 * 1000);

    const token = validateToken(validToken, "secret");
    expect(token).toBeNull();

    vi.useRealTimers();
  });

  test("returns the token payload when successful", () => {
    const validToken = generateToken("1234", "access", "secret", 60);
    const token = validateToken(validToken, "secret")!;
    expect(token.sub).toEqual("1234");
    expect(token.type).toEqual("access");
  });
});
