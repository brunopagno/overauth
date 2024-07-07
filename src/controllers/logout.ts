import { Session } from "@prisma/client";
import type { Request, Response } from "express";
import { destroySession } from "../services/session.service.js";

export async function logoutHandler(req: Request, res: Response) {
  const session: Session = (req as any).session;

  await destroySession(session);

  res.status(200).send();
}
