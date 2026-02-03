---
name: qa-bug-reports-and-regression-tests
description: Writing clear bug reports and converting bugs into regression tests in TryRamadan. Covers precise title, environment, numbered steps, expected vs actual, missing information, and BUG-<AREA>-<ID> test naming. Use when writing or rewriting bug reports, or when adding regression tests from a fixed bug.
---

# QA Bug Reports and Regression Tests (TryRamadan)

Use this skill when **writing or rewriting bug reports** or when **converting a fixed bug into regression tests** so reports are actionable and tests are traceable.

---

## 1. Bug report format

- **Title:** [Symptom] when [context/trigger/screen]. Example: "Dashboard shows streak 0 after changing Show streak and achievements in Settings."
- **Environment:** Device, OS, browser, app build/version, URL or env.
- **Reproduction:** Numbered steps (1, 2, 3…) that a developer can follow exactly.
- **Expected vs actual:** One clear sentence each; include exact UI text or values when it helps.
- **Additional context:** Screenshots/recordings (with short caption), console/network logs, user state (e.g. first time, has data).
- **Missing information:** List anything that would block a fix (e.g. no console logs, not tested on Safari). See **`docs/QA-BUG-REPORT-FORMAT-AND-CHECKLIST.md`** for full template and checklist.

---

## 2. Converting a bug into regression tests

- **Extract core behavior** that broke (e.g. "streak must use same 'today' as Dashboard when display timezone is set").
- **Write 1–3 tests** (unit or component) that would have caught the bug: preconditions, steps, expected result.
- **Naming convention:** Describe block: `Regression: BUG-<AREA>-<ID> (<short title>)`. Individual test: `BUG-<AREA>-<ID>.<sub>.: <behavior>`. Example: `Regression: BUG-STRK-001 (streak 0 after Settings / display timezone)` and `BUG-STRK-001.1: streak uses todayOverride so display-timezone today matches Dashboard`.
- **Area codes (examples):** STRK = streak, CAL = calendar/Ramadan, NAV = navigation, SET = Settings, OFF = offline, A11Y = accessibility.
- **Reference:** **`docs/QA-BUG-REPORT-FORMAT-AND-CHECKLIST.md`** §7 Bug-derived test naming; **`docs/QA-TESTING-STRATEGY-AND-LEARNING-PLAN.md`** for strategy and coverage.

---

## 3. Where to add regression tests

- **Unit/helpers:** `src/test/loggingAndTracking.test.ts` (fasting, streak), `src/test/ramadan.test.ts` (dates), `src/test/countdownAndPrayerTimes.test.ts` (time/cache).
- **Component:** Add or extend tests in the relevant feature test file (e.g. `dashboardFeatures.test.tsx`, `onboardingFlow.test.tsx`).
- Add a comment above the describe referencing the bug report or doc section (e.g. "See Example §5" or ticket).
