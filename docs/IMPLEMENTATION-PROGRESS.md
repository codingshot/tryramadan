# Implementation Progress

Tracks completion status of improvements proposed in UX and security docs. Use this to finish remaining items in the order below.

---

## Summary

| Status | Count |
|--------|-------|
| **Complete** | All doc-recommended items implemented; source docs and checklists updated; key features covered by tests (see Testing below). |
| **Optional / ongoing** | E2E smoke-routes spec; resilience (API-failure) tests; additional a11y E2E as needed. |

---

## Complete ✅

These items from the docs are implemented and marked complete in their source docs where applicable.

### Security & data
- **SECURITY-PHYSICAL-ACCESS:** Panic clear (Clear all data in Settings); `deleteAllUserData()` in `src/lib/dataLifecycle.ts`.
- **DATA-LIFECYCLE:** Full delete flow; Data & privacy copy in Settings; optional journal retention (30/90/365 days); `journalRetentionDays` applied on Journal visit.
- **security-checklist.md:** ESLint rules (no-eval, no-implied-eval, no-new-func, no-script-url), HSTS, SW cleanup, panic clear.

### UX — health & onboarding
- **UX-HEALTH-GUARDRAILS:** Disclaimers (OnboardingHealth, DashboardHealth, Macros, Emergency, BreakFastReasonDialog); healthWarnings in preferences; DashboardHealth banner; Day 7/15/21 check-in banners; symptom severity 4–5 toast with Emergency link.
- **OnboardingHealth:** "By continuing, you understand this app is not medical advice..." before Continue.
- **OnboardingNotifications:** "You can enable notifications later in Settings" when skipping.
- **Emergency:** Scholar disclaimer (Qada, Fidya — consult a qualified scholar or imam).

### UX — empty states & microcopy
- **UX-MICROCOPY:** Stats dialogs (streak, total, sunnah, broken); day detail journal CTA; Journal (past entries, future-date prompt); Goals; GoalsUntilRamadanCard; Progress (fasting tracker, first-time card, badges empty); Macros (planned/logged); Index ProgressTracker "No streak yet" + "Log your first fast to start".

### QA & offline
- **QA-404:** Vitest tests `src/test/404-invalid-urls.test.tsx`; old-path redirects; e2e spec `e2e/404-invalid-urls.spec.ts`.
- **QA-ROUTING-GUARDS:** E2E spec `e2e/routing-guards.spec.ts` — dashboard redirect when storage empty.
- **QA-OFFLINE:** api.quran.com SW runtime cache; usePrayerTimesForDate cache.

### Ramadan calendar
- **RAMADAN-CALENDAR-ROBUSTNESS:** User override: Settings → Ramadan dates ("Match my community" + start/end); `useRamadanRange()`, `getEffectiveRamadanRange()`, Ramadan-scoped stats (X/30) and "Day N" use effective range; prayer/ical use effective range.

### Flows & deletion (from HISTORICAL-DATA, FALL-OFF, STATE-TRANSITION)
- **FALL-OFF-AND-RETURN-FLOWS:** Mark past day as "I didn't fast" — Schedule shows "I didn't fast this day" for selected day; `setDaySkipped(progress, setProgress, selectedDate)`.
- **HISTORICAL-DATA-AND-DELETION-FLOWS:** Delete single journal entry — Journal has "Delete this entry" with confirm; removes entry from array.
- **STATE-TRANSITION-TESTING-FASTING:** For a **broken** selected day on Schedule: "Edit reason" (E8) — `updateBrokenReason`; "Mark as completed anyway?" (B→C) — `setBrokenDayToCompleted`; "Start fast again" (B→I) — `setBrokenDayToInProgress`; all with confirmation where appropriate.

### Testing (implemented features)

| Feature | Tests |
|---------|-------|
| Data lifecycle | `src/test/dataLifecycle.test.ts` — deleteAllUserData, clearJournalOnly, clearHealthDataOnly, clearLocationFromPreferences; TRYRAMADAN_LOCALSTORAGE_KEYS |
| Ramadan / effective range | `src/test/ramadan.test.ts` — getEffectiveRamadanRange, isRamadanDayInRange, getRamadanDayNumberInRange, getRamadanDateRange |
| 404 / invalid URLs | `src/test/404-invalid-urls.test.tsx`; `e2e/404-invalid-urls.spec.ts` |
| Routing guards | `e2e/routing-guards.spec.ts` — dashboard redirect when storage empty |
| Accessibility | `src/test/accessibility.test.tsx` (axe-core: HeroSection, OnboardingWelcome, ArabicHover/Term) |
| Prayer times / ical | `src/test/prayerTimes.test.ts`, `src/test/ical.test.ts`, `src/test/countdownAndPrayerTimes.test.ts` |
| Onboarding / flows | `src/test/onboardingFlow.test.tsx`, `src/test/onboardingCritical.test.tsx` |
| Routes (smoke) | `src/test/routes.test.tsx`; `e2e/happy-path.spec.ts` |
| State transition (E8, B→C, B→I) | `src/test/loggingAndTracking.test.ts` — updateBrokenReason, setBrokenDayToCompleted, setBrokenDayToInProgress |

---

## Recommended order (further optional work)

| # | Item | Status |
|---|------|--------|
| 1 | **Ramadan calendar override** | Done. Preferences `ramadanStartOverride` / `ramadanEndOverride`; Settings "Ramadan dates"; `useRamadanRange()`; all "Day N", stats, export use effective range. |
| 2 | **CSP** | Done. Enforcing in vercel.json; JSON-LD via React. |
| 3 | **E2E smoke routes** | Optional. See `docs/QA-SMOKE-TESTS-ROUTES.md`; add `e2e/smoke-routes.spec.ts` if desired. |
| 4 | **Resilience tests** | Optional. See `docs/QA-RESILIENCE-FAILED-LOADS.md`; Vitest mocks for API failure fallbacks. |

## Optional / ongoing

| Item | Notes |
|------|--------|
| **E2E / manual a11y** | Done: happy-path, 404-invalid-urls, routing-guards. Manual a11y checklist in `docs/accessibility.md` §5. Add more E2E (e.g. offline) as needed. |

---

## Implemented in this batch (all items from "Recommended order")

1. **#3** Optional wellness/symptom retention — Settings → Data & privacy; `wellnessRetentionDays` / `symptomRetentionDays`; applied on Health page visit.
2. **#4** Partial delete — Settings → Clear specific data: Clear journal only, Clear health data, Clear location. `clearJournalOnly`, `clearHealthDataOnly`, `clearLocationFromPreferences` in `dataLifecycle.ts`.
3. **#7** First journal save notice — Dismissible banner on Journal after first save; key `tryramadan-journal-notice-dismissed`.
4. **#1** localStorage for `usePrayerTimesForDate` — Cache key `tryramadan-prayer-times-for-date-cache`, max 30 entries; read/write in hook; included in delete-all.
5. **#5** Low mood 3+ days card — DashboardHealth: "You've logged low energy recently" when 3+ consecutive days with mood 1 or 2.
6. **#2** CSP — Enforcing header in `vercel.json`: `Content-Security-Policy` with default-src, script-src 'self', connect-src, etc.; JSON-LD injected via React.
7. **#6** NetworkFirst for Aladhan — `vite.config.ts`: prayer-times-cache now NetworkFirst with networkTimeoutSeconds 10.
8. **#8** E2E / a11y — Manual testing checklist in `docs/accessibility.md` §5; E2E specs: happy-path, 404-invalid-urls, **routing-guards** (dashboard redirect when storage empty).

---

## Doc status quick reference

| Doc | Status |
|-----|--------|
| SECURITY-CSP-AND-HARDENING.md | Done (CSP enforcing in vercel.json; JSON-LD via React) |
| RAMADAN-CALENDAR-ROBUSTNESS-AND-OVERRIDE.md | Done (override prefs, Settings UI, useRamadanRange, stats) |
| SECURITY-SERVICE-WORKER-PWA-REVIEW.md | Done (NetworkFirst for Aladhan) |
| security-checklist.md | Done |
| SECURITY-PHYSICAL-ACCESS-AND-LIMITATIONS.md | Done |
| DATA-LIFECYCLE-POLICIES.md | Done (partial delete, journal/wellness/symptom retention) |
| UX-HEALTH-GUARDRAILS-AND-CHECK-INS.md | Done (incl. low mood 3+ days card) |
| UX-MICROCOPY-AND-EMPTY-STATES.md | Done |
| QA-404-AND-INVALID-URLS.md | Done |
| QA-OFFLINE-AND-FLAKY-NETWORK.md | Done (usePrayerTimesForDate cache, api.quran.com) |
| QA-ROUTING-GUARDS-AND-TEST-CASES.md | Done (E2E e2e/routing-guards.spec.ts) |
| accessibility.md | Done (manual testing checklist added) |
| SECURITY-LOCALSTORAGE-AUDIT.md | Done (Settings Data & privacy; journal notice; checklist 1,2,4 marked done) |
| SECURITY-THIRD-PARTY-RISK.md | Partial (CSP done; npm audit / Privacy "Data we share" optional) |
| QA-RAMADAN-LOGIC-AND-TEST-CASES.md | Done (implementation status includes user override; ramadan.test.ts) |
| FALL-OFF-AND-RETURN-FLOWS.md | Done (Schedule "I didn't fast this day" for selected day) |
| HISTORICAL-DATA-AND-DELETION-FLOWS.md | Partial (delete journal entry done; undo/compare last year/import optional) |
| Other QA docs | Doc complete; tests optional |

---

## Full enumeration (by doc)

Every doc that has implementation or checklist items, with each item marked Done / Not done / Optional.

| # | Doc | Item | Status |
|---|-----|------|--------|
| 1 | DATA-LIFECYCLE-POLICIES.md | deleteAllUserData, TRYRAMADAN_LOCALSTORAGE_KEYS | Done |
| 2 | DATA-LIFECYCLE-POLICIES.md | Partial delete (journal, health, location) | Done |
| 3 | DATA-LIFECYCLE-POLICIES.md | Journal/wellness/symptom retention, Settings copy | Done |
| 4 | DATA-LIFECYCLE-POLICIES.md | Unit tests partial delete | Done |
| 5 | SECURITY-PHYSICAL-ACCESS-AND-LIMITATIONS.md | Panic clear, deleteAllUserData | Done |
| 6 | SECURITY-CSP-AND-HARDENING.md | CSP header (enforcing), JSON-LD via React | Done |
| 7 | SECURITY-SERVICE-WORKER-PWA-REVIEW.md | cleanupOutdatedCaches, NetworkFirst Aladhan | Done |
| 8 | security-checklist.md | ESLint, HSTS, SW cleanup | Done |
| 9 | SECURITY-LOCALSTORAGE-AUDIT.md | Data & privacy in Settings, journal notice | Done |
| 10 | SECURITY-THIRD-PARTY-RISK.md | CSP in vercel.json | Done |
| 11 | SECURITY-THIRD-PARTY-RISK.md | npm audit in CI, "Data we share" in Privacy | Optional |
| 12 | UX-HEALTH-GUARDRAILS-AND-CHECK-INS.md | Disclaimers, healthWarnings, Day 7/15/21, severity toast, low mood card | Done |
| 13 | UX-MICROCOPY-AND-EMPTY-STATES.md | Empty states, stats dialogs, microcopy | Done |
| 14 | QA-404-AND-INVALID-URLS.md | Vitest + e2e 404, old-path redirects | Done |
| 15 | QA-OFFLINE-AND-FLAKY-NETWORK.md | usePrayerTimesForDate cache, api.quran.com SW | Done |
| 16 | QA-ROUTING-GUARDS-AND-TEST-CASES.md | E2E routing-guards.spec.ts | Done |
| 17 | QA-SMOKE-TESTS-ROUTES.md | routes.test.tsx, happy-path.spec.ts | Done |
| 18 | QA-SMOKE-TESTS-ROUTES.md | Full e2e smoke-routes.spec.ts (all routes) | Optional |
| 19 | QA-RESILIENCE-FAILED-LOADS.md | Vitest mocks for API failure | Optional |
| 20 | QA-PERFORMANCE-SANITY-CHECKS.md | Lighthouse/Playwright perf scripts | Optional |
| 21 | QA-VISUAL-REGRESSION-TESTS.md | Percy/Chromatic/Playwright visual | Optional |
| 22 | RAMADAN-CALENDAR-ROBUSTNESS-AND-OVERRIDE.md | Override prefs, Settings UI, useRamadanRange, stats | Done |
| 23 | FALL-OFF-AND-RETURN-FLOWS.md | Mark past day "I didn't fast" on Schedule | Done |
| 24 | FALL-OFF-AND-RETURN-FLOWS.md | Normalize same-day conflict (completed/skipped/broken) | Optional |
| 25 | HISTORICAL-DATA-AND-DELETION-FLOWS.md | Delete single journal entry | Done |
| 26 | HISTORICAL-DATA-AND-DELETION-FLOWS.md | Undo delete / reset | Not done |
| 27 | HISTORICAL-DATA-AND-DELETION-FLOWS.md | Compare to last year | Not done |
| 28 | HISTORICAL-DATA-AND-DELETION-FLOWS.md | Import from backup | Not done |
| 29 | STATE-TRANSITION-TESTING-FASTING.md | Edit brokenReason in UI (E8) | Done |
| 30 | STATE-TRANSITION-TESTING-FASTING.md | B→C/B→I for broken day in UI | Done |
| 31 | NON-MUSLIM-AND-RAMADAN-CURIOUS-FLOWS.md | "Set my fasting days" upfront | Not done |
| 32 | accessibility.md | Manual a11y checklist, axe tests | Done |
| 33 | USER-FLOWS-AND-TEST-PROMPTS.md | §5 implementation checklist | Done |

---

*Last updated: E8 (edit broken reason), B→C (mark broken as completed), B→I (start fast again) on Schedule; buildRecipeSchema added to jsonld.ts; STATE-TRANSITION doc and tests updated.*