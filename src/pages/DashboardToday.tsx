import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { 
  Moon, Sun, Clock, AlertTriangle, Battery, BatteryLow, BatteryMedium, BatteryFull,
  ArrowLeft, Droplets, Heart, ChevronRight, Zap
} from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { FastingTimer } from "@/components/FastingTimer";
import {
  useUserPreferences,
  useFastingProgress,
  startFastingToday,
  getTodayFastingLog,
  isFastingToday,
  useTodayData,
} from "@/hooks/useLocalStorage";
import { usePrayerTimes } from "@/hooks/usePrayerTimes";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { EATING_TIME_TOOLTIPS } from "@/data/eating-times-tooltips";
import { PrayerLocationBadge } from "@/components/PrayerLocationBadge";

const HYDRATION_GOAL = 8;

const DashboardToday = () => {
  const [preferences] = useUserPreferences();
  const [progress, setProgress] = useFastingProgress();
  const { intention, hydrationGlasses, energyEntries, setIntention, setHydrationGlasses, addEnergyEntry } = useTodayData();
  const [energyLevel, setEnergyLevel] = useState<1 | 2 | 3 | 4 | 5>(3);
  const [showBreakFast, setShowBreakFast] = useState(false);
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
  const fastingToday = isFastingToday(progress);
  const todayLog = getTodayFastingLog(progress);

  // Dual countdown: time until Suhoor ends (Fajr) and time until Iftar (Maghrib)
  useEffect(() => {
    if (!prayerTimes) return;
    const interval = setInterval(() => {
      const now = new Date();
      const [fajrH, fajrM] = prayerTimes.fajr.split(':').map(Number);
      const [maghribH, maghribM] = prayerTimes.maghrib.split(':').map(Number);
      const fajr = new Date(); fajr.setHours(fajrH, fajrM, 0);
      const maghrib = new Date(); maghrib.setHours(maghribH, maghribM, 0);
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
        const nextMaghrib = new Date(maghrib); nextMaghrib.setDate(nextMaghrib.getDate() + 1);
        const d = nextMaghrib.getTime() - now.getTime();
        setCountdownIftar({ h: Math.floor(d / 36e5), m: Math.floor((d % 36e5) / 6e4) });
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
      <Navbar />
      
      <main className="pt-20 pb-16">
        <div className="container mx-auto px-4 max-w-4xl">
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
          
          {/* Main Timer */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-8"
          >
            <FastingTimer 
              suhoorTime={prayerTimes?.imsak}
              iftarTime={prayerTimes?.maghrib}
            />
            {/* Log that you're fasting */}
            {!fastingToday && !progress.completedDays.includes(new Date().toISOString().split('T')[0]) && (
              <button
                onClick={() => startFastingToday(progress, setProgress)}
                className="mt-4 w-full py-3 px-4 rounded-xl bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
              >
                <Moon className="w-5 h-5" />
                I'm fasting — Log it
              </button>
            )}
            {fastingToday && todayLog && (
              <div className="mt-4 py-3 px-4 rounded-xl bg-secondary/20 border border-secondary/40 text-center text-sm">
                <span className="font-medium text-secondary">You're fasting</span>
                <span className="text-muted-foreground ml-2">
                  since {new Date(todayLog.startedAt).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}
                </span>
              </div>
            )}
          </motion.div>
          
          {/* Dual countdown */}
          {prayerTimes && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.12 }}
              className="mb-6 grid grid-cols-2 gap-4"
            >
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="p-4 rounded-2xl bg-card border border-border text-center cursor-help">
                    <span className="text-xs text-muted-foreground block">Until Suhoor ends (Fajr)</span>
                    <span className="text-xl font-bold text-secondary">{String(countdownSuhoorEnd.h).padStart(2, '0')}:{String(countdownSuhoorEnd.m).padStart(2, '0')}</span>
                  </div>
                </TooltipTrigger>
                <TooltipContent side="top" className="max-w-xs p-3">
                  <p className="font-semibold text-sm">{EATING_TIME_TOOLTIPS.suhoorEnds.title}</p>
                  <p className="text-xs text-muted-foreground mt-1">{EATING_TIME_TOOLTIPS.suhoorEnds.body}</p>
                </TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="p-4 rounded-2xl bg-card border border-border text-center cursor-help">
                    <span className="text-xs text-muted-foreground block">Until Iftar</span>
                    <span className="text-xl font-bold text-secondary">{String(countdownIftar.h).padStart(2, '0')}:{String(countdownIftar.m).padStart(2, '0')}</span>
                  </div>
                </TooltipTrigger>
                <TooltipContent side="top" className="max-w-xs p-3">
                  <p className="font-semibold text-sm">{EATING_TIME_TOOLTIPS.untilIftar.title}</p>
                  <p className="text-xs text-muted-foreground mt-1">{EATING_TIME_TOOLTIPS.untilIftar.body}</p>
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
              <span className="font-medium">Fasting Progress • تقدم الصيام</span>
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
            <div className="flex justify-between mt-2 text-xs text-muted-foreground">
              <span>Fajr {prayerTimes?.fajr || '05:30'}</span>
              <span>Maghrib {prayerTimes?.maghrib || '18:30'}</span>
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
            <h3 className="font-display font-bold mb-2">Today's intention</h3>
            <p className="text-sm text-muted-foreground mb-3">Set a short intention or goal for today's fast.</p>
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
                {energyLevel <= 2 && "Take it easy. Rest if needed and stay hydrated after iftar."}
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

          {/* Hydration tracker */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.32 }}
            className="mb-8 p-6 rounded-2xl bg-card border border-border"
          >
            <h3 className="font-display font-bold mb-2 flex items-center gap-2">
              <Droplets className="w-5 h-5 text-blue-500" />
              Hydration (non-fasting hours)
            </h3>
            <p className="text-sm text-muted-foreground mb-4">Goal: {HYDRATION_GOAL} glasses after iftar</p>
            <div className="flex items-center gap-4">
              <button
                onClick={() => setHydrationGlasses(hydrationGlasses - 1)}
                className="w-10 h-10 rounded-full border-2 border-border hover:border-secondary font-bold text-lg"
              >
                −
              </button>
              <span className="text-3xl font-bold min-w-[3rem] text-center">{hydrationGlasses}</span>
              <button
                onClick={() => setHydrationGlasses(hydrationGlasses + 1)}
                className="w-10 h-10 rounded-full border-2 border-secondary bg-secondary/10 font-bold text-lg"
              >
                +
              </button>
              <span className="text-sm text-muted-foreground">glasses</span>
            </div>
            <div className="mt-2 h-2 bg-muted rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-blue-500 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(100, (hydrationGlasses / HYDRATION_GOAL) * 100)}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>
          </motion.div>
          
          {/* Quick Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="grid grid-cols-2 gap-4 mb-8"
          >
            <div className="p-4 rounded-2xl bg-card border border-border text-center">
              <Droplets className="w-6 h-6 text-blue-500 mx-auto mb-2" />
              <span className="text-2xl font-bold block">8+</span>
              <span className="text-xs text-muted-foreground">Glasses of water needed after iftar</span>
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
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border-2 border-destructive/50 text-destructive hover:bg-destructive/10 transition-colors"
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
                    I need to break fast
                  </Link>
                  <button 
                    onClick={() => setShowBreakFast(false)}
                    className="flex-1 py-2 rounded-lg bg-muted text-sm font-medium"
                  >
                    I'm okay, continue
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
