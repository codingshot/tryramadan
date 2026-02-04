# UX: Beyond Ramadan Retention

This document designs UX paths to transition users into post-Ramadan habits (mood journaling, gratitude, voluntary fasts), suggests seasonal UI theming to mark the rhythm of usage, and proposes notifications that invite return gently—"reflect on the month you built," not "come back now."

**Related:** [STREAKS-STATS-GAMIFICATION-FLOWS.md](./STREAKS-STATS-GAMIFICATION-FLOWS.md), [ONBOARDING-REONBOARDING-FLOWS.md](./ONBOARDING-REONBOARDING-FLOWS.md), [FALL-OFF-AND-RETURN-FLOWS.md](./FALL-OFF-AND-RETURN-FLOWS.md).

---

## 1. UX paths: post-Ramadan habit transitions

### 1.1 Mood journaling

**Current state:** Journal has mood (1–5), gratitude, and content per day. No explicit "continue journaling" prompt after Ramadan.

**Transition paths:**

| Path | When | What user sees | Suggested action |
|------|------|----------------|------------------|
| **Eid recap** | First day after Ramadan (Eid al-Fitr) | "Ramadan Mubarak! You completed X days. One last reflection: how did the month feel?" → short prompt + mood + optional gratitude. | One-tap mood (1–5) + optional one line; "Save" writes to Journal for Eid date. Suggests: "Keep the habit — journal once a week." |
| **Weekly mood check** | First Mon/Thu after Ramadan (Sunnah day) | "Today is a Sunnah fasting day. Not fasting? No pressure — a quick mood check still helps." → mood picker only; optional "Add a line" → Journal. | Minimal: mood 1–5 + Save. Link: "Full journal entry" for those who want more. |
| **Dashboard pivot** | When `!isCurrentlyRamadan()` and user has prior progress | Main dashboard shifts: "Your journey" replaces "Ramadan Mubarak"; **"Reflect"** or **"Mood check"** becomes a primary quick action (e.g. in place of "I'm fasting"). | One tap → mood + optional gratitude; writes to Journal. No fasting UI as primary. |

**Proposed flow (minimal):**

1. **Eid screen** (once): "Ramadan complete. One last reflection for the month?" → mood + gratitude (optional) → Save. "Continue journaling" link to Journal with prompt: "We'll gently remind you once a week."
2. **Post-Ramadan dashboard:** When not Ramadan, show **"Reflect today"** or **"Mood check"** as a primary CTA (replacing "I'm fasting"). Tap → mood 1–5 + optional one line → Save.
3. **Weekly reminder** (see Notifications): "How are you? One quick mood check." → opens app to mood-only flow.

---

### 1.2 Gratitude

**Current state:** Journal has "One thing I'm grateful for" per entry. No standalone gratitude flow.

**Transition paths:**

| Path | When | What user sees | Suggested action |
|------|------|----------------|------------------|
| **Eid gratitude** | Eid day | "One thing you're grateful for from this Ramadan?" → single field + Save. | Writes to Journal for Eid date as gratitude-only entry (or appends to recap). |
| **Daily gratitude (light)** | Post-Ramadan, when user opens app | "One thing you're grateful for today?" — inline on dashboard or as a small card. | One field, no mood required; Save writes to Journal. Optional: "Skip today." |
| **Gratitude streak** | Post-Ramadan | Progress page: "Gratitude streak: X days" (consecutive days with gratitude logged). | Same as journal streak but filtered to entries with gratitude; encourages light touch. |

**Proposed flow:**

1. **Eid:** Include gratitude in Eid recap ("One thing you're grateful for from this Ramadan?").
2. **Post-Ramadan dashboard:** Optional **"One thing grateful for today"** card (collapsible or dismissible). One field + Save; no full journal required.
3. **Progress:** Add "Gratitude streak" when `!isCurrentlyRamadan()` and user has journal entries with gratitude.

---

### 1.3 Voluntary fasts (Sunnah)

**Current state:** App supports Mon/Thu and Ayyam al-Beed in Settings and Schedule. SunnahFastingBadge shows on Mon/Thu when not Ramadan. ReminderScheduler can notify on Sunnah days.

**Transition paths:**

| Path | When | What user sees | Suggested action |
|------|------|----------------|------------------|
| **Eid → Sunnah** | Eid or first week after Ramadan | "Ramadan is complete. Many Muslims continue with voluntary fasts (Mon/Thu). Would you like to track them?" → [Yes, add to my journey] [Not now]. | If Yes: enable voluntary fasting (Mon/Thu) in preferences; show Sunnah days on Schedule. |
| **First Sunnah day after Ramadan** | First Mon/Thu after Ramadan | Banner or card: "Today is a Sunnah fasting day (Monday/Thursday). Want to log it?" → [I fasted today] [Not today]. | One tap to log; same as current "I fasted this day — mark complete" for Sunnah. |
| **Rest months** | When `!isCurrentlyRamadan()` and voluntary fasting enabled | Schedule highlights Sunnah days (Mon/Thu, Ayyam al-Beed); dashboard shows "Next Sunnah day: Mon" or similar. | Same as current; ensure it's visible and not buried. |

**Proposed flow:**

1. **Eid or first post-Ramadan open:** One-time prompt: "Track voluntary Sunnah fasts (Mon/Thu)?" → [Yes] [Maybe later]. Yes = set voluntaryFasting to include monday-thursday.
2. **Sunnah day notification** (see Notifications): Already exists for Muslim users; ensure copy is gentle: "Today is a Sunnah fasting day — no pressure, just a reminder."
3. **Dashboard when not Ramadan:** If voluntary enabled, show "Next Sunnah: Mon" or "Today is Sunnah" with [I fasted] [Skip] — keep it lightweight.

---

## 2. Seasonal UI theming

### 2.1 Rhythm of usage

| Season | Approx. timing | User mindset | Theming goal |
|--------|----------------|--------------|--------------|
| **Pre-Ramadan** | 1–30 days before | Anticipation, preparation | Countdown, "X days until Ramadan," gentle warm-up |
| **Ramadan** | 30 days | Active fasting, daily use | Ramadan Mubarak, crescent/moon, primary accent, fasting-focused |
| **Eid** | 1–3 days after Ramadan | Celebration, closure | Eid Mubarak, lighter/festive accent, recap and gratitude |
| **Rest months** | Rest of year | Occasional (Sunnah, reflection) | Calmer, secondary accent, reflection and voluntary fasting |

### 2.2 Proposed seasonal themes

| Season | Visual | Copy / labels |
|--------|--------|----------------|
| **Ramadan** | Crescent/moon icon in header; "Ramadan Mubarak" greeting; primary (e.g. gold/amber) accent; FastingBottomBar when fasting. | "Ramadan Mubarak," "Day X of Ramadan," "I'm fasting," Suhoor/Iftar. |
| **Eid** | "Eid Mubarak" greeting; optional festive accent (e.g. green/gold); one-time Eid recap card. | "Eid Mubarak," "Ramadan complete," "One last reflection?" |
| **Rest months** | "Your journey" or "Reflect" greeting; muted/secondary accent; Sunnah days highlighted when enabled. | "Your journey," "Reflect today," "Sunnah day (Mon/Thu)," "X days until next Ramadan." |
| **Pre-Ramadan** | "X days until Ramadan" badge; same accent as Ramadan but softer. | "X days until Ramadan," "Prepare for the month." |

### 2.3 Implementation notes

- **Season detection:** Use `isCurrentlyRamadan()`, `getDaysUntilRamadan()`, `getRamadanEndForYear()` from `ramadan.ts`. Add `isEidDay()` or "first 1–3 days after Ramadan" for Eid.
- **Theme variables:** CSS vars for `--season-accent`, `--season-greeting`; swap based on season. Or use data attribute: `data-season="ramadan" | "eid" | "rest" | "pre"`.
- **Greeting:** Header greeting changes by season (see above). Keep one source of truth (e.g. `getSeasonalGreeting()`).
- **No jarring shifts:** Transitions between seasons should feel natural—e.g. Eid is a soft bridge from Ramadan to rest.

---

## 3. Gentle notifications: invite return, not pressure

### 3.1 Tone

- **Do:** "Reflect on the month you built," "How are you? One quick mood check," "Today is a Sunnah day — no pressure."
- **Avoid:** "Come back now," "You haven't logged in X days," "Don't break your streak," "We miss you."

### 3.2 Proposed notification types

| Type | When | Example copy | Frequency |
|------|------|--------------|-----------|
| **Eid recap** | First day after Ramadan (Eid al-Fitr) | "Ramadan complete. Take a moment to reflect on the month you built." | Once |
| **Weekly reflection** | Once per week (e.g. Sunday evening or user-chosen day) when not Ramadan | "How are you? One quick mood check when you're ready." | 1/week |
| **Sunnah day** | Mon/Thu when not Ramadan, Muslim users, voluntary enabled | "Today is a Sunnah fasting day — no pressure, just a reminder." | 2/week max |
| **Gratitude nudge** | Optional; e.g. after 7 days no journal when not Ramadan | "One thing you're grateful for today? No rush." | 1/week max, only if opted in |
| **Pre-Ramadan** | 7 days before Ramadan | "Ramadan starts in a week. Your journey is waiting." | Once |
| **Milestone** | E.g. 30 days since last open, has prior progress | "It's been a while. Whenever you're ready, we're here." | Rare; 1 per "milestone" |

### 3.3 Implementation notes

- **Eid recap:** Schedule for Eid date (first day of Shawwal ≈ day after Ramadan end). Use `getRamadanEndForYear()` + 1 day. Only if user completed onboarding and has some progress.
- **Weekly reflection:** New notification type; user opts in (e.g. "Reflection reminders" in Settings). Default day: Sunday 20:00 local; or let user pick.
- **Sunnah day:** Already in ReminderScheduler for Muslim users; ensure copy is gentle (see above).
- **No "come back" blasts:** Avoid "You haven't opened the app in X days." If we ever do a "long absence" nudge, keep it to: "Whenever you're ready, we're here."
- **Opt-out:** All post-Ramadan reminders should be opt-in or easily disabled in Settings (e.g. "Reflection reminders," "Sunnah day reminders").

---

## 4. Summary

| Area | Recommendation |
|------|----------------|
| **Mood journaling** | Eid recap (mood + gratitude once); post-Ramadan "Reflect today" / mood check as primary CTA; weekly reflection notification (opt-in). |
| **Gratitude** | Eid gratitude in recap; optional "One thing grateful" on dashboard; "Gratitude streak" on Progress when not Ramadan. |
| **Voluntary fasts** | Eid or first post-Ramadan prompt to enable Sunnah (Mon/Thu); Sunnah day notifications (already exist); keep Schedule/dashboard Sunnah visibility. |
| **Seasonal theming** | Ramadan (Mubarak, crescent, primary); Eid (Mubarak, recap, festive); rest months (Your journey, reflect, Sunnah); pre-Ramadan (countdown). |
| **Notifications** | Eid recap (once); weekly reflection (opt-in); Sunnah day (gentle); pre-Ramadan (once); no "come back now" or guilt-based copy. |

Implementing the Eid recap, seasonal greeting/theme swap, and gentle notification copy will create a clear rhythm (Ramadan → Eid → rest) and support post-Ramadan habits (mood, gratitude, Sunnah) without pressure.
