import { useState, useEffect, useCallback } from 'react';
import { toLocalDateString } from '@/lib/utils';
import { getRamadanDateRange } from '@/lib/ramadan';

export interface PrayerTimes {
  fajr: string;
  sunrise: string;
  dhuhr: string;
  asr: string;
  maghrib: string;
  isha: string;
  imsak: string;  // Suhoor cutoff
  date: string;
}

interface AladhanResponse {
  code: number;
  status: string;
  data: {
    timings: {
      Fajr: string;
      Sunrise: string;
      Dhuhr: string;
      Asr: string;
      Maghrib: string;
      Isha: string;
      Imsak: string;
    };
    date: {
      readable: string;
      hijri: {
        day: string;
        month: { en: string; ar: string; number: number };
        year: string;
      };
    };
  };
}

/** Today's date as YYYY-MM-DD in local timezone (updates at midnight local). */
function useTodayStr() {
  const [todayStr, setTodayStr] = useState(() => toLocalDateString(new Date()));
  useEffect(() => {
    const tick = () => {
      const next = toLocalDateString(new Date());
      setTodayStr((prev) => (prev !== next ? next : prev));
    };
    const t = setInterval(tick, 60 * 1000); // check every minute for date change
    return () => clearInterval(t);
  }, []);
  return todayStr;
}

/** Format YYYY-MM-DD or Date to DD-MM-YYYY for Aladhan API (padded). */
function toAladhanDateStr(date: Date): string {
  const d = String(date.getDate()).padStart(2, '0');
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const y = date.getFullYear();
  return `${d}-${m}-${y}`;
}

export function usePrayerTimes(lat: number | null, lng: number | null) {
  const [prayerTimes, setPrayerTimes] = useState<PrayerTimes | null>(null);
  const [hijriDate, setHijriDate] = useState<{ day: string; month: string; monthAr: string; year: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const todayStr = useTodayStr();

  const fetchPrayerTimes = useCallback(async () => {
    if (!lat || !lng) return;
    setLoading(true);
    setError(null);
    try {
      const [y, m, d] = todayStr.split('-').map(Number);
      const date = new Date(y, m - 1, d);
      const dateStr = toAladhanDateStr(date);
      const response = await fetch(
        `https://api.aladhan.com/v1/timings/${dateStr}?latitude=${lat}&longitude=${lng}&method=2`
      );
      if (!response.ok) throw new Error('Failed to fetch prayer times');
      const data: AladhanResponse = await response.json();
      if (data.code === 200) {
        setPrayerTimes({
          fajr: data.data.timings.Fajr,
          sunrise: data.data.timings.Sunrise,
          dhuhr: data.data.timings.Dhuhr,
          asr: data.data.timings.Asr,
          maghrib: data.data.timings.Maghrib,
          isha: data.data.timings.Isha,
          imsak: data.data.timings.Imsak,
          date: data.data.date.readable,
        });
        setHijriDate({
          day: data.data.date.hijri.day,
          month: data.data.date.hijri.month.en,
          monthAr: data.data.date.hijri.month.ar,
          year: data.data.date.hijri.year,
        });
      }
    } catch (err) {
      console.error('Prayer times error:', err);
      setError(err instanceof Error ? err.message : 'Failed to load prayer times');
    } finally {
      setLoading(false);
    }
  }, [lat, lng, todayStr]);

  useEffect(() => {
    if (!lat || !lng) return;
    fetchPrayerTimes();
  }, [lat, lng, fetchPrayerTimes]);

  return { prayerTimes, hijriDate, loading, error, refetch: fetchPrayerTimes };
}

/** Format YYYY-MM-DD to DD-MM-YYYY for Aladhan API */
function toAladhanDate(isoDate: string): string {
  const [y, m, d] = isoDate.split('-');
  return `${d}-${m}-${y}`;
}

/** Fetch prayer times for a specific date (ISO YYYY-MM-DD). Used for day view / click-through days. */
export function usePrayerTimesForDate(
  lat: number | null,
  lng: number | null,
  isoDate: string | null
) {
  const [prayerTimes, setPrayerTimes] = useState<PrayerTimes | null>(null);
  const [hijriDate, setHijriDate] = useState<{ day: string; month: string; monthAr: string; year: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!lat || !lng || !isoDate) {
      setPrayerTimes(null);
      setHijriDate(null);
      return;
    }

    const dateStr = toAladhanDate(isoDate);

    const fetchPrayerTimes = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(
          `https://api.aladhan.com/v1/timings/${dateStr}?latitude=${lat}&longitude=${lng}&method=2`
        );
        if (!response.ok) throw new Error('Failed to fetch prayer times');
        const data: AladhanResponse = await response.json();
        if (data.code === 200) {
          setPrayerTimes({
            fajr: data.data.timings.Fajr,
            sunrise: data.data.timings.Sunrise,
            dhuhr: data.data.timings.Dhuhr,
            asr: data.data.timings.Asr,
            maghrib: data.data.timings.Maghrib,
            isha: data.data.timings.Isha,
            imsak: data.data.timings.Imsak,
            date: data.data.date.readable,
          });
          setHijriDate({
            day: data.data.date.hijri.day,
            month: data.data.date.hijri.month.en,
            monthAr: data.data.date.hijri.month.ar,
            year: data.data.date.hijri.year,
          });
        }
      } catch (err) {
        console.error('Prayer times for date error:', err);
        setError(err instanceof Error ? err.message : 'Failed to load prayer times');
      } finally {
        setLoading(false);
      }
    };

    fetchPrayerTimes();
  }, [lat, lng, isoDate]);

  return { prayerTimes, hijriDate, loading, error };
}

/** Strip " (GMT)" or " (BST)" etc. from API time string to get HH:mm */
function stripTimeSuffix(s: string): string {
  if (!s) return '';
  const i = s.indexOf(' ');
  return i >= 0 ? s.slice(0, i) : s;
}

/** Aladhan calendar API: returns prayer times for each day of a month. */
interface AladhanCalendarDay {
  timings: {
    Fajr?: string;
    Sunrise?: string;
    Dhuhr?: string;
    Asr?: string;
    Maghrib?: string;
    Isha?: string;
    Imsak?: string;
  };
  date?: {
    readable?: string;
    gregorian?: { date?: string; day?: string; month?: { number?: number }; year?: string };
  };
}

/** Fetch prayer times for a full month (for iCal export). Returns Record<YYYY-MM-DD, PrayerTimes>. */
export async function fetchPrayerTimesForMonth(
  lat: number,
  lng: number,
  year: number,
  month: number
): Promise<Record<string, PrayerTimes>> {
  const response = await fetch(
    `https://api.aladhan.com/v1/calendar?latitude=${lat}&longitude=${lng}&method=2&month=${month}&year=${year}`
  );
  if (!response.ok) throw new Error('Failed to fetch prayer times calendar');
  const json = await response.json();
  const days: AladhanCalendarDay[] = json.data ?? [];
  const out: Record<string, PrayerTimes> = {};
  days.forEach((day) => {
    const greg = day.date?.gregorian;
    if (!greg || !day.timings) return;
    const d = greg.day?.padStart(2, '0') ?? '';
    const m = String(greg.month?.number ?? '').padStart(2, '0');
    const y = greg.year ?? '';
    if (!d || !m || !y) return;
    const iso = `${y}-${m}-${d}`;
    out[iso] = {
      fajr: stripTimeSuffix(day.timings.Fajr ?? ''),
      sunrise: stripTimeSuffix(day.timings.Sunrise ?? ''),
      dhuhr: stripTimeSuffix(day.timings.Dhuhr ?? ''),
      asr: stripTimeSuffix(day.timings.Asr ?? ''),
      maghrib: stripTimeSuffix(day.timings.Maghrib ?? ''),
      isha: stripTimeSuffix(day.timings.Isha ?? ''),
      imsak: stripTimeSuffix(day.timings.Imsak ?? ''),
      date: day.date?.readable ?? iso,
    };
  });
  return out;
}

const RAMADAN_PRAYERS_CACHE_KEY = 'tryramadan-ramadan-prayers';
const CACHE_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

interface RamadanPrayersCacheEntry {
  prayerTimesMap: Record<string, PrayerTimes>;
  fetchedAt: number;
}

function getRamadanPrayersCache(): Record<string, RamadanPrayersCacheEntry> {
  try {
    const raw = window.localStorage.getItem(RAMADAN_PRAYERS_CACHE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function setRamadanPrayersCache(cache: Record<string, RamadanPrayersCacheEntry>) {
  try {
    window.localStorage.setItem(RAMADAN_PRAYERS_CACHE_KEY, JSON.stringify(cache));
  } catch (e) {
    console.warn('Ramadan prayers cache write failed', e);
  }
}

/** Fetch prayer times for the full Ramadan month (current/next). Covers Ramadan spanning two Gregorian months. */
export async function fetchRamadanPrayerTimes(
  lat: number,
  lng: number
): Promise<Record<string, PrayerTimes>> {
  const { startStr, endStr, startDate, endDate, year } = getRamadanDateRange();
  const out: Record<string, PrayerTimes> = {};
  const startYear = startDate.getFullYear();
  const endYear = endDate.getFullYear();
  for (let y = startYear; y <= endYear; y++) {
    for (let m = 1; m <= 12; m++) {
      const monthStart = new Date(y, m - 1, 1);
      const monthEnd = new Date(y, m, 0);
      if (monthEnd < startDate || monthStart > endDate) continue;
      const data = await fetchPrayerTimesForMonth(lat, lng, y, m);
      Object.assign(out, data);
    }
  }
  return out;
}

/** Cache key for Ramadan prayer times (location + Ramadan year). */
export function getRamadanPrayersCacheKey(lat: number, lng: number, ramadanYear: number): string {
  return `${lat.toFixed(4)}_${lng.toFixed(4)}_${ramadanYear}`;
}

/** Hook: Ramadan prayer times for the full month. Caches in localStorage by location + Ramadan year. */
export function useRamadanPrayerTimes(lat: number | null, lng: number | null) {
  const [prayerTimesMap, setPrayerTimesMap] = useState<Record<string, PrayerTimes>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { startStr, endStr, year } = getRamadanDateRange();
  const cacheKey = lat != null && lng != null ? getRamadanPrayersCacheKey(lat, lng, year) : null;

  const fetchAndCache = useCallback(async () => {
    if (lat == null || lng == null) return;
    setLoading(true);
    setError(null);
    try {
      const map = await fetchRamadanPrayerTimes(lat, lng);
      setPrayerTimesMap(map);
      const cache = getRamadanPrayersCache();
      cache[cacheKey!] = { prayerTimesMap: map, fetchedAt: Date.now() };
      setRamadanPrayersCache(cache);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load Ramadan prayer times');
    } finally {
      setLoading(false);
    }
  }, [lat, lng, cacheKey]);

  useEffect(() => {
    if (lat == null || lng == null) {
      setPrayerTimesMap({});
      setError(null);
      return;
    }
    const cache = getRamadanPrayersCache();
    const entry = cache[cacheKey!];
    if (entry && Date.now() - entry.fetchedAt < CACHE_MAX_AGE_MS) {
      setPrayerTimesMap(entry.prayerTimesMap);
      setError(null);
      return;
    }
    fetchAndCache();
  }, [lat, lng, cacheKey, fetchAndCache]);

  return { prayerTimesMap, loading, error, refetch: fetchAndCache };
}

// Check if today is a Sunnah fasting day
export function getSunnahFastingInfo(): { isSunnahDay: boolean; reason: string; reasonAr: string } | null {
  const today = new Date();
  const dayOfWeek = today.getDay();

  // Monday (1) or Thursday (4)
  if (dayOfWeek === 1) {
    return {
      isSunnahDay: true,
      reason: "Monday - Sunnah fasting day",
      reasonAr: "الإثنين - يوم صيام سنة"
    };
  }

  if (dayOfWeek === 4) {
    return {
      isSunnahDay: true,
      reason: "Thursday - Sunnah fasting day",
      reasonAr: "الخميس - يوم صيام سنة"
    };
  }

  return null;
}

// Get Islamic lunar calendar info for Ayyam al-Beed (13th, 14th, 15th of lunar month)
export async function checkAyyamAlBeed(lat: number, lng: number): Promise<{ isAyyamAlBeed: boolean; hijriDay: number } | null> {
  try {
    const today = new Date();
    const dateStr = `${today.getDate()}-${today.getMonth() + 1}-${today.getFullYear()}`;
    
    const response = await fetch(
      `https://api.aladhan.com/v1/timings/${dateStr}?latitude=${lat}&longitude=${lng}&method=2`
    );

    if (!response.ok) return null;

    const data: AladhanResponse = await response.json();
    const hijriDay = parseInt(data.data.date.hijri.day);

    if (hijriDay >= 13 && hijriDay <= 15) {
      return { isAyyamAlBeed: true, hijriDay };
    }

    return { isAyyamAlBeed: false, hijriDay };
  } catch {
    return null;
  }
}
