import { describe, test, expect, afterEach, afterAll, beforeAll } from "vitest";
import { app } from "../../src/server.js";
import request from "supertest";
import { prisma } from "../../src/db-client.js";
import { hashPassword } from "../../src/services/password.service.js";
import { User } from "@prisma/client";
import { generateAccessToken } from "../../src/services/token.service.js";

describe("/validate", () => {
  let user: User;
  let token: string;

  beforeAll(async () => {
    user = await prisma.user.create({
      data: {
        name: "Jojo",
        username: "jojo",
        passwordHash: await hashPassword("password"),
        sessions: { create: { key: "asdfg" } },
      },
    });

    token = generateAccessToken("asdfg", "secret");
  });

  afterAll(async () => {
    await prisma.session.deleteMany();
    await prisma.user.deleteMany();
  });

  test("should return an error if no token is provided", async () => {
    const response = await request(app).post("/validate").send();
    expect(response.status).toBe(401);
  });

  test("should return an error if the token is invalid", async () => {
    const response = await request(app)
      .post("/validate")
      .set("Authorization", `Bearer invalidtoken`)
      .send();
    expect(response.status).toBe(401);
  });

  test("should return a success if the token is valid", async () => {
    const response = await request(app)
      .post("/validate")
      .set("Authorization", `Bearer ${token}`)
      .send();
    expect(response.status).toBe(200);
  });
});
