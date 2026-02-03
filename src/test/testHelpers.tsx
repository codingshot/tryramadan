/**
 * Shared test helpers: mock prayer times, default preferences, wrapper with tooltips.
 */
import React from "react";
import { TooltipProvider } from "@/components/ui/tooltip";

export const MOCK_PRAYER_TIMES = {
  fajr: "05:15",
  sunrise: "06:45",
  dhuhr: "12:30",
  asr: "15:20",
  maghrib: "18:45",
  isha: "20:15",
  imsak: "05:05",
  date: new Date().toISOString().split("T")[0],
};

export const PREFS_WITH_LOCATION = {
  onboardingComplete: true,
  userType: "muslim" as const,
  theme: "dark" as const,
  locationCoords: { lat: 51.5074, lng: -0.1278 },
  location: "London, UK",
};

export const PREFS_NON_MUSLIM = {
  ...PREFS_WITH_LOCATION,
  userType: "non-muslim" as const,
};

/** Wrap with TooltipProvider (and optionally MemoryRouter). Use when you need custom Routes. */
export function withTooltip(ui: React.ReactElement) {
  return <TooltipProvider>{ui}</TooltipProvider>;
}
