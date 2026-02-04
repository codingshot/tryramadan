# Health Guardrails & Recurring Check-Ins

> **Implementation status:** Done. Disclaimers, healthWarnings persistence, DashboardHealth banner, Day 7/15/21 check-ins, symptom 4–5 toast, low mood 3+ consecutive days card on DashboardHealth.

This document identifies risks when users ignore medical advice, over-fast, or push macros too aggressively. It proposes UX guardrails (soft warnings, health resource links, clear disclaimers) and suggests recurring check-ins throughout Ramadan.

**Scope:** `/onboarding/health`, `/dashboard/health`, and related flows (macros, emergency, break-fast).

---

## 1. Risk identification

### 1.1 Ignoring medical advice

| Risk | Current state | Gap |
|------|---------------|-----|
| User selects diabetes/pregnancy/heart in onboarding, then continues anyway | OnboardingHealth shows "Please speak to your doctor before fasting" | No blocking; healthWarnings not persisted to preferences, so no follow-up in app |
| User dismisses or skips health screening | Can select "None" or proceed without acknowledging | No confirmation that they've read the disclaimer |
| User with contraindication completes full Ramadan without medical clearance | App does not know or surface their prior selection | healthWarnings never saved; no contextual reminders |

### 1.2 Over-fasting / pushing through

| Risk | Current state | Gap |
|------|---------------|-----|
| User logs many consecutive days with low mood/energy but keeps fasting | DashboardHealth logs wellness/symptoms; no correlation with fasting | No pattern detection; no "consider a break" nudge |
| User logs severe symptoms (e.g. dizziness, nausea 4–5) and continues | Symptom logger exists; no follow-up | No "Have you considered breaking your fast?" prompt |
| Streak/achievement pressure to not "break" the fast | Streaks and achievements shown; Eid recap normalizes breaks | Some users may feel guilt; messaging could be stronger |
| Elderly or vulnerable users fasting without monitoring | No age or vulnerability flag | No targeted guidance |

### 1.3 Aggressive macros / calorie restriction

| Risk | Current state | Gap |
|------|---------------|-----|
| User sets very low daily calories (e.g. &lt;1200) | clampCalories caps at CALORIE_MAX; no minimum floor | Can set 0 or very low; no warning |
| User tracks macros and severely undereats during Ramadan | Macro tracker shows goals vs actual; no health guidance | No "eating too little" warning when actual &lt;&lt; recommended |
| Disordered eating patterns (e.g. crash dieting during Ramadan) | No detection | No soft intervention |
| Body weight / sex used for calorie estimate without disclaimer | getRecommendedCaloriesFromPreferences exists | No "this is a rough estimate, not medical advice" on Macros page |

---

## 2. Proposed UX guardrails

### 2.1 Soft warnings (non-blocking)

| Location | Trigger | Warning copy (example) |
|----------|---------|------------------------|
| **OnboardingHealth** | User selects any risk option (diabetes, pregnancy, etc.) | ✓ Exists: "We'll show health & safety guidance. Please speak to your doctor before fasting." |
| **OnboardingHealth** | Before Continue | Add: "By continuing, I understand this app is not medical advice and I should consult my doctor if I have health concerns." (checkbox or inline text) |
| **DashboardHealth** | User has healthWarnings (once persisted) | Banner: "You indicated health considerations. Remember: consult your doctor before fasting. [Health & Safety →]" |
| **DashboardHealth** | User logs symptom severity 4–5 | After log: "If symptoms persist or worsen, consider breaking your fast. [Emergency resources →]" |
| **DashboardHealth** | Low mood (1–2) for 3+ consecutive logged days | Card: "You've logged low energy recently. It's okay to adjust or pause. [Health & Safety →]" |
| **DashboardMacros** | User sets calories &lt; 1200 | Inline: "Very low calorie goals may not be enough during fasting. Consider consulting a nutritionist. [Health guide →]" |
| **DashboardMacros** | Actual intake consistently &lt; 50% of goal for 3+ days | "You're eating well below your goal. Nutrition matters—consider adjusting or speaking to a professional." |
| **Dashboard / Today** | First time user taps "I'm fasting" | Optional tooltip: "Your health comes first. Break your fast if you feel unwell. [Emergency →]" |

### 2.2 Optional links to health resources

| Location | Link | Purpose |
|----------|------|---------|
| **OnboardingHealth** | "Who should not fast?" → `/health` or `/health-safety` | Pre-flight education |
| **OnboardingHealth** | "Medical disclaimer" expandable | Full legal/medical disclaimer inline |
| **DashboardHealth** | "Health & Safety" → `/health-safety` | ✓ Exists |
| **DashboardHealth** | "Emergency: break fast" → `/emergency` | ✓ Exists |
| **DashboardMacros** | "Nutrition during Ramadan" → `/health` or new section | When calorie goals are custom |
| **BreakFastReasonDialog** | After selecting "Medical / doctor's advice" | "Need medical resources? [Health & Safety →]" |
| **Dashboard Today** | "Need to break fast?" card | → `/emergency` ✓ Exists |
| **FastingBottomBar** | "Break fast" button | → `/emergency` ✓ Exists |

Add to **Settings** (optional):
- "Health resources" section: links to NHS, CDC, or local health authority Ramadan fasting guidance (configurable by region).

### 2.3 Clear messaging: what the app does NOT replace

| Message | Where to show |
|---------|----------------|
| **Doctors** | "This app is not medical advice. Always consult a healthcare professional before fasting, especially with health conditions or medications." |
| **Scholars** | "For religious rulings on fasting (e.g. Qada, Fidya, exemptions), consult a qualified scholar or imam." |
| **Nutritionists** | "Calorie and macro suggestions are rough estimates only. For personalized nutrition, see a registered dietitian." |

**Proposed placements:**

1. **OnboardingHealth** (before Continue):
   - Subtitle: "This app does not replace your doctor. Always consult a healthcare professional before fasting."
2. **DashboardHealth** (footer of page):
   - "TryRamadan is for tracking and education only. It does not replace medical, religious, or nutritional advice."
3. **DashboardMacros** (near calorie goal):
   - "Suggested calories are estimates only—not medical or nutrition advice."
4. **Health & Safety / Health pages**:
   - ✓ Medical disclaimer exists. Add: "For religious exemptions and rulings, consult a qualified scholar."
5. **Emergency page**:
   - ✓ "Your health is a trust from Allah." Add: "This app does not replace emergency services or medical advice."

---

## 3. Recurring check-ins throughout Ramadan

### 3.1 Goal

Give users safe, low-pressure moments to reconsider their goals and schedule—without guilt or pressure.

### 3.2 Check-in moments (proposed)

| Moment | Trigger | Format | Purpose |
|--------|---------|--------|---------|
| **Day 7** | First time user opens app on Ramadan day 7 | Optional modal/card: "One week in. How are you feeling?" → mood 1–5 + optional "Adjust anything?" link to Schedule/Settings | Mid-point temperature check |
| **Day 15** | Ramadan day 15 | Card on Dashboard: "Halfway through Ramadan. Want to revisit your schedule or goals?" [Yes, take a look] [I'm good] | Encourage reflection without forcing |
| **Day 21** | Ramadan day 21 | If user has logged low mood/symptoms in prior week: "You've had some tough days. It's okay to slow down or adjust. [Health & Safety] [I'm fine]" | Compassionate nudge for at-risk patterns |
| **After 3+ low-mood days** | Consecutive wellness logs with mood ≤2 | Soft card on DashboardHealth or Today: "You've logged low energy recently. Consider a break or talking to someone. [Resources]" | Pattern-based, not punitive |
| **After logging high-severity symptom** | Symptom severity 4–5 | "If you're still unwell, consider breaking your fast today. [Emergency resources]" | Immediate, contextual |
| **Eid / last day** | Last day of Ramadan | "Ramadan complete. One last reflection?" (existing Eid recap) | Closure, gratitude |

### 3.3 Implementation approach

- **Non-intrusive:** Check-ins are cards or optional modals, never blocking.
- **Dismissible:** User can dismiss; we remember "dismissed check-in day 7" to avoid re-showing.
- **Contextual:** Day 21 check-in only if we have low-mood/symptom data.
- **Links, not pressure:** Every check-in offers "Learn more" or "Resources" — never "You must change."

### 3.4 Example copy for check-ins

| Check-in | Headline | Body | CTA |
|----------|----------|------|-----|
| Day 7 | One week in | How are you feeling? A quick check-in helps us tailor your experience. | [Mood 1–5] [Skip] |
| Day 15 | Halfway through Ramadan | Want to revisit your schedule, goals, or reminders? No pressure. | [Take a look] [I'm good] |
| Day 21 (if low mood) | You've had some tough days | It's okay to adjust your pace. Many people need to modify fasting for health. | [Health & Safety] [I'm fine] |
| After severe symptom | Take care of yourself | If symptoms persist, consider breaking your fast. Your health comes first. | [Emergency resources] [Dismiss] |

---

## 4. Data persistence: healthWarnings

**Current gap:** `healthWarnings` from OnboardingHealth are not persisted to `UserPreferences`. They are lost after onboarding.

**Recommendation:** Add `healthWarnings: string[]` to `UserPreferences` and persist in OnboardingGoals/OnboardingLayout when completing onboarding. Use to:
- Show contextual banner on DashboardHealth when `healthWarnings.length > 0`
- Optionally surface in Settings: "You indicated: Diabetes. [Update] [Health & Safety]"
- Do NOT use to block or restrict—only to tailor messaging and links.

---

## 5. Summary

| Area | Recommendation |
|------|----------------|
| **Risks** | Ignoring medical advice, over-fasting despite symptoms, aggressive calorie goals. Health screening data not persisted. |
| **Soft warnings** | Onboarding confirmation; DashboardHealth banner for healthWarnings; symptom/mood-based nudges; macro calorie floor warning. |
| **Health links** | Health & Safety, Emergency, Nutrition guide—surfaced contextually. Optional regional health authority links in Settings. |
| **Disclaimers** | "App does not replace doctors, scholars, or nutritionists" — OnboardingHealth, DashboardHealth, Macros, Emergency. |
| **Check-ins** | Day 7, Day 15, Day 21 (conditional), after severe symptom, after 3+ low-mood days. All non-blocking, dismissible. |
| **Persistence** | Persist healthWarnings to preferences for contextual reminders. |
