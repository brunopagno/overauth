import { Session } from "@prisma/client";
import type { Request, Response } from "express";

export async function validateHandler(req: Request, res: Response) {
  const session: Session = (req as any).session;

  if (!session) {
    return res.status(401).send();
  }

  res.status(200).send();
}
