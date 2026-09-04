/**
 * Tests for localStorage and persistence: useLocalStorage hook, persistPreferencesSync,
 * persistQuickActionsSync, and round-trip read/write behavior.
 */
import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import {
  useLocalStorage,
  persistPreferencesSync,
  persistQuickActionsSync,
  getQuickActionOrderFromPriorities,
  defaultPreferences,
  defaultDailyGoals,
  clampCalories,
  getSuggestedCalories,
  getRecommendedCaloriesFromPreferences,
  PRAYER_TRACKER_KEY,
  getPrayerStreak,
  getTotalPrayerCount,
  type UserPreferences,
} from "@/hooks/useLocalStorage";

const PREFERENCES_KEY = "tryramadan-preferences";
const QUICK_ACTIONS_KEY = "tryramadan-dashboard-quick-actions";

describe("localStorage persistence", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  describe("persistPreferencesSync", () => {
    it("writes merged preferences to localStorage", () => {
      persistPreferencesSync({ theme: "light", onboardingComplete: true });
      const raw = localStorage.getItem(PREFERENCES_KEY);
      expect(raw).toBeTruthy();
      const stored = JSON.parse(raw!);
      expect(stored.theme).toBe("light");
      expect(stored.onboardingComplete).toBe(true);
      expect(stored.language).toBe(defaultPreferences.language);
    });

    it("merges with existing preferences", () => {
      localStorage.setItem(
        PREFERENCES_KEY,
        JSON.stringify({ theme: "dark", location: "London" })
      );
      persistPreferencesSync({ theme: "light" });
      const stored = JSON.parse(localStorage.getItem(PREFERENCES_KEY)!);
      expect(stored.theme).toBe("light");
      expect(stored.location).toBe("London");
    });

    it("round-trip: read back same values", () => {
      const partial: Partial<UserPreferences> = {
        theme: "light",
        country: "GB",
        sexForCalories: "female",
        bodyWeightKg: 70,
      };
      persistPreferencesSync(partial);
      const raw = localStorage.getItem(PREFERENCES_KEY);
      const stored = JSON.parse(raw!);
      expect(stored.theme).toBe(partial.theme);
      expect(stored.country).toBe(partial.country);
      expect(stored.sexForCalories).toBe(partial.sexForCalories);
      expect(stored.bodyWeightKg).toBe(partial.bodyWeightKg);
    });
  });

  describe("persistQuickActionsSync", () => {
    it("writes order to localStorage", () => {
      const order = ["today", "schedule", "prayers"];
      persistQuickActionsSync(order);
      const raw = localStorage.getItem(QUICK_ACTIONS_KEY);
      expect(raw).toBeTruthy();
      expect(JSON.parse(raw!)).toEqual(order);
    });

    it("round-trip: read back same order", () => {
      const order = ["schedule", "today", "meals"];
      persistQuickActionsSync(order);
      const stored = JSON.parse(localStorage.getItem(QUICK_ACTIONS_KEY)!);
      expect(stored).toEqual(order);
    });
  });
});

describe("useLocalStorage hook", () => {
  const KEY = "test-storage-key";

  beforeEach(() => {
    localStorage.removeItem(KEY);
  });

  afterEach(() => {
    localStorage.removeItem(KEY);
  });

  it("returns initial value when key is missing, then persists it", () => {
    const { result } = renderHook(() => useLocalStorage(KEY, { count: 0 }));
    expect(result.current[0]).toEqual({ count: 0 });
    // Hook's useEffect persists state to localStorage, so after mount the key exists
    expect(JSON.parse(localStorage.getItem(KEY) ?? "null")).toEqual({ count: 0 });
  });

  it("reads existing value from localStorage on mount", () => {
    localStorage.setItem(KEY, JSON.stringify({ count: 42 }));
    const { result } = renderHook(() => useLocalStorage(KEY, { count: 0 }));
    expect(result.current[0]).toEqual({ count: 42 });
  });

  it("persists updates to localStorage", () => {
    const { result } = renderHook(() => useLocalStorage(KEY, { count: 0 }));
    act(() => {
      result.current[1]({ count: 10 });
    });
    expect(result.current[0]).toEqual({ count: 10 });
    expect(JSON.parse(localStorage.getItem(KEY)!)).toEqual({ count: 10 });
  });

  it("persists when setter is called with updater function", () => {
    localStorage.setItem(KEY, JSON.stringify({ count: 5 }));
    const { result } = renderHook(() => useLocalStorage(KEY, { count: 0 }));
    act(() => {
      result.current[1]((prev: { count: number }) => ({ count: prev.count + 1 }));
    });
    expect(result.current[0]).toEqual({ count: 6 });
    expect(JSON.parse(localStorage.getItem(KEY)!)).toEqual({ count: 6 });
  });

  it("uses initial value when stored value is invalid JSON", () => {
    localStorage.setItem(KEY, "not valid json {");
    const { result } = renderHook(() => useLocalStorage(KEY, "default"));
    expect(result.current[0]).toBe("default");
  });

  it("round-trip: write then read in same key", () => {
    const { result } = renderHook(() => useLocalStorage<string>(KEY, ""));
    act(() => {
      result.current[1]("hello");
    });
    expect(localStorage.getItem(KEY)).toBe(JSON.stringify("hello"));
    const parsed = JSON.parse(localStorage.getItem(KEY)!);
    expect(parsed).toBe("hello");
  });
});

describe("concurrent mounted stores", () => {
  it("applies sequential updates against the latest stored value and synchronizes both consumers", () => {
    localStorage.removeItem('concurrent-counter');
    const first = renderHook(() => useLocalStorage('concurrent-counter', 0));
    const second = renderHook(() => useLocalStorage('concurrent-counter', 0));
    act(() => {
      first.result.current[1]((value) => value + 1);
      second.result.current[1]((value) => value + 1);
    });
    expect(first.result.current[0]).toBe(2);
    expect(second.result.current[0]).toBe(2);
    expect(JSON.parse(localStorage.getItem('concurrent-counter')!)).toBe(2);
  });
});

describe("prayer tracker persistence", () => {
  beforeEach(() => {
    localStorage.removeItem(PRAYER_TRACKER_KEY);
  });

  afterEach(() => {
    localStorage.removeItem(PRAYER_TRACKER_KEY);
  });

  it("round-trip: prayer tracker persists and helpers read correctly", () => {
    const { result } = renderHook(() =>
      useLocalStorage<Record<string, Record<string, boolean>>>(PRAYER_TRACKER_KEY, {})
    );
    const tracker = {
      "2025-03-15": { Fajr: true, Dhuhr: true, Asr: true, Maghrib: true, Isha: true },
      "2025-03-16": { Fajr: true, Dhuhr: false, Asr: false, Maghrib: false, Isha: false },
    };
    act(() => {
      result.current[1](tracker);
    });
    expect(result.current[0]).toEqual(tracker);
    expect(JSON.parse(localStorage.getItem(PRAYER_TRACKER_KEY)!)).toEqual(tracker);
    expect(getPrayerStreak(result.current[0], "2025-03-15")).toBe(1);
    expect(getPrayerStreak(result.current[0], "2025-03-16")).toBe(0);
    expect(getTotalPrayerCount(result.current[0])).toBe(6);
  });
});

describe("daily goals and calorie helpers (persisted via useDailyGoals)", () => {
  const GOALS_KEY = "tryramadan-daily-goals";

  beforeEach(() => {
    localStorage.removeItem(GOALS_KEY);
  });

  it("clampCalories keeps value in range", () => {
    expect(clampCalories(1000)).toBe(1000);
    expect(clampCalories(0)).toBe(0);
    expect(clampCalories(10000)).toBe(5000);
    expect(clampCalories(-100)).toBe(0);
  });

  it("getSuggestedCalories returns values by sex and weight", () => {
    expect(getSuggestedCalories("male", null)).toBe(2200);
    expect(getSuggestedCalories("female", null)).toBe(1800);
    expect(getSuggestedCalories(null, null)).toBe(2000);
    const withWeight = getSuggestedCalories("female", 70);
    expect(withWeight).toBeGreaterThanOrEqual(800);
    expect(withWeight).toBeLessThanOrEqual(5000);
    expect(withWeight).toBe(26 * 70);
  });

  it("getRecommendedCaloriesFromPreferences uses prefs", () => {
    const prefs: { sexForCalories: "male" | "female" | null; bodyWeightKg: number | null } = { sexForCalories: "male" as const, bodyWeightKg: null };
    expect(getRecommendedCaloriesFromPreferences(prefs)).toBe(2200);
    const prefs2: { sexForCalories: "male" | "female" | null; bodyWeightKg: number | null } = { sexForCalories: "female" as const, bodyWeightKg: 60 };
    expect(getRecommendedCaloriesFromPreferences(prefs2)).toBe(60 * 26);
  });

  it("useLocalStorage for daily goals persists and reads back", () => {
    const { result } = renderHook(() =>
      useLocalStorage(GOALS_KEY, defaultDailyGoals)
    );
    act(() => {
      result.current[1]({ ...defaultDailyGoals, calories: 2100 });
    });
    expect(result.current[0].calories).toBe(2100);
    const raw = localStorage.getItem(GOALS_KEY);
    expect(raw).toBeTruthy();
    const stored = JSON.parse(raw!);
    expect(stored.calories).toBe(2100);
  });
});
