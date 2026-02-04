# QA: Routing Logic, Guards, and Test Cases

> **Implementation status:** Done. Test cases and expected behaviors documented. E2E spec `e2e/routing-guards.spec.ts` covers: dashboard redirect when storage empty; home and onboarding/welcome with empty storage.

Analysis of route accessibility, guards, and expected behavior for redirects, fallbacks, and warnings. Test cases verify behavior from fresh install or cleared storage.

---

## 1. Route Accessibility by Onboarding State

### Before onboarding (fresh install, cleared localStorage)

| Route group | Accessible? | Behavior |
|-------------|-------------|----------|
| **Public** (/, /programs, /culture, /recipes, /health, /health-safety, /emergency, /faq, /settings, /terms, /legal, /privacy, /guides, /personas, /learn/*) | Yes | All load normally. No guards. |
| **Onboarding** (/onboarding/*) | Yes | All steps load. No step-order guard; user can deep-link to any step. |
| **Dashboard** (/dashboard) | Conditional | Redirects to `/onboarding/welcome` when `!onboardingComplete && !hasTime`. Waits for `locationLoading` before redirect. If `useAutoLocation` resolves with coords → `hasTime` → no redirect. |
| **Dashboard child** (/dashboard/today, /schedule, /prayers, /meals, etc.) | Yes (gap) | No guards. Pages render directly with defaults. May show `LocationRequiredCTA` or default/empty data. |

### After partial onboarding (mid-flow, never completed goals)

- `onboardingComplete` remains `false`.
- `locationCoords` may be set if user completed location step, or from auto-location.
- **Dashboard**: Redirects if `!hasTime` (no location). If location was set or auto-detected, stays.
- **Dashboard child**: Same as before — always accessible, no redirect.

### After full onboarding (onboardingComplete: true)

| Route | Accessible? | Notes |
|-------|-------------|-------|
| All public | Yes | |
| All onboarding | Yes | Can re-enter; X button → "Save and go to dashboard" if changes made |
| Dashboard | Yes | No redirect. May show "Set your location" banner if `!locationCoords`. |
| Dashboard child | Yes | Renders normally |

---

## 2. Onboarding Step Behavior

### Location not set

| Step | Behavior |
|------|----------|
| **Location** (/onboarding/location) | Continue disabled until location selected/detected. "Skip for now (set location later in Settings)" navigates to schedule. User can skip without setting location. |
| **Goals** (final step) | Persists `locationCoords: state.location ? {...} : null`. If user skipped location, `locationCoords` is null in preferences. |
| **Dashboard** (after complete) | Shows dismissible banner: "Set your location in Settings for accurate prayer and fasting times." No redirect. |

### Health skipped (user continues without selecting)

- **Health** (/onboarding/health): Continue always enabled. Default `healthWarnings: []` (none selected).
- No downstream guard. `healthWarnings` are stored in onboarding draft but **not** persisted to `UserPreferences` on goals completion (known gap; see docs/UX-HEALTH-GUARDRAILS-AND-CHECK-INS.md).

### Mode not selected (user navigates away before selecting)

- **Mode** (/onboarding/mode): No Continue button; selection triggers `handleSelect` and `navigate()` immediately. User must select to proceed in flow.
- If user deep-links to `/onboarding/goals` without selecting mode, `state.mode` may be null. Goals step persists `userType: state.mode` — could be null/undefined. Default merge in preferences may apply.

---

## 3. Dashboard Route Behavior by Condition

### User has not set location

| Route | Behavior |
|-------|----------|
| /dashboard | If `onboardingComplete || hasTime`: Renders. Shows "Set your location" banner (dismissible) when `onboardingComplete && !locationCoords`. If neither: redirects to onboarding. |
| /dashboard/today | Renders. Uses `preferences.locationCoords \|\| autoLocation` for prayer times. If none: `usePrayerTimes(null, null)` → default/loading. No redirect. |
| /dashboard/schedule | Renders. `locationCoords` from preferences. Quick-add and export use location; shows `LocationRequiredCTA` for export when no location. |
| /dashboard/prayers | Renders. Shows `LocationRequiredCTA` when `!locationCoords.lat && !locationCoords.lng`. |
| /dashboard/meals, /learn, /progress, /culture, /health, /journal, /goals, /achievements, /quran, /macros, /glossary | Render. May show degraded/empty data or LocationRequiredCTA where location is needed. |

### User has skipped health or mode

- No route blocks or redirects based on health or mode.
- Mode affects labels (e.g. "Iftar" vs "breaking fast"), priorities, and dashboard content — but no guard.

---

## 4. Guard Summary (Current Implementation)

| Guard | Location | Condition | Action |
|-------|----------|-----------|--------|
| Dashboard redirect | Dashboard.tsx | `!onboardingComplete && !hasTime` | `navigate("/onboarding/welcome", { replace: true })` |
| hasTime | Dashboard.tsx | `locationCoords \|\| prayerTimes` | Blocks redirect when true |
| locationLoading | Dashboard.tsx | Wait for auto-location | Defers redirect until resolved |
| Location banner | Dashboard.tsx | `onboardingComplete && !locationCoords && !dismissed` | Dismissible banner + Settings link |
| LocationRequiredCTA | DashboardPrayers, Schedule export, GoalsUntilRamadanCard | `!locationCoords` | In-page CTA "Set location in Settings" |

No guards on: Dashboard child routes, onboarding step order, health, or mode.

---

## 5. Test Cases

### A. Redirect: Dashboard with fresh install

```ts
// A1: Fresh install, no location → redirect to onboarding
it("redirects to onboarding when visiting /dashboard with cleared storage and no location", async () => {
  localStorage.clear();
  vi.mocked(useAutoLocation).mockReturnValue({ location: null, loading: false });
  vi.mocked(usePrayerTimes).mockReturnValue({ prayerTimes: null, loading: false });

  render(<App />, { route: "/dashboard" });

  await waitFor(() => {
    expect(mockNavigate).toHaveBeenCalledWith("/onboarding/welcome", { replace: true });
  });
});

// A2: Fresh install but auto-location resolves → no redirect
it("does not redirect when auto-location provides coords before redirect fires", async () => {
  localStorage.clear();
  vi.mocked(useAutoLocation).mockReturnValue({
    location: { lat: 51.5, lng: -0.1, displayName: "London", name: "London", country: "UK" },
    loading: false,
  });

  render(<App />, { route: "/dashboard" });

  await waitFor(() => {
    expect(screen.getByRole("heading", { name: /dashboard|ramadan|fasting/i })).toBeInTheDocument();
  });
  expect(mockNavigate).not.toHaveBeenCalledWith("/onboarding/welcome", expect.any(Object));
});

// A3: onboardingComplete true, no location → no redirect, banner shown
it("shows location banner but does not redirect when onboardingComplete and no location", () => {
  localStorage.setItem("tryramadan-preferences", JSON.stringify({
    onboardingComplete: true,
    userType: "muslim",
    locationCoords: null,
    theme: "dark",
  }));
  vi.mocked(useAutoLocation).mockReturnValue({ location: null, loading: false });

  render(<App />, { route: "/dashboard" });

  expect(screen.getByText(/set your location in settings/i)).toBeInTheDocument();
  expect(mockNavigate).not.toHaveBeenCalled();
});
```

### B. No redirect: Dashboard child routes with fresh install

```ts
// B1: /dashboard/today with cleared storage → renders, no redirect
it("dashboard/today renders without redirect when storage is cleared", () => {
  localStorage.clear();
  vi.mocked(useAutoLocation).mockReturnValue({ location: null, loading: false });
  vi.mocked(usePrayerTimes).mockReturnValue({ prayerTimes: null, loading: false });

  render(<App />, { route: "/dashboard/today" });

  expect(screen.getByRole("heading", { name: /today/i })).toBeInTheDocument();
  expect(mockNavigate).not.toHaveBeenCalled();
});

// B2: /dashboard/prayers with no location → LocationRequiredCTA shown
it("dashboard/prayers shows LocationRequiredCTA when no location", () => {
  localStorage.clear();
  vi.mocked(useAutoLocation).mockReturnValue({ location: null, loading: false });

  render(<App />, { route: "/dashboard/prayers" });

  expect(screen.getByText(/set your location/i)).toBeInTheDocument();
});
```

### C. Onboarding: direct URL access and skips

```ts
// C1: Deep-link to /onboarding/goals → renders (no step-order guard)
it("onboarding/goals renders when accessed directly via URL", () => {
  localStorage.clear();
  render(<App />, { route: "/onboarding/goals" });

  expect(screen.getByRole("button", { name: /go to dashboard/i })).toBeInTheDocument();
});

// C2: Skip location at /onboarding/location → navigates to schedule
it("skip for now at location step navigates to schedule", async () => {
  render(<App />, { route: "/onboarding/location" });
  vi.mocked(getLocationFromIP).mockResolvedValue(null);

  fireEvent.click(screen.getByRole("button", { name: /skip for now/i }));

  await waitFor(() => {
    expect(mockNavigate).toHaveBeenCalledWith("/onboarding/schedule");
  });
});

// C3: Complete onboarding with skipped location → onboardingComplete true, locationCoords null
it("onboarding can complete with null location when user skipped", async () => {
  render(<App />, { route: "/onboarding/goals" });
  // Simulate state where location was skipped (state.location = null)
  // Fire "Go to dashboard"

  const prefs = JSON.parse(localStorage.getItem("tryramadan-preferences") ?? "{}");
  expect(prefs.onboardingComplete).toBe(true);
  expect(prefs.locationCoords).toBeNull();
});
```

### D. Fallbacks and warnings

```ts
// D1: Dashboard with !onboardingComplete && !hasTime → returns null briefly, then redirect
it("dashboard returns null before redirect when guard triggers", () => {
  localStorage.clear();
  vi.mocked(useAutoLocation).mockReturnValue({ location: null, loading: false });

  const { container } = render(<Dashboard />, { route: "/dashboard" });

  // Before useEffect runs: Dashboard may render null (line 339–341)
  // After: navigate called
  // Assert: no uncaught errors, eventually navigates
});

// D2: Settings always accessible
it("settings is accessible with cleared storage", () => {
  localStorage.clear();
  render(<App />, { route: "/settings" });

  expect(screen.getByRole("heading", { name: /settings/i })).toBeInTheDocument();
});

// D3: Public routes always accessible
it("public routes load with cleared storage", () => {
  localStorage.clear();
  const routes = ["/", "/faq", "/programs", "/culture", "/guides"];
  routes.forEach((route) => {
    const { unmount } = render(<App />, { route });
    expect(screen.getByRole("main")).toBeInTheDocument();
    unmount();
  });
});
```

### E. Playwright E2E (pseudo-code)

```ts
// E1: Full flow — fresh install, visit /dashboard, expect redirect
test("visit /dashboard with fresh install redirects to onboarding", async ({ page }) => {
  await page.goto("/");
  await page.evaluate(() => localStorage.clear());
  await page.goto("/dashboard");
  await expect(page).toHaveURL(/\/onboarding\/welcome/);
});

// E2: Dashboard child — fresh install, visit /dashboard/today, expect no redirect
test("visit /dashboard/today with fresh install does not redirect", async ({ page }) => {
  await page.goto("/");
  await page.evaluate(() => localStorage.clear());
  await page.goto("/dashboard/today");
  await expect(page).toHaveURL(/\/dashboard\/today/);
  await expect(page.getByRole("heading", { name: /today/i })).toBeVisible();
});

// E3: Complete onboarding, visit /dashboard with no location, expect banner
test("after onboarding without location, dashboard shows location banner", async ({ page }) => {
  // Complete onboarding flow (or seed localStorage)
  await page.evaluate(() => {
    localStorage.setItem("tryramadan-preferences", JSON.stringify({
      onboardingComplete: true,
      userType: "muslim",
      locationCoords: null,
      theme: "dark",
    }));
  });
  await page.goto("/dashboard");
  await expect(page.getByText(/set your location/i)).toBeVisible();
});
```

---

## 6. Recommended Implementation (Future)

1. **Dashboard child guard**: Wrap `/dashboard/*` routes in a layout that applies the same redirect logic as Dashboard, or use a shared `RequireOnboardingOrLocation` component.
2. **Onboarding step guard** (optional): Redirect to welcome if user tries to access a step “ahead” of completed steps (e.g. /onboarding/goals when mode is null). Low priority since UX allows exploration.
3. **Health persistence**: Persist `healthWarnings` to preferences so contextual health warnings can be shown (see UX-HEALTH-GUARDRAILS-AND-CHECK-INS.md).

---

## 7. Quick Reference: What Blocks Access?

| Condition | /dashboard | /dashboard/today, etc. |
|-----------|------------|-------------------------|
| Fresh install, no auto-location | Redirect → onboarding | No redirect; renders |
| Fresh install, auto-location resolves | No redirect | No redirect; renders |
| onboardingComplete, no location | Renders + banner | Renders; LocationRequiredCTA where needed |
| onboardingComplete, has location | Renders | Renders normally |
