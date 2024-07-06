import { describe, test, expect, afterEach } from "vitest";
import { app } from "../../src/server.js";
import request from "supertest";
import { prisma } from "../../src/db-client.js";
import {
  generateAccessToken,
  generateRefreshToken,
} from "../../src/services/token.service.js";
import * as jwt from "jsonwebtoken";

describe("/unregister", () => {
  afterEach(async () => {
    await prisma.session.deleteMany();
    await prisma.user.deleteMany();
  });

  test("returns unauthorized when token is missing", async () => {
    const response = await request(app).post("/unregister").send();
    expect(response.status).toBe(401);
  });

  test("returns unauthorized when token is not valid", async () => {
    const response = await request(app)
      .post("/unregister")
      .set("Authorization", "Bearer invalidthingy")
      .send();

    expect(response.status).toBe(401);
  });

  test("returns unauthorized when token subject is not present", async () => {
    const token = jwt.sign({}, "secret", { expiresIn: 60 });
    const response = await request(app)
      .post("/unregister")
      .set("Authorization", `Bearer ${token}`)
      .send();

    expect(response.status).toBe(401);
  });

  test("returns unauthorized when session is not found", async () => {
    const token = generateAccessToken("nosuchkey", "secret");
    const response = await request(app)
      .post("/unregister")
      .set("Authorization", `Bearer ${token}`)
      .send();

    expect(response.status).toBe(401);
  });

  test("returns unauthorized if a non access token is used", async () => {
    await prisma.user.create({
      data: {
        name: "O'Named",
        username: "emokid1991",
        passwordHash: "notreallyahash",
        sessions: {
          createMany: {
            data: [{ key: "1234" }],
          },
        },
      },
    });

    const token = generateRefreshToken("1234", "secret");

    const response = await request(app)
      .post("/unregister")
      .set("Authorization", `Bearer ${token}`)
      .send();

    expect(response.status).toBe(401);
  });

  test("deletes user and all their sessions", async () => {
    const user = await prisma.user.create({
      data: {
        name: "Name",
        username: "spikedcheese",
        passwordHash: "notreallyahash",
        sessions: {
          createMany: {
            data: [{ key: "1234" }, { key: "asdf" }, { key: "qwer" }],
          },
        },
      },
    });

    const token = generateAccessToken("asdf", "secret");

    const response = await request(app)
      .post("/unregister")
      .set("Authorization", `Bearer ${token}`)
      .send();

    expect(response.status).toBe(200);
    expect(await prisma.user.findUnique({ where: { id: user.id } })).toBeNull();
    expect(await prisma.session.findMany()).toEqual([]);
  });
});
