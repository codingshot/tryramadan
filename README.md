# TryRamadan.app 🌙

> A culturally immersive wellness app for non-Muslims to experience Ramadan fasting through progressive programs, cultural education, and interfaith understanding.

**Live URL**: [https://tryramadan.app](https://tryramadan.app)

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
- **Fasting Schedule (/dashboard/schedule):** Calendar view of entire Ramadan month with past/upcoming fasts, ability to modify schedule, progress visualization
- **Prayer Times (/dashboard/prayers):** Daily prayer times (Fajr, Dhuhr, Asr, Maghrib, Isha) with notifications and prayer tutorials (especially for non-Muslims learning)
- **Meal Planning (/dashboard/meals):** Suhoor and iftar recipe suggestions based on user's region/culture, nutritional information, grocery list generator
- **Progress & Stats (/dashboard/progress):** Visual tracking of fasting days completed, streak achievements, energy levels over time, reflection journal entries
- **Learn (/dashboard/learn):** Educational content hub with daily Ramadan facts, cultural traditions, Islamic terms glossary with hover/click definitions (Arabic-English), articles about fasting benefits
- **Cultural Explorer (/dashboard/culture):** Interactive map showing Ramadan traditions by country, photo galleries, cultural reference materials from JSON data
- **Health Tracker (/dashboard/health):** Daily wellness check-ins, energy level monitoring, hydration tracking, ability to pause or adjust fasting for health reasons
- **Reflection Journal (/dashboard/journal):** Daily gratitude and mindfulness prompts, personal reflection entries, review of past entries
- **Achievements (/dashboard/achievements):** Badge system for milestones, visual progress indicators, celebration of completed fasts

---

## ✨ Implemented Features

### Core Functionality
- **🕐 Smart Fasting Timer** - Real-time countdown to Suhoor and Iftar with live prayer times from Aladhan API
- **📍 Location-Based Prayer Times** - Auto-detect location or search any city for accurate fasting times
- **📅 Ramadan Countdown** - Shows days until Ramadan with Hijri calendar integration
- **⭐ Sunnah Fasting Indicators** - Highlights Monday/Thursday fasting and Ayyam al-Beed (13th-15th lunar)
- **📊 Progress Tracking** - Track completed fasting days with streak counters, fasting log, and visual progress
- **🔔 Push Notifications** - Suhoor and Iftar reminders via Web Notifications API
- **📱 PWA Support** - Install as a native app, works offline

### Educational Content
- **📚 Daily Hadith** - Curated hadith about fasting from authentic sources
- **🌍 Cultural Traditions** - Explore Ramadan customs from 20+ countries
- **🍽️ Recipes** - Traditional Suhoor and Iftar recipes from various cultures
- **📖 Fasting Rules** - Comprehensive guide to Islamic fasting etiquette
- **💪 Health Benefits** - Science-backed benefits of intermittent fasting

### User Experience
- **🎯 Onboarding** - Multi-step flow (welcome, mode, knowledge, health, location, schedule, notifications, goals)
- **🔄 Progressive Programs** - Three fasting tracks: Beginner (12h), Intermediate (16h), Full Ramadan
- **💾 Local Storage** - All preferences and progress saved locally
- **🌐 Bilingual** - English and Arabic (hover for translations)
- **🎨 Design** - Islamic-inspired aesthetics with emerald, gold, and burgundy palette

---

## 🛠️ Tech Stack

- **Frontend**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS + shadcn/ui components
- **Animations**: Framer Motion
- **State**: React Hooks + localStorage
- **APIs**:
  - [Aladhan API](https://aladhan.com/prayer-times-api) - Prayer times
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

---

## 📁 Project Structure

```
src/
├── assets/
├── components/       # Shared UI and feature components
├── data/             # JSON: cultural-traditions, fasting-programs, glossary, hadiths, recipes, ramadan-info
├── hooks/            # useLocalStorage, useLocation, useNotifications, usePrayerTimes
├── lib/
├── pages/            # Route-level pages (Index, Dashboard*, Onboarding*, Learn*, etc.)
└── index.css
```

---

## 📄 License

MIT License. Built with ❤️ by [ummah.build](https://ummah.build).
