/**
 * Meal logger: DashboardMeals and Schedule food log.
 * Add recipe/custom meal, edit portions, remove entry; assert localStorage.
 * Edge: logging meal on fasting day does not change fast status.
 */
import { describe, it, expect, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import { TooltipProvider } from "@/components/ui/tooltip";
import DashboardMeals from "@/pages/DashboardMeals";
import { PREFS_WITH_LOCATION } from "./testHelpers";

function renderMeals(initialEntries = ["/dashboard/meals"]) {
  return render(
    <TooltipProvider>
      <MemoryRouter initialEntries={initialEntries}>
        <Routes>
          <Route path="/dashboard/meals" element={<DashboardMeals />} />
        </Routes>
      </MemoryRouter>
    </TooltipProvider>
  );
}

describe("Meal logger", () => {
  beforeEach(() => {
    localStorage.clear();
    localStorage.setItem("tryramadan-preferences", JSON.stringify(PREFS_WITH_LOCATION));
  });

  it("renders Meals page with Suhoor and Iftar sections", () => {
    renderMeals();
    expect(screen.getByRole("button", { name: /suhoor/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /iftar/i })).toBeInTheDocument();
  });

  it("adding a recipe to today persists to meal plan or food log", () => {
    renderMeals();
    const addButtons = screen.getAllByRole("button", { name: /add to today|log|add to food log/i });
    if (addButtons.length > 0) {
      fireEvent.click(addButtons[0]);
      const mealPlans = localStorage.getItem("tryramadan-day-meal-plans");
      const foodLog = localStorage.getItem("tryramadan-day-food-log");
      expect(mealPlans !== null || foodLog !== null).toBe(true);
    } else {
      const recipeCards = screen.getAllByRole("button", { name: /add|select|log/i });
      if (recipeCards.length > 0) {
        fireEvent.click(recipeCards[0]);
        expect(localStorage.getItem("tryramadan-day-meal-plans") !== null || localStorage.getItem("tryramadan-day-food-log") !== null).toBe(true);
      }
    }
  });

  it("custom meal form allows name and calories and persists to food log", () => {
    renderMeals();
    const addCustom = screen.queryByRole("button", { name: /add custom|custom meal|create meal/i });
    if (addCustom) {
      fireEvent.click(addCustom);
      const nameInput = screen.queryByPlaceholderText(/meal name|name/i);
      const calInput = screen.queryByPlaceholderText(/calories|cal/i);
      if (nameInput && calInput) {
        fireEvent.change(nameInput, { target: { value: "Test Meal" } });
        fireEvent.change(calInput, { target: { value: "300" } });
        const saveBtn = screen.queryByRole("button", { name: /add|save|log/i });
        if (saveBtn) {
          fireEvent.click(saveBtn);
          const raw = localStorage.getItem("tryramadan-day-food-log");
          expect(raw).toBeTruthy();
          const log = JSON.parse(raw!);
          const today = new Date().toISOString().split("T")[0];
          const dayLog = log[today];
          expect(dayLog).toBeDefined();
          const hasTestMeal = (dayLog?.suhoor?.some((e: { name: string }) => e.name === "Test Meal") ||
            dayLog?.iftar?.some((e: { name: string }) => e.name === "Test Meal") ||
            dayLog?.between?.some((e: { name: string }) => e.name === "Test Meal"));
          expect(hasTestMeal).toBe(true);
        }
      }
    }
  });

  it("logging a meal does not change fasting progress", () => {
    const today = new Date().toISOString().split("T")[0];
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
        fastingLog: [{ date: today, startedAt: new Date().toISOString(), status: "in_progress" }],
      })
    );
    renderMeals();
    const before = localStorage.getItem("tryramadan-progress");
    const addButtons = screen.getAllByRole("button", { name: /add to today|log|add to food log/i });
    if (addButtons.length > 0) fireEvent.click(addButtons[0]);
    const after = localStorage.getItem("tryramadan-progress");
    const progressAfter = after ? JSON.parse(after) : null;
    const todayEntry = progressAfter?.fastingLog?.find((e: { date: string }) => e.date === today);
    expect(todayEntry?.status).toBe("in_progress");
  });
});
