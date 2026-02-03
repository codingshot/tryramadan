# UX: Suhoor One-Handed Use — Sleepy User, Small Phone

This document simulates how a sleepy user at suhoor would use the app with one hand on a small phone to: (1) check today’s fast status and key times, (2) log a quick meal, (3) add a very short note. It identifies UI elements that are too small, too far, or require too much precision, proposes a “suhoor-optimized” micro-flow, and gives thumb-reach and gesture recommendations.

**Related:** [UX-COGNITIVE-LOAD-ANALYSIS.md](./UX-COGNITIVE-LOAD-ANALYSIS.md), [UX-FLOWS-FASTING-MEALS-JOURNAL-BRIDGES.md](./UX-FLOWS-FASTING-MEALS-JOURNAL-BRIDGES.md).

---

## 1. Simulated suhoor flow (current UI)

**Context:** Pre-dawn, low light, user half-awake, phone in one hand (e.g. right). Typical viewport ~390×664 (iPhone SE) or ~360×640. **FastingBottomBar is hidden at suhoor** (it only shows when `isFasting` is true; before Fajr the user is in the “eating window”), so there are no sticky bottom shortcuts for “log meal” at this moment.

### 1.1 Check today’s fast status and key times

| Step | Action | What happens |
|------|--------|----------------|
| 1 | Open app → Dashboard | Navbar (logo, location, settings, time), optional PWA/location banners, Ramadan/Sunnah badge, **day selector** (prev / date + “Today” / next / “Go to today”), then **status card** (“Right now: Eating window” + “Next: Suhoor — HH:MM:SS”), then **Suhoor end / Iftar** strip (link to Schedule). |
| 2 | Read status | Status card is **below** day selector. On a ~664px-tall viewport, after header + banners + day selector, **status card and key times are often above the fold** or just at the fold. User must **avoid** tapping the date (opens popover) or arrows. |
| 3 | Read key times | Suhoor end (Fajr) and Iftar (Maghrib) are in a **grid** that is a **Link** to Schedule — tapping it navigates away. Times are **text**, not huge; `font-bold` for the time. |

**Friction:** Day selector has a **small text hit area** for the date (“Wed, Mar 12” + “Today” badge) with `px-2 py-1`; accidental tap opens the popover. Status and times are readable but not “at a glance” big. No single “Suhoor ends at 05:24” hero line.

### 1.2 Log a quick meal

| Step | Action | What happens |
|------|--------|----------------|
| 1 | Scroll to day plan | **Day plan** (“Today’s plan” / “Day plan”) sits **below** status card, Suhoor/Iftar strip, action buttons (“I’m fasting” / “I didn’t fast”), **collapsible “Today’s schedule,”** and **DailyMissionsCard**. So user must **scroll** (often 1–2 full screens) to reach “Log what you ate” and the **+** buttons. |
| 2 | Find Suhoor row | Two rows: Suhoor and Iftar (order depends on time). Each row: label, “Log what you ate,” and a **round + button** (`w-10 h-10` = 40×40px). |
| 3 | Tap + | **Add food dialog** opens: title “Add to Suhoor,” subtext, **name input** (placeholder “e.g. Oats & dates”), **Cal (optional)** and **Portions** inputs in a row, **Cancel** and **Add** buttons. |
| 4 | Enter something | User must **tap name field** (small input, `h-10` ≈ 40px), **type** (keyboard opens, one-handed typing is error-prone). Cal and Portions are optional but visible; Portions has `className="w-20"` (narrow). |
| 5 | Submit | Tap **Add** (Button `size="sm"` → h-9). Or **Cancel** to close. |

**Friction:** (1) **Day plan is far down** — multiple scrolls. (2) **+ button is 40×40px** — at or below the 44×44px minimum many guidelines suggest; easy to miss when sleepy. (3) **Dialog requires text entry** — no “quick log” with one tap or preset. (4) **Cancel and Add** are small (`size="sm"`) and close together; risk of mis-tap. (5) **Portions** input is narrow (`w-20`); precise tap. (6) **Whole row** is tappable for the meal card, but the primary action is only the + circle.

### 1.3 Add a very short note

| Step | Action | What happens |
|------|--------|----------------|
| 1 | Find note entry | **Dashboard:** Under day plan there is a **Journal** block: “No entry for this day — Add in Journal” or a preview + “Edit in Journal →”. Both are **links to `/dashboard/journal`**. There is **no inline “quick note”** on Dashboard. **Schedule** has a “Note” field for the selected day, but that’s on another page (Schedule → select today → scroll to Note). |
| 2 | Tap Add in Journal | User goes to **Journal** page: date picker, prompt, **textarea**, optional mood, gratitude, **Save**. Full editor, not “one line.” |
| 3 | Type and save | Multiple fields; **Save** is a single button. No “quick note” path. |

**Friction:** (1) **No one-tap or one-field “note for today”** on Dashboard. (2) **Journal** is built for full entries (prompt + content + mood + gratitude); heavy for “oatmeal and dates” at 4am. (3) **Schedule note** is the right concept (one field per day) but requires **navigate to Schedule → ensure today is selected → scroll to Note** — many steps and far from the suhoor flow.

---

## 2. UI elements: too small, too far, or too precise

### 2.1 Too small (touch targets & text)

| Element | Current | Issue | Recommendation |
|---------|--------|--------|------------------|
| **+ (Add food)** | `w-10 h-10` (40×40px) | Below 44×44px; hard to hit when sleepy | **Min 48×48px** (e.g. `min-h-[48px] min-w-[48px]`); consider full row or large “Log suhoor” card tappable. |
| **Dialog: Cancel / Add** | Button `size="sm"` (h-9) | Small; close together | **Default size** (min-h 44px); space apart; **Add** as primary, full-width on mobile. |
| **Day selector: date** | `px-2 py-1` | Small hit area; easy to open popover by accident | **Min tap height 44px**; increase padding; or make only arrows + “Go to today” tappable for change, date display non-clickable. |
| **Portions input** | `w-20` | Narrow; precise tap | **Min width 44px** or use stepper (+ / −) with 44px taps. |
| **Input (name, cal)** | `h-10` (40px) | Slightly under 44px | **Min height 44px** for primary inputs. |
| **Settings icon (navbar)** | `p-2` (32px) | Small | Already secondary; keep or increase to 44px. |
| **FastingBottomBar items** | `min-h-[44px] min-w-[48px]` | OK | Only visible when fasting; at suhoor bar is hidden. |

### 2.2 Too far (scroll / navigation)

| Element | Issue | Recommendation |
|---------|--------|------------------|
| **Day plan (log meal)** | **Below** status, times, actions, schedule collapse, DailyMissionsCard — often **2+ scrolls** on small phones | **Suhoor mode:** Move “Log suhoor” (and key times) **above the fold** or into a **sticky/collapsible “Suhoor” strip** when time is before Fajr. Or **bottom bar at suhoor** (eating window) with “Log suhoor” / “Times.” |
| **Journal / note** | No quick note on Dashboard; Journal is a full page; Schedule note is on another page | **Quick note** on Dashboard for today: one line + Save, or “Note for today” in day plan with inline field. |
| **Key times** | Visible in status area but not emphasised; user may scroll past | **Hero line** when before Fajr: “Suhoor ends 05:24” (large, one line). |

### 2.3 Too much precision (typing, aiming)

| Element | Issue | Recommendation |
|---------|--------|------------------|
| **Meal name** | Required (or calorie); forces keyboard and typing | **Presets:** “Oats,” “Dates,” “Toast,” “Water,” etc. — one tap to log. Optional “Other” for free text. |
| **Cal / Portions** | Optional but shown; small inputs | **Hide by default** in quick flow; “Add details” expands. Or **steppers** instead of number input. |
| **Journal** | Full editor (date, prompt, content, mood, gratitude) | **Quick note:** single field “Note for today” with optional “More in Journal” link. |

---

## 3. Suhoor-optimized micro-flow

**Goals:** Minimal taps, big hit areas, minimal text entry, status and key times obvious.

### 3.1 Detect “suhoor context”

- **Time:** Before Fajr (e.g. now < Suhoor end time for user’s location).
- **Optional:** User has not yet logged suhoor today (no suhoor meal plan or food log for today).

When in suhoor context, show a **suhoor-focused** layout or strip.

### 3.2 Micro-flow: Check status + key times (0–1 tap)

- **Above the fold:** One clear block:
  - **Line 1:** “Eating window — suhoor until [Fajr time]” (or “Suhoor ends 05:24”).
  - **Line 2:** “Iftar at [Maghrib time].”
- **No tap required** to see this; optionally one tap to expand “Full schedule” if needed.
- **Status card** remains; ensure “Right now: Eating window” and “Next: Suhoor — HH:MM” are in the first screen; avoid pushing them down with banners.

### 3.3 Micro-flow: Log a quick meal (1–2 taps, minimal text)

**Option A — Preset chips (recommended)**

1. **One tap** to focus “Log suhoor” (e.g. big card or bottom bar entry).
2. **Sheet or inline** shows **preset chips**: “Oats,” “Dates,” “Toast,” “Yogurt,” “Water,” “Other.”
3. **One tap** on a chip → log that item for suhoor today (default 1 portion, no calories required). **Done.** Optional “Add another” or “Add details” for name/cal.
4. If “Other”: single **large** text field (one line), then **big “Save”** button.

**Tap count:** 2 taps (open log → pick preset). No keyboard for presets.

**Option B — Single “Quick log” with one field**

1. Tap “Log suhoor” (big target).
2. **One input:** “What did you have?” (placeholder “e.g. Oats & dates”) — **min height 48px**, full width.
3. **One primary button:** “Log” (full width, min-h 48px). Cal/portions hidden; “Add calories” link to expand.
4. **Tap count:** 2 taps (open → type short string → Log). Keyboard once but minimal.

### 3.4 Micro-flow: Add a very short note (1–2 taps)

1. In **day plan** (or suhoor strip), add **one line:** “Note for today” with an **inline text field** (single line, placeholder “e.g. Light suhoor”) or a **tappable row** that opens a **bottom sheet** with one field + “Save.”
2. **Save** = one big button (min-h 48px). Data can write to **scheduleNotes[today]** or a dedicated “daily note” so it appears on Schedule and optionally in Journal.
3. **Tap count:** 1 tap to focus field (or open sheet), type one line, 1 tap Save. No navigation to Journal or Schedule required.

### 3.5 Summary: suhoor micro-flow

| Task | Current (rough) | Target (suhoor-optimized) |
|------|------------------|----------------------------|
| **See status + times** | Scroll; read card + strip | **0 scroll:** Hero “Suhoor ends HH:MM” + Iftar; status in first screen. |
| **Log suhoor meal** | Scroll → tap 40px + → dialog → type name → Add | **1–2 taps:** Big “Log suhoor” → presets (one tap) or one field + Log. **No scroll** if suhoor strip is at top or in bar. |
| **Short note** | Go to Journal or Schedule → multiple fields | **1–2 taps:** “Note for today” inline or sheet, one field + Save. |

---

## 4. Thumb-reach layout and gestures

### 4.1 Thumb zone (one-handed, right hand, ~5.5” phone)

- **Easy reach (bottom third):** Bottom bar, large buttons at bottom of screen.
- **Medium (middle):** Centre of content; avoid critical single actions at very top.
- **Hard (top):** Navbar, status bar; use for **reading** (status, times), not for **primary actions** (e.g. “Log suhoor”).

**Recommendations:**

- Put **primary suhoor actions** (“Log suhoor,” “Quick note”) in the **bottom half** of the first screen or in a **sticky bottom bar**.
- **Key times** (Suhoor ends, Iftar) can stay in the **top half** as **read-only**; make the line **large** so it’s glanceable.
- **FastingBottomBar:** Consider showing a **reduced bar in eating window** before Fajr: e.g. “Suhoor ends 05:24” + “Log suhoor” (and optionally “Today”). So at suhoor the user has **one thumb** to “Log suhoor” without scrolling.

### 4.2 Hit area and spacing

- **Minimum 44×44px** (prefer **48×48px**) for any **primary tap target** (Add meal, Log, Save, preset chips).
- **Spacing:** At least **8px** between adjacent targets to avoid accidental double-tap.
- **Full-width primary button** in dialogs/sheets (e.g. “Log” or “Save”) so user doesn’t need to aim.
- **Preset chips:** Large enough to tap with thumb (e.g. min 44px height, comfortable width); wrap to multiple rows if needed.

### 4.3 Gestures

- **Avoid** requiring **swipe** or **long-press** for primary suhoor tasks (check status, log meal, note). Prefer **single tap**.
- **Scroll:** Minimise required scroll for suhoor tasks; keep “Log suhoor” and “Note” reachable in **one scroll** or not at all (sticky/bottom bar).
- **Dialog dismissal:** **Backdrop tap** or **swipe down** to close sheet/dialog (already common); ensure **Cancel** is also large and not the only way to close (in case of mis-tap).

### 4.4 Bottom bar at suhoor (eating window, before Fajr)

- **Option:** When **now < Fajr** and user is on Dashboard (or app), show a **thin bar** at bottom:
  - Left: **“Suhoor ends 05:24”** (or “Until Fajr 00:42”).
  - Right: **“Log suhoor”** (one tap → preset or one-field flow).
- Same **safe-area** and **min-h** as FastingBottomBar; **md:hidden** so desktop unchanged.
- This gives **one tap** to “Log suhoor” without scrolling and keeps key time visible.

---

## 5. Implementation checklist (concise)

| Priority | Change |
|----------|--------|
| **P0** | **Increase Add-food + button** to min 48×48px; make the whole “Log what you ate” row tappable to open add (not only the +). |
| **P0** | **Add suhoor presets** in add-food flow: chips “Oats,” “Dates,” “Toast,” “Yogurt,” “Water,” “Other”; one-tap log for presets; “Other” = one field + big Save. |
| **P0** | **Dialog:** Primary “Add”/“Log” button default size, full-width on mobile; Cancel secondary; Portions as stepper or larger input. |
| **P1** | **Suhoor context:** When now < Fajr, show hero line “Suhoor ends HH:MM” (and Iftar) above the fold; optionally “Log suhoor” CTA in same block. |
| **P1** | **Quick note:** Inline “Note for today” in day plan (one line or one field + Save) writing to scheduleNotes or daily note; no navigation to Journal for one line. |
| **P1** | **Bottom bar in eating window:** Before Fajr, show bar with “Suhoor ends HH:MM” + “Log suhoor” so logging is one tap from bottom. |
| **P2** | **Day selector:** Increase date tap area to min 44px height; or make date display non-clickable and only arrows + “Go to today” change date. |
| **P2** | **Input heights:** Min 44px for name/cal inputs in add-food and quick note. |

---

## 6. Summary

- **Simulation:** Today, checking status and times is possible but day selector and layout can cause mis-taps; **logging a meal** requires scrolling to day plan, tapping a 40px + button, and typing in a dialog; **adding a note** requires going to Journal or Schedule with no quick path.
- **Problems:** Add button and some controls **too small**; day plan and note **too far** (scroll/navigation); **too much precision** (typing, small inputs).
- **Suhoor micro-flow:** **Status + times** above the fold with one clear “Suhoor ends HH:MM” line; **log meal** in 1–2 taps via **presets** (or one field) and a **big Log**; **short note** via **inline “Note for today”** or one sheet with one field + Save.
- **Thumb and gestures:** Put **primary actions** (Log suhoor, Save note) in **bottom half or sticky bottom bar**; **48px** min touch targets; **single-tap** flows; optional **suhoor bottom bar** before Fajr with “Suhoor ends” + “Log suhoor.”

Implementing **P0** and **P1** (bigger targets, presets, hero times, quick note, suhoor bar) will make the sleepy, one-handed suhoor scenario smooth and low-friction.
