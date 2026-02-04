# UX: Microcopy and Empty States

> **Implementation status:** Done. All major empty states updated: stats dialogs, day detail, Journal (past, future-date prompt), Goals, GoalsUntilRamadanCard, Progress fasting tracker, Macros (planned/logged).

UX writer review of empty states across the Ramadan fasting/journal/meal dashboard. For each important empty state: **concise reassuring headline**, **one-sentence explanation in plain language**, and **primary CTA** into the main flow. Tone is **supportive and non-judgmental**, especially around missed fasts or gaps in tracking.

---

## 1. Empty states identified (with location)

| # | Location | Trigger | Current copy (summary) |
|---|----------|---------|------------------------|
| 1 | Dashboard → stats dialogs (streak / total / broken) | User clicks streak or total days; list is empty | "No days yet." |
| 2 | Dashboard → day detail → Journal | Selected day has no journal entry | "No entry for this day — Add in Journal" |
| 3 | Dashboard Journal → Past entries | No journal entries at all | "No entries yet. Pick a date above and write." |
| 4 | Dashboard Journal → editor | User picked a future date but has no today entry | "You're writing for a future date but haven't written for today yet." |
| 5 | Dashboard Goals | No goals added | "No goals yet. Add one above to get started." |
| 6 | Dashboard / Goals card (GoalsUntilRamadanCard) | No goals | "Set intentions before Ramadan..." + "Add or edit goals" |
| 7 | Progress → Fasting tracker | No fasts logged yet (recentLog empty) | "Log your fasts from the Dashboard or Today page." |
| 8 | Progress → first time (all stats zero) | 0 days completed, 0 streak, 0% — first visit | No dedicated block; page shows 0s |
| 9 | Progress → Badges | 0 badges earned | "0 of X badges earned" (no supportive empty block) |
| 10 | Macros → Meal prep plan | No planned items for selected day | "No planned items for this day. Use the form above to add." |
| 11 | Macros → Actual food eaten | No logged items for selected day | "No items logged for this day. Use quick add above." |
| 12 | Index / ProgressTracker (landing) | No streak yet | "No streak yet" |
| 13 | Dashboard Achievements | 0 badges earned | Summary "0 of X badges earned"; no dedicated empty message |

---

## 2. Draft copy by empty state

### 2.1 Dashboard — Stats dialogs (no streak / no total days / no broken days)

**Context:** User opens the "Day streak" or "Total days" or "Broken" dialog and the list of dates is empty.

| Element | Draft copy |
|---------|------------|
| **Headline** | You're all set to start |
| **Explanation** | When you log your first fast (start and then mark complete, or break with a reason), it will show up here. |
| **Primary CTA** | Go to Dashboard → [Link to Dashboard] or "Log today's fast" → Dashboard |

**Variants by dialog:**  
- **Streak:** "Your streak will build as you log consecutive days. Start with today."  
- **Total days:** "Completed days will appear here once you mark days complete from the Dashboard or Schedule."  
- **Broken:** "If you ever break a fast early, you can log it with a reason — it'll show here. No judgment."

**Tone:** Reassuring, forward-looking. No "you haven't" or "you need to."

---

### 2.2 Dashboard — Day detail: No journal entry for this day

**Context:** User is viewing a day in the Dashboard day panel; that day has no journal entry.

| Element | Draft copy |
|---------|------------|
| **Headline** | No entry for this day |
| **Explanation** | Add a quick note or reflection whenever you're ready — today, or any day. |
| **Primary CTA** | Add in Journal → [Link to /dashboard/journal] (pre-fill or suggest this date) |

**Tone:** Optional, low pressure. "Whenever you're ready" avoids guilt.

---

### 2.3 Dashboard Journal — No past entries (empty list)

**Context:** User is on Journal; "Past entries" list is empty.

| Element | Draft copy |
|---------|------------|
| **Headline** | Your journal is ready for you |
| **Explanation** | Write whenever it helps — a line or two about your day, mood, or gratitude is enough. |
| **Primary CTA** | Write your first entry → (focus date picker on today + scroll to editor, or button "Write for today") |

**Tone:** Inviting, not demanding. "A line or two" and "whenever it helps" reduce pressure.

---

### 2.4 Dashboard Journal — Writing for a future date, no today entry yet

**Context:** User selected a future date in the journal but hasn't written for today.

| Element | Draft copy |
|---------|------------|
| **Headline** | Want to start with today? |
| **Explanation** | Writing today first helps you keep a steady habit; you can add or edit any date anytime. |
| **Primary CTA** | Write for today → (switch date to today, focus editor) |

**Tone:** Gentle suggestion, not scolding. "Want to" and "helps you" keep it supportive.

---

### 2.5 Dashboard Goals — No goals

**Context:** User is on Goals page; no goals added.

| Element | Draft copy |
|---------|------------|
| **Headline** | Set intentions that matter to you |
| **Explanation** | Goals are optional — add one or two if you'd like a focus (e.g. read Quran, give charity, try new recipes). |
| **Primary CTA** | Add a goal → (focus add-goal input or open add flow) |

**Tone:** Optional, personal. "That matter to you" and "if you'd like" avoid obligation.

---

### 2.6 Dashboard / Goals card (GoalsUntilRamadanCard) — No goals

**Context:** Goals card on Dashboard or elsewhere; user hasn't set any goals.

| Element | Draft copy |
|---------|------------|
| **Headline** | Optional: set a few intentions |
| **Explanation** | Before or during Ramadan, you can add goals like reading Quran or giving charity — or skip and just track your fasts. |
| **Primary CTA** | Add or edit goals → [Link to /dashboard/goals] |

**Tone:** Clearly optional. "Or skip and just track your fasts" validates not using goals.

---

### 2.7 Progress — Fasting tracker (no fasts logged)

**Context:** Progress page; "Fasting tracker" section has no recent entries.

| Element | Draft copy |
|---------|------------|
| **Headline** | Your fasting log will show up here |
| **Explanation** | When you start a fast, break early, or mark a day complete on the Dashboard or Today page, it'll appear here. |
| **Primary CTA** | Log today's fast → [Link to /dashboard] or [Link to /dashboard/today] |

**Tone:** Informative, not guilt-inducing. "Will show up" is neutral and forward-looking.

---

### 2.8 Progress — First time (all stats zero)

**Context:** First visit to Progress; 0 days completed, 0 streak, 0% completion, no badges.

| Element | Draft copy |
|---------|------------|
| **Headline** | Your progress starts with your first log |
| **Explanation** | Once you log a fast (start and complete, or break with a reason), your stats and streak will fill in here. Every day you log counts. |
| **Primary CTA** | Go to Dashboard → [Link to /dashboard] |

**Tone:** Encouraging. "Starts with your first log" and "every day you log counts" are positive; no mention of "catching up" or "missing days."

---

### 2.9 Progress — Badges (0 earned)

**Context:** Achievements or Progress; 0 badges earned.

| Element | Draft copy |
|---------|------------|
| **Headline** | Badges unlock as you go |
| **Explanation** | Your first fast, first streak, and other milestones will earn badges here — no rush. |
| **Primary CTA** | See how to earn them → (scroll to locked badges / tooltips) or "Log your first fast" → [Link to /dashboard] |

**Tone:** Light, gamified but not pushy. "As you go" and "no rush" keep it low pressure.

---

### 2.10 Macros — No planned items for this day

**Context:** Macros page; selected day has no meal plan items.

| Element | Draft copy |
|---------|------------|
| **Headline** | No plan for this day yet |
| **Explanation** | Plan suhoor and iftar (or snacks) above if you want to hit calorie or macro targets — or skip and just log what you eat. |
| **Primary CTA** | Add planned items → (focus plan form / quick add) |

**Tone:** Optional. "If you want" and "or skip and just log" support both planners and simple loggers.

---

### 2.11 Macros — No logged items for this day

**Context:** Macros page; selected day has no food log entries.

| Element | Draft copy |
|---------|------------|
| **Headline** | Nothing logged for this day yet |
| **Explanation** | Quick-add what you ate for suhoor, iftar, or in between — rough estimates are fine. |
| **Primary CTA** | Log a meal → (focus Suhoor / Iftar / Between quick-add buttons) |

**Tone:** Simple and forgiving. "Rough estimates are fine" reduces perfectionism.

---

### 2.12 Index / ProgressTracker — No streak yet

**Context:** Landing page; progress preview shows 0 streak.

| Element | Draft copy |
|---------|------------|
| **Headline** | Your streak starts when you do |
| **Explanation** | Log your first fast and mark complete (or break with a reason); your streak will show here next time. |
| **Primary CTA** | Go to Dashboard → [Link to /dashboard] |

**Tone:** Encouraging. "When you do" puts user in control; no guilt for not having started.

---

### 2.13 Dashboard Achievements — 0 badges earned

**Context:** Achievements page; unlocked count is 0.

| Element | Draft copy |
|---------|------------|
| **Headline** | Your first badge is one fast away |
| **Explanation** | Complete or log your first fast to unlock badges; the rest unlock as you hit milestones. |
| **Primary CTA** | Log your first fast → [Link to /dashboard] |

**Tone:** Motivating, not shaming. "One fast away" is achievable and positive.

---

## 3. Missed fasts / gaps in tracking (tone guidance)

When the product shows **skipped days**, **broken fasts**, or **gaps** (e.g. no log for several days), copy should stay **supportive and non-judgmental**.

| Situation | Avoid | Prefer |
|-----------|--------|--------|
| User returns after days away | "You missed 5 days" / "Get back on track" | "Welcome back. You can log today or mark past days — whatever helps." |
| Broken fast (with or without reason) | "You broke your streak" / "Don't break again" | "You logged it. Excused reasons don't reset your streak." (Already in app.) |
| Skipped day | "You didn't fast" / "Missed day" | "You chose not to fast today — that's okay. Log it so we don't count it as a gap." |
| Empty streak / zero days | "No progress yet" / "Start now" | "Your progress starts with your first log." / "Your streak starts when you do." |
| Low completion rate | "Only X% complete" (as blame) | Show number neutrally; optional line: "Every day you log counts." |

**Principles:**  
- Normalize gaps: life happens; logging is for the user's benefit, not punishment.  
- Offer a next step (log today, mark skipped, or just continue) without demanding "catch-up."  
- Use "you can" / "whenever you're ready" / "if you'd like" for optional actions.

---

## 4. Summary table: headline + CTA by location

| Location | Headline | Primary CTA |
|----------|----------|-------------|
| Dashboard stats dialogs (empty list) | You're all set to start | Go to Dashboard / Log today's fast |
| Dashboard day detail — no journal | No entry for this day | Add in Journal |
| Journal — no past entries | Your journal is ready for you | Write your first entry |
| Journal — future date, no today | Want to start with today? | Write for today |
| Goals — no goals | Set intentions that matter to you | Add a goal |
| Goals card — no goals | Optional: set a few intentions | Add or edit goals |
| Progress — fasting tracker empty | Your fasting log will show up here | Log today's fast |
| Progress — first time (all zero) | Your progress starts with your first log | Go to Dashboard |
| Progress / Achievements — 0 badges | Badges unlock as you go / Your first badge is one fast away | Log your first fast |
| Macros — no plan | No plan for this day yet | Add planned items |
| Macros — no log | Nothing logged for this day yet | Log a meal |
| Index ProgressTracker | Your streak starts when you do | Go to Dashboard |

---

**Related docs:** `UX-FIRST-TIME-EXPERIENCE-REVIEW.md`, `FALL-OFF-AND-RETURN-FLOWS.md`, `STREAKS-STATS-GAMIFICATION-FLOWS.md`, `UX-NAVIGATION-IA-EVALUATION.md`.
