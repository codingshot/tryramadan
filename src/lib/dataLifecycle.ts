/**
 * Data lifecycle: purge utilities for TryRamadan.
 * See docs/DATA-LIFECYCLE-POLICIES.md and docs/SECURITY-PHYSICAL-ACCESS-AND-LIMITATIONS.md.
 *
 * TryRamadan stores user data in localStorage. This is NOT secure storage:
 * - Anyone with physical access to the device can read it (DevTools, profile copy).
 * - Browser extensions and malware may access it.
 * - Do not rely on it for sensitive data without optional client-side encryption.
 */

/** Key used for undo-after-clear-all; must NOT be in TRYRAMADAN_LOCALSTORAGE_KEYS so it survives deleteAllUserData. */
export const UNDO_BACKUP_KEY = "tryramadan-undo-backup";
const UNDO_BACKUP_MAX_AGE_MS = 15_000;

/** All localStorage keys used by TryRamadan. Must stay in sync with useLocalStorage and other consumers. */
export const TRYRAMADAN_LOCALSTORAGE_KEYS = [
  "tryramadan-preferences",
  "tryramadan-onboarding-draft",
  "tryramadan-journal",
  "tryramadan-progress",
  "tryramadan-notifications",
  "tryramadan-prayer-notifications",
  "tryramadan-adhan-sound-enabled",
  "tryramadan-adhan-notified",
  "tryramadan-reminders-sent",
  "tryramadan-today",
  "tryramadan-recipe-favorites",
  "tryramadan-goals-until-ramadan",
  "tryramadan-calendar-events",
  "tryramadan-wellness",
  "tryramadan-symptoms",
  "tryramadan-daily-goals",
  "tryramadan-recent-recipes",
  "tryramadan-dashboard-quick-actions",
  "tryramadan-day-meal-plans",
  "tryramadan-day-nutrition",
  "tryramadan-day-planned-items",
  "tryramadan-day-food-log",
  "tryramadan-schedule-notes",
  "tryramadan-hadith-viewed-dates",
  "tryramadan-quran-verse-viewed-dates",
  "tryramadan-learn-read",
  "tryramadan-prayer-tracker",
  "tryramadan-prayer-times-cache",
  "tryramadan-prayer-times-for-date-cache",
  "tryramadan-ramadan-prayers",
  "tryramadan-pwa-install-dismissed",
  "tryramadan-dismissed-location-banner",
  "tryramadan-journal-notice-dismissed",
] as const;

/**
 * Save a snapshot of data so the user can undo "Clear all data" after reload.
 * Call before deleteAllUserData(); then deleteAllUserData will skip UNDO_BACKUP_KEY.
 */
export function saveBackupBeforeClear(backup: Record<string, unknown>): void {
  try {
    window.localStorage.setItem(
      UNDO_BACKUP_KEY,
      JSON.stringify({ at: Date.now(), data: backup })
    );
  } catch {
    // ignore
  }
}

/**
 * If an undo backup exists and is recent, return it. Otherwise null.
 */
export function getUndoBackup(): { at: number; data: Record<string, unknown> } | null {
  try {
    const raw = window.localStorage.getItem(UNDO_BACKUP_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { at: number; data: Record<string, unknown> };
    if (Date.now() - parsed.at > UNDO_BACKUP_MAX_AGE_MS) return null;
    return parsed;
  } catch {
    return null;
  }
}

/**
 * Restore from undo backup: write each key back to localStorage, then remove backup and reload.
 */
export function restoreFromUndoBackup(): void {
  const backup = getUndoBackup();
  if (!backup) return;
  try {
    for (const [key, value] of Object.entries(backup.data)) {
      window.localStorage.setItem(key, JSON.stringify(value));
    }
    window.localStorage.removeItem(UNDO_BACKUP_KEY);
  } catch {
    // ignore
  }
  window.location.reload();
}

/**
 * Delete all TryRamadan data from this device: localStorage and Cache Storage.
 * Skips UNDO_BACKUP_KEY so undo-after-clear can work. Caller should navigate and reload after this.
 */
export async function deleteAllUserData(): Promise<void> {
  for (const key of TRYRAMADAN_LOCALSTORAGE_KEYS) {
    try {
      window.localStorage.removeItem(key);
    } catch {
      // ignore
    }
  }
  if ("caches" in window) {
    try {
      const names = await caches.keys();
      await Promise.all(names.map((name) => caches.delete(name)));
    } catch {
      // ignore
    }
  }
}

const JOURNAL_KEYS = ["tryramadan-journal"] as const;
const HEALTH_KEYS = ["tryramadan-wellness", "tryramadan-symptoms"] as const;

/** Clear journal only. Caller may re-render; no reload. */
export function clearJournalOnly(): void {
  JOURNAL_KEYS.forEach((key) => {
    try {
      window.localStorage.removeItem(key);
    } catch {
      // ignore
    }
  });
}

/** Clear wellness and symptom logs only. */
export function clearHealthDataOnly(): void {
  HEALTH_KEYS.forEach((key) => {
    try {
      window.localStorage.removeItem(key);
    } catch {
      // ignore
    }
  });
}

/**
 * Clear location from preferences (set to empty/default). Requires preferences to be re-read;
 * caller should update preferences state or reload.
 */
export function clearLocationFromPreferences(): void {
  try {
    const raw = window.localStorage.getItem("tryramadan-preferences");
    if (!raw) return;
    const prefs = JSON.parse(raw) as Record<string, unknown>;
    prefs.location = "";
    prefs.locationCoords = null;
    prefs.timezone = null;
    window.localStorage.setItem("tryramadan-preferences", JSON.stringify(prefs));
  } catch {
    // ignore
  }
}
