import { describe, expect, test, beforeAll } from "vitest";
import {
  generateToken,
  generateAccessToken,
  generateRefreshToken,
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
      "invalid signature",
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
