/**
 * 404 for invalid or unknown URLs. See docs/QA-404-AND-INVALID-URLS.md.
 */
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";

function render404(route: string) {
  return render(
    <TooltipProvider>
      <MemoryRouter initialEntries={[route]}>
        <Routes>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </MemoryRouter>
    </TooltipProvider>
  );
}

describe("404 for invalid or unknown URLs", () => {
  it("shows NotFound for typo /dashbord", () => {
    render404("/dashbord");
    expect(screen.getByRole("heading", { name: /^404$/ })).toBeInTheDocument();
    expect(screen.getByText(/page not found/i)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /return to home/i })).toHaveAttribute("href", "/");
    expect(screen.getByRole("link", { name: /go to dashboard/i })).toHaveAttribute("href", "/dashboard");
  });

  it("shows NotFound for typo /dash/today", () => {
    render404("/dash/today");
    expect(screen.getByText(/page not found/i)).toBeInTheDocument();
  });

  it("shows NotFound for typo /dashboard/shedule", () => {
    render404("/dashboard/shedule");
    expect(screen.getByText(/page not found/i)).toBeInTheDocument();
  });

  it("shows NotFound for typo /onbording/welcome", () => {
    render404("/onbording/welcome");
    expect(screen.getByText(/page not found/i)).toBeInTheDocument();
  });

  it("shows NotFound for arbitrary path", () => {
    render404("/foo");
    expect(screen.getByText(/page not found/i)).toBeInTheDocument();
  });

  it("provides Return to Home link", () => {
    render404("/foo");
    const homeLink = screen.getByRole("link", { name: /return to home/i });
    expect(homeLink).toHaveAttribute("href", "/");
  });

  it("provides Go to Dashboard link", () => {
    render404("/bar");
    const dashLink = screen.getByRole("link", { name: /go to dashboard/i });
    expect(dashLink).toHaveAttribute("href", "/dashboard");
  });

  it("does not throw for arbitrary path", () => {
    expect(() => render404("/admin/settings")).not.toThrow();
    expect(screen.getByText(/page not found/i)).toBeInTheDocument();
  });
});
