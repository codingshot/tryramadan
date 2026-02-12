import { useState, useEffect, useMemo, useCallback } from "react";
import { motion } from "framer-motion";
import { useNavigate, Link } from "react-router-dom";
import {
  Moon,
  Sun,
  Sunrise,
  Sunset,
  SunDim,
  Clock,
  Calendar,
  MapPin,
  Settings,
  TrendingUp,
  Check,
  Bell,
  ChevronRight,
  Flame,
  ChevronLeft,
  ChevronDown,
  Utensils,
  Coffee,
  Droplets,
  BookOpen,
  Target,
  PenLine,
  Plus,
  AlertTriangle,
  Trophy,
  HelpCircle,
} from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { ArabicHover } from "@/components/ArabicHover";
import { ProgressRing } from "@/components/ProgressRing";
import dailyFactsData from "@/data/daily-facts.json";
import { SunnahFastingBadge } from "@/components/SunnahFastingBadge";
import { DashboardHero } from "@/components/dashboard/DashboardHero";
import { DashboardPrayerTracking } from "@/components/dashboard/DashboardPrayerTracking";
import { DashboardHistory } from "@/components/dashboard/DashboardHistory";
import { DashboardContent } from "@/components/dashboard/DashboardContent";
import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar";
import { PrayerTimesModal } from "@/components/dashboard/PrayerTimesModal";
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
import {
  getHabitLogStreak,
  getTotalHabitCheckmarks,
} from "@/data/ramadan-habits";
import {
  toLocalDateString,
  getTodayStringInTimezone,
  getNowSecondsSinceMidnightInTimezone,
  timeStringToSecondsSinceMidnight,
  secondsUntilTimeInTimezone,
  formatSecondsAsTimeLabel,
} from "@/lib/utils";
import { BreakFastReasonDialog } from "@/components/BreakFastReasonDialog";
import {
  usePrayerTimes,
  usePrayerTimesForDate,
  getSunnahFastingInfo,
  checkAyyamAlBeed,
} from "@/hooks/usePrayerTimes";
import { getDaysUntilRamadan, getCurrentRamadanStart } from "@/lib/ramadan";
import { useRamadanRange } from "@/hooks/useRamadanRange";
import { useAutoLocation } from "@/hooks/useLocation";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
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
import {
  getRecipes,
  getRecipe,
  parseNutrient,
  getAllCountries,
  type MealType,
  type Recipe,
} from "@/lib/cultureRecipes";

const Dashboard = () => {
  const navigate = useNavigate();
  const [preferences, setPreferences] = useUserPreferences();
  const [progress, setProgress] = useFastingProgress();
  const ramadanRange = useRamadanRange();

  const [isFasting, setIsFasting] = useState(false);
  const [inFastingWindow, setInFastingWindow] = useState(false);
  const [countdownToIftar, setCountdownToIftar] = useState({
    h: 0,
    m: 0,
    s: 0,
  });
  const [countdownToSuhoor, setCountdownToSuhoor] = useState({
    h: 0,
    m: 0,
    s: 0,
  });
  const [showAskFastingPopup, setShowAskFastingPopup] = useState(false);
  const [ayyamAlBeed, setAyyamAlBeed] = useState<{
    isAyyamAlBeed: boolean;
    hijriDay: number;
  } | null>(null);
  const [locationEditorOpen, setLocationEditorOpen] = useState(false);
  const [showBreakFastDialog, setShowBreakFastDialog] = useState(false);
  const [showBreakFastConfirm, setShowBreakFastConfirm] = useState(false);
  const [datePopoverOpen, setDatePopoverOpen] = useState(false);
  const [prayerTimesPopoverOpen, setPrayerTimesPopoverOpen] = useState(false);
  const [statsDialog, setStatsDialog] = useState<
    "streak" | "total" | "sunnah" | "broken" | null
  >(null);
  const [scheduleOpen, setScheduleOpen] = useState(false);
  const [addFoodMeal, setAddFoodMeal] = useState<"suhoor" | "iftar" | null>(
    null,
  );
  const [addFoodInputs, setAddFoodInputs] = useState({
    name: "",
    cal: "",
    portions: "1",
    protein: "",
    carbs: "",
    fat: "",
  });
  /** When set, form was pre-filled from this recipe; user can override before adding. */
  const [pendingRecipe, setPendingRecipe] = useState<{
    mealType: "suhoor" | "iftar";
    mealTypeKey: string;
    recipeId: number;
  } | null>(null);
  const [quickJournalOpen, setQuickJournalOpen] = useState(false);
  const [quickJournalContent, setQuickJournalContent] = useState("");
  const [quickJournalGratitude, setQuickJournalGratitude] = useState("");
  const [notifSettings] = useNotificationSettings();
  const [prayerPrefs] = usePrayerNotificationPrefs();
  const [locationBannerDismissed, setLocationBannerDismissed] = useState(
    () =>
      typeof window !== "undefined" &&
      window.localStorage.getItem("tryramadan-dismissed-location-banner") ===
        "1",
  );
  const [showPrayerTimesModal, setShowPrayerTimesModal] = useState(false);

  // Auto-detect location if not set
  const { location: autoLocation, loading: locationLoading } =
    useAutoLocation();

  // Use saved location or auto-detected (memoized to avoid effect churn)
  const locationCoords = useMemo(
    () =>
      preferences.locationCoords ||
      (autoLocation ? { lat: autoLocation.lat, lng: autoLocation.lng } : null),
    [preferences.locationCoords, autoLocation],
  );

  const displayTimezone = useDisplayTimezone();
  const todayStr = displayTimezone
    ? getTodayStringInTimezone(displayTimezone)
    : toLocalDateString(new Date());
  const [selectedDate, setSelectedDate] = useState(todayStr);
  // Get prayer times (today; when timezone is set, "today" is location's date so countdowns match)
  const {
    prayerTimes,
    hijriDate,
    loading: timesLoading,
  } = usePrayerTimes(
    locationCoords?.lat || null,
    locationCoords?.lng || null,
    displayTimezone,
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
    selectedDate,
  );

  // Tomorrow's date for suhoor countdown when past iftar (imsak changes day by day)
  const tomorrowDate = new Date(todayStr + "T12:00:00");
  tomorrowDate.setDate(tomorrowDate.getDate() + 1);
  const tomorrowStr = toLocalDateString(tomorrowDate);
  const { prayerTimes: tomorrowPrayerTimes } = usePrayerTimesForDate(
    locationCoords?.lat || null,
    locationCoords?.lng || null,
    tomorrowStr,
  );
  const imsakTomorrow = tomorrowPrayerTimes?.imsak ?? prayerTimes?.imsak;

  const [mealPlans, setMealPlans] = useDayMealPlans();
  const [foodLogs, setFoodLogs] = useDayFoodLog();
  const [dayNutrition, setDayNutrition] = useDayNutrition();
  const [quickActionOrder] = useDashboardQuickActions();
  const [journalEntries, setJournalEntries] = useLocalStorage<JournalEntry[]>(
    "tryramadan-journal",
    [],
  );
  const [prayerTracker, setPrayerTracker] = useLocalStorage<
    Record<string, Record<string, boolean>>
  >("tryramadan-prayer-tracker", {});
  const [habitLog] = useHabitLog();
  const habitStreak = useMemo(
    () => getHabitLogStreak(habitLog, todayStr),
    [habitLog, todayStr],
  );
  const habitTotalCheckmarks = useMemo(
    () => getTotalHabitCheckmarks(habitLog),
    [habitLog],
  );
  const iftarLabel = useIftarLabel();
  const iftarLabelShort = useIftarLabelShort();
  const suhoorLabelShort = useSuhoorLabelShort();

  const sunnahInfo = getSunnahFastingInfo();

  const selectedDayMeals = mealPlans[selectedDate];
  const selectedDayNutr = dayNutrition[selectedDate];
  const selectedDayLog = useMemo(
    () => normalizeDayFoodLog(foodLogs[selectedDate]),
    [foodLogs, selectedDate],
  );
  const selectedDayTotalsFromLog = useMemo(
    () => getDayTotalsFromFoodLog(selectedDayLog),
    [selectedDayLog],
  );
  const suhoorCal = useMemo(
    () =>
      selectedDayLog.suhoor.reduce(
        (sum, e) => sum + (e.caloriesPerPortion || 0) * (e.portions || 1),
        0,
      ),
    [selectedDayLog.suhoor],
  );
  const iftarCal = useMemo(
    () =>
      selectedDayLog.iftar.reduce(
        (sum, e) => sum + (e.caloriesPerPortion || 0) * (e.portions || 1),
        0,
      ),
    [selectedDayLog.iftar],
  );
  const selectedDayJournal = journalEntries.find(
    (e) => e.date === selectedDate,
  );
  const selectedDayComplete = progress.completedDays.includes(selectedDate);
  const selectedDayBroken = (progress.fastingLog ?? []).some(
    (e) => e.date === selectedDate && e.status === "broken",
  );
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
        locationCoords: { lat: autoLocation.lat, lng: autoLocation.lng },
      });
    }
  }, [autoLocation, preferences, setPreferences]);

  // Check Ayyam al-Beed
  useEffect(() => {
    if (locationCoords) {
      checkAyyamAlBeed(locationCoords.lat, locationCoords.lng).then(
        setAyyamAlBeed,
      );
    }
  }, [locationCoords]);

  // Parse prayer time string (e.g. "05:15" or "05:15 (EAT)") to hours and minutes in local date (used when no display timezone)
  const parseTimeToToday = useCallback((timeStr: string) => {
    const clean =
      (timeStr ?? "").trim().indexOf(" ") >= 0
        ? (timeStr ?? "")
            .trim()
            .slice(0, (timeStr ?? "").trim().indexOf(" "))
            .trim()
        : (timeStr ?? "").trim();
    const parts = clean.split(":").map((p) => parseInt(p, 10));
    const h = Number.isFinite(parts[0]) ? parts[0] : 0;
    const m = Number.isFinite(parts[1]) ? parts[1] : 0;
    const d = new Date();
    d.setHours(h, m, 0, 0);
    return d;
  }, []);

  const tickFastingAndCountdown = useCallback(() => {
    if (!prayerTimes?.imsak || !prayerTimes?.maghrib) {
      console.warn('[Dashboard] Missing prayer times:', { imsak: prayerTimes?.imsak, maghrib: prayerTimes?.maghrib });
      return;
    }
    const fastingToday = isFastingToday(progress, todayStr);
    const suhoorForTomorrow = imsakTomorrow ?? prayerTimes.imsak;
    if (displayTimezone) {
      const nowSeconds = getNowSecondsSinceMidnightInTimezone(displayTimezone);
      const imsakSeconds = timeStringToSecondsSinceMidnight(prayerTimes.imsak);
      const imsakTomorrowSeconds =
        timeStringToSecondsSinceMidnight(suhoorForTomorrow);
      const maghribSeconds = timeStringToSecondsSinceMidnight(
        prayerTimes.maghrib,
      );
      const inWindow =
        nowSeconds >= imsakSeconds && nowSeconds < maghribSeconds;

      console.log('[Dashboard] Fasting window check:', {
        nowSeconds,
        imsakSeconds,
        maghribSeconds,
        inWindow,
        fastingToday,
        currentTime: new Date().toLocaleTimeString(),
        imsakTime: prayerTimes.imsak,
        maghribTime: prayerTimes.maghrib,
      });

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
        const diff = secondsUntilTimeInTimezone(
          nowSeconds,
          imsakTomorrowSeconds,
        );
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
      const maghribTarget = maghribSameDay
        ? maghribTime
        : (() => {
            const next = new Date(maghribTime);
            next.setDate(next.getDate() + 1);
            return next;
          })();
      const inWindow = now >= imsakTime && now < maghribTarget;
      setInFastingWindow(inWindow);
      setIsFasting(inWindow && fastingToday);
      if (inWindow) {
        const diff = maghribTarget.getTime() - now.getTime();
        if (diff > 0)
          setCountdownToIftar({
            h: Math.floor(diff / 36e5),
            m: Math.floor((diff % 36e5) / 6e4),
            s: Math.floor((diff % 6e4) / 1000),
          });
      } else {
        // Past iftar: use tomorrow's imsak (suhoorForTomorrow is already tomorrow's time)
        // If we're past today's maghrib, count down to tomorrow's imsak
        const baseImsakTime = new Date(imsakTomorrowTime);

        // If baseImsakTime is in the past (already passed today), move to tomorrow
        const imsakTarget = baseImsakTime.getTime() < now.getTime()
          ? new Date(baseImsakTime.setDate(baseImsakTime.getDate() + 1))
          : baseImsakTime;

        const diff = imsakTarget.getTime() - now.getTime();
        if (diff > 0)
          setCountdownToSuhoor({
            h: Math.floor(diff / 36e5),
            m: Math.floor((diff % 36e5) / 6e4),
            s: Math.floor((diff % 6e4) / 1000),
          });
      }
    }
  }, [
    prayerTimes,
    imsakTomorrow,
    displayTimezone,
    parseTimeToToday,
    progress,
    todayStr,
  ]);

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
  const allCulturalFoods = useMemo(
    () =>
      [...new Set(getAllCountries().flatMap((c) => c.foods ?? []))].filter(
        Boolean,
      ),
    [],
  );
  const addFoodSuggestions = useMemo((): {
    recipes: { mealType: MealType; recipe: Recipe }[];
    foods: string[];
  } => {
    if (!addFoodMeal) return { recipes: [], foods: [] };
    const q = addFoodInputs.name.trim().toLowerCase();
    if (!q || q.length < 1) return { recipes: [], foods: [] };
    const recipes = allRecipesForAddFood
      .filter(
        (r) =>
          r.mealType === addFoodMeal && r.recipe.name.toLowerCase().includes(q),
      )
      .slice(0, 6);
    const foods = allCulturalFoods
      .filter(
        (f) =>
          f.toLowerCase().includes(q) &&
          !recipes.some((r) => r.recipe.name.toLowerCase() === f.toLowerCase()),
      )
      .slice(0, 4);
    return { recipes, foods };
  }, [addFoodMeal, addFoodInputs.name, allRecipesForAddFood, allCulturalFoods]);

  /** Pre-fill form from recipe so user can override calories/portions/macros before adding. */
  const prefillFromRecipe = (
    mealType: "suhoor" | "iftar",
    mealTypeKey: string,
    recipeId: number,
  ) => {
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
      toast.error(
        "Add a name or at least one calorie so we can save this item.",
      );
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
        const list =
          mealType === "suhoor" ? [...d.suhoor, entry] : [...d.iftar, entry];
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
        const list =
          mealType === "suhoor" ? [...d.suhoor, entry] : [...d.iftar, entry];
        return { ...prev, [selectedDate]: { ...d, [mealType]: list } };
      });
    }
    setAddFoodInputs({
      name: "",
      cal: "",
      portions: "1",
      protein: "",
      carbs: "",
      fat: "",
    });
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
    if (!inFastingWindow || fastingToday || todayComplete || todaySkipped)
      return;
    try {
      if (window.localStorage.getItem(ASK_FASTING_DISMISSED_KEY) === todayStr)
        return;
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

  // Prayer tracking handler
  const handlePrayerCheck = useCallback(
    (prayer: string, checked: boolean) => {
      console.log('[Dashboard] Prayer check:', { prayer, checked, todayStr });
      setPrayerTracker((prev) => {
        const updated = {
          ...prev,
          [todayStr]: {
            ...(prev[todayStr] || {}),
            [prayer]: checked,
          },
        };
        console.log('[Dashboard] Updated prayer tracker:', updated);
        return updated;
      });
    },
    [todayStr, setPrayerTracker],
  );

  // Calculate completion rate
  const completionRate = useMemo(() => {
    if (!ramadanRange?.totalDays) return 0;
    return Math.round(
      (progress.completedDays.length / ramadanRange.totalDays) * 100,
    );
  }, [progress.completedDays.length, ramadanRange?.totalDays]);

  // Calculate next prayer
  const nextPrayer = useMemo(() => {
    if (!prayerTimes) return null;

    const prayers = [
      { name: "Fajr", time: prayerTimes.fajr },
      { name: "Dhuhr", time: prayerTimes.dhuhr },
      { name: "Asr", time: prayerTimes.asr },
      { name: "Maghrib", time: prayerTimes.maghrib },
      { name: "Isha", time: prayerTimes.isha },
    ];

    const nowSec = displayTimezone
      ? getNowSecondsSinceMidnightInTimezone(displayTimezone)
      : (() => {
          const n = new Date();
          return n.getHours() * 3600 + n.getMinutes() * 60 + n.getSeconds();
        })();

    for (const prayer of prayers) {
      const prayerSec = timeStringToSecondsSinceMidnight(prayer.time);
      if (nowSec < prayerSec) {
        const diff = prayerSec - nowSec;
        const h = Math.floor(diff / 3600);
        const m = Math.floor((diff % 3600) / 60);
        return {
          name: prayer.name,
          time: prayer.time,
          countdown: h > 0 ? `${h}h ${m}m` : `${m}m`,
        };
      }
    }

    return null;
  }, [prayerTimes, displayTimezone]);

  const askFastingContext = useMemo(() => {
    const today = new Date(todayStr + "T12:00:00");
    if (ramadanRange.isRamadanDay(today)) {
      const dayNum = ramadanRange.getRamadanDayNumber(today);
      return dayNum != null
        ? `Today is Ramadan Day ${dayNum}.`
        : "Today is a Ramadan day.";
    }
    const sunnah = getSunnahFastingInfo();
    if (sunnah) return sunnah.reason + ".";
    return null;
  }, [todayStr, ramadanRange]);

  const streak = calculateStreak(progress, todayStr);
  const totalDays = ramadanRange.totalDays ?? 30;
  const ramadanStart = ramadanRange.startStr ?? "";
  const ramadanEnd = ramadanRange.endStr ?? "";
  const completedInRange = (progress.completedDays ?? []).filter(
    (d) => d >= ramadanStart && d <= ramadanEnd,
  );
  const ramadanCompletionPct =
    totalDays > 0 ? Math.round((completedInRange.length / totalDays) * 100) : 0;
  const factDay = Math.min(30, Math.max(1, new Date().getDate() % 30 || 30));
  const dailyFact =
    dailyFactsData.facts.find((f) => f.day === factDay) ||
    dailyFactsData.facts[0];
  const badgeList = [
    {
      id: "first-fast",
      name: "First Fast",
      icon: "🌙",
      unlocked: completedInRange.length >= 1,
    },
    {
      id: "week-one",
      name: "Week One",
      icon: "⭐",
      unlocked: completedInRange.length >= 7,
    },
    {
      id: "halfway",
      name: "Halfway",
      icon: "🏅",
      unlocked: completedInRange.length >= 15,
    },
    { id: "streak-5", name: "5-day streak", icon: "🔥", unlocked: streak >= 5 },
    {
      id: "full-month",
      name: "Ramadan Champion",
      icon: "🏆",
      unlocked: completedInRange.length >= totalDays && totalDays > 0,
    },
  ];
  const recentAchievements = badgeList
    .filter((b) => b.unlocked)
    .slice(-3)
    .reverse();

  // Quick tips based on time of day
  const getQuickTip = () => {
    const hour = new Date().getHours();
    if (hour < 6)
      return {
        icon: Coffee,
        text: "Time for Suhoor! Eat protein-rich foods.",
        textAr: "وقت السحور! تناول أطعمة غنية بالبروتين",
      };
    if (hour < 12)
      return {
        icon: Droplets,
        text: "Remember to make morning duas.",
        textAr: "لا تنسى أذكار الصباح",
      };
    if (hour < 15)
      return {
        icon: TrendingUp,
        text: "Stay productive, you're halfway there!",
        textAr: "ابق منتجاً، أنت في المنتصف!",
      };
    if (hour < 18)
      return {
        icon: Sun,
        text: `Almost ${iftarLabel} time, prepare your meal.`,
        textAr: "اقترب وقت الإفطار، حضّر وجبتك",
      };
    return {
      icon: Utensils,
      text: `Don't overeat at ${iftarLabel}. Start with dates.`,
      textAr: "لا تفرط في الإفطار. ابدأ بالتمر",
    };
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
                        <p className="font-semibold text-sm">
                          {GENERAL_TOOLTIPS.ramadanMubarak.title}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {GENERAL_TOOLTIPS.ramadanMubarak.body}
                        </p>
                        <p className="text-xs text-muted-foreground mt-2 pt-2 border-t border-border/50">
                          Arabic:{" "}
                          <span className="font-arabic" dir="rtl">
                            {
                              (
                                GENERAL_TOOLTIPS.ramadanMubarak as {
                                  bodyAr?: string;
                                }
                              ).bodyAr
                            }
                          </span>
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
                        <p className="font-semibold text-sm">
                          {
                            (
                              GENERAL_TOOLTIPS as {
                                beforeRamadanGreeting: {
                                  title: string;
                                  body: string;
                                  bodyAr: string;
                                };
                              }
                            ).beforeRamadanGreeting.title
                          }
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {
                            (
                              GENERAL_TOOLTIPS as {
                                beforeRamadanGreeting: { body: string };
                              }
                            ).beforeRamadanGreeting.body
                          }
                        </p>
                        <p className="text-xs text-muted-foreground mt-2 pt-2 border-t border-border/50">
                          Arabic:{" "}
                          <span className="font-arabic" dir="rtl">
                            {
                              (
                                GENERAL_TOOLTIPS as {
                                  beforeRamadanGreeting: { bodyAr: string };
                                }
                              ).beforeRamadanGreeting.bodyAr
                            }
                          </span>
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
                  <span className="text-xs text-muted-foreground animate-pulse">
                    updating...
                  </span>
                )}
                {(() => {
                  const suhoorAlarm = notifSettings.suhoorEnabled ? 1 : 0;
                  const iftarAlarm = notifSettings.iftarEnabled ? 1 : 0;
                  const dailyAlarm = notifSettings.dailyReminderEnabled ? 1 : 0;
                  const prayerAlarms =
                    preferences.userType === "muslim"
                      ? Object.values(prayerPrefs).filter(Boolean).length
                      : 0;
                  const alarmCount =
                    suhoorAlarm + iftarAlarm + dailyAlarm + prayerAlarms;
                  return (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Link
                          to="/settings"
                          aria-label={`Settings${alarmCount > 0 ? `, ${alarmCount} alarms` : ""}`}
                          className="relative p-2 rounded-full hover:bg-muted transition-colors"
                        >
                          <Settings
                            className="w-5 h-5 text-muted-foreground"
                            aria-hidden
                          />
                          {alarmCount > 0 && (
                            <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] flex items-center justify-center rounded-full bg-primary text-primary-foreground text-[10px] font-bold">
                              {alarmCount}
                            </span>
                          )}
                        </Link>
                      </TooltipTrigger>
                      <TooltipContent>
                        {alarmCount > 0
                          ? `${alarmCount} notification${alarmCount === 1 ? "" : "s"}/alarms`
                          : "Settings"}
                      </TooltipContent>
                    </Tooltip>
                  );
                })()}
              </div>
            </div>

            {/* PWA install prompt (when installable and not dismissed) */}
            <PWAInstallBanner />

            {/* Dismissible location reminder when user hasn't saved location (UX-FLOWS 4.6) */}
            {preferences.onboardingComplete &&
              !preferences.locationCoords &&
              !locationBannerDismissed && (
                <div className="mt-2 flex items-center justify-between gap-2 px-3 py-2.5 rounded-xl bg-muted/60 border border-border">
                  <p className="text-sm text-muted-foreground">
                    Set your location in Settings for accurate prayer and
                    fasting times.
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
                          window.localStorage.setItem(
                            "tryramadan-dismissed-location-banner",
                            "1",
                          );
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
              const ramadanDay = inRamadan
                ? (ramadanRange.getRamadanDayNumber(today) ?? 1)
                : null;
              const daysUntil = inRamadan
                ? 0
                : today < ramadanRange.start
                  ? Math.ceil(
                      (ramadanRange.start.getTime() - today.getTime()) /
                        86400000,
                    )
                  : getDaysUntilRamadan();
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
                          Sunnah fasting day ·{" "}
                          {sunnahInfo.reason.split(" - ")[0]}
                        </span>
                      </TooltipTrigger>
                      <TooltipContent className="max-w-xs p-3" side="bottom">
                        <p className="font-medium text-sm">
                          {sunnahInfo.reason}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {todayTimesNote}
                        </p>
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
                      {lastDay
                        ? "Last day of Ramadan"
                        : `Day ${ramadanDay} of Ramadan`}
                    </span>
                  </div>
                );
              }
              if (daysUntil > 0) {
                const ramadanStartStr = (
                  today < ramadanRange.start
                    ? ramadanRange.start
                    : getCurrentRamadanStart()
                ).toLocaleDateString("en", {
                  weekday: "short",
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                });
                return (
                  <div className="mt-2 flex items-center gap-2">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-muted/80 border border-border text-xs font-medium text-muted-foreground cursor-help">
                          <Moon className="w-3.5 h-3.5" aria-hidden />
                          {daysUntil} day{daysUntil === 1 ? "" : "s"} until
                          Ramadan
                        </span>
                      </TooltipTrigger>
                      <TooltipContent className="max-w-xs p-3" side="bottom">
                        <p className="text-sm font-medium">
                          Ramadan doesn&apos;t start until {ramadanStartStr}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Approximate date; actual start may vary by one day
                          with moon sighting.
                        </p>
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
                      {selectedDateObj.toLocaleDateString("en", {
                        weekday: "short",
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </span>
                    {isSelectedToday && (
                      <span className="px-2 py-0.5 rounded-full bg-secondary/20 text-secondary text-xs font-medium shrink-0">
                        Today
                      </span>
                    )}
                  </button>
                </PopoverTrigger>
                <PopoverContent align="start" className="w-56 p-3">
                  <p className="text-xs font-medium text-muted-foreground mb-2">
                    Add to calendar
                  </p>
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
                      {getDaysUntilRamadan()} day
                      {getDaysUntilRamadan() === 1 ? "" : "s"} until Ramadan
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

          {/* Desktop: two columns — left: main content (70%); right: sidebar (30%) */}
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6 lg:gap-8 mb-6">
            {/* Left column: Main dashboard content */}
            <div className="min-w-0 space-y-4 w-full">
              {/* NEW: Dashboard Hero - Fast Status + Timer + Next Prayer */}
              <DashboardHero
                progress={progress}
                isFasting={isFasting}
                countdownToIftar={countdownToIftar}
                countdownToSuhoor={countdownToSuhoor}
                prayerTimes={prayerTimes}
                todayStr={todayStr}
                nextPrayer={nextPrayer}
                onMarkComplete={toggleTodayComplete}
                onBreakFast={() => setShowBreakFastConfirm(true)}
                onSkip={() => {
                  setDaySkipped(progress, setProgress, todayStr);
                  toast.success("Marked as not fasting today");
                }}
              />

              {/* Daily Hadith & Quran Slider */}
              <HeroDailySlider />

              {/* NEW: Prayer Tracking + Quick Stats */}
              <DashboardPrayerTracking
                prayerTimes={prayerTimes}
                progress={progress}
                completionRate={completionRate}
                prayerTracker={prayerTracker}
                todayStr={todayStr}
                onPrayerCheck={handlePrayerCheck}
                onViewAllPrayers={() => setShowPrayerTimesModal(true)}
              />

              {/* NEW: History - Collapsible Past Days */}
              <DashboardHistory
                selectedDate={selectedDate}
                setSelectedDate={setSelectedDate}
                progress={progress}
                todayStr={todayStr}
              />

              {/* NEW: Content - Daily Fact + Explore Links */}
              <DashboardContent userType={preferences.userType} />
            </div>

            {/* Right sidebar: Quick Actions, Progress, Prayers, Tips (hidden on mobile) */}
            <DashboardSidebar
              prayerTimes={prayerTimes}
              todayStr={todayStr}
              progress={progress}
              ramadanRange={ramadanRange}
              completionRate={completionRate}
              onViewAllPrayers={() => setShowPrayerTimesModal(true)}
            />
          </div>
        </div>
      </main>

      {/* Prayer Times Modal */}
      <PrayerTimesModal
        open={showPrayerTimesModal}
        onOpenChange={setShowPrayerTimesModal}
        prayerTimes={prayerTimes}
        prayerTracker={prayerTracker}
        todayStr={todayStr}
        onPrayerCheck={handlePrayerCheck}
      />

      {/* Break Fast Confirmation Dialog */}
      <Dialog
        open={showBreakFastConfirm}
        onOpenChange={setShowBreakFastConfirm}
      >
        <DialogContent className="max-w-xs">
          <DialogTitle>Break fast?</DialogTitle>
          {inFastingWindow ? (
            <p className="text-sm text-muted-foreground">
              Log that you broke your fast early. Choose a reason.
            </p>
          ) : (
            <p className="text-sm text-muted-foreground">
              It&apos;s not fasting period right now (you&apos;re in the eating
              window). Did you break your fast earlier, during the fasting
              window (before Maghrib)? If so, choose a reason below.
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
              Continue
            </button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Break Fast Reason Dialog */}
      <BreakFastReasonDialog
        open={showBreakFastDialog}
        onOpenChange={setShowBreakFastDialog}
        onSelectReason={(reasonId, brokeAt) =>
          breakFastingToday(progress, setProgress, reasonId, todayStr, brokeAt)
        }
        userType={preferences.userType}
        notInFastingPeriod={!inFastingWindow}
      />

      {/* Ask Fasting Popup */}
      <Dialog open={showAskFastingPopup} onOpenChange={setShowAskFastingPopup}>
        <DialogContent className="max-w-sm">
          <DialogTitle>Are you fasting today?</DialogTitle>
          <p className="text-sm text-muted-foreground mb-4">
            You&apos;re in the fasting window. Mark whether you&apos;re fasting
            to track your progress.
          </p>
          <div className="flex flex-col gap-2">
            <Button onClick={handleAskFastingYes} className="w-full">
              Yes, I&apos;m fasting
            </Button>
            <Button
              variant="outline"
              onClick={handleAskFastingNo}
              className="w-full"
            >
              I didn&apos;t fast today
            </Button>
            <Button
              variant="ghost"
              onClick={dismissAskFastingForToday}
              className="w-full text-muted-foreground"
            >
              Later
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
};

export default Dashboard;
