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
    shortDescription: "Set up the app and complete onboarding.",
    description:
      "Step-by-step guide to getting started with TryRamadan: create an account, complete onboarding (welcome, mode, knowledge, health, location, schedule, notifications, goals), and reach your dashboard. Optimized for mobile and desktop.",
    category: "onboarding",
    relatedSlugs: ["onboarding-flow", "dashboard-overview"],
    steps: [
      {
        title: "Open the app",
        body: "Visit TryRamadan.app in your browser or open the installed PWA. The home page shows features, programs, and a clear call-to-action to start your journey.",
        quickLink: { path: "/", label: "Go to Home" },
      },
      {
        title: "Start your journey",
        body: "Tap or click “Start your journey” or “Try Ramadan” to begin. You’ll be taken to the onboarding flow.",
        image: `${ASSETS}/getting-started-home.png`,
        quickLink: { path: "/onboarding", label: "Go to Onboarding" },
      },
      {
        title: "Complete onboarding",
        body: "Follow the onboarding steps: Welcome, Mode (new/muslim), Knowledge, Health, Location, Schedule, Notifications, and Goals. You can change most of these later in Settings.",
        image: `${ASSETS}/onboarding-welcome.png`,
        quickLink: { path: "/onboarding", label: "Open Onboarding" },
      },
      {
        title: "Reach the dashboard",
        body: "After onboarding you’ll land on the Dashboard. From here you can log fasting, see today’s timer, mark days complete, and open Today, Schedule, Prayers, Meals, Learn, and Progress.",
        image: `${ASSETS}/dashboard-overview.png`,
        quickLink: { path: "/dashboard", label: "Open Dashboard" },
      },
    ],
  },
  {
    slug: "onboarding-flow",
    title: "Onboarding Flow Guide",
    shortDescription: "Walk through each onboarding step.",
    description:
      "Complete guide to the TryRamadan onboarding flow: welcome, experience mode, knowledge check, health disclaimer, location, Ramadan schedule, notifications, and pre-Ramadan goals. Includes quick links to each section.",
    category: "onboarding",
    relatedSlugs: ["getting-started", "dashboard-overview", "settings"],
    steps: [
      {
        title: "Welcome",
        body: "The welcome screen introduces TryRamadan. Tap “Get started” to continue.",
        image: `${ASSETS}/onboarding-welcome.png`,
        quickLink: { path: "/onboarding/welcome", label: "Open Welcome" },
      },
      {
        title: "Experience mode",
        body: "Choose whether you’re new to Ramadan or Muslim. This tailors tips and language.",
        image: `${ASSETS}/onboarding-mode.png`,
        quickLink: { path: "/onboarding/mode", label: "Open Mode" },
      },
      {
        title: "Knowledge",
        body: "Answer a few short questions about your familiarity with fasting. Used only to personalize content.",
        quickLink: { path: "/onboarding/knowledge", label: "Open Knowledge" },
      },
      {
        title: "Health",
        body: "Read the health disclaimer. If you have medical conditions, consult a doctor before fasting.",
        quickLink: { path: "/onboarding/health", label: "Open Health" },
      },
      {
        title: "Location",
        body: "Set your location for accurate prayer and suhoor/iftar times. You can use device location or search.",
        image: `${ASSETS}/onboarding-location.png`,
        quickLink: { path: "/onboarding/location", label: "Open Location" },
      },
      {
        title: "Schedule",
        body: "Confirm or set your Ramadan start date. The app will use this for the 30-day countdown and calendar.",
        quickLink: { path: "/onboarding/schedule", label: "Open Schedule" },
      },
      {
        title: "Notifications",
        body: "Optionally enable suhoor and iftar reminders. You can change times later in Settings.",
        quickLink: { path: "/onboarding/notifications", label: "Open Notifications" },
      },
      {
        title: "Goals",
        body: "Set optional pre-Ramadan goals (e.g. read about Ramadan, adjust sleep). You can manage goals from the dashboard.",
        quickLink: { path: "/onboarding/goals", label: "Open Goals" },
      },
    ],
  },
  {
    slug: "dashboard-overview",
    title: "Dashboard Overview",
    shortDescription: "Navigate the main dashboard and quick actions.",
    description:
      "Learn how to use the TryRamadan dashboard: fasting timer, log fasting, mark day complete, streak, schedule strip, and links to Today, Schedule, Prayers, Meals, Learn, Progress, and more. Mobile and desktop.",
    category: "dashboard",
    relatedSlugs: ["getting-started", "today-fast", "schedule-calendar"],
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
        title: "This week strip",
        body: "The “This week” strip shows the next 7 days. Tap a day or “View schedule” to open the full calendar.",
        quickLink: { path: "/dashboard/schedule", label: "Open Schedule" },
      },
      {
        title: "Quick links",
        body: "Use the grid to open Today’s Fast, Schedule, Prayers, Meals, Learn, Progress, Culture, Health, Journal, and Goals.",
        quickLink: { path: "/dashboard", label: "Open Dashboard" },
      },
    ],
  },
  {
    slug: "today-fast",
    title: "Today's Fast & Timer",
    shortDescription: "Track your current fast and use the timer.",
    description:
      "How to use Today’s Fast: view the fasting timer, log fasting, see countdowns to suhoor end and iftar, set intention, track hydration and energy. Mobile-first guide.",
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
    shortDescription: "Use the calendar and add events.",
    description:
      "Guide to the Schedule page: view the calendar, see prayer times and fasting days, add suhoor/iftar/prayer events, create custom events, and export to iCal. Mobile and desktop.",
    category: "dashboard",
    relatedSlugs: ["dashboard-overview", "today-fast"],
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
