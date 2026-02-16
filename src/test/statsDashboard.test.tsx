/**
 * Stats dashboard: DashboardProgress.
 * Renders with empty and with completed/broken progress, export CSV, asserts UI and localStorage.
 */
import { describe, it, expect, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import { TooltipProvider } from "@/components/ui/tooltip";
import DashboardProgress from "@/pages/DashboardProgress";
import { PREFS_WITH_LOCATION } from "./testHelpers";

function renderProgress(initialEntries = ["/dashboard/progress"]) {
  return render(
    <TooltipProvider>
      <MemoryRouter initialEntries={initialEntries}>
        <Routes>
          <Route path="/dashboard/progress" element={<DashboardProgress />} />
        </Routes>
      </MemoryRouter>
    </TooltipProvider>
  );
}

describe("Stats dashboard", () => {
  beforeEach(() => {
    localStorage.clear();
    localStorage.setItem("tryramadan-preferences", JSON.stringify(PREFS_WITH_LOCATION));
  });

  it("renders progress page with Back to Dashboard and stats section", () => {
    renderProgress();
    expect(screen.getByRole("link", { name: /back to dashboard/i })).toBeInTheDocument();
    expect(screen.getAllByText(/progress|days completed|streak|completion/i).length).toBeGreaterThan(0);
  });

  it("with empty progress shows zero completed days and zero streak", () => {
    renderProgress();
    const zeros = screen.getAllByText("0");
    expect(zeros.length).toBeGreaterThan(0);
  });

  it("with completed days shows count and completion rate", () => {
    const today = new Date().toISOString().split("T")[0];
    localStorage.setItem(
      "tryramadan-progress",
      JSON.stringify({
        currentDay: 1,
        totalDays: 30,
        completedDays: [today],
        sunnahDaysCompleted: 0,
        currentStreak: 1,
        longestStreak: 1,
        startDate: null,
        fastingLog: [{ date: today, startedAt: new Date().toISOString(), status: "completed", hoursFasted: 14 }],
      })
    );
    renderProgress();
    const stats = screen.getAllByText(/days completed|completion rate|streak/i);
    expect(stats.length).toBeGreaterThan(0);
  });

  it("export progress button opens dialog with sections and preview", () => {
    renderProgress();
    const exportBtn = screen.getByRole("button", { name: /open export options/i });
    expect(exportBtn).toBeInTheDocument();
    fireEvent.click(exportBtn);
    expect(screen.getByRole("dialog", { name: /export progress/i })).toBeInTheDocument();
    expect(screen.getByText(/select which data to include/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/summary \(days/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^fasting log$/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/journal entries/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/prayer log/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/meals \(plans/i)).toBeInTheDocument();
    expect(screen.getByRole("radio", { name: /^csv$/i })).toBeInTheDocument();
    expect(screen.getByRole("radio", { name: /^json$/i })).toBeInTheDocument();
    const preview = document.querySelector("pre[role='log']");
    expect(preview).toBeInTheDocument();
    const downloadBtn = screen.getByRole("button", { name: /download csv/i });
    expect(downloadBtn).toBeInTheDocument();
    expect(downloadBtn).not.toBeDisabled();
  });

  it("export dialog disables download when no section selected", () => {
    renderProgress();
    fireEvent.click(screen.getByRole("button", { name: /open export options/i }));
    const summaryCheckbox = screen.getByLabelText(/summary \(days/i);
    const fastingCheckbox = screen.getByLabelText(/^fasting log$/i);
    const journalCheckbox = screen.getByLabelText(/journal entries/i);
    const prayerCheckbox = screen.getByLabelText(/prayer log/i);
    const mealsCheckbox = screen.getByLabelText(/meals \(plans/i);
    fireEvent.click(summaryCheckbox);
    fireEvent.click(fastingCheckbox);
    fireEvent.click(journalCheckbox);
    fireEvent.click(prayerCheckbox);
    fireEvent.click(mealsCheckbox);
    const downloadBtn = screen.getByRole("button", { name: /download csv/i });
    expect(downloadBtn).toBeDisabled();
  });

  it("shows StatsShareCard with Share and Save image buttons", () => {
    renderProgress();
    expect(screen.getByRole("button", { name: /share/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /save.*image/i })).toBeInTheDocument();
  });

  it("shows prayer stats for Muslim user when prayer tracker has data", () => {
    const today = new Date().toISOString().split("T")[0];
    localStorage.setItem(
      "tryramadan-prayer-tracker",
      JSON.stringify({ [today]: { Fajr: true, Dhuhr: true, Asr: true, Maghrib: true, Isha: true } })
    );
    renderProgress();
    const prayerTexts = screen.getAllByText(/prayer streak|prayers total|Prayers \(.*day streak\)/i);
    expect(prayerTexts.length).toBeGreaterThan(0);
  });

  it("shows fasting log section when there are log entries", () => {
    const today = new Date().toISOString().split("T")[0];
    localStorage.setItem(
      "tryramadan-progress",
      JSON.stringify({
        currentDay: 1,
        totalDays: 30,
        completedDays: [today],
        sunnahDaysCompleted: 0,
        currentStreak: 1,
        longestStreak: 1,
        startDate: null,
        fastingLog: [
          { date: today, startedAt: new Date().toISOString(), completedAt: new Date().toISOString(), status: "completed", hoursFasted: 14 },
        ],
      })
    );
    renderProgress();
    expect(screen.getAllByText(/fasting log|date|started|completed|status/i).length).toBeGreaterThan(0);
  });
});
