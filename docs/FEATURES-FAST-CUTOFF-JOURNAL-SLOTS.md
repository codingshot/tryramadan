# Fast Cutoff, Prayer Reminders, Journal Slots — Feature Summary

**Internal doc.** Summary of changes for fast cutoff display, prayer reminders, food/journal logging, and time-of-day journal slots. Display is conditional on `userType` (muslim vs non-muslim).

---

## 1. Fast cutoff (Suhoor end) — DashboardToday

- **Fasting indicator:** When suhoor has passed, the "Suhoor end" card shows a "Fasting" badge.
- **Prayer reminder (Muslims only):** "Pray Fajr" reminder when in fasting period.
- **Log food:** "Log suhoor" link to Schedule when in eating period (before cutoff).

---

## 2. Iftar card — DashboardToday

- **Prayer reminder (Muslims only):** "Pray Maghrib when you break" shown before iftar.
- **After iftar:** "Log iftar" and "Journal" links to Schedule and Journal.

---

## 3. Break-fast dialog — BreakFastReasonDialog

- **Muslims only:** Footer with "After breaking: pray Maghrib, then log your meal and journal" plus links to Schedule (log food) and Journal.

---

## 4. Journal time-of-day slots

- **Slot types:** `morning` | `suhoor` | `iftar` | `general`
  - **morning:** Intention or to-do for the day.
  - **suhoor:** Pre-dawn reflection (Muslims only in UI).
  - **iftar:** Evening/break-fast reflection (Muslims only in UI).
  - **general:** Main reflection (default).

- **Display by tag:**
  - **Muslim:** Morning, Suhoor, Iftar, Reflection tabs.
  - **Non-Muslim:** Morning, Reflection tabs only.

- **Data:** `JournalEntry` has optional `slot`. Entries without slot = "general" (backward compatible).

---

## 5. Quick journal (Dashboard)

- Saves to the "general" slot only. Replaces only the general slot for that date; other slots are preserved.
