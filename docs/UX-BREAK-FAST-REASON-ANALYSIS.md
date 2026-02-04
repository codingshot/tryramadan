## UX: Break-Fast Reasons & Fasting Log

### 1. Current flows

#### 1.1 Start fast → break due to illness or travel
- User taps `I'm fasting` on `DashboardToday` → entry added with status `in_progress`.  
- During fasting window: secondary CTA `I broke my fast` (red `AlertTriangle`, `bg-destructive/10`).  
- Tapping opens `BreakFastReasonDialog` with title “Why did you break your fast?” and list: “Ate or drank by mistake”, “Illness / not well”, “Travel (musafir)”, “Menstruation”, “Medical need / doctor’s advice”, “Other”.  
- Choosing “Illness”/“Travel” closes dialog → `breakFastingToday` sets status `broken`, removes day from `completedDays`, sets `brokenReason`.
- Today card now shows red panel “You broke your fast today” and reason under it.  
- `/dashboard/progress` log shows pill `Broken (Illness / not well)` with destructive palette; streak drops immediately.

#### 1.2 Accidental bite (“ate by mistake”)
- Same dialog; “Ate or drank by mistake” is grouped with “ending the fast”.  
- App logs status `broken` with reason `mistake`.  
- User receives red “You broke your fast today” badge even though tradition holds this does not invalidate the fast.  
- No affordance to keep fasting and simply note the accident, so user must choose between logging a “broken” day or ignoring the incident.

### 2. Issues observed

- **Language-heavy prompt**: “Why did you break your fast?” implies wrongdoing and demands justification.
- **Red/destructive treatment**: Buttons and status badges use alert styling, which can amplify guilt for excused cases (illness, menstruation, travel).
- **Decision paralysis**:
  - “Ate by mistake” is in the same list as valid break reasons; users may hesitate (“do I really mark the day broken?”).
  - Users unsure whether to mark “I didn’t fast” vs “I broke” vs “Other”.
- **Stats framing**: Progress page shows “Broken (Illness…)” in red; tied to streak reset, making self-care days feel like failure.
- **No guidance**: Flow lacks reminders that illness/travel are excused and logs are for personal reflection.

### 3. Revised flows & copy

#### 3.1 Entry point
- Replace “I broke my fast” (red) with a neutral button: **“Need to pause?”** + `Life happens—log what changed.`  
- On tap, open a bottom sheet titled **“What happened today?”** with supportive subtitle: *“We’ll log this so you can take care of yourself. Your intention still counts.”*

#### 3.2 Sheet structure
1. **Excused & care** block (neutral/soft green background):
   - “I’m feeling unwell” (illness).
   - “I’m travelling” (travel; tooltip for non-Muslims: “Travelers are excused. Make up later if you choose.”).
   - “Menstruation” (visible when relevant setting enabled).
   - “Medical advice / medication”.
   - Copy beneath confirmation: *“This day is noted as a care day. Tradition recognises it as excused.”*
2. **Accidental intake** block (info background):
   - “I ate or drank by mistake” → secondary step: explain *“If it was truly accidental, scholars say your fast still counts. Do you want to keep fasting?”*  
   - Options: **Keep fasting (no log, continue)** / **Log as ended early** (if user genuinely wants to stop). Record selection separately (e.g., store `mistake` reason only when user confirms end).
3. **Chose to end early** block:
   - “I needed to end early for another reason” (Other + optional note field).
4. **Didn’t fast today** quick link:
   - Provide direct path to existing `I didn't fast today` flow with context (“Rest day? Log it without ending a fast.”).

#### 3.3 Confirmation microcopy
- After selection, toast or inline message:
  - Illness/travel: “Logged as a care day. Please rest; you can make it up later if you wish.”
  - Menstruation: “Logged as a protected day. This doesn’t reduce your progress; we’ll keep track for your records.”
  - Medical: “Logged with medical reason. Your health comes first.”
  - Other: “Logged as ended early. Add a short note if you’d like to remember why.”
  - Continue fasting after accidental bite: “Accidents happen—your fast still counts. Take a breath and continue.”

### 4. Progress & stats presentation

- Rename statuses:
  - `broken` → **“Ended early”** (caption: “Reason: Illness”).
  - For excused categories, show badge colour `bg-amber/15 text-amber-700` or soft teal to signal compassion, not error.
- Add a summary row near stats: **“Care days / Rest days”** with count (illness, travel, menstruation, medical). Separate from streak metrics.
- In streak explanation tooltip: “Care days don’t count as streak days, but they’re recorded so you can make them up when ready. Your intention stays intact.”
- CSV/export:
  - Change column header from `Status` to `Day outcome` with values `Completed`, `Ended early (illness)`, `Care day (travel)`, etc.

### 5. Messaging principles

1. **Normalise excused days**: Remind users these are recognised allowances; emphasise self-care.
2. **Frame logs as insight**: “Track this for yourself” vs “Explain yourself.”
3. **Support choices**: Provide guidance for accidents, allow continuing fast without shame.
4. **Visual calmness**: Replace alert colours with muted supportive palettes; use icons like 💛 or 🤍 instead of warning triangles.
5. **Respect different knowledge levels**: Tooltips for non-Muslims explaining travel exemptions, menstruation rules, etc.

Implementing these changes turns the feature into a compassionate self-tracking tool rather than a punitive checklist, while preserving useful data for reflection and make-up planning.
