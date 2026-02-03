/**
 * Edge-case tests for logging, tracking, and progress.
 * Covers: fasting progress, completed days, streak, break-fast reasons, daily missions, empty state.
 */
import { describe, it, expect, beforeEach } from "vitest";
import {
  defaultProgress,
  calculateStreak,
  getStreakDays,
  getTotalHoursFasted,
  getTodayFastingLog,
  isFastingToday,
  getBrokenReasonLabel,
  BROKEN_FAST_REASONS,
  getDailyMissions,
  normalizeDayFoodLog,
  getDayTotalsFromFoodLog,
  hoursBetween,
  type FastingProgress,
  type DayFoodLog,
} from "@/hooks/useLocalStorage";

describe("Fasting progress edge cases", () => {
  it("calculateStreak returns 0 for empty completedDays", () => {
    const progress: FastingProgress = { ...defaultProgress, completedDays: [] };
    expect(calculateStreak(progress)).toBe(0);
  });

  it("calculateStreak returns 0 when today is not in completedDays", () => {
    const progress: FastingProgress = {
      ...defaultProgress,
      completedDays: ["2025-01-01", "2025-01-02"],
    };
    expect(calculateStreak(progress)).toBe(0);
  });

  it("calculateStreak counts consecutive days ending today", () => {
    const today = new Date().toISOString().split("T")[0];
    const yesterday = new Date(Date.now() - 86400000).toISOString().split("T")[0];
    const progress: FastingProgress = {
      ...defaultProgress,
      completedDays: [today, yesterday].sort(),
    };
    expect(calculateStreak(progress)).toBe(2);
  });

  it("calculateStreak does not break on excused day (illness, travel, etc.)", () => {
    const today = new Date().toISOString().split("T")[0];
    const d = new Date();
    d.setDate(d.getDate() - 1);
    const yesterday = d.toISOString().split("T")[0];
    d.setDate(d.getDate() - 1);
    const twoDaysAgo = d.toISOString().split("T")[0];
    // Today completed, yesterday broken with excused reason, twoDaysAgo completed → streak = 3
    const progress: FastingProgress = {
      ...defaultProgress,
      completedDays: [today, twoDaysAgo].sort(),
      fastingLog: [
        { date: today, startedAt: `${today}T05:00:00Z`, status: "completed", hoursFasted: 14 },
        { date: yesterday, startedAt: `${yesterday}T05:00:00Z`, completedAt: `${yesterday}T12:00:00Z`, status: "broken", brokenReason: "illness", hoursFasted: 7 },
        { date: twoDaysAgo, startedAt: `${twoDaysAgo}T05:00:00Z`, status: "completed", hoursFasted: 14 },
      ],
    };
    expect(calculateStreak(progress)).toBe(3);
  });

  it("calculateStreak with todayOverride uses given date as streak end (e.g. display timezone)", () => {
    const progress: FastingProgress = {
      ...defaultProgress,
      completedDays: ["2025-03-14", "2025-03-15", "2025-03-16"],
      fastingLog: [],
    };
    expect(calculateStreak(progress)).toBe(0);
    expect(calculateStreak(progress, "2025-03-16")).toBe(3);
    expect(calculateStreak(progress, "2025-03-15")).toBe(2);
  });

  it("getTotalHoursFasted returns 0 for empty fastingLog", () => {
    const progress: FastingProgress = { ...defaultProgress, fastingLog: [] };
    expect(getTotalHoursFasted(progress)).toBe(0);
  });

  it("getTotalHoursFasted sums hoursFasted from completed entries", () => {
    const progress: FastingProgress = {
      ...defaultProgress,
      fastingLog: [
        { date: "2025-01-01", startedAt: "2025-01-01T05:00:00Z", status: "completed", hoursFasted: 14 },
        { date: "2025-01-02", startedAt: "2025-01-02T05:00:00Z", status: "completed", hoursFasted: 13 },
      ],
    };
    expect(getTotalHoursFasted(progress)).toBe(27);
  });

  it("getTodayFastingLog returns undefined when no entry for today", () => {
    const progress: FastingProgress = {
      ...defaultProgress,
      fastingLog: [{ date: "2020-01-01", startedAt: "2020-01-01T05:00:00Z", status: "completed" }],
    };
    expect(getTodayFastingLog(progress)).toBeUndefined();
  });

  it("isFastingToday returns false when no today log", () => {
    const progress: FastingProgress = { ...defaultProgress, fastingLog: [] };
    expect(isFastingToday(progress)).toBe(false);
  });
});

/**
 * Regression tests derived from bug reports. Naming: Regression: BUG-<area>-<id>.
 * See docs/QA-BUG-REPORT-FORMAT-AND-CHECKLIST.md § Bug-derived test naming.
 */
describe("Regression: BUG-STRK-001 (streak 0 after Settings / display timezone)", () => {
  const progressWithRun: FastingProgress = {
    ...defaultProgress,
    completedDays: ["2025-03-14", "2025-03-15", "2025-03-16"],
    fastingLog: [],
  };

  it("BUG-STRK-001.1: streak uses todayOverride so display-timezone today matches Dashboard", () => {
    expect(calculateStreak(progressWithRun)).toBe(0);
    expect(calculateStreak(progressWithRun, "2025-03-16")).toBe(3);
  });

  it("BUG-STRK-001.2: getStreakDays length equals calculateStreak for same todayOverride", () => {
    expect(getStreakDays(progressWithRun, "2025-03-16").length).toBe(calculateStreak(progressWithRun, "2025-03-16"));
    expect(getStreakDays(progressWithRun, "2025-03-15").length).toBe(calculateStreak(progressWithRun, "2025-03-15"));
  });

  it("BUG-STRK-001.3: getStreakDays with todayOverride returns consecutive dates ending on override day", () => {
    const days = getStreakDays(progressWithRun, "2025-03-16");
    expect(days).toEqual(["2025-03-16", "2025-03-15", "2025-03-14"]);
    const daysEnd15 = getStreakDays(progressWithRun, "2025-03-15");
    expect(daysEnd15).toEqual(["2025-03-15", "2025-03-14"]);
  });
});

describe("Break fast reasons", () => {
  it("getBrokenReasonLabel returns — for undefined", () => {
    expect(getBrokenReasonLabel(undefined)).toBe("—");
  });

  it("getBrokenReasonLabel returns label for known id", () => {
    const reason = BROKEN_FAST_REASONS[0];
    expect(getBrokenReasonLabel(reason.id)).toBe(reason.label);
  });

  it("getBrokenReasonLabel returns id for unknown id", () => {
    expect(getBrokenReasonLabel("unknown-id")).toBe("unknown-id");
  });
});

describe("Daily missions edge cases", () => {
  const todayStr = new Date().toISOString().split("T")[0];

  it("getDailyMissions returns 7 missions with empty state", () => {
    const missions = getDailyMissions({
      todayStr,
      progress: defaultProgress,
      mealPlans: {},
      foodLog: {},
      scheduleNotes: {},
      quranVerseViewedDates: [],
      hadithViewedDates: [],
    });
    expect(missions).toHaveLength(7);
    expect(missions.every((m) => m.id && m.label && typeof m.completed === "boolean")).toBe(true);
  });

  it("read_hadith mission completed when today in hadithViewedDates", () => {
    const missions = getDailyMissions({
      todayStr,
      progress: defaultProgress,
      mealPlans: {},
      foodLog: {},
      scheduleNotes: {},
      quranVerseViewedDates: [],
      hadithViewedDates: [todayStr],
    });
    const readHadith = missions.find((m) => m.id === "read_hadith");
    expect(readHadith?.completed).toBe(true);
  });
});

describe("Food log edge cases", () => {
  it("normalizeDayFoodLog returns default when undefined", () => {
    const result = normalizeDayFoodLog(undefined);
    expect(result.suhoor).toEqual([]);
    expect(result.iftar).toEqual([]);
    expect(result.between).toEqual([]);
  });

  it("normalizeDayFoodLog fills missing between array", () => {
    const input: DayFoodLog = { suhoor: [], iftar: [], between: undefined as unknown as DayFoodLog["between"] };
    const result = normalizeDayFoodLog(input);
    expect(result.between).toEqual([]);
  });

  it("getDayTotalsFromFoodLog returns zeros for empty log", () => {
    const totals = getDayTotalsFromFoodLog(undefined);
    expect(totals.calories).toBe(0);
    expect(totals.protein).toBe(0);
    expect(totals.carbs).toBe(0);
    expect(totals.fat).toBe(0);
  });
});

describe("hoursBetween", () => {
  it("returns positive hours when end after start", () => {
    const h = hoursBetween("2025-01-01T06:00:00Z", "2025-01-01T20:00:00Z");
    expect(h).toBe(14);
  });

  it("handles same time", () => {
    const t = "2025-01-01T12:00:00Z";
    expect(hoursBetween(t, t)).toBe(0);
  });
});
