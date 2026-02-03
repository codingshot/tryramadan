# Dashboard Layout and Card Design Evaluation

This document evaluates the main dashboard view for clarity, hierarchy, and actionability. It describes what is visible at a glance, analyzes visual vs. actual importance, proposes a re-ordered layout, and defines “perfect day” vs. “messy day” dashboard states.

---

## 1. What Is Visible at a Glance on the Main View (Today)

When the user lands on the dashboard with **today** selected, the following information is visible without scrolling (above the fold varies by device; this assumes a typical mobile/tablet view and a ~800px viewport):

| Element | What the user sees | Location in current layout |
|--------|---------------------|----------------------------|
| **Fasting status** | “Right now: Fasting” or “Right now: Eating window”; “Currently fasting” / “Not fasting”; optional “Skipped” or “Mark complete” / “Fasted ✓” | First major card after header |
| **Countdown** | Live countdown “HH:MM:SS until Iftar” (when fasting) or “Next: Suhoor — HH:MM:SS” (when in eating window) | Inside the fasting status card |
| **Key times (Suhoor end / Iftar)** | Suhoor end (Fajr) and Iftar (Maghrib) times in a horizontal strip; optional Fajr/Maghrib labels on larger screens | Second block: prayer-times strip (link to Schedule) |
| **Today’s actions** | “I’m fasting” / “I didn’t fast today” (or “Break fast” when fasting); “Today’s schedule” collapsible with next prayer | Same block as key times; below the strip |
| **Meals (today’s plan)** | “Today’s plan” section: Suhoor and Iftar “Log what you ate” + Add (+) per meal; links to Schedule and Journal | Further down: “Day plan” card |
| **Key times (for selected day)** | For selected day, Suhoor end (Fajr) and Iftar (Maghrib) again in a small grid | Inside “Day plan” card |
| **Journal snippet** | “Journal” — either 2-line preview + “Grateful: …” + “Edit in Journal →” or “No entry for this day — Add in Journal” | Inside “Day plan” card |
| **Progress** | Streak, Total days, Sunnah days, Broken fast (4 stat tiles); “Completed: X · Broken: Y · Skipped: Z”; Progress ring “X of 30 days” | Stat tiles after “Main Timer” block; Progress ring lower on page |

**Summary at a glance:** The user can see **fasting status + countdown**, **Suhoor/Iftar times**, and **primary actions** (I’m fasting / I didn’t fast / Break fast). **Meals, journal snippet, and progress** require scrolling on most viewports.

---

## 2. Hierarchy: Visual vs. Actual Importance

### What *visually* appears most important

1. **Greeting + location + settings** — Large “Ramadan Mubarak” / “Your Fasting Journey” and day selector with arrows.
2. **Fasting status card** — Large card with border-2, primary tint when fasting; big countdown.
3. **Suhoor/Iftar time strip** — Prominent card linking to Schedule.
4. **Stat tiles (Streak, Total, Sunnah, Broken)** — Four equal-sized cards in a grid; Streak has gradient-gold icon.
5. **“Today’s plan” / Day plan** — Big card with meals, prayer times again, calories/macros, journal, mark complete.

### What is *actually* most important for today’s decisions and actions

1. **Am I fasting right now?** → Countdown to Iftar or to Suhoor. **Critical.**  
2. **When can I eat / when does the fast start?** → Suhoor end (Fajr) and Iftar (Maghrib). **Critical.**  
3. **One-time actions for today:** “I’m fasting,” “I didn’t fast today,” “Break fast,” “Mark complete.” **Critical.**  
4. **Log meals (Suhoor/Iftar)** — Supporting; needed when the user is planning or reflecting.  
5. **Journal** — Reflection; lower urgency for the immediate “what do I do now?”  
6. **Progress (streak, total, ring)** — Motivation and context; not required for the next 30 minutes.  
7. **Daily missions** — Helpful checklist; secondary to status and times.  
8. **Quick tip, Daily fact, Achievements, Quick access, Prayer grid, Hadith, This week** — All secondary or discovery.

**Gap:** The **stat tiles** and **day selector** get strong visual weight (size, position, icons). The **primary actions** (“I’m fasting,” “I didn’t fast today,” “Break fast”) sit in a row of buttons with less emphasis than the big status card. So “what to do right now” is clear in content but not always the dominant visual focus. The **Progress ring** is low on the page despite being a key motivator. **Journal** is buried inside the day-plan card.

---

## 3. Suggested Re-Ordered / Simplified Layout

Goal: **Today’s core actions are obvious; secondary insights are visible but not overwhelming.**

### Proposed order (top to bottom)

| Order | Block | Rationale |
|-------|--------|-----------|
| 1 | **Header** — Greeting, location, settings (unchanged) | Identity and context. |
| 2 | **Day selector** — Arrows + date + “Today” + “Go to today” (unchanged) | Needed for day context. |
| 3 | **Fasting status + countdown** (unchanged) | Single source of truth for “am I fasting?” and “how long?”. |
| 4 | **Key times only** — One compact row: Suhoor end (Fajr) · Iftar (Maghrib); link “Full schedule →”. | Reduce duplication; keep only what drives “when can I eat?”. |
| 5 | **Today’s actions** — Prominent row: “I’m fasting” / “I didn’t fast today” / “Break fast” + “Mark complete” (when today). | Elevate to a clear action bar so they compete visually with status. |
| 6 | **Today’s schedule** — Collapsible “Today’s schedule” with next prayer (unchanged). | Still useful; collapsed by default. |
| 7 | **Today’s plan (meals + journal snippet)** — Single card: Suhoor/Iftar “Log what you ate” (+), optional calories/macros, **journal one-liner + link**. | Meals and journal in one place; journal is a short line, not a big block. |
| 8 | **Daily missions** — Checklist (unchanged). | Supports “what else should I do today?”. |
| 9 | **Progress** — One row: Streak + Total + Ring (e.g. “X of 30”) with optional “Sunnah / Broken” as smaller chips or single line. | Unify progress so it’s scannable; avoid four equal big tiles. |
| 10 | **Secondary** — Quick tip, Daily fact, Quick access (compact), Emergency link. | Clearly “below the fold” supporting content. |
| 11 | **Discovery / deeper** — Prayer times grid, Hadith, This week, Achievements, Sunnah badge, Fasting log. | For users who scroll; optional or collapsible. |

### Simplification ideas

- **Single “key times” block:** Remove the duplicate Suhoor/Iftar block inside “Day plan” when the selected day is today; keep one strip at the top.
- **Progress as one row:** Replace four large stat tiles with one row: e.g. “Streak N · Total N · N/30” and a small ring or bar; “Sunnah” and “Broken” as secondary text or expandable.
- **Journal in “Today’s plan”:** Show one line of journal + “Edit in Journal →” instead of a large preview box when viewing today.
- **Quick access:** Keep as a compact link row; “Configure in Schedule” in settings or footer to reduce clutter.
- **Conditional blocks:** When “simplify by location” or “minimal dashboard” is on, hide or collapse: full prayer grid, Hadith, This week, until the user expands “More.”

---

## 4. “Perfect Day” vs. “Messy Day” Dashboard

### “Perfect day” dashboard (ideal state for today)

**Context:** User is fasting, has logged suhoor, will break at Maghrib; they open the app to check time and log iftar later.

**What should stand out:**

1. **Fasting status:** “Right now: Fasting” with clear countdown to Iftar (e.g. “02:14:33 until Iftar”).
2. **Key times:** Suhoor end 05:12 · Iftar 18:45 — no ambiguity.
3. **Single primary action:** “Break fast” when close to Maghrib, or no urgent action (just “Mark complete” at end of day).
4. **Today’s plan:** Suhoor shows “Logged” or 1–2 items; Iftar shows “Add” ready for later. Journal: one line or “Add entry” link.
5. **Progress:** Streak and “X/30” visible without dominating (e.g. “7 day streak · 12/30”).

**Layout takeaway:** Status and countdown are hero; key times are immediately under; “Break fast” is the only high-emphasis button when relevant. No red alerts, no “I didn’t fast” needed. Meals and journal are present but compact.

---

### “Messy day” dashboard (complex or stressful state)

**Context:** User is not sure if they’re fasting, or they broke fast early, or they haven’t logged anything yet and it’s already past suhoor.

**What should stand out:**

1. **Fasting status:** Still first — “Right now: Eating window” or “Not fasting” with “Next: Suhoor — 14:22:00” so they know when the next window is.
2. **Key times:** Same strip — Suhoor end and Iftar so they can plan the next meal.
3. **Primary actions:** “I’m fasting” and “I didn’t fast today” both visible and equally easy to tap; or “Break fast” if they are fasting and considering breaking. No ambiguity about what each does (tooltips/short copy).
4. **Today’s plan:** Clear “Log what you ate” for Suhoor and Iftar even if empty; optional “Mark complete” / “Yes, mark complete” so they can close the day correctly.
5. **Progress:** Streak and broken count visible (e.g. “Streak 0” or “Broken 1”) so they see impact without it feeling punitive.

**Layout takeaway:** Same order as perfect day (status → times → actions → plan → progress). The *content* changes (multiple buttons, empty meals, maybe “Broken” badge), not the layout. Critical is that **choices are obvious** (I’m fasting vs. I didn’t fast vs. Break fast) and **key times are never buried**.

---

## 5. Implementation Priorities

| Priority | Change | Impact |
|----------|--------|--------|
| P1 | Keep fasting status + countdown as the first content card; keep single key-times strip (Suhoor end, Iftar) directly under it. | Ensures “at a glance” answers: am I fasting? when can I eat? |
| P2 | Group “I’m fasting,” “I didn’t fast today,” “Break fast,” “Mark complete” into one clear action bar (same visual weight as status card or just below). | Makes today’s core actions obvious. |
| P3 | When selected date is today, do not repeat Suhoor/Iftar inside “Day plan”; or show them as small text. | Reduces duplication and scroll. |
| P4 | Consolidate progress: one row (Streak · Total · Ring) with Sunnah/Broken as secondary. | Reduces visual competition with status and actions. |
| P5 | Journal in “Today’s plan”: one-line snippet + “Edit in Journal →”; move long preview to Journal page. | Keeps journal visible but not overwhelming. |
| P6 | Add optional “minimal dashboard” or “simplify by location” that hides prayer grid, Hadith, This week until “Show more.” | Supports users who want only status, times, and actions. |

---

## 6. References

- **Navigation and IA:** `docs/UX-NAVIGATION-IA-EVALUATION.md`
- **First-time experience:** `docs/UX-FIRST-TIME-EXPERIENCE-REVIEW.md`
- **Dashboard implementation:** `src/pages/Dashboard.tsx`
- **Daily missions:** `src/components/DailyMissionsCard.tsx`
