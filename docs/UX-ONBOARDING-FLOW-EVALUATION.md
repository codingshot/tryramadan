# UX: Onboarding Flow Evaluation

Evaluation of the full onboarding flow (`/onboarding/*`): welcome → mode → knowledge → health → location → schedule → notifications → priorities → goals. For each step: what decision is asked, whether it's critical now or deferrable; cognitive-load highlights; minimal safe paths for Non-Muslim and Muslim users; copy/layout tweaks.

**Related:** [UX-FIRST-TIME-EXPERIENCE-REVIEW.md](./UX-FIRST-TIME-EXPERIENCE-REVIEW.md).

---

## 1. Per-step: Decision and criticality

| Step | Decision asked | Critical now? | Rationale |
|------|----------------|---------------|-----------|
| **Welcome** | "Get Started" (proceed) | No | Informational; could merge with Mode. |
| **Mode** | Non-Muslim vs Muslim | **Yes** | Drives path (skip Knowledge for Muslim), labels (Iftar/Suhoor), spiritual content. |
| **Knowledge** | 5 quiz questions (non-Muslim only) | **Deferrable** | Introduces Suhoor, iftar, Ramadan length — valuable for learning but not required to log. Could move to post-onboarding "Learn" or first-open tooltip. |
| **Health** | Select conditions or None | **Yes** | Safety; we show health guidance. Minimal friction; single choice. |
| **Location** | Set city or skip | **Yes** | Prayer/fasting times depend on it. Skip allowed; times become estimates. |
| **Schedule** | Full Ramadan ± voluntary | **Deferrable** | Full Ramadan is only option; voluntary is optional. Could default to Full Ramadan and defer voluntary to Settings. |
| **Notifications** | Enable reminders or Continue | **Deferrable** | Nice-to-have; user can enable later in Settings. |
| **Priorities** | Learning, culture, Quran, macros, simplify | **Deferrable** | Dashboard shape; sensible defaults work. High cognitive load — 5 dimensions. |
| **Goals** | Select goals + optional intention | **Deferrable** | Motivation; optional. Muslim has "Skip — go to dashboard." |

---

## 2. Cognitive load highlights

### 2.1 Where load is high

| Step | Load source | Issue |
|------|-------------|-------|
| **Priorities** | 5 dimensions at once: Learning (3 options), Culture (3), Quran (3), Macros (2), Simplify (2) | Medical + spiritual + technical mixed. "How much do you want to learn?" vs "Macro tracking" vs "Use location to simplify" — different domains. User must understand each. |
| **Knowledge** | 5 questions; Muslim can skip | Quiz feels like a test; "Five Pillars" question is religious; mixes factual (Suhoor = pre-dawn) with doctrinal. |
| **Schedule** | Main program + voluntary (2 options with long descriptions) | "Ayyam al-Beed" and "Monday & Thursday" require explanation. Non-Muslim may not care; adds complexity. |
| **Goals** | 6 options + free-text intention | Multi-select + text; "Set your personal focus" — vague. |
| **Health** | 6 options (medical conditions) | Sensitive; user may hesitate. "None of these" is clear; others imply disclosure. |
| **Location** | Auto-detect + search + skip | Technical (IP, geolocation); can fail; "Skip for now" competes with "Select to continue." |

### 2.2 Mixed domains (medical + spiritual + technical)

| Domain | Steps | Risk |
|--------|-------|------|
| **Medical** | Health | Sensitive; user may not want to disclose. |
| **Spiritual** | Mode, Knowledge (Five Pillars), Schedule (voluntary), Priorities (Quran), Goals | Can feel heavy for non-Muslim or secular users. |
| **Technical** | Location (IP, geolocation), Notifications (browser permission) | Can fail; user may not understand "from IP." |
| **Preference** | Priorities (Learning, Culture, Quran, Macros, Simplify) | Abstract; "simplify by location" is vague. |

---

## 3. Minimal safe paths

### 3.1 Non-Muslim curious user

**Goal:** Get to dashboard with enough context to log a fast safely. Minimize steps; defer learning and personalization.

| Step | Action | Rationale |
|------|--------|-----------|
| Welcome | Tap "Get Started" | Keep. |
| Mode | Select "Non-Muslim Mode" | Critical. |
| Knowledge | **Option A:** Keep (teaches Suhoor/iftar). **Option B:** Add "Skip — I'll learn as I go" | B reduces friction; A ensures baseline understanding. |
| Health | Select "None of these" or condition | Critical for safety. |
| Location | Auto-detect → Continue, or search, or **Skip** | Critical for times; skip allowed. Make "Continue" work when detected; "Skip" visible but secondary. |
| Schedule | **Default:** Full Ramadan selected. Tap "Continue" | No voluntary; one tap. |
| Notifications | Tap "Continue" (skip enable) | Defer; can enable in Settings. |
| Priorities | **Defaults only.** Single "Continue" — no changes required | Defer; Moderate/Some/Some default. |
| Goals | Tap "Go to dashboard" (skip) | Defer; add prominent "Skip — go to dashboard" for non-Muslim too. |

**Minimal path length:** 9 taps (one per step) if user accepts defaults and skips where possible.

### 3.2 Practicing Muslim (full observance)

**Goal:** Prayer times, suhoor/iftar reminders, Quran/glossary, voluntary fasting. Willing to invest more.

| Step | Action | Rationale |
|------|--------|-----------|
| Welcome | Tap "Get Started" | Keep. |
| Mode | Select "Muslim Mode" | Critical; skips Knowledge. |
| Health | Select "None of these" or condition | Critical. |
| Location | **Critical.** Auto-detect or search; avoid skip | Prayer times need location. |
| Schedule | Full Ramadan + optional voluntary | Voluntary is valuable; keep but collapse "Add voluntary" — expanded by default is fine. |
| Notifications | **Enable reminders** | Valuable for suhoor/iftar. |
| Priorities | **Defaults:** Deep, Lots, Daily (already set for Muslim) | Single "Continue"; optional tweak. |
| Goals | Select goals or "Skip — go to dashboard" | Optional; Muslim already has skip. |

**Minimal path length:** ~7 steps (Mode skips Knowledge). Muslim path is already shorter.

---

## 4. Copy and layout tweaks per step

### 4.1 Welcome

| Current | Tweak | Rationale |
|---------|-------|-----------|
| List: mode, knowledge, health, location, schedule, reminders, priorities, goals | Shorten: "Mode · Health · Location · Reminders · Goals" | Less to read; "a few quick steps" already sets expectation. |
| "We'll personalize your journey with a few quick steps" | "About 3 minutes. You can change anything later in Settings." | Sets time expectation; reduces commitment fear. |

### 4.2 Mode

| Current | Tweak | Rationale |
|---------|-------|-----------|
| "Choose your mode" | Keep | Clear. |
| "أخبرنا عن نفسك" | Keep (adds warmth) | Optional. |
| Non-Muslim: "Learning focus: explore fasting, culture, and wellness at your own pace." | "We'll explain terms like Suhoor and Iftar as you go." | Clarifies what they get. |
| Muslim: "Full religious observance support..." | "Prayer times, Ramadan tracking, and spiritual content." | Slightly shorter. |

### 4.3 Knowledge (non-Muslim only)

| Current | Tweak | Rationale |
|---------|-------|-----------|
| "Quick knowledge check" | "Quick intro — no pressure" | Reduces test anxiety. |
| "We'll tailor content to your level. No pressure." | Keep | Good. |
| Add after last question (before Continue) | One line: "During the fast you don't eat or drink from dawn until sunset. The app will show you when." | Explains core rule once. |
| Add "Skip" for non-Muslim? | Optional: "Skip — I'll learn as I go" (goes to Health) | Reduces friction; some want to dive in. |

### 4.4 Health

| Current | Tweak | Rationale |
|---------|-------|-----------|
| "Health screening" | "Quick health check" | "Screening" can sound clinical. |
| "So we can show relevant safety information. Always consult a doctor before fasting." | Keep | Important. |
| "None of these" | Make visually primary (e.g. first, slightly larger) | Most users will pick this. |
| Warning when condition selected | Keep | Critical. |

### 4.5 Location

| Current | Tweak | Rationale |
|---------|-------|-----------|
| "We use your location for prayer and fasting times. It's set from your IP automatically; type a city below to change it. Stored only on this device." | Shorten: "We need your city for accurate prayer and fasting times. Stored only on this device." | Clearer; "IP" is technical. |
| "Detecting location from IP..." | "Detecting your location..." | Simpler. |
| "Skip for now (set location later in Settings)" | Keep; ensure it's visible | Some users need to skip (privacy, travel). |
| When location detected | Pre-select; "Looks good" or "Continue" — one tap | Reduce friction. |

### 4.6 Schedule

| Current | Tweak | Rationale |
|---------|-------|-----------|
| "Choose your Ramadan schedule. You can also add voluntary Sunnah fasting." | "Full Ramadan = dawn to sunset. Optional: add voluntary fasts (Mon/Thu, etc.)." | One-line clarity. |
| Voluntary section | Collapse by default: "Add voluntary fasting (optional)" — tap to expand | Reduces initial load. |
| Add one line | "Each day you'll log: start fast (after suhoor), break fast (at iftar), or mark complete." | From UX-FIRST-TIME doc. |

### 4.7 Notifications

| Current | Tweak | Rationale |
|---------|-------|-----------|
| "Get suhoor and breaking fast reminders so you never miss a meal." | Non-Muslim: "Get pre-dawn and sunset reminders." Muslim: Keep. | "Never miss a meal" can sound pushy; "sunset" is clear. |
| "Enable reminders" vs "Continue" | Make "Continue" equally prominent (secondary button) | User shouldn't feel forced to enable. |
| When permission denied | Add: "You can enable later in Settings." | Reduces dead-end feeling. |

### 4.8 Priorities

| Current | Tweak | Rationale |
|---------|-------|-----------|
| 5 sections at once | **Option A:** Collapse 2–3 sections. **Option B:** Single "Dashboard style" — "Simple" / "Balanced" / "Full" presets | Reduces cognitive load. |
| "Use my location to simplify" | "Simplify by location" — tooltip: "Fewer options when we know your region." | Clearer. |
| "Macro tracking (calories, protein, carbs)" | "Track calories and macros?" | Shorter. |
| Add above Continue | "Defaults work for most people. Change anytime in Settings." | Reassurance. |
| Muslim defaults | Already Deep/Lots/Daily; keep | Good. |

### 4.9 Goals

| Current | Tweak | Rationale |
|---------|-------|-----------|
| "Set your personal focus for this fasting journey. Optional but helps us tailor content." | "Pick what matters to you — or skip." | Shorter. |
| Add "Skip" for non-Muslim | "Skip — go to dashboard" (same as Muslim) | Parity; reduces friction. |
| "Go to dashboard" button | Make primary; goals optional | Clear CTA. |
| "You're all set..." | Keep | Good closure. |

---

## 5. Summary: Minimal safe paths

### Non-Muslim curious (minimal)

```
Welcome → Mode (Non-Muslim) → Knowledge (or Skip) → Health (None) → Location (auto/skip) → Schedule (Continue) → Notifications (Continue) → Priorities (Continue) → Goals (Skip)
```

**Target:** 6–7 essential decisions; Priorities and Goals = "Continue" / "Skip."

### Muslim (full observance)

```
Welcome → Mode (Muslim) → Health (None) → Location (set) → Schedule (Full + optional voluntary) → Notifications (Enable) → Priorities (Continue) → Goals (Skip)
```

**Target:** 5–6 essential decisions; Knowledge skipped; Location and Notifications are high value.

### High cognitive load steps

- **Priorities:** 5 dimensions; consider presets ("Simple" / "Balanced" / "Full") or collapse.
- **Knowledge:** 5 questions; add Skip for non-Muslim.
- **Schedule:** Voluntary block; collapse by default.
- **Goals:** Add Skip for non-Muslim; make optional clear.

### Critical vs deferrable

| Critical now | Deferrable |
|--------------|------------|
| Mode | Knowledge (add Skip) |
| Health | Schedule voluntary |
| Location (but allow Skip) | Notifications |
| | Priorities (defaults) |
| | Goals |
