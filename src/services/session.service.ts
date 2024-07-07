import { Session, User } from "@prisma/client";
import { prisma } from "../db-client.js";
import { generateAccessToken, generateRefreshToken } from "./token.service.js";

import * as crypto from "node:crypto";

export type TokenPair = {
  accessToken: string;
  refreshToken: string;
};

export async function createSession(user: User) {
  const sessionKey = crypto.randomBytes(20).toString("hex");
  await prisma.session.create({
    data: {
      key: sessionKey,
      userId: user.id,
    },
  });

  const accessToken = generateAccessToken(sessionKey, "secret");
  const refreshToken = generateRefreshToken(sessionKey, "secret");

  return { accessToken, refreshToken };
}

export async function destroySession(session: Session) {
  await prisma.session.delete({
    where: { id: session.id },
  });
}
