/**
 * Tests for iCal export: buildIcalContent date range, fasting vs full, timezone.
 */
import { describe, it, expect } from "vitest";
import { buildIcalContent } from "@/lib/ical";
import type { PrayerTimes } from "@/hooks/usePrayerTimes";
import { getRamadanDateRange } from "@/lib/ramadan";

const mockPrayerTimes: PrayerTimes = {
  fajr: "05:23",
  sunrise: "06:45",
  dhuhr: "12:15",
  asr: "15:30",
  maghrib: "18:45",
  isha: "20:00",
  imsak: "05:13",
  date: "01 Mar 2025",
};

function makePrayerTimesMap(startStr: string, endStr: string): Record<string, PrayerTimes> {
  const map: Record<string, PrayerTimes> = {};
  const start = new Date(startStr + "T00:00:00");
  const end = new Date(endStr + "T23:59:59");
  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    map[`${y}-${m}-${day}`] = mockPrayerTimes;
  }
  return map;
}

describe("buildIcalContent", () => {
  it("builds ics with correct date range and VCALENDAR structure", () => {
    const { startStr, endStr } = getRamadanDateRange();
    const prayerTimesMap = makePrayerTimesMap(startStr, endStr);

    const ics = buildIcalContent({
      prayerTimesMap,
      customEvents: {},
      dateRange: [startStr, endStr],
      includeTaraweeh: true,
      includePrayers: true,
    });

    expect(ics).toContain("BEGIN:VCALENDAR");
    expect(ics).toContain("VERSION:2.0");
    expect(ics).toContain("END:VCALENDAR");
    expect(ics).toContain("BEGIN:VEVENT");
    expect(ics).toContain("END:VEVENT");

    const eventCount = (ics.match(/BEGIN:VEVENT/g) ?? []).length;
    expect(eventCount).toBeGreaterThan(0);
  });

  it("fasting-only export includes only Suhoor end and Iftar per day", () => {
    const startStr = "2025-03-01";
    const endStr = "2025-03-03";
    const prayerTimesMap = makePrayerTimesMap(startStr, endStr);

    const ics = buildIcalContent({
      prayerTimesMap,
      customEvents: {},
      dateRange: [startStr, endStr],
      includeTaraweeh: false,
      includePrayers: true,
      exportMode: "fasting",
    });

    expect(ics).toContain("Suhoor ends (Imsak)");
    expect(ics).toContain("Iftar (Maghrib)");
    expect(ics).not.toContain("Fajr •");
    expect(ics).not.toContain("Dhuhr •");
    expect(ics).not.toContain("Taraweeh");
  });

  it("full export includes all prayers and Taraweeh", () => {
    const startStr = "2025-03-01";
    const endStr = "2025-03-01";
    const prayerTimesMap = makePrayerTimesMap(startStr, endStr);

    const ics = buildIcalContent({
      prayerTimesMap,
      customEvents: {},
      dateRange: [startStr, endStr],
      includeTaraweeh: true,
      includePrayers: true,
      exportMode: "full",
    });

    expect(ics).toContain("Suhoor ends (Imsak)");
    expect(ics).toContain("Fajr •");
    expect(ics).toContain("Iftar (Maghrib)");
    expect(ics).toContain("Taraweeh");
  });

  it("adds TZID to DTSTART/DTEND when timezone provided", () => {
    const startStr = "2025-03-01";
    const endStr = "2025-03-01";
    const prayerTimesMap = makePrayerTimesMap(startStr, endStr);

    const ics = buildIcalContent({
      prayerTimesMap,
      customEvents: {},
      dateRange: [startStr, endStr],
      exportMode: "fasting",
      timezone: "America/New_York",
    });

    expect(ics).toContain("DTSTART;TZID=America/New_York:");
    expect(ics).toContain("DTEND;TZID=America/New_York:");
  });

  it("includes custom events from customEvents map", () => {
    const startStr = "2025-03-01";
    const endStr = "2025-03-01";
    const prayerTimesMap = makePrayerTimesMap(startStr, endStr);

    const ics = buildIcalContent({
      prayerTimesMap,
      customEvents: {
        "2025-03-01": [
          { title: "Break fast early", time: "18:00", durationMinutes: 15 },
        ],
      },
      dateRange: [startStr, endStr],
      exportMode: "fasting",
    });

    expect(ics).toContain("Break fast early");
  });
});
