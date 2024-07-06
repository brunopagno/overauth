import type { Request, Response } from "express";
import { prisma } from "../db-client.js";
import { createSession } from "../services/session.service.js";
import { hashPassword } from "../services/password.service.js";

export async function registrationHandler(req: Request, res: Response) {
  const params = req.body;

  const errorResponse = { message: "nop, sorry" };

  if (!params.password || params.password != params.passwordConfirmation) {
    return res.status(422).json(errorResponse);
  }

  if (!params.username) {
    return res.status(422).json(errorResponse);
  }

  let user = await prisma.user.findFirst({
    where: { username: params.username },
  });
  if (user) {
    return res.status(422).json(errorResponse);
  }

  user = await prisma.user.create({
    data: {
      name: params.name || "",
      username: params.username,
      passwordHash: await hashPassword(params.password),
    },
  });

  const tokens = await createSession(user);

  res.status(201).json({
    access: tokens.accessToken,
    refresh: tokens.refreshToken,
  });
}
