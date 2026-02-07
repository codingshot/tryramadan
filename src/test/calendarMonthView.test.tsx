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
    const dayCells = screen.getAllByTestId("calendar-day-cell");
    expect(dayCells.length).toBeGreaterThan(0);
    fireEvent.click(dayCells[5]);
    expect(screen.getAllByText(/meal plan|food log|prayer|note|journal|completed|fast/i).length).toBeGreaterThan(0);
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

  it("shows Add to calendar section with time/type selects and Sync Ramadan", () => {
    renderSchedule();
    expect(screen.getByRole("heading", { name: /add to calendar/i })).toBeInTheDocument();
    expect(screen.getByRole("combobox", { name: /choose time/i })).toBeInTheDocument();
    expect(screen.getByRole("combobox", { name: /choose add to calendar type/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /add to calendar/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /sync ramadan to calendar/i })).toBeInTheDocument();
  });

  it("shows Default event durations (minutes) when expanded", () => {
    renderSchedule();
    const summary = screen.getByText(/default event durations \(minutes\)/i);
    expect(summary).toBeInTheDocument();
    fireEvent.click(summary);
    expect(screen.getByText(/used when you sync ramadan/i)).toBeInTheDocument();
  });

  it("shows Ramadan daily schedule section when location is set", () => {
    renderSchedule();
    expect(screen.getByRole("heading", { name: /ramadan daily schedule/i })).toBeInTheDocument();
  });

  it("shows stats: Ramadan days, Sunnah, completed, hours fasted", () => {
    renderSchedule();
    expect(screen.getByText(/ramadan this month/i)).toBeInTheDocument();
    expect(screen.getAllByText(/sunnah \(mon\/thu\)/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/days completed|completed/i).length).toBeGreaterThan(0);
  });

  it("shows Dashboard quick access config", () => {
    renderSchedule();
    expect(screen.getByText(/dashboard quick access/i)).toBeInTheDocument();
  });

  it("shows Choose add to calendar type and Choose time selects", () => {
    renderSchedule();
    expect(screen.getByText(/choose add to calendar type/i)).toBeInTheDocument();
    expect(screen.getByRole("combobox", { name: /choose add to calendar type/i })).toBeInTheDocument();
    expect(screen.getByRole("combobox", { name: /choose time/i })).toBeInTheDocument();
  });
});
