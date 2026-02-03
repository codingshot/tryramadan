# Personas, day-in-the-life flows & edge-case behaviors

UX research document: **four core personas** for the Ramadan dashboard, each with a **primary goal**, a **full day-in-the-life flow** (when they open the app, what they do, in what order), and **edge-case behaviors** extracted from those flows. Use for journey mapping, usability testing, and prioritization.

**Related:** `USER-FLOWS-AND-TEST-PROMPTS.md`, `NON-MUSLIM-AND-RAMADAN-CURIOUS-FLOWS.md`, `FALL-OFF-AND-RETURN-FLOWS.md`, `data/personas.json`.

---

## 1. Persona: Newly practicing Muslim

**Who:** First Ramadan or recently reverted; wants to observe correctly but may forget steps or feel unsure. Relies on reminders and clear, simple guidance.

**Primary goal:** Complete Ramadan fasting day-by-day with correct timing (suhoor end / iftar), get gentle reminders, and feel supported without being overwhelmed.

---

### Day-in-the-life flow

| When | Where | What they do (order) |
|------|--------|----------------------|
| **Pre-dawn (e.g. 04:30)** | Home | Notification: “Suhoor reminder.” Opens app → checks **countdown to suhoor end** (Fajr) on Dashboard or Today. Eats, then before Fajr taps **“I’m fasting.”** May glance at **prayer strip** (Fajr time). Closes app. |
| **Morning (08:00)** | Commute / work | Opens app briefly → sees **“You’re fasting”** and **countdown to Iftar**. Feels reassured. May open **Today** for countdown only. Does not log meals yet. |
| **Midday (12:00)** | Work | Optional: opens app to check **time left until Iftar**. May open **Learn** or **FAQ** once to read “What breaks the fast?” or “When can I eat?” |
| **Late afternoon (17:30)** | Home / work | Notification: “Iftar in 30 min” (or similar). Opens app → **Dashboard** or **Today** → watches countdown. Prepares to break fast. |
| **Iftar (Maghrib)** | Home | At Maghrib taps **“Mark complete.”** Sees **streak** or **“Day N completed.”** May add **one iftar item** on Schedule/Meals (simple). Does not always journal. |
| **Evening (21:00)** | Home | Occasionally opens **Journal** → picks today → writes a short reflection or gratitude. Saves. May open **Prayers** to see tomorrow’s Fajr. |

**Summary order:** Notification → Open app → Countdown / “I’m fasting” → (throughout day: countdown checks) → “Mark complete” at iftar → (optional) Meals, Journal, Prayers.

---

### Edge-case behaviors extracted

- **Opens only around suhoor and iftar** — doesn’t browse mid-day; app should feel quick (countdown + one tap).
- **May tap “I’m fasting” after finishing suhoor but forget to open app at iftar** — next day they might **backfill** “Mark complete” for yesterday (make-up flow).
- **Rarely logs meals** — primary need is fast start/complete and countdown; meals are optional.
- **Skips or forgets journal** — reflection is occasional, not daily.
- **Needs location set once** — if they skipped during onboarding, they may **return to Settings** when they notice wrong times.
- **May break fast (illness/travel)** — uses “Break fast” with reason; expects **excused** not to punish streak (see STREAKS-STATS-GAMIFICATION-FLOWS).

---

## 2. Persona: Experienced Muslim tracking details

**Who:** Observes Ramadan every year; knows Suhoor/Iftar/Fajr/Maghrib. Wants accurate prayer times, streak, optional voluntary Sunnah, and detailed logging (meals, notes, Quran).

**Primary goal:** Track fasting and spiritual habits precisely: prayer times, completion streak, voluntary fasts, meal log, and optional Quran/hadith.

---

### Day-in-the-life flow

| When | Where | What they do (order) |
|------|--------|----------------------|
| **Pre-dawn** | Home | Notification or habit → Opens app. Checks **prayer strip** (Fajr / Imsak). Taps **“I’m fasting.”** May add **suhoor** to Schedule (meal plan or food log) for the day. |
| **Morning** | Any | Opens **Dashboard** → reviews **Day N**, **streak**, **next prayer**. May open **Schedule** → select today → add **note** or adjust **meal plan**. |
| **Day** | Any | Uses **Prayers** page to check full timetable; may enable **adhan** (if supported). Opens **Quran** for juz or verse. May log **Taraweeh** or custom event on Schedule for export. |
| **Pre-iftar** | Home | Opens app → **Today** or **Dashboard** → countdown. May export **.ics** once for the month (Schedule). |
| **Iftar** | Home | Taps **“Mark complete.”** Logs **iftar** on Schedule/Meals (recipe or custom). Adds **schedule note** if needed. |
| **Night** | Home | **Journal** → today → reflection + mood/gratitude. **Progress** → checks **completed / broken / streak / total hours**. May mark **voluntary** (Mon/Thu) on a non-Ramadan day later. |

**Summary order:** Open app → Prayer strip + “I’m fasting” → Suhoor/meal or note → (throughout: Prayers, Quran, Schedule) → Countdown → “Mark complete” → Iftar log + note → Journal → Progress.

---

### Edge-case behaviors extracted

- **Logs almost every day** — high engagement; expects **history** and **“this Ramadan”** view (see HISTORICAL-DATA-AND-DELETION-FLOWS).
- **Uses past-day selection** — **make-up** and **“I didn’t fast this day”** for past days (Schedule/Dashboard day picker).
- **May have many excused days** (travel/illness) — streak logic must **not punish** excused (implemented).
- **Wants to compare to last year** — “Compare to last Ramadan” if data exists (doc in HISTORICAL-DATA).
- **Exports data** — CSV progress, JSON export, .ics calendar; expects **journal and meals** in export.
- **Turns off streak/achievements** — may prefer **“Show streak and achievements” off** for a simpler view (implemented).
- **Uses voluntary Sunnah** — may log Mon/Thu or Ayyam al-Beed; expects **Sunnah days** in stats.

---

## 3. Persona: Non-Muslim partner

**Who:** Partner or family member of someone observing Ramadan. Wants to support, share meals, or try a few fasting days without religious obligation. Prefers minimal religious wording.

**Primary goal:** Stay in sync with household (iftar time, meals), optionally try “shadow” fasting a few days, and journal or log meals without feeling the app is for “full” observance only.

---

### Day-in-the-life flow

| When | Where | What they do (order) |
|------|--------|----------------------|
| **Morning** | Home | Opens app to see **when iftar is** (to plan family meal). Checks **Dashboard** or **Today** for **“Breaking Fast (Iftar)”** time. May **skip** “I’m fasting” most days. |
| **Some days (e.g. weekend)** | Home | Decides to try a day → taps **“I’m fasting”** after breakfast window. Uses **countdown** to iftar. At iftar taps **“Mark complete.”** Does **not** do this every day. |
| **Meal prep** | Home | Opens **Meals** or **Schedule** → adds **suhoor/iftar** ideas or **recipes** for the family. May use **meal plan note** rather than full food log. |
| **Evening** | Home | Opens **Journal** → picks today → writes **gratitude or reflection** (e.g. “Shared iftar with family”). Saves. |
| **Rarely** | Any | Browses **Learn** or **Glossary** to understand terms; may set **Learning: Minimal** and **Quran: None** in priorities. |

**Summary order:** Open app → Check iftar time (no fast) **or** (on try-days) “I’m fasting” → countdown → “Mark complete” → Meals/Schedule for family → Journal.

---

### Edge-case behaviors extracted

- **Logs only on some days** (“shadow fast”) — e.g. weekends or 2–3 days a week; **streak** will have gaps; app should **not** guilt (“You missed X days”) (see FALL-OFF-AND-RETURN-FLOWS, NON-MUSLIM-AND-RAMADAN-CURIOUS-FLOWS).
- **Logs only meals but never fasting** — uses **Meals/Schedule** and **Journal**; may **never** tap “I’m fasting.” Dashboard should still be usable (countdown for iftar time only; no “Day N of 30” pressure).
- **Expects “Breaking Fast (Iftar)” and “Suhoor (pre-dawn meal)”** — terminology must stay explained (implemented for non-Muslim mode).
- **May switch to Muslim mode later** — e.g. converts or decides to observe fully; **mode switch** must not lose data (see NON-MUSLIM doc).
- **Skips location** — uses app mainly for iftar time as reference; may rely on **IP or manual** later.
- **Does not use Prayers/Quran** — quick actions and nav may de-emphasize these when **priorities** are Minimal/None.

---

## 4. Persona: Health-focused intermittent faster

**Who:** Interested in time-restricted eating (TRF) or intermittent fasting; uses Ramadan-style window for structure. Cares about eating window, hydration, macros, and energy—not religious obligation.

**Primary goal:** Follow a clear eating/fasting window (e.g. dawn–dusk), track meals and optional macros, and monitor hydration/energy without religious content front and center.

---

### Day-in-the-life flow

| When | Where | What they do (order) |
|------|--------|----------------------|
| **Pre-window close** | Home | Notification or routine → Opens app. Checks **“Suhoor end”** (last eat time). May or may not tap **“I’m fasting”** (if they want the timer). Eats, then starts “fast” or simply uses countdown. |
| **Mid-morning** | Any | Opens **Today** → **countdown** to iftar; may log **hydration** or **energy** if available. Checks **Schedule** for **meal plan** for the day. |
| **Day** | Any | May open **Meals** or **Macros** → logs **suhoor/iftar** (calories, portions). Uses **Health** or wellness content if offered. |
| **Pre-iftar** | Any | Opens app → **countdown**. May have **turned off** religious reminders; only cares about “when can I eat.” |
| **Iftar** | Home | Taps **“Mark complete”** (or ignores if they didn’t tap “I’m fasting”). Logs **iftar** in **food log** with calories/macros. |
| **Evening** | Home | Optional: **Journal** (mood/gratitude). **Progress** → may check **total hours fasted** or **journal streak**; may have **disabled streak** in Settings. |

**Summary order:** Open app → Suhoor end time / “I’m fasting” → Countdown (+ optional hydration/energy) → Schedule/Meals/Macros → Countdown to iftar → “Mark complete” + iftar log → (optional) Journal, Progress.

---

### Edge-case behaviors extracted

- **Uses app for window only, no tap** — may **never** tap “I’m fasting” or “Mark complete”; only views **countdown** and **times.** App must still show times and not assume they’re “logging” (see NON-MUSLIM: journal+meals only).
- **Logs only meals (macros)** — **Meals/Macros** and **Schedule** are primary; fasting state is secondary. **Mindful eating streak** and **journal streak** matter (implemented on Progress).
- **May fast only weekdays** — “Logs only on weekdays”; weekend = untracked or skipped. Same as shadow-faster edge case.
- **Disables streak and achievements** — prefers **“Show streak and achievements” off** for a minimal, health-only view (implemented).
- **Skips Quran/Prayers/Learn** — sets **Quran: None**, **Learning: Minimal**; expects dashboard to emphasize **Today, Schedule, Meals, Progress.**
- **Expects “Morning/Evening” or neutral labels** — optional **meal label** toggle (e.g. “Morning meal” / “Evening meal”) for zero religious framing (doc in NON-MUSLIM).

---

## 5. Summary: edge-case behaviors by theme

| Theme | Edge-case behavior | Personas | Doc / implementation |
|-------|---------------------|----------|------------------------|
| **Partial logging** | Logs only on weekends / a few days a week | Partner, Health | FALL-OFF-AND-RETURN, NON-MUSLIM (shadow fast) |
| **Meals only** | Logs meals (and maybe journal) but never fasting | Partner, Health | NON-MUSLIM (journal+meals only) |
| **Window-only** | Uses app for countdown/times only; no “I’m fasting” or “Mark complete” | Health, Partner | NON-MUSLIM; ensure times visible without state |
| **Backfill / make-up** | Marks past days complete or “didn’t fast” after gap | Newly practicing, Experienced | FALL-OFF-AND-RETURN, HISTORICAL-DATA |
| **Excused days** | Many broken-with-reason (illness, travel); streak must not punish | Experienced | STREAKS-STATS-GAMIFICATION (implemented) |
| **High engagement** | Logs almost every day; wants history, compare, export | Experienced | HISTORICAL-DATA, deletion/export flows |
| **Minimal religious UI** | Turns off streak, Quran None, Learning Minimal, optional “Morning/Evening” labels | Partner, Health | NON-MUSLIM, STREAKS (showStreakAndAchievements off) |
| **Mode switch** | Starts non-Muslim, later switches to Muslim (or vice versa) | Partner | NON-MUSLIM (edge case: switch mid-Ramadan) |
| **Location skipped** | Uses app without setting location; later sets in Settings | Newly practicing, Partner | ONBOARDING, OFFLINE (first time no network) |
| **Rare journal** | Opens journal only occasionally, not daily | Newly practicing, Partner | — |
| **Notification-driven** | Opens app mainly when reminder fires (suhoor/iftar) | Newly practicing | — |

---

## 6. How to use this for research and design

- **Recruit** by persona for usability tests; run day-in-the-life as a **task scenario** (e.g. “It’s 4:30 a.m., you’ve had suhoor…”).
- **Prioritize** features by persona and edge case: e.g. “shadow fast” schedule option for Partner; “journal + meals only” path for Partner/Health; compare-to-last-year for Experienced.
- **Copy and UI** — check tone per persona: no guilt for Partner/Health; clear countdown and one-tap for Newly practicing; full control and export for Experienced.
- **Regression** — when changing flows (e.g. streak, mode switch, export), re-test with at least one user per persona and the edge cases in §5.

This document defines four personas, their day-in-the-life flows, and extracted edge-case behaviors for the Ramadan dashboard.
