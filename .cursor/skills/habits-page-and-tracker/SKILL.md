# Ramadan Habits Page and Habit Tracker

When to use: Adding or changing the **Habits page** (/habits), **habit data** (forbidden/sunnah from Quran and hadith), **journal habit tracker**, **habit log localStorage**, or **Settings/onboarding** options that control visibility of habits.

## Overview

- **Habits page** (`/habits`): Good and bad habits during Ramadan, with Quran and hadith quoted first, then explanation. Each habit has a **tag**: `everyone` (applies to all, including non-Muslims trying Ramadan) or `muslim` (e.g. neglecting prayers, Taraweeh).
- **Data** (`src/data/ramadan-habits.ts`): `RAMADAN_HABITS_FORBIDDEN`, `RAMADAN_HABITS_SUNNAH`, `getHabitsForUser(userType)`. All habits have `id`, `quote`, `sourceLabel`, `sourceUrl` (Quran.com or Sunnah.com), `explanation`, `tag`.
- **Journal habit tracker**: On the Reflection Journal (`/dashboard/journal`), for the selected date, a list of **sunnah** habits (filtered by `getHabitsForUser`) is shown as checkboxes. Selections are stored in **habit log**.
- **Habit log**: `tryramadan-habit-log` in localStorage. Shape: `Record<dateStr, Record<habitId, boolean>>`. Use `useHabitLog()` from `@/hooks/useLocalStorage`. Included in `TRYRAMADAN_LOCALSTORAGE_KEYS` for clear-all-data.
- **Settings**: `hideHabitsFromOnboarding` in preferences. When `true`, the “Ramadan habits” card/link on the onboarding **Goals** step is hidden.
- **Onboarding**: Goals step shows a card “Ramadan habits (Quran & hadith)” with link to `/habits` when `!preferences.hideHabitsFromOnboarding`.

## Testing

- **Route**: `/habits` is in `ROUTES` in `src/test/routes.test.tsx`; test “renders Habits at /habits” checks heading “Ramadan habits”.
- **Habit log**: Stored under `tryramadan-habit-log`. To test journal tracker: open Journal, pick a date, toggle habit checkboxes, reload and confirm state is persisted.
- **Filtering**: Non-Muslim mode (`userType !== 'muslim'`) should only see habits with `tag === 'everyone'` on the Habits page and in the journal tracker (e.g. no “Neglecting prayer”, “Taraweeh”, “I'tikaf” for non-Muslims).
- **Sources**: Every habit must have at least one `sourceUrl` (Quran.com or Sunnah.com). Do not alter Quran or hadith wording; quote accurately and link to the source.

## Adding or Editing a Habit

1. Edit `src/data/ramadan-habits.ts`.
2. Add to `RAMADAN_HABITS_FORBIDDEN` or `RAMADAN_HABITS_SUNNAH` with `id`, `tag` (`everyone` | `muslim`), `title`, `shortLabel` (for journal), `quote`, `sourceLabel`, `sourceUrl`, optional `sourceLabel2`/`sourceUrl2`, `explanation`.
3. Sunnah habits are shown in the journal tracker; forbidden habits are not trackable (they are “avoid” list).
4. Run route test and manual check on `/habits` and Journal.

## SEO

Habits page uses `PageSEO` with title “Ramadan Habits: Good and Bad Habits from Quran and Hadith | TryRamadan” and a description that mentions Quran, Sunnah, avoid/do, and links. Keep content detailed and source links correct for SEO.
