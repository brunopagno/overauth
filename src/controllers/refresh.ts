import type { Request, Response } from "express";
import { validateToken } from "../services/token.service.js";
import { prisma } from "../db-client.js";
import { createSession, destroySession } from "../services/session.service.js";

export async function refreshHandler(req: Request, res: Response) {
  const { token } = req.body;
  if (!token) {
    return res.status(401).send("Unauthorized");
  }

  const decoded = validateToken(token, "secret");
  if (!decoded) {
    return res.status(401).send("Unauthorized");
  }
  if (decoded.type != "refresh") {
    return res.status(401).send("Unauthorized");
  }

  const sessionKey = decoded.sub;
  if (!sessionKey) {
    return res.status(401).send("Unauthorized");
  }

  const session = await prisma.session.findFirst({
    where: { key: sessionKey },
  });
  if (!session) {
    return res.status(401).send("Unauthorized");
  }
  const user = await prisma.user.findFirst({
    where: { id: session.userId },
  });
  if (!user) {
    return res.status(401).send("Unauthorized");
  }

  await destroySession(session);
  const tokens = await createSession(user);

  res.json({
    access: tokens.accessToken,
    refresh: tokens.refreshToken,
  });
}
