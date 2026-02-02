import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import { TooltipProvider } from "@/components/ui/tooltip";
import Index from "@/pages/Index";
import Terms from "@/pages/Terms";
import Legal from "@/pages/Legal";
import Privacy from "@/pages/Privacy";
import FAQ from "@/pages/FAQ";
import HealthSafety from "@/pages/HealthSafety";
import NotFound from "@/pages/NotFound";

function renderWithProviders(ui: React.ReactElement, { route = "/" }: { route?: string } = {}) {
  return render(
    <TooltipProvider>
      <MemoryRouter initialEntries={[route]}>
        {ui}
      </MemoryRouter>
    </TooltipProvider>
  );
}

/** All internal paths that should have a route (no hash anchors). */
export const ROUTES = [
  "/",
  "/programs",
  "/culture",
  "/recipes",
  "/terms",
  "/legal",
  "/privacy",
  "/faq",
  "/health-safety",
  "/emergency",
  "/settings",
  "/learn/glossary",
  "/learn/hadith",
  "/dashboard",
  "/dashboard/today",
  "/dashboard/schedule",
  "/dashboard/prayers",
  "/dashboard/meals",
  "/dashboard/learn",
  "/dashboard/progress",
  "/dashboard/culture",
  "/dashboard/health",
  "/dashboard/journal",
  "/dashboard/goals",
  "/dashboard/achievements",
  "/dashboard/quran",
  "/dashboard/macros",
  "/onboarding/welcome",
  "/onboarding/mode",
  "/onboarding/knowledge",
  "/onboarding/health",
  "/onboarding/location",
  "/onboarding/schedule",
  "/onboarding/notifications",
  "/onboarding/priorities",
  "/onboarding/goals",
  "/dashboard/glossary",
  "/guides",
  "/personas",
  "/personas/non-muslim-curious",
] as const;

describe("Routes", () => {
  it("renders Index at /", () => {
    renderWithProviders(
      <Routes>
        <Route path="/" element={<Index />} />
      </Routes>,
      { route: "/" }
    );
    expect(screen.getByRole("link", { name: /tryramadan/i })).toBeInTheDocument();
  });

  it("renders Terms at /terms", () => {
    renderWithProviders(
      <Routes>
        <Route path="/terms" element={<Terms />} />
      </Routes>,
      { route: "/terms" }
    );
    expect(screen.getByRole("heading", { name: /terms of use/i })).toBeInTheDocument();
  });

  it("renders Legal at /legal", () => {
    renderWithProviders(
      <Routes>
        <Route path="/legal" element={<Legal />} />
      </Routes>,
      { route: "/legal" }
    );
    expect(screen.getByRole("heading", { name: /legal notice/i })).toBeInTheDocument();
  });

  it("renders Privacy at /privacy", () => {
    renderWithProviders(
      <Routes>
        <Route path="/privacy" element={<Privacy />} />
      </Routes>,
      { route: "/privacy" }
    );
    expect(screen.getByRole("heading", { name: /privacy policy/i })).toBeInTheDocument();
  });

  it("renders FAQ at /faq", () => {
    renderWithProviders(
      <Routes>
        <Route path="/faq" element={<FAQ />} />
      </Routes>,
      { route: "/faq" }
    );
    expect(screen.getByRole("heading", { name: /frequently asked questions/i })).toBeInTheDocument();
  });

  it("renders Health & Safety at /health-safety", () => {
    renderWithProviders(
      <Routes>
        <Route path="/health-safety" element={<HealthSafety />} />
      </Routes>,
      { route: "/health-safety" }
    );
    expect(screen.getByRole("heading", { name: /health & safety/i })).toBeInTheDocument();
  });

  it("renders NotFound for unknown path", () => {
    renderWithProviders(
      <Routes>
        <Route path="*" element={<NotFound />} />
      </Routes>,
      { route: "/unknown-path-404" }
    );
    expect(screen.getByText(/page not found/i)).toBeInTheDocument();
  });
});

describe("Route list", () => {
  it("defines all expected routes for link-check tests", () => {
    expect(ROUTES).toContain("/");
    expect(ROUTES).toContain("/terms");
    expect(ROUTES).toContain("/legal");
    expect(ROUTES).toContain("/privacy");
    expect(ROUTES).toContain("/dashboard");
    expect(ROUTES).toContain("/dashboard/prayers");
    expect(ROUTES).toContain("/dashboard/quran");
    expect(ROUTES).toContain("/dashboard/macros");
    expect(ROUTES).toContain("/learn/glossary");
    expect(ROUTES).toContain("/learn/hadith");
    expect(ROUTES).toContain("/health-safety");
    expect(ROUTES).toContain("/faq");
  });
});
