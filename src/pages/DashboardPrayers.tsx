import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { 
  ArrowLeft, ChevronRight, Sun, Moon, Sunrise, Sunset, SunDim, Check, Bell, Volume2, Play
} from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { useUserPreferences, useLocalStorage, usePrayerNotificationPrefs, useAdhanSoundEnabled, useDisplayTimezone } from "@/hooks/useLocalStorage";
import { usePrayerTimes } from "@/hooks/usePrayerTimes";
import { useNotifications } from "@/hooks/useNotifications";
import { playAdhan } from "@/lib/adhanAudio";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { EATING_TIME_TOOLTIPS } from "@/data/eating-times-tooltips";
import { GENERAL_TOOLTIPS } from "@/data/general-tooltips";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { PrayerLocationBadge } from "@/components/PrayerLocationBadge";
import { ArabicHover } from "@/components/ArabicHover";
import { LocationRequiredCTA } from "@/components/LocationRequiredCTA";
import { ApiErrorRetry } from "@/components/ApiErrorRetry";
import { PageSEO } from "@/components/PageSEO";
import { getNowInTimezone, toLocalDateString } from "@/lib/utils";

const DashboardPrayers = () => {
  const [preferences] = useUserPreferences();
  const displayTimezone = useDisplayTimezone();
  const hasLocation = !!(preferences.locationCoords?.lat != null && preferences.locationCoords?.lng != null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [prayerTracker, setPrayerTracker] = useLocalStorage<Record<string, Record<string, boolean>>>("tryramadan-prayer-tracker", {});
  const [prayerNotifications, setPrayerNotifications] = usePrayerNotificationPrefs();
  const [adhanSoundEnabled, setAdhanSoundEnabled] = useAdhanSoundEnabled();
  // Taraweeh tracker: which nights attended, and which juz they're on
  const [taraweehTracker, setTaraweehTracker] = useLocalStorage<Record<string, { attended: boolean; juz: number | null; mosque?: string }>>("tryramadan-taraweeh-tracker", {});
  const [taraweehMosque, setTaraweehMosque] = useLocalStorage<string>("tryramadan-taraweeh-mosque", "");
  const { permission, requestPermission, supported } = useNotifications();
  const todayStr = displayTimezone
    ? new Date().toLocaleDateString("en-CA", { timeZone: displayTimezone })
    : toLocalDateString(new Date());
  const todayPrayers = prayerTracker[todayStr] || {};
  const setTodayPrayer = (name: string, done: boolean) => {
    setPrayerTracker((prev) => ({
      ...prev,
      [todayStr]: { ...(prev[todayStr] || {}), [name]: done },
    }));
  };
  
  const { prayerTimes, hijriDate, loading, error: prayerError, refetch: refetchPrayers, isFromCache } = usePrayerTimes(
    preferences.locationCoords?.lat ?? null,
    preferences.locationCoords?.lng ?? null,
    displayTimezone
  );
  
  useEffect(() => {
    const interval = setInterval(() => setCurrentTime(new Date()), 2000); // Throttle for INP
    return () => clearInterval(interval);
  }, []);
  
  const prayers = prayerTimes ? [
    { name: 'Fajr', nameAr: 'الفجر', time: prayerTimes.fajr, icon: Sunrise, description: 'Dawn prayer - marks the start of fasting', highlight: true },
    { name: 'Sunrise', nameAr: 'الشروق', time: prayerTimes.sunrise, icon: Sun, description: 'Sun rises - fasting continues' },
    { name: 'Dhuhr', nameAr: 'الظهر', time: prayerTimes.dhuhr, icon: Sun, description: 'Midday prayer' },
    { name: 'Asr', nameAr: 'العصر', time: prayerTimes.asr, icon: SunDim, description: 'Afternoon prayer' },
    { name: 'Maghrib', nameAr: 'المغرب', time: prayerTimes.maghrib, icon: Sunset, description: 'Sunset prayer - time to break fast (Iftar)', highlight: true },
    { name: 'Isha', nameAr: 'العشاء', time: prayerTimes.isha, icon: Moon, description: 'Night prayer' },
  ] : [];
  
  const getNextPrayer = (): { name: string; minutesUntil: number } | null => {
    if (!prayerTimes || prayers.length === 0) return null;
    const nowMinutes = displayTimezone
      ? (() => {
          const n = getNowInTimezone(displayTimezone);
          return n.hours * 60 + n.minutes + n.seconds / 60;
        })()
      : hasLocation
        ? 0
        : currentTime.getHours() * 60 + currentTime.getMinutes() + currentTime.getSeconds() / 60;
    for (const prayer of prayers) {
      const [h, m] = prayer.time.split(':').map(Number);
      const prayerMinutes = h * 60 + m;
      if (prayerMinutes > nowMinutes) return { name: prayer.name, minutesUntil: prayerMinutes - nowMinutes };
    }
    const [fajrH, fajrM] = prayers[0].time.split(':').map(Number);
    const fajrToday = fajrH * 60 + fajrM;
    const minutesUntilMidnight = 24 * 60 - nowMinutes;
    return { name: "Fajr", minutesUntil: minutesUntilMidnight + fajrToday };
  };
  
  const nextPrayerResult = getNextPrayer();
  const nextPrayer = nextPrayerResult?.name ?? null;
  const minutesUntilNext = nextPrayerResult?.minutesUntil ?? 0;
  const countdownNext = nextPrayer ? `${Math.floor(minutesUntilNext / 60)}h ${Math.floor(minutesUntilNext % 60)}m` : "";

  const isMuslim = preferences.userType === "muslim";
  return (
    <div className="min-h-screen bg-background">
      <PageSEO
        title={isMuslim ? "Prayer Times | TryRamadan.app" : "Fasting Times | TryRamadan.app"}
        description={isMuslim ? "Daily prayer times for your location: Fajr, Dhuhr, Asr, Maghrib, Isha. Track prayers and set suhoor/iftar reminders." : "Fasting times for your location: when to stop eating (Fajr) and when to break fast (Maghrib)."}
        path="/dashboard/prayers"
      />
      <Navbar />
      
      <main id="main-content" className="main-content">
        <div className="container mx-auto px-4 max-w-4xl min-w-0">
          {preferences.userType !== "muslim" && (
            <div className="mb-4 p-3 rounded-xl bg-muted/50 border border-border text-sm text-muted-foreground">
              Fasting times for your location. Prayer logging and adhan reminders are for Muslims; you can still use Fajr and Maghrib as your eating cutoff and break-fast times.
            </div>
          )}
          <Link 
            to="/dashboard" 
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </Link>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <Tooltip>
              <TooltipTrigger asChild>
                <h1 className="text-2xl md:text-3xl font-display font-bold cursor-help border-b border-dotted border-transparent hover:border-muted-foreground/40 w-fit">
                  {isMuslim ? "Prayer Times" : "Fasting Times"}
                </h1>
              </TooltipTrigger>
              <TooltipContent className="max-w-xs p-3">
                <p className="text-sm text-foreground">{isMuslim ? GENERAL_TOOLTIPS.prayerTimes.body : "Fajr = eating cutoff (suhoor end). Maghrib = time to break fast. Other times shown for context."}</p>
                {isMuslim && <p className="text-xs text-muted-foreground mt-2 pt-2 border-t border-border/50">Arabic: <span className="font-arabic" dir="rtl">{GENERAL_TOOLTIPS.prayerTimes.bodyAr}</span></p>}
              </TooltipContent>
            </Tooltip>
            <p className="text-muted-foreground mt-2 flex flex-wrap items-center gap-x-4 gap-y-1">
              <PrayerLocationBadge />
            </p>
          </motion.div>
          
          {/* Current time and date */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="p-6 rounded-2xl bg-primary text-primary-foreground mb-8"
          >
            <div className="text-center">
              <p className="text-sm opacity-80 mb-1">
                {displayTimezone
                  ? currentTime.toLocaleDateString('en', {
                      weekday: 'long',
                      month: 'long',
                      day: 'numeric',
                      year: 'numeric',
                      timeZone: displayTimezone,
                    })
                  : hasLocation
                    ? "—"
                    : currentTime.toLocaleDateString('en', {
                        weekday: 'long',
                        month: 'long',
                        day: 'numeric',
                        year: 'numeric',
                      })}
              </p>
              {hijriDate && preferences.userType === "muslim" && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <p className="text-sm opacity-80 mb-3 cursor-help border-b border-dotted border-primary-foreground/30 w-fit">
                      {hijriDate.day} {hijriDate.month} {hijriDate.year} AH
                    </p>
                  </TooltipTrigger>
                  <TooltipContent className="max-w-xs p-3">
                    <p className="text-sm text-foreground">{GENERAL_TOOLTIPS.hijriDate.body}</p>
                    <p className="text-xs text-muted-foreground mt-2 pt-2 border-t border-border/50">Arabic: <span className="font-arabic" dir="rtl">{hijriDate.monthAr} · {GENERAL_TOOLTIPS.hijriDate.bodyAr}</span></p>
                  </TooltipContent>
                </Tooltip>
              )}
              <p className="text-5xl font-bold font-display">
                {displayTimezone
                  ? currentTime.toLocaleTimeString('en', {
                      hour: '2-digit',
                      minute: '2-digit',
                      second: '2-digit',
                      timeZone: displayTimezone,
                    })
                  : hasLocation
                    ? "—:——:——"
                    : currentTime.toLocaleTimeString('en', {
                        hour: '2-digit',
                        minute: '2-digit',
                        second: '2-digit',
                      })}
              </p>
              {nextPrayer && (
                <div className="mt-3" aria-live="polite" aria-atomic="true" role="status">
                  <p className="text-secondary">
                    Next: <span className="font-bold">{nextPrayer}</span>
                  </p>
                  <p className="text-sm opacity-90">Countdown: <span className="font-bold">{countdownNext}</span></p>
                </div>
              )}
            </div>
          </motion.div>
          
          {/* Prayer times list — min-height reserves space to avoid CLS when times load */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className={`space-y-3 ${loading ? "min-h-[420px] flex flex-col justify-center" : ""}`}
          >
            {loading ? (
              <div className="text-center py-8 text-muted-foreground">Loading prayer times…</div>
            ) : prayerError && !isFromCache ? (
              <ApiErrorRetry
                title="Could not load prayer times"
                message={prayerError}
                onRetry={() => refetchPrayers()}
                showSetLocation
              />
            ) : !preferences.locationCoords?.lat && !preferences.locationCoords?.lng ? (
              <LocationRequiredCTA message="Set your location for accurate prayer times." />
            ) : (
              <>
                {isFromCache && (
                  <div className="mb-4 rounded-xl border border-amber-500/40 bg-amber-500/10 px-4 py-3 text-sm text-amber-800 dark:text-amber-200 flex flex-wrap items-center justify-center gap-2">
                    <span>
                      {typeof navigator !== "undefined" && !navigator.onLine
                        ? "Showing cached prayer times. You're offline."
                        : "Times may be outdated."}
                    </span>
                    {typeof navigator !== "undefined" && navigator.onLine && (
                      <Button variant="outline" size="sm" onClick={() => refetchPrayers()}>Try again</Button>
                    )}
                  </div>
                )}
                {prayers.map((prayer, index) => {
              const Icon = prayer.icon;
              const isNext = prayer.name === nextPrayer;
              
              return (
                <motion.div
                  key={prayer.name}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 * index }}
                  className={`
                    p-4 rounded-2xl border transition-all
                    ${isNext ? 'bg-secondary/20 border-secondary shadow-gold' : 'bg-card border-border'}
                    ${prayer.highlight ? 'ring-1 ring-secondary/30' : ''}
                  `}
                >
                  <div className="flex items-center gap-4">
                    <div className={`
                      w-12 h-12 rounded-xl flex items-center justify-center
                      ${isNext ? 'bg-secondary text-secondary-foreground' : 'bg-muted'}
                    `}>
                      <Icon className="w-6 h-6" />
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <ArabicHover
                          arabic={prayer.nameAr}
                          explanation={
                            prayer.name === "Fajr" ? EATING_TIME_TOOLTIPS.fajr.body :
                            prayer.name === "Sunrise" ? EATING_TIME_TOOLTIPS.sunrise.body :
                            prayer.name === "Dhuhr" ? EATING_TIME_TOOLTIPS.dhuhr.body :
                            prayer.name === "Asr" ? EATING_TIME_TOOLTIPS.asr.body :
                            prayer.name === "Maghrib" ? EATING_TIME_TOOLTIPS.maghrib.body :
                            prayer.name === "Isha" ? EATING_TIME_TOOLTIPS.isha.body : prayer.description
                          }
                        >
                          <span className="font-bold">{prayer.name}</span>
                        </ArabicHover>
                        {isNext && (
                          <span className="px-2 py-0.5 rounded-full bg-secondary text-secondary-foreground text-xs">
                            Next
                          </span>
                        )}
                      </div>
                      {prayer.name === "Fajr" || prayer.name === "Maghrib" ? (
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <p className="text-sm text-muted-foreground cursor-help border-b border-dotted border-muted-foreground/40 w-fit">
                              {prayer.description}
                            </p>
                          </TooltipTrigger>
                          <TooltipContent side="bottom" className="max-w-xs p-3">
                            <p className="font-semibold text-sm">
                              {prayer.name === "Fajr" ? EATING_TIME_TOOLTIPS.fajr.title : EATING_TIME_TOOLTIPS.maghrib.title}
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">
                              {prayer.name === "Fajr" ? EATING_TIME_TOOLTIPS.fajr.body : EATING_TIME_TOOLTIPS.maghrib.body}
                            </p>
                          </TooltipContent>
                        </Tooltip>
                      ) : (
                        <p className="text-sm text-muted-foreground">{prayer.description}</p>
                      )}
                    </div>
                    
                    <div className="text-right flex items-center gap-3 flex-wrap justify-end">
                      {preferences.userType === "muslim" && ["Fajr", "Dhuhr", "Asr", "Maghrib", "Isha"].includes(prayer.name) && (
                        <div className="flex items-center gap-2">
                          <Bell className="w-4 h-4 text-muted-foreground" />
                          <Switch
                            id={`notify-${prayer.name}`}
                            checked={prayerNotifications[prayer.name] !== false}
                            onCheckedChange={(checked) => {
                              setPrayerNotifications((prev) => ({ ...prev, [prayer.name]: checked }));
                            }}
                          />
                          <Label htmlFor={`notify-${prayer.name}`} className="text-xs text-muted-foreground sr-only">
                            Notify for {prayer.name}
                          </Label>
                        </div>
                      )}
                      <span className="text-2xl font-bold">{prayer.time}</span>
                      {preferences.userType === "muslim" && ["Fajr", "Dhuhr", "Asr", "Maghrib", "Isha"].includes(prayer.name) && (
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.preventDefault();
                                setTodayPrayer(prayer.name, !todayPrayers[prayer.name]);
                              }}
                              className={`p-2 rounded-lg border-2 transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center ${
                                todayPrayers[prayer.name] ? "bg-secondary border-secondary text-secondary-foreground" : "border-border hover:border-secondary"
                              }`}
                              aria-label={todayPrayers[prayer.name] ? `Mark ${prayer.name} as not prayed` : `Mark ${prayer.name} as prayed`}
                            >
                              <Check className="w-5 h-5" />
                            </button>
                          </TooltipTrigger>
                          <TooltipContent side="left">
                            {todayPrayers[prayer.name] ? "Mark as not prayed" : "Mark as prayed"}
                          </TooltipContent>
                        </Tooltip>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
              </>
            )}
          </motion.div>
          
          {/* Taraweeh Tracker (Muslim mode only) */}
          {preferences.userType === "muslim" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.22 }}
            className="mt-6 p-5 rounded-2xl bg-card border border-border"
          >
            <h3 className="font-display font-bold flex items-center gap-2 mb-1">
              <Moon className="w-5 h-5 text-secondary" />
              Taraweeh Tracker
              <span className="font-arabic text-sm text-secondary ml-1">تراويح</span>
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              Track your nightly Taraweeh attendance and which juz of the Quran is being recited at your mosque.
            </p>

            {/* Mosque name */}
            <div className="mb-4">
              <Label htmlFor="taraweeh-mosque" className="text-sm font-medium mb-1 block">Your mosque (optional)</Label>
              <input
                id="taraweeh-mosque"
                type="text"
                value={taraweehMosque}
                onChange={(e) => setTaraweehMosque(e.target.value)}
                placeholder="e.g. Islamic Center of NYC"
                className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm"
              />
            </div>

            {/* Tonight's Taraweeh */}
            <div className="p-4 rounded-xl bg-muted/50 border border-border mb-4">
              <div className="flex items-center justify-between flex-wrap gap-2 mb-3">
                <span className="font-medium text-sm">Tonight ({todayStr})</span>
                <button
                  type="button"
                  onClick={() => {
                    const current = taraweehTracker[todayStr];
                    setTaraweehTracker((prev) => ({
                      ...prev,
                      [todayStr]: {
                        attended: !current?.attended,
                        juz: current?.juz ?? null,
                        mosque: taraweehMosque || undefined,
                      },
                    }));
                  }}
                  className={`min-h-[44px] px-4 py-2 rounded-lg border-2 text-sm font-medium transition-colors flex items-center gap-2 ${
                    taraweehTracker[todayStr]?.attended
                      ? "bg-secondary border-secondary text-secondary-foreground"
                      : "border-border hover:border-secondary"
                  }`}
                >
                  <Check className="w-4 h-4" />
                  {taraweehTracker[todayStr]?.attended ? "Attended ✓" : "Mark attended"}
                </button>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <Label htmlFor="taraweeh-juz-today" className="text-sm text-muted-foreground shrink-0">Juz being recited:</Label>
                <select
                  id="taraweeh-juz-today"
                  value={taraweehTracker[todayStr]?.juz ?? ""}
                  onChange={(e) => {
                    const juz = e.target.value ? parseInt(e.target.value, 10) : null;
                    setTaraweehTracker((prev) => ({
                      ...prev,
                      [todayStr]: {
                        ...prev[todayStr],
                        attended: prev[todayStr]?.attended ?? true,
                        juz,
                        mosque: taraweehMosque || undefined,
                      },
                    }));
                  }}
                  className="px-2 py-1.5 rounded-lg border border-border bg-background text-sm min-w-[80px]"
                >
                  <option value="">—</option>
                  {Array.from({ length: 30 }, (_, i) => (
                    <option key={i + 1} value={i + 1}>Juz {i + 1}</option>
                  ))}
                </select>
                {taraweehTracker[todayStr]?.juz && (
                  <a
                    href={`/dashboard/quran`}
                    className="text-xs text-secondary hover:underline"
                  >
                    Read Juz {taraweehTracker[todayStr].juz}
                  </a>
                )}
              </div>
            </div>

            {/* Progress summary */}
            {(() => {
              const entries = Object.entries(taraweehTracker);
              const attendedCount = entries.filter(([, v]) => v.attended).length;
              const juzSet = new Set(entries.filter(([, v]) => v.juz != null).map(([, v]) => v.juz));
              const highestJuz = juzSet.size > 0 ? Math.max(...[...juzSet] as number[]) : 0;
              return (
                <div className="grid grid-cols-3 gap-3 text-center">
                  <div className="p-3 rounded-xl bg-secondary/10 border border-secondary/20">
                    <span className="block text-2xl font-bold text-secondary">{attendedCount}</span>
                    <span className="text-xs text-muted-foreground">Nights attended</span>
                  </div>
                  <div className="p-3 rounded-xl bg-secondary/10 border border-secondary/20">
                    <span className="block text-2xl font-bold text-secondary">{juzSet.size}</span>
                    <span className="text-xs text-muted-foreground">Juz covered</span>
                  </div>
                  <div className="p-3 rounded-xl bg-secondary/10 border border-secondary/20">
                    <span className="block text-2xl font-bold text-secondary">{highestJuz}/30</span>
                    <span className="text-xs text-muted-foreground">Quran progress</span>
                  </div>
                </div>
              );
            })()}

            {/* Recent history */}
            {Object.entries(taraweehTracker).filter(([, v]) => v.attended).length > 0 && (
              <div className="mt-4">
                <h4 className="text-sm font-medium mb-2">Recent nights</h4>
                <div className="flex flex-wrap gap-1.5">
                  {Object.entries(taraweehTracker)
                    .filter(([, v]) => v.attended)
                    .sort(([a], [b]) => b.localeCompare(a))
                    .slice(0, 10)
                    .map(([date, v]) => (
                      <span
                        key={date}
                        className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-secondary/10 border border-secondary/20 text-xs"
                        title={`${date}${v.juz ? ` — Juz ${v.juz}` : ""}${v.mosque ? ` at ${v.mosque}` : ""}`}
                      >
                        <Check className="w-3 h-3 text-secondary" />
                        {new Date(date + "T12:00:00").toLocaleDateString("en", { month: "short", day: "numeric" })}
                        {v.juz && <span className="text-secondary font-medium">J{v.juz}</span>}
                      </span>
                    ))}
                </div>
              </div>
            )}
          </motion.div>
          )}

          {/* Adhan: enable notification + play sound + test (Muslim users only) */}
          {preferences.userType === "muslim" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="mt-6 p-4 rounded-2xl bg-card border border-border"
          >
            <Tooltip>
              <TooltipTrigger asChild>
                <h3 className="font-display font-bold flex items-center gap-2 mb-3 cursor-help border-b border-dotted border-transparent hover:border-muted-foreground/40 w-fit">
                  <Volume2 className="w-4 h-4 text-secondary" />
                  Adhan at prayer times
                </h3>
              </TooltipTrigger>
              <TooltipContent className="max-w-xs p-3">
                <p className="text-sm text-foreground">{GENERAL_TOOLTIPS.adhan.body}</p>
                <p className="text-xs text-muted-foreground mt-2 pt-2 border-t border-border/50">Arabic: <span className="font-arabic" dir="rtl">{GENERAL_TOOLTIPS.adhan.bodyAr}</span></p>
              </TooltipContent>
            </Tooltip>
            <p className="text-sm text-muted-foreground mb-4">
              Get a browser notification at each prayer time (Fajr, Dhuhr, Asr, Maghrib, Isha). Use the toggles above per prayer. Optionally play adhan sound when the notification fires.
            </p>
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-2">
                <Switch
                  id="adhan-sound"
                  checked={adhanSoundEnabled}
                  onCheckedChange={setAdhanSoundEnabled}
                />
                <Label htmlFor="adhan-sound" className="text-sm cursor-pointer">
                  Play adhan sound when notifying
                </Label>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="gap-2"
                onClick={async () => {
                  if (!supported) return;
                  let canNotify = permission === "granted";
                  if (!canNotify) {
                    canNotify = await requestPermission();
                  }
                  if (canNotify) {
                    new Notification("Adhan • Test • أذان", {
                      body: "This is a test. You will get adhan notifications at prayer times when enabled.",
                      icon: "/favicon.png",
                      tag: "adhan-test",
                    });
                  }
                  if (adhanSoundEnabled) playAdhan();
                }}
              >
                <Play className="w-4 h-4" />
                Test adhan
              </Button>
            </div>
            {supported && permission === "denied" && (
              <p className="text-xs text-muted-foreground mt-3">
                Notifications are blocked. Enable them in your browser or device settings for this site to get adhan alerts.
              </p>
            )}
          </motion.div>
          )}

          {/* Notification note — only relevant for Muslims (prayer reminders) */}
          {preferences.userType === "muslim" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-6 p-4 rounded-2xl bg-muted/50 border border-border text-sm text-muted-foreground"
          >
            <p className="flex items-center gap-2">
              <Bell className="w-4 h-4 shrink-0" />
              Prayer reminders use browser notifications. Enable notifications in your device settings and allow this site to send them when prompted.
            </p>
          </motion.div>
          )}

          {/* Prayer tutorial link — learning is for everyone */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mt-8 p-4 rounded-2xl bg-muted/50 border border-border"
          >
            <Link 
              to="/dashboard/learn"
              className="flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">🤲</span>
                <div>
                  <span className="font-medium">New to Islamic Prayer?</span>
                  <p className="text-sm text-muted-foreground">Learn about the five daily prayers</p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-muted-foreground" />
            </Link>
          </motion.div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default DashboardPrayers;
