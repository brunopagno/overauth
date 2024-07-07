import express from "express";
import dotenv from "dotenv";
import { registrationHandler } from "./controllers/registration.js";
import { unregistrationHandler } from "./controllers/unregistration.js";
import { loginHandler } from "./controllers/login.js";
import { authenticate } from "./middlewares/authenticated.middleware.js";

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

app.post("/register", registrationHandler);
app.post("/unregister", [authenticate, unregistrationHandler]);
app.post("/login", loginHandler);
// app.post("/logout", [authenticate, logoutHandler]);
// app.post("/validate", ...);
// app.post("/represh", ...);
