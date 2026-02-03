---
name: onboarding-and-re-onboarding
description: Onboarding and re-onboarding flows in TryRamadan. Covers step order, persistence (draft vs final preferences), redirect to dashboard, and edge cases (abandonment, skip location, Muslim vs Non-Muslim path). Use when changing onboarding steps, routes, or completion logic.
---

# Onboarding and Re-onboarding (TryRamadan)

Use this skill when **changing onboarding steps**, **completion logic**, or **redirect to dashboard** so flows and persistence stay correct.

---

## 1. Step order and routes

| # | Step | Route | Required? |
|---|------|--------|------------|
| 1 | Welcome | `/onboarding/welcome` | — |
| 2 | Mode | `/onboarding/mode` | Yes (Muslim vs Non-Muslim; Muslim skips Knowledge) |
| 3 | Knowledge | `/onboarding/knowledge` | Yes if Non-Muslim |
| 4 | Health | `/onboarding/health` | Yes |
| 5 | Location | `/onboarding/location` | No (can "Skip for now"; Dashboard shows reminder if missing) |
| 6 | Schedule | `/onboarding/schedule` | Yes |
| 7 | Notifications | `/onboarding/notifications` | No |
| 8 | Priorities | `/onboarding/priorities` | Yes (defaults pre-filled) |
| 9 | Goals | `/onboarding/goals` | Goals optional |

**Doc:** **`docs/ONBOARDING-REONBOARDING-FLOWS.md`** (information order, time-of-Ramadan variants, abandonment, re-onboarding).

---

## 2. Persistence

- **Draft:** Onboarding state (mode, location, schedule, notifications, priorities, goals) is saved to `tryramadan-onboarding-draft` on every change. **Not** written to final preferences until completion.
- **On completion:** User clicks "Go to dashboard" on Goals. Then: `persistPreferencesSync(...)` (including `onboardingComplete: true`), `persistQuickActionsSync(...)` (from priorities). Redirect to `/dashboard`.
- **Dashboard redirect:** Dashboard redirects to `/onboarding/welcome` only when `!preferences.onboardingComplete && !hasTime` (and not still loading location). Once `onboardingComplete` is true, user is not forced back into onboarding.
- **local-storage-and-persistence skill:** Call `persistPreferencesSync` and `persistQuickActionsSync` **before** navigating away so Dashboard reads fresh data.

---

## 3. Edge cases

- **Location skipped:** Dashboard shows reminder until location is set or dismissed; prayer times need location for accuracy.
- **Abandonment mid-flow:** Draft remains in localStorage; user can resume or clear. No partial write to `tryramadan-preferences` until completion.
- **Re-onboarding:** If product supports "Redo onboarding," clear or merge preferences and ensure redirect and draft behavior are defined (see ONBOARDING-REONBOARDING-FLOWS).

---

## 4. Tests

- **Files:** `src/test/onboardingFlow.test.tsx`, `src/test/onboardingCritical.test.tsx`. Complete onboarding → land on dashboard; preferences persisted; no redirect loop.
- When adding or reordering steps, update tests and doc so order and required/skippable stay in sync.
