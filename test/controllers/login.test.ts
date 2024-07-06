import { describe, test, expect, afterEach } from "vitest";
import { app } from "../../src/server.js";
import request from "supertest";
import { prisma } from "../../src/db-client.js";
import { hashPassword } from "../../src/services/password.service.js";

describe("/login", () => {
  afterEach(async () => {
    await prisma.session.deleteMany();
    await prisma.user.deleteMany();
  });

  test("returns an error when missing username", async () => {
    await request(app)
      .post("/login")
      .send({ password: "password" })
      .expect(400);
  });

  test("returns an error when missing password", async () => {
    await request(app)
      .post("/login")
      .send({ username: "username" })
      .expect(400);
  });

  test("returns an error when user is not found", async () => {
    await request(app)
      .post("/login")
      .send({ username: "username", password: "password" })
      .expect(403);
  });

  test("returns an error when the password does not match", async () => {
    await prisma.user.create({
      data: {
        name: "Name Name",
        username: "envy",
        passwordHash: await hashPassword("thepassword"),
      },
    });

    await request(app)
      .post("/login")
      .send({ username: "envy", password: "notthepassword" })
      .expect(403);
  });

  test("creates a new session and returns a pair of tokens when successful", async () => {
    await prisma.user.create({
      data: {
        name: "Name Name",
        username: "littlorange",
        passwordHash: await hashPassword("uniquepass"),
      },
    });

    const response = await request(app)
      .post("/login")
      .send({ username: "littlorange", password: "uniquepass" });

    expect(response.status).toBe(200);
    expect(await prisma.session.count()).toBe(1);
    expect(response.body).toHaveProperty("access");
    expect(response.body).toHaveProperty("refresh");
  });
});
