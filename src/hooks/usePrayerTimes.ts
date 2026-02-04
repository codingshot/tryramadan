import { useState, useEffect, useCallback } from 'react';
import { toLocalDateString } from '@/lib/utils';
import { getRamadanDateRange, type RamadanOverrideInput } from '@/lib/ramadan';
import { API_CONFIG } from '@/lib/config';
import { useUserPreferences } from '@/hooks/useLocalStorage';

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

/** Merge API prayer times with per-date overrides. Override keys: imsak, fajr, dhuhr, asr, maghrib, isha. */
export function getEffectivePrayerTimes(
  apiTimes: PrayerTimes | null,
  overrides: Partial<PrayerTimes> | null | undefined
): PrayerTimes | null {
  if (!apiTimes) return null;
  if (!overrides || Object.keys(overrides).length === 0) return apiTimes;
  return {
    ...apiTimes,
    ...(overrides.imsak != null && overrides.imsak.trim() !== '' && { imsak: overrides.imsak.trim() }),
    ...(overrides.fajr != null && overrides.fajr.trim() !== '' && { fajr: overrides.fajr.trim() }),
    ...(overrides.dhuhr != null && overrides.dhuhr.trim() !== '' && { dhuhr: overrides.dhuhr.trim() }),
    ...(overrides.asr != null && overrides.asr.trim() !== '' && { asr: overrides.asr.trim() }),
    ...(overrides.maghrib != null && overrides.maghrib.trim() !== '' && { maghrib: overrides.maghrib.trim() }),
    ...(overrides.isha != null && overrides.isha.trim() !== '' && { isha: overrides.isha.trim() }),
  };
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

const PRAYER_TIMES_CACHE_KEY = 'tryramadan-prayer-times-cache';

interface PrayerTimesCacheEntry {
  dateStr: string;
  lat: number;
  lng: number;
  prayerTimes: PrayerTimes;
  hijriDate: { day: string; month: string; monthAr: string; year: string };
  savedAt: string;
}

function readPrayerTimesCache(dateStr: string, lat: number, lng: number): PrayerTimesCacheEntry | null {
  try {
    const raw = localStorage.getItem(PRAYER_TIMES_CACHE_KEY);
    if (!raw) return null;
    const entry = JSON.parse(raw) as PrayerTimesCacheEntry;
    if (entry.dateStr !== dateStr || entry.lat !== lat || entry.lng !== lng) return null;
    return entry;
  } catch {
    return null;
  }
}

function writePrayerTimesCache(
  dateStr: string,
  lat: number,
  lng: number,
  prayerTimes: PrayerTimes,
  hijriDate: { day: string; month: string; monthAr: string; year: string }
) {
  try {
    const entry: PrayerTimesCacheEntry = {
      dateStr,
      lat,
      lng,
      prayerTimes,
      hijriDate,
      savedAt: new Date().toISOString(),
    };
    localStorage.setItem(PRAYER_TIMES_CACHE_KEY, JSON.stringify(entry));
  } catch {
    // ignore
  }
}

/** Strip " (GMT)" or " (EAT)" etc. from API time string to get HH:mm. Aladhan can return "05:15 (EAT)". */
function stripTimeSuffix(s: string): string {
  if (!s) return '';
  const i = s.indexOf(' ');
  return i >= 0 ? s.slice(0, i).trim() : s;
}

/** Format YYYY-MM-DD or Date to DD-MM-YYYY for Aladhan API (padded). */
function toAladhanDateStr(date: Date): string {
  const d = String(date.getDate()).padStart(2, '0');
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const y = date.getFullYear();
  return `${d}-${m}-${y}`;
}

/** Today's date YYYY-MM-DD in the given IANA timezone (for prayer times when location overrides system clock). */
function getTodayStrInTimezone(timeZone: string): string {
  return new Date().toLocaleDateString('en-CA', { timeZone });
}

export function usePrayerTimes(lat: number | null, lng: number | null, displayTimezone?: string | null) {
  const [prayerTimes, setPrayerTimes] = useState<PrayerTimes | null>(null);
  const [hijriDate, setHijriDate] = useState<{ day: string; month: string; monthAr: string; year: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isFromCache, setIsFromCache] = useState(false);
  const todayStrLocal = useTodayStr();
  const [todayStrInTz, setTodayStrInTz] = useState(() =>
    displayTimezone ? getTodayStrInTimezone(displayTimezone) : todayStrLocal
  );
  const todayStr = displayTimezone ? todayStrInTz : todayStrLocal;
  useEffect(() => {
    if (!displayTimezone) return;
    const tick = () => setTodayStrInTz(getTodayStrInTimezone(displayTimezone));
    tick();
    const t = setInterval(tick, 60 * 1000);
    return () => clearInterval(t);
  }, [displayTimezone]);

  const fetchPrayerTimes = useCallback(async () => {
    if (!lat || !lng) return;
    setLoading(true);
    setError(null);
    setIsFromCache(false);
    try {
      const [y, m, d] = todayStr.split('-').map(Number);
      const date = new Date(y, m - 1, d);
      const dateStr = toAladhanDateStr(date);
      const response = await fetch(
        `${API_CONFIG.aladhan}/v1/timings/${dateStr}?latitude=${lat}&longitude=${lng}&method=2`
      );
      if (!response.ok) throw new Error('Failed to fetch prayer times');
      const data: AladhanResponse = await response.json();
      if (data.code === 200) {
        const t = data.data.timings;
        const pt = {
          fajr: stripTimeSuffix(t.Fajr ?? ''),
          sunrise: stripTimeSuffix(t.Sunrise ?? ''),
          dhuhr: stripTimeSuffix(t.Dhuhr ?? ''),
          asr: stripTimeSuffix(t.Asr ?? ''),
          maghrib: stripTimeSuffix(t.Maghrib ?? ''),
          isha: stripTimeSuffix(t.Isha ?? ''),
          imsak: stripTimeSuffix(t.Imsak ?? ''),
          date: data.data.date.readable,
        };
        const hd = {
          day: data.data.date.hijri.day,
          month: data.data.date.hijri.month.en,
          monthAr: data.data.date.hijri.month.ar,
          year: data.data.date.hijri.year,
        };
        setPrayerTimes(pt);
        setHijriDate(hd);
        writePrayerTimesCache(todayStr, lat, lng, pt, hd);
      }
    } catch (err) {
      console.error('Prayer times error:', err);
      const cached = lat && lng ? readPrayerTimesCache(todayStr, lat, lng) : null;
      if (cached) {
        setPrayerTimes(cached.prayerTimes);
        setHijriDate(cached.hijriDate);
        setIsFromCache(true);
        setError('Times may be outdated. Check connection and try again.');
      } else {
        setError(err instanceof Error ? err.message : 'Failed to load prayer times');
      }
    } finally {
      setLoading(false);
    }
  }, [lat, lng, todayStr]);

  useEffect(() => {
    if (!lat || !lng) return;
    // Use cache first (sync) so we don't block; defer API fetch until after first paint when no cache
    const cached = readPrayerTimesCache(todayStr, lat, lng);
    if (cached) {
      setPrayerTimes(cached.prayerTimes);
      setHijriDate(cached.hijriDate);
      setIsFromCache(true);
      setLoading(false);
      setError(null);
      return;
    }
    const id =
      typeof requestIdleCallback !== 'undefined'
        ? requestIdleCallback(() => fetchPrayerTimes(), { timeout: 800 })
        : setTimeout(fetchPrayerTimes, 0);
    return () => {
      if (typeof cancelIdleCallback !== 'undefined') cancelIdleCallback(id as number);
      else clearTimeout(id as number);
    };
  }, [lat, lng, todayStr, fetchPrayerTimes]);

  return { prayerTimes, hijriDate, loading, error, refetch: fetchPrayerTimes, isFromCache };
}

/** Format YYYY-MM-DD to DD-MM-YYYY for Aladhan API */
function toAladhanDate(isoDate: string): string {
  const [y, m, d] = isoDate.split('-');
  return `${d}-${m}-${y}`;
}

const PRAYER_TIMES_FOR_DATE_CACHE_KEY = 'tryramadan-prayer-times-for-date-cache';
const MAX_FOR_DATE_CACHE_ENTRIES = 30;

interface ForDateCacheEntry {
  prayerTimes: PrayerTimes;
  hijriDate: { day: string; month: string; monthAr: string; year: string };
  savedAt: string;
}

function readForDateCache(isoDate: string, lat: number, lng: number): ForDateCacheEntry | null {
  try {
    const raw = localStorage.getItem(PRAYER_TIMES_FOR_DATE_CACHE_KEY);
    if (!raw) return null;
    const map = JSON.parse(raw) as Record<string, ForDateCacheEntry>;
    const key = `${isoDate}_${lat}_${lng}`;
    return map[key] ?? null;
  } catch {
    return null;
  }
}

function writeForDateCache(
  isoDate: string,
  lat: number,
  lng: number,
  prayerTimes: PrayerTimes,
  hijriDate: { day: string; month: string; monthAr: string; year: string }
) {
  try {
    const raw = localStorage.getItem(PRAYER_TIMES_FOR_DATE_CACHE_KEY);
    const map: Record<string, ForDateCacheEntry> = raw ? JSON.parse(raw) : {};
    const key = `${isoDate}_${lat}_${lng}`;
    map[key] = { prayerTimes, hijriDate, savedAt: new Date().toISOString() };
    const keys = Object.keys(map);
    if (keys.length > MAX_FOR_DATE_CACHE_ENTRIES) {
      const byTime = keys.sort((a, b) => (map[a].savedAt > map[b].savedAt ? 1 : -1));
      byTime.slice(0, keys.length - MAX_FOR_DATE_CACHE_ENTRIES).forEach((k) => delete map[k]);
    }
    localStorage.setItem(PRAYER_TIMES_FOR_DATE_CACHE_KEY, JSON.stringify(map));
  } catch {
    // ignore
  }
}

/** Fetch prayer times for a specific date (ISO YYYY-MM-DD). Used for day view / click-through days. Cached in localStorage for offline. */
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

    const cached = readForDateCache(isoDate, lat, lng);
    if (cached) {
      setPrayerTimes(cached.prayerTimes);
      setHijriDate(cached.hijriDate);
      setLoading(false);
      setError(null);
      return;
    }

    const dateStr = toAladhanDate(isoDate);

    const fetchPrayerTimes = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(
          `${API_CONFIG.aladhan}/v1/timings/${dateStr}?latitude=${lat}&longitude=${lng}&method=2`
        );
        if (!response.ok) throw new Error('Failed to fetch prayer times');
        const data: AladhanResponse = await response.json();
        if (data.code === 200) {
          const t = data.data.timings;
          const times: PrayerTimes = {
            fajr: stripTimeSuffix(t.Fajr ?? ''),
            sunrise: stripTimeSuffix(t.Sunrise ?? ''),
            dhuhr: stripTimeSuffix(t.Dhuhr ?? ''),
            asr: stripTimeSuffix(t.Asr ?? ''),
            maghrib: stripTimeSuffix(t.Maghrib ?? ''),
            isha: stripTimeSuffix(t.Isha ?? ''),
            imsak: stripTimeSuffix(t.Imsak ?? ''),
            date: data.data.date.readable,
          };
          const hijri = {
            day: data.data.date.hijri.day,
            month: data.data.date.hijri.month.en,
            monthAr: data.data.date.hijri.month.ar,
            year: data.data.date.hijri.year,
          };
          setPrayerTimes(times);
          setHijriDate(hijri);
          writeForDateCache(isoDate, lat, lng, times, hijri);
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
    `${API_CONFIG.aladhan}/v1/calendar?latitude=${lat}&longitude=${lng}&method=2&month=${month}&year=${year}`
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
    const cache = raw ? JSON.parse(raw) : {};
    const trimmed = trimRamadanPrayersCache(cache);
    if (Object.keys(trimmed).length < Object.keys(cache).length) {
      setRamadanPrayersCache(trimmed);
    }
    return trimmed;
  } catch {
    return {};
  }
}

/** Keep only entries for current and next Ramadan year to limit cache size. */
function trimRamadanPrayersCache(cache: Record<string, RamadanPrayersCacheEntry>, year?: number): Record<string, RamadanPrayersCacheEntry> {
  const y = year ?? getRamadanDateRange().year;
  const keepYears = [y, y + 1];
  const trimmed: Record<string, RamadanPrayersCacheEntry> = {};
  for (const [key, entry] of Object.entries(cache)) {
    const match = key.match(/_(\d{4})$/);
    const entryYear = match ? parseInt(match[1], 10) : y;
    if (keepYears.includes(entryYear)) trimmed[key] = entry;
  }
  return trimmed;
}

function setRamadanPrayersCache(cache: Record<string, RamadanPrayersCacheEntry>, year?: number) {
  try {
    const trimmed = trimRamadanPrayersCache(cache, year);
    window.localStorage.setItem(RAMADAN_PRAYERS_CACHE_KEY, JSON.stringify(trimmed));
  } catch (e) {
    console.warn('Ramadan prayers cache write failed', e);
  }
}

/** Fetch prayer times for the full Ramadan month (current/next). Covers Ramadan spanning two Gregorian months. Pass overrides from preferences for effective range. */
export async function fetchRamadanPrayerTimes(
  lat: number,
  lng: number,
  overrides?: RamadanOverrideInput | null
): Promise<Record<string, PrayerTimes>> {
  const { startStr, endStr, startDate, endDate, year } = getRamadanDateRange(overrides);
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

/** Hook: Ramadan prayer times for the full month. Caches in localStorage by location + Ramadan year. Uses effective range from preferences when set. */
export function useRamadanPrayerTimes(lat: number | null, lng: number | null) {
  const [preferences] = useUserPreferences();
  const [prayerTimesMap, setPrayerTimesMap] = useState<Record<string, PrayerTimes>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const range = getRamadanDateRange(preferences);
  const { startStr, endStr, year } = range;
  const cacheKey = lat != null && lng != null ? getRamadanPrayersCacheKey(lat, lng, year) : null;

  const fetchAndCache = useCallback(async () => {
    if (lat == null || lng == null) return;
    setLoading(true);
    setError(null);
    try {
      const map = await fetchRamadanPrayerTimes(lat, lng, preferences);
      setPrayerTimesMap(map);
      const cache = getRamadanPrayersCache();
      cache[cacheKey!] = { prayerTimesMap: map, fetchedAt: Date.now() };
      setRamadanPrayersCache(cache, year);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load Ramadan prayer times');
    } finally {
      setLoading(false);
    }
  }, [lat, lng, cacheKey, preferences, year]);

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
      `${API_CONFIG.aladhan}/v1/timings/${dateStr}?latitude=${lat}&longitude=${lng}&method=2`
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
