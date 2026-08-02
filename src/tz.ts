import { Temporal } from "@js-temporal/polyfill";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const TZ_CONFIG_PATH = resolve(process.cwd(), "tz.json");
const FALLBACK_TIME_ZONE = "Asia/Tokyo";
const WEEKDAYS = ["日", "月", "火", "水", "木", "金", "土"] as const;

type TimezoneRule = {
  begin: string;
  end: string;
  tz: string;
};

type TimezoneConfig = {
  default: string;
  timezones?: TimezoneRule[];
};

export type SelectedTime = {
  utc: string;
  zonedTime: string;
  timeZone: string;
  time: string;
};

const isTimezoneRule = (value: unknown): value is TimezoneRule => {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  const rule = value as Record<string, unknown>;
  return typeof rule.begin === "string" && typeof rule.end === "string" && typeof rule.tz === "string";
};

const isTimezoneConfig = (value: unknown): value is TimezoneConfig => {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  const config = value as Record<string, unknown>;
  return (
    typeof config.default === "string" &&
    (config.timezones === undefined || (Array.isArray(config.timezones) && config.timezones.every(isTimezoneRule)))
  );
};

const readTimezoneConfig = (): TimezoneConfig => {
  let rawConfig: string;

  try {
    rawConfig = readFileSync(TZ_CONFIG_PATH, "utf8");
  } catch (error) {
    if (error instanceof Error && "code" in error && error.code === "ENOENT") {
      return {
        default: FALLBACK_TIME_ZONE
      };
    }

    throw error;
  }

  const config = JSON.parse(rawConfig) as unknown;

  if (!isTimezoneConfig(config)) {
    throw new Error("tz.json must contain default and optional timezones entries.");
  }

  return config;
};

const selectTimeZone = (now: Temporal.Instant, config: TimezoneConfig): string => {
  const matchingRule = config.timezones?.find((rule) => {
    const begin = Temporal.Instant.from(rule.begin);
    const end = Temporal.Instant.from(rule.end);

    return Temporal.Instant.compare(begin, now) <= 0 && Temporal.Instant.compare(now, end) <= 0;
  });

  return matchingRule?.tz ?? config.default;
};

const formatZonedDateTime = (time: Temporal.ZonedDateTime): string => {
  const plainDate = time.toPlainDate();
  const plainTime = time.toPlainTime();
  const period = plainTime.hour < 12 ? "午前" : "午後";
  const hour12 = plainTime.hour % 12 === 0 ? 12 : plainTime.hour % 12;
  const weekday = WEEKDAYS[plainDate.dayOfWeek % 7];

  return `${plainDate.year}年 ${plainDate.month}月${plainDate.day}日 ${weekday}曜日 ${period}${hour12}時${plainTime.minute}分`;
};

export const getSelectedTime = (): SelectedTime => {
  const now = Temporal.Now.instant();
  const config = readTimezoneConfig();
  const timeZone = selectTimeZone(now, config);
  const time = now.toZonedDateTimeISO(timeZone);

  return {
    utc: time.toInstant().toString(),
    zonedTime: time.toString(),
    timeZone,
    time: formatZonedDateTime(time)
  };
};
