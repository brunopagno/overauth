import { describe, test, expect, afterEach } from "vitest";
import request from "supertest";
import { prisma } from "../../src/db-client.js";
import {
  generateAccessToken,
  generateRefreshToken,
} from "../../src/services/token.service.js";
import { app } from "../../src/server.js";
import * as jwt from "jsonwebtoken";

describe("refresh", () => {
  afterEach(async () => {
    await prisma.session.deleteMany();
    await prisma.user.deleteMany();
  });

  test("returns unauthorized when token is missing", async () => {
    const response = await request(app).post("/refresh").send();
    expect(response.status).toBe(401);
  });

  test("returns unauthorized when token is not valid", async () => {
    const response = await request(app)
      .post("/refresh")
      .send({ token: "invalid token" });
    expect(response.status).toBe(401);
  });

  test("returns unauthorized when token is not type refresh", async () => {
    const response = await request(app)
      .post("/refresh")
      .send({ token: generateAccessToken("asdf", "access") });
    expect(response.status).toBe(401);
  });

  test("returns unauthorized when token has no subject", async () => {
    const response = await request(app)
      .post("/refresh")
      .send({ token: jwt.sign({}, "secret", { expiresIn: 60 }) });
    expect(response.status).toBe(401);
  });

  test("returns unauthorized when session is not found", async () => {
    const response = await request(app)
      .post("/refresh")
      .send({ token: generateRefreshToken("asdf", "secret") });
    expect(response.status).toBe(401);
  });

  test("destroys the current session and creates a new one", async () => {
    const user = await prisma.user.create({
      data: {
        name: "Rick",
        username: "dragonfire93",
        passwordHash: "notReallyHash",
        sessions: {
          createMany: {
            data: [{ key: "1234" }, { key: "asdf" }],
          },
        },
      },
    });

    const token = generateRefreshToken("asdf", "secret");

    const response = await request(app).post("/refresh").send({ token });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("access");
    expect(response.body).toHaveProperty("refresh");

    const sessions = await prisma.session.findMany({
      where: { userId: user.id },
    });
    expect(sessions).toHaveLength(2);

    const sessionKeys = sessions.map((session) => session.key);
    expect(sessionKeys).toContain("1234");
    expect(sessionKeys).not.toContain("asdf");
  });
});
