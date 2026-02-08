/**
 * Edge-case tests for logging, tracking, and progress.
 * Covers: fasting progress, completed days, streak, break-fast reasons, daily missions, empty state.
 */
import { describe, it, expect, beforeEach } from "vitest";
import { toLocalDateString } from "@/lib/utils";
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
  planToFoodLogEntries,
  hoursBetween,
  breakFastingToday,
  updateBrokenReason,
  setBrokenDayToCompleted,
  setBrokenDayToInProgress,
  normalizeProgressSameDayConflict,
  didCompleteAllPrayers,
  getPrayerCountForDate,
  getPrayerStreak,
  getTotalPrayerCount,
  getJournalStreak,
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
    const now = new Date();
    const today = toLocalDateString(now);
    const yesterday = toLocalDateString(new Date(now.getTime() - 86400000));
    const progress: FastingProgress = {
      ...defaultProgress,
      completedDays: [today, yesterday].sort(),
    };
    expect(calculateStreak(progress)).toBe(2);
  });

  it("calculateStreak does not break on excused day (illness, travel, etc.)", () => {
    const now = new Date();
    const today = toLocalDateString(now);
    const d = new Date(now);
    d.setDate(d.getDate() - 1);
    const yesterday = toLocalDateString(d);
    d.setDate(d.getDate() - 1);
    const twoDaysAgo = toLocalDateString(d);
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

describe("planToFoodLogEntries", () => {
  const mockGetRecipe = (mealType: "suhoor" | "iftar", id: number) =>
    ({ name: `Recipe-${mealType}-${id}`, nutrition: { calories: 100 + id, protein: "5", carbs: "10", fat: "3" } });
  const parseNutrient = (s: string | undefined) => (s ? parseFloat(s) : 0) || 0;

  it("returns empty suhoor and iftar for empty plan", () => {
    const out = planToFoodLogEntries({}, mockGetRecipe, parseNutrient);
    expect(out.suhoor).toEqual([]);
    expect(out.iftar).toEqual([]);
  });

  it("parses recipe keys and creates recipe entries with nutrition", () => {
    const out = planToFoodLogEntries(
      { suhoor: "suhoor-1", iftar: "iftar-2" },
      mockGetRecipe,
      parseNutrient
    );
    expect(out.suhoor).toHaveLength(1);
    expect(out.suhoor[0].type).toBe("recipe");
    expect(out.suhoor[0].name).toBe("Recipe-suhoor-1");
    expect(out.suhoor[0].caloriesPerPortion).toBe(101);
    expect(out.suhoor[0].recipeId).toBe("suhoor-1");
    expect(out.iftar).toHaveLength(1);
    expect(out.iftar[0].name).toBe("Recipe-iftar-2");
    expect(out.iftar[0].caloriesPerPortion).toBe(102);
  });

  it("treats plain text as custom entry with 0 calories", () => {
    const out = planToFoodLogEntries(
      { suhoor: "Oats and dates" },
      mockGetRecipe,
      parseNutrient
    );
    expect(out.suhoor).toHaveLength(1);
    expect(out.suhoor[0].type).toBe("custom");
    expect(out.suhoor[0].name).toBe("Oats and dates");
    expect(out.suhoor[0].caloriesPerPortion).toBe(0);
  });

  it("ignores wrong meal type recipe key in suhoor string", () => {
    const out = planToFoodLogEntries(
      { suhoor: "iftar-2" },
      mockGetRecipe,
      parseNutrient
    );
    expect(out.suhoor).toHaveLength(1);
    expect(out.suhoor[0].type).toBe("custom");
    expect(out.suhoor[0].name).toBe("iftar-2");
  });

  it("splits comma-separated mix of recipe keys and text", () => {
    const out = planToFoodLogEntries(
      { suhoor: "suhoor-1, Plain yogurt, suhoor-3" },
      mockGetRecipe,
      parseNutrient
    );
    expect(out.suhoor).toHaveLength(3);
    expect(out.suhoor[0].name).toBe("Recipe-suhoor-1");
    expect(out.suhoor[1].name).toBe("Plain yogurt");
    expect(out.suhoor[1].type).toBe("custom");
    expect(out.suhoor[2].name).toBe("Recipe-suhoor-3");
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

describe("normalizeProgressSameDayConflict", () => {
  it("removes from completedDays when date is in skippedDays (skipped wins)", () => {
    const progress: FastingProgress = {
      ...defaultProgress,
      completedDays: ["2025-03-01", "2025-03-02", "2025-03-03"],
      skippedDays: ["2025-03-02"],
    };
    const out = normalizeProgressSameDayConflict(progress);
    expect(out.completedDays).toEqual(["2025-03-01", "2025-03-03"]);
    expect(out.skippedDays).toEqual(["2025-03-02"]);
  });

  it("returns same object when no overlap", () => {
    const progress: FastingProgress = {
      ...defaultProgress,
      completedDays: ["2025-03-01"],
      skippedDays: ["2025-03-02"],
    };
    const out = normalizeProgressSameDayConflict(progress);
    expect(out.completedDays).toEqual(["2025-03-01"]);
    expect(out).toBe(progress);
  });
});

describe("breakFastingToday", () => {
  it("uses brokeAt when provided and computes hoursFasted from startedAt to brokeAt", () => {
    const dateStr = "2025-03-15";
    const startedAt = "2025-03-15T05:00:00.000Z";
    const brokeAt = "2025-03-15T12:30:00.000Z"; // 7.5h later
    const progress: FastingProgress = {
      ...defaultProgress,
      fastingLog: [{ date: dateStr, startedAt, status: "in_progress" }],
    };
    let next: FastingProgress = progress;
    const setProgress = (v: FastingProgress | ((p: FastingProgress) => FastingProgress)) => {
      next = typeof v === "function" ? v(next) : v;
    };
    breakFastingToday(next, setProgress, "illness", dateStr, brokeAt);
    const entry = next.fastingLog?.find((e) => e.date === dateStr);
    expect(entry?.status).toBe("broken");
    expect(entry?.completedAt).toBe(brokeAt);
    expect(entry?.brokenReason).toBe("illness");
    expect(entry?.hoursFasted).toBe(7.5);
  });

  it("uses current time when brokeAt is omitted", () => {
    const dateStr = toLocalDateString(new Date());
    const sixHoursAgo = new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString();
    const progress: FastingProgress = {
      ...defaultProgress,
      fastingLog: [{ date: dateStr, startedAt: sixHoursAgo, status: "in_progress" }],
    };
    let next: FastingProgress = progress;
    const setProgress = (v: FastingProgress | ((p: FastingProgress) => FastingProgress)) => {
      next = typeof v === "function" ? v(next) : v;
    };
    breakFastingToday(next, setProgress, "other", dateStr);
    const entry = next.fastingLog?.find((e) => e.date === dateStr);
    expect(entry?.status).toBe("broken");
    expect(entry?.completedAt).toBeDefined();
    expect(entry?.hoursFasted).toBeDefined();
    expect(entry!.hoursFasted!).toBeGreaterThanOrEqual(5);
    expect(entry!.hoursFasted!).toBeLessThanOrEqual(7);
  });
});

describe("State transition: broken day (E8, B→C, B→I)", () => {
  const dateStr = "2025-03-15";

  it("updateBrokenReason updates brokenReason for existing broken entry", () => {
    const progress: FastingProgress = {
      ...defaultProgress,
      fastingLog: [
        { date: dateStr, startedAt: `${dateStr}T05:00:00Z`, completedAt: `${dateStr}T12:00:00Z`, status: "broken", brokenReason: "other", hoursFasted: 7 },
      ],
    };
    let next: FastingProgress = progress;
    const setProgress = (v: FastingProgress | ((p: FastingProgress) => FastingProgress)) => {
      next = typeof v === "function" ? v(next) : v;
    };
    updateBrokenReason(next, setProgress, dateStr, "illness");
    const entry = next.fastingLog?.find((e) => e.date === dateStr);
    expect(entry?.status).toBe("broken");
    expect(entry?.brokenReason).toBe("illness");
  });

  it("setBrokenDayToCompleted adds to completedDays and sets log to completed", () => {
    const progress: FastingProgress = {
      ...defaultProgress,
      completedDays: [],
      fastingLog: [
        { date: dateStr, startedAt: `${dateStr}T05:00:00Z`, completedAt: `${dateStr}T12:00:00Z`, status: "broken", brokenReason: "other", hoursFasted: 7 },
      ],
    };
    let next: FastingProgress = progress;
    const setProgress = (v: FastingProgress | ((p: FastingProgress) => FastingProgress)) => {
      next = typeof v === "function" ? v(next) : v;
    };
    setBrokenDayToCompleted(next, setProgress, dateStr);
    expect(next.completedDays).toContain(dateStr);
    const entry = next.fastingLog?.find((e) => e.date === dateStr);
    expect(entry?.status).toBe("completed");
  });

  it("setBrokenDayToInProgress sets log to in_progress", () => {
    const progress: FastingProgress = {
      ...defaultProgress,
      fastingLog: [
        { date: dateStr, startedAt: `${dateStr}T05:00:00Z`, completedAt: `${dateStr}T12:00:00Z`, status: "broken", brokenReason: "other", hoursFasted: 7 },
      ],
    };
    let next: FastingProgress = progress;
    const setProgress = (v: FastingProgress | ((p: FastingProgress) => FastingProgress)) => {
      next = typeof v === "function" ? v(next) : v;
    };
    setBrokenDayToInProgress(next, setProgress, dateStr);
    const entry = next.fastingLog?.find((e) => e.date === dateStr);
    expect(entry?.status).toBe("in_progress");
    expect(entry?.completedAt).toBeUndefined();
  });
});

describe("Prayer completion helpers", () => {
  const tracker = (dates: Record<string, Partial<Record<string, boolean>>>): Record<string, Record<string, boolean>> =>
    Object.fromEntries(
      Object.entries(dates).map(([d, prayers]) => [
        d,
        Object.fromEntries(
          ["Fajr", "Dhuhr", "Asr", "Maghrib", "Isha"].map((p) => [p, !!prayers[p as keyof typeof prayers]])
        ),
      ])
    );

  it("didCompleteAllPrayers returns true when all 5 prayers done for date", () => {
    const t = tracker({ "2025-03-15": { Fajr: true, Dhuhr: true, Asr: true, Maghrib: true, Isha: true } });
    expect(didCompleteAllPrayers(t, "2025-03-15")).toBe(true);
  });

  it("didCompleteAllPrayers returns false when any prayer missing", () => {
    const t = tracker({ "2025-03-15": { Fajr: true, Dhuhr: true, Asr: false, Maghrib: true, Isha: true } });
    expect(didCompleteAllPrayers(t, "2025-03-15")).toBe(false);
  });

  it("didCompleteAllPrayers returns false for unknown date", () => {
    const t = tracker({});
    expect(didCompleteAllPrayers(t, "2025-03-15")).toBe(false);
  });

  it("getPrayerCountForDate returns 0-5", () => {
    const t = tracker({
      "2025-03-15": { Fajr: true, Dhuhr: true, Asr: true, Maghrib: true, Isha: true },
      "2025-03-16": { Fajr: true, Dhuhr: false, Asr: false, Maghrib: false, Isha: false },
    });
    expect(getPrayerCountForDate(t, "2025-03-15")).toBe(5);
    expect(getPrayerCountForDate(t, "2025-03-16")).toBe(1);
    expect(getPrayerCountForDate(t, "2025-03-17")).toBe(0);
  });

  it("getPrayerStreak counts consecutive days with all 5 prayers", () => {
    const t = tracker({
      "2025-03-14": { Fajr: true, Dhuhr: true, Asr: true, Maghrib: true, Isha: true },
      "2025-03-15": { Fajr: true, Dhuhr: true, Asr: true, Maghrib: true, Isha: true },
      "2025-03-16": { Fajr: true, Dhuhr: true, Asr: true, Maghrib: true, Isha: true },
      "2025-03-17": { Fajr: true, Dhuhr: false, Asr: true, Maghrib: true, Isha: true },
    });
    expect(getPrayerStreak(t, "2025-03-16")).toBe(3);
    expect(getPrayerStreak(t, "2025-03-17")).toBe(0);
    expect(getPrayerStreak(t, "2025-03-15")).toBe(2);
  });

  it("getTotalPrayerCount sums all completed prayers across dates", () => {
    const t = tracker({
      "2025-03-15": { Fajr: true, Dhuhr: true, Asr: true, Maghrib: true, Isha: true },
      "2025-03-16": { Fajr: true, Dhuhr: false, Asr: false, Maghrib: false, Isha: false },
    });
    expect(getTotalPrayerCount(t)).toBe(6);
  });

  it("getTotalPrayerCount returns 0 for empty tracker", () => {
    expect(getTotalPrayerCount({})).toBe(0);
  });

  it("getPrayerStreak returns 0 for empty tracker", () => {
    expect(getPrayerStreak({}, "2025-03-15")).toBe(0);
  });

  it("getPrayerCountForDate ignores extra keys and counts only Fajr/Dhuhr/Asr/Maghrib/Isha", () => {
    const t: Record<string, Record<string, boolean>> = {
      "2025-03-15": {
        Fajr: true,
        Dhuhr: true,
        Asr: true,
        Maghrib: true,
        Isha: true,
        Other: true,
      } as Record<string, boolean>,
    };
    expect(getPrayerCountForDate(t, "2025-03-15")).toBe(5);
  });

  it("didCompleteAllPrayers requires all 5; extra keys do not satisfy", () => {
    const t: Record<string, Record<string, boolean>> = {
      "2025-03-15": {
        Fajr: true,
        Dhuhr: true,
        Asr: true,
        Maghrib: true,
        Other: true,
      } as Record<string, boolean>,
    };
    expect(didCompleteAllPrayers(t, "2025-03-15")).toBe(false);
  });

  it("getTotalPrayerCount returns 0 for malformed tracker (null, array)", () => {
    expect(getTotalPrayerCount(null as unknown as Record<string, Record<string, boolean>>)).toBe(0);
    expect(getTotalPrayerCount([] as unknown as Record<string, Record<string, boolean>>)).toBe(0);
  });

  it("getPrayerCountForDate handles malformed day object (string) as empty", () => {
    const t = { "2025-03-15": "invalid" as unknown as Record<string, boolean> };
    expect(getPrayerCountForDate(t, "2025-03-15")).toBe(0);
  });
});

describe("getJournalStreak (non-fasting achievements)", () => {
  it("returns 0 for empty entries", () => {
    expect(getJournalStreak([])).toBe(0);
  });

  it("counts consecutive days ending today with at least one journal entry", () => {
    const today = toLocalDateString(new Date());
    const d = new Date();
    d.setDate(d.getDate() - 1);
    const yesterday = toLocalDateString(d);
    d.setDate(d.getDate() - 1);
    const twoDaysAgo = toLocalDateString(d);
    const entries = [
      { date: today },
      { date: yesterday },
      { date: twoDaysAgo },
    ];
    expect(getJournalStreak(entries)).toBe(3);
  });

  it("uses unique dates (multiple entries same day count as one day)", () => {
    const today = toLocalDateString(new Date());
    const d = new Date();
    d.setDate(d.getDate() - 1);
    const yesterday = toLocalDateString(d);
    const entries = [
      { date: today, slot: "morning" },
      { date: today, slot: "general" },
      { date: yesterday },
    ];
    expect(getJournalStreak(entries)).toBe(2);
  });

  it("stops at first day without an entry", () => {
    const today = toLocalDateString(new Date());
    const d = new Date();
    d.setDate(d.getDate() - 1);
    const yesterday = toLocalDateString(d);
    d.setDate(d.getDate() - 1);
    const twoDaysAgo = toLocalDateString(d);
    const entries = [
      { date: today },
      { date: twoDaysAgo },
    ];
    expect(getJournalStreak(entries)).toBe(1);
  });
});
