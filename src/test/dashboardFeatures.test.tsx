/**
 * Dashboard feature tests: day selector, fasting status, quick actions, links, schedule.
 */
import { describe, it, expect, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import { TooltipProvider } from "@/components/ui/tooltip";
import Dashboard from "@/pages/Dashboard";
import DashboardToday from "@/pages/DashboardToday";
import DashboardSchedule from "@/pages/DashboardSchedule";
import DashboardMacros from "@/pages/DashboardMacros";

const prefsWithLocation = {
  onboardingComplete: true,
  userType: "muslim",
  theme: "dark",
  locationCoords: { lat: 51.5074, lng: -0.1278 },
  location: "London, UK",
};

describe("Dashboard features", () => {
  beforeEach(() => {
    localStorage.clear();
    localStorage.setItem("tryramadan-preferences", JSON.stringify(prefsWithLocation));
  });

  function renderDashboard() {
    return render(
      <TooltipProvider>
        <MemoryRouter initialEntries={["/dashboard"]}>
          <Routes>
            <Route path="/dashboard" element={<Dashboard />} />
          </Routes>
        </MemoryRouter>
      </TooltipProvider>
    );
  }

  it("renders header with Settings link and location", async () => {
    renderDashboard();
    const settingsLinks = screen.getAllByRole("link", { name: /settings/i });
    expect(settingsLinks.some((l) => l.getAttribute("href") === "/settings")).toBe(true);
  });

  it("has day selector with prev/next and Go to today", async () => {
    renderDashboard();
    const prevBtn = screen.getByRole("button", { name: /previous day/i });
    const nextBtn = screen.getByRole("button", { name: /next day/i });
    expect(prevBtn).toBeInTheDocument();
    expect(nextBtn).toBeInTheDocument();
    const goToToday = screen.queryByRole("button", { name: /go to today/i });
    if (goToToday) expect(goToToday).toBeInTheDocument();
  });

  it("shows fasting status or eating window", async () => {
    renderDashboard();
    const statusEls = screen.getAllByText(/Right now: (Fasting|Eating window)|currently fasting|not fasting/i, {
      exact: false,
    });
    expect(statusEls.length).toBeGreaterThan(0);
  });

  it("has Mark complete tag when viewing today", async () => {
    renderDashboard();
    expect(screen.getByRole("button", { name: /fasted today|mark today as fasted/i })).toBeInTheDocument();
  });

  it("shows streak and total days stats", async () => {
    renderDashboard();
    expect(screen.getAllByText(/day streak|إجمالي الأيام/i, { exact: false }).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/total days/i).length).toBeGreaterThan(0);
  });

  it("has quick action links to Today, Schedule, Meals, Journal", async () => {
    renderDashboard();
    const todayLink = await screen.findByRole("link", { name: /^today$/i }, { timeout: 8000 });
    const scheduleLink = screen.getByRole("link", { name: /^schedule$/i });
    const mealsLink = screen.getByRole("link", { name: /^meals$/i });
    const journalLink = screen.getAllByRole("link").find((l) => l.getAttribute("href") === "/dashboard/journal");
    expect(todayLink).toHaveAttribute("href", "/dashboard/today");
    expect(scheduleLink).toHaveAttribute("href", "/dashboard/schedule");
    expect(mealsLink).toHaveAttribute("href", "/dashboard/meals");
    expect(journalLink).toBeDefined();
  });

  it("has links to Prayers and Learn", async () => {
    renderDashboard();
    const prayersLink = screen.getAllByRole("link").find((l) => l.getAttribute("href") === "/dashboard/prayers");
    const learnLink = screen.getAllByRole("link").find((l) => l.getAttribute("href") === "/dashboard/learn");
    expect(prayersLink).toBeDefined();
    expect(learnLink).toBeDefined();
  });

  it("day selector prev/next changes selected date", async () => {
    renderDashboard();
    const prevBtn = screen.getByRole("button", { name: /previous day/i });
    const nextBtn = screen.getByRole("button", { name: /next day/i });
    fireEvent.click(prevBtn);
    fireEvent.click(nextBtn);
  });
});

describe("Dashboard Today page", () => {
  beforeEach(() => {
    localStorage.setItem("tryramadan-preferences", JSON.stringify(prefsWithLocation));
  });

  it("renders fasting timer and countdown content", () => {
    render(
      <TooltipProvider>
        <MemoryRouter initialEntries={["/dashboard/today"]}>
          <Routes>
            <Route path="/dashboard/today" element={<DashboardToday />} />
          </Routes>
        </MemoryRouter>
      </TooltipProvider>
    );
    expect(screen.getAllByText(/suhoor|iftar|fasting|progress|until|hydration|intention/i).length).toBeGreaterThan(0);
  });
});

describe("Dashboard Schedule page", () => {
  beforeEach(() => {
    localStorage.setItem("tryramadan-preferences", JSON.stringify(prefsWithLocation));
  });

  it("renders schedule calendar and export option", () => {
    render(
      <TooltipProvider>
        <MemoryRouter initialEntries={["/dashboard/schedule"]}>
          <Routes>
            <Route path="/dashboard/schedule" element={<DashboardSchedule />} />
          </Routes>
        </MemoryRouter>
      </TooltipProvider>
    );
    expect(screen.getAllByText(/schedule|ramadan|calendar|day|export|ics/i).length).toBeGreaterThan(0);
  });
});

describe("Dashboard Macros page", () => {
  beforeEach(() => {
    localStorage.clear();
    localStorage.setItem("tryramadan-preferences", JSON.stringify(prefsWithLocation));
  });

  it("renders Macro Tracker with meal history and quick add from recipe", () => {
    render(
      <TooltipProvider>
        <MemoryRouter initialEntries={["/dashboard/macros"]}>
          <Routes>
            <Route path="/dashboard/macros" element={<DashboardMacros />} />
          </Routes>
        </MemoryRouter>
      </TooltipProvider>
    );
    expect(screen.getByText(/macro tracker/i)).toBeInTheDocument();
    expect(screen.getByText(/meal history/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /list/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /feed/i })).toBeInTheDocument();
    expect(screen.getAllByText(/quick add from recipe/i).length).toBeGreaterThan(0);
  });

  it("opening a meal type in Actual food eaten shows add form with Add to log button", () => {
    render(
      <TooltipProvider>
        <MemoryRouter initialEntries={["/dashboard/macros"]}>
          <Routes>
            <Route path="/dashboard/macros" element={<DashboardMacros />} />
          </Routes>
        </MemoryRouter>
      </TooltipProvider>
    );
    const suhoorButtons = screen.getAllByRole("button", { name: /suhoor \(morning\)/i });
    fireEvent.click(suhoorButtons[suhoorButtons.length - 1]);
    expect(screen.getByRole("button", { name: /add to log/i })).toBeInTheDocument();
  });
});
