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
  theme: 'system',
};

export function useUserPreferences() {
  return useLocalStorage<UserPreferences>('tryramadan-preferences', defaultPreferences);
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
}

export const defaultProgress: FastingProgress = {
  currentDay: 1,
  totalDays: 30,
  completedDays: [],
  sunnahDaysCompleted: 0,
  currentStreak: 0,
  longestStreak: 0,
  startDate: null,
};

export function useFastingProgress() {
  return useLocalStorage<FastingProgress>('tryramadan-progress', defaultProgress);
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
