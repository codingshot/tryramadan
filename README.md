# TryRamadan.app 🌙

## Monorepo development

Use Node 22.13+ and npm. Install from the repository root with `npm ci`.

| Workspace | Purpose |
|---|---|
| `apps/web` | Existing React/Vite site, web-only landing page, and full web PWA |
| `apps/mobile` | Expo iOS/Android companion and standalone React Native Web PWA |
| `packages/core` | Shared platform-neutral calendar logic and sourced educational guidance |

```sh
npm run dev                # Existing web app, port 8080
npm run dev:mobile         # Expo; choose Android or iOS
npm run dev:universal      # Expo browser development
npm run build:all          # Web and Expo PWA production builds
npm run typecheck
npm test
npm run test:expo          # Build + browser tests for the Expo PWA
npm run export:native -w @tryramadan/mobile
```

Deploy the existing site from `apps/web/dist` (root Vercel configuration is updated). Deploy the Expo PWA from `apps/mobile/dist` on a **separate origin**, with SPA fallback to `index.html`, HTTPS, and revalidation for `index.html`, `sw.js` and the manifest. Do not replace the full web site with the companion build. Native JS exports go to `apps/mobile/dist-native`, separately from the PWA.

The Expo companion currently provides fasting check-ins, a persistent journal and sourced learning cards; it is **not yet feature-equivalent** to the full web app. Web data remains under existing keys on the existing origin; Expo data is local and separate, with no cross-device or web/native sync. No app-store binaries have been signed or submitted.

See [migration and audit status](docs/MONOREPO-AUDIT.md) for verification, unresolved issues and Sunni editorial-review limitations. Root npm is the supported package manager; previous Bun lockfiles are preserved under `docs/legacy-lockfiles/` for reference only.

The feature inventory below describes the **existing web app**, not native feature parity. Historical `src/`, `public/`, `e2e/` and configuration paths in older docs are now relative to `apps/web` unless otherwise noted.

> **Fast like a Muslim for the holy month of Ramadan.** A culturally immersive wellness app for everyone: progressive fasting, prayer times, cultural education, and interfaith understanding.

**Live URL**: [https://tryramadan.app](https://tryramadan.app)

---

## 📑 Features at a glance

| Area | Features |
|------|----------|
| **Fasting** | Dawn-to-sunset timer, Suhoor/Iftar countdown, “I’m fasting” / “Break fast” with reason, mark day complete (today only), streak & total days, Sunnah (Mon/Thu) & Ayyam al-Beed indicators |
| **Prayer & times** | Location-based prayer times (Aladhan), per-day times, Suhoor/Iftar reminders (configurable mins before), Adhan notifications (Muslim mode), timezone-aware .ics export |
| **Dashboard** | Day selector (arrows + date), compact Ramadan/Sunnah badge, current fast status + countdown, schedule strip (Suhoor end / Iftar), FastingTimer, quick actions (Today, Schedule, Meals, Journal, Prayers, Learn), streak/total/Sunnah stats, day plan & meal fields |
| **Schedule** | Calendar view, meal plans & notes, food log, quick-add events (Suhoor, Iftar, prayers, Taraweeh, custom), export .ics (this month / next 30 / Ramadan) |
| **Content** | Quran reading plan (juz per day, Quran.com), Islamic glossary (Arabic + transliteration), daily hadith & Ramadan facts, **Ramadan habits** (good/bad from Quran & hadith, tags: everyone vs Muslim), fasting rules (Quran 2:183–187 + hadith links), cultural traditions by country, recipes |
| **Onboarding** | Welcome → Mode (Muslim skips knowledge) → Knowledge → Health → Location → Schedule → Notifications → Priorities → Goals (optional habits link); all persisted locally. **Hide habits from onboarding** in Settings. |
| **UX** | User guides (/guides), personas (/personas), keyboard shortcuts (g+d, g+t, g+q, etc.), PWA, mobile bottom bar when fasting, accessibility (skip link, aria-live, focus, axe tests) |
| **Settings** | Location (search + auto-detect), theme, Suhoor/Iftar minutes before, prayer notifications (Muslim only), priorities (learning, culture, Quran, macros), dashboard quick actions order, hide habits from onboarding |

---

## ✨ What's New

- **User Guides (/guides)** – Step-by-step guides for every flow (onboarding, dashboard, today, schedule, prayers, meals, macros, Quran, culture, personas, settings). Quick links to app sections, arrow-key navigation, SEO & HowTo schema. Add screenshots to `public/guide-assets/`.
- **Fasting tag & bottom bar** – When you’re fasting, the navbar shows a **Fasting · X days** tag and (on mobile) a **bottom bar** with Iftar countdown and quick actions: Today, Meals, Break fast.
- **Prayer times per day** – Main timer and “today” views refetch prayer times when the date changes (e.g. after midnight). Schedule and day view use prayer times for the selected day.
- **Suhoor & Iftar reminders** – Notifications X minutes before Imsak (suhoor end) and Maghrib (iftar). Configurable in **Settings** (on/off and “minutes before”). Uses today’s prayer times; reminders fire when the app is open.
- **Break fast with reason** – When breaking a fast, choose a predetermined reason (e.g. illness, travel, ate by mistake). Stored in the fasting log.
- **Goals until Ramadan** – Pre-Ramadan checklist (e.g. read Quran, give charity). Countdown and manage goals at `/dashboard/goals`.
- **Priorities & dashboard** – Onboarding asks how much to learn, culture/recipes, Quran/glossary, macro tracking, and simplify by location. Dashboard quick access and features are prioritized from Settings → Your priorities.
- **Personas (/personas)** – Personas and user journeys based on onboarding flows; each persona has a detail page with journey, resources, and links.
- **Quran & Glossary** – Quran reading plan at `/dashboard/quran`, Islamic glossary at `/dashboard/glossary` and `/learn/glossary`.
- **Macro tracker (/dashboard/macros)** – Plan meals and track calories/protein/carbs/fat; optional per your priorities.
- **Journal** – Mood (1–5), write for any date, **daily habit tracker** (sunnah habits from Quran/hadith, stored locally), calendar of entries, export journal as JSON.
- **Ramadan habits (/habits)** – Good and bad habits from the Quran and hadith: quote first, then source links (Quran.com, Sunnah.com), then explanation. Tagged **Everyone** (non-Muslims too) or **Muslim** (e.g. prayer, Taraweeh). Track sunnah habits daily in the journal.
- **Calendar** – Shared Ramadan dates (multi-year), “Go to Ramadan” and “Go to today” next to date, journal dots on schedule. “This Week” links to full calendar.
- **Add to calendar & export .ics** – Quick-add Suhoor, Iftar, all prayers, Taraweeh, “Get food,” and custom events per day. Export to **Google Calendar, Apple Calendar, or Outlook** (This month, Next 30 days, or Ramadan).
- **Fasting rules sources** – Quran (Surah Al-Baqarah 2:183–187) and Hadith (Bukhari, Muslim Book of Fasting) linked on the fasting rules section.
- **Settings & onboarding** – All work locally; preferences and notification settings merge with defaults. Suhoor/iftar “minutes before” (5–120) in Settings.
- **Mobile & accessibility** – Safe-area padding, touch targets (44px), responsive grids, footer links to proper routes. Profile icon on mobile is to the right of the hamburger menu.

---

## Product Specification

### Onboarding Flow

- **Welcome (/onboarding/welcome):** Introduction to the app and what to expect
- **Mode Selection (/onboarding/mode):** Choose between "Non-Muslim Mode" (learning focus) or "Muslim Mode" (full religious observance support)
- **Knowledge Assessment (/onboarding/knowledge):** Quick quiz to gauge existing knowledge about Islam and Ramadan for personalized content
- **Health Screening (/onboarding/health):** Medical questionnaire to identify contraindications and provide safety warnings
- **Location Setup (/onboarding/location):** Set location for accurate prayer/fasting times (required); address search and IP auto-detect
- **Schedule (/onboarding/schedule):** Full Ramadan fast (dawn to sunset); voluntary Sunnah fasting (Mon/Thu, Ayyam al-Beed) available in the app
- **Notification Preferences (/onboarding/notifications):** Set up suhoor, iftar, and hydration reminders
- **Priorities (/onboarding/priorities):** Choose how much to learn, culture & recipes, Quran & glossary, macro tracking, and simplify by location
- **Goals & Intentions (/onboarding/goals):** Set personal goals and intentions for the fasting journey

### Main App Dashboard (Authenticated)

- **Dashboard Home (/dashboard):** Overview of current fasting status, today's schedule, streak counter, daily Ramadan fact, quick access to key features
- **Today's Fast (/dashboard/today):** Detailed view of current fast with countdown timers, progress bar, energy level check-in, emergency break fast button
- **Fasting Schedule (/dashboard/schedule):** Calendar view of entire Ramadan month with past/upcoming fasts, meal plans, notes, food log, **quick-add calendar events** (Suhoor, Iftar, prayers, Taraweeh, get food, custom), and **export to .ics** for Google/Apple/Outlook
- **Prayer Times (/dashboard/prayers):** Daily prayer times (Fajr, Dhuhr, Asr, Maghrib, Isha) with notifications and prayer tutorials (especially for non-Muslims learning)
- **Meal Planning (/dashboard/meals):** Suhoor and iftar recipe suggestions based on user's region/culture, nutritional information, grocery list generator
- **Progress & Stats (/dashboard/progress):** Visual tracking of fasting days completed, streak achievements, energy levels over time, reflection journal entries
- **Learn (/dashboard/learn):** Educational content hub with daily Ramadan facts, cultural traditions, Islamic terms glossary with hover/click definitions (Arabic-English), articles about fasting benefits
- **Cultural Explorer (/dashboard/culture):** Interactive map showing Ramadan traditions by country, photo galleries, cultural reference materials from JSON data
- **Health Tracker (/dashboard/health):** Daily wellness check-ins, energy level monitoring, hydration tracking, ability to pause or adjust fasting for health reasons
- **Reflection Journal (/dashboard/journal):** Daily gratitude and mindfulness prompts, **mood (1–5)**, **write for any date**, **calendar of entries**, **export journal (JSON)**, review and edit past entries
- **Goals until Ramadan (/dashboard/goals):** Pre-Ramadan countdown, add/complete goals (e.g. read Quran, give charity), manage checklist
- **Achievements (/dashboard/achievements):** Badge system for milestones, visual progress indicators, celebration of completed fasts

---

## ✨ Implemented Features

### Core Functionality
- **🕐 Smart Fasting Timer** - Real-time countdown to Suhoor and Iftar with live prayer times from Aladhan API. **Prayer times refresh per day** (refetch when date changes, e.g. after midnight).
- **📍 Location-Based Prayer Times** - Auto-detect location or search any city for accurate fasting times. Today’s times and selected-day times (Schedule, Dashboard day view) use the correct date.
- **📅 Ramadan Countdown** - Shows days until **upcoming Ramadan** (multi-year via `lib/ramadan.ts`); no hardcoded year
- **⭐ Sunnah Fasting Indicators** - Highlights Monday/Thursday fasting and Ayyam al-Beed (13th-15th lunar)
- **📊 Progress Tracking** - Track completed fasting days with streak counters, fasting log (with optional break reason), and visual progress
- **🔔 Notifications** - **Suhoor & Iftar reminders** (X minutes before Imsak/Maghrib; configurable in Settings). **Adhan at prayer times** (Fajr, Dhuhr, Asr, Maghrib, Isha) with optional sound. All use today’s prayer times.
- **📱 PWA Support** - Install as a native app, works offline
- **📖 User Guides (/guides)** - Step-by-step guides for all flows; quick links to app sections; arrow-key navigation; SEO & HowTo schema
- **🎯 Goals until Ramadan** - Pre-Ramadan checklist with countdown; add/complete goals (e.g. read Quran, give charity) at `/dashboard/goals`
- **📆 Add to calendar & export .ics** - Quick-add Suhoor, Iftar, Fajr, Dhuhr, Asr, Maghrib, Isha, Taraweeh, “Get food,” and custom events per day. Export **This month**, **Next 30 days**, or **Ramadan** as .ics for Google Calendar, Apple Calendar, or Outlook

### Educational Content
- **📋 Ramadan Habits (/habits)** - Good and bad habits from the Quran and hadith: each habit shows **quote first**, then **source links** (Quran.com, Sunnah.com), then explanation. Tagged **Everyone** (applies to non-Muslims trying Ramadan) or **Muslim** (e.g. neglecting prayer, Taraweeh). Comprehensive list with SEO-optimized page.
- **📚 Daily Hadith** - Curated hadith about fasting from authentic sources
- **🌍 Cultural Traditions** - Explore Ramadan customs from 20+ countries
- **🍽️ Recipes** - Traditional Suhoor and Iftar recipes from various cultures
- **📖 Fasting Rules** - Comprehensive guide to Islamic fasting etiquette, with **sources**: Quran (Surah Al-Baqarah 2:183–187) and Hadith (Sahih al-Bukhari, Sahih Muslim, Book of Fasting) linked
- **💪 Health Benefits** - Science-backed benefits of intermittent fasting

### User Experience
- **🎯 Onboarding** - Multi-step flow (welcome, mode, knowledge, health, location, schedule, notifications, **priorities**, goals); **works locally** with defensive merge for preferences/notifications
- **🔄 Fasting path** - Onboarding: Full Ramadan only. Voluntary Sunnah fasting (Mon/Thu, Ayyam al-Beed) and settings in app; choose Muslim/Non-Muslim mode in Settings.
- **💾 Local Storage** - All preferences, progress, calendar events, journal, and notification settings saved locally
- **🌐 Bilingual** - English and Arabic (hover for translations). **Tooltips** on Suhoor, Iftar, Fajr, Maghrib, etc. (see `data/eating-times-tooltips.ts`) for learning.
- **🎨 Design** - Islamic-inspired aesthetics with emerald, gold, and burgundy palette; mobile-first with safe areas and touch targets
- **📓 Journal** - Mood (1–5), date picker to write for any day, **daily habit tracker** (check off sunnah habits per day, stored in `tryramadan-habit-log`), calendar showing days with entries, export journal as JSON
- **📅 Robust calendar** - Shared Ramadan dates (2024–2031), “Go to Ramadan” and “Go to today” next to date on Dashboard, journal-entry dots on calendar days
- **🌙 Fasting bar (mobile)** - When fasting, bottom bar shows Iftar countdown and quick links (Today, Meals, Break). Navbar shows “Fasting · X days” tag.

---

## 📋 Recommendations & To-Do

**To get the most out of TryRamadan:**

1. **Set your location** (Settings → Location) so prayer times, Suhoor/Iftar times, and **calendar export** use your timezone and coordinates.
2. **Complete onboarding** (mode, knowledge, health, **location required**, schedule, notifications, priorities, goals) for a personalized dashboard and reminders.
3. **Notifications** – Enable browser notifications, then in **Settings** turn on Suhoor and Iftar reminders and set "minutes before" (e.g. 30 min before suhoor end, 15 min before iftar). Reminders use today's prayer times and fire when the app is open.
4. **Export your calendar** – On Schedule, use “Export to calendar” → choose **This month**, **Next 30 days**, or **Ramadan** to download an .ics file. Import it into Google Calendar, Apple Calendar, or Outlook to see Suhoor, Iftar, all prayers, optional Taraweeh, and any events you added.
5. **Quick-add events** – On Schedule, click a day and use “Add to calendar” to add Suhoor, Iftar, prayers, Taraweeh, “Get food,” or custom events. They’re included when you export .ics.
6. **Goals until Ramadan** – Add intentions (e.g. read 1 juz, give charity, prepare recipes) at `/dashboard/goals` and check them off before Ramadan.
7. **Journal** – Use the reflection journal for daily prompts, mood, and gratitude; export your entries (JSON) from the Journal page if you want a backup.
8. **User Guides** – Visit `/guides` for step-by-step guides to every flow; use quick links to jump into the app.
9. **Tooltips** – Hover over Suhoor, Iftar, Fajr, Maghrib, and related labels on Dashboard and Today for short explanations in English and Arabic.
10. **Personas** – Visit `/personas` to see user personas and journeys; each has a detail page with onboarding flow and related resources.
11. **Your priorities** – In Settings, adjust learning, culture, Quran, macro tracking, and “simplify by location”; use “Apply to dashboard quick access” (or configure from Schedule) to reorder dashboard links.

**Developer to-do (from README):**

- [ ] **Guide screenshots** – Add screenshots/GIFs to `public/guide-assets/` (see `public/guide-assets/README.md` for naming: e.g. `onboarding-welcome.png`, `dashboard-overview.png`, `schedule-calendar.png`). Guides fall back to placeholder if missing.
- [ ] **expected.md** – Run verification checklist (§10) after changes: routes, onboarding order, data files, daily missions, location required, `npm test -- --run`, `npm run build`.
- [ ] **Location/cities** – Optionally add or align cities in `cities.json` (project root) for location search and culture country backfill.

---

## 🔧 Room for improvement

Ongoing and future work (see also `improvement.md`):

- **Code quality** – Resolve remaining `react-hooks/exhaustive-deps` warnings where safe; enable `strictNullChecks` in TypeScript for stronger type safety (broader changes).
- **Content** – Use the **Islamic content authenticity** skill (`.cursor/skills/islamic-content-authenticity/`) when adding or editing Quran verses, hadith, or Arabic: verify verse refs and wording (Quran.com / api.quran.com), hadith source and grading (Sunnah.com), and Arabic/transliteration consistency (glossary, tooltips).
- **Guides & UX** – Add real screenshots to guide-assets; expand tests for dashboard and critical paths; improve loading/error states where needed. **Dashboard layout** – See **`docs/UX-DASHBOARD-LAYOUT-AND-CARD-DESIGN.md`** for what’s visible at a glance, hierarchy (visual vs. actual importance), proposed re-order, and “perfect day” vs “messy day” examples.
- **QA strategy** – See **`docs/QA-TESTING-STRATEGY-AND-LEARNING-PLAN.md`** for testing layers (unit, integration, E2E, exploratory, a11y, performance), coverage model (must-have vs sampled), and a 30‑day learning plan to own quality.
- **i18n** – No full app translation yet; tooltips and glossary already support Arabic snippets.
- **Backend** – App is fully client-side (localStorage); optional future: sync progress/settings across devices (account, API).
- **Accessibility** – axe-core runs in tests; manual screen-reader and keyboard passes on new flows recommended.
- **Performance** – Lazy routes and prayer-time caching in place; further code-splitting or bundle analysis if needed.

---

## 🛠️ Tech Stack

- **Frontend**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS + shadcn/ui components
- **Animations**: Framer Motion
- **State**: React Hooks + localStorage
- **APIs**:
  - [Aladhan API](https://aladhan.com/prayer-times-api) - Prayer times (daily + calendar/month for .ics export)
  - [Nominatim/OpenStreetMap](https://nominatim.openstreetmap.org) - Location search
  - [ipapi.co](https://ipapi.co) - IP geolocation
- **PWA**: vite-plugin-pwa with Workbox

---

## 🚀 Getting Started

```bash
git clone https://github.com/your-username/tryramadan.git
cd tryramadan
npm install
npm run dev
```

- **Build**: `npm run build`
- **Preview**: `npm run preview`
- **Tests**: `npm run test`

---

## 📁 Project Structure

```
.cursor/skills/
└── islamic-content-authenticity/   # Skill: verify Quran quotes, hadith sources, Arabic translations
src/
├── assets/
├── components/       # Navbar, Footer, FastingTimer, FastingBottomBar, ReminderScheduler, AdhanScheduler,
│                     # LocationSearch, GoalsUntilRamadanCard, BreakFastReasonDialog, etc.
├── contexts/         # OnboardingContext
├── data/             # JSON + guides.ts: cultural-traditions, fasting-programs, glossary, hadiths, recipes,
│                     # ramadan-info, eating-times-tooltips, guides (user flows)
├── hooks/            # useLocalStorage (preferences, progress, notifications, calendar, journal, goals),
│                     # useLocation, useNotifications, usePrayerTimes (per-day refresh), usePrayerTimesForDate
├── lib/              # utils, ramadan (date helpers), ical (build + download .ics), quran (api.quran.com)
├── pages/            # Index, Dashboard, DashboardToday, DashboardSchedule, Guides, GuidePage, Onboarding*, etc.
└── index.css
public/
└── guide-assets/     # Optional: add screenshots/GIFs for user guides (see README there)
```

---

## 📄 License

MIT License. Built with ❤️ by [ummah.build](https://ummah.build).
