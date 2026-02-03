# Bug Report Format and Checklist

Senior QA standard for writing clear, actionable bug reports. Use this when rewriting raw reports or when filing new ones.

---

## 1. Clean bug report template

Copy the template below and fill it in. Replace placeholder text; delete "N/A" sections only if truly not applicable.

```markdown
## Title
[Precise symptom] when [context / trigger / screen]. (e.g. "Dashboard shows wrong streak count when returning from Settings after toggling excused day")

## Environment
| Field     | Value |
|----------|--------|
| Device   | e.g. iPhone 14, Pixel 7, MacBook M1 |
| OS       | e.g. iOS 17.2, Android 14, macOS 14 |
| Browser  | e.g. Safari 17, Chrome 121, in-app WebView |
| App build | e.g. Try Ramadan v1.2.0 (web), build 42 (native) |
| URL / env | e.g. https://tryramadan.app, localhost:5173, staging |

## Reproduction steps
1. [First action; be specific, e.g. "Open Dashboard with at least one completed fast."]
2. [Second action.]
3. [Action that triggers the bug.]
4. [Any follow-up that makes the issue visible.]

## Expected result
[What should happen according to design/spec/user expectation.]

## Actual result
[What actually happens. Include exact copy, numbers, or UI state if relevant.]

## Additional context (if any)
- **Screenshots / screen recording:** [link or attach]
- **Console/network logs:** [paste or link]
- **User state:** e.g. first-time user, has historical data, specific preferences
- **Data sample:** e.g. date range, location, or anonymized IDs if needed

## Missing information (blockers for dev)
- [ ] [List anything that would block fix: e.g. "No console logs — cannot confirm if error is client or API."]
```

---

## 2. Rewriting a raw report: what to do

| Raw report often has… | Turn it into… |
|----------------------|----------------|
| Vague title ("Bug in dashboard") | **Precise title:** symptom + context (e.g. "Streak resets to 0 on Dashboard after marking a day excused") |
| No environment | **Environment** table: device, OS, browser, build/version, URL or env |
| Paragraph of steps | **Numbered reproduction steps** (1, 2, 3…) that a dev can follow exactly |
| Only "it's broken" | **Expected vs actual:** one clear sentence each; use exact UI text or values when possible |
| Screenshots with no explanation | **Additional context:** short caption (e.g. "State after step 3") and note what to look at |
| Nothing about gaps | **Missing information:** explicit list of what would block a fix (logs, role, data, timestamp) |

---

## 3. Missing information that blocks developers

Call these out in a **Missing information** section so the assignee can request them or you can follow up.

| If this is missing… | Why it blocks |
|--------------------|----------------|
| **Device / OS / browser / build** | Bug may be environment-specific; repro might differ. |
| **Exact build or version** | "Latest" is ambiguous; regressions need a known good version. |
| **Numbered steps** | Devs need a repeatable path; narrative is harder to follow. |
| **Expected vs actual** | Without both, it’s unclear whether it’s a bug or a spec/UX disagreement. |
| **Console/network errors** | Hard to tell if frontend, backend, or third-party; logs often point to the layer. |
| **Timestamp / timezone** | Critical for date/time or Ramadan logic bugs. |
| **User role or state** | e.g. first login vs returning user, or specific preferences (e.g. streak toggle off). |
| **Data sample (anonymized)** | For calculation bugs (e.g. streak, Ramadan dates), sample inputs and expected output. |
| **Screenshot of the exact moment** | Without it, "the screen was wrong" is ambiguous. |
| **One-off vs reproducible** | "Happened once" vs "every time" changes priority and approach. |

---

## 4. Checklist for writing future bugs

Use this before submitting or sending a bug report.

**Title**
- [ ] Describes the **symptom** (what’s wrong) and **context** (where / when it happens)?
- [ ] Specific enough to search for and triage (no "Bug" or "Issue")?

**Environment**
- [ ] Device and OS specified?
- [ ] Browser (and version if known)?
- [ ] App build or version?
- [ ] URL or environment (prod / staging / local)?

**Reproduction**
- [ ] Steps are **numbered** and **ordered**?
- [ ] Each step is **concrete** (action a dev can repeat)?
- [ ] Minimal steps (no unnecessary actions)?

**Expected vs actual**
- [ ] **Expected:** one clear sentence (or bullet list) for correct behavior?
- [ ] **Actual:** one clear sentence (or bullet list) for what happens instead?
- [ ] Exact UI text, numbers, or state included where it helps?

**Evidence and context**
- [ ] Screenshot(s) or recording attached and **briefly described**?
- [ ] Console/network logs included if relevant (errors, failed requests)?
- [ ] User state noted if it matters (e.g. first time, has data, specific settings)?

**Blockers**
- [ ] "Missing information" section filled in with anything that would **block a fix** (logs, data, role, timestamp)?
- [ ] Noted if repro is intermittent?

---

## 5. Example: raw → clean

**Raw (incoming):**
> "The streak is wrong. I had 5 days then I went to settings and did something and now it says 0. I have a screenshot. Using Chrome."

**Clean (rewritten):**

**Title:** Dashboard shows streak 0 after changing "Show streak and achievements" in Settings (Chrome).

**Environment**

| Field     | Value        |
|----------|--------------|
| Device   | MacBook Pro M1 |
| OS       | macOS 14.2.1   |
| Browser  | Chrome 121.0  |
| App build| Try Ramadan web, main branch, localhost:5173 |

**Reproduction steps**
1. Open app with at least 5 consecutive days of completed fasts (streak shows "5" on Dashboard).
2. Go to **Settings**.
3. Turn **Off** "Show streak and achievements", then turn it back **On**.
4. Return to **Dashboard**.

**Expected result**  
Dashboard still shows current streak (e.g. 5).

**Actual result**  
Dashboard shows streak **0**.

**Additional context**
- Screenshot: [attach] — Dashboard after step 4.
- Reproducible every time on this build.

**Missing information**
- [ ] No console errors captured — would help confirm if state is cleared on toggle or only display is wrong.
- [ ] Not yet tested on Safari or production build.

**Resolution (implementation)**  
Root cause: streak was computed using device-local "today" while the Dashboard uses display-timezone "today". With a location timezone set, the two could differ (e.g. already "next day" in location), so the streak ended on the wrong day and showed 0. Fix: `getStreakDays` / `calculateStreak` now accept an optional `todayOverride`; Dashboard, Progress, Settings, and Achievements pass the same "today" used elsewhere (display timezone when set).

---

## 6. Quick reference: one-paragraph rule

**A developer should be able to:**
1. **Find** the bug (searchable, precise title).
2. **Reproduce** it (environment + numbered steps).
3. **Decide** if it’s wrong (expected vs actual).
4. **Investigate** (logs/data/screenshots; missing info called out).
5. **Triage** (environment and reproducibility noted).

Keep the report as short as possible while satisfying these five goals.

---

## 7. Bug-derived test naming (regression tests)

When converting a bug report into regression tests, use a consistent naming scheme so tests are traceable to the original bug.

**Convention**

| Element | Format | Example |
|--------|--------|---------|
| **Describe block** | `Regression: BUG-<AREA>-<ID> (<short title>)` | `Regression: BUG-STRK-001 (streak 0 after Settings / display timezone)` |
| **Individual test** | `BUG-<AREA>-<ID>.<sub>.: <behavior>` | `BUG-STRK-001.1: streak uses todayOverride so display-timezone today matches Dashboard` |

**Area codes (examples):** STRK = streak, CAL = calendar/Ramadan, NAV = navigation, SET = Settings, OFF = offline, A11Y = accessibility.

**Rules**

- One describe per bug; use the bug ID (or internal ID like STRK-001) in the describe and in each test name.
- Number sub-tests .1, .2, .3 for multiple assertions/flows that would all detect the same bug.
- Keep test names short but searchable (e.g. grep for `BUG-STRK-001` finds the whole regression set).
- Reference the clean bug report or ticket in a comment above the describe (e.g. "See Example §5" or ticket link).
