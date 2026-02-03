# UX: Time-to-Value Strategy

Strategy to reduce **time to value** (how long until the app feels useful). Describes the current shortest path from landing to "seeing something personally meaningful" for fasting, meals, and journaling; identifies unnecessary steps; and proposes a redesigned flow so each persona sees value in **under 60 seconds**, with details defaulted or deferred where needed.

---

## 1. What “personally meaningful” means (by area)

| Area | “Value” moment |
|------|-----------------|
| **Fasting** | User sees **their own** fast reflected: e.g. “You're fasting,” or “1 day” in streak / “1 of 30” in the ring after marking a day complete (or break with reason). |
| **Meals** | User sees **their own** meal(s) for a day: one item in suhoor/iftar in day detail, or on Meals/Macros. |
| **Journaling** | User sees **their own** entry: one line in “Past entries” or in day detail. |

---

## 2. Current shortest path (landing → value)

**Constraint:** Dashboard only renders when `onboardingComplete || hasTime`. For a brand-new user, `onboardingComplete` is false and `hasTime` is typically false until location is set or auto-detected. So in practice **they must complete onboarding** (through Goals → “Go to dashboard”) before they can use the Dashboard. Progress, meals, and journal are all persisted in localStorage and work as soon as they reach Dashboard.

### 2.1 Fasting

| Step | Screen / action | Cumulative |
|------|------------------|------------|
| 1 | Land on `/` (Index) | 0 |
| 2 | Tap “Start your journey” or “I'm Muslim” | 1 |
| 3 | Welcome → “Get Started” | 2 |
| 4 | Mode → Muslim or Non‑Muslim → (auto or tap) | 3 |
| 5 | (Non‑Muslim only) Knowledge → 5 answers → Continue | 4–8 |
| 6 | Health → select / Continue | +1 |
| 7 | Location → Continue or “Skip for now” | +1 |
| 8 | Schedule → Full Ramadan → Continue | +1 |
| 9 | Notifications → Continue | +1 |
| 10 | Priorities → Continue (defaults) | +1 |
| 11 | Goals → “Go to dashboard” (or skip) | +1 |
| 12 | **Dashboard** | ~9 (Muslim) or ~14 (Non‑Muslim) |
| 13 | Tap “I'm fasting” or “Mark complete” | +1 |
| **Value** | **“You're fasting” or “1 day” / “1 of 30”** | **~10–15 steps** |

**Rough time:** 2–4+ minutes (many taps and reads). Value only after full onboarding + one logging action.

### 2.2 Meals

Same steps 1–12 to reach Dashboard, then:

| Step | Screen / action | Cumulative |
|------|------------------|------------|
| 13 | Tap “Meals” in quick access (or open day detail) | +1 |
| 14 | Add one suhoor or iftar item (or use day detail “Add” on Dashboard) | +1 |
| **Value** | **Own meal visible in list / day detail** | **~11–16 steps** |

**Rough time:** Same 2–4+ min to Dashboard, then ~30–60 s to add a meal. Value at ~3–5 min.

### 2.3 Journaling

Same steps 1–12 to reach Dashboard, then:

| Step | Screen / action | Cumulative |
|------|------------------|------------|
| 13 | Tap “Journal” in quick access (or “Add in Journal” in day detail) | +1 |
| 14 | Write one line and save | +1 |
| **Value** | **Own entry in “Past entries” or day detail** | **~11–16 steps** |

**Rough time:** Same 2–4+ min to Dashboard, then ~30–60 s to write. Value at ~3–5 min.

---

## 3. Unnecessary steps or decisions before value

Steps that could be **defaulted** or **deferred** so the user reaches “meaningful” faster:

| Step | Why it blocks value | Could be |
|------|----------------------|----------|
| **Welcome** | Extra click; no data collected | Optional: land with one CTA “Log your first fast” / “Try the dashboard” that goes straight to Dashboard or a minimal gate. |
| **Mode** | Needed for labels (Muslim vs non‑Muslim); not needed to *see* value | Deferred: default to “Non‑Muslim” or “Explore” and ask mode later (e.g. first Settings visit). Or single question: “Here to track Ramadan?” Yes → Muslim defaults; No → Learning defaults. |
| **Knowledge (non‑Muslim)** | 5 questions before any value | Deferred: show after first value (e.g. “Want a quick intro to suhoor & iftar?”). |
| **Health** | Safety; not required to *display* a logged fast | Deferred: show once (e.g. before first “I'm fasting”) or in Settings; or one tick “I've read the health note” with link. |
| **Location** | Needed for accurate prayer/countdown; not for logging a fast or meal or journal line | Defaulted: auto-detect in background; allow “Skip for now” and show Dashboard with “Set location for times” banner. Already skippable; keep as-is or make even more prominent. |
| **Schedule** | Full Ramadan vs voluntary; not needed for “I logged today” | Defaulted: assume “Full Ramadan”; optional “Add voluntary” later in Settings. |
| **Notifications** | Not needed for first value | Defaulted: off; ask later (e.g. after first complete fast). |
| **Priorities** | Drives quick-action order and feature set; not needed for first value | Defaulted: use sensible defaults (e.g. Today, Meals, Journal, Progress first); “Customize” in Settings. |
| **Goals** | Optional; blocks “Go to dashboard” | Defaulted: none selected; single “Go to dashboard” (or “Try dashboard”) without requiring goal selection. |

**Summary:** The only thing strictly required for **first value** is: (1) reach a surface where they can log a fast / add a meal / write a line, and (2) persist it. Mode, health, schedule, notifications, priorities, and goals can be defaulted or deferred; location can stay skippable.

---

## 4. Redesigned flow: value in under 60 seconds

### 4.1 Principle

- **One primary path:** Land → **one choice** (or none) → **Dashboard** → **one action** → value.
- **Defaults:** Full Ramadan, no notifications, default priorities, no goals, mode inferred or asked in one line.
- **Deferred:** Knowledge quiz, full health screen, schedule details, notification setup, priority sliders, goals. Surface later (after first value, or in Settings / optional “Finish setup”).
- **Location:** Auto-detect in background; allow “Skip for now” so Dashboard loads; banner: “Set location for accurate times.”

### 4.2 Proposed “Quick start” path (under 60 s)

**Option A — Minimal gate (recommended)**

| Step | Screen / action | Time (est.) |
|------|------------------|-------------|
| 1 | Land on `/` | 0 s |
| 2 | Single CTA: **“Log your first fast”** or **“Try the dashboard”** (or keep “Start your journey” but send to step 3) | 5–10 s |
| 3 | **One screen:** “We'll use default settings. You can change them anytime in Settings.” + **[Go to dashboard]**.
| 4 | **Or:** “Quick setup: use my location for prayer times?” [Yes] [Skip]. Then → Dashboard. | 10–20 s |
| 5 | **Dashboard** (with defaults: Full Ramadan, no notifications, default quick actions; location from auto-detect or “Set location” banner) | 20–25 s |
| 6 | **Fasting:** Tap “I'm fasting” or “Mark complete” | 25–35 s |
| **Value (fasting)** | **“You're fasting” or “1 day” / “1 of 30”** | **~30–40 s** |

For **meals** or **journal**, same 1–5, then from Dashboard: tap Meals → add one item, or Journal → write one line → save. Value in **~45–60 s**.

**Option B — One question then Dashboard**

| Step | Screen / action | Time (est.) |
|------|------------------|-------------|
| 1 | Land on `/` | 0 s |
| 2 | “Start your journey” → **Welcome** (one screen) | 5 s |
| 3 | **Single question:** “I'm here to…” [Track my Ramadan fasts] [Learn about Ramadan / try fasting]. (Determines mode + defaults; no quiz.) | 10 s |
| 4 | “You're all set. You can add location and reminders in Settings.” **[Go to dashboard]** | 15 s |
| 5 | **Dashboard** (defaults as above) | 20 s |
| 6 | Tap “I'm fasting” or “Mark complete” (or Meals / Journal) | 25–35 s |
| **Value** | **Own fast / meal / entry visible** | **~35–50 s** |

### 4.3 What to default (so value is fast)

| Setting | Default | Where to change later |
|---------|---------|------------------------|
| Mode | Inferred from “I'm here to…” or “Non‑Muslim” / “Explore” | Settings or first-time tooltip |
| Health | Not asked; link to health note in Settings or before first “I'm fasting” | Settings / one-time dialog |
| Location | Auto-detect; if none, “Skip” and show Dashboard with banner | Settings / banner CTA |
| Schedule | Full Ramadan | Settings |
| Notifications | Off | Settings or prompt after first complete fast |
| Priorities | Today, Meals, Journal, Progress, Schedule, … | Settings / “Edit shortcuts” |
| Goals | None | Dashboard goals card / Goals page |

### 4.4 What to defer (after first value)

- **Knowledge quiz** (non‑Muslim): After first value, optional “Learn suhoor & iftar in 30 seconds” or link from Learn.
- **Health screening:** One-time before first “I'm fasting” or in Settings.
- **Full onboarding:** Optional “Finish setup” in Dashboard (location, reminders, goals) or Settings entry point “Complete your profile.”

### 4.5 Persistence and “try before commit”

- **Progress, meals, journal** are already in localStorage. As soon as the user can reach Dashboard and perform one action, that action can be persisted.
- If product wants “try without account” semantics: keep current behavior (persist on first action); optionally later add “Create account to sync” without blocking first value.

---

## 5. Copy and UI for the short path

| Element | Suggested copy |
|---------|-----------------|
| **Landing primary CTA** | “Log your first fast” or “Try the dashboard” (in addition to or instead of “Start your journey”). |
| **Minimal gate (Option A)** | “We'll use default settings. You can change location, reminders, and more in Settings.” [Go to dashboard] |
| **Single question (Option B)** | “I'm here to…” [Track my Ramadan fasts] [Learn about Ramadan / try fasting] |
| **After gate** | “You're all set. Tap **I'm fasting** when you've started, or **Mark complete** after iftar.” (Optional one-time tip on Dashboard.) |
| **Location banner (if skipped)** | “Set location in Settings for accurate prayer and fasting times. You can still log your fasts here.” |

---

## 6. Implementation priorities

| Priority | Change | Impact |
|----------|--------|--------|
| **P1** | Add **“Try the dashboard”** or **“Log your first fast”** from landing → minimal gate (1 screen: defaults + “Go to dashboard”) or single question then Dashboard. | Shortest path to Dashboard without full onboarding. |
| **P2** | Allow **Dashboard to render** when user came from “Quick start” (e.g. set `onboardingComplete: true` with defaults when they confirm “Go to dashboard” from minimal gate, or introduce `quickStartDone` and treat like `hasTime` so Dashboard renders). | Removes 8–10 steps before first value. |
| **P3** | **Default** Schedule = Full Ramadan, Notifications = off, Priorities = default order, Goals = none; **defer** Knowledge, full Health, and detailed Priorities/Goals to after first value or Settings. | Fewer decisions before value. |
| **P4** | **Location:** Keep “Skip for now”; make it prominent; auto-detect in background; Dashboard shows “Set location for accurate times” banner when missing. | No blocking; value without location. |
| **P5** | Optional **one-time Dashboard tip:** “Tap **I'm fasting** when you've started, or **Mark complete** after iftar.” (Dismissible.) | Directs to first value in one tap. |

---

## 7. Summary

- **Current:** Fasting value ≈ 10–15 steps (full onboarding + one log); meals/journal ≈ 11–16 steps. **Rough time to value: 2–5 minutes.**
- **Friction:** Welcome, Mode, Knowledge, Health, Schedule, Notifications, Priorities, Goals all occur before Dashboard; only persistence and one action are truly required for value.
- **Proposed:** **Quick start** = land → one CTA → minimal gate (defaults + “Go to dashboard”) or one question → **Dashboard** → one action (I'm fasting / Mark complete / add meal / write line). **Value in ~30–60 seconds.** Default or defer mode, health, schedule, notifications, priorities, goals; keep location skippable with banner.
- **Outcome:** Each persona (fasting, meals, journal) can see something personally meaningful in under 60 seconds; details and “finish setup” can follow without blocking that moment.

---

**Related docs:** `ONBOARDING-REONBOARDING-FLOWS.md`, `UX-FIRST-TIME-EXPERIENCE-REVIEW.md`, `USER-FLOWS-AND-TEST-PROMPTS.md`, `NON-MUSLIM-AND-RAMADAN-CURIOUS-FLOWS.md`.
