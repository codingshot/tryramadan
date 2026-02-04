# UX: Multi-Modality Accessibility — Speech, Screen Readers, Large Text, Notifications

This document maps screen-reader reading order for key flows, ensures essential alerts (iftar, suhoor) can trigger voice or smartwatch notifications, suggests voice-based shortcuts with fallbacks, and defines fallbacks when microphone or notifications are disabled.

**Related:** [accessibility.md](./accessibility.md) (WCAG 2.2 AA), [KeyboardShortcutsHelp](../src/components/KeyboardShortcutsHelp.tsx), [ReminderScheduler](../src/components/ReminderScheduler.tsx).

---

## 1. Screen-reader reading order for key flows

### 1.1 Assumptions

- Reading order follows **DOM order** by default (no `tabindex` or `aria-flowto`).
- Skip link ("Skip to main content") goes to `#main-content`; focus moves to `<main>`.
- Landmarks: `<nav>`, `<main id="main-content">`, `<footer>`.
- `aria-live="polite"` on FastingTimer countdown; `aria-atomic="true"` for full announcement.

### 1.2 Dashboard (`/dashboard`)

| Order | Element | Role / semantics | Notes |
|-------|---------|------------------|-------|
| 1 | Skip link | Link | "Skip to main content" — only visible on focus. |
| 2 | Navbar | `<nav>` | Logo, links, location, settings, time. |
| 3 | Main | `<main id="main-content">` | Page title (h1), day selector, status card, Suhoor/Iftar strip, actions, day plan, stats, quick access, etc. |
| 4 | Status card | Section | "Right now: Fasting" / "Eating window" + countdown. `aria-live="polite"` on status badge. |
| 5 | Suhoor/Iftar strip | Link to Schedule | Key times; entire block is a link. |
| 6 | Action buttons | Buttons | "I'm fasting," "I didn't fast today," "Break fast," "Mark complete." |
| 7 | Day plan | Section | Meals, journal snippet, "Mark complete." |
| 8 | Stats (Streak, Total, Sunnah, Broken) | Buttons | Click to open dialogs; each has accessible name. |
| 9 | Quick access | Links | Today, Schedule, Prayers, Meals, etc. |
| 10 | Footer | `<footer>` | Links, theme switcher. |

**Potential issues:** Day selector has many focusable elements (arrows, date popover trigger, "Go to today," next arrow). Ensure logical tab order (prev → date → today → next). Long lists (quick access, stats) may require patience; consider "Jump to" links for power users.

### 1.3 Dashboard Today (`/dashboard/today`)

| Order | Element | Notes |
|-------|---------|-------|
| 1 | Skip link | — |
| 2 | Navbar | — |
| 3 | Back link | "Back to Dashboard" |
| 4 | Main | h1 "Today's Fast" |
| 5 | Status card | Today's fast (complete / broke / buttons) |
| 6 | FastingTimer | `aria-live="polite"` on countdown; `aria-label` on timer |
| 7 | Dual countdown | Suhoor end / Iftar |
| 8 | Progress bar | Fasting progress % |
| 9 | Intention textarea | "Today's intention" |
| 10 | Energy check-in | 1–5 buttons |
| 11 | Hydration | Goal, progress, quick-add |
| 12 | Emergency CTA | — |
| 13 | Footer | — |

### 1.4 Dashboard Schedule (`/dashboard/schedule`)

| Order | Element | Notes |
|-------|---------|-------|
| 1 | Skip link | — |
| 2 | Navbar | — |
| 3 | Back link | — |
| 4 | Main | h1, calendar, day detail |
| 5 | Calendar | Grid of dates; ensure each day is focusable with accessible name (e.g. "Mar 12, Wednesday, completed") |
| 6 | Day detail | Selected day: prayer times, meals, journal, fasting status, note |
| 7 | Food log / meal plan | Add buttons, list of items |
| 8 | Footer | — |

### 1.5 Dashboard Journal (`/dashboard/journal`)

| Order | Element | Notes |
|-------|---------|-------|
| 1 | Skip link | — |
| 2 | Navbar | — |
| 3 | Back link | — |
| 4 | Main | h1 "Reflection journal" |
| 5 | Date picker | Calendar + date input |
| 6 | Prompt | "Today's prompt" / day-specific question |
| 7 | Textarea | `aria-describedby` for char hint |
| 8 | Mood, gratitude | Optional fields |
| 9 | Save button | — |
| 10 | Past entries | List; each entry focusable |
| 11 | Footer | — |

### 1.6 Recommendations for reading order

- **Landmarks:** Ensure each major section has `aria-label` or `aria-labelledby` where it helps (e.g. "Fasting status," "Day plan").
- **Live regions:** Keep `aria-live="polite"` on countdown and status; avoid `assertive` unless critical (e.g. "Iftar now!").
- **Headings:** One h1 per page; h2/h3 in logical order. Avoid skipping levels.
- **Focus management:** Dialogs trap focus; on close, restore focus to trigger. No focus trapping on non-modal overlays.
- **Long lists:** Consider "Jump to Day plan" or "Jump to Stats" links for keyboard/screen-reader users.

---

## 2. Essential alerts: voice and smartwatch notifications

### 2.1 Current state

- **ReminderScheduler:** Uses `new Notification()` for suhoor (X min before Imsak), iftar (X min before Maghrib), iftar time (at Maghrib), Sunnah day, hydration.
- **Requires:** App open (useEffect runs in React); `Notification.permission === "granted"`.
- **Limitation:** When app is **closed**, reminders do not fire (no background Service Worker scheduling). PWA install enables Service Worker; Workbox may support background sync, but current impl checks every 60s only when app is mounted.

### 2.2 Voice and smartwatch behavior

| Platform | Behavior | Notes |
|----------|----------|-------|
| **Browser notification** | Title + body read by OS TTS when notification arrives (if user has "Announce notifications" / "Speak notifications" enabled). | We control title + body; keep them short and clear. |
| **Smartwatch** | PWA push notifications can appear on watch if OS mirrors them (e.g. Wear OS, watchOS). | Same Notification API; no extra work for basic mirroring. |
| **In-app voice** | Web Speech API `SpeechSynthesis` can speak "Iftar time" when notification would fire, if app is open. | Optional enhancement; not a replacement for system notification. |

### 2.3 Recommendations for essential alerts

| Alert | Title (short, TTS-friendly) | Body | Tag (dedupe) |
|-------|-----------------------------|------|--------------|
| **Suhoor reminder** | "Suhoor Reminder" | "15 minutes until suhoor ends. Finish eating soon." | `suhoor-YYYY-MM-DD` |
| **Iftar reminder** | "Iftar Reminder" | "15 minutes until iftar. Prepare to break your fast." | `iftar-reminder-YYYY-MM-DD` |
| **Iftar time** | "Iftar Time" | "It's time to break your fast. Bismillah." | `iftar-time-YYYY-MM-DD` |

**Copy:** Keep title under ~40 chars for TTS; body under ~100 chars. Avoid emoji in body for clean TTS (or use sparingly).

**Smartwatch:** No extra implementation needed if PWA is installed and OS mirrors notifications. Ensure manifest has appropriate `name` and `short_name` for notification display.

**Background delivery:** To fire reminders when app is closed, implement a Service Worker that:
1. Receives `push` events (requires Push API + backend) **or**
2. Uses `setInterval` / `setTimeout` in SW (limited by browser; not reliable for long delays).

**Fallback when notifications disabled:** See §4.

---

## 3. Voice-based shortcuts

### 3.1 Proposed voice commands

| Command | Action | Fallback |
|---------|--------|----------|
| **"Log fast"** | Navigate to Dashboard, focus "I'm fasting" or "Mark complete" (context-dependent). | Keyboard: `g` then `d`; or manual tap. |
| **"Add note"** | Navigate to Journal for today, focus textarea. | Keyboard: `g` then `j` (if we add `j` for Journal); or manual. |
| **"Show progress"** | Navigate to Progress page. | Keyboard: `g` then `p` (p = Prayers currently; conflict). Use `g` + `r` for Progress? |
| **"What time is iftar?"** | Speak current iftar time (SpeechSynthesis). | Show time in-app; or read from page. |
| **"What time is suhoor?"** | Speak suhoor end (Fajr) time. | Same. |

**Note:** `g` + `p` is Prayers; we'd need `g` + `r` or similar for Progress. Or "Show prayers" vs "Show progress" as distinct voice commands.

### 3.2 Implementation approach

- **Web Speech API `SpeechRecognition`:** Listen for phrases when user opts in (e.g. "Enable voice commands" in Settings).
- **Phrase mapping:** "Log fast" → `navigate("/dashboard")` + focus status/action; "Add note" → `navigate("/dashboard/journal")` + focus textarea; "Show progress" → `navigate("/dashboard/progress")`.
- **Feedback:** On recognition, speak short confirmation via `SpeechSynthesis`: "Logged" or "Opening journal" — optional, user preference.
- **Privacy:** Voice processing can be done client-side (browser); no server round-trip if using Web Speech API.

### 3.3 Fallback when microphone disabled

| Scenario | Fallback |
|----------|----------|
| **User denies mic permission** | Don't show voice UI; show "Voice commands require microphone access" in Settings with "Enable" button. If denied, hide voice section. |
| **Browser doesn't support SpeechRecognition** | Hide voice commands; show "Voice commands not supported in this browser. Use keyboard shortcuts instead." Link to KeyboardShortcutsHelp. |
| **Mic hardware unavailable** | Same as denied; graceful message. |
| **User disables voice in Settings** | Voice listener off; keyboard shortcuts and touch remain. |

---

## 4. Fallbacks when notifications disabled

| Scenario | Fallback |
|----------|----------|
| **User denies notification permission** | ReminderScheduler does nothing. Show in-app cue: "Enable notifications in Settings for suhoor and iftar reminders." Link to Settings #notifications. |
| **Browser doesn't support Notification** | Same message; no reminder delivery. |
| **App closed, no Service Worker push** | Reminders only fire when app is open. Fallback: "Keep the app open for reminders, or install as PWA for background delivery" (if we add SW background logic). |
| **Do Not Disturb / Focus mode** | OS may suppress notifications; we cannot override. Document: "Ensure Do Not Disturb allows TryRamadan if you need reminders." |

---

## 5. Large text mode

### 5.1 Current support

- **Responsive typography:** `text-sm`, `text-base`, `text-lg` etc. via Tailwind.
- **No explicit `font-size: large` media query** for `prefers-reduced-motion` or `prefers-contrast` — we could add.

### 5.2 Recommendations

- **Respect `prefers-reduced-motion`:** Already used in some places; ensure animations (framer-motion) reduce when user prefers.
- **Respect `text-size-adjust`:** Ensure mobile doesn't auto-scale text in a way that breaks layout; `-webkit-text-size-adjust: 100%` can help.
- **Optional large-text mode:** Settings toggle "Use larger text" → increase base font size via CSS var (e.g. `--text-base: 1.125rem`). Fallback: user relies on system/browser zoom.
- **Touch targets:** Min 44×44px for buttons (already targeted); large text may require more spacing — ensure padding scales.

---

## 6. Summary

| Area | Recommendation |
|------|----------------|
| **Reading order** | Document DOM order for Dashboard, Today, Schedule, Journal; ensure landmarks and headings are correct; add jump links for long pages if needed. |
| **Alerts (voice/smartwatch)** | Keep notification title/body short and TTS-friendly; no extra work for smartwatch mirroring; optional in-app SpeechSynthesis when notification fires and app is open. |
| **Voice shortcuts** | Add "Log fast," "Add note," "Show progress" via Web Speech API when user opts in; fallback to keyboard shortcuts and manual navigation when mic disabled. |
| **Fallback (mic disabled)** | Hide voice UI; show "Voice commands require microphone" with link to keyboard shortcuts. |
| **Fallback (notifications disabled)** | Show "Enable notifications in Settings for reminders" with link; no reminders when permission denied. |

Implementing voice shortcuts (opt-in), notification copy tweaks for TTS, and clear fallback messaging will improve multi-modality accessibility without blocking users who prefer keyboard or touch.
