import { useState, useEffect, useCallback, useMemo } from 'react';
import { toLocalDateString } from '@/lib/utils';

export function useLocalStorage<T>(key: string, initialValue: T): [T, (value: T | ((prev: T) => T)) => void] {
  // Get stored value or use initial
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  // Update localStorage when state changes
  useEffect(() => {
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
  /** Simplify features based on location (e.g. local times, fewer options). */
  simplifyByLocation: boolean;
  /** Daily water goal in ml; 0 = use region default from country. */
  hydrationGoalMl: number;
  /** Enable hydration reminders during non-fasting hours. */
  hydrationReminderEnabled: boolean;
  /** Times for hydration reminders (HH:mm), e.g. ["12:00", "15:00", "19:00"]. */
  hydrationReminderTimes: string[];
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
  simplifyByLocation: true,
  hydrationGoalMl: 0,
  hydrationReminderEnabled: false,
  hydrationReminderTimes: ['12:00', '15:00', '19:00'],
};

export function useUserPreferences() {
  const [stored, setStored] = useLocalStorage<UserPreferences>('tryramadan-preferences', defaultPreferences);
  // Ensure we always have all keys (merge with defaults for old or partial localStorage)
  const preferences: UserPreferences = { ...defaultPreferences, ...stored };
  return [preferences, setStored] as const;
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
  sunnahDaysCompleted: 0,
  currentStreak: 0,
  longestStreak: 0,
  startDate: null,
  fastingLog: [],
};

export function useFastingProgress() {
  const [stored, setStored] = useLocalStorage<FastingProgress>('tryramadan-progress', defaultProgress);
  // Migrate old progress objects that don't have fastingLog
  const progress: FastingProgress =
    Array.isArray(stored.fastingLog) ? stored : { ...defaultProgress, ...stored, fastingLog: [] };
  return [progress, setStored] as const;
}

// --- Fasting tracker helpers (with console logging) ---

const LOG_PREFIX = '[TryRamadan]';

/** Today's date as YYYY-MM-DD in the user's local timezone (for consistent calendar/tracking). */
export function getTodayDateString(): string {
  return toLocalDateString(new Date());
}

export function getTodayFastingLog(progress: FastingProgress): FastingLogEntry | undefined {
  const today = getTodayDateString();
  return progress.fastingLog?.find((e) => e.date === today);
}

export function isFastingToday(progress: FastingProgress): boolean {
  const entry = getTodayFastingLog(progress);
  return entry?.status === 'in_progress';
}

/** Start fasting today: add log entry, persist, and console.log */
export function startFastingToday(
  progress: FastingProgress,
  setProgress: (value: FastingProgress | ((prev: FastingProgress) => FastingProgress)) => void
): void {
  const today = getTodayDateString();
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

  setProgress({
    ...progress,
    fastingLog: updatedLog,
  });

  console.log(`${LOG_PREFIX} You are fasting. Started at ${now} (${today}).`);
}

/** Hours between two ISO datetime strings (for display). */
export function hoursBetween(startIso: string, endIso: string): number {
  const a = new Date(startIso).getTime();
  const b = new Date(endIso).getTime();
  return Math.round((b - a) / (1000 * 60 * 60) * 10) / 10;
}

/** Mark today's fast as completed: update log, add to completedDays, and console.log */
export function completeFastingToday(
  progress: FastingProgress,
  setProgress: (value: FastingProgress | ((prev: FastingProgress) => FastingProgress)) => void
): void {
  const today = getTodayDateString();
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

/** Mark today's fast as broken (e.g. early break): update log, optionally remove from completedDays. Reason is a predetermined id from BROKEN_FAST_REASONS. */
export function breakFastingToday(
  progress: FastingProgress,
  setProgress: (value: FastingProgress | ((prev: FastingProgress) => FastingProgress)) => void,
  reason?: string
): void {
  const today = getTodayDateString();
  const now = new Date().toISOString();
  const entry = progress.fastingLog?.find((e) => e.date === today);
  const startedAt = entry?.startedAt || now;
  const hoursFasted = hoursBetween(startedAt, now);
  const reasonId = reason && BROKEN_FAST_REASONS.some((r) => r.id === reason) ? reason : 'other';

  const updatedLog = (progress.fastingLog || []).map((e) =>
    e.date === today ? { ...e, completedAt: now, status: 'broken' as const, hoursFasted, brokenReason: reasonId } : e
  );
  if (!updatedLog.some((e) => e.date === today)) {
    updatedLog.push({ date: today, startedAt, completedAt: now, status: 'broken', hoursFasted, brokenReason: reasonId });
  }

  setProgress({
    ...progress,
    fastingLog: updatedLog,
    completedDays: progress.completedDays.filter((d) => d !== today),
  });

  console.log(`${LOG_PREFIX} Fast broken (${getBrokenReasonLabel(reasonId)}). ${today} at ${now}.`);
}

/** Unmark today's fast (undo complete): remove from completedDays, set log to in_progress */
export function uncompleteFastingToday(
  progress: FastingProgress,
  setProgress: (value: FastingProgress | ((prev: FastingProgress) => FastingProgress)) => void
): void {
  const today = getTodayDateString();

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

  const setIntention = useCallback((intention: string) => {
    setStore((prev) => ({ ...prev, [today]: { ...(prev[today] || {}), intention } }));
  }, [today, setStore]);

  const setHydrationGlasses = useCallback((glasses: number) => {
    setStore((prev) => ({ ...prev, [today]: { ...(prev[today] || {}), hydrationGlasses: Math.max(0, glasses) } }));
  }, [today, setStore]);

  const addHydrationEntry = useCallback((amountMl: number) => {
    const entry: HydrationEntry = { time: new Date().toISOString(), amountMl };
    setStore((prev) => ({
      ...prev,
      [today]: {
        ...(prev[today] || {}),
        hydrationEntries: [...(prev[today]?.hydrationEntries || []), entry],
      },
    }));
  }, [today, setStore]);

  const addEnergyEntry = useCallback((level: 1 | 2 | 3 | 4 | 5) => {
    const entry: EnergyEntry = { time: new Date().toISOString(), level };
    setStore((prev) => ({
      ...prev,
      [today]: {
        ...(prev[today] || {}),
        energyEntries: [...(prev[today]?.energyEntries || []), entry],
      },
    }));
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

/** Suggested daily calories by sex (rough estimate for BMR-based goal). Clamped to reasonable range. */
export function getSuggestedCalories(sex: 'male' | 'female' | null): number {
  if (sex === 'male') return clampCalories(2200);
  if (sex === 'female') return clampCalories(1800);
  return clampCalories(2000);
}

export function useDailyGoals() {
  const [goals, setGoals] = useLocalStorage<DailyGoals>('tryramadan-daily-goals', defaultDailyGoals);
  const clampedGoals = useMemo(
    () => ({ ...goals, calories: clampCalories(goals.calories) }),
    [goals]
  );
  const setDailyGoals = useCallback(
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
  const addRecent = useCallback((recipeKey: string) => {
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

const defaultQuickActionOrder: string[] = [...DASHBOARD_QUICK_ACTION_IDS];

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

export function useDashboardQuickActions() {
  const [order, setOrder] = useLocalStorage<string[]>('tryramadan-dashboard-quick-actions', defaultQuickActionOrder);
  const seen = new Set<string>();
  const validOrder = order.filter((id) => {
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

/** Get total calories and macros for a day from planned items */
export function getDayTotalsFromPlanned(dayPlanned: DayPlannedItems | undefined): DayNutrition {
  if (!dayPlanned) return {};
  const entries = [...dayPlanned.suhoor, ...dayPlanned.iftar, ...(dayPlanned.between ?? [])];
  let calories = 0, protein = 0, carbs = 0, fat = 0;
  for (const e of entries) {
    const p = e.portions || 1;
    calories += (e.caloriesPerPortion || 0) * p;
    protein += (e.proteinPerPortion || 0) * p;
    carbs += (e.carbsPerPortion || 0) * p;
    fat += (e.fatPerPortion || 0) * p;
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
    const p = e.portions || 1;
    calories += (e.caloriesPerPortion || 0) * p;
    protein += (e.proteinPerPortion || 0) * p;
    carbs += (e.carbsPerPortion || 0) * p;
    fat += (e.fatPerPortion || 0) * p;
  }
  return { calories, protein, carbs, fat };
}

/** Get fasting log entry for a date (for hours fasted) */
export function getFastingLogForDate(progress: FastingProgress, dateStr: string): FastingLogEntry | undefined {
  return progress.fastingLog?.find((e) => e.date === dateStr);
}

/** Consecutive days of fasting ending today (same logic as Dashboard). */
export function calculateStreak(progress: FastingProgress): number {
  const today = getTodayDateString();
  const completedDays = [...(progress.completedDays || [])].sort().reverse();
  let streak = 0;
  const currentDate = new Date();
  for (const day of completedDays) {
    const dayStr = toLocalDateString(currentDate);
    if (day === dayStr) {
      streak++;
      currentDate.setDate(currentDate.getDate() - 1);
    } else {
      break;
    }
  }
  return streak;
}

/** Longest consecutive streak in completedDays (computed from stored dates). */
export function getLongestStreak(progress: FastingProgress): number {
  const sorted = [...(progress.completedDays || [])].sort();
  if (sorted.length === 0) return 0;
  let longest = 1;
  let current = 1;
  for (let i = 1; i < sorted.length; i++) {
    const prev = new Date(sorted[i - 1] + 'T12:00:00').getTime();
    const curr = new Date(sorted[i] + 'T12:00:00').getTime();
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

// --- Daily missions (today's actionable tasks) ---

export const SCHEDULE_NOTES_KEY = 'tryramadan-schedule-notes';
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

export function useHadithViewedDates(): [string[], () => void] {
  const [dates, setDates] = useLocalStorage<string[]>(HADITH_VIEWED_DATES_KEY, []);
  const markToday = useCallback(() => {
    const today = getTodayDateString();
    if (dates.includes(today)) return;
    setDates((prev) => [...prev, today].slice(-HADITH_VIEWED_MAX_DAYS));
  }, [dates, setDates]);
  return [dates, markToday];
}

/** Build today's daily missions and completion from progress, meal plans, food log, schedule notes, hadith viewed. */
export function getDailyMissions(params: {
  todayStr: string;
  progress: FastingProgress;
  mealPlans: Record<string, { suhoor?: string; iftar?: string }>;
  foodLog: Record<string, DayFoodLog>;
  scheduleNotes: Record<string, string>;
  hadithViewedDates: string[];
  iftarLabelShort?: string;
}): DailyMission[] {
  const { todayStr, progress, mealPlans, foodLog, scheduleNotes, hadithViewedDates, iftarLabelShort = 'iftar' } = params;
  const todayLog = progress.fastingLog?.find((e) => e.date === todayStr);
  const fastingToday = !!todayLog && todayLog.status !== 'broken' && !progress.completedDays.includes(todayStr);
  const todayComplete = progress.completedDays.includes(todayStr);
  const fastCompleteOrBroken = todayComplete || (todayLog?.status === 'broken');
  const dayMeals = mealPlans[todayStr];
  const dayLog = normalizeDayFoodLog(foodLog[todayStr]);
  const hasSuhoor = !!(dayMeals?.suhoor?.trim()) || (dayLog.suhoor?.length ?? 0) > 0;
  const hasIftar = !!(dayMeals?.iftar?.trim()) || (dayLog.iftar?.length ?? 0) > 0;
  const hasNote = !!(scheduleNotes[todayStr]?.trim());
  const readHadith = hadithViewedDates.includes(todayStr);

  return [
    { id: 'start_fasting', label: "Start fasting (tap I'm fasting)", completed: fastingToday || todayComplete, path: undefined },
    { id: 'complete_fast', label: `Complete or break your fast at ${iftarLabelShort}`, completed: fastCompleteOrBroken, path: undefined },
    { id: 'log_suhoor', label: 'Log Suhoor (meal plan or food log)', completed: hasSuhoor, path: '/dashboard/schedule' },
    { id: 'log_iftar', label: `Log ${iftarLabelShort} (meal plan or food log)`, completed: hasIftar, path: '/dashboard/schedule' },
    { id: 'add_note', label: 'Add a note for today', completed: hasNote, path: '/dashboard/schedule' },
    { id: 'read_hadith', label: 'Read one hadith', completed: readHadith, path: '/learn/hadith' },
  ];
}

/** Hook: today's daily missions and completion count. Uses progress, meal plans, food log, schedule notes, hadith viewed. */
export function useDailyMissions(): { missions: DailyMission[]; completedCount: number; totalCount: number } {
  const [progress] = useFastingProgress();
  const [mealPlans] = useDayMealPlans();
  const [foodLogs] = useDayFoodLog();
  const [scheduleNotes] = useLocalStorage<Record<string, string>>(SCHEDULE_NOTES_KEY, {});
  const [hadithViewedDates] = useHadithViewedDates();
  const iftarLabelShort = useIftarLabelShort();
  const todayStr = getTodayDateString();
  const missions = getDailyMissions({
    todayStr,
    progress,
    mealPlans,
    foodLog: foodLogs,
    scheduleNotes,
    hadithViewedDates,
    iftarLabelShort,
  });
  const completedCount = missions.filter((m) => m.completed).length;
  const totalCount = missions.length;
  return { missions, completedCount, totalCount };
}
