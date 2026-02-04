# QA: Visual Regression Test Specification

> **Implementation status:** Doc complete. Test cases and VISUAL_TEST_CASES template defined. Wire to Percy/Chromatic/Playwright when visual regression tooling is set up.

Defines main states to snapshot per route and the minimum set of screenshots that catch "page stopped rendering correctly" bugs. Suitable for Playwright, Percy, Chromatic, or similar visual regression tools.

---

## 1. Core Routes & Main States to Snapshot

### `/` (Index / Home)

| State | Setup | What to capture |
|-------|-------|-----------------|
| **Pre-onboarding, no location** | Fresh storage; no preferences | Hero, FastingTimer with default/placeholder times, "Set your location" or CTA |
| **Post-onboarding, location set** | `onboardingComplete`, `locationCoords` | Hero, FastingTimer with real times, "Track Your Journey" with real progress or placeholder |
| **With progress (fasted days)** | `completedDays` non-empty | Progress tracker with filled rings, streak |
| **Mobile viewport** | 375×667 | Same layout at mobile width; nav collapses to hamburger |

---

### `/dashboard`

| State | Setup | What to capture |
|-------|-------|-----------------|
| **Fasting (in progress)** | `fastingLog` today = in_progress; `onboardingComplete` | Day card "Right now: Fasting", countdown to Iftar, "Break fast" button, prayer strip, bottom bar (mobile) |
| **Not fasting (eating window)** | No today log or today complete; `onboardingComplete` | "Right now: Eating window", countdown to Suhoor, "I'm fasting" / "Mark complete" buttons |
| **Today completed** | `completedDays` includes today | "Fasted ✓" badge, no Break fast |
| **Today skipped** | `skippedDays` includes today | "Skipped" badge, "I didn't fast today" |
| **Empty progress** | `completedDays: []`, `fastingLog: []` | Streak 0, no badges, empty state |
| **With progress** | `completedDays` has 5+ days | Streak, achievement badges, "X days" |
| **No location** | `locationCoords: null` | LocationRequiredCTA or banner; skeleton/placeholder prayer strip |
| **Location set** | `locationCoords` set | Prayer strip with times, location badge |
| **Mobile + bottom bar** | Fasting + mobile viewport | Bottom bar visible, content not hidden |

---

### `/dashboard/today`

| State | Setup | What to capture |
|-------|-------|-----------------|
| **Fasting in progress** | `fastingLog` today = in_progress | Countdown, progress bar, "I fasted today — mark complete" + "I broke my fast" |
| **Not started (before suhoor)** | No today log | "I fasted today — mark complete" + "I didn't fast today" |
| **Completed** | `completedDays` includes today | "Fasted ✓" or completed state |
| **Broken** | `fastingLog` today = broken | Broken reason, "I broke my fast" result |
| **Eating window (post-iftar)** | No today log, past maghrib | Countdown to next Suhoor |
| **With hydration/energy** | `tryramadan-today` has entries | Hydration progress, energy check-in |
| **No location** | `locationCoords: null` | LocationRequiredCTA or placeholder times |

---

### `/dashboard/schedule`

| State | Setup | What to capture |
|-------|-------|-----------------|
| **Empty (no events, no notes)** | Clean `tryramadan-calendar-events`, `tryramadan-schedule-notes` | Calendar grid, no events, empty day view |
| **With completed days** | `completedDays` has dates in month | Calendar days with checkmarks/dots |
| **With events** | Calendar events for selected day | Quick-add events (Suhoor, Iftar, custom) in timeline |
| **With journal on day** | Journal entry for selected date | Journal snippet in day view |
| **With notes** | Schedule notes for selected date | Notes visible in day panel |
| **Selected non-today** | `selectedDate` = past/future day | Different day highlight, timeline for that day |
| **No location** | `locationCoords: null` | Timeline may be empty; export disabled or CTA |

---

### `/dashboard/journal`

| State | Setup | What to capture |
|-------|-------|-----------------|
| **Empty (no entries)** | `tryramadan-journal: []` | Write area, calendar, "No entries" or empty list |
| **With entries** | 2+ journal entries | Calendar with marked dates, past entries list, write area with existing content |
| **Editing existing** | Select date with entry | Pre-filled content, gratitude, mood selector |
| **Future date selected** | `writeDate` > today | "Write for a future date" or prompt |
| **Mobile** | 375×667 | Calendar compact, list layout |

---

### `/dashboard/prayers`

| State | Setup | What to capture |
|-------|-------|-----------------|
| **Loaded with times** | Location set, prayer API success | Prayer list (Fajr–Isha), current time, next prayer |
| **Loading** | Mock slow API or intercept | "Loading prayer times…" + min-height container |
| **Error (no retry)** | Mock API 500 | ApiErrorRetry: "Could not load prayer times", Try again, Set location |
| **No location** | `locationCoords: null` | LocationRequiredCTA |
| **From cache** | `isFromCache: true` | Amber banner "Times may be outdated" or "You're offline" |
| **Adhan section** | Muslim user | "Adhan at prayer times", Test adhan, Play adhan sound switch |

---

### `/dashboard/progress`

| State | Setup | What to capture |
|-------|-------|-----------------|
| **Empty** | `completedDays: []`, no journal, no food logs | Empty streak, "0 days", no charts |
| **With progress** | 5+ completed days, journal entries | Streak, longest streak, energy chart, journal streak |
| **With broken fasts** | `fastingLog` has broken entries | Broken section, excused vs non-excused |
| **Streaks disabled** | `showStreakAndAchievements: false` | Simplified view, no streak badges |

---

### `/guides`

| State | Setup | What to capture |
|-------|-------|-----------------|
| **Default** | None | Categories, guide cards, "User Guides" heading |
| **Mobile** | 375×667 | Stacked layout, category pills |

---

### `/guides/:slug` (e.g. `/guides/getting-started`)

| State | Setup | What to capture |
|-------|-------|-----------------|
| **First step** | `stepIndex: 0` | Step content, screenshot, next/prev |
| **Middle step** | `stepIndex: 2` | Step 3 content |
| **Last step** | Final step | Complete state, back to guides |
| **Not found** | `/guides/invalid-slug` | "Guide not found" or 404 |

---

### `/dashboard/meals`

| State | Setup | What to capture |
|-------|-------|-----------------|
| **Empty** | No meal plans, no food log | Suhoor/Iftar placeholders, add buttons |
| **With meal plans** | `tryramadan-day-meal-plans` has entries | Recipe cards, meal suggestions |
| **With food log** | `tryramadan-day-food-log` has entries | Logged items, macros |
| **Macros enabled** | `macroTrackingEnabled: true` | Calorie/protein/carb/fat display |

---

### `/onboarding/welcome`

| State | Setup | What to capture |
|-------|-------|-----------------|
| **Default** | Fresh storage | Welcome message, Get started / Muslim / Non-Muslim |

---

### `/onboarding/location`

| State | Setup | What to capture |
|-------|-------|-----------------|
| **Detecting** | Mock slow ipapi/geolocation | "Detecting location from IP…" |
| **Detected** | Auto-location success | Location display, Continue |
| **Not detected** | Auto-location fail | Search box, "Use my location", Skip |

---

### `/settings`

| State | Setup | What to capture |
|-------|-------|-----------------|
| **With location** | `locationCoords`, `location` set | Location display, theme, notifications |
| **No location** | `locationCoords: null` | "Set location" CTA |
| **Mobile** | 375×667 | Sections stacked, collapsible |

---

### `/404` (NotFound)

| State | Setup | What to capture |
|-------|-------|-----------------|
| **Unknown route** | Navigate to `/does-not-exist` | "404", "Page not found", back link |

---

## 2. Minimum Screenshots to Catch "Page Stopped Rendering" Bugs

These are the **smallest set** that would catch headers missing, wrong layout, bottom bar gone, or critical UI breakage.

| # | Route | State | Assertion |
|---|-------|-------|-----------|
| 1 | `/` | Post-onboarding, location set | Navbar, hero, FastingTimer, main content visible |
| 2 | `/dashboard` | Fasting, mobile | Navbar, day card, prayer strip, **bottom bar** (mobile), Back to Dashboard |
| 3 | `/dashboard` | Not fasting, desktop | Navbar, "Eating window", no bottom bar (desktop) |
| 4 | `/dashboard/today` | Fasting | Navbar, "Today's Fast", countdown, "I broke my fast" button |
| 5 | `/dashboard/schedule` | Empty calendar | Navbar, calendar grid, day selector, timeline area |
| 6 | `/dashboard/journal` | Empty | Navbar, Journal heading, write area, calendar |
| 7 | `/dashboard/journal` | With 1 entry | Past entries list, calendar with marked date |
| 8 | `/dashboard/prayers` | Loaded | Navbar, "Prayer Times", prayer list (Fajr–Isha) |
| 9 | `/dashboard/prayers` | Error | ApiErrorRetry visible (or LocationRequiredCTA) |
| 10 | `/dashboard/progress` | With progress | Streak, days completed, charts |
| 11 | `/guides` | Default | Navbar, "User Guides", category pills, guide cards |
| 12 | `/guides/getting-started` | First step | Step content, screenshot, navigation |
| 13 | `/onboarding/welcome` | Default | Welcome, mode options |
| 14 | `/settings` | With location | Settings sections, location display |
| 15 | `/unknown-404` | 404 | "404" or "Page not found" |

**Key regression signals:**

- **Navbar missing** → Screenshots 1–14 should include navbar.
- **Bottom bar gone** → Screenshot 2 (dashboard, fasting, mobile) must show bottom bar.
- **Headers missing** → Each screenshot has a recognizable h1/landmark.
- **Wrong layout** → Compare viewport (mobile vs desktop) and content density.

---

## 3. Visual Test Cases (Tool-Agnostic)

Express as test cases that can be wired to Playwright, Percy, Chromatic, BackstopJS, etc.

```ts
// Structure for visual regression (pseudo-code / template)
// Implement with: page.goto(), page.screenshot(), expect(snapshot).toMatchSnapshot()

const VISUAL_TEST_CASES = [
  {
    id: "home-post-onboarding",
    route: "/",
    viewport: { width: 1280, height: 720 },
    setup: { localStorage: { "tryramadan-preferences": JSON.stringify({ onboardingComplete: true, locationCoords: { lat: 51.5, lng: -0.1 } }) } },
    selectors: ["nav", "[aria-label='Skip to main content']", "main"],
    exclude: ["[aria-live]"], // optional: exclude dynamic timers
  },
  {
    id: "dashboard-fasting-mobile",
    route: "/dashboard",
    viewport: { width: 375, height: 667 },
    setup: {
      localStorage: {
        "tryramadan-preferences": JSON.stringify({ onboardingComplete: true, locationCoords: { lat: 51.5, lng: -0.1 } }),
        "tryramadan-progress": JSON.stringify({
          completedDays: [],
          fastingLog: [{ date: "2025-03-15", startedAt: "2025-03-15T05:00:00Z", status: "in_progress" }],
        }),
      },
    },
    selectors: ["nav", "main", "[aria-label='Fasting quick actions']"],
    assertVisible: ["Break fast", "Iftar in"],
  },
  {
    id: "dashboard-not-fasting-desktop",
    route: "/dashboard",
    viewport: { width: 1280, height: 720 },
    setup: {
      localStorage: {
        "tryramadan-preferences": JSON.stringify({ onboardingComplete: true, locationCoords: { lat: 51.5, lng: -0.1 } }),
        "tryramadan-progress": JSON.stringify({ completedDays: [], fastingLog: [] }),
      },
    },
    assertVisible: ["Eating window", "I'm fasting"],
    assertNotVisible: ["[aria-label='Fasting quick actions']"],
  },
  {
    id: "dashboard-today-fasting",
    route: "/dashboard/today",
    viewport: { width: 1280, height: 720 },
    setup: {
      localStorage: {
        "tryramadan-preferences": JSON.stringify({ onboardingComplete: true, locationCoords: { lat: 51.5, lng: -0.1 } }),
        "tryramadan-progress": JSON.stringify({
          completedDays: [],
          fastingLog: [{ date: "2025-03-15", startedAt: "2025-03-15T05:00:00Z", status: "in_progress" }],
        }),
      },
    },
    assertVisible: ["Today's Fast", "I broke my fast", "I fasted today"],
  },
  {
    id: "dashboard-schedule-empty",
    route: "/dashboard/schedule",
    viewport: { width: 1280, height: 720 },
    setup: {
      localStorage: {
        "tryramadan-preferences": JSON.stringify({ onboardingComplete: true, locationCoords: { lat: 51.5, lng: -0.1 } }),
        "tryramadan-progress": JSON.stringify({ completedDays: [], fastingLog: [] }),
      },
    },
    assertVisible: ["Fasting Schedule", "Previous day", "Next day"],
  },
  {
    id: "dashboard-journal-empty",
    route: "/dashboard/journal",
    viewport: { width: 1280, height: 720 },
    setup: {
      localStorage: {
        "tryramadan-preferences": JSON.stringify({ onboardingComplete: true }),
        "tryramadan-journal": "[]",
      },
    },
    assertVisible: ["Journal", "Write", "Calendar"],
  },
  {
    id: "dashboard-journal-with-entries",
    route: "/dashboard/journal",
    viewport: { width: 1280, height: 720 },
    setup: {
      localStorage: {
        "tryramadan-preferences": JSON.stringify({ onboardingComplete: true }),
        "tryramadan-journal": JSON.stringify([
          { date: "2025-03-14", prompt: "Test", content: "Entry one", mood: 4 },
          { date: "2025-03-13", prompt: "Test", content: "Entry two", mood: 3 },
        ]),
      },
    },
    assertVisible: ["Journal", "Past entries", "Entry one"],
  },
  {
    id: "dashboard-prayers-loaded",
    route: "/dashboard/prayers",
    viewport: { width: 1280, height: 720 },
    setup: {
      localStorage: { "tryramadan-preferences": JSON.stringify({ onboardingComplete: true, locationCoords: { lat: 51.5, lng: -0.1 } }) },
    },
    mock: { "api.aladhan.com": { status: 200, body: MOCK_ALADHAN_RESPONSE } },
    assertVisible: ["Prayer Times", "Fajr", "Maghrib", "Isha"],
  },
  {
    id: "dashboard-prayers-error",
    route: "/dashboard/prayers",
    viewport: { width: 1280, height: 720 },
    setup: {
      localStorage: { "tryramadan-preferences": JSON.stringify({ onboardingComplete: true, locationCoords: { lat: 51.5, lng: -0.1 } }) },
    },
    mock: { "api.aladhan.com": { status: 500 } },
    assertVisible: ["Could not load prayer times", "Try again"],
  },
  {
    id: "guides-default",
    route: "/guides",
    viewport: { width: 1280, height: 720 },
    assertVisible: ["User Guides", "Onboarding", "Dashboard", "Learn"],
  },
  {
    id: "guides-detail-first-step",
    route: "/guides/getting-started",
    viewport: { width: 1280, height: 720 },
    assertVisible: ["Getting started", "Next", "Back to Home"],
  },
  {
    id: "onboarding-welcome",
    route: "/onboarding/welcome",
    viewport: { width: 1280, height: 720 },
    assertVisible: ["Welcome", "Muslim", "Non-Muslim"],
  },
  {
    id: "settings-with-location",
    route: "/settings",
    viewport: { width: 1280, height: 720 },
    setup: {
      localStorage: {
        "tryramadan-preferences": JSON.stringify({
          onboardingComplete: true,
          locationCoords: { lat: 51.5, lng: -0.1 },
          location: "London, UK",
        }),
      },
    },
    assertVisible: ["Settings", "Location", "London"],
  },
  {
    id: "404-not-found",
    route: "/unknown-route-xyz",
    viewport: { width: 1280, height: 720 },
    assertVisible: ["404", "Page not found"],
  },
];
```

---

## 4. Flaky / Exclude Regions

For stable snapshots, exclude or mask:

| Element | Reason |
|---------|--------|
| Live timers (countdown, clock) | Changes every second |
| `[aria-live]` regions | Dynamic updates |
| Date strings ("March 15, 2025") | Varies by test run date |
| Prayer times | May differ by location/date; use fixed mock |
| Animations | Use `prefer-reduced-motion` or wait for animation end |

**Recommended:** Use `page.addStyleTag({ content: '* { animation: none !important; }' })` or `mask` regions (Percy/Chromatic) for timers and dates.

---

## 5. Viewport Matrix

| Viewport | Use case |
|----------|----------|
| 375×667 | Mobile (iPhone SE); bottom bar, hamburger nav |
| 768×1024 | Tablet |
| 1280×720 | Desktop; full nav, no bottom bar (when not fasting) |
| 1920×1080 | Large desktop |

**Minimum:** 375×667 and 1280×720 for core routes.
