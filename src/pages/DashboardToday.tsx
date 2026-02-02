import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { 
  Moon, Sun, Clock, AlertTriangle, Battery, BatteryLow, BatteryMedium, BatteryFull,
  ArrowLeft, Droplets, Heart, ChevronRight, Zap
} from "lucide-react";
import { ArabicHover } from "@/components/ArabicHover";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { FastingTimer } from "@/components/FastingTimer";
import {
  useUserPreferences,
  useFastingProgress,
  completeFastingToday,
  breakFastingToday,
  getTodayFastingLog,
  getBrokenReasonLabel,
  useTodayData,
  useIftarLabel,
  useIftarLabelShort,
} from "@/hooks/useLocalStorage";
import { BreakFastReasonDialog } from "@/components/BreakFastReasonDialog";
import { usePrayerTimes } from "@/hooks/usePrayerTimes";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { EATING_TIME_TOOLTIPS } from "@/data/eating-times-tooltips";
import { PrayerLocationBadge } from "@/components/PrayerLocationBadge";
import { PageSEO } from "@/components/PageSEO";
import {
  getDefaultHydrationGoalMl,
  getHydrationUnit,
  formatHydrationAmount,
  formatHydrationGoal,
  HYDRATION_PRESETS_ML,
} from "@/lib/hydration";

const DashboardToday = () => {
  const [preferences] = useUserPreferences();
  const iftarLabel = useIftarLabel();
  const iftarLabelShort = useIftarLabelShort();
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
  const hydrationGoalMl =
    preferences.hydrationGoalMl && preferences.hydrationGoalMl > 0
      ? preferences.hydrationGoalMl
      : getDefaultHydrationGoalMl(preferences.country || "US");
  const hydrationUnit = getHydrationUnit(preferences.country || "US");
  const hydrationProgressPct = hydrationGoalMl > 0 ? Math.min(100, (hydrationTotalMl / hydrationGoalMl) * 100) : 0;
  const [energyLevel, setEnergyLevel] = useState<1 | 2 | 3 | 4 | 5>(3);
  const [showBreakFast, setShowBreakFast] = useState(false);
  const [showBreakFastDialog, setShowBreakFastDialog] = useState(false);
  const [countdownSuhoorEnd, setCountdownSuhoorEnd] = useState({ h: 0, m: 0 });
  const [countdownIftar, setCountdownIftar] = useState({ h: 0, m: 0 });
  
  const { prayerTimes } = usePrayerTimes(
    preferences.locationCoords?.lat || null,
    preferences.locationCoords?.lng || null
  );
  
  // Calculate fasting progress percentage
  const getFastingProgress = () => {
    if (!prayerTimes) return 50;
    
    const now = new Date();
    const [fajrH, fajrM] = prayerTimes.fajr.split(':').map(Number);
    const [maghribH, maghribM] = prayerTimes.maghrib.split(':').map(Number);
    
    const fajrMinutes = fajrH * 60 + fajrM;
    const maghribMinutes = maghribH * 60 + maghribM;
    const nowMinutes = now.getHours() * 60 + now.getMinutes();
    
    const totalFastMinutes = maghribMinutes - fajrMinutes;
    const elapsedMinutes = nowMinutes - fajrMinutes;
    
    return Math.min(100, Math.max(0, (elapsedMinutes / totalFastMinutes) * 100));
  };
  
  const fastingProgress = getFastingProgress();
  const todayStr = new Date().toISOString().split("T")[0];
  const todayCompleted = progress.completedDays.includes(todayStr);
  const todayBrokenEntry = progress.fastingLog?.find((e) => e.date === todayStr && e.status === "broken");
  const todayLog = getTodayFastingLog(progress);
  /** Only show "I broke my fast" when user has started fasting today and has not yet broken or marked complete */
  const fastingToday = !!todayLog && todayLog.status !== "broken" && !todayCompleted;

  // Is currently in fasting window? (after Fajr, before Maghrib) — for timer target
  const isFastingWindow =
    prayerTimes &&
    (() => {
      const now = new Date();
      const [fajrH, fajrM] = prayerTimes.fajr.split(":").map(Number);
      const [maghribH, maghribM] = prayerTimes.maghrib.split(":").map(Number);
      const fajr = new Date();
      fajr.setHours(fajrH, fajrM, 0);
      const maghrib = new Date();
      maghrib.setHours(maghribH, maghribM, 0);
      return now >= fajr && now < maghrib;
    })();

  // Dual countdown: Suhoor end (Fajr) and Iftar (Maghrib) — show "passed" when past
  const [suhoorPassed, setSuhoorPassed] = useState(false);
  const [iftarPassed, setIftarPassed] = useState(false);
  useEffect(() => {
    if (!prayerTimes) return;
    const interval = setInterval(() => {
      const now = new Date();
      const [fajrH, fajrM] = prayerTimes.fajr.split(":").map(Number);
      const [maghribH, maghribM] = prayerTimes.maghrib.split(":").map(Number);
      const fajr = new Date();
      fajr.setHours(fajrH, fajrM, 0);
      const maghrib = new Date();
      maghrib.setHours(maghribH, maghribM, 0);
      setSuhoorPassed(now >= fajr);
      setIftarPassed(now >= maghrib);
      if (now < fajr) {
        const d = fajr.getTime() - now.getTime();
        setCountdownSuhoorEnd({ h: Math.floor(d / 36e5), m: Math.floor((d % 36e5) / 6e4) });
      } else {
        setCountdownSuhoorEnd({ h: 0, m: 0 });
      }
      if (now < maghrib) {
        const d = maghrib.getTime() - now.getTime();
        setCountdownIftar({ h: Math.floor(d / 36e5), m: Math.floor((d % 36e5) / 6e4) });
      } else {
        setCountdownIftar({ h: 0, m: 0 });
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [prayerTimes]);
  
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
      
      <main className="main-content">
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
              Today's Fast
              <span className="block font-arabic text-lg text-secondary mt-1">صيام اليوم</span>
            </h1>
            <p className="text-muted-foreground mt-2">
              Track your current fast and monitor how you're feeling
            </p>
          </motion.div>
          
          {/* Today's fast status: mark fasted / broke — above countdown */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="mb-6 p-4 rounded-2xl bg-card border border-border"
          >
            <h3 className="font-display font-bold text-sm mb-3 text-muted-foreground">
              Today&apos;s fast • صيام اليوم
            </h3>
            {todayCompleted ? (
              <div className="py-3 px-4 rounded-xl bg-secondary/20 border border-secondary/40 text-center">
                <span className="font-medium text-secondary">You fasted today ✓</span>
                <span className="font-arabic text-secondary ml-2">صمت اليوم</span>
              </div>
            ) : todayBrokenEntry ? (
              <div className="py-3 px-4 rounded-xl border border-destructive/40 bg-destructive/10 text-center text-sm">
                <span className="font-medium text-destructive">You broke your fast today</span>
                {todayBrokenEntry.brokenReason && (
                  <span className="text-muted-foreground block mt-1">
                    {getBrokenReasonLabel(todayBrokenEntry.brokenReason)}
                  </span>
                )}
              </div>
            ) : (
              <div className={`flex flex-col sm:flex-row gap-2 ${fastingToday ? "" : "max-w-md"}`}>
                <button
                  onClick={() => completeFastingToday(progress, setProgress)}
                  className="flex-1 py-3 px-4 rounded-xl bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
                >
                  <Moon className="w-5 h-5" />
                  I fasted today — mark complete
                </button>
                {fastingToday && (
                  <button
                    type="button"
                    onClick={() => setShowBreakFastDialog(true)}
                    className="flex-1 py-3 px-4 rounded-xl border border-destructive/40 bg-destructive/10 text-destructive font-medium hover:bg-destructive/20 transition-colors flex items-center justify-center gap-2"
                  >
                    <AlertTriangle className="w-5 h-5" />
                    I broke my fast
                  </button>
                )}
              </div>
            )}
            <BreakFastReasonDialog
              open={showBreakFastDialog}
              onOpenChange={setShowBreakFastDialog}
              onSelectReason={(reasonId) => breakFastingToday(progress, setProgress, reasonId)}
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
                      {suhoorPassed ? "Suhoor ended" : "Until suhoor end"}
                      <span className="hidden sm:inline"> (Fajr)</span>
                    </span>
                    {suhoorPassed ? (
                      <span className="text-base sm:text-lg font-bold text-muted-foreground tabular-nums">
                        {prayerTimes.fajr}
                      </span>
                    ) : (
                      <span className="text-lg sm:text-xl font-bold text-secondary tabular-nums">
                        {String(countdownSuhoorEnd.h).padStart(2, "0")}:
                        {String(countdownSuhoorEnd.m).padStart(2, "0")}
                      </span>
                    )}
                  </div>
                </TooltipTrigger>
                <TooltipContent side="top" className="max-w-xs p-3">
                  <p className="font-semibold text-sm">{EATING_TIME_TOOLTIPS.suhoorEnds.title}</p>
                  <p className="text-xs text-muted-foreground mt-1">{EATING_TIME_TOOLTIPS.suhoorEnds.body}</p>
                  <p className="font-arabic text-xs text-muted-foreground mt-1" dir="rtl">{EATING_TIME_TOOLTIPS.suhoorEnds.bodyAr}</p>
                </TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="p-3 sm:p-4 rounded-2xl bg-card border border-border text-center cursor-help min-w-0">
                    <span className="text-xs text-muted-foreground block truncate">
                      {iftarPassed ? `${iftarLabel} passed` : `Until ${iftarLabel}`}
                    </span>
                    {iftarPassed ? (
                      <span className="text-base sm:text-lg font-bold text-muted-foreground tabular-nums">
                        {prayerTimes.maghrib}
                      </span>
                    ) : (
                      <span className="text-lg sm:text-xl font-bold text-secondary tabular-nums">
                        {String(countdownIftar.h).padStart(2, "0")}:
                        {String(countdownIftar.m).padStart(2, "0")}
                      </span>
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
                <ArabicHover arabic="تقدم الصيام" transliteration="taqaddum aṣ-ṣiyām">Fasting Progress</ArabicHover>
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
              <span className="truncate min-w-0" title="Fajr (dawn)"><span className="sm:inline hidden">Fajr </span>{prayerTimes?.fajr || '05:30'}</span>
              <span className="truncate min-w-0 shrink-0" title="Maghrib (sunset)"><span className="sm:inline hidden">Maghrib </span>{prayerTimes?.maghrib || '18:30'}</span>
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
              <ArabicHover arabic="نية اليوم">Today&apos;s intention</ArabicHover>
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
              Goal: {formatHydrationGoal(hydrationGoalMl, hydrationUnit)} (based on your region). Log water during {iftarLabelShort} and before Fajr only.
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
