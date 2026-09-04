# Monorepo and editorial audit — 2026-09-04

## Scope and status

This is an implemented workspace migration and a targeted bug/content review, not a claim that all bugs are fixed. The Islamic review is source-based editorial work, **not certification by an Islamic scholar or a personal fatwa**. A qualified Sunni reviewer must sign off on the full corpus before such a claim is made.

The existing full web application is preserved in `apps/web`. `apps/mobile` is an Expo companion for iOS, Android and web; it deliberately contains no marketing landing page. Calendar functions and a small set of educational guidance cards are shared via `packages/core`. The React runtimes stay isolated because the web app and Expo use different supported major versions.

## Implemented fixes and improvements

- Repaired the originally inconsistent npm lockfile (`npm ci` initially failed because html2canvas dependencies were missing). Root scripts orchestrate the workspaces; old Bun locks are retained as historical artifacts, not competing install inputs.
- Fixed unknown-year calendar estimates returning dates near 2025 instead of the requested occurrence.
- Use civil-date arithmetic for Ramadan lengths/day numbers rather than dividing local milliseconds by 24 hours across DST.
- Fixed the late-2030 occurrence using the January-2030 end date; retained existing approximate date assumptions and community overrides.
- Include the whole first/last civil day, and evaluate historical last-day badges against the date being examined.
- Reject impossible dates and overrides other than 29/30 inclusive days. Existing stored values are not deleted; invalid overrides fall back to the estimated calendar.
- Coalesce timezone requests, validate coordinates/IANA names, abort after ten seconds and cache failures for one minute. Effects depend on coordinate values rather than object identity; stale responses cannot overwrite a new location.
- Web storage setters persist against the latest stored value and synchronize mounted consumers. Passive state mirroring no longer writes stale snapshots back over newer preferences. Added a concurrent-update regression.
- Fasting timers, principal dashboard views, reminders, schedule output, comparison durations and iCal use Fajr rather than the optional earlier imsak precaution. The raw API `imsak` field remains distinct. Old imsak overrides are retained in storage but are not treated as Fajr; users should confirm and enter Fajr overrides with their mosque.
- Preserved zero latitude/longitude in the Ramadan context card rather than treating them as missing.
- Corrected PWA start/shortcut destinations and icon dimensions, and removed placeholder manifest branding. The web landing route is excluded from the navigation fallback; it remains part of the existing web application, not a physically separate site.
- Expo PWA has content-versioned static caching, offline loading and install metadata. Updates wait for older tabs to close instead of forcing a reload during writing. Native and PWA output directories are separate.
- Expo check-ins and journal persist locally, show save failures, avoid overwriting unreadable records, retain unsaved drafts across tab/check-in changes, and keep an open journal entry tied to its original date across midnight.
- Added reusable repo skills for Expo monorepo maintenance and Sunni editorial review. The bundled Python validator could not run because PyYAML was absent; Node YAML parsing plus name/description/placeholder checks passed instead.

## Sunni editorial review

Reviewed/edited: `apps/web/src/data/ramadan-info.json`, the fasting rules and health cards, imsak tooltip, fasting-boundary consumers, and `packages/core/src/guidance.ts`. Other Quran/hadith, glossary, persona, program and cultural material is **not comprehensively verified** in this pass.

| Finding | Correction and source |
|---|---|
| Fasting boundary conflated with precautionary imsak | Use true dawn/Fajr and sunset/Maghrib, with local confirmation: [Quran 2:187](https://quran.com/2/187). |
| Fitrah conflated with zakat al-fitr, described as one meal | Corrected name/Arabic and the sa‘-of-food distinction, with local advice about monetary payment: [Bukhari 1503](https://sunnah.com/bukhari:1503). |
| Blanket injection and swimming assurances | Removed universal assurances and referred medical specifics to qualified advice. [Dar al-Ifta's injection ruling](https://www.dar-alifta.org/en/fatwa/details/7362/intravenous-and-intramuscular-injections-and-fasting) is one institutional view, not proof of consensus. |
| Blanket pregnancy/nursing exemption and one-size-fits-all compensation | Conditioned the guidance on inability/harm and noted school-specific make-up/feeding rules: [Dar al-Ifta](https://www.dar-alifta.org/en/fatwa/details/20338/breaking-the-fast-due-to-pregnancy-and-nursing). |
| Temporary exemptions grouped with children | Clarified that pre-puberty fasts are not made up; distinguished temporary illness/travel from other cases: [Quran 2:185](https://quran.com/2/185). |
| Forgotten eating treated as every kind of accidental ingestion | Narrowed wording to forgetfulness and directed school-specific make-up questions to a scholar: [Bukhari 1933](https://sunnah.com/bukhari:1933). |
| Health cards promised benefits using vague sources | Removed unverified anti-aging/neuroprotection claims and fixed weight-loss guarantees; distinguish research on water-permitted time-restricted eating from Ramadan fasting: [NIDDK research discussion](https://www.niddk.nih.gov/health-information/professionals/diabetes-discoveries-practice/patients-intermittent-fasting), [NIDDK safety guidance](https://www.niddk.nih.gov/health-information/professionals/diabetes-discoveries-practice/fasting-safely-with-diabetes). |

The interface now explicitly distinguishes educational summaries from individualized rulings. It does not automatically determine obligation, validity, fidya, kaffara or spiritual merit.

## Verification

- Shared calendar, persistence, timezone, prayer-cache and fasting-log regression run: **141 tests passed across eight files**.
- Calendar regressions also passed under `TZ=America/New_York`, including DST arithmetic.
- Expo web production export and iOS/Android JavaScript exports succeeded. JavaScript exports are not signed native builds or device tests.
- Manual production browser checks confirmed check-in persistence, journal read-back, active service worker and reload while offline; no JavaScript page errors were reported in that check.
- Automated production-PWA scenarios are in `apps/web/expo-e2e/pwa.spec.ts`; run `npm run test:expo`.
- All **three automated production-PWA tests passed**: offline save/reload, corrupt-storage protection, and mobile layout/source links/draft retention.
- Both workspace type-checks and the migrated web production build passed. Web ESLint reports **zero errors and 21 warnings**.
- Root `npm ci --dry-run --ignore-scripts --no-audit --no-fund` passed against the new workspace lockfile. Existing web landing-page browser smoke check passed.
- The full legacy suite is **not green**: attempts encountered hanging flows in `mainFeatures` and `dailyCardAndFasting`, plus failures in calendar navigation, dashboard queries and accessibility. Some cache-format expectations were obsolete (the implementation correctly includes calculation method); those were corrected without removing method isolation.

## Remaining work / release gates

### Follow-up fixes (September 4)

- Dashboard distinguishes an active logged fast from the Fajr–Maghrib time window; skipped/completed days do not claim an active fast.
- Daily fasting prompt stops when a day is broken or a menstrual period is active. Confirmation/prompt dialogs now have accessible descriptions.
- Schedule action-column headers include screen-reader text; all eight existing accessibility tests pass.
- Today's prayer cache/fetch accepts zero-valued coordinates, with equator/prime-meridian regression coverage.
- Component tests default to an offline fetch fixture instead of live APIs, and default workers are limited to two. The broad suite still has dashboard-flow failures and a stalled mainFeatures run; it was interrupted, not reported as passing.
- Three new hero-status tests pass; both workspace type-checks pass. The isolated calendar-month suite passes all 14 tests.
- Combined follow-up verification: **54 tests passed across five files** (calendar month, accessibility, hero status, countdown/cache, prayer times).

### Outstanding release gates

1. **Native feature parity:** prayer timetable/location configuration, Quran reading, meals/recipes/macros, detailed scheduling, qada, habits, notifications, achievements, settings, onboarding and exports remain in the web app only. Do not market the companion as a full port.
2. **Legacy regression suite:** investigate remaining hangs and failures individually. Do not silence failures or weaken assertions just to mark the audit green. Existing broad integration tests include stale UI assumptions and real-network behavior; product versus harness issues need separate verification.
3. **Qualified full-corpus review:** verify every quotation, attribution, Arabic term and school-specific ruling. Audit prohibited fasting days, missed-fast compensation, intention, and all health copy beyond the reviewed cards. Future Ramadan dates are estimates, not sighting declarations.
4. **Real devices:** test iOS/Android launch, large text/screen readers, suspend/resume, midnight, storage failures and upgrades. Native signing, application identifiers, privacy disclosures and store submission are not configured here.
5. **Data portability:** existing web data is preserved but is not imported into Expo. There is no backend or synchronization, and local app data is not encrypted by this application. Add explicit import/export and migration specifications before promising portability.
6. **PWA deployment:** host Expo on a separate origin; configure HTTPS and SPA fallback, revalidate the HTML/service-worker/manifest and verify updates with multiple tabs. Service-worker caching cannot guarantee offline availability before the first successful online installation or after browser eviction.
7. **Web production security/layout:** existing CSP, external API failures and responsive layouts need a full deployment review. Web build still warns about a large main chunk; avoid a bulk dependency upgrade without its own regression pass.

Architecture follows Expo's [monorepo guidance](https://docs.expo.dev/guides/monorepos/) and [PWA guidance](https://docs.expo.dev/guides/progressive-web-apps/). No deployment, commit, push, app-store submission or scholar endorsement was performed.
