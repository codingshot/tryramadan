# QA: Resilience When Resources Fail to Load

> **Implementation status:** Doc complete. Per-route loading/fallback states documented. Test templates (Vitest mocks, Playwright route interception) provided. Implement when adding resilience tests.

Expected behavior when external APIs or data fail. Loading states, fallbacks, and test cases.

---

## 1. External Resource Dependencies

### APIs (runtime fetch)

| Resource | API / Endpoint | Used by |
|----------|----------------|---------|
| Prayer times | Aladhan (`/v1/timings/`, `/v1/calendar`) | Index (FastingTimer), Dashboard, DashboardToday, DashboardPrayers, DashboardSchedule, FastingBottomBar, GoalsUntilRamadanCard |
| Location | ipapi.co, Nominatim (reverse/search), Geolocation API | Dashboard, HeroSection, FastingTimer, Navbar, OnboardingLocation, Settings, LocationSearch, LocationDisplay |
| Quran verses | api.quran.com (`/verses/by_juz/`) | DashboardQuran |

### Data files (build-time import)

| Resource | Type | Used by |
|----------|------|---------|
| daily-facts.json, hadiths.json, glossary.json, cultural-traditions.json, recipes.json, personas.json, fasting-programs.json, ramadan-info.json, guides.ts | Static import | Various pages |

**Note:** Static imports are bundled at build time. They do not "fail to load" at runtime; a missing file would cause a build error. No runtime fallback needed.

### Guide images

- Paths from `guides.ts` (e.g. `/guide-assets/onboarding-welcome.png`)
- `loading="lazy"` + `onError` hides failed images; no crash.

---

## 2. Per-Route: Loading & Fallback States

### Routes using prayer times (Aladhan)

| Route | Loading state | Fallback on API failure |
|-------|---------------|-------------------------|
| `/` (Index – FastingTimer) | Loader2 spinner next to time; default times (05:23, 18:47) shown while loading | LocationRequiredCTA: "Using default times. Set your location for accurate prayer times." + "Set location in Settings". No cache → same. With cache → "Times may be outdated. Try again · Update" |
| `/dashboard` | `(locationLoading \|\| timesLoading)` → skeleton strips (animate-pulse), "updating..." | Skeleton until resolved. No prayer strip if no data; rest of page renders |
| `/dashboard/today` | Uses prayer times; no explicit loading UI for whole page | Default/empty times if null; page still renders |
| `/dashboard/prayers` | "Loading prayer times…" + min-height container | **ApiErrorRetry**: "Could not load prayer times", message, "Try again" + "Set location in Settings" |
| `/dashboard/schedule` | selectedDayPrayerTimes may load async | LocationRequiredCTA for export when no location; timeline uses times or empty |
| Dashboard: GoalsUntilRamadanCard | "Loading prayer times…" (Loader2) | "Could not load prayer times. Try again" (inline) |

### Routes using location APIs

| Route | Loading state | Fallback on failure |
|-------|---------------|---------------------|
| `/onboarding/location` | "Detecting location from IP..." (Loader2) | "We couldn't detect your location. Search for your city for accurate prayer times." + LocationSearch + "Use my location (from IP)" + "Skip for now" |
| `/settings` (auto-detect) | "Detecting..." / loading state | No location; user can search |
| LocationSearch (Settings, Onboarding) | Loader2 while searching | Empty results; no crash |
| Dashboard, Index (auto-location) | `locationLoading`; may delay redirect | `location: null`; LocationRequiredCTA or banner |

### Routes using Quran API

| Route | Loading state | Fallback on failure |
|-------|---------------|---------------------|
| `/dashboard/quran` | Loader2 spinner in verse preview | "{error}. You can still open Quran.com to read Juz {n}." (link to Quran.com) |

### Routes with no external API (static data only)

| Route | Loading | Fallback |
|-------|---------|----------|
| `/guides`, `/guides/:slug` | Suspense → PageFallback (skeleton) | N/A (guides from TS); images: onError hides |
| `/learn/glossary`, `/dashboard/glossary` | Suspense | N/A (JSON bundled) |
| `/learn/hadith` | Suspense | N/A |
| `/culture`, `/culture/:id` | Suspense | N/A |
| `/recipes`, `/recipe/:type/:id` | Suspense | N/A |
| `/personas`, `/personas/:slug` | Suspense | N/A |
| `/dashboard/learn`, `/dashboard/meals`, `/dashboard/journal`, etc. | Suspense | N/A |

---

## 3. Summary Matrix: Resource Failure → Expected UI

| Route | Prayer API fails | Location API fails | Quran API fails |
|-------|------------------|--------------------|--------------------|
| `/` | LocationRequiredCTA or default times + "Try again" | Same (no location) | N/A |
| `/dashboard` | Skeleton or no prayer strip; page renders | Banner or redirect; page renders | N/A |
| `/dashboard/today` | Default/empty times | LocationRequiredCTA if no coords | N/A |
| `/dashboard/prayers` | **ApiErrorRetry** (Try again, Set location) | LocationRequiredCTA | N/A |
| `/dashboard/schedule` | Timeline empty or cached | LocationRequiredCTA for export | N/A |
| `/dashboard/quran` | N/A | N/A | **Error + Quran.com link** |
| `/dashboard/goals` (GoalsUntilRamadanCard) | "Could not load… Try again" | LocationRequiredCTA | N/A |
| `/onboarding/location` | N/A | **Warning + Search + Skip** | N/A |
| `/settings` | N/A | No location; search available | N/A |

---

## 4. Test Cases: Simulate Failed Loads

### Prayer times API failure

```ts
// Vitest + RTL: mock usePrayerTimes to return error
vi.mock("@/hooks/usePrayerTimes", () => ({
  usePrayerTimes: vi.fn(() => ({
    prayerTimes: null,
    loading: false,
    error: "Failed to fetch prayer times",
    refetch: vi.fn(),
    isFromCache: false,
  })),
  usePrayerTimesForDate: vi.fn(() => ({ prayerTimes: null })),
}));

it("DashboardPrayers shows ApiErrorRetry when prayer API fails", () => {
  render(<DashboardPrayers />, { route: "/dashboard/prayers" });
  expect(screen.getByRole("alert")).toBeInTheDocument();
  expect(screen.getByText(/could not load prayer times/i)).toBeInTheDocument();
  expect(screen.getByRole("button", { name: /try again/i })).toBeInTheDocument();
  expect(screen.getByRole("link", { name: /set location/i })).toBeInTheDocument();
});

it("FastingTimer shows fallback when prayer API fails and no location", () => {
  render(<Index />); // or FastingTimer in isolation
  expect(screen.getByText(/set your location|using default times/i)).toBeInTheDocument();
});
```

### Location API failure

```ts
vi.mock("@/hooks/useLocation", () => ({
  useAutoLocation: vi.fn(() => ({ location: null, loading: false, error: "Could not detect location" })),
}));

it("OnboardingLocation shows fallback when location detection fails", () => {
  render(<OnboardingLocation />, { route: "/onboarding/location" });
  expect(screen.getByText(/couldn't detect your location|search for your city/i)).toBeInTheDocument();
  expect(screen.getByRole("button", { name: /skip for now/i })).toBeInTheDocument();
});
```

### Quran API failure

```ts
// Mock fetch or the quran module
vi.mock("@/lib/quran", () => ({
  fetchVersesByJuz: vi.fn().mockRejectedValue(new Error("Network error")),
}));

it("DashboardQuran shows fallback when Quran API fails", async () => {
  render(<DashboardQuran />, { route: "/dashboard/quran" });
  await waitFor(() => {
    expect(screen.getByText(/failed to load|network error/i)).toBeInTheDocument();
  });
  expect(screen.getByRole("link", { name: /quran\.com/i })).toBeInTheDocument();
});
```

### Playwright: network interception

```ts
test("DashboardPrayers shows fallback when prayer API fails", async ({ page }) => {
  await page.route("**/api.aladhan.com/**", (route) => route.abort("failed"));
  await page.goto("/dashboard/prayers");
  await expect(page.getByRole("alert")).toBeVisible();
  await expect(page.getByText(/could not load prayer times/i)).toBeVisible();
  await expect(page.getByRole("button", { name: /try again/i })).toBeVisible();
});

test("OnboardingLocation shows fallback when location API fails", async ({ page }) => {
  await page.route("**/ipapi.co/**", (route) => route.abort("failed"));
  await page.route("**/nominatim**", (route) => route.abort("failed"));
  await page.goto("/onboarding/location");
  await page.waitForLoadState("networkidle");
  await expect(page.getByText(/couldn't detect|search for your city/i)).toBeVisible();
});

test("DashboardQuran shows fallback when Quran API fails", async ({ page }) => {
  await page.route("**/api.quran.com/**", (route) => route.abort("failed"));
  await page.goto("/dashboard/quran");
  await expect(page.getByText(/quran\.com/i)).toBeVisible();
});
```

### Assert no blank screen or crash

```ts
it("DashboardPrayers does not crash when prayer API fails", () => {
  vi.mocked(usePrayerTimes).mockReturnValue({
    prayerTimes: null,
    loading: false,
    error: "Failed",
    refetch: vi.fn(),
    isFromCache: false,
  });
  expect(() => render(<DashboardPrayers />)).not.toThrow();
  expect(screen.getByRole("main")).toBeInTheDocument();
});

it("DashboardQuran does not crash when Quran API fails", async () => {
  vi.mocked(fetchVersesByJuz).mockRejectedValue(new Error("Failed"));
  render(<DashboardQuran />);
  await waitFor(() => expect(screen.getByRole("main")).toBeInTheDocument());
});
```

---

## 5. Checklist: Fallback UI (Not Blank / Crash)

| Route | On failure, assert |
|-------|---------------------|
| `/dashboard/prayers` | ApiErrorRetry visible; "Try again" and "Set location" present |
| `/dashboard/quran` | Error message + Quran.com link visible |
| `/onboarding/location` | Warning + Search + Skip for now visible |
| `/` (FastingTimer) | LocationRequiredCTA or default times message; no uncaught error |
| `/dashboard` | Main content visible; skeleton or no prayer strip (no crash) |
| `/dashboard/today` | Page renders; times empty or default |
| `/dashboard/schedule` | Page renders; export disabled or LocationRequiredCTA |
| GoalsUntilRamadanCard | "Could not load prayer times. Try again" visible |
