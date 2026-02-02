/**
 * Shared Ramadan date helpers (approximate Gregorian dates; actual start varies by moon sighting).
 * Used by FastingTimer, DashboardSchedule, and goals-until-Ramadan.
 */

// Approximate Ramadan start (first day of fasting) by Gregorian year
const RAMADAN_START_BY_YEAR: Record<number, string> = {
  2024: "2024-03-11",
  2025: "2025-02-28",
  2026: "2026-02-17",
  2027: "2027-02-06",
  2028: "2028-01-26",
  2029: "2029-01-15",
  2030: "2030-01-04",
  2031: "2030-12-24", // Ramadan 1452 AH starts late Dec 2030
};

const RAMADAN_DAYS = 30;

function getYearKey(date: Date): number {
  return date.getFullYear();
}

/** Get Ramadan start date for a given Gregorian year (approximate). */
export function getRamadanStartForYear(year: number): Date {
  const iso = RAMADAN_START_BY_YEAR[year];
  if (iso) return new Date(iso + "T12:00:00"); // noon to avoid UTC date shift in western tz
  // Approximate: assume ~11 days earlier each year from 2025
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
  end.setDate(end.getDate() + RAMADAN_DAYS - 1);
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

/** Date range for the next (or current) Ramadan as YYYY-MM-DD and Date. For calendar export and prayer fetch. */
export function getRamadanDateRange(): {
  startStr: string;
  endStr: string;
  startDate: Date;
  endDate: Date;
  year: number;
} {
  const start = getCurrentRamadanStart();
  const end = getRamadanEndForYear(start.getFullYear());
  const pad = (n: number) => n.toString().padStart(2, "0");
  const startStr = `${start.getFullYear()}-${pad(start.getMonth() + 1)}-${pad(start.getDate())}`;
  const endStr = `${end.getFullYear()}-${pad(end.getMonth() + 1)}-${pad(end.getDate())}`;
  return { startStr, endStr, startDate: new Date(start), endDate: new Date(end), year: start.getFullYear() };
}
