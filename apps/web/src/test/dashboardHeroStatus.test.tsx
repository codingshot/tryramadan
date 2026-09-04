import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { DashboardHero } from "@/components/dashboard/DashboardHero";
import { TooltipProvider } from "@/components/ui/tooltip";
import type { FastingProgress } from "@/hooks/useLocalStorage";

describe("Dashboard personal status vs time window", () => {
  it.each([
    [false, false, "Fasting Window"],
    [true, false, "Currently Fasting"],
    [true, true, "Fasting Window"],
  ] as const)("active=%s skipped=%s shows %s", (isFasting, skipped, label) => {
    const progress = {
      completedDays: [], skippedDays: skipped ? ["2026-09-04"] : [], fastingLog: [],
    } as unknown as FastingProgress;
    render(<TooltipProvider><DashboardHero
      progress={progress} isFasting={isFasting} inFastingWindow
      countdownToIftar={{ h: 1, m: 0, s: 0 }} countdownToSuhoor={{ h: 0, m: 0, s: 0 }}
      prayerTimes={null} todayStr="2026-09-04" nextPrayer={null}
      onMarkComplete={() => {}} onBreakFast={() => {}} onSkip={() => {}}
    /></TooltipProvider>);
    expect(screen.getByRole("heading", { name: label })).toBeInTheDocument();
  });
});
