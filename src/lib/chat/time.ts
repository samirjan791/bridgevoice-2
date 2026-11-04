// Time awareness for BridgeVoice (4.9.3).
//
// The visitor's device local time is the truth: users are worldwide, so the
// server clock (UTC) must never be presented as the user's time. The client
// captures its own clock + IANA timezone and sends it with every chat
// request; the server formats it into a "Current time context" block for the
// model. All period logic here is pure and unit-testable.

export type DayPeriod = "morning" | "afternoon" | "evening" | "night";

export type ClientTime = { epochMs: number; timeZone: string };

// Day periods (local hour, 24-hour clock):
//   morning   05:00–11:59
//   afternoon 12:00–17:59
//   evening   18:00–21:59
//   night     22:00–04:59
export function dayPeriodFromHour(hour: number): DayPeriod {
  const h = ((Math.floor(hour) % 24) + 24) % 24;
  if (h >= 5 && h < 12) return "morning";
  if (h >= 12 && h < 18) return "afternoon";
  if (h >= 18 && h < 22) return "evening";
  return "night";
}

// Opening greeting for a period. Night deliberately never uses a "good
// night" farewell as an opening greeting — "Working late" fits someone
// opening the app after hours.
export function greetingForPeriod(period: DayPeriod): string {
  switch (period) {
    case "morning":
      return "Good morning";
    case "afternoon":
      return "Good afternoon";
    case "evening":
      return "Good evening";
    case "night":
      return "Working late";
  }
}

export function greetingForHour(hour: number): string {
  return greetingForPeriod(dayPeriodFromHour(hour));
}

// Capture the device's own clock + timezone for a chat request.
export function captureClientTime(): ClientTime {
  let timeZone = "UTC";
  try {
    timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
  } catch {
    /* keep UTC fallback */
  }
  return { epochMs: Date.now(), timeZone };
}

// Format a client-provided time into the instruction block the model sees.
// Returns null when there is no usable client time — callers must then send
// no time context at all rather than fall back to the server clock.
export function buildTimeContext(
  clientTime: ClientTime | undefined,
): string | null {
  if (!clientTime) return null;
  const { epochMs, timeZone } = clientTime;
  if (!Number.isFinite(epochMs)) return null;
  // Reject a wildly wrong client clock instead of teaching the model a lie.
  if (Math.abs(epochMs - Date.now()) > 48 * 3600 * 1000) return null;
  const date = new Date(epochMs);
  if (Number.isNaN(date.getTime())) return null;
  try {
    const day = new Intl.DateTimeFormat("en-US", {
      timeZone,
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    }).format(date);
    const time12 = new Intl.DateTimeFormat("en-US", {
      timeZone,
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    }).format(date);
    const time24 = new Intl.DateTimeFormat("en-GB", {
      timeZone,
      hour: "2-digit",
      minute: "2-digit",
      hourCycle: "h23",
    }).format(date);
    const hour = Number(
      new Intl.DateTimeFormat("en-US", {
        timeZone,
        hour: "numeric",
        hourCycle: "h23",
      }).format(date),
    );
    const period = dayPeriodFromHour(hour);
    return (
      `Current time context (the user's own local time — use this for any ` +
      `question about the time, the day, or the time of day; never guess a ` +
      `time and never use another timezone): ${day}, ${time12} (${time24} ` +
      `24-hour) ${timeZone}, which is the ${period}. When the user asks what ` +
      `time it is right now, answer with this exact time. Understand ` +
      `references like "this morning", "tonight", and "in the evening" ` +
      `relative to this time.`
    );
  } catch {
    // Unknown timezone or formatter failure: no context beats wrong context.
    return null;
  }
}

// Describe a device-local Date for spoken/agent prompts (no timezone
// argument: the device zone is already the user's zone).
export function describeLocalDate(date: Date): string | null {
  try {
    const day = new Intl.DateTimeFormat("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    }).format(date);
    const time12 = new Intl.DateTimeFormat("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    }).format(date);
    const time24 = new Intl.DateTimeFormat("en-GB", {
      hour: "2-digit",
      minute: "2-digit",
      hourCycle: "h23",
    }).format(date);
    const period = dayPeriodFromHour(date.getHours());
    return `${day}, ${time12} (${time24} 24-hour), which is the ${period}`;
  } catch {
    return null;
  }
}
