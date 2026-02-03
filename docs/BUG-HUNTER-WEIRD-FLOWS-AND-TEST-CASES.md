# Bug hunter: weird flows & structured test cases

Document for **breaking the Ramadan dashboard** by combining fasting, meals, journaling, settings, and navigation in **rapid or unexpected sequences**. Lists 20 “weird” flows, tags **risk** (data inconsistency, UI desync, crash), and turns the **top 10** into **structured test cases** with steps and expected vs actual placeholders.

**Related:** `EDGE-CASE-TEST-SCENARIOS.md`, `STATE-TRANSITION-TESTING-FASTING.md`, `FALL-OFF-AND-RETURN-FLOWS.md`.

---

## Risk legend

| Tag | Meaning |
|-----|--------|
| **DI** | Data inconsistency — stored state contradicts itself or violates invariants (e.g. day in both completed and skipped). |
| **UI** | UI desync — screen shows stale or wrong state vs localStorage (e.g. after navigation, tab switch, or async update). |
| **CR** | Crash or unhandled error — exception, blank screen, or failed assertion. |

---

## 1. Twenty weird user flows

| # | Flow (short) | Sequence | Risk |
|---|----------------|----------|------|
| 1 | **Rapid complete–uncomplete–break** | Dashboard: Mark complete → immediately Undo (uncomplete) → immediately Break fast with reason. | DI, UI — race between three state updates; log may end up broken with correct reason but completedDays or in_progress inconsistent. |
| 2 | **Make-up then mark same day skipped** | Schedule: select yesterday → Mark complete (make-up). Without leaving, if UI allowed: Mark “I didn’t fast this day” for same day. Or Dashboard: select yesterday, complete, then find a way to mark skipped. | DI — day could be in both completedDays and skippedDays if setDaySkipped doesn’t remove from completed (it does); if setDayCompleted doesn’t remove from skipped, day in both. |
| 3 | **Start fast → Settings → Reset progress → Back to Dashboard** | Dashboard: I’m fasting. Navigate to Settings → Reset all progress → confirm. Navigate back to Dashboard. | UI — Dashboard may still show “You’re fasting” / countdown if it hasn’t re-read progress; or may show empty state. CR if any code assumes progress.fastingLog length > 0. |
| 4 | **Journal: change date while typing, then save** | Journal: select Day 1, type text. Before saving, change calendar to Day 2. Tap Save. | DI, UI — save might apply to Day 1 (original selection) or Day 2 (current selection); or overwrite wrong day. |
| 5 | **Two tabs: Tab A marks complete, Tab B still on Dashboard** | Open app in two tabs. Tab A: Mark complete for today. Tab B: still on Dashboard (no refresh). Tab B: tap “Mark complete” again or “Undo.” | UI — Tab B shows stale state; may double-add to completedDays or show wrong button state. |
| 6 | **Export preview open → other tab resets progress → Download** | Settings: click Export my data → preview modal open. In second tab (or in same session): Reset progress. In first tab: click Download from preview. | DI, UI — downloaded JSON may be pre-reset (preview snapshot) or post-reset; if preview is live read, may be inconsistent. |
| 7 | **Meals: add item for Day A, switch date to Day B mid-save** | Schedule: select Day 1. Add custom food item, click Add / Save. Before state flushes, switch calendar to Day 2. | DI — item might be written to Day 1 or Day 2 depending on when selectedDate is read. |
| 8 | **Rapid theme + streak toggle** | Settings: toggle Theme (Light → Dark → Light). Immediately toggle “Show streak and achievements” Off → On. Navigate to Dashboard. | UI — Dashboard may show wrong theme or wrong visibility of streak card; race between preference updates. |
| 9 | **Switch userType (Muslim ↔ Non-Muslim) while fasting in progress** | Dashboard: I’m fasting (in_progress). Settings → Fasting path → switch to Non-Muslim (or Muslim). Back to Dashboard. | UI — labels and copy should update; in_progress state should still show. If any code branches on userType and assumes Muslim, could show wrong copy or CR. |
| 10 | **Mark complete from Dashboard and from Schedule for same day** | Dashboard: select today, Mark complete. Without refresh, open Schedule, select same day, click “I fasted this day — mark complete” (toggle). | DI, UI — toggleCompleted on Schedule removes from completedDays; Dashboard may still show “Yes, logged ✓.” Or double-add if logic differs. |
| 11 | **Midnight cross during session** | User has “today” in progress. Leave app open; system time crosses midnight (or mock). Dashboard “today” and fasting log date may diverge. | DI, UI — getTodayDateString() flips; in_progress log is for previous date; new “today” has no log. Countdown and “You’re fasting” may be wrong. |
| 12 | **Journal: paste 20k chars and save** | Journal: paste content > 10k chars. Tap Save. | UI, CR — validation may toast and block save; or may truncate/save and break layout or export. |
| 13 | **Location change while countdown visible** | Dashboard: countdown to Iftar visible (location A). Settings → change location to B (different timezone). Back to Dashboard. | UI — countdown might still use old prayer times until refetch; or might flash/error if prayer times cleared. |
| 14 | **Schedule: mark day complete, then add meal for that day** | Schedule: select past day → I fasted this day, mark complete. Same day: add suhoor/iftar in food log. | DI — generally safe (meals and progress independent); ensure meal is stored under selected date not “today.” |
| 15 | **Rapid navigation: Dashboard → Schedule → Settings → Today → Dashboard** | Click through 5 routes in &lt; 2 seconds. | UI, CR — components may unmount/remount; async state (prayer times, progress) may resolve after unmount; could set state on unmounted component or show wrong page state. |
| 16 | **Break fast → immediately Start fast again (same day)** | Dashboard: I’m fasting → Break fast (reason). Then tap “I’m fasting” again same day. | DI — startFastingToday replaces log for today; new in_progress. Allowed but unusual; ensure broken entry is replaced not duplicated. |
| 17 | **Onboarding complete → skip location → Dashboard → set location → trigger prayer fetch** | Complete onboarding with location skipped. Dashboard loads (no coords). Settings → set location. Return to Dashboard. | UI — prayer times may start loading; Dashboard may have shown “Set location” then update; ensure no duplicate fetch or stale skeleton. |
| 18 | **Progress: export CSV while progress is being updated** | Progress page: click Export CSV. While blob is being built, in another tab mark a day complete. | DI — CSV might include or exclude the new day depending on timing; usually acceptable. |
| 19 | **Journal: select future date, write, save** | Journal: pick tomorrow’s date. Write entry. Save. | DI — entry stored under future date; list/calendar should show it. Some UIs might disallow future; if allowed, ensure no crash. |
| 20 | **Add meal with 0 calories and empty name** | Schedule or Meals: add custom item — name blank, calories 0. Submit. | UI, CR — validation may toast; or may save and cause 0/NaN in totals or layout. |

---

## 2. Risk summary (which flows are most likely to cause…)

**Data inconsistencies (DI):** 1, 2, 4, 7, 10, 11, 16.  
**UI desync (UI):** 1, 3, 4, 5, 6, 8, 9, 10, 11, 13, 15, 17, 19, 20.  
**Crashes / unhandled errors (CR):** 3, 9, 12, 15, 20.

---

## 3. Top 10 structured test cases

Each case: **ID**, **Title**, **Preconditions**, **Steps**, **Expected**, **Actual (placeholder)**.

---

### TC-1: Rapid complete → uncomplete → break fast

- **Risk:** DI, UI  
- **Preconditions:** User on Dashboard; today has no fasting state (untracked or in_progress).  
- **Steps:**  
  1. If not in progress: tap “I’m fasting.”  
  2. Tap “Mark complete.”  
  3. Immediately tap “Undo” / uncomplete.  
  4. Immediately tap “Break fast” and select a reason (e.g. Illness).  
  5. Confirm.  
- **Expected:**  
  - One fastingLog entry for today with `status: 'broken'`, `brokenReason` set.  
  - Today not in completedDays.  
  - UI shows broken state and reason; no “You’re fasting” or “Mark complete.”  
- **Actual:** _[Observe and fill: any duplicate log entries? completedDays still contains today? UI shows wrong state?]_

---

### TC-2: Make-up then mark same day skipped (if UI allows)

- **Risk:** DI  
- **Preconditions:** Yesterday has no progress (not in completedDays or skippedDays). Schedule or Dashboard allows selecting yesterday and “Mark complete” and “I didn’t fast this day.”  
- **Steps:**  
  1. Open Schedule (or Dashboard with day picker). Select yesterday.  
  2. Tap “I fasted this day — mark complete” (make-up).  
  3. Without changing date, if available: tap “I didn’t fast this day” (or equivalent). If not available, go to Dashboard, select yesterday, and trigger mark skipped if possible.  
  4. Open Progress or inspect localStorage.  
- **Expected:**  
  - Yesterday in exactly one of completedDays or skippedDays; not both.  
  - If skipped: not in completedDays; no fastingLog for yesterday (or cleared).  
- **Actual:** _[Observe: is yesterday in both completedDays and skippedDays?]_

---

### TC-3: Reset progress while fasting in progress, then return to Dashboard

- **Risk:** UI, CR  
- **Preconditions:** User has started fast today (in_progress).  
- **Steps:**  
  1. From Dashboard, navigate to Settings.  
  2. Tap “Reset all progress” → confirm.  
  3. Navigate back to Dashboard (e.g. Back or nav link).  
- **Expected:**  
  - progress reset (no completedDays, empty fastingLog).  
  - Dashboard shows untracked state: “I’m fasting” and “I didn’t fast today”; no countdown, no “You’re fasting.”  
  - No crash or unhandled error.  
- **Actual:** _[Observe: does Dashboard still show “You’re fasting” or countdown? Any console error or blank screen?]_

---

### TC-4: Journal — change date while typing, then save

- **Risk:** DI, UI  
- **Preconditions:** Journal has at least one entry (optional). User on Journal page.  
- **Steps:**  
  1. Select Day 1 (e.g. first day of Ramadan).  
  2. Type some text in the content area (do not save).  
  3. Change calendar selection to Day 2.  
  4. Tap Save.  
- **Expected:**  
  - Save applies to the **currently selected** date (Day 2). Day 1 unchanged.  
  - Or: save is explicitly tied to the date when editing started; behavior documented and consistent.  
- **Actual:** _[Observe: which date has the new content? Is Day 1 overwritten?]_

---

### TC-5: Two tabs — Tab A marks complete, Tab B interacts

- **Risk:** UI  
- **Preconditions:** App open in two browser tabs; both on Dashboard; today not completed.  
- **Steps:**  
  1. Tab A: tap “Mark complete” (after iftar or for today).  
  2. Do not refresh Tab B.  
  3. Tab B: observe state. Tap “Undo” or “Mark complete” if still visible.  
- **Expected:**  
  - Tab B shows stale state until refresh or re-focus (localStorage is source of truth).  
  - After Tab B refresh or navigation, Tab B shows completed state.  
  - If Tab B taps “Mark complete” again, idempotent (no duplicate). If Tab B taps “Undo,” state becomes in_progress.  
- **Actual:** _[Observe: does Tab B show completed? Does double-tap on Tab B cause duplicate or odd state?]_

---

### TC-6: Export preview open, reset in same session, then download

- **Risk:** DI, UI  
- **Preconditions:** User has some progress and journal.  
- **Steps:**  
  1. Settings → “Export my data” → preview modal opens (JSON shown).  
  2. In same tab: close modal or open Reset, then Reset all progress and confirm.  
  3. Open Export again → preview → Download.  
- **Expected:**  
  - Downloaded file reflects **current** state (post-reset): empty or default progress, empty journal if reset clears it.  
  - No crash when opening preview after reset.  
- **Actual:** _[Observe: does downloaded file contain pre-reset or post-reset data?]_

---

### TC-7: Add meal for Day A, switch date to Day B before save completes

- **Risk:** DI  
- **Preconditions:** Schedule page; food log for Day 1 empty or has items.  
- **Steps:**  
  1. Select Day 1.  
  2. Add a custom food item (name + calories).  
  3. Immediately (before or as save is applied) switch calendar to Day 2.  
  4. Check food log for Day 1 and Day 2.  
- **Expected:**  
  - Item is stored under **Day 1** (the date at which add was triggered). Day 2 unchanged.  
- **Actual:** _[Observe: is the new item under Day 1, Day 2, or both?]_

---

### TC-8: Rapid theme and streak toggle, then Dashboard

- **Risk:** UI  
- **Preconditions:** Settings page; theme and “Show streak and achievements” at some initial state.  
- **Steps:**  
  1. Change theme (e.g. Dark → Light).  
  2. Immediately toggle “Show streak and achievements” Off.  
  3. Navigate to Dashboard.  
- **Expected:**  
  - Dashboard uses new theme; streak card and milestone section hidden.  
  - No flash of wrong theme or wrong streak visibility.  
- **Actual:** _[Observe: correct theme and streak visibility? Any flicker or wrong state?]_

---

### TC-9: Switch userType (Muslim ↔ Non-Muslim) while fasting in progress

- **Risk:** UI, CR  
- **Preconditions:** Today in progress (user tapped “I’m fasting”).  
- **Steps:**  
  1. Go to Settings.  
  2. Fasting path: switch from Muslim to Non-Muslim (or vice versa).  
  3. Return to Dashboard.  
- **Expected:**  
  - Labels update (e.g. “Iftar” vs “Breaking Fast (Iftar)”).  
  - “You’re fasting” and countdown still shown; in_progress state unchanged.  
  - No crash.  
- **Actual:** _[Observe: labels correct? Countdown still visible? Any error?]_

---

### TC-10: Mark complete from Dashboard then toggle complete off from Schedule (same day)

- **Risk:** DI, UI  
- **Preconditions:** Today not completed.  
- **Steps:**  
  1. Dashboard: ensure today is selected (or use today). Tap “Mark complete.”  
  2. Without refreshing, open Schedule.  
  3. Select same day (today).  
  4. Click “I fasted this day — mark complete” (which toggles to “uncomplete” when already complete).  
- **Expected:**  
  - Toggle removes today from completedDays; Schedule and Dashboard both show “not completed” after navigation or re-read.  
  - No duplicate entries; completedDays has at most one instance of today.  
- **Actual:** _[Observe: does Dashboard still show “Yes, logged ✓”? Is today removed from completedDays?]_

---

## 4. How to use

- **Manual:** Run each TC, fill **Actual**, and compare to **Expected**. File bugs for mismatches.  
- **Automation:** Turn steps into scripts (e.g. Playwright); assert on localStorage and DOM.  
- **Regression:** After fixing bugs, re-run the corresponding TCs and add new ones for similar patterns.

These flows and test cases are designed to surface data inconsistencies, UI desync, and crashes from unusual combinations of actions.
