import express from "express";
import dotenv from "dotenv";
import { registrationHandler } from "./routes/registration.js";
import { unregistrationHandler } from "./routes/unregistration.js";

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
app.post("/unregister", unregistrationHandler);
// app.post("/login", ...);
// app.post("/logout", ...);
// app.post("/validate", ...);
// app.post("/represh", ...);
