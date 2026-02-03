---
name: tryramadan-testing
description: How to add and run tests in TryRamadan. Uses Vitest and React Testing Library. Covers unit tests for utils and hooks, localStorage persistence, countdown and prayer cache, onboarding flows, and accessibility (axe). Use when adding tests, fixing test failures, or verifying critical paths.
---

# Testing (TryRamadan)

Use this skill when **adding tests**, **fixing failing tests**, or **verifying critical user paths**. Stack: **Vitest**, **@testing-library/react**, **vitest-axe** for a11y.

---

## 1. Run commands

```bash
npm run test              # Run all tests once
npm run test:watch        # Watch mode
npm run test -- src/test/countdownAndPrayerTimes.test.ts   # Single file
```

---

## 2. Test file locations and scope

| File | Scope |
|------|--------|
| `src/test/countdownAndPrayerTimes.test.ts` | Time utils, countdown logic, today + Ramadan prayer cache, no-API-when-cached |
| `src/test/localStorage.test.ts` | persistPreferencesSync, persistQuickActionsSync, useLocalStorage hook, getSuggestedCalories |
| `src/test/loggingAndTracking.test.ts` | Fasting progress, streak, getTodayFastingLog, daily missions, food log helpers |
| `src/test/prayerTimes.test.ts` | getRamadanPrayersCacheKey, fetchRamadanPrayerTimes (API failure) |
| `src/test/ramadan.test.ts` | Ramadan date helpers (getRamadanStartForYear, isRamadanDay, etc.) |
| `src/test/ical.test.ts` | buildIcalContent, date range, timezone, export modes |
| `src/test/onboardingFlow.test.tsx` | Complete onboarding → dashboard, persist preferences, no redirect loop |
| `src/test/dashboardFeatures.test.tsx` | Day selector, fasting status, quick actions, links (with localStorage prefill) |
| `src/test/accessibility.test.tsx` | axe-core on HeroSection, OnboardingWelcome, ArabicHover, key flows |
| `src/test/mainFeatures.test.tsx` | Index/Dashboard render, links |
| `src/test/routes.test.tsx` | Route list and existence |

---

## 3. Setup and mocks

- **Setup:** `src/test/setup.ts` – jest-dom, vitest-axe matchers, matchMedia and IntersectionObserver mocks.
- **localStorage:** Clear in `beforeEach` when tests depend on fresh state (e.g. `localStorage.clear()`). Pre-fill when testing cache hit or persisted preferences (e.g. `localStorage.setItem("tryramadan-preferences", JSON.stringify({ ... }))`).
- **fetch:** Use `vi.spyOn(global, "fetch")` to assert no API call when cache is used or to mock API failure.

---

## 4. Testing hooks

- Use `renderHook` from `@testing-library/react` for `useLocalStorage`, `usePrayerTimes`, etc.
- Use `act()` when updating state (e.g. setter from useLocalStorage).
- For async: `waitFor(() => { expect(...).toBe(...) })`.

---

## 5. What to test when adding features

- **New utils (time, countdown, cache):** Unit tests in the relevant test file; keep pure functions easy to test.
- **New persistence:** Test round-trip (write then read from localStorage); test merge/override behavior if applicable.
- **Critical paths:** Onboarding completion → dashboard; set location → see prayer times; complete/break fast. Prefer integration-style tests that render the route and fire events.
- **Accessibility:** Add or extend `accessibility.test.tsx` for new pages or components that are critical for a11y (forms, live regions, focus).

---

## 6. Common pitfalls

- **useState initial value:** If a hook writes to localStorage in `useEffect`, the key may exist after first render; don’t assert it’s null after mount when the hook persists initial value.
- **todayStr:** Tests that depend on "today" use `toLocalDateString(new Date())` or cache prefill with that value so cache key matches.
- **React hooks deps:** Fix exhaustive-deps where safe; shadcn/ui fast-refresh warnings can remain if documented.
