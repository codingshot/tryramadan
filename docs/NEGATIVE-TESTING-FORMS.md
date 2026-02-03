# Negative Testing: Forms & Inputs (Ramadan Fasting Dashboard)

Focus: **invalid and extreme inputs** for all key forms (fast entry, meal entry, journal, settings), with **proposed validation rules**, **error messages**, and **test cases** (manual or automated) so the app handles them safely and clearly.

---

## 1. Fast entry (start / complete / break / skip)

### 1.1 Inputs and current behavior

| Input / action | Source | Current behavior |
|----------------|--------|------------------|
| Start fast | Button "I'm fasting" (today only in UI) | Creates `FastingLogEntry` with `date`, `startedAt`, `status: 'in_progress'` |
| Complete fast | Button "Mark complete" or day view toggle | Sets `completedAt`, `status: 'completed'`, adds to `completedDays` |
| Break fast | Button "Break fast" → reason dialog | Sets `status: 'broken'`, `brokenReason` (from fixed list); removes from `completedDays` |
| Skip day | Button "I didn't fast today" | Adds date to `skippedDays`; clears any log for that date |
| Reason for break | `BreakFastReasonDialog`: fixed list (mistake, illness, travel, menstruation, medical, other) | No free text; `onSelectReason(id)` receives valid id or could be called with invalid id from code |

There is **no form with free-text or numeric input** for fast entry; the only “input” is choice of reason (predefined). Conflicting states are **state-machine** issues (e.g. complete then break, or break without having started).

### 1.2 Invalid / extreme / conflicting cases

| Case | Description | Risk |
|------|-------------|------|
| Break without having started | User or code calls “break fast” when there is no `in_progress` entry for today | Entry created with `startedAt ≈ completedAt`; possible confusions in UI or stats |
| Complete without having started | Mark complete when no log entry for today | `completeFastingToday` creates/updates log; `hoursFasted` from `startedAt` (defaults to now) |
| Complete then break same day | Mark complete, then later break | Last action wins; completed then broken leaves day as broken (correct) |
| Skip then start same day | Mark “I didn’t fast,” then tap “I’m fasting” | `setDaySkipped` removes log; if start is allowed after skip, new in_progress is created — define desired behavior |
| Double start same day | Tap “I’m fasting” twice | Idempotent (no duplicate entry) — already safe |
| Invalid reason id | `breakFastingToday(..., 'invalid_id', today)` | Code falls back to `'other'` — safe |
| Future / past date (programmatic) | `startFastingToday(..., '2030-01-15')` | Allowed by API; UI only exposes “today” — clarify if past/future dates are supported |
| Timezone “today” vs device today | `todayOverride` different from device date | Intentional; ensure countdown and log stay aligned with chosen date |

### 1.3 Proposed validation rules and error messages

| Rule | When | Error message (user-facing if applicable) |
|------|------|-------------------------------------------|
| Break only when in progress | Before calling `breakFastingToday`, require `getTodayFastingLog(progress, today)?.status === 'in_progress'` | If no entry: “You haven’t started a fast today. Start your fast first, or use ‘I didn’t fast today’ if you’re not fasting.” |
| Complete only when in progress or no entry | Allow complete when no entry (backfill) or in_progress; if already completed/broken, show undo instead of “Mark complete” again | If already completed: show “Fasted ✓” and “Tap to undo”; no extra message |
| Skip when not completed and not in_progress (optional) | Optionally block “I didn’t fast” when day is already completed to avoid overwriting | “You already marked this day as completed. Undo completion first if you meant to skip.” |
| Reason id must be in BROKEN_FAST_REASONS | In `breakFastingToday`, already fallback to `'other'` | N/A (no user input) |

### 1.4 Test cases (manual or automated)

| ID | Type | Input / action | Expected | Assertion / observation |
|----|------|----------------|----------|--------------------------|
| N-F1 | Auto | `breakFastingToday(progress, setProgress, 'other', today)` when no log for today | No throw; one log entry with status `broken`, `startedAt` and `completedAt` set; today not in `completedDays` | Assert `getFastingLogForDate(progress, today)?.status === 'broken'` |
| N-F2 | Auto | `breakFastingToday(..., 'invalid_id', today)` | `brokenReason === 'other'` | Assert stored reason is `'other'` |
| N-F3 | Manual / E2E | Tap “Break fast” without having tapped “I’m fasting” | Either button disabled or message as in 1.3; if allowed, state is broken and UI shows “You broke your fast” | No crash; message or disabled state |
| N-F4 | Auto | `startFastingToday` twice for same day | Single `in_progress` entry; second call no-op | Assert `fastingLog.filter(e => e.date === today).length === 1` |
| N-F5 | Manual | Mark complete → then tap “I broke my fast” | Day shows as broken; not in completed count | UI shows broken reason; Progress total does not include day |
| N-F6 | Manual | Mark “I didn’t fast today” → then tap “I’m fasting” (if UI allows) | Defined behavior: either blocked or new in_progress; no duplicate skipped + in_progress | Document actual behavior; no crash |

---

## 2. Meal entry (add food / meal plan / nutrition)

### 2.1 Inputs

- **Name** (text): food or meal name.  
  Used in: Dashboard “Add to Suhoor/Iftar” dialog, Schedule add-food, Meals custom meal, Macros planned/logged items.
- **Calories** (number): optional in some flows; stored per portion.  
  Range in code: `CALORIE_MIN = 800`, `CALORIE_MAX = 5000` for display/clamp; input may allow 0 or any number.
- **Portions** (number): typically `min={0.1}` or `Math.max(0.1, parseFloat(...) || 1)`.
- **Protein / carbs / fat** (numbers): optional; no explicit max in some inputs.
- **Date** (implicit): `selectedDate` or “today”; user picks day in calendar/day picker.

### 2.2 Invalid / extreme inputs

| Field | Invalid / extreme | Example | Risk |
|-------|-------------------|--------|------|
| Name | Empty | `""` | Dashboard: `if (!name && cal <= 0) return` — no save, no message. Meals/Macros may use "Custom" or "Logged item". |
| Name | Whitespace only | `"   "` | Treated as empty after `trim()`; same as above |
| Name | Very long | 10,000+ characters | May slow UI, overflow layout, or bloat storage |
| Name | Weird characters | `<>"&'`, emoji, null bytes, `\n` | Display/escape issues; JSON/localStorage safe if stringified |
| Calories | Empty | `""` | `parseInt('', 10) || 0` → 0; saved as 0 |
| Calories | Negative | `-100` | `type="number" min={0}` in some places; not all. Back-end uses `parseInt(..., 10) \|\| 0` → 0 or clamp |
| Calories | Huge | `999999` | `clampCalories` caps at 5000; inputs with `max={CALORIE_MAX}` cap in UI |
| Calories | Non-numeric | `"abc"` | `parseInt('abc', 10) \|\| 0` → 0 |
| Portions | Zero or negative | `0`, `-1` | `Math.max(0.1, parseFloat(...) || 1)` in submit — forced to 0.1 or 1 |
| Portions | Very large | `1e10` | Stored; totals could be huge (calories × portions) |
| Portions | Decimal | `0.25`, `2.5` | Allowed; step="0.5" in some inputs |
| Protein/carbs/fat | Negative or NaN | `-5`, `""` | `parseFloat(...) || 0` → 0; no clamp in all paths |
| Date | Future / past | Any ISO date | Allowed; UI uses calendar. No “today only” restriction for meals |
| Conflicting | Meal logged while “fasting” | User in_progress fast, adds suhoor/iftar | App allows (doesn’t auto-break fast). Could confuse; no technical error |

### 2.3 Proposed validation rules and error messages

| Rule | When | Error message |
|------|------|----------------|
| Name required (or name or calories) | Submit meal with empty name and 0 calories | “Add a name or at least one calorie so we can save this item.” |
| Name max length | `name.length > 200` (example) | “Name is too long. Use up to 200 characters.” |
| Calories in range | On submit or blur: `cal < 0 \|\| cal > CALORIE_MAX` | “Calories must be between 0 and 5,000.” |
| Portions in range | `portions < 0.1 \|\| portions > 100` (example) | “Portions must be between 0.1 and 100.” |
| Protein/carbs/fat non-negative and capped | e.g. 0–500 g each | “Enter a value between 0 and 500.” |
| Sanity: total calories for entry | `caloriesPerPortion * portions` not > 10,000 (optional) | “Total calories for this entry are very high. Check portions.” |

### 2.4 Test cases

| ID | Type | Input | Expected | Assertion |
|----|------|--------|----------|-----------|
| N-M1 | Auto | Submit meal with `name: ""`, `cal: 0` | No new entry (or entry with name "Custom" if product allows) | No duplicate; no crash |
| N-M2 | Auto | Submit with `name: "  "`, `cal: ""` | Same as N-M1 | No save or fallback name |
| N-M3 | Auto | `name`: 5000-character string | Either rejected with message or truncated/stored; no crash | `name.length <= 200` or stored and display ok |
| N-M4 | Auto | `name`: `"<script>alert(1)</script>"` or `"\"&\n"` | Stored and displayed escaped; no XSS | Safe when rendered in React (default escape) |
| N-M5 | Auto | `cal: -50` then submit | Clamped to 0 or rejected | Stored `caloriesPerPortion >= 0` |
| N-M6 | Auto | `cal: 99999` | Clamped to CALORIE_MAX (5000) where clamp exists | `caloriesPerPortion <= 5000` |
| N-M7 | Auto | `portions: 0` then submit | Becomes 0.1 or 1 per code | `portions >= 0.1` |
| N-M8 | Auto | `portions: -1` | Same as N-M7 | No negative portions |
| N-M9 | Manual | Add meal for a date 1 year in past | Saves under that date; visible when that day selected | No crash; correct key in storage |
| N-M10 | Manual | Add meal for future date | Same | No crash; correct date key |

---

## 3. Journal entry

### 3.1 Inputs

- **writeDate** (date): Calendar or date picker; ISO `YYYY-MM-DD`. Can be past, today, or future.
- **content** (textarea): Main reflection text.
- **gratitude** (optional text).
- **mood** (optional number 1–5).

### 3.2 Current behavior

- Save: `if (!content.trim()) return` — **no save when content is empty; no error message.**
- Gratitude/mood optional; can save with only mood or only gratitude if content is non-empty (content is required for save when switching date, see `hasDirtyContent`).
- Date: any selected date; future allowed (“Entry for YYYY-MM-DD (future)”).

### 3.3 Invalid / extreme inputs

| Field | Invalid / extreme | Example | Risk |
|-------|-------------------|--------|------|
| content | Empty | `""` | Save blocked (silent return) |
| content | Whitespace only | `"   \n  "` | `!content.trim()` → save blocked; user gets no feedback |
| content | Very long | 100,000+ characters | Performance; localStorage quota; layout |
| content | Weird characters | Emoji, null, `\0`, RTL, script tags | Display/storage; React escapes; check paste from Word |
| gratitude | Same as content | Empty, long, weird | Optional; no current validation |
| mood | Out of range | 0, 6, -1, NaN | UI is 1–5 buttons; programmatic could pass other |
| writeDate | Invalid date string | Malformed ISO | `new Date(writeDate + 'T12:00:00')` can be Invalid Date |
| writeDate | Far future/past | 1900-01-01, 2100-12-31 | Allowed; no range check |

### 3.4 Proposed validation rules and error messages

| Rule | When | Error message |
|------|------|----------------|
| Content required | Save with empty or whitespace-only content | “Write something before saving. A few words are enough.” |
| Content max length | e.g. 10,000 characters | “Entry is too long. Consider shortening or splitting into multiple days.” |
| Mood in range | On save or when setting mood: 1–5 only | N/A if UI is only buttons; if ever free input: “Choose a mood from 1 to 5.” |
| Date valid | When setting writeDate from picker/input | Ensure ISO date; if invalid, revert to previous or today and show: “Please pick a valid date.” |

### 3.5 Test cases

| ID | Type | Input | Expected | Assertion |
|----|------|--------|----------|-----------|
| N-J1 | Auto | Save with `content: ""` | No save; no change to entries | `entries` unchanged; optional: toast/message |
| N-J2 | Auto | Save with `content: "   "` | Same as N-J1 | Same |
| N-J3 | Manual | Click Save with empty textarea | Visible message or disabled Save until content present | User sees why save didn’t work |
| N-J4 | Auto | Save with `content`: 20,000-character string | Either rejected with message or truncated; no crash; no quota error if stored | Length check or truncate; localStorage within limit |
| N-J5 | Auto | `content` with `<img onerror="...">` or `<>` | Stored; rendered as text (no script execution) | React default escaping; no XSS |
| N-J6 | Auto | Set `mood: 0` or `mood: 10` in stored entry, then load | Display doesn’t break; mood shown as unknown or clamped | No crash; safe render |
| N-J7 | Manual | Select date 1 year in future, write, save | Entry saved under that date | Correct `date` in entries |
| N-J8 | Auto | Export with one entry; `content` has unicode/emoji | Valid JSON; re-import or display ok | `JSON.stringify` safe; file opens |

---

## 4. Settings

### 4.1 Inputs

- **Location**: Search + select from `LocationSearch`; or “Use my location” (geolocation + reverse geocode). No free-text coordinate input in UI.
- **Theme**: Select (light / dark / system).
- **Language / country**: Select from predefined lists.
- **Notification minutes before**: Number, 5–120; `Math.max(5, Math.min(120, Number(e.target.value) || 30))`.
- **Hydration goal**: Number; cups or L; stored as ml; `Math.max(500, Math.min(5000, ml))`.
- **Hydration reminder times**: Array of `HH:mm` strings.
- **Daily reminder time**: Time string.
- **Reset / export data**: Buttons; no text input.

### 4.2 Invalid / extreme inputs

| Field | Invalid / extreme | Example | Risk |
|-------|-------------------|--------|------|
| Location search | Empty submit | Submit with empty query | API or UI: no results; no crash |
| Location search | Very long query | 1000-character string | API limit; trim or cap |
| Location search | Weird characters | `"; DROP TABLE--"`, emoji | Backend safe if parameterized; UI may break |
| Notification minutes | Negative, zero, > 120 | -5, 0, 200 | Clamped 5–120 in code |
| Notification minutes | Non-numeric | "abc" | `Number('abc') \|\| 30` → 30 |
| Hydration goal | Zero, negative, very large | 0, -1, 99999 | Clamped 500–5000 ml in code |
| Hydration reminder time | Invalid format | "25:00", "12:60", "abc" | May break scheduler or display; validate HH:mm |
| Hydration reminder time | Empty | "" | Could push empty string into array |

### 4.3 Proposed validation rules and error messages

| Rule | When | Error message |
|------|------|----------------|
| Location required for prayer times | If user tries to see times without location | Already handled by “Set location” CTA; optional: “Set your location in Settings for accurate times.” |
| Search query length | Before search: 2–100 characters (example) | “Enter at least 2 characters.” / “Search is too long.” |
| Notification minutes 5–120 | On change or save | “Enter a value between 5 and 120 minutes.” (or clamp and show hint) |
| Hydration goal 500–5000 ml | On change | “Goal must be between 500 ml and 5 L.” (or clamp) |
| Reminder time format | When adding/editing reminder time | “Use HH:mm (e.g. 14:30).” |
| Reminder time range | 00:00–23:59 | “Use a valid time between 00:00 and 23:59.” |

### 4.4 Test cases

| ID | Type | Input | Expected | Assertion |
|----|------|--------|----------|-----------|
| N-S1 | Manual | Submit location search with empty field | No request or error message | No crash |
| N-S2 | Auto | Set notification minutes to -10 | Stored as 5 (clamped) | `suhoorMinutesBefore >= 5` |
| N-S3 | Auto | Set notification minutes to 200 | Stored as 120 | `<= 120` |
| N-S4 | Auto | Set hydration goal to 0 | Stored as 500 or “use default” (0 = default in prefs) | Code uses 0 for “use default”; display doesn’t break |
| N-S5 | Auto | Set hydration goal to 10000 | Clamped to 5000 | `hydrationGoalMl <= 5000` |
| N-S6 | Manual | Enter reminder time "25:00" or "12:60" | Rejected or corrected; no invalid time in state | No crash; valid time or message |
| N-S7 | Auto | Add hydration reminder time "" | Not added or replaced with default | No empty string in array |
| N-S8 | Manual | Change theme/language/country to each option | All persist and apply | No crash; correct localStorage |

---

## 5. Schedule / custom events (optional)

- **Custom event title**: Free text.  
  **Extremes**: empty, very long, special chars — same as meal name (trim, max length, escape).
- **Custom event time**: `type="time"` or HH:mm.  
  **Invalid**: empty, "24:00" — validate or clamp.
- **Meal plan notes** (suhoor/iftar text): Free text per day.  
  **Extremes**: same as journal content (length, chars).

---

## 6. Summary: test case checklist

| Area | IDs | Focus |
|------|-----|--------|
| Fast entry | N-F1–N-F6 | Break without start, invalid reason, double start, complete then break, skip then start |
| Meal entry | N-M1–N-M10 | Empty name/cal, long/special name, negative/huge cal/portions, past/future date |
| Journal | N-J1–N-J8 | Empty/whitespace content, very long, XSS-like, mood range, future date, export |
| Settings | N-S1–N-S8 | Empty search, notification/hydration clamp, invalid time format |

---

## 7. Implementation notes for automation

- **Unit tests**: Use `breakFastingToday`, `completeFastingToday`, `submitAddFood`-style helpers with mocked `progress`/`setProgress` or state; assert stored state and no throw.
- **Integration tests**: Render form components (e.g. Dashboard add-food dialog, Journal editor), fill inputs via Testing Library, submit; assert localStorage or callback with expected values and no error boundary.
- **E2E**: Playwright/Cypress — submit invalid forms; assert error messages or disabled submit; assert no crash and no corrupt data in storage.

Error messages in this doc can be wired to inline validation (on blur/submit) or toasts; keep wording consistent and accessible (e.g. avoid technical terms like “ISO date” in UI).
