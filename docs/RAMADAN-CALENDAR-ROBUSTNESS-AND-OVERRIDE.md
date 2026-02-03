# Ramadan calendar robustness & user override

Design document for **robustness against calendar calculation differences**: when the app’s assumed Ramadan start/end is **one day earlier or later** than the user’s local community, when the user wants to **manually override** which days count as “Ramadan,” and **edge cases** (logging before the app thinks Ramadan began; using the app for voluntary fasts after Ramadan). Defines **UI and data behaviors** that keep the experience coherent while allowing user control.

**Related:** `QA-RAMADAN-LOGIC-AND-TEST-CASES.md`, `EDGE-CASE-TEST-SCENARIOS.md`, `STATE-TRANSITION-TESTING-FASTING.md`. Implementation: `src/lib/ramadan.ts` (fixed `RAMADAN_START_BY_YEAR`; no override today).

---

## 1. Current behavior (no override)

- **Source of truth:** `RAMADAN_START_BY_YEAR` in `ramadan.ts` — approximate Gregorian start per year (e.g. 2025: 2025-03-01). Comment: “Actual start may vary by 1 day with moon sighting.”
- **Derived:** `getRamadanStartForYear`, `getRamadanEndForYear`, `isRamadanDay(date)`, `getRamadanDayNumber(date)`, `isCurrentlyRamadan()`, `isLastDayOfRamadan(date)`.
- **UI:** “Day N of Ramadan” and “Last day of Ramadan” only when `isRamadanDay(today)` is true. Before start: “X days until Ramadan”; after end: no “Day N” badge.
- **Data:** Fasting progress (`completedDays`, `fastingLog`, `skippedDays`) is **date-based only**; there is no “this day is Ramadan” flag stored per day. So users **can** log completes/skips/broken for any date; the app only **labels** a date as “Ramadan day N” when it falls inside the computed range.

---

## 2. Flows: app vs community one day off

### 2.1 App’s Ramadan is one day **earlier** than community

**Scenario:** App says Ramadan starts March 1 (Day 1). User’s community follows moon sighting and starts **March 2**.

| When | What user sees / can do | Coherent behavior |
|------|-------------------------|--------------------|
| **March 1 (app “Day 1,” community not started)** | App shows “Day 1 of Ramadan,” countdown, “I’m fasting,” “Mark complete.” User may not fast (community hasn’t started). | **Data:** User can skip or ignore; no obligation to log. If they **do** log (e.g. voluntary), that’s valid — completedDays gets March 1. **UI:** Optional short note: “Ramadan start may vary by locality (moon sighting). Follow your community.” So user isn’t confused. |
| **March 2** | Community’s Day 1; app shows “Day 2 of Ramadan.” User fasts and marks complete. | **Data:** March 2 in completedDays; no issue. **UI:** “Day 2” is one ahead of community; user may notice. Override (see §3) can align app to “Day 1” on March 2. |
| **After app’s end (e.g. app says Ramadan ended March 30)** | Community may have one more day (March 31). App shows “Ramadan ended” or “X days until next Ramadan”; no “Day 31.” | **Data:** User can still **mark March 31 complete** from Schedule/Dashboard (select date → Mark complete). Day is stored; no “Day 31” label. **UI:** Don’t block logging; treat as voluntary or “extra” day. Optional: “Your community may have one more day; you can still log it.” |

**Summary:** Data stays coherent (any date can be logged). UI can add a **disclaimer** and/or **user override** so “Day N” and “Ramadan” labels match the user’s calendar.

---

### 2.2 App’s Ramadan is one day **later** than community

**Scenario:** App says Ramadan starts March 2. Community started **March 1**.

| When | What user sees / can do | Coherent behavior |
|------|-------------------------|--------------------|
| **March 1 (community Day 1, app “not yet Ramadan”)** | App shows “1 day until Ramadan” (or “Ramadan doesn’t start until March 2”). User fasted with community. | **Data:** User can open Schedule/Dashboard, **select March 1**, tap “Yes, mark complete.” March 1 is stored; it’s **outside** app’s Ramadan range so no “Day 1” label on that date in the app. **UI:** Allow logging; show “Mark this day as completed” for past days. Optional: “If your community started earlier, you can log that day here.” |
| **March 2** | App shows “Day 1 of Ramadan”; community is on Day 2. User fasts. | **Data:** March 2 in completedDays; fine. **UI:** App “Day 1” is community “Day 2”; override can shift so March 1 = Day 1, March 2 = Day 2. |
| **End:** app ends March 30, community ends March 29 | No major issue; app may show “Day 30” on a day community already finished. | **Data:** Both ranges covered by logging. **UI:** Override can set end to March 29 so “Last day” matches. |

**Summary:** **Logging before the app’s “Ramadan”** is already possible (select past day, mark complete). The only gap is **labeling**: that day won’t show “Day 1 of Ramadan” unless we add an override or extend the app’s range.

---

## 3. Flow: user wants to manually override “Ramadan days”

**Goal:** User can set a **custom start and/or end date** so that “Day N of Ramadan” and “Ramadan” badges match their community or preference.

### 3.1 Data model (recommended)

- **Preferences (or progress):**  
  - `ramadanStartOverride: string | null` (YYYY-MM-DD)  
  - `ramadanEndOverride: string | null` (YYYY-MM-DD)  
  - If null, use built-in `getRamadanStartForYear` / `getRamadanEndForYear`.
- **Logic:** Helper `getEffectiveRamadanRange(year?: number)` returns start/end from override if set, else from calendar. All call sites that need “is this Ramadan?” or “day number” use this helper instead of raw `isRamadanDay` / `getRamadanDayNumber` when override is supported (or a single source e.g. `useRamadanRange()` that returns effective start/end).

### 3.2 UI

- **Settings:** Section “Ramadan dates” with:
  - “Use app’s calendar (approximate)” (default).
  - “Match my community” → show **Start date** and **End date** pickers (or “Start” only and derive end = start + 29 or 30).
  - Short copy: “Moon sighting can shift start by a day. Set dates here to match your locality.”
- **Dashboard / Schedule / etc.:** “Day N of Ramadan” and “Last day” use **effective** range. Countdown and prayer-based logic unchanged (already date-based).

### 3.3 Data behavior

- **Fasting data:** Unchanged. completedDays, fastingLog, skippedDays are still just dates; no “Ramadan” flag per day.
- **Stats:** “Ramadan progress” (e.g. X/30) can be computed from **effective** range: count completedDays that fall within that range. Same for streak if we restrict “current Ramadan” to that range.
- **Export / .ics:** Ramadan calendar export uses effective start/end so events align with user’s chosen range.

### 3.4 Coherence rules

- Override **start** only: end = start + 29 or 30 (user choice or default 30).
- Override **end** only: start = end − 29 or 30, or keep app start and only clip “last day” display.
- Validation: start &lt; end; both within a reasonable window (e.g. same Gregorian year or adjacent).
- If user clears override, revert to app calendar; no migration of existing logs needed.

---

## 4. Edge cases

### 4.1 User starts logging fasts before the app thinks Ramadan began

**Scenario:** Community started March 1; app says Ramadan starts March 2. User fasted March 1 and marks it complete (e.g. from Schedule, select March 1 → Mark complete).

| Aspect | Behavior |
|--------|----------|
| **Data** | March 1 is in `completedDays` and/or `fastingLog`. No inconsistency. |
| **UI** | March 1 is **outside** app’s built-in range, so `getRamadanDayNumber(1 March)` is **null**. Schedule/Dashboard can show “Completed” for that day but **not** “Day 1 of Ramadan” unless override is set. |
| **Stats** | If “Ramadan progress” is computed from app range only, March 1 may **not** count toward “X/30” for the app’s window. With **override** (e.g. start = March 1), March 1 counts and shows as Day 1. |
| **Coherence** | Allow logging; don’t block. Optional tooltip: “This day is outside the app’s default Ramadan range. Add a custom start date in Settings if your community began earlier.” |

**Conclusion:** Data and UI stay coherent; override gives correct “Day N” and inclusion in Ramadan stats.

---

### 4.2 User continues using the app for voluntary fasts after Ramadan (app still labels as “Ramadan”)

**Scenario:** App’s last Ramadan day is March 30. User’s community ended March 30. Next day (March 31) user does a **voluntary** fast (e.g. make-up or Sunnah) and logs it.

| Aspect | Behavior |
|--------|----------|
| **Data** | March 31 in completedDays; valid. |
| **UI** | `isRamadanDay(31 March)` is **false**; so app does **not** show “Day 31 of Ramadan.” App shows “Ramadan ended” or “X days until next Ramadan.” So the app **does not** label post-Ramadan days as “Ramadan.” |
| **Risk** | If app’s **end** were wrong (e.g. 29 days instead of 30), app could treat March 30 as “after Ramadan” and show “Ramadan ended” on March 30. Then “Last day” badge would show on March 29. With override, user can set end = March 30 so “Last day” is correct. |
| **Voluntary after end** | User can keep logging completes for any date (Schedule/Dashboard). Those days are **not** labeled “Day N of Ramadan” once outside effective range. Sunnah / voluntary are already supported (Mon/Thu, etc.); no need to call them “Ramadan.” |

**Conclusion:** App does not label voluntary days after the range as “Ramadan.” Override ensures the app’s “last day” matches community so there’s no confusion.

---

### 4.3 App’s Ramadan is one day late (community already started)

Already covered in §2.2: user can log the “extra” day (community Day 1) as a past day; override can set app start to that day so “Day 1” aligns.

### 4.4 User sets override to a range that doesn’t cover some already-logged days

**Example:** User had logged March 1–30 as completes. Later sets override start = March 2, end = March 31. March 1 is now “before” Ramadan in the app.

| Behavior | Recommendation |
|----------|-----------------|
| **Data** | Do not remove or change completedDays/fastingLog. March 1 stays completed. |
| **UI** | “Ramadan progress” (X/30) counts only days **inside** effective range (e.g. March 2–31). March 1 still shows as completed in Schedule/Progress but is not counted in “Ramadan X/30.” Optional: “You have 1 completed day before your chosen Ramadan start.” |
| **Coherence** | Override only affects **labeling and Ramadan-scoped stats**, not storage of completed/skipped/broken. |

---

## 5. Summary: UI and data behaviors

| Scenario | Data | UI | User control |
|----------|------|----|--------------|
| App 1 day early vs community | Any date can be logged; no change. | Optional disclaimer; allow override so “Day N” matches. | Override start/end in Settings. |
| App 1 day late vs community | User can mark “day before app start” complete (past day). | Allow logging; no “Day 1” for that date without override. | Override start (and optionally end). |
| User logs before app’s start | Stored as normal completed/skip/broken. | Show completed; “Day N” only if in effective range. | Override start to include that day. |
| User logs after app’s end (voluntary) | Stored as normal. | Do not label as “Ramadan”; “Ramadan ended” or next countdown. | Override end if community had one more day. |
| Manual override set | No migration; override only changes derived “Ramadan” range. | All “Day N,” “Last day,” “Ramadan progress” use effective range. | Settings: custom start/end or “Use app calendar.” |
| Override cleared | No change to logs. | Revert to app calendar. | “Use app’s calendar” in Settings. |

---

## 6. Implementation checklist (optional)

| Item | Status | Notes |
|------|--------|--------|
| Disclaimer (moon sighting) | Optional | One line on Dashboard or Settings: “Start may vary by locality (moon sighting).” |
| `ramadanStartOverride` / `ramadanEndOverride` | Not implemented | Add to preferences; null = use app calendar. |
| `getEffectiveRamadanRange()` or `useRamadanRange()` | Not implemented | Returns start/end from override or fallback. |
| Use effective range in `isRamadanDay`, `getRamadanDayNumber`, “Day N” badge, “Last day” | Not implemented | Pass effective start/end or get from context. |
| Settings UI: “Ramadan dates” with date pickers | Not implemented | “Match my community” + start/end. |
| Ramadan-scoped stats (X/30) use effective range | Not implemented | Count completedDays in [effectiveStart, effectiveEnd]. |
| Allow logging any date (before/after range) | Already supported | Schedule/Dashboard: select date, mark complete/skip. |

---

## 7. Test cases (summary)

- **App 1 day early:** Set device date to app’s “Day 1”; community not started. Confirm user can skip or log; if override exists, set start to next day and confirm “Day 1” moves.
- **App 1 day late:** Set device date to day before app start; user marks that day complete. Confirm it’s stored; confirm no “Day 1” for that date unless override start is set to that date.
- **Override start/end:** Set custom start and end; confirm “Day N of Ramadan” and “Last day” use custom range; confirm completed days inside range count in “X/30.”
- **Log before start, then set override:** Log complete for day before app start; set override start to that day; confirm it shows as Day 1 and counts in Ramadan stats.
- **After end:** Set date to day after app’s end; confirm no “Day N” badge; confirm user can still mark that day complete from Schedule; confirm “Ramadan ended” or next countdown.

This document defines flows, edge cases, and UI/data behaviors for Ramadan calendar differences and user override so the experience stays coherent and controllable.
