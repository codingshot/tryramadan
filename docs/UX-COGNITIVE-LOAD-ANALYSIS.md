# UX: Cognitive Load Analysis — Ramadan Dashboard

This document identifies screens where users must think about too many things at once, lists the implicit questions each screen forces the user to answer, proposes concrete ways to reduce load, and provides one before/after example of a simplified screen.

**Related:** [UX-DASHBOARD-LAYOUT-AND-CARD-DESIGN.md](./UX-DASHBOARD-LAYOUT-AND-CARD-DESIGN.md) (layout/hierarchy), [UX-NAVIGATION-IA-EVALUATION.md](./UX-NAVIGATION-IA-EVALUATION.md) (navigation).

---

## 1. High cognitive-load screens (overview)

| Screen | Primary source of load | Severity |
|--------|------------------------|----------|
| **Dashboard** (`/dashboard`) | Many cards, toggles, stats, day selector, meals, journal, macros, and actions in one long scroll | **High** |
| **Dashboard Today** (`/dashboard/today`) | Status + timer + dual countdowns + intention + energy check-in + hydration + emergency CTA | **Medium–High** |
| **Dashboard Meals** (`/dashboard/meals`) | Tabs (Suhoor/Iftar), filters, recipe grid, selection, “Add to today,” custom meal form, grocery list | **Medium** |
| **Settings** (`/settings`) | Fasting path, priorities (Learning, Culture, Quran, macros, simplify), Advanced, Location, Notifications, Prayer alarms, Theme, Data | **High** |
| **Dashboard Journal** (`/dashboard/journal`) | Date picker, prompt, content, gratitude, mood, save, past entries list | **Medium** |
| **Dashboard Schedule** (`/dashboard/schedule`) | Calendar, day view, meal plans, food log, macros, quick-add events, export, quick-access config | **High** |

---

## 2. Per-screen: questions the user’s brain must answer

### 2.1 Main Dashboard (`/dashboard`)

To use the screen, the user effectively has to answer:

- **Am I fasting right now?** (status card vs. “Right now: Eating window”)
- **Is the date I’m looking at today or a past/future day?** (day selector + “Today” badge + “Go to today”)
- **Do I need to do something for today?** (“I’m fasting” / “I didn’t fast today” / “Break fast” / “Mark complete”)
- **When can I eat / when does the fast start?** (Suhoor end vs. Iftar strip; also repeated in “Day plan”)
- **Where do I log suhoor vs. iftar?** (two “Log what you ate” + buttons in “Today’s plan”)
- **Is this meal for today or for the selected day?** (selected date changes context for meals, journal, “Mark complete”)
- **Do I log here or on Schedule/Journal?** (“Past logs & meal plans (Schedule) →”, “Add in Journal”, “Calories & macros (optional)”)
- **What do Streak / Total / Sunnah / Broken mean, and which one matters now?** (four stat tiles + summary line)
- **Should I open “Today’s schedule” or go to Schedule page?** (collapsible vs. link)
- **What’s the difference between “Mark complete” (status row) and “Yes, mark complete” (day plan)?** (same action in two places when viewing today)
- **Are these calories/macros for the selected day or today?** (they follow selected date; easy to miss)
- **Which quick link do I need?** (long configurable list: Today, Goals, Schedule, Prayers, Meals, …)

**Net effect:** One screen answers “what’s my status?”, “what do I do next?”, “where do I log what?”, and “how am I doing overall?” all at once, with day context that can be today or another day.

---

### 2.2 Dashboard Today (`/dashboard/today`)

- **Did I already log today’s fast?** (You fasted today ✓ / You didn’t fast / You broke your fast / [buttons])
- **Which countdown matters right now — Iftar or Suhoor end?** (timer + two countdown cards)
- **What’s the difference between “I fasted today — mark complete” and “I broke my fast”?** (both visible when fasting)
- **Do I need to set an intention?** (optional textarea)
- **What energy level am I?** (1–5 with emoji; optional but prominent)
- **Can I log water now or only after Iftar?** (hydration section changes by fasting window)
- **Do I need the emergency break-fast CTA now?** (always visible at bottom)

**Net effect:** Status + two countdowns + progress bar + intention + energy + hydration + emergency in one flow. “What’s my one next step?” is under-specified.

---

### 2.3 Dashboard Meals (`/dashboard/meals`)

- **Am I planning Suhoor or Iftar?** (tabs)
- **Which region/diet do I care about?** (region + dietary filters)
- **Do I select recipes to “add to today” or to “log to food log”?** (two different actions)
- **Is “today” the app’s today or my timezone?** (implied by `today` in code; not surfaced)
- **Do I create a custom meal for Suhoor or Iftar?** (custom meal form has mealType)
- **What’s the grocery list for — selected recipes only?** (copy button; scope not restated)

**Net effect:** Planning (recipes, filters, add to schedule) and logging (log to food log, custom meal) live on the same page with shared tabs and filters.

---

### 2.4 Settings (`/settings`)

- **Am I “Non-Muslim” or “Muslim”?** (affects labels and tone)
- **Do I want voluntary Sunnah fasting, and which kind?** (Mon/Thu, Ayyam al-Beed)
- **What are my “priorities” and what do they change?** (Learning, Culture & recipes, Quran; Macro tracking; Simplify by location; “Apply to dashboard”)
- **Do I need to set gender/weight for calories?** (Advanced section)
- **Is my location set, and do I need to change it?** (Location search / auto-detect)
- **Which notifications do I want?** (Suhoor, Iftar, daily reminder + per-prayer if Muslim)
- **Do I want to export data or reset progress?** (Data section)

**Net effect:** Identity (mode, program, voluntary), personalization (priorities, advanced), location, notifications, and data all on one long page. “What will happen if I change this?” is often unclear.

---

### 2.5 Dashboard Journal (`/dashboard/journal`)

- **Which day am I writing for?** (date picker; can be past or “today”)
- **Is the prompt for that day or generic?** (prompt rotates by date)
- **Do I need to fill gratitude and mood?** (optional fields)
- **Did I save?** (no auto-save; “Entry saved” toast)
- **Am I editing an existing entry or creating new?** (content loads by selected date; not always obvious)

**Net effect:** Date + prompt + content + optional fields + save. Low clutter but “for which day?” and “saved or not?” can add load when switching dates.

---

### 2.6 Dashboard Schedule (`/dashboard/schedule`)

- **Which day am I looking at?** (calendar + day view)
- **Are these meal plans or food log entries?** (both; different semantics)
- **Do I add an event (Suhoor/Iftar/Fajr/…) or log food?** (quick-add templates vs. food log)
- **Where do I configure “quick access” and what does it do?** (reorder links for dashboard)
- **Is export “this month” or “all Ramadan”?** (export .ics)

**Net effect:** Calendar + day detail + meal plans + food log + events + export + quick-access config. One screen is both “see my week” and “configure dashboard.”

---

## 3. Proposals to reduce cognitive load

### 3.1 Grouping

- **Dashboard:** Group into three clear chunks:
  - **Right now:** Status + countdown + one row of actions (I’m fasting / I didn’t fast / Break fast / Mark complete). No duplicate “Mark complete” in day plan when viewing today.
  - **Today’s plan:** One block = key times (once) + log Suhoor/Iftar + optional calories/macros + journal snippet + single “Mark complete” for selected day.
  - **Context & discovery:** Stats (streak/total/sunnah/broken), progress ring, quick access, tip, hadith, week strip.
- **Settings:** Group into: **Who I am** (mode, program, voluntary), **Where & when** (location, timezone, notifications), **What I see** (priorities, theme, advanced), **Data** (export, reset). Use accordions or sub-pages so only one group is in focus at a time.

### 3.2 Progressive disclosure

- **Dashboard:** Collapse “Today’s schedule” by default (already done). Consider collapsing “Day plan” (meals, macros, journal) into “Today’s plan — expand to log meals & journal” so above-the-fold is status + times + primary actions only.
- **Dashboard Today:** Make “Today’s intention” and “How are you feeling?” collapsible or “Add intention” / “Quick check-in” so the default view is status + timer + countdowns + hydration. Show energy/hydration summary in one line when collapsed.
- **Settings:** Put “Advanced” (gender, weight) and “Data” (export, reset) behind “Show advanced settings” / “Show data & privacy” to reduce initial choices.
- **Dashboard Meals:** Separate “Plan meals (add to schedule)” from “Log what I ate” with a clear step or tab: e.g. “Plan” (recipes, add to today) vs. “Log” (custom meal, quick add to food log).

### 3.3 Step-wise flows

- **Logging a fast for today:** One path: “Did you fast today?” → [Yes → Mark complete] [No → I didn’t fast / I broke my fast]. Avoid offering both “I’m fasting” and “Mark complete” in the same glance when the user hasn’t started; show “I’m fasting” only before Maghrib and “Mark complete” after (or in a single “Log today’s fast” flow).
- **First-time Settings:** Optional “Setup wizard”: (1) Mode (Non-Muslim/Muslim), (2) Location, (3) Notifications on/off. Priorities and advanced stay in full Settings for later.
- **Journal:** Optional “Write for today” shortcut that sets date to today and focuses on one prompt + content; “Past entries” and date picker in a secondary view.

### 3.4 Better defaults

- **Dashboard:** When date is not today, show a clear banner: “You’re viewing [date]. [Go to today].” Default selected date = today on load.
- **Dashboard Today:** Default to “Mark complete” as primary CTA after Maghrib (or when user has already started fasting and time &gt; Maghrib); “I broke my fast” as secondary.
- **Dashboard Meals:** Default tab = time-of-day appropriate (Suhoor before Fajr, Iftar after Maghrib) or “Iftar” during Ramadan evening.
- **Settings:** Default “Simplify by location” = On; Learning = moderate; Culture = some. So dashboard quick access is useful without the user choosing.
- **Journal:** Default write date = today; prompt pre-filled; “Save” more prominent and optionally auto-save draft.

---

## 4. Before vs. after: simplified main Dashboard

### 4.1 Before (current)

- **Above the fold:** Greeting, location, settings, day selector (arrows + date + “Today” + “Go to today”), fasting status card (status + countdown + “Mark complete”/“Fasted ✓”), Suhoor/Iftar time strip, **and** action row (“I’m fasting” / “I didn’t fast today” / “Break fast”) + helper text + collapsible “Today’s schedule.”
- **Below:** Daily missions, four stat tiles (Streak, Total, Sunnah, Broken), summary line, then **Day plan** card: “Today’s plan” title, links to Schedule and Journal, prayer times again, Suhoor/Iftar “Log what you ate” + Add, Add-food dialog, Calories &amp; macros (4 inputs), Journal snippet, **another** “Mark complete” / “Go to today” block, Progress ring, streak celebration, Emergency link, Daily fact, Achievements, Quick access grid, Sunnah badge, Prayer times grid, Quick tip, Fasting log, Hadith, “This week” strip.

**User questions at once:** Is this today? Am I fasting? What do I tap first? Where do I log meals? Why two “Mark complete”? What do these four numbers mean?

### 4.2 After (simplified)

**Above the fold (single focus):**

1. **Header:** Greeting + location + settings (unchanged).
2. **Day context:** Compact line: “Viewing [date]” with [Go to today] if not today. (Arrows for changing day moved to a single “Change day” control or kept minimal.)
3. **One status card:**
   - Line 1: “Right now: Fasting” or “Right now: Eating window.”
   - Line 2: **Single countdown** (until Iftar **or** until Suhoor end), e.g. “02:45:30 until Iftar.”
   - Line 3: **One set of actions:**  
     - If not yet logged today: [I’m fasting] [I didn’t fast today].  
     - If fasting in progress: [Break fast].  
     - If after Maghrib and not yet marked: [Mark complete].  
     - If already done: “Fasted ✓” (tap to undo).  
   No duplicate “Mark complete” elsewhere when viewing today.
4. **Key times (one row):** “Suhoor end [time] · Iftar [time]” with link “Full schedule →”.

**Progressive disclosure:**

5. **“Today’s plan” (collapsed by default):** Summary line only, e.g. “2 meals logged · No journal entry · [Expand]”. Expand to show: Suhoor/Iftar add buttons, optional calories/macros, journal snippet, and **one** “Mark complete” for the selected day (or “Go to today to log” if future).

**Below (grouped context):**

6. **Progress:** One row: “X day streak · Y of 30 days” with progress ring; “Details” opens streak/total/sunnah/broken in a modal or secondary view.
7. **Quick actions:** Short list (e.g. Today, Schedule, Meals, Journal, Progress); “More” or “Configure” goes to Schedule.
8. **Rest:** Daily fact, tip, hadith, “This week” in a lower section or under “More.”

**Questions the user answers in order:**

1. **Is this today?** → Day context line.  
2. **Am I fasting / when can I eat?** → Status + single countdown + key times.  
3. **What do I do now?** → One row of actions (no duplicate).  
4. **Do I need to log meals or journal?** → Only after expanding “Today’s plan.”  
5. **How am I doing?** → One progress line; details on demand.

**Concrete changes:**

- **Single countdown** instead of two (show Iftar when fasting, Suhoor when in eating window).
- **Single “Mark complete”** for today (only in status card when date = today; remove from day plan when selected date is today).
- **Day plan collapsed by default** with a one-line summary; expand to log meals, macros, journal.
- **Stats (Streak/Total/Sunnah/Broken)** behind “Details” or a single “Progress” card that expands or links to Progress page.
- **Quick access** shortened to 4–5 primary links; “More” for the rest.
- **Emergency** kept but moved below the fold or in a subtle link.

This keeps the first 2–3 decisions (date, status, one action) on one screen and defers “where do I log meals/journal?” and “how’s my streak?” until the user expands or navigates.

---

## 5. Summary

| Screen | Main load | Key reduction |
|--------|-----------|----------------|
| **Dashboard** | Too many blocks and duplicate actions | One status + one countdown + one action row; day plan collapsed; stats behind “Details.” |
| **Dashboard Today** | Status + two countdowns + intention + energy + hydration + emergency | Single countdown; intention/energy collapsible; primary CTA by time of day. |
| **Meals** | Plan vs. log mixed; filters + tabs | Separate Plan vs. Log; or clear “Add to schedule” vs. “Log to food log.” |
| **Settings** | Many sections at once | Group (Identity / Where & when / What I see / Data); accordions or wizard; advanced hidden by default. |
| **Journal** | Date + prompt + content + optional fields | Default to today; single “Write for today” path; clear save state. |
| **Schedule** | Calendar + day + plans + log + events + config | Separate “Configure quick access” to Settings or a dedicated step; calendar vs. day view clearer. |

Applying **grouping**, **progressive disclosure**, **step-wise flows**, and **better defaults** as above should reduce the number of simultaneous decisions and make “what do I do next?” obvious on each screen.
