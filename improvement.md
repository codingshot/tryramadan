# TryRamadan – Improvement backlog

Prioritized list of improvements to make. Tick off as done.

---

## Onboarding & persistence

- [x] **Onboarding flow** – Welcome → Mode → Knowledge → Health → Location → Schedule → Notifications → Priorities → Goals → Dashboard. Health options clickable; Location has skip option.
- [x] **Local persistence** – Preferences and quick actions persist via persistPreferencesSync/persistQuickActionsSync before navigation; onboarding draft saved to localStorage.
- [x] **Completion redirect** – Completing onboarding navigates to dashboard (no redirect loop); Dashboard reads fresh preferences from localStorage.

---

## Identity & config

- [x] **Package name** – Change `package.json` name from `vite_react_shadcn_ts` to `tryramadan` (or `tryramadan-app`).
- [x] **PWA name** – Ensure manifest/short name says "TryRamadan" for install prompt and home screen.

---

## UX & error handling

- [x] **Prayer times error UI** – When Aladhan API fails, show clear error state with "Try again" and "Set location" (not only "Loading prayer times..."). Apply on Dashboard Prayers, FastingTimer, Dashboard (today’s times), and Schedule.
- [x] **Ramadan calendar export error** – If fetchRamadanPrayerTimes fails, show toast or inline error with retry; avoid silent fail. (GoalsUntilRamadanCard had it; Schedule export now shows toast on failure.)
- [x] **Location required** – On pages that need location (prayers, timer, Ramadan export), show a single clear CTA to Settings when `locationCoords` is null. (`LocationRequiredCTA` used on Dashboard Prayers, Schedule, FastingTimer, GoalsUntilRamadanCard.)
- [x] **Offline / API fallback** – When prayer API is down, use last successful cache (e.g. from localStorage) with a "Times may be outdated" message, or default times with "Set location for accurate times". (usePrayerTimes caches to localStorage; on error restores cache and sets isFromCache; FastingTimer and Dashboard Prayers show "Times may be outdated" + retry.)

---

## Performance

- [x] **Route lazy loading** – Lazy-load heavy dashboard routes (Schedule, Meals, Progress, Culture, Macros, Quran) with `React.lazy` + `Suspense` to improve initial load.
- [x] **Loading skeletons** – Added SkeletonCard, SkeletonTimer, SkeletonPrayerTime for better perceived performance.
- [x] **React.memo** – Memoized TodayScheduleTimeline, DailyMissionsCard, MissionRow to prevent unnecessary re-renders.
- [x] **useMemo optimizations** – Expensive calculations in DashboardSchedule (ramadanDaysInMonth, sunnahDaysInMonth, totalHoursFasted, food log totals) now memoized.
- [x] **Ramadan prayer cache** – Trim cache to only store current/next Ramadan year entries when reading/writing (trimRamadanPrayersCache).

---

## Calendar export

- [x] **iCal timezone** – Add VTIMEZONE / TZID to .ics so Google Calendar and Apple Calendar show events in the user’s local time (not UTC). Use `preferences.timezone` (IANA) when building events.
- [x] **Export options** – Let user choose "Fasting only" (Suhoor end + Iftar) vs "Full prayers" when adding Ramadan to calendar. (GoalsUntilRamadanCard has toggle; buildIcalContent exportMode.)

---

## Accessibility

- [x] **Skip link** – Add "Skip to main content" at the top of the app for keyboard users.
- [x] **Focus visibility** – Audit interactive elements (buttons, links, ArabicHover) for visible focus ring (e.g. `focus-visible:ring-2`). Fixed Culture link on Index; ArabicHover/buttons already had it.
- [x] **Live regions** – Use `aria-live` for countdown and "Next prayer" updates so screen readers get updates. (FastingTimer: main countdown and target-time divs have aria-live="polite" and aria-label; Dashboard Prayers: next-prayer/countdown block has aria-live="polite" role="status".)
- [x] **Tests** – Add or extend a11y tests (e.g. axe-core) in `accessibility.test.tsx` for critical flows. (vitest-axe: HeroSection, OnboardingWelcome, ArabicHover/ArabicTerm.)

---

## Testing

- [x] **Ramadan export** – Test that "Add Ramadan to calendar" builds ics with correct date range and prayer times for mock location. (ical.test.ts: buildIcalContent date range, fasting vs full, timezone, custom events.)
- [x] **useRamadanPrayerTimes** – Test cache key, cache hit/miss, and refetch on location change. (prayerTimes.test.ts: getRamadanPrayersCacheKey, fetchRamadanPrayerTimes throws on API failure.)
- [x] **Critical paths** – Add tests for: set location → see prayer times; export Ramadan ics; complete a fast (start → break/complete). (onboardingFlow.test.tsx: complete Goals → dashboard; no redirect when onboardingComplete.)

---

## Code quality

- [x] **TypeScript** – No explicit `any` in codebase; `noImplicitAny: true` enabled in tsconfig.app.json. (Strict null checks left for future; would require broader changes.)
- [x] **Shared error component** – Reusable "API error + retry" component for prayer times, timezone, and calendar export. (`ApiErrorRetry` used on Dashboard Prayers.)
- [x] **Constants** – Move API base URLs (Aladhan, timeapi.io, ipapi, Nominatim) to a single config or env file for easier staging/mocking. (`src/lib/config.ts`)

---

## SEO & meta

- [x] **Unique descriptions** – Each main page has unique meta description and Open Graph via PageSEO (Dashboard, Today, Schedule, Prayers, Meals, Culture, Learn, Quran, etc.).
- [x] **Structured data** – Index has WebApplication + FAQPage schema; Health page has Article schema. Guides/culture use PageSEO with unique titles.
- [x] **Sitemap** – sitemap.xml added with main routes, culture countries, guides. Referenced in robots.txt.
- [x] **404 page SEO** – NotFound has noindex, nofollow and friendly message.

---

## AI engine optimization

- [x] **robots.txt** – Allow GPTBot, ChatGPT-User, Claude-Web, anthropic-ai. Sitemap reference.
- [x] **Semantic structure** – Clear titles, meta descriptions, canonical URLs, JSON-LD where applicable.
- [x] **Content discoverability** – Main pages indexed; onboarding noindexed (flow, not content).

---

## Documentation

- [x] **CONTRIBUTING.md** – Short dev setup (install, env, run, test) and how to add a new page/feature.
- [x] **Changelog** – Keep a CHANGELOG.md or "What’s New" in README for notable releases.

---

## Additional improvements (added)

- [x] **Sitemap** – sitemap.xml with main routes, culture, guides, voluntary fasting programs.
- [x] **404 page SEO** – NotFound has noindex and friendly message.
- [x] **Ramadan dates** – Updated to accurate 2025-2032 dates from Aladhan (March 1 2025, Feb 18 2026, etc.).
- [x] **Voluntary fasting pages** – Monday & Thursday, Ayyam al-Beed, Day of Arafah, Six Days of Shawwal have dedicated pages at /programs/:slug.
- [x] **Voluntary fasting in onboarding** – OnboardingSchedule allows selecting Monday & Thursday and Ayyam al-Beed as add-ons to Full Ramadan.
- [x] **Tooltip explanations** – ArabicHover and tooltips now prioritize explanation (what the term means) over Arabic translation.
- [x] **Debounced search** – LearnGlossary search now debounced (200ms) for smoother filtering.
- [x] **GPU acceleration** – Added .gpu-accelerated utility class for smooth animations.
- [x] **Keyboard shortcuts UI** – Floating help button shows all shortcuts; press ? to open.
- [x] **Keyboard shortcuts** – Global shortcuts: g+d (dashboard), g+t (today), g+s (schedule), g+p (prayers), g+q (quran), g+h (home), , (settings), ? (help).
- [x] **Print styles** – Add print-friendly CSS for schedule, progress, and guides. (Nav/footer/fixed hidden; content contrast and break-inside for cards and guides.)
- [x] **Loading skeletons** – Skeleton placeholders for dashboard timer and cards.
- [x] **Hero day count** – Pretitle shows "X days until Ramadan" or "Day X of Ramadan" instead of static "Upcoming Ramadan".
- [x] **Fasting timer auto-location** – Hero FastingTimer uses auto-detected location (IP/geolocation) when user hasn't saved coords, for accurate eating/fasting period.
- [x] **Prayer alarms for Muslim only** – Adhan and per-prayer notifications disabled for non-Muslim users; eating alarms (suhoor, iftar, hydration) kept for all.
- [x] **Dashboard location banner** – Dismissible "Set your location in Settings…" banner when no saved location (UX-FLOWS 4.6); localStorage once-per-session dismiss.
- [x] **Journal timestamps** – JournalEntry has `createdAt` and `updatedAt` (QA doc); set on save for timeline and "last edited" (future UI).
- [x] **Copy for non-Muslims** – Daily missions "start fasting" tooltip says "pre-dawn meal (suhoor)" for non-Muslim; Break-fast reason "Travel" has tooltip "Travelers may be exempt; make up days later" (COPY-AUDIT).

---

## Future improvements

- [ ] **React hooks** – Resolve remaining react-hooks/exhaustive-deps warnings where safe; fast-refresh warnings in shadcn/ui can remain.
- [x] **Dashboard tests** – Added dashboardFeatures.test.tsx for day selector, fasting status, quick actions, Prayers/Learn links. Dashboard a11y: aria-labels on Settings, Go to today, Mark complete; h2 for Day plan; Navbar logo alt="" for redundancy fix.
- [ ] **Strict null checks** – Enable `strictNullChecks` in TypeScript for stronger type safety (will require broader changes).
- [ ] **Ramadan logic QA** – See `docs/QA-RAMADAN-LOGIC-AND-TEST-CASES.md`: skipped state and "I didn't fast today" implemented; journal `createdAt`/`updatedAt` implemented. Remaining: excused vs broken in stats, makeup (Qada) flag, calendar/DST/timezone tests.