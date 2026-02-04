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
import { DailyHadith } from "@/components/DailyHadith";
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
  setDaySkipped,
  useDayMealPlans,
  useDayNutrition,
  useDailyGoals,
  clampCalories,
  CALORIE_MAX,
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
  useNotificationSettings,
  usePrayerNotificationPrefs,
  useDayFoodLog,
  normalizeDayFoodLog,
  useDisplayTimezone,
} from "@/hooks/useLocalStorage";
import { toLocalDateString, getTodayStringInTimezone, getNowSecondsSinceMidnightInTimezone, timeStringToSecondsSinceMidnight, secondsUntilTimeInTimezone } from "@/lib/utils";
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
import { EATING_TIME_TOOLTIPS } from "@/data/eating-times-tooltips";
import { GENERAL_TOOLTIPS } from "@/data/general-tooltips";
import { Footer } from "@/components/Footer";
import { PageSEO } from "@/components/PageSEO";
import { toast } from "sonner";

const Dashboard = () => {
  const navigate = useNavigate();
  const [preferences, setPreferences] = useUserPreferences();
  const [progress, setProgress] = useFastingProgress();
  const ramadanRange = useRamadanRange();

  const [isFasting, setIsFasting] = useState(true);
  const [countdownToIftar, setCountdownToIftar] = useState({ h: 0, m: 0, s: 0 });
  const [countdownToSuhoor, setCountdownToSuhoor] = useState({ h: 0, m: 0, s: 0 });
  const [ayyamAlBeed, setAyyamAlBeed] = useState<{ isAyyamAlBeed: boolean; hijriDay: number } | null>(null);
  const [locationEditorOpen, setLocationEditorOpen] = useState(false);
  const [showBreakFastDialog, setShowBreakFastDialog] = useState(false);
  const [showBreakFastConfirm, setShowBreakFastConfirm] = useState(false);
  const [datePopoverOpen, setDatePopoverOpen] = useState(false);
  const [statsDialog, setStatsDialog] = useState<"streak" | "total" | "sunnah" | "broken" | null>(null);
  const [scheduleOpen, setScheduleOpen] = useState(false);
  const [addFoodMeal, setAddFoodMeal] = useState<"suhoor" | "iftar" | null>(null);
  const [addFoodInputs, setAddFoodInputs] = useState({ name: "", cal: "", portions: "1" });
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
  const [dailyGoals] = useDailyGoals();
  const [quickActionOrder] = useDashboardQuickActions();
  const [journalEntries] = useLocalStorage<{ date: string; prompt?: string; content: string; gratitude?: string }[]>("tryramadan-journal", []);
  const iftarLabel = useIftarLabel();
  const iftarLabelShort = useIftarLabelShort();
  const suhoorLabelShort = useSuhoorLabelShort();
  
  const sunnahInfo = getSunnahFastingInfo();
  
  const selectedDayMeals = mealPlans[selectedDate];
  const selectedDayNutr = dayNutrition[selectedDate];
  const selectedDayJournal = journalEntries.find((e) => e.date === selectedDate);
  const selectedDayComplete = progress.completedDays.includes(selectedDate);
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
    const suhoorForTomorrow = imsakTomorrow ?? prayerTimes.imsak;
    if (displayTimezone) {
      const nowSeconds = getNowSecondsSinceMidnightInTimezone(displayTimezone);
      const imsakSeconds = timeStringToSecondsSinceMidnight(prayerTimes.imsak);
      const imsakTomorrowSeconds = timeStringToSecondsSinceMidnight(suhoorForTomorrow);
      const maghribSeconds = timeStringToSecondsSinceMidnight(prayerTimes.maghrib);
      const fasting = nowSeconds >= imsakSeconds && nowSeconds < maghribSeconds;
      setIsFasting(fasting);
      if (fasting) {
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
      const fasting = now >= imsakTime && now < maghribTarget;
      setIsFasting(fasting);
      if (fasting) {
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
  }, [prayerTimes, imsakTomorrow, displayTimezone, parseTimeToToday]);

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

  const submitAddFood = (mealType: "suhoor" | "iftar") => {
    const name = addFoodInputs.name.trim();
    const cal = parseInt(addFoodInputs.cal, 10) || 0;
    const portions = Math.max(0.1, parseFloat(addFoodInputs.portions) || 1);
    if (!name && cal <= 0) {
      toast.error("Add a name or at least one calorie so we can save this item.");
      return;
    }
    const day = normalizeDayFoodLog(foodLogs[selectedDate]);
    const entry = {
      id: `custom-${Date.now()}`,
      type: "custom" as const,
      mealType,
      name: name || "Custom",
      portions,
      caloriesPerPortion: cal,
      proteinPerPortion: undefined,
      carbsPerPortion: undefined,
      fatPerPortion: undefined,
    };
    setFoodLogs((prev) => {
      const d = normalizeDayFoodLog(prev[selectedDate]);
      const list = mealType === "suhoor" ? [...d.suhoor, entry] : [...d.iftar, entry];
      return { ...prev, [selectedDate]: { ...d, [mealType]: list } };
    });
    setAddFoodInputs({ name: "", cal: "", portions: "1" });
    setAddFoodMeal(null);
  };

  const todayComplete = progress.completedDays.includes(todayStr);
  const todaySkipped = (progress.skippedDays ?? []).includes(todayStr);
  const fastingToday = isFastingToday(progress, todayStr);
  const todayLog = getTodayFastingLog(progress, todayStr);
  const recentLog = (progress.fastingLog || []).slice(-7).reverse();
  const streak = calculateStreak(progress, todayStr);
  const totalDays = ramadanRange.totalDays;
  const completedInRange = progress.completedDays.filter((d) => d >= ramadanRange.startStr && d <= ramadanRange.endStr);
  const ramadanCompletionPct = totalDays > 0 ? Math.round((completedInRange.length / totalDays) * 100) : 0;
  const factDay = Math.min(30, Math.max(1, (new Date().getDate() % 30) || 30));
  const dailyFact = dailyFactsData.facts.find((f) => f.day === factDay) || dailyFactsData.facts[0];
  const badgeList = [
    { id: "first-fast", name: "First Fast", icon: "🌙", unlocked: progress.completedDays.length >= 1 },
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
          
          {/* Current Fast Status Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.08 }}
            className={`mb-4 p-4 sm:p-5 rounded-2xl border-2 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 ${
              isFasting ? "bg-primary/10 border-primary/30" : "bg-muted/50 border-border"
            }`}
          >
            <div className="flex items-start sm:items-center gap-3 min-w-0">
              <div className={`w-10 h-10 shrink-0 rounded-full flex items-center justify-center ${isFasting ? "bg-primary/20" : "bg-muted"}`}>
                {isFasting ? <Moon className="w-5 h-5 text-foreground" aria-hidden /> : <Sun className="w-5 h-5 text-muted-foreground" aria-hidden />}
              </div>
              <div className="min-w-0">
                <span className="inline-block px-2 py-0.5 rounded-full text-xs font-semibold mb-1.5 bg-background/80" aria-live="polite">
                  {isFasting ? "Right now: Fasting (no food or drink)" : "Right now: Eating window (you can eat)"}
                </span>
                <div className="flex items-center gap-2 flex-wrap">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <span className="font-semibold cursor-help border-b border-dotted border-transparent hover:border-muted-foreground/40 w-fit">
                        {isFasting ? "Currently fasting" : "Not fasting"}
                      </span>
                    </TooltipTrigger>
                    <TooltipContent className="max-w-xs p-3">
                      <p className="font-semibold text-sm">
                        {isFasting ? GENERAL_TOOLTIPS.fastingPeriod.title : "Not fasting"}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {isFasting ? GENERAL_TOOLTIPS.fastingPeriod.body : preferences.userType === "non-muslim"
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
                {isFasting ? (
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
                  className="block p-3 sm:p-4 rounded-2xl bg-card border border-border grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2 sm:gap-3 hover:border-secondary/50 transition-colors min-h-[72px] sm:min-h-0"
                >
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="cursor-help">
                        <span className="text-xs text-muted-foreground block">{suhoorLabelShort} end<span className="sm:hidden"> (Fajr)</span></span>
                        <span className="font-bold text-secondary">{prayerTimes.fajr}</span>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent className="max-w-xs p-3">
                      {preferences.userType === "non-muslim" ? (
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
                      <div className="cursor-help">
                        <span className="text-xs text-muted-foreground block">{iftarLabel}<span className="sm:hidden"> (Maghrib)</span></span>
                        <span className="font-bold text-secondary">{prayerTimes.maghrib}</span>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent className="max-w-xs p-3">
                      <p className="text-sm text-foreground">{EATING_TIME_TOOLTIPS.iftar.body}</p>
                      <p className="text-xs text-muted-foreground mt-2 pt-2 border-t border-border/50">Arabic: <span className="font-arabic" dir="rtl">{(EATING_TIME_TOOLTIPS.iftar as { bodyAr?: string }).bodyAr}</span></p>
                    </TooltipContent>
                  </Tooltip>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="cursor-help hidden sm:block">
                        <span className="text-xs text-muted-foreground block">Fajr</span>
                        <span className="font-medium">{prayerTimes.fajr}</span>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent className="max-w-xs p-3">
                      <p className="text-sm text-foreground">{EATING_TIME_TOOLTIPS.fajr.body}</p>
                      <p className="text-xs text-muted-foreground mt-2 pt-2 border-t border-border/50">Arabic: <span className="font-arabic" dir="rtl">{(EATING_TIME_TOOLTIPS.fajr as { bodyAr?: string }).bodyAr}</span></p>
                    </TooltipContent>
                  </Tooltip>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="cursor-help hidden sm:block">
                        <span className="text-xs text-muted-foreground block">Maghrib</span>
                        <span className="font-medium">{prayerTimes.maghrib}</span>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent className="max-w-xs p-3">
                      <p className="text-sm text-foreground">{EATING_TIME_TOOLTIPS.maghrib.body}</p>
                      <p className="text-xs text-muted-foreground mt-2 pt-2 border-t border-border/50">Arabic: <span className="font-arabic" dir="rtl">{(EATING_TIME_TOOLTIPS.maghrib as { bodyAr?: string }).bodyAr}</span></p>
                    </TooltipContent>
                  </Tooltip>
                </Link>
                <div className="flex flex-wrap items-center gap-2">
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
                            {preferences.userType === "non-muslim"
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
                          <span className="text-xs text-muted-foreground font-normal truncate">
                            Next: {nextPrayer.name} {nextPrayer.time}
                            {nextPrayer.isTomorrow && " (tomorrow)"}
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
                <p className="text-sm text-muted-foreground">Log that you broke your fast early. Choose a reason.</p>
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
            <BreakFastReasonDialog
              open={showBreakFastDialog}
              onOpenChange={setShowBreakFastDialog}
              onSelectReason={(reasonId) => breakFastingToday(progress, setProgress, reasonId, todayStr)}
              userType={preferences.userType}
            />
            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
              <DailyMissionsCard />
            </div>
          </motion.div>
          
          {/* Quick Actions Grid — Streak, Total, Sunnah, Broken (click to see days) */}
          {(() => {
            const streakDaysList = getStreakDays(progress, todayStr);
            const totalDaysList = [...progress.completedDays].sort().reverse();
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
                              to="/dashboard/schedule"
                              state={{ date: dateStr }}
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
                className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8"
              >
                {/* Streak — hidden when showStreakAndAchievements is off */}
                {preferences.showStreakAndAchievements !== false && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        type="button"
                        onClick={() => streak > 0 && setStatsDialog("streak")}
                        className="p-3 sm:p-4 rounded-2xl bg-card border border-border min-h-[100px] sm:min-h-0 flex flex-col items-center justify-center hover:border-secondary/50 transition-colors text-left w-full"
                      >
                        <div className="flex flex-col items-center gap-2">
                          <div className="w-10 h-10 rounded-full bg-gradient-gold flex items-center justify-center">
                            <Flame className="w-5 h-5 text-foreground" />
                          </div>
                          <span className="text-xl sm:text-2xl font-bold text-secondary">{streak}</span>
                          <span className="text-xs text-muted-foreground">Day Streak</span>
                        </div>
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
                      className="p-3 sm:p-4 rounded-2xl bg-card border border-border min-h-[100px] sm:min-h-0 flex flex-col items-center justify-center hover:border-secondary/50 transition-colors text-left w-full"
                    >
                      <div className="flex flex-col items-center gap-2">
                        <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                          <Calendar className="w-5 h-5 text-foreground" />
                        </div>
                        <span className="text-xl sm:text-2xl font-bold">{progress.completedDays.length}</span>
                        <span className="text-xs text-muted-foreground">Total Days</span>
                      </div>
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
                      onClick={() => progress.sunnahDaysCompleted > 0 && setStatsDialog("sunnah")}
                      className="p-3 sm:p-4 rounded-2xl bg-card border border-border min-h-[100px] sm:min-h-0 flex flex-col items-center justify-center hover:border-secondary/50 transition-colors text-left w-full"
                    >
                      <div className="flex flex-col items-center gap-2">
                        <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                          <Moon className="w-5 h-5 text-foreground" aria-hidden />
                        </div>
                        <span className="text-xl sm:text-2xl font-bold">{progress.sunnahDaysCompleted}</span>
                        <span className="text-xs text-muted-foreground">Sunnah Days</span>
                      </div>
                    </button>
                  </TooltipTrigger>
                  <TooltipContent className="max-w-xs p-3">
                    <p>{progress.sunnahDaysCompleted > 0 ? "Click to see which days" : "Voluntary (Mon/Thu) days completed."}</p>
                  </TooltipContent>
                </Tooltip>

                {/* Broken fast days */}
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      type="button"
                      onClick={() => brokenDaysList.length > 0 && setStatsDialog("broken")}
                      className="p-3 sm:p-4 rounded-2xl bg-card border border-border min-h-[100px] sm:min-h-0 flex flex-col items-center justify-center hover:border-secondary/50 transition-colors text-left w-full"
                    >
                      <div className="flex flex-col items-center gap-2">
                        <div className="w-10 h-10 rounded-full bg-destructive/20 flex items-center justify-center">
                          <AlertTriangle className="w-5 h-5 text-destructive" aria-hidden />
                        </div>
                        <span className="text-xl sm:text-2xl font-bold text-destructive">{brokenDaysList.length}</span>
                        <span className="text-xs text-muted-foreground">Broken fast</span>
                      </div>
                    </button>
                  </TooltipTrigger>
                  <TooltipContent className="max-w-xs p-3">
                    <p>{brokenDaysList.length > 0 ? "Click to see which days" : "Days you broke fast early."}</p>
                    {excusedDaysList.length > 0 && (
                      <p className="text-xs text-muted-foreground mt-1">{excusedDaysList.length} of these are excused (e.g. illness, travel).</p>
                    )}
                  </TooltipContent>
                </Tooltip>
              </motion.div>
              <p className="text-xs text-muted-foreground text-center mb-4 -mt-2">
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

            {/* Day view: meal plan, calories, prayer times, journal for selected day */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.18 }}
              className="mb-8 p-4 sm:p-6 rounded-2xl bg-card border border-border"
            >
              <Tooltip>
                <TooltipTrigger asChild>
                  <h2 className="font-display font-bold mb-4 flex items-center gap-2 cursor-help w-fit border-b border-dotted border-transparent hover:border-muted-foreground/40">
                    <Calendar className="w-5 h-5 text-secondary" />
                    {isSelectedToday ? "Today's plan" : "Day plan"} · {selectedDateObj.toLocaleDateString("en", { month: "short", day: "numeric" })}
                  </h2>
                </TooltipTrigger>
                <TooltipContent className="max-w-xs">
                  <p className="font-medium">Log what you ate and optional daily totals</p>
                  <p className="text-xs mt-1">Use + to add items for {suhoorLabelShort} and {iftarLabel}. View all items and totals on the Schedule page. Optionally enter calories and macros below.</p>
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
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4 p-3 rounded-xl bg-muted/50">
                  <div>
                    <span className="text-xs text-muted-foreground block">{suhoorLabelShort} ends (Fajr)</span>
                    <span className="font-bold text-secondary">{selectedDayPrayerTimes.fajr}</span>
                  </div>
                  <div>
                    <span className="text-xs text-muted-foreground block">{iftarLabel} (Maghrib)</span>
                    <span className="font-bold text-secondary">{selectedDayPrayerTimes.maghrib}</span>
                  </div>
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
                              onClick={() => setAddFoodMeal(meal)}
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

              {/* Add food dialog */}
              <Dialog open={addFoodMeal != null} onOpenChange={(open) => !open && setAddFoodMeal(null)}>
                <DialogContent className="max-w-sm">
                  <DialogTitle>Add to {addFoodMeal === "suhoor" ? suhoorLabelShort : iftarLabel}</DialogTitle>
                  <p className="text-xs text-muted-foreground">What did you eat? Add name and optional calories.</p>
                  <div className="grid gap-2 pt-2">
                    <Input
                      placeholder="e.g. Oats & dates"
                      value={addFoodInputs.name}
                      onChange={(e) => setAddFoodInputs((p) => ({ ...p, name: e.target.value }))}
                    />
                    <div className="flex gap-2">
                      <Input
                        type="number"
                        min={0}
                        max={CALORIE_MAX}
                        placeholder="Cal (optional)"
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
                    </div>
                  </div>
                  <div className="flex gap-2 justify-end pt-2">
                    <Button type="button" variant="outline" size="sm" onClick={() => { setAddFoodMeal(null); setAddFoodInputs({ name: "", cal: "", portions: "1" }); }}>
                      Cancel
                    </Button>
                    <Button type="button" size="sm" onClick={() => addFoodMeal && submitAddFood(addFoodMeal)}>
                      Add
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>

              {/* Calorie / nutrition for day — optional totals with tooltips on how to track */}
              <div className="mb-4">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span className="text-xs font-medium text-muted-foreground block mb-2 cursor-help border-b border-dotted border-transparent hover:border-muted-foreground/40 w-fit">
                      Calories & macros (optional)
                    </span>
                  </TooltipTrigger>
                  <TooltipContent className="max-w-xs">
                    <p className="font-medium">How to track</p>
                    <p className="text-xs mt-1">Use the + buttons above to log what you ate for {suhoorLabelShort} and Iftar; items and totals appear on the Schedule page. Or enter manual daily totals here.</p>
                  </TooltipContent>
                </Tooltip>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="cursor-help">
                        <input
                          type="number"
                          min={0}
                          max={CALORIE_MAX}
                          placeholder="Cal"
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
                          className="w-full px-2 py-1.5 rounded-lg border border-border bg-background text-sm"
                        />
                        <span className="text-[10px] text-muted-foreground">/ {dailyGoals.calories} goal</span>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent className="max-w-xs">
                      <p className="font-medium">Calories</p>
                      <p className="text-xs mt-1">Daily energy intake. Log items with + above for automatic totals on Schedule, or enter a number here.</p>
                    </TooltipContent>
                  </Tooltip>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="cursor-help">
                        <input
                          type="number"
                          min={0}
                          placeholder="P"
                          value={selectedDayNutr?.protein ?? ""}
                          onChange={(e) =>
                            setDayNutrition((prev) => ({
                              ...prev,
                              [selectedDate]: {
                                ...(prev[selectedDate] || {}),
                                protein: e.target.value ? Number(e.target.value) : undefined,
                              },
                            }))
                          }
                          className="w-full px-2 py-1.5 rounded-lg border border-border bg-background text-sm"
                        />
                        <span className="text-[10px] text-muted-foreground">/ {dailyGoals.protein}g</span>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent className="max-w-xs">
                      <p className="font-medium">Protein (g)</p>
                      <p className="text-xs mt-1">Macro in grams. Log foods above to build totals on Schedule, or enter your daily total here.</p>
                    </TooltipContent>
                  </Tooltip>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="cursor-help">
                        <input
                          type="number"
                          min={0}
                          placeholder="C"
                          value={selectedDayNutr?.carbs ?? ""}
                          onChange={(e) =>
                            setDayNutrition((prev) => ({
                              ...prev,
                              [selectedDate]: {
                                ...(prev[selectedDate] || {}),
                                carbs: e.target.value ? Number(e.target.value) : undefined,
                              },
                            }))
                          }
                          className="w-full px-2 py-1.5 rounded-lg border border-border bg-background text-sm"
                        />
                        <span className="text-[10px] text-muted-foreground">/ {dailyGoals.carbs}g</span>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent className="max-w-xs">
                      <p className="font-medium">Carbs (g)</p>
                      <p className="text-xs mt-1">Carbohydrates in grams. Track via logged items on Schedule or enter daily total here.</p>
                    </TooltipContent>
                  </Tooltip>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="cursor-help">
                        <input
                          type="number"
                          min={0}
                          placeholder="F"
                          value={selectedDayNutr?.fat ?? ""}
                          onChange={(e) =>
                            setDayNutrition((prev) => ({
                              ...prev,
                              [selectedDate]: {
                                ...(prev[selectedDate] || {}),
                                fat: e.target.value ? Number(e.target.value) : undefined,
                              },
                            }))
                          }
                          className="w-full px-2 py-1.5 rounded-lg border border-border bg-background text-sm"
                        />
                        <span className="text-[10px] text-muted-foreground">/ {dailyGoals.fat}g</span>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent className="max-w-xs">
                      <p className="font-medium">Fat (g)</p>
                      <p className="text-xs mt-1">Fat in grams. Log items above for per-meal tracking on Schedule, or enter daily total here.</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
              </div>

              {/* Journal for day */}
              <div className="mb-4">
                <span className="text-xs font-medium text-muted-foreground block mb-1">Journal</span>
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
                    : !isSelectedToday
                      ? "Mark this day as completed if you fasted it (e.g. make-up day)."
                      : selectedDayComplete
                        ? "Logged: you fasted this day (dawn to sunset)"
                        : "Did you fast this day from dawn to sunset?"}
                </span>
                {selectedDate <= todayStr ? (
                  <button
                    type="button"
                    onClick={() => setDayCompleted(progress, setProgress, selectedDate, !selectedDayComplete)}
                    aria-label={selectedDayComplete ? `Undo fast for ${selectedDate}` : `Mark ${selectedDate} as fasted`}
                    className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-colors shrink-0 min-h-[44px] touch-manipulation ${
                      selectedDayComplete ? "bg-secondary/20 text-secondary border border-secondary/40" : "bg-muted hover:bg-muted/80"
                    }`}
                  >
                    {selectedDayComplete ? "Yes, logged ✓" : "Yes, mark complete"}
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
            <div className="p-4 rounded-2xl bg-card border border-border flex flex-col items-center">
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

          {/* Quick action: Emergency break fast */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.22 }} className="mb-6">
            <Link
              to="/emergency"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border-2 border-destructive/50 text-destructive hover:bg-destructive/10 transition-colors text-sm font-medium"
            >
              <AlertTriangle className="w-4 h-4" />
              Emergency: break fast
            </Link>
          </motion.div>

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
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2">
              {(() => {
                const byId = new Map(DASHBOARD_QUICK_ACTIONS.map((a) => [a.id, a]));
                return quickActionOrder
                  .filter((id) => id !== "macros" || (preferences.macroTrackingEnabled ?? false))
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
                <Link
                  to="/dashboard/prayers"
                  className="font-display font-bold flex items-center gap-2 hover:text-secondary transition-colors"
                >
                  <Clock className="w-5 h-5 text-secondary" />
                  Today&apos;s Prayer Times
                </Link>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2 sm:gap-3">
                {[
                  { name: 'Fajr', nameAr: 'الفجر', time: prayerTimes.fajr, highlight: true, Icon: Sunrise },
                  { name: 'Sunrise', nameAr: 'الشروق', time: prayerTimes.sunrise, Icon: Sun },
                  { name: 'Dhuhr', nameAr: 'الظهر', time: prayerTimes.dhuhr, Icon: Sun },
                  { name: 'Asr', nameAr: 'العصر', time: prayerTimes.asr, Icon: SunDim },
                  { name: 'Maghrib', nameAr: 'المغرب', time: prayerTimes.maghrib, highlight: true, Icon: Sunset },
                  { name: 'Isha', nameAr: 'العشاء', time: prayerTimes.isha, Icon: Moon },
                ].map((prayer) => {
                  const PrayerIcon = prayer.Icon;
                  return (
                  <Tooltip key={prayer.name}>
                    <TooltipTrigger asChild>
                      <div className={`p-3 rounded-xl text-center ${
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
                      {prayer.name === 'Fajr' && (
                        <>
                          <p className="font-semibold text-sm">{EATING_TIME_TOOLTIPS.fajr.title}</p>
                          <p className="text-xs text-muted-foreground mt-1">{EATING_TIME_TOOLTIPS.fajr.body}</p>
                        </>
                      )}
                      {prayer.name === 'Maghrib' && (
                        <>
                          <p className="font-semibold text-sm">{EATING_TIME_TOOLTIPS.maghrib.title}</p>
                          <p className="text-xs text-muted-foreground mt-1">{EATING_TIME_TOOLTIPS.maghrib.body}</p>
                        </>
                      )}
                      {!['Fajr', 'Maghrib'].includes(prayer.name) && (
                        <p className="text-sm">{prayer.name} prayer time</p>
                      )}
                    </TooltipContent>
                  </Tooltip>
                  );
                })}
              </div>
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
          
          {/* Daily Hadith */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mb-8"
          >
            <DailyHadith />
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
                const isToday = i === 6;
                const dayName = date.toLocaleDateString('en', { weekday: 'short' });
                
                return (
                  <Tooltip key={i}>
                    <TooltipTrigger asChild>
                      <div className={`flex-1 p-2 rounded-xl text-center cursor-default ${
                        isToday ? 'ring-2 ring-secondary' : ''
                      } ${isComplete ? 'bg-secondary/20' : 'bg-muted/50'}`}>
                        <span className="text-xs text-muted-foreground block">{dayName}</span>
                        <span className="text-sm font-bold block">{date.getDate()}</span>
                        {isComplete && <Check className="w-3 h-3 text-secondary mx-auto mt-1" />}
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      {isComplete ? 'Fast completed ✓' : isToday ? 'Today' : 'Not fasted'}
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
