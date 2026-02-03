# User flows, personas & page-by-page test prompts

Single reference for **user personas**, **user flows**, and **how to test every page and edge case** for the TryRamadan app. Use this for manual QA, E2E test design, and regression checklists.

**Related docs:** `MANUAL-QA-SCENARIOS.md`, `EDGE-CASE-TEST-SCENARIOS.md`, `UX-FLOWS-AND-FRICTION.md`, `NEGATIVE-TESTING-FORMS.md`, `ONBOARDING-REONBOARDING-FLOWS.md` (onboarding/re-onboarding by time-of-Ramadan and edge cases). **`HISTORICAL-DATA-AND-DELETION-FLOWS.md`** — viewing fasting/meal history, comparing to last year, export/review journal, deletion and undo, new device/cleared storage. **`FALL-OFF-AND-RETURN-FLOWS.md`** — users who stop logging and come back (7-day then 10-day gap; guilt-avoidance return); what they see, backfill / mark "not tracked," conflict edge cases. **`NON-MUSLIM-AND-RAMADAN-CURIOUS-FLOWS.md`** — shadow fasting a few days a week; journal + meals only (no religious framing); where app feels too religious; terminology/simple vs full Islamic mode; switching mode mid-Ramadan. **`OFFLINE-AND-DEGRADED-NETWORK-FLOWS.md`** — no network with cached data; first open with no network; prayer/location API failure, timeout, unexpected data; timezone/location unresolved but user logs fast; UI fallbacks and actions possible.

---

## 1. User personas

| Persona | Description | Key traits | Primary flows |
|---------|-------------|------------|----------------|
| **Muslim (full observance)** | Practicing Muslim tracking Ramadan fasts, prayer times, and spiritual goals. | Knows Suhoor/Iftar/Fajr/Maghrib; may want voluntary Sunnah; cares about streak and completion. | Onboarding (Muslim) → Dashboard → fast/complete/break → Progress, Prayers, Quran. |
| **Non-Muslim (learning / TRF)** | Non-Muslim trying Ramadan-style fasting or time-restricted eating; supporting friends/family. | Needs Suhoor/Iftar explained; takes Knowledge quiz; may skip prayer focus. | Onboarding (Non-Muslim) → Knowledge → Dashboard → meals, journal, progress. |
| **First-time (no account)** | New user, no prior localStorage; may land on `/` or direct link. | Needs clear CTA (Start journey / I'm Muslim); may skip location initially. | Home → Onboarding → Dashboard or redirect. |
| **Returning (onboarding complete)** | User with `onboardingComplete: true`; may have progress, journal, location set. | Should not see onboarding again unless reset; Dashboard is home. | Direct to `/dashboard`; Settings for location/export. |
| **No location set** | User who skipped location in onboarding or cleared it. | Sees "Set your location" banner (dismissible); prayer times may be placeholder or from IP. | Dashboard banner → Settings → Location; or continue without. |
| **Mid-Ramadan (active faster)** | User during Ramadan with in_progress or completed days. | Sees "Day N of Ramadan"; countdown; Mark complete / Break fast. | Dashboard, Today, Schedule, Progress. |
| **Post-Ramadan / pre-Ramadan** | User when Ramadan has ended or not yet started. | Sees "X days until Ramadan" or "Ramadan ended"; no "Day N" badge. | Dashboard badge; Progress export; Goals. |

---

## 2. User flows (summary)

| Flow | Entry | Steps | Exit | Personas |
|------|--------|-------|------|----------|
| **Onboarding (full)** | `/` or `/onboarding/welcome` | Welcome → Get Started → Mode → [Knowledge if non-Muslim] → Health → Location → Schedule → Notifications → Priorities → Goals → Go to dashboard | `/dashboard` | First-time, Muslim, Non-Muslim |
| **Onboarding (shortcut Muslim)** | `/` → I'm Muslim | Mode (pre-selected Muslim) → … same as above | `/dashboard` | First-time Muslim |
| **Set location** | Onboarding Location or Settings | Auto-detect or search city → Select → Continue / Save | Same page or Dashboard | All |
| **Daily fast (start)** | Dashboard or Dashboard Today | Tap "I'm fasting" | In-progress state; countdown visible | Muslim, Non-Muslim |
| **Daily fast (complete)** | Dashboard or Today | Tap "Mark complete" (when fasting or for selected day) | completedDays updated; streak/Progress | Muslim, Non-Muslim |
| **Daily fast (break)** | Dashboard or Today | Tap "Break fast" → reason → confirm | status broken; reason stored; Progress | Muslim, Non-Muslim |
| **Daily fast (skip)** | Dashboard or Today | Tap "I didn't fast today" | skippedDays updated; no in_progress | Muslim, Non-Muslim |
| **Make-up day** | Dashboard day picker or Schedule | Select past day → Mark complete | completedDays includes that date | Muslim |
| **Meals** | Dashboard → Meals or Schedule | Suhoor/Iftar tabs → add recipe or custom; or Schedule day → food log | Meal data saved per day | All |
| **Journal** | Dashboard → Journal | Pick date → prompt + content + mood/gratitude → Save | Entry saved; calendar dots | All |
| **Progress / export** | Dashboard → Progress or Settings | View stats; Export CSV or Export my data | File download; no crash | All |
| **Settings** | Nav or Dashboard → Settings | Edit location, notifications, theme, export | Persisted preferences | All |

---

## 3. Page-by-page test prompts and edge cases

### 3.1 Index (Home) — `/`

**Purpose:** Land new and returning users; CTAs to Start journey or I'm Muslim.

**Test prompts:**
- As a **first-time user**, open `/`. Do you see a clear way to start? (Start your journey, I'm Muslim.)
- As a **returning user** with onboarding complete, open `/`. Can you reach the dashboard from the nav or CTA?
- Confirm "Both paths set your location for accurate times" (or equivalent) is visible so Muslims know both paths set location.
- Confirm "New? Start your journey below" (or equivalent) under the badge.

**Edge cases:**
- Direct visit to `/` with no localStorage: no crash; CTAs work.
- Visit with `onboardingComplete: true`: no forced redirect to onboarding; user can go to dashboard via link/nav.

**Implementation notes:** HeroSection has both CTAs and location line; Navbar links to dashboard when applicable.

---

### 3.2 Onboarding — `/onboarding/welcome` … `/onboarding/goals`

**Purpose:** Set mode, health, location, schedule, notifications, priorities, goals; land on dashboard.

**Test prompts (by step):**

(See **ONBOARDING-REONBOARDING-FLOWS.md** for full flows: first-time 2 weeks before / first day / last 10 nights, information order, and edge cases: abandon-and-return, skip location/reminders.)

| Step | Route | Prompt |
|------|--------|--------|
| Welcome | `/onboarding/welcome` | Click "Get Started". Do you proceed to Mode? |
| Mode | `/onboarding/mode` | Select Muslim → Continue. Is Knowledge step skipped? Select Non-Muslim → Continue. Is Knowledge step shown? |
| Knowledge | `/onboarding/knowledge` | (Non-Muslim only.) Answer all 5. Can you proceed after completion? |
| Health | `/onboarding/health` | Accept/read disclaimer. Continue. |
| Location | `/onboarding/location` | Use "Use my location" or search city. Select result → Continue. Or "Skip for now". If geolocation fails, is "We couldn't detect your location. Search for your city…" shown? |
| Schedule | `/onboarding/schedule` | Select Full Ramadan; optionally add voluntary. Continue. |
| Notifications | `/onboarding/notifications` | Enable or skip. Copy uses "pre-dawn meal (Suhoor)" and "breaking fast" for non-Muslim. |
| Priorities | `/onboarding/priorities` | Select one or more. Continue. |
| Goals | `/onboarding/goals` | Select goals; optional intention. Before CTA: "You're all set. When Ramadan begins…" and "You can change prayer-time method and more in Settings after setup." Click "Go to dashboard". Redirect to `/dashboard`? |

**Edge cases:**
- Refresh on any onboarding step: state preserved or user can continue.
- Back button: navigates back without losing progress where expected.
- Submit Goals without selecting a goal: allow or show validation (current: allow).

**Implementation notes:** OnboardingGoals has "You're all set" and Settings signpost; OnboardingLocation has failure message; mode-aware copy on Notifications.

---

### 3.3 Dashboard — `/dashboard`

**Purpose:** Main hub: day badge, prayer strip, fast actions (I'm fasting, Mark complete, Break fast, I didn't fast today), day selector, schedule collapsible, stats, daily missions.

**Test prompts:**
- **Persona: Muslim, Ramadan.** Open Dashboard. Do you see "Day N of Ramadan" or "Last day of Ramadan" on last day? Suhoor end / Iftar times?
- **Persona: Non-Muslim.** Do you see "Breaking Fast (Iftar)" and pre-dawn (Suhoor) wording where relevant? Tooltip on "Suhoor end" explains Suhoor for non-Muslim?
- **Fast actions.** When not fasting and not completed: do you see "I'm fasting" and "I didn't fast today"? When fasting: "Break fast"? When completed: "Mark complete" (with undo)?
- **Clarification line.** Under "I'm fasting" / "I didn't fast today", is the line visible: "I'm fasting = you started today's fast; I didn't fast today = you're not fasting (e.g. travel, illness)"?
- **Location banner.** If onboarding complete but no location: is dismissible "Set your location in Settings…" shown until dismissed?
- **Stats.** Completed / Broken (with "X excused" when applicable) / Skipped. Click Broken: list of dates. Export CSV from Progress page.
- **Day selector.** Change day to yesterday. Can you "Mark complete" for that day (make-up)? For future day: "Go to today" or similar.

**Edge cases:**
- Duplicate fastingLog entries for same date: app uses last entry (getTodayFastingLog).
- After "I didn't fast today", tap "I'm fasting": skipped cleared, in_progress set (EC-SKIP-2).
- No location: prayer strip shows placeholder or IP-based; no crash.

**Implementation notes:** Location banner, excused count in stats, last-day badge, clarification line, mode-aware tooltips.

---

### 3.4 Dashboard Today — `/dashboard/today`

**Purpose:** Focused view: fasting status, countdown to Suhoor end / Iftar, hydration, intention, fast actions.

**Test prompts:**
- Same fast actions as Dashboard (I'm fasting, I didn't fast today, Break fast, Mark complete). Same tooltips and clarification.
- Countdown cards: "Until suhoor end" and "Until Iftar" (or labels). For non-Muslim, tooltip on Suhoor card explains "Suhoor = last meal before dawn…".
- Hydration / intention: optional; no crash if empty.

**Edge cases:**
- Timezone: "today" matches display timezone when set; countdown uses same.

**Implementation notes:** Mode-aware Suhoor tooltip; same buttons as Dashboard.

---

### 3.5 Dashboard Schedule — `/dashboard/schedule`

**Purpose:** Calendar, day detail, meal plan notes, food log, Laylat al-Qadr styling, export .ics.

**Test prompts:**
- Select a day. Do you see meal plan and food log for that day? Can you add/edit/delete?
- Last 10 nights of Ramadan: odd nights (21, 23, 25, 27, 29) show Laylat al-Qadr styling/tooltip?
- Export Ramadan to calendar: .ics downloads; events in user timezone; Suhoor end and Iftar per day.
- Add food (custom): name + calories. Empty name and 0 calories: toast "Add a name or at least one calorie…"?

**Edge cases:**
- Edit past day meal, then switch to today: past day persisted; today unchanged (EC-OV-3).
- normalizeDayFoodLog with missing `between`: returns between = [] (EC-M-4).

**Implementation notes:** Meal empty toast; meal plan and food log independent.

---

### 3.6 Dashboard Meals — `/dashboard/meals`

**Purpose:** Suhoor/Iftar tabs, recipes, add to today, custom meal.

**Test prompts:**
- **Non-Muslim:** Tab labels or aria-label: Suhoor — pre-dawn meal; Iftar — evening.
- When user is **fasting today** (in_progress): note visible? "Logging food here doesn't break your fast; use 'Break fast' on the Dashboard if you ate."
- Add custom meal: name, cal, portions. Submit with empty name and 0 cal: toast "Add a name or at least one calorie…"?

**Edge cases:**
- Add meal for future date: stored under that date.
- Meals and fasting state independent: meal on broken day does not change fast state.

**Implementation notes:** Mode-aware aria-label; fasting note when in_progress; meal empty toast.

---

### 3.7 Dashboard Journal — `/dashboard/journal`

**Purpose:** Calendar, pick date, prompt, content, mood, gratitude, Save, export.

**Test prompts:**
- **Non-Muslim:** Prompts avoid jargon? e.g. "How did you feel in the morning (before the fast) vs when you broke your fast?"
- Save with **empty content**: toast "Write something before saving. A few words are enough." No save.
- Save with **content over 10,000 characters**: toast "Entry is too long…". maxLength 10000 on textarea; character count when near limit?
- **Export** with zero entries: toast "No entries to export."; file still valid JSON `{ exportedAt, entries: [] }`; no crash.
- Save with content: toast "Entry saved." Calendar shows dot for that date; switching date loads correct entry.

**Edge cases:**
- Two saves same day: single entry overwritten (EC-OV-6).
- Edit past day, switch date: past day updated; new date loads its own (EC-OV-7).

**Implementation notes:** Empty and length toasts; zero-export toast; mode-aware prompts; createdAt/updatedAt.

---

### 3.8 Dashboard Progress — `/dashboard/progress`

**Purpose:** Days completed, streak, broken, skipped, CSV export, optional dialogs for lists.

**Test prompts:**
- Counts: Completed, Broken (with "X excused" when applicable), Skipped. Match localStorage.
- Streak: excludes skipped and broken; recalculates correctly.
- Export CSV: download; headers and rows; no crash. Content matches progress.

**Edge cases:**
- getTotalHoursFasted: in_progress entries contribute 0; no NaN (EC-S-3).
- Streak with gap (skipped in between): streak = 1 from last completed (EC-S-1).

**Implementation notes:** getExcusedFastDays; breakdown "Broken: Y (Z excused)".

---

### 3.9 Dashboard Prayers — `/dashboard/prayers`

**Purpose:** Prayer times (Fajr, Dhuhr, Asr, Maghrib, Isha, Imsak), optional adhan.

**Test prompts:**
- With location set: times shown for today. With no location: "Set your location…" CTA.
- No crash when prayer times loading or API error.

**Edge cases:**
- DST transition day: times and countdown consistent (manual check).

---

### 3.10 Dashboard Learn, Health, Goals, Culture, Quran, Achievements, Macros

**Purpose:** Learning content, health tips, goals, culture, Quran, achievements, macros.

**Test prompts:**
- Each page loads without crash; back/nav to Dashboard works.
- **Goals:** List and update goals; reflects in preferences.
- **Macros / food log:** Add item; totals update; normalizeDayFoodLog handles missing `between`.

**Edge cases:**
- Lazy-loaded routes: skeleton or fallback while loading; no blank screen.

---

### 3.11 Settings — `/settings`

**Purpose:** Mode, location, notifications, theme, voluntary fasting, export data, reset.

**Test prompts:**
- **Location:** Search city; select; save. "Changing location updates prayer and iftar times everywhere in the app."
- **Export my data:** Download JSON with preferences, progress, **journal**; no crash.
- **Voluntary Sunnah:** Tooltip for non-Muslim: "Sunnah = voluntary fasts recommended by the Prophet…".

**Edge cases:**
- Export with empty journal: valid JSON; entries: [].
- **Reset:** Only fasting progress is cleared; journal and meals are not. See **HISTORICAL-DATA-AND-DELETION-FLOWS.md** for delete day/entry/all, undo, and new device/cleared storage.

**Implementation notes:** Export includes journal; location impact line; Sunnah tooltip.

---

### 3.12 Other routes — FAQ, Health, Emergency, Recipes, Culture, Guides, Legal, Privacy, Terms, NotFound

**Purpose:** Content and legal pages; 404.

**Test prompts:**
- Each route loads; internal links work; no broken layout.
- **NotFound (`*`):** Has `<main id="main-content">` for skip link; link back to home/dashboard.
- **Recipes:** Cards are `<Link>`; keyboard and SEO ok.

**Edge cases:**
- Invalid `/recipe/suhoor/99999`: detail or 404; no crash.

---

## 4. Cross-cutting test prompts

| Area | Prompt |
|------|--------|
| **Keyboard** | Tab through focusable elements; Enter/Space on buttons; Escape closes dialogs. |
| **Skip link** | "Skip to main content" from nav lands on `#main-content` on every page. |
| **Focus** | After opening dialog, focus inside; after close, focus restored. |
| **Timezone** | When display timezone set, "today" and fasting log use that date; countdown matches. |
| **Ramadan boundaries** | First day: "Day 1 of Ramadan". Last day: "Last day of Ramadan". Day after: no "Day N"; countdown to next year. |
| **Data integrity** | completedDays no duplicates; fastingLog last-entry-wins per date; skippedDays cleared when starting fast that day. |

---

## 5. Implementation checklist (from this doc)

Use this section to drive implementation; tick when done.

- [x] **Index:** Both CTAs and "Both paths set your location" visible; "New? Start your journey below".
- [x] **Onboarding:** Goals "You're all set" + Settings signpost; Location failure message; mode-aware Notifications copy.
- [x] **Dashboard:** Location banner (dismissible); "I'm fasting" vs "I didn't fast today" line; Last day badge; Suhoor/Iftar tooltips mode-aware; Stats: Broken (X excused); Skipped.
- [x] **Dashboard Today:** Same fast actions and tooltips; Suhoor countdown tooltip mode-aware.
- [x] **Schedule:** Meal empty toast; .ics export; Laylat al-Qadr styling (odd nights last 10).
- [x] **Meals:** Fasting note when in_progress; mode-aware tab aria-label; meal empty toast.
- [x] **Journal:** Empty save toast; length limit + toast; zero-export toast; mode-aware prompts; createdAt/updatedAt.
- [x] **Progress:** getExcusedFastDays; breakdown "Broken (Z excused)"; CSV export.
- [x] **Settings:** Export includes journal; location impact line; Sunnah tooltip.
- [x] **Logic:** getTodayFastingLog last-entry for duplicate date; startFastingToday clears skippedDays; normalizeDayFoodLog between ?? []; getTotalHoursFasted skips in_progress.
- [x] **NotFound:** `<main id="main-content">`; "Return to Home" and "Go to Dashboard" links.

---

## 6. How to use this doc

- **Manual QA:** For each persona, run the flows in §2; for each page in §3, run the test prompts and edge cases.
- **E2E:** Map prompts to `visit`, `click`, `fill`, `selectOption`; assert DOM and localStorage; use fixtures for dates/location.
- **Regression:** After changes, re-run §3.3 (Dashboard), §3.7 (Journal), §3.8 (Progress), and §4 (cross-cutting).
- **New features:** Add new pages and flows to §2 and §3; add implementation items to §5.

**Reference:** Scenario narratives in `MANUAL-QA-SCENARIOS.md`; edge-case IDs in `EDGE-CASE-TEST-SCENARIOS.md`; form validation in `NEGATIVE-TESTING-FORMS.md`.
