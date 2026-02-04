# UX: Context-Aware Experiences — Time, Usage, and Safeguards

This document imagines the app reacting intelligently based on time of day (pre-dawn, midday, iftar, night); defines adaptive behaviors based on usage (e.g. "resume your journal" in the evening if skipped earlier, or adjusting reminders); and lists edge cases where over-automation would feel creepy or disrespectful, with defined safeguards.

**Related:** [UX-CONTEMPLATIVE-REFLECTION.md](./UX-CONTEMPLATIVE-REFLECTION.md), [UX-FATIGUE-AND-LOW-ENERGY-MODES.md](./UX-FATIGUE-AND-LOW-ENERGY-MODES.md), [Dashboard getQuickTip](../src/pages/Dashboard.tsx).

---

## 1. Time-of-day state changes

### 1.1 Time windows (definition)

Use **prayer times** when available (location set); else **fallback ranges** (approximate).

| Window | Prayer-based | Fallback (no location) | Character |
|--------|--------------|------------------------|-----------|
| **Pre-dawn** | Before Fajr (or Imsak) | 03:00–06:00 | Suhoor window; sleepy; minimal |
| **Dawn–midday** | Fajr–Dhuhr | 06:00–12:00 | Early fast; gentle energy |
| **Midday** | Dhuhr–Asr | 12:00–16:00 | Mid-fast; patience |
| **Late afternoon** | Asr–Maghrib | 16:00–Maghrib | Countdown; anticipation |
| **Iftar** | Maghrib ± 30 min | Maghrib ± 30 min | Break fast; gratitude |
| **Post-iftar** | Maghrib+30 – Isha+60 | 19:00–22:00 | Calm; reflection |
| **Night** | After Isha+60 | 22:00–03:00 | Wind-down; journaling |

### 1.2 Background themes (subtle)

| Window | Theme shift | Rationale |
|--------|-------------|-----------|
| **Pre-dawn** | Slightly darker, cooler (e.g. deep blue/navy undertone) | Night mood; reduce glare |
| **Dawn–midday** | Standard (cream/emerald) | Neutral |
| **Midday** | Slightly warmer (gold tint) | Sun at peak |
| **Late afternoon** | Soft orange/sunset gradient accent | Approaching iftar |
| **Iftar** | Brief warm highlight (gold, celebratory) | Ritual moment |
| **Post-iftar** | Calm, muted (slightly softer) | Wind-down |
| **Night** | Darker, cooler (matches dark mode if on) | Sleep prep |

**Implementation:** CSS variables or theme classes that shift subtly; avoid jarring transitions. Respect user theme (light/dark); time-of-day is a *tint*, not override.

### 1.3 Greetings

| Window | Current | Ideal (time-aware) |
|--------|---------|--------------------|
| **Pre-dawn** | "Ramadan Mubarak" / "Your Fasting Journey" | "Good night" / "Suhoor time" / "Before dawn" |
| **Dawn–midday** | Same | "Ramadan Mubarak" / "Good morning" / "Your Fasting Journey" |
| **Midday** | Same | "Ramadan Mubarak" / "Midday — halfway there" / "Your Fasting Journey" |
| **Late afternoon** | Same | "Ramadan Mubarak" / "Almost iftar" / "Your Fasting Journey" |
| **Iftar** | Same | "Iftar Mubarak" / "Time to break your fast" / "Bismillah" |
| **Post-iftar** | Same | "Ramadan Mubarak" / "Good evening" / "Your Fasting Journey" |
| **Night** | Same | "Ramadan Mubarak" / "Good night" / "Your Fasting Journey" |

**Principles:** Keep "Ramadan Mubarak" as primary when in Ramadan; add time-of-day subline (e.g. "Good morning") or swap for ritual moment ("Iftar Mubarak"). Non-Muslim: "Your Fasting Journey" + optional time greeting.

### 1.4 Data emphasis (what to surface when)

| Window | Emphasize | De-emphasize |
|--------|-----------|--------------|
| **Pre-dawn** | Suhoor end countdown, "Log suhoor" CTA, key times | Stats, missions, long content |
| **Dawn–midday** | Status, countdown to iftar, hydration | Journal, meals (already logged suhoor) |
| **Midday** | Quick tip ("Stay hydrated"), countdown | Detailed meal planning |
| **Late afternoon** | Iftar countdown, "Prepare iftar" tip | Journal (unless quiet window) |
| **Iftar** | "Break fast" / "Mark complete" CTA, celebration | Everything else secondary |
| **Post-iftar** | "Log iftar," "Add reflection," journal prompt | Stats, missions |
| **Night** | Journal prompt, "Add gratitude," day summary | Fasting actions (done) |

**Implementation:** Reorder or collapse sections; highlight primary CTA; use `timeOfDay` (derived from prayer times or hour) to drive layout/emphasis.

### 1.5 Quick tips (existing → enhanced)

**Current:** `getQuickTip()` uses hour: <6 suhoor, <12 morning duas, <15 productive, <18 iftar prep, else post-iftar.

**Enhanced:** Use prayer times when available for more precise windows.

| Window | Tip (Muslim) | Tip (Non-Muslim) |
|--------|--------------|------------------|
| Pre-dawn | "Time for Suhoor. Eat protein-rich foods." | "Pre-dawn meal — eat something sustaining." |
| Dawn–midday | "Remember morning duas." | "Stay hydrated when you can." |
| Midday | "Halfway there. Patience is a virtue." | "You're halfway through the fast." |
| Late afternoon | "Almost iftar. Prepare your meal." | "Almost time to break your fast." |
| Iftar | "Bismillah. Start with dates." | "Time to break your fast. Start light." |
| Post-iftar | "A moment for gratitude." | "How did today feel?" |
| Night | "Rest well. Tomorrow is a new day." | "Rest well." |

---

## 2. Adaptive behaviors based on usage

### 2.1 Journal: "Resume" and context-aware prompts

| Behavior | Trigger | What to show |
|----------|---------|--------------|
| **Resume your journal** | User opens Dashboard or Journal in evening (post-iftar/night); no journal entry today; user has journaled before (e.g. 3+ entries in last 7 days) | Card: "You haven't written today yet. A line or two when you're ready." + "Add a reflection" link with date=today |
| **Resume draft** | User had unsaved Journal content (stored in sessionStorage); returns to Journal | "You had a draft from [time]. Restore?" [Restore] [Start fresh] |
| **Time-aware prompt** | User opens Journal; prompt rotates by time window | Pre-dawn: "What do you hope for today?"; Post-iftar: "What stayed with you today?"; Night: "One thing you're grateful for." |
| **Skip gentle nudge** | User dismisses "Resume your journal" or has never journaled | Don't show again that day; don't nag |

**Safeguard:** Max 1 "Resume your journal" nudge per day. Dismiss = hide for session. No notification saying "You forgot to journal."

### 2.2 Reminders: Adjust based on usage

| Behavior | Trigger | What to do |
|----------|---------|------------|
| **Suhoor reminder timing** | User consistently logs suhoor 20–30 min before Imsak (inferred from food log timestamps if we had them) | Optional: "You often eat suhoor around X. Adjust reminder?" Suggest `suhoorMinutesBefore` = 25 |
| **Reflection reminder** | User journals mostly in evening (e.g. 20:00–22:00) | Optional: "You often journal in the evening. Set a reminder for 21:00?" |
| **Reduce reminder frequency** | User dismisses or ignores suhoor/iftar reminders 5+ days in a row | Optional: "Reminders not helping? You can turn them off or change the time." [Settings] [Keep] |
| **Hydration reminder** | User logs water mostly at specific times | Optional: Suggest aligning hydration reminder times with when they usually log |

**Safeguard:** All "adjust" suggestions are **optional** and **one-time**. User can dismiss and never see again. No auto-changing settings without consent.

### 2.3 Dashboard: Emphasize based on what's missing

| Behavior | Trigger | What to show |
|----------|---------|--------------|
| **Log suhoor** | Pre-dawn/dawn; no suhoor logged today; fasting window started or about to | Highlight "Log suhoor" in day plan; optional inline presets |
| **Log iftar** | Post-iftar; no iftar logged; day marked complete or broken | "Log what you ate?" toast or card |
| **Mark complete** | Post-iftar; user fasting today; not yet marked complete or broken | Emphasize "Mark complete" CTA |
| **Add reflection** | Post-iftar/night; no journal entry; user has journaled before | "Resume your journal" card (see above) |
| **Rest day nudge** | User has skipped 2+ consecutive days; opens app | Self-kindness copy: "Today is a new day." No "Log now" pressure |

**Safeguard:** Emphasis = visual hierarchy and optional one-time prompt. No repeated popups or notifications for same action.

### 2.4 Simplified mode: Auto-suggest based on context

| Behavior | Trigger | What to do |
|----------|---------|------------|
| **Suggest simplified mode** | Pre-dawn (e.g. 04:00–05:30); user opens app; simplified mode off | One-time: "Running on little sleep? Try simplified mode for bigger buttons and fewer choices." [Try it] [No thanks] |
| **Suggest simplified mode** | Mid-Ramadan (day 12–18) + 2+ skipped days; user opens app | One-time: "Feeling tired? Simplified mode can help." [Try it] [No thanks] |

**Safeguard:** One-time per Ramadan (or per month). Store `simplifiedModeSuggested_2025`: true. Never auto-enable without consent.

---

## 3. Edge cases: Over-automation and safeguards

### 3.1 Creepy or disrespectful scenarios

| Scenario | Why it's problematic |
|----------|----------------------|
| **"You didn't journal yesterday"** notification | Feels accusatory; implies failure. |
| **Auto-enabling reminders** because user "should" want them | Removes agency; assumes we know better. |
| **Changing theme without consent** (e.g. dark at night) | User may prefer light; override feels controlling. |
| **"Your friend Sarah completed today — you haven't"** | Social pressure; guilt-inducing. |
| **Pre-filling journal with AI-generated content** | Violates authenticity; journal is personal. |
| **Sending reminder at 3am** because user "usually" opens app then | Disrupts sleep; over-interpretation of data. |
| **"Based on your patterns, we think you'll break your fast early"** | Feels predictive/judgmental; health is private. |
| **Auto-marking days complete** based on "inference" | User must affirm; no guessing. |
| **Showing "You're behind your group"** when in circle | Comparison; guilt. |
| **Personalizing ads or content** based on journal/keywords | Privacy violation; exploitative. |

### 3.2 Safeguards (design principles)

| Safeguard | Application |
|-----------|-------------|
| **Opt-in for all adaptive behavior** | Reminder adjustments, simplified mode suggestions, etc. — user must enable or approve. Default: off. |
| **No guilt language** | Never "You didn't…" or "You missed…" or "You're behind." Use "When you're ready" or "A line or two if you'd like." |
| **No auto-changing settings** | Never change notification times, themes, or modes without explicit user action. |
| **Cap on nudge frequency** | Max 1 contextual nudge per type per day (e.g. "Resume journal" once). No repeat if dismissed. |
| **Respect quiet hours** | No notifications 22:00–06:00 unless user explicitly set one (e.g. suhoor reminder). |
| **No inference of health or intention** | Never predict "you'll break fast" or "you're struggling." Don't use journal content for personalization. |
| **Transparency** | If we adapt (e.g. "We noticed you journal in the evening"), say so plainly. "Would you like a reminder at 21:00?" |
| **Revocable** | User can turn off "adaptive suggestions" in Settings. Single toggle: "Context-aware suggestions" — off = no usage-based nudges. |
| **No social pressure** | Circle/group features never show "you're behind" or comparative guilt. |
| **Data minimization** | Don't store more than needed for features. No journal content analysis for "insights" without consent. |

### 3.3 Settings: User control

| Setting | Default | Scope |
|---------|---------|-------|
| **Context-aware suggestions** | On | Usage-based nudges (resume journal, reminder adjustment, simplified mode suggest). Off = no such nudges. |
| **Time-of-day themes** | Off (or very subtle) | Slight tint shift by time. User can disable. |
| **Time-aware greetings** | On | "Good morning" / "Iftar Mubarak" etc. Low risk; can disable. |
| **Time-aware prompts** | On | Journal prompt rotates by time. Can fallback to date-only. |
| **Quiet hours** | 22:00–06:00 (suggested) | No non-essential notifications in this window. Suhoor reminder excepted if user set it. |

### 3.4 Red lines (never do)

| Red line | Rationale |
|----------|-----------|
| **Auto-post or share** | User data never leaves app without explicit share action. |
| **Predict health outcomes** | "You might want to break your fast" — no. |
| **Use journal for targeting** | No ads, no "personalized" content from journal text. |
| **Compare unfavorably** | No "You're behind X" or "Your streak is lower than…" |
| **Nag** | No repeated "You haven't logged" or "Don't forget." |
| **Assume religious practice** | Don't assume user prayed, made dua, etc. based on time. |
| **Override user preferences** | Never change theme, sounds, or notifications without consent. |

---

## 4. Summary

| Area | Recommendation |
|------|----------------|
| **Time-of-day** | Pre-dawn: minimal UI, suhoor focus. Midday: patience tip. Iftar: celebration, break-fast CTA. Post-iftar/night: journal, reflection. Subtle theme tints optional; greetings time-aware. |
| **Adaptive behaviors** | "Resume your journal" (evening, if skipped); optional reminder timing suggestions; emphasis on missing actions (log suhoor, log iftar). All opt-in or one-time suggest. |
| **Safeguards** | No guilt language; no auto-changing settings; cap 1 nudge per type per day; respect quiet hours; no inference of health/intention; "Context-aware suggestions" toggle; red lines: no auto-post, no journal targeting, no comparative guilt. |

Implementing context-aware experiences with these safeguards will make the app feel thoughtful and responsive without crossing into creepiness or disrespect.
