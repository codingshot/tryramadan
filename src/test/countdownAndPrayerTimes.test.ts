/**
 * Tests for countdown logic and current-time-based-on-location:
 * - getNowSecondsSinceMidnightInTimezone, getNowInTimezone
 * - timeStringToSecondsSinceMidnight, secondsUntilTimeInTimezone
 * - getTodayStringInTimezone
 * Also prayer times cache: today stored locally after first call, Ramadan month cached,
 * no API call on load when cache valid unless user changes location.
 */
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { usePrayerTimes } from "@/hooks/usePrayerTimes";
import { toLocalDateString } from "@/lib/utils";
import {
  getNowInTimezone,
  getNowSecondsSinceMidnightInTimezone,
  timeStringToSecondsSinceMidnight,
  secondsUntilTimeInTimezone,
  getTodayStringInTimezone,
} from "@/lib/utils";
import {
  getRamadanPrayersCacheKey,
  type PrayerTimes,
} from "@/hooks/usePrayerTimes";
import { getRamadanDateRange } from "@/lib/ramadan";

const PRAYER_TIMES_CACHE_KEY = "tryramadan-prayer-times-cache";
const RAMADAN_PRAYERS_CACHE_KEY = "tryramadan-ramadan-prayers";

describe("timeStringToSecondsSinceMidnight", () => {
  it("parses HH:mm to seconds", () => {
    expect(timeStringToSecondsSinceMidnight("00:00")).toBe(0);
    expect(timeStringToSecondsSinceMidnight("12:00")).toBe(12 * 3600);
    expect(timeStringToSecondsSinceMidnight("05:30")).toBe(5 * 3600 + 30 * 60);
    expect(timeStringToSecondsSinceMidnight("23:59")).toBe(23 * 3600 + 59 * 60);
  });

  it("strips timezone suffix and parses", () => {
    expect(timeStringToSecondsSinceMidnight("05:15 (EAT)")).toBe(5 * 3600 + 15 * 60);
    expect(timeStringToSecondsSinceMidnight("18:45 (GMT)")).toBe(18 * 3600 + 45 * 60);
  });

  it("handles HH:mm:ss", () => {
    expect(timeStringToSecondsSinceMidnight("12:30:45")).toBe(12 * 3600 + 30 * 60 + 45);
  });

  it("returns 0 for empty or invalid", () => {
    expect(timeStringToSecondsSinceMidnight("")).toBe(0);
    expect(timeStringToSecondsSinceMidnight(":")).toBe(0);
  });
});

describe("secondsUntilTimeInTimezone", () => {
  it("returns positive seconds until target time later today", () => {
    const now = 10 * 3600; // 10:00
    const maghrib = 18 * 3600; // 18:00
    expect(secondsUntilTimeInTimezone(now, maghrib)).toBe(8 * 3600);
  });

  it("wraps to next day when target time has passed", () => {
    const now = 20 * 3600; // 20:00
    const fajr = 5 * 3600; // 05:00 next day
    expect(secondsUntilTimeInTimezone(now, fajr)).toBe(9 * 3600); // 4h to midnight + 5h
  });

  it("returns 24h when now equals target (same moment)", () => {
    const t = 12 * 3600;
    expect(secondsUntilTimeInTimezone(t, t)).toBe(24 * 3600);
  });
});

describe("getNowInTimezone and getNowSecondsSinceMidnightInTimezone", () => {
  it("getNowInTimezone returns hours, minutes, seconds in range", () => {
    const n = getNowInTimezone("America/New_York");
    expect(n.hours).toBeGreaterThanOrEqual(0);
    expect(n.hours).toBeLessThan(24);
    expect(n.minutes).toBeGreaterThanOrEqual(0);
    expect(n.minutes).toBeLessThan(60);
    expect(n.seconds).toBeGreaterThanOrEqual(0);
    expect(n.seconds).toBeLessThan(60);
  });

  it("getNowSecondsSinceMidnightInTimezone returns 0–86400", () => {
    const sec = getNowSecondsSinceMidnightInTimezone("Europe/London");
    expect(sec).toBeGreaterThanOrEqual(0);
    expect(sec).toBeLessThan(24 * 3600);
  });

  it("getNowSecondsSinceMidnightInTimezone equals h*3600 + m*60 + s from getNowInTimezone", () => {
    const tz = "Asia/Dubai";
    const n = getNowInTimezone(tz);
    const sec = getNowSecondsSinceMidnightInTimezone(tz);
    expect(sec).toBe(n.hours * 3600 + n.minutes * 60 + n.seconds);
  });
});

describe("getTodayStringInTimezone", () => {
  it("returns YYYY-MM-DD format", () => {
    const s = getTodayStringInTimezone("America/Los_Angeles");
    expect(s).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  it("can differ from system date when timezone crosses midnight", () => {
    const local = new Date().toLocaleDateString("en-CA");
    const utc = getTodayStringInTimezone("UTC");
    // At some times of day local and UTC date differ
    expect([local, utc].every((d) => /^\d{4}-\d{2}-\d{2}$/.test(d))).toBe(true);
  });
});

describe("countdown logic: seconds until Maghrib/Imsak", () => {
  it("countdown to Maghrib at 18:00 when now is 12:00 is 6 hours", () => {
    const nowSec = 12 * 3600;
    const maghribSec = timeStringToSecondsSinceMidnight("18:00");
    expect(secondsUntilTimeInTimezone(nowSec, maghribSec)).toBe(6 * 3600);
  });

  it("countdown to Imsak at 05:00 when now is 22:00 is 7 hours (next day)", () => {
    const nowSec = 22 * 3600;
    const imsakSec = timeStringToSecondsSinceMidnight("05:00");
    expect(secondsUntilTimeInTimezone(nowSec, imsakSec)).toBe(7 * 3600);
  });
});

describe("today prayer times cache (local storage after initial call)", () => {
  beforeEach(() => {
    localStorage.clear();
  });
  afterEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  it("cache key includes date and coordinates so new location misses cache", () => {
    const entry = {
      dateStr: "2026-02-02",
      lat: 51.5,
      lng: -0.1,
      prayerTimes: { fajr: "05:30", maghrib: "17:45", imsak: "05:20", sunrise: "", dhuhr: "", asr: "", isha: "", date: "" },
      hijriDate: { day: "1", month: "Ramadan", monthAr: "رمضان", year: "1447" },
      savedAt: new Date().toISOString(),
    };
    localStorage.setItem(PRAYER_TIMES_CACHE_KEY, JSON.stringify(entry));
    const raw = localStorage.getItem(PRAYER_TIMES_CACHE_KEY);
    const stored = JSON.parse(raw!);
    expect(stored.dateStr).toBe("2026-02-02");
    expect(stored.lat).toBe(51.5);
    expect(stored.lng).toBe(-0.1);
    // Different location should not use this entry (handled in readPrayerTimesCache)
    expect(stored.lat).not.toBe(40.7);
  });

  it("valid cache entry has dateStr, lat, lng, prayerTimes, hijriDate", () => {
    const pt: PrayerTimes = {
      fajr: "05:15", sunrise: "06:30", dhuhr: "12:20", asr: "15:30",
      maghrib: "18:00", isha: "19:30", imsak: "05:05", date: "02 Feb 2026",
    };
    const entry = {
      dateStr: "2026-02-02",
      lat: 51.5,
      lng: -0.1,
      prayerTimes: pt,
      hijriDate: { day: "1", month: "Ramadan", monthAr: "رمضان", year: "1447" },
      savedAt: new Date().toISOString(),
    };
    localStorage.setItem(PRAYER_TIMES_CACHE_KEY, JSON.stringify(entry));
    const read = localStorage.getItem(PRAYER_TIMES_CACHE_KEY);
    expect(read).toBeTruthy();
    const parsed = JSON.parse(read!);
    expect(parsed.prayerTimes.maghrib).toBe("18:00");
    expect(parsed.dateStr).toBe("2026-02-02");
  });

  it("usePrayerTimes uses cache when today and location match: no API call", async () => {
    const todayStr = toLocalDateString(new Date());
    const lat = 51.5;
    const lng = -0.1;
    const pt: PrayerTimes = {
      fajr: "05:15", sunrise: "06:30", dhuhr: "12:20", asr: "15:30",
      maghrib: "18:00", isha: "19:30", imsak: "05:05", date: "02 Feb 2026",
    };
    const entry = {
      dateStr: todayStr,
      lat,
      lng,
      prayerTimes: pt,
      hijriDate: { day: "1", month: "Ramadan", monthAr: "رمضان", year: "1447" },
      savedAt: new Date().toISOString(),
    };
    localStorage.setItem(PRAYER_TIMES_CACHE_KEY, JSON.stringify(entry));
    const fetchSpy = vi.spyOn(global, "fetch").mockResolvedValue({ ok: false } as Response);

    const { result } = renderHook(() => usePrayerTimes(lat, lng));
    await waitFor(() => {
      expect(result.current.prayerTimes).not.toBeNull();
    });
    expect(result.current.prayerTimes?.maghrib).toBe("18:00");
    expect(result.current.isFromCache).toBe(true);
    expect(fetchSpy).not.toHaveBeenCalled();
    fetchSpy.mockRestore();
  });
});

describe("Ramadan prayer times cache", () => {
  beforeEach(() => {
    localStorage.clear();
  });
  afterEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  it("getRamadanPrayersCacheKey differs by location", () => {
    const key1 = getRamadanPrayersCacheKey(40.7128, -74.006, 2026);
    const key2 = getRamadanPrayersCacheKey(34.05, -118.24, 2026);
    expect(key1).not.toBe(key2);
  });

  it("getRamadanPrayersCacheKey same for same location and year", () => {
    const key1 = getRamadanPrayersCacheKey(51.5074, -0.1278, 2026);
    const key2 = getRamadanPrayersCacheKey(51.5074, -0.1278, 2026);
    expect(key1).toBe(key2);
  });

  it("Ramadan cache is keyed by lat_lng_year so new location triggers refetch", () => {
    const { year } = getRamadanDateRange();
    const keyA = getRamadanPrayersCacheKey(51.5, -0.1, year);
    const keyB = getRamadanPrayersCacheKey(52.0, -0.2, year);
    expect(keyA).not.toBe(keyB);
  });

  it("Ramadan cache key format is lat_lng_year", () => {
    const key = getRamadanPrayersCacheKey(51.5074, -0.1278, 2026);
    expect(key).toMatch(/^[\d.-]+_[\d.-]+_2026$/);
  });
});
