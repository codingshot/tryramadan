# UX: Emotional Experience Around Lapses

This document focuses on the **emotional experience** of using the app, especially around lapses: missed fasts, breaking a fast, inconsistent logging, and returning after time away. It identifies guilt/shame touchpoints, reviews current language and visuals, suggests self-compassionate alternatives, and designs a "returning after a lapse" screen.

**Related:** [FALL-OFF-AND-RETURN-FLOWS.md](./FALL-OFF-AND-RETURN-FLOWS.md) (return flows, no-guilt tone), [UX-COGNITIVE-LOAD-ANALYSIS.md](./UX-COGNITIVE-LOAD-ANALYSIS.md) (cognitive load).

---

## 1. Touchpoints where users might feel guilt or shame

### 1.1 Missed or broken fasts

| Touchpoint | Location | Why it may trigger guilt/shame |
|------------|----------|--------------------------------|
| **"Broken fast" stat tile** | Dashboard | Red/destructive styling, AlertTriangle icon, label "Broken fast" and count. Reads as a failure metric. |
| **"Break fast" button** | Dashboard, Dashboard Today | Destructive styling (red border/text). Signals "bad" action before they’ve even chosen it. |
| **"You broke your fast today"** | Dashboard Today | Shown in a red-tinted card (border-destructive/40, bg-destructive/10). Feels like a permanent verdict. |
| **Break fast reason dialog title** | BreakFastReasonDialog | "Why did you break your fast?" — frames the act as something to justify. (Subtext "No judgment" helps but title leads.) |
| **Fasting log row: "Broken (reason)"** | Dashboard, Dashboard Progress | Status badge "Broken" in red; can feel like a public record of failure. |
| **Stats summary line** | Dashboard | "Completed: X · Broken: Y (Z excused) · Skipped: N" — "Broken" and "Skipped" sit next to completed, inviting comparison. |
| **Streak tooltip when 0** | Dashboard | "Skipped or non-excused broken days reset the streak." — "reset" + listing causes can feel punitive. |
| **DaysListDialog title** | Dashboard | "Broken fast days" — list of dates framed as a list of failures. |

### 1.2 Skipped / "I didn't fast today"

| Touchpoint | Location | Why it may trigger guilt/shame |
|------------|----------|--------------------------------|
| **"Skipped" badge** | Dashboard status row | Small badge next to "Mark complete"; can feel like a second-class choice. |
| **"I didn't fast today" button** | Dashboard, Dashboard Today | Neutral styling but label is negative (what you didn’t do). No reframe as "Not fasting today (e.g. travel, health)." |
| **Tooltip** | Dashboard | "Won't count as a broken fast" — defines the choice by what it’s not. |
| **Stats: "Skipped: N"** | Dashboard | Groups "skipped" with "broken" in one summary; both can feel like failure categories. |

### 1.3 Inconsistent or missing logging

| Touchpoint | Location | Why it may trigger guilt/shame |
|------------|----------|--------------------------------|
| **Daily missions: X/7** | Dashboard (DailyMissionsCard) | Incomplete count (e.g. 2/7) can read as "you didn’t do enough today." |
| **Unchecked mission items** | DailyMissionsCard | "Complete or break your fast at iftar" etc. — unchecked = not done; can feel like a report card. |
| **"No entry for this day — Add in Journal"** | Dashboard day plan | "No entry" emphasizes absence; "Add in Journal" is task-focused, not encouraging. |
| **Journal: "You're writing for a future date but haven't written for today yet"** | Dashboard Journal | "haven't written" can sound accusatory; "so you don't miss it" implies they might fail. |
| **Journal: "No entries yet. Pick a date above and write."** | Dashboard Journal | Empty state is neutral but doesn’t affirm that starting later is okay. |
| **Schedule: "No fast logged"** | Dashboard Schedule (day detail) | States absence plainly; no reframe as "You can log this day when you’re ready." |
| **Schedule: "No items logged"** | Dashboard Schedule (suhoor/iftar sections) | Same pattern: focus on what’s missing. |
| **Streak = 0 after a gap** | Dashboard, Progress | Coming back to "0 day streak" after days away can feel like "you lost it." No "welcome back" or "today is a new start." |

### 1.4 Overeating / food logging

| Touchpoint | Location | Why it may trigger guilt/shame |
|------------|----------|--------------------------------|
| **Calories & macros (optional)** | Dashboard day plan | Optional but visible; empty or over-goal can trigger diet-culture guilt. No framing like "Rough estimate; no pressure." |
| **Macros page empty / over goal** | Dashboard Macros | Similar: numbers without a self-compassionate frame can amplify judgment. |

### 1.5 Reset / starting over

| Touchpoint | Location | Why it may trigger guilt/shame |
|------------|----------|--------------------------------|
| **Reset progress** | Settings | "Reset all progress" in destructive styling; confirmation lists "Current streak", "Longest streak" — reminds them what they’re "losing." |
| **"Yes, reset everything"** | Settings (confirm) | Final step feels drastic; no "Start fresh" or "This is okay" framing. |

---

## 2. Review: language and visuals that may amplify guilt

### 2.1 Language

- **"Broken" / "Break fast"** — "Broken" is a moral/mechanical term (broken promise, broken rule). "Break fast" is religiously standard but in UI can read as "you did something wrong." Alternatives: "Ended early," "Stopped early," "Paused fast."
- **"Skipped"** — Implies they chose to skip (avoid). For illness/travel it can feel blame-y. Alternative: "Not fasting (e.g. travel, health)" or "Rest day."
- **"Why did you break your fast?"** — Puts user in a defensive position. Alternative: "What’s the reason? (optional — helps us track.)" or "How would you describe it?"
- **"You broke your fast today"** — Declarative, past tense, sounds final. Alternative: "You ended today’s fast early" or "Today you paused your fast — that’s okay."
- **"Skipped or non-excused broken days reset the streak"** — "Reset" + "non-excused" feels rule-heavy. Alternative: "Your streak reflects consecutive days you completed or had an excused pause. Every day is a fresh chance."
- **"No entry" / "No items logged" / "No fast logged"** — Repeated "no" centers absence. Softer: "Nothing logged yet" or "Ready when you are" or "Add when you’d like."
- **"haven't written for today yet"** — "Haven’t" can sound like a reproach. Alternative: "You’re writing for a future date. Want to write today’s first?" (invitation, not accusation.)
- **"Won't count as a broken fast"** — Defines "I didn’t fast" by what it avoids. Alternative: "We’ll record it as a rest day (e.g. travel, health)."

### 2.2 Visuals

- **Red/destructive for "Broken" and "Break fast"** — Danger/error color for an allowed, often health-related choice can increase shame. Consider a neutral (muted) or soft amber for "ended early" so it’s distinct from "completed" but not alarm.
- **AlertTriangle for break fast and broken-fast tile** — Warning icon reinforces "something went wrong." Consider a gentler icon (e.g. Heart, SunSet, or a simple "pause" shape) for "ended early."
- **Broken-fast stat tile equal in size to Streak/Total/Sunnah** — Gives "broken" equal weight to positive metrics. Consider de-emphasizing: smaller tile, or under "More" / "Details," or reframed as "Days ended early" with supportive subtext.
- **"You broke your fast today" in a red card** — Entire block reads as an error state. Softer background (e.g. muted or secondary/10) and neutral or supportive copy reduce blame.
- **Progress log: red badge "Broken (reason)"** — Same: red = bad. Muted or secondary styling with "Ended early (reason)" is less punishing.

### 2.3 Interaction patterns

- **Break fast requires choosing a reason** — Necessary for tracking but can feel like confessing. Keep optional where possible; add a short line: "This helps us show you supportive content; no judgment."
- **No explicit "welcome back" after a gap** — User returns to same dashboard with streak = 0 and no acknowledgment. Adding a one-time or contextual "Good to see you again" or "Today is a new day" reduces the sting of "you’re back to zero."
- **Daily missions always visible** — Incomplete list can feel like a permanent to-do of failures. Reframing as "Today’s gentle reminders" or "Optional ideas for today" and celebrating partial progress ("2 done — every bit counts") softens the tone.

---

## 3. Suggested alternatives: self-compassion, learning, gentle encouragement

### 3.1 Copy changes (concise table)

| Current | Suggested alternative | Rationale |
|--------|------------------------|-----------|
| Broken fast | **Ended early** or **Paused** | Neutral, not moral. |
| Break fast (button) | **I need to end my fast early** or **End fast early** | Frames as need, not transgression. |
| Why did you break your fast? | **What’s the reason?** (subtext: *Optional — we use this to tailor support. No judgment.*) | Removes "break" and justifies the question. |
| You broke your fast today | **You ended today’s fast early.** *That’s okay — your intention and health matter.* | Normalizes and affirms. |
| Skipped | **Rest day** or **Not fasting today** | Rest day is positive; "not fasting" is factual. |
| I didn't fast today | **Not fasting today** (subtext: *e.g. travel, health — we’ll record it as a rest day.*) | Factual + one clear outcome. |
| Won't count as a broken fast | **We’ll record it as a rest day.** | Positive framing. |
| Skipped or non-excused broken days reset the streak | **Your streak is consecutive days completed or with an excused pause. Every day is a fresh start.** | Explains without "reset" or "non-excused." |
| Broken fast days (dialog title) | **Days you ended early** or **Early endings** | Softer label. |
| No entry for this day | **Nothing here yet** or **Ready when you are** | Softer empty state. |
| No items logged | **No items yet** or **Add when you’d like** | Invitation, not accusation. |
| You're writing for a future date but haven't written for today yet | **You’re writing for a future date.** *Want to add today’s entry first?* | Suggestion, not blame. |
| No entries yet. Pick a date above and write. | **No entries yet.** *Whenever you’re ready, pick a date and write a line or two.* | Affirms it’s okay to start anytime. |
| Reset all progress | **Start fresh** (subtext: *Clear all progress and begin again. You can download a backup first.*) | Positive action; backup reduces fear. |
| Yes, reset everything | **Yes, start fresh** | Aligns with "Start fresh." |

### 3.2 Visual and UI changes

- **"Ended early" tile (ex‑Broken fast):** Use **muted** or **secondary/10** background, no destructive color. Icon: **Sunset** or **Heart** instead of AlertTriangle. Label: "Ended early" with subtext "Days you paused the fast (e.g. health, travel)."
- **"End fast early" / "I need to end my fast early" button:** **Border-muted** or **secondary** with optional soft amber accent instead of full destructive. Or keep a soft red but add a short supportive line under it: *"Your health comes first."*
- **Dashboard Today — "You ended today’s fast early" block:** **bg-muted/50** or **secondary/10**, no red. One line of support: *"That’s okay — you can make up fasts later if you choose."*
- **Fasting log / Progress:** Status "Ended early (reason)" in **muted** or **secondary** badge, not red.
- **Stats summary:** "Completed: X · Ended early: Y (Z excused) · Rest days: N" — rename "Broken" and "Skipped" as above.
- **Daily missions:** Optional header tweak: "Today’s gentle reminders" and progress: "X of 7 — every step counts" when X &lt; 7.

### 3.3 Interaction patterns

- **After user selects "end fast early" and reason:** Brief confirmation: "Logged. Take care of yourself." (or similar) instead of silent redirect.
- **When streak is 0:** If we detect a recent gap (e.g. had progress, then no log for 2+ days), show a one-line nudge once: "Every day you’re here is a win. Ready to log today?" (see Returning screen below).
- **Rest day / Not fasting:** After they tap "Not fasting today," optional short message: "Recorded. We’ll keep today as a rest day. See you when you’re ready."
- **BreakFastReasonDialog:** Keep "No judgment — your intention matters" prominent; consider adding: "This helps us give you better support."

---

## 4. "Returning after a lapse" screen

### 4.1 Goal

When a user returns after a lapse (missed fasts, ended fasts early, or simply didn’t open the app for several days), the first experience should **welcome them back without blame**, affirm that returning is what matters, and offer a single clear next step (e.g. log today) without forcing backfill.

### 4.2 When to show

- **Option A (recommended):** Show when **last visit was 3+ days ago** (store `lastVisitDate` in localStorage on each dashboard load) **and** user has **some prior progress** (e.g. at least one completed day or one journal entry). Show **once per return** (dismissible; don’t show again until next 3+ day gap).
- **Option B:** Show when **streak is 0** and **today is not yet logged** and **they have completed days in the past**. Simpler but less precise (could show after one missed day).
- **Option C:** No automatic detection; add a **"I’ve been away"** or **"Returning after a break?"** link in footer or a small dashboard banner that opens this screen. User self-selects.

Recommendation: **Option A** for a clear "returning after a lapse" moment; Option C as fallback for users who want the experience without automatic detection.

### 4.3 Screen design: "Welcome back"

**Placement:** Full-screen overlay (modal) or a dedicated route (e.g. `/welcome-back`) that dashboard redirects to once when conditions are met. Dismissing goes to dashboard and sets a flag so we don’t show again until next qualifying gap.

**Tone:** Warm, short, no numbers that shame (no "You missed 10 days"). Optional soft illustration (e.g. moon, door, or gentle gradient).

**Layout (concise):**

1. **Headline (no blame)**  
   - *"Good to see you again"* or *"Welcome back"*

2. **One line of affirmation**  
   - *"Coming back is what matters."* or *"Every day you show up is a step."*

3. **Optional short line (contextual)**  
   - If they have completed days: *"You’ve already logged [X] days. Today is a fresh start."*  
   - If they have broken/ended-early days: *"Some days we pause — that’s okay. Today you can log however it goes."*  
   - Keep it to one sentence; avoid listing "broken" or "skipped" counts here.

4. **Single primary CTA**  
   - *"Log today"* or *"Go to today"* → navigates to dashboard with today selected (and optionally scrolls to status/actions).

5. **Secondary (low emphasis)**  
   - *"I’ll look around"* or *"Just browsing"* → dismiss and go to dashboard.

6. **No**  
   - "You haven’t logged in X days," "You missed Y fasts," "Catch up," or any streak/stat that highlights the gap.

**Visual:** Soft background (e.g. gradient primary/5 to secondary/5), no red, no warning icons. Button: primary or secondary style for "Log today"; muted/text for "Just browsing."

**Accessibility:** Focus trap in modal; headline as `h1`; dismiss and "Log today" both clearly labeled and keyboard-accessible.

### 4.4 Copy (full block for the screen)

**Headline:**  
Good to see you again

**Body (pick one or combine):**  
- Coming back is what matters.  
- Every day you show up is a step.  
- (If has completed days:) You’ve already logged some days — today is a fresh start.  
- (If has ended-early/skipped days:) Some days we pause. That’s okay. Today you can log however it goes.

**Primary button:**  
Log today

**Secondary link/button:**  
Just browsing

**Optional footer line (very small type):**  
You can add or edit past days anytime from the Schedule.

### 4.5 Implementation notes

- **lastVisitDate:** On Dashboard (or app shell) load, compare `new Date().toISOString().split('T')[0]` with stored `tryramadan-last-visit`. If same day, do nothing. Else update `tryramadan-last-visit`. When showing welcome-back, store `tryramadan-welcome-back-shown-at` (date or timestamp) so we don’t show again until there’s a new 3+ day gap.
- **"Has prior progress":** e.g. `progress.completedDays.length > 0` or `journalEntries.length > 0`.
- Reuse existing dashboard for "Log today"; no new logging UI on this screen.

---

## 5. Summary

| Area | Change |
|------|--------|
| **Touchpoints** | Identified: broken/skipped labels and tiles, break-fast button, reason dialog, empty states, daily missions, streak at 0, reset progress. |
| **Language** | Replace "Broken" / "Break fast" / "Skipped" with "Ended early" / "End fast early" / "Rest day"; soften "Why did you break…", "No entry," "haven’t written," reset copy. |
| **Visuals** | Move from destructive/red to muted or secondary for "ended early"; gentler icon than AlertTriangle; supportive line under "End fast early" button. |
| **Interactions** | Confirm after logging "ended early" or "rest day"; optional "Every day is a win" when streak is 0; keep reason dialog supportive. |
| **Returning screen** | "Good to see you again" + affirmation + one CTA "Log today" + "Just browsing"; show when last visit 3+ days ago and has prior progress; no blame or gap stats. |

Applying these changes keeps the app **accurate for tracking** while making the emotional experience around lapses **self-compassionate, learning-oriented, and gently encouraging**, and gives returning users a **clear, blame-free re-entry** via the welcome-back screen.
