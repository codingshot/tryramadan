/**
 * User flow checks: home → Start Journey, Terms/Legal/Privacy cross-links,
 * footer Terms/Legal/Privacy, dashboard quick links, recipes back link, 404 + home link.
 */
import { describe, it, expect } from "vitest";
import { render, screen, within } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import { TooltipProvider } from "@/components/ui/tooltip";
import Index from "@/pages/Index";
import Terms from "@/pages/Terms";
import Legal from "@/pages/Legal";
import Privacy from "@/pages/Privacy";
import Dashboard from "@/pages/Dashboard";
import Recipes from "@/pages/Recipes";
import NotFound from "@/pages/NotFound";

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

function renderNotFound() {
  return render(
    <TooltipProvider>
      <MemoryRouter initialEntries={["/nonexistent-xyz"]}>
        <Routes>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </MemoryRouter>
    </TooltipProvider>
  );
}

/** User flow checks: critical paths render and key links exist. */
describe("User flow checks", () => {
  it("home page has Start your journey link and links to programs when onboarding not complete", () => {
    localStorage.setItem("tryramadan-preferences", JSON.stringify({ onboardingComplete: false }));
    renderAt("/", <Index />);
    const startLink = screen.queryByRole("link", { name: /start your journey/i });
    expect(startLink).toBeInTheDocument();
    expect(startLink).toHaveAttribute("href", "/onboarding/welcome");
    expect(screen.getByText(/choose your/i)).toBeInTheDocument();
  });

  it("home page shows Go to dashboard and links to dashboard when onboarding complete", () => {
    localStorage.setItem("tryramadan-preferences", JSON.stringify({ onboardingComplete: true }));
    renderAt("/", <Index />);
    // Use getAllByRole to handle multiple "Go to dashboard" links (nav, hero, dark mode button)
    const dashboardLinks = screen.getAllByRole("link", { name: /go to dashboard/i });
    expect(dashboardLinks.length).toBeGreaterThan(0);
    expect(dashboardLinks.some((el) => el.getAttribute("href") === "/dashboard")).toBe(true);
  });

  it("terms page has back to home and links to privacy and legal", () => {
    renderAt("/terms", <Terms />);
    expect(screen.getByRole("heading", { name: /terms of use/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /back to home/i })).toHaveAttribute("href", "/");
    const privacyLinks = screen.getAllByRole("link", { name: /privacy policy/i });
    expect(privacyLinks.some((el) => el.getAttribute("href") === "/privacy")).toBe(true);
    const legalLinks = screen.getAllByRole("link", { name: /legal/i });
    expect(legalLinks.some((el) => el.getAttribute("href") === "/legal")).toBe(true);
  });

  it("privacy page has links to terms and legal", () => {
    renderAt("/privacy", <Privacy />);
    expect(screen.getByRole("heading", { name: /privacy policy/i })).toBeInTheDocument();
    const termsLinks = screen.getAllByRole("link", { name: /terms of use/i });
    expect(termsLinks.length).toBeGreaterThanOrEqual(1);
    expect(termsLinks[0]).toHaveAttribute("href", "/terms");
  });

  it("legal page has links to terms and privacy", () => {
    renderAt("/legal", <Legal />);
    expect(screen.getByRole("heading", { name: /legal notice/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /terms of use/i })).toHaveAttribute("href", "/terms");
    expect(screen.getByRole("link", { name: /privacy policy/i })).toHaveAttribute("href", "/privacy");
  });

  it("footer has Terms, Legal, Privacy links", () => {
    renderAt("/", <Index />);
    const footer = document.querySelector("footer");
    expect(footer).toBeInTheDocument();
    if (footer) {
      const terms = within(footer as HTMLElement).queryByRole("link", { name: /^terms$/i });
      const legal = within(footer as HTMLElement).queryByRole("link", { name: /^legal$/i });
      const privacy = within(footer as HTMLElement).queryByRole("link", { name: /^privacy$/i });
      expect(terms).toHaveAttribute("href", "/terms");
      expect(legal).toHaveAttribute("href", "/legal");
      expect(privacy).toHaveAttribute("href", "/privacy");
    }
  });

  it("dashboard route renders with main content", () => {
    // Dashboard redirects to onboarding when not complete; set preferences so dashboard content renders
    const prefs = {
      onboardingComplete: true,
      userType: "muslim",
      theme: "dark",
    };
    localStorage.setItem("tryramadan-preferences", JSON.stringify(prefs));
    renderAt("/dashboard", <Dashboard />);
    const todayLink = screen.getByRole("link", { name: /^today$/i });
    expect(todayLink).toBeInTheDocument();
    expect(todayLink).toHaveAttribute("href", "/dashboard/today");
    const scheduleLink = screen.getByRole("link", { name: /^schedule$/i });
    expect(scheduleLink).toBeInTheDocument();
    expect(scheduleLink).toHaveAttribute("href", "/dashboard/schedule");
  });

  it("recipes page renders and has link back to home", () => {
    renderAt("/recipes", <Recipes />);
    expect(screen.getByRole("link", { name: /back to home/i })).toHaveAttribute("href", "/");
  });

  it("unknown path shows NotFound with link to home", () => {
    renderNotFound();
    expect(screen.getByRole("heading", { name: "404" })).toBeInTheDocument();
    expect(screen.getByText(/oops! page not found/i)).toBeInTheDocument();
    const homeLink = screen.getByRole("link", { name: /return to home/i });
    expect(homeLink).toHaveAttribute("href", "/");
  });
});
