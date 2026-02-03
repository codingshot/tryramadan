# Onboarding and re-onboarding flows

Mapping of **first-time onboarding** and **re-onboarding** for the Ramadan fasting and journaling dashboard, including **information order**, **time-of-Ramadan variants**, and **edge cases** (abandonment, skips).

**Related:** `USER-FLOWS-AND-TEST-PROMPTS.md`, `MANUAL-QA-SCENARIOS.md`, `UX-FLOWS-AND-FRICTION.md`, `NON-MUSLIM-AND-RAMADAN-CURIOUS-FLOWS.md` (shadow fast, journal+meals only, simple vs full Islamic, mode switch).

---

## 1. Information requested and order

The app collects the following, in this order. Optional/skippable steps are noted.

| # | Step | Route | Information requested | Required? | Notes |
|---|------|--------|----------------------|------------|--------|
| 1 | Welcome | `/onboarding/welcome` | None (intro only) | — | CTA: "Get Started" → Mode |
| 2 | Mode | `/onboarding/mode` | **Faith background:** Muslim vs Non-Muslim | Yes | Muslim → skips Knowledge; Non-Muslim → Knowledge next |
| 3 | Knowledge | `/onboarding/knowledge` | **Quiz:** 5 questions (Suhoor, Iftar, etc.) | Yes (if Non-Muslim) | Skipped for Muslim |
| 4 | Health | `/onboarding/health` | **Health disclaimer:** conditions (pregnancy, diabetes, etc.) or "None" | Yes | Affects in-app guidance only; stored in onboarding state |
| 5 | Location | `/onboarding/location` | **Location:** city/coords + timezone (auto-detect or search) | **No** — can "Skip for now" | Prayer & fasting times need location; Dashboard shows reminder if skipped |
| 6 | Schedule | `/onboarding/schedule` | **Fasting schedule:** Full Ramadan; optional voluntary (Mon/Thu, Ayyam al-Beed) | Yes | selectedProgram, voluntaryFasting |
| 7 | Notifications | `/onboarding/notifications` | **Reminders:** Suhoor / Iftar / hydration; times | **No** — can continue without enabling | Toggles; stored in state then in preferences on completion |
| 8 | Priorities | `/onboarding/priorities` | **Priorities:** Learning, culture/recipes, Quran, macros, simplify by location | Yes (defaults pre-filled) | Sliders/toggles; influences dashboard quick actions |
| 9 | Goals | `/onboarding/goals` | **Goals:** Select one or more; optional free-text intention | Goals optional (can submit with none) | "Go to dashboard" → preferences persisted; redirect to `/dashboard` |

**Persistence:** Onboarding state (mode, location, schedule, notifications, priorities, goals, etc.) is saved to `localStorage` key `tryramadan-onboarding-draft` on every change. It is **not** persisted to final preferences until the user completes Goals and clicks "Go to dashboard." Until then, no `tryramadan-preferences` or `tryramadan-progress` is written for onboarding.

**After completion:** Preferences are written (including `onboardingComplete: true`), draft can be cleared or left; user lands on Dashboard. Dashboard redirects to `/onboarding/welcome` only when `!onboardingComplete && !hasTime` (and not still loading location). So once `onboardingComplete` is true, user is never forced back into onboarding.

---

## 2. First-time user flows by time relative to Ramadan

### 2.1 First-time user: 2 weeks before Ramadan

**Context:** User opens the app for the first time ~14 days before Ramadan starts (e.g. mid-February for a March start). No `tryramadan-preferences` or `tryramadan-progress`.

**Goal:** Land on Dashboard "ready to use today" — meaning they can see countdown to Ramadan, set location for future prayer times, and optionally log voluntary fasts if they do any before Ramadan.

**Steps from landing to ready:**

| Step | Action | Outcome |
|------|--------|---------|
| 1 | Land on `/` (Index) | Hero shows "X days until Ramadan"; CTAs: "Start your journey", "I'm Muslim". |
| 2 | Click "Start your journey" or "I'm Muslim" | Navigate to `/onboarding/welcome` (or `/onboarding/mode` with preSelectMuslim if "I'm Muslim"). |
| 3 | Welcome → "Get Started" | → Mode. |
| 4 | Mode: choose Muslim or Non-Muslim → Continue | Muslim → Health; Non-Muslim → Knowledge. |
| 5 | (If Non-Muslim) Knowledge: answer 5 questions → Continue | → Health. |
| 6 | Health: acknowledge / select conditions → Continue | → Location. |
| 7 | Location: "Use my location" or search city → Continue, or "Skip for now" | → Schedule. If skipped: no coords; Dashboard will show reminder banner until set or dismissed. |
| 8 | Schedule: Full Ramadan ± voluntary → Continue | → Notifications. |
| 9 | Notifications: enable Suhoor/Iftar reminders or Continue without | → Priorities. |
| 10 | Priorities: set or leave defaults → Continue | → Goals. |
| 11 | Goals: select goals + optional intention → "Go to dashboard" | Preferences persisted; redirect to `/dashboard`. |
| 12 | Dashboard | Shows "X days until Ramadan" (e.g. 14); no "Day N" badge; prayer strip shows Suhoor end / Iftar if location set, else placeholder + banner. User can use Today, Schedule, Journal, Settings. |

**Information order (summary):** Faith (mode) → [Knowledge if non-Muslim] → Health → Location (optional) → Schedule → Notifications (optional) → Priorities → Goals → Done.

**Ready to use today:** Yes. They can set location in Settings if skipped; use Schedule to add voluntary fasts; use Journal; and wait for Ramadan for "Day 1" and full fast logging.

---

### 2.2 First-time user: first day of Ramadan

**Context:** User opens the app for the first time on the first day of Ramadan (e.g. 2025-03-01). No prior preferences or progress.

**Goal:** Land on Dashboard ready to log **today’s** first fast (e.g. tap "I'm fasting" after suhoor, later "Mark complete").

**Steps from landing to ready:**

| Step | Action | Outcome |
|------|--------|---------|
| 1–11 | Same as §2.1 (Welcome → … → Goals → "Go to dashboard") | Preferences persisted; redirect to `/dashboard`. |
| 12 | Dashboard | Shows "Day 1 of Ramadan" (or "Ramadan Mubarak"); Suhoor end / Iftar times if location set. User taps "I'm fasting" when ready. |
| 13 | (Optional) Dashboard → Today | Countdown to Iftar; Mark complete after Maghrib. |

**Information order:** Unchanged from §2.1.

**Ready to use today:** Yes. Same flow; only difference is Dashboard state: "Day 1" and ability to start/complete today’s fast immediately. If they skipped location, they can set it in Settings and times will update.

---

### 2.3 First-time user: last 10 nights of Ramadan

**Context:** User opens the app for the first time during the last 10 nights (e.g. day 21–30). They may want to log remaining fasts, use Schedule for Laylat al-Qadr, and use Journal.

**Goal:** Land on Dashboard ready to use **today**: see "Day N of Ramadan" (or "Last day" on day 30), log today’s fast, use Schedule/Journal for the last 10 nights.

**Steps from landing to ready:**

| Step | Action | Outcome |
|------|--------|---------|
| 1–11 | Same as §2.1 (Welcome → … → Goals → "Go to dashboard") | Preferences persisted; redirect to `/dashboard`. |
| 12 | Dashboard | Shows "Day N of Ramadan" (e.g. Day 22) or "Last day of Ramadan" on final day; Suhoor/Iftar strip; fast actions. |
| 13 | (Optional) Dashboard → Schedule | Calendar shows last 10 days; odd nights (21, 23, 25, 27, 29) can show Laylat al-Qadr styling. |
| 14 | (Optional) Dashboard → Journal | Write for today or past days in the last 10. |

**Information order:** Unchanged from §2.1.

**Ready to use today:** Yes. No extra onboarding steps; Dashboard and Schedule adapt to "last 10 nights" and last day automatically.

---

## 3. Re-onboarding (when it happens)

**Re-onboarding** in this doc means: user who has **not** completed onboarding (no `onboardingComplete`) returns to the app later.

- **Direct visit to `/dashboard`:** If `!onboardingComplete && !hasTime`, Dashboard redirects to `/onboarding/welcome` (after location load attempt). So they are sent back into onboarding.
- **Visit to `/` or `/onboarding/welcome`:** They can click "Get Started" (or "I'm Muslim") and go through onboarding again. Any **draft** in `tryramadan-onboarding-draft` is loaded into context, so Mode (and subsequent steps) may show previously selected values; the **URL** always starts at welcome/mode, so we do not "resume at step N" by deep link.

**User who has completed onboarding:** Never forced back. They can open Settings or use the app without seeing onboarding again unless they clear data or a future "Reset and re-onboard" feature exists.

---

## 4. Edge cases

### 4.1 User abandons onboarding midway and returns later

**Scenario:** User starts onboarding, completes e.g. Mode and Health, then closes the tab or navigates away (or refreshes) before completing Goals.

**Current behavior:**

- **Draft:** Onboarding state is saved to `tryramadan-onboarding-draft` on every change. So when they return to the same origin and open the app again:
  - If they land on `/` or `/onboarding/welcome` and click "Get Started", the **context is initialized from the draft**. So Mode, Health, Location, etc. can be pre-filled.
  - The **step URL** is not restored: they start at Welcome (or Mode if they navigate). So they must click through from Welcome → Mode → … again, but with previous answers restored where the draft had them.
- **No completion:** Because they never clicked "Go to dashboard" on Goals, `onboardingComplete` is never set. So:
  - Visiting `/dashboard` will redirect to `/onboarding/welcome` (if no `hasTime` from e.g. stored location elsewhere).
  - They effectively "resume" by re-entering onboarding and proceeding; draft makes it quick.

**Suggested testing:**

- Abandon at Location (skip or set location) → close tab → reopen `/` → Get Started → confirm Mode and Health still selected; proceed through Location → … → Goals → Go to dashboard. Dashboard should load with preferences and (if location was set) no redirect loop.
- Abandon at Goals (select goals, do not click Go to dashboard) → close tab → reopen `/onboarding/goals` (or `/` and navigate to Goals). Confirm goals and intention are restored; click Go to dashboard → Dashboard loads.

**Possible improvement (not required for this doc):** Persist "last step" (e.g. `onboarding-last-step: location`) and, when user lands on `/onboarding/welcome` with a draft that has mode set, redirect to that step so they don’t have to click through every screen again.

---

### 4.2 User skips recommended steps (location, reminders)

**Location skipped**

- **During onboarding:** User clicks "Skip for now" on Location. No `locationCoords` (and possibly no timezone) in final preferences.
- **After onboarding:**
  - **Dashboard:** On first load (and until dismissed), a dismissible banner appears: "Set your location in Settings for accurate prayer and fasting times." Clicking it can go to Settings (or Settings#location). Dismissal is stored (e.g. `tryramadan-dismissed-location-banner`) so we don’t show it again in the same session/until cleared.
  - **Prayer times:** Without coords, the app may use IP-based fallback for a rough location, or show placeholders. FastingTimer and prayer strip may show "Set your location" or use default times. No crash.
  - **Later flow:** User can open Settings → Location → search city or "Use my location" → Save. After that, prayer times and Suhoor/Iftar update everywhere; banner can be dismissed and no longer shown (if already dismissed) or not shown once location is set.
- **Effect on "ready to use today":** User is still "ready" — they can use fast actions, Journal, Schedule, Progress — but countdown and times are less accurate until location is set.

**Reminders (notifications) skipped**

- **During onboarding:** User leaves Suhoor/Iftar reminders off and clicks Continue on Notifications. `notifications.suhoor` / `notifications.iftar` are false in state, then in preferences on completion.
- **After onboarding:**
  - No reminder notifications are scheduled. User can still use the app for logging, countdown, and Journal.
  - **Later flow:** User can open Settings → Notifications → enable Suhoor/Iftar (and set minutes before). ReminderScheduler will then schedule notifications. No re-onboarding required.
- **Effect on "ready to use today":** No impact on core readiness; only reminder UX is missing until they enable it in Settings.

**Summary table**

| Skipped step | Immediate effect | Later flow | Ready to use today? |
|--------------|------------------|------------|----------------------|
| Location     | No coords; possible IP fallback; Dashboard banner | Set in Settings → times update everywhere | Yes (with banner / less accurate times) |
| Notifications| No reminders      | Enable in Settings → reminders work      | Yes |

---

## 5. Summary

- **Information order:** Welcome → Mode → [Knowledge if non-Muslim] → Health → Location (optional) → Schedule → Notifications (optional) → Priorities → Goals → Dashboard.
- **First-time, 2 weeks before:** Same flow; Dashboard shows "X days until Ramadan"; ready for voluntary fasts, Journal, and Settings.
- **First-time, first day:** Same flow; Dashboard shows "Day 1" and fast actions; ready to log today’s fast.
- **First-time, last 10 nights:** Same flow; Dashboard shows "Day N" or "Last day"; Schedule/Journal support last 10 nights.
- **Abandon and return:** Draft in localStorage restores answers; user re-enters at Welcome and proceeds (step URL not restored).
- **Skip location:** Dismissible Dashboard banner; set later in Settings; times update; still "ready to use today" with possible placeholders.
- **Skip reminders:** No reminders until enabled in Settings; still "ready to use today."

**Reference:** Step definitions and routes in `OnboardingLayout.tsx` and `OnboardingContext.tsx`; redirect logic in `Dashboard.tsx`; banner and export in `USER-FLOWS-AND-TEST-PROMPTS.md` and `MANUAL-QA-SCENARIOS.md`.
