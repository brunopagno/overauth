import express from "express";
import dotenv from "dotenv";
import { prisma } from "./db-client.js";
import * as argon from "argon2";
import * as jwt from "jsonwebtoken";
import * as crypto from "node:crypto";

if (process.env.NODE_ENV !== "production") {
  console.log("loading dotenv");
  dotenv.config();
}

export const app = express();

app.use(express.json());

app.get("/", (_req, res) => {
  res.setHeader("content-type", "application/json");
  res.send(JSON.stringify({ status: "healthy" }));
});

app.post("/register", async (req, res) => {
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

  const accessToken = jwt.sign(
    {
      type: "access",
    },
    "secret",
    {
      algorithm: "HS256",
      subject: sessionKey,
      expiresIn: 60 * 2, // two minutes
    },
  );
  const refreshToken = jwt.sign(
    {
      type: "refresh",
    },
    "secret",
    {
      algorithm: "HS256",
      subject: sessionKey,
      expiresIn: 60 * 60 * 24, //  one day
    },
  );

  res.status(201).json({
    access: accessToken,
    refresh: refreshToken,
  });
});
