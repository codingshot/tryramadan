# UX: Emotional and Physical Fatigue Periods — Low-Energy Modes, Micro-Breaks, Self-Kindness Copy

This document defines simplified UX modes for low-energy users (mid-Ramadan burnout, lack of sleep), suggests gentle nudges and micro-break recommendations, and creates "self-kindness" copy variations that appear dynamically after multiple skipped days.

**Related:** [UX-EMOTIONAL-EXPERIENCE-AND-LAPSES.md](./UX-EMOTIONAL-EXPERIENCE-AND-LAPSES.md), [UX-SUHOOR-ONE-HANDED-USE.md](./UX-SUHOOR-ONE-HANDED-USE.md), [FALL-OFF-AND-RETURN-FLOWS.md](./FALL-OFF-AND-RETURN-FLOWS.md).

---

## 1. Simplified UX modes for low-energy users

### 1.1 Context: when users are fatigued

| Period | Why | Typical symptoms |
|--------|-----|------------------|
| **Mid-Ramadan (days 12–18)** | Cumulative sleep debt, altered circadian rhythm, dehydration, social fatigue | Slower decisions, aversion to long forms, reduced patience |
| **Late suhoor / early morning** | Sleep deprivation, pre-dawn grogginess | One-handed use, minimal reading, need for big targets |
| **Post-iftar slump** | Full stomach, evening wind-down | Low motivation for logging, reflection, missions |
| **Multiple skipped days** | Guilt, overwhelm, "what's the point" | Avoidant behavior; need for gentle re-entry |

### 1.2 Simplified mode: definition

**Goal:** Reduce cognitive load, motor precision, and choice overload so users can complete core actions (check times, log fast, log meal, add one-line note) with minimal effort.

| Dimension | Standard mode | Simplified / low-energy mode |
|-----------|---------------|------------------------------|
| **Touch targets** | Min 44×44px | **Min 48×52px** for primary actions; full-width buttons on mobile |
| **Text density** | Full copy, tooltips, explanations | **Minimal text** — key labels only; explanations hidden or one line |
| **Choices per screen** | 3–7 (e.g. day plan: suhoor + iftar + journal + missions) | **1–3** — one primary action; secondary actions collapsed or behind "More" |
| **Primary action** | May require scroll | **Above the fold** — status + one clear CTA |
| **Forms** | Full fields (name, cal, portions) | **Presets** — e.g. "Oats," "Dates," "Water" — one tap; optional "Other" |
| **Daily missions** | Always visible, 5–7 items | **Hidden or collapsed** — or shown as "1 gentle reminder" max |
| **Stats** | Streak, Total, Sunnah, Broken, Skipped | **Streak + one number** — e.g. "X days completed"; rest under "Details" |
| **Animations** | Standard | **Reduced** — respect `prefers-reduced-motion`; shorter/calmer |

### 1.3 How to activate simplified mode

| Trigger | Behavior |
|---------|----------|
| **User toggle (Settings)** | "Simplified mode" switch — always on when enabled. User chooses. |
| **Time-of-day (optional)** | Auto-enable during suhoor window (e.g. 30 min before Fajr to Fajr) if user has previously used app in that window. |
| **Mid-Ramadan (optional)** | If `getRamadanDayNumber(today)` is 12–18 and user has `showStreakAndAchievements` off or has skipped 2+ days recently, offer: "Feeling tired? Try simplified mode." One-time prompt. |
| **Return after 3+ days away** | On first load after gap: optional banner "Welcome back. Switch to simplified mode for an easier experience?" with "Try it" / "No thanks." |

### 1.4 Simplified mode: concrete changes

| Screen | Standard | Simplified |
|--------|----------|------------|
| **Dashboard** | Day selector, status, Suhoor/Iftar strip, 4 action buttons, day plan, missions, stats (4 tiles), quick access | **Hero:** "Right now: [Fasting / Eating]" + key time (e.g. "Iftar at 19:24"). **One CTA:** "I'm fasting" or "Mark complete" or "I didn't fast today" — full width. Day plan + missions **collapsed**. Stats: single line "X days · streak Y" with "Details" link. |
| **Today** | Status, timer, intention, energy, hydration, emergency | **Hero:** Timer + next time. **One CTA** (Break fast / Mark complete / I didn't fast). Intention, energy, hydration **collapsed** or hidden. |
| **Meals (add food)** | Name input, Cal, Portions, Cancel, Add | **Presets:** "Oats," "Dates," "Toast," "Water," "Other" — one tap to log. "Other" opens minimal form (name only). |
| **Journal** | Date picker, prompt, textarea, mood, gratitude, Save | **Single field:** "Note for today" — one line. "More in Journal" link for full editor. |
| **Schedule** | Calendar, day detail, meals, note | **Today only** — show today's key times + "Log suhoor" / "Log iftar" presets. Calendar **collapsed** or hidden. |

### 1.5 Fallback when simplified mode is off

- User keeps standard mode. All fatigue-focused improvements (larger touch targets, presets) can still be implemented in standard mode as **defaults** — e.g. presets in add-food dialog benefit everyone; simplified mode just hides the rest.

---

## 2. Gentle nudges and micro-break recommendations

### 2.1 When to show

| Trigger | Nudge type | Example |
|---------|------------|---------|
| **Mid-Ramadan (day 12–18)** | Micro-break | "Mid-Ramadan can be tough. Take a breath — you're doing well." |
| **User has been in app 2+ min, no action** | Optional pause | "No rush. Want a moment to rest?" (dismissible) |
| **After marking complete** | Gentle affirmation | "Well done. Rest if you need it." |
| **After breaking fast (with reason)** | Supportive | "You took care of yourself. That matters." |
| **Streak = 0, user returns** | Re-entry | "Today is a fresh start. Whatever you do, you're here." |
| **Late evening (e.g. after Isha)** | Wind-down | "Tomorrow's another day. Rest well." |

### 2.2 Micro-break recommendations (content bank)

| Context | Copy (short) | Action (optional) |
|---------|--------------|-------------------|
| **Generic** | "Take a breath. You're okay." | — |
| **Mid-Ramadan** | "We're past halfway. It's okay to slow down." | — |
| **Post-iftar** | "You've broken your fast. Rest if you need it." | — |
| **After logging** | "Logged. One less thing to think about." | — |
| **Multiple skipped** | "Coming back is what matters." | — |
| **Tired user** | "Rest is part of the journey too." | — |

### 2.3 Placement

| Placement | When | What |
|-----------|------|------|
| **Toast (polite)** | After key actions (mark complete, break fast, log meal) | One line of affirmation; auto-dismiss 3–5s. |
| **Inline card (dismissible)** | Mid-Ramadan + first load of day | "Mid-Ramadan can be tough. Take a breath — you're doing well." Dismiss = hide for rest of day. |
| **Empty state** | Journal, Schedule note — when empty | "A line or two is enough. Or skip — that's okay too." |
| **Bottom of Dashboard** | When streak = 0 and `skippedDays.length >= 2` | Soft banner: "Every day you show up counts." (see §3) |

### 2.4 Frequency

- **Not every action** — avoid nudge fatigue. Max 1 "micro-break" style message per session.
- **Rotate** — don't show the same phrase every time; use content bank.
- **User preference (optional):** "Show gentle reminders" toggle in Settings — default on; some users prefer minimal copy.

---

## 3. Self-kindness copy variations (multiple skipped days)

### 3.1 Triggers for dynamic copy

| Trigger | Condition | When to show |
|---------|-----------|--------------|
| **Consecutive skips** | 2+ consecutive days in `skippedDays` | On Dashboard load when today is in streak of skips, or when user opens app after skipping yesterday. |
| **Total skips** | `skippedDays.length >= 3` in current Ramadan | On Dashboard or Progress when user views stats. |
| **Return after gap** | Last activity was 3+ days ago; no log for those days | First load after return. |
| **Mid-Ramadan + skips** | `getRamadanDayNumber(today)` in 12–18 AND `skippedDays.length >= 2` | On Dashboard. |
| **Streak = 0** | After any of the above | Replace or supplement default "0 day streak" messaging. |

### 3.2 Copy variations by trigger

**A. After 2+ consecutive skipped days**

| Slot | Copy |
|------|------|
| **Dashboard hero (when today not yet logged)** | "Today is a new day. Whatever you choose, you're here." |
| **Stats area (when streak = 0)** | "Your streak starts fresh today. That's okay." |
| **"I didn't fast today" confirmation** | "Recorded. You can always start again tomorrow." |
| **Optional banner** | "A few rest days don't define your month. You're still part of this." |

**B. After 3+ total skipped days this Ramadan**

| Slot | Copy |
|------|------|
| **Stats summary** | "X days completed · Y rest days. Every day you log is a win." |
| **Progress page** | "You've logged X days so far. That's real progress." |
| **Streak tooltip (when 0)** | "Streaks reset after rest days — and that's okay. Today is a fresh start." |

**C. Return after 3+ days away (no logging)**

| Slot | Copy |
|------|------|
| **Dashboard (first load)** | "Good to see you again. No pressure — today is a new start." |
| **Stats** | "You're back. That's what matters." |
| **Optional one-time card** | "Coming back is the hard part. You did it. Take it one day at a time." |

**D. Mid-Ramadan (day 12–18) + any skips**

| Slot | Copy |
|------|------|
| **Dashboard banner** | "Mid-Ramadan can be exhausting. Be kind to yourself." |
| **Stats** | "You're past halfway. Rest days are part of the journey." |
| **"I didn't fast today"** | "Recorded. Many find the middle of Ramadan the hardest. You're not alone." |

### 3.3 Copy bank (reusable phrases)

Use these across triggers; rotate to avoid repetition.

| Category | Phrases |
|----------|---------|
| **Welcome back** | "Good to see you again." / "You're back. That matters." / "Coming back is what matters." |
| **Fresh start** | "Today is a new day." / "Today is a fresh start." / "Every day you show up counts." |
| **Rest days** | "Rest days are part of the journey." / "A few rest days don't define your month." / "You can always start again tomorrow." |
| **Streak = 0** | "Your streak starts fresh today. That's okay." / "Streaks reset — and that's okay." |
| **Self-compassion** | "Be kind to yourself." / "You're not alone." / "Take it one day at a time." |
| **Progress** | "Every day you log is a win." / "You've logged X days so far. That's real progress." |
| **Mid-Ramadan** | "Mid-Ramadan can be exhausting." / "Many find the middle of Ramadan the hardest." / "We're past halfway. It's okay to slow down." |

### 3.4 What not to say

| Avoid | Why |
|-------|-----|
| "You missed X days" | Emphasizes absence; increases guilt. |
| "Catch up" / "Get back on track" | Implies they're behind; performance pressure. |
| "Don't give up" | Implies they might; can feel preachy. |
| "You can do better" | Judgment; undermines self-compassion. |
| "X days left — make them count" | Pressure; dismisses rest as valid. |

---

## 4. Implementation checklist

| Item | Priority | Notes |
|------|----------|-------|
| **Simplified mode toggle** | High | Settings → "Simplified mode" — reduces Dashboard/Today to hero + one CTA. |
| **Larger touch targets (global)** | High | Min 48×48px for primary buttons; full-width CTAs on mobile. |
| **Presets for add-food** | High | "Oats," "Dates," "Toast," "Water," "Other" — one tap; benefits all users. |
| **Self-kindness copy (2+ consecutive skips)** | High | Dashboard hero + stats when `skippedDays` has 2+ consecutive dates including yesterday. |
| **Return-after-gap copy** | Medium | "Good to see you again" when last activity 3+ days ago. |
| **Mid-Ramadan nudge** | Medium | Day 12–18: optional dismissible banner "Mid-Ramadan can be tough. Be kind to yourself." |
| **Micro-break toasts** | Medium | After mark complete / break fast: "Well done. Rest if you need it." (rotate). |
| **Simplified mode auto-suggest** | Low | Mid-Ramadan + skips: one-time "Try simplified mode" prompt. |
| **`prefers-reduced-motion`** | Medium | Already in accessibility; ensure simplified mode uses it. |

---

## 5. Summary

| Area | Recommendation |
|------|----------------|
| **Simplified mode** | Toggle in Settings; hero + one CTA, collapsed missions/stats, presets for meals, minimal Journal. Activate by user choice or optional auto-suggest (mid-Ramadan, return after gap). |
| **Touch & density** | Min 48×52px primary targets; minimal text; 1–3 choices per screen in simplified mode. |
| **Micro-breaks** | Gentle nudges after key actions, mid-Ramadan, return; rotate from content bank; max 1 per session. |
| **Self-kindness copy** | Dynamic phrases when 2+ consecutive skips, 3+ total skips, return after gap, or mid-Ramadan + skips. Avoid guilt language; use "fresh start," "rest days," "you're back." |

Implementing simplified mode, presets, and self-kindness copy will make the app usable and supportive during fatigue periods without demanding more from users who are already depleted.
