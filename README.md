# TryRamadan.app 🌙

> A culturally immersive wellness app for non-Muslims to experience Ramadan fasting through progressive programs, cultural education, and interfaith understanding.

**Live URL**: [https://tryramadan.app](https://tryramadan.app)

---

## ✨ What's New

- **User Guides (/guides)** – Step-by-step guides for every flow (onboarding, dashboard, today, schedule, prayers, meals, learn, progress, journal, health, settings). Quick links to app sections, arrow-key navigation, SEO & HowTo schema. Add screenshots to `public/guide-assets/`.
- **Fasting tag & bottom bar** – When you’re fasting, the navbar shows a **Fasting · X days** tag and (on mobile) a **bottom bar** with Iftar countdown and quick actions: Today, Meals, Break fast.
- **Prayer times per day** – Main timer and “today” views refetch prayer times when the date changes (e.g. after midnight). Schedule and day view use prayer times for the selected day.
- **Suhoor & Iftar reminders** – Notifications X minutes before Imsak (suhoor end) and Maghrib (iftar). Configurable in **Settings** (on/off and “minutes before”). Uses today’s prayer times; reminders fire when the app is open.
- **Break fast with reason** – When breaking a fast, choose a predetermined reason (e.g. illness, travel, ate by mistake). Stored in the fasting log.
- **Goals until Ramadan** – Pre-Ramadan checklist (e.g. read Quran, give charity). Countdown and manage goals at `/dashboard/goals`.
- **Journal** – Mood (1–5), write for any date, calendar of entries, export journal as JSON.
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
- **Location Setup (/onboarding/location):** Set location for accurate prayer/fasting times with address lookup and dropdown selection
- **Schedule Builder (/onboarding/schedule):** Customize fasting schedule and progression plan (12-hour, 16-hour, 18-hour, or full fasting)
- **Notification Preferences (/onboarding/notifications):** Set up suhoor, iftar, and hydration reminders
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
- **📅 Ramadan Countdown** - Shows days until Ramadan with Hijri calendar integration (multi-year via `lib/ramadan.ts`)
- **⭐ Sunnah Fasting Indicators** - Highlights Monday/Thursday fasting and Ayyam al-Beed (13th-15th lunar)
- **📊 Progress Tracking** - Track completed fasting days with streak counters, fasting log (with optional break reason), and visual progress
- **🔔 Notifications** - **Suhoor & Iftar reminders** (X minutes before Imsak/Maghrib; configurable in Settings). **Adhan at prayer times** (Fajr, Dhuhr, Asr, Maghrib, Isha) with optional sound. All use today’s prayer times.
- **📱 PWA Support** - Install as a native app, works offline
- **📖 User Guides (/guides)** - Step-by-step guides for all flows; quick links to app sections; arrow-key navigation; SEO & HowTo schema
- **🎯 Goals until Ramadan** - Pre-Ramadan checklist with countdown; add/complete goals (e.g. read Quran, give charity) at `/dashboard/goals`
- **📆 Add to calendar & export .ics** - Quick-add Suhoor, Iftar, Fajr, Dhuhr, Asr, Maghrib, Isha, Taraweeh, “Get food,” and custom events per day. Export **This month**, **Next 30 days**, or **Ramadan** as .ics for Google Calendar, Apple Calendar, or Outlook

### Educational Content
- **📚 Daily Hadith** - Curated hadith about fasting from authentic sources
- **🌍 Cultural Traditions** - Explore Ramadan customs from 20+ countries
- **🍽️ Recipes** - Traditional Suhoor and Iftar recipes from various cultures
- **📖 Fasting Rules** - Comprehensive guide to Islamic fasting etiquette, with **sources**: Quran (Surah Al-Baqarah 2:183–187) and Hadith (Sahih al-Bukhari, Sahih Muslim, Book of Fasting) linked
- **💪 Health Benefits** - Science-backed benefits of intermittent fasting

### User Experience
- **🎯 Onboarding** - Multi-step flow (welcome, mode, knowledge, health, location, schedule, notifications, goals); **works locally** with defensive merge for preferences/notifications
- **🔄 Progressive Programs** - Three fasting tracks: Beginner (12h), Intermediate (16h), Full Ramadan
- **💾 Local Storage** - All preferences, progress, calendar events, journal, and notification settings saved locally
- **🌐 Bilingual** - English and Arabic (hover for translations). **Tooltips** on Suhoor, Iftar, Fajr, Maghrib, etc. (see `data/eating-times-tooltips.ts`) for learning.
- **🎨 Design** - Islamic-inspired aesthetics with emerald, gold, and burgundy palette; mobile-first with safe areas and touch targets
- **📓 Journal** - Mood (1–5), date picker to write for any day, calendar showing days with entries, export journal as JSON
- **📅 Robust calendar** - Shared Ramadan dates (2024–2031), “Go to Ramadan” and “Go to today” next to date on Dashboard, journal-entry dots on calendar days
- **🌙 Fasting bar (mobile)** - When fasting, bottom bar shows Iftar countdown and quick links (Today, Meals, Break). Navbar shows “Fasting · X days” tag.

---

## 📋 Recommendations & To-Do

**To get the most out of TryRamadan:**

1. **Set your location** (Settings → Location) so prayer times, Suhoor/Iftar times, and **calendar export** use your timezone and coordinates.
2. **Complete onboarding** (mode, knowledge, health, location, schedule, notifications, goals) for a personalized dashboard and reminders.
3. **Notifications** – Enable browser notifications, then in **Settings** turn on Suhoor and Iftar reminders and set "minutes before" (e.g. 30 min before suhoor end, 15 min before iftar). Reminders use today's prayer times and fire when the app is open.
4. **Export your calendar** – On Schedule, use “Export to calendar” → choose **This month**, **Next 30 days**, or **Ramadan** to download an .ics file. Import it into Google Calendar, Apple Calendar, or Outlook to see Suhoor, Iftar, all prayers, optional Taraweeh, and any events you added.
5. **Quick-add events** – On Schedule, click a day and use “Add to calendar” to add Suhoor, Iftar, prayers, Taraweeh, “Get food,” or custom events. They’re included when you export .ics.
6. **Goals until Ramadan** – Add intentions (e.g. read 1 juz, give charity, prepare recipes) at `/dashboard/goals` and check them off before Ramadan.
7. **Journal** – Use the reflection journal for daily prompts, mood, and gratitude; export your entries (JSON) from the Journal page if you want a backup.
8. **User Guides** – Visit `/guides` for step-by-step guides to every flow; use quick links to jump into the app.
9. **Tooltips** – Hover over Suhoor, Iftar, Fajr, Maghrib, and related labels on Dashboard and Today for short explanations in English and Arabic.

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
src/
├── assets/
├── components/       # Navbar, Footer, FastingTimer, FastingBottomBar, ReminderScheduler, AdhanScheduler,
│                     # LocationSearch, GoalsUntilRamadanCard, BreakFastReasonDialog, etc.
├── contexts/         # OnboardingContext
├── data/             # JSON + guides.ts: cultural-traditions, fasting-programs, glossary, hadiths, recipes,
│                     # ramadan-info, eating-times-tooltips, guides (user flows)
├── hooks/            # useLocalStorage (preferences, progress, notifications, calendar, journal, goals),
│                     # useLocation, useNotifications, usePrayerTimes (per-day refresh), usePrayerTimesForDate
├── lib/              # utils, ramadan (date helpers), ical (build + download .ics)
├── pages/            # Index, Dashboard, DashboardToday, DashboardSchedule, Guides, GuidePage, Onboarding*, etc.
└── index.css
public/
└── guide-assets/     # Optional: add screenshots/GIFs for user guides (see README there)
```

---

## 📄 License

MIT License. Built with ❤️ by [ummah.build](https://ummah.build).
