import { useState, useEffect } from 'react';

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
  completedDays: number[];
  currentDay: number;
  notificationsEnabled: boolean;
  suhoorReminder: string; // time like "04:30"
  iftarReminder: string;  // time like "18:30"
}

export const defaultPreferences: UserPreferences = {
  userType: null,
  experience: '',
  location: '',
  locationCoords: null,
  fastingGoal: 'full',
  onboardingComplete: false,
  selectedProgram: 'traditional',
  completedDays: [],
  currentDay: 1,
  notificationsEnabled: false,
  suhoorReminder: '04:30',
  iftarReminder: '18:30',
};

export function useUserPreferences() {
  return useLocalStorage<UserPreferences>('tryramadan-preferences', defaultPreferences);
}
