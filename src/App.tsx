import { useEffect, lazy, Suspense } from "react";
import { useLocation } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { OnboardingProvider } from "@/contexts/OnboardingContext";
import Index from "./pages/Index";
import Dashboard from "./pages/Dashboard";
import DashboardToday from "./pages/DashboardToday";
import DashboardPrayers from "./pages/DashboardPrayers";
import DashboardLearn from "./pages/DashboardLearn";
import DashboardHealth from "./pages/DashboardHealth";
import DashboardJournal from "./pages/DashboardJournal";
import DashboardAchievements from "./pages/DashboardAchievements";
import DashboardGoals from "./pages/DashboardGoals";
import { LoadingSpinner } from "./components/LoadingSpinner";

const DashboardSchedule = lazy(() => import("./pages/DashboardSchedule").then((m) => ({ default: m.default })));
const DashboardMeals = lazy(() => import("./pages/DashboardMeals").then((m) => ({ default: m.default })));
const DashboardProgress = lazy(() => import("./pages/DashboardProgress").then((m) => ({ default: m.default })));
const DashboardCulture = lazy(() => import("./pages/DashboardCulture").then((m) => ({ default: m.default })));
const DashboardQuran = lazy(() => import("./pages/DashboardQuran").then((m) => ({ default: m.default })));
const DashboardMacros = lazy(() => import("./pages/DashboardMacros").then((m) => ({ default: m.default })));
import OnboardingLayout from "./pages/onboarding/OnboardingLayout";
import OnboardingWelcome from "./pages/onboarding/OnboardingWelcome";
import OnboardingMode from "./pages/onboarding/OnboardingMode";
import OnboardingKnowledge from "./pages/onboarding/OnboardingKnowledge";
import OnboardingHealth from "./pages/onboarding/OnboardingHealth";
import OnboardingLocation from "./pages/onboarding/OnboardingLocation";
import OnboardingSchedule from "./pages/onboarding/OnboardingSchedule";
import OnboardingNotifications from "./pages/onboarding/OnboardingNotifications";
import OnboardingPriorities from "./pages/onboarding/OnboardingPriorities";
import OnboardingGoals from "./pages/onboarding/OnboardingGoals";
import LearnGlossary from "./pages/LearnGlossary";
import LearnHadith from "./pages/LearnHadith";
import HealthSafety from "./pages/HealthSafety";
import Health from "./pages/Health";
import FAQ from "./pages/FAQ";
import Emergency from "./pages/Emergency";
import Settings from "./pages/Settings";
import Programs from "./pages/Programs";
import Culture from "./pages/Culture";
import CultureCountry from "./pages/CultureCountry";
import Recipes from "./pages/Recipes";
import RecipeDetail from "./pages/RecipeDetail";
import Terms from "./pages/Terms";
import Legal from "./pages/Legal";
import Privacy from "./pages/Privacy";
import Guides from "./pages/Guides";
import GuidePage from "./pages/GuidePage";
import Personas from "./pages/Personas";
import PersonaPage from "./pages/PersonaPage";
import NotFound from "./pages/NotFound";
import { AdhanScheduler } from "./components/AdhanScheduler";
import { FastingBottomBar } from "./components/FastingBottomBar";
import { ReminderScheduler } from "./components/ReminderScheduler";

const queryClient = new QueryClient();

function PageFallback() {
  return (
    <div className="min-h-[50vh] flex items-center justify-center p-8">
      <LoadingSpinner size="md" showLogo />
    </div>
  );
}

/** Scroll to top when the route changes so each page starts at the top. */
function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
    document.documentElement.scrollTo?.({ top: 0, left: 0, behavior: "auto" });
  }, [pathname]);
  return null;
}

function ThemeSync() {
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem("tryramadan-preferences");
      const prefs = raw ? JSON.parse(raw) : null;
      const theme = prefs?.theme ?? "dark";
      const root = document.documentElement;
      if (theme === "dark") {
        root.classList.add("dark");
      } else if (theme === "light") {
        root.classList.remove("dark");
      } else {
        if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
          root.classList.add("dark");
        } else {
          root.classList.remove("dark");
        }
      }
    } catch {
      document.documentElement.classList.add("dark");
    }
  }, []);
  return null;
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeSync />
    <TooltipProvider delayDuration={300} skipDelayDuration={100}>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <ScrollToTop />
        <AdhanScheduler />
        <ReminderScheduler />
        <FastingBottomBar />
        <Routes>
          <Route path="/" element={<Index />} />
          <Route
            path="/onboarding"
            element={
              <OnboardingProvider>
                <OnboardingLayout />
              </OnboardingProvider>
            }
          >
            <Route index element={<Navigate to="welcome" replace />} />
            <Route path="welcome" element={<OnboardingWelcome />} />
            <Route path="mode" element={<OnboardingMode />} />
            <Route path="knowledge" element={<OnboardingKnowledge />} />
            <Route path="health" element={<OnboardingHealth />} />
            <Route path="location" element={<OnboardingLocation />} />
            <Route path="schedule" element={<OnboardingSchedule />} />
            <Route path="notifications" element={<OnboardingNotifications />} />
            <Route path="priorities" element={<OnboardingPriorities />} />
            <Route path="goals" element={<OnboardingGoals />} />
          </Route>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/dashboard/today" element={<DashboardToday />} />
          <Route
            path="/dashboard/schedule"
            element={
              <Suspense fallback={<PageFallback />}>
                <DashboardSchedule />
              </Suspense>
            }
          />
          <Route path="/dashboard/prayers" element={<DashboardPrayers />} />
          <Route
            path="/dashboard/meals"
            element={
              <Suspense fallback={<PageFallback />}>
                <DashboardMeals />
              </Suspense>
            }
          />
          <Route path="/dashboard/learn" element={<DashboardLearn />} />
          <Route
            path="/dashboard/progress"
            element={
              <Suspense fallback={<PageFallback />}>
                <DashboardProgress />
              </Suspense>
            }
          />
          <Route
            path="/dashboard/culture"
            element={
              <Suspense fallback={<PageFallback />}>
                <DashboardCulture />
              </Suspense>
            }
          />
          <Route path="/dashboard/health" element={<DashboardHealth />} />
          <Route path="/dashboard/journal" element={<DashboardJournal />} />
          <Route path="/dashboard/achievements" element={<DashboardAchievements />} />
          <Route path="/dashboard/goals" element={<DashboardGoals />} />
          <Route
            path="/dashboard/quran"
            element={
              <Suspense fallback={<PageFallback />}>
                <DashboardQuran />
              </Suspense>
            }
          />
          <Route
            path="/dashboard/macros"
            element={
              <Suspense fallback={<PageFallback />}>
                <DashboardMacros />
              </Suspense>
            }
          />
          <Route path="/dashboard/glossary" element={<LearnGlossary />} />
          <Route path="/learn/glossary" element={<LearnGlossary />} />
          <Route path="/learn/hadith" element={<LearnHadith />} />
          <Route path="/health" element={<Health />} />
          <Route path="/health-safety" element={<HealthSafety />} />
          <Route path="/faq" element={<FAQ />} />
          <Route path="/emergency" element={<Emergency />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/programs" element={<Programs />} />
          <Route path="/culture" element={<Culture />} />
          <Route path="/culture/:countryId" element={<CultureCountry />} />
          <Route path="/recipes" element={<Recipes />} />
          <Route path="/recipe/:mealType/:id" element={<RecipeDetail />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="/legal" element={<Legal />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/guides" element={<Guides />} />
          <Route path="/guides/:slug" element={<GuidePage />} />
          <Route path="/personas" element={<Personas />} />
          <Route path="/personas/:slug" element={<PersonaPage />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
