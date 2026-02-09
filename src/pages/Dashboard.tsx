import { useState, useEffect, useMemo, useCallback } from "react";
import { motion } from "framer-motion";
import { useNavigate, Link } from "react-router-dom";
import { 
  Moon, Sun, Sunrise, Sunset, SunDim, Clock, Calendar, MapPin, Settings, 
  TrendingUp, Check, Bell, ChevronRight, Flame, ChevronLeft, ChevronDown,
  Utensils, Coffee, Droplets, BookOpen, Target, PenLine, Plus,
  AlertTriangle, Trophy, HelpCircle
} from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { ArabicHover } from "@/components/ArabicHover";
import { ProgressRing } from "@/components/ProgressRing";
import dailyFactsData from "@/data/daily-facts.json";
import { SunnahFastingBadge } from "@/components/SunnahFastingBadge";
import { HeroDailySlider } from "@/components/HeroDailySlider";
import { DailyMissionsCard } from "@/components/DailyMissionsCard";
import { TodayScheduleTimeline } from "@/components/TodayScheduleTimeline";
import { LocationDisplay } from "@/components/LocationDisplay";
import { PWAInstallBanner } from "@/components/PWAInstallBanner";
import {
  useUserPreferences,
  useFastingProgress,
  startFastingToday,
  breakFastingToday,
  completeFastingToday,
  uncompleteFastingToday,
  getTodayFastingLog,
  getBrokenReasonLabel,
  isFastingToday,
  setDayCompleted,
  setBrokenDayToCompleted,
  setDaySkipped,
  useDayMealPlans,
  useDayNutrition,
  clampCalories,
  CALORIE_MAX,
  getRecommendedCaloriesFromPreferences,
  useDashboardQuickActions,
  DASHBOARD_QUICK_ACTIONS,
  useLocalStorage,
  useIftarLabel,
  useIftarLabelShort,
  useSuhoorLabelShort,
  calculateStreak,
  getStreakDays,
  getBrokenFastDays,
  getExcusedFastDays,
  getSunnahDaysCompleted,
  useNotificationSettings,
  usePrayerNotificationPrefs,
  useDayFoodLog,
  normalizeDayFoodLog,
  getDayTotalsFromFoodLog,
  planToFoodLogEntries,
  useDisplayTimezone,
  useHabitLog,
} from "@/hooks/useLocalStorage";
import { getHabitLogStreak, getTotalHabitCheckmarks } from "@/data/ramadan-habits";
import { toLocalDateString, getTodayStringInTimezone, getNowSecondsSinceMidnightInTimezone, timeStringToSecondsSinceMidnight, secondsUntilTimeInTimezone, formatSecondsAsTimeLabel } from "@/lib/utils";
import { BreakFastReasonDialog } from "@/components/BreakFastReasonDialog";
import { usePrayerTimes, usePrayerTimesForDate, getSunnahFastingInfo, checkAyyamAlBeed } from "@/hooks/usePrayerTimes";
import { getDaysUntilRamadan, getCurrentRamadanStart } from "@/lib/ramadan";
import { useRamadanRange } from "@/hooks/useRamadanRange";
import { useAutoLocation } from "@/hooks/useLocation";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { EATING_TIME_TOOLTIPS } from "@/data/eating-times-tooltips";
import { GENERAL_TOOLTIPS } from "@/data/general-tooltips";
import { Footer } from "@/components/Footer";
import { PageSEO } from "@/components/PageSEO";
import { toast } from "sonner";
import { getPromptForDate } from "@/pages/DashboardJournal";
import type { JournalEntry } from "@/pages/DashboardJournal";
import { getRecipes, getRecipe, parseNutrient, getAllCountries, type MealType, type Recipe } from "@/lib/cultureRecipes";

const Dashboard = () => {
  const navigate = useNavigate();
  const [preferences, setPreferences] = useUserPreferences();
  const [progress, setProgress] = useFastingProgress();
  const ramadanRange = useRamadanRange();

  const [isFasting, setIsFasting] = useState(false);
  const [inFastingWindow, setInFastingWindow] = useState(false);
  const [countdownToIftar, setCountdownToIftar] = useState({ h: 0, m: 0, s: 0 });
  const [countdownToSuhoor, setCountdownToSuhoor] = useState({ h: 0, m: 0, s: 0 });
  const [showAskFastingPopup, setShowAskFastingPopup] = useState(false);
  const [ayyamAlBeed, setAyyamAlBeed] = useState<{ isAyyamAlBeed: boolean; hijriDay: number } | null>(null);
  const [locationEditorOpen, setLocationEditorOpen] = useState(false);
  const [showBreakFastDialog, setShowBreakFastDialog] = useState(false);
  const [showBreakFastConfirm, setShowBreakFastConfirm] = useState(false);
  const [datePopoverOpen, setDatePopoverOpen] = useState(false);
  const [prayerTimesPopoverOpen, setPrayerTimesPopoverOpen] = useState(false);
  const [statsDialog, setStatsDialog] = useState<"streak" | "total" | "sunnah" | "broken" | null>(null);
  const [scheduleOpen, setScheduleOpen] = useState(false);
  const [addFoodMeal, setAddFoodMeal] = useState<"suhoor" | "iftar" | null>(null);
  const [addFoodInputs, setAddFoodInputs] = useState({ name: "", cal: "", portions: "1", protein: "", carbs: "", fat: "" });
  /** When set, form was pre-filled from this recipe; user can override before adding. */
  const [pendingRecipe, setPendingRecipe] = useState<{ mealType: "suhoor" | "iftar"; mealTypeKey: string; recipeId: number } | null>(null);
  const [quickJournalOpen, setQuickJournalOpen] = useState(false);
  const [quickJournalContent, setQuickJournalContent] = useState("");
  const [quickJournalGratitude, setQuickJournalGratitude] = useState("");
  const [notifSettings] = useNotificationSettings();
  const [prayerPrefs] = usePrayerNotificationPrefs();
  const [locationBannerDismissed, setLocationBannerDismissed] = useState(() =>
    typeof window !== "undefined" && window.localStorage.getItem("tryramadan-dismissed-location-banner") === "1"
  );

  // Auto-detect location if not set
  const { location: autoLocation, loading: locationLoading } = useAutoLocation();
  
  // Use saved location or auto-detected (memoized to avoid effect churn)
  const locationCoords = useMemo(
    () => preferences.locationCoords || (autoLocation ? { lat: autoLocation.lat, lng: autoLocation.lng } : null),
    [preferences.locationCoords, autoLocation]
  );
  
  const displayTimezone = useDisplayTimezone();
  const todayStr = displayTimezone ? getTodayStringInTimezone(displayTimezone) : toLocalDateString(new Date());
  const [selectedDate, setSelectedDate] = useState(todayStr);
  // Get prayer times (today; when timezone is set, "today" is location's date so countdowns match)
  const { prayerTimes, hijriDate, loading: timesLoading } = usePrayerTimes(
    locationCoords?.lat || null,
    locationCoords?.lng || null,
    displayTimezone
  );

  // Don't redirect to onboarding if user already has location/prayer times
  const hasTime = !!(locationCoords || prayerTimes);
  useEffect(() => {
    if (preferences.onboardingComplete || hasTime) return;
    if (locationLoading) return; // Wait for auto-location to resolve
    navigate("/onboarding/welcome", { replace: true });
  }, [preferences.onboardingComplete, hasTime, locationLoading, navigate]);

  // Prayer times for selected day (for day view)
  const { prayerTimes: selectedDayPrayerTimes } = usePrayerTimesForDate(
    locationCoords?.lat || null,
    locationCoords?.lng || null,
    selectedDate
  );

  // Tomorrow's date for suhoor countdown when past iftar (imsak changes day by day)
  const tomorrowDate = new Date(todayStr + "T12:00:00");
  tomorrowDate.setDate(tomorrowDate.getDate() + 1);
  const tomorrowStr = toLocalDateString(tomorrowDate);
  const { prayerTimes: tomorrowPrayerTimes } = usePrayerTimesForDate(
    locationCoords?.lat || null,
    locationCoords?.lng || null,
    tomorrowStr
  );
  const imsakTomorrow = tomorrowPrayerTimes?.imsak ?? prayerTimes?.imsak;
  
  const [mealPlans, setMealPlans] = useDayMealPlans();
  const [foodLogs, setFoodLogs] = useDayFoodLog();
  const [dayNutrition, setDayNutrition] = useDayNutrition();
  const [quickActionOrder] = useDashboardQuickActions();
  const [journalEntries, setJournalEntries] = useLocalStorage<JournalEntry[]>("tryramadan-journal", []);
  const [prayerTracker, setPrayerTracker] = useLocalStorage<Record<string, Record<string, boolean>>>("tryramadan-prayer-tracker", {});
  const [habitLog] = useHabitLog();
  const habitStreak = useMemo(() => getHabitLogStreak(habitLog, todayStr), [habitLog, todayStr]);
  const habitTotalCheckmarks = useMemo(() => getTotalHabitCheckmarks(habitLog), [habitLog]);
  const iftarLabel = useIftarLabel();
  const iftarLabelShort = useIftarLabelShort();
  const suhoorLabelShort = useSuhoorLabelShort();
  
  const sunnahInfo = getSunnahFastingInfo();
  
  const selectedDayMeals = mealPlans[selectedDate];
  const selectedDayNutr = dayNutrition[selectedDate];
  const selectedDayLog = useMemo(() => normalizeDayFoodLog(foodLogs[selectedDate]), [foodLogs, selectedDate]);
  const selectedDayTotalsFromLog = useMemo(() => getDayTotalsFromFoodLog(selectedDayLog), [selectedDayLog]);
  const suhoorCal = useMemo(
    () => selectedDayLog.suhoor.reduce((sum, e) => sum + (e.caloriesPerPortion || 0) * (e.portions || 1),
    0),
    [selectedDayLog.suhoor]
  );
  const iftarCal = useMemo(
    () => selectedDayLog.iftar.reduce((sum, e) => sum + (e.caloriesPerPortion || 0) * (e.portions || 1),
    0),
    [selectedDayLog.iftar]
  );
  const selectedDayJournal = journalEntries.find((e) => e.date === selectedDate);
  const selectedDayComplete = progress.completedDays.includes(selectedDate);
  const selectedDayBroken = (progress.fastingLog ?? []).some((e) => e.date === selectedDate && e.status === "broken");
  const selectedDateObj = new Date(selectedDate + "T12:00:00");
  const isSelectedToday = selectedDate === todayStr;
  
  const goPrevDay = () => {
    const d = new Date(selectedDate + "T12:00:00");
    d.setDate(d.getDate() - 1);
    setSelectedDate(toLocalDateString(d));
  };
  const goNextDay = () => {
    const d = new Date(selectedDate + "T12:00:00");
    d.setDate(d.getDate() + 1);
    setSelectedDate(toLocalDateString(d));
  };
  const goToToday = () => setSelectedDate(todayStr);
  
  // Update location in preferences if auto-detected
  useEffect(() => {
    if (autoLocation && !preferences.location) {
      setPreferences({
        ...preferences,
        location: autoLocation.displayName,
        locationCoords: { lat: autoLocation.lat, lng: autoLocation.lng }
      });
    }
  }, [autoLocation, preferences, setPreferences]);
  
  // Check Ayyam al-Beed
  useEffect(() => {
    if (locationCoords) {
      checkAyyamAlBeed(locationCoords.lat, locationCoords.lng).then(setAyyamAlBeed);
    }
  }, [locationCoords]);
  
  // Parse prayer time string (e.g. "05:15" or "05:15 (EAT)") to hours and minutes in local date (used when no display timezone)
  const parseTimeToToday = useCallback((timeStr: string) => {
    const clean = (timeStr ?? "").trim().indexOf(" ") >= 0
      ? (timeStr ?? "").trim().slice(0, (timeStr ?? "").trim().indexOf(" ")).trim()
      : (timeStr ?? "").trim();
    const parts = clean.split(":").map((p) => parseInt(p, 10));
    const h = Number.isFinite(parts[0]) ? parts[0] : 0;
    const m = Number.isFinite(parts[1]) ? parts[1] : 0;
    const d = new Date();
    d.setHours(h, m, 0, 0);
    return d;
  }, []);

  const tickFastingAndCountdown = useCallback(() => {
    if (!prayerTimes?.imsak || !prayerTimes?.maghrib) return;
    const fastingToday = isFastingToday(progress, todayStr);
    const suhoorForTomorrow = imsakTomorrow ?? prayerTimes.imsak;
    if (displayTimezone) {
      const nowSeconds = getNowSecondsSinceMidnightInTimezone(displayTimezone);
      const imsakSeconds = timeStringToSecondsSinceMidnight(prayerTimes.imsak);
      const imsakTomorrowSeconds = timeStringToSecondsSinceMidnight(suhoorForTomorrow);
      const maghribSeconds = timeStringToSecondsSinceMidnight(prayerTimes.maghrib);
      const inWindow = nowSeconds >= imsakSeconds && nowSeconds < maghribSeconds;
      setInFastingWindow(inWindow);
      setIsFasting(inWindow && fastingToday);
      if (inWindow) {
        const diff = secondsUntilTimeInTimezone(nowSeconds, maghribSeconds);
        setCountdownToIftar({
          h: Math.floor(diff / 3600),
          m: Math.floor((diff % 3600) / 60),
          s: diff % 60,
        });
      } else {
        // Past iftar: count down to tomorrow's suhoor (imsak changes day by day)
        const diff = secondsUntilTimeInTimezone(nowSeconds, imsakTomorrowSeconds);
        setCountdownToSuhoor({
          h: Math.floor(diff / 3600),
          m: Math.floor((diff % 3600) / 60),
          s: diff % 60,
        });
      }
    } else {
      const now = new Date();
      const imsakTime = parseTimeToToday(prayerTimes.imsak);
      const imsakTomorrowTime = parseTimeToToday(suhoorForTomorrow);
      const maghribTime = parseTimeToToday(prayerTimes.maghrib);
      const maghribSameDay = maghribTime.getTime() > imsakTime.getTime();
      const maghribTarget = maghribSameDay ? maghribTime : (() => {
        const next = new Date(maghribTime);
        next.setDate(next.getDate() + 1);
        return next;
      })();
      const inWindow = now >= imsakTime && now < maghribTarget;
      setInFastingWindow(inWindow);
      setIsFasting(inWindow && fastingToday);
      if (inWindow) {
        const diff = maghribTarget.getTime() - now.getTime();
        if (diff > 0) setCountdownToIftar({
          h: Math.floor(diff / 36e5),
          m: Math.floor((diff % 36e5) / 6e4),
          s: Math.floor((diff % 6e4) / 1000),
        });
      } else {
        // Past iftar: use tomorrow's imsak (changes day by day)
        const imsakTarget = new Date(imsakTomorrowTime);
        imsakTarget.setDate(imsakTarget.getDate() + 1);
        const diff = imsakTarget.getTime() - now.getTime();
        if (diff > 0) setCountdownToSuhoor({
          h: Math.floor(diff / 36e5),
          m: Math.floor((diff % 36e5) / 6e4),
          s: Math.floor((diff % 6e4) / 1000),
        });
      }
    }
  }, [prayerTimes, imsakTomorrow, displayTimezone, parseTimeToToday, progress, todayStr]);

  useEffect(() => {
    tickFastingAndCountdown();
  }, [tickFastingAndCountdown]);

  useEffect(() => {
    const t = setInterval(tickFastingAndCountdown, 2000); // Throttle for INP (was 1s)
    return () => clearInterval(t);
  }, [tickFastingAndCountdown]);

  // Toggle today's fast as complete (uses fasting log + console)
  const toggleTodayComplete = () => {
    const isComplete = progress.completedDays.includes(todayStr);

    if (isComplete) {
      uncompleteFastingToday(progress, setProgress, todayStr);
    } else {
      completeFastingToday(progress, setProgress, todayStr);
    }
  };

  const allRecipesForAddFood = useMemo(() => getRecipes(), []);
  const allCulturalFoods = useMemo(() => [...new Set(getAllCountries().flatMap((c) => c.foods ?? []))].filter(Boolean), []);
  const addFoodSuggestions = useMemo((): { recipes: { mealType: MealType; recipe: Recipe; }[]; foods: string[]; } => {
    if (!addFoodMeal) return { recipes: [], foods: [] };
    const q = addFoodInputs.name.trim().toLowerCase();
    if (!q || q.length < 1) return { recipes: [], foods: [] };
    const recipes = allRecipesForAddFood
      .filter((r) => r.mealType === addFoodMeal && r.recipe.name.toLowerCase().includes(q))
      .slice(0, 6);
    const foods = allCulturalFoods
      .filter((f) => f.toLowerCase().includes(q) && !recipes.some((r) => r.recipe.name.toLowerCase() === f.toLowerCase()))
      .slice(0, 4);
    return { recipes, foods };
  }, [addFoodMeal, addFoodInputs.name, allRecipesForAddFood, allCulturalFoods]);

  /** Pre-fill form from recipe so user can override calories/portions/macros before adding. */
  const prefillFromRecipe = (mealType: "suhoor" | "iftar", mealTypeKey: string, recipeId: number) => {
    const recipe = getRecipe(mealType, recipeId);
    if (!recipe) return;
    const cal = recipe.nutrition?.calories ?? 0;
    const protein = parseNutrient(recipe.nutrition?.protein);
    const carbs = parseNutrient(recipe.nutrition?.carbs);
    const fat = parseNutrient(recipe.nutrition?.fat);
    setAddFoodInputs({
      name: recipe.name,
      cal: cal ? String(cal) : "",
      portions: "1",
      protein: protein ? String(protein) : "",
      carbs: carbs ? String(carbs) : "",
      fat: fat ? String(fat) : "",
    });
    setPendingRecipe({ mealType, mealTypeKey, recipeId });
  };

  const submitAddFood = (mealType: "suhoor" | "iftar") => {
    const name = addFoodInputs.name.trim();
    const cal = parseInt(addFoodInputs.cal, 10) || 0;
    const portions = Math.max(0.1, parseFloat(addFoodInputs.portions) || 1);
    const protein = parseFloat(addFoodInputs.protein) || 0;
    const carbs = parseFloat(addFoodInputs.carbs) || 0;
    const fat = parseFloat(addFoodInputs.fat) || 0;
    if (!name && cal <= 0) {
      toast.error("Add a name or at least one calorie so we can save this item.");
      return;
    }
    const day = normalizeDayFoodLog(foodLogs[selectedDate]);

    if (pendingRecipe && pendingRecipe.mealType === mealType) {
      const entry = {
        id: `recipe-${Date.now()}-${pendingRecipe.mealTypeKey}-${pendingRecipe.recipeId}`,
        type: "recipe" as const,
        mealType,
        name: name || "Recipe",
        portions,
        caloriesPerPortion: clampCalories(cal),
        proteinPerPortion: protein || undefined,
        carbsPerPortion: carbs || undefined,
        fatPerPortion: fat || undefined,
        recipeId: `${pendingRecipe.mealTypeKey}-${pendingRecipe.recipeId}`,
      };
      setFoodLogs((prev) => {
        const d = normalizeDayFoodLog(prev[selectedDate]);
        const list = mealType === "suhoor" ? [...d.suhoor, entry] : [...d.iftar, entry];
        return { ...prev, [selectedDate]: { ...d, [mealType]: list } };
      });
      toast.success(`Added ${name}`);
    } else {
      const entry = {
        id: `custom-${Date.now()}`,
        type: "custom" as const,
        mealType,
        name: name || "Custom",
        portions,
        caloriesPerPortion: clampCalories(cal),
        proteinPerPortion: protein || undefined,
        carbsPerPortion: carbs || undefined,
        fatPerPortion: fat || undefined,
      };
      setFoodLogs((prev) => {
        const d = normalizeDayFoodLog(prev[selectedDate]);
        const list = mealType === "suhoor" ? [...d.suhoor, entry] : [...d.iftar, entry];
        return { ...prev, [selectedDate]: { ...d, [mealType]: list } };
      });
    }
    setAddFoodInputs({ name: "", cal: "", portions: "1", protein: "", carbs: "", fat: "" });
    setPendingRecipe(null);
    setAddFoodMeal(null);
  };

  const todayComplete = progress.completedDays.includes(todayStr);
  const todaySkipped = (progress.skippedDays ?? []).includes(todayStr);
  const fastingToday = isFastingToday(progress, todayStr);
  const todayLog = getTodayFastingLog(progress, todayStr);
  const recentLog = (progress.fastingLog || []).slice(-7).reverse();

  const ASK_FASTING_DISMISSED_KEY = "tryramadan-ask-fasting-dismissed";
  useEffect(() => {
    if (!inFastingWindow || fastingToday || todayComplete || todaySkipped) return;
    try {
      if (window.localStorage.getItem(ASK_FASTING_DISMISSED_KEY) === todayStr) return;
    } catch {
      return;
    }
    setShowAskFastingPopup(true);
  }, [inFastingWindow, fastingToday, todayComplete, todaySkipped, todayStr]);

  const dismissAskFastingForToday = useCallback(() => {
    try {
      window.localStorage.setItem(ASK_FASTING_DISMISSED_KEY, todayStr);
    } catch {
      // ignore
    }
    setShowAskFastingPopup(false);
  }, [todayStr]);

  const handleAskFastingYes = useCallback(() => {
    startFastingToday(progress, setProgress, todayStr);
    setShowAskFastingPopup(false);
    toast.success("You're fasting today");
  }, [progress, setProgress, todayStr]);

  const handleAskFastingNo = useCallback(() => {
    setDaySkipped(progress, setProgress, todayStr);
    setShowAskFastingPopup(false);
    toast.success("Marked as not fasting today");
  }, [progress, setProgress, todayStr]);

  const askFastingContext = useMemo(() => {
    const today = new Date(todayStr + "T12:00:00");
    if (ramadanRange.isRamadanDay(today)) {
      const dayNum = ramadanRange.getRamadanDayNumber(today);
      return dayNum != null ? `Today is Ramadan Day ${dayNum}.` : "Today is a Ramadan day.";
    }
    const sunnah = getSunnahFastingInfo();
    if (sunnah) return sunnah.reason + ".";
    return null;
  }, [todayStr, ramadanRange]);

  const streak = calculateStreak(progress, todayStr);
  const totalDays = ramadanRange.totalDays ?? 30;
  const ramadanStart = ramadanRange.startStr ?? "";
  const ramadanEnd = ramadanRange.endStr ?? "";
  const completedInRange = (progress.completedDays ?? []).filter((d) => d >= ramadanStart && d <= ramadanEnd);
  const ramadanCompletionPct = totalDays > 0 ? Math.round((completedInRange.length / totalDays) * 100) : 0;
  const factDay = Math.min(30, Math.max(1, (new Date().getDate() % 30) || 30));
  const dailyFact = dailyFactsData.facts.find((f) => f.day === factDay) || dailyFactsData.facts[0];
  const badgeList = [
    { id: "first-fast", name: "First Fast", icon: "🌙", unlocked: completedInRange.length >= 1 },
    { id: "week-one", name: "Week One", icon: "⭐", unlocked: completedInRange.length >= 7 },
    { id: "halfway", name: "Halfway", icon: "🏅", unlocked: completedInRange.length >= 15 },
    { id: "streak-5", name: "5-day streak", icon: "🔥", unlocked: streak >= 5 },
    { id: "full-month", name: "Ramadan Champion", icon: "🏆", unlocked: completedInRange.length >= totalDays && totalDays > 0 },
  ];
  const recentAchievements = badgeList.filter((b) => b.unlocked).slice(-3).reverse();

  // Quick tips based on time of day
  const getQuickTip = () => {
    const hour = new Date().getHours();
    if (hour < 6) return { icon: Coffee, text: "Time for Suhoor! Eat protein-rich foods.", textAr: "وقت السحور! تناول أطعمة غنية بالبروتين" };
    if (hour < 12) return { icon: Droplets, text: "Remember to make morning duas.", textAr: "لا تنسى أذكار الصباح" };
    if (hour < 15) return { icon: TrendingUp, text: "Stay productive, you're halfway there!", textAr: "ابق منتجاً، أنت في المنتصف!" };
    if (hour < 18) return { icon: Sun, text: `Almost ${iftarLabel} time, prepare your meal.`, textAr: "اقترب وقت الإفطار، حضّر وجبتك" };
    return { icon: Utensils, text: `Don't overeat at ${iftarLabel}. Start with dates.`, textAr: "لا تفرط في الإفطار. ابدأ بالتمر" };
  };
  const tip = getQuickTip();

  if (!preferences.onboardingComplete && !hasTime) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <PageSEO
        title="Dashboard | TryRamadan.app"
        description={`Your Ramadan fasting dashboard: timer, prayer times, daily goals, and progress. Track ${suhoorLabelShort} and ${iftarLabelShort}, log fasting days, and stay on track.`}
        path="/dashboard"
      />
      <Navbar />
      
      <main id="main-content" className="main-content">
        <div className="container mx-auto px-4 min-w-0 max-w-5xl">
          {/* Header */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <div className="flex items-center justify-between gap-2 mb-4">
              <h1 className="text-2xl md:text-3xl font-display font-bold truncate min-w-0">
                {preferences.userType === "muslim" ? (
                  ramadanRange.isRamadanDay(new Date()) ? (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <span className="cursor-help border-b border-dotted border-transparent hover:border-muted-foreground/50">
                          Ramadan Mubarak
                        </span>
                      </TooltipTrigger>
                      <TooltipContent className="max-w-xs p-3" side="bottom">
                        <p className="font-semibold text-sm">{GENERAL_TOOLTIPS.ramadanMubarak.title}</p>
                        <p className="text-xs text-muted-foreground mt-1">{GENERAL_TOOLTIPS.ramadanMubarak.body}</p>
                        <p className="text-xs text-muted-foreground mt-2 pt-2 border-t border-border/50">
                          Arabic: <span className="font-arabic" dir="rtl">{(GENERAL_TOOLTIPS.ramadanMubarak as { bodyAr?: string }).bodyAr}</span>
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  ) : (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <span className="cursor-help border-b border-dotted border-transparent hover:border-muted-foreground/50">
                          Looking forward to Ramadan
                        </span>
                      </TooltipTrigger>
                      <TooltipContent className="max-w-xs p-3" side="bottom">
                        <p className="font-semibold text-sm">{(GENERAL_TOOLTIPS as { beforeRamadanGreeting: { title: string; body: string; bodyAr: string } }).beforeRamadanGreeting.title}</p>
                        <p className="text-xs text-muted-foreground mt-1">{(GENERAL_TOOLTIPS as { beforeRamadanGreeting: { body: string } }).beforeRamadanGreeting.body}</p>
                        <p className="text-xs text-muted-foreground mt-2 pt-2 border-t border-border/50">
                          Arabic: <span className="font-arabic" dir="rtl">{(GENERAL_TOOLTIPS as { beforeRamadanGreeting: { bodyAr: string } }).beforeRamadanGreeting.bodyAr}</span>
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  )
                ) : (
                  <>Your Fasting Journey</>
                )}
              </h1>
              <div className="flex items-center gap-1 sm:gap-2 shrink-0">
                <LocationDisplay
                  compact
                  open={locationEditorOpen}
                  onOpenChange={setLocationEditorOpen}
                />
                {(locationLoading || timesLoading) && (
                  <span className="text-xs text-muted-foreground animate-pulse">updating...</span>
                )}
                {(() => {
                  const suhoorAlarm = notifSettings.suhoorEnabled ? 1 : 0;
                  const iftarAlarm = notifSettings.iftarEnabled ? 1 : 0;
                  const dailyAlarm = notifSettings.dailyReminderEnabled ? 1 : 0;
                  const prayerAlarms = preferences.userType === "muslim" ? Object.values(prayerPrefs).filter(Boolean).length : 0;
                  const alarmCount = suhoorAlarm + iftarAlarm + dailyAlarm + prayerAlarms;
                  return (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Link to="/settings" aria-label={`Settings${alarmCount > 0 ? `, ${alarmCount} alarms` : ""}`} className="relative p-2 rounded-full hover:bg-muted transition-colors">
                          <Settings className="w-5 h-5 text-muted-foreground" aria-hidden />
                          {alarmCount > 0 && (
                            <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] flex items-center justify-center rounded-full bg-primary text-primary-foreground text-[10px] font-bold">
                              {alarmCount}
                            </span>
                          )}
                        </Link>
                      </TooltipTrigger>
                      <TooltipContent>{alarmCount > 0 ? `${alarmCount} notification${alarmCount === 1 ? "" : "s"}/alarms` : "Settings"}</TooltipContent>
                    </Tooltip>
                  );
                })()}
              </div>
            </div>
            
            {/* PWA install prompt (when installable and not dismissed) */}
            <PWAInstallBanner />

            {/* Dismissible location reminder when user hasn't saved location (UX-FLOWS 4.6) */}
            {preferences.onboardingComplete && !preferences.locationCoords && !locationBannerDismissed && (
              <div className="mt-2 flex items-center justify-between gap-2 px-3 py-2.5 rounded-xl bg-muted/60 border border-border">
                <p className="text-sm text-muted-foreground">
                  Set your location in Settings for accurate prayer and fasting times.
                </p>
                <div className="flex items-center gap-1 shrink-0">
                  <Link
                    to="/settings"
                    className="text-sm font-medium text-primary hover:underline"
                  >
                    Settings
                  </Link>
                  <button
                    type="button"
                    onClick={() => {
                      try {
                        window.localStorage.setItem("tryramadan-dismissed-location-banner", "1");
                      } catch {}
                      setLocationBannerDismissed(true);
                    }}
                    className="p-1.5 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground"
                    aria-label="Dismiss"
                  >
                    ×
                  </button>
                </div>
              </div>
            )}

            {/* Compact Ramadan / Sunnah badge at top */}
            {(() => {
              const today = new Date();
              today.setHours(0, 0, 0, 0);
              const inRamadan = ramadanRange.isRamadanDay(today);
              const ramadanDay = inRamadan ? ramadanRange.getRamadanDayNumber(today) ?? 1 : null;
              const daysUntil = inRamadan ? 0 : today < ramadanRange.start ? Math.ceil((ramadanRange.start.getTime() - today.getTime()) / 86400000) : getDaysUntilRamadan();
              const sunnahInfo = getSunnahFastingInfo();
              const isSunnahDay = sunnahInfo && !inRamadan;
              if (isSunnahDay) {
                const todayTimesNote = prayerTimes
                  ? `Today (your location): Suhoor end (Fajr) ${prayerTimes.fajr} · Iftar (Maghrib) ${prayerTimes.maghrib}`
                  : "Set your location in settings for today's prayer times.";
                return (
                  <div className="mt-2 flex items-center gap-2">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-secondary/15 border border-secondary/30 text-xs font-medium text-secondary cursor-help">
                          <Moon className="w-3.5 h-3.5" aria-hidden />
                          Sunnah fasting day · {sunnahInfo.reason.split(" - ")[0]}
                        </span>
                      </TooltipTrigger>
                      <TooltipContent className="max-w-xs p-3" side="bottom">
                        <p className="font-medium text-sm">{sunnahInfo.reason}</p>
                        <p className="text-xs text-muted-foreground mt-1">{todayTimesNote}</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                );
              }
              if (inRamadan && ramadanDay) {
                const lastDay = ramadanRange.isLastDayOfRamadan(new Date());
                return (
                  <div className="mt-2 flex items-center gap-2">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-primary/15 border border-primary/30 text-xs font-medium">
                      <Moon className="w-3.5 h-3.5" aria-hidden />
                      {lastDay ? "Last day of Ramadan" : `Day ${ramadanDay} of Ramadan`}
                    </span>
                  </div>
                );
              }
              if (daysUntil > 0) {
                const ramadanStartStr = (today < ramadanRange.start ? ramadanRange.start : getCurrentRamadanStart()).toLocaleDateString("en", { weekday: "short", month: "long", day: "numeric", year: "numeric" });
                return (
                  <div className="mt-2 flex items-center gap-2">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-muted/80 border border-border text-xs font-medium text-muted-foreground cursor-help">
                          <Moon className="w-3.5 h-3.5" aria-hidden />
                          {daysUntil} day{daysUntil === 1 ? "" : "s"} until Ramadan
                        </span>
                      </TooltipTrigger>
                      <TooltipContent className="max-w-xs p-3" side="bottom">
                        <p className="text-sm font-medium">Ramadan doesn&apos;t start until {ramadanStartStr}</p>
                        <p className="text-xs text-muted-foreground mt-1">Approximate date; actual start may vary by one day with moon sighting.</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                );
              }
              return null;
            })()}

            {/* Day selector — arrows inline with date; click date for calendar add options */}
            <div className="flex flex-wrap items-center gap-2 sm:gap-3 mt-4 p-3 sm:p-4 rounded-xl bg-muted/50 border border-border">
              <button
                type="button"
                onClick={goPrevDay}
                className="p-2.5 sm:p-2 rounded-lg hover:bg-muted transition-colors min-h-[44px] min-w-[44px] touch-manipulation shrink-0"
                aria-label="Previous day"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <Popover open={datePopoverOpen} onOpenChange={setDatePopoverOpen}>
                <PopoverTrigger asChild>
                  <button
                    type="button"
                    className="flex items-center gap-2 flex-1 min-w-0 justify-center sm:justify-start font-display font-semibold text-sm sm:text-base truncate rounded-lg hover:bg-muted/80 px-2 py-1"
                    aria-label="Date options"
                  >
                    <span className="truncate">
                      {selectedDateObj.toLocaleDateString("en", { weekday: "short", month: "short", day: "numeric", year: "numeric" })}
                    </span>
                    {isSelectedToday && (
                      <span className="px-2 py-0.5 rounded-full bg-secondary/20 text-secondary text-xs font-medium shrink-0">Today</span>
                    )}
                  </button>
                </PopoverTrigger>
                <PopoverContent align="start" className="w-56 p-3">
                  <p className="text-xs font-medium text-muted-foreground mb-2">Add to calendar</p>
                  <div className="flex flex-col gap-1">
                    <Link
                      to="/dashboard/schedule"
                      onClick={() => setDatePopoverOpen(false)}
                      className="text-sm py-2 px-2 rounded-lg hover:bg-muted"
                    >
                      Today → Schedule
                    </Link>
                    <Link
                      to="/dashboard/schedule?export=ramadan"
                      onClick={() => setDatePopoverOpen(false)}
                      className="text-sm py-2 px-2 rounded-lg hover:bg-muted"
                    >
                      All Ramadan → Export .ics
                    </Link>
                  </div>
                  {getDaysUntilRamadan() > 0 && (
                    <p className="text-xs text-muted-foreground mt-2 pt-2 border-t border-border">
                      {getDaysUntilRamadan()} day{getDaysUntilRamadan() === 1 ? "" : "s"} until Ramadan
                    </p>
                  )}
                </PopoverContent>
              </Popover>
              {!isSelectedToday && (
                <button
                  type="button"
                  onClick={goToToday}
                  aria-label="Go to today's date"
                  className="px-3 py-1.5 rounded-lg bg-primary/20 text-foreground text-sm font-medium hover:bg-primary/30 shrink-0"
                >
                  Go to today
                </button>
              )}
              <button
                type="button"
                onClick={goNextDay}
                className="p-2.5 sm:p-2 rounded-lg hover:bg-muted transition-colors min-h-[44px] min-w-[44px] touch-manipulation shrink-0"
                aria-label="Next day"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </motion.div>
          
          {/* Desktop: two columns — left: fast status + checklist; right: streak/total/sunnah/broken */}
          <div className="grid grid-cols-1 md:grid-cols-[minmax(0,1.4fr),minmax(220px,0.6fr)] gap-6 lg:gap-8 mb-6">
            {/* Left column: Current Fast Status + Suhoor/Iftar + Today's schedule + Daily missions */}
            <div className="min-w-0 space-y-4 w-full">
          {/* Current Fast Status Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.08 }}
            className={`p-4 sm:p-5 rounded-2xl border-2 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 w-full min-w-0 ${
              isFasting ? "bg-primary/10 border-primary/30" : inFastingWindow ? "bg-muted/50 border-border" : "bg-muted/50 border-border"
            }`}
          >
            <div className="flex items-start sm:items-center gap-3 min-w-0">
              <div className={`w-10 h-10 shrink-0 rounded-full flex items-center justify-center ${isFasting ? "bg-primary/20" : "bg-muted"}`}>
                {isFasting ? <Moon className="w-5 h-5 text-foreground" aria-hidden /> : <Sun className="w-5 h-5 text-muted-foreground" aria-hidden />}
              </div>
              <div className="min-w-0">
                <span className="inline-block px-2 py-0.5 rounded-full text-xs font-semibold mb-1.5 bg-background/80" aria-live="polite">
                  {isFasting ? "Right now: Fasting (no food or drink)" : inFastingWindow ? "Right now: Fasting window — log when you start" : "Right now: Eating window (you can eat)"}
                </span>
                <p className="text-xs font-medium text-muted-foreground mt-0.5 mb-1">Today&apos;s status</p>
                <div className="flex items-center gap-2 flex-wrap">
                  {todayComplete ? (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-secondary/20 text-secondary border border-secondary/40" aria-live="polite">Complete ✓</span>
                  ) : todaySkipped ? (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-muted text-muted-foreground border border-border" aria-live="polite">Skipped</span>
                  ) : fastingToday ? (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-primary/20 text-primary border border-primary/40" aria-live="polite">Fasting</span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-muted/80 text-muted-foreground border border-border" aria-live="polite">Not logged yet</span>
                  )}
                </div>
                <div className="flex items-center gap-2 flex-wrap mt-1">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <span className="font-semibold cursor-help border-b border-dotted border-transparent hover:border-muted-foreground/40 w-fit">
                        {isFasting ? "Currently fasting" : inFastingWindow ? "Not logged yet" : "Not fasting"}
                      </span>
                    </TooltipTrigger>
                    <TooltipContent className="max-w-xs p-3">
                      <p className="font-semibold text-sm">
                        {isFasting ? GENERAL_TOOLTIPS.fastingPeriod.title : inFastingWindow ? "Log when you start" : "Not fasting"}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {isFasting ? GENERAL_TOOLTIPS.fastingPeriod.body : inFastingWindow
                                ? "You're in the fasting window (after suhoor end). Tap \"I'm fasting\" below when you've started, or \"I didn't fast today\" if you're not fasting."
                                : preferences.userType === "new"
                                ? `You're in the eating window—between sunset (Maghrib) and the next dawn (Fajr). You can eat and drink. The timer shows time until suhoor end (suhoor = last meal before dawn; after that, fasting starts).`
                                : `You're in the eating window—between sunset (Maghrib) and the next dawn (Fajr). You can eat and drink. The timer below shows time until ${suhoorLabelShort} end (cut-off).`}
                      </p>
                    </TooltipContent>
                  </Tooltip>
                  {isSelectedToday && todaySkipped && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-muted/80 text-muted-foreground border border-border">
                      Skipped
                    </span>
                  )}
                  {isSelectedToday && !todaySkipped && (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button
                          type="button"
                          onClick={toggleTodayComplete}
                          aria-label={todayComplete ? "Fasted today (tap to undo)" : "Mark today as fasted"}
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium transition-colors ${
                            todayComplete
                              ? "bg-secondary/20 text-secondary border border-secondary/40 hover:bg-secondary/30"
                              : "bg-muted/80 text-muted-foreground hover:bg-muted border border-border"
                          }`}
                        >
                          {todayComplete ? "Fasted ✓" : "Mark complete"}
                        </button>
                      </TooltipTrigger>
                      <TooltipContent side="bottom" className="max-w-xs p-3">
                        {todayComplete ? "Tap to undo — unmark today" : "Tap when you've completed dawn-to-sunset fasting"}
                      </TooltipContent>
                    </Tooltip>
                  )}
                </div>
                {inFastingWindow ? (
                  <div className="mt-2 flex items-baseline gap-1.5" aria-live="polite" aria-atomic="true">
                    <span className="text-lg sm:text-xl font-bold tabular-nums">
                      {String(countdownToIftar.h).padStart(2, "0")}:{String(countdownToIftar.m).padStart(2, "0")}:{String(countdownToIftar.s).padStart(2, "0")}
                    </span>
                    <span className="text-sm text-muted-foreground">until {iftarLabel}</span>
                  </div>
                ) : (
                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    <span className="text-sm text-muted-foreground">Next: {suhoorLabelShort} —</span>
                    <span className="text-lg font-bold tabular-nums" aria-live="polite">
                      {String(countdownToSuhoor.h).padStart(2, "0")}:{String(countdownToSuhoor.m).padStart(2, "0")}:{String(countdownToSuhoor.s).padStart(2, "0")}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </motion.div>

          {/* Suhoor/Iftar strip — reserve min-height when loading to avoid CLS */}
          {!prayerTimes && (timesLoading || locationLoading) && (
            <div className="mb-4 space-y-3 min-h-[140px]" aria-hidden>
              <div className="p-3 sm:p-4 rounded-2xl bg-card border border-border min-h-[72px] animate-pulse bg-muted/30" />
              <div className="flex gap-2 h-10 w-48 rounded-xl bg-muted/30 animate-pulse" />
            </div>
          )}
          {prayerTimes && (() => {
            const majorPrayers: { name: string; time: string }[] = [
              { name: "Fajr", time: prayerTimes.fajr },
              { name: "Dhuhr", time: prayerTimes.dhuhr },
              { name: "Asr", time: prayerTimes.asr },
              { name: "Maghrib", time: prayerTimes.maghrib },
              { name: "Isha", time: prayerTimes.isha },
            ];
            const nowMins = displayTimezone
              ? getNowSecondsSinceMidnightInTimezone(displayTimezone) / 60
              : (() => { const n = new Date(); return n.getHours() * 60 + n.getMinutes(); })();
            const toMins = (t: string) => timeStringToSecondsSinceMidnight(t) / 60;
            const nextPrayer = (() => {
              for (const p of majorPrayers) {
                if (toMins(p.time) > nowMins) return { ...p, isTomorrow: false };
              }
              return { ...majorPrayers[0], isTomorrow: true };
            })();
            return (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.09 }}
                className="mb-4 space-y-3"
              >
                <Link
                  to="/dashboard/schedule"
                  className="block p-3 sm:p-4 rounded-2xl bg-card border border-border grid grid-cols-2 gap-2 sm:gap-3 hover:border-secondary/50 transition-colors w-full min-w-0"
                >
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="cursor-help min-w-0">
                        <span className="text-xs text-muted-foreground block truncate">{suhoorLabelShort} end · Fajr</span>
                        <span className="font-bold text-secondary">{prayerTimes.fajr}</span>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent className="max-w-xs p-3">
                      {preferences.userType === "new" ? (
                        <>
                          <p className="text-sm text-foreground">Suhoor = last meal before dawn (after this time, fasting starts).</p>
                          <p className="text-xs text-muted-foreground mt-1">This is Fajr (dawn) prayer time—the cutoff for eating and drinking.</p>
                        </>
                      ) : (
                        <>
                          <p className="text-sm text-foreground">{EATING_TIME_TOOLTIPS.suhoorEnds.body}</p>
                          <p className="text-xs text-muted-foreground mt-2 pt-2 border-t border-border/50">Arabic: <span className="font-arabic" dir="rtl">{(EATING_TIME_TOOLTIPS.suhoorEnds as { bodyAr?: string }).bodyAr}</span></p>
                        </>
                      )}
                    </TooltipContent>
                  </Tooltip>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="cursor-help min-w-0">
                        <span className="text-xs text-muted-foreground block truncate">{iftarLabel} · Maghrib</span>
                        <span className="font-bold text-secondary">{prayerTimes.maghrib}</span>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent className="max-w-xs p-3">
                      <p className="text-sm text-foreground">{EATING_TIME_TOOLTIPS.iftar.body}</p>
                      <p className="text-xs text-muted-foreground mt-2 pt-2 border-t border-border/50">Arabic: <span className="font-arabic" dir="rtl">{(EATING_TIME_TOOLTIPS.iftar as { bodyAr?: string }).bodyAr}</span></p>
                    </TooltipContent>
                  </Tooltip>
                </Link>
                <div className="flex flex-wrap items-center gap-2" role="group" aria-labelledby={!todaySkipped && !todayComplete ? "dashboard-mark-today-label" : undefined}>
                  {!todaySkipped && !todayComplete && (
                    <p className="w-full text-xs font-semibold text-muted-foreground mb-0.5" id="dashboard-mark-today-label">Mark today</p>
                  )}
                  {todaySkipped && (
                    <span className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium bg-muted text-muted-foreground border border-border">
                      I didn&apos;t fast today
                    </span>
                  )}
                  {!todaySkipped && !fastingToday && !todayComplete && (
                    <>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <button
                            type="button"
                            onClick={() => startFastingToday(progress, setProgress, todayStr)}
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90"
                          >
                            <Sunrise className="w-4 h-4 shrink-0" aria-hidden />
                            I&apos;m fasting
                          </button>
                        </TooltipTrigger>
                        <TooltipContent side="bottom" className="max-w-xs p-3">
                          <p className="font-semibold text-sm">I&apos;m fasting (after {suhoorLabelShort})</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {preferences.userType === "new"
                              ? "Tap after your pre-dawn meal (suhoor) when the fast has started."
                              : "Tap when you've finished your pre-dawn meal and started your fast."}
                          </p>
                        </TooltipContent>
                      </Tooltip>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <button
                            type="button"
                            onClick={() => setDaySkipped(progress, setProgress, todayStr)}
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium border border-border hover:bg-muted/50"
                          >
                            I didn&apos;t fast today
                          </button>
                        </TooltipTrigger>
                        <TooltipContent side="bottom" className="max-w-xs p-3">
                          <p className="font-semibold text-sm">I didn&apos;t fast today</p>
                          <p className="text-xs text-muted-foreground mt-1">Mark that you didn&apos;t fast (e.g. travel, illness). Won&apos;t count as a broken fast.</p>
                        </TooltipContent>
                      </Tooltip>
                      <p className="text-xs text-muted-foreground mt-1 w-full basis-full">&quot;I&apos;m fasting&quot; = you started today&apos;s fast; &quot;I didn&apos;t fast today&quot; = you&apos;re not fasting (e.g. travel, illness).</p>
                    </>
                  )}
                  {fastingToday && (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button
                          type="button"
                          onClick={() => setShowBreakFastConfirm(true)}
                          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium border border-destructive/50 text-destructive hover:bg-destructive/10"
                        >
                          <Sunset className="w-4 h-4 shrink-0" aria-hidden />
                          Break fast
                        </button>
                      </TooltipTrigger>
                      <TooltipContent side="bottom" className="max-w-xs p-3">
                        <p className="font-semibold text-sm">Break my fast</p>
                        <p className="text-xs text-muted-foreground mt-1">Tap when you&apos;re breaking your fast. Choose a reason to log.</p>
                      </TooltipContent>
                    </Tooltip>
                  )}
                </div>
                <Collapsible open={scheduleOpen} onOpenChange={setScheduleOpen}>
                  <div className="rounded-2xl bg-card border border-border overflow-hidden">
                    <CollapsibleTrigger asChild>
                      <button
                        type="button"
                        className="w-full flex items-center justify-between gap-2 p-3 sm:p-4 text-left hover:bg-muted/50 transition-colors min-h-[52px]"
                      >
                        <span className="font-display font-bold text-sm flex items-center gap-2">
                          <Clock className="w-4 h-4 text-secondary shrink-0" />
                          Today&apos;s schedule
                        </span>
                        {!scheduleOpen && (
                          <span className="text-xs text-muted-foreground font-normal truncate min-w-0">
                            {mealPlans[todayStr]?.suhoor || mealPlans[todayStr]?.iftar ? (
                              <>
                                <span className="text-secondary font-medium">Meals planned: </span>
                                {[
                                  mealPlans[todayStr]?.suhoor ? "Suhoor: " + (mealPlans[todayStr].suhoor.length > 15 ? mealPlans[todayStr].suhoor.slice(0, 14) + "…" : mealPlans[todayStr].suhoor) : "",
                                  mealPlans[todayStr]?.iftar ? iftarLabelShort + ": " + (mealPlans[todayStr].iftar!.length > 15 ? mealPlans[todayStr].iftar!.slice(0, 14) + "…" : mealPlans[todayStr].iftar) : "",
                                ].filter(Boolean).join(" · ")}
                              </>
                            ) : (
                              <>Next: {nextPrayer.name} {nextPrayer.time}{nextPrayer.isTomorrow && " (tomorrow)"}</>
                            )}
                          </span>
                        )}
                        <ChevronDown
                          className={`w-4 h-4 shrink-0 text-muted-foreground transition-transform ${scheduleOpen ? "rotate-180" : ""}`}
                          aria-hidden
                        />
                      </button>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <div className="border-t border-border p-3 sm:p-4">
                        <TodayScheduleTimeline
                          prayerTimes={prayerTimes}
                          iftarLabelShort={iftarLabelShort}
                          includeTaraweeh
                          dayMeals={mealPlans[todayStr]}
                        />
                      </div>
                    </CollapsibleContent>
                  </div>
                </Collapsible>
              </motion.div>
            );
          })()}

          {/* Main Timer Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-8"
          >
            {fastingToday && todayLog && (
              <div className="mb-4 py-2.5 px-4 rounded-xl bg-secondary/20 border border-secondary/40 text-center text-sm">
                <span className="font-medium text-secondary">You're fasting</span>
                <span className="text-muted-foreground ml-2">
                  (started {new Date(todayLog.startedAt).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })})
                </span>
              </div>
            )}
            <Dialog open={showBreakFastConfirm} onOpenChange={setShowBreakFastConfirm}>
              <DialogContent className="max-w-xs">
                <DialogTitle>Break fast?</DialogTitle>
                {inFastingWindow ? (
                  <p className="text-sm text-muted-foreground">Log that you broke your fast early. Choose a reason.</p>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    It&apos;s not fasting period right now (you&apos;re in the eating window). Did you break your fast earlier, during the fasting window (before Maghrib)? If so, choose a reason below.
                  </p>
                )}
                <div className="flex gap-2 justify-end">
                  <button
                    type="button"
                    className="px-3 py-1.5 rounded-lg text-sm border border-border"
                    onClick={() => setShowBreakFastConfirm(false)}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    className="px-3 py-1.5 rounded-lg text-sm bg-destructive text-destructive-foreground"
                    onClick={() => {
                      setShowBreakFastConfirm(false);
                      setShowBreakFastDialog(true);
                    }}
                  >
                    Sure
                  </button>
                </div>
              </DialogContent>
            </Dialog>
            <Dialog open={showAskFastingPopup} onOpenChange={(open) => !open && dismissAskFastingForToday()}>
              <DialogContent className="max-w-sm" aria-describedby="ask-fasting-description">
                <DialogTitle id="ask-fasting-title">Are you fasting today?</DialogTitle>
                <p id="ask-fasting-description" className="text-sm text-muted-foreground">
                  {askFastingContext ?? "Log your fast so we can show your countdown and progress."}
                </p>
                <div className="flex flex-col gap-2 pt-2">
                  <Button onClick={handleAskFastingYes} className="w-full gap-2">
                    <Sunrise className="w-4 h-4 shrink-0" aria-hidden />
                    Yes, I&apos;m fasting
                  </Button>
                  <Button variant="outline" onClick={handleAskFastingNo} className="w-full">
                    I didn&apos;t fast today
                  </Button>
                  <Button variant="ghost" onClick={dismissAskFastingForToday} className="w-full text-muted-foreground">
                    Later
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
            <BreakFastReasonDialog
              open={showBreakFastDialog}
              onOpenChange={setShowBreakFastDialog}
              onSelectReason={(reasonId, brokeAt) => breakFastingToday(progress, setProgress, reasonId, todayStr, brokeAt)}
              userType={preferences.userType}
              notInFastingPeriod={!inFastingWindow}
            />
            <div className="mt-6">
              <DailyMissionsCard />
            </div>
            {/* Habit tracking summary */}
            <div className="mt-4 rounded-xl border border-border bg-card p-4 w-full min-w-0">
              <h3 className="font-display font-semibold text-sm flex items-center gap-2 mb-2">
                <Target className="w-4 h-4 text-secondary" />
                Habit tracking
              </h3>
              <div className="flex items-center gap-4 text-sm">
                <span className="tabular-nums font-medium text-secondary">{habitStreak} day streak</span>
                <span className="tabular-nums text-muted-foreground">{habitTotalCheckmarks} total checkmarks</span>
              </div>
              <div className="flex flex-wrap gap-2 mt-2">
                <Link to="/habits" className="text-xs font-medium text-secondary hover:underline">View habits</Link>
                <Link to="/dashboard/journal" className="text-xs font-medium text-secondary hover:underline">Log in journal</Link>
              </div>
            </div>
          </motion.div>
            </div>

            {/* Right column (desktop): Streak, Total, Sunnah, Broken */}
          {/* Quick Actions Grid — Streak, Total, Sunnah, Broken (click to see days) */}
          <div className="min-w-0 w-full flex flex-col">
          {(() => {
            const streakDaysList = getStreakDays(progress, todayStr);
            const totalDaysList = [...progress.completedDays].sort().reverse();
            const sunnahDaysCount = getSunnahDaysCompleted(progress);
            const sunnahDaysList = progress.completedDays.filter((d) => {
              const day = new Date(d + "T12:00:00").getDay();
              return day === 1 || day === 4;
            }).sort().reverse();
            const brokenDaysList = getBrokenFastDays(progress);
            const excusedDaysList = getExcusedFastDays(progress);

            const DaysListDialog = ({ title, dates, open, onOpenChange, emptyMessage }: { title: string; dates: string[]; open: boolean; onOpenChange: (v: boolean) => void; emptyMessage?: string }) => (
              <Dialog open={open} onOpenChange={onOpenChange}>
                <DialogContent className="max-w-sm max-h-[70vh] flex flex-col">
                  <DialogTitle>{title}</DialogTitle>
                  <div className="overflow-auto flex-1 min-h-0">
                    {dates.length === 0 ? (
                      <p className="text-sm text-muted-foreground">{emptyMessage ?? "You're all set to start. Log your first fast from the Dashboard or Today page to see it here."}</p>
                    ) : (
                      <ul className="space-y-1">
                        {dates.map((dateStr) => (
                          <li key={dateStr}>
                            <Link
                              to={`/dashboard/schedule?date=${dateStr}`}
                              onClick={() => onOpenChange(false)}
                              className="block py-2 px-3 rounded-lg hover:bg-muted text-sm font-medium"
                            >
                              {new Date(dateStr + "T12:00:00").toLocaleDateString("en", { weekday: "short", month: "short", day: "numeric", year: "numeric" })}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </DialogContent>
              </Dialog>
            );

            return (
              <>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="grid grid-cols-2 gap-2 w-full mb-3"
              >
                {/* Streak — hidden when showStreakAndAchievements is off */}
                {preferences.showStreakAndAchievements !== false && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        type="button"
                        onClick={() => streak > 0 && setStatsDialog("streak")}
                        className={`flex-1 min-w-0 min-h-0 p-2 rounded-xl bg-card border border-border flex flex-col items-center justify-center transition-colors ${streak > 0 ? "cursor-pointer hover:border-secondary/50" : "cursor-default"}`}
                      >
                        <div className="w-6 h-6 rounded-full bg-gradient-gold flex items-center justify-center shrink-0">
                          <Flame className="w-3.5 h-3.5 text-foreground" />
                        </div>
                        <span className="text-sm font-bold text-secondary leading-tight mt-0.5">{streak}</span>
                        <span className="text-[10px] sm:text-xs text-muted-foreground leading-tight">Streak</span>
                      </button>
                    </TooltipTrigger>
                    <TooltipContent className="max-w-xs p-3">
                      <p>Consecutive days you completed the full fast or had an excused break (e.g. illness, travel). Excused days don&apos;t reset your streak — that&apos;s okay.</p>
                      <p className="text-xs text-muted-foreground mt-1">{streak > 0 ? "Click to see which days" : "Skipped or non-excused broken days reset the streak."}</p>
                    </TooltipContent>
                  </Tooltip>
                )}

                {/* Total Days */}
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      type="button"
                      onClick={() => progress.completedDays.length > 0 && setStatsDialog("total")}
                      className={`flex-1 min-w-0 min-h-0 p-2 rounded-xl bg-card border border-border flex flex-col items-center justify-center transition-colors ${progress.completedDays.length > 0 ? "cursor-pointer hover:border-secondary/50" : "cursor-default"}`}
                    >
                      <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center shrink-0">
                        <Calendar className="w-3.5 h-3.5 text-foreground" />
                      </div>
                      <span className="text-sm font-bold leading-tight mt-0.5">{progress.completedDays.length}</span>
                      <span className="text-[10px] sm:text-xs text-muted-foreground leading-tight">Total</span>
                    </button>
                  </TooltipTrigger>
                  <TooltipContent className="max-w-xs p-3">
                    <p>{progress.completedDays.length > 0 ? "Click to see which days" : "Total fasting days completed."}</p>
                  </TooltipContent>
                </Tooltip>

                {/* Sunnah Days */}
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      type="button"
                      onClick={() => sunnahDaysCount > 0 && setStatsDialog("sunnah")}
                      className={`flex-1 min-w-0 min-h-0 p-2 rounded-xl bg-card border border-border flex flex-col items-center justify-center transition-colors ${sunnahDaysCount > 0 ? "cursor-pointer hover:border-secondary/50" : "cursor-default"}`}
                    >
                      <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                        <Moon className="w-3.5 h-3.5 text-foreground" aria-hidden />
                      </div>
                      <span className="text-sm font-bold leading-tight mt-0.5">{sunnahDaysCount}</span>
                      <span className="text-[10px] sm:text-xs text-muted-foreground leading-tight">Sunnah</span>
                    </button>
                  </TooltipTrigger>
                  <TooltipContent className="max-w-xs p-3">
                    <p>{sunnahDaysCount > 0 ? "Click to see which days" : "Voluntary (Mon/Thu) days completed."}</p>
                  </TooltipContent>
                </Tooltip>

                {/* Broken fast days */}
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      type="button"
                      onClick={() => brokenDaysList.length > 0 && setStatsDialog("broken")}
                      className={`flex-1 min-w-0 min-h-0 p-2 rounded-xl bg-card border border-border flex flex-col items-center justify-center transition-colors ${brokenDaysList.length > 0 ? "cursor-pointer hover:border-secondary/50" : "cursor-default"}`}
                    >
                      <div className="w-6 h-6 rounded-full bg-destructive/20 flex items-center justify-center shrink-0">
                        <AlertTriangle className="w-3.5 h-3.5 text-destructive" aria-hidden />
                      </div>
                      <span className="text-sm font-bold text-destructive leading-tight mt-0.5">{brokenDaysList.length}</span>
                      <span className="text-[10px] sm:text-xs text-muted-foreground leading-tight">Broken</span>
                    </button>
                  </TooltipTrigger>
                  <TooltipContent className="max-w-xs p-3">
                    <p>{brokenDaysList.length > 0 ? "Click to see which days" : "Days you broke fast early."}</p>
                    {brokenDaysList.length > 0 && (() => {
                      const brokenEntries = (progress.fastingLog || []).filter((e) => e.status === "broken");
                      const totalHours = brokenEntries.reduce((sum, e) => sum + (e.hoursFasted ?? 0), 0);
                      return totalHours > 0 ? (
                        <p className="text-xs text-muted-foreground mt-1">
                          {totalHours.toFixed(1)}h total fasted before breaking.
                        </p>
                      ) : null;
                    })()}
                    {excusedDaysList.length > 0 && (
                      <p className="text-xs text-muted-foreground mt-1">{excusedDaysList.length} of these are excused (e.g. illness, travel).</p>
                    )}
                  </TooltipContent>
                </Tooltip>
              </motion.div>
              <p className="text-xs text-muted-foreground text-center md:text-left mb-4 -mt-1">
                Completed: {progress.completedDays.length} · Broken: {brokenDaysList.length}
                {excusedDaysList.length > 0 ? ` (${excusedDaysList.length} excused)` : ""} · Skipped: {(progress.skippedDays ?? []).length}
              </p>
                <DaysListDialog title="Day streak — days fasted" dates={streakDaysList} open={statsDialog === "streak"} onOpenChange={(v) => !v && setStatsDialog(null)} emptyMessage="Your streak will build as you log consecutive days. Start with today." />
                <DaysListDialog title="Total days fasted" dates={totalDaysList} open={statsDialog === "total"} onOpenChange={(v) => !v && setStatsDialog(null)} emptyMessage="Completed days will appear here once you mark days complete from the Dashboard or Schedule." />
                <DaysListDialog title="Sunnah days fasted" dates={sunnahDaysList} open={statsDialog === "sunnah"} onOpenChange={(v) => !v && setStatsDialog(null)} emptyMessage="Sunnah fasts (e.g. Monday & Thursday) will show here when you log them." />
                <DaysListDialog title="Broken fast days" dates={brokenDaysList} open={statsDialog === "broken"} onOpenChange={(v) => !v && setStatsDialog(null)} emptyMessage="If you ever break a fast early, you can log it with a reason — it'll show here. No judgment." />
              </>
            );
          })()}
          </div>
          </div>

            {/* Day view: meal plan, calories, prayer times, journal for selected day */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.18 }}
              className="mb-8 p-4 sm:p-6 rounded-2xl bg-card border border-border w-full min-w-0"
            >
              <Tooltip>
                <TooltipTrigger asChild>
                  <h2 className="font-display font-bold mb-4 flex items-center gap-2 cursor-help w-fit border-b border-dotted border-transparent hover:border-muted-foreground/40">
                    <Calendar className="w-5 h-5 text-secondary" />
                    {isSelectedToday ? "Today's plan" : "Day plan"} · {selectedDateObj.toLocaleDateString("en", { month: "short", day: "numeric" })}
                  </h2>
                </TooltipTrigger>
                <TooltipContent className="max-w-xs">
                  <p className="font-medium">Log what you ate per meal</p>
                  <p className="text-xs mt-1">Use + to add items for {suhoorLabelShort} and {iftarLabel}. Calories live in each item; total and recommended (from Settings) show below.</p>
                  <p className="font-arabic text-xs text-muted-foreground mt-1" dir="rtl">وجبات السحور والإفطار • السحور والإفطار</p>
                </TooltipContent>
              </Tooltip>
              <div className="flex flex-wrap gap-x-4 gap-y-1 mb-4">
                <Link to="/dashboard/schedule" className="text-sm text-secondary hover:underline font-medium">
                  Past logs & meal plans (Schedule) →
                </Link>
                <Link to="/dashboard/journal#past-entries" className="text-sm text-secondary hover:underline font-medium">
                  Past journal entries →
                </Link>
              </div>

              {/* Prayer times for this day */}
              {selectedDayPrayerTimes && (
                <div className="grid grid-cols-2 gap-3 mb-4 p-3 rounded-xl bg-muted/50">
                  <div className="min-w-0">
                    <span className="text-xs text-muted-foreground block truncate">{suhoorLabelShort} end · Fajr</span>
                    <span className="font-bold text-secondary">{selectedDayPrayerTimes.fajr}</span>
                  </div>
                  <div className="min-w-0">
                    <span className="text-xs text-muted-foreground block truncate">{iftarLabel} · Maghrib</span>
                    <span className="font-bold text-secondary">{selectedDayPrayerTimes.maghrib}</span>
                  </div>
                </div>
              )}

              {/* Planned for this day: show plan and "Log as eaten" / "Edit on Schedule" */}
              {selectedDate && (mealPlans[selectedDate]?.suhoor || mealPlans[selectedDate]?.iftar) && (
                <div className="mb-4 p-3 rounded-xl bg-primary/5 border border-primary/20">
                  <p className="text-xs font-medium text-muted-foreground mb-2">Planned for this day</p>
                  <ul className="space-y-1 text-sm mb-3">
                    {mealPlans[selectedDate]?.suhoor && (
                      <li><span className="text-muted-foreground">{suhoorLabelShort}:</span> {mealPlans[selectedDate].suhoor}</li>
                    )}
                    {mealPlans[selectedDate]?.iftar && (
                      <li><span className="text-muted-foreground">{iftarLabel}:</span> {mealPlans[selectedDate].iftar}</li>
                    )}
                  </ul>
                  <div className="flex flex-wrap gap-2">
                    <Button
                      type="button"
                      size="sm"
                      onClick={() => {
                        const plan = mealPlans[selectedDate];
                        if (!plan) return;
                        const { suhoor: suhoorEntries, iftar: iftarEntries } = planToFoodLogEntries(plan, getRecipe, parseNutrient);
                        setFoodLogs((prev) => {
                          const d = normalizeDayFoodLog(prev[selectedDate]);
                          return {
                            ...prev,
                            [selectedDate]: {
                              ...d,
                              suhoor: [...d.suhoor, ...suhoorEntries],
                              iftar: [...d.iftar, ...iftarEntries],
                            },
                          };
                        });
                        toast.success("Planned meals added to your log. You can edit portions on Schedule.");
                      }}
                    >
                      <Check className="w-3.5 h-3.5 mr-1" aria-hidden />
                      Log as eaten
                    </Button>
                    <Button type="button" variant="outline" size="sm" asChild>
                      <Link to="/dashboard/schedule">Edit on Schedule →</Link>
                    </Button>
                  </div>
                </div>
              )}

              {/* What you logged this day: show food entries so user can see what they added */}
              {(selectedDayLog.suhoor.length > 0 || selectedDayLog.iftar.length > 0) && (
                <div className="mb-4 p-3 rounded-xl bg-muted/20 border border-border">
                  <p className="text-xs font-medium text-muted-foreground mb-2">What you logged</p>
                  <ul className="space-y-1.5 text-sm">
                    {selectedDayLog.suhoor.map((entry) => {
                      const recipeEmoji = entry.recipeId ? (() => {
                        const [mt, idStr] = entry.recipeId.split("-");
                        const id = parseInt(idStr, 10);
                        const r = getRecipe(mt as MealType, id);
                        return r?.emoji;
                      })() : undefined;
                      const totalCal = Math.round((entry.caloriesPerPortion || 0) * entry.portions);
                      return (
                        <li key={entry.id} className="flex items-center gap-2 flex-wrap">
                          {recipeEmoji && <span className="shrink-0" aria-hidden>{recipeEmoji}</span>}
                          <span className="min-w-0 truncate">{entry.name}</span>
                          <span className="text-muted-foreground shrink-0">
                            {entry.portions !== 1 ? `${entry.portions}× ` : ""}{entry.caloriesPerPortion} cal = {totalCal} cal
                          </span>
                        </li>
                      );
                    })}
                    {selectedDayLog.iftar.map((entry) => {
                      const recipeEmoji = entry.recipeId ? (() => {
                        const [mt, idStr] = entry.recipeId.split("-");
                        const id = parseInt(idStr, 10);
                        const r = getRecipe(mt as MealType, id);
                        return r?.emoji;
                      })() : undefined;
                      const totalCal = Math.round((entry.caloriesPerPortion || 0) * entry.portions);
                      return (
                        <li key={entry.id} className="flex items-center gap-2 flex-wrap">
                          {recipeEmoji && <span className="shrink-0" aria-hidden>{recipeEmoji}</span>}
                          <span className="min-w-0 truncate">{entry.name}</span>
                          <span className="text-muted-foreground shrink-0">
                            {entry.portions !== 1 ? `${entry.portions}× ` : ""}{entry.caloriesPerPortion} cal = {totalCal} cal
                          </span>
                        </li>
                      );
                    })}
                  </ul>
                  <Link to="/dashboard/schedule" className="text-xs text-secondary hover:underline mt-2 inline-block">Edit on Schedule →</Link>
                </div>
              )}

              {/* Log what you ate: plus to add for Suhoor and Iftar (order by time: before Fajr → Suhoor first; after Maghrib → Iftar first) */}
              {(() => {
                const fajr = selectedDayPrayerTimes?.fajr;
                const maghrib = selectedDayPrayerTimes?.maghrib;
                const nowMins = displayTimezone
                  ? getNowSecondsSinceMidnightInTimezone(displayTimezone) / 60
                  : (() => { const n = new Date(); return n.getHours() * 60 + n.getMinutes(); })();
                const toMins = (t: string) => timeStringToSecondsSinceMidnight(t) / 60;
                const suhoorFirst = !fajr || nowMins < toMins(fajr);
                const iftarFirst = maghrib != null && nowMins >= toMins(maghrib);
                const mealOrder: ("suhoor" | "iftar")[] = iftarFirst ? ["iftar", "suhoor"] : suhoorFirst ? ["suhoor", "iftar"] : ["suhoor", "iftar"];
                return (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
                    {mealOrder.map((meal) => (
                      <div
                        key={meal}
                        className="flex items-center justify-between gap-2 p-3 rounded-xl border border-border bg-muted/20 hover:bg-muted/30 transition-colors"
                      >
                        <div className="min-w-0">
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <span className="text-xs font-medium text-muted-foreground block cursor-help border-b border-dotted border-transparent hover:border-muted-foreground/40 w-fit">
                                {meal === "suhoor" ? suhoorLabelShort : iftarLabel}
                              </span>
                            </TooltipTrigger>
                            <TooltipContent className="max-w-xs">
                              <p className="font-semibold text-sm">{meal === "suhoor" ? EATING_TIME_TOOLTIPS.suhoor.title : EATING_TIME_TOOLTIPS.iftar.title}</p>
                              <p className="text-xs text-muted-foreground mt-1">{meal === "suhoor" ? EATING_TIME_TOOLTIPS.suhoor.body : EATING_TIME_TOOLTIPS.iftar.body}</p>
                            </TooltipContent>
                          </Tooltip>
                          <p className="text-sm text-foreground mt-0.5">Log what you ate</p>
                        </div>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <button
                              type="button"
                              onClick={() => { setAddFoodMeal(meal); setPendingRecipe(null); setAddFoodInputs({ name: "", cal: "", portions: "1", protein: "", carbs: "", fat: "" }); }}
                              className="shrink-0 w-10 h-10 rounded-full flex items-center justify-center bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
                              aria-label={`Add food for ${meal === "suhoor" ? suhoorLabelShort : iftarLabel}`}
                            >
                              <Plus className="w-5 h-5" />
                            </button>
                          </TooltipTrigger>
                          <TooltipContent side="left">
                            <p>Add item to {meal === "suhoor" ? suhoorLabelShort : iftarLabel}</p>
                          </TooltipContent>
                        </Tooltip>
                      </div>
                    ))}
                  </div>
                );
              })()}

              {/* Add food dialog: pre-fill from recipe/preexisting, allow override before adding */}
              <Dialog
                open={addFoodMeal != null}
                onOpenChange={(open) => {
                  if (!open) {
                    setAddFoodMeal(null);
                    setPendingRecipe(null);
                    setAddFoodInputs({ name: "", cal: "", portions: "1", protein: "", carbs: "", fat: "" });
                  }
                }}
              >
                <DialogContent className="max-w-sm">
                  <DialogTitle>Add to {addFoodMeal === "suhoor" ? suhoorLabelShort : iftarLabel}</DialogTitle>
                  <p className="text-xs text-muted-foreground">
                    Pick a recipe or type a name. Calories and macros are filled automatically from recipes—you can override any value before adding.
                  </p>
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      if (addFoodMeal) submitAddFood(addFoodMeal);
                    }}
                    className="grid gap-2 pt-2"
                  >
                    <div className="relative">
                      <Input
                        placeholder="e.g. Oats & dates"
                        value={addFoodInputs.name}
                        onChange={(e) => setAddFoodInputs((p) => ({ ...p, name: e.target.value }))}
                        autoComplete="off"
                      />
                      {addFoodSuggestions.recipes.length > 0 || addFoodSuggestions.foods.length > 0 ? (
                        <ul className="absolute top-full left-0 right-0 mt-0.5 rounded-lg border border-border bg-background shadow-lg max-h-48 overflow-auto z-10" role="listbox" aria-label="Recipe and food suggestions">
                          {addFoodSuggestions.recipes.map(({ mealType, recipe }) => (
                            <li key={`${mealType}-${recipe.id}`}>
                              <button
                                type="button"
                                onClick={() => prefillFromRecipe(mealType as "suhoor" | "iftar", mealType, recipe.id)}
                                className="w-full text-left px-3 py-2 text-sm hover:bg-muted flex items-center justify-between gap-2"
                              >
                                <span>{recipe.emoji ? `${recipe.emoji} ` : ""}{recipe.name}</span>
                                <span className="text-xs text-muted-foreground">
                                  {recipe.nutrition?.calories ?? "?"} cal
                                </span>
                              </button>
                            </li>
                          ))}
                          {addFoodSuggestions.foods.map((f) => (
                            <li key={f}>
                              <button
                                type="button"
                                onClick={() => { setAddFoodInputs((p) => ({ ...p, name: f })); setPendingRecipe(null); }}
                                className="w-full text-left px-3 py-2 text-sm hover:bg-muted"
                              >
                                {f}
                              </button>
                            </li>
                          ))}
                        </ul>
                      ) : null}
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Input
                        type="number"
                        min={0}
                        max={CALORIE_MAX}
                        placeholder="Cal (optional)"
                        className="w-24"
                        value={addFoodInputs.cal}
                        onChange={(e) => setAddFoodInputs((p) => ({ ...p, cal: e.target.value }))}
                      />
                      <Input
                        type="number"
                        step="0.5"
                        min={0.1}
                        placeholder="Portions"
                        className="w-20"
                        value={addFoodInputs.portions}
                        onChange={(e) => setAddFoodInputs((p) => ({ ...p, portions: e.target.value }))}
                      />
                      <Input
                        type="number"
                        min={0}
                        placeholder="P (g)"
                        className="w-14"
                        value={addFoodInputs.protein}
                        onChange={(e) => setAddFoodInputs((p) => ({ ...p, protein: e.target.value }))}
                      />
                      <Input
                        type="number"
                        min={0}
                        placeholder="C (g)"
                        className="w-14"
                        value={addFoodInputs.carbs}
                        onChange={(e) => setAddFoodInputs((p) => ({ ...p, carbs: e.target.value }))}
                      />
                      <Input
                        type="number"
                        min={0}
                        placeholder="F (g)"
                        className="w-14"
                        value={addFoodInputs.fat}
                        onChange={(e) => setAddFoodInputs((p) => ({ ...p, fat: e.target.value }))}
                      />
                    </div>
                    <div className="flex gap-2 justify-end pt-2">
                      <Button type="button" variant="outline" size="sm" onClick={() => { setAddFoodMeal(null); setPendingRecipe(null); setAddFoodInputs({ name: "", cal: "", portions: "1", protein: "", carbs: "", fat: "" }); }}>
                        Cancel
                      </Button>
                      <Button type="submit" size="sm">
                        Add
                      </Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>

              {/* Quick journal popup: quick entry for today + link to full journal */}
              <Dialog
                open={quickJournalOpen}
                onOpenChange={(open) => {
                  setQuickJournalOpen(open);
                  if (!open) {
                    setQuickJournalContent("");
                    setQuickJournalGratitude("");
                  }
                }}
              >
                <DialogContent className="max-w-md">
                  <DialogTitle>Quick journal</DialogTitle>
                  <p className="text-xs text-muted-foreground">Save a short reflection for today. You can add more on the full journal page.</p>
                  <form
                    className="grid gap-3 pt-2"
                    onSubmit={(e) => {
                      e.preventDefault();
                      const content = quickJournalContent.trim();
                      if (!content) {
                        toast.error("Write something before saving. A few words are enough.");
                        return;
                      }
                      const now = new Date().toISOString();
                      const existing = journalEntries.find((e) => e.date === todayStr && (e.slot ?? "general") === "general");
                      const newEntry: JournalEntry = {
                        date: todayStr,
                        prompt: getPromptForDate(todayStr, preferences.userType, "general"),
                        content,
                        gratitude: quickJournalGratitude.trim() || undefined,
                        slot: "general",
                        createdAt: existing?.createdAt ?? now,
                        updatedAt: now,
                      };
                      setJournalEntries((prev) => {
                        const rest = prev.filter((e) => !(e.date === todayStr && (e.slot ?? "general") === "general"));
                        return [...rest, newEntry].sort((a, b) => b.date.localeCompare(a.date));
                      });
                      toast.success("Entry saved");
                      setQuickJournalOpen(false);
                      setQuickJournalContent("");
                      setQuickJournalGratitude("");
                    }}
                  >
                    <div className="grid gap-1.5">
                      <Label htmlFor="quick-journal-content">Today&apos;s reflection</Label>
                      <Textarea
                        id="quick-journal-content"
                        placeholder="How did today go? What are you grateful for?"
                        value={quickJournalContent}
                        onChange={(e) => setQuickJournalContent(e.target.value)}
                        rows={3}
                        className="resize-y min-h-[80px]"
                      />
                    </div>
                    <div className="grid gap-1.5">
                      <Label htmlFor="quick-journal-gratitude" className="text-muted-foreground font-normal text-xs">Gratitude (optional)</Label>
                      <Input
                        id="quick-journal-gratitude"
                        placeholder="One thing you're grateful for"
                        value={quickJournalGratitude}
                        onChange={(e) => setQuickJournalGratitude(e.target.value)}
                      />
                    </div>
                    <div className="flex gap-2 justify-end pt-1">
                      <Button type="submit" size="sm">
                        Save entry
                      </Button>
                    </div>
                  </form>
                  <div className="border-t border-border pt-3 mt-1">
                    <Link
                      to="/dashboard/journal"
                      className="text-sm text-secondary hover:underline font-medium flex items-center gap-1.5 w-fit"
                      onClick={() => {
                        setQuickJournalOpen(false);
                        setQuickJournalContent("");
                        setQuickJournalGratitude("");
                      }}
                    >
                      <BookOpen className="w-4 h-4" />
                      Go to journal page
                    </Link>
                  </div>
                </DialogContent>
              </Dialog>

              {/* Total calories from food items; optional override; show vs recommended when gender/weight set */}
              <div className="mb-4">
                <div className="p-3 rounded-xl bg-muted/30 border border-border flex flex-wrap items-baseline gap-2">
                  <span className="text-xs text-muted-foreground">Total calories</span>
                  <span className="font-bold text-secondary">
                    {Math.round(selectedDayNutr?.calories ?? selectedDayTotalsFromLog.calories ?? 0)} cal
                  </span>
                  {(preferences.sexForCalories != null || (preferences.bodyWeightKg != null && preferences.bodyWeightKg > 0)) && (
                    <span className="text-xs text-muted-foreground">
                      / {getRecommendedCaloriesFromPreferences(preferences)} recommended
                    </span>
                  )}
                </div>
                <div className="mt-2 flex items-center gap-2">
                  <span className="text-[10px] text-muted-foreground">Override total (optional):</span>
                  <input
                    type="number"
                    min={0}
                    max={CALORIE_MAX}
                    placeholder={selectedDayTotalsFromLog.calories ? String(Math.round(selectedDayTotalsFromLog.calories)) : "Cal"}
                    value={selectedDayNutr?.calories ?? ""}
                    onChange={(e) =>
                      setDayNutrition((prev) => ({
                        ...prev,
                        [selectedDate]: {
                          ...(prev[selectedDate] || {}),
                          calories: e.target.value ? clampCalories(Number(e.target.value)) : undefined,
                        },
                      }))
                    }
                    className="w-20 px-2 py-1 rounded-lg border border-border bg-background text-sm"
                  />
                </div>
              </div>

              {/* Journal for day */}
              <div className="mb-4">
                <div className="flex items-center justify-between gap-2 mb-1">
                  <span className="text-xs font-medium text-muted-foreground">Journal</span>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="h-7 text-xs"
                    onClick={() => {
                      const todayEntry = journalEntries.find((e) => e.date === todayStr);
                      setQuickJournalContent(todayEntry?.content ?? "");
                      setQuickJournalGratitude(todayEntry?.gratitude ?? "");
                      setQuickJournalOpen(true);
                    }}
                  >
                    <PenLine className="w-3.5 h-3.5 mr-1.5" />
                    Quick entry
                  </Button>
                </div>
                {selectedDayJournal ? (
                  <Link
                    to="/dashboard/journal"
                    className="block p-3 rounded-xl bg-muted/50 border border-border hover:border-secondary/50 text-sm"
                  >
                    <span className="line-clamp-2 text-foreground">{selectedDayJournal.content}</span>
                    {selectedDayJournal.gratitude && (
                      <span className="text-xs text-secondary mt-1 block">Grateful: {selectedDayJournal.gratitude}</span>
                    )}
                    <span className="text-xs text-muted-foreground mt-1">Edit in Journal →</span>
                  </Link>
                ) : (
                  <Link
                    to="/dashboard/journal"
                    className="block p-3 rounded-xl border border-dashed border-border hover:border-secondary/50 text-sm text-muted-foreground hover:text-foreground"
                  >
                    <PenLine className="w-4 h-4 inline mr-2" />
                    No entry for this day — add a note or reflection whenever you're ready
                  </Link>
                )}
              </div>

              {/* Mark day complete — today or selected past day (make-up); see USABILITY-TEST-TASKS Task 4 */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pt-3 border-t border-border">
                <span className="text-sm text-muted-foreground">
                  {selectedDate > todayStr
                    ? "You can only log fasting for today or a past date."
                    : selectedDayBroken
                      ? "This day was logged as broken. Mark as completed if you want to count it."
                      : !isSelectedToday
                        ? "Mark this day as completed if you fasted it (e.g. make-up day)."
                        : selectedDayComplete
                          ? "Logged: you fasted this day (dawn to sunset)"
                          : "Did you fast this day from dawn to sunset?"}
                </span>
                {selectedDate <= todayStr ? (
                  <button
                    type="button"
                    onClick={() => {
                      if (selectedDayComplete) {
                        setDayCompleted(progress, setProgress, selectedDate, false);
                      } else if (selectedDayBroken) {
                        setBrokenDayToCompleted(progress, setProgress, selectedDate);
                      } else {
                        setDayCompleted(progress, setProgress, selectedDate, true);
                      }
                    }}
                    aria-label={selectedDayComplete ? `Undo fast for ${selectedDate}` : selectedDayBroken ? `Mark ${selectedDate} as completed anyway` : `Mark ${selectedDate} as fasted`}
                    className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-colors shrink-0 min-h-[44px] touch-manipulation ${
                      selectedDayComplete ? "bg-secondary/20 text-secondary border border-secondary/40" : "bg-muted hover:bg-muted/80"
                    }`}
                  >
                    {selectedDayComplete ? "Yes, logged ✓" : selectedDayBroken ? "Mark as completed anyway" : "Yes, mark complete"}
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={goToToday}
                    className="px-4 py-2.5 rounded-xl text-sm font-medium bg-muted/50 text-muted-foreground shrink-0 min-h-[44px] touch-manipulation"
                  >
                    Go to today to log
                  </button>
                )}
              </div>
            </motion.div>

            {/* Progress Ring — days completed (ring fill = % of 30) */}
            <div className="p-4 rounded-2xl bg-card border border-border flex flex-col items-center w-full min-w-0">
              <ProgressRing
                value={ramadanCompletionPct}
                size={80}
                strokeWidth={8}
                centerLabel={completedInRange.length}
                sublabel={`of ${totalDays} days`}
              />
              {!ramadanRange.isRamadanDay(new Date()) && ramadanRange.start > new Date() && (
                <p className="text-xs text-muted-foreground mt-2 text-center">
                  Ramadan doesn&apos;t start until {ramadanRange.start.toLocaleDateString("en", { weekday: "short", month: "long", day: "numeric", year: "numeric" })}
                </p>
              )}
              {!ramadanRange.isRamadanDay(new Date()) && ramadanRange.start <= new Date() && getDaysUntilRamadan() > 0 && (
                <p className="text-xs text-muted-foreground mt-2 text-center">
                  Ramadan doesn&apos;t start until {getCurrentRamadanStart().toLocaleDateString("en", { weekday: "short", month: "long", day: "numeric", year: "numeric" })}
                </p>
              )}
            </div>

          {/* Streak celebration for milestones — hidden when showStreakAndAchievements is off */}
          {preferences.showStreakAndAchievements !== false && [7, 15, 30].includes(streak) && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mb-6 p-4 rounded-2xl bg-secondary/20 border-2 border-secondary/50 text-center"
            >
              <span className="text-3xl block mb-1">🎉</span>
              <span className="font-bold text-secondary">{(streak === 7 && "Week streak!") || (streak === 15 && "Half-month streak!") || "Full month streak!"}</span>
              <span className="block text-sm text-muted-foreground">{streak} consecutive days</span>
            </motion.div>
          )}

          {/* Quick action: Emergency break fast — only when user is currently fasting */}
          {fastingToday && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.22 }} className="mb-6">
              <Link
                to="/emergency"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border-2 border-destructive/50 text-destructive hover:bg-destructive/10 transition-colors text-sm font-medium"
              >
                <AlertTriangle className="w-4 h-4" />
                Emergency: break fast
              </Link>
            </motion.div>
          )}

          {/* Daily Ramadan Fact */}
          <Link to="/dashboard/learn">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.23 }}
              className="mb-8 p-5 rounded-2xl bg-gradient-to-br from-primary/5 to-secondary/5 border border-border hover:border-secondary/50 transition-colors"
            >
              <h3 className="font-display font-bold mb-2 flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-secondary" />
                Daily Ramadan fact
              </h3>
            <p className="font-medium text-foreground mb-1">{dailyFact.title}</p>
            <p className="text-sm text-muted-foreground">{dailyFact.content}</p>
            </motion.div>
          </Link>

          {/* Recent Achievements */}
          {recentAchievements.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.24 }}
              className="mb-8"
            >
              <h3 className="font-display font-bold mb-3 flex items-center gap-2">
                <Trophy className="w-5 h-5 text-secondary" />
                Recent achievements
              </h3>
              <div className="flex gap-3 flex-wrap">
                {recentAchievements.map((b) => (
                  <div
                    key={b.id}
                    className="p-3 rounded-xl bg-secondary/10 border border-secondary/30 flex items-center gap-2"
                  >
                    <span className="text-2xl">{b.icon}</span>
                    <span className="font-medium text-sm">{b.name}</span>
                  </div>
                ))}
                <Link
                  to="/dashboard/achievements"
                  className="p-3 rounded-xl bg-muted/50 border border-border text-sm text-muted-foreground hover:border-secondary/50 flex items-center gap-1"
                >
                  View all <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
            </motion.div>
          )}

          {/* Quick links to dashboard features (order configurable from Schedule) */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="mb-8"
          >
            <h3 className="font-display font-bold mb-3 flex items-center gap-2">
              <Target className="w-5 h-5 text-secondary" />
              Quick access
              {preferences.simplifyByLocation && (
                <span className="text-xs font-normal text-muted-foreground ml-2" title="Settings → Your priorities">
                  · Simplified by location
                </span>
              )}
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-[repeat(auto-fill,minmax(120px,1fr))] gap-2">
              {(() => {
                const byId = new Map(DASHBOARD_QUICK_ACTIONS.map((a) => [a.id, a]));
                return quickActionOrder
                  .filter((id) => id !== "macros" || (preferences.macroTrackingEnabled ?? false))
                  .filter((id) => id !== "prayers" || preferences.userType === "muslim")
                  .map((id) => {
                    const action = byId.get(id);
                    if (!action) return null;
                    return (
                      <Link
                        key={action.id}
                        to={action.path}
                        className="p-3 rounded-xl bg-card border border-border hover:border-secondary/50 text-center text-sm font-medium transition-colors"
                      >
                        {action.label}
                      </Link>
                    );
                  });
              })()}
            </div>
            <p className="text-sm text-muted-foreground mt-3 flex flex-wrap items-center gap-2">
              <Link to="/dashboard/schedule" className="text-secondary hover:underline font-medium">Configure quick access from Schedule</Link>
              <span aria-hidden="true">·</span>
              <HelpCircle className="w-4 h-4 shrink-0" />
              <Link to="/guides" className="text-secondary hover:underline font-medium">User Guides</Link>
              <span aria-hidden="true">·</span>
              <Link to="/faq" className="text-secondary hover:underline font-medium">FAQ</Link>
            </p>
          </motion.div>
          
          {/* Sunnah Fasting Info */}
          {(sunnahInfo || ayyamAlBeed?.isAyyamAlBeed) && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="mb-8"
            >
              <SunnahFastingBadge hijriDay={ayyamAlBeed?.hijriDay} prayerTimes={prayerTimes} locationLabel={preferences.location || undefined} />
            </motion.div>
          )}
          
          {/* Prayer Times Grid */}
          {prayerTimes && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35 }}
              className="mb-8"
            >
              <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
                <Popover open={prayerTimesPopoverOpen} onOpenChange={setPrayerTimesPopoverOpen}>
                  <PopoverTrigger asChild>
                    <button
                      type="button"
                      className="font-display font-bold flex items-center gap-2 hover:text-secondary transition-colors text-left"
                      aria-expanded={prayerTimesPopoverOpen}
                      aria-haspopup="dialog"
                    >
                      <Clock className="w-5 h-5 text-secondary" />
                      {preferences.userType === "muslim" ? "Today's Prayer Times" : "Today's Fasting Times"}
                      <span className="text-xs font-normal text-muted-foreground">(click for time until/ago)</span>
                    </button>
                  </PopoverTrigger>
                  <PopoverContent align="start" className="w-72 p-4">
                    <p className="text-xs font-medium text-muted-foreground mb-3">Time until or time ago for each prayer</p>
                    <ul className="space-y-2" aria-label="Prayer times with countdown">
                      {(() => {
                        const nowSec = displayTimezone ? getNowSecondsSinceMidnightInTimezone(displayTimezone) : (() => {
                          const n = new Date();
                          return n.getHours() * 3600 + n.getMinutes() * 60 + n.getSeconds();
                        })();
                        return [
                          { name: 'Fajr', nameAr: 'الفجر', time: prayerTimes.fajr },
                          { name: 'Sunrise', nameAr: 'الشروق', time: prayerTimes.sunrise },
                          { name: 'Dhuhr', nameAr: 'الظهر', time: prayerTimes.dhuhr },
                          { name: 'Asr', nameAr: 'العصر', time: prayerTimes.asr },
                          { name: 'Maghrib', nameAr: 'المغرب', time: prayerTimes.maghrib },
                          { name: 'Isha', nameAr: 'العشاء', time: prayerTimes.isha },
                        ].map((p) => {
                          const prayerSec = timeStringToSecondsSinceMidnight(p.time);
                          const isPast = nowSec >= prayerSec;
                          const diff = isPast ? nowSec - prayerSec : secondsUntilTimeInTimezone(nowSec, prayerSec);
                          const label = formatSecondsAsTimeLabel(diff, isPast);
                          return (
                            <li key={p.name} className="flex items-center justify-between text-sm">
                              <span><span className="font-medium">{p.name}</span> <span className="text-muted-foreground font-arabic" dir="rtl">({p.nameAr})</span></span>
                              <span className={isPast ? "text-muted-foreground" : "text-secondary font-medium"}>{label}</span>
                            </li>
                          );
                        });
                      })()}
                    </ul>
                    {preferences.userType === "muslim" && (
                      <Link
                        to="/dashboard/prayers"
                        onClick={() => setPrayerTimesPopoverOpen(false)}
                        className="text-xs text-secondary hover:underline font-medium mt-3 block"
                      >
                        Full prayer page →
                      </Link>
                    )}
                  </PopoverContent>
                </Popover>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2 sm:gap-3 w-full">
                {[
                  { name: 'Fajr', nameAr: 'الفجر', time: prayerTimes.fajr, highlight: true, Icon: Sunrise },
                  { name: 'Sunrise', nameAr: 'الشروق', time: prayerTimes.sunrise, Icon: Sun },
                  { name: 'Dhuhr', nameAr: 'الظهر', time: prayerTimes.dhuhr, Icon: Sun },
                  { name: 'Asr', nameAr: 'العصر', time: prayerTimes.asr, Icon: SunDim },
                  { name: 'Maghrib', nameAr: 'المغرب', time: prayerTimes.maghrib, highlight: true, Icon: Sunset },
                  { name: 'Isha', nameAr: 'العشاء', time: prayerTimes.isha, Icon: Moon },
                ].map((prayer) => {
                  const PrayerIcon = prayer.Icon;
                  const nowSec = displayTimezone ? getNowSecondsSinceMidnightInTimezone(displayTimezone) : (() => {
                    const n = new Date();
                    return n.getHours() * 3600 + n.getMinutes() * 60 + n.getSeconds();
                  })();
                  const prayerSec = timeStringToSecondsSinceMidnight(prayer.time);
                  const isPast = nowSec >= prayerSec;
                  const diff = isPast ? nowSec - prayerSec : secondsUntilTimeInTimezone(nowSec, prayerSec);
                  const timeLabel = formatSecondsAsTimeLabel(diff, isPast);
                  return (
                  <Tooltip key={prayer.name}>
                    <TooltipTrigger asChild>
                      <div className={`p-3 rounded-xl text-center cursor-help ${
                        prayer.highlight 
                          ? 'bg-secondary/20 border border-secondary/30' 
                          : 'bg-card border border-border'
                      }`}>
                        <PrayerIcon className={`w-5 h-5 mx-auto mb-1 block ${prayer.highlight ? 'text-secondary' : 'text-muted-foreground'}`} aria-hidden />
                        <ArabicHover
                          arabic={prayer.nameAr}
                          explanation={
                            prayer.name === 'Fajr' ? EATING_TIME_TOOLTIPS.fajr.body :
                            prayer.name === 'Maghrib' ? EATING_TIME_TOOLTIPS.maghrib.body :
                            prayer.name === 'Sunrise' ? EATING_TIME_TOOLTIPS.sunrise.body :
                            prayer.name === 'Dhuhr' ? EATING_TIME_TOOLTIPS.dhuhr.body :
                            prayer.name === 'Asr' ? EATING_TIME_TOOLTIPS.asr.body :
                            prayer.name === 'Isha' ? EATING_TIME_TOOLTIPS.isha.body : ''
                          }
                        >
                          <span className="text-xs text-muted-foreground block">{prayer.name}</span>
                        </ArabicHover>
                        <span className="text-lg font-bold block">{prayer.time}</span>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent className="max-w-xs p-3">
                      <p className="font-medium text-sm">{timeLabel}</p>
                      {prayer.name === 'Fajr' && (
                        <p className="text-xs text-muted-foreground mt-1">{EATING_TIME_TOOLTIPS.fajr.body}</p>
                      )}
                      {prayer.name === 'Maghrib' && (
                        <p className="text-xs text-muted-foreground mt-1">{EATING_TIME_TOOLTIPS.maghrib.body}</p>
                      )}
                      {!['Fajr', 'Maghrib'].includes(prayer.name) && (
                        <p className="text-xs text-muted-foreground mt-1">{prayer.name} prayer time</p>
                      )}
                      <p className="text-xs text-muted-foreground mt-2 pt-2 border-t border-border/50">Click header for all</p>
                    </TooltipContent>
                  </Tooltip>
                  );
                })}
              </div>
              {preferences.userType === "muslim" && (
                <div className="mt-4 p-3 rounded-xl border border-border bg-card">
                  <p className="text-xs font-medium text-muted-foreground mb-2">Prayers completed today</p>
                  <div className="flex flex-wrap gap-3">
                    {['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'].map((name) => {
                      const done = (prayerTracker[todayStr] ?? {})[name] ?? false;
                      return (
                        <label key={name} className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={done}
                            onChange={(e) => {
                              setPrayerTracker((prev) => ({
                                ...prev,
                                [todayStr]: { ...(prev[todayStr] ?? {}), [name]: e.target.checked },
                              }));
                            }}
                            className="rounded border-border"
                            aria-label={`Mark ${name} as ${done ? "not " : ""}completed`}
                          />
                          <span className="text-sm font-medium">{name}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              )}
            </motion.div>
          )}
          
          {/* Quick Tip */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mb-8 p-4 rounded-2xl bg-gradient-to-r from-primary/10 to-secondary/10 border border-border"
          >
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-secondary/20 flex items-center justify-center flex-shrink-0">
                <tip.icon className="w-5 h-5 text-secondary" />
              </div>
              <div>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <p className="font-medium cursor-help border-b border-dotted border-transparent hover:border-muted-foreground/40 w-fit">{tip.text}</p>
                  </TooltipTrigger>
                  <TooltipContent className="max-w-xs p-3">
                    <p className="text-sm text-muted-foreground font-arabic" dir="rtl">{tip.textAr}</p>
                  </TooltipContent>
                </Tooltip>
              </div>
            </div>
          </motion.div>

          {/* Fasting log — recent entries */}
          {recentLog.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.45 }}
              className="mb-8 p-4 rounded-2xl bg-card border border-border"
            >
              <h3 className="font-display font-bold mb-3 flex items-center gap-2">
                <Target className="w-5 h-5 text-secondary" />
                Fasting log
              </h3>
              <ul className="space-y-2 text-sm">
                {recentLog.map((entry) => (
                  <li
                    key={entry.date}
                    className="flex items-center justify-between py-2 border-b border-border last:border-0"
                  >
                    <span className="font-medium">{entry.date}</span>
                    <span className="text-muted-foreground">
                      {new Date(entry.startedAt).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}
                      {entry.completedAt && ` → ${new Date(entry.completedAt).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}`}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                        entry.status === 'completed'
                          ? 'bg-secondary/20 text-secondary'
                          : entry.status === 'broken'
                            ? 'bg-destructive/20 text-destructive'
                            : 'bg-primary/20 text-foreground'
                      }`}
                    >
                      {entry.status === 'completed' ? 'Done' : entry.status === 'broken' ? (entry.brokenReason ? `Broken (${getBrokenReasonLabel(entry.brokenReason)})` : 'Broken') : 'In progress'}
                    </span>
                  </li>
                ))}
              </ul>
            </motion.div>
          )}
          
          {/* Daily Hadith & Quran slider (dark wrapper for contrast) */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mb-8 rounded-2xl bg-primary/95 text-primary-foreground p-4"
            aria-label="Daily Hadith and Quran verse"
          >
            <HeroDailySlider />
          </motion.div>
          
          {/* Fasting History/Calendar Preview */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="card-cultural"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-display font-bold">
                This Week • هذا الأسبوع
              </h3>
              <Link
                to="/dashboard/schedule"
                className="text-sm text-secondary hover:underline flex items-center gap-1"
              >
                Open Schedule (full calendar) <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
            
            <div className="flex gap-2 justify-between">
              {Array.from({ length: 7 }).map((_, i) => {
                const date = new Date();
                date.setDate(date.getDate() - 6 + i);
                const dateStr = toLocalDateString(date);
                const isComplete = progress.completedDays.includes(dateStr);
                const isToday = dateStr === todayStr;
                const isSelected = dateStr === selectedDate;
                const dayName = date.toLocaleDateString('en', { weekday: 'short' });
                return (
                  <Tooltip key={i}>
                    <TooltipTrigger asChild>
                      <button
                        type="button"
                        onClick={() => setSelectedDate(dateStr)}
                        className={`flex-1 min-w-0 p-2 rounded-xl text-center transition-colors hover:bg-muted focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${
                          isSelected ? 'ring-2 ring-secondary bg-secondary/20' : ''
                        } ${isToday && !isSelected ? 'ring-2 ring-secondary/60' : ''} ${
                          !isSelected ? (isComplete ? 'bg-emerald-500/20 dark:bg-emerald-400/20' : 'bg-muted/50') : ''
                        }`}
                        aria-label={`${dayName} ${date.getDate()} — ${isComplete ? 'Fast completed' : 'View day'}`}
                        aria-pressed={isSelected}
                      >
                        <span className="text-xs text-muted-foreground block">{dayName}</span>
                        <span className="text-sm font-bold block">{date.getDate()}</span>
                        {isComplete && <Check className="w-3 h-3 text-emerald-600 dark:text-emerald-400 mx-auto mt-1" />}
                      </button>
                    </TooltipTrigger>
                    <TooltipContent>
                      {isComplete ? 'Fast completed ✓ — click to view day' : isToday ? 'Today — click to view' : `Click to view ${dayName}`}
                    </TooltipContent>
                  </Tooltip>
                );
              })}
            </div>
          </motion.div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Dashboard;
