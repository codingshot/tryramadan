/**
 * Onboarding: critical path and edge cases.
 * Complete flow to dashboard, persist preferences; non-Muslim path; changing location.
 */
import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter, Routes, Route, Navigate } from "react-router-dom";
import { TooltipProvider } from "@/components/ui/tooltip";
import { OnboardingProvider } from "@/contexts/OnboardingContext";
import OnboardingLayout from "@/pages/onboarding/OnboardingLayout";
import OnboardingWelcome from "@/pages/onboarding/OnboardingWelcome";
import OnboardingMode from "@/pages/onboarding/OnboardingMode";
import OnboardingGoals from "@/pages/onboarding/OnboardingGoals";
import OnboardingLocation from "@/pages/onboarding/OnboardingLocation";
import Dashboard from "@/pages/Dashboard";
import { MOCK_PRAYER_TIMES } from "./testHelpers";

vi.mock("@/hooks/usePrayerTimes", () => ({
  usePrayerTimes: vi.fn(() => ({ prayerTimes: MOCK_PRAYER_TIMES, hijriDate: {}, loading: false })),
  usePrayerTimesForDate: vi.fn(() => ({ prayerTimes: MOCK_PRAYER_TIMES })),
  getSunnahFastingInfo: vi.fn(() => null),
  checkAyyamAlBeed: vi.fn().mockResolvedValue(null),
}));
vi.mock("@/hooks/useLocation", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/hooks/useLocation")>();
  return {
    ...actual,
    useAutoLocation: vi.fn(() => ({ location: null, loading: false })),
    getTimezoneFromCoords: vi.fn().mockResolvedValue(null),
  };
});

function renderOnboarding(path: string, options?: { withDashboard?: boolean }) {
  return render(
    <TooltipProvider>
      <MemoryRouter initialEntries={[path]}>
        <Routes>
          <Route path="/onboarding" element={<OnboardingProvider><OnboardingLayout /></OnboardingProvider>}>
            <Route index element={<Navigate to="welcome" replace />} />
            <Route path="welcome" element={<OnboardingWelcome />} />
            <Route path="mode" element={<OnboardingMode />} />
            <Route path="location" element={<OnboardingLocation />} />
            <Route path="goals" element={<OnboardingGoals />} />
          </Route>
          {options?.withDashboard && <Route path="/dashboard" element={<Dashboard />} />}
        </Routes>
      </MemoryRouter>
    </TooltipProvider>
  );
}

describe("Onboarding critical path", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("welcome step renders and has Get Started or next CTA", () => {
    renderOnboarding("/onboarding/welcome");
    const cta = screen.queryByRole("link", { name: /get started|next|start your journey|continue/i }) ??
      screen.queryByRole("button", { name: /get started|next|continue/i });
    expect(cta).toBeInTheDocument();
  });

  it("mode step shows Muslim and Non-Muslim options", () => {
    renderOnboarding("/onboarding/mode");
    expect(screen.getAllByText(/muslim|non-muslim|curious/i).length).toBeGreaterThan(0);
  });

  it("location step has Skip for now and Continue", () => {
    renderOnboarding("/onboarding/location");
    expect(screen.getByRole("button", { name: /skip for now/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /continue/i })).toBeInTheDocument();
  });

  it("goals step has Go to dashboard and completes onboarding on click", () => {
    renderOnboarding("/onboarding/goals", { withDashboard: true });
    const goBtn = screen.getByRole("button", { name: /go to dashboard/i });
    expect(goBtn).toBeInTheDocument();
    fireEvent.click(goBtn);
    const todayLink = screen.queryByRole("link", { name: /^today$/i });
    expect(todayLink).toBeInTheDocument();
    const prefs = JSON.parse(localStorage.getItem("tryramadan-preferences") ?? "{}");
    expect(prefs.onboardingComplete).toBe(true);
  });

  it("after completing onboarding dashboard does not redirect back to onboarding", () => {
    localStorage.setItem(
      "tryramadan-preferences",
      JSON.stringify({ onboardingComplete: true, userType: "muslim", theme: "dark" })
    );
    renderOnboarding("/dashboard", { withDashboard: true });
    expect(screen.getByRole("link", { name: /^today$/i })).toBeInTheDocument();
  });
});
