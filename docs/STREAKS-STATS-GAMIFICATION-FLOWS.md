# Streaks, stats, and gentle gamification flows

Design document for **fasting streaks**, **breaking a streak** (missed fasts, excused days), **non-fasting achievements** (journaling, mindful eating), and **edge cases** (many excused days, disabling streak). For each we define **expected behavior**, **copy tone**, and **data impact**. Implementation reflects this.

**Related docs:** `EDGE-CASE-TEST-SCENARIOS.md`, `FALL-OFF-AND-RETURN-FLOWS.md`, `USER-FLOWS-AND-TEST-PROMPTS.md`.

---

## 1. Flow: Building a fasting streak

### Expected behavior

- **Streak** = consecutive calendar days (ending today) where the user either **completed** the full fast or **broke** the fast with an **excused** reason (illness, travel, menstruation, medical). Excused days **do not** reset the streak; they extend the run (we count them in the streak length so the user is not punished).
- **Display:** "Day Streak" shows the number. Click opens list of dates in the streak. Milestone celebrations at 7, 15, 30 days (when streak feature is enabled).
- **Data:** `completedDays` (completed full fast); `fastingLog` entries with `status: 'broken'` and `brokenReason` in `['illness','travel','menstruation','medical']` count as excused. Streak is computed from these; not stored.

### Copy tone

- **Neutral, encouraging.** "Day Streak" (not "Don't break your streak"). Tooltip: "Consecutive days you completed the full fast or had an excused break (e.g. illness, travel). Excused days don't reset your streak — that's okay."
- **Milestones:** "Week streak!", "Half-month streak!", "Full month streak!" with subline "X consecutive days". No guilt if they miss a day later.

### Data impact

- No new keys. `calculateStreak(progress)` and `getStreakDays(progress)` use `completedDays` and excused subset of `fastingLog` (see implementation).

---

## 2. Flow: Breaking a streak (missed fasts, excused days)

### Expected behavior

- **Skipped day** ("I didn't fast today"): breaks the streak. Next day streak starts from 0 (or 1 when they complete that day).
- **Broken fast, non-excused** (e.g. "Ate by mistake", "Other"): breaks the streak.
- **Broken fast, excused** (illness, travel, menstruation, medical): **does not** break the streak. Streak continues through that day.
- **No action** (day left untracked): breaks the streak when we look backward (day not in completed nor excused).
- **UI:** No punitive message. After a break: show "Day Streak: 0" or the new count; optional soft line "Every day you log is a win" (see FALL-OFF-AND-RETURN-FLOWS). Broken fast card already shows "X of these are excused" where applicable.

### Copy tone

- **No guilt.** "Skipped or non-excused broken days reset the streak — that's okay." Don't say "You lost your streak" or "Streak broken."
- **Excused:** "Excused days (illness, travel, etc.) don't reset your streak."

### Data impact

- Streak is derived; no change to how we store completed/broken/skipped. Only the **calculation** of streak and longest streak includes excused days as "streak-preserving."

---

## 3. Flow: Non-fasting achievements (journal, mindful eating)

### Expected behavior

- **Journal streak:** Consecutive days (ending today) with at least one journal entry. Displayed as "Journal streak: X days" (or badge). Encourages consistent reflection without tying to fasting.
- **Mindful eating:** Consecutive days (ending today) with both suhoor and iftar (or morning/evening meals) logged (meal plan text or food log). Displayed as "Meals logged: X days in a row" or a small badge. Gentle nudge to log meals.
- **Where:** Progress page (and optionally Dashboard) in an "Other wins" or "Habits" section so non-fasting activity is visible.

### Copy tone

- **Light, inclusive.** "Journal streak" / "Reflection streak"; "Logged both meals" / "Mindful eating." No pressure. "Small wins count."

### Data impact

- **Journal streak:** Read `tryramadan-journal` (array of `{ date }`); compute consecutive days with an entry ending today.
- **Mindful eating:** Read `tryramadan-day-food-log` and `tryramadan-day-meal-plans`; for each date, "has both" = (suhoor logged or planned) and (iftar logged or planned). Consecutive run ending today.
- No new localStorage keys; computed from existing data.

---

## 4. Edge case: User has many excused days

### Expected behavior

- **Streak logic does not punish.** Excused days (broken with illness/travel/menstruation/medical) are treated as part of the consecutive run. So a user with 10 completed, 3 excused, 5 completed has a **current streak of 18** (all 18 days in a row count).
- **Longest streak:** Longest run of consecutive calendar days where each day is either completed or excused. So many excused days in a row still form part of a "run" (e.g. 7 completed, 5 excused, 8 completed = 20-day longest streak).
- **Copy:** Tooltip and summary line already say "X excused" in the Broken card. No extra message needed; the math does the work.

### Data impact

- Same as §1–2: excused dates come from `getExcusedFastDays(progress)`. `getStreakDays` and `getLongestStreak` take excused into account.

---

## 5. Edge case: User wants to disable streak features entirely

### Expected behavior

- **Setting:** "Show streak and achievements" (or "Streak and milestones") in Settings. Default **on**. When **off**:
  - **Dashboard:** Hide the streak stat card and the milestone celebration (7/15/30). Optionally show only "Total days" and "Broken" / "Skipped" in the stats row.
  - **Progress:** Hide or collapse streak number and streak-based badges; keep "Total days," completion rate, and export. Non-fasting stats (journal streak, mindful eating) can stay or be hidden with the same toggle (recommend same toggle: "Streak and achievements" covers all gentle gamification).
  - **Reset dialog (Settings):** Can still list "Current streak" in the "will be lost" summary for clarity, or omit when disabled.
- **Copy:** Setting description: "Show streak counter and achievement badges. Turn off for a simpler view."

### Copy tone

- **Neutral.** "Turn off for a simpler view" — not "if you don't want to be judged."

### Data impact

- **New preference:** `showStreakAndAchievements: boolean` (default `true`) in `UserPreferences`. When `false`, UI hides streak card, milestone banner, and achievement badges (or only streak-related ones; see implementation). Data (completedDays, fastingLog, journal, meals) unchanged.

---

## 6. Summary table

| Item | Behavior | Copy tone | Data |
|------|----------|-----------|------|
| Building streak | Consecutive completed or excused ending today | Encouraging, no pressure | Derived from completedDays + excused |
| Broken (non-excused) | Resets streak | "That's okay" | Same |
| Excused day | Does not reset; counts in streak | "Excused don't reset your streak" | Same |
| Skipped day | Resets streak | No guilt | Same |
| Journal streak | Consecutive days with journal entry | "Reflection streak" / small wins | From tryramadan-journal |
| Mindful eating | Consecutive days with both meals logged | "Logged both meals" | From food log + meal plans |
| Disable streak | Hide streak + milestones + badges | "Simpler view" | showStreakAndAchievements: false |

---

## 7. Test prompts for QA

- **Excused in streak:** Mark 3 days complete, 1 day broken with reason "Illness," then 2 days complete. Is current streak 6? Longest streak 6?
- **Skipped breaks streak:** Mark 3 days complete, 1 day "I didn't fast today," then 2 days complete. Is current streak 2?
- **Disable streak:** Turn off "Show streak and achievements" in Settings. Reload. Is streak card hidden on Dashboard? Is milestone (7/15/30) hidden? On Progress, are streak and badges hidden or simplified?
- **Journal streak:** Add journal entries for today and yesterday only. Is "Journal streak: 2" (or similar) shown on Progress?
- **Mindful eating:** Log both suhoor and iftar for today and yesterday. Is "Meals logged: 2 days" (or similar) shown?

Implementation in code: streak logic (excused-preserving), preference and toggle, non-fasting stats and copy as above.
