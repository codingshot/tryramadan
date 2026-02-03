# SEO, AEO, performance & accessibility

Single reference for what was changed, how to maintain it, and checklists for new work. See also: **`docs/ARCHITECTURE-OVERVIEW.md`**, **`docs/SEO-ARCHITECTURE.md`**, **`docs/PERFORMANCE.md`**.

---

## 1. What was changed (this pass)

### Recon
- **`docs/ARCHITECTURE-OVERVIEW.md`** added: routes by type, layouts, shared components, main landmark/skip-link audit.

### SEO & AEO
- **VoluntaryFastingDetail:** `PageSEO` now uses `type="article"` for program detail pages (OG/article consistency).
- Existing work (unchanged): PageSEO og:site_name, 404 no canonical, HeroSection AEO summary + FAQ link, FAQPage + Recipe JSON-LD, internal links. See **`docs/SEO-ARCHITECTURE.md`**.

### Performance
- No code changes this pass. Current state: hero preload + public URL, non-blocking fonts, conditional FastingBottomBar/schedulers, FastingTimer min-height, lazy dashboard routes, prayer-times cache. See **`docs/PERFORMANCE.md`**.

### Accessibility
- **Skip-to-main target:** Every page that has a `<main>` now gives it `id="main-content"` so the Navbar “Skip to main content” link has a valid target on all routes (including Index and NotFound).
- **Index:** Wrapped primary content (Hero through CTASection) in `<main id="main-content">` so the home page has a single main landmark and skip target.
- **NotFound:** Wrapped content in `<main id="main-content">` for consistency.
- **Recipes listing:** Recipe cards changed from a focusable `<div role="link" tabIndex={0} onClick/onKeyDown>` to a real `<Link>` to the recipe URL. Improves semantics, keyboard (Enter), and SEO crawlability; avoids custom “link” without href.
- **FastingTimer:** “Days until Ramadan” control (role="button") now activates on both **Enter** and **Space** for WCAG 2.2 (keyboard activation).

---

## 2. Guidelines for future PRs

- **New routes:** Use **PageSEO** with unique `title` and `description`; set `path` for canonical (omit for 404). Prefer `type="article"` for detail/content pages.
- **New listing/detail pages:** Add JSON-LD where it fits (e.g. FAQPage, Recipe, Article) via **`src/lib/jsonld.ts`**; keep schema in sync with visible content.
- **New images:** LCP candidate: explicit `width`/`height`, `fetchpriority="high"` if above the fold, `decoding="async"`. Below the fold: `loading="lazy"` and dimensions or `aspect-ratio`. See **`docs/PERFORMANCE.md`**.
- **New interactive UI:** Use semantic elements: `<button>` for actions, `<a>`/`<Link>` for navigation. If you use `role="button"`, support both Enter and Space. Avoid clickable `<div>` without role and keyboard handling.
- **New pages with main content:** Use `<main id="main-content" className="main-content">` (and optional `role="main"` / `aria-label`) so the global skip link works.
- **Heavy or route-specific components:** Prefer lazy loading or conditional mounting (e.g. only after onboarding) to keep critical path light.

---

## 3. Checklists

### SEO (on-page)
- [ ] Unique, descriptive `<title>` and meta description (≤160 chars) per route.
- [ ] Canonical URL set via PageSEO `path` for all indexable pages; **not** set on 404.
- [ ] OG and Twitter meta (title, description, image, url) set; og:site_name present.
- [ ] Headings follow a logical hierarchy (one H1 per page, then H2/H3).
- [ ] Internal links to key pages (FAQ, Health, Emergency, etc.) from home and nav.

### AEO (answer engines / structure)
- [ ] Direct-answer style summary near top of key entry pages (e.g. home).
- [ ] JSON-LD where useful: FAQPage (FAQ), Recipe (recipe detail), Article/WebPage for content pages.
- [ ] Schema matches visible content (same Q&A, same recipe name/url, etc.).
- [ ] No duplicate or conflicting schema on the same URL.

### Performance (Core Web Vitals)
- [ ] LCP: Hero/above-fold image has dimensions and high priority; preload if fixed URL in `public/`.
- [ ] Fonts: No render-blocking `@import`; use preload + swap in HTML.
- [ ] CLS: Reserved space (min-height/dimensions) for dynamic content (timers, cards).
- [ ] Non-critical routes or heavy components lazy-loaded or conditionally mounted.
- [ ] External data (e.g. prayer times) cache-first where appropriate.

### Accessibility (WCAG 2.2 AA–oriented)
- [ ] “Skip to main content” target: every page has `<main id="main-content">`.
- [ ] One main landmark per page; optional `aria-label` on main when helpful.
- [ ] Interactive elements are focusable and keyboard-operable (Enter/Space for buttons, Enter for links).
- [ ] Form inputs have associated `<label>` or `aria-label`; no label-less controls.
- [ ] Images: meaningful `alt`; decorative images use `alt=""` or `aria-hidden`.
- [ ] No interactive content that is only clickable (no keyboard path).
- [ ] Custom controls with `role="button"` activate on both Enter and Space.

---

## 4. File reference

| Concern   | Key files |
|----------|-----------|
| SEO      | `src/components/PageSEO.tsx`, `index.html` |
| AEO/JSON-LD | `src/lib/jsonld.ts`, FAQ.tsx, RecipeDetail.tsx, CultureCountry.tsx, GuidePage |
| Perf     | `index.html` (preloads), `src/App.tsx` (FastingAndSchedulers), HeroSection, FastingTimer, `vite.config.ts` |
| A11y     | `src/components/Navbar.tsx` (skip link), all pages with `<main id="main-content">`, Recipes.tsx (Link cards), FastingTimer (keyboard) |
| Architecture | `docs/ARCHITECTURE-OVERVIEW.md` |
