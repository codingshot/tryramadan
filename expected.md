# TryRamadan.app — Expected Outline

This document outlines the structure, features, and expected behavior of the TryRamadan application.

---

## 1. Project overview

- **Name:** TryRamadan.app  
- **Purpose:** A web app for experiencing Ramadan-style fasting (dawn to sunset), aimed at both Muslims and non-Muslims. It provides prayer times, fasting timer, meal planning, daily missions, culture/recipes, and learning content.
- **Stack:** React 18, TypeScript, Vite, React Router, Tailwind CSS, Radix UI (shadcn/ui), Framer Motion, TanStack Query. PWA support via vite-plugin-pwa.

---

## 2. Routes

### Public
| Path | Page | Description |
|------|------|-------------|
| `/` | Index | Landing: hero, features, mission, CTA |
| `/culture` | Culture | Country list for Ramadan traditions |
| `/culture/:countryId` | CultureCountry | Country traditions, mosques, map links, SEO |
| `/recipes` | Recipes | Suhoor & Iftar recipe list |
| `/recipe/:mealType/:id` | RecipeDetail | Single recipe with ingredients and steps |
| `/programs` | Programs | Fasting programs (e.g. Full Ramadan) |
| `/guides` | Guides | List of user guides |
| `/guides/:slug` | GuidePage | Single guide |
| `/personas` | Personas | User personas/journeys |
| `/personas/:slug` | PersonaPage | Single persona |
| `/health-safety` | HealthSafety | When to break fast, contraindications |
| `/faq` | FAQ | Frequently asked questions |
| `/emergency` | Emergency | Break fast + medical/resources |
| `/terms` | Terms | Terms of use |
| `/legal` | Legal | Legal info |
| `/privacy` | Privacy | Privacy policy |

### Onboarding (required before dashboard)
| Path | Page | Description |
|------|------|-------------|
| `/onboarding` | OnboardingLayout | Wrapper with steps |
| `/onboarding/welcome` | OnboardingWelcome | Welcome |
| `/onboarding/mode` | OnboardingMode | New / Muslim |
| `/onboarding/knowledge` | OnboardingKnowledge | Five Pillars question |
| `/onboarding/health` | OnboardingHealth | Health screening |
| `/onboarding/location` | OnboardingLocation | City + auto-detect (required) |
| `/onboarding/schedule` | OnboardingSchedule | Fasting schedule (Full Ramadan only) |
| `/onboarding/notifications` | OnboardingNotifications | Reminders |
| `/onboarding/priorities` | OnboardingPriorities | Learning, culture, Quran, macros |
| `/onboarding/goals` | OnboardingGoals | Goals until Ramadan |

### Dashboard (post-onboarding)
| Path | Page | Description |
|------|------|-------------|
| `/dashboard` | Dashboard | Main hub: timer, I'm fasting / Break my fast, schedule strip, timeline, missions, day plan, quick access |
| `/dashboard/today` | DashboardToday | Today's fast status, timer, Suhoor/Iftar countdowns, hydration, mark complete / break fast |
| `/dashboard/schedule` | DashboardSchedule | Calendar, daily goals, quick actions, export .ics, day detail (notes, events, meal plan, food log, macros), timeline |
| `/dashboard/prayers` | DashboardPrayers | Prayer times, Hijri date, per-prayer notifications, Adhan section |
| `/dashboard/meals` | DashboardMeals | Suhoor/Iftar recipes, add to today's schedule |
| `/dashboard/learn` | DashboardLearn | Daily fact, hadith, quiz, links |
| `/dashboard/progress` | DashboardProgress | Progress ring, streak, completed days, hours fasted |
| `/dashboard/culture` | DashboardCulture | Culture overview |
| `/dashboard/health` | DashboardHealth | Wellness, symptoms |
| `/dashboard/journal` | DashboardJournal | Journal entries |
| `/dashboard/achievements` | DashboardAchievements | Badges / achievements |
| `/dashboard/goals` | DashboardGoals | Goals until Ramadan |
| `/dashboard/quran` | DashboardQuran | Quran link |
| `/dashboard/macros` | DashboardMacros | Macro tracker |
| `/dashboard/glossary` | LearnGlossary | Glossary terms |

### Learn
| Path | Page | Description |
|------|------|-------------|
| `/learn/glossary` | LearnGlossary | Same as dashboard glossary |
| `/learn/hadith` | LearnHadith | Hadith collection (marks “read hadith” for daily missions) |

### Settings & catch-all
| Path | Page | Description |
|------|------|-------------|
| `/settings` | Settings | Preferences, location, notifications, theme |
| `*` | NotFound | 404 page |

---

## 3. Key components

### Fasting & schedule
- **FastingTimer** — Countdown to Suhoor end or Iftar; shows Eating period / Fasting period with tooltips.
- **TodayScheduleTimeline** — Today's key times: Imsak, Fajr, Dhuhr, Asr, Maghrib (Iftar), Isha, optional Taraweeh.
- **DailyMissionsCard** — Today's missions (start fasting, complete/break fast, log Suhoor/Iftar, add note, read hadith) with completion and tooltips.
- **BreakFastReasonDialog** — Reason picker when user breaks fast early.
- **ProgressRing** — Ring with center label (e.g. days completed) and sublabel.

### Dashboard & navigation
- **Navbar** — App nav; shows “You're fasting” when applicable.
- **Footer** — Links (Emergency, Health, Guides, FAQ, Legal, Privacy).
- **GoalsUntilRamadanCard** — Countdown / Ramadan Mubarak + goals list; tooltips for Ramadan, goals, greeting.
- **SunnahFastingBadge** — Badge for Sunnah day (Mon/Thu) or Ayyam al-Beed; tooltips for Sunnah / Ayyam al-Beed.

### Location & prayer
- **PrayerLocationBadge** — Current location; click to update.
- **LocationSearch** / **LocationDisplay** — Search and display for city/coords.
- **AdhanScheduler** — Schedules adhan at prayer times when permission granted.
- **ReminderScheduler** — Suhoor/Iftar and optional prayer reminders.

### Content & UX
- **DailyHadith** — Daily hadith snippet.
- **ArabicHover** / **ArabicTerm** — Arabic text with hover/term behavior.
- **PageSEO** — Per-page meta title/description.
- **PWAInstallBanner** — Prompt to install PWA when applicable.
- **FastingBottomBar** — Bottom bar (e.g. quick nav) when used.

### UI (shadcn)
- **Tooltip**, **Button**, **Card**, **Dialog**, **Select**, **Input**, **Switch**, **Tabs**, etc. under `src/components/ui/`.

---

## 4. Data & content

| File | Purpose |
|------|---------|
| `eating-times-tooltips.ts` | Tooltips for Suhoor, Iftar, Fajr, Maghrib, Dhuhr, Asr, Isha, Imsak, cut-off, break fast, etc. |
| `general-tooltips.ts` | Tooltips for Ramadan, Sunnah, Taraweeh, Laylat al-Qadr, Adhan, I'm fasting, Break my fast, Mark complete, fasting/eating period, goals, Ramadan Mubarak, Ayyam al-Beed, today's missions, Hijri date, prayer times. |
| `cultural-traditions.json` | Country traditions, foods, mosques (with addresses/map links). |
| `daily-facts.json` | Daily Ramadan facts. |
| `hadiths.json` | Hadith list by topic. |
| `glossary.json` | Terms (Sawm, Suhoor, Iftar, Ramadan, etc.) with Arabic and definitions. |
| `guides.ts` | Guide slugs, titles, steps, quick links. |
| `recipes.json` | Suhoor/Iftar recipes with nutrition. |
| `ramadan-info.json` | Ramadan-related info. |
| `fasting-programs.json` | Fasting program definitions. |
| `personas.json` | User personas and journeys. |
| `cities.json` | Cities for location search. |

---

## 5. Hooks & state (localStorage)

- **useUserPreferences** — Theme, location, onboarding complete, mode (new/muslim), priorities, macro tracking, etc.
- **useFastingProgress** — completedDays, fastingLog (startedAt, completedAt, status, brokenReason), sunnahDaysCompleted.
- **useDailyMissions** — Derives today's missions and completion from progress, meal plans, food log, schedule notes, hadith-viewed dates.
- **useDayMealPlans** / **useDayNutrition** / **useDayFoodLog** — Per-day meal plan, nutrition, food log.
- **useCalendarEvents** — Per-day events for .ics export.
- **useDailyGoals** — Daily calorie/macro goals.
- **useDashboardQuickActions** — Order of dashboard quick-access links.
- **usePrayerTimes** / **usePrayerTimesForDate** — Prayer times for location and date.
- **useIftarLabel** / **useIftarLabelShort** — “Iftar” vs “Breaking Fast (Iftar)” by user mode.
- **useHadithViewedDates** / **markHadithViewedToday** — Used for “Read one hadith” mission.
- **Schedule notes** — `tryramadan-schedule-notes` (per-day notes).

---

## 6. Features (expected behavior)

### Fasting flow
- **I'm fasting** — Shown when user has not started fasting today; tap to log “fasting started.” Hidden or disabled once fasting today or day complete.
- **Break my fast** — Shown only when user is fasting today; opens reason dialog and logs break. Not shown when not fasting.
- **Mark complete** — Logs “completed dawn–sunset fast” for the day; tooltip explains meaning.
- **Fasting period / Eating period** — Determined by current time vs Fajr/Maghrib; timer shows countdown to Suhoor end (cut-off) or Iftar; tooltips explain.

### Schedule
- **Today's schedule** — Dashboard shows strip (Suhoor end, Iftar, Fajr, Maghrib) and **TodayScheduleTimeline** (full day order). Schedule page shows same timeline for selected day.
- **Calendar** — Month view with Ramadan days, Sunnah days, Laylat al-Qadr, completed, notes, journal, meal plan indicators.
- **Export .ics** — Month, next 30 days, or Ramadan range; includes prayers and custom events.

### Daily missions
- Six missions: Start fasting, Complete or break fast at Iftar, Log Suhoor, Log Iftar, Add a note for today, Read one hadith.
- Completion is derived from progress, meal plans, food log, schedule notes, hadith-viewed dates.
- Each mission has a tooltip explaining the step; “Read one hadith” is marked when user visits Learn Hadith page.

### Tooltips (non-Muslim friendly)
- **FastingTimer** — Eating period, Fasting period, time-until labels.
- **Dashboard** — Currently fasting / Not fasting, Mark complete.
- **DailyMissionsCard** — Section title and per-mission tips.
- **DashboardPrayers** — Prayer Times title, Hijri date, each prayer name (Fajr, Sunrise, Dhuhr, Asr, Maghrib, Isha), Adhan section.
- **DashboardSchedule** — Ramadan, Sunnah, Laylat al-Qadr (and legend).
- **DashboardToday** — Today's fast, You fasted today, You broke your fast, I fasted today — mark complete, I broke my fast.
- **SunnahFastingBadge** — Sunnah badge, Ayyam al-Beed.
- **GoalsUntilRamadanCard** — Goals until Ramadan, Ramadan Mubarak, days until Ramadan.
- **Eating-times** and **general-tooltips** — Reused across components for consistency.

### Location
- **Required at onboarding** — User must set city or use auto-detect to continue.
- **Prayer times** — From coordinates (Aladhan API or similar); used for timer, schedule, and prayers page.

### Iftar label
- **Muslim mode** — “Iftar” / “iftar.”
- **Non-Muslim mode** — “Breaking Fast (Iftar)” / “breaking fast” (or similar) for clarity.

### Accessibility & UX
- No green-on-green text; primary contrast and muted text used for readability in light/dark theme.
- Buttons/labels use clear touch targets and `cursor-pointer` where appropriate.
- Key terms have tooltips; Arabic shown where relevant (e.g. in tooltips).

---

## 7. Testing

- **Vitest** — Unit and component tests in `src/test/` (e.g. routes, accessibility, main features, user flow, culture data, links, adhan).
- **Expected:** All tests pass; dashboard, schedule, today, prayers, missions, and tooltips behave as described above.

---

## 8. Build & run

- **Install:** `npm install`
- **Dev:** `npm run dev`
- **Build:** `npm run build`
- **Preview:** `npm preview`
- **Test:** `npm test` or `npm run test -- --run`

---

## 9. Summary

TryRamadan is a React + TypeScript PWA that supports:

1. **Onboarding** — Mode, knowledge, health, **required** location, schedule (Full Ramadan), notifications, priorities, goals.
2. **Dashboard** — Fasting timer, I'm fasting / Break my fast (only when relevant), today's schedule strip + timeline, daily missions, day plan, quick access.
3. **Schedule** — Calendar, daily goals, export .ics, per-day notes/events/meal plan/food log/macros, today's timeline for selected day.
4. **Prayers** — Prayer times, Hijri date, per-prayer notifications, Adhan section with tooltips.
5. **Today** — Today's fast status, mark complete / break fast (break fast only when fasting today), countdowns, hydration.
6. **Missions** — Six daily missions with tooltips and completion derived from app state.
7. **Tooltips** — Widespread use of eating-times and general-tooltips so terms (Suhoor, Iftar, Ramadan, Sunnah, etc.) are clear to non-Muslims.
8. **Culture, recipes, guides, emergency, health, legal** — As per routes and data above.

This file serves as the single expected outline for structure, routes, components, data, behavior, and testing.
