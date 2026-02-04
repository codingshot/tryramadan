# UX: Contemplative Reflection Moments

This document identifies screens where reflective prompts could be gently included, suggests rhythmic cues for journaling during quiet hours, and provides copywriter guidance for tone: serene, spiritual yet modern, avoiding a didactic voice.

**Related:** [UX-MICROCOPY-AND-EMPTY-STATES.md](./UX-MICROCOPY-AND-EMPTY-STATES.md), [DashboardJournal.tsx](../src/pages/DashboardJournal.tsx) (prompts).

---

## 1. Screens for reflective prompts

### 1.1 Current state

| Screen | What exists | Prompt type |
|--------|-------------|-------------|
| **Dashboard Journal** | Rotating prompts by day (e.g. "What did you learn about yourself today while fasting?", "One thing you're grateful for today.") | Fixed list, day-indexed |
| **Dashboard Today** | "Today's intention" textarea with placeholder "e.g. Patience, gratitude, or a small act of kindness..." | Open-ended |
| **Dashboard** | Daily fact (e.g. "Patience (Sabr)", "Final third"); Quick tip by time of day | Informational, not interactive |
| **Daily Hadith** | Hadith text + topic + context (e.g. "intention behind fasting") | Read-only |
| **Schedule** | Note per day (free text) | Open-ended, no prompt |

### 1.2 Screens where prompts could be gently added

| Screen | Placement | Prompt idea | Interaction |
|--------|-----------|-------------|-------------|
| **Dashboard Journal** | Above textarea (already present) | Rotate by day + **optionally by time of day** (see §2). | Keep prompt visible; add time-aware variants. |
| **Dashboard day plan (Journal block)** | When no entry: "A moment to reflect" with one soft prompt | "What stayed with you today?" or "One thing you're grateful for." | Link to Journal with prompt pre-filled or suggested. |
| **Dashboard Today** | Below intention: optional "Evening reflection" | "How did today's fast feel? A line or two." | Collapsible; link to Journal for full entry. |
| **Schedule (day detail)** | Near Note field: optional prompt when note is empty | "Add a note — e.g. How did today feel? What did you learn?" | Placeholder or hint text. |
| **After Mark complete** | Toast or inline: one-line prompt | "Well done. One thing you're grateful for today?" | Optional; "Add to journal" link. |
| **Daily Hadith** | Below hadith: optional reflection cue | "What resonates with you here?" | Link to Journal with hadith topic as suggested prompt. |
| **Dashboard (Daily fact)** | Below fact: optional prompt | "How does this sit with your day?" | Link to Journal; low prominence. |

**Principles:** Prompts should feel **invitational**, not mandatory. Use **questions** more than imperatives. Avoid "You should reflect on…" — prefer "What did today teach you about patience?"

---

## 2. Rhythmic cues for journaling (quiet hours)

### 2.1 Quiet hours (candidate windows)

| Window | Approx. time | Why it works |
|--------|--------------|--------------|
| **Pre-dawn (before Fajr)** | ~30–60 min before Fajr | Still night; suhoor done or imminent; calm before the fast. |
| **Early morning (after Fajr)** | ~15–30 min after Fajr | Dawn prayer done; day beginning; quiet before work. |
| **Midday (around Dhuhr)** | Lunch / break | Pause in the day; good for a short check-in. |
| **Late afternoon (before Maghrib)** | ~1–2 h before Maghrib | Often a low-energy slot; moment to pause. |
| **Post-Iftar (after Maghrib)** | ~30–90 min after Maghrib | Meal done; evening calm; natural reflection time. |
| **Night (after Isha)** | ~1–2 h after Isha | End of day; before sleep; traditional reflection time. |

### 2.2 Rhythmic cue suggestions

| Cue type | When | What user sees | Action |
|----------|------|----------------|--------|
| **Time-aware prompt** | User opens Journal during a quiet window | Prompt rotates or softens: e.g. pre-dawn "What do you hope for today?"; post-iftar "What stayed with you today?" | Same Journal UI; prompt text changes by hour. |
| **Optional reminder** | User opts in to "Reflection reminders" | Notification at chosen time (e.g. 21:00): "A moment to reflect — whenever you're ready." | One notification; no repeat if dismissed. |
| **Dashboard nudge** | User opens Dashboard during quiet window, no journal entry today | Subtle card: "A quiet moment for reflection" with one prompt + "Write a line" link. | Dismissible; low visual weight. |
| **Schedule note hint** | User opens Schedule for today, note empty, during evening | Placeholder: "How did today feel? A note for yourself." | Same Note field; gentler placeholder. |

### 2.3 Implementation notes

- **Time windows:** Use prayer times (Fajr, Maghrib, Isha) from `usePrayerTimes` when available; else fallback to typical ranges (e.g. 04:00–06:00, 18:00–22:00 local).
- **Prompt rotation:** Extend `getPromptForDate` to accept optional `hour` or `timeOfDay` and return a time-aware prompt when in a quiet window.
- **Reminders:** New notification type "Reflection reminder"; user chooses time in Settings (e.g. "Evening reflection" default 21:00).

---

## 3. Copywriter guidance: tone

### 3.1 Goal

**Serene, spiritual yet modern** — the app should feel like a gentle companion, not a teacher or a taskmaster. Avoid preaching, guilt, or a formal religious tone. Invite reflection without instructing.

### 3.2 Do

| Principle | Example |
|-----------|---------|
| **Invite, don't instruct** | "What did today teach you about patience?" not "You should reflect on patience." |
| **Use questions** | "What stayed with you today?" "One thing you're grateful for?" |
| **Short, spacious** | One question per prompt; leave room for silence. |
| **Modern, plain language** | "How did the fast feel?" not "How did the fast impact your nafs?" (unless glossary term). |
| **Optional framing** | "Whenever you're ready," "A line or two is enough," "No rush." |
| **Gentle spiritual touch** | "A moment to reflect," "What intention will you carry into tomorrow?" — nods to tradition without sermonizing. |

### 3.3 Avoid

| Anti-pattern | Example | Why |
|--------------|---------|-----|
| **Didactic** | "Remember: fasting is about self-discipline. Reflect on that." | Sounds like a lesson. |
| **Guilt-inducing** | "Have you written in your journal today?" | Feels like a nag. |
| **Overly formal** | "Ponder the lessons of the day." | Stiff, archaic. |
| **Preachy** | "Allah rewards those who reflect." | Can feel heavy; user may not want religious framing in prompts. |
| **Multiple questions** | "What did you learn? How did you feel? What are you grateful for?" | Overwhelming; pick one. |
| **Imperatives** | "Reflect on your day." "Write your gratitude." | Feels like homework. |

### 3.4 Prompt bank (serene, invitational)

**General reflection**

- "What stayed with you today?"
- "One thing you're grateful for."
- "What did today teach you?"
- "How did the fast feel?"

**Patience / discipline**

- "What did you learn about patience today?"
- "Where did you find calm today?"

**Connection**

- "A small act of kindness you gave or received."
- "What connected you to others today?"

**Intention / tomorrow**

- "What intention will you carry into tomorrow?"
- "What do you hope for tomorrow?"

**Suhoor / Iftar**

- "How did you feel at suhoor vs iftar?"
- "What made suhoor [or iftar] meaningful today?"

**Time-aware (quiet hours)**

- Pre-dawn: "What do you hope for today?"
- Post-iftar: "What stayed with you today?"
- Night: "One thing you're grateful for from today."

### 3.5 Microcopy patterns

| Context | Serene phrasing |
|---------|-----------------|
| **Empty journal** | "Your journal is ready for you. Write whenever it helps." |
| **No entry for day** | "A moment to reflect — whenever you're ready." |
| **Intention placeholder** | "e.g. Patience, gratitude, or a small act of kindness." |
| **Save success** | "Saved." or "Entry saved." (minimal, calm) |
| **Reflection reminder** | "A moment to reflect — whenever you're ready." |
| **Link to Journal** | "Add a line" or "Write a reflection" (not "You must journal"). |

---

## 4. Summary

| Area | Recommendation |
|------|----------------|
| **Screens for prompts** | Journal (keep + add time-aware); Dashboard day plan (when no entry); Today (optional evening reflection); Schedule (note placeholder); post–Mark complete (optional nudge); Daily Hadith (optional "What resonates?" link). |
| **Rhythmic cues** | Time-aware prompts (pre-dawn, post-iftar, night); optional reflection reminder (user-chosen time); subtle dashboard nudge during quiet hours; gentler Schedule note placeholder. |
| **Tone** | Serene, spiritual yet modern; invite with questions; avoid didactic, guilt-inducing, or preachy copy; use short, spacious prompts; optional framing ("whenever you're ready"). |

Implementing time-aware prompts, quiet-hour cues, and the tone guidance above will make reflective moments feel natural and supportive rather than obligatory.
