import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Moon, Sun, Clock, Calendar, MapPin, Loader2, Sunrise, Sunset, Bell } from "lucide-react";
import { usePrayerTimes, getSunnahFastingInfo } from "@/hooks/usePrayerTimes";
import { useUserPreferences, useNotificationSettings, usePrayerNotificationPrefs } from "@/hooks/useLocalStorage";
import { useAutoLocation } from "@/hooks/useLocation";
import { Link } from "react-router-dom";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { EATING_TIME_TOOLTIPS } from "@/data/eating-times-tooltips";
import { SunnahFastingBadge } from "./SunnahFastingBadge";
import { RamadanStartInfoDialog } from "./RamadanStartInfoDialog";
import { getDaysUntilRamadan, isCurrentlyRamadan } from "@/lib/ramadan";

interface FastingTimerProps {
  suhoorTime?: string;
  iftarTime?: string;
  isFasting?: boolean;
}

export const FastingTimer = ({ 
  suhoorTime: propSuhoorTime, 
  iftarTime: propIftarTime,
  isFasting = true 
}: FastingTimerProps) => {
  const [timeRemaining, setTimeRemaining] = useState({ hours: 0, minutes: 0, seconds: 0 });
  const [nextLabel, setNextLabel] = useState<"Suhoor end" | "Iftar">("Iftar");
  const [nextTimeStr, setNextTimeStr] = useState("");
  const [daysUntilRamadan, setDaysUntilRamadan] = useState(0);
  const [isRamadan, setIsRamadan] = useState(false);
  const [notifSettings] = useNotificationSettings();
  const [prayerPrefs] = usePrayerNotificationPrefs();

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
  const { location: autoLocation } = useAutoLocation();
  const displayLocation = preferences.location || (autoLocation ? autoLocation.displayName : null);
  const locationShort = displayLocation ? displayLocation.split(",").slice(0, 2).join(",").trim() : null;

  // Get prayer times from API if location is available
  const { prayerTimes, hijriDate, loading, error } = usePrayerTimes(
    preferences.locationCoords?.lat || null,
    preferences.locationCoords?.lng || null
  );
  
  // Use API times if available, otherwise use props or defaults
  const suhoorTime = prayerTimes?.imsak || propSuhoorTime || "05:23";
  const iftarTime = prayerTimes?.maghrib || propIftarTime || "18:47";
  
  // Get Sunnah fasting info
  const sunnahInfo = getSunnahFastingInfo();

  useEffect(() => {
    const formatLocalTime = () => {
      setLocalTime(
        new Date().toLocaleTimeString(undefined, {
          hour: "numeric",
          minute: "2-digit",
          hour12: true,
        })
      );
    };
    formatLocalTime();
    const t = setInterval(formatLocalTime, 1000);
    return () => clearInterval(t);
  }, []);

  // Countdown to *next* boundary: if past suhoor end show iftar; if past iftar show suhoor end (next day)
  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      const [suhoorH, suhoorM] = suhoorTime.split(':').map(Number);
      const [iftarH, iftarM] = iftarTime.split(':').map(Number);

      const imsakToday = new Date();
      imsakToday.setHours(suhoorH, suhoorM, 0, 0);
      const maghribToday = new Date();
      maghribToday.setHours(iftarH, iftarM, 0, 0);

      let target: Date;
      let label: "Suhoor end" | "Iftar";
      if (now < imsakToday) {
        target = imsakToday;
        label = "Suhoor end";
      } else if (now < maghribToday) {
        target = maghribToday;
        label = "Iftar";
      } else {
        const imsakTomorrow = new Date(imsakToday);
        imsakTomorrow.setDate(imsakTomorrow.getDate() + 1);
        target = imsakTomorrow;
        label = "Suhoor end";
      }

      setNextLabel(label);
      setNextTimeStr(target.getHours().toString().padStart(2, "0") + ":" + target.getMinutes().toString().padStart(2, "0"));

      const diff = target.getTime() - now.getTime();
      const hours = Math.max(0, Math.floor(diff / (1000 * 60 * 60)));
      const minutes = Math.max(0, Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)));
      const seconds = Math.max(0, Math.floor((diff % (1000 * 60)) / 1000));
      setTimeRemaining({ hours, minutes, seconds });
    }, 1000);

    return () => clearInterval(interval);
  }, [suhoorTime, iftarTime]);

  const formatNumber = (num: number) => num.toString().padStart(2, '0');

  return (
    <motion.div 
      className="timer-display relative overflow-hidden"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="absolute inset-0 pattern-islamic opacity-10" />
      
      <div className="relative z-10">
        {/* Sunnah Fasting Badge */}
        {sunnahInfo && (
          <div className="mb-4">
            <SunnahFastingBadge hijriDay={hijriDate ? parseInt(hijriDate.day) : undefined} />
          </div>
        )}

        {/* Days until Ramadan Badge (double-click for when Ramadan starts) */}
        {!isRamadan && daysUntilRamadan > 0 && (
          <>
            <motion.div
              role="button"
              tabIndex={0}
              onDoubleClick={() => setRamadanInfoOpen(true)}
              onKeyDown={(e) => e.key === "Enter" && setRamadanInfoOpen(true)}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center justify-center gap-2 mb-4 px-4 py-2 rounded-full bg-secondary/20 mx-auto w-fit cursor-pointer select-none hover:bg-secondary/25 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-secondary"
              title="Double-click for when Ramadan starts"
            >
              <Calendar className="w-4 h-4 text-secondary" />
              <span className="text-secondary font-bold text-lg">{daysUntilRamadan}</span>
              <span className="text-primary-foreground/80 text-sm">
                days until Ramadan • أيام حتى رمضان
              </span>
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

        {/* Hijri Date */}
        {hijriDate && (
          <div className="text-center mb-3">
            <span className="text-sm text-primary-foreground/60">
              {hijriDate.day} {hijriDate.month} {hijriDate.year} AH
              <span className="font-arabic ml-2">{hijriDate.monthAr}</span>
            </span>
          </div>
        )}

        {/* Location + local time (next to city) */}
        {(locationShort || preferences.location) && (
          <div className="flex items-center justify-center gap-1.5 mb-3 text-primary-foreground/60 flex-wrap">
            <MapPin className="w-3 h-3 shrink-0" />
            <span className="text-xs">{preferences.location ? preferences.location.split(",")[0] : locationShort?.split(",")[0]}</span>
            {localTime && (
              <span className="text-xs tabular-nums">· {localTime}</span>
            )}
            {loading && <Loader2 className="w-3 h-3 animate-spin shrink-0" />}
          </div>
        )}

        {/* Status indicator (Currently Fasting / Eating Window) */}
        <div className="flex items-center justify-center gap-2 mb-4">
          {isFasting ? (
            <>
              <Sun className="w-5 h-5 text-secondary animate-pulse shrink-0" />
              <span className="text-primary-foreground/80 font-medium">
                Currently Fasting • صائم حالياً
              </span>
            </>
          ) : (
            <>
              <Moon className="w-5 h-5 text-secondary shrink-0" />
              <span className="text-primary-foreground/80 font-medium">
                Eating Window • وقت الأكل
              </span>
            </>
          )}
        </div>

        {/* Main timer display */}
        <div className="flex items-center justify-center gap-2 md:gap-4 mb-4">
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

        {/* Target time: next boundary (suhoor end or iftar) */}
        <div className="flex items-center justify-center gap-2 text-primary-foreground/70 flex-wrap">
          <Clock className="w-4 h-4 shrink-0" />
          <span className="text-sm">
            Until{" "}
            <Tooltip>
              <TooltipTrigger asChild>
                <span className="text-secondary font-semibold cursor-help border-b border-dotted border-primary-foreground/30">
                  {nextLabel === "Suhoor end" ? "Suhoor end • نهاية السحور" : "Iftar • إفطار"}
                </span>
              </TooltipTrigger>
              <TooltipContent side="top" className="max-w-xs bg-card border-border p-3">
                <p className="font-semibold text-sm">{nextLabel === "Suhoor end" ? EATING_TIME_TOOLTIPS.suhoorEnds.title : EATING_TIME_TOOLTIPS.iftar.title}</p>
                <p className="text-xs text-muted-foreground mt-1">{nextLabel === "Suhoor end" ? EATING_TIME_TOOLTIPS.suhoorEnds.body : EATING_TIME_TOOLTIPS.iftar.body}</p>
                <p className="font-arabic text-xs text-muted-foreground mt-1" dir="rtl">{nextLabel === "Suhoor end" ? EATING_TIME_TOOLTIPS.suhoorEnds.bodyAr : EATING_TIME_TOOLTIPS.iftar.bodyAr}</p>
                <p className="font-arabic text-xs text-muted-foreground mt-1" dir="rtl">{nextLabel === "Suhoor end" ? (EATING_TIME_TOOLTIPS.suhoorEnds as { bodyAr?: string }).bodyAr : (EATING_TIME_TOOLTIPS.iftar as { bodyAr?: string }).bodyAr}</p>
              </TooltipContent>
            </Tooltip>
            {" "}at {nextTimeStr || (nextLabel === "Suhoor end" ? suhoorTime : iftarTime)}
          </span>
          {/* Alarm count: click → settings, hover → tooltip with alarm breakdown */}
          {(() => {
            const suhoorAlarm = notifSettings.suhoorEnabled ? 1 : 0;
            const iftarAlarm = notifSettings.iftarEnabled ? 1 : 0;
            const dailyAlarm = notifSettings.dailyReminderEnabled ? 1 : 0;
            const prayerAlarms = Object.entries(prayerPrefs).filter(([, on]) => on).length;
            const totalAlarms = suhoorAlarm + iftarAlarm + dailyAlarm + prayerAlarms;
            const parts: string[] = [];
            if (notifSettings.suhoorEnabled) parts.push(`Suhoor: ${notifSettings.suhoorMinutesBefore} min before`);
            if (notifSettings.iftarEnabled) parts.push(`Iftar: ${notifSettings.iftarMinutesBefore} min before`);
            if (notifSettings.dailyReminderEnabled) parts.push(`Daily: ${notifSettings.dailyReminderTime}`);
            const enabledPrayers = Object.entries(prayerPrefs).filter(([, on]) => on).map(([p]) => p);
            if (enabledPrayers.length) parts.push(`Prayers: ${enabledPrayers.join(", ")}`);
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
                  <span className="sm:hidden">Iftar</span><span className="hidden sm:inline">Iftar Time • وقت الإفطار</span>
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
          {error ? (
            <p className="text-center text-xs text-primary-foreground/50">
              Using default times. <Link to="/settings" className="underline hover:text-primary-foreground/80">Set location</Link> for accurate prayer times.
            </p>
          ) : (
            <p className="text-center text-xs text-primary-foreground/60">
              {locationShort ? `Prayer times for ${locationShort}` : "Prayer times for your location"} · <Link to="/settings" className="underline hover:text-primary-foreground/90">Update</Link>
            </p>
          )}
        </div>
      </div>
    </motion.div>
  );
};
