import { describe, test, expect, afterEach } from "vitest";
import {
  createSession,
  destroySession,
} from "../../src/services/session.service";
import request from "supertest";
import { authenticate } from "../../src/middlewares/authenticated.middleware.ts";
import { generateAccessToken } from "../../src/services/token.service";
import { prisma } from "../../src/db-client";
import express from "express";
import * as jwt from "jsonwebtoken";

describe("session service", () => {
  afterEach(async () => {
    await prisma.session.deleteMany();
    await prisma.user.deleteMany();
  });

  describe("createSession", () => {
    test("creates a new session record and return a pair of valid tokens", async () => {
      const user = await prisma.user.create({
        data: {
          name: "Joaozinho",
          username: "goatgoat",
          passwordHash: "hashedpassword",
        },
      });

      const tokens = await createSession(user);

      const access = jwt.verify(tokens.accessToken, "secret") as jwt.JwtPayload;
      const refresh = jwt.verify(
        tokens.refreshToken,
        "secret"
      ) as jwt.JwtPayload;

      expect(await prisma.session.count()).toBe(1);
      expect(access.type).toEqual("access");
      expect(refresh.type).toEqual("refresh");
      expect(access.sub).toEqual(refresh.sub);
    });
  });

  describe("destroySession", () => {
    test("removes the session record", async () => {
      const session = await prisma.session.create({
        data: {
          key: "asdf",
          user: {
            create: {
              name: "Jorge",
              username: "evilmaster666",
              passwordHash: "notreallyahash",
            },
          },
        },
      });

      await destroySession(session);

      expect(await prisma.session.count()).toBe(0);
    });

    test("does not authenticate tokens using that session", async () => {
      const session = await prisma.session.create({
        data: {
          key: "qwer",
          user: {
            create: {
              name: "Alice",
              username: "aliceinwonderland",
              passwordHash: "notreallyahash",
            },
          },
        },
      });
      const token = generateAccessToken("qwer", "secret");

      const app = express();
      app.use(authenticate);
      app.get("/", (_, res) => res.send(200));

      await request(app)
        .get("/")
        .set("Authorization", `Bearer ${token}`)
        .expect(200);

      await destroySession(session);

      await request(app)
        .get("/")
        .set("Authorization", `Bearer ${token}`)
        .expect(401);
    });
  });
});
