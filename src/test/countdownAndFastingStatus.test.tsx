/**
 * Tests for: countdown shown when not fasting (FastingBottomBar), and fasting status
 * card opens to change status (undo skipped/complete/broken).
 */
import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import { TooltipProvider } from "@/components/ui/tooltip";
import { toLocalDateString } from "@/lib/utils";
import { FastingBottomBar } from "@/components/FastingBottomBar";
import Dashboard from "@/pages/Dashboard";

const MOCK_PRAYER_TIMES = {
  fajr: "05:15",
  dhuhr: "12:30",
  asr: "15:45",
  maghrib: "18:30",
  isha: "20:00",
  imsak: "05:05",
};

const prefsWithLocation = {
  onboardingComplete: true,
  userType: "muslim",
  theme: "dark",
  locationCoords: { lat: 51.5074, lng: -0.1278 },
  location: "London, UK",
  timezone: "Europe/London",
};

vi.mock("@/hooks/usePrayerTimes", () => ({
  usePrayerTimes: vi.fn(() => ({ prayerTimes: MOCK_PRAYER_TIMES, loading: false })),
  usePrayerTimesForDate: vi.fn(() => ({ prayerTimes: MOCK_PRAYER_TIMES })),
  getSunnahFastingInfo: vi.fn(() => null),
  checkAyyamAlBeed: vi.fn().mockResolvedValue({ isAyyamAlBeed: false, hijriDay: 15 }),
}));

vi.mock("@/hooks/useLocation", async (importOriginal) => {
  const mod = await importOriginal<typeof import("@/hooks/useLocation")>();
  return {
    ...mod,
    useAutoLocation: vi.fn(() => ({ location: null, loading: false })),
    getTimezoneFromCoords: vi.fn().mockResolvedValue("Europe/London"),
  };
});

describe("FastingBottomBar countdown when not fasting", () => {
  beforeEach(() => {
    localStorage.clear();
    localStorage.setItem("tryramadan-preferences", JSON.stringify(prefsWithLocation));
  });

  it("shows countdown bar when user is not fasting (skipped)", () => {
    const todayStr = toLocalDateString(new Date());
    localStorage.setItem(
      "tryramadan-progress",
      JSON.stringify({
        completedDays: [],
        skippedDays: [todayStr],
        fastingLog: [],
      })
    );

    render(
      <TooltipProvider>
        <MemoryRouter initialEntries={["/dashboard"]}>
          <FastingBottomBar />
        </MemoryRouter>
      </TooltipProvider>
    );

    const nav = screen.getByRole("navigation", { name: /fasting quick actions/i });
    expect(nav).toBeInTheDocument();
    expect(screen.getByText(/Iftar/i)).toBeInTheDocument();
  });

  it("shows countdown bar when user has no fasting log yet", () => {
    localStorage.setItem(
      "tryramadan-progress",
      JSON.stringify({
        completedDays: [],
        skippedDays: [],
        fastingLog: [],
      })
    );

    render(
      <TooltipProvider>
        <MemoryRouter initialEntries={["/dashboard"]}>
          <FastingBottomBar />
        </MemoryRouter>
      </TooltipProvider>
    );

    const nav = screen.getByRole("navigation", { name: /fasting quick actions/i });
    expect(nav).toBeInTheDocument();
  });
});

describe("Fasting status card opens to change status", () => {
  beforeEach(() => {
    localStorage.clear();
    localStorage.setItem("tryramadan-preferences", JSON.stringify(prefsWithLocation));
  });

  it("status card opens change dialog when clicked", async () => {
    render(
      <TooltipProvider>
        <MemoryRouter initialEntries={["/dashboard"]}>
          <Routes>
            <Route path="/dashboard" element={<Dashboard />} />
          </Routes>
        </MemoryRouter>
      </TooltipProvider>
    );

    const statusCard = screen.getByRole("button", {
      name: /fasting status and countdown — tap to change status/i,
    });
    fireEvent.click(statusCard);

    await waitFor(() => {
      expect(screen.getByRole("dialog", { name: /change fasting status/i })).toBeInTheDocument();
    });
  });

  it("when skipped, change dialog offers Actually I'm fasting and corrects status", async () => {
    const todayStr = toLocalDateString(new Date());
    localStorage.setItem(
      "tryramadan-progress",
      JSON.stringify({
        completedDays: [],
        skippedDays: [todayStr],
        fastingLog: [],
      })
    );

    render(
      <TooltipProvider>
        <MemoryRouter initialEntries={["/dashboard"]}>
          <Routes>
            <Route path="/dashboard" element={<Dashboard />} />
          </Routes>
        </MemoryRouter>
      </TooltipProvider>
    );

    const statusCard = screen.getByRole("button", {
      name: /fasting status and countdown — tap to change status/i,
    });
    fireEvent.click(statusCard);

    await waitFor(() => {
      expect(screen.getByRole("dialog", { name: /change fasting status/i })).toBeInTheDocument();
    });

    const actuallyFastingBtn = screen.getByRole("button", { name: /actually i'm fasting/i });
    fireEvent.click(actuallyFastingBtn);

    await waitFor(() => {
      const progress = JSON.parse(localStorage.getItem("tryramadan-progress") ?? "{}");
      expect(progress.skippedDays || []).not.toContain(todayStr);
      expect(progress.fastingLog?.some((e: { date: string; status: string }) => e.date === todayStr && e.status === "in_progress")).toBe(true);
    });
  });

  it("when complete, change dialog offers Undo complete", async () => {
    const todayStr = toLocalDateString(new Date());
    localStorage.setItem(
      "tryramadan-progress",
      JSON.stringify({
        completedDays: [todayStr],
        skippedDays: [],
        fastingLog: [{ date: todayStr, status: "completed", startedAt: new Date().toISOString(), completedAt: new Date().toISOString() }],
      })
    );

    render(
      <TooltipProvider>
        <MemoryRouter initialEntries={["/dashboard"]}>
          <Routes>
            <Route path="/dashboard" element={<Dashboard />} />
          </Routes>
        </MemoryRouter>
      </TooltipProvider>
    );

    const statusCard = screen.getByRole("button", {
      name: /fasting status and countdown — tap to change status/i,
    });
    fireEvent.click(statusCard);

    await waitFor(() => {
      expect(screen.getByRole("button", { name: /undo complete/i })).toBeInTheDocument();
    });
  });
});
