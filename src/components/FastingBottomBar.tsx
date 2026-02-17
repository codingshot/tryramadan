import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Moon, Utensils, Clock, AlertTriangle, BookOpen, Sunrise, Sunset } from "lucide-react";
import { toast } from "sonner";
import {
  useFastingProgress,
  isFastingToday,
  useDisplayTimezone,
  getTodayFastingLog,
  getTodayDateString,
  startFastingToday,
  setDaySkipped,
} from "@/hooks/useLocalStorage";
import { useUserPreferences } from "@/hooks/useLocalStorage";
import { usePrayerTimes } from "@/hooks/usePrayerTimes";
import { useAutoLocation } from "@/hooks/useLocation";
import { getTodayStringInTimezone, getNowSecondsSinceMidnightInTimezone, timeStringToSecondsSinceMidnight, secondsUntilTimeInTimezone } from "@/lib/utils";

/** Countdown text based on eating windows: fasting window → "Iftar in Xh Xm", eating window → "Suhoor ends in Xh Xm". Calibrated with display timezone. */
function useEatingWindowCountdown(
  imsak: string | undefined,
  maghrib: string | undefined,
  displayTimezone: string | null | undefined
): { label: string; text: string } {
  const [out, setOut] = useState<{ label: string; text: string }>({ label: "Iftar", text: "—" });

  useEffect(() => {
    if (!maghrib) {
      setOut({ label: "Iftar", text: "—" });
      return;
    }
    const hasImsak = imsak != null && imsak.trim() !== "";
    const imsakSec = hasImsak ? timeStringToSecondsSinceMidnight(imsak) : 0;
    const maghribSec = timeStringToSecondsSinceMidnight(maghrib);

    const update = () => {
      if (displayTimezone) {
        const nowSec = getNowSecondsSinceMidnightInTimezone(displayTimezone);
        const inFastingWindow = hasImsak ? nowSec >= imsakSec && nowSec < maghribSec : nowSec < maghribSec;
        if (inFastingWindow) {
          const diff = secondsUntilTimeInTimezone(nowSec, maghribSec);
          const h = Math.floor(diff / 3600);
          const m = Math.floor((diff % 3600) / 60);
          setOut({ label: "Iftar", text: h > 0 ? `${h}h ${m}m` : `${m}m` });
        } else if (hasImsak) {
          const diff = secondsUntilTimeInTimezone(nowSec, imsakSec);
          const h = Math.floor(diff / 3600);
          const m = Math.floor((diff % 3600) / 60);
          setOut({ label: "Suhoor ends", text: h > 0 ? `${h}h ${m}m` : `${m}m` });
        } else {
          const diff = secondsUntilTimeInTimezone(nowSec, maghribSec);
          const h = Math.floor(diff / 3600);
          const m = Math.floor((diff % 3600) / 60);
          setOut({ label: "Iftar", text: h > 0 ? `${h}h ${m}m` : `${m}m` });
        }
      } else {
        const now = new Date();
        const nowSec = now.getHours() * 3600 + now.getMinutes() * 60 + now.getSeconds();
        const inFastingWindow = hasImsak ? nowSec >= imsakSec && nowSec < maghribSec : nowSec < maghribSec;
        if (inFastingWindow) {
          const [hh, mm] = maghrib.split(":").map(Number);
          const iftar = new Date(now);
          iftar.setHours(hh, mm, 0, 0);
          const ms = iftar.getTime() - now.getTime();
          const h = Math.floor(ms / 36e5);
          const m = Math.floor((ms % 36e5) / 6e4);
          setOut({ label: "Iftar", text: h > 0 ? `${h}h ${m}m` : `${m}m` });
        } else if (hasImsak) {
          const [hh, mm] = imsak!.split(":").map(Number);
          const suhoorEnd = new Date(now);
          suhoorEnd.setHours(hh, mm, 0, 0);
          if (now >= suhoorEnd) suhoorEnd.setDate(suhoorEnd.getDate() + 1);
          const ms = suhoorEnd.getTime() - now.getTime();
          const h = Math.floor(ms / 36e5);
          const m = Math.floor((ms % 36e5) / 6e4);
          setOut({ label: "Suhoor ends", text: h > 0 ? `${h}h ${m}m` : `${m}m` });
        } else {
          const [hh, mm] = maghrib.split(":").map(Number);
          const iftar = new Date(now);
          iftar.setHours(hh, mm, 0, 0);
          if (now >= iftar) iftar.setDate(iftar.getDate() + 1);
          const ms = iftar.getTime() - now.getTime();
          const h = Math.floor(ms / 36e5);
          const m = Math.floor((ms % 36e5) / 6e4);
          setOut({ label: "Iftar", text: h > 0 ? `${h}h ${m}m` : `${m}m` });
        }
      }
    };
    update();
    const t = setInterval(update, displayTimezone ? 2000 : 60000);
    return () => clearInterval(t);
  }, [imsak, maghrib, displayTimezone]);

  return out;
}

export function FastingBottomBar() {
  const [progress, setProgress] = useFastingProgress();
  const [preferences] = useUserPreferences();
  const displayTimezone = useDisplayTimezone();
  const navigate = useNavigate();
  const { location: autoLocation } = useAutoLocation();
  const coords = preferences.locationCoords || (autoLocation ? { lat: autoLocation.lat, lng: autoLocation.lng } : null);
  const { prayerTimes } = usePrayerTimes(coords?.lat ?? null, coords?.lng ?? null, displayTimezone);
  const todayStr = displayTimezone ? getTodayStringInTimezone(displayTimezone) : getTodayDateString();
  const fastingToday = isFastingToday(progress, todayStr);
  const todayEntry = getTodayFastingLog(progress, todayStr);
  const todayBroken = todayEntry?.status === "broken";
  const todayNoNeedToFast = todayBroken && todayEntry?.brokenReason === "menstruation";
  const todayComplete = progress.completedDays.includes(todayStr);
  const todaySkipped = (progress.skippedDays ?? []).includes(todayStr);
  const { label: eatingWindowLabel, text: eatingWindowText } = useEatingWindowCountdown(
    prayerTimes?.imsak,
    prayerTimes?.maghrib,
    displayTimezone
  );

  const handleBreakFast = () => {
    navigate("/dashboard", { state: { openBreakFast: true } });
  };
  const handleStartFasting = () => {
    startFastingToday(progress, setProgress, todayStr);
    toast.success("You're fasting today");
  };
  const handleNotFasting = () => {
    setDaySkipped(progress, setProgress, todayStr);
    toast.success("Marked as not fasting today");
  };

  if (!prayerTimes?.maghrib) return null;

  const showBreakFast = fastingToday && !todayBroken;
  const showQuickMark = !todayComplete && !todaySkipped && !todayBroken && !fastingToday;
  const showLearn = todayComplete || todaySkipped || todayBroken;

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-40 bg-background/95 backdrop-blur-lg border-t border-border safe-area-bottom md:hidden"
      style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
      aria-label="Fasting quick actions"
    >
      <div className="flex items-center justify-between gap-2 px-3 py-2 min-h-[52px]">
        {/* Time to suhoor end / iftar based on eating window */}
        <div className="flex items-center gap-2 min-w-0 shrink">
          <Clock className="w-4 h-4 text-secondary shrink-0" />
          <span className="text-sm font-medium tabular-nums truncate">
            {todayNoNeedToFast
              ? "No need to fast"
              : eatingWindowLabel === "Iftar"
                ? `Iftar in ${eatingWindowText}`
                : `Suhoor ends in ${eatingWindowText}`}
          </span>
        </div>
        {/* Quick controls: Today, Meals, then dynamic slot(s) */}
        <div className="flex items-center gap-1 shrink-0">
          <Link
            to="/dashboard"
            className="flex flex-col items-center justify-center min-h-[44px] min-w-[44px] px-1.5 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
            aria-label="Dashboard"
            title="Dashboard – timer, intention, progress"
          >
            <Moon className="w-5 h-5" />
            <span className="text-[10px] font-medium">Today</span>
          </Link>
          <Link
            to="/dashboard/meals"
            className="flex flex-col items-center justify-center min-h-[44px] min-w-[44px] px-1.5 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
            aria-label="Meals"
            title="Meal planning – suhoor and iftar recipes"
          >
            <Utensils className="w-5 h-5" />
            <span className="text-[10px] font-medium">Meals</span>
          </Link>
          {showBreakFast && (
            <button
              type="button"
              onClick={handleBreakFast}
              className="flex flex-col items-center justify-center min-h-[44px] min-w-[44px] px-1.5 rounded-lg hover:bg-destructive/10 transition-colors text-destructive"
              aria-label="Break fast"
              title="Break fast – log reason"
            >
              <AlertTriangle className="w-5 h-5" />
              <span className="text-[10px] font-medium">Break</span>
            </button>
          )}
          {showQuickMark && (
            <>
              <button
                type="button"
                onClick={handleStartFasting}
                className="flex flex-col items-center justify-center min-h-[44px] min-w-[44px] px-1.5 rounded-lg hover:bg-primary/10 transition-colors text-primary"
                aria-label="I'm fasting"
                title="Mark that you're fasting today"
              >
                <Sunrise className="w-5 h-5" />
                <span className="text-[10px] font-medium">Fasting</span>
              </button>
              <button
                type="button"
                onClick={handleNotFasting}
                className="flex flex-col items-center justify-center min-h-[44px] min-w-[44px] px-1.5 rounded-lg hover:bg-muted transition-colors text-muted-foreground"
                aria-label="Not fasting"
                title="Mark as not fasting today"
              >
                <Sunset className="w-5 h-5" />
                <span className="text-[10px] font-medium">Skip</span>
              </button>
            </>
          )}
          {showLearn && (
            <Link
              to="/dashboard/learn"
              className="flex flex-col items-center justify-center min-h-[44px] min-w-[44px] px-1.5 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
              aria-label="Learn"
              title="Learn – guides and hadith"
            >
              <BookOpen className="w-5 h-5" />
              <span className="text-[10px] font-medium">Learn</span>
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
