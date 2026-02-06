# TryRamadan – Cursor skills

Project-scoped skills for improving and maintaining the app. Use when the task matches the skill description.

| Skill | When to use |
|-------|-------------|
| **tryramadan-project** | Performance, build/Vite, external resources (APIs, config), project structure, localStorage keys; cross-cutting changes. |
| **islamic-content-authenticity** | Adding or editing Quran verses, hadiths, glossary terms, Arabic text; verify sources and wording. |
| **culture-recipes-authenticity** | Fact-check and source culture pages, traditions, and recipes; add hyperlinks; verify authenticity of cultural and culinary content. |
| **timezone-and-countdown** | Changing timer, countdowns, prayer times, or location-based current time; cache-first behavior for today and Ramadan. |
| **tryramadan-testing** | Adding tests, fixing test failures; Vitest, RTL, localStorage, prayer cache, onboarding, a11y. |
| **tryramadan-accessibility** | Adding or changing UI; skip link, focus, aria-live, RTL/Arabic, axe tests. |
| **data-and-config** | Adding APIs, env, or editing hadiths/glossary/cultural data, guides, config. |
| **local-storage-and-persistence** | Adding or changing stored state, onboarding completion, persist before navigation, cache keys. |
| **ramadan-calendar-and-fasting-logic** | Editing Ramadan dates (ramadan.ts), fasting states (completed/skipped/broken), streak, todayOverride, state transitions. |
| **qa-bug-reports-and-regression-tests** | Writing or rewriting bug reports; converting bugs into regression tests; BUG-&lt;AREA&gt;-&lt;ID&gt; naming. |
| **onboarding-and-re-onboarding** | Changing onboarding steps, completion logic, redirect to dashboard, draft vs final preferences. |
| **offline-and-degraded-network** | Adding/changing API usage, caching, or behavior when prayer times/location/timezone APIs fail or are offline. |
| **performance-cwv** | Changing critical path, images, fonts, or layout; LCP, INP, CLS. |
| **streaks-stats-gamification** | Changing streak calculation, excused days, badges, showStreakAndAchievements, non-fasting achievements. |
| **habits-page-and-tracker** | Habits page (/habits), habit data (Quran/hadith), journal habit tracker, habit log (tryramadan-habit-log), hideHabitsFromOnboarding. |

Each skill lives in its own folder with a `SKILL.md` (and optional reference files). Descriptions are in the YAML frontmatter for agent discovery. Docs referenced in skills live in **`docs/`** (e.g. QA-BUG-REPORT-FORMAT-AND-CHECKLIST.md, STATE-TRANSITION-TESTING-FASTING.md, PERFORMANCE.md).
