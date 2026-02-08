/**
 * User guide flows for TryRamadan. Each guide has steps with optional
 * screenshot/gif paths (place in public/guide-assets/). Quick links
 * jump to the corresponding app page/section.
 */

export interface GuideQuickLink {
  path: string;
  label: string;
  anchor?: string;
}

export interface GuideStep {
  title: string;
  body: string;
  /** Screenshot path (e.g. /guide-assets/onboarding-welcome.png). Mobile-first. */
  image?: string;
  /** Optional GIF path for multi-step animation */
  gif?: string;
  /** Link to open this step's screen in the app */
  quickLink?: GuideQuickLink;
}

export interface Guide {
  slug: string;
  title: string;
  shortDescription: string;
  /** Full description for SEO / AI engines */
  description: string;
  steps: GuideStep[];
  /** Slug of related guides */
  relatedSlugs?: string[];
  /** Section on app this flow belongs to (e.g. onboarding, dashboard) */
  category: "onboarding" | "dashboard" | "learn" | "health" | "settings" | "general";
}

const ASSETS = "/guide-assets";

export const guides: Guide[] = [
  {
    slug: "getting-started",
    title: "Getting Started with TryRamadan",
    shortDescription: "Set up the app in 4 simple steps.",
    description:
      "How to get started with TryRamadan Ramadan fasting app: open the app, start your journey, complete onboarding (welcome, mode, location, prayer times, goals), and reach your dashboard. No account required. Includes suhoor and iftar setup. Optimized for mobile and desktop.",
    category: "onboarding",
    relatedSlugs: ["onboarding-flow", "dashboard-overview"],
    steps: [
      {
        title: "Open the app",
        body: "Visit TryRamadan.app in your browser or open the installed PWA. The home page shows features, programs, and a live fasting timer preview. No sign-up required—everything works in your browser.",
        image: `${ASSETS}/getting-started-home.png`,
        quickLink: { path: "/", label: "Go to Home" },
      },
      {
        title: "Start your journey",
        body: "Tap “Start your journey” to begin, or “I'm Muslim” for a faster path tailored to practicing Muslims. You’ll be taken to the onboarding flow—you can always change preferences later in Settings.",
        image: `${ASSETS}/getting-started-home.png`,
        quickLink: { path: "/onboarding", label: "Go to Onboarding" },
      },
      {
        title: "Complete onboarding",
        body: "Follow the steps: Welcome → Mode (new or Muslim) → Knowledge check → Health disclaimer → Location (for prayer times) → Schedule → Notifications → Priorities → Goals. Tip: Set your location for accurate suhoor and iftar times.",
        image: `${ASSETS}/onboarding-welcome.png`,
        quickLink: { path: "/onboarding", label: "Open Onboarding" },
      },
      {
        title: "Reach the dashboard",
        body: "After onboarding you’ll land on the Dashboard. You’ll see the fasting timer, progress ring, and quick links to Today, Schedule, Prayers, Meals, and more. If you already have location set, you may skip onboarding and go straight to the dashboard.",
        image: `${ASSETS}/dashboard-overview.png`,
        quickLink: { path: "/dashboard", label: "Open Dashboard" },
      },
    ],
  },
  {
    slug: "onboarding-flow",
    title: "Onboarding Flow Guide",
    shortDescription: "Step-by-step walkthrough of every onboarding screen.",
    description:
      "Complete guide to the TryRamadan onboarding flow: welcome, experience mode, knowledge check, health disclaimer, location, Ramadan schedule, notifications, priorities (learning, culture, Quran, macro tracking), and pre-Ramadan goals. Includes quick links to each section.",
    category: "onboarding",
    relatedSlugs: ["getting-started", "dashboard-overview", "settings"],
    steps: [
      {
        title: "Welcome",
        body: "The welcome screen introduces TryRamadan. Tap “Get started” to begin. Muslim users can choose “I'm Muslim” on the home page to skip ahead with pre-selected options.",
        image: `${ASSETS}/onboarding-welcome.png`,
        quickLink: { path: "/onboarding/welcome", label: "Open Welcome" },
      },
      {
        title: "Experience mode",
        body: "Choose “New to Ramadan” or “Muslim”. Muslim mode tailors language (e.g. “Iftar” instead of “break fast”), offers Quran/glossary priorities, and lets you skip the knowledge quiz.",
        image: `${ASSETS}/onboarding-mode.png`,
        quickLink: { path: "/onboarding/mode", label: "Open Mode" },
      },
      {
        title: "Knowledge",
        body: "Answer a few quick questions about fasting. Used only to personalize content. Muslim users can tap “Skip — I already know this” to bypass this step.",
        image: `${ASSETS}/onboarding-knowledge.png`,
        quickLink: { path: "/onboarding/knowledge", label: "Open Knowledge" },
      },
      {
        title: "Health",
        body: "Read the health disclaimer. If you have medical conditions, pregnancy, or take medication, consult a doctor before fasting. Tap “Continue” when ready.",
        image: `${ASSETS}/onboarding-health.png`,
        quickLink: { path: "/onboarding/health", label: "Open Health" },
      },
      {
        title: "Location",
        body: "Set your location for accurate prayer and suhoor/iftar times. Use “Use my location” for GPS, or search for a city. Times are location-based—this step is important for the timer and calendar.",
        image: `${ASSETS}/onboarding-location.png`,
        quickLink: { path: "/onboarding/location", label: "Open Location" },
      },
      {
        title: "Schedule",
        body: "Confirm your Ramadan start date (or pick Full Ramadan, Sunnah fasting, etc.). The app uses this for the 30-day countdown and schedule calendar.",
        image: `${ASSETS}/onboarding-schedule.png`,
        quickLink: { path: "/onboarding/schedule", label: "Open Schedule" },
      },
      {
        title: "Notifications",
        body: "Enable suhoor and iftar reminders if you like. Choose how many minutes before each time to be notified. You can adjust or disable these later in Settings.",
        image: `${ASSETS}/onboarding-notifications.png`,
        quickLink: { path: "/onboarding/notifications", label: "Open Notifications" },
      },
      {
        title: "Priorities",
        body: "Set priorities: Learning depth, Culture & recipes, Quran & glossary, macro tracking, and simplification. This shapes which dashboard cards and features you see first.",
        image: `${ASSETS}/onboarding-priorities.png`,
        quickLink: { path: "/onboarding/priorities", label: "Open Priorities" },
      },
      {
        title: "Goals",
        body: "Set optional pre-Ramadan goals (e.g. learn about Ramadan, adjust sleep, read Quran). Tap “Go to dashboard” when done. Muslim users can tap “Skip — go to dashboard” to finish quickly.",
        image: `${ASSETS}/onboarding-goals.png`,
        quickLink: { path: "/onboarding/goals", label: "Open Goals" },
      },
    ],
  },
  {
    slug: "personas-and-journeys",
    title: "Personas & User Journeys",
    shortDescription: "See who uses TryRamadan and their journeys.",
    description:
      "TryRamadan personas and user journeys: Non-Muslim curious, Muslim observer, health & wellness, culture & food, Quran & learning. Each persona has a detail page with onboarding flow, journey phases, and related resources. Data from personas.json.",
    category: "general",
    relatedSlugs: ["getting-started", "onboarding-flow", "dashboard-overview"],
    steps: [
      {
        title: "Open Personas",
        body: "Visit /personas to see all personas. Each card shows a short journey and key resources; tap “View journey” for the full persona page.",
        quickLink: { path: "/personas", label: "Open Personas" },
      },
      {
        title: "Persona detail page",
        body: "On a persona page you’ll see: journey phases (Discover → Set up → Daily use → …), onboarding steps in order, typical goals, and related resources (Learn, Culture, Recipes, etc.).",
        quickLink: { path: "/personas/non-muslim-curious", label: "Example: Non-Muslim curious" },
      },
      {
        title: "Use it for design or support",
        body: "Personas help align onboarding flows and dashboard with user types. Share persona links when guiding users (e.g. “If you’re here for culture, see Culture & food explorer”).",
        quickLink: { path: "/personas", label: "Back to Personas" },
      },
    ],
  },
  {
    slug: "dashboard-overview",
    title: "Dashboard Overview",
    shortDescription: "Navigate the main dashboard and quick actions.",
    description:
      "TryRamadan dashboard guide: fasting timer and countdown to suhoor/iftar, log fasting, mark day complete, streak, planned meals and Log as eaten, schedule strip, and links to Today, Schedule, Prayers, Meals, Macro Tracker, Learn, Quran, Progress, Culture, Health, Journal, Achievements, and Goals. For Ramadan fasting tracking.",
    category: "dashboard",
    relatedSlugs: ["getting-started", "today-fast", "schedule-calendar", "macro-tracker"],
    steps: [
      {
        title: "Dashboard home",
        body: "The dashboard shows the main fasting timer (suhoor/iftar), your progress ring, and quick action cards.",
        image: `${ASSETS}/dashboard-overview.png`,
        quickLink: { path: "/dashboard", label: "Open Dashboard" },
      },
      {
        title: "Log fasting",
        body: "Tap “I’m fasting today — Log it” to record that you’re fasting. The card then shows “You’re fasting” with start time.",
        quickLink: { path: "/dashboard", label: "Open Dashboard" },
      },
      {
        title: "Mark day complete",
        body: "After breaking fast at iftar, use the “Mark Done” card to mark the day complete. This updates your streak and progress.",
        quickLink: { path: "/dashboard", label: "Open Dashboard" },
      },
      {
        title: "Planned meals and Log as eaten",
        body: "When viewing a day that has a meal plan, you’ll see “Planned for this day” with suhoor and iftar. Tap “Log as eaten” to add the planned meals to your food log in one step, or “Edit on Schedule →” to adjust first.",
        quickLink: { path: "/dashboard", label: "Open Dashboard" },
      },
      {
        title: "This week strip",
        body: "The “This week” strip shows the next 7 days. Tap a day or “View schedule” to open the full calendar.",
        quickLink: { path: "/dashboard/schedule", label: "Open Schedule" },
      },
      {
        title: "Quick links",
        body: "Use the grid to open Today’s Fast, Schedule, Prayers, Meals, Macros (macro tracker), Learn, Quran, Progress, Culture, Health, Journal, Achievements, and Goals.",
        quickLink: { path: "/dashboard", label: "Open Dashboard" },
      },
    ],
  },
  {
    slug: "today-fast",
    title: "Today's Fast & Timer",
    shortDescription: "Track your current fast and use the timer.",
    description:
      "How to use Today’s Fast: view the fasting timer, log fasting, see countdowns to suhoor end and iftar, set intention, track hydration and energy. Location-based prayer times. Mobile-first guide for Ramadan fasting tracking.",
    category: "dashboard",
    relatedSlugs: ["dashboard-overview", "schedule-calendar"],
    steps: [
      {
        title: "Open Today",
        body: "From the dashboard, tap “Today’s Fast” or go to Dashboard → Today. You’ll see the main timer and countdowns.",
        image: `${ASSETS}/today-fast.png`,
        quickLink: { path: "/dashboard/today", label: "Open Today" },
      },
      {
        title: "Fasting timer",
        body: "The timer shows time until iftar (and optionally until suhoor ends). Times are based on your location’s prayer times.",
        quickLink: { path: "/dashboard/today", label: "Open Today" },
      },
      {
        title: "Log fasting",
        body: "Tap “I’m fasting — Log it” to record that you started fasting today. The card updates to show “You’re fasting” and start time.",
        quickLink: { path: "/dashboard/today", label: "Open Today" },
      },
      {
        title: "Intention & hydration",
        body: "Optionally set a daily intention and track glasses of water. Use the energy selector to log how you feel.",
        quickLink: { path: "/dashboard/today", label: "Open Today" },
      },
    ],
  },
  {
    slug: "schedule-calendar",
    title: "Schedule & Calendar",
    shortDescription: "Use the calendar, meal plans, and add events.",
    description:
      "Step-by-step guide to the TryRamadan Schedule page: view the Ramadan calendar, add meal plans for suhoor and iftar, copy meal plans to future days (this week, rest of Ramadan, or selected days), add prayer and custom events, and export to Google Calendar, Apple Calendar, or Outlook. Includes meal planning for Ramadan fasting.",
    category: "dashboard",
    relatedSlugs: ["dashboard-overview", "today-fast", "macro-tracker"],
    steps: [
      {
        title: "Open Schedule",
        body: "From the dashboard, tap “Schedule” or “View schedule”. You’ll see a month calendar with today highlighted.",
        image: `${ASSETS}/schedule-calendar.png`,
        quickLink: { path: "/dashboard/schedule", label: "Open Schedule" },
      },
      {
        title: "Navigate months",
        body: "Use the arrows or “Go to Ramadan” to jump to Ramadan. Days with completed fasts or journal entries may show indicators.",
        quickLink: { path: "/dashboard/schedule", label: "Open Schedule" },
      },
      {
        title: "Add meal plan",
        body: "Select a day, then enter suhoor and iftar plans in the meal plan fields. You can type free text (e.g. “Oats and dates”) or recipe keys. Use “Copy meals from another day” to copy from a day that already has a plan.",
        quickLink: { path: "/dashboard/schedule", label: "Open Schedule" },
      },
      {
        title: "Copy meal plan to future days",
        body: "Once a day has a meal plan, use “Copy to next day”, “Copy to this week” (next 7 days), “Copy to rest of Ramadan”, or “Copy to selected days…” to apply the plan to multiple dates. Pick target days in the dialog and tap Apply.",
        quickLink: { path: "/dashboard/schedule", label: "Open Schedule" },
      },
      {
        title: "Quick-add events",
        body: "Select a day, then use “Suhoor”, “Iftar”, “Prayers”, “Taraweeh”, or “Get food/prepare” to add events based on prayer times.",
        quickLink: { path: "/dashboard/schedule", label: "Open Schedule" },
      },
      {
        title: "Custom events & export",
        body: "Add custom events with a title and time. Use “Export to calendar” to download an .ics file for the month or Ramadan.",
        quickLink: { path: "/dashboard/schedule", label: "Open Schedule" },
      },
    ],
  },
  {
    slug: "prayers",
    title: "Prayer Times & Adhan",
    shortDescription: "View prayer times and manage adhan reminders.",
    description:
      "How to use the Prayers page: see Fajr, Dhuhr, Asr, Maghrib, Isha and Imsak (suhoor end), and how to enable adhan/reminders. Location-based times.",
    category: "dashboard",
    relatedSlugs: ["dashboard-overview", "schedule-calendar"],
    steps: [
      {
        title: "Open Prayers",
        body: "From the dashboard, tap “Prayers”. You’ll see today’s prayer times for your location.",
        image: `${ASSETS}/prayers.png`,
        quickLink: { path: "/dashboard/prayers", label: "Open Prayers" },
      },
      {
        title: "Times explained",
        body: "Imsak is when to stop eating (suhoor); Fajr is when Fajr prayer begins. Maghrib is when to break fast (iftar). Times are location-based.",
        quickLink: { path: "/dashboard/prayers", label: "Open Prayers" },
      },
    ],
  },
  {
    slug: "meal-plan-apply-and-log",
    title: "Apply Meal Plan to Future Days & Log as Eaten",
    shortDescription: "Copy meal plans to future days and log planned meals as eaten.",
    description:
      "TryRamadan meal planning guide: how to copy your suhoor and iftar meal plan to future days (this week, rest of Ramadan, or selected days) and log planned meals as eaten on the Dashboard. Includes Schedule copy options and Dashboard Log as eaten flow for Ramadan meal tracking.",
    category: "dashboard",
    relatedSlugs: ["schedule-calendar", "macro-tracker", "dashboard-overview"],
    steps: [
      {
        title: "Add a meal plan on Schedule",
        body: "Open Schedule, select a day, and enter your suhoor and iftar plans in the meal plan fields. You can type free text (e.g. “Oats and dates”) or recipe keys (e.g. suhoor-1, iftar-2).",
        quickLink: { path: "/dashboard/schedule", label: "Open Schedule" },
      },
      {
        title: "Copy to future days",
        body: "Once a day has a meal plan, use “Copy to next day”, “Copy to this week” (next 7 days), “Copy to rest of Ramadan”, or “Copy to selected days…” to apply the same plan to multiple dates. In “Copy to selected days”, pick target days with checkboxes and tap Apply.",
        quickLink: { path: "/dashboard/schedule", label: "Open Schedule" },
      },
      {
        title: "View planned meals on Dashboard",
        body: "On the Dashboard day view, when you select a day that has a meal plan, you’ll see “Planned for this day” with the suhoor and iftar you planned.",
        quickLink: { path: "/dashboard", label: "Open Dashboard" },
      },
      {
        title: "Log as eaten",
        body: "Tap “Log as eaten” to convert your planned meals into food log entries for that day. Recipe keys become entries with nutrition; plain text becomes custom entries. You can edit portions later on Schedule or Macro Tracker.",
        quickLink: { path: "/dashboard", label: "Open Dashboard" },
      },
      {
        title: "Edit on Schedule",
        body: "If you want to adjust the plan before logging, tap “Edit on Schedule →” to open the Schedule page for that day, edit the meal plan, then return to Dashboard to log as eaten.",
        quickLink: { path: "/dashboard/schedule", label: "Open Schedule" },
      },
    ],
  },
  {
    slug: "meals-recipes",
    title: "Meals & Recipes",
    shortDescription: "Plan suhoor and iftar with suggested recipes.",
    description:
      "Guide to Meals: view daily meal suggestions, open suhoor and iftar recipes, and use the recipe detail page. Links to the main Recipes section.",
    category: "dashboard",
    relatedSlugs: ["dashboard-overview", "recipes-explore"],
    steps: [
      {
        title: "Open Meals",
        body: "From the dashboard, tap “Meals”. You’ll see meal plans for the selected day with suhoor and iftar suggestions.",
        image: `${ASSETS}/meals.png`,
        quickLink: { path: "/dashboard/meals", label: "Open Meals" },
      },
      {
        title: "Recipe cards",
        body: "Tap a recipe card to open the full recipe: ingredients, steps, and tips. Use “Recipes” in the app or footer to browse all recipes.",
        quickLink: { path: "/recipes", label: "Browse Recipes" },
      },
      {
        title: "Add to food log & macro tracker",
        body: "From a recipe card you can add it to today’s food log and meal plan for macro tracking. For full planning and logging (planned vs actual, Suhoor/Iftar/between meals), use the Macro Tracker from the dashboard.",
        quickLink: { path: "/dashboard/macros", label: "Open Macro Tracker" },
      },
    ],
  },
  {
    slug: "learn-glossary-hadith",
    title: "Learn: Glossary & Hadith",
    shortDescription: "Use the Learn section and glossary.",
    description:
      "How to use the Learn section: glossary of Islamic terms, daily hadith, and links to the standalone Glossary and Hadith pages for SEO and deep reading.",
    category: "learn",
    relatedSlugs: ["dashboard-overview", "recipes-explore"],
    steps: [
      {
        title: "Open Learn",
        body: "From the dashboard, tap “Learn”. You’ll see the glossary preview and daily hadith.",
        image: `${ASSETS}/learn.png`,
        quickLink: { path: "/dashboard/learn", label: "Open Learn" },
      },
      {
        title: "Glossary",
        body: "Browse or search terms (e.g. Suhoor, Iftar, Ramadan). The full glossary is also available from the main menu and footer.",
        quickLink: { path: "/learn/glossary", label: "Open Glossary" },
      },
      {
        title: "Hadith",
        body: "Read the daily hadith and explore more on the Hadith page. Linked from footer and Learn.",
        quickLink: { path: "/learn/hadith", label: "Open Hadith" },
      },
    ],
  },
  {
    slug: "progress-goals",
    title: "Progress & Goals",
    shortDescription: "Track progress and pre-Ramadan goals.",
    description:
      "How to view your fasting progress: completed days, streak, fasting log, and badges. Plus managing goals until Ramadan from the dashboard.",
    category: "dashboard",
    relatedSlugs: ["dashboard-overview", "today-fast"],
    steps: [
      {
        title: "Open Progress",
        body: "From the dashboard, tap “Progress”. You’ll see your ring, streak, completed days, and fasting log.",
        image: `${ASSETS}/progress.png`,
        quickLink: { path: "/dashboard/progress", label: "Open Progress" },
      },
      {
        title: "Goals until Ramadan",
        body: "Add and complete pre-Ramadan goals from the dashboard “Goals” card or the Goals page. Great for first-timers.",
        quickLink: { path: "/dashboard/goals", label: "Open Goals" },
      },
    ],
  },
  {
    slug: "journal",
    title: "Journal & Reflection",
    shortDescription: "Use the journal and mood tracking.",
    description:
      "How to use the Journal: pick a date, write entries, set mood and gratitude. View past entries and export. Mobile-friendly.",
    category: "dashboard",
    relatedSlugs: ["dashboard-overview", "today-fast"],
    steps: [
      {
        title: "Open Journal",
        body: "From the dashboard, tap “Journal”. Use the calendar to select a date, then write your entry.",
        image: `${ASSETS}/journal.png`,
        quickLink: { path: "/dashboard/journal", label: "Open Journal" },
      },
      {
        title: "Write & mood",
        body: "Add content, gratitude, and a 1–5 mood. Entries are saved per day. Use “Export journal” to download your data.",
        quickLink: { path: "/dashboard/journal", label: "Open Journal" },
      },
    ],
  },
  {
    slug: "health-safety-emergency",
    title: "Health, Safety & Emergency",
    shortDescription: "When to break fast and where to get help.",
    description:
      "When and how to break your fast safely: use the Emergency page for reassurance and steps, and the Health & Safety page for general guidance. Includes quick link to emergency services.",
    category: "health",
    relatedSlugs: ["today-fast", "settings"],
    steps: [
      {
        title: "Health & Safety",
        body: "Read general health guidance and when to break fast (illness, travel, etc.) on the Health & Safety page. Linked from footer and dashboard.",
        quickLink: { path: "/health-safety", label: "Open Health & Safety" },
      },
      {
        title: "Emergency page",
        body: "If you need to break your fast now, open the Emergency page. It offers reassurance, simple steps (water, light food, rest), and the option to log that you broke your fast.",
        image: `${ASSETS}/emergency.png`,
        quickLink: { path: "/emergency", label: "Open Emergency" },
      },
    ],
  },
  {
    slug: "settings",
    title: "Settings & Preferences",
    shortDescription: "Change location, reminders, and theme.",
    description:
      "How to change settings: location, notification times, theme (light/dark/system), and other preferences. Accessible from footer and dashboard.",
    category: "settings",
    relatedSlugs: ["onboarding-flow", "dashboard-overview"],
    steps: [
      {
        title: "Open Settings",
        body: "Tap “Settings” in the footer or from the dashboard. You’ll see all preference sections.",
        image: `${ASSETS}/settings.png`,
        quickLink: { path: "/settings", label: "Open Settings" },
      },
      {
        title: "Location & notifications",
        body: "Update your location for prayer and suhoor/iftar times. Adjust suhoor and iftar reminder times if notifications are enabled.",
        quickLink: { path: "/settings", label: "Open Settings" },
      },
      {
        title: "Theme",
        body: "Switch between light, dark, or system theme. Changes apply immediately.",
        quickLink: { path: "/settings", label: "Open Settings" },
      },
      {
        title: "Language & region",
        body: "Set your country and UI language (e.g. English, Arabic) for display. Affects date and number formatting and labels.",
        quickLink: { path: "/settings", label: "Open Settings" },
      },
    ],
  },
  {
    slug: "recipes-explore",
    title: "Explore Recipes",
    shortDescription: "Browse suhoor and iftar recipes.",
    description:
      "How to browse the full recipe list: filter by suhoor/iftar, open recipe details, and use the meal planner. Linked from dashboard Meals and footer.",
    category: "general",
    relatedSlugs: ["meals-recipes", "dashboard-overview"],
    steps: [
      {
        title: "Open Recipes",
        body: "From the footer or dashboard Meals, open “Recipes”. You’ll see the full list with filters.",
        quickLink: { path: "/recipes", label: "Open Recipes" },
      },
      {
        title: "Filter and open",
        body: "Filter by Suhoor or Iftar. Tap a recipe to see ingredients, steps, and tips. Use “Meals” in the dashboard for daily suggestions.",
        quickLink: { path: "/recipes", label: "Open Recipes" },
      },
    ],
  },
  {
    slug: "macro-tracker",
    title: "Macro Tracker & Meal History",
    shortDescription: "Plan meals, track macros, view fasting and meal history.",
    description:
      "TryRamadan Macro Tracker guide: plan suhoor and iftar meals, log what you actually eat, track calories and macros (protein, carbs, fat) vs daily goals. Includes fasting history (recent fasts with status), meal history (list or photo feed view), and quick-add from recipes. For Ramadan fasting nutrition and meal logging.",
    category: "dashboard",
    relatedSlugs: ["meals-recipes", "dashboard-overview", "progress-goals", "schedule-calendar"],
    steps: [
      {
        title: "Open Macro Tracker",
        body: "From the dashboard, tap “Macros”. You’ll see the day selector, daily goals, fasting history, and meal history sections.",
        quickLink: { path: "/dashboard/macros", label: "Open Macro Tracker" },
      },
      {
        title: "Fasting history",
        body: "The Fasting history section shows your last 14 fasting log entries: date, time range, and status (Done, Broken, In progress). Tap “Full fasting tracker →” to open the Progress page.",
        quickLink: { path: "/dashboard/macros", label: "Open Macro Tracker" },
      },
      {
        title: "Add to plan",
        body: "Use “Add to plan for this day” to plan what you intend to eat. Choose Suhoor, Iftar, or Between meals; enter name, calories, portions, and optional protein/carbs/fat. Tap “Add to plan”.",
        quickLink: { path: "/dashboard/macros", label: "Open Macro Tracker" },
      },
      {
        title: "Meal prep plan (planned)",
        body: "Your planned items appear under “Meal prep plan (planned)” by meal type. You can remove items. Planned totals are shown at the bottom.",
        quickLink: { path: "/dashboard/macros", label: "Open Macro Tracker" },
      },
      {
        title: "Quick add actual food",
        body: "Under “Actual food eaten (logs)”, tap Suhoor, Iftar, or Between meals to open the quick-add form. Enter what you ate (name, cal, portions, P/C/F) and tap “Add to log”.",
        quickLink: { path: "/dashboard/macros", label: "Open Macro Tracker" },
      },
      {
        title: "Meal history list & feed",
        body: "Meal history shows your logged meals across all days. Switch between List view (date, meal type, calories) and Feed view (entries with photos). Tap an entry to jump to that day.",
        quickLink: { path: "/dashboard/macros", label: "Open Macro Tracker" },
      },
      {
        title: "Day navigation & goals",
        body: "Use the day arrows to view or edit any date. Daily goals are shown at the top; “This day: planned vs actual vs goals” shows progress bars for calories and macros.",
        quickLink: { path: "/dashboard/macros", label: "Open Macro Tracker" },
      },
    ],
  },
  {
    slug: "quran",
    title: "Quran Reading Plan",
    shortDescription: "Follow a day-by-day juz plan with Arabic and translation.",
    description:
      "How to use the Quran page: select a day (1–30), sync with Ramadan day, view the corresponding juz, read a short in-app preview with Arabic and English translation, and open the full juz on Quran.com.",
    category: "dashboard",
    relatedSlugs: ["dashboard-overview", "today-fast"],
    steps: [
      {
        title: "Open Quran",
        body: "From the dashboard, tap “Quran”. You’ll see the day selector and the current juz for that day (Day N / Juz N of 30).",
        quickLink: { path: "/dashboard/quran", label: "Open Quran" },
      },
      {
        title: "Sync with Ramadan day",
        body: "Use “Sync with Ramadan day” to set the selected day to the current Ramadan day. Use the arrows or the 30-day grid to pick any day.",
        quickLink: { path: "/dashboard/quran", label: "Open Quran" },
      },
      {
        title: "In-app preview",
        body: "The page shows a short preview of the juz with Arabic (Uthmani) text and English translation. Scroll to read the first verses.",
        quickLink: { path: "/dashboard/quran", label: "Open Quran" },
      },
      {
        title: "Read on Quran.com",
        body: "Tap “Read on Quran.com” to open the full juz on Quran.com in a new tab for full reading and translation options.",
        quickLink: { path: "/dashboard/quran", label: "Open Quran" },
      },
    ],
  },
  {
    slug: "culture",
    title: "Culture & Traditions",
    shortDescription: "Explore Ramadan traditions by country and recipes.",
    description:
      "How to explore culture: use the dashboard Culture page to see featured countries and traditions, open a country page for traditions and recipes, and browse the main Culture list. Links to Recipes and country-specific content.",
    category: "general",
    relatedSlugs: ["dashboard-overview", "meals-recipes", "recipes-explore"],
    steps: [
      {
        title: "Open Culture",
        body: "From the dashboard, tap “Culture”, or use the main nav/footer “Culture”. You’ll see featured countries and a link to the full culture list.",
        quickLink: { path: "/dashboard/culture", label: "Open Dashboard Culture" },
      },
      {
        title: "Country page",
        body: "Tap a country to open its page: traditions, Ramadan customs, and linked recipes. Use “Back to Culture” to return to the list.",
        quickLink: { path: "/culture", label: "Open Culture" },
      },
      {
        title: "Recipes by culture",
        body: "Recipes can be filtered or linked by country. From a country page you can open individual recipes; from Recipes you can browse by meal type.",
        quickLink: { path: "/recipes", label: "Open Recipes" },
      },
    ],
  },
  {
    slug: "achievements",
    title: "Achievements & Badges",
    shortDescription: "View badges and fasting milestones.",
    description:
      "How to view achievements: open the Achievements page from the dashboard to see badges and milestones (e.g. first fast, streak, completed days). Link to Progress for full fasting log.",
    category: "dashboard",
    relatedSlugs: ["progress-goals", "dashboard-overview"],
    steps: [
      {
        title: "Open Achievements",
        body: "From the dashboard, tap “Achievements”. You’ll see your badges and milestones (e.g. first fast, streaks, days completed).",
        quickLink: { path: "/dashboard/achievements", label: "Open Achievements" },
      },
      {
        title: "Progress & log",
        body: "For your full fasting log, streak, and ring, use the Progress page. Achievements summarizes milestones; Progress shows day-by-day history.",
        quickLink: { path: "/dashboard/progress", label: "Open Progress" },
      },
    ],
  },
  {
    slug: "voluntary-fasting-programs",
    title: "Voluntary Fasting Programs",
    shortDescription: "Full Ramadan and Sunnah voluntary fasting options.",
    description:
      "Guide to TryRamadan fasting programs: Full Ramadan (dawn to sunset), Monday & Thursday, Ayyam al-Beed, Day of Arafah, Six Days of Shawwal. Browse programs, add to your journey, and set your fasting path in Settings.",
    category: "general",
    relatedSlugs: ["getting-started", "onboarding-flow", "settings"],
    steps: [
      {
        title: "Open Programs",
        body: "From the home page or footer, open Fasting Programs (or /programs). You'll see Full Ramadan and voluntary Sunnah options: Monday & Thursday, Ayyam al-Beed, Day of Arafah, Six Days of Shawwal.",
        image: `${ASSETS}/programs.png`,
        quickLink: { path: "/programs", label: "Open Programs" },
      },
      {
        title: "Full Ramadan",
        body: "The main 30-day dawn-to-sunset fast. Select this during onboarding or in Settings. You can add voluntary Sunnah fasts on top (e.g. Monday & Thursday during Ramadan).",
        quickLink: { path: "/programs", label: "Open Programs" },
      },
      {
        title: "Voluntary Sunnah fasts",
        body: "Tap a program (e.g. Monday & Thursday) to read traditions and how to observe. Add to your journey during onboarding Schedule step or in Settings under Fasting path.",
        quickLink: { path: "/programs/monday-thursday", label: "Monday & Thursday" },
      },
      {
        title: "Set your fasting path",
        body: "In Settings, go to Fasting path. Choose Full Ramadan and optionally enable Monday & Thursday or Ayyam al-Beed. Your schedule and dashboard will reflect your choices.",
        quickLink: { path: "/settings", label: "Open Settings" },
      },
    ],
  },
  {
    slug: "keyboard-shortcuts",
    title: "Keyboard Shortcuts",
    shortDescription: "Navigate faster with keyboard shortcuts.",
    description:
      "TryRamadan keyboard shortcuts: press ? to show help, g+d for Dashboard, g+t for Today, g+s for Schedule, g+p for Prayers, g+q for Quran, g+h for Home, comma for Settings. Arrow keys navigate days on Quran and Schedule. Desktop only.",
    category: "general",
    relatedSlugs: ["dashboard-overview", "today-fast", "quran"],
    steps: [
      {
        title: "Show shortcuts",
        body: "Press ? (question mark) anywhere in the app to open the keyboard shortcuts dialog. A floating keyboard icon appears at bottom-right on desktop; shortcuts are hidden on touch devices.",
        quickLink: { path: "/dashboard", label: "Open Dashboard" },
      },
      {
        title: "Go to pages",
        body: "Press g then d for Dashboard, g then t for Today, g then s for Schedule, g then p for Prayers, g then q for Quran, g then h for Home. Press comma (,) to open Settings.",
        quickLink: { path: "/dashboard", label: "Open Dashboard" },
      },
      {
        title: "Navigate days",
        body: "On the Quran or Schedule page, use left and right arrow keys to move between days. On Quran, Ctrl+Left/Right jumps to first or last day.",
        quickLink: { path: "/dashboard/quran", label: "Open Quran" },
      },
    ],
  },
  {
    slug: "adhan-prayer-notifications",
    title: "Adhan & Prayer Notifications",
    shortDescription: "Enable adhan sound and prayer reminders.",
    description:
      "How to enable adhan (call to prayer) sound and prayer notifications: per-prayer toggles on the Prayers page, suhoor and iftar reminders in Settings. Test adhan before enabling.",
    category: "dashboard",
    relatedSlugs: ["prayers", "settings"],
    steps: [
      {
        title: "Open Prayers",
        body: "Go to Dashboard → Prayers. Scroll down to see per-prayer notification toggles (Fajr, Dhuhr, Asr, Maghrib, Isha) and the Play adhan sound switch.",
        image: `${ASSETS}/prayers.png`,
        quickLink: { path: "/dashboard/prayers", label: "Open Prayers" },
      },
      {
        title: "Enable adhan sound",
        body: "Turn on Play adhan sound when notification fires. When a prayer time arrives and you have a notification enabled for that prayer, the adhan will play. Use Test adhan to preview the sound.",
        quickLink: { path: "/dashboard/prayers", label: "Open Prayers" },
      },
      {
        title: "Per-prayer notifications",
        body: "Toggle each prayer (Fajr, Dhuhr, etc.) to receive a browser notification at that time. Requires notification permission. You can enable some prayers and not others.",
        quickLink: { path: "/dashboard/prayers", label: "Open Prayers" },
      },
      {
        title: "Suhoor and iftar reminders",
        body: "In Settings → Notifications, enable suhoor and iftar reminders. Set how many minutes before each time to be notified. These fire separately from prayer notifications.",
        quickLink: { path: "/settings", label: "Open Settings" },
      },
    ],
  },
  {
    slug: "install-as-app",
    title: "Install TryRamadan as an App",
    shortDescription: "Add to home screen for quick access.",
    description:
      "How to install TryRamadan as a PWA (Progressive Web App) on your phone or desktop. Add to home screen for quick access to your fasting timer and prayer times. Works offline for cached content.",
    category: "general",
    relatedSlugs: ["getting-started", "dashboard-overview"],
    steps: [
      {
        title: "Install banner",
        body: "When you visit TryRamadan on a supported browser (Chrome, Safari, Edge), you may see an Install app banner on the dashboard. Tap Install app on home screen to add TryRamadan to your device.",
        quickLink: { path: "/dashboard", label: "Open Dashboard" },
      },
      {
        title: "Browser menu",
        body: "If the banner does not appear, use your browser's menu: Chrome/Edge → Install app or Add to Home screen; Safari → Share → Add to Home Screen.",
        quickLink: { path: "/dashboard", label: "Open Dashboard" },
      },
      {
        title: "After install",
        body: "TryRamadan opens like a native app. Your timer, prayer times, and progress are available offline when cached. Updates are automatic when you have connectivity.",
        quickLink: { path: "/dashboard", label: "Open Dashboard" },
      },
    ],
  },
  {
    slug: "goals-until-ramadan",
    title: "Goals Until Ramadan",
    shortDescription: "Set and track pre-Ramadan intentions.",
    description:
      "How to use Goals until Ramadan: add custom goals (spiritual, health, learning), mark them complete, and see the countdown to Ramadan. Access from the dashboard Goals card or the Goals page.",
    category: "dashboard",
    relatedSlugs: ["progress-goals", "dashboard-overview", "getting-started"],
    steps: [
      {
        title: "Open Goals",
        body: "From the dashboard, tap the Goals card or go to Dashboard → Goals. You'll see the countdown to Ramadan and your list of goals.",
        image: `${ASSETS}/goals.png`,
        quickLink: { path: "/dashboard/goals", label: "Open Goals" },
      },
      {
        title: "Add a goal",
        body: "Type a goal in the input (e.g. Read about Ramadan, Adjust my sleep schedule, Learn one surah) and tap Add. Goals appear in your list; tap the circle to mark complete.",
        quickLink: { path: "/dashboard/goals", label: "Open Goals" },
      },
      {
        title: "Manage goals",
        body: "Tap the checkmark to toggle a goal complete. Use the trash icon to remove a goal. Your progress (X of Y complete) updates as you go.",
        quickLink: { path: "/dashboard/goals", label: "Open Goals" },
      },
    ],
  },
  {
    slug: "print-and-export",
    title: "Print & Export",
    shortDescription: "Print schedules, export journal and calendar.",
    description:
      "How to print and export data from TryRamadan: print-friendly styles for schedule and progress, export journal to download your entries, export Ramadan calendar to .ics for Google Calendar, Apple Calendar, or Outlook.",
    category: "settings",
    relatedSlugs: ["schedule-calendar", "journal", "settings"],
    steps: [
      {
        title: "Print schedule or progress",
        body: "Open Schedule or Progress, then use your browser's Print (Ctrl/Cmd+P). TryRamadan uses print-friendly styles: navigation and fixed elements are hidden, content is optimized for paper.",
        quickLink: { path: "/dashboard/schedule", label: "Open Schedule" },
      },
      {
        title: "Export journal",
        body: "On the Journal page, use Export journal to download your entries. Your reflections, gratitude, and mood data are included.",
        quickLink: { path: "/dashboard/journal", label: "Open Journal" },
      },
      {
        title: "Export Ramadan calendar",
        body: "On Schedule or the dashboard Goals card, use Export to calendar or Add Ramadan to calendar. Choose Fasting only (Suhoor + Iftar) or Full (all prayers + Taraweeh). Download .ics and import into Google Calendar, Apple Calendar, or Outlook.",
        quickLink: { path: "/dashboard/schedule", label: "Open Schedule" },
      },
    ],
  },
  {
    slug: "faq-and-help",
    title: "FAQ & Help",
    shortDescription: "Find answers and user guides.",
    description:
      "TryRamadan help and FAQ: common questions about fasting, health, and app usage. User guides for step-by-step flows (onboarding, meal planning, macro tracker, schedule). Emergency page for breaking fast safely. Settings for location and notifications.",
    category: "general",
    relatedSlugs: ["health-safety-emergency", "settings", "getting-started", "meal-plan-apply-and-log", "keyboard-shortcuts", "install-as-app"],
    steps: [
      {
        title: "FAQ",
        body: "Open the FAQ page for answers on fasting, health, and using TryRamadan. Linked from the footer under Resources.",
        quickLink: { path: "/faq", label: "Open FAQ" },
      },
      {
        title: "User Guides",
        body: "For step-by-step guides (onboarding, dashboard, meals, macro tracker, Quran, etc.), open User Guides. Each guide has quick links to the right screen.",
        quickLink: { path: "/guides", label: "Open User Guides" },
      },
      {
        title: "Emergency",
        body: "If you need to break your fast now, open the Emergency page for reassurance and steps. Use Health & Safety for general guidance.",
        quickLink: { path: "/emergency", label: "Open Emergency" },
      },
      {
        title: "Settings",
        body: "To change location, notification times, theme, or language and region, open Settings from the footer or dashboard.",
        quickLink: { path: "/settings", label: "Open Settings" },
      },
    ],
  },
];

export function getGuideBySlug(slug: string): Guide | undefined {
  return guides.find((g) => g.slug === slug);
}

export function getRelatedGuides(guide: Guide): Guide[] {
  const slugs = guide.relatedSlugs ?? [];
  return slugs
    .map((s) => getGuideBySlug(s))
    .filter((g): g is Guide => g != null);
}

export function getGuidesByCategory(category: Guide["category"]): Guide[] {
  return guides.filter((g) => g.category === category);
}
