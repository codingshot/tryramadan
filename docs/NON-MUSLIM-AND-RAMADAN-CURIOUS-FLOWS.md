# Non-Muslim and Ramadan-curious user flows

Design document for **non-Muslim** and **"Ramadan curious"** users: flows for (1) **shadow fasting a few days a week** and (2) **journal + loose meal tracking with minimal religious framing**, plus **where the app feels too religious or confusing**, **terminology and mode toggles** (e.g. simple vs full Islamic), and **edge cases when switching mode mid-Ramadan**.

**Related docs:** `USER-FLOWS-AND-TEST-PROMPTS.md`, `ONBOARDING-REONBOARDING-FLOWS.md`, `EDGE-CASE-TEST-SCENARIOS.md`, `FALL-OFF-AND-RETURN-FLOWS.md`.

---

## Terminology and mode context

- **Stored mode:** `userType: 'new' | 'muslim' | null` in preferences. UI labels: "Non-Muslim" (value `new`) and "Muslim" (value `muslim`). Some legacy checks use string `"non-muslim"`; ensure consistency so Non-Muslim mode is detected everywhere (prefer `userType !== 'muslim'` or explicit `userType === 'new'`).
- **Label behavior:** When `userType === 'muslim'`: "Iftar", "Suhoor". When non-Muslim: "Breaking Fast (Iftar)", "Suhoor (pre-dawn meal)". Journal prompts, break-fast tooltips, and some copy already branch on mode.
- **"Simple mode" vs "full Islamic mode":** The app does not expose a separate "simple mode" toggle. Effectively, **Non-Muslim mode** acts as a simpler framing (explained terms, no adhan, optional Knowledge quiz). **Priorities** (Learning: Minimal / Moderate / Deep; Quran: None / Some / Daily) further reduce religious content. A future **explicit "Simple mode"** could: hide or collapse Quran, Prayers, Hadith, and voluntary Sunnah; show only Today, Schedule, Meals, Journal, Progress; and use only explained terms (no Arabic unless in tooltips). This doc identifies where toggles or explanations are needed.

---

## 1. Flow: Non-Muslim who wants to "shadow fast" a few days a week

### Scenario

User is not Muslim but wants to **try Ramadan-style fasting** on a **subset of days** (e.g. 2–3 days a week) rather than every day. They may not care about prayer times or religious wording; they care about eating windows and feeling part of the experience.

### What they do today (current app)

| Step | Current behavior | Friction / confusion |
|------|------------------|----------------------|
| Onboarding → Mode | Choose "Non-Muslim" → Knowledge quiz → … → Schedule | **Schedule only offers "Full Ramadan"** (dawn to sunset every day). Voluntary options are "Monday & Thursday" and "Ayyam al-Beed" — both religiously framed ("The Prophet (ﷺ) fasted…", "white days"). No "I want to fast 2–3 days a week" path. | Shadow faster has to pick Full Ramadan and then **ignore** most days, or pick voluntary and see Islamic wording. |
| Dashboard | "Day N of Ramadan"; countdown to Suhoor end / Iftar; "I'm fasting" / "I didn't fast today." | **Day N** implies every day matters. No "you're fasting today" vs "you're not fasting today" as a **planned** choice (it's either log or don't). Stats show "Completed: X" out of 30 — can feel like failure if they only want to do 8–10 days. |
| Schedule | Full calendar; mark any day complete. | They can **manually** mark only some days complete and leave others blank. That works but is not **set up** as "I'm shadow fasting Mon/Wed/Fri." |
| Prayers / Quran / Learn | Still in nav and quick actions (order by priorities). Quran "None" / Learning "Minimal" reduces prominence. | Prayer **times** are still the basis for "Suhoor end" and "Iftar" — useful. But labels like "Fajr," "Maghrib," "Taraweeh" can feel religious if they chose Minimal. |

### Where it feels too religious or confusing

| Area | Issue | Recommendation |
|------|--------|------------------|
| **Onboarding Schedule** | Only "Full Ramadan" + voluntary (Mon/Thu, Ayyam al-Beed). No "Shadow fast: pick your days" or "A few days a week." Voluntary options use Prophet (ﷺ), "deeds presented to Allah," "white days." | Add a **schedule option** for non-Muslim: e.g. "A few days a week (shadow fast)" — user picks days or "2–3 days" and sees neutral copy ("Match the eating window on days you choose"). Keep Full Ramadan for those who want it. Optionally soften voluntary copy for non-Muslim: "Many people also fast Mondays and Thursdays" without religious authority. |
| **"Day N of 30"** | Implies obligation to all 30 days. | For non-Muslim (or when "shadow" schedule): reframe as "Day N of Ramadan" with subline "You've logged X days so far" (no "out of 30" pressure) or "Log the days you fast; skip the rest." |
| **I didn't fast today** | Clear. But no **planned** "I'm not fasting this day" before the day — they only mark after. | Optional: let user **pre-mark** rest days ("I'm not fasting these days") so the app doesn't feel like "you missed today." |
| **Prayer strip** | Fajr, Dhuhr, Asr, Maghrib, Isha — Islamic names. | Keep for eating-window context; ensure **tooltips** for non-Muslim: "Dawn (Fajr)" / "Sunset (Maghrib) — when you can break your fast." Consider short labels in simple mode: "Dawn" / "Sunset" with "(Fajr/Maghrib)" in tooltip. |
| **Voluntary Sunnah** | "Sunnah" and "Ayyam al-Beed" need explanation. | Tooltip already exists for Sunnah (voluntary fasts). For shadow fasters, optional: hide voluntary block or show as "Extra fasting days (optional)" with neutral description. |

### Terminology and toggles for this flow

| Term | Non-Muslim / simple | Full Islamic (current Muslim) |
|------|----------------------|-------------------------------|
| Iftar | "Breaking Fast (Iftar)" ✅ | "Iftar" |
| Suhoor | "Suhoor (pre-dawn meal)" ✅ | "Suhoor" |
| Schedule | Add: "Shadow fast: a few days" vs "Full Ramadan" | Full Ramadan + voluntary Sunnah |
| Day N | "Day N — log the days you fast" (no "of 30" pressure) | "Day N of 30" |
| Prayer times | "Eating window times" or keep with tooltips | Prayer times + adhan option |

### Quick backfill / low friction

- **Mark only some days complete:** Already supported (Dashboard day picker, Schedule calendar). No change needed.
- **Mark "I didn't fast" for rest days:** Add "I didn't fast this day" for **past** days (see FALL-OFF-AND-RETURN-FLOWS.md) so they can backfill rest days without guilt.
- **Set "my fasting days" upfront:** Not implemented; would require a schedule type "few days a week" and optional day selector (e.g. Mon/Wed/Fri).

---

## 2. Flow: Non-Muslim who only wants to journal and loosely track meals (no religious framing)

### Scenario

User wants to **journal** (reflections, gratitude) and **track meals** (what they ate, when) **without** fasting rules, prayer times, or Islamic framing. They might be "Ramadan curious" for culture or solidarity but don't want "I'm fasting," "Mark complete," or religious terminology front and center.

### What they do today (current app)

| Step | Current behavior | Friction / confusion |
|------|------------------|----------------------|
| Onboarding | Must choose Mode → (Knowledge if non-Muslim) → Health → Location → **Schedule (Full Ramadan)** → Notifications → Priorities → Goals. | **No path that skips fasting.** Schedule forces a choice (Full Ramadan or voluntary). They may skip location and notifications but still see "Fasting schedule," "Suhoor/Iftar reminders." | Journal-only user has no "I just want to journal and log meals" path. |
| Dashboard | Centered on **today's fast**: "I'm fasting," "I didn't fast today," countdown, Day N of Ramadan. | Fasting is the **primary** CTA. Journal and Meals are in quick actions or nav. | They can use Journal and Meals but the home screen is fasting-first. |
| Journal | Calendar, prompt, content, mood, gratitude. Prompts differ by mode (e.g. "How did you feel in the morning vs when you broke your fast?" for non-Muslim). | **Prompts still reference fasting** ("broke your fast"). For zero-fasting user, a prompt like "What are you grateful for today?" or "One reflection from today" would fit better. | Optional: **Journal-only prompts** when user has never logged a fast or has "journal/meals only" preference. |
| Meals | Suhoor / Iftar tabs (or "pre-dawn meal" / "Breaking Fast"). Add items, calories. | **Suhoor/Iftar** assume a fasting window. For "just track meals" they might prefer "Morning" / "Evening" or "Meal 1" / "Meal 2" or time-based. | Consider **meal labels** toggle: "Suhoor / Iftar" vs "Morning / Evening" (or "Pre-dawn / Sunset meal") for minimal religious framing. |
| Progress | Completed / Broken / Skipped; streak; total hours fasted. | All fasting-centric. | For journal+meals-only: show **journal stats** (entries, streak of entries) and **meal summary** (days logged, optional calories). Optionally hide or collapse fasting stats when user has not completed any fast. |

### Where it feels too religious or confusing

| Area | Issue | Recommendation |
|------|--------|------------------|
| **Onboarding** | No "Journal + meals only" path. Schedule and reminders are fasting-focused. | Add **goal path** at Mode or Goals: "I want to: ( ) Fast Ramadan-style ( ) Journal and track meals only ( ) Both." If "Journal and meals only," skip or soften Schedule (e.g. "You can add fasting later"), reduce reminder copy to "Optional meal reminders." |
| **Dashboard** | Fasting first; "Day N of Ramadan" and countdown dominate. | When user has **never** logged a fast (or has "journal/meals only"): show **Journal** and **Meals** as primary; show "Try a fast" as secondary CTA. Or add **Dashboard layout** preference: "Fasting focus" vs "Journal & meals focus." |
| **Journal prompts** | Reference "broke your fast," "suhoor vs iftar." | For users with no fasting data (or meals-only preference): use **neutral prompts** only: gratitude, reflection, mood, "One thing from today." See COPY-AUDIT or prompts list. |
| **Meals** | Suhoor / Iftar (or pre-dawn / breaking fast). | **Terminology toggle:** "Simple" = "Morning meal" / "Evening meal" (with optional tooltip "Often called Suhoor and Iftar during Ramadan"). So they can track without any religious terms. |
| **Prayers / Quran / Learn** | Still visible in nav. | **Simple mode** or **Priorities:** Quran "None," Learning "Minimal" already de-emphasize. For journal+meals-only, consider hiding Prayers and Quran from default quick actions and showing "Learn about Ramadan" as optional. |
| **Progress** | All fasting. | Add **Journal** tab or section: "X entries this month," "Last entry: [date]." Meal summary: "X days with meals logged." |

### Terminology and toggles for this flow

| Term / feature | Minimal / journal+meals | Full (current) |
|----------------|--------------------------|----------------|
| Meals | "Morning meal" / "Evening meal" (optional: "Suhoor/Iftar") | Suhoor (pre-dawn) / Iftar (breaking fast) |
| Journal prompts | No fasting references; gratitude, reflection, mood | Fasting-aware ("suhoor vs iftar", "broke your fast") |
| Dashboard | Journal + Meals first; "Try fasting" secondary | Fasting first; countdown; Day N |
| Progress | Journal stats + meal summary; fasting optional | Completed/Broken/Skipped, streak, hours |
| Nav / quick actions | Today, Schedule, Meals, Journal, Progress (no Quran/Prayers in default) | Order by priorities (can include Quran, Prayers, Learn) |

### Edge cases

- **User later wants to fast:** They switch to "Fast Ramadan-style" or mark a day complete. App should then show fasting stats and countdown; no data loss. Mode switch handled in §3.
- **User has no location:** Journal and meals don't require location. Fasting times do. So journal+meals-only path can skip location or make it optional with "Set location when you want fasting times."

---

## 3. Edge cases: Switching mode mid-Ramadan (Non-Muslim ↔ Muslim)

### Scenario

User changes **Fasting path** in Settings from **Non-Muslim** to **Muslim** (or vice versa) during or after Ramadan. Same device; existing progress and journal.

### Expected behavior (UI and data)

| Aspect | Non-Muslim → Muslim | Muslim → Non-Muslim |
|--------|----------------------|----------------------|
| **Labels** | All labels switch immediately to Muslim: "Iftar," "Suhoor," no "(pre-dawn meal)" / "Breaking Fast." | All labels switch to explained: "Breaking Fast (Iftar)," "Suhoor (pre-dawn meal)." |
| **Journal prompts** | Future loads use **Muslim** prompts (suhoor vs iftar, etc.). **Existing entries** unchanged (already saved text). | Future loads use **Non-Muslim** prompts. Existing entries unchanged. |
| **Break-fast reasons** | Same list; no extra tooltip on Travel. | Travel shows tooltip "Travelers may be exempt…" (existing). |
| **Prayer / Adhan** | Adhan and prayer notifications **become available** (if location set). No automatic enable; user opts in. | Adhan **disabled** (existing: `userType !== 'muslim'`). Prayer strip still visible but with explained tooltips. |
| **Progress data** | **No change.** completedDays, skippedDays, fastingLog, journal, meals are **mode-independent.** Stats stay the same. | Same: no data migration or loss. |
| **Quick actions / priorities** | Priorities (Learning, Quran, etc.) are **not** auto-updated. User may have had Quran "None"; it stays until they change Priorities. Optional: prompt "You're now in Muslim mode. Want to add Quran and prayer times to your dashboard?" | Priorities unchanged. Optional: no prompt. |
| **Schedule** | Schedule (Full Ramadan, voluntary) is **not** re-shown. They already have a schedule. If we add "shadow fast" option, switching to Muslim could prompt "Switch to Full Ramadan schedule?" (future). | Same: no forced re-onboarding. |

### Conflicting data (none)

- **No conflict:** Progress and journal are just dates and text; they don't store "was this in Muslim or non-Muslim mode." So switching mode does **not** require merging or migrating data. Only **future** UI (labels, prompts, visibility) changes.

### Edge cases to test

| ID | Scenario | Expected |
|----|----------|----------|
| NM-SW-1 | User has 10 completed days, 5 journal entries. Switch Non-Muslim → Muslim. | Labels update; stats still 10 completed; journal entries still visible; prompts for **new** dates use Muslim prompts. |
| NM-SW-2 | User had Quran "None," Learning "Minimal." Switch to Muslim. | Dashboard quick actions still reflect old priorities (Quran may not appear) unless we add a one-time "Add Muslim features?" prompt. |
| NM-SW-3 | User switches Muslim → Non-Muslim. Adhan was on. | Adhan stops (AdhanScheduler checks `userType !== 'muslim'`). Prayer times still shown with explained labels. |
| NM-SW-4 | User in Non-Muslim mode, "shadow fast" (only some days logged). Then switches to Muslim. | No data change. They now see Muslim labels; their partial progress (e.g. 8 days completed) is still valid (make-up days are allowed). |

---

## 4. Summary: what to implement

| Item | Priority | Notes |
|------|----------|--------|
| **Consistent userType** | High | Use `userType === 'new'` or `userType !== 'muslim'` everywhere; fix any `"non-muslim"` string checks to match stored value. |
| **Shadow fast schedule** | Medium | Onboarding Schedule: add option for non-Muslim "A few days a week" or "Shadow fast" with neutral copy; optional day picker. |
| **Reframe "Day N" for non-Muslim** | Low | "You've logged X days" or "Log the days you fast" instead of "Day N of 30" pressure. |
| **"I didn't fast this day" for past days** | Medium | Already in FALL-OFF-AND-RETURN-FLOWS; supports shadow fasters and guilt-free return. |
| **Journal + meals only path** | Medium | Goal or Mode: "Journal and track meals only"; skip/soften Schedule; dashboard layout or primary CTAs = Journal + Meals. |
| **Neutral journal prompts** | Low | When user has no fasting data (or meals-only preference), use prompts with no "broke your fast" / suhoor-iftar. |
| **Meal labels toggle** | Low | "Morning / Evening" vs "Suhoor / Iftar" in Settings or priorities for minimal religious framing. |
| **Progress: journal + meal summary** | Low | When fasting is not primary, show journal entry count and meal-log summary. |
| **Mode switch (mid-Ramadan)** | Done | No data migration; labels and prompts update; adhan on/off by mode. Document and test NM-SW-1–4. |

---

## 5. Test prompts for QA

- **Shadow faster:** Onboard as Non-Muslim. Is there any way to express "a few days a week"? Do stats feel punishing if you mark only 5 days complete? Can you mark past days "I didn't fast" (when implemented)?
- **Journal + meals only:** Is there a path that doesn't emphasize fasting? Do journal prompts ever avoid "broke your fast" when user has never fasted? Can you use Meals with minimal religious wording?
- **Switch mode:** Set Non-Muslim, log 3 days complete, add 2 journal entries. Switch to Muslim in Settings. Do labels change? Are progress and journal intact? Switch back to Non-Muslim. Same check.
- **Terminology:** In Non-Muslim mode, do all Suhoor/Iftar instances show "(pre-dawn meal)" / "Breaking Fast (Iftar)" or equivalent? Are tooltips present where needed (Travel, Sunnah, prayer times)?

This doc defines flows, pain points, terminology/mode toggles, and mode-switch edge cases for non-Muslim and Ramadan-curious users.
