import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Moon, Sun, Clock, Calendar, MapPin, Loader2 } from "lucide-react";
import { usePrayerTimes, getSunnahFastingInfo } from "@/hooks/usePrayerTimes";
import { useUserPreferences } from "@/hooks/useLocalStorage";
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
  const [daysUntilRamadan, setDaysUntilRamadan] = useState(0);
  const [isRamadan, setIsRamadan] = useState(false);

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

  useEffect(() => {
    const interval = setInterval(() => {
      const targetTimeStr = isFasting ? iftarTime : suhoorTime;
      const [targetHours, targetMinutes] = targetTimeStr.split(':').map(Number);
      
      const target = new Date();
      target.setHours(targetHours, targetMinutes, 0, 0);
      
      if (target <= now) {
        target.setDate(target.getDate() + 1);
      }
      
      const diff = target.getTime() - now.getTime();
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);
      
      setTimeRemaining({ hours, minutes, seconds });
    }, 1000);

    return () => clearInterval(interval);
  }, [isFasting, suhoorTime, iftarTime]);

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

        {/* Target time */}
        <div className="flex items-center justify-center gap-2 text-primary-foreground/70">
          <Clock className="w-4 h-4" />
          <span className="text-sm">
            Until{" "}
            <Tooltip>
              <TooltipTrigger asChild>
                <span className="text-secondary font-semibold cursor-help border-b border-dotted border-primary-foreground/30">
                  {isFasting ? "Iftar • إفطار" : "Suhoor • سحور"}
                </span>
              </TooltipTrigger>
              <TooltipContent side="top" className="max-w-xs bg-card border-border p-3">
                <p className="font-semibold text-sm">{isFasting ? EATING_TIME_TOOLTIPS.iftar.title : EATING_TIME_TOOLTIPS.suhoor.title}</p>
                <p className="text-xs text-muted-foreground mt-1">{isFasting ? EATING_TIME_TOOLTIPS.iftar.body : EATING_TIME_TOOLTIPS.suhoor.body}</p>
              </TooltipContent>
            </Tooltip>
            {" "}at {isFasting ? iftarTime : suhoorTime}
          </span>
        </div>

        {/* Prayer times info */}
        <div className="mt-6 pt-4 border-t border-primary-foreground/10 grid grid-cols-2 gap-4 text-sm">
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="text-center p-3 rounded-lg bg-primary-foreground/5 cursor-help border border-transparent hover:border-primary-foreground/20 transition-colors">
                <span className="text-primary-foreground/50 block text-xs mb-1">Suhoor Ends • نهاية السحور</span>
                <span className="text-secondary font-bold text-lg">{suhoorTime}</span>
                <span className="block text-xs text-primary-foreground/40 mt-1">Eat Cutoff • موعد التوقف</span>
              </div>
            </TooltipTrigger>
            <TooltipContent side="top" className="max-w-xs bg-card border-border p-3">
              <p className="font-semibold text-sm">{EATING_TIME_TOOLTIPS.suhoorEnds.title}</p>
              <p className="text-xs text-muted-foreground mt-1">{EATING_TIME_TOOLTIPS.suhoorEnds.body}</p>
            </TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="text-center p-3 rounded-lg bg-primary-foreground/5 cursor-help border border-transparent hover:border-primary-foreground/20 transition-colors">
                <span className="text-primary-foreground/50 block text-xs mb-1">Iftar Time • وقت الإفطار</span>
                <span className="text-secondary font-bold text-lg">{iftarTime}</span>
                <span className="block text-xs text-primary-foreground/40 mt-1">Break Fast • الفطور</span>
              </div>
            </TooltipTrigger>
            <TooltipContent side="top" className="max-w-xs bg-card border-border p-3">
              <p className="font-semibold text-sm">{EATING_TIME_TOOLTIPS.iftarTime.title}</p>
              <p className="text-xs text-muted-foreground mt-1">{EATING_TIME_TOOLTIPS.iftarTime.body}</p>
              <p className="text-xs text-muted-foreground mt-1">{EATING_TIME_TOOLTIPS.breakFast.body}</p>
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
