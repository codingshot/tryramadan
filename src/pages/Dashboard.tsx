import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate, Link } from "react-router-dom";
import { 
  Moon, Sun, Sunrise, Sunset, SunDim, Clock, Calendar, MapPin, Settings, 
  TrendingUp, Check, Bell, ChevronRight, Flame, ChevronLeft,
  Utensils, Coffee, Droplets, BookOpen, Target, PenLine,
  AlertTriangle, Trophy, HelpCircle
} from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { FastingTimer } from "@/components/FastingTimer";
import { ProgressRing } from "@/components/ProgressRing";
import dailyFactsData from "@/data/daily-facts.json";
import { SunnahFastingBadge } from "@/components/SunnahFastingBadge";
import { DailyHadith } from "@/components/DailyHadith";
import { DailyMissionsCard } from "@/components/DailyMissionsCard";
import { TodayScheduleTimeline } from "@/components/TodayScheduleTimeline";
import { LocationDisplay } from "@/components/LocationDisplay";
import { PrayerLocationBadge } from "@/components/PrayerLocationBadge";
import { PWAInstallBanner } from "@/components/PWAInstallBanner";
import { GoalsUntilRamadanCard } from "@/components/GoalsUntilRamadanCard";
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
  useDayMealPlans,
  useDayNutrition,
  useDailyGoals,
  useDashboardQuickActions,
  DASHBOARD_QUICK_ACTIONS,
  useLocalStorage,
  useIftarLabel,
  useIftarLabelShort,
} from "@/hooks/useLocalStorage";
import { BreakFastReasonDialog } from "@/components/BreakFastReasonDialog";
import { usePrayerTimes, usePrayerTimesForDate, getSunnahFastingInfo, checkAyyamAlBeed } from "@/hooks/usePrayerTimes";
import { useAutoLocation } from "@/hooks/useLocation";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { EATING_TIME_TOOLTIPS } from "@/data/eating-times-tooltips";
import { Footer } from "@/components/Footer";
import { PageSEO } from "@/components/PageSEO";

const Dashboard = () => {
  const navigate = useNavigate();
  const [preferences, setPreferences] = useUserPreferences();
  const [progress, setProgress] = useFastingProgress();

  // Redirect to onboarding if not yet completed
  useEffect(() => {
    if (!preferences.onboardingComplete) {
      navigate("/onboarding/welcome", { replace: true });
    }
  }, [preferences.onboardingComplete, navigate]);

  const [isFasting, setIsFasting] = useState(true);
  const [ayyamAlBeed, setAyyamAlBeed] = useState<{ isAyyamAlBeed: boolean; hijriDay: number } | null>(null);
  const [locationEditorOpen, setLocationEditorOpen] = useState(false);
  const [showBreakFastDialog, setShowBreakFastDialog] = useState(false);
  const todayStr = new Date().toISOString().split("T")[0];
  const [selectedDate, setSelectedDate] = useState(todayStr);
  
  // Auto-detect location if not set
  const { location: autoLocation, loading: locationLoading } = useAutoLocation();
  
  // Use saved location or auto-detected
  const locationCoords = preferences.locationCoords || 
    (autoLocation ? { lat: autoLocation.lat, lng: autoLocation.lng } : null);
  
  // Get prayer times (today)
  const { prayerTimes, hijriDate, loading: timesLoading } = usePrayerTimes(
    locationCoords?.lat || null,
    locationCoords?.lng || null
  );
  // Prayer times for selected day (for day view)
  const { prayerTimes: selectedDayPrayerTimes } = usePrayerTimesForDate(
    locationCoords?.lat || null,
    locationCoords?.lng || null,
    selectedDate
  );
  
  const [mealPlans, setMealPlans] = useDayMealPlans();
  const [dayNutrition, setDayNutrition] = useDayNutrition();
  const [dailyGoals] = useDailyGoals();
  const [quickActionOrder] = useDashboardQuickActions();
  const [journalEntries] = useLocalStorage<{ date: string; prompt?: string; content: string; gratitude?: string }[]>("tryramadan-journal", []);
  const iftarLabel = useIftarLabel();
  const iftarLabelShort = useIftarLabelShort();
  
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
    setSelectedDate(d.toISOString().split("T")[0]);
  };
  const goNextDay = () => {
    const d = new Date(selectedDate + "T12:00:00");
    d.setDate(d.getDate() + 1);
    setSelectedDate(d.toISOString().split("T")[0]);
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
  
  // Determine if currently fasting based on time
  useEffect(() => {
    if (prayerTimes) {
      const now = new Date();
      const [fajrH, fajrM] = prayerTimes.fajr.split(':').map(Number);
      const [maghribH, maghribM] = prayerTimes.maghrib.split(':').map(Number);
      
      const fajrTime = new Date();
      fajrTime.setHours(fajrH, fajrM, 0);
      
      const maghribTime = new Date();
      maghribTime.setHours(maghribH, maghribM, 0);
      
      setIsFasting(now >= fajrTime && now < maghribTime);
    }
  }, [prayerTimes]);
  
  // Calculate streak
  const calculateStreak = () => {
    const today = new Date().toISOString().split('T')[0];
    const completedDays = progress.completedDays.sort().reverse();
    
    let streak = 0;
    let currentDate = new Date();
    
    for (const day of completedDays) {
      const dayStr = new Date(currentDate).toISOString().split('T')[0];
      if (day === dayStr) {
        streak++;
        currentDate.setDate(currentDate.getDate() - 1);
      } else {
        break;
      }
    }
    
    return streak;
  };
  
  // Toggle today's fast as complete (uses fasting log + console)
  const toggleTodayComplete = () => {
    const today = new Date().toISOString().split('T')[0];
    const isComplete = progress.completedDays.includes(today);

    if (isComplete) {
      uncompleteFastingToday(progress, setProgress);
    } else {
      completeFastingToday(progress, setProgress);
    }
  };

  const todayComplete = progress.completedDays.includes(new Date().toISOString().split('T')[0]);
  const fastingToday = isFastingToday(progress);
  const todayLog = getTodayFastingLog(progress);
  const recentLog = (progress.fastingLog || []).slice(-7).reverse();
  const streak = calculateStreak();
  const totalDays = 30;
  const ramadanCompletionPct = Math.round((progress.completedDays.length / totalDays) * 100);
  const factDay = Math.min(30, Math.max(1, (new Date().getDate() % 30) || 30));
  const dailyFact = dailyFactsData.facts.find((f) => f.day === factDay) || dailyFactsData.facts[0];
  const badgeList = [
    { id: "first-fast", name: "First Fast", icon: "🌙", unlocked: progress.completedDays.length >= 1 },
    { id: "week-one", name: "Week One", icon: "⭐", unlocked: progress.completedDays.length >= 7 },
    { id: "halfway", name: "Halfway", icon: "🏅", unlocked: progress.completedDays.length >= 15 },
    { id: "streak-5", name: "5-day streak", icon: "🔥", unlocked: streak >= 5 },
    { id: "full-month", name: "Ramadan Champion", icon: "🏆", unlocked: progress.completedDays.length >= 30 },
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

  if (!preferences.onboardingComplete) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <PageSEO
        title="Dashboard | TryRamadan.app"
        description={`Your Ramadan fasting dashboard: timer, prayer times, daily goals, and progress. Track suhoor and ${iftarLabelShort}, log fasting days, and stay on track.`}
        path="/dashboard"
      />
      <Navbar />
      
      <main className="main-content">
        <div className="container mx-auto px-4 min-w-0 max-w-5xl">
          {/* Header */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-2xl md:text-3xl font-display font-bold">
                  {preferences.userType === 'muslim' ? 'Ramadan Mubarak' : 'Your Fasting Journey'}
                  <span className="block font-arabic text-lg text-secondary mt-1">
                    {preferences.userType === 'muslim' ? 'رمضان مبارك' : 'رحلة صيامك'}
                  </span>
                </h1>
              </div>
              
              <Tooltip>
                <TooltipTrigger asChild>
                  <Link to="/settings" className="p-2 rounded-full hover:bg-muted transition-colors">
                    <Settings className="w-5 h-5 text-muted-foreground" />
                  </Link>
                </TooltipTrigger>
                <TooltipContent>Settings • الإعدادات</TooltipContent>
              </Tooltip>
            </div>
            
            {/* PWA install prompt (when installable and not dismissed) */}
            <PWAInstallBanner />

            {/* Location display with edit option — click anywhere to update */}
            <div className="flex flex-wrap items-center gap-2">
              <LocationDisplay
                showTimezone
                open={locationEditorOpen}
                onOpenChange={setLocationEditorOpen}
              />
              {(locationLoading || timesLoading) && (
                <span className="text-xs text-muted-foreground animate-pulse">updating...</span>
              )}
            </div>

            {/* Day selector — arrows, then date with "Go to today" next to it */}
            <div className="flex flex-wrap items-center justify-between gap-2 mt-4 p-3 rounded-xl bg-muted/50 border border-border">
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={goPrevDay}
                  className="p-2 rounded-lg hover:bg-muted transition-colors"
                  aria-label="Previous day"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  type="button"
                  onClick={goNextDay}
                  className="p-2 rounded-lg hover:bg-muted transition-colors"
                  aria-label="Next day"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-display font-semibold">
                  {selectedDateObj.toLocaleDateString("en", { weekday: "short", month: "short", day: "numeric", year: "numeric" })}
                </span>
                {isSelectedToday ? (
                  <span className="px-2 py-0.5 rounded-full bg-secondary/20 text-secondary text-xs font-medium">Today</span>
                ) : (
                  <button
                    type="button"
                    onClick={goToToday}
                    className="px-3 py-1.5 rounded-lg bg-primary/20 text-foreground text-sm font-medium hover:bg-primary/30"
                  >
                    Go to today's date
                  </button>
                )}
              </div>
            </div>
          </motion.div>
          
          {/* Current Fast Status Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.08 }}
            className={`mb-4 p-4 rounded-2xl border-2 flex items-center justify-between flex-wrap gap-2 ${
              isFasting ? "bg-primary/10 border-primary/30" : "bg-muted/50 border-border"
            }`}
          >
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${isFasting ? "bg-primary/20" : "bg-muted"}`}>
                {isFasting ? <Moon className="w-5 h-5 text-foreground" aria-hidden /> : <Sun className="w-5 h-5 text-muted-foreground" aria-hidden />}
              </div>
              <div>
                <span className="font-semibold block">{isFasting ? "Currently fasting" : "Not fasting"}</span>
                <span className="text-sm text-muted-foreground">
                  {isFasting ? `Countdown to ${iftarLabel} below` : "Next: Suhoor — see timer below"}
                </span>
              </div>
            </div>
            {prayerTimes && (
              <div className="text-sm text-muted-foreground flex flex-wrap gap-x-4 gap-y-1 items-center">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span className="cursor-help border-b border-dotted border-muted-foreground/40">Suhoor: {prayerTimes.imsak}</span>
                  </TooltipTrigger>
                  <TooltipContent className="max-w-xs p-3">
                    <p className="font-semibold text-sm">{EATING_TIME_TOOLTIPS.suhoor.title}</p>
                    <p className="text-xs text-muted-foreground mt-1">{EATING_TIME_TOOLTIPS.suhoor.body}</p>
                    <p className="font-arabic text-xs text-muted-foreground mt-1" dir="rtl">{(EATING_TIME_TOOLTIPS.suhoor as { bodyAr?: string }).bodyAr}</p>
                  </TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span className="cursor-help border-b border-dotted border-muted-foreground/40">{iftarLabel}: {prayerTimes.maghrib}</span>
                  </TooltipTrigger>
                  <TooltipContent className="max-w-xs p-3">
                    <p className="font-semibold text-sm">{EATING_TIME_TOOLTIPS.iftar.title}</p>
                    <p className="text-xs text-muted-foreground mt-1">{EATING_TIME_TOOLTIPS.iftar.body}</p>
                    <p className="font-arabic text-xs text-muted-foreground mt-1" dir="rtl">{(EATING_TIME_TOOLTIPS.iftar as { bodyAr?: string }).bodyAr}</p>
                  </TooltipContent>
                </Tooltip>
                <PrayerLocationBadge onClickToUpdate={() => setLocationEditorOpen(true)} />
              </div>
            )}
          </motion.div>

          {/* Today's Schedule: overview strip + full timeline */}
          {prayerTimes && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.09 }}
              className="mb-4 grid grid-cols-1 lg:grid-cols-3 gap-4"
            >
              <Link
                to="/dashboard/schedule"
                className="block p-3 sm:p-4 rounded-2xl bg-card border border-border grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2 sm:gap-3 hover:border-secondary/50 transition-colors min-h-[72px] sm:min-h-0 lg:col-span-2"
              >
                {/* Mobile: 2 cells — Suhoor end (Fajr) and Iftar (Maghrib). Desktop: 4 cells. */}
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="cursor-help">
                      <span className="text-xs text-muted-foreground block">Suhoor end<span className="sm:hidden"> (Fajr)</span></span>
                      <span className="font-bold text-secondary">{prayerTimes.fajr}</span>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent className="max-w-xs p-3">
                    <p className="font-semibold text-sm">{EATING_TIME_TOOLTIPS.suhoorEnds.title}</p>
                    <p className="text-xs text-muted-foreground mt-1">{EATING_TIME_TOOLTIPS.suhoorEnds.body}</p>
                    <p className="font-arabic text-xs text-muted-foreground mt-1" dir="rtl">{(EATING_TIME_TOOLTIPS.suhoorEnds as { bodyAr?: string }).bodyAr}</p>
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
                    <p className="font-semibold text-sm">{EATING_TIME_TOOLTIPS.iftar.title}</p>
                    <p className="text-xs text-muted-foreground mt-1">{EATING_TIME_TOOLTIPS.iftar.body}</p>
                    <p className="font-arabic text-xs text-muted-foreground mt-1" dir="rtl">{(EATING_TIME_TOOLTIPS.iftar as { bodyAr?: string }).bodyAr}</p>
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
                    <p className="font-semibold text-sm">{EATING_TIME_TOOLTIPS.fajr.title}</p>
                    <p className="text-xs text-muted-foreground mt-1">{EATING_TIME_TOOLTIPS.fajr.body}</p>
                    <p className="font-arabic text-xs text-muted-foreground mt-1" dir="rtl">{(EATING_TIME_TOOLTIPS.fajr as { bodyAr?: string }).bodyAr}</p>
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
                    <p className="font-semibold text-sm">{EATING_TIME_TOOLTIPS.maghrib.title}</p>
                    <p className="text-xs text-muted-foreground mt-1">{EATING_TIME_TOOLTIPS.maghrib.body}</p>
                    <p className="font-arabic text-xs text-muted-foreground mt-1" dir="rtl">{(EATING_TIME_TOOLTIPS.maghrib as { bodyAr?: string }).bodyAr}</p>
                  </TooltipContent>
                </Tooltip>
              </Link>
              <TodayScheduleTimeline
                prayerTimes={prayerTimes}
                iftarLabelShort={iftarLabelShort}
                includeTaraweeh
                className="lg:col-span-1"
              />
            </motion.div>
          )}

          {/* Main Timer Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-8"
          >
            {/* Quick actions: I'm fasting (at suhoor) — Break my fast only when currently fasting */}
            {(() => {
              const now = new Date();
              const imsakToday = prayerTimes?.imsak
                ? (() => { const d = new Date(); const [h, m] = prayerTimes.imsak.split(':').map(Number); d.setHours(h, m, 0, 0); return d; })()
                : null;
              const maghribToday = prayerTimes?.maghrib
                ? (() => { const d = new Date(); const [h, m] = prayerTimes.maghrib.split(':').map(Number); d.setHours(h, m, 0, 0); return d; })()
                : null;
              const isSuhoorWindow = imsakToday ? now < imsakToday : false;
              const isIftarWindow = maghribToday ? now >= maghribToday : false;
              return (
                <div className={`mb-4 grid grid-cols-1 gap-2 sm:gap-3 ${fastingToday ? 'sm:grid-cols-2' : ''}`}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        onClick={() => !fastingToday && !todayComplete && startFastingToday(progress, setProgress)}
                        disabled={fastingToday || todayComplete}
                        className={`w-full py-3 px-3 sm:px-4 rounded-xl border-2 transition-all flex flex-col sm:flex-row items-center justify-center gap-1.5 sm:gap-2 min-h-[52px] ${!fastingToday ? 'sm:max-w-full' : ''} ${
                          fastingToday || todayComplete
                            ? 'border-border bg-muted/50 text-muted-foreground cursor-not-allowed'
                            : isSuhoorWindow
                              ? 'bg-primary border-primary text-primary-foreground hover:bg-primary/90'
                              : 'border-border bg-card hover:border-secondary hover:bg-muted/50'
                        }`}
                      >
                        <Sunrise className="w-5 h-5 shrink-0" aria-hidden />
                        <span className="text-sm font-medium text-center">I'm fasting</span>
                        <span className="text-xs opacity-80 hidden sm:inline">After suhoor</span>
                      </button>
                    </TooltipTrigger>
                    <TooltipContent side="top" className="max-w-xs p-3">
                      <p className="font-semibold text-sm">I'm fasting (after suhoor) • أنا صائم بعد السحور</p>
                      <p className="text-xs text-muted-foreground mt-1">Tap when you've finished suhoor and started your fast. {EATING_TIME_TOOLTIPS.suhoorEnds.body}</p>
                      <p className="font-arabic text-xs text-muted-foreground mt-1" dir="rtl">{(EATING_TIME_TOOLTIPS.suhoorEnds as { bodyAr?: string }).bodyAr}</p>
                    </TooltipContent>
                  </Tooltip>
                  {fastingToday && (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button
                          type="button"
                          onClick={() => setShowBreakFastDialog(true)}
                          className={`w-full py-3 px-3 sm:px-4 rounded-xl border-2 transition-all flex flex-col sm:flex-row items-center justify-center gap-1.5 sm:gap-2 min-h-[52px] ${
                            isIftarWindow
                              ? 'border-destructive/60 bg-destructive/20 text-destructive hover:bg-destructive/30'
                              : 'border-destructive/40 bg-destructive/10 text-destructive hover:bg-destructive/20'
                          }`}
                        >
                          <Sunset className="w-5 h-5 shrink-0" aria-hidden />
                          <span className="text-sm font-medium text-center">Break my fast</span>
                          <span className="text-xs opacity-80 hidden sm:inline">At {iftarLabelShort}</span>
                        </button>
                      </TooltipTrigger>
                      <TooltipContent side="top" className="max-w-xs p-3">
                        <p className="font-semibold text-sm">Break my fast (at {iftarLabelShort}) • أفطر عند المغرب</p>
                        <p className="text-xs text-muted-foreground mt-1">Tap when you're breaking your fast at Maghrib (or early). Choose a reason to log. {EATING_TIME_TOOLTIPS.iftar.body}</p>
                        <p className="font-arabic text-xs text-muted-foreground mt-1" dir="rtl">{(EATING_TIME_TOOLTIPS.iftar as { bodyAr?: string }).bodyAr}</p>
                      </TooltipContent>
                    </Tooltip>
                  )}
                </div>
              );
            })()}
            {fastingToday && todayLog && (
              <div className="mb-4 py-2.5 px-4 rounded-xl bg-secondary/20 border border-secondary/40 text-center text-sm">
                <span className="font-medium text-secondary">You're fasting</span>
                <span className="text-muted-foreground ml-2">
                  (started {new Date(todayLog.startedAt).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })})
                </span>
              </div>
            )}
            <BreakFastReasonDialog
              open={showBreakFastDialog}
              onOpenChange={setShowBreakFastDialog}
              onSelectReason={(reasonId) => breakFastingToday(progress, setProgress, reasonId)}
            />
            <FastingTimer 
              suhoorTime={prayerTimes?.imsak} 
              iftarTime={prayerTimes?.maghrib}
              isFasting={isFasting}
            />
            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
              <DailyMissionsCard />
            </div>
          </motion.div>
          
          {/* Quick Actions Grid */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8"
          >
            {/* Mark Complete = log that you completed today's dawn-to-sunset fast */}
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={toggleTodayComplete}
                  className={`p-3 sm:p-4 rounded-2xl border-2 transition-all min-h-[100px] sm:min-h-0 ${
                    todayComplete 
                      ? 'bg-secondary/20 border-secondary' 
                      : 'bg-card border-border hover:border-secondary'
                  }`}
                >
                  <div className="flex flex-col items-center gap-2">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      todayComplete ? 'bg-secondary text-secondary-foreground' : 'bg-muted'
                    }`}>
                      <Check className="w-5 h-5" />
                    </div>
                    <span className="text-sm font-medium text-center">
                      {todayComplete ? "Today's fast logged ✓" : "I fasted today — mark complete"}
                    </span>
                    <span className="text-xs text-muted-foreground text-center">
                      {todayComplete ? "You logged this day" : "Log that you completed dawn to sunset"}
                    </span>
                    <span className="text-xs text-muted-foreground font-arabic">
                      {todayComplete ? 'مكتمل' : 'تم الصيام'}
                    </span>
                  </div>
                </button>
              </TooltipTrigger>
              <TooltipContent className="max-w-xs p-3">
                {todayComplete 
                  ? (
                    <>
                      <p className="font-semibold text-sm">Today's fast is logged • مكتمل</p>
                      <p className="text-xs text-muted-foreground mt-1">Tap to undo (unmark this day).</p>
                      <p className="font-arabic text-xs text-muted-foreground mt-1" dir="rtl">انقر للتراجع</p>
                    </>
                  )
                  : (
                    <>
                      <p className="font-semibold text-sm">Log that you completed today's fast • تم الصيام</p>
                      <p className="text-xs text-muted-foreground mt-1">Tap after you break your fast at {iftarLabel} (Maghrib). This records that you fasted from dawn to sunset today.</p>
                      <p className="font-arabic text-xs text-muted-foreground mt-1" dir="rtl">سجّل إكمال صيام اليوم بعد الإفطار</p>
                    </>
                  )}
              </TooltipContent>
            </Tooltip>
            
            {/* Streak */}
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="p-3 sm:p-4 rounded-2xl bg-card border border-border min-h-[100px] sm:min-h-0 flex flex-col items-center justify-center">
                  <div className="flex flex-col items-center gap-2">
                    <div className="w-10 h-10 rounded-full bg-gradient-gold flex items-center justify-center">
                      <Flame className="w-5 h-5 text-foreground" />
                    </div>
                    <span className="text-xl sm:text-2xl font-bold text-secondary">{streak}</span>
                    <span className="text-xs text-muted-foreground">Day Streak • أيام متتالية</span>
                  </div>
                </div>
              </TooltipTrigger>
              <TooltipContent className="max-w-xs p-3">
                <p>You've completed {streak} consecutive days of fasting!</p>
                <p className="font-arabic text-xs text-muted-foreground mt-1" dir="rtl">أيام صيام متتالية • أيام متتالية</p>
              </TooltipContent>
            </Tooltip>
            
            {/* Total Days */}
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="p-3 sm:p-4 rounded-2xl bg-card border border-border min-h-[100px] sm:min-h-0 flex flex-col items-center justify-center">
                  <div className="flex flex-col items-center gap-2">
                    <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                      <Calendar className="w-5 h-5 text-foreground" />
                    </div>
                    <span className="text-xl sm:text-2xl font-bold">{progress.completedDays.length}</span>
                    <span className="text-xs text-muted-foreground">Total Days • إجمالي الأيام</span>
                  </div>
                </div>
              </TooltipTrigger>
              <TooltipContent className="max-w-xs p-3">
                <p>Total fasting days completed this month</p>
                <p className="font-arabic text-xs text-muted-foreground mt-1" dir="rtl">إجمالي أيام الصيام المكتملة</p>
              </TooltipContent>
            </Tooltip>
            
            {/* Sunnah Days */}
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="p-3 sm:p-4 rounded-2xl bg-card border border-border min-h-[100px] sm:min-h-0 flex flex-col items-center justify-center">
                  <div className="flex flex-col items-center gap-2">
                    <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                      <Moon className="w-5 h-5 text-foreground" aria-hidden />
                    </div>
                    <span className="text-xl sm:text-2xl font-bold">{progress.sunnahDaysCompleted}</span>
                    <span className="text-xs text-muted-foreground">Sunnah Days • أيام السنة</span>
                  </div>
                </div>
              </TooltipTrigger>
              <TooltipContent className="max-w-xs p-3">
                <p>Voluntary fasting days (Mon/Thu/White Days) completed</p>
                <p className="font-arabic text-xs text-muted-foreground mt-1" dir="rtl">أيام السنة • الاثنين والخميس</p>
              </TooltipContent>
            </Tooltip>

            {/* Day view: meal plan, calories, prayer times, journal for selected day */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.18 }}
              className="mb-8 p-6 rounded-2xl bg-card border border-border"
            >
              <Tooltip>
                <TooltipTrigger asChild>
                  <h3 className="font-display font-bold mb-4 flex items-center gap-2 cursor-help w-fit border-b border-dotted border-transparent hover:border-muted-foreground/40">
                    <Calendar className="w-5 h-5 text-secondary" />
                    {isSelectedToday ? "Today's plan" : "Day plan"} · {selectedDateObj.toLocaleDateString("en", { month: "short", day: "numeric" })}
                  </h3>
                </TooltipTrigger>
                <TooltipContent className="max-w-xs">
                  <p className="font-medium">Meal plan and optional nutrition for this calendar day</p>
                  <p className="text-xs mt-1">Plan what you’ll eat for Suhoor and {iftarLabel}, and optionally log calories and macros. Use the Schedule page for the full calendar and food log.</p>
                  <p className="font-arabic text-xs text-muted-foreground mt-1" dir="rtl">وجبات السحور والإفطار • السحور والإفطار</p>
                </TooltipContent>
              </Tooltip>

              {/* Prayer times for this day */}
              {selectedDayPrayerTimes && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4 p-3 rounded-xl bg-muted/50">
                  <div>
                    <span className="text-xs text-muted-foreground block">Suhoor ends (Fajr)</span>
                    <span className="font-bold text-secondary">{selectedDayPrayerTimes.fajr}</span>
                  </div>
                  <div>
                    <span className="text-xs text-muted-foreground block">{iftarLabel} (Maghrib)</span>
                    <span className="font-bold text-secondary">{selectedDayPrayerTimes.maghrib}</span>
                  </div>
                </div>
              )}

              {/* Meal plan for day */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
                <div>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <label className="text-xs font-medium text-muted-foreground block mb-1 cursor-help border-b border-dotted border-transparent hover:border-muted-foreground/40 w-fit">
                        Suhoor
                      </label>
                    </TooltipTrigger>
                    <TooltipContent className="max-w-xs">
                      <p className="font-semibold text-sm">{EATING_TIME_TOOLTIPS.suhoor.title}</p>
                      <p className="text-xs text-muted-foreground mt-1">{EATING_TIME_TOOLTIPS.suhoor.body}</p>
                    </TooltipContent>
                  </Tooltip>
                  <input
                    type="text"
                    value={selectedDayMeals?.suhoor ?? ""}
                    onChange={(e) =>
                      setMealPlans((prev) => ({
                        ...prev,
                        [selectedDate]: { ...(prev[selectedDate] || {}), suhoor: e.target.value.trim() || undefined },
                      }))
                    }
                    placeholder="e.g. Oats & dates"
                    className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm"
                  />
                </div>
                <div>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <label className="text-xs font-medium text-muted-foreground block mb-1 cursor-help border-b border-dotted border-transparent hover:border-muted-foreground/40 w-fit">
                        {iftarLabel}
                      </label>
                    </TooltipTrigger>
                    <TooltipContent className="max-w-xs">
                      <p className="font-semibold text-sm">{EATING_TIME_TOOLTIPS.iftar.title}</p>
                      <p className="text-xs text-muted-foreground mt-1">{EATING_TIME_TOOLTIPS.iftar.body}</p>
                    </TooltipContent>
                  </Tooltip>
                  <input
                    type="text"
                    value={selectedDayMeals?.iftar ?? ""}
                    onChange={(e) =>
                      setMealPlans((prev) => ({
                        ...prev,
                        [selectedDate]: { ...(prev[selectedDate] || {}), iftar: e.target.value.trim() || undefined },
                      }))
                    }
                    placeholder="e.g. Harira & dates"
                    className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm"
                  />
                </div>
              </div>

              {/* Calorie / nutrition for day */}
              <div className="mb-4">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span className="text-xs font-medium text-muted-foreground block mb-2 cursor-help border-b border-dotted border-transparent hover:border-muted-foreground/40 w-fit">
                      Calories & macros (optional)
                    </span>
                  </TooltipTrigger>
                  <TooltipContent className="max-w-xs">
                    <p className="font-medium">Optional daily nutrition target</p>
                    <p className="text-xs mt-1">Log calories and protein/carbs/fat for this day if you want to track intake. The Schedule page has a full food log with portions.</p>
                  </TooltipContent>
                </Tooltip>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <div>
                    <input
                      type="number"
                      min={0}
                      placeholder="Cal"
                      value={selectedDayNutr?.calories ?? ""}
                      onChange={(e) =>
                        setDayNutrition((prev) => ({
                          ...prev,
                          [selectedDate]: {
                            ...(prev[selectedDate] || {}),
                            calories: e.target.value ? Number(e.target.value) : undefined,
                          },
                        }))
                      }
                      className="w-full px-2 py-1.5 rounded-lg border border-border bg-background text-sm"
                    />
                    <span className="text-[10px] text-muted-foreground">/ {dailyGoals.calories} goal</span>
                  </div>
                  <div>
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
                  <div>
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
                  <div>
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
                    No entry for this day — Add in Journal
                  </Link>
                )}
              </div>

              {/* Mark day complete = log that you fasted this day (dawn to sunset) */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pt-3 border-t border-border">
                <span className="text-sm text-muted-foreground">
                  {selectedDayComplete ? "Logged: you fasted this day (dawn to sunset)" : "Did you fast this day from dawn to sunset?"}
                </span>
                <button
                  type="button"
                  onClick={() => setDayCompleted(progress, setProgress, selectedDate, !selectedDayComplete)}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors shrink-0 ${
                    selectedDayComplete ? "bg-secondary/20 text-secondary border border-secondary/40" : "bg-muted hover:bg-muted/80"
                  }`}
                >
                  {selectedDayComplete ? "Yes, logged ✓" : "Yes, mark complete"}
                </button>
              </div>
            </motion.div>

            {/* Progress Ring — days completed (ring fill = % of 30) */}
            <div className="p-4 rounded-2xl bg-card border border-border flex flex-col items-center">
              <ProgressRing
                value={ramadanCompletionPct}
                size={80}
                strokeWidth={8}
                centerLabel={progress.completedDays.length}
                sublabel={`of ${totalDays} days`}
              />
            </div>
          </motion.div>

          {/* Streak celebration for milestones */}
          {[7, 15, 30].includes(streak) && (
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

          {/* Goals until Ramadan */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.24 }}
            className="mb-8"
          >
            <GoalsUntilRamadanCard />
          </motion.div>

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
              <SunnahFastingBadge hijriDay={ayyamAlBeed?.hijriDay} />
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
                  Today's Prayer Times • أوقات الصلاة
                </Link>
                <PrayerLocationBadge onClickToUpdate={() => setLocationEditorOpen(true)} />
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
                        <span className="text-xs text-muted-foreground block">{prayer.name}</span>
                        <span className="text-lg font-bold block">{prayer.time}</span>
                        <span className="text-xs font-arabic text-secondary">{prayer.nameAr}</span>
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
                        <p className="text-sm">{prayer.name} prayer time • {prayer.nameAr}</p>
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
                <p className="font-medium">{tip.text}</p>
                <p className="text-sm text-muted-foreground font-arabic mt-1">{tip.textAr}</p>
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
                const dateStr = date.toISOString().split('T')[0];
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
