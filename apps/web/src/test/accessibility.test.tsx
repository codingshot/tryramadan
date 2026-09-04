import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import { axe } from "vitest-axe";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ArabicHover } from "@/components/ArabicHover";
import { ArabicTerm } from "@/components/ArabicTerm";
import { HeroSection } from "@/components/HeroSection";
import OnboardingWelcome from "@/pages/onboarding/OnboardingWelcome";
import { StatsShareCard } from "@/components/StatsShareCard";
import DashboardSchedule from "@/pages/DashboardSchedule";
import NotFound from "@/pages/NotFound";
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

describe("Accessibility (axe-core)", () => {
  it("HeroSection has no axe violations", async () => {
    const { container } = render(
      <TooltipProvider>
        <MemoryRouter>
          <HeroSection />
        </MemoryRouter>
      </TooltipProvider>
    );
    const results = await axe(container);
    expect((results as { violations: unknown[] }).violations).toHaveLength(0);
  });

  it("OnboardingWelcome has no axe violations", async () => {
    const { container } = render(
      <TooltipProvider>
        <MemoryRouter>
          <OnboardingWelcome />
        </MemoryRouter>
      </TooltipProvider>
    );
    const results = await axe(container);
    expect((results as { violations: unknown[] }).violations).toHaveLength(0);
  });

  it("StatsShareCard has no axe violations", async () => {
    const { container } = render(
      <TooltipProvider>
        <StatsShareCard
          completedDays={5}
          totalDays={30}
          completionRate={17}
          currentStreak={2}
          journalStreak={3}
          mindfulEatingStreak={1}
          prayerStreak={1}
          totalPrayers={10}
          isMuslim={true}
          completedDates={["2025-03-01", "2025-03-02", "2025-03-03", "2025-03-04", "2025-03-05"]}
          ramadanStart="2025-03-01"
          ramadanEnd="2025-03-30"
        />
      </TooltipProvider>
    );
    const results = await axe(container);
    expect((results as { violations: unknown[] }).violations).toHaveLength(0);
  });

  it("ArabicHover and ArabicTerm have no axe violations", async () => {
    const { container } = render(
      <TooltipProvider>
        <div>
          <ArabicHover arabic="رمضان" explanation="The ninth month of the Islamic calendar.">Ramadan</ArabicHover>
          <ArabicTerm term="Sawm" arabic="صوم" definition="Fasting">Fasting</ArabicTerm>
        </div>
      </TooltipProvider>
    );
    const results = await axe(container);
    expect((results as { violations: unknown[] }).violations).toHaveLength(0);
  });

  it("NotFound (404) has no axe violations", async () => {
    const { container } = render(
      <MemoryRouter>
        <NotFound />
      </MemoryRouter>
    );
    const results = await axe(container);
    expect((results as { violations: unknown[] }).violations).toHaveLength(0);
  });

  it("DashboardSchedule (Fasting Schedule) has no axe violations", async () => {
    localStorage.clear();
    localStorage.setItem("tryramadan-preferences", JSON.stringify(PREFS_WITH_LOCATION));
    const { container } = render(
      <TooltipProvider>
        <MemoryRouter initialEntries={["/dashboard/schedule"]}>
          <Routes>
            <Route path="/dashboard/schedule" element={<DashboardSchedule />} />
          </Routes>
        </MemoryRouter>
      </TooltipProvider>
    );
    const results = await axe(container);
    expect((results as { violations: unknown[] }).violations).toHaveLength(0);
  });
});

describe("Arabic translations and tooltips", () => {
  it("ArabicHover has focusable trigger for touch and keyboard", () => {
    render(
      <TooltipProvider>
        <ArabicHover arabic="رمضان" explanation="The ninth month of the Islamic calendar; Muslims fast from dawn to sunset.">Ramadan</ArabicHover>
      </TooltipProvider>
    );
    const trigger = screen.getByRole("button", { name: /ramadan/i });
    expect(trigger).toBeInTheDocument();
    expect(trigger).toHaveAttribute("tabIndex", "0");
  });

  it("ArabicTerm has focusable trigger for touch and keyboard", () => {
    render(
      <TooltipProvider>
        <ArabicTerm term="Sawm" arabic="صوم" definition="Fasting">
          Fasting
        </ArabicTerm>
      </TooltipProvider>
    );
    const trigger = screen.getByRole("button", { name: /fasting/i });
    expect(trigger).toBeInTheDocument();
    expect(trigger).toHaveAttribute("tabIndex", "0");
  });
});
