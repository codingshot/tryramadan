/**
 * Shared Ramadan date helpers (approximate Gregorian dates; actual start varies by moon sighting).
 * Used by FastingTimer, DashboardSchedule, and goals-until-Ramadan.
 */

// Approximate Ramadan start (first day of fasting) by Gregorian year.
// Based on Umm al-Qura / astronomical calculations (Aladhan.com). Actual start may vary by 1 day with moon sighting.
const RAMADAN_START_BY_YEAR: Record<number, string> = {
  2024: "2024-03-11",
  2025: "2025-03-01",
  2026: "2026-02-18",
  2027: "2027-02-08",
  2028: "2028-01-28",
  2029: "2029-01-16",
  2030: "2030-01-05",
  2031: "2030-12-26", // Ramadan 1452 AH starts late Dec 2030
  2032: "2031-12-15", // Ramadan 1453 AH starts mid-Dec 2031
};

const RAMADAN_DAYS = 30; // Usually 29 or 30 days; using 30 as default approximation

function getYearKey(date: Date): number {
  return date.getFullYear();
}

/** Get Ramadan start date for a given Gregorian year (approximate). */
export function getRamadanStartForYear(year: number): Date {
  const iso = RAMADAN_START_BY_YEAR[year];
  if (iso) return new Date(iso + "T12:00:00"); // noon to avoid UTC date shift in western tz
  // Fallback: approximate ~11 days earlier each year from 2025 (for years not in RAMADAN_START_BY_YEAR)
  if (typeof import.meta !== "undefined" && import.meta.env?.DEV) {
    console.warn(`[ramadan] Year ${year} not in RAMADAN_START_BY_YEAR; using approximate fallback.`);
  }
  const refYear = 2025;
  const refIso = RAMADAN_START_BY_YEAR[refYear];
  if (!refIso) return new Date(year, 2, 1);
  const refDate = new Date(refIso + "T12:00:00");
  const yearsDiff = year - refYear;
  const d = new Date(refDate);
  d.setDate(d.getDate() + yearsDiff * -11);
  return d;
}

/** Get Ramadan end date (last day of fasting) for a given year. */
export function getRamadanEndForYear(year: number): Date {
  const start = getRamadanStartForYear(year);
  const end = new Date(start);
  // Ramadan 2031 is 29 days (ends Jan 23), most others are 30 days
  const days = year === 2031 ? 29 : RAMADAN_DAYS;
  end.setDate(end.getDate() + days - 1);
  return end;
}

/** Get the next Ramadan start from today (or current start if we're in Ramadan). */
export function getNextRamadanStart(): Date {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  for (let y = today.getFullYear(); y <= today.getFullYear() + 2; y++) {
    const start = getRamadanStartForYear(y);
    const end = getRamadanEndForYear(y);
    start.setHours(0, 0, 0, 0);
    end.setHours(0, 0, 0, 0);
    if (today >= start && today <= end) return getRamadanStartForYear(y); // in Ramadan
    if (start > today) return start;
  }
  return getRamadanStartForYear(today.getFullYear() + 1);
}

/** Get Ramadan start for the current Ramadan window (this year or next). */
export function getCurrentRamadanStart(): Date {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const thisYearStart = getRamadanStartForYear(today.getFullYear());
  const thisYearEnd = getRamadanEndForYear(today.getFullYear());
  if (today >= thisYearStart && today <= thisYearEnd) return thisYearStart;
  if (today < thisYearStart) return thisYearStart;
  return getRamadanStartForYear(today.getFullYear() + 1);
}

/** Check if a date falls within Ramadan (approximate). Handles Ramadan spanning two Gregorian years (e.g. Dec 2030 – Jan 2031). */
export function isRamadanDay(date: Date): boolean {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  const year = d.getFullYear();
  // Check this year's Ramadan window (e.g. Jan–Mar 2030)
  const startThis = getRamadanStartForYear(year);
  const endThis = getRamadanEndForYear(year);
  startThis.setHours(0, 0, 0, 0);
  endThis.setHours(0, 0, 0, 0);
  if (d >= startThis && d <= endThis) return true;
  // Ramadan can start in Dec of this Gregorian year (e.g. 2031 AH starts Dec 2030)
  const startNext = getRamadanStartForYear(year + 1);
  const endNext = getRamadanEndForYear(year + 1);
  startNext.setHours(0, 0, 0, 0);
  endNext.setHours(0, 0, 0, 0);
  return d >= startNext && d <= endNext;
}

/** Get Ramadan day number (1–30) or null if not in Ramadan. */
export function getRamadanDayNumber(date: Date): number | null {
  if (!isRamadanDay(date)) return null;
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  const year = d.getFullYear();
  const startThis = getRamadanStartForYear(year);
  const endThis = getRamadanEndForYear(year);
  startThis.setHours(0, 0, 0, 0);
  endThis.setHours(0, 0, 0, 0);
  let start: Date;
  if (d >= startThis && d <= endThis) {
    start = startThis;
  } else {
    start = getRamadanStartForYear(year + 1);
    start.setHours(0, 0, 0, 0);
  }
  const diffTime = d.getTime() - start.getTime();
  const dayNum = Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1;
  return Math.max(1, Math.min(30, dayNum));
}

/** Days until next Ramadan start (0 if already in Ramadan). */
export function getDaysUntilRamadan(): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const start = getNextRamadanStart();
  start.setHours(0, 0, 0, 0);
  if (today >= start) {
    const end = getRamadanEndForYear(start.getFullYear());
    if (today <= end) return 0;
  }
  const diffTime = start.getTime() - today.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

/** Whether we are currently within Ramadan. */
export function isCurrentlyRamadan(): boolean {
  const days = getDaysUntilRamadan();
  if (days > 0) return false;
  const today = new Date();
  const start = getCurrentRamadanStart();
  const end = getRamadanEndForYear(start.getFullYear());
  return today >= start && today <= end;
}

/** Whether the given date is the last day of the current Ramadan (for "Last day" badge). */
export function isLastDayOfRamadan(date: Date): boolean {
  if (!isRamadanDay(date)) return false;
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  const start = getCurrentRamadanStart();
  const end = getRamadanEndForYear(start.getFullYear());
  end.setHours(0, 0, 0, 0);
  return d.getTime() === end.getTime();
}

/** Date range for the next (or current) Ramadan as YYYY-MM-DD and Date. For calendar export and prayer fetch. Pass overrides from preferences to use effective range. */
export function getRamadanDateRange(overrides?: RamadanOverrideInput | null): {
  startStr: string;
  endStr: string;
  startDate: Date;
  endDate: Date;
  year: number;
} {
  const effective = getEffectiveRamadanRange(overrides ?? undefined);
  return {
    startStr: effective.startStr,
    endStr: effective.endStr,
    startDate: new Date(effective.start),
    endDate: new Date(effective.end),
    year: effective.year,
  };
}

export type RamadanOverrideInput = {
  ramadanStartOverride: string | null;
  ramadanEndOverride: string | null;
};

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;
function parseIsoToDate(iso: string): Date {
  return new Date(iso + "T12:00:00");
}

/** Effective Ramadan range: from overrides if set and valid, else app calendar for current/next Ramadan. */
export function getEffectiveRamadanRange(overrides?: RamadanOverrideInput | null): {
  start: Date;
  end: Date;
  startStr: string;
  endStr: string;
  year: number;
  fromOverride: boolean;
} {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const pad = (n: number) => n.toString().padStart(2, "0");
  const toStr = (d: Date) =>
    `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

  if (
    overrides?.ramadanStartOverride &&
    overrides?.ramadanEndOverride &&
    ISO_DATE.test(overrides.ramadanStartOverride) &&
    ISO_DATE.test(overrides.ramadanEndOverride)
  ) {
    const start = parseIsoToDate(overrides.ramadanStartOverride);
    const end = parseIsoToDate(overrides.ramadanEndOverride);
    start.setHours(0, 0, 0, 0);
    end.setHours(0, 0, 0, 0);
    if (start.getTime() < end.getTime()) {
      if (today <= end) {
        return {
          start,
          end,
          startStr: overrides.ramadanStartOverride,
          endStr: overrides.ramadanEndOverride,
          year: start.getFullYear(),
          fromOverride: true,
        };
      }
    }
  }

  const start = getCurrentRamadanStart();
  const end = getRamadanEndForYear(start.getFullYear());
  start.setHours(0, 0, 0, 0);
  end.setHours(0, 0, 0, 0);
  return {
    start,
    end,
    startStr: toStr(start),
    endStr: toStr(end),
    year: start.getFullYear(),
    fromOverride: false,
  };
}

/** Whether date is within the given range (inclusive). */
export function isRamadanDayInRange(date: Date, start: Date, end: Date): boolean {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  const s = new Date(start);
  const e = new Date(end);
  s.setHours(0, 0, 0, 0);
  e.setHours(0, 0, 0, 0);
  return d >= s && d <= e;
}

/** Day number (1–N) within range, or null if outside. */
export function getRamadanDayNumberInRange(date: Date, start: Date, end: Date): number | null {
  if (!isRamadanDayInRange(date, start, end)) return null;
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  const s = new Date(start);
  s.setHours(0, 0, 0, 0);
  const diffTime = d.getTime() - s.getTime();
  const dayNum = Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1;
  return Math.max(1, dayNum);
}

/** Whether date is the last day of the given range. */
export function isLastDayOfRamadanInRange(date: Date, start: Date, end: Date): boolean {
  if (!isRamadanDayInRange(date, start, end)) return false;
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  const e = new Date(end);
  e.setHours(0, 0, 0, 0);
  return d.getTime() === e.getTime();
}

/** Number of days in range (inclusive). */
export function getRamadanRangeLength(start: Date, end: Date): number {
  const s = new Date(start);
  s.setHours(0, 0, 0, 0);
  const e = new Date(end);
  e.setHours(0, 0, 0, 0);
  return Math.floor((e.getTime() - s.getTime()) / (1000 * 60 * 60 * 24)) + 1;
}

/** Hero pre-title: "X days until Ramadan", "Day X/Y of Ramadan", or "X days until Ramadan (YYYY)" after Ramadan. */
export function getHeroPretitle(): string {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const daysUntil = getDaysUntilRamadan();
  if (daysUntil === 0) {
    const start = getNextRamadanStart();
    start.setHours(0, 0, 0, 0);
    const end = getRamadanEndForYear(start.getFullYear());
    end.setHours(0, 0, 0, 0);
    const dayNum = getRamadanDayNumber(today) ?? 1;
    const total = getRamadanRangeLength(start, end);
    return `Day ${dayNum}/${total} of Ramadan`;
  }
  const nextStart = getNextRamadanStart();
  const nextYear = nextStart.getFullYear();
  if (nextYear > today.getFullYear()) return `${daysUntil} days until Ramadan (${nextYear})`;
  return `${daysUntil} days until Ramadan`;
}
