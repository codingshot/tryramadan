# UX: Personalized Onboarding and Experience Tuning

This document suggests **minimal data inputs** to feel personalized early, **adaptive journey checks** (e.g. “Would you like reflection reminders?”), and a **balance** between personalization and simplicity—what defaults to auto vs what to ask explicitly.

**Related:** [UX-FIRST-TIME-EXPERIENCE-REVIEW.md](./UX-FIRST-TIME-EXPERIENCE-REVIEW.md), [ONBOARDING-REONBOARDING-FLOWS.md](./ONBOARDING-REONBOARDING-FLOWS.md).

---

## 1. Minimal data inputs to feel personalized early

**Principle:** Ask the **fewest** things that make the app feel “for me” in the first session: **location**, **fasting method** (who I am + what I’m doing), and **tone** (how the app speaks to me).

### 1.1 The three “early personalization” inputs

| Input | Why it matters | How to keep it minimal |
|-------|-----------------|-------------------------|
| **Location** | Prayer and fasting times, “Suhoor ends at 05:24,” timezone, hydration defaults. Without it, the app feels generic. | **Auto first:** Run geolocation or IP-based detection on the Location step and **pre-fill**; user taps “Use my location” or “Continue” (or edits). **Skip** allowed; Dashboard can show “Set location for accurate times” once. No city/country required if coords + timezone are set. |
| **Fasting method** | Who I am (Muslim vs learning) + what I’m doing (Full Ramadan ± voluntary). Drives labels (Iftar vs “Breaking Fast”), path length (quiz or not), and dashboard defaults. | **One choice:** “Muslim” vs “Non-Muslim / learning” (current Mode). **One program:** “Full Ramadan (dawn to sunset)” pre-selected; voluntary (Mon/Thu, Ayyam al-Beid) **optional** on same screen or “Add later in Settings.” No second “which program?” unless we add more programs. |
| **Tone** | How the app speaks: supportive and explanatory vs minimal and familiar. Affects copy (tooltips, empty states, reminders). | **Derive from mode by default:** Non-Muslim → more explanatory labels and optional “Learn more” cues; Muslim → concise, familiar terms. **Optional explicit:** One question “How do you prefer the app to sound?” with “Supportive (more explanations)” vs “Minimal (just the basics)” — default from mode, changeable in Settings. |

**Result:** In the **shortest path**, the user only **confirms** location (or skips), **picks mode** (Muslim / Non-Muslim), and **continues** through Schedule (one tap if Full Ramadan is default). Tone is implicit from mode unless we add one optional question. That’s **2–3 meaningful inputs** for “this is for me.”

### 1.2 What “personalized early” should affect (immediately after onboarding)

- **Labels:** Iftar vs “Breaking Fast (Iftar),” Suhoor vs “Suhoor (pre-dawn meal)” — already from `userType`.
- **Times:** Suhoor end (Fajr) and Iftar (Maghrib) for their location — from location + timezone.
- **Dashboard quick access:** Order and visibility from priorities (learning, culture, Quran, macros) — already from Priorities or defaults.
- **First screen copy:** One line that reflects mode, e.g. “Your fasting journey” vs “Ramadan Mubarak” (when in Ramadan) for Muslim; “Learn and try fasting” for non-Muslim.

### 1.3 What to avoid in the first session

- **Long lists:** Don’t ask learning/culture/Quran/macros/simplify as **required** choices; use **defaults** and “Continue,” with Priorities as an **optional** step or “Customize later.”
- **Demographics:** No gender/weight/age in onboarding; only in **Settings → Advanced** for calorie suggestion if they turn on macros.
- **Goals:** Keep goals **optional**; “Skip — go to dashboard” is the fast path.

---

## 2. Adaptive journey checks (“Would you like …?”)

**Principle:** After the user has **used** a feature or reached a **milestone**, offer one **relevant** enhancement (reminders, tips, or settings). One prompt at a time; dismissible; no repeat if they decline or complete.

### 2.1 When and what to ask

| Trigger | Suggested prompt (example) | Action if yes | Where it lives |
|---------|----------------------------|---------------|----------------|
| **First journal entry saved** | “Would you like a daily reminder to add a short reflection?” | Enable a “journal reminder” (e.g. evening, configurable in Settings). | Modal or inline card on Journal (after Save) or on next Dashboard visit. |
| **Completed 3 fasts (logged)** | “You’ve logged 3 days. Want suhoor & iftar reminders so you don’t miss a meal?” | Request notification permission if not yet granted; enable suhoor/iftar reminders. | Dashboard or Progress; once per user. |
| **Opened Journal 2+ times, no reminder set** | “Add a reflection reminder? A nudge after iftar can help.” | Same as first journal — offer journal reminder. | Journal page or Dashboard. |
| **First time opening Meals (or Schedule food log)** | “Track what you eat? We can remind you to log suhoor and iftar.” | Optional: “Remind me to log meals” (e.g. after Maghrib + after Fajr). | Meals or Schedule; one-time. |
| **Streak reached 7 days** | “You’re on a 7-day streak. Want a daily check-in reminder to keep it going?” | Enable “daily reminder” (existing preference) or a gentle “log your fast” nudge. | Dashboard (near streak) or Progress. |
| **Has not set location after 2nd visit** | “Set your location for accurate prayer and fasting times?” (soft, not blocking). | Open Settings → Location or in-app location step. | Dashboard banner (already exists); can be made adaptive (show after N visits). |

### 2.2 How to implement adaptive checks

- **State:** Store a small “journey” object: e.g. `{ journalPromptDismissed: boolean, reminderPromptAfter3Days: boolean, mealsReminderOffered: boolean, … }` in localStorage or preferences.
- **Rules:** If trigger is true (e.g. `journalEntries.length >= 1`) and the corresponding “offered” flag is false, show the prompt once. On “Yes,” run the action and set the flag; on “No” or “Later,” set “offered” so we don’t ask again (or ask again only after a long delay, e.g. 30 days).
- **Placement:** Prefer **inline card** on the relevant page (Journal, Dashboard, Progress) over a modal so it feels like a suggestion, not an interrupt. Modal only if the action is critical (e.g. notification permission).

### 2.3 Copy tone for adaptive prompts

- **Short:** One sentence question + “Yes” / “Not now” (or “Maybe later”).
- **Benefit-focused:** “So you don’t miss a meal,” “A nudge after iftar can help,” “To keep your streak going.”
- **No guilt:** Avoid “You haven’t set …” or “Don’t forget …”; use “Would you like …?” or “Want …?”

---

## 3. Balance: what defaults to auto, what to ask explicitly

### 3.1 Default to auto (no question, or pre-filled)

| Item | Behavior | Rationale |
|------|----------|-----------|
| **Location** | **Auto-detect** (geolocation or IP) on Location step; pre-fill so user can “Continue” without typing. | One tap to confirm; skip available. |
| **Timezone** | **From location** (coords → IANA timezone). | No separate “what’s your timezone?” |
| **Country/region** | **From location** or IP (for hydration units, locale). | Used for defaults only. |
| **Theme** | **System** or **dark** as app default; no question in onboarding. | User can change in Settings. |
| **Fasting program** | **Full Ramadan (dawn to sunset)** pre-selected. | Single program today; voluntary optional. |
| **Priorities (learning, culture, Quran, macros, simplify)** | **Defaults by mode:** Non-Muslim → moderate / some / some; Muslim → deep / lots / daily (current). **Apply without asking** if we add a “Quick start” path; otherwise one “Your priorities” step with defaults pre-selected and “Continue” only. | Reduces choices; “Customize” later in Settings. |
| **Quick access order** | **From priorities** (or default order). | No “drag to reorder” in onboarding. |
| **Hydration goal** | **By country** (e.g. US → ml or cups). | No question unless they open Settings. |
| **Suhoor/iftar reminder times** | **From prayer times** when location is set; else sensible defaults (e.g. 04:30 / 18:30). | User can edit in Settings. |

### 3.2 Ask explicitly (minimal set)

| Item | When | Why |
|------|------|-----|
| **Mode** | First step after Welcome (or from landing “I’m Muslim” / “Start your journey”). | Drives labels, path length, and tone; user must self-identify. |
| **Location** | Location step: confirm auto result or search/skip. | Core for times; user may want to override or skip. |
| **Schedule** | Schedule step: Full Ramadan ± voluntary. | What they’re committing to; one screen. |
| **Notifications** | Notifications step: “Enable suhoor & iftar reminders?” (one permission ask). | We shouldn’t enable without consent. |
| **Goals** | Goals step: optional; “Skip — go to dashboard” prominent. | Optional motivation; no default “goal” required. |

### 3.3 Optional in onboarding (can be skipped or collapsed)

| Item | Suggestion |
|------|------------|
| **Knowledge quiz** | Non-Muslim only; keep for learning. Allow “Skip quiz” with a default “moderate” content level so they’re not forced. |
| **Health** | Keep; short. “None of these” is one tap. |
| **Priorities** | **Option A:** Separate step with defaults; “Continue” = use defaults. **Option B:** Remove from onboarding; set defaults from mode; “Customize dashboard” in Settings. Prefer **Option A** with strong defaults so “Continue” is the main action. |
| **Tone** | Optional one question: “Supportive (more explanations)” vs “Minimal.” Default from mode; skip = use default. |

### 3.4 Never in onboarding

- Gender, weight, age (Settings → Advanced if macros on).
- Prayer-time notification toggles (Settings).
- Macro tracking on/off (can default off; Priorities can offer one toggle if we keep it).
- Theme, language (Settings).
- Voluntary fasting details (can be “Add voluntary fasts later” link from Schedule step).

---

## 4. Suggested onboarding flow (minimal + personalized)

### 4.1 Shortest path (3–4 steps to dashboard)

1. **Welcome** — One line: “We’ll set location and a couple of preferences so your times and dashboard fit you.”
2. **Mode** — Muslim / Non-Muslim. (Muslim → skip Knowledge.)
3. **Knowledge** — Non-Muslim only; 5 questions or “Skip and use default content.”
4. **Health** — Conditions or “None”; Continue.
5. **Location** — Auto-detect pre-fill; “Use my location” / “Search” / “Skip for now”; Continue.
6. **Schedule** — “Full Ramadan” pre-selected; voluntary optional; Continue.
7. **Notifications** — “Enable suhoor & iftar reminders?” Yes / No; Continue.
8. **Priorities** — Pre-selected from mode; “Continue” (or “Customize” expands). Optional: one line “How should the app sound?” → Supportive / Minimal (default from mode).
9. **Goals** — Optional; “Go to dashboard” prominent.

Steps 1–7 are the **minimum** for “personalized early” (mode + location + schedule + reminders). Steps 8–9 are **optional or fast** (defaults + skip).

### 4.2 What “personalized early” gives them on first dashboard load

- **Times** for their location (if set): “Suhoor ends 05:24,” “Iftar 18:42.”
- **Labels** for their mode: Iftar vs “Breaking Fast (Iftar),” etc.
- **Quick access** order from priorities (or default).
- **One-line copy** that reflects mode (e.g. “Your fasting journey” / “Ramadan Mubarak” when applicable).

No extra questions; the rest (theme, language, macros, prayer reminders, reflection reminders) can be **adaptive** or in **Settings**.

---

## 5. Summary table

| Dimension | Recommendation |
|-----------|----------------|
| **Minimal early inputs** | **Location** (auto then confirm/skip), **Mode** (Muslim / Non-Muslim), **Schedule** (Full Ramadan ± voluntary). **Tone** optional (Supportive vs Minimal) or derived from mode. |
| **Adaptive journey checks** | After **first journal save** → “Reflection reminder?”; after **3 logged days** → “Suhoor/iftar reminders?”; after **opening Journal 2+** without reminder → repeat reflection offer; **Meals** first open → “Remind to log meals?”; **7-day streak** → “Daily check-in reminder?”. One prompt at a time; dismissible; store “offered” to avoid repeat. |
| **Auto / defaults** | Location (auto-detect), timezone from location, theme/system, program (Full Ramadan), priorities from mode, quick access from priorities, hydration from country, reminder times from prayer times when possible. |
| **Ask explicitly** | Mode, location (confirm/skip), schedule (Full ± voluntary), notifications (one permission), goals (optional). |
| **Optional / later** | Knowledge quiz skip; Priorities “Continue” with defaults; tone question; voluntary fasting detail; all else in Settings or adaptive. |

This keeps **personalization** (location, method, tone) with **minimal** upfront questions and moves **refinement** (reminders, macros, theme) to **adaptive prompts** and **Settings**.
