# UX: Privacy Comfort Review

This document identifies points where users may hesitate to share data, proposes in-context privacy controls, designs confirmation copy for sensitive actions, and suggests visual trust cues so the experience feels safe without being heavy-handed.

---

## 1. Hesitation map

| Area | What is collected / shown | Why users might hesitate |
|------|---------------------------|---------------------------|
| **Journal** (`/dashboard/journal`, day plan preview) | Free-form reflections, gratitude, mood (1–5). | Personal feelings, faith reflections, health notes. Fear others might see screen; unsure who can access stored data. |
| **Meal logs** (`/dashboard`, `/dashboard/schedule`, `/dashboard/meals`) | Suhoor/iftar items, calories, portions. | Dietary restrictions, disordered eating concerns, embarrassment about choices. |
| **Schedule notes** (`/dashboard/schedule`) | Free-text note per day. | Could include sensitive medical/travel info. |
| **Prayer times & location** (`LocationDisplay`, `/settings`, reminders) | Location coordinates, timezone, prayer notifications. | Sharing precise location; fear of misuse; prayer reminders reveal Muslim identity. |
| **Notification preferences** (`/settings`, onboarding) | Suhoor/Iftar reminders, hydration reminders. | Push notifications popping up in public; reveals fasting practice. |
| **Hydration / wellness (Dashboard Today, Health)** | Hydration totals, energy check-ins, wellness notes. | Health data sensitivity. |
| **Exports** (`/dashboard/progress`, `/dashboard/journal`) | CSV/JSON downloads. | Unsure where files go or who can read them later. |
| **Reset / delete** (`/settings`) | Reset progress, delete notes/logs. | Fear of losing data accidentally; unsure if data is fully removed. |

---

## 2. Privacy controls per screen

### 2.1 Journal (Dashboard + Journal page)
- **Quick hide toggle:** Eye icon in journal card and on `/dashboard/journal` header → hides content, shows placeholder (`•••••`). Persists per session.
- **Lock note:** Small lock icon indicating entry is private; tooltip “Visible only to you on this device unless you export.”
- **Screen blur shortcut:** “Hide entries” link in journal list → blur all entries until tapped again.

### 2.2 Meals & schedule
- **Hide calories/portions:** Toggle in meal card (“Hide calories”) (per day) or global in Settings → hides numeric fields.
- **Private meal names:** Option in dialog “Mark private” → replaces item name with “Private meal” on dashboard (tap to reveal).
- **Schedule note visibility:** “Mark note private” checkbox; when on, preview shows `Private note — tap to view`.

### 2.3 Prayer times & location
- **Location display:** Eye/lock icon next to city → tap hides exact city (“Location hidden”). Tooltip: “Used locally for prayer times only.”
- **Prayer reminders:** Switch labelled “Hide notification text” → notifications say “It’s time” without mentioning suhoor/iftar.

### 2.4 Hydration / wellness
- **Hide section:** Toggle at top of card “Hide hydration details” → collapses totals & log. Persisted preference.
- **Energy check-in:** Option “Keep private” before saving → displays `Energy entry saved (hidden)` in history.

### 2.5 Exports & reset
- **Export dialog:** Disclosure text “File stays on this device unless you share it.” Option “Include journal content” checkbox (default on). Show file path once saved.
- **Reset progress:** Two-step confirmation with summary (“Fasting log, meals, journal entries will be deleted from this device.”) + checkbox “I understand this cannot be undone.”

---

## 3. Confirmation copy for sensitive actions

| Action | Confirmation copy |
|--------|-------------------|
| **Archive journal entry** | “Archive this entry? You can find it in ‘Archived entries’ and restore anytime.” Buttons: [Archive] [Cancel]. |
| **Delete journal entry** | “Delete entry permanently? This removes it from this device and any exports you create later.” Buttons: [Delete] [Cancel]. |
| **Delete meal / note** | “Remove this item? It will disappear from your meal log for this day.” |
| **Reset progress** | Title “Reset everything?” Body: “This removes fasting log, meals, journal entries, notes, and streaks from this device. Exports you already downloaded stay on your computer.” Checkbox “Yes, delete my data from this device” + [Reset] (destructive) / [Cancel]. |
| **Export journal** | “Export journal entries? A copy will be saved to your downloads folder. Keep it safe if it includes private reflections.” Buttons: [Export] [Cancel]. |
| **Export progress** | “Export fasting log? Creates a CSV in your downloads folder. Anyone with the file can read it.” Buttons: [Export] [Cancel]. |

Tone: factual + reassuring, avoid fear but clarify permanence and scope (“from this device,” “you can restore,” etc.).

---

## 4. Visual trust cues

### 4.1 Lock iconography & affirmations
- **Subtle lock** (outline lock or shield) next to sections that stay local (Journal, Schedule note). Tooltip: “Private to you.”
- **Header badge** when privacy mode active (“Private mode on” with lock).
- **Soft affirmation line** at bottom of sensitive cards: “Your entries stay on this device unless you export.”

### 4.2 Color and typography
- Use muted neutral background (e.g. `bg-muted/60`) for private content with lock icon to differentiate from public-looking surfaces.
- Avoid aggressive red; use calm teal/blue for security cues.
- Use small italic reassurance text (`text-xs text-muted-foreground`) to avoid clutter but keep message visible.

### 4.3 Motion & microcopy
- When user taps hide/unhide, use gentle fade/blur transition instead of abrupt change.
- Snackbars/toasts after hide: “Hidden. Tap the eye icon to show again.” After delete/archive: “Deleted. Undo?” for a few seconds if action is reversible.

### 4.4 Settings overview
- Privacy section in Settings summarizing: “Journal, meals, notes, and reminders stay on this device. Export only when you’re ready to share.” Include link to privacy FAQ.

---

## 5. Implementation checklist

1. **Journal:** Add hide/unhide eye icon; add “Private” badge; add quick blur control.
2. **Meals/Schedule:** Toggle to hide calories; “Private meal/note” option.
3. **Location/Notifications:** Hide location name toggle; “Hide notification text” switch.
4. **Hydration/Wellness:** Hide sections toggle + “keep private” option for entries.
5. **Confirmations:** Update copy per table; add checkbox for irreversible actions.
6. **Visual cues:** Lock/shield icons, soft affirmations, privacy summary in Settings.

These changes ensure users always see an easy way to protect sensitive data, understand what happens when they confirm destructive actions, and feel reassured that their Ramadan journey is personal and secure.

