# User flows, personas & UX friction

Product/UX test summary: flows mapped, two personas simulated, friction points and concrete UI suggestions.

---

## 1. Screens and routes (map)

| Area | Routes | Main user goal | Typical path (clicks/steps) |
|------|--------|----------------|-----------------------------|
| **Onboarding** | `/onboarding/welcome` … `goals` | Set mode, health, location, schedule, notifications, priorities, goals; land on dashboard | Welcome → Get Started → Mode (Non-Muslim or Muslim) → [Knowledge if non-Muslim] → Health → Continue → Location (auto-detect or search; optional Skip for now) → Schedule (Full Ramadan ± voluntary) → Notifications (enable reminders) → Priorities (learning, culture, Quran) → Goals (select goals + intention) → Complete → Dashboard |
| **Location / time** | `/onboarding/location`, `/settings` (location section) | Set location for prayer & fasting times | Onboarding: run auto-detect or search city → Select → Continue. Or "Skip for now". Later: Settings → Location → search or Auto-detect. |
| **Daily fast tracking** | `/dashboard`, `/dashboard/today` | Start fast, mark complete, or log break | Dashboard: tap "I'm fasting" (after suhoor) → later "Mark complete" or "Break fast" (reason dialog). Or Dashboard Today: same actions + countdowns, hydration, energy. |
| **Meal tracking** | `/dashboard/meals`, `/dashboard/schedule` | Plan/log suhoor, iftar, snacks | Dashboard → Meals: Suhoor / Iftar tabs → pick recipes, add to day. Or Dashboard → Schedule: pick day → meal plan note or food log (suhoor/iftar/between). |
| **Journaling** | `/dashboard/journal` | Write daily reflection; view history | Dashboard → Journal → pick date on calendar → prompt + textarea + mood + gratitude → Save. "View past entries" scrolls to list. |
| **Stats / progress** | `/dashboard/progress` | See streak, completion rate, export | Dashboard → Progress: days completed, streak, broken days, CSV export. |
| **Settings** | `/settings` | Mode, location, notifications, goals, export | Nav or Dashboard → Settings → edit Fasting path, Location, Notifications, Goals, etc. |

---

## 2. Persona flows (simulated)

### Persona A: Practicing Muslim (full Ramadan fasts)

| Flow | Steps | Friction |
|------|--------|----------|
| **First-time setup before Ramadan** | Home → Start journey → Mode: Muslim → Health → Location (set) → Schedule: Full Ramadan → Notifications: Enable → Priorities → Goals (e.g. Complete Ramadan, Quran) → Complete → Dashboard. | Minimal. Muslim skips knowledge quiz. "X days until Ramadan" on dashboard is clear. Optional: one line on Goals screen — "When Ramadan starts, you'll see the timer and daily tasks here." |
| **Logging today's fast** | Dashboard: "I'm fasting" (after suhoor) → later "Mark complete" or "Break fast" → if break: choose reason → done. | Tooltip explains "I'm fasting (after suhoor)". "Break fast" is clear. |
| **Logging meals** | Dashboard → Meals → Suhoor or Iftar tab → pick recipe / add custom → or Schedule → add to day. | Labels "Suhoor" / "Iftar" are familiar. Subtext "Morning" / "Evening" helps. |
| **Journal + history** | Dashboard → Journal → date → prompt (e.g. "How did you feel at suhoor vs iftar?") → write → Save. "View past entries" for history. | Prompts use "suhoor"/"iftar" — fine for Muslim. |

### Persona B: Non-Muslim (time-restricted eating / supporting, not praying)

| Flow | Steps | Friction |
|------|--------|----------|
| **First-time setup before Ramadan** | Home → Get Started → Mode: Non-Muslim → Knowledge (5 questions) → Health → Location (set or skip) → Schedule → Notifications → Priorities → Goals (e.g. Support friends, Health) → Complete → Dashboard. | "Your Fasting Journey" and "X days until Ramadan" set context. Same optional Goals line as above. |
| **Logging today's fast** | Same as Muslim: "I'm fasting" → "Mark complete" or "Break fast". | **Friction:** "I'm fasting" tooltip says "after suhoor" but **Suhoor** is never defined in the dashboard/today UI for non-Muslims. Iftar is explained as "Breaking Fast (Iftar)" elsewhere; Suhoor is not. |
| **Logging meals** | Dashboard → Meals → Suhoor / Iftar tabs. | **Friction:** Meals page does say "Suhoor (pre-dawn) and Iftar (evening break-fast)" in the intro — good. Tabs still only say "Suhoor" / "Morning" and "Iftar" / "Evening". For consistency with Iftar treatment, Suhoor could be "Pre-dawn meal (Suhoor)" in non-Muslim mode. |
| **Journal + history** | Same as Muslim. | **Friction:** Prompt "How did you feel at suhoor vs iftar?" uses jargon; non-Muslim may not know "suhoor" yet. |

---

## 3. Flows vs friction (table)

| Flow | Friction point | Severity | Notes |
|------|----------------|----------|--------|
| Onboarding → Goals | No explicit “You’re set for Ramadan” / what happens next | Low | Add one line before Complete: e.g. "You'll see your dashboard with a countdown and daily tasks when Ramadan starts." |
| Daily fast (non-Muslim) | “Suhoor” unexplained in Dashboard/Today (only “Iftar” gets “Breaking Fast (Iftar)”) | Medium | First-time or contextual hint: e.g. “Suhoor = last meal before dawn (eat cutoff).” Or use `useIftarLabel`-style helper for Suhoor in non-Muslim mode. |
| Daily fast | No explicit “I didn’t fast today” / “Skipped” | Medium | Users who don’t fast (illness, travel, etc.) can only avoid tapping “I’m fasting” and not mark complete. No clear “I’m not fasting today” so the day is explicitly logged as skipped. |
| Daily fast | No “partial fast” state | Low | Only “complete” or “broke” (with reason). “I fasted part of the day” is folded into “broke” + reason. Acceptable; optional later: “Stopped early” as a reason or separate state. |
| Meals (non-Muslim) | Suhoor tab label not expanded like Iftar | Low | Meals intro text explains both; tab could say “Pre-dawn (Suhoor)” or “Suhoor (pre-dawn meal)” in non-Muslim mode. |
| Journal (non-Muslim) | Prompts use “suhoor”/“iftar” without explanation | Low | Either use mode-aware prompts (e.g. “How did you feel in the morning vs when you broke your fast?”) or add a short glossary tooltip on first use. |
| Location skip | “Skip for now” → Schedule; no reminder to set location later | Low | Optional: on Dashboard first load when location empty, one dismissible banner: “Set your location in Settings for accurate times.” |
| All dashboard sub-pages | — | None | “Back to Dashboard” and nav make exits clear. No dead ends found. |

---

## 4. Concrete UI copy and layout suggestions

### 4.1 Onboarding — Goals (last step)

- **Suggestion:** Before the primary CTA (Complete / Go to dashboard), add one line:
  - **Copy:** “You're all set. When Ramadan begins, you'll see your dashboard with a countdown, daily tasks, and fasting timer.”
- **Why:** Clarifies what happens after onboarding, especially for first-time users.

### 4.2 Dashboard / Dashboard Today — Suhoor for non-Muslims

- **Suggestion:** Where the app first shows “Suhoor” or “suhoor end” in the main flow (e.g. countdown card “Until suhoor end”), add a short inline or tooltip explanation for non-Muslim mode only.
  - **Copy (tooltip or inline):** “Suhoor = last meal before dawn (after this time, fasting starts).”
- **Alternative:** In Settings or a one-time tooltip on Dashboard: “Suhoor is the pre-dawn meal; Iftar is when you break the fast at sunset.”

### 4.3 Dashboard Today — “I didn’t fast today”

- **Suggestion:** When the user has not started fasting and it’s still “today”, add a tertiary action so the day can be explicitly marked as not fasting.
  - **Placement:** Next to or below “I fasted today — mark complete” (e.g. when `!fastingToday && !todayComplete`), add:
  - **Copy (button or link):** “I didn’t fast today” or “Skip today (didn’t fast)”.
  - **Behavior:** New state or log entry, e.g. `status: "skipped"` or “not fasting”, so Progress/stats can distinguish “completed / broke / skipped” and avoid implying everyone fasts every day.
- **Why:** Covers illness, travel, choice; makes the model explicit and avoids confusion.

### 4.4 Meals — Tab labels (non-Muslim mode)

- **Suggestion:** When `userType !== "muslim"`, make the Suhoor tab label mirror the Iftar treatment.
  - **Current:** “Suhoor” + “Morning”.
  - **Option A:** “Suhoor (pre-dawn meal)” as main label, keep “Morning” as subtext.
  - **Option B:** Keep “Suhoor” but add aria-label or small helper: “Pre-dawn meal (Suhoor)”.
- **Why:** Aligns with “Breaking Fast (Iftar)” and reduces jargon for non-Muslims.

### 4.5 Journal — Prompts (non-Muslim mode)

- **Suggestion:** For non-Muslim mode, use prompts that avoid “suhoor”/“iftar” or explain them.
  - **Example:** Replace “How did you feel at suhoor vs iftar?” with “How did you feel in the morning (before the fast) vs when you broke your fast?”
  - **Alternative:** Keep one prompt set but add a small “What’s suhoor/iftar?” link that expands a line of explanation.
- **Why:** Makes journaling feel inclusive and understandable without prior knowledge.

### 4.6 Dashboard — First visit with no location

- **Suggestion:** If `!preferences.locationCoords && onboardingComplete`, show a dismissible banner once (e.g. localStorage flag).
  - **Copy:** “Set your location in Settings for accurate prayer and fasting times.”
  - **Action:** Link to Settings (or Settings#location).
- **Why:** Gently reminds users who skipped location without blocking.

### 4.7 Break-fast reason dialog

- **Current:** “Why did you break your fast?” + list of reasons. “No judgment — your intention matters.”
- **Suggestion:** Keep as is. Optional: add one reason like “Stopped early (partial fast)” if you later support a distinct “partial” state; for now “Medical / health” and “Other” cover most cases.

### 4.8 Dashboard — “I’m fasting” button tooltip

- **Current:** “I'm fasting (after suhoor)” / “Tap when you've finished suhoor and started your fast.”
- **Suggestion:** For non-Muslim mode, add “Suhoor = last meal before dawn” in the tooltip body so the first time they see “suhoor” it’s explained.
- **Copy (non-Muslim):** “Tap when you've finished your pre-dawn meal (suhoor) and started your fast.”

---

## 5. Summary

- **Flows:** Onboarding, location, daily fast, meals, journal, progress, and settings are mapped with clear entry/exit; no dead ends.
- **Muslim persona:** Flows are clear; labels (Iftar, Suhoor) are familiar; optional improvement is a single “what’s next” line on Goals.
- **Non-Muslim persona:** Main gaps are (1) Suhoor unexplained in Dashboard/Today, (2) no “I didn’t fast today” option, (3) journal prompts and Meals tab labels using jargon. Addressing these with the copy and layout above will make the app intuitive for both personas.
- **Missing states:** Explicit “skipped / didn’t fast today” is the highest-impact addition; “partial fast” can stay as break + reason unless you want a dedicated state later.

---

## 6. Implementation status

Implemented in app:

- **4.1 Goals:** “You're all set. When Ramadan begins…” line before CTA (OnboardingGoals).
- **4.2 Suhoor for non-Muslims:** Dashboard and Dashboard Today show mode-aware tooltips on “Suhoor end” / countdown: “Suhoor = last meal before dawn (after this time, fasting starts).” Eating-window status tooltip is also mode-aware.
- **4.3 “I didn't fast today”:** Button and tooltip on Dashboard and Dashboard Today; `setDaySkipped` / `skippedDays` in progress.
- **4.4 Meals tab:** Suhoor tab has mode-aware aria-label (“Suhoor — pre-dawn meal” for non-Muslim) in DashboardMeals.
- **4.5 Journal prompts:** Non-Muslim set uses plain language (e.g. “How did you feel in the morning (before the fast) vs when you broke your fast?”).
- **4.6 Location banner:** Dismissible “Set your location in Settings…” when onboarding complete and no location (localStorage flag).
- **4.8 “I'm fasting” tooltip:** Mode-aware; non-Muslim sees “Tap after your pre-dawn meal (suhoor) when the fast has started.”
