# Data Lifecycle Policies for Local-Only App

> **Implementation status:** Done. `deleteAllUserData()`, partial delete (clear journal, clear health data, clear location) in `src/lib/dataLifecycle.ts`. Settings: Data & privacy, journal/wellness/symptom retention (30/90/365). healthWarnings in preferences.

Design and testing of data lifecycle policies: where and how long data is stored, expiration/rotation strategies, delete-my-data flows, and Settings copy for data lifetime explanation.

---

## 1. Data storage map

### 1.1 Where and how long each data type is stored

| Data type | Storage | Key(s) | Retention | Notes |
|-----------|---------|--------|-----------|-------|
| **Journal** | localStorage | `tryramadan-journal` | Indefinite | Array of entries; no TTL |
| **Fasting log / progress** | localStorage | `tryramadan-progress` | Indefinite | completedDays, fastingLog, skippedDays |
| **Macros / meal plans** | localStorage | `tryramadan-day-meal-plans`, `tryramadan-day-food-log`, `tryramadan-day-planned-items`, `tryramadan-day-nutrition`, `tryramadan-daily-goals` | Indefinite | Per-day records |
| **Goals (pre-Ramadan)** | localStorage | `tryramadan-goals-until-ramadan` | Indefinite | Checklist items |
| **Preferences** | localStorage | `tryramadan-preferences` | Indefinite | Location, health-related fields, menstruation, etc. |
| **Notifications** | localStorage | `tryramadan-notifications`, `tryramadan-prayer-notifications`, `tryramadan-adhan-sound-enabled`, `tryramadan-adhan-notified`, `tryramadan-reminders-sent` | Indefinite | Settings + per-day reminder tracking |
| **Cached prayer times** | localStorage | `tryramadan-prayer-times-cache`, `tryramadan-ramadan-prayers` | Indefinite | Single-entry cache; invalidated by date/location change |
| **Location** | localStorage | Inside `tryramadan-preferences` (locationCoords, timezone) | Indefinite | Persisted as part of preferences |
| **Today data** | localStorage | `tryramadan-today` | Indefinite | Intention, hydration, energy per day |
| **Wellness / symptoms** | localStorage | `tryramadan-wellness`, `tryramadan-symptoms` | Indefinite | Health check-ins per day |
| **Calendar events** | localStorage | `tryramadan-calendar-events` | Indefinite | Per-day events for .ics export |
| **Schedule notes** | localStorage | `tryramadan-schedule-notes` | Indefinite | User notes per day |
| **Onboarding draft** | localStorage | `tryramadan-onboarding-draft` | Until completion | Contains healthWarnings; cleared on save |
| **UI state** | localStorage | `tryramadan-dashboard-quick-actions`, `tryramadan-recipe-favorites`, `tryramadan-recent-recipes`, `tryramadan-hadith-viewed-dates`, `tryramadan-quran-verse-viewed-dates`, `tryramadan-learn-read`, `tryramadan-prayer-tracker`, `tryramadan-pwa-install-dismissed`, `tryramadan-dismissed-location-banner` | Indefinite | Non-sensitive |
| **Service worker caches** | Cache Storage API | Workbox caches: prayer-times-cache, nominatim-cache, ipapi-cache, timeapi-cache, google-fonts-cache, gstatic-fonts-cache + precache | 24h–1 year (runtime); until SW update (precache) | API responses, fonts, app shell |
| **IndexedDB** | — | None | — | App does not use IndexedDB |

### 1.2 Summary: current retention

- **localStorage:** All keys persist until explicitly cleared by user or browser.
- **Service worker:** Runtime caches have TTLs (24h–1 year); precache tied to SW version.
- **No automatic expiration** for user data (journal, fasting, macros, goals, preferences, etc.).

---

## 2. Expiration and rotation recommendations

### 2.1 Sensitive data: clear after onboarding

| Data | Current | Recommendation | Rationale |
|------|---------|----------------|-----------|
| **Onboarding draft (`tryramadan-onboarding-draft`)** | Cleared when user completes onboarding | ✅ Already cleared | Contains healthWarnings, location; transient |
| **Health answers in onboarding** | Stored in draft; not persisted to preferences | Consider: never persist healthWarnings to UserPreferences | Reduces long-term storage of health conditions |

### 2.2 Optional auto-delete for old journals

| Data | Recommendation | Implementation |
|------|----------------|----------------|
| **Journal entries** | Add optional "Auto-delete journals older than X" in Settings | New setting: `journalRetentionDays: number | null` (null = keep forever). On load or periodic check, delete entries where `date` is older than retention. Default: `null`. Options: 30, 90, 365, null. |
| **Wellness / symptoms** | Same optional retention | `wellnessRetentionDays`, `symptomRetentionDays`; cap at 365 or align with journal. |
| **Today data (intention, hydration, energy)** | Optional retention | Align with journal or simpler: keep last 60 days only. |
| **Schedule notes** | Optional retention | Align with journal retention. |

### 2.3 Bounded growth for non-sensitive data

| Data | Current | Recommendation |
|------|---------|----------------|
| **hadith-viewed-dates** | `.slice(-60)` (60 days) | ✅ Already bounded |
| **quran-verse-viewed-dates** | `.slice(-60)` | ✅ Already bounded |
| **recent-recipes** | `.slice(0, 20)` | ✅ Already bounded |
| **Prayer times cache** | Single entry; invalidated by date/location | ✅ Effectively bounded |
| **Ramadan prayers cache** | Trimmed to current Ramadan | ✅ Already bounded |

### 2.4 Cached prayer times and location

- **Prayer times cache:** Single entry; overwritten on each fetch. Consider: add `savedAt` check; if older than 7 days and location unchanged, treat as stale and refetch.
- **Location:** Stored in preferences. No auto-expiry needed; user can change or clear in Settings.

---

## 3. Delete-my-data flows

### 3.1 Scope: what must be purged

A full "Delete my data" must clear:

1. **All localStorage keys** prefixed or used by TryRamadan (see full list below).
2. **Service worker caches** — Workbox cache names used at runtime and precache.

### 3.2 Full list of localStorage keys to purge

```
tryramadan-preferences
tryramadan-onboarding-draft
tryramadan-journal
tryramadan-progress
tryramadan-notifications
tryramadan-prayer-notifications
tryramadan-adhan-sound-enabled
tryramadan-adhan-notified
tryramadan-reminders-sent
tryramadan-today
tryramadan-recipe-favorites
tryramadan-goals-until-ramadan
tryramadan-calendar-events
tryramadan-wellness
tryramadan-symptoms
tryramadan-daily-goals
tryramadan-recent-recipes
tryramadan-dashboard-quick-actions
tryramadan-day-meal-plans
tryramadan-day-nutrition
tryramadan-day-planned-items
tryramadan-day-food-log
tryramadan-schedule-notes
tryramadan-hadith-viewed-dates
tryramadan-quran-verse-viewed-dates
tryramadan-learn-read
tryramadan-prayer-tracker
tryramadan-prayer-times-cache
tryramadan-ramadan-prayers
tryramadan-pwa-install-dismissed
tryramadan-dismissed-location-banner
```

### 3.3 Service worker / Cache Storage purge

Workbox cache names (from vite.config.ts and generateSW):

- `prayer-times-cache`
- `nominatim-cache`
- `ipapi-cache`
- `timeapi-cache`
- `google-fonts-cache`
- `gstatic-fonts-cache`
- `workbox-precache-v2-...` (or similar — Workbox generates this; can be discovered via `caches.keys()`)

**Approach:** Call `caches.keys()` and delete all caches that match TryRamadan’s scope (e.g. names containing `workbox`, `prayer-times`, `nominatim`, `ipapi`, `timeapi`, `google-fonts`, `gstatic`). Or delete all caches for the origin: `caches.keys().then(keys => Promise.all(keys.map(k => caches.delete(k))))`.

### 3.4 IndexedDB

App does not use IndexedDB. No purge needed.

### 3.5 Recommended UI flow

1. **Settings → Privacy & data** (or new section "Data & privacy").
2. **"Delete all my data"** button.
3. **Confirmation dialog:**  
   "This will permanently delete all your data from this device: journal entries, fasting history, meal plans, preferences, and cached content. You cannot undo this. Export your data first if you want a backup. Continue?"
4. **On confirm:**
   - Clear all localStorage keys (full list above).
   - Clear all Cache Storage caches for this origin.
   - Navigate to `/` (or `/onboarding` if appropriate) and reload so app starts fresh.

### 3.6 Partial delete options (optional)

| Option | Scope |
|--------|-------|
| **Reset fasting progress** | ✅ Already exists — resets `tryramadan-progress` only |
| **Clear journal only** | New: clear `tryramadan-journal` |
| **Clear health data** | New: clear `tryramadan-wellness`, `tryramadan-symptoms` |
| **Clear location** | New: set `location`, `locationCoords`, `timezone` to defaults in preferences |

---

## 4. Implementation checklist

### 4.1 Central purge utility

Create `src/lib/dataLifecycle.ts` (or similar):

```ts
/** All localStorage keys used by TryRamadan. Must stay in sync with useLocalStorage and other consumers. */
export const TRYRAMADAN_LOCALSTORAGE_KEYS = [
  'tryramadan-preferences',
  'tryramadan-onboarding-draft',
  'tryramadan-journal',
  'tryramadan-progress',
  'tryramadan-notifications',
  'tryramadan-prayer-notifications',
  'tryramadan-adhan-sound-enabled',
  'tryramadan-adhan-notified',
  'tryramadan-reminders-sent',
  'tryramadan-today',
  'tryramadan-recipe-favorites',
  'tryramadan-goals-until-ramadan',
  'tryramadan-calendar-events',
  'tryramadan-wellness',
  'tryramadan-symptoms',
  'tryramadan-daily-goals',
  'tryramadan-recent-recipes',
  'tryramadan-dashboard-quick-actions',
  'tryramadan-day-meal-plans',
  'tryramadan-day-nutrition',
  'tryramadan-day-planned-items',
  'tryramadan-day-food-log',
  'tryramadan-schedule-notes',
  'tryramadan-hadith-viewed-dates',
  'tryramadan-quran-verse-viewed-dates',
  'tryramadan-learn-read',
  'tryramadan-prayer-tracker',
  'tryramadan-prayer-times-cache',
  'tryramadan-ramadan-prayers',
  'tryramadan-pwa-install-dismissed',
  'tryramadan-dismissed-location-banner',
] as const;

export async function deleteAllUserData(): Promise<void> {
  for (const key of TRYRAMADAN_LOCALSTORAGE_KEYS) {
    try {
      window.localStorage.removeItem(key);
    } catch {
      // ignore
    }
  }
  if ('caches' in window) {
    const names = await caches.keys();
    await Promise.all(names.map((name) => caches.delete(name)));
  }
}
```

### 4.2 Tests

- Unit test: `deleteAllUserData` removes all known keys and does not throw. (Done: `src/test/dataLifecycle.test.ts`.)
- Unit test: After `deleteAllUserData`, non-tryramadan keys left intact. (Done.)
- Unit tests: `clearJournalOnly`, `clearHealthDataOnly`, `clearLocationFromPreferences` each remove only their target data. (Done: dataLifecycle.test.ts partial delete describe block.)
- Integration/E2E: After delete, app shows onboarding or clean state; no residual data. (Optional.)

---

## 5. Data lifetime explanation for Settings

### 5.1 Recommended copy

Add a **"Data & privacy"** or **"How we store your data"** section in Settings with this copy:

---

**Your data stays on this device**

TryRamadan stores all your data locally in your browser: journal entries, fasting history, meal plans, preferences, and prayer times. Nothing is sent to our servers.

**How long we keep it**

- Your data stays until you delete it or clear your browser data.
- Cached prayer times and location are refreshed when you use the app.
- You can export your data anytime (Settings → Export data) or delete everything (Settings → Delete all my data).

**Privacy note**

Anyone with access to this device (or browser extensions) could read your stored data. For sensitive entries, avoid using shared or public devices.

---

### 5.2 Placement

- **Section:** "Data & privacy" or "Privacy & data" in Settings, above or near "Reset all progress" and "Export data".
- **Link:** Optional "Learn more" → `/privacy` or anchor to a "Data storage" subsection on the Privacy page.

---

## 6. Summary table

| Area | Current state | Recommendation |
|------|---------------|----------------|
| **Journal** | Indefinite | Optional auto-delete (30/90/365 days) in Settings |
| **Fasting log** | Indefinite | Keep; user can "Reset progress" or "Delete all data" |
| **Macros / meals** | Indefinite | Keep; included in full delete |
| **Goals** | Indefinite | Keep; included in full delete |
| **Preferences** | Indefinite | Keep; include in full delete |
| **Notifications** | Indefinite | Keep; include in full delete |
| **Prayer times cache** | Single entry, overwritten | Consider 7-day staleness check |
| **Location** | In preferences | Keep; user controls in Settings |
| **Health answers (onboarding)** | Draft only | Already transient; avoid persisting healthWarnings |
| **Delete my data** | Only "Reset progress" | Add full "Delete all my data" (localStorage + caches) |
| **Data lifetime copy** | None | Add section in Settings per §5 |
