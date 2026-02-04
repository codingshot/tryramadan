# QA: Deep Linking & Reload Behavior Matrix

> **Implementation status:** Doc complete. Matrix documents expected behavior. Add E2E tests for critical redirect paths when desired.

Test cases for opening routes directly (new tab / no prior navigation) and reloading (F5). Expected behavior for each storage state.

---

## Storage States

| State | localStorage | Description |
|-------|--------------|-------------|
| **Empty** | Cleared | Fresh install, new user, or user cleared data |
| **Partial** | `tryramadan-onboarding-draft` may exist; `onboardingComplete: false`; `locationCoords` may be set (from auto-detect or partial completion) | Mid-onboarding; never completed goals |
| **Full** | `tryramadan-preferences` with `onboardingComplete: true`; may have `locationCoords` or not | Completed onboarding |

---

## Matrix: Route × (Direct Open | Reload) × Storage State

**Direct open** = User types URL or opens link in new tab. No prior navigation; full app load from URL.

**Reload** = User hits F5. React remounts; localStorage persists. Behavior is equivalent to direct open for most routes.

| Route | Empty storage | Partial storage | Full storage |
|-------|---------------|-----------------|--------------|
| **Direct open** | | | |
| `/` | Renders Index, hero, timer | Same | Same |
| `/programs`, `/culture`, `/recipes`, `/health`, `/health-safety`, `/emergency`, `/faq`, `/settings`, `/terms`, `/legal`, `/privacy`, `/guides`, `/personas`, `/learn/*` | All render normally | Same | Same |
| `/onboarding` | Redirects to `/onboarding/welcome` (index) | Same | Same |
| `/onboarding/welcome` | Renders Welcome | Same | Same |
| `/onboarding/mode` | Renders Mode, default state | Renders; state from draft if exists | Renders; state from draft |
| `/onboarding/knowledge` | Renders Knowledge | Same | Same |
| `/onboarding/health` | Renders Health | Same | Same |
| `/onboarding/gender` | Renders Gender | Same | Same |
| `/onboarding/location` | Renders Location; auto-detect runs | Renders; draft may have location | Same |
| `/onboarding/schedule` | Renders Schedule | Same | Same |
| `/onboarding/notifications` | Renders Notifications | Same | Same |
| `/onboarding/priorities` | Renders Priorities | Same | Same |
| `/onboarding/goals` | Renders Goals; `state.mode` may be null | Renders; state from draft | Renders; can "Save and go to dashboard" via X |
| `/dashboard` | **Redirects** to `/onboarding/welcome` when `!hasTime` (after locationLoading). If auto-location resolves first → no redirect | Redirects if `!hasTime`; else renders | Renders; location banner if `!locationCoords` |
| `/dashboard/today` | Renders; default/empty data; no prayer times or LocationRequiredCTA where relevant | Renders | Renders normally |
| `/dashboard/schedule` | Renders | Same | Same |
| `/dashboard/prayers` | Renders; LocationRequiredCTA when no location | Same | Renders; LocationRequiredCTA if no location |
| `/dashboard/meals` | Renders | Same | Same |
| `/dashboard/journal` | Renders | Same | Same |
| `/dashboard/progress` | Renders | Same | Same |
| `/dashboard/learn` | Renders | Same | Same |
| `/dashboard/health` | Renders | Same | Same |
| `/dashboard/goals` | Renders | Same | Same |
| `/dashboard/achievements` | Renders | Same | Same |
| `/dashboard/quran` | Renders | Same | Same |
| `/dashboard/macros` | Renders | Same | Same |
| `/dashboard/glossary` | Renders | Same | Same |
| **Reload (F5)** | | | |
| Same as direct open for all routes | Same behavior | Same behavior | Same behavior |

---

## Expected Behavior Details

### Onboarding state restoration

- **OnboardingContext** initializes with `loadDraft() ?? defaultState` on mount.
- `tryramadan-onboarding-draft` is written on every state change.
- **Direct open / Reload** of `/onboarding/*`: Draft is loaded from localStorage; if no draft, default state. No redirect based on step.
- Completing onboarding does **not** clear the draft; it remains for re-entry.

### Dashboard redirect logic

- **Only** `/dashboard` has a redirect guard.
- Redirect when: `!onboardingComplete && !hasTime`.
- `hasTime` = `locationCoords || prayerTimes` (saved prefs or auto-location / API).
- Redirect is deferred until `locationLoading` is false.
- **Direct open / Reload** of `/dashboard` with empty storage: Brief null render, then redirect to `/onboarding/welcome` once location has finished loading (or failed).

### Dashboard child routes (no guard)

- `/dashboard/today`, `/dashboard/schedule`, etc. have **no** redirect.
- **Direct open / Reload** with empty storage: Page renders; may show LocationRequiredCTA, default times, or empty data. No redirect to onboarding.

### Page render correctness with localStorage only

| Route type | With empty storage | With full storage |
|------------|--------------------|--------------------|
| Public | Renders; no user-specific data | Same |
| Onboarding | Renders; default or draft state | Renders; draft state; X → dashboard |
| Dashboard | Redirects (only /dashboard) or renders with defaults | Renders; preferences applied |
| Dashboard child | Renders; defaults, LocationRequiredCTA where needed | Renders with preferences |

---

## Test Cases (Playwright / Vitest)

### Direct open – empty storage

```ts
test("direct open /dashboard with empty storage redirects to onboarding", async ({ page }) => {
  await page.goto("/");
  await page.evaluate(() => localStorage.clear());
  await page.goto("/dashboard");
  await expect(page).toHaveURL(/\/onboarding\/welcome/);
});

test("direct open /dashboard/today with empty storage renders (no redirect)", async ({ page }) => {
  await page.goto("/");
  await page.evaluate(() => localStorage.clear());
  await page.goto("/dashboard/today");
  await expect(page).toHaveURL(/\/dashboard\/today/);
  await expect(page.getByRole("heading", { name: /today's fast/i })).toBeVisible();
});

test("direct open /onboarding/goals with empty storage renders with default state", async ({ page }) => {
  await page.goto("/");
  await page.evaluate(() => localStorage.clear());
  await page.goto("/onboarding/goals");
  await expect(page).toHaveURL(/\/onboarding\/goals/);
  await expect(page.getByRole("heading", { name: /goals.*intentions/i })).toBeVisible();
});
```

### Reload – full storage

```ts
test("reload /dashboard with full onboarding renders (no redirect)", async ({ page }) => {
  await page.goto("/");
  await page.evaluate(() => {
    localStorage.setItem("tryramadan-preferences", JSON.stringify({
      onboardingComplete: true,
      userType: "muslim",
      theme: "dark",
      locationCoords: null,
    }));
  });
  await page.goto("/dashboard");
  await page.reload();
  await expect(page).toHaveURL(/\/dashboard/);
  await expect(page.locator("main")).toBeVisible();
});

test("reload /onboarding/goals with partial draft restores draft state", async ({ page }) => {
  await page.goto("/");
  await page.evaluate(() => {
    localStorage.setItem("tryramadan-onboarding-draft", JSON.stringify({
      mode: "muslim",
      location: { lat: 51.5, lng: -0.1, displayName: "London", name: "London", country: "UK" },
    }));
  });
  await page.goto("/onboarding/goals");
  await page.reload();
  await expect(page).toHaveURL(/\/onboarding\/goals/);
  // State should reflect draft (e.g. Muslim goals shown)
  await expect(page.getByText(/complete ramadan|recite quran/i)).toBeVisible();
});
```

### Reload – page still renders

```ts
const DASHBOARD_CHILD_ROUTES = [
  "/dashboard/today",
  "/dashboard/schedule",
  "/dashboard/prayers",
  "/dashboard/meals",
  "/dashboard/journal",
  "/dashboard/progress",
  "/dashboard/learn",
];

for (const path of DASHBOARD_CHILD_ROUTES) {
  test(`reload ${path} with empty storage renders without crash`, async ({ page }) => {
    await page.goto("/");
    await page.evaluate(() => localStorage.clear());
    await page.goto(path);
    await page.reload();
    await expect(page).toHaveURL(new RegExp(path.replace(/\//g, "\\/")));
    await expect(page.locator("main, [role=main]").first()).toBeVisible();
  });
}
```

---

## Summary

| Scenario | Redirect to onboarding? | Renders correctly? |
|----------|-------------------------|--------------------|
| Direct open / Reload `/dashboard` with empty storage | Yes (after locationLoading) | N/A (redirect) |
| Direct open / Reload `/dashboard` with full storage | No | Yes |
| Direct open / Reload `/dashboard/*` (child) with empty storage | No | Yes (with defaults / LocationRequiredCTA) |
| Direct open / Reload `/onboarding/*` with any storage | No | Yes (default or draft state) |
| Direct open / Reload public routes with any storage | No | Yes |
