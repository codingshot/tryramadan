/**
 * Tests for menstruation pattern tracking and gender onboarding.
 */
import { describe, it, expect, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter, Routes, Route, Navigate } from "react-router-dom";
import { TooltipProvider } from "@/components/ui/tooltip";
import { OnboardingProvider } from "@/contexts/OnboardingContext";
import OnboardingLayout from "@/pages/onboarding/OnboardingLayout";
import OnboardingHealth from "@/pages/onboarding/OnboardingHealth";
import OnboardingGender from "@/pages/onboarding/OnboardingGender";
import OnboardingGoals from "@/pages/onboarding/OnboardingGoals";
import Settings from "@/pages/Settings";
import DashboardToday from "@/pages/DashboardToday";
import {
  getPredictedMenstruationDates,
  isPredictedMenstruationDay,
  defaultPreferences,
} from "@/hooks/useLocalStorage";

function renderOnboarding(initialPath = "/onboarding/gender") {
  return render(
    <TooltipProvider>
      <MemoryRouter initialEntries={[initialPath]}>
        <Routes>
          <Route
            path="/onboarding"
            element={
              <OnboardingProvider>
                <OnboardingLayout />
              </OnboardingProvider>
            }
          >
            <Route index element={<Navigate to="welcome" replace />} />
            <Route path="health" element={<OnboardingHealth />} />
            <Route path="gender" element={<OnboardingGender />} />
            <Route path="goals" element={<OnboardingGoals />} />
          </Route>
        </Routes>
      </MemoryRouter>
    </TooltipProvider>
  );
}

function renderSettings() {
  return render(
    <TooltipProvider>
      <MemoryRouter initialEntries={["/settings"]}>
        <Routes>
          <Route path="/settings" element={<Settings />} />
        </Routes>
      </MemoryRouter>
    </TooltipProvider>
  );
}

describe("OnboardingGender", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("shows gender options: Female, Male, Prefer not to say", () => {
    renderOnboarding();
    expect(screen.getByText("Female")).toBeInTheDocument();
    expect(screen.getByText("Male")).toBeInTheDocument();
    expect(screen.getByText("Prefer not to say")).toBeInTheDocument();
  });

  it("mentions menstruation pattern and excused fasting days", () => {
    renderOnboarding();
    expect(screen.getAllByText(/menstruation pattern tracking/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/excused fasting days/i).length).toBeGreaterThan(0);
  });

  it("Continue button is present and clickable", () => {
    renderOnboarding();
    const continueBtn = screen.getByRole("button", { name: /continue/i });
    expect(continueBtn).toBeInTheDocument();
    fireEvent.click(continueBtn);
    // Navigation happens via React Router
  });
});

describe("getPredictedMenstruationDates", () => {
  it("returns empty array when lastStart is null", () => {
    const result = getPredictedMenstruationDates(null, 28, 5, "2025-03-01", "2025-03-30");
    expect(result).toEqual([]);
  });

  it("returns predicted dates within Ramadan window", () => {
    const result = getPredictedMenstruationDates("2025-02-15", 28, 5, "2025-03-01", "2025-03-30");
    expect(Array.isArray(result)).toBe(true);
    result.forEach((d) => {
      expect(d).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(d >= "2025-03-01" && d <= "2025-03-30").toBe(true);
    });
  });
});

describe("isPredictedMenstruationDay", () => {
  it("returns false when gender is not female", () => {
    expect(
      isPredictedMenstruationDay("2025-03-15", {
        gender: "male",
        menstruationTrackingEnabled: true,
        menstruationLastStartDate: "2025-02-15",
        menstruationCycleDays: 28,
        menstruationPeriodDays: 5,
      })
    ).toBe(false);
  });

  it("returns false when tracking is disabled", () => {
    expect(
      isPredictedMenstruationDay("2025-03-15", {
        gender: "female",
        menstruationTrackingEnabled: false,
        menstruationLastStartDate: "2025-02-15",
        menstruationCycleDays: 28,
        menstruationPeriodDays: 5,
      })
    ).toBe(false);
  });

  it("returns false when lastStartDate is null", () => {
    expect(
      isPredictedMenstruationDay("2025-03-15", {
        gender: "female",
        menstruationTrackingEnabled: true,
        menstruationLastStartDate: null,
        menstruationCycleDays: 28,
        menstruationPeriodDays: 5,
      })
    ).toBe(false);
  });
});

describe("Settings gender and menstruation", () => {
  beforeEach(() => {
    localStorage.clear();
    localStorage.setItem(
      "tryramadan-preferences",
      JSON.stringify({ ...defaultPreferences, onboardingComplete: true })
    );
  });

  it("shows Gender & wellness section", () => {
    renderSettings();
    expect(screen.getByText("Gender & wellness")).toBeInTheDocument();
  });

  it("shows menstruation pattern when gender is female", async () => {
    localStorage.setItem(
      "tryramadan-preferences",
      JSON.stringify({
        ...defaultPreferences,
        onboardingComplete: true,
        gender: "female",
      })
    );
    renderSettings();
    expect(screen.getByText("Menstruation pattern")).toBeInTheDocument();
  });
});
