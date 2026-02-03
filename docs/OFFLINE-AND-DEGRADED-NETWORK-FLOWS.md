# Offline and degraded network flows

Design document for **offline** and **degraded network** behavior when the app relies on **external APIs** (prayer times, location, timezone). For each flow and edge case we define **what is shown in the UI** (fallback data, error messages, skeletons) and **what actions remain possible** (logging offline, saving locally, retrying).

**Related docs:** `EDGE-CASE-TEST-SCENARIOS.md`, `USER-FLOWS-AND-TEST-PROMPTS.md`, `HISTORICAL-DATA-AND-DELETION-FLOWS.md`.

---

## API and cache context

| Dependency | API / source | Caching | Used for |
|------------|--------------|---------|----------|
| **Prayer times (today)** | Aladhan `GET /v1/timings/{date}?latitude=&longitude=` | `tryramadan-prayer-times-cache` (single entry: date + lat + lng) | Suhoor end / Iftar times, countdown, prayer strip |
| **Prayer times (Ramadan month)** | Aladhan calendar (multi-request) | `tryramadan-ramadan-prayers` (by location + Ramadan year), 7-day max age | Schedule .ics export, Goals card |
| **Location (auto-detect)** | 1) `navigator.geolocation` (timeout 5s/8s), 2) Nominatim reverse geocode, 3) ipapi.co IP | None (result stored in preferences or onboarding state) | lat/lng for prayer API |
| **Location (search)** | Nominatim search | None | Settings / onboarding city search |
| **Timezone** | timeapi.io by coordinates | None (stored in preferences with location) | Display "today" and countdown in user's location |

All **fasting progress, journal, meals** are **local only** (localStorage); no server sync. So logging a fast, marking complete/skipped/broken, and saving journal/meals **always work offline** once the app is loaded.

---

## 1. Flow: User opens app with no network but with previous data cached

### Scenario

User has used the app before with a **location set** and has **loaded prayer times** at least once. They open the app with **no network** (airplane mode, subway, etc.). Cache may contain today’s prayer times for their current location (same date + lat/lng).

### What is shown in the UI

| Area | Expected UI | Current implementation |
|------|-------------|-------------------------|
| **Prayer times (today)** | If cache hit (same date, same lat/lng): show **cached times** (Suhoor end, Iftar, prayer strip). Indicate cached/offline so user knows times aren’t fresh. | **Yes.** `usePrayerTimes` reads cache synchronously first; on load with no network, cache is used. `isFromCache` is set. FastingTimer shows "Cached times · You're offline." when `navigator.onLine === false`, else "Times may be outdated. Try again · Set location." Dashboard does **not** surface prayer-times error or "from cache" in the main strip; FastingTimer (Today page) and DashboardPrayers do. |
| **Skeleton** | No skeleton for prayer strip once cache is read (data available immediately). | Cache is read sync; no loading state for that path. If cache miss and fetch runs, loading shows until fetch fails (then error or cache from different day not used for today). |
| **Countdown** | If cached times exist: countdown to Suhoor end / Iftar works. | Same as above; countdown uses `prayerTimes` from cache. |
| **Location** | Location is from **preferences** (previously set). No re-fetch. No "detecting location" spinner. | Location comes from `preferences.locationCoords` or auto-detect; auto-detect not re-run on every load but may run once. With no network, any new auto-detect would fail; stored location still used. |
| **Dashboard** | Day N, stats, "I'm fasting," "Mark complete," journal, meals — all from localStorage. No network needed. | **Yes.** All from local state. |
| **Ramadan calendar export** | If Ramadan prayer times were cached for this location + year: export can use cache. If not cached or cache expired: export **fails** (needs network). | `useRamadanPrayerTimes` reads from `tryramadan-ramadan-prayers`; if cache hit, map is available. Export uses that. If cache miss, fetch fails offline; error shown, "Try again" when back online. |

### What actions remain possible

| Action | Possible offline? | Notes |
|--------|--------------------|--------|
| **Log fast (start / complete / break)** | Yes | All write to localStorage only. |
| **Mark day complete / skipped** | Yes | Same. |
| **Journal (read / write / save)** | Yes | localStorage. |
| **Meals (add / edit / delete)** | Yes | localStorage. |
| **View progress, stats, schedule** | Yes | All local. |
| **Refresh prayer times** | No | "Try again" will fail until network is back; button still shown. |
| **Set or change location** | No | Search and auto-detect need network. Manual coords not in UI. |
| **Export .ics (Ramadan)** | Only if Ramadan prayer cache exists | Otherwise needs network to fetch month. |
| **Export my data (JSON)** | Yes | Pure local read + download. |

### Edge: cache miss for today (e.g. first open this day offline, or location changed)

If cache has **yesterday** (or different location) but not **today** for current location: fetch runs (or was deferred), fails, and cache is not used for today. **UI:** Prayer strip stays empty or in loading then error. **Current:** `readPrayerTimesCache` checks `dateStr` and `lat,lng`; if no match, no cache. Then `setError(...)` and no fallback times. Dashboard shows **skeleton** while loading, then **nothing** for the prayer strip (no error message in main Dashboard strip). FastingTimer and Prayers page show "Set location" / "Try again." **Recommendation:** Show a short error or "Times unavailable offline for today" in the Dashboard strip when `error && !prayerTimes`, with "Try again" or link to Settings.

---

## 2. Flow: User opens app for the very first time with no network

### Scenario

User has **never** used the app (no preferences, no cache, or only default preferences from a prior session). They open the app with **no network**.

### What is shown in the UI

| Step | Expected UI | Current implementation |
|------|-------------|-------------------------|
| **Landing (Index)** | Page loads (static or cached by browser). "Start your journey" / "I'm Muslim" work. No API call on landing. | Index is static; no mandatory network. |
| **Onboarding** | User can go through Welcome, Mode, (Knowledge if non-Muslim), Health. At **Location**: auto-detect runs and **fails** (geolocation may timeout; reverse geocode and IP need network). Show **friendly error** and offer "Skip for now" or "Search city" (search will fail offline). | OnboardingLocation: `runAutoDetect` tries geolocation (timeout 8s) then Nominatim then ipapi. On failure, `loc` stays null. No explicit "We couldn't detect your location" on first failure unless we show it when `!loc && !detecting`. User can **Skip for now** and continue. Search needs network. |
| **After onboarding (no location)** | Dashboard: **no prayer times** (no lat/lng). Show "Set your location" banner (dismissible). Prayer strip: **skeleton** only while location loading, then **empty** or message "Set location for prayer times." Fasting actions still available. | `hasTime = !!(locationCoords \|\| prayerTimes)`; with no location, `hasTime` false. If onboarding complete, Dashboard still renders. Skeleton when `timesLoading \|\| locationLoading`; when both false and no coords, no prayer times, no skeleton — strip area is just empty. Location banner: "Set your location in Settings…" when `onboardingComplete && !locationCoords`. |
| **First-time with location from cache** | N/A — first time implies no stored location. If they had old preferences with location but no prayer cache: same as "no network with previous data" but prayer cache miss for today. | — |

### What actions remain possible

| Action | Possible? | Notes |
|--------|-----------|--------|
| **Complete onboarding** | Yes | Can skip location; continue to Schedule, Notifications, Priorities, Goals, Dashboard. |
| **Log fast, journal, meals** | Yes | All local. |
| **View Dashboard** | Yes | No "Day N" countdown times; rest works. |
| **Get prayer times** | No | Need network to fetch; no cache yet. |
| **Set location** | No | Auto-detect and search need network. |

### Recommendation (first time, no network)

- After auto-detect fails on Location step: show **explicit message** e.g. "We couldn't detect your location. You can search for your city when you're online, or skip and set it later in Settings." (OnboardingLocation already has a failure message in some flows; ensure it shows when `!loc && !detecting` after try.)
- On Dashboard when **no location and no prayer times**: show a **clear line** under the (empty) strip area: "Set your location in Settings for prayer and fasting times." so it’s not a silent empty box.

---

## 3. Edge cases: API failure, timeout, unexpected data

### 3.1 Prayer time API fails or times out

| Scenario | What is shown | Actions possible |
|----------|----------------|------------------|
| **Network error (no response, 5xx, 4xx)** | If **cache exists** for today + location: show cached times + "Times may be outdated. Try again · Set location" (or "Cached · You're offline" if `!navigator.onLine`). If **no cache**: show error state — FastingTimer/DashboardPrayers show "Using default times" / "Set your location" or "Failed to load prayer times" with **Try again**. Dashboard main strip: currently **no error text** when fetch fails and no cache; strip is just missing. | **Try again** (refetch). **Set location** (Settings). **Log fast** etc. unchanged. |
| **Timeout** | Same as network error. App uses `fetch()` with no custom timeout (browser default can be long). | Recommend adding a timeout (e.g. AbortController + 10s) so slow networks don’t hang; then treat as failure and show cache or error. |
| **Unexpected data (e.g. API returns 200 but malformed JSON or missing timings)** | Parse may throw; catch sets error. If cache exists, use cache. Otherwise show "Failed to load prayer times" and Try again. | Same as above. |

**Current:** `usePrayerTimes` on fetch error: tries `readPrayerTimesCache(todayStr, lat, lng)`; if cache hit, shows cached + "Times may be outdated…" and sets `isFromCache`; else sets `error`. No timeout. Dashboard does not consume `error` for the main strip; FastingTimer and DashboardPrayers do (refetch + Location CTA).

### 3.2 Geolocation API fails, times out, or is denied

| Scenario | What is shown | Actions possible |
|----------|----------------|------------------|
| **User denies permission** | Geolocation fails; app falls back to **IP** (if network). If IP also fails: "Could not detect location." Onboarding: can Skip. Settings: LocationSearch shows error; user can search. | Skip (onboarding); search city (needs network); or enter nothing. |
| **Timeout (e.g. 8s)** | Same fallback to IP. If no network, IP fails → "Could not detect location." | Same. |
| **No network** | Geolocation may still succeed (GPS). If it does, **reverse geocode** (Nominatim) fails → no city name; we could store coords only. Current flow: if reverse fails, `loc` stays null and we fall back to IP → fails offline. So we **don’t** store coords from geolocation when reverse fails. | Recommendation: when geolocation succeeds but reverse geocode fails, **still store lat/lng** (and optional "Your location") so prayer times can be fetched when back online; or fetch prayer times with coords and show "Location: coordinates" until next online reverse. |

### 3.3 Timezone or location can’t be resolved but user tries to log a fast anyway

| Scenario | What is shown | Actions possible |
|----------|----------------|------------------|
| **No location set** | Prayer strip empty or "Set location." Countdown may be absent or use device time. **Fasting actions (I'm fasting, Mark complete, I didn't fast today, Break fast)** are **all available**. | **Log fast:** Yes. `startFastingToday`, `completeFastingToday`, `breakFastingToday`, `setDayCompleted`, `setDaySkipped` use only `getTodayDateString()` or `todayOverride` and localStorage. No dependency on prayer API or location. |
| **Location set but prayer API failed (no cache)** | Same: no times in strip; error in FastingTimer/Prayers. **Fasting actions:** All available. User can start/complete/break fast; hours are computed from `startedAt`/`completedAt` (device time). | **Log fast:** Yes. **Try again** for prayers. |
| **Location set but timezone missing** | `displayTimezone` may be null; app uses device local date/time for "today" and countdown. Fasting log uses same device date. No crash. | **Log fast:** Yes. Slightly different "today" if user travels; acceptable. |

**Summary:** **Fasting log never depends on network or location.** All "log a fast" actions remain possible and persist locally. Only the **display** of prayer times and countdown is affected.

---

## 4. Summary table: UI and actions by scenario

| Scenario | Prayer strip / countdown | Location | Fasting log | Journal / meals | Retry / notes |
|----------|---------------------------|----------|-------------|------------------|----------------|
| **Offline, cache hit (today + location)** | Cached times; "Cached · offline" or "Try again" | From preferences | All actions | All actions | Refetch when online |
| **Offline, cache miss** | Empty or error; no times | From preferences | All actions | All actions | Set location / Try again when online |
| **First time, no network** | No strip or "Set location" | Auto-detect fails; skip or search (fails) | All actions after onboarding | All actions | Set location when online |
| **Prayer API fails (online)** | Cache if any, else error + Try again | Unchanged | All actions | All actions | Try again; check location |
| **Geolocation fails / denied** | No times until location set (search or IP) | Error; skip or search | All actions | All actions | Search city when online |
| **Timezone API fails** | Prayer times may still load (Aladhan uses coords); "today" from device | Location may have no timezone | All actions | All actions | Optional: retry timezone; app works with device time |

---

## 5. Recommendations for implementation

| Item | Priority | Notes |
|------|----------|--------|
| **Dashboard prayer strip error** | Medium | When `error && !prayerTimes`, show a one-line message + "Try again" or link to Settings so user isn’t left with an empty strip. |
| **Prayer fetch timeout** | Medium | Use AbortController + e.g. 10s so slow/failing networks don’t hang loading state. |
| **First-time location failure copy** | Low | On onboarding Location, when auto-detect fails and `!loc && !detecting`, show: "We couldn’t detect your location. Search for your city when you’re online or skip and set it in Settings." |
| **Geolocation success, reverse fail** | Low | Consider storing lat/lng from geolocation even when reverse geocode fails (e.g. offline), so prayer times can be fetched when back online. |
| **navigator.onLine** | Done | FastingTimer and DashboardPrayers already use it for "You're offline" vs "Try again." |
| **Skeletons** | Done | Dashboard shows skeleton for prayer strip when `!prayerTimes && (timesLoading \|\| locationLoading)` to avoid CLS. |

---

## 6. Test prompts for QA

- **Offline with cache:** Set location, load dashboard once (prayer times cached). Turn off network; reload. Do you see cached Suhoor/Iftar times? Any "offline" or "cached" message? Can you log a fast, add journal, add meal?
- **Offline first time:** Clear site data; turn off network; open app. Complete onboarding and skip location. On dashboard: is the prayer strip empty or message shown? Can you tap "I'm fasting" and "Mark complete"?
- **API failure:** With network, use DevTools to throttle or block `api.aladhan.com`. Reload. Do you see cached times if previously loaded, or error + Try again? Can you still mark a day complete?
- **No location, log fast:** Skip location in onboarding. On dashboard, tap "I'm fasting" then "Mark complete." Does the day save? Is there any blocking or error?
- **Prayer timeout:** Simulate slow Aladhan (e.g. 30s delay). Does loading eventually show error or timeout? (If timeout not implemented, document as improvement.)

This doc defines offline and degraded-network flows, edge cases, and what the UI shows vs what remains possible; use it for QA and to implement the recommendations above.
