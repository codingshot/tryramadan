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
| Other QA docs | Doc complete; tests optional |

---

*Last updated: Doc audit; dataLifecycle partial-delete tests added; SECURITY-CSP, QA-ROUTING-GUARDS, SECURITY-LOCALSTORAGE-AUDIT, SECURITY-THIRD-PARTY-RISK, DATA-LIFECYCLE checklists/status updated.*