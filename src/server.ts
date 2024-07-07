import express from "express";
import dotenv from "dotenv";
import { authenticate } from "./middlewares/authenticated.middleware.js";
import { loginHandler } from "./controllers/login.js";
import { logoutHandler } from "./controllers/logout.js";
import { validateHandler } from "./controllers/validate.js";
import { registerHandler } from "./controllers/register.js";
import { unregisterHandler } from "./controllers/unregister.js";

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

app.post("/register", registerHandler);
app.post("/unregister", [authenticate, unregisterHandler]);
app.post("/login", loginHandler);
app.post("/logout", [authenticate, logoutHandler]);
app.post("/validate", [authenticate, validateHandler]);
// app.post("/refresh", ...);
