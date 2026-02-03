# Web performance & Core Web Vitals (CWV)

This doc summarizes standards, bottlenecks, and patterns for **LCP**, **INP**, and **CLS** in TryRamadan.

---

## Critical path (app shell & above-the-fold)

- **Entry:** `main.tsx` → `App.tsx` → `index.css`. No lazy entry; all sync imports (Index, Dashboard, Navbar, Footer, onboarding, Settings, etc.) are in the main bundle. Only dashboard sub-pages (Schedule, Meals, Progress, Culture, Quran, Macros) are lazy-loaded.
- **Router:** React Router `BrowserRouter` + `Routes` in App; no SSR. First route rendered is `/` (Index).
- **Above-the-fold (home):** `Navbar` → `HeroSection` (hero image, logo, headline, `FastingTimer`). Hero image is preloaded from `index.html` and served from `public/hero-bg.jpg`; logo uses `fetchPriority="low"` so LCP stays the hero image. `FastingTimer` uses `usePrayerTimes` (cache-first) and `useAutoLocation` (geolocation or ipapi); cache hit avoids network before first paint.
- **Heavy/blocking:** No render-blocking font `@import` (fonts load async via `<link rel="preload">` in HTML). `FastingBottomBar`, `AdhanScheduler`, `ReminderScheduler` are not mounted on `/onboarding` or until onboarding is complete, reducing work on first load.
- **Location search (INP):** `LocationSearch` is used in Settings, OnboardingLocation, LocationDisplay, OnboardingModal. Search is debounced (300 ms); component is memoized so parent re-renders don’t cause unnecessary work during typing.
- **Calendar:** Dashboard Schedule uses `usePrayerTimesForDate` and calendar UI; that route is lazy-loaded, so not on the critical path for LCP.

---

## Goals

- **LCP (Largest Contentful Paint):** &lt; 2.5s — hero image and main content visible quickly.
- **INP (Interaction to Next Paint):** &lt; 200ms — buttons, links, and inputs feel responsive.
- **CLS (Cumulative Layout Shift):** &lt; 0.1 — no visible layout jumps.

---

## Checklist (patterns to follow)

### Images

- [x] **LCP image:** Use a single, above-the-fold image with explicit `width` and `height` to avoid CLS; use `fetchpriority="high"` and `decoding="async"`.
- [x] **Preload:** Preload the LCP image from HTML when it’s a known URL (e.g. hero in `public/`) so the browser discovers it early.
- [x] **Below-the-fold images:** Use `loading="lazy"` and explicit dimensions or `aspect-ratio` where possible (Footer logo, guide/recipe images).
- [x] **Logos/icons:** Hero/Navbar/Footer use `<picture>` with WebP (`/logo.webp`) and PNG fallback; Footer logo has `loading="lazy"`.
- [ ] **Responsive hero (future):** Add `srcset` with 768w, 1024w, 1920w (and WebP) when multiple sizes exist.

### Fonts

- [x] **Non-blocking:** Do not use `@import` for fonts in CSS. Use `<link rel="preload">` with `onload` swap (or a font-display strategy) so font loading does not block first paint.
- [x] **Preconnect:** Add `preconnect` (and `crossorigin` for font origin) to the font domain in `index.html`.

### JavaScript & rendering

- [x] **Route-level code splitting:** Lazy-load routes that are not on the critical path (dashboard sub-pages, onboarding, Settings, FAQ, etc.); home and Dashboard remain in main bundle.
- [x] **Heavy components off critical path:** Avoid mounting heavy components (schedulers, bottom bars) on every page when they’re only needed after onboarding or on dashboard.
- [x] **Timers:** Timer/countdown intervals throttled to 2s where appropriate to reduce main-thread work (INP).
- [x] **Cache-first APIs:** Use cache-first for prayer times and other non-critical data; `useAutoLocation` / `usePrayerTimes` defer initial fetch with `requestIdleCallback` when possible.

### Layout stability (CLS)

- [x] **Reserve space:** Use `min-height` or explicit dimensions for areas that load dynamic content (e.g. timer, cards) so layout doesn’t shift when data arrives.
- [x] **Skeletons/placeholders:** Route fallback uses `SkeletonCard`; lists/cards use fixed-height placeholders when loading.
- [ ] **No layout shift from ads or embeds:** If added later, ensure reserved space or use `aspect-ratio` / fixed containers.

### General

- [x] **PWA/Workbox:** Cache static assets and key API responses (e.g. prayer times) for repeat visits.
- [x] **Measure:** `reportWebVitals()` runs from `main.tsx`; reports LCP, INP (FID), CLS to console in dev when not "good". Plug in RUM (e.g. Vercel Analytics) via callback.

---

## PWA & offline behavior

- **Workbox (vite-plugin-pwa):** Precaches HTML, JS, CSS, and static assets matching `globPatterns`. `includeAssets` adds `favicon.png`, `favicon.ico`, `og-image.jpg`, `hero-bg.jpg` so the hero image is available offline.
- **Runtime caching:**
  - **Aladhan** (`api.aladhan.com`): CacheFirst, 24 h, 10 entries — prayer times. Serves last-known times when offline.
  - **Google Fonts / gstatic:** CacheFirst, 1 year.
  - **Nominatim** (`nominatim.openstreetmap.org`): CacheFirst, 24 h, 30 entries — geocoding and reverse geocoding for location search and auto-detect.
  - **ipapi** (`ipapi.co`): CacheFirst, 24 h, 5 entries — IP-based fallback location.
  - **timeapi.io:** CacheFirst, 7 days — timezone by coordinates.
- **Offline messaging:** When prayer times are shown from cache (`isFromCache`) and `navigator.onLine === false`, the UI shows explicit copy: “Showing cached prayer times. You’re offline.” (Dashboard Prayers) and “Cached times · You’re offline.” (FastingTimer). Retry is hidden when offline to avoid confusion.
- **Prayer times cache:** `usePrayerTimes` reads from `localStorage` first (same date + location); only then fetches Aladhan. So after one successful load, repeat visits and offline use show last-known times without a network request.

---

## Current implementation summary

| Area | Status | Notes |
|------|--------|--------|
| **Hero image** | Done | `<img>` with `width`/`height`, `fetchPriority="high"`, `decoding="async"`. Hero in `public/` with `<link rel="preload">` in `index.html` for early discovery. |
| **Fonts** | Done | Preconnect + preload with `onload` swap in `index.html`; no render-blocking `@import` in CSS. |
| **Logo** | Done | Hero/Navbar/Footer use `<picture>` with WebP (`/logo.webp`) and PNG fallback; Footer logo has `loading="lazy"`. |
| **Lazy routes** | Done | Dashboard Schedule, Meals, Progress, Culture, Quran, Macros are lazy-loaded. |
| **FastingBottomBar / Schedulers** | Done | Rendered only when onboarding is complete and not on onboarding routes; reduces work on first-time landing. |
| **Prayer times** | Done | Cache-first in `usePrayerTimes`; no API call when cache is valid. |
| **FastingTimer CLS** | Done | Wrapper has `min-height` so layout doesn’t jump when prayer times load. |
| **Below-the-fold images** | Done | Guide/recipe pages use `loading="lazy"` where applicable. |
| **Prayer list CLS** | Done | Dashboard Prayers list container uses `min-h-[420px]` when loading so cards don’t shift in. |
| **Logo LCP** | Done | Hero logo has `fetchPriority="low"` so LCP remains the hero background image. |
| **LocationSearch INP** | Done | Component wrapped in `React.memo`; search debounced 300 ms. |
| **PWA APIs** | Done | Workbox caches Nominatim, ipapi, timeapi; hero-bg in includeAssets. Offline messaging when showing cached prayer times. |
| **Web Vitals (Measure)** | Done | `src/lib/reportWebVitals.ts` observes LCP, FID (INP proxy), CLS; called from `main.tsx`. Dev console logs non-good ratings; pass `onReport` to send to RUM. |
| **Route fallback (CLS)** | Done | `PageFallback` in App uses `SkeletonCard` so lazy routes show a stable skeleton instead of a spinner. |

---

## Measure (RUM & Web Vitals)

- **`reportWebVitals()`** is invoked from `main.tsx` after the app mounts. It uses `PerformanceObserver` to report:
  - **LCP** (Largest Contentful Paint) — target &lt; 2.5s.
  - **INP** — reported via the First Input Delay (FID) entry when INP is not available; target &lt; 200ms.
  - **CLS** (Cumulative Layout Shift) — target &lt; 0.1.
- **Default behavior:** In development, metrics with rating `needs-improvement` or `poor` are logged to the console. No network calls unless you provide a callback.
- **Sending to analytics:** Call `reportWebVitals((metric) => { ... })` and inside the callback send the metric to your RUM provider (e.g. `window.gtag('event', metric.name, { value: metric.value })` for Google Analytics, or your Vercel Analytics / custom endpoint).
- **Validation:** Use [PageSpeed Insights](https://pagespeed.web.dev/) or Chrome DevTools Lighthouse after deployment to validate LCP, INP, CLS against the goals above.

---

## File-level notes

- **`index.html`:** Preconnect/preload for fonts; preload for hero image (`/hero-bg.jpg` when hero lives in `public/`).
- **`src/main.tsx`:** Renders app and calls `reportWebVitals()` for CWV measurement.
- **`src/lib/reportWebVitals.ts`:** Observes LCP, FID, CLS; optional callback for RUM; logs non-good in dev.
- **`src/index.css`:** No font `@import`; Tailwind layers and design tokens only.
- **`src/App.tsx`:** Conditional rendering of `FastingBottomBar`, `AdhanScheduler`, `ReminderScheduler`; `PageFallback` uses `SkeletonCard` for lazy routes.
- **`src/components/HeroSection.tsx`:** Hero image from public URL; logo with explicit dimensions and WebP via `<picture>`.
- **`src/components/FastingTimer.tsx`:** Timer container has reserved height to avoid CLS.
- **`src/components/Footer.tsx`:** Logo uses `<picture>` (WebP + PNG) and `loading="lazy"` (below the fold).
- **`vite.config.ts`:** PWA Workbox caches Aladhan API and Google Fonts.

---

## Future improvements

1. **Responsive hero:** Generate and serve multiple sizes (e.g. 768, 1024, 1920) and WebP; use `srcset`/`picture`.
2. **Logo:** Provide a smaller logo (or WebP) for Navbar/Footer to cut payload on every page.
3. **INP:** Profile long tasks on interaction (e.g. opening modals, switching tabs); defer or chunk work if needed.
4. **Optional:** Preload key route chunks (e.g. dashboard) on hover or after FCP for faster navigation.
