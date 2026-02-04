# UX: Ethical Social UX — Community Encouragement, Comparisons, Group Accountability

This document designs optional "community encouragement" features (sharing progress, dua reminders, gratitude journaling nudges); evaluates pros/cons of showing comparisons or streaks among friends; and drafts low-pressure UI for group features where users opt into gentle accountability without judgment.

**Related:** [UX-PRIVACY-COMFORT.md](./UX-PRIVACY-COMFORT.md), [UX-EMOTIONAL-EXPERIENCE-AND-LAPSES.md](./UX-EMOTIONAL-EXPERIENCE-AND-LAPSES.md).

---

## 1. Design: Optional "community encouragement" features

### 1.1 Guiding principles

| Principle | Application |
|-----------|-------------|
| **Opt-in only** | Every community feature is disabled by default. User explicitly enables. |
| **No judgment** | Language is supportive, not comparative. "You're part of a community" not "You're behind." |
| **Privacy-first** | Share only what user chooses; granular controls (e.g. share streak but not journal). |
| **Gentle nudge** | Reminders and prompts feel like invitations, not obligations. |

### 1.2 Feature: Sharing progress (opt-in)

**Concept:** User can share a snapshot of their progress (e.g. "15 days completed, mashallah") as a message or image for family/group chat — not as a live link or public post.

| Element | Design |
|---------|--------|
| **Trigger** | Settings → "Community & sharing" → "Share progress" toggle. Or optional "Share" button on Progress page after a milestone (e.g. first fast, week streak). |
| **What can be shared** | User chooses: (a) Streak only; (b) Total days; (c) "X days completed this Ramadan — mashallah"; (d) Custom message + optional stats. |
| **Format** | Copyable text (e.g. "15 days completed this Ramadan 🌙 mashallah") or generated image (card with stats, no sensitive data). |
| **Destination** | User copies to clipboard or shares via native share (WhatsApp, iMessage, etc.). No in-app feed or backend storage. |
| **Frequency** | User-initiated only. No auto-posting. |

**Copy examples:**
- "15 days completed this Ramadan — mashallah 🌙"
- "First fast complete! Starting my Ramadan journey."
- "Week streak — 7 days 🌙" (no "beat your friends" framing)

**Privacy:** Share button only appears when user has enabled "Allow sharing" in Settings. No data sent to server; share is client-side only.

---

### 1.3 Feature: Dua reminders (opt-in)

**Concept:** Gentle, scheduled reminders to make dua (supplication) — e.g. pre-iftar, post-iftar, or at a user-chosen time. Not a social feature per se but can feel "community" if framed as "Many Muslims are making dua at this moment."

| Element | Design |
|---------|--------|
| **Trigger** | Settings → "Reminders" → "Dua reminders" toggle. User chooses time(s): e.g. "15 min before iftar," "After Maghrib," or custom. |
| **Notification** | "A moment for dua — whenever you're ready." Optional: "Many are making dua at iftar right now." |
| **In-app** | Optional card on Dashboard (when in eating window, post-iftar): "A moment for gratitude and dua." Link to Journal or external dua resource. |
| **Tone** | Invitational, never obligatory. "When you're ready" not "You should pray now." |

**Accessibility:** User can disable; respects "App sounds" and notification settings. No social comparison.

---

### 1.4 Feature: Gratitude journaling nudges (opt-in)

**Concept:** Optional prompts to add a gratitude entry — e.g. "One thing you're grateful for today?" — at gentle times (post-iftar, evening).

| Element | Design |
|---------|--------|
| **Trigger** | Settings → "Reminders" → "Gratitude reminders" toggle. User chooses time (e.g. 21:00 or "1 hour after iftar"). |
| **Notification** | "One thing you're grateful for today? Add it when you're ready." |
| **In-app** | Journal already has gratitude field. Optional: Dashboard card "Add a gratitude" when no entry today, during evening window. |
| **Tone** | Question, not command. "Add it when you're ready" not "You haven't logged gratitude." |

**Privacy:** Gratitude is stored locally like other journal content. No sharing unless user explicitly exports.

---

### 1.5 Summary: Community encouragement (no social graph)

| Feature | Opt-in | What it does | Social? |
|---------|--------|--------------|---------|
| **Share progress** | Yes | User copies/shares text or image to external apps | No in-app social; user controls destination |
| **Dua reminders** | Yes | Notification at chosen time; optional Dashboard card | No; personal reminder |
| **Gratitude nudges** | Yes | Notification + optional Dashboard prompt | No; personal nudge |

All three are **personal** features that feel "community" in spirit (e.g. "Many are making dua") but do **not** require friends, groups, or server-side social graph.

---

## 2. Evaluate: Comparisons and streaks among friends

### 2.1 What "friends/streaks" could mean

| Model | Description | Example |
|-------|-------------|---------|
| **Leaderboard** | Ranked list by streak or total days | "You're #3 of 5" |
| **Side-by-side** | Show your streak vs friend's streak | "You: 7 | Sarah: 10" |
| **Anonymous aggregate** | "X people in your group completed today" | "5 of 8 completed today" |
| **Encouragement only** | See friends' achievements, no comparison | "Sarah completed her 10th fast — mashallah" |
| **Group streak** | Shared streak (resets if anyone misses) | "Group streak: 5 days" |

### 2.2 Pros of friend comparisons

| Pro | Rationale |
|-----|-----------|
| **Motivation** | Some users are motivated by friendly competition or "we're in this together." |
| **Accountability** | Knowing others see (or don't see) your progress can encourage consistency. |
| **Belonging** | "My friends are fasting too" reinforces community. |
| **Celebration** | Can celebrate friends' milestones ("Sarah hit 10 days — mashallah"). |

### 2.3 Cons and risks

| Risk | Rationale |
|-----|-----------|
| **Competition → guilt** | "I'm behind" or "I broke my streak" can amplify shame, especially for users with health exemptions or irregular schedules. |
| **Performance pressure** | Fasting is worship, not a game. Leaderboards can trivialize intention. |
| **Exclusion** | Users who can't fast (illness, travel, menstruation) may feel left out or judged. |
| **Privacy** | Exposing streak/completion to others may feel invasive. |
| **Addiction patterns** | Streak-focused UX can encourage unhealthy behavior to "not break the chain." |
| **Inauthenticity** | Users may fake logging to look good to friends. |

### 2.4 Recommendation

| Approach | Recommendation |
|----------|----------------|
| **Leaderboards** | **Avoid.** High risk of competition and guilt. |
| **Side-by-side streaks** | **Avoid.** Same risks. |
| **Anonymous aggregate** | **Consider cautiously.** "5 of 8 in your circle completed today" — no names, no ranking. Can feel supportive without direct comparison. |
| **Encouragement only** | **Prefer.** "Sarah completed her 10th fast — send encouragement?" (if user opts in). Celebrates others without comparing to self. |
| **Group streak** | **Avoid.** Punishes the group for one person's lapse; increases pressure and potential resentment. |

**Summary:** If any friend/group feature is added, favor **encouragement-only** (celebrate others, no self-comparison) and **anonymous aggregates** (e.g. "Your circle is 6/8 today") over rankings or direct streak comparisons.

---

## 3. Draft: Low-pressure UI for group features

### 3.1 Scope of "group"

**Minimal model:** User creates or joins a "circle" (e.g. family, mosque group, friends). Circle is opt-in. No leaderboard; no direct comparisons. Focus: gentle accountability and encouragement.

### 3.2 Opt-in flow

| Step | UI | Copy |
|------|-----|------|
| 1 | **Settings → Community** | "Community & sharing" section. Subtext: "Optional. Stay private by default." |
| 2 | **Enable community** | Toggle "Join or create a circle." Off by default. |
| 3 | **Create or join** | "Create a circle" (invite link) or "Join with code/link." |
| 4 | **What to share** | Checkboxes: "Share that I completed today" (yes/no), "Share streak" (yes/no), "Share total days" (yes/no). Default: only "completed today" (boolean), not streak or total. |
| 5 | **Confirm** | "Your circle will see that you completed today (when you mark complete). They won't see your streak, journal, or meals unless you choose." |

**Principles:**
- Default to minimum sharing. "Completed today" is a simple yes/no; no numbers unless user opts in.
- Explicit consent before any data is shared.
- User can leave circle anytime; data shared is revocable.

### 3.3 What circle members see (low-pressure)

| View | Content | Tone |
|------|---------|------|
| **Circle feed** | "Aisha completed today 🌙" / "Omar completed today 🌙" — no streak, no ranking | Celebratory, not comparative |
| **Optional:** "Today's circle" | "6 of 8 completed today" — anonymous count | "We're in this together" |
| **No:** "You're behind" / "Catch up" | Never | — |
| **No:** Leaderboard, streaks, rankings | Never | — |

### 3.4 Encouragement actions (opt-in)

| Action | UI | Copy |
|--------|-----|------|
| **Send encouragement** | Tap on "Aisha completed today" → "Send encouragement" → optional preset: "Mashallah 🌙" or custom short message | Gentle, positive only |
| **Receive encouragement** | Notification or in-app: "Omar sent you encouragement: Mashallah 🌙" | No pressure to reply |
| **Dua for circle** | Optional: "Make dua for your circle" — opens a simple prompt or links to a duas resource | Invitational |

### 3.5 Accountability without judgment

| Principle | Implementation |
|-----------|----------------|
| **No "you missed"** | Circle feed never shows "Aisha didn't complete today." Only positive updates (completed). |
| **No reminders from circle** | No "Your circle is waiting" or "Don't let them down." |
| **Optional check-in** | User can optionally turn on "Gentle check-in" — once per day, if they haven't logged: "Your circle is here if you need support." Not "You haven't logged." |
| **Leave anytime** | "Leave circle" in Settings. No explanation required. Data shared is deleted from circle view. |

### 3.6 UI sketches (low-fidelity)

**Settings → Community**
```
┌─────────────────────────────────────────┐
│ Community & sharing                     │
│ Optional. Your data stays private       │
│ unless you choose to share.             │
├─────────────────────────────────────────┤
│ ○ Join or create a circle     [Toggle]  │
│   When on, you can share completion     │
│   with family or friends.               │
├─────────────────────────────────────────┤
│ Share progress (copy/send)    [Toggle]  │
│   Share stats as text or image to       │
│   apps you choose.                      │
├─────────────────────────────────────────┤
│ Dua reminders               [Toggle]    │
│ Gratitude reminders         [Toggle]    │
└─────────────────────────────────────────┘
```

**Circle feed (when in a circle)**
```
┌─────────────────────────────────────────┐
│ Your circle                             │
│ 6 of 8 completed today 🌙               │
│ (anonymous count)                       │
├─────────────────────────────────────────┤
│ Aisha completed today 🌙                │
│ [Send encouragement]                    │
├─────────────────────────────────────────┤
│ Omar completed today 🌙                 │
│ [Send encouragement]                    │
├─────────────────────────────────────────┤
│ You completed today ✓                   │
└─────────────────────────────────────────┘
```

**No judgment empty state**
```
┌─────────────────────────────────────────┐
│ You haven't logged today yet.           │
│ That's okay — your circle is here       │
│ when you're ready.                      │
│ [Log now]  [Maybe later]                │
└─────────────────────────────────────────┘
```

---

## 4. Implementation considerations

### 4.1 Backend requirements

| Feature | Backend needed? | Notes |
|---------|-----------------|-------|
| **Share progress** | No | Client-side only; user copies/shares. |
| **Dua reminders** | No | Uses existing notification infra. |
| **Gratitude nudges** | No | Same. |
| **Circle / group** | Yes | Requires backend: circle creation, join codes, member list, completion sync. Out of scope for current local-only app. |

**Recommendation:** Implement share progress, dua reminders, and gratitude nudges first (no backend). Circle/group features require product decision and backend work; document serves as design spec for when/if that's pursued.

### 4.2 Privacy checklist for any social feature

- [ ] Opt-in only; default off
- [ ] Granular share controls (what to share)
- [ ] No "you're behind" or comparative guilt language
- [ ] User can revoke/leave anytime
- [ ] Data minimization — share only what's necessary
- [ ] Clear disclosure: "Who can see this?"

---

## 5. Summary

| Area | Recommendation |
|------|----------------|
| **Community encouragement** | Share progress (copy/image to external apps), dua reminders, gratitude nudges — all opt-in, no backend. |
| **Comparisons among friends** | Avoid leaderboards, side-by-side streaks, group streaks. Prefer encouragement-only (celebrate others) and anonymous aggregates ("6 of 8 completed today"). |
| **Group UI** | Low-pressure: circle feed shows completions only (no "missed"); no reminders like "your circle is waiting"; optional "Send encouragement"; leave anytime. |
| **Tone** | Supportive, invitational, no judgment. "Your circle is here when you're ready" not "You haven't logged." |

Implementing share progress, dua reminders, and gratitude nudges aligns with ethical community encouragement; any future circle/group feature should follow the low-pressure, opt-in, no-comparison design above.
