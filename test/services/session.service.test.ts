import { describe, test, expect, afterEach } from "vitest";
import { createSession } from "../../src/services/session.service";
import { prisma } from "../../src/db-client";
import * as jwt from "jsonwebtoken";

describe("createSession", () => {
  afterEach(async () => {
    await prisma.session.deleteMany();
    await prisma.user.deleteMany();
  });

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
    const refresh = jwt.verify(tokens.refreshToken, "secret") as jwt.JwtPayload;

    expect(await prisma.session.count()).toBe(1);
    expect(access.type).toEqual("access");
    expect(refresh.type).toEqual("refresh");
    expect(access.sub).toEqual(refresh.sub);
  });
});
