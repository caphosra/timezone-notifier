import express, { type Request, type Response } from "express";
import rateLimit from "express-rate-limit";
import { Temporal } from "@js-temporal/polyfill";

const app = express();

const DEFAULT_PORT = 5122;
const DEFAULT_TZ = "Asia/Tokyo";

const PORT = process.env.PORT ? Number.parseInt(process.env.PORT, 10) : DEFAULT_PORT;
const TRUST_PROXY = process.env.TRUST_PROXY ?? "false";

const WINDOW_MS = 15 * 60 * 1000;
const REQ_LIMIT = 100;

const formatZonedDateTime = (time: Temporal.ZonedDateTime): string => {
  const plainDate = time.toPlainDate();
  const plainTime = time.toPlainTime();
  const period = plainTime.hour < 12 ? "午前" : "午後";
  const hour12 = plainTime.hour % 12 === 0 ? 12 : plainTime.hour % 12;
  const weekday = ["日", "月", "火", "水", "木", "金", "土"][plainDate.dayOfWeek % 7];

  return `${plainDate.year}年 ${plainDate.month}月${plainDate.day}日 ${weekday}曜日 ${period}${hour12}時${plainTime.minute}分`;
};

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
  const time = Temporal.Now.zonedDateTimeISO(DEFAULT_TZ);
  const formattedTime = formatZonedDateTime(time);

  console.log(
    JSON.stringify({
      time: time.toString(),
      ip: request.ip,
      method: request.method,
      path: request.originalUrl
    })
  )

  response.json({
    utc: time.toInstant().toString(),
    zonedTime: time.toString(),
    time: formattedTime,
  });
});

app.listen(PORT, () => {
  console.log(`UTC time API is listening on http://localhost:${PORT}`);
});
