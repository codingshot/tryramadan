# TryRamadan — App architecture overview

Concise map of routes, layouts, and shared components for SEO, performance, and accessibility work.

---

## Stack

- **Build:** Vite 5 + React 18 + TypeScript
- **Routing:** React Router (BrowserRouter, client-side only; no SSR)
- **Meta/head:** Single utility **`PageSEO`** (`src/components/PageSEO.tsx`) — sets `document.title`, meta description, canonical, OG, Twitter, robots via `useEffect` on each page

---

## Routes (by type)

| Type | Paths | Layout | PageSEO |
|------|--------|--------|---------|
| **Home** | `/` | Navbar + sections + Footer | Yes, path `/` |
| **Listing** | `/culture`, `/recipes`, `/programs`, `/guides`, `/personas` | Navbar + main + Footer (where used) | Yes, unique title/desc, canonical |
| **Detail** | `/recipe/:mealType/:id`, `/culture/:countryId`, `/guides/:slug`, `/programs/:slug`, `/personas/:slug` | Navbar + main + Footer | Yes, dynamic title/desc/path |
| **Marketing/utility** | `/faq`, `/health`, `/health-safety`, `/emergency`, `/terms`, `/legal`, `/privacy` | Navbar + main + Footer | Yes |
| **App** | `/dashboard`, `/dashboard/*`, `/settings` | Navbar + main (+ Footer on Dashboard) | Yes |
| **Onboarding** | `/onboarding`, `/onboarding/welcome`, … `goals` | OnboardingLayout (no Navbar/Footer) | Yes, path `/onboarding`, robots noindex |
| **404** | `*` | Minimal (NotFound) | Yes, no path (canonical omitted), robots noindex |

---

## Layouts and templates

- **Default (marketing/content):** Each page composes its own layout; most use **Navbar** + **main** (`.main-content`) + **Footer**.
- **Home (`Index`):** Navbar → HeroSection → FeaturesSection → sections (programs, HealthBenefits, etc.) → CTASection → Footer. No single `<main>` wrapper; sections use `<section id="…">`.
- **Dashboard:** Navbar + `<main id="main-content" className="main-content">` + Footer. Lazy-loaded sub-routes (Schedule, Meals, Progress, Culture, Quran, Macros) use Suspense + PageFallback.
- **Onboarding:** `OnboardingLayout` with Outlet, progress bar, close button; no Navbar/Footer. All steps (welcome → goals) share one PageSEO on the layout.

There is no single “layout component” that wraps all pages; each page imports Navbar/Footer as needed.

---

## Shared components (critical for SEO, perf, a11y)

| Component | Role | Used on |
|-----------|------|--------|
| **Navbar** | Global nav, logo, links, location, time, menu (mobile) | All except Onboarding, NotFound |
| **Footer** | Links, theme switcher, legal, brand | Index, Dashboard, many content pages |
| **PageSEO** | Title, meta, canonical, OG, Twitter | Every key page (see routes) |
| **HeroSection** | LCP hero image, headline, timer, CTAs | Index only |
| **FastingTimer** | Countdown (suhoor/iftar) | HeroSection, possibly elsewhere |
| **FastingBottomBar** | Sticky bar when fasting | Rendered by App when not onboarding and onboarding complete |
| **Dialog / Sheet / Popover** | Modals, drawers | Dashboard, Settings, onboarding |
| **Button, Input, Label** | Forms and CTAs | App-wide (ui/) |

---

## Main landmark and skip link

- **Skip link:** Navbar includes `<a href="#main-content">Skip to main content</a>` (sr-only, focusable).
- **Main ID:** Only **Dashboard** and **DashboardPrayers** set `id="main-content"` on `<main>`. **Index** has no `<main>` and no `#main-content`, so the skip link has no target on the home page. Other pages use `<main className="main-content">` but often without `id="main-content"`.

---

## SEO/AEO assets (existing)

- **PageSEO:** Central; supports title, description, path (canonical), image, type, robots. Already sets og:site_name.
- **JSON-LD:** `src/lib/jsonld.ts` — `buildFAQPageSchema`, `buildRecipeSchema`. FAQ page and RecipeDetail use them; index.html has static WebApplication + FAQPage.
- **Docs:** `docs/SEO-ARCHITECTURE.md`, `docs/PERFORMANCE.md`.

---

## File reference

- **Routes:** `src/App.tsx` (all Route definitions)
- **Meta:** `src/components/PageSEO.tsx`
- **Layouts:** `src/pages/Index.tsx`, `src/pages/Dashboard.tsx`, `src/pages/onboarding/OnboardingLayout.tsx`
- **Global shell:** `App.tsx` — QueryClient, ThemeSync, TooltipProvider, Toaster, BrowserRouter, ScrollToTop, FastingAndSchedulers, KeyboardShortcutsHelp, Routes
