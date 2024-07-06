import type { Request, Response } from "express";
import { validateToken } from "../services/token.service.js";
import { prisma } from "../db-client.js";

export async function unregistrationHandler(req: Request, res: Response) {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) {
    return res.status(401).send("Unauthorized");
  }

  const decoded = validateToken(token!, "secret");
  if (!decoded) {
    return res.status(401).send("Unauthorized");
  }
  if (decoded.type != "access") {
    return res.status(401).send("Unauthorized");
  }

  const sessionKey = decoded?.sub;
  if (!sessionKey) {
    return res.status(401).send("Unauthorized");
  }

  const session = await prisma.session.findFirst({
    where: {
      key: sessionKey,
    },
  });
  if (!session) {
    return res.status(401).send("Unauthorized");
  }

  await prisma.user.delete({
    where: {
      id: session.userId,
    },
  });

  res.status(200).send();
}
