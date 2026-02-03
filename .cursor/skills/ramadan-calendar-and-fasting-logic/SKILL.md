---
name: ramadan-calendar-and-fasting-logic
description: Ramadan calendar (start/end, day number, year boundary), fasting states (completed/skipped/broken), streak and todayOverride in TryRamadan. Use when editing src/lib/ramadan.ts, fasting state transitions, streak calculation, or Ramadan day labels.
---

# Ramadan Calendar and Fasting Logic (TryRamadan)

Use this skill when working on **Ramadan dates**, **fasting state** (completed/skipped/broken), **streak**, or **"today" vs timezone** so behavior stays consistent with the documented model.

---

## 1. Ramadan calendar (`src/lib/ramadan.ts`)

- **Start/end:** `RAMADAN_START_BY_YEAR` (Gregorian); `getRamadanStartForYear`, `getRamadanEndForYear`. Cross-year Ramadan (e.g. 2030-12-26 → 2031-01-23) is handled in `isRamadanDay` and `getRamadanDayNumber`.
- **Missing year:** Code falls back to ~11 days earlier from a reference year; add a test for missing year and consider logging or in-app note when using fallback.
- **Tests:** `src/test/ramadan.test.ts`. See **`docs/QA-RAMADAN-LOGIC-AND-TEST-CASES.md`** and **`docs/EDGE-CASE-TEST-SCENARIOS.md`** (calendar & Ramadan boundaries).

---

## 2. Fasting states (per day)

- **Data:** `progress.completedDays`, `progress.skippedDays`, `progress.fastingLog` (entries with `status: 'in_progress' | 'completed' | 'broken'`, optional `brokenReason`).
- **Transitions:** `startFastingToday` → in_progress; `completeFastingToday` → completed + add to completedDays; `breakFastingToday` → broken (remove from completedDays, store reason); `setDaySkipped` → skipped (remove from completedDays, clear log for that date); `uncompleteFastingToday` / `setDayCompleted(..., false)` → remove from completedDays.
- **Excused:** `brokenReason` in `['illness','travel','menstruation','medical']` = excused; stats and streak treat excused as streak-preserving (see streaks-stats-gamification skill).
- **State-transition table and invalid transitions:** **`docs/STATE-TRANSITION-TESTING-FASTING.md`**. When changing transitions, ensure UI blocks or warns on invalid transitions.

---

## 3. "Today" and todayOverride

- **Display timezone:** When `displayTimezone` is set, "today" = location's date (`getTodayStringInTimezone(displayTimezone)`). Pass this as `todayOverride` into: `getTodayFastingLog(progress, todayOverride)`, `isFastingToday(progress, todayOverride)`, `startFastingToday(..., todayOverride)`, `completeFastingToday(..., todayOverride)`, `breakFastingToday(..., todayOverride)`, `getStreakDays(progress, todayOverride)`, `calculateStreak(progress, todayOverride)`.
- **Dashboard, Today, Progress, Settings, Achievements:** All use `todayStr` from display timezone when set and pass it into streak and fasting helpers so streak and day label stay in sync.
- **Bug risk:** If streak or "today" uses device-local date while the rest of the app uses display timezone, streak can show 0 or wrong day. Always pass the same "today" used for the UI.

---

## 4. Ramadan calendar override (user-defined Ramadan days)

- **Doc:** **`docs/RAMADAN-CALENDAR-ROBUSTNESS-AND-OVERRIDE.md`**. Covers app vs community start/end difference, manual override of "Ramadan days," and edge cases (logging before/after app’s Ramadan, voluntary fasts still labeled Ramadan). Implement override and labeling so the experience stays coherent with user control.

---

## 5. Tests

- **Ramadan dates:** `src/test/ramadan.test.ts`.
- **Fasting / streak / todayOverride:** `src/test/loggingAndTracking.test.ts` (including Regression: BUG-STRK-001).
- When changing Ramadan or fasting logic, add or update tests and check STATE-TRANSITION-TESTING-FASTING and EDGE-CASE-TEST-SCENARIOS for coverage.
