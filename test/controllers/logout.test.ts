import { describe, test, expect, afterEach } from "vitest";
import { app } from "../../src/server.js";
import request from "supertest";
import { prisma } from "../../src/db-client.js";
import { generateAccessToken } from "../../src/services/token.service.js";

describe("/logout", () => {
  afterEach(async () => {
    await prisma.session.deleteMany();
    await prisma.user.deleteMany();
  });

  test("does not logout when there is no session", async () => {
    const response = await request(app).post("/logout").send();
    expect(response.status).toBe(401);
  });

  test("returns successful response and destroys only the correct session", async () => {
    await prisma.user.create({
      data: {
        name: "Tom",
        username: "totalanarchy",
        passwordHash: "notreallyahash",
        sessions: {
          createMany: {
            data: [{ key: "1234" }, { key: "2222" }, { key: "zxcv" }],
          },
        },
      },
    });

    const token = generateAccessToken("2222", "secret");

    const response = await request(app)
      .post("/logout")
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(200);

    expect(
      await prisma.session.findFirst({
        where: { key: "2222" },
      }),
    ).toBeNull();

    expect(
      await prisma.session.count({
        where: { key: { in: ["1234", "zxcv"] } },
      }),
    ).toBe(2);
  });
});
