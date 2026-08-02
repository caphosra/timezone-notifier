# TimeZone Notifier

A very simple web server that returns the current time in a specified time zone.

The server can be configured to use a different time zone during a specified period. For example, to use the `Europe/Lisbon` time zone from July 25 to July 31, 2026, add the following entry to `tz.json`:

```json
{
    "begin": "2026-07-25T00:00:00+09:00",
    "end": "2026-07-31T23:59:59+09:00",
    "tz": "Europe/Lisbon"
}
```

During this period, the server will return the current time in the `Europe/Lisbon` time zone. Once the period ends, it will return the time in the default time zone.

## Why this project?

Just for fun. To let people know which time zone I am currently in.
