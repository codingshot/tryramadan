/**
 * Build iCalendar (.ics) content for export to Google Calendar, Apple Calendar, Outlook.
 * Events: suhoor, iftar, prayers, taraweeh, get food, custom.
 */

import type { PrayerTimes } from "@/hooks/usePrayerTimes";
import type { CalendarEvent } from "@/hooks/useLocalStorage";
import { toLocalDateString } from "@/lib/utils";

const ICS_HEADER = [
  "BEGIN:VCALENDAR",
  "VERSION:2.0",
  "PRODID:-//TryRamadan//EN",
  "CALSCALE:GREGORIAN",
  "METHOD:PUBLISH",
].join("\r\n");

const ICS_FOOTER = "END:VCALENDAR";

/** Format date + time for iCal DTSTART/DTEND (local). YYYYMMDDTHHmmss */
function formatIcalDateTime(dateStr: string, timeStr: string, durationMinutes: number = 0): { start: string; end: string } {
  const [y, m, d] = dateStr.split("-").map(Number);
  const [hour, min] = timeStr.split(":").map(Number);
  const start = new Date(y, m - 1, d, hour, min, 0);
  const end = new Date(start.getTime() + durationMinutes * 60 * 1000);
  const pad = (n: number) => n.toString().padStart(2, "0");
  return {
    start: `${start.getFullYear()}${pad(start.getMonth() + 1)}${pad(start.getDate())}T${pad(start.getHours())}${pad(start.getMinutes())}${pad(start.getSeconds())}`,
    end: `${end.getFullYear()}${pad(end.getMonth() + 1)}${pad(end.getDate())}T${pad(end.getHours())}${pad(end.getMinutes())}${pad(end.getSeconds())}`,
  };
}

function escapeIcalText(s: string): string {
  return s.replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\n/g, "\\n");
}

function uid(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 11)}@tryramadan`;
}

/** Single VEVENT block. When timezone (IANA) is set, DTSTART/DTEND use TZID so calendar apps show local time. */
function eventToIcal(
  summary: string,
  dateStr: string,
  timeStr: string,
  durationMinutes: number = 15,
  timezone?: string | null
): string {
  const { start, end } = formatIcalDateTime(dateStr, timeStr, durationMinutes);
  const dtStart = timezone ? `DTSTART;TZID=${timezone}:${start}` : `DTSTART:${start}`;
  const dtEnd = timezone ? `DTEND;TZID=${timezone}:${end}` : `DTEND:${end}`;
  return [
    "BEGIN:VEVENT",
    `UID:${uid()}`,
    dtStart,
    dtEnd,
    `SUMMARY:${escapeIcalText(summary)}`,
    "END:VEVENT",
  ].join("\r\n");
}

/** "Fasting only" = Suhoor end + Iftar; "Full" = all five prayers + Taraweeh. */
export type ExportMode = "fasting" | "full";

/** Prayer times for one day → event titles and times. When mode is "fasting", only Suhoor end and Iftar. */
function prayerTimesToEvents(_dateStr: string, pt: PrayerTimes, includeTaraweeh: boolean, exportMode: ExportMode): Array<{ summary: string; time: string; durationMinutes: number }> {
  if (exportMode === "fasting") {
    return [
      { summary: "Suhoor ends (Imsak) • سحور", time: pt.imsak, durationMinutes: 5 },
      { summary: "Iftar (Maghrib) • إفطار", time: pt.maghrib, durationMinutes: 10 },
    ];
  }
  const out: Array<{ summary: string; time: string; durationMinutes: number }> = [
    { summary: "Suhoor ends (Imsak) • سحور", time: pt.imsak, durationMinutes: 5 },
    { summary: "Fajr • الفجر", time: pt.fajr, durationMinutes: 5 },
    { summary: "Dhuhr • الظهر", time: pt.dhuhr, durationMinutes: 5 },
    { summary: "Asr • العصر", time: pt.asr, durationMinutes: 5 },
    { summary: "Iftar (Maghrib) • إفطار", time: pt.maghrib, durationMinutes: 10 },
    { summary: "Isha • العشاء", time: pt.isha, durationMinutes: 5 },
  ];
  if (includeTaraweeh && pt.isha) {
    const [ih, im] = pt.isha.split(":").map(Number);
    const th = ih + 1;
    const tm = (im || 0) + 30;
    const tHour = th + Math.floor(tm / 60);
    const tMin = tm % 60;
    const tStr = `${tHour.toString().padStart(2, "0")}:${tMin.toString().padStart(2, "0")}`;
    out.push({ summary: "Taraweeh (optional) • تراويح", time: tStr, durationMinutes: 60 });
  }
  return out;
}

export interface ExportOptions {
  /** Include Suhoor / Iftar / prayers from prayerTimesMap (dateStr -> PrayerTimes) */
  prayerTimesMap: Record<string, PrayerTimes>;
  /** User-added calendar events (from useCalendarEvents) */
  customEvents: Record<string, CalendarEvent[]>;
  /** Date range [start, end] (YYYY-MM-DD) */
  dateRange: [string, string];
  /** Include Taraweeh (approx 90 min after Isha) */
  includeTaraweeh?: boolean;
  /** Include all 5 prayers + Suhoor/Iftar from API */
  includePrayers?: boolean;
  /** IANA timezone (e.g. America/New_York) so events show in user's local time in calendar apps */
  timezone?: string | null;
  /** "fasting" = Suhoor end + Iftar only; "full" = all five prayers + Taraweeh (default) */
  exportMode?: ExportMode;
}

/** Generate .ics file content. When timezone (IANA) is provided, events use TZID so Google/Apple Calendar show local time. */
export function buildIcalContent(options: ExportOptions): string {
  const { prayerTimesMap, customEvents, dateRange, includeTaraweeh = true, includePrayers = true, timezone, exportMode = "full" } = options;
  const [startStr, endStr] = dateRange;
  const start = new Date(startStr + "T00:00:00");
  const end = new Date(endStr + "T23:59:59");
  const events: string[] = [];
  const tz = timezone && timezone.trim() ? timezone.trim() : undefined;

  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    const dateStr = toLocalDateString(d);
    const pt = prayerTimesMap[dateStr];
    if (includePrayers && pt) {
      prayerTimesToEvents(dateStr, pt, includeTaraweeh, exportMode).forEach((e) => {
        events.push(eventToIcal(e.summary, dateStr, e.time, e.durationMinutes, tz));
      });
    }
    const dayEvents = customEvents[dateStr] ?? [];
    dayEvents.forEach((e) => {
      events.push(eventToIcal(e.title, dateStr, e.time, e.durationMinutes ?? 15, tz));
    });
  }

  return [ICS_HEADER, ...events, ICS_FOOTER].join("\r\n");
}

/** Trigger download of .ics file */
export function downloadIcal(contents: string, filename: string = "tryramadan-calendar.ics") {
  const blob = new Blob([contents], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
