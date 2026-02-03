# State-transition testing: daily fasting record

QA document for **state-transition testing** of a single day's fasting record on the Ramadan dashboard. Defines **states**, **events**, a **transition table**, **invalid transitions**, and how the **UI should block or warn**.

**Related:** `EDGE-CASE-TEST-SCENARIOS.md`, `QA-RAMADAN-LOGIC-AND-TEST-CASES.md`, `FALL-OFF-AND-RETURN-FLOWS.md`.

---

## 1. Data model (per day)

For a given date (e.g. `YYYY-MM-DD`), the app derives state from:

- **`progress.completedDays`** — array of date strings; day is "completed" (or make-up) if included.
- **`progress.skippedDays`** — array of date strings; day is "skipped" (non-fasting) if included.
- **`progress.fastingLog`** — array of `FastingLogEntry`: `{ date, startedAt, status, completedAt?, hoursFasted?, brokenReason? }` with `status: 'in_progress' | 'completed' | 'broken'`.

**Derived state** for a day = combination of membership in these sets and the day's log entry (if any). See §2.

---

## 2. Enumerated states for a single day

| State ID | Name | Definition (data) | UI meaning |
|----------|------|-------------------|------------|
| **U** | **Untracked** | Not in `completedDays`, not in `skippedDays`, no entry in `fastingLog` for this date. | Day has no fasting decision yet; user can start fast, mark skipped, or mark make-up (if past). |
| **P** | **Planned** (optional) | Same as U for fasting state; may have meal plan or schedule note. | Used in some flows to mean "user has planned the day" but no fast logged. For the **fasting** state machine, can be merged with U. |
| **I** | **In-progress** | One `fastingLog` entry for this date with `status: 'in_progress'`. Not in `completedDays`; not in `skippedDays`. | User has tapped "I'm fasting"; fast not yet completed or broken. |
| **C** | **Completed** | Date in `completedDays`. May have a `fastingLog` entry with `status: 'completed'`, or no log (make-up: added via "Mark this day as completed"). | Full fast completed (or logged as make-up). |
| **B** | **Broken** | One `fastingLog` entry for this date with `status: 'broken'` (and optional `brokenReason`). Not in `completedDays`. | User broke the fast early; reason may be excused (illness, travel, menstruation, medical) or not. |
| **E** | **Excused** | Subset of **B**: same as Broken but `brokenReason` in `['illness','travel','menstruation','medical']`. | Broken with an excused reason; stats treat as "excused" (e.g. streak-preserving). |
| **S** | **Skipped (non-fasting)** | Date in `skippedDays`. Any previous `fastingLog` entry for this date is removed when skipped is set. | User chose "I didn't fast today" (no fast attempted). |
| **M** | **Make-up** | Same data as **C**: in `completedDays`, often with no `fastingLog` entry (past day marked complete from Schedule/Dashboard). | Semantic label for "completed via make-up"; no separate stored state. |

**State summary (for transition table):** We use **U** (untracked), **I** (in-progress), **C** (completed), **B** (broken), **S** (skipped). **E** is **B** with excused reason; **M** is **C** for a past day. **P** omitted (treat as U).

---

## 3. Events that can change state

| Event ID | Event | Action / API | Typical trigger |
|----------|--------|---------------|------------------|
| **E1** | Start fast | `startFastingToday(progress, setProgress, dateStr?)` | User taps "I'm fasting" (today or selected day). |
| **E2** | Mark complete (log iftar) | `completeFastingToday(progress, setProgress, dateStr?)` | User taps "Mark complete" after iftar (today). |
| **E3** | Break fast | `breakFastingToday(progress, setProgress, reasonId, dateStr?)` | User taps "Break fast" and selects a reason (today). |
| **E4** | Mark skipped | `setDaySkipped(progress, setProgress, dateStr?)` | User taps "I didn't fast today" (today; or "I didn't fast this day" for selected day if implemented). |
| **E5** | Mark make-up | `setDayCompleted(progress, setProgress, dateStr, true)` | User selects a **past** day and taps "Yes, mark complete" (make-up). |
| **E6** | Uncomplete | `uncompleteFastingToday(progress, setProgress, dateStr?)` or `setDayCompleted(progress, setProgress, dateStr, false)` | User undoes "Mark complete" (today: uncomplete; any day: remove from completedDays). |
| **E7** | Clear / delete entry | Remove day from `completedDays` or `skippedDays`; remove or clear `fastingLog` entry for that date. | "Clear this day" or "Delete entry" (partial support: uncomplete, setDayCompleted false; no explicit "clear skipped" for past day in current app). |
| **E8** | Edit entry | Change `brokenReason` or other fields of existing log entry. | Not implemented in current UI (read-only display of reason). |

**Note:** "Log meal during fast" does **not** change fasting state; meals are separate (food log / meal plans). It is not an event in this state machine.

---

## 4. State-transition table

Format: **Current state → Event → New state | Valid? | Expected behavior.**

| Current | Event | New | Valid? | Expected behavior |
|---------|--------|-----|--------|-------------------|
| U | E1 Start fast | I | Yes | Add in_progress log; clear day from skippedDays if present. |
| U | E2 Mark complete | C | Yes | completeFastingToday creates/updates log to completed and adds to completedDays (e.g. "mark complete" without having started — allowed). |
| U | E3 Break fast | B | Yes | Create broken log entry (startedAt ≈ completedAt). |
| U | E4 Mark skipped | S | Yes | Add to skippedDays; no fastingLog for day. |
| U | E5 Mark make-up | C | Yes | Add date to completedDays (past day only in UI). |
| U | E6 Uncomplete | — | N/A | No-op (day not completed). |
| I | E1 Start fast | I | Yes | Idempotent; no duplicate entry. |
| I | E2 Mark complete | C | Yes | Update log to completed; add to completedDays. |
| I | E3 Break fast | B | Yes | Update log to broken with reason; remove from completedDays. |
| I | E4 Mark skipped | S | Yes | Remove in_progress log; add to skippedDays. |
| I | E5 Mark make-up | — | N/A | Make-up is for past days; today in I would use E2. |
| I | E6 Uncomplete | — | No* | Uncomplete applies to completed day; in I the action is "Break fast" or "Mark skipped." |
| C | E1 Start fast | I | No | **Invalid:** completed day cannot go back to in-progress in current design. UI should not offer "I'm fasting" for a day already completed. |
| C | E2 Mark complete | C | Yes | Idempotent. |
| C | E3 Break fast | — | No | **Invalid:** day already completed. UI should not show "Break fast" for completed day. |
| C | E4 Mark skipped | S | No* | **Semantically odd:** was completed, now "didn't fast." Could be allowed (overwrite) with confirmation. Current code: setDaySkipped removes from completedDays and clears log, so C → S is **possible** if we allow it; recommend **block or confirm**. |
| C | E5 Mark make-up | C | Yes | No-op (already completed). |
| C | E6 Uncomplete | I | Yes | Remove from completedDays; set log to in_progress (undo complete). |
| B | E1 Start fast | I | No | **Invalid:** broken day cannot restart as in-progress in current design. UI should not offer "I'm fasting" for that day. |
| B | E2 Mark complete | C | No* | **Design choice:** "Overwrite broken with completed?" Current code does not support B → C; UI does not offer "Mark complete" for broken day. Treat as **invalid** or add with confirmation. |
| B | E3 Break fast | B | Yes | Idempotent (could re-open reason dialog and update reason). |
| B | E4 Mark skipped | S | No* | Allowing would overwrite broken with skipped; possible but odd. **Block or confirm.** |
| B | E5 Mark make-up | — | N/A | Make-up is for adding completed; day already has an outcome. |
| B | E6 Uncomplete | — | No | Uncomplete clears completed state; broken has no "uncomplete" in current app. |
| S | E1 Start fast | I | Yes | startFastingToday clears day from skippedDays and adds in_progress log. |
| S | E2 Mark complete | C | Yes | Would add completed log and to completedDays (same as U → C). |
| S | E3 Break fast | B | Yes | Would create broken entry (same as U → B). |
| S | E4 Mark skipped | S | Yes | Idempotent. |
| S | E5 Mark make-up | C | Yes | Add to completedDays (overwrite skipped for that day if we allow; setDayCompleted only touches completedDays — does not remove from skippedDays in current code). **Data note:** setDayCompleted(true) adds to completedDays but does not remove from skippedDays; could leave day in both. Recommend: when adding to completedDays for a day, also remove from skippedDays. |
| S | E6 Uncomplete | — | N/A | Uncomplete is for completed; S has no "uncomplete." |

\* See §5 for invalid transitions and UI behavior.

---

## 5. Invalid or ambiguous transitions — UI behavior

| Transition | Invalid / ambiguous? | How UI should behave |
|------------|----------------------|------------------------|
| **C → I** (completed → in-progress) | Invalid in current design | Do **not** show "I'm fasting" for a day that is already completed. For **today**, show "Yes, logged ✓" and "Undo" (E6 Uncomplete) instead of "I'm fasting." For **past** day, only show "Yes, mark complete" / "Undo" (toggle), not "Start fast." |
| **C → E3** (completed → break fast) | Invalid | Do **not** show "Break fast" when the selected day is already completed. |
| **I → E6** (in-progress → uncomplete) | N/A (uncomplete applies to completed) | "Uncomplete" / "Undo" is only visible when day is **completed**. When in-progress, user must "Break fast" or "Mark skipped" to leave in-progress. |
| **B → I** (broken → in-progress) | Invalid in current design | Do **not** show "I'm fasting" for a day that is already broken. Show broken state and reason only; no restart. |
| **B → C** (broken → completed) | Not supported | Current app does not allow "re-mark as completed" after broken. Option: add "Mark as completed anyway?" with confirmation for edge cases. |
| **C → S** (completed → skipped) | Ambiguous | If user taps "I didn't fast this day" on a completed day: **warn** ("This day is already marked complete. Change to 'didn't fast'?") and on confirm run setDaySkipped (which clears completed and log, adds skipped). Or **block** and ask to "Undo complete" first. |
| **B → S** (broken → skipped) | Ambiguous | Similarly: **warn** or block. setDaySkipped currently clears fastingLog for the day and adds to skippedDays, so B → S is **possible** in code if we expose "I didn't fast this day" for that day. |

**Summary of blocking / warnings:**

- **Block:** Do not show the action when it is invalid (e.g. "I'm fasting" when already completed or broken; "Break fast" when already completed).
- **Warn:** For overwrites (e.g. completed → skipped, broken → skipped), show a confirmation dialog: "This will replace [current state] with [new state]. Continue?"
- **Data consistency:** When setting a day to completed (make-up), remove that date from `skippedDays` if present, so the day is in exactly one bucket.

---

## 6. Edge cases (state machine)

| Case | State / event | Expected |
|------|----------------|----------|
| Two entries same date (legacy) | fastingLog has two entries for same date | Use **last** entry for status (getTodayFastingLog returns last). Transitions apply to the effective state (last entry). |
| Day in both completedDays and skippedDays | Data inconsistency | Normalize on load or before save: e.g. treat as skipped and remove from completed, or define precedence (skipped wins). |
| Mark make-up then uncomplete | C → (E6) → remove from completed | Day no longer in completedDays; if no log entry, state becomes U. If there was a log entry with status completed, uncomplete sets it to in_progress. |
| Past day: in_progress | Rare (e.g. timezone) | Allow E2/E3/E4 as for today; or normalize to completed/broken/skipped. |

---

## 7. Test cases (state-transition)

Use the table for automated or manual tests:

1. **U → I:** Start from clean day; tap "I'm fasting" → state I; UI shows "Break fast" and "Mark complete."
2. **I → C:** From I; tap "Mark complete" → state C; UI shows "Yes, logged ✓" and "Undo."
3. **I → B:** From I; tap "Break fast", choose reason → state B; UI shows broken and reason.
4. **C → I (invalid):** From C; ensure "I'm fasting" is not offered (or only "Undo" changes state).
5. **S → I:** From S (today); tap "I'm fasting" → state I; skipped cleared.
6. **C → E6 (Uncomplete):** From C; tap "Undo" / uncomplete → state I (log set back to in_progress).
7. **Make-up:** Select past day in U; tap "Yes, mark complete" → state C for that day; ensure day not in skippedDays if it was.

---

## 8. Implementation notes (current app)

- **Today:** Start fast, Mark complete, Break fast, I didn't fast, Uncomplete (when completed) are all available. "I'm fasting" is hidden when already completed or skipped; "Break fast" only when in_progress.
- **Past day:** setDayCompleted(dateStr, true/false) and (when implemented) setDaySkipped(..., dateStr) support make-up and "didn't fast this day." Schedule/Dashboard show "I fasted this day — mark complete" for past days.
- **Completed → Skipped:** setDaySkipped removes the day from completedDays and clears fastingLog; so C → S is **possible** if the UI allows "I didn't fast this day" for an already-completed day. Recommendation: block or warn as in §5.
- **B → C / B → I:** Not implemented; UI does not offer "Mark complete" or "I'm fasting" for a broken day.

This document defines the state machine for a single day's fasting record and the expected behavior for valid and invalid transitions.
