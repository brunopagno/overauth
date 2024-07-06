import { describe, expect, test } from "vitest";
import {
  hashPassword,
  validatePassword,
} from "../../src/services/password.service";

describe("hashPassword", () => {
  test("returns a hashed password", async () => {
    const password = "password";
    const hashedPassword = await hashPassword(password);

    expect(hashedPassword).not.toEqual(password);
  });
});

describe("validatePasword", () => {
  test("returns true when password matches hash", async () => {
    const password = "password";
    const hashedPassword = await hashPassword(password);

    const isValid = await validatePassword(hashedPassword, password);

    expect(isValid).toBe(true);
  });

  test("returns false when password does not match hash", async () => {
    const password = "password";
    const hashedPassword = await hashPassword(password);

    const isValid = await validatePassword(hashedPassword, "notpassword");

    expect(isValid).toBe(false);
  });
});
