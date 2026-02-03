# UX: First-Time Experience Review

Review of the first 2–3 minutes for a **Muslim user starting Ramadan** and a **non-Muslim user curious about fasting**, with step-by-step simulation, confusion points, a minimal first-session script, and copy/UI tweaks to reduce cognitive load.

---

## 1. Simulation: Muslim user starting Ramadan (first 2–3 minutes)

### Step-by-step

| Step | Screen | What they see | What they likely understand | Where confusion may arise |
|------|--------|----------------|----------------------------|---------------------------|
| 1 | **Landing (/)** | Hero: "Experience Ramadan Through Cultural Immersion"; "Fast like a Muslim for the holy month of Ramadan"; FastingTimer (Suhoor end / Iftar countdown or "X days until Ramadan"); CTAs: "Start your journey", "I'm Muslim". | App is about Ramadan fasting; two entry points. | Timer may show "Suhoor end" / "Iftar" with no explanation; if no location yet, times may be placeholder or generic — unclear that location drives accuracy. |
| 2 | **Tap "I'm Muslim"** | Goes to Mode with Muslim pre-selected; no screen shown — auto-navigates to Health. | They're in a flow; Muslim path is shorter. | If they expected a confirmation screen, the jump to Health can feel abrupt. "Health screening" is next with no recap of "you're in Muslim mode." |
| 3 | **Health** | "Health screening" — select conditions or "None of these"; Continue. | Safety step; quick to complete. | Fine. |
| 4 | **Location** | "Location" — auto-detect may run; "Use my location" or search; "Skip for now". | Location = prayer/fasting times. | "Skip for now" is clear, but they may not realize Dashboard will show a reminder until they set it. |
| 5 | **Schedule** | "Fasting schedule" — "Full Ramadan (Dawn to sunset)"; optional voluntary (Mon/Thu, Ayyam al-Beid). | Main choice is Full Ramadan; voluntary is extra. | "Fajr to Maghrib" / "Dawn to sunset" — no one-line explanation that **fast = no food/drink from dawn until sunset**. Optional voluntary block may feel like a second decision. |
| 6 | **Notifications** | "Notifications" — "Get suhoor and iftar reminders"; Enable or Continue. | Reminders for meal times. | Muslim sees "suhoor" and "iftar" (familiar). Fine. |
| 7 | **Priorities** | "Your priorities" — Learning, culture, Quran, macros, simplify. Defaults may shift to "deep/lots/daily" for Muslim. | Personalization of dashboard. | Several toggles at once; "simplify by location" is vague. Can feel like a lot before dashboard. |
| 8 | **Goals** | "Goals & intentions" — e.g. "Complete Ramadan with devotion", "Recite Quran daily"; optional; "Skip — go to dashboard". | Optional focus; can skip. | Clear. |
| 9 | **Dashboard** | Day selector; status: "Not fasting" + [I'm fasting] [I didn't fast today]; Suhoor/Iftar strip; Quick access (Today, Schedule, Prayers, Meals…); location banner if skipped. | This is the main screen; I can log my fast here. | **"I'm fasting" vs "I didn't fast today"** — purpose is clear to a Muslim. **Suhoor end / Iftar** in strip may still be jargon if they didn't read tooltips. **Quick access** has many tiles; "What do I do first?" may be unclear. If location was skipped, banner adds noise. |

### Summary (Muslim)

- **Understand:** Ramadan app, Muslim path is short, health/location/schedule, dashboard is where I log.
- **Confusion:** (1) No explicit one-liner that fasting = no food/drink dawn–sunset. (2) First dashboard has many links and no single "do this first" cue. (3) Suhoor/Iftar on hero/timer not explained for someone who landed straight on "I'm Muslim."

---

## 2. Simulation: Non-Muslim user curious about fasting (first 2–3 minutes)

### Step-by-step

| Step | Screen | What they see | What they likely understand | Where confusion may arise |
|------|--------|----------------|----------------------------|---------------------------|
| 1 | **Landing (/)** | Same hero; FastingTimer with "Suhoor end" or "Iftar"; "Start your journey" / "I'm Muslim". | App is for Ramadan; I'll start journey. | **"Suhoor end" and "Iftar"** — unfamiliar terms. No inline explanation. Timer might show countdown to "Iftar" with no context that Iftar = when you break the fast. |
| 2 | **Tap "Start your journey"** | Welcome — "Welcome to TryRamadan"; list: mode, knowledge check, health, location, schedule, reminders, priorities, goals; "Get Started". | Multi-step setup; list sets expectations. | "Quick knowledge check" — could sound like a test; "tailored content" helps. |
| 3 | **Mode** | "Choose your mode" — Non-Muslim ("Learning focus") vs Muslim ("Full religious observance"). | I'm here to learn → Non-Muslim. | Clear. |
| 4 | **Knowledge** | Quiz: "What is Ramadan?", "When do Muslims break their daily fast?", "What is Suhoor?", "How long does Ramadan last?", Five Pillars question. | Learning check; Suhoor = pre-dawn meal, break fast at sunset. | **First time they see "Suhoor" explained** (pre-dawn meal). Good. "Break fast at sunset (Maghrib)" — Maghrib not explained. Quiz can feel like a test; "No pressure" helps but some may rush. |
| 5 | **Health** | Same as Muslim. | Safety. | Fine. |
| 6 | **Location** | Same. | Needed for times. | Same as Muslim. |
| 7 | **Schedule** | "Full Ramadan (Dawn to sunset)" — optional voluntary. Tooltip for voluntary: "Extra voluntary fasts…" | Main option is dawn-to-sunset. | **"Dawn to sunset"** — still no explicit sentence: "During the fast you don't eat or drink from dawn until sunset." Voluntary block adds complexity. |
| 8 | **Notifications** | "Get **pre-dawn meal (Suhoor)** and **breaking fast** reminders." | Reminders for the two key times. | **Good:** Non-Muslim gets "pre-dawn meal (Suhoor)" and "breaking fast" instead of raw "suhoor/iftar." Reduces jargon. |
| 9 | **Priorities** | Learning, culture, Quran, macros. | Personalization. | Same as Muslim; multiple controls. |
| 10 | **Goals** | Non-Muslim options: "Learn about Ramadan culture", "Try intermittent fasting safely", etc.; optional. | Optional focus. | Clear. |
| 11 | **Dashboard** | Same layout. Status: [I'm fasting] [I didn't fast today]. Strip: "Suhoor end" / "Iftar" (labels depend on userType). Day detail, quick access. | I can tap "I'm fasting" when I start. | **If labels on Dashboard still say "Suhoor" / "Iftar"** without explanation (e.g. in Muslim mode or fallback), non-Muslim may not know which is "when I can eat." **"I'm fasting"** = I've started my fast (after suhoor) — not obvious that it means "I'm not eating until sunset." **"Mark complete"** appears after they've broken fast; first time they may not see it. |

### Summary (Non-Muslim)

- **Understand:** Learning path, quiz teaches Suhoor/break at sunset, reminders use "pre-dawn meal" and "breaking fast," dashboard is for logging.
- **Confusion:** (1) **Hero/timer:** "Suhoor end" / "Iftar" with no explanation. (2) **Fast = no food/drink dawn–sunset** never stated in one sentence. (3) **Dashboard:** "I'm fasting" could be read as "I want to fast" rather than "I've started my fast (after suhoor)." (4) Which countdown is "when I can eat?" (Iftar) — not spelled out on first view.

---

## 3. Minimal "first-session script"

### What to ask (keep current, clarify purpose)

| Step | Ask | Purpose | Note |
|------|-----|---------|------|
| Mode | Muslim vs Non-Muslim | Short path vs learning + tailored labels | Keep. |
| Knowledge (non-Muslim only) | 5 quiz questions | Introduce Suhoor, break at sunset, Ramadan length | Keep; add one line after quiz: "During the fast you don't eat or drink from dawn until sunset." |
| Health | Conditions or None | Safety | Keep. |
| Location | Set or skip | Accurate times | Keep; if skip, first Dashboard view can show one line: "Set location later for accurate times." |
| Schedule | Full Ramadan ± voluntary | What they're committing to | Keep; add one line: "You'll log each day: start fast (after suhoor), break fast (at iftar), or mark complete." |
| Notifications | Reminders on/off | Optional | Keep; non-Muslim copy already uses "pre-dawn meal (Suhoor)" and "breaking fast." |
| Priorities | Learning, culture, Quran, etc. | Dashboard shape | Keep; consider defaults only and "Continue" for fastest path. |
| Goals | Optional goals + intention | Motivation | Keep; skip is clear. |

### What to default

- **Location:** Auto-detect once on Location step; pre-fill so user can "Continue" without typing. If they skip, don't block Dashboard.
- **Schedule:** "Full Ramadan" pre-selected; voluntary unchecked. One tap to continue.
- **Notifications:** Off by default; single "Enable reminders" for those who want them.
- **Priorities:** Sensible defaults (e.g. Moderate / Some / Some for non-Muslim; Deep / Lots / Daily for Muslim); single "Continue" without requiring changes.
- **Goals:** None selected; "Go to dashboard" prominent. Optional free-text below.

### What to gently explain (first session)

| Concept | When | Suggested copy (short) |
|---------|------|-------------------------|
| **What fasting means** | After Schedule (or once before Dashboard) | "During the fast you don't eat or drink from dawn (Fajr) until sunset (Maghrib). You'll log when you start and when you break." |
| **Suhoor** | First time it appears (hero tooltip or onboarding) | "Suhoor = last meal before dawn. After suhoor end, the fast begins." |
| **Iftar** | First time it appears | "Iftar = when you break the fast at sunset. You can eat and drink after iftar." |
| **Fast vs no fast (today)** | On Dashboard near status | "Not fasting right now" + subline: "Tap **I'm fasting** after suhoor when you've started; tap **Break fast** if you break early." |
| **When to tap what** | Optional first-visit Dashboard tip | "After suhoor: tap **I'm fasting**. After sunset: tap **Mark complete**." |

---

## 4. Copy and small UI tweaks (reduce cognitive load)

### 4.1 Hero / landing

| Element | Current | Proposed |
|---------|---------|----------|
| Timer label (no location) | "Suhoor end" / "Iftar" | Add tooltip or micro-copy: "Suhoor end = fast begins · Iftar = break fast at sunset" (or link "What's this?" → FAQ or one-line explainer). |
| Below timer | "Both paths set your location for accurate times." | Add: "Times are for your location — set it in the next steps." |
| Non-Muslim path | — | On Welcome or after Mode: one line — "You'll learn what suhoor and iftar mean and how to log your first day." |

### 4.2 Onboarding

| Step | Current | Proposed |
|------|---------|----------|
| **Schedule** | "Full Ramadan" / "Dawn to sunset (Fajr to Maghrib)" | Add below: "Each day you'll log: start fast (after suhoor), break fast (at iftar), or mark day complete." |
| **Knowledge (last question)** | — | After last answer, before Continue: "During the fast you don't eat or drink from dawn until sunset. The app will remind you of suhoor and iftar times." |
| **Notifications (non-Muslim)** | "Get pre-dawn meal (Suhoor) and breaking fast reminders" | Keep; ensure Dashboard and timer use same friendly labels where possible. |

### 4.3 Dashboard (first visit)

| Element | Current | Proposed |
|---------|---------|----------|
| Status row | "Not fasting" + [I'm fasting] [I didn't fast today] | Add subline (collapsible or dismissible after first time): "After suhoor → **I'm fasting**. At sunset → **Mark complete**." |
| Suhoor/Iftar strip | "Suhoor end" / "Iftar" (or userType-based labels) | For non-Muslim: prefer "Pre-dawn end" / "Breaking fast (Iftar)" or keep "Suhoor end" / "Iftar" with tooltip: "Suhoor end = fast begins · Iftar = when you can eat." |
| Location banner | "Set your location in Settings for accurate prayer and fasting times." | Add: "You can still log your fast; times will be estimates until you set a location." |
| First-time cue | — | Optional: small one-time callout above quick access — "Start here: tap **Today** for the timer, or tap **I'm fasting** when you've started your fast." (dismissible) |

### 4.4 Tooltips and micro-copy

| Context | Proposed |
|---------|----------|
| "I'm fasting" (button) | Tooltip: "Tap after you've finished suhoor and started your fast. You'll break at iftar (sunset)." |
| "Mark complete" (button) | Tooltip: "Tap after you've broken your fast at iftar. Counts as one full day." |
| "I didn't fast today" | Tooltip: "Tap if you're not fasting today (e.g. travel, illness). Won't count as a broken fast." |
| Timer "Suhoor end" | "Fast begins at this time (no food or drink until iftar)." |
| Timer "Iftar" | "Break your fast at sunset — you can eat and drink after this time." |

### 4.5 Small UI tweaks

| Tweak | Rationale |
|-------|-----------|
| **One-line "fast" explainer** on Schedule or after Knowledge | Single place that states: no food/drink dawn–sunset. |
| **Dashboard status subline** (dismissible) | Clarifies "I'm fasting" = after suhoor; "Mark complete" = after iftar. |
| **Non-Muslim labels** on strip/timer | Use "Pre-dawn end" / "Breaking fast" or keep terms with tooltip so first-time users know which countdown is "when I can eat." |
| **First-visit tip** above quick access | "Start here: Today or I'm fasting" — reduces "what do I do first?" |
| **Location banner** | Add "You can still log your fast" so skip doesn't feel blocking. |
| **Priorities** | Consider "Continue with recommended" as primary CTA so users can skip tuning. |

---

## 5. Summary: priorities for first session

| Priority | Change | Impact |
|----------|--------|--------|
| **P1** | Add one sentence: "During the fast you don't eat or drink from dawn until sunset" (after Knowledge for non-Muslim, or on Schedule for both). | Reduces ambiguity about what "fast" means. |
| **P2** | Dashboard status row: add dismissible subline — "After suhoor → I'm fasting. At sunset → Mark complete." | Clarifies when to tap what. |
| **P3** | Timer/hero: tooltip or micro-copy for "Suhoor end" and "Iftar" (e.g. "Suhoor end = fast begins · Iftar = break fast at sunset"). | Helps non-Muslims and anyone new to terms. |
| **P4** | Location banner: add "You can still log your fast; times will be estimates until you set a location." | Reduces fear that skipping breaks the app. |
| **P5** | Optional first-visit cue above quick access: "Start here: Today or I'm fasting." (dismissible) | Guides first action. |
| **P6** | Ensure non-Muslim sees "pre-dawn meal (Suhoor)" / "breaking fast" (or equivalent) in Dashboard strip/timer where possible; else keep tooltips. | Consistency with Notifications copy; less jargon. |

---

**Related docs:** `ONBOARDING-REONBOARDING-FLOWS.md`, `NON-MUSLIM-AND-RAMADAN-CURIOUS-FLOWS.md`, `USER-FLOWS-AND-TEST-PROMPTS.md`, `UX-NAVIGATION-IA-EVALUATION.md`.
