# QA Testing Strategy & 30‑Day Learning Plan

Senior QA architect guide: pragmatic testing strategy for Try Ramadan, coverage model, and a 30‑day plan to become the **quality owner** for this product.

---

## 1. App brief, tech stack, risk areas

**App:** Try Ramadan is a **Ramadan fasting, journal, and meal dashboard** (web PWA). Users set location for prayer times, log fasting (start / break / complete), track streaks and completed days, plan meals, journal mood and reflections, and use educational content (Quran, glossary, hadith, culture). Onboarding drives mode (Muslim vs non‑Muslim), priorities, and notifications. All core data is **local** (localStorage); no auth. Prayer times come from **Aladhan API**; location from search or IP/geolocation.

**Tech stack:** React 18, Vite, TypeScript, React Router, Radix UI, Framer Motion, TanStack Query (cached API), Tailwind, PWA (Workbox). Tests: **Vitest** + **Testing Library** (unit/component), **vitest-axe** (a11y), **Playwright** (E2E, in package).

**Risk areas**

| Area | Risk | Why it matters |
|------|------|-----------------|
| **Fasting logic** | Streak, completed/skipped/broken, today vs timezone | Wrong “today”, wrong streak, or duplicate state breaks trust in the core promise of the app. |
| **Prayer times & location** | API failure, timeout, wrong timezone, no location | Timer and countdown wrong or missing; user can’t fast safely. |
| **Ramadan calendar** | Start/end dates, year boundary, “day N” | Wrong Ramadan day or “days until Ramadan”; edge years (29 vs 30 days). |
| **Local state** | localStorage read/write, migration, cleared storage | Data loss, inconsistent UI, crash on load. |
| **Onboarding** | Flow, persistence, redirect to dashboard | User stuck or preferences not applied. |
| **Offline / degraded network** | Cache, first open no network, API down | PWA must still show cached data and not crash. |
| **Accessibility** | Keyboard, screen reader, focus, labels | Inclusive use; legal and ethical bar. |
| **Performance** | LCP, INP, CLS, heavy components on critical path | First load and interaction feel; PWA on slow devices. |

---

## 2. Pragmatic testing strategy: which layers to emphasize

**Principle:** Put most effort where **business risk** and **regression risk** are highest, and where **feedback is fastest**. Prefer fast, stable tests for core logic; use E2E sparingly for critical paths; use exploratory and a11y to catch what automation misses.

| Layer | Emphasis | Why |
|-------|----------|-----|
| **Unit** | **High** | Fasting logic (streak, completed/skipped/broken, todayOverride), Ramadan date helpers, prayer-time/countdown utils, localStorage helpers. Fast, deterministic, easy to run on every commit. Covers the “brain” of the app. |
| **Component / integration (Vitest + RTL)** | **High** | Critical UI: Dashboard (streak, timer, day selector), onboarding steps, Settings (preferences persist), break-fast flow, Progress/Stats. Verifies components with real hooks and (mocked) APIs. Catches hook/state bugs and wrong props. |
| **E2E (Playwright)** | **Medium (focused)** | Use for a **small set** of critical user journeys: complete onboarding → see dashboard; set location → see prayer times; start fast → break/complete → see streak. Run on PR or nightly. Avoid broad E2E for every feature; maintain a “smoke” + “critical path” suite. |
| **Exploratory** | **Medium (scheduled)** | Time-boxed sessions (e.g. 1–2 h per sprint) on: new features, Ramadan boundary dates, timezone/“today” edge cases, offline, different personas (Muslim vs non‑Muslim). Document in charters; log bugs and edge cases; feed into automated tests. |
| **Performance** | **Light (targeted)** | RUM (e.g. reportWebVitals) in production; optional Lighthouse/CI for LCP, INP, CLS on key routes (home, dashboard). No need for heavy load tests; focus on CWV and “feels fast” on 3G. |
| **Accessibility** | **High (automated + manual)** | **Automated:** axe (vitest-axe) on main routes and shared components; run in CI. **Manual:** keyboard nav, screen reader (NVDA/VoiceOver) on onboarding, dashboard, Settings, break-fast. Align with `docs/accessibility.md` and WCAG 2.2 AA. |

**Summary**

- **Emphasize:** Unit (logic, dates, streak, storage), component/integration (Dashboard, onboarding, Settings, fasting flows), accessibility (axe + keyboard/sr).
- **Use deliberately:** E2E for critical paths only; exploratory for edge cases and personas.
- **Sample / monitor:** Performance via CWV and occasional Lighthouse.

---

## 3. Basic test coverage model: must-have vs sampled

**Rule:** “Must-have” = if it’s wrong, the product is wrong or unsafe. “Sampled” = important but can be covered by representative cases and exploratory testing.

### Must be covered (automated or strict checklist)

| Area | What | How |
|------|------|-----|
| **Fasting state** | completedDays, skippedDays, fastingLog, streak, todayOverride | Unit tests (e.g. `loggingAndTracking.test.ts`, `ramadan.test.ts`). Regression suite for bug-derived cases (e.g. BUG-STRK-001). |
| **Ramadan dates** | Start/end, day number, “days until”, year boundary, missing year | Unit tests (`ramadan.test.ts`, calendar edge cases). |
| **Prayer times / countdown** | getTodayStringInTimezone, countdown math, timezone vs device date | Unit tests (`countdownAndPrayerTimes.test.ts`). |
| **Break fast** | Reason stored, excused vs non-excused, streak unaffected by excused | Unit + component (break-fast flow). |
| **Onboarding** | Steps render, completion persists, redirect to dashboard | Component/integration (`onboardingFlow.test.tsx`, `onboardingCritical.test.tsx`). |
| **Settings** | Preferences read/write, location, theme, “show streak” toggle | Component tests; critical paths covered. |
| **Critical routes** | Dashboard, Today, Schedule, Progress, Settings load without crash | Component or E2E smoke. |
| **Accessibility** | No axe violations on main routes; skip link, focus, labels | vitest-axe + manual checklist for keyboard/sr. |

### Sampled / representative (not every permutation)

| Area | What | How |
|------|------|-----|
| **Content pages** | Learn, Culture, Quran, Glossary, Guides | One or two pages per area; axe + smoke “renders and key links work”. |
| **Meals / journal** | Log suhoor/iftar, mood, export | Representative flows; edge cases from docs (e.g. same-day duplicate) covered by a subset of tests. |
| **Schedule / calendar** | Day picker, .ics export, events | Key interactions and one export path; detailed calendar edge cases in exploratory. |
| **Performance** | LCP, INP, CLS | RUM in prod; periodic Lighthouse on home + dashboard. |
| **Browsers / devices** | Safari, Firefox, mobile viewport | E2E or manual on a subset; prioritize Chrome + one mobile size in CI. |

### Out of scope for deep automation (exploratory / manual)

- Every recipe, every guide, every hadith text.
- Every locale/language permutation.
- Stress/load testing (unless product grows to server-heavy features).

---

## 4. 30‑day learning plan: become the quality owner

Goal: By day 30, you can **own** test strategy, **run and interpret** all test types, **write** strong regression tests from bugs, and **drive** exploratory and a11y coverage.

### Week 1: Product and existing tests

| Day | Focus | Activities |
|-----|--------|------------|
| **1** | Product and risks | Read README, product spec (onboarding, dashboard, fasting, prayers, settings). List 5 risks you’d test first. |
| **2** | Codebase and test map | Skim `src/` (pages, hooks, lib). List `src/test/*` and map tests to features (e.g. `loggingAndTracking.test.ts` → fasting/streak). |
| **3** | Run and read unit tests | `npm test`; read `ramadan.test.ts`, `countdownAndPrayerTimes.test.ts`, `loggingAndTracking.test.ts`. Note what’s covered and what isn’t. |
| **4** | Run and read component tests | Run tests; read `onboardingFlow.test.tsx`, `dashboardFeatures.test.tsx`, `accessibility.test.tsx`. Try changing a prop/assertion and see failure. |
| **5** | Docs and edge cases | Read `EDGE-CASE-TEST-SCENARIOS.md`, `STATE-TRANSITION-TESTING-FASTING.md`, `QA-BUG-REPORT-FORMAT-AND-CHECKLIST.md`. Pick 3 edge cases and confirm if they’re covered by tests. |

**Checkpoint:** You can run the suite, map tests to features, and tie edge-case docs to coverage.

---

### Week 2: Writing and improving tests

| Day | Focus | Activities |
|-----|--------|------------|
| **6** | Bug → test | Take one resolved bug (e.g. streak/timezone). Write 1–2 regression tests using the BUG-&lt;AREA&gt;-&lt;ID&gt; naming (see QA-BUG-REPORT-FORMAT-AND-CHECKLIST.md §7). |
| **7** | Unit test from spec | Pick one Ramadan or fasting rule from docs (e.g. “streak excludes skipped days”). Write a unit test that would fail if the rule were broken. |
| **8** | Component test | Add or extend one component test (e.g. Settings toggle, or one onboarding step). Use Testing Library (getByRole, userEvent). |
| **9** | Accessibility | Run vitest-axe on a route; fix or document one a11y issue. Try keyboard-only navigation on Dashboard and document findings. |
| **10** | Coverage and gaps | Run coverage (`npm test -- --coverage` if configured). List 3 “must-have” areas with no or low coverage; propose one new test per area. |

**Checkpoint:** You can add unit and component tests, tie them to bugs/specs, and run a11y checks.

---

### Week 3: E2E, exploratory, and strategy

| Day | Focus | Activities |
|-----|--------|------------|
| **11** | Playwright setup | Confirm Playwright is installed; run a sample E2E (if present) or write one: open `/`, click “Get started”, land on onboarding. |
| **12** | Critical path E2E | Define “critical path” (e.g. onboarding → dashboard → see streak). Implement or refine one E2E that covers it. |
| **13** | Exploratory charter | Draft a 1‑hour exploratory charter (e.g. “Timezone and today: change location, change device date, check streak and day label”). Run it; log bugs and edge cases. |
| **14** | Performance | Read `docs/PERFORMANCE.md`. Run Lighthouse on `/` and `/dashboard`; record LCP, INP, CLS. Note one improvement. |
| **15** | Strategy doc | Update or annotate this doc: what you’d add to “must-have” vs “sampled” based on your first two weeks. |

**Checkpoint:** You can run/write E2E, conduct exploratory sessions, and reason about coverage vs risk.

---

### Week 4: Ownership and habits

| Day | Focus | Activities |
|-----|--------|------------|
| **16** | Test review | Review one PR or recent change: what should be tested? Propose a test or checklist. |
| **17** | Bug report quality | Take a raw bug report; rewrite it using the clean template (QA-BUG-REPORT-FORMAT-AND-CHECKLIST.md). Add “missing information” and one regression test idea. |
| **18** | Regression suite | List all “Regression: BUG-*” tests. Run them; document what each protects. Add one more from a past bug or doc. |
| **19** | Release checklist | Draft a one-page “release readiness” checklist: tests green, a11y clean, critical E2E pass, known issues documented. |
| **20** | Documentation | Update README or docs: “How we test” (1–2 paragraphs: unit/component/E2E/a11y emphasis, where tests live, how to run). |

**Days 21–30:** Repeat and deepen

| Focus | Activities |
|-------|------------|
| **Exploratory** | One 1‑hour charter per week (personas, offline, Ramadan boundaries, timezone). |
| **E2E** | Keep critical-path E2E stable; add one journey when a major feature ships. |
| **Bugs** | For every fixed bug: clean report + at least one regression test (or explicit “no test” reason). |
| **A11y** | axe in CI; one manual keyboard/screen-reader pass per release. |
| **Strategy** | Each sprint: one “coverage gap” closed (must-have) and one “sampled” area checked. |

---

## 5. Success criteria for “quality owner”

By day 30 you should be able to:

- **Explain** the testing strategy (which layers, why) and the coverage model (must-have vs sampled).
- **Run** full unit/component suite and interpret failures; run E2E and a11y checks.
- **Write** a clear bug report (template + missing info) and derive 1–3 regression tests from it.
- **Conduct** a short exploratory charter and log findings.
- **Propose** what to automate next and what to leave to sampling or manual testing.

Use this doc as the single place to align with dev and product on “how we test” and “what we must cover.”
