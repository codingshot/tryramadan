---
name: performance-cwv
description: Web performance and Core Web Vitals (LCP, INP, CLS) in TryRamadan. Covers critical path, lazy loading, images/fonts, and layout stability. Use when changing above-the-fold content, images, fonts, or heavy components on the main route.
---

# Performance and Core Web Vitals (TryRamadan)

Use this skill when **changing critical path**, **images**, **fonts**, or **layout** so LCP, INP, and CLS stay within targets.

---

## 1. Goals

- **LCP (Largest Contentful Paint):** &lt; 2.5s — hero and main content visible quickly.
- **INP (Interaction to Next Paint):** &lt; 200ms — buttons and inputs feel responsive.
- **CLS (Cumulative Layout Shift):** &lt; 0.1 — no visible layout jumps.

**Doc:** **`docs/PERFORMANCE.md`** (critical path, checklist, measure).

---

## 2. Critical path and lazy loading

- **Entry:** `main.tsx` → `App.tsx` → `index.css`. Dashboard sub-pages (Schedule, Meals, Progress, Culture, Quran, Macros) are **lazy-loaded**; home and Dashboard remain in main bundle.
- **Heavy components off critical path:** FastingBottomBar, AdhanScheduler, ReminderScheduler not mounted until onboarding complete or on dashboard. Avoid mounting them on every page.
- **Timers:** Countdown/timer intervals throttled (e.g. 2s) where appropriate to reduce main-thread work (INP).
- **Cache-first APIs:** Prayer times and location use cache-first; defer initial fetch with requestIdleCallback when possible (see timezone-and-countdown and offline-and-degraded-network skills).

---

## 3. Images and fonts

- **LCP image:** Hero image with explicit `width`/`height`, `fetchpriority="high"`, `decoding="async"`. Preload from HTML when URL is known.
- **Below-the-fold:** `loading="lazy"` and explicit dimensions or `aspect-ratio`.
- **Fonts:** No `@import` in CSS; use `<link rel="preload">` or font-display strategy so font load does not block first paint.

---

## 4. Layout stability (CLS)

- Reserve space for dynamic content (timer, cards) with `min-height` or explicit dimensions so layout doesn’t shift when data arrives.
- Use skeletons/placeholders with fixed height for loading states.
- **Measure:** `reportWebVitals()` in main.tsx; plug in RUM (e.g. Vercel Analytics) via callback for production.

---

## 5. Checklist for changes

- [ ] New above-the-fold images: dimensions and priority/preload as in PERFORMANCE.md.
- [ ] New routes or heavy components: keep them lazy-loaded if not on critical path.
- [ ] New API or timer: avoid blocking first paint; throttle where appropriate.
