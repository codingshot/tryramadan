# UX: Today View — Mental Model, Mismatches, Re-ordered Layout

This document maps the user's mental model for "What's happening with my fast today?", compares it to the current UI emphasis, identifies mismatches and clutter, and proposes a re-ordered layout and microcopy so users can answer three questions in under 10 seconds.

**Related:** [DashboardToday.tsx](../src/pages/DashboardToday.tsx).

---

## 1. User's mental model vs. UI emphasis

### 1.1 The three questions (under 10 seconds)

| Question | User needs | Current UI emphasis |
|----------|------------|---------------------|
| **Am I fasting today?** | Clear status: fasting / completed / skipped / broken | Status card under "Today's fast" (h3, muted). Competes with FastingTimer. |
| **When is Suhoor over and Iftar?** | One line or two: key times at a glance | **Repeated 3×:** FastingTimer, dual countdown cards, progress bar. User must scan. |
| **What is the next best action?** | One obvious CTA: Mark complete / Break fast / Log suhoor / Log iftar | Mark complete / Break fast in status card; Log meals **not on Today** — user must leave. |

### 1.2 Current layout order (top to bottom)

1. Back link
2. Header: "Today's Fast" + subtext
3. **Status card** — completed / skipped / broken / [buttons]
4. **FastingTimer** — main countdown (Iftar or Suhoor)
5. **Dual countdown** — Suhoor end + Iftar (countdown or time)
6. **Progress bar** — % + Suhoor/Iftar times (again) + location badge
7. **Today's intention** — textarea
8. **Energy check-in** — 5 emoji buttons + feedback
9. **Hydration** — goal, progress, quick-add
10. **Quick Stats** — hydration goal, days completed (redundant)
11. **Emergency** — break fast CTA

### 1.3 Emphasis vs. mental model

| Element | Current emphasis | Mental-model priority |
|---------|------------------|------------------------|
| "Today's Fast" (h1) | High (page title) | Fine; could be more actionable |
| Status ("You fasted today ✓") | Medium (in card) | **Should be hero** — answers "Am I fasting?" |
| FastingTimer | High (large countdown) | Good — answers "When?" but duplicates |
| Dual countdown | Medium (2 cards) | **Redundant** with FastingTimer + progress bar |
| Progress bar | Medium (with times again) | **Redundant** — times 3rd time |
| Primary CTA (Mark complete / Break fast) | Medium (in status card) | **Should be obvious** — answers "What next?" |
| Intention | Medium | Lower — optional |
| Energy | High (5 large buttons) | Lower for "10-second scan" |
| Hydration | High | Lower for "10-second scan" |
| Log suhoor / Log iftar | **Missing** | **Critical** — next action when in eating window |
| Emergency | Low (bottom) | Keep accessible but not hero |

---

## 2. Mismatches and clutter

### 2.1 Repeated information

| Info | Shown in | Issue |
|------|----------|-------|
| **Suhoor end time** | FastingTimer (context), dual countdown, progress bar | 3 places; user scans multiple blocks |
| **Iftar time** | FastingTimer, dual countdown, progress bar | Same |
| **Countdown to Iftar/Suhoor** | FastingTimer + dual countdown | Overlap; dual cards add noise when FastingTimer already shows the active countdown |
| **Hydration goal** | Hydration card + Quick Stats | Redundant |

### 2.2 Unclear or competing controls

| Issue | Detail |
|-------|--------|
| **Two "Break fast" entry points** | Status card "I broke my fast" + bottom "Need to Break Fast Early?" — same action, different framing. Emergency is for reassurance + link; status is for logging. Can confuse. |
| **Status vs. Timer** | Both compete for "what's happening?" — status is state; timer is countdown. Should be unified hero. |
| **Primary CTA not always visible** | When fasting: Mark complete + Break fast. When eating: No "Log suhoor" — user must go to Schedule/Meals. |

### 2.3 Hidden critical actions

| Action | Where it lives | Issue |
|--------|----------------|-------|
| **Log suhoor** | Schedule, Meals, Dashboard day plan | Not on Today. Pre-dawn user on Today can't log meal. |
| **Log iftar** | Same | Post-iftar user on Today can't log meal. |
| **Add reflection** | Journal | Not on Today. Acceptable if Today focuses on fast only. |

---

## 3. Proposed re-ordered layout (wireframe level)

### 3.1 Hierarchy principle

**Hero block:** Answer "Am I fasting?" + "When?" + "What next?" in one glance.

**Supporting:** Intention, energy, hydration — collapsed or below fold.

**Emergency:** Accessible but not competing with primary flow.

### 3.2 Proposed order

```
┌─────────────────────────────────────────────────────────────────┐
│ [Back to Dashboard]                                              │
├─────────────────────────────────────────────────────────────────┤
│ HERO                                                             │
│                                                                  │
│ [Status line — largest]                                          │
│ "Fasting" | "Done ✓" | "Rest day" | "Ended early"                │
│                                                                  │
│ [Key times — single line]                                        │
│ Suhoor ends 05:30 · Iftar 18:45                                  │
│                                                                  │
│ [Active countdown — one only]                                    │
│ "2h 14m until Iftar"  OR  "45m until Suhoor ends"                │
│                                                                  │
│ [Primary CTA — one clear button]                                 │
│ "Mark complete" | "Break fast" | "Log suhoor" | "Log iftar"      │
│ (Context-dependent; see below)                                   │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│ PROGRESS (compact)                                               │
│ [=====>          ] 47%  Dawn ————————————————— Iftar             │
│ [Location badge if set]                                          │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│ TODAY'S INTENTION (collapsible)                                  │
│ "e.g. Patience, gratitude, or a small act of kindness"           │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│ HOW ARE YOU FEELING? (compact)                                   │
│ [😴] [😕] [😐] [😊] [💪]  1–5                                    │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│ HYDRATION (collapsible when fasting)                             │
│ 1.2L / 2L · [Quick add during eating window]                     │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│ EMERGENCY                                                        │
│ [Need to break fast early?]                                      │
└─────────────────────────────────────────────────────────────────┘
```

### 3.3 Primary CTA logic (context-dependent)

| Context | Primary CTA |
|---------|-------------|
| Fasting, post-iftar | **Mark complete** |
| Fasting, pre-iftar | **Break fast** (secondary) — Mark complete appears after Maghrib |
| Eating window, before suhoor end | **Log suhoor** (links to Schedule/Meals for today) |
| Eating window, after iftar | **Log iftar** (links to Schedule/Meals for today) |
| Completed today | **Log iftar** or **Add reflection** (if not logged) — or nothing |
| Skipped / Broken | No primary CTA (or "Add reflection" as optional) |

### 3.4 Microcopy changes

| Current | Proposed | Rationale |
|---------|----------|-----------|
| "Today's Fast" (h1) | "Today" or "Today's Fast" | Keep; OK |
| "Today's fast" (status card) | Remove; use status as hero | Avoid redundancy |
| "You fasted today ✓" | "Done ✓" or "Fasted today ✓" | Shorter; scan faster |
| "You didn't fast today" | "Rest day" | Softer |
| "You broke your fast today" | "Ended early" | Softer (per UX-EMOTIONAL doc) |
| "I fasted today — mark complete" | "Mark complete" | Shorter |
| "Until Suhoor end" / "Until Iftar" | Merge into one line: "Suhoor ends 05:30 · Iftar 18:45" | Single scan |
| "Track your current fast and monitor how you're feeling" | Remove or shorten: "Your fast at a glance" | Less noise |
| Dual countdown cards | Remove | Consolidate into hero |
| Progress bar label "Fasting Progress" | "Progress" or inline with bar | Shorter |
| Quick Stats (hydration goal, days) | Remove or merge into Hydration | Reduce clutter |

### 3.5 Removed / consolidated

| Remove | Rationale |
|--------|-----------|
| **Dual countdown cards** | FastingTimer + one key-times line is enough |
| **Quick Stats** (hydration goal, days completed) | Hydration card has goal; days completed is secondary — could be small badge in header |
| **Repeated Suhoor/Iftar times in progress bar** | Keep times in hero only; progress bar can show just the bar + % |

### 3.6 Added

| Add | Placement | Rationale |
|-----|-----------|-----------|
| **Log suhoor** CTA | Hero, when in eating window before suhoor end | Critical next action; currently missing |
| **Log iftar** CTA | Hero, when post-iftar and not yet logged | Same |
| **Key times line** | Hero, single line | "Suhoor ends 05:30 · Iftar 18:45" — one scan |

---

## 4. Summary

| Question | Current | Proposed |
|----------|---------|----------|
| **Am I fasting today?** | Status in card under muted h3 | **Hero status line** — "Fasting" / "Done ✓" / "Rest day" / "Ended early" |
| **When is Suhoor over and Iftar?** | 3 places (Timer, dual cards, progress bar) | **One line:** "Suhoor ends 05:30 · Iftar 18:45" + single countdown |
| **What is the next best action?** | Mark complete / Break fast in card; Log meals absent | **One primary CTA** — Mark complete / Break fast / Log suhoor / Log iftar (context-dependent) |

**Reorder:** Hero (status + times + countdown + CTA) → Progress (compact) → Intention (collapsible) → Energy (compact) → Hydration (collapsible when fasting) → Emergency.

**Reduce:** Remove dual countdown cards, Quick Stats; consolidate times into one line.

**Add:** Log suhoor / Log iftar in hero when relevant.
