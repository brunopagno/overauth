import type { Request, Response } from "express";

export function loginHandler(req: Request, res: Response) {
  const { username, password } = req.body;
  if (!username || !password) {
    res.status(400).send("missing parameter");
    return;
  }

  res.send("hi");
}
