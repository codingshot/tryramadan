import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Moon, Sun, Clock, Calendar, MapPin, Loader2, Sunrise, Sunset, Bell, Utensils } from "lucide-react";
import { usePrayerTimes, usePrayerTimesForDate, getSunnahFastingInfo } from "@/hooks/usePrayerTimes";
import { useUserPreferences, useNotificationSettings, usePrayerNotificationPrefs, useIftarLabel, useDisplayTimezone } from "@/hooks/useLocalStorage";
import { getNowSecondsSinceMidnightInTimezone, getTodayStringInTimezone, timeStringToSecondsSinceMidnight, secondsUntilTimeInTimezone, toLocalDateString } from "@/lib/utils";
import { useAutoLocation } from "@/hooks/useLocation";
import { Link } from "react-router-dom";
import { LocationRequiredCTA } from "@/components/LocationRequiredCTA";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { EATING_TIME_TOOLTIPS } from "@/data/eating-times-tooltips";
import { GENERAL_TOOLTIPS } from "@/data/general-tooltips";
import { SunnahFastingBadge } from "./SunnahFastingBadge";
import { RamadanStartInfoDialog } from "./RamadanStartInfoDialog";
import { getDaysUntilRamadan, isCurrentlyRamadan } from "@/lib/ramadan";

interface FastingTimerProps {
  suhoorTime?: string;
  iftarTime?: string;
  isFasting?: boolean;
  /** When false, hide the "days until Ramadan" badge and "Add to calendar" link (e.g. on home where that lives in the green section below). */
  showDaysUntilRamadan?: boolean;
}

export const FastingTimer = ({ 
  suhoorTime: propSuhoorTime, 
  iftarTime: propIftarTime,
  isFasting = true,
  showDaysUntilRamadan = true,
}: FastingTimerProps) => {
  const [timeRemaining, setTimeRemaining] = useState({ hours: 0, minutes: 0, seconds: 0 });
  const [nextLabel, setNextLabel] = useState<"Suhoor end" | "Iftar">("Iftar");
  const [nextTimeStr, setNextTimeStr] = useState("");
  const [isEatingPeriod, setIsEatingPeriod] = useState(false); // true = between iftar and suhoor end (can eat)
  const [daysUntilRamadan, setDaysUntilRamadan] = useState(0);
  const [isRamadan, setIsRamadan] = useState(false);
  const [notifSettings] = useNotificationSettings();
  const [prayerPrefs] = usePrayerNotificationPrefs();
  const iftarLabel = useIftarLabel();

  useEffect(() => {
    setDaysUntilRamadan(getDaysUntilRamadan());
    setIsRamadan(isCurrentlyRamadan());
    const t = setInterval(() => {
      setDaysUntilRamadan(getDaysUntilRamadan());
      setIsRamadan(isCurrentlyRamadan());
    }, 60000); // update once per minute
    return () => clearInterval(t);
  }, []);
  const [localTime, setLocalTime] = useState("");
  const [ramadanInfoOpen, setRamadanInfoOpen] = useState(false);
  const [preferences] = useUserPreferences();
  const displayTimezone = useDisplayTimezone();
  const { location: autoLocation } = useAutoLocation();
  // Throttle interval for INP: 2s for countdown/local time instead of 1s
  const TICK_MS = 2000;
  const displayLocation = preferences.location || (autoLocation ? autoLocation.displayName : null);
  const locationShort = displayLocation ? displayLocation.split(",").slice(0, 2).join(",").trim() : null;

  // Use saved location or auto-detected — so hero timer has accurate times when location isn't saved yet
  const effectiveLat = preferences.locationCoords?.lat ?? autoLocation?.lat ?? null;
  const effectiveLng = preferences.locationCoords?.lng ?? autoLocation?.lng ?? null;

  const { prayerTimes, hijriDate, loading, error, refetch: refetchPrayers, isFromCache } = usePrayerTimes(
    effectiveLat,
    effectiveLng,
    displayTimezone
  );

  // Tomorrow's date (same timezone as today) for post-iftar suhoor countdown
  const todayStr = displayTimezone
    ? getTodayStringInTimezone(displayTimezone)
    : toLocalDateString(new Date());
  const tomorrowDate = new Date(todayStr + "T12:00:00");
  tomorrowDate.setDate(tomorrowDate.getDate() + 1);
  const tomorrowStr = toLocalDateString(tomorrowDate);
  const { prayerTimes: tomorrowPrayerTimes } = usePrayerTimesForDate(
    effectiveLat,
    effectiveLng,
    tomorrowStr
  );
  // Use tomorrow's imsak when past iftar (suhoor/imsak change day by day)
  const suhoorTomorrowTime = tomorrowPrayerTimes?.fajr ?? prayerTimes?.fajr ?? propSuhoorTime ?? "05:23";

  // Use API times if available, otherwise use props or defaults
  const suhoorTime = prayerTimes?.fajr || propSuhoorTime || "05:23";
  const iftarTime = prayerTimes?.maghrib || propIftarTime || "18:47";

  // Get Sunnah fasting info
  const sunnahInfo = getSunnahFastingInfo();

  const hasLocation = effectiveLat != null && effectiveLng != null;
  useEffect(() => {
    const formatLocalTime = () => {
      if (displayTimezone) {
        setLocalTime(
          new Date().toLocaleTimeString(undefined, {
            hour: "numeric",
            minute: "2-digit",
            hour12: true,
            timeZone: displayTimezone,
          })
        );
      } else if (hasLocation) {
        setLocalTime("—");
      } else {
        setLocalTime(
          new Date().toLocaleTimeString(undefined, {
            hour: "numeric",
            minute: "2-digit",
            hour12: true,
          })
        );
      }
    };
    formatLocalTime();
    const t = setInterval(formatLocalTime, TICK_MS);
    return () => clearInterval(t);
  }, [displayTimezone, hasLocation, TICK_MS]);

  const imsakSec = timeStringToSecondsSinceMidnight(suhoorTime);
  const maghribSec = timeStringToSecondsSinceMidnight(iftarTime);
  const imsakTomorrowSec = timeStringToSecondsSinceMidnight(suhoorTomorrowTime);

  useEffect(() => {
    const interval = setInterval(() => {
      if (displayTimezone) {
        const nowSec = getNowSecondsSinceMidnightInTimezone(displayTimezone);
        let diff: number;
        let label: "Suhoor end" | "Iftar";
        let eating: boolean;
        let displayTime: string;
        const maghribValid = maghribSec > 12 * 3600 && maghribSec < 24 * 3600;
        if (nowSec < imsakSec) {
          diff = secondsUntilTimeInTimezone(nowSec, imsakSec);
          label = "Suhoor end";
          eating = true;
          displayTime = suhoorTime;
        } else if (!maghribValid || nowSec < maghribSec) {
          diff = maghribValid ? secondsUntilTimeInTimezone(nowSec, maghribSec) : secondsUntilTimeInTimezone(nowSec, 18 * 3600);
          label = "Iftar";
          eating = false;
          displayTime = iftarTime;
        } else {
          // Past iftar: count down to tomorrow's suhoor end (imsak changes day by day)
          diff = secondsUntilTimeInTimezone(nowSec, imsakTomorrowSec);
          label = "Suhoor end";
          eating = true;
          displayTime = suhoorTomorrowTime;
        }
        setIsEatingPeriod(eating);
        setNextLabel(label);
        const [h, m] = displayTime.split(":").map((x) => parseInt(x, 10));
        setNextTimeStr(String(h ?? 0).padStart(2, "0") + ":" + String(m ?? 0).padStart(2, "0"));
        setTimeRemaining({
          hours: Math.floor(diff / 3600),
          minutes: Math.floor((diff % 3600) / 60),
          seconds: diff % 60,
        });
      } else {
        const now = new Date();
        const [suhoorH, suhoorM] = suhoorTime.split(":").map(Number);
        const [suhoorTomorrowH, suhoorTomorrowM] = suhoorTomorrowTime.split(":").map(Number);
        const [iftarH, iftarM] = iftarTime.split(":").map(Number);
        const maghribValid = Number.isFinite(iftarH) && iftarH >= 12 && iftarH < 24;
        const imsakToday = new Date();
        imsakToday.setHours(suhoorH, suhoorM, 0, 0);
        const maghribToday = new Date();
        maghribToday.setHours(iftarH, iftarM, 0, 0);
        const imsakTomorrow = new Date();
        imsakTomorrow.setDate(imsakTomorrow.getDate() + 1);
        imsakTomorrow.setHours(suhoorTomorrowH, suhoorTomorrowM, 0, 0);
        let target: Date;
        let label: "Suhoor end" | "Iftar";
        let eating: boolean;
        if (now < imsakToday) {
          target = imsakToday;
          label = "Suhoor end";
          eating = true;
        } else if (!maghribValid || now < maghribToday) {
          if (!maghribValid) {
            const fallback = new Date();
            fallback.setHours(18, 0, 0, 0);
            target = fallback.getTime() <= now.getTime() ? imsakTomorrow : fallback;
          } else {
            target = maghribToday;
          }
          label = "Iftar";
          eating = false;
        } else {
          target = imsakTomorrow;
          label = "Suhoor end";
          eating = true;
        }
        setIsEatingPeriod(eating);
        setNextLabel(label);
        setNextTimeStr(target.getHours().toString().padStart(2, "0") + ":" + target.getMinutes().toString().padStart(2, "0"));
        const diff = target.getTime() - now.getTime();
        setTimeRemaining({
          hours: Math.max(0, Math.floor(diff / 36e5)),
          minutes: Math.max(0, Math.floor((diff % 36e5) / 6e4)),
          seconds: Math.max(0, Math.floor((diff % 6e4) / 1000)),
        });
      }
    }, TICK_MS);
    return () => clearInterval(interval);
  }, [suhoorTime, suhoorTomorrowTime, iftarTime, displayTimezone, imsakSec, imsakTomorrowSec, maghribSec, TICK_MS]);

  const formatNumber = (num: number) => num.toString().padStart(2, '0');

  return (
    <motion.div 
      className="timer-display relative overflow-hidden min-h-[300px]"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      style={{ contain: "layout" }}
    >
      <div className="absolute inset-0 pattern-islamic opacity-10" />
      
      <div className="relative z-10">
        {/* Sunnah Fasting Badge */}
        {sunnahInfo && (
          <div className="mb-4">
            <SunnahFastingBadge hijriDay={hijriDate ? parseInt(hijriDate.day) : undefined} />
          </div>
        )}

        {/* Days until Ramadan Badge (double-click for when Ramadan starts) — hidden on home where the green section below has this. */}
        {showDaysUntilRamadan && !isRamadan && daysUntilRamadan > 0 && (
          <>
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-4"
            >
              <Link
                to="/dashboard"
                onDoubleClick={(e) => {
                  e.preventDefault();
                  setRamadanInfoOpen(true);
                }}
                className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-full bg-secondary/20 mx-auto w-fit cursor-pointer select-none hover:bg-secondary/25 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-secondary no-underline"
                title="Dashboard: countdown and add Ramadan times to calendar. Double-click for when Ramadan starts."
              >
                <Calendar className="w-4 h-4 text-secondary" aria-hidden />
                <span className="text-secondary font-bold text-lg">{daysUntilRamadan}</span>
                <span className="text-primary-foreground/80 text-sm">
                  days until Ramadan
                </span>
              </Link>
            </motion.div>
            <RamadanStartInfoDialog open={ramadanInfoOpen} onOpenChange={setRamadanInfoOpen} />
          </>
        )}
        
        {isRamadan && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-center gap-2 mb-4 px-4 py-2 rounded-full bg-secondary/30 mx-auto w-fit"
          >
            <span className="text-2xl">🌙</span>
            <span className="text-secondary font-bold">
              Ramadan Mubarak! • رمضان مبارك
            </span>
          </motion.div>
        )}

        {/* Hijri Date (Muslim users only) */}
        {hijriDate && preferences.userType === "muslim" && (
          <div className="text-center mb-3">
            <span className="text-sm text-primary-foreground/60">
              {hijriDate.day} {hijriDate.month} {hijriDate.year} AH
            </span>
          </div>
        )}

        {/* Location + local time (next to city) — city clickable to change */}
        {(locationShort || preferences.location) && (
          <div className="flex items-center justify-center gap-1.5 mb-3 text-primary-foreground/60 flex-wrap">
            <MapPin className="w-3 h-3 shrink-0" aria-hidden />
            <Link
              to="/settings"
              className="text-xs underline hover:text-primary-foreground transition-colors"
              aria-label={`${preferences.location ? preferences.location.split(",")[0] : locationShort?.split(",")[0]}. Tap to change location.`}
            >
              {preferences.location ? preferences.location.split(",")[0] : locationShort?.split(",")[0]}
            </Link>
            {localTime && (
              <span className="text-xs tabular-nums">· {localTime}</span>
            )}
            {loading && <Loader2 className="w-3 h-3 animate-spin shrink-0" aria-hidden />}
          </div>
        )}

        {/* Status: Eating period vs Fasting period (from prayer times — clear for everyone) */}
        <div className="flex flex-col items-center gap-1 mb-4">
          <div className="flex items-center justify-center gap-2 flex-wrap">
            {isEatingPeriod ? (
              <>
                <Utensils className="w-5 h-5 text-secondary shrink-0" aria-hidden />
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span className="text-primary-foreground font-semibold cursor-help border-b border-dotted border-primary-foreground/30">
                      Eating period — You can eat now
                    </span>
                  </TooltipTrigger>
                  <TooltipContent side="top" className="max-w-xs bg-card border-border p-3">
                    <p className="text-sm text-foreground">{GENERAL_TOOLTIPS.eatingPeriod.body}</p>
                    <p className="text-xs text-muted-foreground mt-2 pt-2 border-t border-border/50">Arabic: <span className="font-arabic" dir="rtl">{GENERAL_TOOLTIPS.eatingPeriod.bodyAr}</span></p>
                  </TooltipContent>
                </Tooltip>
              </>
            ) : (
              <>
                <Moon className="w-5 h-5 text-secondary animate-pulse shrink-0" aria-hidden />
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span className="text-primary-foreground font-semibold cursor-help border-b border-dotted border-primary-foreground/30">
                      Fasting period — No eating or drinking
                    </span>
                  </TooltipTrigger>
                  <TooltipContent side="top" className="max-w-xs bg-card border-border p-3">
                    <p className="text-sm text-foreground">{GENERAL_TOOLTIPS.fastingPeriod.body}</p>
                    <p className="text-xs text-muted-foreground mt-2 pt-2 border-t border-border/50">Arabic: <span className="font-arabic" dir="rtl">{GENERAL_TOOLTIPS.fastingPeriod.bodyAr}</span></p>
                  </TooltipContent>
                </Tooltip>
              </>
            )}
          </div>
        </div>

        {/* Main timer display — live region for screen readers */}
        <div
          className="flex items-center justify-center gap-2 md:gap-4 mb-4"
          aria-live="polite"
          aria-atomic="true"
          aria-label={`${timeRemaining.hours} hours ${timeRemaining.minutes} minutes ${timeRemaining.seconds} seconds until ${isEatingPeriod ? "Suhoor end" : iftarLabel}`}
        >
          <div className="text-center">
            <motion.span 
              key={`hours-${timeRemaining.hours}`}
              initial={{ opacity: 0.5, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="timer-digit block"
            >
              {formatNumber(timeRemaining.hours)}
            </motion.span>
            <span className="block text-sm text-primary-foreground/60 mt-1">hours • ساعات</span>
          </div>
          
          <span className="timer-digit animate-pulse">:</span>
          
          <div className="text-center">
            <motion.span 
              key={`mins-${timeRemaining.minutes}`}
              initial={{ opacity: 0.5, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="timer-digit block"
            >
              {formatNumber(timeRemaining.minutes)}
            </motion.span>
            <span className="block text-sm text-primary-foreground/60 mt-1">minutes • دقائق</span>
          </div>
          
          <span className="timer-digit animate-pulse">:</span>
          
          <div className="text-center">
            <motion.span 
              key={`secs-${timeRemaining.seconds}`}
              initial={{ opacity: 0.5, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="timer-digit block"
            >
              {formatNumber(timeRemaining.seconds)}
            </motion.span>
            <span className="block text-sm text-primary-foreground/60 mt-1">seconds • ثواني</span>
          </div>
        </div>

        {/* Target time: next boundary — live region for screen readers */}
        <div
          className="flex items-center justify-center gap-2 text-primary-foreground/70 flex-wrap"
          aria-live="polite"
          aria-label={isEatingPeriod ? `Time left to eat until Suhoor end at ${nextTimeStr || suhoorTime}` : `Time until ${iftarLabel} at ${nextTimeStr || iftarTime}`}
        >
          <Clock className="w-4 h-4 shrink-0" aria-hidden />
          <span className="text-sm">
            {isEatingPeriod ? (
              <>
                Time left to eat until{" "}
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span className="text-secondary font-semibold cursor-help border-b border-dotted border-primary-foreground/30">
                      Suhoor end • نهاية السحور
                    </span>
                  </TooltipTrigger>
                  <TooltipContent side="top" className="max-w-xs bg-card border-border p-3">
                    <p className="font-semibold text-sm">{EATING_TIME_TOOLTIPS.suhoorEnds.title}</p>
                    <p className="text-xs text-muted-foreground mt-1">{EATING_TIME_TOOLTIPS.suhoorEnds.body}</p>
                    <p className="font-arabic text-xs text-muted-foreground mt-1" dir="rtl">{EATING_TIME_TOOLTIPS.suhoorEnds.bodyAr}</p>
                  </TooltipContent>
                </Tooltip>
                {" "}at {nextTimeStr || suhoorTime}
              </>
            ) : (
              <>
                Time until{" "}
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span className="text-secondary font-semibold cursor-help border-b border-dotted border-primary-foreground/30">
                      {iftarLabel} • إفطار
                    </span>
                  </TooltipTrigger>
                  <TooltipContent side="top" className="max-w-xs bg-card border-border p-3">
                    <p className="font-semibold text-sm">{EATING_TIME_TOOLTIPS.iftar.title}</p>
                    <p className="text-xs text-muted-foreground mt-1">{EATING_TIME_TOOLTIPS.iftar.body}</p>
                    <p className="font-arabic text-xs text-muted-foreground mt-1" dir="rtl">{(EATING_TIME_TOOLTIPS.iftar as { bodyAr?: string }).bodyAr}</p>
                  </TooltipContent>
                </Tooltip>
                {" "}at {nextTimeStr || iftarTime}
              </>
            )}
          </span>
          {/* Alarm count: click → settings, hover → tooltip with alarm breakdown */}
          {(() => {
            const suhoorAlarm = notifSettings.suhoorEnabled ? 1 : 0;
            const iftarAlarm = notifSettings.iftarEnabled ? 1 : 0;
            const dailyAlarm = notifSettings.dailyReminderEnabled ? 1 : 0;
            const prayerAlarms = preferences.userType === "muslim" ? Object.entries(prayerPrefs).filter(([, on]) => on).length : 0;
            const totalAlarms = suhoorAlarm + iftarAlarm + dailyAlarm + prayerAlarms;
            const parts: string[] = [];
            if (notifSettings.suhoorEnabled) parts.push(`Suhoor: ${notifSettings.suhoorMinutesBefore} min before`);
            if (notifSettings.iftarEnabled) parts.push(`${iftarLabel}: ${notifSettings.iftarMinutesBefore} min before`);
            if (notifSettings.dailyReminderEnabled) parts.push(`Daily: ${notifSettings.dailyReminderTime}`);
            if (preferences.userType === "muslim") {
              const enabledPrayers = Object.entries(prayerPrefs).filter(([, on]) => on).map(([p]) => p);
              if (enabledPrayers.length) parts.push(`Prayers: ${enabledPrayers.join(", ")}`);
            }
            const alarmTooltip = parts.length ? parts.join(" · ") : "No alarms set. Open Settings to add reminders.";
            return (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Link
                    to="/settings#settings-notifications"
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-primary-foreground/10 hover:bg-primary-foreground/20 border border-primary-foreground/20 text-primary-foreground/90 text-sm font-medium min-h-[36px] min-w-[36px] justify-center transition-colors"
                    aria-label={`${totalAlarms} alarm${totalAlarms !== 1 ? "s" : ""} set. Click to open alarm settings.`}
                  >
                    <Bell className="w-4 h-4 shrink-0" aria-hidden />
                    <span aria-hidden>{totalAlarms}</span>
                  </Link>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="max-w-sm bg-card border-border p-3">
                  <p className="font-semibold text-sm">{totalAlarms} alarm{totalAlarms !== 1 ? "s" : ""} set • منبهات</p>
                  <p className="text-xs text-muted-foreground mt-1">{alarmTooltip}</p>
                  <p className="font-arabic text-xs text-muted-foreground mt-1" dir="rtl">انقر لفتح إعدادات المنبه</p>
                </TooltipContent>
              </Tooltip>
            );
          })()}
        </div>

        {/* Prayer times info — stack on small screens, shorter labels on mobile */}
        <div className="mt-6 pt-4 border-t border-primary-foreground/10 grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 text-sm">
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="text-center p-3 rounded-lg bg-primary-foreground/5 cursor-help border border-transparent hover:border-primary-foreground/20 transition-colors min-w-0">
                <span className="text-primary-foreground/50 block text-xs mb-1 flex items-center justify-center gap-1">
                  <Sunrise className="w-3.5 h-3.5 shrink-0" aria-hidden />
                  <span className="sm:hidden">Suhoor end</span><span className="hidden sm:inline">Suhoor Ends • نهاية السحور</span>
                </span>
                <span className="text-secondary font-bold text-base sm:text-lg">{suhoorTime}</span>
                <span className="block text-xs text-primary-foreground/40 mt-1 hidden sm:block">Eat Cutoff • موعد التوقف</span>
              </div>
            </TooltipTrigger>
            <TooltipContent side="top" className="max-w-xs bg-card border-border p-3">
              <p className="font-semibold text-sm">{EATING_TIME_TOOLTIPS.suhoorEnds.title}</p>
              <p className="text-xs text-muted-foreground mt-1">{EATING_TIME_TOOLTIPS.suhoorEnds.body}</p>
              {EATING_TIME_TOOLTIPS.suhoorEnds.bodyAr && (
                <p className="font-arabic text-xs text-muted-foreground mt-1" dir="rtl">{EATING_TIME_TOOLTIPS.suhoorEnds.bodyAr}</p>
              )}
            </TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="text-center p-3 rounded-lg bg-primary-foreground/5 cursor-help border border-transparent hover:border-primary-foreground/20 transition-colors min-w-0">
                <span className="text-primary-foreground/50 block text-xs mb-1 flex items-center justify-center gap-1">
                  <Sunset className="w-3.5 h-3.5 shrink-0" aria-hidden />
                  <span className="sm:hidden">{iftarLabel}</span><span className="hidden sm:inline">{iftarLabel} Time • وقت الإفطار</span>
                </span>
                <span className="text-secondary font-bold text-base sm:text-lg">{iftarTime}</span>
                <span className="block text-xs text-primary-foreground/40 mt-1 hidden sm:block">Break Fast • الفطور</span>
              </div>
            </TooltipTrigger>
            <TooltipContent side="top" className="max-w-xs bg-card border-border p-3">
              <p className="font-semibold text-sm">{EATING_TIME_TOOLTIPS.iftarTime.title}</p>
              <p className="text-xs text-muted-foreground mt-1">{EATING_TIME_TOOLTIPS.iftarTime.body}</p>
              <p className="text-xs text-muted-foreground mt-1">{EATING_TIME_TOOLTIPS.breakFast.body}</p>
              {(EATING_TIME_TOOLTIPS.iftarTime as { bodyAr?: string }).bodyAr && (
                <p className="font-arabic text-xs text-muted-foreground mt-1" dir="rtl">{(EATING_TIME_TOOLTIPS.iftarTime as { bodyAr?: string }).bodyAr}</p>
              )}
            </TooltipContent>
          </Tooltip>
        </div>

        {/* Location / API status */}
        <div className="mt-3 flex justify-center">
          {isFromCache ? (
            <p className="text-center text-xs text-primary-foreground/80">
              {typeof navigator !== "undefined" && !navigator.onLine
                ? "Cached times · You're offline."
                : <><button type="button" onClick={() => refetchPrayers()} className="underline hover:text-primary-foreground">Try again</button> · <Link to="/settings" className="underline hover:text-primary-foreground/90">Update location</Link></>}
            </p>
          ) : error || (!effectiveLat || !effectiveLng) ? (
            <LocationRequiredCTA
              compact
              variant="dark"
              message={error ? "Using default times. Set your location for accurate prayer times." : "Set your location for accurate prayer times."}
              className="text-xs"
            />
          ) : (
            <p className="text-center text-xs text-primary-foreground/60">
              {locationShort ? (
                <>Prayer times for <Link to="/settings" className="underline hover:text-primary-foreground/90 font-medium" aria-label={`${locationShort}. Tap to change location.`}>{locationShort}</Link></>
              ) : (
                <>Prayer times for your location · <Link to="/settings" className="underline hover:text-primary-foreground/90">Set location</Link></>
              )}
            </p>
          )}
        </div>
      </div>
    </motion.div>
  );
};
