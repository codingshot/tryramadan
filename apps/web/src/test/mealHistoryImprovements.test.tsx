/**
 * Meal history (Macro Tracker) improvements: fasting history, meal history list/feed,
 * date from URL, clicking entry to set date. Plan-to-log conversion covered in loggingAndTracking.test.ts.
 */
import { describe, it, expect, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import { TooltipProvider } from "@/components/ui/tooltip";
import DashboardMacros from "@/pages/DashboardMacros";

const prefsWithLocation = {
  onboardingComplete: true,
  userType: "muslim",
  theme: "dark",
  locationCoords: { lat: 51.5074, lng: -0.1278 },
  location: "London, UK",
};

function renderMacros(initialEntries: string[] = ["/dashboard/macros"]) {
  return render(
    <TooltipProvider>
      <MemoryRouter initialEntries={initialEntries}>
        <Routes>
          <Route path="/dashboard/macros" element={<DashboardMacros />} />
        </Routes>
      </MemoryRouter>
    </TooltipProvider>
  );
}

describe("Meal history improvements", () => {
  beforeEach(() => {
    localStorage.clear();
    localStorage.setItem("tryramadan-preferences", JSON.stringify(prefsWithLocation));
  });

  it("renders Fasting history section and Meal history section", () => {
    renderMacros();
    expect(screen.getByText(/fasting history/i)).toBeInTheDocument();
    expect(screen.getByText(/meal history/i)).toBeInTheDocument();
  });

  it("shows empty fasting history message when no fasting log", () => {
    renderMacros();
    expect(screen.getByText(/your fasting log will show here/i)).toBeInTheDocument();
  });

  it("shows List and Feed view toggles for meal history", () => {
    renderMacros();
    expect(screen.getByRole("button", { name: /list/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /feed/i })).toBeInTheDocument();
  });

  it("shows Full fasting tracker link when fasting history is present", () => {
    const today = new Date().toISOString().split("T")[0];
    localStorage.setItem(
      "tryramadan-progress",
      JSON.stringify({
        currentDay: 1,
        totalDays: 30,
        completedDays: [],
        fastingLog: [
          { date: today, startedAt: new Date().toISOString(), status: "completed", hoursFasted: 14 },
        ],
      })
    );
    renderMacros();
    expect(screen.getByRole("link", { name: /full fasting tracker/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /full fasting tracker/i })).toHaveAttribute(
      "href",
      "/dashboard/progress"
    );
  });

  it("respects date query param and updates selected date display", () => {
    renderMacros(["/dashboard/macros?date=2025-03-15"]);
    const main = screen.getByRole("main");
    expect(main.textContent).toMatch(/Mar.*15.*2025/);
  });

  it("meal history list shows empty state when no food logged", () => {
    renderMacros();
    expect(screen.getByText(/no meals logged yet/i)).toBeInTheDocument();
  });

  it("clicking a meal history entry (when present) navigates to that day without error", () => {
    const today = new Date().toISOString().split("T")[0];
    localStorage.setItem(
      "tryramadan-day-food-log",
      JSON.stringify({
        [today]: {
          suhoor: [
            {
              id: "log-1",
              type: "custom",
              mealType: "suhoor",
              name: "Test Oats",
              portions: 1,
              caloriesPerPortion: 150,
            },
          ],
          iftar: [],
          between: [],
        },
      })
    );
    renderMacros();
    const entry = screen.getByRole("button", { name: /test oats/i });
    expect(entry).toBeInTheDocument();
    fireEvent.click(entry);
    expect(screen.getByText(/macro tracker/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /test oats/i })).toBeInTheDocument();
  });
});
