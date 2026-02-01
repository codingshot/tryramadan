import { useState, useEffect, useCallback } from 'react';

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

// User preferences interface
export interface UserPreferences {
  userType: 'new' | 'muslim' | null;
  experience: string;
  location: string;
  locationCoords: { lat: number; lng: number } | null;
  fastingGoal: string;
  onboardingComplete: boolean;
  selectedProgram: string;
  notificationsEnabled: boolean;
  suhoorReminder: string;
  iftarReminder: string;
  theme: 'light' | 'dark' | 'system';
}

export const defaultPreferences: UserPreferences = {
  userType: null,
  experience: '',
  location: '',
  locationCoords: null,
  fastingGoal: 'full',
  onboardingComplete: false,
  selectedProgram: 'traditional',
  notificationsEnabled: false,
  suhoorReminder: '04:30',
  iftarReminder: '18:30',
  theme: 'dark',
};

export function useUserPreferences() {
  return useLocalStorage<UserPreferences>('tryramadan-preferences', defaultPreferences);
}

// Fasting log entry - one per day when user logs fasting
export interface FastingLogEntry {
  date: string; // ISO date YYYY-MM-DD
  startedAt: string; // ISO datetime when user clicked "I'm fasting"
  completedAt?: string; // ISO datetime when user marked day complete
  status: 'in_progress' | 'completed' | 'broken';
  /** Hours fasted (from startedAt to completedAt or now). Set when completed/broken. */
  hoursFasted?: number;
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

export function getTodayFastingLog(progress: FastingProgress): FastingLogEntry | undefined {
  const today = new Date().toISOString().split('T')[0];
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
  const today = new Date().toISOString().split('T')[0];
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
  const today = new Date().toISOString().split('T')[0];
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

/** Mark today's fast as broken (e.g. early break): update log, optionally remove from completedDays */
export function breakFastingToday(
  progress: FastingProgress,
  setProgress: (value: FastingProgress | ((prev: FastingProgress) => FastingProgress)) => void
): void {
  const today = new Date().toISOString().split('T')[0];
  const now = new Date().toISOString();
  const entry = progress.fastingLog?.find((e) => e.date === today);
  const startedAt = entry?.startedAt || now;
  const hoursFasted = hoursBetween(startedAt, now);

  const updatedLog = (progress.fastingLog || []).map((e) =>
    e.date === today ? { ...e, completedAt: now, status: 'broken' as const, hoursFasted } : e
  );
  if (!updatedLog.some((e) => e.date === today)) {
    updatedLog.push({ date: today, startedAt, completedAt: now, status: 'broken', hoursFasted });
  }

  setProgress({
    ...progress,
    fastingLog: updatedLog,
    completedDays: progress.completedDays.filter((d) => d !== today),
  });

  console.log(`${LOG_PREFIX} Fast broken (health/other). ${today} at ${now}.`);
}

/** Unmark today's fast (undo complete): remove from completedDays, set log to in_progress */
export function uncompleteFastingToday(
  progress: FastingProgress,
  setProgress: (value: FastingProgress | ((prev: FastingProgress) => FastingProgress)) => void
): void {
  const today = new Date().toISOString().split('T')[0];

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
  return useLocalStorage<NotificationSettings>('tryramadan-notifications', defaultNotificationSettings);
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

export interface TodayData {
  date: string; // YYYY-MM-DD
  intention: string;
  hydrationGlasses: number;
  energyEntries: EnergyEntry[];
}

const defaultTodayData: TodayData = {
  date: "",
  intention: "",
  hydrationGlasses: 0,
  energyEntries: [],
};

export function useTodayData() {
  const [store, setStore] = useLocalStorage<Record<string, Omit<TodayData, "date">>>('tryramadan-today', {});
  const today = new Date().toISOString().split('T')[0];
  const todayData = store[today] || {
    intention: "",
    hydrationGlasses: 0,
    energyEntries: [],
  };

  const setIntention = useCallback((intention: string) => {
    setStore((prev) => ({ ...prev, [today]: { ...(prev[today] || {}), intention } }));
  }, [today, setStore]);

  const setHydrationGlasses = useCallback((glasses: number) => {
    setStore((prev) => ({ ...prev, [today]: { ...(prev[today] || {}), hydrationGlasses: Math.max(0, glasses) } }));
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

  return {
    intention: todayData.intention,
    hydrationGlasses: todayData.hydrationGlasses,
    energyEntries: todayData.energyEntries || [],
    setIntention,
    setHydrationGlasses,
    addEnergyEntry,
  };
}

// Recipe favorites: array of "suhoor-1", "iftar-2", etc.
export function useRecipeFavorites() {
  return useLocalStorage<string[]>('tryramadan-recipe-favorites', []);
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

export function useDailyGoals() {
  return useLocalStorage<DailyGoals>('tryramadan-daily-goals', defaultDailyGoals);
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

// --- Per-day food log: recipe or custom items with portions and macros ---

export interface FoodLogEntry {
  id: string;
  type: 'recipe' | 'custom';
  mealType: 'suhoor' | 'iftar';
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
}

function defaultDayFoodLog(): DayFoodLog {
  return { suhoor: [], iftar: [] };
}

export function useDayFoodLog() {
  return useLocalStorage<Record<string, DayFoodLog>>('tryramadan-day-food-log', {});
}

/** Get total calories and macros for a day from food log */
export function getDayTotalsFromFoodLog(dayLog: DayFoodLog | undefined): DayNutrition {
  if (!dayLog) return {};
  const entries = [...dayLog.suhoor, ...dayLog.iftar];
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
