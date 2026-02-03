/**
 * Critical path: onboarding completion → dashboard. Verifies no redirect loop.
 */
import { describe, it, expect, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter, Routes, Route, Navigate } from "react-router-dom";
import { TooltipProvider } from "@/components/ui/tooltip";
import { OnboardingProvider } from "@/contexts/OnboardingContext";
import OnboardingLayout from "@/pages/onboarding/OnboardingLayout";
import OnboardingGoals from "@/pages/onboarding/OnboardingGoals";
import OnboardingWelcome from "@/pages/onboarding/OnboardingWelcome";
import Dashboard from "@/pages/Dashboard";

function renderOnboardingFlow(initialPath = "/onboarding/goals") {
  return render(
    <TooltipProvider>
      <MemoryRouter initialEntries={[initialPath]}>
        <Routes>
          <Route path="/onboarding" element={<OnboardingProvider><OnboardingLayout /></OnboardingProvider>}>
            <Route index element={<Navigate to="welcome" replace />} />
            <Route path="welcome" element={<OnboardingWelcome />} />
            <Route path="goals" element={<OnboardingGoals />} />
          </Route>
          <Route path="/dashboard" element={<Dashboard />} />
        </Routes>
      </MemoryRouter>
    </TooltipProvider>
  );
}

describe("Onboarding → Dashboard flow", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("completing Goals step persists preferences and navigates to dashboard", async () => {
    renderOnboardingFlow("/onboarding/goals");

    const goToDashboard = screen.getByRole("button", { name: /go to dashboard/i });
    expect(goToDashboard).toBeInTheDocument();

    fireEvent.click(goToDashboard);

    // Should now see dashboard content (Today, Schedule links)
    const todayLink = await screen.findByRole("link", { name: /^today$/i });
    expect(todayLink).toBeInTheDocument();
    expect(todayLink).toHaveAttribute("href", "/dashboard/today");

    // Verify preferences were persisted
    const prefs = JSON.parse(localStorage.getItem("tryramadan-preferences") ?? "{}");
    expect(prefs.onboardingComplete).toBe(true);
  });

  it("dashboard does not redirect when onboardingComplete is true", () => {
    localStorage.setItem(
      "tryramadan-preferences",
      JSON.stringify({
        onboardingComplete: true,
        userType: "muslim",
        theme: "dark",
      })
    );
    renderOnboardingFlow("/dashboard");

    expect(screen.getByRole("link", { name: /^today$/i })).toBeInTheDocument();
  });
});
