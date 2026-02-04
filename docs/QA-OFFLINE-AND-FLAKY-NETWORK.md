# QA: Offline and Flaky Network Page Load Behavior

> **Implementation status:** Done. api.quran.com SW cache. localStorage cache for `usePrayerTimesForDate` (key tryramadan-prayer-times-for-date-cache, max 30 entries). Playwright offline specs optional.

Expected behavior when the PWA loads in offline or flaky network conditions. Covers critical routes: `/dashboard`, `/dashboard/today`, `/dashboard/schedule`, `/dashboard/journal`, `/guides`.

---

## 1. PWA Caching Summary

| Resource | Precached | Runtime cached (SW) | Client fallback |
|----------|-----------|---------------------|-----------------|
| HTML, JS, CSS, images (glob) | ✅ Yes | — | — |
| favicon, og-image, hero-bg | ✅ Yes | — | — |
| Aladhan (prayer times) | No | CacheFirst, 24h, 10 entries | localStorage (`tryramadan-prayer-times-cache`) |
| Nominatim (geocoding) | No | CacheFirst, 24h, 30 entries | None |
| ipapi.co (IP → location) | No | CacheFirst, 24h, 5 entries | None |
| timeapi.io | No | CacheFirst, 7 days, 20 entries | None |
| api.quran.com | No | **Not cached** | Link to Quran.com |
| Google Fonts | No | CacheFirst, 1 year | None |

**Note:** `usePrayerTimes` (today’s times) uses a **localStorage** cache as fallback when fetch fails. `usePrayerTimesForDate` and `fetchPrayerTimesForMonth` do **not** use localStorage; they depend on SW cache or network.

---

## 2. Critical Routes: Expected Behavior

### Scenario A: App opened before, assets cached, network now offline

User has visited the app at least once (SW installed, precache populated). Network is now offline.

### Scenario B: App opened for the first time while offline

User has never loaded the app. Tries to open the app URL while offline.

| Route | Scenario A (cached, offline) | Scenario B (first-time offline) |
|-------|-----------------------------|----------------------------------|
| `/` | App shell loads from SW precache. Fasting timer: if location was set and today’s prayer times are in SW/localStorage cache → shows cached times + "Times may be outdated". If no cache → LocationRequiredCTA + default times. | **Fully blocked.** HTML document fetch fails; user sees browser "No internet" / failed page. |
| `/dashboard` | App shell loads. Prayer strip: SW cache (Aladhan) or localStorage → shows times or skeleton. No location cache → LocationRequiredCTA. Rest of page (progress, journal, cards) from localStorage → works. | Same as above. |
| `/dashboard/today` | App shell loads. Prayer times: SW cache or `usePrayerTimes` localStorage fallback for **today only**. `usePrayerTimesForDate` for tomorrow: SW cache only (no localStorage). Journal/hydration from localStorage → works. | Same as above. |
| `/dashboard/schedule` | App shell loads. Selected-day prayer times: SW cache for that date or empty. Calendar events from localStorage → work. Export .ics uses `fetchPrayerTimesForMonth` → no cache, will fail offline. | Same as above. |
| `/dashboard/journal` | **Full offline.** App shell + journal data from localStorage. No external API. | Same as above. |
| `/guides` | **Full offline.** App shell + guides from bundled TS. Images from precache. | Same as above. |

---

## 3. Per-Route Detail

### `/dashboard`

- **APIs:** Aladhan (today), ipapi/Nominatim (if auto-detecting), `usePrayerTimesForDate` (selected day)
- **Offline (A):** Shell ✓. Prayer times: SW cache or `usePrayerTimes` localStorage. GoalsUntilRamadanCard uses prayer times → may show error. Streak, progress, journal preview from localStorage ✓.
- **Offline-friendly:** Yes if location + today’s times are cached. No if first visit or new location.

### `/dashboard/today`

- **APIs:** `usePrayerTimes` (today), `usePrayerTimesForDate` (tomorrow for post-iftar countdown)
- **Offline (A):** Shell ✓. Today: SW or localStorage. Tomorrow: SW cache only; if missing, countdown may be wrong/empty. Hydration, intention, energy from localStorage ✓.
- **Offline-friendly:** Mostly. Tomorrow countdown can degrade if that exact URL was never fetched.

### `/dashboard/schedule`

- **APIs:** `usePrayerTimesForDate` (selected day), `fetchPrayerTimesForMonth` (export)
- **Offline (A):** Shell ✓. Selected day: SW cache or empty timeline. Calendar events ✓. Export .ics: fails (no cache).
- **Offline-friendly:** Partially. Calendar and events work; timeline and export need network or prior cache.

### `/dashboard/journal`

- **APIs:** None (localStorage only)
- **Offline (A):** **Full offline.** Shell + all journal data from localStorage.
- **Offline-friendly:** Yes.

### `/guides`

- **APIs:** None (guides from bundled `@/data/guides`)
- **Offline (A):** **Full offline.** Shell + guides TS + images (precached).
- **Offline-friendly:** Yes.

---

## 4. Routes That Rely Too Heavily on Live API Data

| Route | Issue | Recommendation |
|-------|-------|----------------|
| `/dashboard` | GoalsUntilRamadanCard, prayer strip, selected-day view depend on Aladhan. No localStorage for `usePrayerTimesForDate`. | Add localStorage cache for `usePrayerTimesForDate` (similar to `usePrayerTimes`). Show "Using cached times" when offline. |
| `/dashboard/today` | Tomorrow’s times (post-iftar countdown) use SW only; `usePrayerTimesForDate` has no localStorage. | Same: cache per-date prayer times in localStorage with TTL. |
| `/dashboard/schedule` | `usePrayerTimesForDate` and `fetchPrayerTimesForMonth` have no localStorage. Timeline/export fail offline. | Cache per-date and month results in localStorage. For export, show "Export unavailable offline" or use cached month if available. |
| `/dashboard/prayers` | Same as above; full page depends on Aladhan. | Add per-date cache; show last cached day with "Times may be outdated." |

**Already offline-friendly:** `/dashboard/journal`, `/guides` (no API dependency).

---

## 5. Test Scenarios

### 5.1 Playwright: Simulate offline after cached load

```ts
// e2e/offline.spec.ts
import { test, expect } from "@playwright/test";

test.describe("Offline: assets cached, network offline", () => {
  test.beforeEach(async ({ page }) => {
    // Load app online first so SW and caches populate
    await page.goto("/");
    await page.waitForLoadState("networkidle");
    // Set location so prayer times are fetched
    await page.goto("/settings");
    // ... set location or ensure prefs have coords ...
    await page.goto("/dashboard");
    await page.waitForLoadState("networkidle");
  });

  test("dashboard loads shell when offline", async ({ page }) => {
    await page.context().setOffline(true);
    await page.goto("/dashboard");
    await expect(page.getByRole("main")).toBeVisible({ timeout: 5000 });
    await expect(page.getByRole("navigation")).toBeVisible();
  });

  test("journal loads fully when offline", async ({ page }) => {
    await page.context().setOffline(true);
    await page.goto("/dashboard/journal");
    await expect(page.getByRole("heading", { name: /journal/i })).toBeVisible({ timeout: 5000 });
    await expect(page.getByRole("main")).toBeVisible();
  });

  test("guides loads fully when offline", async ({ page }) => {
    await page.context().setOffline(true);
    await page.goto("/guides");
    await expect(page.getByRole("heading", { name: /user guides/i })).toBeVisible({ timeout: 5000 });
    await expect(page.getByRole("main")).toBeVisible();
  });

  test("schedule shows calendar when offline (even if timeline empty)", async ({ page }) => {
    await page.context().setOffline(true);
    await page.goto("/dashboard/schedule");
    await expect(page.getByRole("main")).toBeVisible({ timeout: 5000 });
    // Calendar or day selector should exist
    await expect(page.getByRole("button", { name: /previous|next|day/i })).toBeVisible();
  });

  test.afterEach(async ({ page }) => {
    await page.context().setOffline(false);
  });
});
```

### 5.2 Playwright: First-time offline (expect failure)

```ts
test("first-time offline: app URL fails to load", async ({ browser }) => {
  const context = await browser.newContext();
  await context.setOffline(true);
  const page = await context.newPage();
  const response = await page.goto("/", { waitUntil: "domcontentloaded", timeout: 5000 });
  // Expect failure: no SW, no cached HTML
  expect(response?.status()).toBeGreaterThanOrEqual(400);
  await context.close();
});
```

### 5.3 Vitest + RTL: Mock offline / failed fetch

```ts
// Simulate fetch failure; assert fallback UI
vi.stubGlobal("navigator.onLine", false);

// Mock usePrayerTimes to return cached data (localStorage fallback path)
localStorage.setItem("tryramadan-preferences", JSON.stringify({
  locationCoords: { lat: 51.5, lng: -0.1 },
}));
localStorage.setItem("tryramadan-prayer-times-cache", JSON.stringify({
  dateStr: toLocalDateString(new Date()),
  lat: 51.5,
  lng: -0.1,
  prayerTimes: MOCK_PRAYER_TIMES,
  hijriDate: { day: "1", month: "Ramadan", monthAr: "رمضان", year: "1446" },
  savedAt: new Date().toISOString(),
}));

// Render Dashboard; should show cached times, not spinner forever
render(<Dashboard />);
await waitFor(() => {
  expect(screen.queryByText(/loading|updating/i)).not.toBeInTheDocument();
});
expect(screen.getByText(/05:15|18:45/)).toBeInTheDocument(); // cached times
```

---

## 6. Expected Page-Load Outcomes Summary

| Condition | Outcome |
|-----------|---------|
| **Cached + offline** | App shell loads from precache. Routes using only localStorage/static data (`/guides`, `/dashboard/journal`) work fully. Routes using Aladhan show cached data if previously fetched (SW or localStorage); otherwise skeleton/error. |
| **First-time offline** | App fails to load; user sees browser error. |
| **Flaky network** | SW CacheFirst serves cached API responses when fetch fails/slow. `usePrayerTimes` falls back to localStorage on error. Intermittent loading states possible. |

---

## 7. Recommendations

1. Add **localStorage caching** for `usePrayerTimesForDate` (per date + lat/lng) and optionally for `fetchPrayerTimesForMonth`, mirroring `usePrayerTimes`.
2. Add **api.quran.com** to SW runtimeCaching (CacheFirst) so Quran page can work offline after first load.
3. On Schedule export, when offline or fetch fails: show "Export unavailable offline" or "Try again when online" instead of failing silently.
4. Add an offline banner: "You're offline. Some features may use cached data."
