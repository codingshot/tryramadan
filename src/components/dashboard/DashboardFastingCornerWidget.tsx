import { Moon, Sun } from "lucide-react";
import { type FastingProgress, getTodayFastingLog } from "@/hooks/useLocalStorage";
import { type PrayerTimes } from "@/hooks/usePrayerTimes";
import { EATING_TIME_TITLE } from "@/data/eating-times-tooltips";

interface DashboardFastingCornerWidgetProps {
  progress: FastingProgress;
  isFasting: boolean;
  /** Time window: true = fasting window. Used so countdown/label always reflect eating vs fasting time. */
  inFastingWindow: boolean;
  countdownToIftar: { h: number; m: number; s: number };
  countdownToSuhoor: { h: number; m: number; s: number };
  prayerTimes: PrayerTimes | null;
  todayStr: string;
  nextPrayer: { name: string; time: string; countdown: string; h?: number; m?: number; s?: number } | null;
  onMarkComplete: () => void;
  /** When true, Complete button is grayed out (before iftar). Click still fires and parent shows message. */
  markCompleteDisabled?: boolean;
  onBreakFast: () => void;
  onSkip: () => void;
  onGoToToday?: () => void;
}

export function DashboardFastingCornerWidget({
  progress,
  isFasting,
  inFastingWindow,
  countdownToIftar,
  countdownToSuhoor,
  prayerTimes,
  todayStr,
  nextPrayer,
  onMarkComplete,
  markCompleteDisabled = false,
  onBreakFast,
  onSkip,
  onGoToToday,
}: DashboardFastingCornerWidgetProps) {
  const todayEntry = getTodayFastingLog(progress, todayStr);
  const todayComplete = progress.completedDays.includes(todayStr);
  const todaySkipped = progress.skippedDays?.includes(todayStr);
  const todayBroken = todayEntry?.status === "broken";
  const todayNoNeedToFast = todayBroken && todayEntry?.brokenReason === "menstruation";

  /* Countdown always reflects time window (and is always shown, regardless of complete/skipped) */
  const countdown = inFastingWindow ? countdownToIftar : countdownToSuhoor;
  const targetLabel = inFastingWindow ? "Iftar" : "Suhoor";

  return (
    <div
      className="rounded-xl border border-border bg-card p-3 shadow-sm w-full max-w-full sm:max-w-[220px]"
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
            {todayComplete ? "Completed" : todaySkipped ? "Skipped" : todayNoNeedToFast ? "No need to fast" : todayBroken ? "Broke fast" : isFasting ? "Fasting" : "Eating window"}
          </p>
          <p
            className="text-lg font-bold tabular-nums truncate"
            aria-live="polite"
            aria-atomic="true"
            aria-label={`${countdown.h} hours ${countdown.m} minutes until ${targetLabel}`}
          >
            {String(countdown.h).padStart(2, "0")}:
            {String(countdown.m).padStart(2, "0")}:
            {String(countdown.s).padStart(2, "0")}
          </p>
          <p className="text-[10px] text-muted-foreground" title={inFastingWindow ? EATING_TIME_TITLE.iftarTime : EATING_TIME_TITLE.suhoor}>until {targetLabel}</p>
        </div>
      </div>

      {nextPrayer && (
        <div className="mb-2">
          <p className="text-xs text-muted-foreground truncate" title={`${nextPrayer.name} at ${nextPrayer.time}`}>
            🕌 Next: {nextPrayer.name}
          </p>
          <p
            className="text-sm font-bold tabular-nums truncate"
            aria-live="polite"
            aria-atomic="true"
            aria-label={`${nextPrayer.name} in ${nextPrayer.countdown}`}
          >
            {typeof nextPrayer.h === "number" && typeof nextPrayer.m === "number" && typeof nextPrayer.s === "number"
              ? `${String(nextPrayer.h).padStart(2, "0")}:${String(nextPrayer.m).padStart(2, "0")}:${String(nextPrayer.s).padStart(2, "0")}`
              : nextPrayer.countdown}
          </p>
        </div>
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
            aria-disabled={markCompleteDisabled}
            className={`text-[10px] font-medium px-2 py-1 rounded ${
              markCompleteDisabled
                ? "bg-muted text-muted-foreground cursor-not-allowed opacity-60"
                : "bg-primary/20 text-primary hover:bg-primary/30"
            }`}
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
