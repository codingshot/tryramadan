# Screen and edge-case audit — September 4, 2026

This is an engineering audit, not certification that every interaction, religious statement or health claim is correct.

## Scope and repeatable checks

`apps/web/e2e/screen-audit.spec.ts` derives static route paths from the router, including ten nested onboarding steps. It checks Muslim and newcomer modes at 360×900 and 1440×900, with reduced motion and external services blocked. Each route must render a visible, nonempty main landmark, have no Vite error overlay or uncaught page error, and not overflow the viewport horizontally. Redirect aliases are included; these are route checks, not distinct screens.

| Area | Paths covered by the screen matrix |
| --- | --- |
| Onboarding | Welcome, mode, knowledge, health, gender, location, schedule, notifications, priorities, goals; onboarding root |
| Daily tools | Dashboard, Today, Schedule, Prayers, Meals, Journal, Macros, Qada |
| Learning and progress | Learn, Quran, glossary, hadith, culture, health, progress, achievements, goals |
| Public resources | Landing, programs, culture, recipes, health/safety, FAQ, emergency, habits, guides, personas, comparison, brand |
| Settings and policies | Settings, terms, legal, privacy |

Manual browser observations: desktop landing loads with controls and no reported runtime errors; narrow mobile Schedule exposed the unavailable-times and horizontal-overflow bugs below. Automated render checks do not replace manual visual inspection of every screen.

## Confirmed fixes

1. **Location search race:** old responses no longer overwrite newer queries or repopulate a cleared search. Search results only open while the input is focused, and Escape closes them. Two asynchronous regression tests cover late-response and clear-during-request behavior.
2. **Schedule horizontal overflow:** positioned accessible table headers keep their visually hidden text within the table scroll container. The table remains scrollable; page overflow is not globally concealed.
3. **Unknown prayer times:** Schedule no longer presents a fabricated zero countdown or asserts a fasting window when times are missing. It explains the unavailable state and preserves local logging controls.
4. **Recorded broken/excused days:** Schedule shows the recorded status rather than “Not logged yet.” Three regressions cover unavailable times, broken fasts and menstruation entries.

## Verification record

- Initial two-persona screen run: 85 passed, one mobile Schedule overflow failure; fixed as described above.
- Expanded four-persona screen run: **212 passed** (53 paths × four mode/viewport combinations).
- Focused edge regressions: **46 passed across seven files**: data lifecycle, gender/menstruation, invalid URLs, XSS rendering, accessibility, location-search races and Schedule empty/recorded states.
- Browser save/reload flows: **two passed**, one per user mode, covering journal text (including Arabic and literal markup) and in-progress fast persistence with external services unavailable. These tests keep the local app server reachable; they are not service-worker offline-install tests.
- Both workspace type-checks passed.
- Web production build passed; the existing large-chunk warning remains.
- An earlier concurrent accessibility run timed out under load; the completed focused rerun above passed. No assertions were disabled to achieve these results.

## Not yet established

- Every dynamic detail page (all recipe, country, habit, program, guide and persona records), every dialog/action and every possible data combination.
- Full legacy test-suite pass, keyboard/screen-reader walkthroughs of every page, browser-level color contrast, dark-mode/large-text visual review, all supported browsers and real native devices.
- Location changes during in-flight prayer requests, midnight/travel across every timezone, storage quota denial and migration of every historical data version.
- Scholar-approved review of the complete Sunni content corpus or clinician approval of health guidance. School-specific rulings and personalized medical decisions require qualified review.
- Full Expo/native parity with the existing web application; see `MONOREPO-AUDIT.md`.

No production data, deployment, commit or push was changed by the audit.
