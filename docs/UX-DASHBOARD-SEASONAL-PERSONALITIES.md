# Dashboard Seasonal Personalities: Pre-Ramadan & Post-Ramadan

This document designs how `/dashboard` should change outside Ramadan, using the multi-year calendar and Sunnah fasting features. It covers Pre-Ramadan season, Post-Ramadan season, feature prioritization, and visual/copy shifts so users always know where they are in the year.

**Related:** [UX-BEYOND-RAMADAN-RETENTION.md](./UX-BEYOND-RAMADAN-RETENTION.md), [ramadan.ts](../src/lib/ramadan.ts).

---

## 1. Season detection

Proposed helper in `ramadan.ts`:

| Season | Condition | Approx. duration |
|--------|-----------|------------------|
| **Ramadan** | `isCurrentlyRamadan()` | ~30 days |
| **Eid** | 1–3 days after Ramadan end | 3 days |
| **Post-Ramadan** | 4–60 days after Ramadan end | ~2 months |
| **Rest** | Rest of year (excl. pre-Ramadan) | ~9 months |
| **Pre-Ramadan** | 1–30 days before Ramadan start | 30 days |

```ts
// Suggested: getSeason(): 'ramadan' | 'eid' | 'post-ramadan' | 'rest' | 'pre-ramadan'
export function getDaysSinceRamadanEnd(): number { ... }
export function getSeason(): 'ramadan' | 'eid' | 'post-ramadan' | 'rest' | 'pre-ramadan'
```

---

## 2. Pre-Ramadan season (1–30 days before)

### 2.1 Dashboard changes

| Section | Behavior |
|---------|----------|
| **Header greeting** | "Looking forward to Ramadan" (already exists for Muslim mode) → Keep; add subtitle: "X days to go" |
| **Top badge** | "X days until Ramadan" (already exists) → Make more prominent; optional: show exact date on hover |
| **Current Fast Status card** | **Fade back** — show only when it's a Sunnah day (Mon/Thu). Otherwise: compact card "No fasting today. Ramadan starts in X days." with link to Schedule for pre-Ramadan planning |
| **Iftar countdown** | **Hide** (not fasting). Show: "Next Sunnah day: Monday" or "Ramadan starts March 1" |
| **Goals until Ramadan** | **Promote** — move up; make primary CTA. Show countdown + checklist (read Quran, set intentions, add to calendar) |
| **Daily Ramadan fact** | **Reframe** — "Prepare for Ramadan" or "Ramadan prep tip" (same content, different framing) |
| **Learning** | **Promote** — "Get ready: learn about Ramadan" card with link to Learn, Glossary, Guides |
| **Schedule** | Keep; emphasize "Add Ramadan to calendar" and Sunnah days |
| **Journal, Culture, Macros** | Stay active (see §4) |
| **Prayer times** | Stay visible (Muslim mode) — "Your prayer times for Ramadan will use this location" |

### 2.2 Copy shifts

- Badge: **"X days until Ramadan"** (existing)
- Subtitle under header: **"Prepare your heart and schedule"**
- Empty state for fast card: **"No fasting today. Use the countdown above to plan."**
- Goals card title: **"Goals until Ramadan"** (existing) — ensure it's above the fold

---

## 3. Post-Ramadan season (Eid + ~2 months)

### 3.1 Dashboard changes

| Section | Eid (1–3 days) | Post-Ramadan (4–60 days) |
|---------|----------------|---------------------------|
| **Header greeting** | "Eid Mubarak!" | "Your journey continues" or "Beyond Ramadan" |
| **Top badge** | "Ramadan complete · Eid Mubarak" | "X days since Ramadan" (optional) or "Next Ramadan in ~X months" |
| **Current Fast Status card** | **Fade back** — replace with "Eid Mubarak! How was your month?" → One-tap mood + gratitude (Eid recap) | Same as rest: show only on Sunnah days; else "No fasting today" with "Next Sunnah: Mon" |
| **Iftar countdown** | **Hide** | **Hide** (unless Sunnah fasting today) |
| **Goals until Ramadan** | **Transform** → "Reflect on Ramadan" card: mood + gratitude + "Keep the habit" | **Fade back** — Replace with "Reflect today" or "Sunnah fasting" focus |
| **Daily Ramadan fact** | **Replace** → "One last reflection for the month?" (Eid recap CTA) | **Replace** → "Daily reflection" or "Gratitude" prompt |
| **Reflection / Journal** | **Promote** — "How did Ramadan feel?" primary CTA | **Promote** — "Reflect today" as primary quick action |
| **Sunnah fasting** | **Promote** — "Track voluntary fasts (Mon/Thu)?" one-time prompt | **Stay active** — Sunnah badge, "Next Sunnah: Mon," [I fasted] on Sunnah days |
| **Voluntary fasts** | Prompt: "Would you like to track Sunnah fasts?" | Visible in Schedule; dashboard shows Sunnah card when enabled |
| **Progress** | Show Ramadan recap: "You completed X of 30 days" | Show gratitude streak, Sunnah days, journal streak |
| **Culture, Macros, Learn** | Stay active (see §4) |

### 3.2 Copy shifts

- **Eid:** "Eid Mubarak! One last reflection for the month?"
- **Post-Ramadan:** "Your journey continues" / "Beyond Ramadan"
- **Sunnah card:** "Today is a Sunnah fasting day — no pressure, just a reminder."
- **Reflection CTA:** "Reflect today" (replaces "I'm fasting" as primary when not Ramadan)

---

## 4. Feature prioritization: fade back vs stay active

### 4.1 Fade back (outside Ramadan, unless Sunnah day)

| Feature | When to fade | Replacement / fallback |
|---------|--------------|------------------------|
| **Iftar countdown** | Always when not fasting (rest, pre-Ramadan, post-Ramadan) | Show "Next Sunnah day" or "Ramadan in X days" |
| **Suhoor countdown** | Same | Same |
| **"I'm fasting" / "Break fast" primary CTA** | When not Ramadan and not Sunnah day | "Reflect today" or "Next Sunnah: Mon" |
| **Ramadan progress ring** (X of 30) | Post-Ramadan | Replace with "Gratitude streak" or "Sunnah days" or keep as "Last Ramadan: X/30" (read-only) |
| **Daily Ramadan fact** | Post-Ramadan | "Daily reflection" or "Gratitude" tip |
| **Goals until Ramadan** | Post-Ramadan | "Reflect today" / Sunnah goals |

### 4.2 Stay active (year-round)

| Feature | Notes |
|---------|-------|
| **Journal** | Always available; promote as primary CTA when not Ramadan |
| **Culture** | Recipes, country info — evergreen |
| **Macros** | If user enabled — useful for any fasting or mindful eating |
| **Sunnah fasting** | Mon/Thu, Ayyam al-Beed — core for post-Ramadan retention |
| **Prayer times** | Muslim mode — always relevant |
| **Schedule** | Multi-year calendar; show Sunnah days, past Ramadan, next Ramadan |
| **Learn / Glossary** | Evergreen education |
| **Quick access grid** | Same links; order can shift (Reflect, Journal, Sunnah higher when not Ramadan) |

### 4.3 Conditional visibility

| Feature | Ramadan | Pre-Ramadan | Eid | Post-Ramadan | Rest |
|---------|---------|-------------|-----|--------------|------|
| Iftar countdown | ✓ primary | ✗ | ✗ | ✗ | ✗ |
| Goals until Ramadan | ✓ | ✓ primary | → Reflect | ✗ | ✗ |
| Sunnah badge | (redundant) | ✓ | ✓ | ✓ primary | ✓ |
| Reflect / Mood CTA | secondary | secondary | ✓ primary | ✓ primary | ✓ |
| Daily fact | ✓ | ✓ (reframed) | → Eid recap | → Reflection | → Reflection |

---

## 5. Visual & copy shifts for "where am I" clarity

### 5.1 At-a-glance indicators (no reading required)

| Season | Visual cue | Location |
|--------|------------|----------|
| **Ramadan** | Crescent/moon badge; "Day X of Ramadan"; green primary | Header badge, Fast card |
| **Pre-Ramadan** | Countdown number; muted/gray badge "X days until Ramadan" | Header badge |
| **Eid** | "Eid Mubarak" badge; optional festive accent (gold/green) | Header badge, card |
| **Post-Ramadan** | "Your journey continues"; Sunnah badge on Mon/Thu | Header, Sunnah card |
| **Rest** | "X days until Ramadan" (small); Sunnah badge on Mon/Thu | Header badge |

### 5.2 Header badge logic (one-line "you are here")

```
Ramadan     → "Day 15 of Ramadan"
Pre-Ramadan → "23 days until Ramadan"
Eid         → "Eid Mubarak"
Post-Ramadan→ "Your journey continues" (+ "Next Sunnah: Mon" on non-Sunnah days)
Rest        → "147 days until Ramadan" or "Next Sunnah: Monday"
Sunnah day  → "Sunnah fasting day · Monday"
```

### 5.3 Color / accent shifts

| Season | Accent | Notes |
|--------|--------|-------|
| Ramadan | Primary (green/gold) | Full emphasis |
| Pre-Ramadan | Secondary / muted | Softer, anticipatory |
| Eid | Gold / festive | Brief celebration |
| Post-Ramadan / Rest | Secondary | Calmer, reflection-focused |

Implementation: `data-season="ramadan" | "pre" | "eid" | "post" | "rest"` on root or main container; CSS vars for `--season-accent`.

### 5.4 Microcopy by season

| Context | Ramadan | Pre-Ramadan | Post-Ramadan |
|---------|---------|-------------|--------------|
| Empty fast card | N/A (always has content) | "No fasting today. Ramadan starts in X days." | "No fasting today. Next Sunnah: Monday." |
| Primary CTA | "I'm fasting" / "Break fast" | "Add Ramadan to calendar" / "Set goals" | "Reflect today" / "I fasted" (on Sunnah) |
| Subtitle | "Ramadan Mubarak" | "Prepare your heart and schedule" | "Keep the habit — reflect or fast Sunnah" |
| Goals card | "Ramadan Mubarak!" | "X days until Ramadan" + checklist | "Reflect on Ramadan" (Eid) → "Sunnah fasting" (later) |

---

## 6. Implementation checklist

1. **Add `getSeason()` and `getDaysSinceRamadanEnd()`** to `ramadan.ts`.
2. **Dashboard layout branches** on `season`:
   - Pre-Ramadan: promote Goals, Learning; fade Fast card when not Sunnah.
   - Ramadan: current behavior.
   - Eid: one-time Eid recap card; "Reflect" primary.
   - Post-Ramadan: "Reflect today" primary; Sunnah card prominent.
   - Rest: same as post-Ramadan but with "X days until Ramadan" badge.
3. **Conditional Fast Status card**: When `!inRamadan && !isSunnahDay`, show compact "No fasting today" + next Sunnah or countdown.
4. **Header badge**: Single source `getSeasonalBadgeText()` returning the one-line "you are here" string.
5. **Quick action order**: When not Ramadan, surface Journal/Reflect, Sunnah, Culture higher (user config still applies).
6. **Eid recap**: One-time modal/card on first open after Ramadan end; mood + gratitude; "Keep the habit" CTA.

---

## 7. Summary

| Season | Primary focus | Fade back | Stay active |
|--------|---------------|-----------|-------------|
| **Pre-Ramadan** | Countdown, goals, learning, calendar export | Iftar/Suhoor countdown, daily fast card | Journal, culture, macros, prayer times, Sunnah |
| **Ramadan** | Fasting, countdown, progress, missions | — | All |
| **Eid** | Reflection, gratitude, Eid recap | Iftar countdown, Ramadan goals | Journal, Sunnah prompt |
| **Post-Ramadan** | Reflection, Sunnah fasting, habits | Iftar countdown, Ramadan ring | Journal, culture, macros, Sunnah, prayer times |
| **Rest** | Sunnah (Mon/Thu), reflection, countdown | Iftar countdown, Ramadan ring | Same as post-Ramadan |

Users should always see a **single badge** (e.g. "Day 15 of Ramadan" or "23 days until Ramadan" or "Sunnah fasting day · Monday") so they know where they are in the year without reading explanations.
