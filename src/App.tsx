import { useEffect, lazy, Suspense } from "react";
import { useLocation } from "react-router-dom";
import { useUserPreferences } from "@/hooks/useLocalStorage";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner, toast } from "@/components/ui/sonner";
import { getUndoBackup, restoreFromUndoBackup } from "@/lib/dataLifecycle";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { OnboardingProvider } from "@/contexts/OnboardingContext";
import Index from "./pages/Index";
import Dashboard from "./pages/Dashboard";
import { SkeletonCard } from "./components/SkeletonCard";

const DashboardToday = lazy(() => import("./pages/DashboardToday").then((m) => ({ default: m.default })));
const DashboardPrayers = lazy(() => import("./pages/DashboardPrayers").then((m) => ({ default: m.default })));
const DashboardLearn = lazy(() => import("./pages/DashboardLearn").then((m) => ({ default: m.default })));
const DashboardHealth = lazy(() => import("./pages/DashboardHealth").then((m) => ({ default: m.default })));
const DashboardJournal = lazy(() => import("./pages/DashboardJournal").then((m) => ({ default: m.default })));
const DashboardAchievements = lazy(() => import("./pages/DashboardAchievements").then((m) => ({ default: m.default })));
const DashboardGoals = lazy(() => import("./pages/DashboardGoals").then((m) => ({ default: m.default })));
const DashboardSchedule = lazy(() => import("./pages/DashboardSchedule").then((m) => ({ default: m.default })));
const DashboardMeals = lazy(() => import("./pages/DashboardMeals").then((m) => ({ default: m.default })));
const DashboardProgress = lazy(() => import("./pages/DashboardProgress").then((m) => ({ default: m.default })));
const DashboardCulture = lazy(() => import("./pages/DashboardCulture").then((m) => ({ default: m.default })));
const DashboardQuran = lazy(() => import("./pages/DashboardQuran").then((m) => ({ default: m.default })));
const DashboardMacros = lazy(() => import("./pages/DashboardMacros").then((m) => ({ default: m.default })));

const OnboardingLayout = lazy(() => import("./pages/onboarding/OnboardingLayout").then((m) => ({ default: m.default })));
const OnboardingWelcome = lazy(() => import("./pages/onboarding/OnboardingWelcome").then((m) => ({ default: m.default })));
const OnboardingMode = lazy(() => import("./pages/onboarding/OnboardingMode").then((m) => ({ default: m.default })));
const OnboardingKnowledge = lazy(() => import("./pages/onboarding/OnboardingKnowledge").then((m) => ({ default: m.default })));
const OnboardingHealth = lazy(() => import("./pages/onboarding/OnboardingHealth").then((m) => ({ default: m.default })));
const OnboardingGender = lazy(() => import("./pages/onboarding/OnboardingGender").then((m) => ({ default: m.default })));
const OnboardingLocation = lazy(() => import("./pages/onboarding/OnboardingLocation").then((m) => ({ default: m.default })));
const OnboardingSchedule = lazy(() => import("./pages/onboarding/OnboardingSchedule").then((m) => ({ default: m.default })));
const OnboardingNotifications = lazy(() => import("./pages/onboarding/OnboardingNotifications").then((m) => ({ default: m.default })));
const OnboardingPriorities = lazy(() => import("./pages/onboarding/OnboardingPriorities").then((m) => ({ default: m.default })));
const OnboardingGoals = lazy(() => import("./pages/onboarding/OnboardingGoals").then((m) => ({ default: m.default })));

const LearnGlossary = lazy(() => import("./pages/LearnGlossary").then((m) => ({ default: m.default })));
const LearnHadith = lazy(() => import("./pages/LearnHadith").then((m) => ({ default: m.default })));
const HealthSafety = lazy(() => import("./pages/HealthSafety").then((m) => ({ default: m.default })));
const Health = lazy(() => import("./pages/Health").then((m) => ({ default: m.default })));
const FAQ = lazy(() => import("./pages/FAQ").then((m) => ({ default: m.default })));
const Emergency = lazy(() => import("./pages/Emergency").then((m) => ({ default: m.default })));
const Settings = lazy(() => import("./pages/Settings").then((m) => ({ default: m.default })));
const Programs = lazy(() => import("./pages/Programs").then((m) => ({ default: m.default })));
const VoluntaryFastingDetail = lazy(() => import("./pages/VoluntaryFastingDetail").then((m) => ({ default: m.default })));
const Culture = lazy(() => import("./pages/Culture").then((m) => ({ default: m.default })));
const CultureCountry = lazy(() => import("./pages/CultureCountry").then((m) => ({ default: m.default })));
const Recipes = lazy(() => import("./pages/Recipes").then((m) => ({ default: m.default })));
const RecipeDetail = lazy(() => import("./pages/RecipeDetail").then((m) => ({ default: m.default })));
const Terms = lazy(() => import("./pages/Terms").then((m) => ({ default: m.default })));
const Legal = lazy(() => import("./pages/Legal").then((m) => ({ default: m.default })));
const Privacy = lazy(() => import("./pages/Privacy").then((m) => ({ default: m.default })));
const Guides = lazy(() => import("./pages/Guides").then((m) => ({ default: m.default })));
const GuidePage = lazy(() => import("./pages/GuidePage").then((m) => ({ default: m.default })));
const Personas = lazy(() => import("./pages/Personas").then((m) => ({ default: m.default })));
const PersonaPage = lazy(() => import("./pages/PersonaPage").then((m) => ({ default: m.default })));
const NotFound = lazy(() => import("./pages/NotFound").then((m) => ({ default: m.default })));
import { AdhanScheduler } from "./components/AdhanScheduler";
import { FastingBottomBar } from "./components/FastingBottomBar";
import { ReminderScheduler } from "./components/ReminderScheduler";
import { useKeyboardShortcuts } from "./hooks/useKeyboardShortcuts";
import { KeyboardShortcutsHelp } from "./components/KeyboardShortcutsHelp";
import { RouteErrorBoundary } from "./components/RouteErrorBoundary";

const queryClient = new QueryClient();

function PageFallback() {
  return (
    <div className="min-h-[50vh] p-6 container mx-auto space-y-4">
      <div className="h-8 bg-muted/50 rounded w-48 animate-pulse" />
      <div className="grid gap-4 sm:grid-cols-2">
        <SkeletonCard lines={3} />
        <SkeletonCard lines={3} />
      </div>
      <SkeletonCard lines={2} className="max-w-xl" />
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

/** After "Clear all data", show Undo toast on reload (HISTORICAL-DATA undo reset). */
function UndoClearAllToast() {
  useEffect(() => {
    const backup = getUndoBackup();
    if (!backup) return;
    toast("Data cleared. Undo?", {
      action: { label: "Undo", onClick: restoreFromUndoBackup },
      duration: 10_000,
    });
  }, []);
  return null;
}

function KeyboardShortcutsManager() {
  useKeyboardShortcuts();
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

/** Renders FastingBottomBar and schedulers only when not on onboarding (CWV: reduce main-thread work on landing). */
function FastingAndSchedulers() {
  const { pathname } = useLocation();
  const [preferences] = useUserPreferences();
  const onOnboarding = pathname.startsWith("/onboarding");
  const showBottomBar = Boolean(preferences?.onboardingComplete) && !onOnboarding;
  if (onOnboarding) return null;
  return (
    <>
      <AdhanScheduler />
      <ReminderScheduler />
      {showBottomBar && <FastingBottomBar />}
    </>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeSync />
    <TooltipProvider delayDuration={300} skipDelayDuration={100}>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <ScrollToTop />
        <UndoClearAllToast />
        <KeyboardShortcutsManager />
        <FastingAndSchedulers />
        <KeyboardShortcutsHelp />
        <RouteErrorBoundary>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route
            path="/onboarding"
            element={
              <OnboardingProvider>
                <Suspense fallback={<PageFallback />}>
                  <OnboardingLayout />
                </Suspense>
              </OnboardingProvider>
            }
          >
            <Route index element={<Navigate to="welcome" replace />} />
            <Route path="welcome" element={<Suspense fallback={<PageFallback />}><OnboardingWelcome /></Suspense>} />
            <Route path="mode" element={<Suspense fallback={<PageFallback />}><OnboardingMode /></Suspense>} />
            <Route path="knowledge" element={<Suspense fallback={<PageFallback />}><OnboardingKnowledge /></Suspense>} />
            <Route path="health" element={<Suspense fallback={<PageFallback />}><OnboardingHealth /></Suspense>} />
            <Route path="gender" element={<Suspense fallback={<PageFallback />}><OnboardingGender /></Suspense>} />
            <Route path="location" element={<Suspense fallback={<PageFallback />}><OnboardingLocation /></Suspense>} />
            <Route path="schedule" element={<Suspense fallback={<PageFallback />}><OnboardingSchedule /></Suspense>} />
            <Route path="notifications" element={<Suspense fallback={<PageFallback />}><OnboardingNotifications /></Suspense>} />
            <Route path="priorities" element={<Suspense fallback={<PageFallback />}><OnboardingPriorities /></Suspense>} />
            <Route path="goals" element={<Suspense fallback={<PageFallback />}><OnboardingGoals /></Suspense>} />
          </Route>
          {/* Old-path redirects for backward compatibility (see docs/QA-404-AND-INVALID-URLS.md) */}
          <Route path="/today" element={<Navigate to="/dashboard/today" replace />} />
          <Route path="/schedule" element={<Navigate to="/dashboard/schedule" replace />} />
          <Route path="/journal" element={<Navigate to="/dashboard/journal" replace />} />
          <Route path="/prayers" element={<Navigate to="/dashboard/prayers" replace />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/dashboard/today" element={<Suspense fallback={<PageFallback />}><DashboardToday /></Suspense>} />
          <Route
            path="/dashboard/schedule"
            element={
              <Suspense fallback={<PageFallback />}>
                <DashboardSchedule />
              </Suspense>
            }
          />
          <Route path="/dashboard/prayers" element={<Suspense fallback={<PageFallback />}><DashboardPrayers /></Suspense>} />
          <Route
            path="/dashboard/meals"
            element={
              <Suspense fallback={<PageFallback />}>
                <DashboardMeals />
              </Suspense>
            }
          />
          <Route path="/dashboard/learn" element={<Suspense fallback={<PageFallback />}><DashboardLearn /></Suspense>} />
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
          <Route path="/dashboard/health" element={<Suspense fallback={<PageFallback />}><DashboardHealth /></Suspense>} />
          <Route path="/dashboard/journal" element={<Suspense fallback={<PageFallback />}><DashboardJournal /></Suspense>} />
          <Route path="/dashboard/achievements" element={<Suspense fallback={<PageFallback />}><DashboardAchievements /></Suspense>} />
          <Route path="/dashboard/goals" element={<Suspense fallback={<PageFallback />}><DashboardGoals /></Suspense>} />
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
          <Route path="/dashboard/glossary" element={<Suspense fallback={<PageFallback />}><LearnGlossary /></Suspense>} />
          <Route path="/learn/glossary" element={<Suspense fallback={<PageFallback />}><LearnGlossary /></Suspense>} />
          <Route path="/learn/hadith" element={<Suspense fallback={<PageFallback />}><LearnHadith /></Suspense>} />
          <Route path="/health" element={<Suspense fallback={<PageFallback />}><Health /></Suspense>} />
          <Route path="/health-safety" element={<Suspense fallback={<PageFallback />}><HealthSafety /></Suspense>} />
          <Route path="/faq" element={<Suspense fallback={<PageFallback />}><FAQ /></Suspense>} />
          <Route path="/emergency" element={<Suspense fallback={<PageFallback />}><Emergency /></Suspense>} />
          <Route path="/settings" element={<Suspense fallback={<PageFallback />}><Settings /></Suspense>} />
          <Route path="/programs/:slug" element={<Suspense fallback={<PageFallback />}><VoluntaryFastingDetail /></Suspense>} />
          <Route path="/programs" element={<Suspense fallback={<PageFallback />}><Programs /></Suspense>} />
          <Route path="/culture" element={<Suspense fallback={<PageFallback />}><Culture /></Suspense>} />
          <Route path="/culture/:countryId" element={<Suspense fallback={<PageFallback />}><CultureCountry /></Suspense>} />
          <Route path="/recipes" element={<Suspense fallback={<PageFallback />}><Recipes /></Suspense>} />
          <Route path="/recipe/:mealType/:id" element={<Suspense fallback={<PageFallback />}><RecipeDetail /></Suspense>} />
          <Route path="/terms" element={<Suspense fallback={<PageFallback />}><Terms /></Suspense>} />
          <Route path="/legal" element={<Suspense fallback={<PageFallback />}><Legal /></Suspense>} />
          <Route path="/privacy" element={<Suspense fallback={<PageFallback />}><Privacy /></Suspense>} />
          <Route path="/guides" element={<Suspense fallback={<PageFallback />}><Guides /></Suspense>} />
          <Route path="/guides/:slug" element={<Suspense fallback={<PageFallback />}><GuidePage /></Suspense>} />
          <Route path="/personas" element={<Suspense fallback={<PageFallback />}><Personas /></Suspense>} />
          <Route path="/personas/:slug" element={<Suspense fallback={<PageFallback />}><PersonaPage /></Suspense>} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<Suspense fallback={<PageFallback />}><NotFound /></Suspense>} />
        </Routes>
        </RouteErrorBoundary>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
