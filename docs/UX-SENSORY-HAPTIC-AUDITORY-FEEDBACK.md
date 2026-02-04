# UX: Sensory Feedback — Haptic and Auditory Design

This document identifies points where subtle vibration or soft sound could reinforce pleasant ritual (iftar alert, completed log, reflection saved); checks accessibility (ability to toggle sounds, match screen feedback with audio/haptic cues); and suggests distinct sound motifs for Ramadan, journaling, and gratitude entries that enhance experience without feeling "alarmy."

**Related:** [adhanAudio.ts](../src/lib/adhanAudio.ts), [ReminderScheduler](../src/components/ReminderScheduler.tsx), [UX-MULTIMODALITY-ACCESSIBILITY.md](./UX-MULTIMODALITY-ACCESSIBILITY.md).

---

## 1. Current state

### 1.1 What exists today

| Moment | Visual | Audio | Haptic |
|--------|--------|-------|--------|
| **Iftar alert** | Browser Notification | None (browser/OS may play default) | None (OS may vibrate on notification) |
| **Suhoor reminder** | Browser Notification | None | None |
| **Prayer time (adhan)** | Browser Notification | `playAdhan()` (Muslim mode) — toggle in Prayers page | None |
| **Mark complete** | Status update, toast optional | None | None |
| **Reflection saved** | Toast "Entry saved" | None | None |
| **Add food** | List update, toast optional | None | None |
| **First fast / streak milestone** | Inline card, toast | None | None |

### 1.2 Toggles

| Setting | Location | Scope |
|---------|----------|-------|
| **Play adhan sound when notifying** | Dashboard Prayers (Muslim only) | Adhan at prayer times only |
| **Notifications enabled** | Settings | Browser notification permission; no sound/haptic control |
| **Suhoor / Iftar reminders** | Settings | On/off; no sound/haptic toggle |

**Gap:** No global "App sounds" or "Haptic feedback" toggle. No sound or haptic for Mark complete, reflection saved, or add food.

---

## 2. Points where sensory feedback could reinforce pleasant ritual

### 2.1 Iftar alert (high ritual value)

**Current:** ReminderScheduler fires `new Notification("Iftar Time! • وقت الإفطار", body: "It's time to break your fast. Bismillah! 🌙")`. No app-controlled sound or haptic.

**Opportunity:** Reinforce the ritual moment with a soft, celebratory cue.

| Modality | Suggestion | Rationale |
|----------|------------|-----------|
| **Sound** | Optional soft chime or bell (3–5 sec) — distinct from adhan | Iftar is a moment of relief and gratitude; gentle tone matches mood. Adhan at Maghrib may already play if user has prayer notifications; avoid overlap. |
| **Haptic** | Short light vibration (e.g. `[50, 30, 50]` ms) — "double tap" pattern | Signals "something special happened" without alarm. |
| **Visual** | Notification already visible | Ensure notification body is warm; already "Bismillah! 🌙" |

**When:** Only when **Iftar Time** notification fires (at Maghrib). Not for the "X minutes until iftar" reminder — that's preparatory, not the ritual moment.

**Fallback:** If user has "App sounds" off or device is muted, haptic only (when supported). If both off, visual notification remains.

### 2.2 Completed log (Mark complete)

**Current:** `completeFastingToday` updates state; no toast or sensory feedback by default.

**Opportunity:** Acknowledge the accomplishment with a subtle, satisfying cue.

| Modality | Suggestion | Rationale |
|----------|------------|-----------|
| **Sound** | Soft "complete" tone — short (0.5–1 s), warm, single chord or bell | Positive reinforcement without being loud. |
| **Haptic** | Light single tap (e.g. `[30]` ms) | Confirmation; "you did it." |
| **Visual** | Status badge "Done ✓"; optional toast "Well done" | Already or planned; ensure it appears with sound/haptic. |

**When:** On "Mark complete" / "I fasted today — mark complete" click.

**Fallback:** Respect "App sounds" and "Haptic feedback" toggles.

### 2.3 Reflection saved (Journal)

**Current:** Toast "Entry saved"; no sound or haptic.

**Opportunity:** Soft, contemplative cue — different from "complete" (more gentle, reflective).

| Modality | Suggestion | Rationale |
|----------|------------|-----------|
| **Sound** | Soft "saved" tone — very gentle (0.3–0.5 s), lower pitch than complete | Journaling is calm; cue should not startle. |
| **Haptic** | Very light single tap (e.g. `[20]` ms) or none | Optional; journaling is often quiet/private. |
| **Visual** | Toast "Entry saved" | Keep; ensure timing aligns with sound/haptic. |

**When:** On Journal Save click.

**Fallback:** Same as above.

### 2.4 Add food (meal logged)

**Current:** List updates; optional toast. No sound or haptic.

**Opportunity:** Subtle confirmation — lighter than "complete."

| Modality | Suggestion | Rationale |
|----------|------------|-----------|
| **Sound** | Optional soft "add" tone — very short (0.2–0.3 s) | Quick acknowledgment; not as weighty as Mark complete. |
| **Haptic** | Light tap (e.g. `[15]` ms) | Confirmation without ceremony. |
| **Visual** | New row animates in; toast "Added" optional | Keep. |

**When:** On Add food submit.

**Fallback:** Same.

### 2.5 First fast / streak milestone (7, 15, 30)

**Current:** Inline card (e.g. "Week streak!"); no sound or haptic.

**Opportunity:** Slightly more celebratory cue — still soft, not alarmy.

| Modality | Suggestion | Rationale |
|----------|------------|-----------|
| **Sound** | Optional "celebration" tone — short (0.5–1 s), warm, ascending | Milestone moment; slightly more prominent than daily complete. |
| **Haptic** | Short pattern (e.g. `[30, 50, 30]` ms) — "success" rhythm | Communicates "achievement" without being aggressive. |
| **Visual** | Inline card with emoji; optional confetti (respect `prefers-reduced-motion`) | Keep. |

**When:** When milestone card first appears (one-time per milestone).

**Fallback:** Same.

### 2.6 Suhoor reminder (lower ritual weight)

**Current:** Browser notification; no app sound or haptic.

**Opportunity:** Softer than iftar — preparatory, not celebratory.

| Modality | Suggestion | Rationale |
|----------|------------|-----------|
| **Sound** | Optional soft wake-up tone — gentle, single note (0.5 s) | Pre-dawn; user may be sleepy. Avoid harsh or loud. |
| **Haptic** | Light tap (e.g. `[30]` ms) | Gentle nudge. |
| **Visual** | Notification | Keep. |

**When:** When Suhoor reminder notification fires.

**Fallback:** Same.

---

## 3. Accessibility: toggles and matching cues

### 3.1 Required toggles

| Toggle | Location | Default | Scope |
|--------|----------|---------|-------|
| **App sounds** | Settings → Notifications (or new "Sounds & haptics" section) | On | All in-app sounds except adhan (adhan has its own toggle) |
| **Haptic feedback** | Settings → Sounds & haptics | On (when device supports) | All in-app haptic cues |
| **Adhan sound** | Dashboard Prayers (existing) | On | Adhan at prayer times only |

**Implementation note:** Check `navigator.vibrate` for haptic support. On iOS Safari, `vibrate` may not be available; gracefully skip haptic when unsupported.

### 3.2 Matching screen feedback with audio/haptic

| Principle | Application |
|-----------|-------------|
| **Fire together** | Sound and haptic should fire at the same moment as the visual update (toast, status change, new row). Avoid delay. |
| **Respect toggles** | If "App sounds" off → no sound; if "Haptic feedback" off → no haptic. Visual always remains. |
| **Respect system** | If device is muted (or "silent" on iOS), consider skipping sound. `navigator.vibrate` respects system vibration settings on most devices. |
| **prefers-reduced-motion** | If user prefers reduced motion, avoid confetti or heavy animations; sound/haptic can remain unless we add "Reduced sensory feedback" toggle. |
| **Screen reader** | Ensure `aria-live` regions announce status changes; sound/haptic are supplemental, not replacement. |

### 3.3 Fallback when sounds/haptics disabled

| Scenario | Fallback |
|----------|----------|
| **App sounds off** | No sound; haptic and visual only (if haptic on). |
| **Haptic off** | No haptic; sound and visual only (if sound on). |
| **Both off** | Visual only (toast, status update, animation). |
| **Device muted** | Optionally skip sound; document that app respects system mute. |
| **Vibrate not supported** | Skip haptic; no error. |

---

## 4. Distinct sound motifs (non-alarmy)

### 4.1 Design principles

| Principle | Application |
|-----------|-------------|
| **Short** | 0.2–1.5 s max; no long tones or melodies. |
| **Soft** | Low volume; gentle attack; no harsh transients. |
| **Distinct** | Each ritual type has a recognizable motif. |
| **Not alarmy** | No repeated beeps, sirens, urgent patterns. Single or double tones preferred. |
| **Culturally considerate** | Iftar/Ramadan: warm, possibly Middle Eastern–inspired timbre; avoid cultural appropriation. |

### 4.2 Suggested motifs by context

| Context | Motif idea | Duration | Character |
|---------|------------|----------|-----------|
| **Iftar alert** | Soft bell or chime — single strike, warm overtone (e.g. brass or wooden bell) | 0.5–1 s | Ritual, celebratory; "time to break fast" |
| **Mark complete** | Soft ascending chord or two-note "complete" (e.g. C–E or C–G) | 0.5–0.8 s | Satisfying, accomplished |
| **Reflection saved** | Very soft single note — lower pitch, gentle decay (e.g. soft gong or bowl) | 0.3–0.5 s | Calm, contemplative |
| **Add food** | Soft click or single light tone | 0.2–0.3 s | Quick, minimal |
| **Streak / milestone** | Warm ascending arpeggio or two-note "achievement" (e.g. C–E–G) | 0.5–1 s | Celebratory but not loud |
| **Suhoor reminder** | Soft single tone — gentle, "wake gently" (e.g. soft chime) | 0.5 s | Preparatory, gentle |
| **Journaling (optional ambient)** | Optional: very subtle background tone when entering Journal — single soft note on page load | 0.3 s | Sets reflective mood; easily skipped |

### 4.3 Implementation options

| Option | Description | Pros | Cons |
|--------|-------------|------|------|
| **A. Web Audio API** | Generate tones programmatically (sine, triangle, or sampled) | No assets; small bundle | May sound synthetic |
| **B. Pre-recorded short clips** | MP3/OGG/WAV files (e.g. `sounds/iftar-chime.mp3`) | High quality; distinct character | Asset size; need license/creation |
| **C. Hybrid** | Web Audio for quick tones (add food, save); pre-recorded for iftar, complete, milestone | Balance of quality and bundle size | More implementation work |

**Recommendation:** Start with Web Audio API for add food and save (simple, lightweight). Use pre-recorded clips for iftar and Mark complete if budget allows; else Web Audio with distinct frequencies and envelopes.

### 4.4 Haptic patterns (Vibration API)

| Context | Pattern (ms) | Description |
|---------|--------------|-------------|
| **Iftar** | `[50, 30, 50]` | Double tap — "special moment" |
| **Mark complete** | `[30]` | Single light tap |
| **Reflection saved** | `[20]` | Very light tap |
| **Add food** | `[15]` | Minimal tap |
| **Milestone** | `[30, 50, 30]` | Short success pattern |

**Note:** `navigator.vibrate(pattern)` — check support; iOS Safari has limited support.

---

## 5. Summary

| Area | Recommendation |
|------|----------------|
| **Iftar alert** | Optional soft chime + haptic `[50, 30, 50]` when Iftar Time notification fires. Distinct from adhan. |
| **Completed log** | Soft "complete" tone + haptic `[30]` on Mark complete. |
| **Reflection saved** | Soft "saved" tone (lower, gentler) + optional haptic `[20]` on Journal Save. |
| **Add food** | Soft quick tone + haptic `[15]` on Add submit. |
| **Milestone** | Optional celebration tone + haptic `[30, 50, 30]` when milestone card appears. |
| **Accessibility** | Add "App sounds" and "Haptic feedback" toggles in Settings. Match cues with visual feedback; respect toggles and system mute. |
| **Sound motifs** | Iftar: warm bell/chime; Complete: ascending chord; Journal: soft single note; Add: minimal click; Milestone: warm arpeggio. Short (0.2–1 s), soft, non-alarmy. |

Implementing these sensory cues with proper toggles and fallbacks will reinforce pleasant rituals without feeling intrusive or alarmy.
