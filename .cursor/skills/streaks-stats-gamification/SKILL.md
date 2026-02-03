---
name: streaks-stats-gamification
description: Fasting streaks, excused days, non-fasting achievements (journal, mindful eating), and streak/achievement toggle in TryRamadan. Use when changing streak calculation, badges, showStreakAndAchievements, or stats that depend on completed/broken/skipped.
---

# Streaks, Stats, and Gamification (TryRamadan)

Use this skill when **changing streak logic**, **badges**, **excused vs non-excused**, or the **"Show streak and achievements"** preference so behavior and copy stay consistent with the documented flows.

---

## 1. Fasting streak

- **Definition:** Consecutive calendar days **ending on "today"** where each day is either **completed** (full fast) or **broken with excused reason** (illness, travel, menstruation, medical). Excused days **do not** break the streak; they extend it.
- **Helpers:** `getStreakDays(progress, todayOverride?)`, `calculateStreak(progress, todayOverride?)` in `src/hooks/useLocalStorage.ts`. Pass `todayOverride` (e.g. from display timezone) so streak uses the same "today" as the rest of the app (see ramadan-calendar-and-fasting-logic skill).
- **Breaking the streak:** Skipped day ("I didn't fast today"), broken with non-excused reason (e.g. "Ate by mistake", "Other"), or day left untracked — streak resets when looking backward from today.
- **Copy:** Neutral, no guilt. Tooltip: "Consecutive days you completed the full fast or had an excused break (e.g. illness, travel). Excused days don't reset your streak — that's okay."

---

## 2. Excused reasons

- **IDs:** `['illness','travel','menstruation','medical']`. Stored in `fastingLog` as `brokenReason`. Used by `getExcusedFastDays(progress)`; streak and longest-streak calculations treat these as streak-preserving.
- **Longest streak:** `getLongestStreak(progress)` — longest run of consecutive days where each is completed or excused (any order).

---

## 3. Non-fasting achievements

- **Journal streak:** Consecutive days (ending today) with at least one journal entry — `getJournalStreak(entries)`.
- **Mindful eating streak:** Consecutive days with both suhoor and iftar logged — `getMindfulEatingStreak(foodLogs, mealPlans)`.
- **UI:** Progress page shows "Non-fasting wins" (journal streak, both meals logged) when present. Badges (streak-5, streak-10, etc.) and "Current streak" / "Badges" sections respect `showStreakAndAchievements`.

---

## 4. Preference: Show streak and achievements

- **Key:** `preferences.showStreakAndAchievements` (default `true`). When `false`, Dashboard hides streak card and milestone celebration; Progress hides Current streak, Longest streak, and Badges section; Settings still shows streak in "Data Management" preview.
- **Data:** Toggling this preference does **not** change progress or streak calculation; it only hides/shows UI. Streak must use same "today" as Dashboard (todayOverride) to avoid showing 0 after toggle (see Regression: BUG-STRK-001).

---

## 5. Tests and doc

- **Tests:** `src/test/loggingAndTracking.test.ts` (streak, excused days, todayOverride); Regression: BUG-STRK-001.
- **Doc:** **`docs/STREAKS-STATS-GAMIFICATION-FLOWS.md`** (building/breaking streak, copy tone, disabling streak, non-fasting wins).
