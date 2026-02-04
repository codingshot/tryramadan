# UX: Menstruation Pattern & Gender

Feature for women to track menstruation patterns and easily mark excused fasting days during Ramadan. Includes gender in onboarding, Settings, and contextual prompts on Today view.

---

## 1. Overview

- **Gender in onboarding**: New step after Health; options: Female, Male, Prefer not to say.
- **Gender in Settings**: Same options under "Gender & wellness"; changeable anytime.
- **Menstruation pattern (female only)**: Cycle length, period length, last period start. Predicts excused days during Ramadan.
- **Today view prompt**: When a day is predicted as menstruation, shows "Predicted excused day" with one-tap "I didn't fast today (excused)".

---

## 2. User flows

### 2.1 Onboarding

1. User completes Health → Gender step.
2. Options: **Female** (enables menstruation tracking), **Male**, **Prefer not to say**.
3. Copy: "Optional. We use this to offer menstruation pattern tracking for women—so you can easily mark excused fasting days (e.g. during your period) without guilt. Your data stays on this device."
4. Continue → Location.

### 2.2 Settings

1. **Gender & wellness** section: Gender options (Female, Male, Prefer not to say).
2. When **Female**: Menstruation pattern block appears.
   - Toggle: Menstruation pattern **On** / **Off**.
   - Copy: "We'll predict your excused fasting days during Ramadan. Tradition recognises these days as exempt—no guilt."
   - When On: Cycle length (21–45 days), Period length (1–14 days), Last period start (date).
3. Data stored locally; no server sync.

### 2.3 Today view (predicted excused day)

1. User has gender = female, menstruation tracking on, last period start set.
2. For today: algorithm predicts menstruation based on cycle/period.
3. Card: "Predicted excused day" + "Based on your pattern, today may be an excused fasting day. Tap below to mark it—no guilt. Tradition recognises this."
4. Button: **I didn't fast today (excused)** → calls `setDaySkipped` (same as "I didn't fast today" but with excused framing).
5. Day is added to `skippedDays`; no broken-fast reason required.

---

## 3. Data model

| Key | Type | Description |
|-----|------|-------------|
| `gender` | `'male' \| 'female' \| null` | From onboarding/Settings; `prefer-not-to-say` stored as `null`. |
| `menstruationTrackingEnabled` | boolean | Only relevant when gender = female. |
| `menstruationCycleDays` | number | Default 28; range 21–45. |
| `menstruationPeriodDays` | number | Default 5; range 1–14. |
| `menstruationLastStartDate` | string \| null | ISO YYYY-MM-DD. |

---

## 4. Prediction logic

- `getPredictedMenstruationDates(lastStart, cycleDays, periodDays, ramadanStartIso, ramadanEndIso)` returns ISO date strings within Ramadan.
- `isPredictedMenstruationDay(date, preferences)` returns true if date is in the predicted set.
- Uses simple forward projection from last period start; no ML.

---

## 5. UX prompts & copy

### 5.1 Onboarding Gender

| Element | Copy |
|---------|------|
| Title | Gender |
| Subtitle | Optional. We use this to offer menstruation pattern tracking for women—so you can easily mark excused fasting days (e.g. during your period) without guilt. Your data stays on this device. |
| Female desc | Enables menstruation pattern tracking for excused fasting days |
| Male desc | No menstruation tracking |
| Prefer not to say desc | Skip personalization |

### 5.2 Settings Menstruation

| Element | Copy |
|---------|------|
| Block title | Menstruation pattern |
| Explanation | We'll predict your excused fasting days during Ramadan. Tradition recognises these days as exempt—no guilt. You can still log them as "I didn't fast today" or use the break-fast reason. |
| Cycle label | Cycle length (days) |
| Period label | Period length (days) |
| Last start label | Last period start |

### 5.3 Today (predicted excused day)

| Element | Copy |
|---------|------|
| Card title | Predicted excused day |
| Subline | Based on your pattern, today may be an excused fasting day. Tap below to mark it—no guilt. Tradition recognises this. |
| Button | I didn't fast today (excused) |

---

## 6. Testing

- `src/test/menstruationAndGender.test.tsx`: OnboardingGender, getPredictedMenstruationDates, isPredictedMenstruationDay, Settings gender/menstruation section.
- `src/test/routes.test.tsx`: Route `/onboarding/gender` added.

---

## 7. Implementation notes

- `sexForCalories` is kept for macro tracker; when user selects Female/Male, both `gender` and `sexForCalories` are set.
- "Prefer not to say" stores `gender: null`; menstruation tracking stays off.
- When gender changes from female to male/null, menstruation tracking is turned off.
- Calendar and Schedule pages can later show predicted excused days (e.g. badge or chip) for planning.
