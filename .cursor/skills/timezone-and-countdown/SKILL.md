---
name: timezone-and-countdown
description: Location-based current time and countdown logic in TryRamadan. Covers getNowSecondsSinceMidnightInTimezone, secondsUntilTimeInTimezone, prayer times cache (today + Ramadan), and avoiding API calls when cache is valid. Use when changing fasting timer, countdowns, prayer times display, or timezone/location logic.
---

# Timezone and Countdown (TryRamadan)

Use this skill when working on **current time by location**, **countdowns** (to Iftar, Suhoor end), or **prayer times caching**. The app overrides system clock with the user's selected location timezone where applicable.

---

## 1. Time utilities (`src/lib/utils.ts`)

| Function | Purpose |
|----------|---------|
| `getTodayStringInTimezone(timeZone)` | Today as YYYY-MM-DD in IANA timezone (e.g. `America/New_York`). Use for "today" when location overrides system. |
| `getNowInTimezone(timeZone)` | `{ hours, minutes, seconds }` in that timezone. |
| `getNowSecondsSinceMidnightInTimezone(timeZone)` | Seconds since midnight in timezone (for countdown math). |
| `timeStringToSecondsSinceMidnight(timeStr)` | Parses "HH:mm" or "HH:mm (EAT)" to seconds. Handles suffix; use for API times. |
| `secondsUntilTimeInTimezone(nowSec, targetSec)` | Seconds until next occurrence of target time (wraps to next day if passed). |

**Rule:** For any countdown or "current window" (fasting vs eating), use these when `displayTimezone` is set; otherwise fall back to system `Date`/local time.

---

## 2. Display timezone source

- **From preferences:** `useDisplayTimezone()` (in `useLocalStorage.ts`) returns `preferences.timezone` (IANA), set when user picks a location (or backfilled from coords).
- **Usage:** Dashboard, DashboardToday, FastingTimer, FastingBottomBar, Navbar clock, DashboardPrayers all use `displayTimezone` for countdowns and "today" when available.

---

## 3. Today's prayer times: cache first

- **Hook:** `usePrayerTimes(lat, lng, displayTimezone)`.
- **Cache key:** `(todayStr, lat, lng)`. Stored in `tryramadan-prayer-times-cache`.
- **Behavior:** On load, **read cache first**. If hit for current (todayStr, lat, lng), set state and **do not call API**. Only fetch when cache miss or date/location changed.
- **After first successful fetch:** Result is written to cache so next load uses local data. API is called again only when user **changes location** (new lat/lng) or **date changes** (e.g. midnight).

---

## 4. Ramadan month prayer times: cache by location

- **Hook:** `useRamadanPrayerTimes(lat, lng)`.
- **Cache key:** `getRamadanPrayersCacheKey(lat, lng, ramadanYear)` → e.g. `51.5074_-0.1278_2026`. Stored in `tryramadan-ramadan-prayers`.
- **Behavior:** Read from localStorage first. If entry exists and is &lt; 7 days old, use it and **do not call API**. Fetch only on cache miss, **new location** (different key), or stale.
- **Populate once:** When user has location and a feature needs Ramadan month times (e.g. Schedule export, calendar), one fetch fills the cache; subsequent loads use it until location change or expiry.

---

## 5. Tests

- **File:** `src/test/countdownAndPrayerTimes.test.ts`.
- **Covers:** `timeStringToSecondsSinceMidnight`, `secondsUntilTimeInTimezone`, `getNowInTimezone` / `getNowSecondsSinceMidnightInTimezone`, `getTodayStringInTimezone`; cache key format; **usePrayerTimes uses cache when today and location match (no API call)**.
- When changing time or cache logic, add or update tests here.

---

## 6. Checklist for changes

- [ ] Countdowns and "current time" use `displayTimezone` when set (utils above), not only `new Date()`.
- [ ] "Today" for UI (day selector, fasting log) uses location's today when `displayTimezone` is set (`getTodayStringInTimezone` or `todayStr` from hook).
- [ ] Today's prayer times: cache read before fetch; API only on cache miss or location/date change.
- [ ] Ramadan month: cache key includes location; no refetch on load when valid cache exists for current location.
