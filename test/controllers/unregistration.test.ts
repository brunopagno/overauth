import { describe, test, expect, afterEach } from "vitest";
import { app } from "../../src/server.js";
import request from "supertest";
import { prisma } from "../../src/db-client.js";
import { generateAccessToken } from "../../src/services/token.service.js";

describe("/unregister", () => {
  afterEach(async () => {
    await prisma.session.deleteMany();
    await prisma.user.deleteMany();
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
