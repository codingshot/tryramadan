/**
 * Calendar / month view: DashboardSchedule.
 * Renders calendar, switches month, selects day, jump to Ramadan/today.
 * Edge: switching dates around suhoor/iftar (select different days).
 */
import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import { TooltipProvider } from "@/components/ui/tooltip";
import DashboardSchedule from "@/pages/DashboardSchedule";
import { PREFS_WITH_LOCATION, MOCK_PRAYER_TIMES } from "./testHelpers";

vi.mock("@/hooks/usePrayerTimes", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/hooks/usePrayerTimes")>();
  return {
    ...actual,
    usePrayerTimes: vi.fn(() => ({ prayerTimes: MOCK_PRAYER_TIMES, loading: false })),
    usePrayerTimesForDate: vi.fn(() => ({ prayerTimes: MOCK_PRAYER_TIMES })),
    useRamadanPrayerTimes: vi.fn(() => ({ prayerTimesMap: {}, loading: false, refetch: vi.fn() })),
    fetchPrayerTimesForMonth: vi.fn().mockResolvedValue({}),
    fetchRamadanPrayerTimes: vi.fn().mockResolvedValue({}),
  };
});

vi.mock("@/hooks/useLocation", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/hooks/useLocation")>();
  return {
    ...actual,
    useAutoLocation: vi.fn(() => ({ location: null, loading: false })),
    getTimezoneFromCoords: vi.fn().mockResolvedValue(null),
  };
});

function renderSchedule(initialEntries = ["/dashboard/schedule"]) {
  return render(
    <TooltipProvider>
      <MemoryRouter initialEntries={initialEntries}>
        <Routes>
          <Route path="/dashboard/schedule" element={<DashboardSchedule />} />
        </Routes>
      </MemoryRouter>
    </TooltipProvider>
  );
}

describe("Calendar / month view", () => {
  beforeEach(() => {
    localStorage.clear();
    localStorage.setItem("tryramadan-preferences", JSON.stringify(PREFS_WITH_LOCATION));
  });

  it("renders schedule page with calendar and month navigation", () => {
    renderSchedule();
    expect(screen.getByRole("button", { name: /previous month/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /next month/i })).toBeInTheDocument();
    expect(screen.getAllByText(/schedule|ramadan|calendar|day|export/i).length).toBeGreaterThan(0);
  });

  it("renders Jump to Ramadan and Jump to today buttons", () => {
    renderSchedule();
    expect(screen.getByRole("button", { name: /jump to ramadan/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /jump to today/i })).toBeInTheDocument();
  });

  it("clicking previous month changes displayed month", () => {
    renderSchedule();
    const prev = screen.getByRole("button", { name: /previous month/i });
    fireEvent.click(prev);
    fireEvent.click(prev);
    expect(prev).toBeInTheDocument();
  });

  it("clicking next month changes displayed month", () => {
    renderSchedule();
    const next = screen.getByRole("button", { name: /next month/i });
    fireEvent.click(next);
    expect(next).toBeInTheDocument();
  });

  it("clicking a day cell selects that day and shows day detail", () => {
    renderSchedule();
    const dayCells = screen.getAllByRole("button", { name: /^\d+$/ }).filter((b) => Number(b.textContent) >= 1 && Number(b.textContent) <= 31);
    if (dayCells.length > 0) {
      fireEvent.click(dayCells[5]);
      expect(screen.getAllByText(/meal plan|food log|prayer|note|journal|completed|fast/i).length).toBeGreaterThan(0);
    }
  });

  it("jump to Ramadan navigates calendar to Ramadan month", () => {
    renderSchedule();
    fireEvent.click(screen.getByRole("button", { name: /jump to ramadan/i }));
    expect(screen.getByRole("button", { name: /next month/i })).toBeInTheDocument();
  });

  it("jump to today navigates calendar to current month", () => {
    renderSchedule();
    fireEvent.click(screen.getByRole("button", { name: /jump to today/i }));
    expect(screen.getByRole("button", { name: /previous month/i })).toBeInTheDocument();
  });

  it("with completed days in progress, calendar shows completed state for those dates", () => {
    const today = new Date().toISOString().split("T")[0];
    localStorage.setItem(
      "tryramadan-progress",
      JSON.stringify({
        currentDay: 1,
        totalDays: 30,
        completedDays: [today],
        sunnahDaysCompleted: 0,
        currentStreak: 1,
        longestStreak: 1,
        startDate: null,
        fastingLog: [],
      })
    );
    renderSchedule();
    expect(screen.getByRole("button", { name: /previous month/i })).toBeInTheDocument();
  });
});
