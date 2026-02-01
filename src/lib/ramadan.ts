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
  if (iso) return new Date(iso + "T00:00:00");
  // Approximate: assume ~11 days earlier each year from 2025
  const refYear = 2025;
  const refDate = new Date(RAMADAN_START_BY_YEAR[refYear] + "T00:00:00");
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

/** Check if a date falls within Ramadan (approximate). */
export function isRamadanDay(date: Date): boolean {
  const start = getRamadanStartForYear(date.getFullYear());
  const end = getRamadanEndForYear(date.getFullYear());
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d >= start && d <= end;
}

/** Get Ramadan day number (1–30) or null if not in Ramadan. */
export function getRamadanDayNumber(date: Date): number | null {
  if (!isRamadanDay(date)) return null;
  const start = getRamadanStartForYear(date.getFullYear());
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  start.setHours(0, 0, 0, 0);
  const diffTime = d.getTime() - start.getTime();
  return Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1;
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
