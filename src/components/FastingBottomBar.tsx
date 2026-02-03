import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Moon, Utensils, Clock, AlertCircle } from "lucide-react";
import { useFastingProgress, isFastingToday, useDisplayTimezone } from "@/hooks/useLocalStorage";
import { useUserPreferences } from "@/hooks/useLocalStorage";
import { usePrayerTimes } from "@/hooks/usePrayerTimes";
import { useAutoLocation } from "@/hooks/useLocation";
import { getTodayStringInTimezone, getNowSecondsSinceMidnightInTimezone, timeStringToSecondsSinceMidnight, secondsUntilTimeInTimezone } from "@/lib/utils";

/** Countdown to iftar (maghrib) or "Iftar HH:MM" if past. Uses location time when displayTimezone is set. */
function useIftarCountdown(maghrib: string | undefined, displayTimezone: string | null | undefined) {
  const [text, setText] = useState<string>("—");
  const [isPast, setIsPast] = useState(false);

  useEffect(() => {
    if (!maghrib) {
      setText("—");
      return;
    }
    const update = () => {
      if (displayTimezone) {
        const nowSec = getNowSecondsSinceMidnightInTimezone(displayTimezone);
        const maghribSec = timeStringToSecondsSinceMidnight(maghrib);
        if (nowSec >= maghribSec) {
          setIsPast(true);
          setText(`Iftar ${maghrib.trim().indexOf(" ") >= 0 ? maghrib.trim().slice(0, maghrib.trim().indexOf(" ")) : maghrib}`);
          return;
        }
        const diff = secondsUntilTimeInTimezone(nowSec, maghribSec);
        const hours = Math.floor(diff / 3600);
        const minutes = Math.floor((diff % 3600) / 60);
        setText(hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`);
        setIsPast(false);
      } else {
        const now = new Date();
        const [h, m] = maghrib.split(":").map(Number);
        const iftar = new Date(now);
        iftar.setHours(h, m, 0, 0);
        if (now >= iftar) {
          setIsPast(true);
          setText(`Iftar ${maghrib}`);
          return;
        }
        const ms = iftar.getTime() - now.getTime();
        const hours = Math.floor(ms / (1000 * 60 * 60));
        const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
        setText(hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`);
        setIsPast(false);
      }
    };
    update();
    const t = setInterval(update, displayTimezone ? 1000 : 60000);
    return () => clearInterval(t);
  }, [maghrib, displayTimezone]);

  return { text, isPast };
}

export function FastingBottomBar() {
  const [progress] = useFastingProgress();
  const [preferences] = useUserPreferences();
  const displayTimezone = useDisplayTimezone();
  const { location: autoLocation } = useAutoLocation();
  const coords = preferences.locationCoords || (autoLocation ? { lat: autoLocation.lat, lng: autoLocation.lng } : null);
  const { prayerTimes } = usePrayerTimes(coords?.lat ?? null, coords?.lng ?? null, displayTimezone);
  const todayStr = displayTimezone ? getTodayStringInTimezone(displayTimezone) : undefined;
  const isFasting = isFastingToday(progress, todayStr);
  const { text: iftarText, isPast: iftarPast } = useIftarCountdown(prayerTimes?.maghrib, displayTimezone);

  useEffect(() => {
    if (isFasting) {
      document.body.classList.add("has-fasting-bottom-bar");
    } else {
      document.body.classList.remove("has-fasting-bottom-bar");
    }
    return () => document.body.classList.remove("has-fasting-bottom-bar");
  }, [isFasting]);

  if (!isFasting) return null;

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-40 bg-background/95 backdrop-blur-lg border-t border-border safe-area-bottom md:hidden"
      style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
      aria-label="Fasting quick actions"
    >
      <div className="flex items-center justify-between gap-2 px-3 py-2 min-h-[52px]">
        {/* Times + days */}
        <div className="flex items-center gap-2 min-w-0 shrink">
          <Clock className="w-4 h-4 text-secondary shrink-0" />
          <span className="text-sm font-medium tabular-nums truncate">
            {iftarPast ? `Iftar ${prayerTimes?.maghrib ?? "—"}` : `Iftar in ${iftarText}`}
          </span>
          <span className="text-xs text-muted-foreground shrink-0">
            · {progress.completedDays.length} days
          </span>
        </div>
        {/* Quick controls */}
        <div className="flex items-center gap-1 shrink-0">
          <Link
            to="/dashboard/today"
            className="flex flex-col items-center justify-center min-h-[44px] min-w-[48px] px-2 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
            aria-label="Today"
            title="Today's fast – timer, intention, hydration"
          >
            <Moon className="w-5 h-5" />
            <span className="text-[10px] font-medium">Today</span>
          </Link>
          <Link
            to="/dashboard/meals"
            className="flex flex-col items-center justify-center min-h-[44px] min-w-[48px] px-2 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
            aria-label="Meals"
            title="Meal planning – suhoor and iftar recipes"
          >
            <Utensils className="w-5 h-5" />
            <span className="text-[10px] font-medium">Meals</span>
          </Link>
          <Link
            to="/emergency"
            className="flex flex-col items-center justify-center min-h-[44px] min-w-[48px] px-2 rounded-lg hover:bg-destructive/10 transition-colors text-muted-foreground hover:text-destructive"
            aria-label="Break fast"
            title="Break fast – reassurance and log reason"
          >
            <AlertCircle className="w-5 h-5" />
            <span className="text-[10px] font-medium">Break</span>
          </Link>
        </div>
      </div>
    </nav>
  );
}
