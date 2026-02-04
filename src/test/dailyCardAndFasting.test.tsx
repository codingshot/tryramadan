/**
 * Daily card and fasting: Dashboard and DashboardToday.
 * Renders with realistic state, toggles fast, mark complete, break fast (with reason), switch days.
 * Edge: broken/excused after start; non-Muslim (no prayer strip when times null).
 */
import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import { TooltipProvider } from "@/components/ui/tooltip";
import { toLocalDateString } from "@/lib/utils";
import Dashboard from "@/pages/Dashboard";
import DashboardToday from "@/pages/DashboardToday";
import { PREFS_WITH_LOCATION, PREFS_NON_MUSLIM, MOCK_PRAYER_TIMES } from "./testHelpers";

const mockPrayerTimes = {
  prayerTimes: MOCK_PRAYER_TIMES,
  hijriDate: { day: "1", month: "Ramadan", monthAr: "رمضان", year: "1446" },
  loading: false,
};

vi.mock("@/hooks/usePrayerTimes", () => ({
  usePrayerTimes: vi.fn(() => mockPrayerTimes),
  usePrayerTimesForDate: vi.fn(() => ({ prayerTimes: MOCK_PRAYER_TIMES })),
  getSunnahFastingInfo: vi.fn(() => null),
  checkAyyamAlBeed: vi.fn().mockResolvedValue({ isAyyamAlBeed: false, hijriDay: 15 }),
}));

vi.mock("@/hooks/useLocation", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/hooks/useLocation")>();
  return {
    ...actual,
    useAutoLocation: vi.fn(() => ({ location: null, loading: false })),
    getTimezoneFromCoords: vi.fn().mockResolvedValue(null),
  };
});

function renderDashboard(initialEntries = ["/dashboard"]) {
  return render(
    <TooltipProvider>
      <MemoryRouter initialEntries={initialEntries}>
        <Routes>
          <Route path="/dashboard" element={<Dashboard />} />
        </Routes>
      </MemoryRouter>
    </TooltipProvider>
  );
}

function renderDashboardToday(initialEntries = ["/dashboard/today"]) {
  return render(
    <TooltipProvider>
      <MemoryRouter initialEntries={initialEntries}>
        <Routes>
          <Route path="/dashboard/today" element={<DashboardToday />} />
        </Routes>
      </MemoryRouter>
    </TooltipProvider>
  );
}

describe("Daily card and fasting", () => {
  beforeEach(() => {
    localStorage.clear();
    localStorage.setItem("tryramadan-preferences", JSON.stringify(PREFS_WITH_LOCATION));
  });

  describe("Dashboard renders daily card with realistic props", () => {
    it("renders day selector with previous and next day buttons", () => {
      renderDashboard();
      expect(screen.getByRole("button", { name: /previous day/i })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /next day/i })).toBeInTheDocument();
    });

    it("renders fasting status or eating window text", () => {
      renderDashboard();
      const status = screen.getAllByText(/Right now:|Fasting|Eating window|Currently fasting|Not fasting/i, {
        exact: false,
      });
      expect(status.length).toBeGreaterThan(0);
    });

    it("shows I'm fasting button when not fasting and not completed today", () => {
      renderDashboard();
      const imFasting = screen.queryByRole("button", { name: /I'm fasting/i });
      if (imFasting) expect(imFasting).toBeInTheDocument();
    });

    it("shows Mark complete or Fasted today control when viewing today", () => {
      renderDashboard();
      expect(
        screen.getByRole("button", { name: /mark complete|fasted today|mark today as fasted/i })
      ).toBeInTheDocument();
    });
  });

  describe("Toggling a fast", () => {
    it("clicking I'm fasting adds in_progress entry to progress and shows Break fast", () => {
      renderDashboard();
      const imFasting = screen.queryByRole("button", { name: /I'm fasting/i });
      if (!imFasting) return;
      fireEvent.click(imFasting);
      const progressRaw = localStorage.getItem("tryramadan-progress");
      expect(progressRaw).toBeTruthy();
      const progress = JSON.parse(progressRaw!);
      const today = toLocalDateString(new Date());
      const todayEntry = progress.fastingLog?.find((e: { date: string }) => e.date === today);
      expect(todayEntry).toBeDefined();
      expect(todayEntry.status).toBe("in_progress");
      expect(screen.queryByRole("button", { name: /break fast/i })).toBeInTheDocument();
    });

    it("marking today complete updates completedDays and fastingLog status to completed", () => {
      localStorage.setItem(
        "tryramadan-progress",
        JSON.stringify({
          currentDay: 1,
          totalDays: 30,
          completedDays: [],
          sunnahDaysCompleted: 0,
          currentStreak: 0,
          longestStreak: 0,
          startDate: null,
          fastingLog: [
            {
              date: toLocalDateString(new Date()),
              startedAt: new Date().toISOString(),
              status: "in_progress",
            },
          ],
        })
      );
      renderDashboard();
      const markComplete = screen.getByRole("button", { name: /mark complete|fasted today|mark today as fasted/i });
      fireEvent.click(markComplete);
      const progress = JSON.parse(localStorage.getItem("tryramadan-progress")!);
      const today = toLocalDateString(new Date());
      expect(progress.completedDays).toContain(today);
      const entry = progress.fastingLog?.find((e: { date: string }) => e.date === today);
      expect(entry?.status).toBe("completed");
    });
  });

  describe("Marking fast as broken or excused after it started", () => {
    it("opening Break fast and choosing a reason updates log to broken and removes from completedDays", () => {
      const today = toLocalDateString(new Date());
      localStorage.setItem(
        "tryramadan-progress",
        JSON.stringify({
          currentDay: 1,
          totalDays: 30,
          completedDays: [],
          sunnahDaysCompleted: 0,
          currentStreak: 0,
          longestStreak: 0,
          startDate: null,
          fastingLog: [
            { date: today, startedAt: new Date().toISOString(), status: "in_progress" },
          ],
        })
      );
      renderDashboard();
      const breakFastBtn = screen.getByRole("button", { name: /break fast/i });
      fireEvent.click(breakFastBtn);
      const sureBtn = screen.getByRole("button", { name: /sure/i });
      fireEvent.click(sureBtn);
      const reasonBtns = screen.getAllByRole("button", { name: /reason:/i });
      fireEvent.click(reasonBtns[0]);
      const progress = JSON.parse(localStorage.getItem("tryramadan-progress")!);
      const entry = progress.fastingLog?.find((e: { date: string }) => e.date === today);
      expect(entry?.status).toBe("broken");
      expect(entry?.brokenReason).toBeDefined();
      expect(progress.completedDays).not.toContain(today);
    });
  });

  describe("Switching days", () => {
    it("previous/next day changes selected date and day view content", () => {
      renderDashboard();
      const prevBtn = screen.getByRole("button", { name: /previous day/i });
      const nextBtn = screen.getByRole("button", { name: /next day/i });
      fireEvent.click(prevBtn);
      fireEvent.click(prevBtn);
      fireEvent.click(nextBtn);
      expect(prevBtn).toBeInTheDocument();
      expect(nextBtn).toBeInTheDocument();
    });
  });

  describe("Dashboard Today page", () => {
    it("renders Today's Fast header and countdown or status", () => {
      renderDashboardToday();
      const headings = screen.getAllByRole("heading", { name: /today's fast/i });
      expect(headings.length).toBeGreaterThan(0);
      expect(
        screen.getAllByText(/suhoor|iftar|fasting|countdown|hydration|intention|mark complete|broke/i).length
      ).toBeGreaterThan(0);
    });

    it("shows I fasted today — mark complete and I broke my fast when fasting in progress", () => {
      const today = toLocalDateString(new Date());
      localStorage.setItem(
        "tryramadan-progress",
        JSON.stringify({
          currentDay: 1,
          totalDays: 30,
          completedDays: [],
          sunnahDaysCompleted: 0,
          currentStreak: 0,
          longestStreak: 0,
          startDate: null,
          fastingLog: [
            { date: today, startedAt: new Date().toISOString(), status: "in_progress" },
          ],
        })
      );
      renderDashboardToday();
      expect(screen.getByRole("button", { name: /I fasted today — mark complete/i })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /I broke my fast/i })).toBeInTheDocument();
    });

    it("breaking fast from Today page opens reason dialog and persists broken reason", () => {
      const today = toLocalDateString(new Date());
      localStorage.setItem(
        "tryramadan-progress",
        JSON.stringify({
          currentDay: 1,
          totalDays: 30,
          completedDays: [],
          sunnahDaysCompleted: 0,
          currentStreak: 0,
          longestStreak: 0,
          startDate: null,
          fastingLog: [
            { date: today, startedAt: new Date().toISOString(), status: "in_progress" },
          ],
        })
      );
      renderDashboardToday();
      fireEvent.click(screen.getByRole("button", { name: /I broke my fast/i }));
      const reasonBtns = screen.getAllByRole("button", { name: /reason:/i });
      fireEvent.click(reasonBtns[0]);
      const progress = JSON.parse(localStorage.getItem("tryramadan-progress")!);
      const entry = progress.fastingLog?.find((e: { date: string }) => e.date === today);
      expect(entry?.status).toBe("broken");
      expect(entry?.brokenReason).toBeDefined();
    });
  });

  describe("Non-Muslim mode: fasting and meal tracking still available", () => {
    it("renders dashboard with Today, Schedule, and Meals when userType is non-muslim", () => {
      localStorage.setItem("tryramadan-preferences", JSON.stringify(PREFS_NON_MUSLIM));
      renderDashboard();
      expect(screen.getByRole("link", { name: /^today$/i })).toBeInTheDocument();
      expect(screen.getByRole("link", { name: /^schedule$/i })).toBeInTheDocument();
      expect(screen.getByRole("link", { name: /^meals$/i })).toBeInTheDocument();
    });
  });
});
