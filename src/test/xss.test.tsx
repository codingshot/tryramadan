/**
 * XSS regression tests: user-controlled inputs from localStorage are escaped when rendered.
 * Inject malicious payloads into localStorage and assert they appear as literal text (no execution).
 * See docs/SECURITY-XSS-TESTING-GUIDE.md.
 */
import { describe, it, expect, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import { TooltipProvider } from "@/components/ui/tooltip";
import DashboardJournal from "@/pages/DashboardJournal";
import DashboardGoals from "@/pages/DashboardGoals";
import DashboardHealth from "@/pages/DashboardHealth";
import { PREFS_WITH_LOCATION } from "./testHelpers";

function renderAt(path: string, element: React.ReactElement) {
  return render(
    <TooltipProvider>
      <MemoryRouter initialEntries={[path]}>
        <Routes>
          <Route path={path} element={element} />
        </Routes>
      </MemoryRouter>
    </TooltipProvider>
  );
}

describe("XSS: user-controlled inputs are escaped when rendered", () => {
  beforeEach(() => {
    localStorage.clear();
    localStorage.setItem("tryramadan-preferences", JSON.stringify(PREFS_WITH_LOCATION));
  });

  it("journal content and gratitude are escaped (no script execution)", () => {
    localStorage.setItem(
      "tryramadan-journal",
      JSON.stringify([
        {
          date: "2025-03-15",
          content: "<script>alert(1)</script>",
          gratitude: "<img src=x onerror=\"alert(1)\">",
        },
      ])
    );
    renderAt("/dashboard/journal", <DashboardJournal />);
    expect(screen.getByText(/<script>alert\(1\)<\/script>/)).toBeInTheDocument();
    expect(screen.getByText(/<img src=x onerror="alert\(1\)">/)).toBeInTheDocument();
  });

  it("goals title is escaped", () => {
    localStorage.setItem(
      "tryramadan-goals-until-ramadan",
      JSON.stringify([
        {
          id: "1",
          title: "<script>alert(1)</script>",
          completed: false,
          createdAt: new Date().toISOString(),
        },
      ])
    );
    renderAt("/dashboard/goals", <DashboardGoals />);
    expect(screen.getByText(/<script>alert\(1\)<\/script>/)).toBeInTheDocument();
  });

  it("wellness note is escaped", () => {
    localStorage.setItem(
      "tryramadan-wellness",
      JSON.stringify({
        "2025-03-15": [
          {
            timeOfDay: "morning",
            mood: 3,
            note: "<img src=x onerror=\"alert(1)\">",
            timestamp: new Date().toISOString(),
          },
        ],
      })
    );
    renderAt("/dashboard/health", <DashboardHealth />);
    expect(screen.getByText(/<img src=x onerror="alert\(1\)">/)).toBeInTheDocument();
  });

  // Calendar event title and schedule notes: same pattern — render with {e.title}
  // and {noteInput}; React escapes. Add E2E test if Schedule UI changes.
});
