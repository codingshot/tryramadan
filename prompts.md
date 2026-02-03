# Testing prompts for TryRamadan

Reusable prompts to drive functionality testing of this app (manual QA, unit/integration tests, E2E, copy audit). Copy and paste into your workflow or AI assistant as needed.

---

## 1. Ramadan logic & QA audit

**Prompt:** You are a QA engineer testing Ramadan-specific logic for a fasting dashboard using Aladhan for prayer times and local storage for state.

**Tasks:**
- **Calendar & dates:** Verify how the app handles (1) start/end of Ramadan (Hijri ↔ Gregorian), (2) daylight saving time changes mid-month, (3) users changing timezone or location mid-Ramadan.
- **Fasting states:** Enumerate all possible states per day (not fasting, fasting planned, in-progress, completed, broken, excused, making up a missed fast). Check if each can be represented and transitioned between in the UI and data model.
- **Meal & journal logic:** Ensure users can log meals on fasting and non-fasting days, link meals to fast status (or document that they don’t auto-break), and edit entries. Ensure journal entries are per-day, time-stamped (or date-only), and retrievable (timeline / per-day detail).
- **Output:** List logic gaps with suggestions for state model or UI changes. Propose test cases (including edge cases) that can be turned into automated tests.

**Reference in repo:** `docs/QA-RAMADAN-LOGIC-AND-TEST-CASES.md`

---

## 2. Unit & integration tests (Vitest + React Testing Library)

**Prompt:** You are a React testing specialist using Vitest + React Testing Library in a Vite + TypeScript project for a Ramadan fasting, meals, and journaling dashboard.

**Tasks:** For each critical component (daily card, calendar/month view, meal logger, journal editor, stats dashboard, onboarding), generate unit and light integration tests that:
- Render the component with realistic props/state.
- Simulate user actions: toggling a fast, logging a meal, adding/editing/deleting a journal entry, switching days, changing location.
- Assert that UI, localStorage, and any API calls behave correctly.
- Include edge cases: switching dates around suhoor/iftar times; marking a fast as broken or excused after it started; using the app as a non-Muslim (no prayer times, but still fasting/meal tracking).

**Output:** Complete test files in TypeScript with imports ready for Vite + RTL. Clear test names that read like behavior specs. Mock `usePrayerTimes`, `useLocation` (and `getTimezoneFromCoords`) where components depend on them.

**Reference in repo:** `src/test/` (e.g. `dailyCardAndFasting.test.tsx`, `journalEditor.test.tsx`, `calendarMonthView.test.tsx`); `src/test/testHelpers.tsx` for mock data.

---

## 3. Manual QA scenarios

**Prompt:** You are designing manual QA scripts for a Ramadan fasting, meals, and journaling dashboard.

**Tasks:** Generate 10 realistic scenarios mixing:
- **When:** Start of Ramadan, mid-month dip, last 10 nights, and post-Ramadan wrap-up.
- **Who:** Muslim vs non-Muslim users; different timezones; travel days.

For each scenario define:
- **User story** (one sentence).
- **Pre-conditions** (location, system date, existing data / localStorage).
- **Step-by-step actions** (numbered, repeatable).
- **Expected UI and data results** (what the user sees and what is stored).

**Output:** A markdown file of scenarios suitable for manual testing and later conversion to E2E tests.

**Reference in repo:** `docs/MANUAL-QA-SCENARIOS.md`

---

## 4. Copy & cultural review (UX writer)

**Prompt:** You are a UX writer and cultural reviewer for a Ramadan fasting dashboard used by Muslims and non-Muslims.

**Tasks:**
- Scan all user-facing copy (labels, button text, empty states, onboarding).
- **For Muslim users:** Ensure terms like suhoor, iftar, qada/make-up fasts, voluntary vs obligatory fasts are used correctly and respectfully.
- **For non-Muslim users:** Identify jargon that needs inline explanations or alternative wording. Suggest optional tooltips or dual labels (e.g. “Suhoor (pre-dawn meal)”).
- **Output:** A copy table: current text → improved Muslim-friendly → improved non-Muslim-friendly (if different), plus notes.

**Reference in repo:** `docs/COPY-AUDIT-UX-CULTURAL.md`; `src/data/eating-times-tooltips.ts`, `src/data/general-tooltips.ts`

---

## 5. E2E test conversion

**Prompt:** Convert the manual QA scenarios in `docs/MANUAL-QA-SCENARIOS.md` into automated E2E tests.

**Requirements:**
- Use the same pre-conditions (date, location, localStorage) and steps.
- For each step: define the action (visit, click, fill, select) and the assertion (DOM text, localStorage key/value, or downloaded file content).
- Prefer stable selectors (role, label, test-id). Note where date or location must be mocked or set (e.g. system date, geolocation override).
- List which scenarios to run in CI (e.g. 1, 3, 10) for regression.

**Reference in repo:** `docs/MANUAL-QA-SCENARIOS.md`; `docs/QA-RAMADAN-LOGIC-AND-TEST-CASES.md` (E2E-* IDs).

---

## 6. Regression test checklist

**Prompt:** Give a short regression checklist for the TryRamadan app before a release.

**Include:**
- Onboarding: complete flow (Muslim and non-Muslim) → land on dashboard with no redirect loop.
- Fasting: start fast → mark complete (localStorage `completedDays` and `fastingLog` updated); start fast → break fast with reason (status `broken`, reason stored).
- Schedule: calendar month navigation; select day; add note / food log; export Ramadan .ics (timezone correct).
- Meals: add recipe to today (meal plan or food log); custom meal (name + calories) persists.
- Journal: save entry for a date; switch date and save another; export journal JSON.
- Progress: completed count and streak correct; export CSV works (no crash).
- Settings: change location → prayer times refresh; voluntary fasting toggles persist.
- Edge: change location mid-Ramadan (“today” and countdown still correct); non-Muslim sees no prayer/Adhan options (or they are disabled).

**Reference in repo:** `docs/MANUAL-QA-SCENARIOS.md` (Scenarios 1, 3, 10); `docs/UX-FLOWS-AND-FRICTION.md`

---

## 7. Test case IDs (for automation)

When writing or referencing automated tests, use these IDs from the QA doc:

- **Calendar:** CAL-1 to CAL-6, DST-1, TZ-1, TZ-2
- **Fasting states:** FS-1 to FS-8
- **Meals:** ML-1 to ML-4
- **Journal:** J-1 to J-5
- **E2E:** E2E-1 to E2E-5

**Reference in repo:** `docs/QA-RAMADAN-LOGIC-AND-TEST-CASES.md` (§4)

---

## Quick reference: key flows

| Flow | Main routes | Key storage keys |
|------|-------------|------------------|
| Onboarding | `/onboarding/welcome` … `goals` | `tryramadan-preferences` |
| Daily fast | `/dashboard`, `/dashboard/today` | `tryramadan-progress` (`fastingLog`, `completedDays`) |
| Meals | `/dashboard/meals`, `/dashboard/schedule` | `tryramadan-day-meal-plans`, `tryramadan-day-food-log` |
| Journal | `/dashboard/journal` | `tryramadan-journal` |
| Stats | `/dashboard/progress` | `tryramadan-progress`, export CSV |
| Settings | `/settings` | `tryramadan-preferences`, location, notifications |

**Fasting states (current):** `in_progress` | `completed` | `broken` (with `brokenReason`). No `skipped` or `excused` or makeup flag yet—see QA doc for gaps.
