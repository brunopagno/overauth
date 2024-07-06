import type { Request, Response } from "express";
import { prisma } from "../db-client.js";
import { validatePassword } from "../services/password.service.js";
import { createSession } from "../services/session.service.js";

export async function loginHandler(req: Request, res: Response) {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).send("missing parameter");
  }

  const user = await prisma.user.findFirst({
    where: { username: username },
  });
  if (!user) {
    return res.status(403).send("Unauthorized");
  }
  const validPassword = await validatePassword(user.passwordHash, password);
  if (!validPassword) {
    return res.status(403).send("Unauthorized");
  }

  const tokens = await createSession(user);

  res.json({
    access: tokens.accessToken,
    refresh: tokens.refreshToken,
  });
}
