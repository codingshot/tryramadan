# UX: Emotion-Centric Motivation — Positive Framing, Celebration Moments

This document reviews streaks, reminders, and analytics for punitive language; suggests alternative framing focused on encouragement; and designs three "celebration moments" for milestones: first fast, mid-Ramadan, and Eid reflection.

**Related:** [UX-EMOTIONAL-EXPERIENCE-AND-LAPSES.md](./UX-EMOTIONAL-EXPERIENCE-AND-LAPSES.md), [DashboardAchievements](../src/pages/DashboardAchievements.tsx).

---

## 1. Review: streaks, reminders, analytics — what might feel punishing

### 1.1 Streaks

| Element | Current | Punishing? | Why |
|---------|---------|------------|-----|
| **Streak tile (Dashboard)** | Number + "Day Streak" | Low | Neutral. |
| **Streak tooltip when > 0** | "Consecutive days you completed… Excused days don't reset — that's okay." | Low | Supportive. |
| **Streak tooltip when 0** | "Skipped or non-excused broken days reset the streak." | **Yes** | "Reset" + listing causes (skipped, broken) feels punitive. Focuses on what went wrong. |
| **Streak celebration (7, 15, 30)** | "Week streak!" / "Half-month streak!" / "Full month streak!" | Low | Positive. |
| **Badge: "Early Bird"** | "Never missed Suhoor" | **Yes** | "Never missed" centers absence; implies failure if you did miss. |

### 1.2 Reminders (notifications)

| Element | Current | Punishing? | Why |
|---------|---------|------------|-----|
| **Suhoor reminder** | "X minutes until suhoor ends (Imsak). Finish eating soon!" | Slight | "Finish eating soon!" can feel urgent or nagging; not punitive. |
| **Iftar reminder** | "X minutes until [iftar]. Prepare to break your fast!" | Low | Encouraging. |
| **Iftar time** | "It's time to break your fast. Bismillah! 🌙" | Low | Positive. |
| **Hydration** | "Log your water intake during non-fasting hours." | Low | Neutral. |
| **Sunnah day** | "Today is [reason]. Voluntary fasting is recommended." | Low | Informational. |

### 1.3 Analytics / stats

| Element | Current | Punishing? | Why |
|---------|---------|------------|-----|
| **Stats summary line** | "Completed: X · Broken: Y (Z excused) · Skipped: N" | **Yes** | "Broken" and "Skipped" sit next to completed; reads as failure categories. |
| **Broken fast tile** | Red/destructive styling, AlertTriangle icon, "Broken fast" label, count | **Yes** | Danger color + warning icon = "you did something wrong." |
| **DaysListDialog: "Broken fast days"** | Title + list of dates | **Yes** | Framed as list of failures. |
| **Total days tile** | "Total Days" + count | Low | Neutral. |
| **Sunnah days tile** | "Sunnah Days" + count | Low | Neutral. |
| **Progress page: fasting log** | "Broken (reason)" in red badge | **Yes** | Same as above. |
| **Progress: "Current Streak"** | Number | Low | Neutral. |
| **Daily missions: X/7** | "2/7" when incomplete | **Yes** | Incomplete count can feel like "you didn't do enough." |
| **Mission items unchecked** | Circle icon, strikethrough when done | Slight | Unchecked = not done; can feel like report card. |

### 1.4 Other touchpoints

| Element | Current | Punishing? | Why |
|---------|---------|------------|-----|
| **"You broke your fast today"** | Red-tinted card, Dashboard Today | **Yes** | Declarative, past tense; red = error. |
| **"Why did you break your fast?"** | BreakFastReasonDialog title | **Yes** | Puts user in defensive position. |
| **"Won't count as a broken fast"** | Subtext for "I didn't fast today" | Slight | Defines choice by what it avoids. |
| **Achievement: "Locked"** | Locked badges show "Locked" label | Slight | "Locked" implies you haven't earned it; can motivate or demotivate. |

---

## 2. Alternative framing — encouragement over absence

### 2.1 Principle

**Focus on presence, not absence.** Say what the user *has* done, not what they *missed*.

| Current (absence-focused) | Alternative (encouragement-focused) |
|---------------------------|-------------------------------------|
| "You missed 5 fasts" | "You've logged 15 days so far, mashallah." |
| "Skipped or non-excused broken days reset the streak" | "Your streak reflects consecutive days completed. Every day is a fresh start." |
| "Broken: 2 · Skipped: 3" | "15 completed · 2 rest days · 1 ended early" (or de-emphasize negative counts) |
| "Broken fast days" | "Days ended early" (or hide under "Details") |
| "Never missed Suhoor" | "Suhoor champion — logged every suhoor this week" (presence) |
| "2/7 missions" | "2 done — every bit counts" or "2 of 7 — optional ideas for today" |
| "No entry for this day" | "Ready when you are" or "Add a reflection when you'd like" |
| "You broke your fast today" | "You ended today's fast early. That's okay — your health matters." |

### 2.2 Copy variations by context

**A. Stats summary line**

| Context | Current | Alternative |
|---------|---------|-------------|
| **Dashboard** | "Completed: X · Broken: Y · Skipped: N" | "X days completed — mashallah" (primary) + "2 rest days, 1 ended early" (secondary, smaller) |
| **Progress page** | Same | "You've logged X days so far." + breakdown under "Details" if needed |

**B. Streak tooltip when 0**

| Current | Alternative |
|---------|-------------|
| "Skipped or non-excused broken days reset the streak." | "Your streak starts fresh today. Every day is a new chance." |
| | Or: "Streaks reflect consecutive days completed. Today is a fresh start." |

**C. Broken fast tile**

| Current | Alternative |
|---------|-------------|
| "Broken fast" + red + AlertTriangle | "Ended early" + muted styling + Sunset or Heart icon |
| | Subtext: "Days you paused the fast (e.g. health, travel)." |
| "Days you broke fast early." | "Days you ended the fast early — that's okay." |

**D. Total days tile**

| Current | Alternative |
|---------|-------------|
| "Total Days" + count | "X days completed" + optional "mashallah" for Muslim mode |
| | Subtext when > 0: "You've logged X days so far." |

**E. Daily missions**

| Current | Alternative |
|---------|-------------|
| "Today's missions" + "2/7" | "Today's gentle reminders" + "2 done — every bit counts" |
| | Or: "Optional ideas for today" |

**F. Reminders (optional softening)**

| Current | Alternative |
|---------|-------------|
| "Finish eating soon!" | "Suhoor ends in X minutes." (factual, less urgent) |
| | Or keep; it's not punitive. |

**G. Muslim mode — mashallah**

| Context | Suggestion |
|---------|------------|
| **Total days (≥ 1)** | "15 days completed — mashallah" |
| **Streak (≥ 5)** | "5-day streak — mashallah" |
| **First fast** | "First fast complete — mashallah" |
| **Mid-Ramadan** | "Halfway there — mashallah" |
| **Eid** | "Ramadan complete — mashallah, Eid Mubarak" |

*Non-Muslim mode:* Omit "mashallah"; use "Well done" or "You've logged X days so far."

---

## 3. Three celebration moments

### 3.1 First fast

**Trigger:** User marks a day complete for the first time (`progress.completedDays.length` goes from 0 to 1).

**Moment design:**

| Element | Content |
|---------|---------|
| **Placement** | Inline card on Dashboard (below status), or toast + optional modal/sheet |
| **Headline** | "First fast complete! 🌙" |
| **Body** | Muslim: "Mashallah — you did it. May it be the first of many." Non-Muslim: "You did it. Your first fast is complete." |
| **Visual** | Soft gold/green gradient; moon or checkmark icon; subtle confetti or sparkle (optional, respect `prefers-reduced-motion`) |
| **Action** | "Log what you ate" (link to day plan) or "Add a reflection" (link to Journal with date). Dismiss = hide for session. |
| **Persistence** | One-time per user; don't repeat. Store `celebratedFirstFast: true` in localStorage or preferences. |

**Implementation note:** Detect `completedDays.length === 1` and `!celebratedFirstFast`; show celebration; set `celebratedFirstFast = true`.

---

### 3.2 Mid-Ramadan

**Trigger:** `getRamadanDayNumber(today)` is 14 or 15 (halfway), and user opens Dashboard or marks that day complete.

**Moment design:**

| Element | Content |
|---------|---------|
| **Placement** | Inline card on Dashboard (dismissible); or toast when they mark day 14/15 complete |
| **Headline** | "Halfway there! 🏅" |
| **Body** | Muslim: "Mid-Ramadan — mashallah. You've come so far. Be kind to yourself in the second half." Non-Muslim: "You're past the halfway mark. Well done — the second half is often the hardest. Take care of yourself." |
| **Visual** | Warm gradient; trophy or medal icon; optional progress ring at 50% |
| **Action** | "Keep going" (dismiss) or "Add a reflection" (Journal with today's date). |
| **Persistence** | Once per Ramadan; e.g. `celebratedMidRamadan2025: true` (year-specific). |

**Implementation note:** When `getRamadanDayNumber(today)` is 14 or 15 and `!celebratedMidRamadan[year]`, show; set flag for that year.

---

### 3.3 Eid reflection

**Trigger:** Last day of Ramadan (`isLastDayOfRamadan(today)`) or first day after Ramadan (Eid al-Fitr). User opens app.

**Moment design:**

| Element | Content |
|---------|---------|
| **Placement** | Full-screen or large inline card on Dashboard; cannot be missed |
| **Headline** | "Eid Mubarak! 🌙" (or "Ramadan complete" for non-Muslim) |
| **Body** | Muslim: "Ramadan is complete. Mashallah — may your fasts be accepted and your Eid be blessed. Take a moment to reflect on your month." Non-Muslim: "Ramadan is complete. Well done — you made it through the month. Take a moment to reflect on your journey." |
| **Visual** | Festive gradient (gold, green); crescent/moon; optional subtle pattern (geometric, lanterns) |
| **Actions** | "Reflect on my month" (link to Journal with prompt: "What did Ramadan teach you? One thing you're grateful for.") + "View my progress" (Progress page) + "Eid Mubarak" (dismiss) |
| **Persistence** | Once per Eid; e.g. `celebratedEid2025: true`. |

**Eid reflection prompt (Journal):**

- Pre-fill or suggest: "What did Ramadan teach you this year?" or "One thing you're grateful for from this month."
- Optional: "Eid reflection" badge or tag for this entry.

**Implementation note:** When `isLastDayOfRamadan(today)` or `today === dayAfterRamadanEnd` and `!celebratedEid[year]`, show celebration; set flag.

---

## 4. Summary

| Area | Recommendation |
|------|----------------|
| **Streaks** | Replace "Skipped or non-excused broken days reset the streak" with "Your streak starts fresh today. Every day is a new chance." |
| **Reminders** | Mostly fine; optional: soften "Finish eating soon!" to "Suhoor ends in X minutes." |
| **Analytics** | Reframe stats: "X days completed — mashallah" primary; "Ended early" / "Rest days" secondary, muted. De-emphasize "Broken" and "Skipped." |
| **Encouragement** | Use "you've logged X days" over "you missed Y fasts"; add "mashallah" for Muslim mode where appropriate. |
| **First fast** | One-time celebration card: "First fast complete! Mashallah." + optional "Log meals" / "Add reflection." |
| **Mid-Ramadan** | Dismissible card on day 14/15: "Halfway there! Be kind to yourself in the second half." |
| **Eid** | Full celebration: "Eid Mubarak! Reflect on your month." + link to Journal with reflection prompt. |

Implementing these framings and celebration moments will keep all motivational elements positive and supportive rather than punishing.
