# Manual QA scenarios: Ramadan fasting dashboard

10 realistic scenarios for manual testing. Use as a checklist before release or when validating features; can be converted to automated E2E tests later.

**Mix covered:** Start of Ramadan, mid-month dip, last 10 nights, post-Ramadan wrap-up; Muslim vs non-Muslim; different timezones; travel days.

---

## Scenario 1: Muslim, first day of Ramadan — fresh onboarding

**User story:** As a Muslim user in London, I complete onboarding on the first day of Ramadan so that I see the dashboard with correct “Day 1,” prayer times, and can start logging my first fast.

**Pre-conditions:**
- Device/browser: clear localStorage (or new profile); system date set to **first day of Ramadan** (e.g. 2025-03-01 for 2025).
- Location: allow geolocation or set location to **London, UK** (or use city search).
- No existing `tryramadan-preferences` or `tryramadan-progress`.

**Step-by-step actions:**
1. Open app (e.g. `/` or `/onboarding/welcome`).
2. Click **Get Started**.
3. Select **Muslim Mode** → Continue (skip knowledge).
4. Complete **Health** step → Continue.
5. On **Location**: use Auto-detect or search “London” → select London, UK → Continue (or Skip for now).
6. On **Schedule**: select **Full Ramadan** → optionally add voluntary (e.g. Monday & Thursday) → Continue.
7. On **Notifications**: Enable reminders (or Continue without).
8. Complete **Priorities** → Continue.
9. On **Goals**: select at least one goal (e.g. “Complete Ramadan with devotion”) → **Go to dashboard**.
10. On Dashboard: note hero/badge text, then tap **I'm fasting** (simulate having finished suhoor).
11. Open **Dashboard → Today** and check countdown and status.
12. (Optional) Change device date to after Maghrib same day; tap **Mark complete** on Dashboard or Today.

**Expected UI and data results:**
- After step 9: Redirect to `/dashboard`; no redirect loop to onboarding.
- Dashboard shows “Day 1 of Ramadan” (or “Ramadan Mubarak”) and Suhoor end / Iftar (Maghrib) times for London.
- “I'm fasting” is visible when not yet started; after step 10 it is replaced by “Break fast” and a “You're fasting” strip.
- `localStorage`: `tryramadan-preferences` has `onboardingComplete: true`, `userType: "muslim"`, `locationCoords` if location was set.
- After step 10: `tryramadan-progress` has one `fastingLog` entry for today with `status: "in_progress"`.
- After step 12: Same entry has `status: "completed"`; `completedDays` includes today’s date (YYYY-MM-DD).
- Progress/Stats: “1” completed day and streak 1 (when viewing today).

---

## Scenario 2: Non-Muslim, day before Ramadan — learning mode and knowledge quiz

**User story:** As a non-Muslim user in New York, I complete onboarding the day before Ramadan so that I see “X days until Ramadan,” take the knowledge quiz, and get labels like “Breaking Fast (Iftar)” instead of jargon.

**Pre-conditions:**
- System date set to **day before Ramadan** (e.g. 2025-02-28 if Ramadan starts 2025-03-01).
- Location: **New York, USA** (or timezone America/New_York).
- Clear localStorage.

**Step-by-step actions:**
1. Open app → **Get Started**.
2. Select **Non-Muslim Mode** → Continue.
3. Complete **Knowledge** quiz (all 5 questions).
4. Complete **Health** → **Location** (set New York or Skip) → **Schedule** (Full Ramadan or skip) → **Notifications** → **Priorities** → **Goals** (e.g. “Learn about Ramadan culture”, “Support Muslim friends and family”) → **Go to dashboard**.
5. On Dashboard: confirm hero/badge shows “1 day until Ramadan” (or “X days”).
6. Confirm Suhoor/Iftar strip shows **Breaking Fast (Iftar)** (or similar) for non-Muslim; prayer times visible if location set.
7. Open **Dashboard → Meals**: confirm intro explains Suhoor and Iftar; tabs show Suhoor / Iftar (or pre-dawn / breaking fast wording if implemented).
8. Open **Dashboard → Progress**: confirm page loads; export CSV works (no crash).

**Expected UI and data results:**
- Knowledge quiz is shown only for non-Muslim path; after completion, flow continues to Health.
- `tryramadan-preferences`: `userType: "non-muslim"` (or `"new"`).
- Dashboard shows countdown “until Ramadan” and no “Day X of Ramadan”.
- Iftar is labeled in a non-jargon way (e.g. “Breaking Fast (Iftar)”).
- Meals and Progress load without errors; CSV export triggers download (or blob) without throwing.

---

## Scenario 3: Mid-Ramadan “dip” — break fast due to illness, then resume

**User story:** As a Muslim user in Cairo on day 12 of Ramadan, I feel unwell and break my fast with reason “Illness,” then the next day I fast again and mark complete so that my streak resets but my history is accurate.

**Pre-conditions:**
- System date: **day 12 of Ramadan** (e.g. 2025-03-12).
- Location: **Cairo, Egypt** (or equivalent).
- `tryramadan-progress`: 11 consecutive days in `completedDays` (days 1–11), and for “today” (day 12) user has already tapped **I'm fasting** (one `fastingLog` entry with `status: "in_progress"`).

**Step-by-step actions:**
1. Open Dashboard; confirm “Day 12 of Ramadan” and “You're fasting” (or similar).
2. Tap **Break fast** → confirm dialog → **Sure** → choose **Illness / not well**.
3. Confirm Dashboard no longer shows “Break fast”; completed days count does not include day 12.
4. Open **Progress**: confirm “Broken” or fasting log shows one entry for today with status broken and reason Illness.
5. (Simulate next day) Change system date to **day 13 of Ramadan**. Clear or adjust progress so day 13 has no entry yet.
6. Open Dashboard → tap **I'm fasting** → (simulate after Maghrib) tap **Mark complete**.
7. Open Progress: confirm completed days = 12 (days 1–11 + 13); current streak = 1 (or 2 if you also completed day 13 next). Broken day 12 is still in fasting log with reason.

**Expected UI and data results:**
- After step 2: `fastingLog` for today has `status: "broken"`, `brokenReason: "illness"`; today is not in `completedDays`.
- Progress shows 11 completed days (not 12); streak is 0 (today broken).
- After step 6–7: Day 13 is in `completedDays`; streak recalculates from day 13 (e.g. 1). Export CSV lists both completed and broken entries correctly.

---

## Scenario 4: Last 10 nights — Laylat al-Qadr and calendar

**User story:** As a Muslim user in Istanbul, I open the app during the last 10 nights of Ramadan so that I see Laylat al-Qadr indication on the Schedule calendar and can log fasting and journal for those nights.

**Pre-conditions:**
- System date: **21st, 23rd, 25th, 27th, or 29th night of Ramadan** (e.g. 2025-03-21 evening or 2025-03-22 daytime for “night of 22nd”).
- Location: **Istanbul, Turkey**.
- Progress: some `completedDays` and optional `tryramadan-journal` entries for earlier days.

**Step-by-step actions:**
1. Open **Dashboard → Schedule** (or Schedule from nav).
2. Navigate calendar to the **last 10 days** of Ramadan (e.g. days 21–30).
3. Confirm one or more dates show **Laylat al-Qadr** (or special night) styling/indicator (e.g. 21, 23, 25, 27, 29).
4. Select a Laylat al-Qadr date; add a **note** in the day detail (e.g. “Extra worship”).
5. Open **Journal**; select the same date; write an entry and save.
6. Return to Schedule; select that date again; confirm note and journal indicator (dot or “Journal entry”) are visible.
7. Export **Ramadan to calendar** (.ics) from Schedule or Goals card; open in calendar app; confirm events include Suhoor end and Iftar for the range and timezone.

**Expected UI and data results:**
- Schedule calendar shows distinct styling for odd nights in last 10 (e.g. amber/highlight and “Laylat al-Qadr” in tooltip or label).
- Note is saved to `tryramadan-schedule-notes` (or equivalent) for that date.
- Journal entry is saved to `tryramadan-journal` for that date; Schedule shows journal indicator for that day.
- Exported .ics contains events in user’s timezone (e.g. Europe/Istanbul); no duplicate or wrong dates for last 10 days.

---

## Scenario 5: Post-Ramadan wrap-up — progress export and journal

**User story:** As a Muslim user in Birmingham (UK), the day after Ramadan ends I open the app to review my month, export my progress CSV, and download my journal so I have a record.

**Pre-conditions:**
- System date: **first day after Ramadan** (e.g. 2025-03-31 if Ramadan ended 2025-03-30).
- Location: **Birmingham, UK**.
- `tryramadan-progress`: multiple `completedDays`, some `fastingLog` entries (mix of completed and possibly broken).
- `tryramadan-journal`: at least 3–5 entries for dates in Ramadan.

**Step-by-step actions:**
1. Open app; confirm Dashboard shows “X days until Ramadan” (next year) or no “Day X of Ramadan” badge.
2. Open **Dashboard → Progress**.
3. Confirm **Days completed**, **Current streak**, **Longest streak**, and **Fasting log** section reflect stored data.
4. Tap **Export** (or “Download CSV”); confirm a CSV file downloads with headers (e.g. Date, Started, Completed, Status) and one row per fasting log entry (and summary rows if present).
5. Open **Dashboard → Journal**; confirm past entries are listed (e.g. “View past entries”); tap **Export journal** (or Download); confirm a JSON file downloads with all entries and `exportedAt`.
6. Open **Settings**; use **Export all data** (if available); confirm download contains progress, journal, and preferences (no crash).

**Expected UI and data results:**
- Dashboard does not show “Day X of Ramadan” (Ramadan is over for current year).
- Progress page shows correct totals; CSV contains fasting log rows and matches `completedDays` / `fastingLog`.
- Journal export JSON includes all saved entries with date, content, mood, gratitude; filename includes date.
- Settings export (if any) completes without error and file is valid JSON.

---

## Scenario 6: Timezone change mid-Ramadan — user moves London → Dubai

**User story:** As a Muslim user who started Ramadan in London and then travels to Dubai, I update my location so that prayer times and “today” reflect Dubai and my existing fast for “today” still makes sense.

**Pre-conditions:**
- System date: **mid-Ramadan** (e.g. day 15).
- Initially: location **London, UK** (Europe/London); `tryramadan-progress` has `completedDays` for days 1–14 and optionally a `fastingLog` entry for “today” (day 15) with `status: "in_progress"` (started in London).
- Simulate travel: change location in app to **Dubai, UAE** (Asia/Dubai) without changing device date.

**Step-by-step actions:**
1. Open Dashboard with location London; note Fajr/Maghrib times and countdown for today.
2. Open **Settings** → **Location** → search “Dubai” (or change city) → select Dubai, UAE; save.
3. Return to Dashboard; confirm prayer times have **updated** (Dubai times differ from London).
4. Confirm “today” is still the same calendar day (no spurious date flip); if “I'm fasting” was already tapped, “Break fast” / “You're fasting” still show for today.
5. Open **Dashboard → Today**; confirm countdown uses Dubai Maghrib/Fajr.
6. (Optional) Tap **Mark complete** for today; confirm `completedDays` includes today’s date once; `fastingLog` for today has `status: "completed"` and sensible `hoursFasted` (or completedAt).

**Expected UI and data results:**
- After step 2: Prayer times refetch for new coords; displayed times match Dubai (e.g. earlier Maghrib than London in March).
- “Today” (YYYY-MM-DD) is unchanged; no duplicate or missing entry for the same calendar day.
- Fasting log for today (if any) remains associated with the same date; completing the fast updates that entry and adds today to `completedDays` once.
- Progress streak and totals remain consistent (no double-count or lost day).

---

## Scenario 7: Travel day — break fast with reason “Travel (musafir)”

**User story:** As a Muslim user traveling on day 8 of Ramadan, I do not fast and log the reason as Travel so that my progress shows an excused break and I can make up later.

**Pre-conditions:**
- System date: **day 8 of Ramadan**.
- Location: any (e.g. London).
- User has **not** tapped “I'm fasting” for today (no `in_progress` entry).

**Step-by-step actions:**
1. Open Dashboard; confirm “I'm fasting” and “I fasted today — mark complete” are visible (no “Break fast” yet).
2. Tap **I'm fasting** (simulate starting the day intending to fast, then travel plan changes) — or skip to step 3 if product allows “I didn’t fast” / “Skip today” (if not, simulate: start fast then break).
3. If “I'm fasting” was tapped: tap **Break fast** → **Sure** → choose **Travel (musafir)**.
4. Confirm Dashboard shows broken state for today (e.g. “You broke your fast today” and reason Travel).
5. Open **Progress**; confirm today is not in completed days; broken section or fasting log shows today with reason Travel.
6. Export CSV; confirm one row for today with status broken and reason (or label) Travel.

**Expected UI and data results:**
- After step 3: `fastingLog` for today has `status: "broken"`, `brokenReason: "travel"`; today not in `completedDays`.
- Progress shows “Broken” or equivalent for this day; CSV export includes the broken entry with correct reason label.
- No crash or duplicate entries; next day user can tap “I'm fasting” and “Mark complete” as normal.

---

## Scenario 8: Non-Muslim, mid-Ramadan — meal logging only (no prayer focus)

**User story:** As a non-Muslim user in Sydney doing a time-restricted eating window aligned with Ramadan, I log only meals (Suhoor/Iftar) and use the journal; I do not use prayer times or Adhan.

**Pre-conditions:**
- System date: **mid-Ramadan** (e.g. day 14).
- Location: **Sydney, Australia**.
- `tryramadan-preferences`: `userType: "non-muslim"`; onboarding completed; optional `tryramadan-progress` with some completed days or empty.

**Step-by-step actions:**
1. Open **Dashboard → Meals**; select **Suhoor** tab; pick a recipe → add to today’s schedule or food log.
2. Switch to **Iftar** tab; add one recipe to today.
3. Open **Dashboard → Schedule**; select today; confirm meal plan or food log shows the two items; add a **note** (e.g. “Light suhoor”).
4. Open **Dashboard → Journal**; select today; choose prompt; write content; set mood; add gratitude; **Save**.
5. Return to Dashboard; confirm **Daily missions** (or Today’s missions) show “Log Suhoor” and “Log Iftar” (or equivalent) as completed for today.
6. Open **Settings**; confirm no prayer/Adhan options shown for non-Muslim (or they are disabled/hidden per product).

**Expected UI and data results:**
- Meals: `tryramadan-day-meal-plans` or `tryramadan-day-food-log` has today with suhoor and iftar entries.
- Schedule: note saved; day shows meal/journal indicators.
- Journal: entry in `tryramadan-journal` for today with content, mood, gratitude.
- Daily missions reflect meal and note completion; journal may or may not be a mission depending on product.
- Prayer/Adhan: not offered or disabled for non-Muslim mode.

---

## Scenario 9: Start of Ramadan — add Ramadan to calendar (.ics) and check timezone

**User story:** As a Muslim user in Toronto, on the first day of Ramadan I add the full month to my calendar and verify events are in my local timezone (America/Toronto).

**Pre-conditions:**
- System date: **first day of Ramadan** (e.g. 2025-03-01).
- Location: **Toronto, Canada** (America/Toronto).
- Optional: location already set and prayer times loaded.

**Step-by-step actions:**
1. Open Dashboard; locate **Add Ramadan to calendar** or **Export .ics** (e.g. from Schedule page or Goals card).
2. If there is a choice (e.g. “Fasting only” vs “Full prayers”), select **Fasting only** (Suhoor end + Iftar).
3. Trigger export/download; open the .ics in a calendar app (e.g. Google Calendar, Apple Calendar) or inspect file.
4. Confirm events for **first and last day of Ramadan** are present; event times are in **America/Toronto** (or correct TZID), not UTC without offset.
5. Confirm at least two events per day when “Fasting only”: e.g. “Suhoor end” and “Iftar” (or Maghrib).
6. (Optional) Select “Full prayers” and export again; confirm five prayers per day (or as implemented) with same timezone behaviour.

**Expected UI and data results:**
- .ics file downloads (or opens); no silent failure; toast or message on error if API fails.
- VTIMEZONE or TZID present for user’s timezone; events display at correct local time in calendar apps.
- Date range covers full Ramadan (e.g. 30 days); no missing or duplicate days.
- “Fasting only” mode: Suhoor end and Iftar (Maghrib) per day; “Full prayers”: Fajr, Dhuhr, Asr, Maghrib, Isha (and any extras) per day.

---

## Scenario 10: Last day of Ramadan — complete final fast and view full stats

**User story:** As a Muslim user in Jakarta on the 30th day of Ramadan, I mark my last fast complete and view my full-month stats (streak, completion rate, broken days) and confirm they match my expectations.

**Pre-conditions:**
- System date: **last day of Ramadan** (e.g. 2025-03-30 for a 30-day Ramadan).
- Location: **Jakarta, Indonesia**.
- `tryramadan-progress`: `completedDays` for days 1–29; one `fastingLog` entry for today (day 30) with `status: "in_progress"` (user tapped “I'm fasting” after suhoor).

**Step-by-step actions:**
1. Open Dashboard; confirm “Day 30 of Ramadan” (or “Last day” / final day indicator if present).
2. (Simulate after Maghrib) Tap **Mark complete**.
3. Confirm Dashboard shows “Fasted ✓” or completed state for today; completed count = 30.
4. Open **Dashboard → Progress**; confirm **Days completed** = 30; **Completion rate** = 100% (if total days = 30); **Current streak** = 30 (or correct if some days were broken).
5. Open **Streak** and **Broken** dialogs (if present); confirm list of dates matches stored data (e.g. no broken days, or correct broken dates).
6. Export **CSV**; confirm 30 rows (or one per fasting log entry) with correct statuses; summary rows if any show 30 completed.
7. (Optional) Change system date to next day; open Dashboard; confirm “Ramadan” period is over and “X days until Ramadan” (next year) or similar appears.

**Expected UI and data results:**
- After step 2: `completedDays` has 30 dates; `fastingLog` for today has `status: "completed"`.
- Progress: 30 completed days; 100% completion rate when total = 30; streak = 30 if no broken days.
- CSV export contains all 30 days (or all log entries); no off-by-one or missing final day.
- Next calendar day: app no longer shows “Day X of Ramadan” for current year; shows countdown to next Ramadan or neutral state.

---

## App support notes for testers

- **Clear app data:** In Chrome/Edge: DevTools (F12) → Application → Local Storage → select origin → Clear all. Or remove keys: `tryramadan-preferences`, `tryramadan-progress`, `tryramadan-journal`, `tryramadan-dismissed-location-banner`, etc.
- **Set system date:** Many scenarios require a specific date (e.g. first or last day of Ramadan). Use your OS date/time settings or a VM; avoid changing date mid-session for time-sensitive checks.
- **Key routes:** `/` or `/onboarding/welcome` (landing/onboarding), `/dashboard` (main app), `/dashboard/progress`, `/dashboard/journal`, `/dashboard/meals`, `/dashboard/schedule`, `/settings`.
- **Location:** Allow browser geolocation when prompted, or use **Settings → Location** and search for a city (e.g. London, New York, Jakarta) for accurate prayer times.
- **Export checks:** CSV export is under Dashboard → Progress; full data export (progress + journal + preferences) is under **Settings → Export my data**.

---

## How to use these scenarios

- **Manual run:** Execute steps in order; tick off expected results; note any deviation (browser, device, date/location used).
- **E2E conversion:** Map steps to actions (e.g. `visit`, `click`, `fill`, `selectOption`); assert DOM text, `localStorage`, and (if possible) downloaded file content; use fixed dates/locations or fixtures for repeatability.
- **Regression:** Re-run Scenario 1 (onboarding + first fast), Scenario 3 (break fast + resume), and Scenario 10 (last day + export) after major changes.

**Reference:** Routes and flows are documented in `docs/UX-FLOWS-AND-FRICTION.md`; logic and test-case IDs in `docs/QA-RAMADAN-LOGIC-AND-TEST-CASES.md`.
