import type { Request, Response } from "express";
import { Session } from "@prisma/client";
import { prisma } from "../db-client.js";

export async function unregisterHandler(req: Request, res: Response) {
  const session: Session = (req as any).session;

  await prisma.user.delete({
    where: {
      id: session.userId,
    },
  });

  res.status(200).send();
}
