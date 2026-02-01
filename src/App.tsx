import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Dashboard from "./pages/Dashboard";
import DashboardToday from "./pages/DashboardToday";
import DashboardSchedule from "./pages/DashboardSchedule";
import DashboardPrayers from "./pages/DashboardPrayers";
import DashboardMeals from "./pages/DashboardMeals";
import DashboardLearn from "./pages/DashboardLearn";
import DashboardProgress from "./pages/DashboardProgress";
import LearnGlossary from "./pages/LearnGlossary";
import LearnHadith from "./pages/LearnHadith";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/dashboard/today" element={<DashboardToday />} />
          <Route path="/dashboard/schedule" element={<DashboardSchedule />} />
          <Route path="/dashboard/prayers" element={<DashboardPrayers />} />
          <Route path="/dashboard/meals" element={<DashboardMeals />} />
          <Route path="/dashboard/learn" element={<DashboardLearn />} />
          <Route path="/dashboard/progress" element={<DashboardProgress />} />
          <Route path="/learn/glossary" element={<LearnGlossary />} />
          <Route path="/learn/hadith" element={<LearnHadith />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
