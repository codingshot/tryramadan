# TryRamadan – Improvement backlog

Prioritized list of improvements to make. Tick off as done.

---

## Identity & config

- [x] **Package name** – Change `package.json` name from `vite_react_shadcn_ts` to `tryramadan` (or `tryramadan-app`).
- [x] **PWA name** – Ensure manifest/short name says "TryRamadan" for install prompt and home screen.

---

## UX & error handling

- [x] **Prayer times error UI** – When Aladhan API fails, show clear error state with "Try again" and "Set location" (not only "Loading prayer times..."). Apply on Dashboard Prayers, FastingTimer, Dashboard (today’s times), and Schedule.
- [x] **Ramadan calendar export error** – If fetchRamadanPrayerTimes fails, show toast or inline error with retry; avoid silent fail. (GoalsUntilRamadanCard had it; Schedule export now shows toast on failure.)
- [ ] **Location required** – On pages that need location (prayers, timer, Ramadan export), show a single clear CTA to Settings when `locationCoords` is null.
- [ ] **Offline / API fallback** – When prayer API is down, use last successful cache (e.g. from localStorage) with a "Times may be outdated" message, or default times with "Set location for accurate times".

---

## Performance

- [x] **Route lazy loading** – Lazy-load heavy dashboard routes (Schedule, Meals, Progress, Culture, Macros, Quran) with `React.lazy` + `Suspense` to improve initial load.
- [ ] **Ramadan prayer cache** – Already implemented; consider compressing or trimming cache if it grows (e.g. only store current/next Ramadan year).

---

## Calendar export

- [ ] **iCal timezone** – Add VTIMEZONE / TZID to .ics so Google Calendar and Apple Calendar show events in the user’s local time (not UTC). Use `preferences.timezone` (IANA) when building events.
- [ ] **Export options** – Let user choose "Fasting only" (Suhoor end + Iftar) vs "Full prayers" when adding Ramadan to calendar.

---

## Accessibility

- [x] **Skip link** – Add "Skip to main content" at the top of the app for keyboard users.
- [x] **Focus visibility** – Audit interactive elements (buttons, links, ArabicHover) for visible focus ring (e.g. `focus-visible:ring-2`). Fixed Culture link on Index; ArabicHover/buttons already had it.
- [ ] **Live regions** – Use `aria-live` for countdown and "Next prayer" updates so screen readers get updates.
- [ ] **Tests** – Add or extend a11y tests (e.g. axe-core) in `accessibility.test.tsx` for critical flows.

---

## Testing

- [ ] **Ramadan export** – Test that "Add Ramadan to calendar" builds ics with correct date range and prayer times for mock location.
- [ ] **useRamadanPrayerTimes** – Test cache key, cache hit/miss, and refetch on location change.
- [ ] **Critical paths** – Add tests for: set location → see prayer times; export Ramadan ics; complete a fast (start → break/complete).

---

## Code quality

- [ ] **TypeScript** – Remove remaining `any`; enable strict null checks if not already.
- [ ] **Shared error component** – Reusable "API error + retry" component for prayer times, timezone, and calendar export.
- [x] **Constants** – Move API base URLs (Aladhan, timeapi.io, ipapi, Nominatim) to a single config or env file for easier staging/mocking. (`src/lib/config.ts`)

---

## SEO & meta

- [ ] **Unique descriptions** – Ensure each main page (Dashboard, Today, Schedule, Prayers, Meals, etc.) has a unique meta description and Open Graph title/description.
- [ ] **Structured data** – Consider HowTo or Event schema for guides and Ramadan calendar export.

---

## Documentation

- [x] **CONTRIBUTING.md** – Short dev setup (install, env, run, test) and how to add a new page/feature.
- [x] **Changelog** – Keep a CHANGELOG.md or "What’s New" in README for notable releases.

---

## Additional improvements (added)

- [ ] **Sitemap** – Add sitemap.xml for SEO (list main routes).
- [ ] **404 page SEO** – Ensure NotFound has noindex and friendly message.
- [ ] **Keyboard shortcuts** – Consider global shortcuts (e.g. ? for help, g then d for dashboard).
- [ ] **Print styles** – Add print-friendly CSS for schedule, progress, and guides.
- [ ] **Loading skeletons** – Replace generic spinners with skeleton placeholders on dashboard cards.
