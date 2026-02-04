# localStorage Security Audit

Enumeration of all localStorage keys in TryRamadan.app, value types, sensitivity classification, and recommended treatment for sensitive or moderately sensitive data.

**Note:** The app does not use `sessionStorage` or IndexedDB. Only `localStorage` is used for persistence.

---

## Summary table

| Key | Example value | Value type | Sensitivity | Recommended treatment |
|-----|---------------|------------|-------------|------------------------|
| `tryramadan-preferences` | `{"userType":"muslim","location":"London, UK","locationCoords":{"lat":51.5,"lng":-0.1},"timezone":"Europe/London","gender":"female","menstruationTrackingEnabled":true,"menstruationLastStartDate":"2025-01-15","bodyWeightKg":70,...}` | `UserPreferences` | **High** | UX warning; consider reducing detail (see below) |
| `tryramadan-onboarding-draft` | `{"mode":"muslim","healthWarnings":["diabetes"],"location":{"lat":51.5,"lng":-0.1,"displayName":"London"},"goals":["Complete Ramadan"],"intention":"..."}` | `OnboardingState` | **High** | UX warning; clear draft on completion (already done) |
| `tryramadan-journal` | `[{"date":"2025-03-15","content":"I felt grateful today...","gratitude":"Family","mood":4}]` | `JournalEntry[]` | **High** | UX warning; optional client-side encryption with user secret |
| `tryramadan-wellness` | `{"2025-03-15":[{"timeOfDay":"morning","mood":3,"note":"Tired","timestamp":"..."}]}` | `Record<string, WellnessEntry[]>` | **High** | UX warning |
| `tryramadan-symptoms` | `{"2025-03-15":[{"symptom":"Headache","severity":4,"timestamp":"..."}]}` | `Record<string, SymptomEntry[]>` | **High** | UX warning |
| `tryramadan-progress` | `{"completedDays":["2025-03-01",...],"fastingLog":[{"date":"2025-03-01","status":"completed","brokenReason":"illness"}],"skippedDays":[...]}` | `FastingProgress` | **Moderate** | UX warning |
| `tryramadan-today` | `{"2025-03-15":{"intention":"To be patient","hydrationGlasses":6,"energyEntries":[{"level":3,"time":"..."}]}}` | `Record<string, TodayData>` | **Moderate** | UX warning |
| `tryramadan-day-food-log` | `{"2025-03-15":{"suhoor":[{"name":"Oatmeal","caloriesPerPortion":350,...}],"iftar":[...]}}` | `Record<string, DayFoodLog>` | **Moderate** | UX warning |
| `tryramadan-day-meal-plans` | `{"2025-03-15":{"suhoor":"Oats","iftar":"Dates + soup"}}` | `Record<string, DayMealPlan>` | **Moderate** | UX warning |
| `tryramadan-day-planned-items` | `{"2025-03-15":{"suhoor":[{...}],"iftar":[...]}}` | `Record<string, DayPlannedItems>` | **Moderate** | UX warning |
| `tryramadan-day-nutrition` | `{"2025-03-15":{"calories":1800,"protein":70,...}}` | `Record<string, DayNutrition>` | **Moderate** | UX warning |
| `tryramadan-schedule-notes` | `{"2025-03-15":"Felt good today"}` | `Record<string, string>` | **Moderate** | UX warning |
| `tryramadan-daily-goals` | `{"calories":2000,"protein":70,"carbs":250,"fat":65}` | `DailyGoals` | **Moderate** | UX warning (body/health-related) |
| `tryramadan-goals-until-ramadan` | `[{"id":"1","title":"Read Quran","completed":true}]` | `GoalUntilRamadan[]` | **Moderate** | UX warning |
| `tryramadan-calendar-events` | `{"2025-03-15":[{"title":"Suhoor","type":"suhoor","time":"04:30"}]}` | `Record<string, CalendarEvent[]>` | **Moderate** | UX warning |
| `tryramadan-notifications` | `{"suhoorEnabled":true,"iftarEnabled":true,"suhoorMinutesBefore":30,...}` | `NotificationSettings` | **Non-sensitive** | None |
| `tryramadan-prayer-notifications` | `{"Fajr":true,"Maghrib":true,...}` | `PrayerNotificationPrefs` | **Non-sensitive** | None |
| `tryramadan-adhan-sound-enabled` | `true` | `boolean` | **Non-sensitive** | None |
| `tryramadan-adhan-notified` | `{"2025-03-15":["Fajr","Dhuhr"]}` | `Record<string, string[]>` | **Non-sensitive** | None |
| `tryramadan-dashboard-quick-actions` | `["today","schedule","prayers",...]` | `string[]` | **Non-sensitive** | None |
| `tryramadan-recipe-favorites` | `["suhoor-1","iftar-3"]` | `string[]` | **Non-sensitive** | None |
| `tryramadan-recent-recipes` | `["suhoor-1","iftar-2"]` | `string[]` | **Non-sensitive** | None |
| `tryramadan-schedule-notes` | `{"2025-03-15":"..."}` | `Record<string, string>` | **Moderate** | UX warning (user prose) |
| `tryramadan-hadith-viewed-dates` | `["2025-03-01","2025-03-02"]` | `string[]` | **Non-sensitive** | None |
| `tryramadan-quran-verse-viewed-dates` | `["2025-03-01",...]` | `string[]` | **Non-sensitive** | None |
| `tryramadan-learn-read` | `["/learn/glossary","/dashboard/quran"]` | `string[]` | **Non-sensitive** | None |
| `tryramadan-prayer-tracker` | `{"2025-03-15":{"Fajr":true,"Dhuhr":false,...}}` | `Record<string, Record<string, boolean>>` | **Non-sensitive** | None |
| `tryramadan-prayer-times-cache` | `{"lat":51.5,"lng":-0.1,"cachedAt":"...","data":{...}}` | API cache | **Moderate** | Contains coords; treat as moderate |
| `tryramadan-ramadan-prayers` | `{"key":"...","prayerTimesMap":{...}}` | API cache | **Moderate** | May include coords in key | 
| `tryramadan-reminders-sent` | `{"2025-03-15":["suhoor","iftar"]}` | `Record<string, ReminderType[]>` | **Non-sensitive** | None |
| `tryramadan-pwa-install-dismissed` | `"1"` | string | **Non-sensitive** | None |
| `tryramadan-dismissed-location-banner` | `"1"` | string | **Non-sensitive** | None |

---

## Sensitivity definitions

| Level | Criteria | Examples |
|-------|----------|----------|
| **High** | Health, spirituality/faith, precise location, intimate personal data | Journal content, wellness/symptoms, health screening, menstruation dates, coords |
| **Moderate** | Behavioural patterns, dietary info, personal goals, user-written notes | Fasting history, meal logs, schedule notes, goals, calories |
| **Non-sensitive** | UI state, feature flags, API cache without PII | Theme, quick action order, viewed dates, notification toggles |

---

## Recommended treatments

### For highly sensitive data

| Data | Treatment | Rationale |
|------|-----------|-----------|
| **Journal entries** | 1. **UX warning** (primary). 2. Optional: client-side encryption with user-chosen passphrase (complex; key management is hard). | Journal can contain deeply personal reflections. Encryption adds friction and key-loss risk. |
| **Health / wellness / symptoms** | **UX warning** (primary). Consider: store only mood number + date; avoid free-text `note` or truncate to 100 chars. | Reduces detail while preserving functionality. |
| **Onboarding draft (healthWarnings, location)** | **UX warning**. Clear draft when onboarding completes (already done). Don’t persist healthWarnings to final preferences if avoidable. | Draft is transient; final prefs already contain location. |
| **Preferences (location, gender, menstruation)** | **UX warning**. Consider: store city/region only (e.g. "London") instead of lat/lng for display; keep coords only if prayer times need them. | Prayer times require coords; cannot fully eliminate. |

### For moderately sensitive data

| Data | Treatment | Rationale |
|------|-----------|-----------|
| **Fasting progress, meal logs, schedule notes** | **UX warning** | Behavioural data; useful for profiling but not as intimate as journal/health. |
| **Daily goals (calories, macros)** | **UX warning** | Health-adjacent; often considered private. |

### UX warning (recommended for all sensitive/moderate)

Add a one-time or dismissible notice, e.g. in Settings or on first use:

> **Your data stays on this device.** TryRamadan stores your journal, fasting history, and preferences in your browser’s local storage. Anyone with access to this device (or browser extensions) could read it. Don’t use on shared or public devices for sensitive entries.

Placement options:
- Settings → "Privacy & data"
- First journal save: "Your entries are saved only on this device. [Learn more]"
- Footer link: "How we store your data"

### Client-side encryption (optional, high effort)

- **Applicable to:** Journal entries, wellness notes, symptom notes.
- **Mechanism:** User sets a passphrase; encrypt before `setItem`, decrypt after `getItem`. Use Web Crypto API (AES-GCM).
- **Trade-offs:** Key loss = data loss; no recovery without passphrase; UX friction (prompt on each session).
- **Recommendation:** Only if user explicitly opts in (e.g. "Lock journal with passphrase" in Settings).

### Reducing detail

| Data | Current | Reduced |
|------|---------|---------|
| **Location coords** | `{lat, lng}` stored | Keep for prayer API; don’t store in export/backup if possible. |
| **Wellness note** | Free text | Cap at 200 chars; or store mood + date only. |
| **Journal content** | Full text | No reduction recommended—core feature. |
| **Schedule notes** | Full text | Cap at 500 chars if needed. |

---

## Implementation checklist

1. [x] Add "Privacy & data" or "How we store your data" section in Settings with the UX warning. (Done: Settings → Data & privacy.)
2. [x] Add optional notice on first journal save (dismissible). (Done: Journal first-save banner; key `tryramadan-journal-notice-dismissed`.)
3. [ ] Consider truncating wellness/symptom `note` fields (if any) to reduce exposure. (Optional.)
4. [x] Document in Privacy Policy / Terms that data is stored locally and can be read by anyone with device/extension access. (Done: Privacy and Settings copy.)
5. [ ] (Optional) Implement "Lock journal" with passphrase encryption for users who want it.
