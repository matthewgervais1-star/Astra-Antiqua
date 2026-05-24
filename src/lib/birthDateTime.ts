import tzLookup from "tz-lookup";

export interface BirthInput {
  year: number;
  month: number; // 1-12
  day: number; // 1-31
  hour: number; // 0-23
  minute: number; // 0-59
  latitude: number; // degrees, north positive
  longitude: number; // degrees, east positive
}

export interface ResolvedBirth {
  utcDate: Date;
  timezone: string;
  offsetMinutes: number;
}

function getZoneOffsetMinutes(date: Date, zone: string): number {
  const fmt = new Intl.DateTimeFormat("en-US", {
    timeZone: zone,
    year: "numeric",
    month: "numeric",
    day: "numeric",
    hour: "numeric",
    minute: "numeric",
    second: "numeric",
    hour12: false,
  });
  const parts = fmt.formatToParts(date);
  const lookup = (type: Intl.DateTimeFormatPartTypes): number => {
    const part = parts.find((p) => p.type === type);
    if (!part) throw new Error(`Missing date part: ${type}`);
    return Number(part.value);
  };
  let hour = lookup("hour");
  if (hour === 24) hour = 0; // Intl quirk: midnight may be reported as 24
  const localTimestamp = Date.UTC(
    lookup("year"),
    lookup("month") - 1,
    lookup("day"),
    hour,
    lookup("minute"),
    lookup("second"),
  );
  return (localTimestamp - date.getTime()) / 60000;
}

export function resolveBirth(input: BirthInput): ResolvedBirth {
  const timezone = tzLookup(input.latitude, input.longitude);

  const naiveUTC = Date.UTC(
    input.year,
    input.month - 1,
    input.day,
    input.hour,
    input.minute,
    0,
  );

  // First iteration: assume the naive UTC time is the local time and find the offset at that moment.
  const offset1 = getZoneOffsetMinutes(new Date(naiveUTC), timezone);
  const candidate1 = new Date(naiveUTC - offset1 * 60000);

  // Second iteration: if the offset changed due to a DST boundary, recompute.
  const offset2 = getZoneOffsetMinutes(candidate1, timezone);
  const utcMs = naiveUTC - offset2 * 60000;
  const utcDate = new Date(utcMs);

  return {
    utcDate,
    timezone,
    offsetMinutes: offset2,
  };
}

export function formatOffset(offsetMinutes: number): string {
  const sign = offsetMinutes >= 0 ? "+" : "-";
  const abs = Math.abs(offsetMinutes);
  const h = Math.floor(abs / 60);
  const m = abs % 60;
  return `UTC${sign}${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}
