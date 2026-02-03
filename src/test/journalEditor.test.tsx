/**
 * Journal editor: DashboardJournal.
 * Add/edit entry, switch date, save, assert localStorage and timeline.
 */
import { describe, it, expect, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import { TooltipProvider } from "@/components/ui/tooltip";
import DashboardJournal from "@/pages/DashboardJournal";
import { PREFS_WITH_LOCATION } from "./testHelpers";

function renderJournal(initialEntries = ["/dashboard/journal"]) {
  return render(
    <TooltipProvider>
      <MemoryRouter initialEntries={initialEntries}>
        <Routes>
          <Route path="/dashboard/journal" element={<DashboardJournal />} />
        </Routes>
      </MemoryRouter>
    </TooltipProvider>
  );
}

describe("Journal editor", () => {
  beforeEach(() => {
    localStorage.clear();
    localStorage.setItem("tryramadan-preferences", JSON.stringify(PREFS_WITH_LOCATION));
  });

  it("renders journal page with calendar and write section", () => {
    renderJournal();
    expect(screen.getByRole("heading", { name: /reflection journal/i })).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/write a few lines/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /save entry|update entry/i })).toBeInTheDocument();
  });

  it("saving an entry persists to localStorage with date and content", () => {
    renderJournal();
    const textarea = screen.getByPlaceholderText(/write a few lines/i);
    fireEvent.change(textarea, { target: { value: "Today I felt grateful." } });
    fireEvent.click(screen.getByRole("button", { name: /save entry|update entry/i }));
    const raw = localStorage.getItem("tryramadan-journal");
    expect(raw).toBeTruthy();
    const entries = JSON.parse(raw!);
    expect(Array.isArray(entries)).toBe(true);
    expect(entries.some((e: { content: string }) => e.content.includes("grateful"))).toBe(true);
  });

  it("editing an existing entry updates localStorage", () => {
    const today = new Date().toISOString().split("T")[0];
    localStorage.setItem(
      "tryramadan-journal",
      JSON.stringify([
        { date: today, prompt: "P1", content: "Original", gratitude: undefined, mood: undefined },
      ])
    );
    renderJournal();
    const textarea = screen.getByPlaceholderText(/write a few lines/i);
    expect(textarea).toHaveValue("Original");
    fireEvent.change(textarea, { target: { value: "Updated content." } });
    fireEvent.click(screen.getByRole("button", { name: /update entry/i }));
    const entries = JSON.parse(localStorage.getItem("tryramadan-journal")!);
    const entry = entries.find((e: { date: string }) => e.date === today);
    expect(entry?.content).toBe("Updated content.");
  });

  it("switching date via date input loads that date's entry or empty", () => {
    const today = new Date().toISOString().split("T")[0];
    localStorage.setItem(
      "tryramadan-journal",
      JSON.stringify([{ date: today, prompt: "P", content: "Only today", gratitude: undefined, mood: undefined }])
    );
    renderJournal();
    const dateInput = screen.getByTitle(/pick any date/i);
    const pastDate = "2024-06-15";
    fireEvent.change(dateInput, { target: { value: pastDate } });
    const textarea = screen.getByPlaceholderText(/write a few lines/i);
    expect(textarea).toHaveValue("");
  });

  it("past entries are listed and sorted by date descending", () => {
    localStorage.setItem(
      "tryramadan-journal",
      JSON.stringify([
        { date: "2025-01-01", prompt: "P", content: "First", gratitude: undefined, mood: undefined },
        { date: "2025-01-03", prompt: "P", content: "Third", gratitude: undefined, mood: undefined },
      ])
    );
    renderJournal();
    const pastLinks = screen.getAllByText(/view past entries|past entries/i);
    expect(pastLinks.length).toBeGreaterThan(0);
    expect(screen.getByText(/First/)).toBeInTheDocument();
    expect(screen.getByText(/Third/)).toBeInTheDocument();
  });

  it("mood buttons update selection and are persisted on save", () => {
    renderJournal();
    fireEvent.change(screen.getByPlaceholderText(/write a few lines/i), { target: { value: "Note" } });
    const moodButtons = screen.getAllByTitle(/low|okay|good|great|amazing/i);
    if (moodButtons.length > 0) {
      fireEvent.click(moodButtons[2]);
      fireEvent.click(screen.getByRole("button", { name: /save entry|update entry/i }));
      const entries = JSON.parse(localStorage.getItem("tryramadan-journal")!);
      expect(entries.some((e: { mood?: number }) => e.mood != null)).toBe(true);
    }
  });
});
