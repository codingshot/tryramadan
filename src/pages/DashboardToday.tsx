import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { 
  Moon, Sun, Clock, AlertTriangle, Battery, BatteryLow, BatteryMedium, BatteryFull,
  ArrowLeft, Droplets, Heart, ChevronRight, Zap, Utensils, BookOpen, Landmark
} from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { FastingTimer } from "@/components/FastingTimer";
import {
  useUserPreferences,
  useFastingProgress,
  completeFastingToday,
  breakFastingToday,
  setDaySkipped,
  getTodayFastingLog,
  getBrokenReasonLabel,
  useTodayData,
  useIftarLabel,
  useIftarLabelShort,
  useSuhoorLabelShort,
  useDisplayTimezone,
  isPredictedMenstruationDay,
  useMenstruationTrackingEnabled,
  isInMenstrualPeriod,
  startMenstrualPeriod,
  endMenstrualPeriod,
} from "@/hooks/useLocalStorage";
import { getTodayStringInTimezone, getNowSecondsSinceMidnightInTimezone, timeStringToSecondsSinceMidnight, secondsUntilTimeInTimezone, toLocalDateString } from "@/lib/utils";
import { BreakFastReasonDialog } from "@/components/BreakFastReasonDialog";
import { usePrayerTimes, usePrayerTimesForDate } from "@/hooks/usePrayerTimes";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { EATING_TIME_TOOLTIPS } from "@/data/eating-times-tooltips";
import { GENERAL_TOOLTIPS } from "@/data/general-tooltips";
import { PrayerLocationBadge } from "@/components/PrayerLocationBadge";
import { PageSEO } from "@/components/PageSEO";
import { toast } from "sonner";
import {
  getRecommendedHydrationGoalMl,
  getHydrationRecommendationLabel,
  getHydrationUnit,
  formatHydrationAmount,
  formatHydrationGoal,
  HYDRATION_PRESETS_ML,
} from "@/lib/hydration";

const DashboardToday = () => {
  const [preferences] = useUserPreferences();
  const iftarLabel = useIftarLabel();
  const iftarLabelShort = useIftarLabelShort();
  const suhoorLabelShort = useSuhoorLabelShort();
  const [progress, setProgress] = useFastingProgress();
  const {
    intention,
    hydrationTotalMl,
    hydrationEntries,
    energyEntries,
    setIntention,
    addHydrationEntry,
    addEnergyEntry,
  } = useTodayData();
  const hydrationGoalMl = getRecommendedHydrationGoalMl(
    preferences.gender,
    preferences.country || "US",
    preferences.hydrationGoalMl
  );
  const hydrationUnit = getHydrationUnit(preferences.country || "US");
  const hydrationLabel = getHydrationRecommendationLabel(preferences.gender);
  const hydrationProgressPct = hydrationGoalMl > 0 ? Math.min(100, (hydrationTotalMl / hydrationGoalMl) * 100) : 0;
  const [energyLevel, setEnergyLevel] = useState<1 | 2 | 3 | 4 | 5>(3);
  const [showBreakFast, setShowBreakFast] = useState(false);
  const [showBreakFastDialog, setShowBreakFastDialog] = useState(false);
  const [countdownSuhoorEnd, setCountdownSuhoorEnd] = useState({ h: 0, m: 0 });
  const [countdownIftar, setCountdownIftar] = useState({ h: 0, m: 0 });
  
  const displayTimezone = useDisplayTimezone();
  const { prayerTimes } = usePrayerTimes(
    preferences.locationCoords?.lat || null,
    preferences.locationCoords?.lng || null,
    displayTimezone
  );
  const todayStr = displayTimezone ? getTodayStringInTimezone(displayTimezone) : toLocalDateString(new Date());
  const tomorrowDate = new Date(todayStr + "T12:00:00");
  tomorrowDate.setDate(tomorrowDate.getDate() + 1);
  const tomorrowStr = toLocalDateString(tomorrowDate);
  const { prayerTimes: tomorrowPrayerTimes } = usePrayerTimesForDate(
    preferences.locationCoords?.lat || null,
    preferences.locationCoords?.lng || null,
    tomorrowStr
  );
  const imsakTomorrow = tomorrowPrayerTimes?.imsak ?? prayerTimes?.imsak;

  // Calculate fasting progress: from Suhoor end (Imsak) to Iftar (Maghrib); use location time when timezone set
  const getFastingProgress = () => {
    if (!prayerTimes) return 50;
    const imsakSec = timeStringToSecondsSinceMidnight(prayerTimes.imsak ?? prayerTimes.fajr);
    const maghribSec = timeStringToSecondsSinceMidnight(prayerTimes.maghrib);
    const nowSec = displayTimezone
      ? getNowSecondsSinceMidnightInTimezone(displayTimezone)
      : (() => { const n = new Date(); return n.getHours() * 3600 + n.getMinutes() * 60 + n.getSeconds(); })();
    const total = maghribSec - imsakSec;
    const elapsed = nowSec - imsakSec;
    if (total <= 0) return 50;
    return Math.min(100, Math.max(0, (elapsed / total) * 100));
  };
  
  const fastingProgress = getFastingProgress();
  const todayCompleted = progress.completedDays.includes(todayStr);
  const todaySkipped = (progress.skippedDays ?? []).includes(todayStr);
  const todayBrokenEntry = progress.fastingLog?.find((e) => e.date === todayStr && e.status === "broken");
  const todayLog = getTodayFastingLog(progress, todayStr);
  /** Only show "I broke my fast" when user has started fasting today and has not yet broken or marked complete */
  const fastingToday = !!todayLog && todayLog.status !== "broken" && !todayCompleted && !todaySkipped;
  const isPredictedPeriodDay = isPredictedMenstruationDay(todayStr, preferences);
  const menstruationTrackingEnabled = useMenstruationTrackingEnabled();
  const inMenstrualPeriod = isInMenstrualPeriod(progress);

  const imsakStr = prayerTimes?.imsak ?? prayerTimes?.fajr;
  const isFastingWindow =
    prayerTimes && imsakStr &&
    (() => {
      const nowSec = displayTimezone
        ? getNowSecondsSinceMidnightInTimezone(displayTimezone)
        : (() => { const n = new Date(); return n.getHours() * 3600 + n.getMinutes() * 60 + n.getSeconds(); })();
      const imsakSec = timeStringToSecondsSinceMidnight(imsakStr);
      const maghribSec = timeStringToSecondsSinceMidnight(prayerTimes.maghrib);
      return nowSec >= imsakSec && nowSec < maghribSec;
    })();

  const [suhoorPassed, setSuhoorPassed] = useState(false);
  const [iftarPassed, setIftarPassed] = useState(false);
  useEffect(() => {
    if (!prayerTimes) return;
    const imsakSec = timeStringToSecondsSinceMidnight(prayerTimes.imsak ?? prayerTimes.fajr);
    const imsakTomorrowSec = timeStringToSecondsSinceMidnight(imsakTomorrow ?? prayerTimes.imsak ?? prayerTimes.fajr);
    const maghribSec = timeStringToSecondsSinceMidnight(prayerTimes.maghrib);
    const tick = () => {
      const nowSec = displayTimezone
        ? getNowSecondsSinceMidnightInTimezone(displayTimezone)
        : (() => { const n = new Date(); return n.getHours() * 3600 + n.getMinutes() * 60 + n.getSeconds(); })();
      setSuhoorPassed(nowSec >= imsakSec);
      setIftarPassed(nowSec >= maghribSec);
      if (nowSec < imsakSec) {
        const d = secondsUntilTimeInTimezone(nowSec, imsakSec);
        setCountdownSuhoorEnd({ h: Math.floor(d / 3600), m: Math.floor((d % 3600) / 60) });
      } else if (nowSec >= maghribSec) {
        // Past iftar: count down to tomorrow's suhoor (imsak changes day by day)
        const d = secondsUntilTimeInTimezone(nowSec, imsakTomorrowSec);
        setCountdownSuhoorEnd({ h: Math.floor(d / 3600), m: Math.floor((d % 3600) / 60) });
      } else setCountdownSuhoorEnd({ h: 0, m: 0 });
      if (nowSec < maghribSec) {
        const d = secondsUntilTimeInTimezone(nowSec, maghribSec);
        setCountdownIftar({ h: Math.floor(d / 3600), m: Math.floor((d % 3600) / 60) });
      } else setCountdownIftar({ h: 0, m: 0 });
    };
    tick();
    const interval = setInterval(tick, 2000); // Throttle for INP (was 1s)
    return () => clearInterval(interval);
  }, [prayerTimes, imsakTomorrow, displayTimezone]);
  
  const energyIcons = {
    1: BatteryLow,
    2: BatteryLow,
    3: BatteryMedium,
    4: BatteryFull,
    5: BatteryFull,
  };
  
  const EnergyIcon = energyIcons[energyLevel];

  return (
    <div className="min-h-screen bg-background">
      <PageSEO
        title="Today | TryRamadan.app"
        description="Today's fasting view: countdown to iftar, hydration and energy tracking, intention, and break-fast options. Stay mindful during your fast."
        path="/dashboard/today"
      />
      <Navbar />
      
      <main id="main-content" className="main-content">
        <div className="container mx-auto px-4 max-w-4xl min-w-0">
          {/* Back link */}
          <Link 
            to="/dashboard" 
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </Link>
          
          {/* Header */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <h1 className="text-2xl md:text-3xl font-display font-bold">
              Today&apos;s Fast
            </h1>
            <p className="text-muted-foreground mt-2">
              Track your current fast and monitor how you're feeling
            </p>
          </motion.div>

          {/* Menstrual period: rule and mark in period / no longer menstruating */}
          {menstruationTrackingEnabled && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.03 }}
              className="mb-6 p-4 rounded-xl border border-border bg-card"
              role="region"
              aria-label="Menstrual period tracking"
            >
              {inMenstrualPeriod ? (
                <>
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-muted border border-border text-sm font-medium">
                      No need to fast
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">
                    You&apos;re in your menstrual period. In Islam there is no obligation to fast during menstruation. These days don&apos;t break your streak.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      endMenstrualPeriod(progress, setProgress, todayStr);
                      toast.success("Marked as no longer menstruating. Logged.");
                    }}
                    className="text-sm font-medium px-3 py-2 rounded-lg bg-primary/20 text-primary hover:bg-primary/30 border border-primary/30 focus-visible:ring-2 focus-visible:ring-offset-2"
                    aria-label="Mark as no longer menstruating and log period end"
                  >
                    No longer menstruating?
                  </button>
                </>
              ) : (
                <>
                  <p className="text-sm text-muted-foreground mb-2">
                    In Islam there is no obligation to fast during menstruation. Mark when you&apos;re in your period so we show &quot;No need to fast&quot; and log it.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      startMenstrualPeriod(progress, setProgress, todayStr);
                      toast.success("Marked as in menstrual period. No need to fast.");
                    }}
                    className="text-sm font-medium px-3 py-2 rounded-lg border border-border hover:bg-muted focus-visible:ring-2 focus-visible:ring-offset-2"
                    aria-label="Mark as in menstrual period (no need to fast today)"
                  >
                    Mark as in menstrual period
                  </button>
                </>
              )}
            </motion.div>
          )}
          
          {/* Today's fast status: mark fasted / broke — above countdown */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="mb-6 p-4 rounded-2xl bg-card border border-border"
          >
            <Tooltip>
              <TooltipTrigger asChild>
                <h3 className="font-display font-bold text-sm mb-3 text-muted-foreground cursor-help border-b border-dotted border-muted-foreground/40 w-fit">
                  Today&apos;s fast
                </h3>
              </TooltipTrigger>
              <TooltipContent>
                <p className="font-medium">Today&apos;s fast</p>
                <p className="text-xs mt-1 text-muted-foreground">Log whether you completed the full fast (dawn to sunset) or had to break it early. Use &quot;Mark complete&quot; when you fasted until Maghrib; use &quot;I broke my fast&quot; if you ended early.</p>
              </TooltipContent>
            </Tooltip>
            {todayCompleted ? (
              <div className="py-3 px-4 rounded-xl bg-secondary/20 border border-secondary/40 text-center">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span className="font-medium text-secondary cursor-help border-b border-dotted border-secondary/40">You fasted today ✓</span>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="font-medium">{GENERAL_TOOLTIPS.markComplete.title}</p>
                    <p className="text-xs mt-1 text-muted-foreground">You logged that you completed dawn-to-sunset fasting today.</p>
                  </TooltipContent>
                </Tooltip>
              </div>
            ) : todaySkipped ? (
              <div className="py-3 px-4 rounded-xl bg-muted/50 border border-border text-center">
                <span className="font-medium text-muted-foreground">You didn&apos;t fast today</span>
                <p className="text-xs text-muted-foreground mt-1">You marked today as not fasting (e.g. travel or illness). It won&apos;t count as a broken fast.</p>
              </div>
            ) : isPredictedPeriodDay && !todayCompleted && !todaySkipped && !todayBrokenEntry && !fastingToday ? (
              <div className="py-3 px-4 rounded-xl bg-secondary/10 border border-secondary/30 text-center">
                <span className="font-medium text-secondary">Predicted excused day</span>
                <p className="text-xs text-muted-foreground mt-1">Based on your pattern, today may be an excused fasting day. Mark as in period to preserve your streak; tradition recognises this.</p>
                {menstruationTrackingEnabled ? (
                  <div className="mt-3 flex flex-col sm:flex-row gap-2 justify-center">
                    <button
                      type="button"
                      onClick={() => {
                        startMenstrualPeriod(progress, setProgress, todayStr);
                        toast.success("Marked as in menstrual period. No need to fast.");
                      }}
                      className="min-h-[44px] px-4 py-2 rounded-xl bg-secondary/20 border border-secondary/50 text-secondary font-medium text-sm hover:bg-secondary/30 transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-secondary"
                      aria-label="Mark as in menstrual period (excused, preserves streak)"
                    >
                      Mark as in menstrual period
                    </button>
                    <button
                      type="button"
                      onClick={() => setDaySkipped(progress, setProgress, todayStr)}
                      className="min-h-[44px] px-4 py-2 rounded-xl border border-border font-medium text-sm hover:bg-muted transition-colors focus-visible:ring-2 focus-visible:ring-offset-2"
                      aria-label="I didn't fast today (skip)"
                    >
                      I didn&apos;t fast today
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setDaySkipped(progress, setProgress, todayStr)}
                    className="mt-3 min-h-[44px] px-4 py-2 rounded-xl border border-secondary/50 text-secondary font-medium text-sm hover:bg-secondary/10 transition-colors focus-visible:ring-2 focus-visible:ring-offset-2"
                    aria-label="I didn't fast today (excused)"
                  >
                    I didn&apos;t fast today (excused)
                  </button>
                )}
              </div>
            ) : todayBrokenEntry?.brokenReason === "menstruation" ? (
              <div className="py-3 px-4 rounded-xl border border-border bg-muted/50 text-center text-sm">
                <span className="font-medium text-muted-foreground">No need to fast</span>
                <p className="text-xs text-muted-foreground mt-1">You&apos;re in your menstrual period. In Islam there is no obligation to fast during menstruation. These days don&apos;t break your streak.</p>
                {inMenstrualPeriod && (
                  <button
                    type="button"
                    onClick={() => {
                      endMenstrualPeriod(progress, setProgress, todayStr);
                      toast.success("Marked as no longer menstruating. Logged.");
                    }}
                    className="mt-3 min-h-[44px] px-4 py-2 rounded-xl border border-border font-medium text-sm hover:bg-muted transition-colors focus-visible:ring-2 focus-visible:ring-offset-2"
                    aria-label="Mark as no longer menstruating and log period end"
                  >
                    No longer menstruating?
                  </button>
                )}
              </div>
            ) : todayBrokenEntry ? (
              <div className="py-3 px-4 rounded-xl border border-destructive/40 bg-destructive/10 text-center text-sm">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span className="font-medium text-destructive cursor-help border-b border-dotted border-destructive/40">You broke your fast today</span>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="font-medium">{GENERAL_TOOLTIPS.brokeFast.title}</p>
                    <p className="text-xs mt-1 text-muted-foreground">{GENERAL_TOOLTIPS.brokeFast.body}</p>
                  </TooltipContent>
                </Tooltip>
                {todayBrokenEntry.brokenReason && (
                  <span className="text-muted-foreground block mt-1">
                    {getBrokenReasonLabel(todayBrokenEntry.brokenReason)}
                  </span>
                )}
              </div>
            ) : (
              <div className={`flex flex-col sm:flex-row flex-wrap gap-2 ${fastingToday ? "" : "max-w-md"}`}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      onClick={() => completeFastingToday(progress, setProgress, todayStr)}
                      className="flex-1 min-w-0 py-3 px-4 rounded-xl bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
                    >
                      <Moon className="w-5 h-5 shrink-0" />
                      I fasted today — mark complete
                    </button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="font-medium">{GENERAL_TOOLTIPS.markComplete.title}</p>
                    <p className="text-xs mt-1 text-muted-foreground">{GENERAL_TOOLTIPS.markComplete.body}</p>
                  </TooltipContent>
                </Tooltip>
                {fastingToday && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        type="button"
                        onClick={() => setShowBreakFastDialog(true)}
                        className="flex-1 min-w-0 py-3 px-4 rounded-xl border border-destructive/40 bg-destructive/10 text-destructive font-medium hover:bg-destructive/20 transition-colors flex items-center justify-center gap-2"
                      >
                        <AlertTriangle className="w-5 h-5 shrink-0" />
                        I broke my fast
                      </button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="font-medium">{GENERAL_TOOLTIPS.breakMyFast.title}</p>
                      <p className="text-xs mt-1 text-muted-foreground">{GENERAL_TOOLTIPS.breakMyFast.body}</p>
                    </TooltipContent>
                  </Tooltip>
                )}
                {!fastingToday && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        type="button"
                        onClick={() => setDaySkipped(progress, setProgress, todayStr)}
                        className="flex-1 min-w-0 py-3 px-4 rounded-xl border border-border bg-muted/30 font-medium hover:bg-muted/50 transition-colors"
                      >
                        I didn&apos;t fast today
                      </button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="font-medium">I didn&apos;t fast today</p>
                      <p className="text-xs mt-1 text-muted-foreground">Mark that you didn&apos;t fast (e.g. travel, illness). Won&apos;t count as a broken fast.</p>
                    </TooltipContent>
                  </Tooltip>
                )}
              </div>
            )}
            <BreakFastReasonDialog
              open={showBreakFastDialog}
              onOpenChange={setShowBreakFastDialog}
              onSelectReason={(reasonId, brokeAt) => breakFastingToday(progress, setProgress, reasonId, todayStr, brokeAt)}
              userType={preferences.userType}
              notInFastingPeriod={isFastingWindow === false}
            />
          </motion.div>

          {/* Main Timer (countdown to Iftar or Suhoor) */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-6"
          >
            <FastingTimer
              suhoorTime={prayerTimes?.imsak}
              iftarTime={prayerTimes?.maghrib}
              isFasting={isFastingWindow ?? true}
            />
          </motion.div>

          {/* Dual countdown: Suhoor end (Fajr) & Iftar — one label per on mobile to save space */}
          {prayerTimes && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.12 }}
              className="mb-6 grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-4"
            >
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="p-3 sm:p-4 rounded-2xl bg-card border border-border text-center cursor-help min-w-0">
                    <span className="text-xs text-muted-foreground block truncate">
                      {suhoorPassed ? `${suhoorLabelShort} ended` : `Until ${suhoorLabelShort} end`}
                      <span className="hidden sm:inline"> (eat cutoff)</span>
                    </span>
                    {suhoorPassed && (
                      <span className="inline-block mt-1 px-2 py-0.5 rounded-full text-xs font-medium bg-secondary/20 text-secondary border border-secondary/30">
                        Fasting
                      </span>
                    )}
                    {suhoorPassed && preferences.userType === "muslim" && (
                      <p className="text-xs text-muted-foreground mt-1.5 flex items-center justify-center gap-1">
                        <Landmark className="w-3.5 h-3.5" aria-hidden />
                        Pray Fajr
                      </p>
                    )}
                    {suhoorPassed ? (
                      <span className="text-base sm:text-lg font-bold text-muted-foreground tabular-nums block mt-1">
                        {prayerTimes?.imsak ?? prayerTimes?.fajr}
                      </span>
                    ) : (
                      <span className="text-lg sm:text-xl font-bold text-secondary tabular-nums block">
                        {String(countdownSuhoorEnd.h).padStart(2, "0")}:
                        {String(countdownSuhoorEnd.m).padStart(2, "0")}
                      </span>
                    )}
                    {!suhoorPassed && (
                      <Link
                        to={`/dashboard/schedule?date=${todayStr}`}
                        className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-secondary hover:underline"
                      >
                        <Utensils className="w-3.5 h-3.5" aria-hidden />
                        Log suhoor
                      </Link>
                    )}
                  </div>
                </TooltipTrigger>
                <TooltipContent side="top" className="max-w-xs p-3">
                  {preferences.userType === "new" ? (
                    <>
                      <p className="font-semibold text-sm">Until suhoor end</p>
                      <p className="text-xs text-muted-foreground mt-1">Suhoor = last meal before dawn (after this time, fasting starts). This is Fajr (dawn)—the cutoff for eating and drinking.</p>
                    </>
                  ) : (
                    <>
                      <p className="font-semibold text-sm">{EATING_TIME_TOOLTIPS.suhoorEnds.title}</p>
                      <p className="text-xs text-muted-foreground mt-1">{EATING_TIME_TOOLTIPS.suhoorEnds.body}</p>
                      <p className="font-arabic text-xs text-muted-foreground mt-1" dir="rtl">{EATING_TIME_TOOLTIPS.suhoorEnds.bodyAr}</p>
                    </>
                  )}
                </TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="p-3 sm:p-4 rounded-2xl bg-card border border-border text-center cursor-help min-w-0">
                    <span className="text-xs text-muted-foreground block truncate">
                      {iftarPassed ? `${iftarLabel} passed` : `Until ${iftarLabel}`}
                    </span>
                    {!iftarPassed && preferences.userType === "muslim" && (
                      <p className="text-xs text-muted-foreground mt-1 flex items-center justify-center gap-1">
                        <Landmark className="w-3.5 h-3.5" aria-hidden />
                        Pray Maghrib when you break
                      </p>
                    )}
                    {iftarPassed ? (
                      <span className="text-base sm:text-lg font-bold text-muted-foreground tabular-nums block mt-1">
                        {prayerTimes.maghrib}
                      </span>
                    ) : (
                      <span className="text-lg sm:text-xl font-bold text-secondary tabular-nums block">
                        {String(countdownIftar.h).padStart(2, "0")}:
                        {String(countdownIftar.m).padStart(2, "0")}
                      </span>
                    )}
                    {iftarPassed && (
                      <div className="mt-2 flex flex-wrap justify-center gap-x-3 gap-y-1">
                        <Link
                          to={`/dashboard/schedule?date=${todayStr}`}
                          className="inline-flex items-center gap-1 text-xs font-medium text-secondary hover:underline"
                        >
                          <Utensils className="w-3.5 h-3.5" aria-hidden />
                          Log iftar
                        </Link>
                        <Link
                          to={`/dashboard/journal?date=${todayStr}`}
                          className="inline-flex items-center gap-1 text-xs font-medium text-secondary hover:underline"
                        >
                          <BookOpen className="w-3.5 h-3.5" aria-hidden />
                          Journal
                        </Link>
                      </div>
                    )}
                  </div>
                </TooltipTrigger>
                <TooltipContent side="top" className="max-w-xs p-3">
                  <p className="font-semibold text-sm">{EATING_TIME_TOOLTIPS.untilIftar.title}</p>
                  <p className="text-xs text-muted-foreground mt-1">{EATING_TIME_TOOLTIPS.untilIftar.body}</p>
                  <p className="font-arabic text-xs text-muted-foreground mt-1" dir="rtl">{EATING_TIME_TOOLTIPS.untilIftar.bodyAr}</p>
                </TooltipContent>
              </Tooltip>
            </motion.div>
          )}

          {/* Progress Bar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-8 p-6 rounded-2xl bg-card border border-border"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="font-medium">
                Fasting Progress
              </span>
              <span className="text-secondary font-bold">{Math.round(fastingProgress)}%</span>
            </div>
            <div className="h-4 bg-muted rounded-full overflow-hidden">
              <motion.div 
                className="h-full bg-gradient-gold rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${fastingProgress}%` }}
                transition={{ duration: 1, ease: "easeOut" }}
              />
            </div>
            <div className="flex justify-between mt-2 text-xs text-muted-foreground gap-2">
              <span className="truncate min-w-0" title={`${suhoorLabelShort} end (eat cutoff)`}><span className="sm:inline hidden">{suhoorLabelShort} end </span>{prayerTimes?.imsak ?? prayerTimes?.fajr ?? '05:30'}</span>
              <span className="truncate min-w-0 shrink-0" title="Iftar (Maghrib)"><span className="sm:inline hidden">Iftar </span>{prayerTimes?.maghrib || '18:30'}</span>
            </div>
            <div className="mt-2 pt-2 border-t border-border">
              <PrayerLocationBadge />
            </div>
          </motion.div>

          {/* Today's intention */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.22 }}
            className="mb-8 p-6 rounded-2xl bg-card border border-border"
          >
            <h3 className="font-display font-bold mb-2">
              Today&apos;s intention
            </h3>
            <p className="text-sm text-muted-foreground mb-3">Set a short intention or goal for today&apos;s fast.</p>
            <textarea
              value={intention}
              onChange={(e) => setIntention(e.target.value)}
              placeholder="e.g. Patience, gratitude, or a small act of kindness..."
              className="w-full p-3 rounded-xl border border-border bg-background min-h-[80px] text-sm resize-none focus:ring-2 focus:ring-secondary outline-none"
            />
          </motion.div>
          
          {/* Energy Level Check-in */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mb-8 p-6 rounded-2xl bg-card border border-border"
          >
            <h3 className="font-display font-bold mb-4 flex items-center gap-2">
              <Zap className="w-5 h-5 text-secondary" />
              How are you feeling? • كيف حالك؟
            </h3>
            
            <div className="flex justify-between gap-2 mb-4">
              {[1, 2, 3, 4, 5].map((level) => (
                <Tooltip key={level}>
                  <TooltipTrigger asChild>
                    <button
                      onClick={() => {
                        setEnergyLevel(level as 1 | 2 | 3 | 4 | 5);
                        addEnergyEntry(level as 1 | 2 | 3 | 4 | 5);
                      }}
                      className={`flex-1 p-4 rounded-xl border-2 transition-all ${
                        energyLevel === level 
                          ? 'border-secondary bg-secondary/10' 
                          : 'border-border hover:border-secondary/50'
                      }`}
                    >
                      <div className="text-center">
                        <span className="text-2xl block mb-1">
                          {level === 1 && '😴'}
                          {level === 2 && '😕'}
                          {level === 3 && '😐'}
                          {level === 4 && '😊'}
                          {level === 5 && '💪'}
                        </span>
                        <span className="text-xs text-muted-foreground">{level}</span>
                      </div>
                    </button>
                  </TooltipTrigger>
                  <TooltipContent>
                    {level === 1 && 'Very low energy - consider resting'}
                    {level === 2 && 'Low energy - take it easy'}
                    {level === 3 && 'Moderate - doing okay'}
                    {level === 4 && 'Good energy level'}
                    {level === 5 && 'Feeling great!'}
                  </TooltipContent>
                </Tooltip>
              ))}
            </div>
            
            <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/50">
              <EnergyIcon className="w-5 h-5 text-secondary" />
              <span className="text-sm">
                {energyLevel <= 2 && `Take it easy. Rest if needed and stay hydrated after ${iftarLabelShort}.`}
                {energyLevel === 3 && "You're doing well! Keep a steady pace today."}
                {energyLevel >= 4 && "Great energy! You're handling the fast beautifully."}
              </span>
            </div>
            {energyEntries.length > 0 && (
              <div className="mt-3 text-xs text-muted-foreground">
                <span className="font-medium">Check-ins today:</span>{" "}
                {energyEntries.slice(-5).map((e, i) => (
                  <span key={i}>
                    {new Date(e.time).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })} ({e.level}/5)
                    {i < Math.min(5, energyEntries.length) - 1 ? ", " : ""}
                  </span>
                ))}
              </div>
            )}
          </motion.div>

          {/* Hydration tracker — log only during non-fasting hours */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.32 }}
            className="mb-8 p-6 rounded-2xl bg-card border border-border"
          >
            <h3 className="font-display font-bold mb-2 flex items-center gap-2">
              <Droplets className="w-5 h-5 text-blue-500" />
              Hydration • ترطيب
            </h3>
            <p className="text-sm text-muted-foreground mb-3">
              Goal: {formatHydrationGoal(hydrationGoalMl, hydrationUnit)} ({hydrationLabel}). Log water during {iftarLabelShort} and before Fajr only.
            </p>
            <div className="flex flex-wrap items-baseline gap-2 mb-3">
              <span className="text-2xl sm:text-3xl font-bold text-blue-600 dark:text-blue-400">
                {formatHydrationAmount(hydrationTotalMl, hydrationUnit)}
              </span>
              <span className="text-sm text-muted-foreground">
                of {formatHydrationGoal(hydrationGoalMl, hydrationUnit)} today
              </span>
            </div>
            <div className="h-3 bg-muted rounded-full overflow-hidden mb-4">
              <motion.div
                className="h-full bg-blue-500 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${hydrationProgressPct}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>
            {isFastingWindow ? (
              <p className="text-sm text-muted-foreground py-2 rounded-lg bg-muted/50 border border-border">
                You can log water after {iftarLabelShort} and before Fajr. Quick-add is available during eating hours.
              </p>
            ) : (
              <>
                <p className="text-xs text-muted-foreground mb-3">Quick add (during non-fasting hours):</p>
                <div className="flex flex-wrap gap-2">
                  {HYDRATION_PRESETS_ML.map(({ ml, labelSmall, labelCups }) => (
                    <button
                      key={ml}
                      type="button"
                      onClick={() => addHydrationEntry(ml)}
                      className="px-4 py-2 rounded-xl border-2 border-border hover:border-blue-500 hover:bg-blue-500/10 transition-colors text-sm font-medium min-h-[44px]"
                    >
                      {hydrationUnit === "cups" ? labelCups : `${labelSmall} ml`}
                    </button>
                  ))}
                </div>
                {hydrationEntries.length > 0 && (
                  <div className="mt-4 pt-3 border-t border-border">
                    <p className="text-xs text-muted-foreground mb-2">Today&apos;s logs</p>
                    <ul className="text-sm text-muted-foreground space-y-1 max-h-24 overflow-y-auto">
                      {hydrationEntries.slice().reverse().slice(0, 8).map((e, i) => (
                        <li key={`${e.time}-${i}`}>
                          +{formatHydrationAmount(e.amountMl, hydrationUnit)} at{" "}
                          {new Date(e.time).toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" })}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </>
            )}
          </motion.div>
          
          {/* Quick Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-6 sm:mb-8"
          >
            <div className="p-4 rounded-2xl bg-card border border-border text-center">
              <Droplets className="w-6 h-6 text-blue-500 mx-auto mb-2" />
              <span className="text-2xl font-bold block">{formatHydrationGoal(hydrationGoalMl, hydrationUnit)}</span>
              <span className="text-xs text-muted-foreground">Daily water goal (non-fasting hours)</span>
            </div>
            <div className="p-4 rounded-2xl bg-card border border-border text-center">
              <Heart className="w-6 h-6 text-red-500 mx-auto mb-2" />
              <span className="text-2xl font-bold block">{progress.completedDays.length}</span>
              <span className="text-xs text-muted-foreground">Days completed this month</span>
            </div>
          </motion.div>
          
          {/* Emergency Break Fast Button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="text-center"
          >
            <button
              onClick={() => setShowBreakFast(true)}
              className="inline-flex items-center justify-center gap-2 px-4 sm:px-6 py-3 rounded-xl border-2 border-destructive/50 text-destructive hover:bg-destructive/10 transition-colors min-h-[44px]"
            >
              <AlertTriangle className="w-5 h-5" />
              Need to Break Fast Early?
            </button>
            
            {showBreakFast && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-4 p-6 rounded-2xl bg-destructive/10 border border-destructive/30 text-left"
              >
                <h4 className="font-bold mb-2 flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-destructive" />
                  It's okay to break your fast if needed
                </h4>
                <p className="text-sm text-muted-foreground mb-4">
                  Your health comes first. Islam permits breaking the fast for valid reasons including:
                </p>
                <ul className="text-sm space-y-1 mb-4 text-muted-foreground">
                  <li>• Illness or feeling unwell</li>
                  <li>• Dizziness or extreme fatigue</li>
                  <li>• Medical conditions requiring food/medication</li>
                  <li>• Pregnancy or breastfeeding</li>
                </ul>
                <div className="flex gap-3">
                  <Link 
                    to="/emergency"
                    className="flex-1 text-center py-2 rounded-lg bg-destructive text-destructive-foreground text-sm font-medium"
                  >
                    I need to break my fast — go to emergency
                  </Link>
                  <button 
                    onClick={() => setShowBreakFast(false)}
                    className="flex-1 py-2 rounded-lg bg-muted text-sm font-medium"
                  >
                    I'm okay — stay on this page
                  </button>
                </div>
              </motion.div>
            )}
          </motion.div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default DashboardToday;
