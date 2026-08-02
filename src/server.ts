import express, { type Request, type Response } from "express";
import rateLimit from "express-rate-limit";
import { getSelectedTime } from "./tz.js";

const app = express();

const DEFAULT_PORT = 5122;

const PORT = process.env.PORT ? Number.parseInt(process.env.PORT, 10) : DEFAULT_PORT;
const TRUST_PROXY = process.env.TRUST_PROXY ?? "false";

const WINDOW_MS = 15 * 60 * 1000;
const REQ_LIMIT = 100;

app.set("trust proxy", TRUST_PROXY === "false" ? false : TRUST_PROXY);

app.use(
  rateLimit({
    windowMs: WINDOW_MS,
    limit: REQ_LIMIT,
    standardHeaders: "draft-7",
    legacyHeaders: false,
    message: {
      error: "Too many requests. Please try again later."
    }
  })
);

app.get("/", (request: Request, response: Response) => {
  const selectedTime = getSelectedTime();

  console.log(
    JSON.stringify({
      ip: request.ip,
      method: request.method,
      path: request.originalUrl,
      time: selectedTime
    })
  );

  response.json(selectedTime);
});

app.listen(PORT, () => {
  console.log(`UTC time API is listening on http://localhost:${PORT}`);
});
