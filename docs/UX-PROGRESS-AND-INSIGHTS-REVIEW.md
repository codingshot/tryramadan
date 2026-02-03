# UX: Progress and Insights — Communication Review

This document describes the stats the app shows today, evaluates each for clarity, actionability, and emotional health, proposes 3–5 insight “stories” the app could tell, and suggests how to present progress and insights as guidance rather than judgment.

**Related:** [UX-EMOTIONAL-EXPERIENCE-AND-LAPSES.md](./UX-EMOTIONAL-EXPERIENCE-AND-LAPSES.md) (guilt/shame, self-compassion), [STREAKS-STATS-GAMIFICATION-FLOWS.md](./STREAKS-STATS-GAMIFICATION-FLOWS.md).

---

## 1. What stats the app shows today

### 1.1 Dashboard (main view)

| Stat | Where | How it’s shown |
|------|--------|------------------|
| **Day streak** | Stat tile (Flame icon) | Number + “Day Streak”; click opens list of dates in streak. Hidden if “Show streak and achievements” is off. |
| **Total days (completed)** | Stat tile (Calendar icon) | Number + “Total Days”; click opens list of completed dates. |
| **Sunnah days** | Stat tile (Moon icon) | Number + “Sunnah Days” (Mon/Thu voluntary); click opens list. |
| **Broken fast** | Stat tile (AlertTriangle, red) | Number + “Broken fast”; click opens list of dates. |
| **Summary line** | Below tiles | “Completed: X · Broken: Y (Z excused) · Skipped: N” |
| **Progress ring** | Lower on page | “X of 30 days” with ring fill = % of 30. |
| **Streak celebration** | Conditional | When streak ∈ {7, 15, 30}: “Week streak!” / “Half-month streak!” / “Full month streak!” |
| **Recent achievements** | Card | Last 3 unlocked badges (First Fast, Week One, etc.) + “View all”. |
| **Fasting log** | Card | Last 7 entries: date, start/end time, status (Done / Broken / In progress). |
| **This week** | Strip | 7 days with checkmark if completed; “Open Schedule” link. |

### 1.2 Dashboard Progress

| Stat | How it’s shown |
|------|------------------|
| **Days completed** | Number + “Days Completed” (secondary styling). |
| **Current streak** | Number + “Current Streak” (Flame). Shown only if showStreakAndAchievements. |
| **Completion rate** | “X%” + “Completion Rate” (TrendingUp, green). |
| **Badges earned** | Number + “Badges Earned”. |
| **Journal streak** | Number + “Journal streak (days)” — consecutive days with at least one journal entry. |
| **Mindful eating streak** | Number + “Both meals logged (days in a row)” — consecutive days with suhoor and iftar logged. |
| **Ramadan progress bar** | “X / 30 days” with filled bar and %. |
| **Energy over time** | Last 7 days: “Last: N/5” and optionally “Avg: N/5” per day (from Today’s Fast check-ins). |
| **Fasting tracker** | Recent log entries (date, times, status Done/Broken/In progress). |
| **Badges** | Earned (First Fast, Week One, Halfway, Consistent, Dedicated, Ramadan Champion, Eager Learner) and locked (e.g. Early Bird). |
| **Export** | Download CSV: completed days, total days, completion %, current/longest streak, fasting log. |

### 1.3 Dashboard Achievements

| Stat | How it’s shown |
|------|------------------|
| **Badges earned** | “X of Y badges earned”; grid of earned + locked badges with icon, name, short description. |

### 1.4 Other surfaces

- **Dashboard Today:** Hydration total vs goal (progress bar); energy check-ins (1–5) with latest; no aggregate “stats” beyond that.
- **Journal:** Mood (1–5) and gratitude per entry; no aggregate or correlation.
- **Settings (reset confirm):** Current streak, longest streak listed before “Yes, reset everything.”

### 1.5 What the app does *not* show (but has data for)

- **% of days tracked** (any log: fast complete/skip/broken) vs 30 — not shown explicitly; completion rate is “completed / 30” only.
- **Mood over time** or **mood vs fasting** — journal has mood per entry; no chart or correlation.
- **Hydration vs energy** — both exist (Today); no cross-view.
- **Journaling vs completion** — e.g. “On days you journaled, you completed the fast X% of the time” — not computed or shown.
- **Longest streak** — computed (`getLongestStreak`) and in CSV/Settings reset; not on main Progress overview.

---

## 2. Evaluation: understandable, actionable, emotionally healthy

### 2.1 At a glance

| Metric | Understandable at a glance? | Notes |
|--------|-----------------------------|--------|
| **Day streak** | Yes | “Consecutive days” is clear; tooltip explains excused vs resets. |
| **Total days** | Yes | “Days completed” is clear. |
| **Sunnah days** | Partial | “Sunnah” requires knowing Mon/Thu voluntary; label could add “(Mon/Thu)”. |
| **Broken fast** | Yes | Count is clear; label can feel judgmental (see Emotional health). |
| **Completion rate %** | Yes | “X% of 30” is clear. |
| **Progress ring (X of 30)** | Yes | Visual + number. |
| **Journal streak** | Partial | “Journal streak (days)” is clear; “consecutive days with an entry” could be in tooltip. |
| **Mindful eating streak** | Partial | “Both meals logged (days in a row)” is descriptive but long; “Suhoor + Iftar logged” might be clearer. |
| **Energy over time** | Partial | “Last: N/5” per day is clear; “1–5” scale could be labeled (e.g. Low → High) in a tooltip. |
| **Summary line (Completed · Broken · Skipped)** | Partial | Numbers are clear; “Broken” and “Skipped” together can read as failure list. |
| **Badges** | Yes | Icon + name + short description. |

### 2.2 Actionable

| Metric | Actionable? | Notes |
|--------|-------------|--------|
| **Day streak** | Weak | User can “try to keep streak” but no concrete next step (e.g. “Log today to keep it”). |
| **Total days** | Weak | Reflects past only; no “one more day” CTA. |
| **Completion rate %** | Weak | No suggested action when low (e.g. “Log past days” or “Today counts”). |
| **Journal streak** | Yes | Implies “write today to keep/start streak.” Could add soft CTA: “Write today to keep it.” |
| **Mindful eating streak** | Yes | Implies “log both meals today.” Could add: “Log suhoor & iftar today to keep it.” |
| **Broken fast** | No | Purely retrospective; no “make up” or “see tips” action. |
| **Energy over time** | Partial | Could prompt “Rest or hydrate” when low; not currently actionable. |
| **Badges** | Partial | Locked badges describe what to do; no in-context link (e.g. “Log a fast” → Dashboard). |

### 2.3 Emotionally healthy

| Metric | Emotionally healthy? | Notes |
|--------|----------------------|--------|
| **Day streak** | Risk when 0 | “Reset” language can feel punitive; see UX-EMOTIONAL-EXPERIENCE-AND-LAPSES. |
| **Total days** | Yes | Neutral count. |
| **Sunnah days** | Yes | Positive, optional. |
| **Broken fast** | No | Red, “Broken,” list of “failure” dates — can amplify shame. Prefer “Ended early” and neutral styling. |
| **Skipped** (in summary) | Risk | Grouped with “Broken”; “Skipped” can feel negative. “Rest days” framing is gentler. |
| **Completion rate %** | Risk when low | Big % can feel like a grade; “X of 30 days” is gentler than “Y%” alone. |
| **Progress ring** | Yes | Visual progress feels positive if not over-emphasized. |
| **Journal / Mindful eating streaks** | Yes | Celebrate consistency without punishing gaps. |
| **Energy over time** | Yes | Descriptive; avoid “low energy = bad” framing. |
| **Badges** | Yes | Celebratory; locked ones are “upcoming,” not “failed.” |

---

## 3. Proposed insight “stories” and where they appear

These are narrative, data-backed insights the app could surface so progress feels like **guidance** rather than a scoreboard.

### 3.1 Story 1: “You tend to complete more fasts when you journal”

- **Idea:** On days when the user has a journal entry, compare completion rate (completed that day vs not) over the last 2–4 weeks. If there’s a positive association, surface: “You’ve completed the fast more often on days you wrote in your journal.”
- **Where:** **Progress** page, in a small “Insight” or “What we noticed” card below the main stats; or **Journal** empty state / after saving: “People who journal often find it easier to stay consistent with fasting.”
- **Data needed:** Journal entries (date) + completedDays; simple ratio e.g. “completed on journal days” vs “completed on non-journal days” over a window. Only show if enough data (e.g. ≥5 journal days and ≥5 non-journal days).

### 3.2 Story 2: “Your energy is higher on days you log both meals”

- **Idea:** For days with both suhoor and iftar logged, compare average energy (from Today’s Fast check-ins) to days without both meals logged. If higher when both are logged: “On days you log suhoor and iftar, your energy check-ins tend to be higher.”
- **Where:** **Progress** (near “Energy over time” or “Mindful eating streak”), or **Meals** / **Schedule** after they add a second meal: “Logging both meals often goes hand-in-hand with feeling more energised.”
- **Data needed:** `todayStore` (energy per day), food log + meal plans (both meals yes/no per day). Only show if enough days with energy and meal data.

### 3.3 Story 3: “You’re X% through Ramadan — every day you log counts”

- **Idea:** Reframe “Completion rate” or “X of 30” as progress through the month, with a short line that normalises logging (including rest days / ended early) as part of the journey. E.g. “You’ve logged 12 of 18 days so far. Logging today helps you see your pattern.”
- **Where:** **Dashboard** (near progress ring or summary line) or **Progress** (near the bar). Rotate with a gentler line when completion is low: “Every day you log — whether you fast, rest, or end early — helps you see your journey.”
- **Data needed:** Already have completed + skipped + broken; can define “days tracked” = any of these. No new data.

### 3.4 Story 4: “Your best streaks often follow rest days”

- **Idea:** If the user has rest days (skipped) or ended-early days and then a run of completed days, surface: “After a rest day, you often string together several completed fasts. Rest can set you up for a strong run.”
- **Where:** **Progress** or **Dashboard** (e.g. when streak ≥ 3 and there’s at least one skipped/ended-early day in the last 14). One-off card or tooltip near streak.
- **Data needed:** completedDays, skippedDays, broken log; detect “rest then streak” pattern. Show only when pattern exists and data is sufficient.

### 3.5 Story 5: “Mood and fasting: your last 2 weeks”

- **Idea:** For users who have both mood (journal) and fasting status (completed/broken/skipped) for several days, show a simple summary: e.g. “On days you rated mood 4–5, you completed the fast 80% of the time” or “You’ve logged mood on X days — here’s how it lines up with fasting.” No blame; curiosity and pattern only.
- **Where:** **Progress** (new “Mood & fasting” card) or **Journal** (below mood selector): “See how mood and fasting line up” → link to Progress or a simple modal with 2–3 sentences + optional mini chart (e.g. avg mood on completed vs not).
- **Data needed:** Journal entries with mood; completedDays / broken / skipped. Only show if ≥5 days with mood and fasting status.

---

## 4. Presenting insights as guidance, not judgment

### 4.1 Verbal tone

- **Do:** Use “you” and “your” for ownership; “we noticed” or “your data shows” for attribution; “tend to,” “often,” “sometimes” to avoid absolutes; “every day you log,” “rest can help,” “logging helps you see.”
- **Avoid:** “You should,” “You failed to,” “Only X%,” “You’re behind”; single-number grades without context; “Broken” / “Skipped” as moral labels.
- **Examples:**
  - Instead of “Completion rate: 40%” alone → “You’ve completed 12 of 30 days. Many people find the middle stretch tough — logging today helps you see your pattern.”
  - Instead of “Broken: 2” as a tile → “2 days ended early (e.g. health, travel). You can make up fasts later if you choose.”
  - For Story 1 → “When you write in your journal, you’ve completed the fast more often. A short reflection might help today too.”

### 4.2 Visual treatment

- **Insight cards:** Use a **neutral or supportive** block (e.g. secondary/10 or muted border), not red or warning. Icon: lightbulb, book, trending-up, or heart — not a grade or cross.
- **Charts / numbers:** Prefer **progress and trends** (e.g. “up this week,” “X in a row”) over single big percentages. If showing %, pair with a sentence (e.g. “That’s 9 days — well into the second third of Ramadan”).
- **“Broken” / “Ended early”:** Use **muted or secondary** styling; avoid destructive color so it doesn’t read as “error.” Same for “Skipped” → “Rest days.”
- **Streak when 0:** Add a short line like “Today is a new day” or “Log today to start a new streak” so the focus is forward, not loss.
- **Placement:** Put **positive or neutral insights** (Stories 1, 2, 3, 4, 5) in **dedicated cards** or a single “Insights” section so they feel like **reflections**, not scores. Keep the main stats (numbers) but pair them with one-line guidance where it helps.

### 4.3 Interaction

- **Optional dismissal:** Let users dismiss an insight once (“Got it”) so it doesn’t repeat; store per-user or per-session.
- **Progressive disclosure:** “What we noticed” or “See insight” expands to the full sentence + optional “How we got this” (one line: e.g. “From your last 14 days of journal and fasting logs”).
- **No popups for “bad” stats:** Don’t interrupt with “Your streak reset” or “You’re below 50%.” If we mention streak or completion, do it in context with a forward-looking line.

### 4.4 Where to add guidance lines (no new stories)

| Location | Suggestion |
|----------|------------|
| **Dashboard summary line** | After “Completed: X · …”, add: “Every day you log helps you see your journey.” (or rotate). |
| **Progress: Completion rate** | Under the %, add: “X of 30 days. Logging today keeps your picture up to date.” |
| **Progress: Journal streak** | If > 0: “Writing today keeps your streak.” If 0 and they have entries: “Add a line today to start a new streak.” |
| **Progress: Mindful eating streak** | If > 0: “Log suhoor and iftar today to keep it.” |
| **Streak tile (when 0)** | Tooltip or subtext: “Today is a new day. Log today to start a new streak.” |
| **Broken / Ended early tile** | Relabel to “Ended early”; subtext: “Days you paused (e.g. health, travel). Make-up fasts are possible later.” |

---

## 5. Summary

| Area | Current state | Recommendation |
|------|----------------|----------------|
| **Stats listed** | Streak, total, sunnah, broken, completion %, progress ring, journal streak, mindful eating streak, energy over time, badges, fasting log. | Keep; add optional “days tracked” (any log) if useful. |
| **Understandable** | Most clear; Sunnah, journal/mindful labels could be clarified with tooltips. | Add one-line tooltips where needed. |
| **Actionable** | Weak for streak/total/completion; better for journal and mindful eating. | Add soft CTAs (“Log today,” “Write today,” “Log both meals”). |
| **Emotionally healthy** | “Broken” and “Skipped” and streak reset can feel punitive. | Reframe as “Ended early,” “Rest days”; add forward-looking copy; neutral styling. |
| **Insight stories** | None today. | Add 3–5 data-backed stories (journal ↔ completion, meals ↔ energy, “every day counts,” rest then streak, mood & fasting); place on Progress and/or contextual surfaces. |
| **Tone and visuals** | Some metrics read as scores. | Use guidance language, neutral/supportive visuals, optional dismissal, no shame popups. |

Implementing the verbal and visual tweaks above, plus 1–2 of the simplest stories (e.g. Story 3 and Story 1), will make progress and insights feel more like **guidance** and **reflection** and less like **judgment**.
