# Copy audit: UX writer & cultural review

Audit of user-facing copy for the Ramadan fasting dashboard (Muslim and non‑Muslim users). Table: **Current text** → **Muslim-friendly** (if changed) → **Non‑Muslim-friendly** (if different) → **Notes**.

---

## 1. Islamic terms: correctness & respect

| Location | Current text | Muslim-friendly | Non‑Muslim-friendly | Notes |
|----------|--------------|------------------|----------------------|------|
| **Iftar (app-wide)** | "Iftar" (Muslim) / "Breaking Fast (Iftar)" (non‑Muslim) | Keep **Iftar** as-is. | Keep **Breaking Fast (Iftar)**. Already correct. | `getIftarLabel` / `useIftarLabel` already differentiate. |
| **Suhoor (Dashboard, Today, Meals)** | "Suhoor", "Suhoor end", "Next: Suhoor —" | Keep **Suhoor**. Add tooltip (already in EATING_TIME_TOOLTIPS). | **Suhoor (pre-dawn meal)** or tooltip: "Last meal before dawn; after this time fasting starts." | Non‑Muslims: Suhoor is unexplained in many places; Iftar gets explicit "Breaking Fast (Iftar)". Use a `useSuhoorLabel(short)` helper for non‑Muslim mode, or dual label in key spots. |
| **Suhoor / Iftar (Meals tabs)** | "Suhoor" + "Morning"; "Iftar" + "Evening" | Keep as-is. | **Suhoor (pre-dawn meal)** + "Morning"; keep **Iftar** or "Breaking fast (Iftar)" + "Evening". | Intro already says "Suhoor (pre-dawn) and Iftar (evening break-fast)"; tabs can mirror that in non‑Muslim mode. |
| **Break fast (action)** | "Break fast", "I broke my fast" | Correct. No change. | Same. "Break fast" is clear; dialog "Why did you break your fast?" is fine. | Optional tooltip: "End your fast at Maghrib (or earlier if needed)." |
| **Mark complete** | "Mark complete", "I fasted today — mark complete" | Correct. | Same. | Tooltip already explains dawn-to-sunset. |
| **Voluntary vs obligatory** | "Full Ramadan", "voluntary Sunnah fasting", "obligatory when necessary" (Health) | **Full Ramadan** = obligatory; **Sunnah** = voluntary. Current wording is correct. | Add brief tooltip/link: "Ramadan fasts are obligatory for Muslims; Sunnah fasts are voluntary and extra." | Distinction is important: don’t call Sunnah "obligatory". Health copy "obligatory when necessary" refers to breaking fast for health, not to fasting—keep. |
| **Qada / make-up fasts** | (Not in app) | If added: **Make-up fast (qadāʾ)** or **Qada fast** with tooltip: "Fasting to make up for a missed obligatory day (e.g. illness, travel)." | **Make-up fast** with tooltip: "A fast done later to make up for a day you couldn’t fast (e.g. illness)." | No current copy; when feature exists, use respectful term and short explanation. |
| **Travel (break reason)** | "Travel (musafir)" | Keep **Travel (musafir)** or **Travel (musāfir)**. | **Travel** with optional tooltip: "Travelers may be exempt from fasting; make up days later." | "Musafir" is correct; non‑Muslims may not know it—label can stay, tooltip explains. |
| **Menstruation (break reason)** | "Menstruation" | Correct. | Same. | Sensitive and correct; no change. |

---

## 2. Onboarding

| Location | Current text | Muslim-friendly | Non‑Muslim-friendly | Notes |
|----------|--------------|------------------|----------------------|------|
| **Welcome** | "Fast like a Muslim for the holy month of Ramadan." | Keep. | Same or "Experience Ramadan fasting: dawn to sunset, like Muslims worldwide." | "Holy month" is respectful; "Fast like a Muslim" is clear for both. |
| **Welcome** | "Choose your mode (learning or full observance)" | Keep. | Same. | Clear. |
| **Mode** | "Non-Muslim Mode" / "Learning focus: explore fasting, culture, and wellness" | Keep. | Same. | Respectful. |
| **Mode** | "Muslim Mode" / "Full religious observance support: prayer times, Ramadan tracking, and spiritual content." | Keep. | N/A (not shown to non‑Muslim). | Correct. |
| **Schedule** | "Full Ramadan" / "Dawn to sunset (Fajr to Maghrib)" | Keep. | Same; Fajr/Maghrib can stay (tooltips exist). | Correct. |
| **Schedule** | "Add voluntary Sunnah fasting (optional)" | Keep. | Add tooltip: "Extra voluntary fasts (e.g. Monday & Thursday) that many Muslims do in addition to Ramadan." | Clarifies voluntary vs Ramadan. |
| **Schedule** | "Monday & Thursday Fasting" / "The Prophet (ﷺ) fasted…" | Keep. | Same; "Prophet" is standard. | (ﷺ) or "peace be upon him" both acceptable. |
| **Schedule** | "Ayyam al-Beed" / "The 'white days' (full moon)." | Keep. | Keep; tooltip in GENERAL_TOOLTIPS explains. | Good. |
| **Notifications** | "Get suhoor and {iftarLabelShort} reminders" | Keep. | For non‑Muslim: "Get pre-dawn (suhoor) and breaking fast reminders" or "suhoor (pre-dawn) and breaking fast." | Explain "suhoor" once in onboarding. |
| **Goals** | "Complete Ramadan with devotion", "Recite Quran daily", "Give charity (Sadaqah)" | Keep. | N/A (Muslim goals). | Correct. |
| **Goals** | "Learn about Ramadan culture", "Support Muslim friends and family" | N/A. | Keep. | Good for non‑Muslim. |
| **Goals (last step)** | (No "what happens next" line) | Add: "You're all set. When Ramadan begins, you'll see your dashboard with a countdown, daily tasks, and fasting timer." | Same. | Reduces uncertainty after onboarding. |

---

## 3. Dashboard & Today

| Location | Current text | Muslim-friendly | Non‑Muslim-friendly | Notes |
|----------|--------------|------------------|----------------------|------|
| **Countdown** | "until {iftarLabel}" | Keep. | "until Breaking fast (Iftar)" — already from useIftarLabel. | Done. |
| **Countdown** | "Next: Suhoor —" | Keep. | **Next: Suhoor (pre-dawn meal)** or tooltip on "Suhoor". | Reduces jargon. |
| **Strip label** | "Suhoor end (Fajr)" | Keep. | Same; tooltip explains. | Optional: "Pre-dawn cutoff (Suhoor end)" for non‑Muslim. |
| **Strip label** | "{iftarLabel} (Maghrib)" | Keep. | "Breaking Fast (Iftar) (Maghrib)" — already. | Done. |
| **Button** | "I'm fasting" | Keep. | Same. | Tooltip should explain "suhoor" for non‑Muslim (see below). |
| **Tooltip (I'm fasting)** | "I'm fasting (after suhoor)" / "Tap when you've finished suhoor and started your fast." | Keep. | Use: "Tap after your pre-dawn meal (suhoor) when the fast has started." Or: "Suhoor = last meal before dawn; tap after you've finished it." | So non‑Muslims don’t see "suhoor" with no context. |
| **Button** | "Break fast" | Keep. | Same. | Clear. |
| **Dialog** | "Break fast?" / "Log that you broke your fast early. Choose a reason." | Keep. | Same. | Clear. |
| **Dialog** | "Why did you break your fast?" | Keep. | Same. | |
| **Reassurance** | "Choose a reason so you can track it. No judgment — your intention matters." | Keep. | Same. | Good tone. |
| **Today card** | "I fasted today — mark complete" / "I broke my fast" | Keep. | Same. | Clear. |
| **Today card** | "Log whether you completed the full fast (dawn to sunset)…" | Keep. | Same. | Dawn/sunset is clear. |

---

## 4. Break-fast reasons (BROKEN_FAST_REASONS)

| Current label | Muslim-friendly | Non‑Muslim-friendly | Notes |
|---------------|------------------|----------------------|------|
| Ate or drank by mistake | Keep. | Same. | Correct. |
| Illness / not well | Keep. | Same. | Correct. |
| Travel (musafir) | Keep. | **Travel** or "Travel (exempt—make up later)" tooltip. | "Musafir" correct; optional tooltip for non‑Muslim. |
| Menstruation | Keep. | Same. | Sensitive; keep. |
| Medical need / doctor's advice | Keep. | Same. | Clear. |
| Other | Keep. | Same. | Fine. |

---

## 5. Daily missions & tooltips

| Location | Current text | Muslim-friendly | Non‑Muslim-friendly | Notes |
|----------|--------------|------------------|----------------------|------|
| **Mission** | "Log Suhoor (meal plan or food log)" | Keep. | **Log pre-dawn meal (Suhoor)** or "Log Suhoor (pre-dawn meal)". | Align with dual-label approach. |
| **Mission** | "Log {iftarLabelShort} (meal plan or food log)" | Keep. | Already uses iftarLabelShort ("breaking fast"). | Done. |
| **Mission tooltip** | "Tap \"I'm fasting\" on the dashboard after suhoor to mark…" | Keep. | "…after your pre-dawn meal (suhoor)…" | One-line explanation. |
| **Mission tooltip** | "add a meal plan note or food log entry for your pre-dawn meal (suhoor)" | Keep. | Same. | Already explains. |
| **Mission tooltip** | "for your break-fast meal (iftar)" | Keep. | Same. | Clear. |

---

## 6. Journal

| Location | Current text | Muslim-friendly | Non‑Muslim-friendly | Notes |
|----------|--------------|------------------|----------------------|------|
| **Prompt** | "How did you feel at suhoor vs iftar?" | Keep. | **"How did you feel at your pre-dawn meal vs when you broke your fast?"** or keep with small tooltip on first "suhoor"/"iftar". | Mode-aware prompt or glossary avoids jargon. |
| **Other prompts** | "What did you learn…", "One thing you're grateful for…", etc. | Keep. | Same. | No term changes needed. |

---

## 7. Meals page

| Location | Current text | Muslim-friendly | Non‑Muslim-friendly | Notes |
|----------|--------------|------------------|----------------------|------|
| **Intro** | "Suhoor (pre-dawn) and Iftar (evening break-fast) recipes from around the world." | Keep. | Same. | Already explains both. |
| **Tab** | "Suhoor" / "Morning" | Keep. | **Suhoor (pre-dawn meal)** or "Pre-dawn (Suhoor)" + "Morning". | Mirrors Iftar treatment. |
| **Tab** | "Iftar" / "Evening" | Keep. | **Iftar** or "Breaking fast (Iftar)" + "Evening". | Optional: use useIftarLabel for tab if desired. |
| **aria-label** | "Suhoor — morning meal" | Keep. | **"Suhoor — pre-dawn meal"** or "Pre-dawn meal (Suhoor)". | Improves accessibility and clarity. |

---

## 8. Settings & voluntary fasting

| Location | Current text | Muslim-friendly | Non‑Muslim-friendly | Notes |
|----------|--------------|------------------|----------------------|------|
| **Section** | "Add optional Sunnah fasts (can be combined with Ramadan)." | Keep. | Add tooltip: "Sunnah = voluntary fasts recommended by the Prophet (e.g. Monday & Thursday)." | Clarifies optional. |
| **Link** | "Learn more about voluntary fasting →" | Keep. | Same. | Good. |
| **Option** | "Ayyam al-Beed (13–15 of each month)" | Keep. | Same; tooltip in app explains "white days". | Good. |

---

## 9. Empty states & misc

| Location | Current text | Muslim-friendly | Non‑Muslim-friendly | Notes |
|----------|--------------|------------------|----------------------|------|
| **Stats dialog** | "No days yet." | Keep. | Same. | Clear. |
| **Journal** | "No entries yet. Pick a date above and write." | Keep. | Same. | Clear. |
| **Goals** | "No goals yet. Add one above to get started." | Keep. | Same. | Clear. |
| **Dashboard meta** | "Track suhoor and {iftarLabelShort}, log fasting days…" | Keep. | useIftarLabelShort already gives "breaking fast". | Ensure "suhoor" has context for non‑Muslim (e.g. "pre-dawn (suhoor) and breaking fast"). |

---

## 10. Health & FAQ (cultural accuracy)

| Location | Current text | Muslim-friendly | Non‑Muslim-friendly | Notes |
|----------|--------------|------------------|----------------------|------|
| **Health** | "Break fast immediately if feeling unwell" | Keep. | Same. | Correct and safe. |
| **Health** | "Breaking your fast for health reasons is not only permissible but obligatory when necessary." | Keep. | Same. | Theologically correct (obligatory to break when health at risk). |
| **Health** | "Break fast with dates and water (following the Sunnah)" | Keep. | Optional: "Traditionally, Muslims break fast with dates and water (Sunnah)." | Sunnah explained in tooltips. |
| **FAQ** | "make up missed days later or pay fidya (compensation)" | Keep. | Keep; optional tooltip for "fidya" for non‑Muslim. | Correct; fidya is standard term. |
| **FAQ** | "Sunnah fasts are voluntary fasts based on Prophet Muhammad's (PBUH) practice." | Keep. | Same. | Correct and respectful. |

---

## Summary of recommended changes

1. **Suhoor for non‑Muslims:** Add a `useSuhoorLabel(short)` (or reuse one string) so key UI can show **"Suhoor (pre-dawn meal)"** or **"Pre-dawn meal (Suhoor)"** where the term first appears (Dashboard countdown, Meals tabs, mission labels, "I'm fasting" tooltip). — **Done:** `useSuhoorLabel` / `useSuhoorLabelShort`; Meals/Dashboard/Schedule use them; Daily missions tooltip says "pre-dawn meal (suhoor)" for non‑Muslim.
2. **Journal prompt:** Make "How did you feel at suhoor vs iftar?" mode-aware for non‑Muslim: e.g. "How did you feel at your pre-dawn meal vs when you broke your fast?" — **Done:** PROMPTS_NON_MUSLIM in DashboardJournal.
3. **Onboarding Goals:** Add one line before the main CTA: "You're all set. When Ramadan begins, you'll see your dashboard with a countdown, daily tasks, and fasting timer." — **Done:** OnboardingGoals.tsx.
4. **Travel (musafir):** Keep label; add optional tooltip for non‑Muslim: "Travelers may be exempt; make up days later." — **Done:** BreakFastReasonDialog shows tooltip on Travel reason when `userType === "non-muslim"`.
5. **Voluntary vs obligatory:** Keep current wording; ensure Sunnah/voluntary is never called obligatory. Optional short tooltip in Settings: "Sunnah = voluntary fasts recommended by the Prophet." — **Done:** Settings voluntary Sunnah section has tooltip; Onboarding Schedule "Add voluntary Sunnah fasting" has mode-aware tooltip for non‑Muslim.
6. **Qada / make-up:** When the feature exists, use **Make-up fast (qadāʾ)** for Muslims and **Make-up fast** with one-line explanation for non‑Muslims.
7. **Dashboard meta / Meals tab / Onboarding / Health:** — **Done:** Dashboard PageSEO uses suhoorLabelShort; "I'm fasting" tooltip body is mode-aware; Meals Suhoor tab aria-label "pre-dawn meal" for non‑Muslim; Onboarding Notifications uses "pre-dawn meal (Suhoor)" and "breaking fast" for non‑Muslim; Health "dates and water" line is mode-aware for non‑Muslim.

Existing tooltips (EATING_TIME_TOOLTIPS, GENERAL_TOOLTIPS) are accurate and respectful; use them where Suhoor, Iftar, Sunnah, and Ramadan appear without context.
