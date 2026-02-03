# UX Pressure Test: Ramadan Fasting Dashboard

Senior UX review: **failure/confusion situations** per main screen, with emphasis on **first-time users unfamiliar with Ramadan** and **experienced Muslims wanting more control/detail**. Each section ends with **low-effort UX changes** to address the failure modes.

**Implemented (this pass):** §1.1 “New? Start your journey below” under hero badge; §2.1 Onboarding location fallback “Or search for your city below” + “We couldn’t detect your location…” when auto-detect fails; §3.1 Suhoor labels (useSuhoorLabel) and “I’m fasting” tooltip; §3.2 “I didn’t fast today” (skipped state); §7.1 Journal mode-aware prompts; §7.2 Calendar hint “Click any day to write or edit…” (already present); §7.3 Toast “Entry saved” + empty-content toast; §8.1 Dashboard breakdown “Completed: X · Broken: Y · Skipped: Z” + streak tooltip; §9.1 Settings location line “Changing location updates prayer and iftar times everywhere in the app.”

---

## 1. Landing / Home (Index)

| # | Situation where design might fail or confuse | Who’s most affected | Low-effort UX change |
|---|-----------------------------------------------|----------------------|------------------------|
| 1 | **“Days until Ramadan” / “Day N of Ramadan”** is prominent but **no clear next step** for someone who has never fasted. They may not know whether to tap the timer, “Start your journey,” or scroll. | First-time / non-Muslim | Add one short line under the badge: “New? Start your journey below” or “Set your location and fasting path first” with a soft arrow or link to the CTA. |
| 2 | **“I’m Muslim” vs “Start your journey”** — Muslims may assume “Start your journey” is for non-Muslims only and skip onboarding, then miss location and prayer-time setup. | Experienced Muslim | On the primary CTA, add: “Start your journey (set location & preferences)” and keep “I’m Muslim” as a shortcut that still goes through onboarding with Muslim mode pre-selected. Add one line: “Both paths set your location for accurate times.” |
| 3 | **Progress preview** shows placeholder (e.g. “Day 5”, sample streak) when user hasn’t completed onboarding. New users may think that’s their real data or that the app is pre-filled. | First-time / non-Muslim | Label explicitly: “Example: what your progress could look like” or “Your progress will appear here after you log your first fast.” Use muted styling so it reads as preview, not data. |

**Summary:** First-timers need a single obvious “what do I do first”; Muslims need to see that onboarding is for them too (location, times). Low-effort = one line of copy + optional “example” label.

---

## 2. Onboarding (welcome → mode → schedule → location → notifications → goals)

| # | Situation where design might fail or confuse | Who’s most affected | Low-effort UX change |
|---|-----------------------------------------------|----------------------|------------------------|
| 1 | **Location step:** If “Use my location” fails (permission denied, timeout), the screen can feel dead with no path forward. Users don’t know they can type a city instead. | First-time / both | Add visible fallback copy: “Or search for your city above” and, if auto-detect fails, a short message: “We couldn’t detect your location. Search for your city for accurate prayer times.” |
| 2 | **“Full Ramadan” / “Dawn to sunset (Fajr to Maghrib)”** — non-Muslims may not know what Fajr/Maghrib are and why they matter. | First-time / non-Muslim | Add a one-line tooltip or helper text: “Fajr = dawn (start fast); Maghrib = sunset (break fast). Your times depend on location.” Same for any “Sunnah” / “Ayyam al-Beed” options: one sentence each. |
| 3 | **Goals step:** Muslim users who want to track by madhab (e.g. different calculation method) or prefer a specific prayer-time method have no option. Goals are high-level only. | Experienced Muslim | Add a single line before “Go to dashboard”: “You can change prayer-time method and more in Settings after setup.” Optionally add a Settings link. No new controls on this screen—just signposting. |

**Summary:** First-timers need fallbacks and one-line explanations for terms; experienced Muslims need a signpost to “more control” (Settings) so they don’t feel locked in.

---

## 3. Dashboard (main)

| # | Situation where design might fail or confuse | Who’s most affected | Low-effort UX change |
|---|-----------------------------------------------|----------------------|------------------------|
| 1 | **“Suhoor end” / “Next: Suhoor”** without explanation. Non-Muslims may not know suhoor = last meal before dawn or that “Suhoor end” is when eating must stop. | First-time / non-Muslim | Use the existing mode-aware label (e.g. “Suhoor (pre-dawn meal)” or “Pre-dawn meal end”) for non-Muslim mode. Ensure the “I’m fasting” tooltip says “after your pre-dawn meal (suhoor)” once. |
| 2 | **“I’m fasting” and “I didn’t fast today”** side by side when not fasting. Users may not understand the difference (starting a fast vs declaring they didn’t fast at all). | First-time / non-Muslim | Add a single line under the buttons or in tooltip: “I’m fasting” = you started today’s fast; “I didn’t fast today” = you’re not fasting (e.g. travel, illness). |
| 3 | **Day selector + “Mark complete”** — power users may want to mark a past day complete from the dashboard without opening Schedule. Currently “Mark complete” is for selected day; if that’s today-only in practice, past days are unclear. | Experienced Muslim | If the day picker already allows selecting yesterday, ensure “Mark complete” / “Fasted ✓” applies to the selected day and label it: “Mark [selected date] complete.” If only today is actionable, add tooltip: “To mark past days, use Schedule and select that day.” |

**Summary:** Clarify suhoor and the two buttons for new users; make “which day am I affecting?” obvious for power users.

---

## 4. Dashboard Today

| # | Situation where design might fail or confuse | Who’s most affected | Low-effort UX change |
|---|-----------------------------------------------|----------------------|------------------------|
| 1 | **Countdown to “Suhoor end” vs “Iftar”** — first-timers may not know which applies when (eating window vs fasting window) or what “Suhoor ended” means. | First-time / non-Muslim | Keep the status line (“Eating period” / “Fasting period”) prominent; add one line under the countdown: “You can eat until Suhoor end; after that, no food or drink until Iftar.” Reuse in tooltip if space is tight. |
| 2 | **“I fasted today — mark complete” vs “I broke my fast” vs “I didn’t fast today”** — three actions can overwhelm. Users who broke their fast may look for “I didn’t fast” instead of “I broke my fast.” | First-time / both | Group visually: “Finished your fast?” [Mark complete | I broke my fast] and below: “Not fasting today?” [I didn’t fast today]. One-line distinction in tooltips: “Broke” = started but stopped early; “Didn’t fast” = didn’t start at all. |
| 3 | **Hydration / intention / energy** on the same page as the main fast actions. Muslims focused on fiqh may want a minimal “did I fast or not?” view without extra tracking. | Experienced Muslim | Add a “Simple view” toggle or collapse section (e.g. “Hide hydration & intention”) so the main block is “Today’s fast” + countdown only. Single preference or local state. |

**Summary:** Explain eating vs fasting window and the three fast outcomes; offer a minimal view for users who only care about fast status.

---

## 5. Schedule (calendar, meal plan, food log)

| # | Situation where design might fail or confuse | Who’s most affected | Low-effort UX change |
|---|-----------------------------------------------|----------------------|------------------------|
| 1 | **Calendar shows many numbers; “today” and “days with data”** may look the same. New users don’t know that clicking a day opens the detail panel. | First-time / non-Muslim | Add one line under the calendar: “Click any day to see or edit meals and fasting for that day.” Optionally highlight “Today” with a chip or border so it’s obvious. |
| 2 | **Meal plan (Suhoor / Iftar text) vs Food log (items with calories)** — two ways to log food can confuse. Users may add items in one place and expect to see them in the other. | First-time / both | In the day-detail header, add: “Meal plan = notes or recipe names; Food log = what you ate with calories.” One sentence. If both exist for a day, show a short note: “You have both a plan and logged items for this day.” |
| 3 | **Sunnah / “white days” banner** uses terms (Sunnah, Ayyam al-Beed) and links to hadith. Non-Muslims may skip; Muslims may want to log Sunnah fasts separately from Ramadan and not see a generic “today is Sunnah day” without a way to log it. | First-time / non-Muslim; Experienced Muslim | For non-Muslim: add one line under the banner: “Optional voluntary fasts in Islamic tradition.” For Muslim: ensure “Mark complete” or a separate “Sunnah fast” option (if added later) is reachable; for now, add tooltip: “You can still log today as a fast from the main Dashboard.” |

**Summary:** Make “click day → edit” and “plan vs log” explicit; clarify Sunnah for both audiences and signpost where to log.

---

## 6. Meals

| # | Situation where design might fail or confuse | Who’s most affected | Low-effort UX change |
|---|-----------------------------------------------|----------------------|------------------------|
| 1 | **Tabs: “Suhoor” vs “Iftar”** — non-Muslims may not associate “Suhoor” with “morning” or “pre-dawn” if the subtitle is small. | First-time / non-Muslim | Use mode-aware tab label: “Suhoor (pre-dawn)” or “Pre-dawn (Suhoor)” in non-Muslim mode so the first tap is self-explanatory. |
| 2 | **Recipes by region + “Add to today”** — users may add a recipe expecting it to auto-fill the meal plan or food log for “today,” but “today” might be wrong timezone or they intended another day. | First-time / both | When adding to plan/log, show: “Add to [date]” with a small date display (e.g. “Today, Mar 15” or editable date). If date is editable, one click to change. |
| 3 | **Custom meal (name, cal, portions, macros)** — power users may want to duplicate a previous entry or paste from another app. No “last used” or templates. | Experienced Muslim | Add “Use again” or “Copy from yesterday” for the last custom entry (name + cal + portions). Single row or dropdown; minimal code. |

**Summary:** Clarify Suhoor for first-timers; make “which day” visible when adding; give a quick “repeat last” for power users.

---

## 7. Journal

| # | Situation where design might fail or confuse | Who’s most affected | Low-effort UX change |
|---|-----------------------------------------------|----------------------|------------------------|
| 1 | **Prompt: “How did you feel at suhoor vs iftar?”** — non-Muslims may not know which meal is which. | First-time / non-Muslim | Use mode-aware prompt: “How did you feel at your pre-dawn meal vs when you broke your fast?” (already in copy audit); ensure it’s applied in the journal. |
| 2 | **Calendar to “pick a day”** — users might think they can only write for days that already show a dot (days with entries). They don’t realize they can click any day to start writing. | First-time / both | Add one line above or below the calendar: “Click any day to write or edit — past, today, or future.” |
| 3 | **No indication of “saved”** — after writing and clicking Save, there may be no toast or checkmark. Users may save again or leave unsure. | Both | Show a short toast “Entry saved” or an inline “Saved” + timestamp (e.g. “Saved just now”) for 2–3 seconds after save. |

**Summary:** Explain suhoor/iftar in the prompt for non-Muslims; make “any day” writable obvious; add clear save feedback.

---

## 8. Progress / Stats

| # | Situation where design might fail or confuse | Who’s most affected | Low-effort UX change |
|---|-----------------------------------------------|----------------------|------------------------|
| 1 | **“Days completed” vs “Broken” vs “Skipped”** — if the app shows only “X days completed,” users who broke or skipped may wonder where those days went or if they’re “failing.” | First-time / both | Show a simple breakdown: “Completed: X · Broken: Y · Skipped: Z” (or “Didn’t fast: Z”) so all days are accounted for. One line under the main number. |
| 2 | **Streak** counts only consecutive completed days. Users who skip a day (travel/illness) see streak reset and may feel discouraged. | First-time / non-Muslim | Add a short tooltip or line: “Streak = consecutive days you completed the full fast. Skipped or broken days reset it — that’s okay.” Optional: “Longest streak” stays visible so they see their best. |
| 3 | **Export CSV / report** — power users may want to see exact times (start/end of fast), reason for broken, or Hijri date. Current export may be minimal. | Experienced Muslim | In the export section, add one line: “Report includes dates, status, and times. For prayer-time method or more detail, see Settings.” If export already has times, say so: “Includes start and end times per day.” |

**Summary:** Make completed/broken/skipped visible; soften streak reset with copy; signpost or describe export for power users.

---

## 9. Settings

| # | Situation where design might fail or confuse | Who’s most affected | Low-effort UX change |
|---|-----------------------------------------------|----------------------|------------------------|
| 1 | **Location at top** — changing location updates prayer times and “today” in some timezones. Users may not realize that editing location will change the dashboard immediately. | First-time / both | Add one line under the location block: “Changing location updates prayer and iftar times everywhere in the app.” |
| 2 | **Many sections (notifications, hydration, theme, fasting path, data export).** Muslims looking for prayer-time method (e.g. calculation school) or Qibla may not find it and assume it’s missing. | Experienced Muslim | If the app does not support calculation method yet: add a short “Coming soon” or “Prayer times use a standard calculation. Different methods may be added later.” under Location or a “Prayer times” subsection. Reduces “is this broken?” feeling. |
| 3 | **Reset / clear data** — dangerous action. First-timers might tap by accident; others might not understand “Reset progress” vs “Clear location.” | First-time / both | Use a two-step confirm: “Clear all progress and fasting data?” with “Cancel” and “Yes, clear everything.” Optionally list what will be removed (progress, journal, meals). Keep “Reset to defaults” for preferences separate from “Clear my data.” |

**Summary:** Explain impact of changing location; set expectations for prayer-time method if not supported; make reset clearly destructive with a clear confirm.

---

## 10. Cross-screen themes

| Theme | First-time / non-Muslim | Experienced Muslim | Low-effort direction |
|-------|---------------------------|--------------------|------------------------|
| **Terminology** | Suhoor, Iftar, Fajr, Maghrib, Sunnah, musafir — explain once per context (tooltip or one line). | Keep terms correct; avoid over-simplifying. | Use mode-aware labels (already partially done); add tooltips where a term first appears. |
| **Control vs simplicity** | Fewer choices, clear next step, “example” labels so they don’t mistake placeholders for data. | Signpost “more in Settings”; optional “simple view” or “advanced” where it makes sense. | One line of copy per screen (“You can change this in Settings” / “Simple view”) and one collapse or toggle where it has high impact (e.g. Today page). |
| **Feedback** | “Saved,” “Updated,” “We couldn’t…” so every action has an outcome. | Same; export and “what’s included” stated. | Toasts or inline “Saved”; one sentence under export/reset describing what’s included or cleared. |

---

## Quick reference: who is affected

- **First-time / unfamiliar with Ramadan:** Landing (what to do first), Onboarding (location fallback, Fajr/Maghrib/Sunnah), Dashboard (suhoor, two buttons), Today (eating vs fasting window, three outcomes), Schedule (click day, plan vs log), Meals (Suhoor tab), Journal (prompt, any day, saved), Progress (breakdown, streak copy), Settings (location impact, reset confirm).
- **Experienced Muslim:** Onboarding (signpost Settings), Dashboard (which day am I editing), Today (minimal view), Schedule (where to log Sunnah), Meals (which day, repeat last), Progress (export content), Settings (prayer method expectation, reset vs preferences).

All suggested changes are **copy, tooltips, one-line explanations, or single toggles/links** — no major redesign. Prioritise by screen traffic (Dashboard, Today, Onboarding) and user segment (first-time vs Muslim) depending on your analytics or goals.
