# UX: Information Architecture & Navigation Evaluation

Evaluation of the Ramadan fasting/journal/meal dashboard navigation: current map, pain points, and a revised structure optimized for **Log today quickly**, **Review my past days**, and **Adjust settings and preferences**.

---

## 1. Current navigation map (with primary user job per destination)

### 1.1 Top nav (Navbar)

| Destination | Label | Primary user job |
|-------------|--------|-------------------|
| `/` | Logo "TryRamadan" | **Identify brand / go home** |
| `/` | "Fasting · X days" (when fasting) | **See I'm fasting; jump to dashboard** |
| `/` | Features | **Discover what the app does** (landing) |
| `/programs` | Programs | **Explore fasting programs** |
| `/health` | Health | **Learn about health** |
| `/recipes` | Recipes | **Find recipes** |
| `/culture` | Culture | **Explore culture** |
| `/faq` | About | **Get help / about** |
| `/settings` | Location (MapPin + truncate) | **Change location / open settings** |
| — | Time (clock) | **See current time (location TZ)** |
| `/dashboard` | User icon | **Enter my dashboard** |
| `/onboarding/welcome` | "Start your journey" (pre-onboard) | **Start onboarding** |

**Note:** No explicit "Dashboard" or "Log fast" in top nav. User icon and Fasting tag both go to `/dashboard`. Location opens Settings.

---

### 1.2 Dashboard (in-page structure)

| Element | Type | Primary user job |
|---------|------|-------------------|
| Day selector | In-page (arrows + date) | **Pick which day I'm viewing** |
| Status row | In-page | **Log today:** "I'm fasting" / "I didn't fast today" / "Mark complete" / "Break fast" |
| Suhoor/Iftar strip | Link → `/dashboard/schedule` | **See today's times; open full schedule** |
| Today's schedule | Collapsible | **See today's timeline** |
| Quick access | Link strip (configurable) | **Jump to:** Today, Goals, Schedule, Prayers, Meals, Macros, Learn, Glossary, Quran, Progress, Culture, Health, Journal, Achievements |
| "Configure quick access from Schedule" | Link → `/dashboard/schedule` | **Reorder quick links** |
| Prayer times grid | Link → `/dashboard/prayers` | **See prayer times; open Prayers** |
| Day detail (right/below) | In-page | **Add meal items, open Journal, mark day complete** |
| "Add in Journal" / "Edit in Journal →" | Link → `/dashboard/journal` | **Write or edit journal** |
| "Yes, mark complete" / "Go to today to log" | Button | **Log completion for selected day** |
| Progress ring | In-page | **See completion (X of 30)** |

**Critical actions on Dashboard:** Start fast ("I'm fasting"), Break fast, Mark complete, Skip ("I didn't fast today"), Add meal (in day detail), Open journal (link in day detail). All except "Add meal" are in the status row or day panel; "Add meal" is under day detail with suhoor/iftar add buttons.

---

### 1.3 Quick actions (dashboard strip) — configurable list

| id | Label | Path | Primary user job |
|----|--------|------|-------------------|
| today | Today | /dashboard/today | **Today's fast in detail (timer, intention, hydration)** |
| goals | Goals | /dashboard/goals | **Pre-Ramadan goals** |
| schedule | Schedule | /dashboard/schedule | **Calendar, meals per day, export .ics** |
| prayers | Prayers | /dashboard/prayers | **Prayer times, notifications** |
| meals | Meals | /dashboard/meals | **Meal planning, recipes** |
| macros | Macros | /dashboard/macros | **Macro tracking** (if enabled) |
| learn | Learn | /dashboard/learn | **Learn about Ramadan** |
| glossary | Glossary | /dashboard/glossary | **Islamic glossary** |
| quran | Quran | /dashboard/quran | **Quran reading** |
| progress | Progress | /dashboard/progress | **Review past days, stats, export** |
| culture | Culture | /dashboard/culture | **Culture explorer** |
| health | Health | /dashboard/health | **Health tracker** |
| journal | Journal | /dashboard/journal | **Reflection journal** |
| achievements | Achievements | /dashboard/achievements | **Badges** |

---

### 1.4 Bottom bar (FastingBottomBar — mobile only, when fasting)

| Destination | Label | Primary user job |
|-------------|--------|-------------------|
| — | Iftar countdown + "X days" | **See time left and days completed** |
| `/dashboard/today` | Today | **Today's fast** |
| `/dashboard/meals` | Meals | **Log meals** |
| `/emergency` | Break | **Break fast / emergency** |

**Note:** "Break" goes to `/emergency` (reassurance + log reason). No Journal or "Mark complete" in bottom bar.

---

### 1.5 Footer

| Section | Destinations | Primary user job |
|---------|--------------|-------------------|
| Quick Links | Features, Fasting Programs, Recipes, Culture, Health Benefits | **Discover / content** |
| Your fasting | Log your fast → /dashboard/today, Fasting state → /dashboard/progress, Log your meal → /dashboard/meals, Journal for today → /dashboard/journal, Quran of the day → /dashboard/quran, Dashboard → /dashboard | **Log fast, review state, log meal, journal, dashboard** |
| Resources | User Guides, Personas, Glossary, Hadith, Health & Safety, FAQ, Emergency, Settings | **Help, settings, emergency** |

---

## 2. Pain points (where users may hesitate)

### 2.1 Confusing or inconsistent labels

- **Top nav "About"** → `/faq`. Users may expect "About us" content, not FAQ.
- **"Fasting state"** (footer) → Progress. "State" is vague; "Progress" or "Fasting progress" is clearer.
- **"Log your fast"** (footer) vs **"I'm fasting"** (dashboard). One is action ("log"), one is status ("I'm fasting"); both lead to logging. Same intent, different wording.
- **Quick access "Today"** vs **Dashboard status row**. "Today" goes to `/dashboard/today` (detail page); logging (I'm fasting, Mark complete) is on the main Dashboard. Users might tap "Today" expecting to log, then not find "I'm fasting" if they think "Today" is the log screen.
- **"Configure quick access from Schedule"** — configuring dashboard links lives under Schedule; not obvious from the label that this is "reorder dashboard links."

### 2.2 Overlapping destinations

- **Dashboard** vs **Today** (`/dashboard` vs `/dashboard/today`): Dashboard has the main log actions (I'm fasting, Mark complete, Break fast) and day picker; Today has timer, intention, hydration, energy. "Log today" is split: start/break/complete on Dashboard, richer "today" experience on Today. Users may not know which to use for "log quickly."
- **Progress** vs **Achievements**: Progress = ring, streak, log, export; Achievements = badges. Both are "review my journey"; some overlap in mental model (streak appears on both).
- **Meals** (quick action) vs **day detail meal add** (Dashboard): Adding a meal can be done from Dashboard (day detail, suhoor/iftar add) or by going to Meals. Two entry points; power users may prefer one path.
- **Footer "Your fasting"** duplicates dashboard quick actions (Log your fast, Log your meal, Journal) but with different labels ("Log your fast" vs "Today").

### 2.3 Hidden or secondary critical actions

- **Logging a fast:** "I'm fasting" and "Mark complete" are on **Dashboard** only (above the fold in status row). Not in top nav, not in bottom bar as "Log." Bottom bar has "Today" and "Break" but not "Start fast" or "Mark complete." So "log today quickly" from another page requires: open Dashboard first.
- **Adding a meal:** Available in Dashboard day detail (add suhoor/iftar item) and via Meals. Day detail is below schedule strip and quick actions; on small screens it may be scrolled past. No "Add meal" in bottom bar.
- **Writing in journal:** "Add in Journal" / "Edit in Journal →" in day detail (and link from Journal quick action). Day detail is not always visible; Journal is one of many quick-action tiles. Easy to miss if user doesn’t scroll or doesn’t have Journal in their quick strip.
- **Settings:** Reached via location in top nav or footer "Settings (location, notifications)." No "Settings" in dashboard quick actions. Users who think "adjust my preferences" might look on Dashboard first.

---

## 3. Revised navigation and labeling (optimized for three jobs)

### 3.1 Design goals

1. **Log today quickly:** One obvious place to start/break/complete fast and a clear path to add meal and journal (from dashboard or one tap).
2. **Review my past days:** One primary "past" destination (calendar + stats), with clear labels.
3. **Adjust settings and preferences:** Settings visible and labeled consistently (e.g. "Settings" or "Preferences").

### 3.2 Proposed changes (summary)

| Area | Current | Proposed |
|------|---------|----------|
| **Top nav** | User icon → Dashboard; no "Log" | Keep User → Dashboard. Add optional "Log" or rely on Fasting tag + clearer "Dashboard" label on mobile. |
| **Dashboard** | Status row + quick strip + day detail | Keep status row prominent. Add a **primary CTA block**: "Log today" with: [Start fast] [Break fast] [Mark complete] [Skip today] and short links: "Add meal" · "Journal" so logging and related actions are in one glanceable block. |
| **Quick access** | Many tiles; "Today" = detail page | Rename or group: **Log & today:** Today, Meals, Journal (or single "Log day" that expands). **Review:** Schedule, Progress. **Learn & more:** Prayers, Learn, Goals, etc. Or keep tiles but put "Log" actions in a fixed strip above the tiles (Log today · Meals · Journal). |
| **Bottom bar (when fasting)** | Today, Meals, Break | Add **"Log"** or **"Complete"** (Mark complete) when relevant, or keep Today + Meals + Break and ensure "Today" screen surfaces "Mark complete" clearly. Option: "Today" | "Meals" | "Journal" | "Break" (4 items) so journal is one tap. |
| **Footer "Your fasting"** | Log your fast, Fasting state, Log your meal, Journal… | **Log:** "Log today’s fast" → /dashboard (or /dashboard/today). **Review:** "My progress & calendar" → /dashboard/progress (or /dashboard/schedule). **Meals & journal:** "Log meal" → /dashboard/meals, "Journal" → /dashboard/journal. Use consistent verb "Log" for actions. |
| **Settings** | Location (nav), Settings (footer) | Always label "Settings" (or "Settings & location"). Add Settings to dashboard quick actions by default (or in a "Me" / profile section). |

### 3.3 New label list (recommended)

| Context | Current label | New label | Note |
|---------|----------------|-----------|------|
| Top nav (mobile) | User icon, no text | "Dashboard" (sr-only or tooltip) | Clarify icon = Dashboard |
| Nav link | About → /faq | **FAQ** or **Help** | Match destination |
| Footer | Fasting state | **Progress** or **My progress** | Clearer than "state" |
| Footer | Log your fast | **Log today's fast** | Align with "log" language |
| Footer | Journal for today | **Journal** or **Write in journal** | Shorter or action-oriented |
| Footer | Dashboard | **Dashboard** (keep) | — |
| Quick access | Today | **Today** (keep) or **Today's fast** | Clarify it's the "today" detail page |
| Quick access | Progress | **Progress** or **My progress** | Match footer |
| Dashboard section | Quick access strip | **Shortcuts** or **Go to:** Today · Meals · Journal · Progress · … | Clarify these are shortcuts |
| Dashboard | "Configure quick access from Schedule" | **Edit shortcuts** or **Reorder shortcuts** (link to Schedule or a modal) | Action-oriented |
| Bottom bar | Break | **Break fast** (if space) or keep "Break" | Clear intent |
| Settings entry | Location (nav) | **Settings** (click opens Settings; location shown inside) or keep Location + tooltip "Settings" | So users know it’s full settings |

---

## 4. Simple navigation diagram

### 4.1 Current (simplified)

```
┌─────────────────────────────────────────────────────────────────┐
│ TOP NAV: Logo | Features Programs Health Recipes Culture About   │
│          [Location] [Time] [User] or [Start your journey]         │
│          (+ "Fasting · X days" when fasting → Dashboard)          │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│ DASHBOARD (/dashboard)                                           │
│  Day: [<]  Mar 15, 2026  [>]   Currently fasting  [Mark complete]│
│  [I'm fasting] [I didn't fast today]  or  [Break fast]            │
│  ─────────────────────────────────────────────────────────────   │
│  Suhoor/Iftar strip ────────────────────────────→ Schedule       │
│  Today's schedule (collapsible)                                  │
│  Quick access: [Today][Goals][Schedule][Prayers][Meals]...[Journal]│
│  "Configure quick access from Schedule"                          │
│  Prayer times grid ─────────────────────────────→ Prayers        │
│  Day detail: [+ Suhoor][+ Iftar]  Journal → "Add in Journal"      │
│  [Yes, mark complete] / [Go to today to log]                      │
│  Progress ring (X of 30)                                         │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│ BOTTOM BAR (mobile, when fasting only)                           │
│  Iftar in 2h 30m · 5 days    [Today] [Meals] [Break]             │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│ FOOTER: Quick Links | Your fasting (Log fast, Progress, Meals,   │
│         Journal, Quran, Dashboard) | Resources (Guides, Settings)│
└─────────────────────────────────────────────────────────────────┘
```

### 4.2 Proposed (simplified)

```
┌─────────────────────────────────────────────────────────────────┐
│ TOP NAV: Logo | Features Programs Health Recipes Culture FAQ     │
│          [Settings] (or [Location] → Settings) [Time] [Dashboard]│
│          (+ "Fasting · X days" when fasting → Dashboard)          │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│ DASHBOARD (/dashboard)                                           │
│  Day: [<]  Mar 15, 2026  [>]                                     │
│  ─── Log today ─────────────────────────────────────────────    │
│  [I'm fasting] [I didn't fast today]  or  [Break fast]            │
│  [Mark complete] (when applicable)                               │
│  Add meal · Journal  (short links next to status)                 │
│  ─────────────────────────────────────────────────────────────   │
│  Suhoor/Iftar strip ────────────────────────────→ Schedule       │
│  Today's schedule (collapsible)                                 │
│  Shortcuts: [Today][Meals][Journal][Progress][Schedule]…         │
│  [Edit shortcuts]                                                │
│  Prayer times ──────────────────────────────────→ Prayers         │
│  Day detail: meals, journal link, [Yes, mark complete]            │
│  Progress ring                                                   │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│ BOTTOM BAR (mobile, when fasting)                                │
│  Iftar in 2h 30m · 5 days  [Today] [Meals] [Journal] [Break fast]│
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│ FOOTER: Quick Links | Log & review (Log today's fast, Progress,  │
│         Meals, Journal) | Resources (Guides, FAQ, Settings)      │
└─────────────────────────────────────────────────────────────────┘
```

---

## 5. Implementation priorities

| Priority | Change | Impact |
|----------|--------|--------|
| **P1** | Group "Log today" on Dashboard: keep status row, add "Add meal" and "Journal" as small links next to it (or one line under) | Log today quickly: one block for fast + meal + journal |
| **P2** | Bottom bar: add Journal (Today · Meals · Journal · Break fast) so journal is one tap when fasting | Reduces hidden critical action |
| **P2** | Rename "About" → "FAQ" in top nav (or "Help") | Reduces confusion |
| **P3** | Footer: "Fasting state" → "Progress"; "Log your fast" → "Log today's fast"; optional section "Log & review" | Consistent labels and grouping |
| **P3** | "Configure quick access from Schedule" → "Edit shortcuts" (and consider modal for reorder without leaving Dashboard) | Clearer and possibly faster |
| **P4** | Add Settings to default quick actions or to a "Me" area so "Adjust settings" is findable from Dashboard | Supports "adjust preferences" job |
| **P4** | Optional: default quick-action order puts Today, Meals, Journal, Progress first for new users | Reinforces log + review |

---

**Related docs:** `USER-FLOWS-AND-TEST-PROMPTS.md`, `ONBOARDING-REONBOARDING-FLOWS.md`, `PERSONAS-DAY-IN-THE-LIFE-AND-EDGE-CASES.md`, `docs/accessibility.md` (skip link, landmarks).
