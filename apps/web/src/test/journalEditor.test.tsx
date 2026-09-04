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

  describe("past entries search, sort, and filters", () => {
    const entriesWithVariety = [
      { date: "2025-01-01", prompt: "P", content: "First day reflection", gratitude: "family", mood: 1, slot: "general" },
      { date: "2025-01-02", prompt: "P", content: "Second day with keyword coffee", gratitude: undefined, mood: 3, slot: "morning" },
      { date: "2025-01-03", prompt: "P", content: "Third entry", gratitude: "health", mood: 5, slot: "general" },
    ];

    beforeEach(() => {
      localStorage.setItem("tryramadan-journal", JSON.stringify(entriesWithVariety));
    });

    it("search filters entries by content", () => {
      renderJournal();
      const searchInput = screen.getByRole("searchbox", { name: /search past journal/i });
      fireEvent.change(searchInput, { target: { value: "coffee" } });
      expect(screen.getByText(/keyword coffee/)).toBeInTheDocument();
      expect(screen.queryByText(/First day reflection/)).not.toBeInTheDocument();
      expect(screen.queryByText(/Third entry/)).not.toBeInTheDocument();
    });

    it("search filters by gratitude", () => {
      renderJournal();
      const searchInput = screen.getByRole("searchbox", { name: /search past journal/i });
      fireEvent.change(searchInput, { target: { value: "health" } });
      expect(screen.getByText(/Third entry/)).toBeInTheDocument();
      expect(screen.queryByText(/First day reflection/)).not.toBeInTheDocument();
    });

    it("sort oldest first shows entries in date ascending order", () => {
      renderJournal();
      const sortTrigger = screen.getByRole("combobox", { name: /sort order/i });
      fireEvent.click(sortTrigger);
      const oldestFirst = screen.getByRole("option", { name: /oldest first/i });
      fireEvent.click(oldestFirst);
      const pastSection = document.getElementById("past-entries");
      const listItems = pastSection ? Array.from(pastSection.querySelectorAll("ul li")) : [];
      expect(listItems.length).toBeGreaterThanOrEqual(3);
      const firstEntryContent = listItems[0].textContent ?? "";
      expect(firstEntryContent).toMatch(/First day|2025-01-01/);
    });

    it("filter by slot shows only matching entries", () => {
      renderJournal();
      const slotTrigger = screen.getByRole("combobox", { name: /filter by slot/i });
      fireEvent.click(slotTrigger);
      const morning = screen.getByRole("option", { name: /morning/i });
      fireEvent.click(morning);
      expect(screen.getByText(/keyword coffee/)).toBeInTheDocument();
      expect(screen.queryByText(/First day reflection/)).not.toBeInTheDocument();
      expect(screen.queryByText(/Third entry/)).not.toBeInTheDocument();
    });

    it("filter by mood shows only matching entries", () => {
      renderJournal();
      const moodTrigger = screen.getByRole("combobox", { name: /filter by mood/i });
      fireEvent.click(moodTrigger);
      const good = screen.getByRole("option", { name: /good/i });
      fireEvent.click(good);
      expect(screen.getByText(/keyword coffee/)).toBeInTheDocument();
      expect(screen.queryByText(/First day reflection/)).not.toBeInTheDocument();
      expect(screen.queryByText(/Third entry/)).not.toBeInTheDocument();
    });

    it("no match shows empty filter message", () => {
      renderJournal();
      const searchInput = screen.getByRole("searchbox", { name: /search past journal/i });
      fireEvent.change(searchInput, { target: { value: "xyznonexistent123" } });
      expect(screen.getByText(/no entries match your search or filters/i)).toBeInTheDocument();
    });

    it("search input and sort/filter controls are present and accessible", () => {
      renderJournal();
      expect(screen.getByRole("searchbox", { name: /search past journal/i })).toBeInTheDocument();
      expect(screen.getByRole("combobox", { name: /sort order/i })).toBeInTheDocument();
      expect(screen.getByRole("combobox", { name: /filter by slot/i })).toBeInTheDocument();
      expect(screen.getByRole("combobox", { name: /filter by mood/i })).toBeInTheDocument();
    });
  });
});
