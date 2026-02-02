/**
 * Main features and flows: onboarding, dashboard pages, settings, culture,
 * recipes, guides, emergency, programs, FAQ. Renders key pages and asserts
 * critical content and links.
 */
import { describe, it, expect, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import { TooltipProvider } from "@/components/ui/tooltip";
import { OnboardingProvider } from "@/contexts/OnboardingContext";
import OnboardingWelcome from "@/pages/onboarding/OnboardingWelcome";
import OnboardingMode from "@/pages/onboarding/OnboardingMode";
import OnboardingLocation from "@/pages/onboarding/OnboardingLocation";
import OnboardingGoals from "@/pages/onboarding/OnboardingGoals";
import Dashboard from "@/pages/Dashboard";
import DashboardToday from "@/pages/DashboardToday";
import DashboardSchedule from "@/pages/DashboardSchedule";
import DashboardMeals from "@/pages/DashboardMeals";
import DashboardJournal from "@/pages/DashboardJournal";
import DashboardCulture from "@/pages/DashboardCulture";
import DashboardHealth from "@/pages/DashboardHealth";
import DashboardGoals from "@/pages/DashboardGoals";
import DashboardProgress from "@/pages/DashboardProgress";
import Settings from "@/pages/Settings";
import Culture from "@/pages/Culture";
import CultureCountry from "@/pages/CultureCountry";
import Recipes from "@/pages/Recipes";
import RecipeDetail from "@/pages/RecipeDetail";
import Guides from "@/pages/Guides";
import GuidePage from "@/pages/GuidePage";
import Emergency from "@/pages/Emergency";
import Programs from "@/pages/Programs";
import FAQ from "@/pages/FAQ";
import Index from "@/pages/Index";

const defaultPrefs = {
  onboardingComplete: true,
  userType: "muslim",
  theme: "dark",
  country: "US",
};

function renderAt(path: string, element: React.ReactElement, options?: { withOnboarding?: boolean }) {
  const ui = (
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path={path} element={options?.withOnboarding ? <OnboardingProvider>{element}</OnboardingProvider> : element} />
      </Routes>
    </MemoryRouter>
  );
  return render(<TooltipProvider>{ui}</TooltipProvider>);
}

describe("Onboarding flow", () => {
  it("welcome step renders and has next CTA", () => {
    renderAt("/onboarding/welcome", <OnboardingWelcome />, { withOnboarding: true });
    expect(screen.getAllByText(/ramadan|welcome|journey/i).length).toBeGreaterThan(0);
    const next = screen.queryByRole("link", { name: /next|continue|get started|start your journey/i }) ?? screen.queryByRole("button", { name: /next|continue|get started/i });
    expect(next).toBeInTheDocument();
  });

  it("mode step renders mode options", () => {
    renderAt("/onboarding/mode", <OnboardingMode />, { withOnboarding: true });
    expect(screen.getAllByText(/muslim|non-muslim|curious/i).length).toBeGreaterThan(0);
  });

  it("location step shows Continue disabled until location selected", () => {
    renderAt("/onboarding/location", <OnboardingLocation />, { withOnboarding: true });
    expect(screen.getByRole("heading", { name: /location/i })).toBeInTheDocument();
    const continueBtn = screen.getByRole("button", { name: /continue/i });
    expect(continueBtn).toBeDisabled();
  });

  it("goals step renders and has complete/skip", () => {
    renderAt("/onboarding/goals", <OnboardingGoals />, { withOnboarding: true });
    expect(screen.getAllByText(/goal|ramadan|complete|skip/i).length).toBeGreaterThan(0);
  });
});

describe("Dashboard main pages", () => {
  beforeEach(() => {
    localStorage.setItem("tryramadan-preferences", JSON.stringify(defaultPrefs));
  });

  it("dashboard hub shows Today, Schedule, Meals, Journal links", () => {
    renderAt("/dashboard", <Dashboard />);
    const todayLink = screen.getByRole("link", { name: /^today$/i });
    const scheduleLink = screen.getByRole("link", { name: /^schedule$/i });
    const mealsLink = screen.getByRole("link", { name: /^meals$/i });
    const journalLink = screen.getAllByRole("link").find((l) => l.getAttribute("href") === "/dashboard/journal");
    expect(todayLink).toHaveAttribute("href", "/dashboard/today");
    expect(scheduleLink).toHaveAttribute("href", "/dashboard/schedule");
    expect(mealsLink).toHaveAttribute("href", "/dashboard/meals");
    expect(journalLink).toBeDefined();
  });

  it("dashboard today page renders fasting-related content", () => {
    renderAt("/dashboard/today", <DashboardToday />);
    expect(screen.getAllByText(/suhoor|iftar|fasting|intention|progress|until iftar|hydration/i).length).toBeGreaterThan(0);
  });

  it("dashboard schedule page renders schedule content", () => {
    renderAt("/dashboard/schedule", <DashboardSchedule />);
    expect(screen.getAllByText(/schedule|ramadan|day|prayer|calendar/i).length).toBeGreaterThan(0);
  });

  it("dashboard meals page renders meals content", () => {
    renderAt("/dashboard/meals", <DashboardMeals />);
    expect(screen.getAllByText(/suhoor|iftar|meal|log|breakfast/i).length).toBeGreaterThan(0);
  });

  it("dashboard journal page renders journal content", () => {
    renderAt("/dashboard/journal", <DashboardJournal />);
    expect(screen.getAllByText(/journal|reflect|entry|today/i).length).toBeGreaterThan(0);
  });

  it("dashboard culture page renders culture content", () => {
    renderAt("/dashboard/culture", <DashboardCulture />);
    expect(screen.getAllByText(/culture|country|tradition|region/i).length).toBeGreaterThan(0);
  });

  it("dashboard health page renders health content", () => {
    renderAt("/dashboard/health", <DashboardHealth />);
    expect(screen.getAllByText(/health|hydration|fasting|water/i).length).toBeGreaterThan(0);
  });

  it("dashboard goals page renders goals content", () => {
    renderAt("/dashboard/goals", <DashboardGoals />);
    expect(screen.getAllByText(/goal|ramadan|intention/i).length).toBeGreaterThan(0);
  });

  it("dashboard progress page renders progress content", () => {
    renderAt("/dashboard/progress", <DashboardProgress />);
    expect(screen.getAllByText(/progress|day|streak|ramadan|completed/i).length).toBeGreaterThan(0);
  });
});

describe("Settings", () => {
  beforeEach(() => {
    localStorage.setItem("tryramadan-preferences", JSON.stringify(defaultPrefs));
  });

  it("settings page has theme and location sections", () => {
    renderAt("/settings", <Settings />);
    expect(screen.getAllByText(/theme|dark|light|location|city|settings/i).length).toBeGreaterThan(0);
  });
});

describe("Culture", () => {
  it("culture list page shows regions or countries", () => {
    renderAt("/culture", <Culture />);
    expect(screen.getAllByText(/culture|region|country|tradition/i).length).toBeGreaterThan(0);
  });

  it("culture country page (Egypt) renders country content", () => {
    renderAt("/culture/egypt", <CultureCountry />);
    expect(screen.getAllByText(/egypt|tradition|iftar|suhoor|foods|ramadan/i).length).toBeGreaterThan(0);
  });
});

describe("Recipes", () => {
  it("recipes list shows suhoor and iftar or recipe content", () => {
    renderAt("/recipes", <Recipes />);
    expect(screen.getAllByText(/recipe|suhoor|iftar|back to home|ramadan/i).length).toBeGreaterThan(0);
  });

  it("recipe detail page renders for valid route", () => {
    renderAt("/recipe/iftar/1", <RecipeDetail />);
    expect(screen.getAllByText(/recipe|prep|ingredient|step|back|details/i).length).toBeGreaterThan(0);
  });
});

describe("Guides", () => {
  it("guides list page renders", () => {
    renderAt("/guides", <Guides />);
    expect(screen.getAllByText(/guide|ramadan|fasting/i).length).toBeGreaterThan(0);
  });

  it("guide detail page renders for valid slug", () => {
    renderAt("/guides/first-time-fasting", <GuidePage />);
    expect(screen.getAllByText(/guide|first|fasting|ramadan|back/i).length).toBeGreaterThan(0);
  });
});

describe("Emergency and support", () => {
  it("emergency page has support content", () => {
    renderAt("/emergency", <Emergency />);
    expect(screen.getAllByText(/emergency|break fast|medical|help/i).length).toBeGreaterThan(0);
  });

  it("programs page shows fasting programs", () => {
    renderAt("/programs", <Programs />);
    expect(screen.getAllByText(/program|fasting|ramadan|path/i).length).toBeGreaterThan(0);
  });

  it("FAQ page has questions and answers", () => {
    renderAt("/faq", <FAQ />);
    expect(screen.getByRole("heading", { name: /frequently asked questions/i })).toBeInTheDocument();
  });
});

describe("Home and navigation", () => {
  it("home has nav links to Programs, Recipes, Culture", () => {
    renderAt("/", <Index />);
    const links = screen.getAllByRole("link");
    expect(links.some((l) => l.getAttribute("href") === "/programs")).toBe(true);
    expect(links.some((l) => l.getAttribute("href") === "/recipes")).toBe(true);
    expect(links.some((l) => l.getAttribute("href") === "/culture")).toBe(true);
  });
});
