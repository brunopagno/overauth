import type { Request, Response, NextFunction } from "express";
import { validateToken } from "../services/token.service.js";
import { prisma } from "../db-client.js";

export async function authenticate(
  req: Request,
  res: Response,
  next: NextFunction,
) {
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

  (req as any).session = session;

  next();
}
