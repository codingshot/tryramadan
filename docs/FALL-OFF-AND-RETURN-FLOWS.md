# Fall-off and return flows

Design document for **realistic behavior when users stop logging and come back**: what they see on return (tone: gentle nudge, no guilt), how they can quickly backfill or mark days as "not tracked," and edge cases (e.g. conflicting states for the same day).

**Related docs:** `HISTORICAL-DATA-AND-DELETION-FLOWS.md`, `USER-FLOWS-AND-TEST-PROMPTS.md`, `EDGE-CASE-TEST-SCENARIOS.md`.

---

## 1. Flow A: Consistent for 7 days, then 10 days away, then return

### Scenario

- User logs fasting (and optionally journal/meals) for **days 1–7** of Ramadan.
- User **does not open the app** for **10 days** (days 8–17).
- User **returns** on **day 18** (or any day after the gap).

### What they see on return

| Element | Expected UI (gentle, no guilt) | Rationale |
|--------|---------------------------------|------------|
| **Dashboard** | Default to **today** (day 18). Stats show 7 completed, 0 broken, 0 skipped; streak = 0 (gap broke streak). No "You failed" or "You missed 10 days." | Avoid guilt; focus on "you're here now." |
| **Progress / stats** | "Completed: 7 · Broken: 0 · Skipped: 0." Optional short line: "You have 7 days logged. Want to add past days?" (neutral, not accusatory). | Acknowledge what exists; invite backfill without pressure. |
| **Day picker / Schedule** | Calendar shows **dots or indicators** for days 1–7 (logged); days 8–17 show **no state** (empty). Selecting a gap day shows: no completed, no skipped, no journal — with clear actions to "Mark complete" or "I didn't fast this day" (if we add past-day skip). | Empty = "not tracked," not "failed." |
| **Tone** | No red, no "missed," no "catch up." Use "Add past days" / "Log past days" / "Mark as not fasted" as neutral actions. | Reduce shame; increase likelihood of re-engagement. |

### How they can quickly backfill or mark "not tracked"

| Goal | Friction-free path | Current support |
|------|--------------------|------------------|
| **Mark gap days as completed** (they fasted but didn’t log) | From Dashboard or Schedule: select a past day in the gap → "Yes, mark complete" (or "I fasted this day — mark complete"). Repeat for each day or use a "Mark range complete" if we add it. | **Yes.** Dashboard day picker + "Mark this day as completed"; Schedule calendar + "I fasted this day — mark complete." |
| **Mark gap days as "didn’t fast"** (they didn’t fast and don’t want them counted as completed) | Select past day → "I didn’t fast this day" (or "Skip / Not fasted"). One tap per day. | **Partial.** `setDaySkipped(progress, setProgress, dateStr)` works for any date; Dashboard only exposes "I didn’t fast **today**." Schedule has no "didn’t fast this day" for past days. **Recommendation:** Add "I didn’t fast this day" on Schedule (and optionally Dashboard when a past day is selected) using `setDaySkipped(..., selectedDate)`. |
| **Leave gap days untracked** | Do nothing. Days 8–17 remain "no state"; they are not in `completedDays`, `skippedDays`, or broken. Stats: only 7 completed. | **Yes.** No need to mark; empty is valid. |
| **Backfill journal for gap days** | Journal → pick date from calendar → write → Save. One date at a time. | **Yes.** Calendar supports past dates; save overwrites or creates entry. |
| **Backfill meals for gap days** | Schedule (or Meals) → select day → add suhoor/iftar. | **Yes.** Food log and meal plans are per-day; past days editable. |

### Data model (Flow A)

- **completedDays:** e.g. `["2025-03-01", …, "2025-03-07"]` (7 entries).
- **skippedDays:** `[]` (unless user marks gap days as skipped).
- **fastingLog:** entries for days 1–7 only (and any new backfills).
- Days 8–17: no keys in completedDays/skippedDays; no fastingLog entry. Treated as **untracked**, not "missed."

---

## 2. Flow B: Missed several fasts, avoided app due to guilt, then return

### Scenario

- User logs for a few days, then **misses** several fasts (broke fast or didn’t fast at all).
- User **avoids opening the app** (guilt, shame).
- User **returns** later in Ramadan (e.g. day 15 or 20).

### What they see on return (gentle nudge, no guilt)

| Element | Expected UI | Rationale |
|--------|-------------|-----------|
| **First screen** | Same as any return: **today** in focus. No popup saying "You haven’t logged in X days" or "You missed Y fasts." | Avoid reinforcing guilt; normalize return. |
| **Stats** | Show what’s logged (e.g. "Completed: 3 · Broken: 1 · Skipped: 0"). No "You’re behind" or "Catch up." Optional soft line: "Every day you log is a win." | Affirm small wins; don’t compare to an ideal. |
| **Broken fasts** | Broken days listed under Progress; reason shown (e.g. "Travel," "Illness"). No judgmental copy; optional "You can make up fasts later" (factual). | Informative, not shaming. |
| **Empty / untracked days** | Shown as "not tracked" (no badge). Actions: "Mark complete" or "I didn’t fast this day." No "Missed" label. | "Not tracked" is neutral; "missed" implies failure. |

### How they can quickly backfill or mark "not tracked"

| Goal | Friction-free path | Notes |
|------|--------------------|--------|
| **Mark missed days as "didn’t fast"** | Select each past day → "I didn’t fast this day." So they’re in `skippedDays` and not counted as completed; streak stays consistent. | Requires UI for past-day skip (see Flow A). |
| **Mark missed days as completed** (they actually fasted but didn’t log) | Select past day → "Yes, mark complete." | Already supported. |
| **Leave untracked** | No action. Those days stay out of completed/skipped/broken. | Valid; stats stay as-is. |
| **Log broken fast for a past day** | If we support "Break fast" for a past day: same as today (reason dialog). Currently break is real-time; past-day "broken" could be "Mark as broken" with reason. | **Current:** Break fast is for today. Past-day broken would need a dedicated flow (e.g. "Mark this day as broken" + reason). |

### Data model (Flow B)

- **completedDays:** only days they completed.
- **skippedDays:** days they explicitly mark "I didn’t fast."
- **fastingLog:** may include `status: 'broken'` for days they broke (with reason).
- Untracked days: not in any of these; displayed as empty in calendar/list.

---

## 3. Edge cases: backfilling and conflicting data

### 3.1 Same day, two different states (conflict)

**Scenario:** User (or a bug) sets the **same day** to more than one state, e.g. both "completed" and "skipped," or "completed" and "broken."

| Case | Expected data model | Expected UI |
|------|---------------------|------------|
| **Completed and skipped** | A day cannot be both. **Single source of truth:** `completedDays` and `skippedDays` are mutually exclusive. When user marks day as skipped, remove it from `completedDays` (and from any completed entry in `fastingLog`). When user marks day as completed, remove it from `skippedDays`. **Last action wins.** | Show one state per day. If data is already inconsistent (legacy), normalize on load: e.g. if date in both arrays, treat as "skipped" and remove from completed (or define a precedence: skipped > completed). |
| **Completed and broken** | A day can be **broken** (fast started then broken) — that day is in `fastingLog` with `status: 'broken'` and should **not** be in `completedDays`. So completed and broken are mutually exclusive. When user marks "broken" for a day, remove from `completedDays`. | Same: one state. Broken takes precedence over completed if both present (normalize on read). |
| **Skipped and broken** | Semantically distinct: "didn’t fast" vs "started then broke." A day should be one or the other. If both exist in data, define precedence (e.g. broken over skipped) and normalize. | One state per day. |

**Implementation note:** `setDaySkipped` already removes the day from `completedDays` and clears `fastingLog` for that date. `setDayCompleted(..., false)` removes from completed but doesn’t add to skipped. So the only way to get "both" is legacy data or a future bug. A **normalizer** is implemented: `normalizeProgressSameDayConflict()` in `useLocalStorage.ts` ensures no date is in both `completedDays` and `skippedDays` (skipped wins); applied in `useFastingProgress()` on read, and the normalized result is persisted once on load to fix legacy data.

### 3.2 Backfill "complete" then later "skip" (or vice versa)

**Scenario:** User marks day 10 complete (backfill). Later they change their mind and mark day 10 as "I didn’t fast this day."

| Expected | Data model | UI |
|---------|------------|-----|
| **Last action wins** | Second action overwrites: day 10 removed from `completedDays`, added to `skippedDays`; any `fastingLog` for that day cleared or updated. | Day 10 now shows "Skipped"; stats and streak update. No duplicate state. |
| **Undo** | If we add undo (see HISTORICAL-DATA-AND-DELETION-FLOWS.md), user could revert to "completed" within a short window. | Optional. |

### 3.3 Multiple sessions / devices (no sync)

**Scenario:** User backfills on phone, then opens app on another device (or cleared storage). No server sync.

| Expected | Behavior |
|----------|----------|
| **No shared state** | Each device (or post-clear) has only its own localStorage. Return-after-gap flows still apply; "what they see" is whatever is on that device. |
| **Recovery** | Export/import (when implemented) is the way to bring "returning" data to a new device. See HISTORICAL-DATA-AND-DELETION-FLOWS.md. |

### 3.4 Streak and "gap" display

**Scenario:** User had a 5-day streak (days 1–5), then gap (days 6–14), then returns on day 15 and marks day 15 complete.

| Expected | Behavior |
|----------|----------|
| **Streak** | Streak = 1 (only day 15). Days 1–5 are not "current" streak because of the gap. `calculateStreak` already excludes skipped/broken and counts only consecutive completed days from "today" backward. | Correct. |
| **No "you lost your streak"** | Don’t show "You lost your 5-day streak." Optional: "Your streak starts fresh from today" (neutral). | Tone: gentle, not punitive. |

---

## 4. Summary: UI and copy guidelines

| Principle | Do | Avoid |
|-----------|----|--------|
| **Return** | Default to today; show existing stats; optional "Add past days?" (neutral). | "You haven’t logged in X days"; "You missed Y fasts"; red or guilt-heavy copy. |
| **Empty days** | "Not tracked" or no badge; actions "Mark complete" / "I didn’t fast this day." | "Missed"; "Failed"; "Incomplete." |
| **Backfill** | One-tap per day (mark complete or skip); calendar pick for journal/meals. | Requiring many steps or long forms for past days. |
| **Conflict** | Single state per day; last action wins; normalizer so data can’t be both completed and skipped/broken. | Allowing same day in multiple buckets. |

---

## 5. Implementation checklist

| Item | Status | Notes |
|------|--------|--------|
| Show today on return; no guilt copy | ✅ (no negative copy today) | Add optional "Add past days?" or "You have X days logged" if desired. |
| Mark **past** day complete | ✅ | Dashboard + Schedule. |
| Mark **past** day as "I didn’t fast" | ✅ Done | Data: `setDaySkipped(..., dateStr)`. UI: Dashboard + Today for today; Schedule has "I didn't fast this day" for selected day. Add Schedule (and optionally Dashboard when past day selected) button "I didn’t fast this day" calling `setDaySkipped(progress, setProgress, selectedDate)`. |
| Leave days untracked | ✅ | No action needed; empty is valid. |
| Backfill journal/meals for past days | ✅ | Journal calendar + Schedule/Meals per day. |
| Normalize same-day conflict (completed vs skipped vs broken) | ⚠️ Recommend | On load or before save: ensure each date in at most one of completed/skipped/broken; define precedence if legacy data has duplicates. |
| Streak after gap | ✅ | `calculateStreak` is gap-aware. Avoid "you lost your streak" copy. |

---

## 6. Test prompts for QA

- **Flow A (7 days, 10 gap, return):** Seed progress with 7 completed days; advance "today" to day 18 (or mock). Open app. Do you see today by default? Stats "7 completed"? No "missed" or guilt message? Select a gap day (e.g. day 10): can you "Mark complete"? Can you "I didn’t fast this day" (when implemented)?
- **Flow B (guilt return):** Seed 3 completed, 1 broken. Open app. Is copy neutral? Can you mark untracked past days as skipped or completed?
- **Conflict:** Manually set same date in both `completedDays` and `skippedDays`. Load app. Is only one state shown? Does normalizer (if implemented) remove the duplicate?
- **Backfill then change:** Mark day 10 complete, then mark day 10 "I didn’t fast this day." Does day 10 show only "Skipped"? Do stats update?

These flows and edge cases define realistic fall-off-and-return behavior, tone (gentle, no guilt), and low-friction backfill and "not tracked" options.
