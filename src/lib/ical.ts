/**
 * Build iCalendar (.ics) content for export to Google Calendar, Apple Calendar, Outlook.
 * Events: suhoor, iftar, prayers, taraweeh, get food, custom.
 */

import type { PrayerTimes } from "@/hooks/usePrayerTimes";
import type { CalendarEvent, CalendarEventType } from "@/hooks/useLocalStorage";
import { toLocalDateString } from "@/lib/utils";

/** Map event type → summary and prayer time key for building ical from prayer times. */
const TYPE_TO_SUMMARY_AND_KEY: Array<{ type: CalendarEventType; summary: string; timeKey: keyof PrayerTimes }> = [
  { type: "suhoor", summary: "Suhoor ends (Imsak) • سحور", timeKey: "imsak" },
  { type: "iftar", summary: "Iftar (Maghrib) • إفطار", timeKey: "maghrib" },
  { type: "fajr", summary: "Fajr • الفجر", timeKey: "fajr" },
  { type: "dhuhr", summary: "Dhuhr • الظهر", timeKey: "dhuhr" },
  { type: "asr", summary: "Asr • العصر", timeKey: "asr" },
  { type: "maghrib", summary: "Maghrib • المغرب", timeKey: "maghrib" },
  { type: "isha", summary: "Isha • العشاء", timeKey: "isha" },
];

const ICS_HEADER = [
  "BEGIN:VCALENDAR",
  "VERSION:2.0",
  "PRODID:-//TryRamadan//EN",
  "CALSCALE:GREGORIAN",
  "METHOD:PUBLISH",
].join("\r\n");

const ICS_FOOTER = "END:VCALENDAR";

/** Strip optional suffix from time string (e.g. "05:15 (EAT)" → "05:15") so parsing is safe. */
function parseTimeForIcal(timeStr: string): { hour: number; min: number } {
  const clean = (timeStr ?? "").trim().split(" ")[0] ?? "";
  const parts = clean.split(":").map((p) => parseInt(p, 10));
  const hour = Number.isFinite(parts[0]) ? Math.max(0, Math.min(23, parts[0])) : 0;
  const min = Number.isFinite(parts[1]) ? Math.max(0, Math.min(59, parts[1])) : 0;
  return { hour, min };
}

/** Format date + time for iCal DTSTART/DTEND (local). YYYYMMDDTHHmmss. Defensive against invalid date/time. */
function formatIcalDateTime(dateStr: string, timeStr: string, durationMinutes: number = 0): { start: string; end: string } {
  const [y, m, d] = dateStr.split("-").map((p) => parseInt(p, 10));
  const { hour, min } = parseTimeForIcal(timeStr);
  const year = Number.isFinite(y) ? y : new Date().getFullYear();
  const month = Number.isFinite(m) ? Math.max(1, Math.min(12, m)) - 1 : 0;
  const day = Number.isFinite(d) ? Math.max(1, Math.min(31, d)) : 1;
  const start = new Date(year, month, day, hour, min, 0);
  const end = new Date(start.getTime() + Math.max(0, durationMinutes) * 60 * 1000);
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
  timezone?: string | null,
  location?: string | null,
  description?: string | null
): string {
  const { start, end } = formatIcalDateTime(dateStr, timeStr, durationMinutes);
  const dtStart = timezone ? `DTSTART;TZID=${timezone}:${start}` : `DTSTART:${start}`;
  const dtEnd = timezone ? `DTEND;TZID=${timezone}:${end}` : `DTEND:${end}`;
  const lines = [
    "BEGIN:VEVENT",
    `UID:${uid()}`,
    dtStart,
    dtEnd,
    `SUMMARY:${escapeIcalText(summary)}`,
  ];
  if (location?.trim()) lines.push(`LOCATION:${escapeIcalText(location.trim())}`);
  if (description?.trim()) lines.push(`DESCRIPTION:${escapeIcalText(description.trim())}`);
  lines.push("END:VEVENT");
  return lines.join("\r\n");
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
  /** "fasting" = Suhoor end + Iftar only; "full" = all five prayers + Taraweeh (default). Ignored when includeTypes is set. */
  exportMode?: ExportMode;
  /** When set, only these event types are included from prayer times; uses eventDurations for minutes. */
  includeTypes?: Partial<Record<CalendarEventType, boolean>>;
  /** Duration in minutes per type (used when includeTypes is set). */
  eventDurations?: Partial<Record<CalendarEventType, number>>;
  /** Mosque/location name for Taraweeh events */
  taraweehMosque?: string | null;
  /** Include meal blocking events (Suhoor prep, Iftar prep) */
  includeMealBlocking?: boolean;
}

const DEFAULT_DURATION: Partial<Record<CalendarEventType, number>> = {
  suhoor: 5, iftar: 10, fajr: 5, dhuhr: 5, asr: 5, maghrib: 5, isha: 5, taraweeh: 60,
};

/** Generate .ics file content. When timezone (IANA) is provided, events use TZID so Google/Apple Calendar show local time. */
export function buildIcalContent(options: ExportOptions): string {
  const {
    prayerTimesMap,
    customEvents,
    dateRange,
    includeTaraweeh = true,
    includePrayers = true,
    timezone,
    exportMode = "full",
    includeTypes,
    eventDurations,
    taraweehMosque,
    includeMealBlocking,
  } = options;
  const [startStr, endStr] = dateRange;
  if (!startStr || !endStr) return [ICS_HEADER, ICS_FOOTER].join("\r\n");
  const start = new Date(startStr + "T12:00:00");
  const end = new Date(endStr + "T12:00:00");
  if (!Number.isFinite(start.getTime()) || !Number.isFinite(end.getTime()) || start.getTime() > end.getTime()) {
    return [ICS_HEADER, ICS_FOOTER].join("\r\n");
  }
  const events: string[] = [];
  const tz = timezone && timezone.trim() ? timezone.trim() : undefined;
  const durations = { ...DEFAULT_DURATION, ...eventDurations };

  const d = new Date(start);
  d.setHours(0, 0, 0, 0);
  const endDay = new Date(end);
  endDay.setHours(23, 59, 59, 999);
  let lastPt: PrayerTimes | null = null;
  while (d.getTime() <= endDay.getTime()) {
    const dateStr = toLocalDateString(d);
    const pt = prayerTimesMap[dateStr] ?? (lastPt ? { ...lastPt, date: dateStr } : null);
    if (pt) lastPt = pt;
    if (includePrayers && pt) {
      if (includeTypes) {
        TYPE_TO_SUMMARY_AND_KEY.forEach(({ type, summary, timeKey }) => {
          if (includeTypes[type] !== false) {
            const time = (pt as unknown as Record<string, string>)[timeKey] ?? "";
            if (time && time.trim())
              events.push(eventToIcal(summary, dateStr, time, durations[type] ?? 5, tz));
          }
        });
        if (includeTypes.taraweeh !== false && pt.isha) {
          const [ih, im] = pt.isha.split(":").map(Number);
          const tm = (im || 0) + 30;
          const tHour = ih + 1 + Math.floor(tm / 60);
          const tMin = tm % 60;
          const tStr = `${tHour.toString().padStart(2, "0")}:${tMin.toString().padStart(2, "0")}`;
          events.push(eventToIcal("Taraweeh (optional) • تراويح", dateStr, tStr, durations.taraweeh ?? 60, tz, taraweehMosque, "Night prayer in Ramadan. One juz of the Quran is typically recited."));
        }
      } else {
        prayerTimesToEvents(dateStr, pt, includeTaraweeh, exportMode).forEach((e) => {
          if (e.time && e.time.trim()) {
            const isTaraweeh = e.summary.includes("Taraweeh");
            events.push(eventToIcal(e.summary, dateStr, e.time, e.durationMinutes, tz, isTaraweeh ? taraweehMosque : undefined, isTaraweeh ? "Night prayer in Ramadan. One juz of the Quran is typically recited." : undefined));
          }
        });
      }
      // Meal blocking events
      if (includeMealBlocking && pt.imsak && pt.maghrib) {
        const { hour: imsakH, min: imsakM } = parseTimeForIcal(pt.imsak);
        const suhoorPrepH = imsakH - 1 >= 0 ? imsakH - 1 : 23;
        const suhoorPrepStr = `${suhoorPrepH.toString().padStart(2, "0")}:${imsakM.toString().padStart(2, "0")}`;
        events.push(eventToIcal("🍽️ Suhoor Prep • تحضير السحور", dateStr, suhoorPrepStr, 60, tz, undefined, "Prepare and eat suhoor before the fast begins at Fajr."));
        const { hour: maghribH, min: maghribM } = parseTimeForIcal(pt.maghrib);
        const iftarPrepH = maghribH - 1 >= 0 ? maghribH - 1 : 23;
        const iftarPrepStr = `${iftarPrepH.toString().padStart(2, "0")}:${maghribM.toString().padStart(2, "0")}`;
        events.push(eventToIcal("🍽️ Iftar Prep • تحضير الإفطار", dateStr, iftarPrepStr, 60, tz, undefined, "Prepare iftar meal before breaking fast at Maghrib."));
      }
    }
    const dayEvents = customEvents[dateStr] ?? [];
    dayEvents.forEach((e) => {
      if (e.time && e.time.trim()) events.push(eventToIcal(e.title, dateStr, e.time, e.durationMinutes ?? 15, tz));
    });
    d.setDate(d.getDate() + 1);
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
