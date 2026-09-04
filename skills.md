# TryRamadan – skills and conventions

Monorepo note: application paths below are relative to `apps/web`; shared calendar implementation is now in `packages/core/src/ramadan.ts`. Expo lives in `apps/mobile`.

New workflows: `.cursor/skills/expo-monorepo/SKILL.md` for cross-platform maintenance and `.cursor/skills/sunni-content-review/SKILL.md` for source-based Sunni editorial review.

This file is a **short index** for developers and AI. Full skills live in **`.cursor/skills/`**; each skill has a `SKILL.md` with frontmatter and detailed guidance.

---

## Quick reference

| When you're… | Use this |
|--------------|----------|
| Changing performance, build, or resources | **tryramadan-project** (this repo: structure, Vite chunks, APIs, data) |
| Changing critical path, images, fonts, layout | **performance-cwv** |
| Editing prayer times, countdown, timezone | **timezone-and-countdown** |
| Editing Ramadan dates, fasting state, streak | **ramadan-calendar-and-fasting-logic** |
| Adding/changing stored state or localStorage | **local-storage-and-persistence** |
| Adding Quran, hadith, glossary, Arabic | **islamic-content-authenticity** |
| Adding culture/recipes content | **culture-recipes-authenticity** |
| Adding tests or fixing test failures | **testing** |
| Adding/changing UI and a11y | **accessibility** |
| Changing onboarding flow | **onboarding-and-re-onboarding** |
| Offline or API failure behavior | **offline-and-degraded-network** |
| Streaks, badges, achievements | **streaks-stats-gamification** |
| Bug reports and regression tests | **qa-bug-reports-and-regression-tests** |

Full list and descriptions: **`.cursor/skills/README.md`**.

---

## Performance and resources (summary)

- **Routes:** Index and Dashboard are in the main bundle; all other routes (including **Dashboard Schedule**) are lazy-loaded with Suspense.
- **Build:** Vite `manualChunks` split framer-motion, recharts, lucide-react into separate chunks; see `vite.config.ts`.
- **APIs:** All base URLs in `src/lib/config.ts`. Prayer times (Aladhan), geocoding (Nominatim), timezone (timeapi), IP location (ipapi), Quran API — all cached via PWA Workbox where applicable.
- **Data:** Static JSON/TS in `src/data/` (hadiths, glossary, recipes, etc.); imported at build time.
- **Docs:** `docs/PERFORMANCE.md` for LCP, INP, CLS and checklist.

---

## Internal-only

- **`marketing/`** — Markdown knowledge base for marketers. Do not link from the app or expose publicly.
- **`docs/`** — Project docs (performance, QA, state machine, etc.). Reference from skills when relevant.
