import { describe, test, expect, beforeAll, afterEach } from "vitest";
import { app } from "../../src/server.js";
import request from "supertest";
import type { Response } from "supertest";
import { Session, User } from "@prisma/client";
import { prisma } from "../../src/db-client.js";
import * as argon from "argon2";
import * as jwt from "jsonwebtoken";

describe("/register", () => {
  afterEach(async () => {
    await prisma.session.deleteMany();
    await prisma.user.deleteMany();
  });

  describe("password check", () => {
    test("returns error when the password is empty", async () => {
      const response = await request(app)
        .post("/register")
        .send({ username: "darkshadow666" });
      expect(response.status).toBe(422);
    });

    test("returns error when the password and passwordConfirmation do not match", async () => {
      const response = await request(app).post("/register").send({
        username: "darkshadow666",
        password: "password",
        passwordConfirmation: "password1",
      });
      expect(response.status).toBe(422);
    });
  });

  describe("username check", () => {
    test("returns error when the username is not present", async () => {
      const response = await request(app)
        .post("/register")
        .send({ password: "password", passwordConfirmation: "password" });
      expect(response.status).toBe(422);
    });

    test("returns error when the username is already taken", async () => {
      await prisma.user.create({
        data: {
          name: "darKshadoW666",
          username: "darkshadow666",
          passwordHash: "invalidpasswordhash",
        },
      });
      const response = await request(app).post("/register").send({
        username: "darkshadow666",
        password: "password",
        passwordConfirmation: "password",
      });
      expect(response.status).toBe(422);
    });
  });

  describe("successful user creation", () => {
    let user: User | null;
    beforeAll(async () => {
      await request(app).post("/register").send({
        username: "redDragon91",
        password: "password",
        passwordConfirmation: "password",
      });

      user = await prisma.user.findFirst({
        where: { username: "redDragon91" },
      });
    });

    test("creates a new user record", () => {
      expect(user).not.toBeNull();
    });

    test("the password is not in plain text", () => {
      expect(user?.passwordHash).not.toEqual("password");
    });

    test("the password is hashed", async () => {
      const hash = user?.passwordHash || "";
      expect(await argon.verify(hash, "password")).toBe(true);
    });
  });

  describe("successful session creation", () => {
    let sessions: Session[];
    beforeAll(async () => {
      await request(app).post("/register").send({
        username: "sadgelord_",
        password: "password",
        passwordConfirmation: "password",
      });
      sessions =
        (await prisma.user
          .findFirst({
            where: { username: "sadgelord_" },
          })
          .sessions()) || [];
    });

    test("creates a new session associated to the user", () => {
      expect(sessions.length).toBe(1);
    });
  });

  describe("successful response", () => {
    let response: Response;
    beforeAll(async () => {
      response = await request(app).post("/register").send({
        username: "evildruid",
        password: "password",
        passwordConfirmation: "password",
      });
    });

    test("returns a pair of tokens", () => {
      expect(response.body).toHaveProperty("access");
      expect(response.body).toHaveProperty("refresh");
    });

    test("one access token and one refresh token", () => {
      const access = response.body.access;
      const decodedAccess = jwt.decode(access) as jwt.JwtPayload;
      const accessTokenType = decodedAccess["type"];
      expect(accessTokenType).toEqual("access");

      const refresh = response.body.refresh;
      const decodedRefresh = jwt.decode(refresh) as jwt.JwtPayload;
      const refreshTokenType = decodedRefresh["type"];
      expect(refreshTokenType).toEqual("refresh");
    });
  });
});
