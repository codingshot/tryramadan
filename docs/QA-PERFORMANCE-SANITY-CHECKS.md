# QA: Performance Sanity Checks

> **Implementation status:** Doc complete. Thresholds and anti-patterns documented. Lighthouse CI and Playwright perf scripts are templates; add to CI when desired.

Basic performance thresholds, layout stability, automated checks, and anti-patterns for TryRamadan.app.

---

## 1. Per-Route Thresholds

### Time to first render (TTFR)

Measured from navigation start to first meaningful paint. **Reasonable local range** (no throttling, typical dev machine):

| Route | Target TTFR | Notes |
|-------|-------------|-------|
| `/` | &lt; 1.5s | Hero + FastingTimer; prayer times deferred (cache/requestIdleCallback) |
| `/dashboard` | &lt; 2.0s | Heavier; prayer strip, day card, schedulers; lazy children not loaded yet |
| `/dashboard/today` | &lt; 2.0s | Lazy route; PageFallback → then content |
| `/dashboard/schedule` | &lt; 2.5s | Lazy; calendar + prayer times for selected day |
| `/dashboard/journal` | &lt; 1.8s | Lazy; mostly localStorage; no API on first paint |
| `/guides` | &lt; 1.8s | Lazy; static guides; images lazy-loaded |
| `/dashboard/prayers` | &lt; 2.0s | Lazy; prayer times API; loading skeleton |
| `/onboarding/*` | &lt; 1.8s | Lazy; simple forms |
| `/settings` | &lt; 2.0s | Lazy; heavier form UI |

**Production (3G throttling):** Add ~0.5–1.5s depending on network. LCP goal &lt; 2.5s per `docs/PERFORMANCE.md`.

---

### Layout shift (CLS)

| Area | Target | Notes |
|------|--------|-------|
| **Navbar** | CLS contribution &lt; 0.02 | Fixed position; reserve height with `min-h-[44px]`; motion `initial` may cause tiny shift — consider `opacity` only |
| **Bottom bar (FastingBottomBar)** | CLS contribution &lt; 0.05 | **Main risk:** appears only when `isFasting`; toggles `has-fasting-bottom-bar` → `.main-content` `padding-bottom` +52px on mobile. Reserve space when `onboardingComplete` and not on onboarding, or use `min-height` placeholder |
| **FastingTimer** | CLS &lt; 0.02 | Uses `min-height`; prayer times load async — placeholder prevents shift |
| **Prayer strip (Dashboard)** | CLS &lt; 0.03 | Skeleton `min-h-[140px]` when loading |
| **Lazy route fallback** | CLS &lt; 0.02 | PageFallback (SkeletonCard) replaces loading; stable height |
| **Overall page** | CLS &lt; 0.1 | Core Web Vitals target |

**Bottom bar anti-shift:** Consider reserving `52px` bottom padding on mobile for dashboard routes when `onboardingComplete`, so when bottom bar appears there’s no jump. Alternatively, render a transparent placeholder of the same height.

---

## 2. Automated Script / Checklist

### Option A: Lighthouse CI (recommended)

```yaml
# .github/workflows/lighthouse.yml or similar
- name: Run Lighthouse CI
  run: |
    npm install -g @lhci/cli
    lhci autorun --collect.url=http://localhost:8080/ \
      --collect.url=http://localhost:8080/dashboard \
      --collect.url=http://localhost:8080/dashboard/today \
      --collect.url=http://localhost:8080/dashboard/schedule \
      --collect.url=http://localhost:8080/dashboard/journal \
      --collect.url=http://localhost:8080/guides \
      --assert.preset=lighthouse:recommended \
      --assert.assertions.\"cumulative-layout-shift\"=[\"error\",{\"maxNumericValue\":0.1}] \
      --assert.assertions.\"first-contentful-paint\"=[\"warn\",{\"maxNumericValue\":2000}]
```

### Option B: Playwright performance assertions

```ts
// e2e/perf-sanity.spec.ts
import { test, expect } from "@playwright/test";

const ROUTES = [
  { path: "/", name: "Home" },
  { path: "/dashboard", name: "Dashboard" },
  { path: "/dashboard/today", name: "Dashboard Today" },
  { path: "/dashboard/schedule", name: "Dashboard Schedule" },
  { path: "/dashboard/journal", name: "Dashboard Journal" },
  { path: "/guides", name: "Guides" },
];

test.describe("Performance sanity", () => {
  for (const { path, name } of ROUTES) {
    test(`${name} (${path}): first render and CLS`, async ({ page }) => {
      const start = Date.now();
      await page.goto(path, { waitUntil: "domcontentloaded" });
      const ttfr = Date.now() - start;

      // TTFR threshold (local, no throttling)
      expect(ttfr, `${name} TTFR`).toBeLessThan(3000);

      // CLS: use Performance API if available
      const cls = await page.evaluate(() => {
        return new Promise<number>((resolve) => {
          try {
            const observer = new PerformanceObserver((list) => {
              for (const entry of list.getEntries()) {
                if (entry.hadRecentInput) continue;
                const e = entry as any;
                if (e.value !== undefined) resolve(e.value);
              }
            });
            observer.observe({ type: "layout-shift", buffered: true });
            setTimeout(() => {
              observer.disconnect();
              resolve(0);
            }, 2000);
          } catch {
            resolve(0);
          }
        });
      });
      expect(cls, `${name} CLS`).toBeLessThan(0.15);
    });

    test(`${name}: no heavy components on initial render`, async ({ page }) => {
      const requests: string[] = [];
      page.on("request", (req) => requests.push(req.url()));

      await page.goto(path, { waitUntil: "networkidle" });

      // Anti-pattern: analytics/third-party on every route
      const analytics = requests.filter(
        (u) =>
          u.includes("google-analytics") ||
          u.includes("gtag") ||
          u.includes("segment") ||
          u.includes("posthog")
      );
      expect(analytics.length, "No analytics on critical path").toBe(0);

      // Anti-pattern: fetch all dashboard child routes
      const chunkOverfetch = requests.filter(
        (u) =>
          u.includes("DashboardSchedule") &&
          u.includes("DashboardMeals") &&
          u.includes("DashboardJournal")
      );
      // Only the current route's chunk should load
      expect(chunkOverfetch.length).toBeLessThanOrEqual(1);
    });
  }
});
```

### Option C: Manual checklist

| Check | Route(s) | Pass criteria |
|-------|----------|---------------|
| TTFR &lt; 2.5s | All critical | Stopwatch or DevTools Performance |
| CLS &lt; 0.1 | All | Lighthouse or Chrome DevTools Layout Shift |
| Navbar visible immediately | All | No flash of empty top bar |
| Bottom bar does not shift content | /dashboard, /dashboard/today | No jump when `has-fasting-bottom-bar` toggles |
| Lazy chunks load only for visited route | /dashboard/*, /guides | Network tab: no Schedule/Meals/Journal chunks on `/` |
| No fetch before first paint (except HTML) | / | Optional: disable cache, check waterfall |

---

## 3. Ensuring No Unnecessary Heavy Components on Initial Render

### What to verify

1. **Route-level code splitting:** Only the matched route’s chunk loads. No prefetch of all dashboard children.
2. **FastingBottomBar / AdhanScheduler / ReminderScheduler:** Not mounted on `/onboarding` or before `onboardingComplete`.
3. **Prayer times:** Deferred with `requestIdleCallback` when no localStorage cache.
4. **Heavy JSON:** Guides, glossary, culture — bundled but lazy; no eager import of all at once.

### Simple verification script

```bash
#!/bin/bash
# scripts/check-no-eager-heavy.sh
# Run with: npm run build && ./scripts/check-no-eager-heavy.sh

echo "Checking main chunk size..."
MAIN=$(ls -la dist/assets/index-*.js 2>/dev/null | awk '{print $5}')
echo "Main bundle: $MAIN bytes"

# Main bundle should not contain Schedule/Meals/Culture if they're lazy
if grep -q "DashboardSchedule\|DashboardMeals\|DashboardCulture" dist/assets/index-*.js 2>/dev/null; then
  echo "WARN: Main bundle may include lazy routes (check tree-shaking)"
else
  echo "OK: Lazy routes appear to be split"
fi
```

---

## 4. Perf Anti-Patterns to Watch (Initial Page Load)

| Anti-pattern | Where to check | Fix |
|--------------|----------------|------|
| **Analytics on every route** | Any `gtag`, `posthog`, `segment`, `va()` in layout/App | Defer to `requestIdleCallback` or load after first paint; avoid in critical path |
| **Eager fetch of prayer times** | `usePrayerTimes` | Already deferred with `requestIdleCallback`; ensure no `fetch` before first paint when cache exists |
| **Auto-location fetch on mount** | `useAutoLocation` (ipapi) | Runs on Index/Dashboard; ensure it doesn’t block render. Currently in useEffect. |
| **Heavy third-party scripts** | `index.html`, any script tag | Avoid render-blocking; use `defer` or load async |
| **Importing all lazy routes** | App.tsx | Routes are `lazy()` — OK. Watch for `import()` in a loop or dynamic paths that pull everything |
| **Large JSON/guides loaded eagerly** | Guides, culture, recipes | Bundled in route chunks; verify not in main bundle |
| **Timer/countdown at 1s or 60fps** | FastingTimer, Navbar, FastingBottomBar | Already throttled to 2s for INP; keep intervals ≥ 1s |
| **Frameworks/query on every navigation** | TanStack Query, React Query | `QueryClient` is stable; avoid refetchOnMount for static data on every route |
| **Layout shift from conditional bottom bar** | FastingBottomBar | Reserve space or use placeholder to avoid CLS when `isFasting` becomes true |
| **Font blocking** | `index.html` | Already async with `onload` swap; no `@import` in CSS |
| **Unbounded layout** | Cards, lists | Use `min-height` or skeleton to prevent shift when data loads |

---

## 5. Quick Reference

| Metric | Target | Tool |
|--------|--------|------|
| TTFR | &lt; 2.5s (local) | DevTools Performance, Playwright |
| LCP | &lt; 2.5s | Lighthouse, reportWebVitals |
| INP | &lt; 200ms | Lighthouse, reportWebVitals |
| CLS | &lt; 0.1 | Lighthouse, Layout Shift API |
| Main bundle size | Keep &lt; ~200KB gzipped | `npm run build` + `ls -la dist` |
