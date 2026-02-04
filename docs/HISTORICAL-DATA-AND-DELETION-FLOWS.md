# Historical data and deletion flows

Design document for **viewing history**, **comparing Ramadan years**, **export/review**, and **deletion edge cases**. For each flow and edge case we define expected **UI** and **data model** behaviour. Use for QA, product decisions, and implementation.

**Related docs:** `EDGE-CASE-TEST-SCENARIOS.md`, `USER-FLOWS-AND-TEST-PROMPTS.md`, `QA-RAMADAN-LOGIC-AND-TEST-CASES.md`, `FALL-OFF-AND-RETURN-FLOWS.md` (users who fall off and return; backfill and conflict edge cases).

---

## Data model context

- **Storage:** All app data is in `localStorage` under keys such as `tryramadan-progress`, `tryramadan-journal`, `tryramadan-day-food-log`, `tryramadan-day-meal-plans`, etc. There are **no year-specific keys**; "this Ramadan" vs "last year" is determined by **filtering by date range** using `getRamadanStartForYear(year)` / `getRamadanEndForYear(year)` from `src/lib/ramadan.ts`.
- **Progress:** `tryramadan-progress` holds `completedDays`, `skippedDays`, `fastingLog` (dates as YYYY-MM-DD). Entries can span multiple Ramadan years; "current Ramadan" = dates inside the current Ramadan window.
- **Journal:** `tryramadan-journal` is an array of `{ date, prompt, content, gratitude?, mood?, createdAt?, updatedAt? }`. One entry per date (overwrite on save).
- **Meals:** `tryramadan-day-food-log` and `tryramadan-day-meal-plans` are keyed by date (YYYY-MM-DD). No year suffix.

---

## 1. Flows for viewing and comparing history

### 1.1 Viewing fasting and meal history for the current Ramadan

**Goal:** User can see which days they fasted (completed/broken/skipped) and what they ate during this Ramadan.

| Aspect | Expected UI | Expected data model |
|--------|-------------|----------------------|
| **Where** | Dashboard (day picker + stats), Dashboard Schedule (calendar + day detail), Dashboard Progress (stats/CSV). Optional: dedicated "This Ramadan" history view (list or calendar of days with status + meals). | Read from `progress.completedDays`, `progress.skippedDays`, `progress.fastingLog`, `getBrokenFastDays()`; filter by date ∈ [current Ramadan start, current Ramadan end]. Meals: read `tryramadan-day-food-log` and `tryramadan-day-meal-plans`; same date filter. |
| **Fasting** | For each day in current Ramadan: show Completed / Broken (with reason) / Skipped / Not set. List or calendar; click day → detail. | Filter `fastingLog` and `completedDays`/`skippedDays`/broken by `isRamadanDay(date)` and date within `getRamadanDateRange()` for current year. |
| **Meals** | For each day: show suhoor/iftar/between items (or "No meals logged"). Schedule page already shows selected day; can add "View all days this Ramadan" summary. | Filter keys of `day-food-log` and `day-meal-plans` to dates in current Ramadan range. |
| **Empty** | If no data in range: "No fasting or meal data for this Ramadan yet." | No entries in progress or food log for that range. |

**Current implementation:** Dashboard and Schedule show any stored day; Progress shows totals (all time). There is no explicit "current Ramadan only" filter in the UI; filtering can be added in a dedicated view or by passing date range to existing components.

---

### 1.2 Comparing this Ramadan to last year (if data exists)

**Goal:** User can see how this Ramadan compares to the previous one (e.g. days completed, streak, hours).

| Aspect | Expected UI | Expected data model |
|--------|-------------|----------------------|
| **When** | Only show "Compare to last year" (or "Last Ramadan") when there is at least one fasting/journal/meal entry **in the previous Ramadan's date range**. | Previous Ramadan range: `getRamadanStartForYear(currentYear - 1)` to `getRamadanEndForYear(currentYear - 1)` (or year of previous Ramadan if Ramadan spans two Gregorian years). Check `progress`, `journal`, `day-food-log` for any key/entry in that range. |
| **What** | Side-by-side or summary: e.g. "2024: 28 completed, 2 broken; 2025: 15 completed so far." Optional: streak, total hours, journal count. | Filter `completedDays`, `fastingLog`, broken/skipped for last year's range; same for this year's range. Compute stats per range. |
| **No last year** | Hide comparison or show "No data from last Ramadan to compare." | No entries in previous Ramadan date range. |

**Current implementation:** No "last year" comparison in the app. Data model supports it by date filtering; UI and helpers (e.g. `getProgressForRamadanYear(progress, year)`) can be added.

---

### 1.3 Exporting or reviewing all journal entries

**Goal:** User can export or scroll through all journal entries (e.g. for backup or review).

| Aspect | Expected UI | Expected data model |
|--------|-------------|----------------------|
| **Export** | Settings → "Export my data" downloads JSON. Journal page → "Export" downloads journal-only JSON. Both should include all journal entries. | Export payload includes `journal: entries` (full array from `tryramadan-journal`). No date filter; include all. |
| **Review** | Journal page: calendar with dots for dates that have entries; pick date to read/edit. Optional: "List all entries" (chronological) for quick scan. | Read `tryramadan-journal`; sort by `date` (or `updatedAt`) for list view. |
| **Zero entries** | Export still works: file with `entries: []` and toast "No entries to export" (journal export). No crash. | Empty array; valid JSON. |

**Current implementation:** Journal export exists (Dashboard Journal) with zero-entry handling. Settings "Export my data" includes `journal` but **does not** include `day-food-log` or `day-meal-plans`; consider adding them for "export everything" (see Data Management below).

---

## 2. Edge cases: deletion and recovery

### 2.1 User deletes a day (fasting), a single entry (journal/meal), or all data mid-Ramadan

| Scenario | Expected UI | Expected data model |
|----------|-------------|----------------------|
| **Delete a fasting day** | User selects a day (e.g. from Dashboard day picker) and "Uncomplete" or "Clear this day". Confirmation optional for past days. After: that day no longer in completed; if it was the only change, streak/stats update. | Remove date from `completedDays`; remove or mark not-completed in `fastingLog` for that date; if day was in `skippedDays`, remove. Use `uncompleteFastingToday(progress, setProgress, dateStr)` for completed day. For "clear skipped", remove from `skippedDays`. |
| **Delete a single journal entry** | From Journal: select date → "Delete this entry" (or clear content and save, if we treat "empty save" as delete). Confirm. Entry removed from list and calendar dot gone. | Remove object with that `date` from `tryramadan-journal` array (setEntries with filter). |
| **Delete a single meal entry** | From Schedule or Meals: on a day, remove one suhoor/iftar item (e.g. delete icon). Save. That item gone; other items and days unchanged. | Update `day-food-log[date]`: remove one item from `suhoor`/`iftar`/`between`; persist. Same for meal plan if we support per-item delete. |
| **Delete all data (reset)** | Settings → "Reset all progress" → confirm. Modal should state exactly what is deleted (e.g. "Fasting progress only" vs "All app data"). After: progress cleared; optionally redirect to onboarding or show empty dashboard. | **Current:** Only `progress` is reset to `defaultProgress` (fasting only). Journal, meals, preferences are **not** cleared. **Recommendation:** Either (a) rename to "Reset fasting progress" and document, or (b) add "Reset everything" that clears progress + journal + meals + optional preferences, with explicit confirmation and "Export first" CTA. |

**Current implementation:** "Uncomplete" exists for a completed fasting day. No explicit "delete journal entry" or "delete single meal item" in UI (Schedule may allow removing items; confirm in Schedule/Meals components). Reset clears only progress.

---

### 2.2 User accidentally deletes and wants to undo

| Scenario | Expected UI | Expected data model |
|----------|-------------|----------------------|
| **Undo single action** | After "Uncomplete" or "Delete this entry": show toast "Day cleared" / "Entry deleted" with action "Undo". Short window (e.g. 5–10 s). Undo restores previous state. | Keep in memory (or in a single "undo" snapshot) the previous value for the affected key (e.g. progress or journal). On Undo: write back that snapshot once. |
| **Undo reset** | After "Reset all progress": toast "Progress reset. Undo?" with short window. If Undo: restore previous `progress` from snapshot. | Before applying reset, copy `progress` (and if we add full reset, copy journal/meals) to a transient or short-lived key (e.g. `tryramadan-pre-reset-backup`). On Undo, copy back and remove backup. |
| **No undo** | If no undo implemented: confirmation modal must be strong ("This cannot be undone. Export a backup first."). | N/A. |

**Current implementation:** No undo. Reset has confirmation and "Download progress (backup before reset)" CTA. Implementing undo would require storing a one-step backup (e.g. previous progress) and restoring on Undo within a timeout.

---

### 2.3 New device or cleared storage but user expects history to exist

| Scenario | Expected UI | Expected data model |
|----------|-------------|----------------------|
| **First open on new device** | No history (localStorage empty). Show onboarding or empty dashboard. Do **not** claim "your data is here" unless we add sync/account. | All keys missing or default. |
| **User cleared site data** | Same as new device: empty state. Optionally show a one-time message: "We don't store your data on our servers. If you cleared site data or switched device, history is only available from a backup file." | Same as above. |
| **Recovery path** | If we add "Restore from backup": Settings → "Import from file" → user selects previously exported JSON. Validate structure; merge or replace progress/journal/meals. Then: "Restored X days of progress and Y journal entries." | Parse JSON; validate required keys; `localStorage.setItem` for each key from file (or merge carefully). Handle version skew (e.g. old export format). |
| **Set expectations** | In Settings/Privacy: "Your data stays on this device. Export a backup if you change phone or browser." | No server copy; export is the only backup. |

**Current implementation:** No sync; no import. Privacy page states data is on device. Export provides the only user-accessible backup. "Restore from backup" (import) is not implemented; adding it would close the loop for new device / cleared storage.

---

## 3. Summary: what to implement vs current state

| Item | Current state | Recommendation |
|------|---------------|----------------|
| View current-Ramadan history | Dashboard/Schedule/Progress show data but no "this Ramadan only" filter | Add optional filter or "This Ramadan" view (filter by `getRamadanDateRange()`). |
| Compare to last year | Not implemented | Add "Last Ramadan" stats when data exists in previous year's range; optional comparison UI. |
| Export journal | Yes (Journal page + Settings export includes journal) | Ensure Settings export also includes meal plans + food log for full backup. |
| Delete fasting day | Uncomplete supported | Document; optionally "Clear skipped" for a day. |
| Delete single journal entry | Done | "Delete this entry" on Journal when viewing an existing entry; confirm then remove from array. |
| Delete single meal item | Schedule may allow; verify | Confirm in Schedule/Meals; document behaviour. |
| Reset all | Resets progress only; label says "Reset all progress" | Rename to "Reset fasting progress" or add full reset with clear copy and "Export first" CTA. |
| Undo delete / reset | Not implemented | Add optional undo toast (single-step backup) for uncomplete and reset. |
| New device / cleared storage | No history; no import | Add "Import from backup" (JSON) and in-app copy about exporting before changing device. |

---

## 4. Test prompts for QA

- **History:** Open Dashboard/Schedule during Ramadan. Select several days. Do completed/broken/skipped and meals match what you logged? Switch to "this Ramadan only" if implemented.
- **Compare:** If you have data from a previous Ramadan (e.g. from export/restore), does "Compare to last year" appear and show correct counts?
- **Export:** Settings → Export my data. Does the JSON include journal? Include meal data if we add it. Journal page → Export with 0 entries: toast and valid file.
- **Delete day:** Mark a day complete, then Uncomplete. Does the day disappear from completed and streak update?
- **Delete entry:** Delete one journal entry. Is it removed from calendar and list? Delete one meal item for a day. Is only that item removed?
- **Reset:** Reset progress. Are only fasting data cleared? Is "Download progress (backup before reset)" offered?
- **Undo:** If implemented, after Uncomplete or Reset, does Undo restore state within the timeout?
- **New device:** Open app in incognito or second browser. No history. Is message about device/backup shown where appropriate? If Import is added, restore from exported file and confirm data reappears.

These flows and edge cases define the intended UI and data behaviour for historical data and deletion; implement and test against this doc.
