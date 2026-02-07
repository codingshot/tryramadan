import * as React from 'react';
import { toLocalDateString, getTodayStringInTimezone } from '@/lib/utils';
import { getTimezoneFromCoords } from '@/hooks/useLocation';
import { getRamadanStartForYear, getRamadanEndForYear } from '@/lib/ramadan';

export function useLocalStorage<T>(key: string, initialValue: T): [T, (value: T | ((prev: T) => T)) => void] {
  // Get stored value or use initial
  const [storedValue, setStoredValue] = React.useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      if (!item) return initialValue;
      const parsed = JSON.parse(item);
      if (parsed === null || parsed === undefined) return initialValue;
      return parsed as T;
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  // Update localStorage when state changes
  React.useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(storedValue));
    } catch (error) {
      console.error(`Error setting localStorage key "${key}":`, error);
    }
  }, [key, storedValue]);

  return [storedValue, setStoredValue];
}

/** How much religion/learning content the user wants. */
export type LearningPriority = 'minimal' | 'moderate' | 'deep';
/** Interest in culture and food recipes. */
export type CultureRecipesPriority = 'none' | 'some' | 'lots';
/** Interest in Quran (reading, glossary). */
export type QuranPriority = 'none' | 'some' | 'daily';

// User preferences interface
export interface UserPreferences {
  userType: 'new' | 'muslim' | null;
  experience: string;
  location: string;
  locationCoords: { lat: number; lng: number } | null;
  /** IANA timezone (e.g. America/New_York) for the selected location; used for navbar time. */
  timezone: string | null;
  fastingGoal: string;
  onboardingComplete: boolean;
  selectedProgram: string;
  notificationsEnabled: boolean;
  suhoorReminder: string;
  iftarReminder: string;
  theme: 'light' | 'dark' | 'system';
  /** UI language code (e.g. en, ar). */
  language: string;
  /** Country/region code for display (e.g. US, GB). */
  country: string;
  /** How much religion/learning content to show. */
  learningPriority: LearningPriority;
  /** Interest in culture & recipes. */
  cultureRecipesPriority: CultureRecipesPriority;
  /** Interest in Quran (and glossary). */
  quranPriority: QuranPriority;
  /** Show macro tracking (Meals/Macros). */
  macroTrackingEnabled: boolean;
  /** Biological sex for calorie estimate when macro tracking is on (optional). */
  sexForCalories: 'male' | 'female' | null;
  /** Body weight in kg for calorie recommendation (optional). Used with sex for suggested daily calories. */
  bodyWeightKg: number | null;
  /** Simplify features based on location (e.g. local times, fewer options). */
  simplifyByLocation: boolean;
  /** Daily water goal in ml; 0 = use region default from country. */
  hydrationGoalMl: number;
  /** Enable hydration reminders during non-fasting hours. */
  hydrationReminderEnabled: boolean;
  /** Times for hydration reminders (HH:mm), e.g. ["12:00", "15:00", "19:00"]. */
  hydrationReminderTimes: string[];
  /** Voluntary Sunnah fasting IDs: monday-thursday, ayyam-al-beed, etc. */
  voluntaryFasting: string[];
  /** Show streak counter and achievement badges. When false, simpler progress view. */
  showStreakAndAchievements: boolean;
  /** Gender for personalization; female enables menstruation tracking. */
  gender: 'male' | 'female' | 'prefer-not-to-say' | null;
  /** Enable menstruation pattern tracking to mark excused fasting days. Only relevant when gender is female. */
  menstruationTrackingEnabled: boolean;
  /** Average cycle length in days (e.g. 28). Used for prediction. */
  menstruationCycleDays: number;
  /** Average period length in days (e.g. 5). */
  menstruationPeriodDays: number;
  /** Last period start date (ISO YYYY-MM-DD). Used to predict next excused days. */
  menstruationLastStartDate: string | null;
  /** Health considerations from onboarding (e.g. diabetes, pregnancy). Used for contextual reminders. */
  healthWarnings: string[];
  /** Auto-delete journal entries older than this many days. null = keep forever. */
  journalRetentionDays: number | null;
  /** Auto-delete wellness entries older than this many days. null = keep forever. */
  wellnessRetentionDays: number | null;
  /** Auto-delete symptom entries older than this many days. null = keep forever. */
  symptomRetentionDays: number | null;
  /** Custom Ramadan start (YYYY-MM-DD) to match community; null = use app calendar. */
  ramadanStartOverride: string | null;
  /** Custom Ramadan end (YYYY-MM-DD); null = use app calendar. */
  ramadanEndOverride: string | null;
  /** When true, hide the habits / Ramadan habits step or link from onboarding flows. */
  hideHabitsFromOnboarding: boolean;
}

export const defaultPreferences: UserPreferences = {
  userType: null,
  experience: '',
  location: '',
  locationCoords: null,
  timezone: null,
  fastingGoal: 'full',
  onboardingComplete: false,
  selectedProgram: 'traditional',
  notificationsEnabled: false,
  suhoorReminder: '04:30',
  iftarReminder: '18:30',
  theme: 'dark',
  language: 'en',
  country: 'US',
  learningPriority: 'moderate',
  cultureRecipesPriority: 'some',
  quranPriority: 'some',
  macroTrackingEnabled: false,
  sexForCalories: null,
  bodyWeightKg: null,
  simplifyByLocation: true,
  hydrationGoalMl: 0,
  hydrationReminderEnabled: false,
  hydrationReminderTimes: ['12:00', '15:00', '19:00'],
  voluntaryFasting: [],
  showStreakAndAchievements: true,
  gender: null,
  menstruationTrackingEnabled: false,
  menstruationCycleDays: 28,
  menstruationPeriodDays: 5,
  menstruationLastStartDate: null,
  healthWarnings: [],
  journalRetentionDays: null,
  wellnessRetentionDays: null,
  symptomRetentionDays: null,
  ramadanStartOverride: null,
  ramadanEndOverride: null,
  hideHabitsFromOnboarding: false,
};

const PREFERENCES_KEY = 'tryramadan-preferences';

/** Persist preferences to localStorage synchronously. Use before navigating so Dashboard reads fresh data. */
export function persistPreferencesSync(partial: Partial<UserPreferences>): void {
  try {
    const raw = typeof window !== 'undefined' ? window.localStorage.getItem(PREFERENCES_KEY) : null;
    const current = raw ? JSON.parse(raw) : {};
    const merged = { ...defaultPreferences, ...current, ...partial };
    window.localStorage.setItem(PREFERENCES_KEY, JSON.stringify(merged));
  } catch (e) {
    console.error('persistPreferencesSync:', e);
  }
}

export function useUserPreferences() {
  const [stored, setStored] = useLocalStorage<UserPreferences>(PREFERENCES_KEY, defaultPreferences);
  // Ensure we always have all keys (merge with defaults for old or partial localStorage)
  const preferences: UserPreferences = { ...defaultPreferences, ...stored };
  return [preferences, setStored] as const;
}

/**
 * Effective timezone for display (navbar, timer, prayers). Uses preferences.timezone when set;
 * when a location is set but timezone is missing, backfills from coordinates and persists.
 */
export function useDisplayTimezone(): string | null {
  const [preferences, setPreferences] = useUserPreferences();
  React.useEffect(() => {
    const coords = preferences.locationCoords;
    if (!coords || preferences.timezone != null) return;
    let cancelled = false;
    getTimezoneFromCoords(coords.lat, coords.lng).then((tz) => {
      if (!cancelled && tz) setPreferences((prev) => ({ ...prev, timezone: tz }));
    });
    return () => { cancelled = true; };
  }, [preferences.locationCoords, preferences.timezone, setPreferences]);
  return preferences.timezone ?? null;
}

/** User type from preferences (matches onboarding mode). */
export type UserTypeForLabel = UserPreferences['userType'];

/**
 * Returns the user-facing label for "Iftar" based on onboarding: Muslims see "Iftar";
 * non-Muslim / new / curious users see "Breaking Fast (Iftar)" so they understand how fasting works.
 */
export function getIftarLabel(userType: UserTypeForLabel): string {
  return userType === 'muslim' ? 'Iftar' : 'Breaking Fast (Iftar)';
}

/** Lowercase/short form for use in prose (e.g. "after iftar" / "after breaking fast"). */
export function getIftarLabelShort(userType: UserTypeForLabel): string {
  return userType === 'muslim' ? 'iftar' : 'breaking fast';
}

/** Hook: user-facing Iftar label based on preferences (for non-Muslims: "Breaking Fast (Iftar)"). */
export function useIftarLabel(): string {
  const [preferences] = useUserPreferences();
  return getIftarLabel(preferences.userType);
}

/** Hook: short form for prose (e.g. "after breaking fast"). */
export function useIftarLabelShort(): string {
  const [preferences] = useUserPreferences();
  return getIftarLabelShort(preferences.userType);
}

/**
 * Returns the user-facing label for "Suhoor" based on onboarding: Muslims see "Suhoor";
 * non-Muslim users see "Suhoor (pre-dawn meal)" for clarity.
 */
export function getSuhoorLabel(userType: UserTypeForLabel): string {
  return userType === 'muslim' ? 'Suhoor' : 'Suhoor (pre-dawn meal)';
}

/** Short form for tabs/prose (e.g. "Log Suhoor" vs "Log pre-dawn meal (Suhoor)"). */
export function getSuhoorLabelShort(userType: UserTypeForLabel): string {
  return userType === 'muslim' ? 'Suhoor' : 'pre-dawn meal (Suhoor)';
}

export function useSuhoorLabel(): string {
  const [preferences] = useUserPreferences();
  return getSuhoorLabel(preferences.userType);
}

export function useSuhoorLabelShort(): string {
  const [preferences] = useUserPreferences();
  return getSuhoorLabelShort(preferences.userType);
}

/** Whether user has menstruation tracking enabled (female + tracking on). */
export function useMenstruationTrackingEnabled(): boolean {
  const [preferences] = useUserPreferences();
  return preferences.gender === 'female' && (preferences.menstruationTrackingEnabled ?? false);
}

/** Predicted menstruation dates for Ramadan (excused fasting days). Returns ISO date strings. */
export function getPredictedMenstruationDates(
  lastStart: string | null,
  cycleDays: number,
  periodDays: number,
  ramadanStartIso: string,
  ramadanEndIso: string
): string[] {
  if (!lastStart) return [];
  const dates: string[] = [];
  const start = new Date(ramadanStartIso + 'T12:00:00').getTime();
  const end = new Date(ramadanEndIso + 'T12:00:00').getTime();
  let cursor = new Date(lastStart + 'T12:00:00').getTime();
  const dayMs = 24 * 60 * 60 * 1000;
  while (cursor <= end + cycleDays * dayMs) {
    if (cursor >= start && cursor <= end) {
      for (let d = 0; d < periodDays; d++) {
        const t = cursor + d * dayMs;
        const str = new Date(t).toISOString().split('T')[0];
        if (str >= ramadanStartIso && str <= ramadanEndIso && !dates.includes(str)) {
          dates.push(str);
        }
      }
    }
    cursor += cycleDays * dayMs;
  }
  return [...new Set(dates)].sort();
}

/** Check if a date is a predicted menstruation day (excused). */
export function isPredictedMenstruationDay(
  date: string,
  preferences: Pick<UserPreferences, 'gender' | 'menstruationTrackingEnabled' | 'menstruationLastStartDate' | 'menstruationCycleDays' | 'menstruationPeriodDays'>
): boolean {
  if (preferences.gender !== 'female' || !preferences.menstruationTrackingEnabled || !preferences.menstruationLastStartDate) {
    return false;
  }
  const year = new Date(date + 'T12:00:00').getFullYear();
  const ramadanStart = getRamadanStartForYear(year);
  const ramadanEnd = getRamadanEndForYear(year);
  const ramadanStartIso = toLocalDateString(ramadanStart);
  const ramadanEndIso = toLocalDateString(ramadanEnd);
  const predicted = getPredictedMenstruationDates(
    preferences.menstruationLastStartDate,
    preferences.menstruationCycleDays ?? 28,
    preferences.menstruationPeriodDays ?? 5,
    ramadanStartIso,
    ramadanEndIso
  );
  return predicted.includes(date);
}

/** Predetermined reasons for breaking a fast (stored by id). */
export const BROKEN_FAST_REASONS = [
  { id: 'mistake', label: 'Ate or drank by mistake' },
  { id: 'illness', label: 'Illness / not well' },
  { id: 'travel', label: 'Travel (musafir)' },
  { id: 'menstruation', label: 'Menstruation' },
  { id: 'medical', label: 'Medical need / doctor\'s advice' },
  { id: 'other', label: 'Other' },
] as const;

export type BrokenFastReasonId = (typeof BROKEN_FAST_REASONS)[number]['id'];

export function getBrokenReasonLabel(id: string | undefined): string {
  if (!id) return '—';
  const r = BROKEN_FAST_REASONS.find((x) => x.id === id);
  return r ? r.label : id;
}

// Fasting log entry - one per day when user logs fasting
export interface FastingLogEntry {
  date: string; // ISO date YYYY-MM-DD
  startedAt: string; // ISO datetime when user clicked "I'm fasting"
  completedAt?: string; // ISO datetime when user marked day complete
  status: 'in_progress' | 'completed' | 'broken';
  /** Hours fasted (from startedAt to completedAt or now). Set when completed/broken. */
  hoursFasted?: number;
  /** Predetermined reason id when status is 'broken'. */
  brokenReason?: string;
}

// Fasting progress interface
export interface FastingProgress {
  currentDay: number;
  totalDays: number;
  completedDays: string[]; // ISO date strings
  /** Days user explicitly marked as "I didn't fast" (illness, travel, etc.). */
  skippedDays?: string[];
  sunnahDaysCompleted: number;
  currentStreak: number;
  longestStreak: number;
  startDate: string | null;
  fastingLog: FastingLogEntry[]; // log of fasting sessions
}

export const defaultProgress: FastingProgress = {
  currentDay: 1,
  totalDays: 30,
  completedDays: [],
  skippedDays: [],
  sunnahDaysCompleted: 0,
  currentStreak: 0,
  longestStreak: 0,
  startDate: null,
  fastingLog: [],
};

/** Normalize progress so no date is in both completedDays and skippedDays (skipped wins). See FALL-OFF-AND-RETURN-FLOWS §3. */
export function normalizeProgressSameDayConflict(p: FastingProgress): FastingProgress {
  const completedDays = Array.isArray(p.completedDays) ? p.completedDays : [];
  const skipped = new Set(p.skippedDays ?? []);
  const completed = completedDays.filter((d) => !skipped.has(d));
  if (completed.length === completedDays.length && Array.isArray(p.completedDays)) return p;
  return { ...p, completedDays: completed };
}

export function useFastingProgress() {
  const [stored, setStored] = useLocalStorage<FastingProgress>('tryramadan-progress', defaultProgress);
  // Migrate old progress: ensure fastingLog and skippedDays exist; normalize same-day conflict (completed vs skipped)
  const progress: FastingProgress = React.useMemo(() => {
    const migrated: FastingProgress = {
      ...defaultProgress,
      ...stored,
      completedDays: Array.isArray(stored.completedDays) ? stored.completedDays : [],
      fastingLog: Array.isArray(stored.fastingLog) ? stored.fastingLog : [],
      skippedDays: Array.isArray(stored.skippedDays) ? stored.skippedDays : [],
    };
    return normalizeProgressSameDayConflict(migrated);
  }, [stored]);
  // Persist normalized form once if we had to remove overlap (fix legacy data)
  React.useEffect(() => {
    const skipped = new Set(stored.skippedDays ?? []);
    const completed = (stored.completedDays ?? []).filter((d) => !skipped.has(d));
    if (completed.length !== (stored.completedDays ?? []).length) {
      setStored((prev) => ({ ...prev, completedDays: completed }));
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps -- run once on mount to fix legacy overlap
  }, []);
  return [progress, setStored] as const;
}

// --- Fasting tracker helpers (with console logging) ---

const LOG_PREFIX = '[TryRamadan]';

/** Today's date as YYYY-MM-DD in the user's local timezone (for consistent calendar/tracking). */
export function getTodayDateString(): string {
  return toLocalDateString(new Date());
}

/** When todayOverride is provided (e.g. location's today from display timezone), use it so fasting log aligns with countdowns. */
/** Get the fasting log entry for a given date. If multiple entries exist for the same date (legacy/bug), returns the last one so behaviour is defined (EC-OV-8). */
export function getTodayFastingLog(progress: FastingProgress, todayOverride?: string): FastingLogEntry | undefined {
  const today = todayOverride ?? getTodayDateString();
  const matches = (progress.fastingLog || []).filter((e) => e.date === today);
  return matches.length > 0 ? matches[matches.length - 1] : undefined;
}

export function isFastingToday(progress: FastingProgress, todayOverride?: string): boolean {
  const entry = getTodayFastingLog(progress, todayOverride);
  return entry?.status === 'in_progress';
}

/** Start fasting today: add log entry, persist, and console.log. Pass todayOverride when using location-based "today". */
export function startFastingToday(
  progress: FastingProgress,
  setProgress: (value: FastingProgress | ((prev: FastingProgress) => FastingProgress)) => void,
  todayOverride?: string
): void {
  const today = todayOverride ?? getTodayDateString();
  const now = new Date().toISOString();
  const existing = progress.fastingLog?.find((e) => e.date === today);

  if (existing?.status === 'in_progress') {
    console.log(`${LOG_PREFIX} You are already fasting (since ${existing.startedAt})`);
    return;
  }

  const newEntry: FastingLogEntry = {
    date: today,
    startedAt: now,
    status: 'in_progress',
  };

  const updatedLog = progress.fastingLog
    ? [...progress.fastingLog.filter((e) => e.date !== today), newEntry]
    : [newEntry];

  // When starting a fast, clear "skipped" for this day so we don't have both skipped and in_progress (EC-SKIP-2).
  const skippedDays = progress.skippedDays ?? [];
  const newSkippedDays = skippedDays.includes(today) ? skippedDays.filter((d) => d !== today) : skippedDays;

  setProgress({
    ...progress,
    fastingLog: updatedLog,
    ...(skippedDays.includes(today) ? { skippedDays: newSkippedDays } : {}),
  });

  console.log(`${LOG_PREFIX} You are fasting. Started at ${now} (${today}).`);
}

/** Hours between two ISO datetime strings (for display). */
export function hoursBetween(startIso: string, endIso: string): number {
  const a = new Date(startIso).getTime();
  const b = new Date(endIso).getTime();
  return Math.round((b - a) / (1000 * 60 * 60) * 10) / 10;
}

/** Mark today's fast as completed: update log, add to completedDays, and console.log. Pass todayOverride when using location-based "today". */
export function completeFastingToday(
  progress: FastingProgress,
  setProgress: (value: FastingProgress | ((prev: FastingProgress) => FastingProgress)) => void,
  todayOverride?: string
): void {
  const today = todayOverride ?? getTodayDateString();
  const now = new Date().toISOString();
  const entry = progress.fastingLog?.find((e) => e.date === today);
  const startedAt = entry?.startedAt || now;
  const hoursFasted = hoursBetween(startedAt, now);

  const updatedLog = (progress.fastingLog || []).map((e) =>
    e.date === today ? { ...e, completedAt: now, status: 'completed' as const, hoursFasted } : e
  );
  if (!updatedLog.some((e) => e.date === today)) {
    updatedLog.push({ date: today, startedAt, completedAt: now, status: 'completed', hoursFasted });
  }

  const alreadyCompleted = progress.completedDays.includes(today);
  const completedDays = alreadyCompleted ? progress.completedDays : [...progress.completedDays, today];

  setProgress({
    ...progress,
    fastingLog: updatedLog,
    completedDays,
  });

  console.log(`${LOG_PREFIX} Fast completed. ${today} logged at ${now}. Total days: ${completedDays.length}`);
}

/** Mark today's fast as broken (e.g. early break): update log, remove from completedDays. Reason is a predetermined id from BROKEN_FAST_REASONS. brokeAt: ISO datetime when they broke (default: now). Pass todayOverride when using location-based "today". */
export function breakFastingToday(
  progress: FastingProgress,
  setProgress: (value: FastingProgress | ((prev: FastingProgress) => FastingProgress)) => void,
  reason?: string,
  todayOverride?: string,
  brokeAt?: string
): void {
  const today = todayOverride ?? getTodayDateString();
  const completedAt = (brokeAt && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/.test(brokeAt)) ? brokeAt : new Date().toISOString();
  const entry = progress.fastingLog?.find((e) => e.date === today);
  const startedAt = entry?.startedAt || completedAt;
  const hoursFasted = hoursBetween(startedAt, completedAt);
  const reasonId = reason && BROKEN_FAST_REASONS.some((r) => r.id === reason) ? reason : 'other';

  const updatedLog = (progress.fastingLog || []).map((e) =>
    e.date === today ? { ...e, completedAt, status: 'broken' as const, hoursFasted, brokenReason: reasonId } : e
  );
  if (!updatedLog.some((e) => e.date === today)) {
    updatedLog.push({ date: today, startedAt, completedAt, status: 'broken', hoursFasted, brokenReason: reasonId });
  }

  setProgress({
    ...progress,
    fastingLog: updatedLog,
    completedDays: progress.completedDays.filter((d) => d !== today),
  });

  console.log(`${LOG_PREFIX} Fast broken (${getBrokenReasonLabel(reasonId)}). ${today} at ${completedAt}. Hours fasted: ${hoursFasted}`);
}

/** Unmark today's fast (undo complete): remove from completedDays, set log to in_progress. Pass todayOverride when using location-based "today". */
export function uncompleteFastingToday(
  progress: FastingProgress,
  setProgress: (value: FastingProgress | ((prev: FastingProgress) => FastingProgress)) => void,
  todayOverride?: string
): void {
  const today = todayOverride ?? getTodayDateString();

  const updatedLog = (progress.fastingLog || []).map((e) =>
    e.date === today ? { ...e, completedAt: undefined, status: 'in_progress' as const } : e
  );

  setProgress({
    ...progress,
    fastingLog: updatedLog,
    completedDays: progress.completedDays.filter((d) => d !== today),
  });

  console.log(`${LOG_PREFIX} Undo completed. ${today} set back to in progress.`);
}

/** Set a specific day (ISO YYYY-MM-DD) as completed or not. Use for day view / click-through days. */
export function setDayCompleted(
  progress: FastingProgress,
  setProgress: (value: FastingProgress | ((prev: FastingProgress) => FastingProgress)) => void,
  dateStr: string,
  completed: boolean
): void {
  const has = progress.completedDays.includes(dateStr);
  if (completed && !has) {
    setProgress({ ...progress, completedDays: [...progress.completedDays, dateStr].sort() });
  } else if (!completed && has) {
    setProgress({ ...progress, completedDays: progress.completedDays.filter((d) => d !== dateStr) });
  }
}

/** Mark today (or dateStr) as "I didn't fast" (skipped). Removes any in_progress log for that day and adds to skippedDays. */
export function setDaySkipped(
  progress: FastingProgress,
  setProgress: (value: FastingProgress | ((prev: FastingProgress) => FastingProgress)) => void,
  todayOverride?: string
): void {
  const today = todayOverride ?? getTodayDateString();
  const skippedDays = progress.skippedDays ?? [];
  if (skippedDays.includes(today)) return;
  const updatedLog = (progress.fastingLog ?? []).filter((e) => e.date !== today);
  setProgress({
    ...progress,
    fastingLog: updatedLog,
    completedDays: progress.completedDays.filter((d) => d !== today),
    skippedDays: [...skippedDays, today].sort(),
  });
  console.log(`${LOG_PREFIX} Day skipped (didn't fast). ${today}`);
}

/** Update the broken reason for an existing broken log entry (E8). */
export function updateBrokenReason(
  progress: FastingProgress,
  setProgress: (value: FastingProgress | ((prev: FastingProgress) => FastingProgress)) => void,
  dateStr: string,
  reasonId: string
): void {
  const reason = BROKEN_FAST_REASONS.some((r) => r.id === reasonId) ? reasonId : "other";
  const updatedLog = (progress.fastingLog ?? []).map((e) =>
    e.date === dateStr && e.status === "broken" ? { ...e, brokenReason: reason } : e
  );
  setProgress({ ...progress, fastingLog: updatedLog });
  console.log(`${LOG_PREFIX} Broken reason updated for ${dateStr}: ${getBrokenReasonLabel(reason)}`);
}

/** Change a broken day to completed (B→C). Adds to completedDays, removes from skippedDays, updates log to completed. */
export function setBrokenDayToCompleted(
  progress: FastingProgress,
  setProgress: (value: FastingProgress | ((prev: FastingProgress) => FastingProgress)) => void,
  dateStr: string
): void {
  const completedAt = progress.fastingLog?.find((e) => e.date === dateStr && e.status === "broken")?.completedAt ?? new Date(dateStr + "T23:59:59Z").toISOString();
  const updatedLog = (progress.fastingLog ?? []).map((e) =>
    e.date === dateStr && e.status === "broken"
      ? { ...e, status: "completed" as const, completedAt }
      : e
  );
  const completedDays = progress.completedDays.includes(dateStr) ? progress.completedDays : [...progress.completedDays, dateStr].sort();
  const skippedDays = (progress.skippedDays ?? []).filter((d) => d !== dateStr);
  setProgress({ ...progress, fastingLog: updatedLog, completedDays, skippedDays });
  console.log(`${LOG_PREFIX} Broken day ${dateStr} marked as completed.`);
}

/** Change a broken day back to in-progress (B→I). Updates log only. */
export function setBrokenDayToInProgress(
  progress: FastingProgress,
  setProgress: (value: FastingProgress | ((prev: FastingProgress) => FastingProgress)) => void,
  dateStr: string
): void {
  const updatedLog = (progress.fastingLog ?? []).map((e) =>
    e.date === dateStr && e.status === "broken"
      ? { ...e, status: "in_progress" as const, completedAt: undefined }
      : e
  );
  setProgress({ ...progress, fastingLog: updatedLog });
  console.log(`${LOG_PREFIX} Broken day ${dateStr} set back to in progress.`);
}

// Notification settings
export interface NotificationSettings {
  suhoorEnabled: boolean;
  iftarEnabled: boolean;
  suhoorMinutesBefore: number;
  iftarMinutesBefore: number;
  dailyReminderEnabled: boolean;
  dailyReminderTime: string;
}

export const defaultNotificationSettings: NotificationSettings = {
  suhoorEnabled: true,
  iftarEnabled: true,
  suhoorMinutesBefore: 30,
  iftarMinutesBefore: 15,
  dailyReminderEnabled: false,
  dailyReminderTime: '08:00',
};

export function useNotificationSettings() {
  const [stored, setStored] = useLocalStorage<NotificationSettings>('tryramadan-notifications', defaultNotificationSettings);
  const settings: NotificationSettings = { ...defaultNotificationSettings, ...stored };
  return [settings, setStored] as const;
}

// Per-prayer notification toggles (Fajr, Dhuhr, Asr, Maghrib, Isha)
export type PrayerNotificationPrefs = Record<string, boolean>;

export const defaultPrayerNotificationPrefs: PrayerNotificationPrefs = {
  Fajr: true,
  Dhuhr: true,
  Asr: true,
  Maghrib: true,
  Isha: true,
};

export function usePrayerNotificationPrefs() {
  return useLocalStorage<PrayerNotificationPrefs>('tryramadan-prayer-notifications', defaultPrayerNotificationPrefs);
}

// Adhan: play sound at prayer times when notification fires (default true)
export function useAdhanSoundEnabled() {
  return useLocalStorage<boolean>('tryramadan-adhan-sound-enabled', true);
}

// Which prayers we've already triggered adhan/notification for today (avoid duplicate)
export function useAdhanNotifiedToday() {
  return useLocalStorage<Record<string, string[]>>('tryramadan-adhan-notified', {});
}

// Today's Fast page: intention, hydration, energy entries (per day)
export interface EnergyEntry {
  time: string; // ISO
  level: 1 | 2 | 3 | 4 | 5;
}

export interface HydrationEntry {
  time: string; // ISO
  amountMl: number;
}

export interface TodayData {
  date: string; // YYYY-MM-DD
  intention: string;
  hydrationGlasses: number;
  /** Per-entry water log in ml; total = sum(amountMl). Backward compat: if empty, display uses hydrationGlasses * 250. */
  hydrationEntries: HydrationEntry[];
  energyEntries: EnergyEntry[];
}

const defaultTodayData: TodayData = {
  date: "",
  intention: "",
  hydrationGlasses: 0,
  hydrationEntries: [],
  energyEntries: [],
};

export function useTodayData() {
  const [store, setStore] = useLocalStorage<Record<string, Omit<TodayData, "date">>>('tryramadan-today', {});
  const today = getTodayDateString();
  const todayData = store[today] || {
    intention: "",
    hydrationGlasses: 0,
    hydrationEntries: [],
    energyEntries: [],
  };

  const setIntention = React.useCallback((intention: string) => {
    setStore((prev) => {
      const existing = prev[today] || { intention: "", hydrationGlasses: 0, hydrationEntries: [], energyEntries: [] };
      return { ...prev, [today]: { ...existing, intention } };
    });
  }, [today, setStore]);

  const setHydrationGlasses = React.useCallback((glasses: number) => {
    setStore((prev) => {
      const existing = prev[today] || { intention: "", hydrationGlasses: 0, hydrationEntries: [], energyEntries: [] };
      return { ...prev, [today]: { ...existing, hydrationGlasses: Math.max(0, glasses) } };
    });
  }, [today, setStore]);

  const addHydrationEntry = React.useCallback((amountMl: number) => {
    const entry: HydrationEntry = { time: new Date().toISOString(), amountMl };
    setStore((prev) => {
      const existing = prev[today] || { intention: "", hydrationGlasses: 0, hydrationEntries: [], energyEntries: [] };
      return { ...prev, [today]: { ...existing, hydrationEntries: [...(existing.hydrationEntries || []), entry] } };
    });
  }, [today, setStore]);

  const addEnergyEntry = React.useCallback((level: 1 | 2 | 3 | 4 | 5) => {
    const entry: EnergyEntry = { time: new Date().toISOString(), level };
    setStore((prev) => {
      const existing = prev[today] || { intention: "", hydrationGlasses: 0, hydrationEntries: [], energyEntries: [] };
      return { ...prev, [today]: { ...existing, energyEntries: [...(existing.energyEntries || []), entry] } };
    });
  }, [today, setStore]);

  const hydrationEntries = todayData.hydrationEntries || [];
  const hydrationTotalMl = hydrationEntries.length
    ? hydrationEntries.reduce((sum, e) => sum + e.amountMl, 0)
    : (todayData.hydrationGlasses || 0) * 250;

  return {
    intention: todayData.intention,
    hydrationGlasses: todayData.hydrationGlasses,
    hydrationEntries,
    hydrationTotalMl,
    energyEntries: todayData.energyEntries || [],
    setIntention,
    setHydrationGlasses,
    addHydrationEntry,
    addEnergyEntry,
  };
}

// Recipe favorites: array of "suhoor-1", "iftar-2", etc.
export function useRecipeFavorites() {
  return useLocalStorage<string[]>('tryramadan-recipe-favorites', []);
}

// Goals until Ramadan: pre-Ramadan checklist (e.g. read Quran, give charity)
export interface GoalUntilRamadan {
  id: string;
  title: string;
  completed: boolean;
  dueDate?: string; // ISO date optional
  createdAt: string; // ISO
}

export function useGoalsUntilRamadan() {
  return useLocalStorage<GoalUntilRamadan[]>('tryramadan-goals-until-ramadan', []);
}

// Calendar events: quick-add suhoor, iftar, prayers, get food, custom — for export to .ics
export type CalendarEventType =
  | 'suhoor'
  | 'iftar'
  | 'fajr'
  | 'dhuhr'
  | 'asr'
  | 'maghrib'
  | 'isha'
  | 'taraweeh'
  | 'get_food'
  | 'custom';

export interface CalendarEvent {
  id: string;
  title: string;
  type: CalendarEventType;
  time: string; // "HH:mm"
  durationMinutes?: number;
  date: string; // YYYY-MM-DD (redundant with key but handy for export)
}

export function useCalendarEvents() {
  return useLocalStorage<Record<string, CalendarEvent[]>>('tryramadan-calendar-events', {});
}

/** Per-date overrides for prayer times (e.g. imsak, maghrib). Keys: YYYY-MM-DD. */
export type PrayerTimeOverrides = Record<string, Partial<{
  imsak: string;
  fajr: string;
  dhuhr: string;
  asr: string;
  maghrib: string;
  isha: string;
}>>;

export function usePrayerTimeOverrides() {
  return useLocalStorage<PrayerTimeOverrides>('tryramadan-prayer-time-overrides', {});
}

/** Which event types to include when syncing Ramadan to calendar and when exporting .ics (eat times + prayer times). */
export type CalendarIncludeTypes = Partial<Record<CalendarEventType, boolean>>;

const DEFAULT_CALENDAR_INCLUDE_TYPES: CalendarIncludeTypes = {
  suhoor: true,
  iftar: true,
  fajr: true,
  dhuhr: true,
  asr: true,
  maghrib: true,
  isha: true,
  taraweeh: true,
};

export function useCalendarIncludeTypes() {
  const [value, setValue] = useLocalStorage<CalendarIncludeTypes>('tryramadan-calendar-include-types', DEFAULT_CALENDAR_INCLUDE_TYPES);
  const safe = React.useMemo(() => (value && typeof value === 'object' && !Array.isArray(value) ? { ...DEFAULT_CALENDAR_INCLUDE_TYPES, ...value } : DEFAULT_CALENDAR_INCLUDE_TYPES), [value]);
  return [safe, setValue] as const;
}

/** Default duration in minutes per event type (for sync-to-calendar). */
export type DefaultPrayerDurations = Partial<Record<CalendarEventType, number>>;

const DEFAULT_PRAYER_DURATIONS: DefaultPrayerDurations = {
  suhoor: 5,
  iftar: 10,
  fajr: 5,
  dhuhr: 5,
  asr: 5,
  maghrib: 5,
  isha: 5,
  taraweeh: 60,
  get_food: 30,
  custom: 30,
};

export function useDefaultPrayerDurations() {
  const [value, setValue] = useLocalStorage<DefaultPrayerDurations>('tryramadan-default-prayer-durations', DEFAULT_PRAYER_DURATIONS);
  const safe = React.useMemo(() => (value && typeof value === 'object' && !Array.isArray(value) ? { ...DEFAULT_PRAYER_DURATIONS, ...value } : DEFAULT_PRAYER_DURATIONS), [value]);
  return [safe, setValue] as const;
}

export function getDefaultDurationForType(type: CalendarEventType, durations: DefaultPrayerDurations): number {
  return durations?.[type] ?? DEFAULT_PRAYER_DURATIONS[type] ?? 15;
}

// Wellness check-in: morning/evening mood (1-5) and optional note per day
export interface WellnessEntry {
  timeOfDay: 'morning' | 'evening';
  mood: 1 | 2 | 3 | 4 | 5;
  note?: string;
  timestamp: string;
}

export function useWellnessLog() {
  return useLocalStorage<Record<string, WellnessEntry[]>>('tryramadan-wellness', {});
}

// Symptom logger: symptom type, severity (1-5), timestamp
export interface SymptomEntry {
  symptom: string;
  severity: 1 | 2 | 3 | 4 | 5;
  timestamp: string;
}

export function useSymptomLog() {
  return useLocalStorage<Record<string, SymptomEntry[]>>('tryramadan-symptoms', {});
}

// --- Schedule: daily goals + per-day meal plan & nutrition ---

export interface DailyGoals {
  calories: number;
  protein: number; // grams
  carbs: number;   // grams
  fat: number;     // grams
}

export const defaultDailyGoals: DailyGoals = {
  calories: 2000,
  protein: 70,
  carbs: 250,
  fat: 65,
};

/** Reasonable daily calorie bounds so we never show impossible amounts. */
export const CALORIE_MIN = 800;
export const CALORIE_MAX = 5000;

/** Cap calories at CALORIE_MAX so we never show impossible amounts. Allows 0. */
export function clampCalories(value: number): number {
  if (Number.isNaN(value) || value < 0) return 0;
  if (value > CALORIE_MAX) return CALORIE_MAX;
  return Math.round(value);
}

/**
 * Suggested daily calories from sex and optional body weight (rough maintenance estimate).
 * With weight: ~28 kcal/kg (male) or ~26 kcal/kg (female). Without weight: 2200 / 1800 / 2000.
 */
export function getSuggestedCalories(sex: 'male' | 'female' | null, bodyWeightKg: number | null | undefined): number {
  if (bodyWeightKg != null && bodyWeightKg > 0) {
    const kcalPerKg = sex === 'female' ? 26 : sex === 'male' ? 28 : 27;
    return clampCalories(Math.round(bodyWeightKg * kcalPerKg));
  }
  if (sex === 'male') return clampCalories(2200);
  if (sex === 'female') return clampCalories(1800);
  return clampCalories(2000);
}

/** Get recommended daily calories from preferences (for display and "use recommended" in macro tracker). */
export function getRecommendedCaloriesFromPreferences(preferences: Pick<UserPreferences, 'sexForCalories' | 'bodyWeightKg'>): number {
  return getSuggestedCalories(preferences.sexForCalories ?? null, preferences.bodyWeightKg ?? null);
}

export function useDailyGoals() {
  const [goals, setGoals] = useLocalStorage<DailyGoals>('tryramadan-daily-goals', defaultDailyGoals);
  const clampedGoals = React.useMemo(
    () => ({ ...goals, calories: clampCalories(goals.calories) }),
    [goals]
  );
  const setDailyGoals = React.useCallback(
    (updater: DailyGoals | ((prev: DailyGoals) => DailyGoals)) => {
      setGoals((prev) => {
        const next = typeof updater === 'function' ? updater(prev) : updater;
        return { ...next, calories: clampCalories(next.calories) };
      });
    },
    [setGoals]
  );
  return [clampedGoals, setDailyGoals] as const;
}

/** Recently used recipe keys (e.g. "suhoor-1", "iftar-2") from meal plan/food log; max 20. */
const RECENT_RECIPES_KEY = 'tryramadan-recent-recipes';
const RECENT_RECIPES_MAX = 20;

export function useRecentRecipes() {
  const [recent, setRecent] = useLocalStorage<string[]>(RECENT_RECIPES_KEY, []);
  const addRecent = React.useCallback((recipeKey: string) => {
    setRecent((prev) => {
      const next = [recipeKey, ...prev.filter((k) => k !== recipeKey)].slice(0, RECENT_RECIPES_MAX);
      return next;
    });
  }, [setRecent]);
  return [recent, addRecent] as const;
}

// --- Dashboard quick access (configurable from Fasting Schedule) ---

export const DASHBOARD_QUICK_ACTION_IDS = [
  'today', 'goals', 'schedule', 'prayers', 'meals', 'macros', 'learn', 'glossary', 'quran',
  'progress', 'culture', 'health', 'journal', 'achievements',
] as const;

export type DashboardQuickActionId = (typeof DASHBOARD_QUICK_ACTION_IDS)[number];

export const DASHBOARD_QUICK_ACTIONS: { id: DashboardQuickActionId; label: string; path: string }[] = [
  { id: 'today', label: 'Today', path: '/dashboard/today' },
  { id: 'goals', label: 'Goals', path: '/dashboard/goals' },
  { id: 'schedule', label: 'Schedule', path: '/dashboard/schedule' },
  { id: 'prayers', label: 'Prayers', path: '/dashboard/prayers' },
  { id: 'meals', label: 'Meals', path: '/dashboard/meals' },
  { id: 'macros', label: 'Macros', path: '/dashboard/macros' },
  { id: 'learn', label: 'Learn', path: '/dashboard/learn' },
  { id: 'glossary', label: 'Glossary', path: '/dashboard/glossary' },
  { id: 'quran', label: 'Quran', path: '/dashboard/quran' },
  { id: 'progress', label: 'Progress', path: '/dashboard/progress' },
  { id: 'culture', label: 'Culture', path: '/dashboard/culture' },
  { id: 'health', label: 'Health', path: '/dashboard/health' },
  { id: 'journal', label: 'Journal', path: '/dashboard/journal' },
  { id: 'achievements', label: 'Achievements', path: '/dashboard/achievements' },
];

const defaultQuickActionOrder: DashboardQuickActionId[] = [...DASHBOARD_QUICK_ACTION_IDS];

const QUICK_ACTIONS_KEY = 'tryramadan-dashboard-quick-actions';

/** Persist dashboard quick action order to localStorage synchronously. Use before navigating. */
export function persistQuickActionsSync(order: string[]): void {
  try {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(QUICK_ACTIONS_KEY, JSON.stringify(order));
    }
  } catch (e) {
    console.error('persistQuickActionsSync:', e);
  }
}

/** Build a personalized quick-action order from user priorities (for onboarding and Settings). */
export function getQuickActionOrderFromPriorities(prefs: Pick<UserPreferences, 'learningPriority' | 'cultureRecipesPriority' | 'quranPriority' | 'macroTrackingEnabled'>): DashboardQuickActionId[] {
  const all = [...DASHBOARD_QUICK_ACTION_IDS];
  const priority: DashboardQuickActionId[] = [];
  // Core: always near top
  ['today', 'schedule', 'prayers'].forEach((id) => {
    if (all.includes(id as DashboardQuickActionId)) priority.push(id as DashboardQuickActionId);
  });
  // Quran/glossary first if user cares
  if (prefs.quranPriority === 'daily' || prefs.quranPriority === 'some') {
    if (!priority.includes('quran')) priority.push('quran');
    if (!priority.includes('glossary')) priority.push('glossary');
  }
  if (prefs.learningPriority === 'deep' || prefs.learningPriority === 'moderate') {
    if (!priority.includes('learn')) priority.push('learn');
  }
  // Culture/recipes
  if (prefs.cultureRecipesPriority === 'lots' || prefs.cultureRecipesPriority === 'some') {
    if (!priority.includes('culture')) priority.push('culture');
    if (!priority.includes('meals')) priority.push('meals');
  }
  if (prefs.macroTrackingEnabled && !priority.includes('macros')) priority.push('macros');
  // Rest in default order
  all.forEach((id) => {
    if (!priority.includes(id)) priority.push(id);
  });
  return priority;
}

export function useDashboardQuickActions(): readonly [DashboardQuickActionId[], (order: DashboardQuickActionId[]) => void] {
  const [order, setOrder] = useLocalStorage<DashboardQuickActionId[]>(QUICK_ACTIONS_KEY, defaultQuickActionOrder);
  const seen = new Set<DashboardQuickActionId>();
  const validOrder = order.filter((id): id is DashboardQuickActionId => {
    if (!DASHBOARD_QUICK_ACTION_IDS.includes(id as DashboardQuickActionId)) return false;
    if (seen.has(id)) return false;
    seen.add(id);
    return true;
  });
  const displayOrder = validOrder.length > 0 ? validOrder : defaultQuickActionOrder;
  return [displayOrder, setOrder] as const;
}

export interface DayMealPlan {
  suhoor?: string;  // free text or "suhoor-1" for recipe id
  iftar?: string;  // free text or "iftar-2"
}

export function useDayMealPlans() {
  return useLocalStorage<Record<string, DayMealPlan>>('tryramadan-day-meal-plans', {});
}

export interface DayNutrition {
  calories?: number;
  protein?: number;
  carbs?: number;
  fat?: number;
}

export function useDayNutrition() {
  return useLocalStorage<Record<string, DayNutrition>>('tryramadan-day-nutrition', {});
}

// --- Per-day planned items (meal prep plan with macros) ---

export type MealCategory = 'suhoor' | 'iftar' | 'between';

export interface PlannedItem {
  id: string;
  mealType: MealCategory;
  name: string;
  portions: number;
  caloriesPerPortion: number;
  proteinPerPortion?: number;
  carbsPerPortion?: number;
  fatPerPortion?: number;
}

export interface DayPlannedItems {
  suhoor: PlannedItem[];
  iftar: PlannedItem[];
  between: PlannedItem[];
}

function defaultDayPlannedItems(): DayPlannedItems {
  return { suhoor: [], iftar: [], between: [] };
}

export function useDayPlannedItems() {
  return useLocalStorage<Record<string, DayPlannedItems>>('tryramadan-day-planned-items', {});
}

/** Get total calories and macros for a day from planned items. Returns zeros when dayPlanned is undefined. */
export function getDayTotalsFromPlanned(dayPlanned: DayPlannedItems | undefined): DayNutrition {
  if (!dayPlanned) return { calories: 0, protein: 0, carbs: 0, fat: 0 };
  const entries = [...dayPlanned.suhoor, ...dayPlanned.iftar, ...(dayPlanned.between ?? [])];
  let calories = 0, protein = 0, carbs = 0, fat = 0;
  for (const e of entries) {
    const p = Number(e.portions);
    const portion = Number.isFinite(p) && p >= 0 ? p : 1;
    calories += (Number(e.caloriesPerPortion) || 0) * portion;
    protein += (Number(e.proteinPerPortion) || 0) * portion;
    carbs += (Number(e.carbsPerPortion) || 0) * portion;
    fat += (Number(e.fatPerPortion) || 0) * portion;
  }
  return { calories, protein, carbs, fat };
}

// --- Per-day food log: recipe or custom items with portions and macros ---

export interface FoodLogEntry {
  id: string;
  type: 'recipe' | 'custom';
  mealType: MealCategory;
  /** Recipe key e.g. "suhoor-1", or custom name */
  name: string;
  portions: number;
  /** Per portion (so total = portions * caloriesPerPortion) */
  caloriesPerPortion: number;
  proteinPerPortion?: number;
  carbsPerPortion?: number;
  fatPerPortion?: number;
  /** For recipe: "suhoor-1" / "iftar-2" for link */
  recipeId?: string;
  /** Optional: JPEG data URL (resized) for meal photo */
  imageDataUrl?: string;
}

export interface DayFoodLog {
  suhoor: FoodLogEntry[];
  iftar: FoodLogEntry[];
  between?: FoodLogEntry[];
}

function defaultDayFoodLog(): DayFoodLog {
  return { suhoor: [], iftar: [], between: [] };
}

export function useDayFoodLog() {
  return useLocalStorage<Record<string, DayFoodLog>>('tryramadan-day-food-log', {});
}

/** Normalize day log so between array exists (for older stored data). */
export function normalizeDayFoodLog(dayLog: DayFoodLog | undefined): DayFoodLog {
  if (!dayLog) return defaultDayFoodLog();
  return {
    suhoor: dayLog.suhoor ?? [],
    iftar: dayLog.iftar ?? [],
    between: dayLog.between ?? [],
  };
}

/** Get total calories and macros for a day from food log */
export function getDayTotalsFromFoodLog(dayLog: DayFoodLog | undefined): DayNutrition {
  const log = normalizeDayFoodLog(dayLog);
  const entries = [...log.suhoor, ...log.iftar, ...log.between];
  let calories = 0, protein = 0, carbs = 0, fat = 0;
  for (const e of entries) {
    const p = Number(e.portions);
    const portion = Number.isFinite(p) && p >= 0 ? p : 1;
    calories += (Number(e.caloriesPerPortion) || 0) * portion;
    protein += (Number(e.proteinPerPortion) || 0) * portion;
    carbs += (Number(e.carbsPerPortion) || 0) * portion;
    fat += (Number(e.fatPerPortion) || 0) * portion;
  }
  return { calories, protein, carbs, fat };
}

/** Get fasting log entry for a date (for hours fasted) */
/** Latest fasting log entry for the given date (there should be at most one per day; returns last if duplicates exist). */
export function getFastingLogForDate(progress: FastingProgress, dateStr: string): FastingLogEntry | undefined {
  const matches = (progress.fastingLog ?? []).filter((e) => e.date === dateStr);
  return matches.length > 0 ? matches[matches.length - 1] : undefined;
}

/** Consecutive days ending on the given date where each day is completed or excused (excused days do not break the streak). Pass todayOverride when using location-based "today" so streak matches Dashboard. */
export function calculateStreak(progress: FastingProgress, todayOverride?: string): number {
  return getStreakDays(progress, todayOverride).length;
}

/** Dates that form the current streak: most recent consecutive days ending on the given date where each day is completed OR excused. Pass todayOverride so streak uses the same "today" as the rest of the app (e.g. display timezone). */
export function getStreakDays(progress: FastingProgress, todayOverride?: string): string[] {
  const completedSet = new Set(progress.completedDays || []);
  const excusedSet = new Set(getExcusedFastDays(progress));
  const result: string[] = [];
  const endDate = todayOverride ?? toLocalDateString(new Date());
  const [y, m, d] = endDate.split('-').map(Number);
  const currentDate = new Date(y, m - 1, d);
  while (true) {
    const dayStr = toLocalDateString(currentDate);
    if (completedSet.has(dayStr) || excusedSet.has(dayStr)) {
      result.push(dayStr);
      currentDate.setDate(currentDate.getDate() - 1);
    } else {
      break;
    }
  }
  return result;
}

/** Reason ids that count as "excused" (illness, travel, menstruation, medical) for stats. */
const EXCUSED_BROKEN_REASON_IDS = ['illness', 'travel', 'menstruation', 'medical'] as const;

/** Dates when the user broke their fast (from fastingLog). */
export function getBrokenFastDays(progress: FastingProgress): string[] {
  return (progress.fastingLog || [])
    .filter((e) => e.status === 'broken')
    .map((e) => e.date)
    .sort()
    .reverse();
}

/** Dates when the user broke their fast with an excused reason (illness, travel, menstruation, medical). Subset of broken for stats. */
export function getExcusedFastDays(progress: FastingProgress): string[] {
  return (progress.fastingLog || [])
    .filter((e) => e.status === 'broken' && e.brokenReason && (EXCUSED_BROKEN_REASON_IDS as readonly string[]).includes(e.brokenReason))
    .map((e) => e.date)
    .sort()
    .reverse();
}

/** Count of completed days that fall on Monday (1) or Thursday (4) — Sunnah voluntary fasting days. Derived from completedDays; prefer this over stored sunnahDaysCompleted. */
export function getSunnahDaysCompleted(progress: FastingProgress): number {
  const days = progress.completedDays || [];
  return days.filter((d) => {
    const day = new Date(d + 'T12:00:00').getDay();
    return day === 1 || day === 4;
  }).length;
}

/** Longest consecutive streak: longest run of calendar days where each day is completed or excused. */
export function getLongestStreak(progress: FastingProgress): number {
  const excusedSet = new Set(getExcusedFastDays(progress));
  const combined = [...new Set([...(progress.completedDays || []), ...excusedSet])].sort();
  if (combined.length === 0) return 0;
  let longest = 1;
  let current = 1;
  for (let i = 1; i < combined.length; i++) {
    const prev = new Date(combined[i - 1] + 'T12:00:00').getTime();
    const curr = new Date(combined[i] + 'T12:00:00').getTime();
    const diffDays = Math.round((curr - prev) / (1000 * 60 * 60 * 24));
    if (diffDays === 1) {
      current++;
      longest = Math.max(longest, current);
    } else {
      current = 1;
    }
  }
  return longest;
}

/** Total hours fasted from fastingLog (completed or broken entries with hoursFasted). */
export function getTotalHoursFasted(progress: FastingProgress): number {
  const log = progress.fastingLog || [];
  return log.reduce((sum, e) => sum + (e.hoursFasted ?? (e.startedAt && e.completedAt ? hoursBetween(e.startedAt, e.completedAt) : 0)), 0);
}

/** Consecutive days ending today with at least one journal entry. For non-fasting achievements. */
export function getJournalStreak(entries: { date: string }[]): number {
  const entryDates = new Set(entries.map((e) => e.date));
  let count = 0;
  const d = new Date();
  while (true) {
    const dayStr = toLocalDateString(d);
    if (entryDates.has(dayStr)) {
      count++;
      d.setDate(d.getDate() - 1);
    } else {
      break;
    }
  }
  return count;
}

/** Prayer tracker: date -> { Fajr: true, Dhuhr: true, ... }. Stored in tryramadan-prayer-tracker. */
export const PRAYER_TRACKER_KEY = 'tryramadan-prayer-tracker';
const PRAYER_NAMES = ['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'] as const;

function getDayPrayers(tracker: Record<string, Record<string, boolean>>, dateStr: string): Record<string, boolean> {
  const day = tracker[dateStr];
  return day && typeof day === "object" && !Array.isArray(day) ? day : {};
}

/** Check if all 5 daily prayers were completed for a date. */
export function didCompleteAllPrayers(tracker: Record<string, Record<string, boolean>>, dateStr: string): boolean {
  const day = getDayPrayers(tracker, dateStr);
  return PRAYER_NAMES.every((name) => !!day[name]);
}

/** Count completed prayers for a date (0-5). */
export function getPrayerCountForDate(tracker: Record<string, Record<string, boolean>>, dateStr: string): number {
  const day = getDayPrayers(tracker, dateStr);
  return PRAYER_NAMES.filter((name) => !!day[name]).length;
}

/** Consecutive days ending today where all 5 prayers were completed. todayOverride for display timezone. */
export function getPrayerStreak(tracker: Record<string, Record<string, boolean>>, todayOverride?: string): number {
  const today = todayOverride ?? toLocalDateString(new Date());
  let count = 0;
  const d = new Date(today + 'T12:00:00');
  while (true) {
    const dayStr = toLocalDateString(d);
    if (didCompleteAllPrayers(tracker, dayStr)) {
      count++;
      d.setDate(d.getDate() - 1);
    } else {
      break;
    }
  }
  return count;
}

/** Total prayer count across all dates (sum of completed prayers per day). */
export function getTotalPrayerCount(tracker: Record<string, Record<string, boolean>>): number {
  if (!tracker || typeof tracker !== "object" || Array.isArray(tracker)) return 0;
  return Object.keys(tracker).reduce((sum, dateStr) => sum + getPrayerCountForDate(tracker, dateStr), 0);
}

/** Consecutive days ending today with both suhoor and iftar logged (meal plan or food log). For mindful-eating achievement. */
export function getMindfulEatingStreak(
  foodLog: Record<string, DayFoodLog>,
  mealPlans: Record<string, DayMealPlan>
): number {
  let count = 0;
  const d = new Date();
  while (true) {
    const dayStr = toLocalDateString(d);
    const plan = mealPlans[dayStr];
    const log = normalizeDayFoodLog(foodLog[dayStr]);
    const hasSuhoor = !!(plan?.suhoor?.trim()) || (log.suhoor?.length ?? 0) > 0;
    const hasIftar = !!(plan?.iftar?.trim()) || (log.iftar?.length ?? 0) > 0;
    if (hasSuhoor && hasIftar) {
      count++;
      d.setDate(d.getDate() - 1);
    } else {
      break;
    }
  }
  return count;
}

// --- Daily missions (today's actionable tasks) ---

export const SCHEDULE_NOTES_KEY = 'tryramadan-schedule-notes';

/** Habit tracker: date -> { habitId: true }. Stored in tryramadan-habit-log. */
export const HABIT_LOG_KEY = 'tryramadan-habit-log';
export function useHabitLog(): [Record<string, Record<string, boolean>>, (value: Record<string, Record<string, boolean>> | ((prev: Record<string, Record<string, boolean>>) => Record<string, Record<string, boolean>>)) => void] {
  return useLocalStorage<Record<string, Record<string, boolean>>>(HABIT_LOG_KEY, {});
}
export const HADITH_VIEWED_DATES_KEY = 'tryramadan-hadith-viewed-dates';
const HADITH_VIEWED_MAX_DAYS = 60;

export interface DailyMission {
  id: string;
  label: string;
  completed: boolean;
  path?: string;
}

/** Mark that the user viewed hadith/learn content today (for "Read one hadith" mission). */
export function markHadithViewedToday(): void {
  try {
    const raw = window.localStorage.getItem(HADITH_VIEWED_DATES_KEY);
    const dates: string[] = raw ? JSON.parse(raw) : [];
    const today = getTodayDateString();
    if (dates.includes(today)) return;
    const next = [...dates, today].slice(-HADITH_VIEWED_MAX_DAYS);
    window.localStorage.setItem(HADITH_VIEWED_DATES_KEY, JSON.stringify(next));
  } catch {
    // ignore
  }
}

export function useHadithViewedDates(): [string[], (date?: string) => void] {
  const [dates, setDates] = useLocalStorage<string[]>(HADITH_VIEWED_DATES_KEY, []);
  const markToday = React.useCallback((date?: string) => {
    const target = date ?? getTodayDateString();
    if (dates.includes(target)) return;
    setDates((prev) => [...prev, target].slice(-HADITH_VIEWED_MAX_DAYS));
  }, [dates, setDates]);
  return [dates, markToday];
}

const QURAN_VERSE_VIEWED_DATES_KEY = 'tryramadan-quran-verse-viewed-dates';
const QURAN_VERSE_VIEWED_MAX_DAYS = 60;

export function useQuranVerseViewedDates(): [string[], (date?: string) => void] {
  const [dates, setDates] = useLocalStorage<string[]>(QURAN_VERSE_VIEWED_DATES_KEY, []);
  const markToday = React.useCallback((date?: string) => {
    const today = date ?? getTodayDateString();
    if (dates.includes(today)) return;
    setDates((prev) => [...prev, today].slice(-QURAN_VERSE_VIEWED_MAX_DAYS));
  }, [dates, setDates]);
  return [dates, markToday];
}

/** Build today's daily missions and completion from progress, meal plans, food log, schedule notes, Quran verse and hadith viewed. */
export function getDailyMissions(params: {
  todayStr: string;
  progress: FastingProgress;
  mealPlans: Record<string, { suhoor?: string; iftar?: string }>;
  foodLog: Record<string, DayFoodLog>;
  scheduleNotes: Record<string, string>;
  quranVerseViewedDates: string[];
  hadithViewedDates: string[];
  iftarLabelShort?: string;
  suhoorLabelShort?: string;
}): DailyMission[] {
  const { todayStr, progress, mealPlans, foodLog, scheduleNotes, quranVerseViewedDates, hadithViewedDates, iftarLabelShort = 'iftar', suhoorLabelShort = 'Suhoor' } = params;
  const todayLog = progress.fastingLog?.find((e) => e.date === todayStr);
  const todaySkipped = (progress.skippedDays ?? []).includes(todayStr);
  const fastingToday = !!todayLog && todayLog.status !== 'broken' && !progress.completedDays.includes(todayStr) && !todaySkipped;
  const todayComplete = progress.completedDays.includes(todayStr);
  const fastCompleteOrBroken = todayComplete || (todayLog?.status === 'broken') || todaySkipped;
  const dayMeals = mealPlans[todayStr];
  const dayLog = normalizeDayFoodLog(foodLog[todayStr]);
  const hasSuhoor = !!(dayMeals?.suhoor?.trim()) || (dayLog.suhoor?.length ?? 0) > 0;
  const hasIftar = !!(dayMeals?.iftar?.trim()) || (dayLog.iftar?.length ?? 0) > 0;
  const hasNote = !!(scheduleNotes[todayStr]?.trim());
  const readQuranVerse = quranVerseViewedDates.includes(todayStr);
  const readHadith = hadithViewedDates.includes(todayStr);

  return [
    { id: 'start_fasting', label: "Start fasting (tap I'm fasting)", completed: fastingToday || todayComplete || todaySkipped, path: undefined },
    { id: 'complete_fast', label: `Complete or break your fast at ${iftarLabelShort}`, completed: fastCompleteOrBroken, path: undefined },
    { id: 'log_suhoor', label: `Log ${suhoorLabelShort} (meal plan or food log)`, completed: hasSuhoor, path: '/dashboard/schedule' },
    { id: 'log_iftar', label: `Log ${iftarLabelShort} (meal plan or food log)`, completed: hasIftar, path: '/dashboard/schedule' },
    { id: 'add_note', label: 'Add a note for today', completed: hasNote, path: '/dashboard/schedule' },
    { id: 'read_quran_verse', label: 'Read one verse (Quran)', completed: readQuranVerse, path: '/dashboard/quran' },
    { id: 'read_hadith', label: 'Read one hadith', completed: readHadith, path: '/learn/hadith' },
  ];
}

/** Hook: today's daily missions and completion count. Uses progress, meal plans, food log, schedule notes, Quran verse and hadith viewed. Uses display timezone when set so "today" matches Dashboard. */
export function useDailyMissions(): { missions: DailyMission[]; completedCount: number; totalCount: number } {
  const [progress] = useFastingProgress();
  const [mealPlans] = useDayMealPlans();
  const [foodLogs] = useDayFoodLog();
  const [scheduleNotes] = useLocalStorage<Record<string, string>>(SCHEDULE_NOTES_KEY, {});
  const [quranVerseViewedDates] = useQuranVerseViewedDates();
  const [hadithViewedDates] = useHadithViewedDates();
  const displayTimezone = useDisplayTimezone();
  const iftarLabelShort = useIftarLabelShort();
  const suhoorLabelShort = useSuhoorLabelShort();
  const todayStr = displayTimezone ? getTodayStringInTimezone(displayTimezone) : getTodayDateString();
  const missions = getDailyMissions({
    todayStr,
    progress,
    mealPlans,
    foodLog: foodLogs,
    scheduleNotes,
    quranVerseViewedDates,
    hadithViewedDates,
    iftarLabelShort,
    suhoorLabelShort,
  });
  const completedCount = missions.filter((m) => m.completed).length;
  const totalCount = missions.length;
  return { missions, completedCount, totalCount };
}
