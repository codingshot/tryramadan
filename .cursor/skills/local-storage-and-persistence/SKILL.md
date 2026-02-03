---
name: tryramadan-local-storage-and-persistence
description: Local storage and persistence in TryRamadan. Covers useLocalStorage hook, persistPreferencesSync and persistQuickActionsSync, cache keys for preferences progress prayer times and Ramadan month, and when to persist before navigation. Use when adding or changing stored state, onboarding completion, or any feature that reads/writes localStorage.
---

# Local Storage and Persistence (TryRamadan)

Use this skill when **adding or changing stored state**, **onboarding completion**, or **sync before navigation** so the app and dashboard read fresh data.

---

## 1. Core hook: useLocalStorage

- **Location:** `src/hooks/useLocalStorage.ts`.
- **Signature:** `useLocalStorage<T>(key: string, initialValue: T): [T, (value: T | ((prev: T) => T)) => void]`.
- **Behavior:** Reads from `localStorage` on mount (falls back to initialValue on parse error). Writes to `localStorage` in `useEffect` whenever state changes. Key must be unique per store.

---

## 2. Preferences and quick actions (sync before navigation)

- **Preferences:** `persistPreferencesSync(partial)` merges `partial` into current preferences and writes to `tryramadan-preferences`. Call **before** navigating away from onboarding so Dashboard sees up-to-date preferences (e.g. onboardingComplete, location, timezone).
- **Quick actions:** `persistQuickActionsSync(order)` writes dashboard quick-action order to `tryramadan-dashboard-quick-actions`. Call before navigation when order was updated (e.g. from onboarding or Settings).
- **Usage:** OnboardingGoals and OnboardingLayout call `persistPreferencesSync(newPrefs)` and `persistQuickActionsSync(getQuickActionOrderFromPriorities(priorities))` before navigating to dashboard.

---

## 3. Main storage keys

| Key | Purpose |
|-----|---------|
| `tryramadan-preferences` | User preferences (theme, location, timezone, priorities, macro/sex/weight, etc.). |
| `tryramadan-progress` | Fasting progress (completedDays, fastingLog). |
| `tryramadan-daily-goals` | Daily calorie and macro goals. |
| `tryramadan-dashboard-quick-actions` | Ordered list of quick-action IDs. |
| `tryramadan-prayer-times-cache` | Single entry: today’s prayer times for (dateStr, lat, lng). |
| `tryramadan-ramadan-prayers` | Ramadan month prayer times by `lat_lng_year`. |
| `tryramadan-notifications` | Notification settings (suhoor/iftar minutes before, etc.). |
| `tryramadan-today` | Per-date today data (hydration, energy, intention). |
| `tryramadan-journal` | Journal entries. |
| `tryramadan-daily-goals` | Calories, protein, carbs, fat goals. |

---

## 4. "Today" and location-based date

- **Fasting log / completion:** When `displayTimezone` is set, "today" should be location’s date (`getTodayStringInTimezone(displayTimezone)`). Helpers accept optional `todayOverride`: `getTodayFastingLog(progress, todayOverride)`, `isFastingToday(progress, todayOverride)`, `startFastingToday(..., todayOverride)`, etc. Pass `todayStr` from the component when it’s derived from display timezone so countdowns and log stay in sync.
- **Dashboard / FastingBottomBar:** Compute `todayStr` from `displayTimezone` when set and pass it into these helpers and into start/complete/break/uncomplete.

---

## 5. Cache invalidation

- **Prayer times (today):** Cache is keyed by (dateStr, lat, lng). New day or new location → cache miss → fetch. See timezone-and-countdown skill.
- **Ramadan month:** Keyed by lat, lng, Ramadan year. New location or new year → new key → fetch. Stale after 7 days.
- **Preferences:** No automatic invalidation; user changes location/settings in Settings and state updates.

---

## 6. Tests

- **File:** `src/test/localStorage.test.ts` – persistPreferencesSync, persistQuickActionsSync, useLocalStorage (initial, read, write, invalid JSON), getSuggestedCalories, daily goals persistence.
- When adding new keys or sync logic, add tests for round-trip and merge behavior where applicable.
