---
name: tryramadan-project
description: TryRamadan app overview, performance optimizations, and resources. Use when making cross-cutting changes, adding dependencies, or optimizing build/runtime.
---

# TryRamadan project overview

Use this skill when working on **performance**, **build/config**, **external resources**, or **project-wide conventions**. For feature-specific work, use the skill that matches the area (see `.cursor/skills/README.md`).

---

## 1. Stack and structure

- **Framework:** React 18 + Vite 5 + TypeScript. Router: React Router 6.
- **UI:** Tailwind CSS, Radix UI, Framer Motion, Lucide icons. Forms: react-hook-form + zod where needed.
- **State:** No global store; `useLocalStorage` and hooks in `src/hooks/useLocalStorage.ts` for preferences, progress, meal plans, food log, journal, etc. React Query only where used (e.g. optional API).
- **Entry:** `main.tsx` → `App.tsx`. Critical path: Index (home), Dashboard, Navbar, Footer. All other routes are **lazy-loaded** (including Dashboard Schedule, Meals, Progress, Culture, Quran, Macros, onboarding steps, Settings, etc.).

**Key dirs:**
- `src/pages/` — route components. Dashboard at `Dashboard.tsx`; sub-pages (Schedule, Meals, etc.) lazy in `App.tsx`.
- `src/components/` — shared UI (Navbar, Footer, FastingTimer, HeroDailySlider, etc.).
- `src/hooks/` — useLocalStorage, usePrayerTimes, useRamadanRange, useLocation, useNotifications, etc.
- `src/lib/` — utils, ramadan.ts, config (API URLs), cultureRecipes, ical, etc.
- `src/data/` — static JSON and TS (hadiths, glossary, cultural-traditions, recipes, guides, personas). Imported where needed; no dynamic loading.
- `public/` — favicon, hero-bg.jpg, og-image.jpg, robots.txt, sitemap.xml. PWA precaches these.

---

## 2. Performance optimizations applied

- **Lazy loading:** All dashboard sub-pages and non-critical routes use `lazy(() => import(...))` and are wrapped in `<Suspense fallback={<PageFallback />}>`. Dashboard Schedule is lazy (large page) to keep initial bundle smaller.
- **Vite build chunks:** `vite.config.ts` uses `manualChunks` to split large libs: `motion` (framer-motion), `recharts`, `icons` (lucide-react). React/router/radix stay in default vendor chunk to avoid circular chunk dependencies. Keeps main bundle smaller and improves cache reuse when only some routes use motion/charts/icons.
- **PWA / Workbox:** Runtime caching for Aladhan (prayer times), Nominatim (geocoding), ipapi, timeapi, api.quran.com. See `vite.config.ts` and `docs/PERFORMANCE.md`.
- **Critical path:** No lazy for Index or Dashboard. Heavy components (FastingBottomBar, AdhanScheduler, ReminderScheduler) not mounted until onboarding complete or on dashboard. Timer intervals throttled (e.g. 2s). Cache-first for prayer times and location.
- **Images:** Hero preloaded from HTML; LCP image has dimensions and `fetchpriority="high"`. Below-the-fold use `loading="lazy"`. See `docs/PERFORMANCE.md`.
- **Memoization:** Heavy lists and callbacks use `useMemo` / `useCallback` where appropriate (e.g. DashboardSchedule, useLocalStorage consumers). LocationSearch debounced and memoized.

When adding new routes or heavy components: keep them **lazy-loaded**. When adding new APIs: prefer cache-first and document in PERFORMANCE.md and this skill.

---

## 3. External resources (APIs and config)

All API base URLs live in **`src/lib/config.ts`** (`API_CONFIG`, `EXTERNAL_LINKS`). Use them instead of hardcoding.

| Resource | Purpose | Caching (PWA) |
|----------|---------|----------------|
| **api.aladhan.com** | Prayer times by date + location | NetworkFirst, 24h |
| **nominatim.openstreetmap.org** | Geocoding and reverse geocoding | CacheFirst, 24h |
| **ipapi.co** | IP-based fallback location | CacheFirst, 24h |
| **timeapi.io** | Timezone by coordinates | CacheFirst, 7 days |
| **api.quran.com** | Quran verses (e.g. juz) | CacheFirst, 7 days |
| **cdn.aladhan.com** | Adhan audio | — |
| **quran.com / sunnah.com** | External links only | — |

Do not add new fetch URLs without updating `config.ts` and, if needed, Workbox `runtimeCaching` in `vite.config.ts`.

---

## 4. Data and static assets

- **JSON/data:** `src/data/` — hadiths.json, daily-quran-verses.json, glossary.json, cultural-traditions.json, recipes.json, daily-facts.json, ramadan-info.json, fasting-programs.json, personas.json, guides (TS), eating-times-tooltips, general-tooltips, languages-and-countries. Imported at build time; no runtime fetch. Keep payloads reasonable; if a file grows large, consider code-splitting or dynamic import.
- **Public:** `public/` — favicon.png, favicon.ico, hero-bg.jpg, og-image.jpg, placeholder.svg, robots.txt, sitemap.xml. Refer with paths like `/hero-bg.jpg`. PWA `includeAssets` lists favicon and hero so they work offline.

---

## 5. Local storage keys (reference)

Used by `useLocalStorage` and helpers in `src/hooks/useLocalStorage.ts`. Do not change keys without a migration or doc note.

- Preferences: `tryramadan-preferences`
- Fasting progress: `tryramadan-progress`
- Journal: `tryramadan-journal`
- Meal plans: `tryramadan-day-meal-plans`
- Food log: `tryramadan-day-food-log`
- Day nutrition: `tryramadan-day-nutrition`
- Schedule notes: `tryramadan-schedule-notes`
- Calendar events: `tryramadan-calendar-events`
- Prayer time overrides: `tryramadan-prayer-time-overrides`
- Dashboard quick actions: `tryramadan-dashboard-quick-actions`
- Plus others (goals, wellness, hadith viewed dates, etc.). Grep for `useLocalStorage(` and `localStorage.getItem` to find all.

---

## 6. Checklist for changes

- [ ] New route or heavy page: keep it **lazy-loaded** in App.tsx.
- [ ] New API or fetch: add base URL to `src/lib/config.ts`; add Workbox cache rule if appropriate.
- [ ] New JSON or large data: prefer `src/data/`; if very large, consider dynamic import.
- [ ] New dependency: add to appropriate `manualChunks` in vite.config.ts if it’s a large lib (e.g. charting, editor).
- [ ] Performance-sensitive change: see **performance-cwv** skill and `docs/PERFORMANCE.md`.
