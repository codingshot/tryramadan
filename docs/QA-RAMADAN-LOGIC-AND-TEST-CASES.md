# QA: Ramadan logic, state model & test cases

QA summary for Ramadan-specific logic: calendar/dates, fasting states, meal & journal behaviour. Includes logic gaps with suggestions and test cases suitable for automation. For **state-transition testing** of a single day (states, events, valid/invalid transitions, UI block/warn), see **`STATE-TRANSITION-TESTING-FASTING.md`**.

---

## 1. Calendar & dates

### 1.1 Current behaviour

- **Ramadan start/end:** `src/lib/ramadan.ts` uses `RAMADAN_START_BY_YEAR` (Gregorian) and `getRamadanStartForYear` / `getRamadanEndForYear`. Cross-year Ramadan (e.g. 2030-12-26 → 2031-01-23) is handled in `isRamadanDay` and `getRamadanDayNumber`.
- **DST:** Prayer times come from Aladhan API; times are requested for a given date/location. The app uses `preferences.timezone` (IANA) for display and iCal; the API returns times for that date in the location’s timezone, so DST is reflected when the user’s date/timezone is correct.
- **Timezone/location change:** `todayOverride` is used when a display timezone is set so “today” and fasting log align with the user’s chosen location. Prayer times refetch on location change (e.g. `usePrayerTimes`, Ramadan cache key includes coords).

### 1.2 Logic gaps & suggestions

| Gap | Suggestion |
|-----|------------|
| **Missing year in `RAMADAN_START_BY_YEAR`** | Code falls back to ~11 days earlier from 2025; no explicit “unknown year” handling. Add a test that a missing year returns a sensible date; consider logging or a small in-app note when using fallback. |
| **DST transition mid-Ramadan** | No explicit test that countdowns (e.g. FastingTimer, Dashboard Prayers) update correctly when the clock shifts (e.g. 23:00 day before vs 00:00 day after). Verify prayer timestamps and countdown math use the same timezone and that “today” doesn’t flip incorrectly. |
| **Fasting across timezone boundary** | If user flies east→west during a fast, `hoursBetween(startedAt, completedAt)` uses UTC; duration is correct but “today” may differ between origin and destination. Document that “today” is location-based when `todayOverride` is set; consider showing a short note when timezone changed since `startedAt`. |
| **Hijri ↔ Gregorian** | App uses Gregorian dates only; Hijri is not shown for Ramadan start/end. Optional: show Hijri date (e.g. 1 Ramadan 1452) next to Gregorian on dashboard or in export. |

---

## 2. Fasting states

### 2.1 Current model (`FastingLogEntry` in `useLocalStorage.ts`)

- **`status`:** `'in_progress' | 'completed' | 'broken'`
- **Transitions:**  
  `startFastingToday` → `in_progress`;  
  `completeFastingToday` → `completed` (and add to `completedDays`);  
  `breakFastingToday` → `broken` (remove from `completedDays`, optional `brokenReason`);  
  `uncompleteFastingToday` → `in_progress` (from `completed`).  
- **Reasons for broken:** `BROKEN_FAST_REASONS`: mistake, illness, travel, menstruation, medical, other.

### 2.2 All desired states (per day)

| State | In data model? | In UI? | Notes |
|-------|----------------|--------|--------|
| Not fasting (no entry) | Implicit (no `FastingLogEntry`) | No explicit action | User can simply not tap “I’m fasting”. |
| **Not fasting (explicit “skipped”)** | No | No | No way to say “I didn’t fast today” (illness, travel, choice). |
| Planned (intention for tomorrow) | No | No | Not required for MVP. |
| In progress | Yes (`in_progress`) | Yes (“I’m fasting”) | Working. |
| Completed | Yes (`completed` + `completedDays`) | Yes (“Mark complete”) | Working. |
| Broken | Yes (`broken` + `brokenReason`) | Yes (“I broke my fast” + reason) | Working. |
| **Excused** (illness/travel/menstruation) | Same as broken | Same as broken | Semantically “excused” but stored as `broken`; stats don’t separate. |
| **Making up (Qada)** | No | No | No way to log a makeup fast. |

### 2.3 Logic gaps & suggestions

| Gap | Suggestion |
|-----|------------|
| **Explicit “I didn’t fast today”** | Add `status: 'skipped'` to `FastingLogEntry` (or a separate list `skippedDays: string[]`). UI: on Dashboard/DashboardToday when no fast started and not completed, add “I didn’t fast today” to set this. Progress/export can then show completed / broken / skipped. |
| **Excused vs unintentional break** | Option A: Add `status: 'excused'` and map reason ids (illness, travel, menstruation, medical) to excused. Option B: Keep single `broken` and add `excused: boolean` or derive from `brokenReason`. Stats/Progress can then show “Excused” separately. |
| **Making up a missed fast (Qada)** | Add optional `isMakeupFast?: boolean` on `FastingLogEntry`, or a separate store for makeup days. UI: when starting or completing, allow “This is a makeup fast”. Progress could show “Ramadan completed” vs “Makeup days” if needed. |
| **Partial fast** | Keep as “broken” with reason; optional extra reason “Stopped early” or “Partial fast” if you want to distinguish from full break. |

---

## 3. Meal & journal logic

### 3.1 Meals

- **Storage:** `tryramadan-day-meal-plans` (per-day suhoor/iftar text), `tryramadan-day-food-log` (per-day `DayFoodLog`: suhoor, iftar, between), `tryramadan-day-planned-items` (planned items with macros).
- **Link to fast:** Logging a meal does **not** change fasting state; “Break fast” is a separate action. Behaviour is consistent; no automatic break on log.
- **Fasting vs non-fasting days:** Users can log suhoor/iftar/between on any day; no restriction. Schedule and Meals pages don’t disable logging for “skipped” days.

### 3.2 Logic gaps & suggestions

| Gap | Suggestion |
|-----|------------|
| **Link meal to fast status** | No change required for “break on log”. Optional: on a fasting day with `in_progress`, show a small note “Logging food here doesn’t break your fast; use ‘Break fast’ if you ate.” |
| **Edit/delete meal entries** | Confirm in code that food log and meal plan entries are editable and deletable on Schedule and Meals; add a test that edit/delete persists and reflects in day totals. |
| **Non-fasting day meal labels** | On non-Ramadan or “skipped” days, “Suhoor”/“Iftar” are still used; acceptable. Optional: label as “Morning”/“Evening” for skipped days if desired. |

### 3.3 Journal

- **Storage:** `tryramadan-journal`: array of `JournalEntry` `{ date, prompt, content, gratitude?, mood? }`. No per-entry timestamp (only `date`).
- **Per-day:** One logical entry per day (keyed by `date`); selecting another date loads/creates that day’s entry.
- **Prompt:** `getPromptForDate(isoDate)` uses `(day - 1) % PROMPTS.length` so prompt is deterministic by day-of-month.
- **Retrieval:** Entries sorted by `date` desc in state; “past entries” and Schedule day view use this. Export is JSON with all entries.

### 3.4 Journal logic gaps & suggestions

| Gap | Suggestion |
|-----|------------|
| **Timestamp per entry** | Entries have only `date`. For “when did I write this?” add optional `createdAt` / `updatedAt` (ISO string) on save. Enables timeline “last edited” and stable ordering when multiple edits same day. |
| **Timeline / per-day view** | Current “past entries” is list by date. Optional: filter by Ramadan date range, or “last 7 days”; ensure sort is always by date (and if added, by `updatedAt` for same day). |
| **Future dates** | Code allows writing for future dates; `showWriteTodayPrompt` nudges for today. Acceptable; no change required unless you want to restrict to today/past only. |

---

## 4. Proposed test cases (for automation)

### 4.1 Calendar & dates

| ID | Description | Edge case? |
|----|-------------|------------|
| CAL-1 | Given a known year in `RAMADAN_START_BY_YEAR`, `getRamadanStartForYear` returns the expected Gregorian date. | No |
| CAL-2 | `getRamadanEndForYear` returns start + 29 or 30 days (e.g. 2031 → 29 days). | No |
| CAL-3 | For a year **not** in `RAMADAN_START_BY_YEAR`, `getRamadanStartForYear` returns a date (fallback), no throw. | Yes |
| CAL-4 | Ramadan spanning two Gregorian years (e.g. 2030-12-26 to 2031-01-23): `isRamadanDay` is true for first and last day; `getRamadanDayNumber` returns 1 and 29/30. | Yes |
| CAL-5 | `isRamadanDay` is false for day before start and day after end. | No |
| CAL-6 | `getDaysUntilRamadan` returns 0 when today is within Ramadan; positive integer when before. | No |
| DST-1 | With a fixed date and timezone that has DST transition that day, prayer times (or countdown) don’t throw and next prayer time is in the future when expected. | Yes |
| TZ-1 | Changing `displayTimezone` (or location) updates FastingTimer / Dashboard Prayers displayed time or countdown (e.g. mock preferences and assert displayed text or next prayer). | No |
| TZ-2 | With `todayOverride` set to a different “today” than device, `getTodayFastingLog(progress, todayOverride)` returns the entry for override date. | Yes |

### 4.2 Fasting states

| ID | Description | Edge case? |
|----|-------------|------------|
| FS-1 | `startFastingToday` adds an `in_progress` entry for today; second call is idempotent (no duplicate). | No |
| FS-2 | `completeFastingToday` sets status `completed`, sets `completedAt`, adds date to `completedDays`, computes `hoursFasted`. | No |
| FS-3 | `breakFastingToday` sets status `broken`, sets `brokenReason`, removes date from `completedDays`, computes `hoursFasted`. | No |
| FS-4 | `uncompleteFastingToday` changes `completed` back to `in_progress`, removes from `completedDays`, clears `completedAt`. | No |
| FS-5 | `breakFastingToday` with invalid reason id falls back to `other`. | No |
| FS-6 | `getTodayFastingLog` returns undefined when there is no entry for the given date. | No |
| FS-7 | `setDayCompleted(dateStr, true/false)` toggles `completedDays` for that date without requiring a `FastingLogEntry` for that day. | Yes |
| FS-8 | Streak helpers: `getCurrentStreakDays` and `getLongestStreak` behave correctly for consecutive `completedDays` and gaps. | No |

### 4.3 Meal & journal

| ID | Description | Edge case? |
|----|-------------|------------|
| ML-1 | Add food log entry for a day (suhoor/iftar/between); read back and assert totals (e.g. calories) from `getDayTotalsFromFoodLog`. | No |
| ML-2 | Edit and delete a food log entry; assert storage and day totals update. | No |
| ML-3 | Add meal plan note for a day; assert it appears for that date on Schedule. | No |
| ML-4 | Log meals on a day that has `status: 'broken'`; assert no automatic change to fasting state. | No |
| J-1 | Save journal entry for a date; load by date and assert content, mood, gratitude. | No |
| J-2 | `getPromptForDate(isoDate)` returns same prompt for same day-of-month across months. | No |
| J-3 | Journal entries sorted by date descending in list/export. | No |
| J-4 | Save entry for date A, then switch to date B and save; both entries persist and are retrievable by date. | No |
| J-5 | Export journal: JSON contains `exportedAt` and all entries with expected fields. | No |

### 4.4 Integration / UI (manual or E2E)

| ID | Description | Edge case? |
|----|-------------|------------|
| E2E-1 | Set location → open Dashboard → prayer times or countdown visible (or error state if API fails). | No |
| E2E-2 | Start fast → Mark complete; Progress shows +1 completed day and streak updates. | No |
| E2E-3 | Start fast → Break fast with reason; Progress shows day as broken, not in completed. | No |
| E2E-4 | Change location mid-Ramadan; prayer times refresh; “today” with display timezone still correct. | Yes |
| E2E-5 | Add Ramadan to calendar (iCal): date range matches current Ramadan; events use user timezone. | No |

---

## 5. Prioritisation (for implementation)

**High (state model / clarity)**  
- Add explicit “I didn’t fast today” (skipped) state and UI so Progress and exports are unambiguous.

**Medium (UX & stats)**  
- Separate “excused” from “broken” in data or UI so stats can show excused vs unintentional.  
- Journal: optional `updatedAt`/`createdAt` for ordering and “last edited” in UI.

**Lower (nice-to-have)**  
- Qada (makeup fast) flag.  
- Hijri date display for Ramadan start/end.  
- DST and timezone-boundary tests and any small in-app notes.

Use the test case IDs (CAL-*, FS-*, ML-*, J-*, E2E-*) when adding unit tests (e.g. in `ramadan.test.ts`, `loggingAndTracking.test.ts`, or new `journal.test.ts` / `meals.test.ts`) and when writing E2E or integration tests.

---

## 6. Implementation status

Implemented in app:

- **1.2 Missing year in RAMADAN_START_BY_YEAR:** `getRamadanStartForYear` uses fallback (~11 days earlier from 2025); in development, `console.warn` logs when fallback is used so missing years are visible.
- **2.3 Explicit "I didn't fast today":** `skippedDays` and `setDaySkipped`; UI on Dashboard and DashboardToday ("I didn't fast today" button). Progress shows Completed / Broken / Skipped.
- **2.3 Excused vs unintentional break:** `getExcusedFastDays(progress)` returns broken days with reason illness, travel, menstruation, or medical. Dashboard Progress breakdown shows "Broken: Y (Z excused)" when Z > 0; Broken fast card tooltip mentions excused when applicable.
- **3.2 Link meal to fast status:** On Meals page, when user has an in-progress fast today, a note is shown: "Logging food here doesn't break your fast; use 'Break fast' on the Dashboard if you ate."
- **3.4 Journal timestamps:** Journal entries have optional `createdAt` / `updatedAt` (ISO string) on save.
