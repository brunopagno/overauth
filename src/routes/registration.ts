import type { Request, Response } from "express";
import { prisma } from "../db-client.js";
import * as argon from "argon2";
import * as crypto from "node:crypto";
import {
  generateAccessToken,
  generateRefreshToken,
} from "../services/token.service.js";

export async function registrationHandler(req: Request, res: Response) {
  const params = req.body;

  const errorResponse = { message: "nop, sorry" };

  if (!params.password || params.password != params.passwordConfirmation) {
    return res.status(422).json(errorResponse);
  }

  if (!params.username) {
    return res.status(422).json(errorResponse);
  }

  const user = await prisma.user.findFirst({
    where: { username: params.username },
  });
  if (user) {
    return res.status(422).json(errorResponse);
  }

  const sessionKey = crypto.randomBytes(20).toString("hex");
  await prisma.user.create({
    data: {
      name: params.name || "",
      username: params.username,
      passwordHash: await argon.hash(params.password),
      sessions: {
        create: {
          key: sessionKey,
        },
      },
    },
  });

  const accessToken = generateAccessToken(sessionKey, "secret");
  const refreshToken = generateRefreshToken(sessionKey, "secret");

  res.status(201).json({
    access: accessToken,
    refresh: refreshToken,
  });
}
