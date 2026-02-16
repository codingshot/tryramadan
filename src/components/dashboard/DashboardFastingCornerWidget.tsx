import { Moon, Sun } from "lucide-react";
import { type FastingProgress, getTodayFastingLog } from "@/hooks/useLocalStorage";
import { type PrayerTimes } from "@/hooks/usePrayerTimes";
import { EATING_TIME_TITLE } from "@/data/eating-times-tooltips";

interface DashboardFastingCornerWidgetProps {
  progress: FastingProgress;
  isFasting: boolean;
  countdownToIftar: { h: number; m: number; s: number };
  countdownToSuhoor: { h: number; m: number; s: number };
  prayerTimes: PrayerTimes | null;
  todayStr: string;
  nextPrayer: { name: string; time: string; countdown: string } | null;
  onMarkComplete: () => void;
  onBreakFast: () => void;
  onSkip: () => void;
  onGoToToday?: () => void;
}

export function DashboardFastingCornerWidget({
  progress,
  isFasting,
  countdownToIftar,
  countdownToSuhoor,
  prayerTimes,
  todayStr,
  nextPrayer,
  onMarkComplete,
  onBreakFast,
  onSkip,
  onGoToToday,
}: DashboardFastingCornerWidgetProps) {
  const todayEntry = getTodayFastingLog(progress, todayStr);
  const todayComplete = progress.completedDays.includes(todayStr);
  const todaySkipped = progress.skippedDays?.includes(todayStr);
  const todayBroken = todayEntry?.status === "broken";

  const countdown = isFasting ? countdownToIftar : countdownToSuhoor;
  const targetLabel = isFasting ? "Iftar" : "Suhoor";
  /* When broke fast we still show countdown (until Iftar or next Suhoor); hide only when complete or skipped */
  const showCountdown = !todayComplete && !todaySkipped;

  return (
    <div
      className="rounded-xl border border-border bg-card p-3 shadow-sm w-full max-w-[220px]"
      aria-label="Today's fast and next prayer"
    >
      <div className="flex items-center gap-2 mb-2">
        <div
          className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
            todayComplete ? "bg-secondary/20" : todaySkipped || todayBroken ? "bg-muted" : isFasting ? "bg-primary/20" : "bg-muted"
          }`}
        >
          {todayComplete ? (
            <span className="text-sm font-bold text-secondary" aria-hidden>✓</span>
          ) : isFasting ? (
            <Moon className="w-4 h-4 text-primary" aria-hidden />
          ) : (
            <Sun className="w-4 h-4 text-muted-foreground" aria-hidden />
          )}
        </div>
        <div className="min-w-0">
          <p className="text-xs font-medium text-muted-foreground truncate">
            {todayComplete ? "Completed" : todaySkipped ? "Skipped" : todayBroken ? "Broke fast" : isFasting ? "Fasting" : "Eating window"}
          </p>
          {showCountdown ? (
            <>
              <p
                className="text-lg font-bold tabular-nums truncate"
                aria-live="polite"
                aria-atomic="true"
              >
                {String(countdown.h).padStart(2, "0")}:
                {String(countdown.m).padStart(2, "0")}:
                {String(countdown.s).padStart(2, "0")}
              </p>
              <p className="text-[10px] text-muted-foreground" title={isFasting ? EATING_TIME_TITLE.iftarTime : EATING_TIME_TITLE.suhoor}>until {targetLabel}</p>
            </>
          ) : (
            <p className="text-sm font-semibold text-muted-foreground">—</p>
          )}
        </div>
      </div>

      {nextPrayer && (
        <p className="text-xs text-muted-foreground mb-2 truncate" title={`${nextPrayer.name} at ${nextPrayer.time}`}>
          🕌 {nextPrayer.name} in {nextPrayer.countdown}
        </p>
      )}

      {prayerTimes && (
        <p className="text-[10px] text-muted-foreground border-t border-border pt-2 mb-2">
          <span title={EATING_TIME_TITLE.suhoor}>Suhoor {prayerTimes.imsak}</span>
          {" · "}
          <span title={EATING_TIME_TITLE.iftar}>Iftar {prayerTimes.maghrib}</span>
        </p>
      )}

      {!todayComplete && !todaySkipped && !todayBroken && (
        <div className="flex flex-wrap gap-1">
          <button
            type="button"
            onClick={onMarkComplete}
            className="text-[10px] font-medium px-2 py-1 rounded bg-primary/20 text-primary hover:bg-primary/30"
          >
            Complete
          </button>
          {isFasting && (
            <button
              type="button"
              onClick={onBreakFast}
              className="hidden md:inline-flex text-[10px] font-medium px-2 py-1 rounded bg-destructive/20 text-destructive hover:bg-destructive/30"
            >
              Break
            </button>
          )}
          {!isFasting && (
            <button
              type="button"
              onClick={onSkip}
              className="text-[10px] font-medium px-2 py-1 rounded border border-border hover:bg-muted"
            >
              Skip
            </button>
          )}
        </div>
      )}

      {onGoToToday && (
        <button
          type="button"
          onClick={onGoToToday}
          className="w-full text-center text-[10px] font-medium text-primary hover:underline mt-2"
        >
          View today →
        </button>
      )}
    </div>
  );
}
