# UX: Flows Between Fasting, Meals, and Journal — Friction and Bridges

This document maps key flows (after logging a fast → meals; after logging a meal → reflection; from stats → a specific day’s details), identifies unnecessary back-and-forth and context loss, and proposes “bridges” (inline links, contextual prompts, prefilled fields) for smoother transitions.

**Related:** [UX-NAVIGATION-IA-EVALUATION.md](./UX-NAVIGATION-IA-EVALUATION.md), [UX-COGNITIVE-LOAD-ANALYSIS.md](./UX-COGNITIVE-LOAD-ANALYSIS.md).

---

## 1. Flow maps

### 1.1 After logging a fast → logging suhoor/iftar

**Where “logging a fast” happens**

| Action | Screen | What happens next |
|--------|--------|-------------------|
| **I'm fasting** | Dashboard | Button click; state updates; no navigation. Day plan (meals) is **below the fold** on same page. |
| **Mark complete** / **I fasted today — mark complete** | Dashboard, Dashboard Today | State updates; no toast or “next step.” On **Dashboard Today** there is **no meal logging** — user must leave the page. |
| **Break fast** (+ reason) | Dashboard, Dashboard Today, Emergency | Dialog → log updated → redirect or stay; no prompt to log what they ate. |

**Current path to meals**

- **From Dashboard:** User must **scroll down** to “Today’s plan” / Day plan to see “Log what you ate” + Add (Suhoor/Iftar). No prompt after “Mark complete” or “I’m fasting” like “Log suhoor/iftar?”
- **From Dashboard Today:** No meal UI. User must use nav: **Quick access** (Meals or Schedule) or **Back to Dashboard** then scroll to day plan. **Context loss:** “today” is implicit; no deep link to “today’s meals” so they land on Meals (recipe-focused) or Schedule (calendar default, not necessarily today).
- **From Emergency:** After “I've broken my fast — choose a reason and log it” → `navigate("/dashboard")`. Dashboard opens with today selected but no scroll-to or highlight of the day plan; user must find it.

**Summary:** No guided “next step” after logging a fast. Day plan is easy to miss (scroll); from Today/Emergency there’s no direct “log meals for today” path and no prefilled day context on Meals/Schedule.

---

### 1.2 After logging a meal → writing a short reflection

**Where meal logging happens**

| Location | Action | What happens next |
|----------|--------|-------------------|
| **Dashboard** (day plan) | Add food dialog → Add (suhoor/iftar) | Dialog closes; item appears in day plan. **No toast, no prompt** to journal. |
| **Dashboard Schedule** | Add to food log / meal plan for selected day | Toast e.g. “Added …”; dialog closes. **No prompt** to add a reflection for that day. |
| **Dashboard Meals** | Add selected recipes to today’s meal plan | Toast: “Added X recipe(s) to today’s [suhoor/iftar].” **No prompt** to journal. |

**Current path to journal**

- **From Dashboard:** Day plan has “Journal” block: “No entry for this day — Add in Journal” or “Edit in Journal →” linking to `/dashboard/journal`. **Context loss:** link is `to="/dashboard/journal"` with **no state or query**. Journal page initializes `writeDate` to **today** only. If Dashboard **selected date** is not today (e.g. user was viewing yesterday), they land on Journal with **today** selected — **wrong day**.
- **From Schedule:** “Day at a glance” shows journal preview and “Open Journal →” **only when there is already an entry** for the selected day. If there is **no** entry for that day, there is **no** “Add reflection for this day” link in that block — only meals and fast status. So after adding a meal on Schedule, the natural “add a reflection?” moment has **no visible bridge** for days with no journal yet. And “Open Journal →” is `to="/dashboard/journal"` with **no state** — **selected date is lost**; Journal opens with default (today).
- **From Meals:** No journal link or prompt after adding to today’s plan.

**Summary:** No contextual “Add a short reflection?” after logging a meal. Links to Journal never pass the **day** (Dashboard selected date or Schedule selected date), so Journal often opens for the wrong date.

---

### 1.3 From stats view → a specific day’s details and editing it

**Where “stats view” lives**

| Location | What user sees | How they can reach a specific day |
|----------|----------------|------------------------------------|
| **Dashboard** | Stat tiles: Streak, Total days, Sunnah, Broken. Click → **DaysListDialog** with list of dates. | Each date is a **Link** `to="/dashboard/schedule"` with **state={{ date: dateStr }}**. ✅ **Schedule** reads `location.state.date` and sets **selectedDate**. So **Dashboard → Schedule with that day** works. |
| **Dashboard Progress** | Fasting tracker (recent log entries by date), badges, “Export progress,” “Journal archive,” “View Full Calendar.” | **Fasting log rows** show date + status but are **not links**. “View Full Calendar” is `to="/dashboard/schedule"` with **no state** — user lands on Schedule with **no day selected** (or default). So from Progress, user **cannot** “jump to March 15” — they must open Schedule and **select the day again**. “Journal archive” → `/dashboard/journal` with **no date**; Journal opens with today. |

**Editing that day**

- **On Schedule (with date from Dashboard dialog):** User can see that day’s meals, food log, fasting status, note; can mark complete, add food, add note. **Journal:** “Open Journal →” goes to `/dashboard/journal` **without** the selected date → **context loss**; Journal shows today.
- **Dashboard:** If user had opened the stats dialog from Dashboard, then clicked a date, they go to Schedule. To get back to Dashboard with that day selected they would have to use **day selector on Dashboard** — no link from Schedule “back to Dashboard for this day.”

**Summary:** Dashboard stats → Schedule for a specific day works. Progress does not support “jump to this day”; Schedule → Journal drops the selected date; no “edit this day on Dashboard” link from Schedule.

---

## 2. Friction summary: back-and-forth, repeated input, context loss

| # | Friction | Where |
|---|----------|--------|
| 1 | **No “next step” after logging a fast** — user must discover day plan (scroll) or leave Today/Emergency and find meals. | Dashboard, Dashboard Today, Emergency |
| 2 | **Day plan below the fold** — after “Mark complete” or “I’m fasting,” meals aren’t visible without scrolling. | Dashboard |
| 3 | **Dashboard Today has no meal logging** — user must switch to Dashboard, Schedule, or Meals with no deep link to “today’s meals.” | Dashboard Today |
| 4 | **Journal link never passes date** — Dashboard and Schedule link to `/dashboard/journal` with no state/query; Journal always opens with `writeDate = today`. If user was viewing/editing another day, **wrong day** on Journal. | Dashboard day plan, Schedule “Open Journal →” |
| 5 | **No “Add reflection?” after adding a meal** — no toast or inline prompt to write a line for that day. | Dashboard (add food), Schedule (add food), Meals (add to plan) |
| 6 | **Schedule “Open Journal” only when entry exists** — for days with no journal yet, the day-at-a-glance block doesn’t show an “Add reflection for this day” link. | Dashboard Schedule |
| 7 | **Progress doesn’t link to a specific day** — fasting log rows aren’t clickable; “View Full Calendar” doesn’t pass a date. User must re-select day on Schedule. | Dashboard Progress |
| 8 | **Repeated date selection** — e.g. user clicks “March 15” in streak dialog → Schedule opens with March 15. Then “Open Journal →” → Journal opens with **today**; user must change date in Journal to March 15 again. | Schedule → Journal |
| 9 | **No “back to Dashboard for this day”** — from Schedule (with a day selected), no quick link to open Dashboard with that same day in the day selector. | Schedule |

---

## 3. Proposed bridges

### 3.1 After logging a fast → meals

| Bridge | Description |
|--------|-------------|
| **A. Post–fast prompt (Dashboard)** | After **Mark complete** or **I’m fasting**, show a short **toast or inline message**: “Logged. Want to log what you ate for suhoor/iftar?” with a link **“Log meals”** that **scrolls to** the day plan block (or expands it if collapsed) and optionally focuses the first “Add” for the contextually relevant meal (e.g. after Maghrib → iftar first). |
| **B. Post–fast prompt (Dashboard Today)** | Same idea on **Dashboard Today** after “I fasted today — mark complete”: “Logged. Log suhoor/iftar?” with link **“Log meals for today”** → navigate to **`/dashboard?scroll=day-plan`** or **`/dashboard/schedule?date=YYYY-MM-DD`** with today, so they land on the right place with today in context. |
| **C. Emergency → meals** | After “I've broken my fast” and reason on Emergency → redirect to Dashboard. Add optional **toast**: “Take care. You can log what you ate today on the dashboard.” with link “Go to today’s plan” that scrolls to day plan or opens Schedule for today. |
| **D. Inline “Log meals” in status card** | When status is “Fasted ✓” or “Currently fasting,” add a small inline link **“Log suhoor/iftar”** in or under the status card that scrolls to day plan (Dashboard) or links to Schedule for today. |

**Recommended first step:** A (toast + “Log meals” that scrolls to day plan on Dashboard) and B (from Today, link to Dashboard with scroll or to Schedule with `?date=today`).

---

### 3.2 After logging a meal → reflection

| Bridge | Description |
|--------|-------------|
| **E. Pass date to Journal** | All links to Journal should pass the **day in context**. Options: (1) **React Router state:** `Link to="/dashboard/journal" state={{ date: selectedDate }}`; (2) **Query:** `to={`/dashboard/journal?date=${selectedDate}`}`. **Journal** reads `location.state?.date` or `searchParams.get('date')` on mount and, if present, sets **writeDate** to that date (and syncs calendar/date input). So “Add in Journal” / “Open Journal →” from Dashboard or Schedule opens Journal **for that day**. |
| **F. “Add reflection?” after adding food** | After user adds a food item (Dashboard day plan or Schedule): **toast** “Added. Add a quick reflection for [date]?” with link **“Write in Journal”** that goes to Journal **with that date** (using E). Optionally same after “Add selected recipes to today’s meal plan” on Meals. |
| **G. Journal link when no entry (Schedule)** | In “Day at a glance” on Schedule, when **selectedDayJournal** is missing or empty, show: “Journal: No entry yet” with link **“Add reflection for this day”** → `/dashboard/journal` with **state/query date = selectedDate** (E). So the bridge exists for days with no journal entry yet. |
| **H. Inline “Add reflection” in day plan (Dashboard)** | Keep “No entry for this day — Add in Journal” but ensure the link uses the **selected date** (E). No new UI, just fix context. |

**Recommended first step:** E (Journal accepts and uses `date` from state or query) everywhere we link to Journal; then G (Schedule shows “Add reflection for this day” when no entry); then F (toast after add food).

---

### 3.3 From stats → specific day and editing

| Bridge | Description |
|--------|-------------|
| **I. Progress: link each log row to that day** | In **Dashboard Progress**, make each **fasting log row** (date + status) a **Link** to **`/dashboard/schedule`** with **state={{ date: entry.date }}**. So “March 15, Done” opens Schedule with March 15 selected. Same for any other “list of days” on Progress if we add them. |
| **J. Progress: “View Full Calendar” with optional date** | If we have a “selected” or “last viewed” day in Progress context we could pass it; otherwise keep current. I is the main fix so users can jump from a row to that day. |
| **K. Schedule → Journal with date** | “Open Journal →” and any “Add reflection” on Schedule use **state={{ date: selectedDate }}** (or query) so Journal opens for the **selected day** (covered by E). |
| **L. Schedule → Dashboard with date** | On Schedule, when a day is selected, add a small link: **“View this day on Dashboard”** → `/dashboard` with **state={{ date: selectedDate }}**. **Dashboard** reads `location.state?.date` on load and, if present, sets **selectedDate** and optionally scrolls to day plan. So user can move from Schedule (day detail) to Dashboard (same day) without re-selecting. |

**Recommended first step:** I (clickable dates in Progress → Schedule with state); E + K (Journal receives date from Schedule); L is nice-to-have.

---

### 3.4 Prefilled fields and contextual defaults

| Bridge | Description |
|--------|-------------|
| **M. Journal prompt prefilled by context** | When opening Journal **from Schedule** for a day that has meals logged, we could (optionally) prefill the **prompt** or a short placeholder from a “reflection after meals” template (e.g. “How did suhoor/iftar go today?”). Lower priority; E is the critical fix. |
| **N. Schedule default date from state** | Already done: Schedule uses `location.state?.date` to set initial selected date. Ensure all “go to Schedule for day D” links use **state={{ date: D }}** (Dashboard dialog already does; Progress rows per I). |

---

## 4. Implementation checklist (concise)

| Priority | Bridge | Change |
|----------|--------|--------|
| P0 | **E. Journal accepts date** | In **DashboardJournal**, on mount read `location.state?.date` or `searchParams.get('date')`; if present set `writeDate` and sync calendar/input. All links to Journal pass `state={{ date }}` or `?date=YYYY-MM-DD`. |
| P0 | **G. Schedule: “Add reflection” when no entry** | In Schedule “Day at a glance,” when there is no journal entry for selected day, show “Journal: No entry yet” + link “Add reflection for this day” → Journal with that date (E). |
| P0 | **K. Schedule → Journal with date** | Change “Open Journal →” to `to="/dashboard/journal" state={{ date: selectedDate }}` (or query). |
| P1 | **A. Post–fast prompt (Dashboard)** | After `completeFastingToday` / `startFastingToday`, show toast with “Log meals” that scrolls to day plan (e.g. `document.getElementById('day-plan')?.scrollIntoView()` or similar). |
| P1 | **B. Today → meals** | After “I fasted today — mark complete” on Dashboard Today, show toast with link to `/dashboard/schedule?date=today` or Dashboard with scroll to day plan. |
| P1 | **I. Progress rows clickable** | Fasting log rows in Progress: wrap date (or row) in `Link to="/dashboard/schedule" state={{ date: entry.date }}`. |
| P2 | **F. Toast after add food** | After adding food on Dashboard or Schedule, toast “Added. Add a reflection?” with “Write in Journal” linking with date (E). |
| P2 | **H. Dashboard Journal link with date** | Dashboard day plan: “Add in Journal” / “Edit in Journal” use `state={{ date: selectedDate }}` (or query). |
| P2 | **L. Schedule → Dashboard with date** | Dashboard reads `location.state?.date` and sets selectedDate; add “View this day on Dashboard” on Schedule linking with state. |

---

## 5. Summary

- **Flow 1 (fast → meals):** No guided next step; day plan is below the fold; Today/Emergency have no direct path to meals. **Bridges:** post–fast toast + “Log meals” (scroll or link), inline “Log suhoor/iftar” in status card, Today/Emergency link to Schedule or Dashboard with today.
- **Flow 2 (meal → reflection):** No “add reflection?” prompt; all Journal links drop the day. **Bridges:** Journal accepts date from state/query; Schedule shows “Add reflection for this day” when no entry; toast after add food with “Write in Journal” and date; Dashboard journal link passes selected date.
- **Flow 3 (stats → day detail):** Dashboard stats → Schedule with date works. Progress rows don’t link to that day; Schedule → Journal loses date. **Bridges:** Progress log rows link to Schedule with state; Journal links from Schedule (and Dashboard) pass date; optional “View this day on Dashboard” from Schedule with state.

Implementing **E, G, K** (Journal date handling + Schedule journal link when no entry + Schedule→Journal with date) and **A, B, I** (post–fast prompts + Progress clickable rows) removes the main back-and-forth and context loss between fasting, meals, and journaling.
