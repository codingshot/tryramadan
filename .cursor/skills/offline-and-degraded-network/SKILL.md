---
name: offline-and-degraded-network
description: Offline and degraded network behavior in TryRamadan. Covers cache-first prayer times, API failure/timeout for Aladhan and location/timezone, and what works offline (fasting log, journal, meals). Use when adding features that call external APIs or read/write cached data.
---

# Offline and Degraded Network (TryRamadan)

Use this skill when **adding or changing API usage**, **caching**, or **location/timezone** so the app behaves correctly offline and when APIs fail or time out.

---

## 1. Dependencies and cache

| Dependency | API / source | Cache key / storage | Used for |
|------------|--------------|---------------------|----------|
| **Prayer times (today)** | Aladhan `GET /v1/timings/{date}?latitude=&longitude=` | `tryramadan-prayer-times-cache` (date + lat + lng) | Suhoor end / Iftar, countdown, prayer strip |
| **Prayer times (Ramadan month)** | Aladhan calendar | `tryramadan-ramadan-prayers` (lat, lng, Ramadan year), 7-day max age | Schedule .ics export |
| **Location (auto-detect)** | geolocation → reverse geocode or ipapi.co | None (result in preferences) | lat/lng for prayer API |
| **Location (search)** | Nominatim | None | City search |
| **Timezone** | timeapi.io by coordinates | None (stored with location) | Display "today" and countdown |

**Fasting progress, journal, meals:** Local only (localStorage). Logging fast, complete/skipped/broken, journal, meals **work offline** once the app is loaded.

---

## 2. Expected behavior

- **Cache first:** Today's prayer times: read from `tryramadan-prayer-times-cache` before fetch. If hit (same date, same lat/lng), use cache and **do not call API**. Ramadan month: read from `tryramadan-ramadan-prayers`; if valid cache exists, use it and do not fetch.
- **API failure / timeout:** Show fallback UI (skeleton, error message, "Try again"). Do not crash. Location/timezone: if fetch fails, keep previous value or show "Set location" / "Could not detect timezone."
- **Logging fast without location:** If user has no location and tries to start fast, app can allow it (times from cache or placeholder); document behavior. If prayer times are required for countdown, show "Set location for accurate times" or equivalent.
- **Doc:** **`docs/OFFLINE-AND-DEGRADED-NETWORK-FLOWS.md`** (flows, cache miss, first open offline, API failure, actions possible offline).

---

## 3. Checklist for changes

- [ ] New API calls: define cache key and when to invalidate; read cache before fetch where applicable.
- [ ] On failure/timeout: show user-facing message and optional "Try again"; do not leave UI in infinite loading.
- [ ] Fasting/journal/meals: remain local-only; no new network dependency for core logging without product decision.
