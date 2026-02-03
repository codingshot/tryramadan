# Edge-case test scenarios for Ramadan fasting, journaling & meal-tracking

Design document for QA: edge cases across **fast tracking**, **meals**, **journal**, and **stats**, with inputs, steps, expected outcomes, and failure modes. Tables are suitable for later automation (e.g. test IDs, parameterised runs).

---

## 1. Calendar & Ramadan boundaries

| ID | Feature | Scenario | Inputs | Steps | Expected outcome | What could break |
|----|---------|----------|--------|-------|------------------|------------------|
| EC-CAL-1 | Calendar | **First day of Ramadan** – user opens app on Ramadan start date | `today` = Ramadan start (e.g. 2025-03-01); location set | 1. Open Dashboard 2. Check day label / “Day 1” 3. Start fast, complete fast | Day shows as Ramadan day 1; countdown uses correct prayer times; completed day counts in stats | Wrong “today” if timezone puts user in previous/next calendar day; Ramadan start missing for year |
| EC-CAL-2 | Calendar | **Last day of Ramadan** – user on final day (29 or 30) | `today` = Ramadan end date (e.g. 2031-01-23 for 29-day) | 1. Open Dashboard 2. Complete fast 3. Check progress / “Eid” or post-Ramadan message | Day shows as last Ramadan day; completion counted; no “Day 31” | Off-by-one if end date is exclusive; 29 vs 30 days not handled per year |
| EC-CAL-3 | Calendar | **Ramadan spans two Gregorian years** (e.g. 2030-12-26 → 2031-01-23) | Dates in Dec 2030 and Jan 2031 | 1. Set date to 2030-12-26 2. Set date to 2031-01-23 3. Check `isRamadanDay` and `getRamadanDayNumber` | Both dates are Ramadan; day numbers 1 and 29/30 | Year boundary logic wrong; “today” or cache key uses only one year |
| EC-CAL-4 | Calendar | **Day before Ramadan / day after** | `today` = start − 1 or end + 1 | 1. Open Dashboard 2. Check “days until Ramadan” or “Ramadan ended” | Before: “X days until Ramadan”; after: no “Day N” of Ramadan; no crash | Incorrect boundary (inclusive vs exclusive); null/undefined when not in Ramadan |
| EC-CAL-5 | Calendar | **Year not in RAMADAN_START_BY_YEAR** | Year e.g. 2040 | 1. Call `getRamadanStartForYear(2040)` | Returns a date (fallback ~11 days earlier from ref); no throw | Unhandled missing key; undefined used as date |

---

## 2. Time zone & “today”

| ID | Feature | Scenario | Inputs | Steps | Expected outcome | What could break |
|----|---------|----------|--------|-------|------------------|------------------|
| EC-TZ-1 | Fast / Dashboard | **Display timezone differs from device** | `preferences.timezone` = "America/New_York"; device in UTC | 1. Open Dashboard 2. Check “today” date 3. Start fast | “Today” is date in New York; fasting log and countdown use that date | `todayOverride` not passed; countdown vs log date mismatch |
| EC-TZ-2 | Fast / Dashboard | **User crosses midnight (timezone) during session** | Location timezone; time 23:59 → 00:01 | 1. Have in_progress fast for “today” 2. Advance time past midnight in display TZ | “Today” flips; previous day’s fast still associated with old date; new day has no fast | Streak or “today” recalc wrong; duplicate or lost log entry |
| EC-TZ-3 | Fast / Stats | **DST transition mid-Ramadan** | Date on DST change; location in DST-using TZ | 1. Open Dashboard on DST day 2. Check countdown / prayer times | Countdown and prayer times consistent; no NaN or negative countdown | Prayer API returns local times; clock shift breaks duration math |
| EC-TZ-4 | Fast | **Fasting across timezone boundary (travel)** | Start fast in TZ A; “complete” in TZ B (different calendar day in B) | 1. Start fast (date A) 2. Change location/timezone to B where it’s next day 3. Mark complete | Completion stored for date used when completing (e.g. todayOverride); hoursFasted correct | completedDays uses wrong date; streak double-counts or drops |

---

## 3. Travel, skipped & excused days

| ID | Feature | Scenario | Inputs | Steps | Expected outcome | What could break |
|----|---------|----------|--------|-------|------------------|------------------|
| EC-SKIP-1 | Fast | **Mark “I didn’t fast today” (skipped)** | `today`; no existing log | 1. Dashboard: do not start fast 2. Click “I didn’t fast today” | Day added to `skippedDays`; no entry in `completedDays`; UI shows “Skipped” / “I didn’t fast today” | skippedDays not persisted; still offered “I’m fasting” |
| EC-SKIP-2 | Fast | **Skipped then undo / clear** | Day in `skippedDays` | 1. (If UI supports) clear skipped 2. Or start fast after marking skipped | Skipped cleared or overwritten; can start fast that day if allowed | No way to un-skip; or duplicate state (skipped + in_progress) |
| EC-SKIP-3 | Fast | **Start fast then mark skipped same day** | `today` with in_progress log | 1. Start fast 2. Click “I didn’t fast today” | `setDaySkipped`: in_progress removed; day in skippedDays; not in completedDays | Log entry left as in_progress; or still counted in streak |
| EC-SKIP-4 | Stats | **Streak excludes skipped days** | completedDays = [D1, D2]; skippedDays = [D3]; D4 completed | 1. Complete D4 2. Read streak | Streak = 1 (D4 only); D2–D3–D4 not one streak | getStreakDays / calculateStreak includes or excludes skipped wrongly |
| EC-SKIP-5 | Fast | **Broken with reason “Travel (musafir)”** | today; in_progress fast | 1. Break fast 2. Select reason “Travel (musafir)” | status = broken; brokenReason = 'travel'; removed from completedDays | Reason not saved; shown as “other”; excused not distinguished in stats |
| EC-SKIP-6 | Stats | **Completed vs broken vs skipped in totals** | Mix of completed, broken, skipped days | 1. View Progress / stats 2. Check totals and lists | Completed count; broken list; skipped not counted as completed; total hours excludes skipped | All lumped together; skipped counted as completed; hours include skipped |

---

## 4. Partial fasts & broken fasts

| ID | Feature | Scenario | Inputs | Steps | Expected outcome | What could break |
|----|---------|----------|--------|-------|------------------|------------------|
| EC-BR-1 | Fast | **Break fast without having started** | No fastingLog for today | 1. Click “I broke my fast” (or equivalent) | Either no-op or create broken entry with startedAt ≈ completedAt; not in completedDays | Crash; or completed added; hoursFasted NaN |
| EC-BR-2 | Fast | **Break fast with invalid reason id** | reason = "invalid_id" | 1. breakFastingToday(progress, setProgress, "invalid_id", today) | brokenReason = 'other' (fallback) | Wrong reason stored; crash |
| EC-BR-3 | Fast | **Complete then break same day (undo complete then break)** | today completed | 1. Uncomplete 2. Break fast with reason | status = broken; completedDays does not include today; hoursFasted set | completedDays still contains day; or two entries for same date |
| EC-BR-4 | Fast | **Break then “complete” same day** | today broken | 1. (If UI allows) mark complete after broken | Either blocked in UI or state ends consistent (e.g. completed overwrites broken) | Duplicate or inconsistent log; both completed and broken for same date |
| EC-BR-5 | Stats | **Total hours: completed + broken** | Mix of completed and broken entries with hoursFasted | 1. getTotalHoursFasted(progress) | Sum of hoursFasted for all entries that have it (completed + broken) | Only completed counted; broken hours 0; NaN from missing completedAt |

---

## 5. Overlapping logs & data integrity

| ID | Feature | Scenario | Inputs | Steps | Expected outcome | What could break |
|----|---------|----------|--------|-------|------------------|------------------|
| EC-OV-1 | Meals | **Multiple suhoor entries same day (same time)** | One day; add two suhoor items | 1. Add suhoor item A 2. Add suhoor item B same day | Both in day’s suhoor array; totals sum both; no overwrite | Only last saved; duplicate id collision; totals wrong |
| EC-OV-2 | Meals | **Same meal type, same day, different times** | suhoor at 04:00 and 04:30 | 1. Log suhoor 04:00 2. Log suhoor 04:30 | Both stored; display order stable (e.g. by time or order added) | One overwrites other; order random; UI shows one |
| EC-OV-3 | Meals | **Edit past day meal then view today** | Day D-1 has suhoor; today = D | 1. Select D-1 2. Edit suhoor 3. Switch to today | D-1 edit persisted; today unchanged; no cross-day leak | Edit applies to wrong day; today’s data overwritten |
| EC-OV-4 | Meals | **Delete only suhoor (or only iftar) for a day** | Day with suhoor + iftar | 1. Delete all suhoor items 2. Save / blur | Day has empty suhoor, iftar unchanged; totals recalc | Whole day cleared; iftar deleted; totals not updated |
| EC-OV-5 | Meals | **Delete last food log entry for a day** | Day with one food log entry | 1. Delete that entry | Day’s food log empty or removed from store; no crash; totals 0 | Orphan key; crash on empty array; day key missing causes error |
| EC-OV-6 | Journal | **Two saves same day (overwrite)** | One date; content A then content B | 1. Write content A, save 2. Write content B, save | Single entry per date; content = B; mood/gratitude as last saved | Two entries for same date; list/export duplicate; A shown |
| EC-OV-7 | Journal | **Edit past day journal then switch date** | Entry for D-1; switch to D | 1. Load D-1 2. Edit content 3. Save 4. Select D | D-1 updated; D loads its own or empty; no carry-over | D shows D-1 content; unsaved loss; wrong date in saved object |
| EC-OV-8 | Fast | **Two entries same date in fastingLog (legacy or bug)** | progress.fastingLog has two entries for same date | 1. getTodayFastingLog 2. completeFastingToday | Behaviour defined: e.g. use first or last; no duplicate in completedDays | Duplicate completedDays; crash; inconsistent status |
| EC-OV-9 | Fast + Meals | **Log meal for a day that is later marked skipped** | Day D: meal logged; then D marked skipped | 1. Add meal for D 2. Mark D as “I didn’t fast today” | Meal data unchanged; day shows skipped for fast; meals still visible on Schedule/Meals | Meals cleared; or fast state overwrites meal state |

---

## 6. Fast tracking – feature-level edge cases

| ID | Feature | Scenario | Inputs | Steps | Expected outcome | What could break |
|----|---------|----------|--------|-------|------------------|------------------|
| EC-F-1 | Fast | **Start fast twice same day (idempotent)** | today; no log | 1. Start fast 2. Start fast again | Single in_progress entry; second call no-op | Duplicate entries; UI shows “start” again |
| EC-F-2 | Fast | **Complete without starting** | today; no fastingLog entry | 1. Mark complete (e.g. setDayCompleted or complete flow) | completedDays gets today; fastingLog may get entry with startedAt ≈ completedAt (if completeFastingToday creates one) | No entry; hoursFasted undefined; crash in hoursBetween |
| EC-F-3 | Fast | **setDayCompleted(dateStr, true) for past day with no log** | dateStr = yesterday; no log for that day | 1. setDayCompleted(progress, setProgress, dateStr, true) | completedDays includes dateStr; no fastingLog entry required | Requires log entry; crash; or ignored |
| EC-F-4 | Fast | **Uncomplete then start again same day** | today completed | 1. Uncomplete 2. Start fast | status in_progress; not in completedDays; can later complete or break | completedDays still has today; double count in stats |
| EC-F-5 | Fast | **Display “today” = yesterday (todayOverride)** | todayOverride = yesterday’s date | 1. getTodayFastingLog(progress, todayOverride) 2. startFastingToday(..., todayOverride) | Operations use override date; no write to “actual” today | Override ignored; actual today modified |

---

## 7. Meals – feature-level edge cases

| ID | Feature | Scenario | Inputs | Steps | Expected outcome | What could break |
|----|---------|----------|--------|-------|------------------|------------------|
| EC-M-1 | Meals | **Add suhoor/iftar for future date** | selectedDate = tomorrow | 1. Select tomorrow 2. Add meal | Stored under tomorrow’s key; totals for that day | Blocked incorrectly; or stored under today |
| EC-M-2 | Meals | **Add suhoor/iftar for day with broken fast** | Day D with status broken | 1. Select D 2. Add meal | Meal saved; fasting state unchanged | Meal clears broken status; or UI hides meal form |
| EC-M-3 | Meals | **Meal plan note + food log same day** | Day D: meal plan text + food log entries | 1. Set meal plan note for D 2. Add food log for D 3. View Schedule | Both visible; totals from food log; plan and log independent | One overwrites other; totals ignore one source |
| EC-M-4 | Meals | **Normalize day food log: missing `between`** | foodLog[D] = { suhoor: [], iftar: [] } (no between) | 1. normalizeDayFoodLog(foodLog[D]) | Returns object with between = [] or defined | Crash; undefined between in iteration |
| EC-M-5 | Meals | **Zero / negative calories or portions** | calories 0; portions 0.5 | 1. Save entry 2. getDayTotalsFromFoodLog | Totals handle 0; portions respected | NaN; negative totals; portions ignored |
| EC-M-6 | Meals | **Delete meal plan note for day that has food log** | Day D: plan + log | 1. Clear meal plan note for D | Plan cleared; food log unchanged | Whole day cleared; or food log deleted |

---

## 8. Journal – feature-level edge cases

| ID | Feature | Scenario | Inputs | Steps | Expected outcome | What could break |
|----|---------|----------|--------|-------|------------------|------------------|
| EC-J-1 | Journal | **Save empty content** | content = "" | 1. Save | Either not saved or entry with empty content; no crash | Crash; or deletes entry; or invalid state |
| EC-J-2 | Journal | **getPromptForDate: same day-of-month, different months** | 2025-03-15 and 2025-04-15 | 1. getPromptForDate("2025-03-15") 2. getPromptForDate("2025-04-15") | Same prompt (day 15) | Different prompts; or month used in formula |
| EC-J-3 | Journal | **Mood/gratitude only, no main content** | content = ""; mood = 3; gratitude = "Family" | 1. Save | Entry saved with mood and gratitude; list/export show them | Rejected; or content required; loss on load |
| EC-J-4 | Journal | **Future date entry** | writeDate = next week | 1. Select date 2. Write and save | Entry stored under that date; allowed or soft warning | Blocked with wrong message; or stored as today |
| EC-J-5 | Journal | **Export with zero entries** | entries = [] | 1. Export journal | File with empty array or “no entries” message; no crash | Crash; malformed JSON |
| EC-J-6 | Journal | **Muslim vs non-Muslim prompt** | userType = "muslim" vs "new" | 1. getPromptForDate(date, "muslim") 2. getPromptForDate(date, "new") | Muslim: “suhoor vs iftar”; non-Muslim: “pre-dawn meal vs when you broke your fast” (or similar) | Same prompt for both; or wrong mapping |

---

## 9. Stats & progress – feature-level edge cases

| ID | Feature | Scenario | Inputs | Steps | Expected outcome | What could break |
|----|---------|----------|--------|-------|------------------|------------------|
| EC-S-1 | Stats | **Streak with gap (skipped in between)** | completedDays = [D1, D2, D4]; skippedDays = [D3] | 1. calculateStreak / getStreakDays | Streak = 1 (D4 only); D1–D2 is not continued past D3 | Streak = 3; or includes D3 |
| EC-S-2 | Stats | **Longest streak: non-consecutive completedDays** | completedDays = [D1, D2, D5, D6, D7] | 1. getLongestStreak(progress) | 3 (D5–D6–D7) | Returns 2 or 5; off-by-one |
| EC-S-3 | Stats | **Total hours: entry without completedAt** | fastingLog entry in_progress, no completedAt | 1. getTotalHoursFasted(progress) | That entry skipped or 0 for that entry; no NaN | NaN; crash; or wrong sum |
| EC-S-4 | Stats | **getBrokenFastDays order** | Multiple broken days | 1. getBrokenFastDays(progress) | Sorted, e.g. reverse chronological | Wrong order; duplicates |
| EC-S-5 | Stats | **Daily missions: today skipped** | today in skippedDays | 1. getDailyMissions({ ..., progress }) | “Start fasting” mission completed (skipped counts as “didn’t start / excused”) | Mission still incomplete; or wrong label |
| EC-S-6 | Stats | **Progress ring: completed + broken + skipped** | Mix of completed, broken, skipped | 1. Render progress ring / stats | Completed count; broken and skipped not in “completed”; no double count | All counted as completed; or ring > 30 |

---

## 10. Summary table for automation

Condensed table for test automation (ID, area, one-line scenario, priority).

| ID | Area | One-line scenario | Priority |
|----|------|-------------------|----------|
| EC-CAL-1 | Calendar | First day of Ramadan: correct day number and countdown | High |
| EC-CAL-2 | Calendar | Last day of Ramadan: day 29/30 and completion counts | High |
| EC-CAL-3 | Calendar | Ramadan spans two Gregorian years | High |
| EC-CAL-4 | Calendar | Day before/after Ramadan: no Ramadan day label | Medium |
| EC-CAL-5 | Calendar | Missing year in RAMADAN_START_BY_YEAR: fallback, no throw | Medium |
| EC-TZ-1 | Timezone | Display timezone: “today” and log align with TZ | High |
| EC-TZ-2 | Timezone | Midnight cross in display TZ: date flip, no duplicate log | High |
| EC-TZ-3 | Timezone | DST day: countdown and prayer times consistent | Medium |
| EC-TZ-4 | Timezone | Complete fast in different TZ: correct date and hours | High |
| EC-SKIP-1 | Skipped | Mark “I didn’t fast today”: skippedDays, UI | High |
| EC-SKIP-2 | Skipped | Clear/un-skip (if supported) | Low |
| EC-SKIP-3 | Skipped | Start fast then mark skipped: log cleared, skipped set | High |
| EC-SKIP-4 | Stats | Streak excludes skipped days | High |
| EC-SKIP-5 | Broken | Break with reason Travel | Medium |
| EC-SKIP-6 | Stats | Totals: completed vs broken vs skipped | High |
| EC-BR-1 | Broken | Break without having started | Medium |
| EC-BR-2 | Broken | Invalid reason id → fallback 'other' | Low |
| EC-BR-3 | Broken | Complete then uncomplete then break | Medium |
| EC-BR-4 | Broken | Break then complete (if allowed) | Low |
| EC-BR-5 | Stats | Total hours: completed + broken | High |
| EC-OV-1 | Meals | Multiple suhoor same day | Medium |
| EC-OV-2 | Meals | Same meal type, same day, different times | Medium |
| EC-OV-3 | Meals | Edit past day meal, switch to today | High |
| EC-OV-4 | Meals | Delete only suhoor for a day | Medium |
| EC-OV-5 | Meals | Delete last food log entry for a day | High |
| EC-OV-6 | Journal | Two saves same day (overwrite) | High |
| EC-OV-7 | Journal | Edit past day, switch date | High |
| EC-OV-8 | Fast | Duplicate fastingLog entries same date | Medium |
| EC-OV-9 | Fast+Meals | Meal logged then day marked skipped | Medium |
| EC-F-1 | Fast | Start fast twice: idempotent | High |
| EC-F-2 | Fast | Complete without starting | Medium |
| EC-F-3 | Fast | setDayCompleted for past day, no log | Medium |
| EC-F-4 | Fast | Uncomplete then start again | Medium |
| EC-F-5 | Fast | todayOverride: all ops use override date | High |
| EC-M-1 | Meals | Add meal for future date | Medium |
| EC-M-2 | Meals | Add meal on broken-fast day | Low |
| EC-M-3 | Meals | Meal plan + food log same day | High |
| EC-M-4 | Meals | normalizeDayFoodLog missing between | High |
| EC-M-5 | Meals | Zero/negative calories or portions | Medium |
| EC-M-6 | Meals | Delete meal plan, keep food log | Medium |
| EC-J-1 | Journal | Save empty content | Medium |
| EC-J-2 | Journal | Same day-of-month, different month: same prompt | Low |
| EC-J-3 | Journal | Mood/gratitude only | Low |
| EC-J-4 | Journal | Future date entry | Low |
| EC-J-5 | Journal | Export zero entries | Medium |
| EC-J-6 | Journal | Muslim vs non-Muslim prompt | Medium |
| EC-S-1 | Stats | Streak with skipped gap | High |
| EC-S-2 | Stats | Longest streak non-consecutive | High |
| EC-S-3 | Stats | Total hours with in_progress entry | High |
| EC-S-4 | Stats | getBrokenFastDays order | Low |
| EC-S-5 | Stats | Daily missions when today skipped | Medium |
| EC-S-6 | Stats | Progress ring: completed vs broken vs skipped | High |

---

## How to use this for automation

- **Unit tests:** Use IDs EC-F-*, EC-BR-*, EC-S-*, EC-J-2, EC-J-6, EC-M-4, EC-M-5, EC-CAL-*, EC-SKIP-4, EC-SKIP-6 with mocked `progress` / `mealPlans` / `entries`.
- **Integration tests:** Use EC-OV-*, EC-M-1, EC-M-3, EC-J-1, EC-J-3, EC-J-5 with real localStorage or test store.
- **E2E / manual:** Use EC-TZ-*, EC-CAL-1/2, EC-SKIP-1/3, EC-OV-3, EC-OV-7 with real browser and (optionally) mocked time/location.

Each row’s **Steps** and **Expected outcome** can be turned into `Given/When/Then` or `arrange/act/assert`; **What could break** helps choose assertions and failure messages.
