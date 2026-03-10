import { motion } from "framer-motion";
import { Moon, Sun, AlertTriangle } from "lucide-react";
import { type FastingProgress, getTodayFastingLog } from "@/hooks/useLocalStorage";
import { type PrayerTimes } from "@/hooks/usePrayerTimes";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { GENERAL_TOOLTIPS } from "@/data/general-tooltips";
import { EATING_TIME_TITLE } from "@/data/eating-times-tooltips";

interface DashboardHeroProps {
  progress: FastingProgress;
  isFasting: boolean;
  /** Time window: true = between Suhoor end and Iftar (fasting window). Used so countdown/label always reflect eating vs fasting time. */
  inFastingWindow: boolean;
  countdownToIftar: { h: number; m: number; s: number };
  countdownToSuhoor: { h: number; m: number; s: number };
  prayerTimes: PrayerTimes | null;
  todayStr: string;
  nextPrayer: { name: string; time: string; countdown: string; h?: number; m?: number; s?: number } | null;
  onMarkComplete: () => void;
  /** When true, Mark complete is grayed out (fasting not done yet; before iftar). Click still fires and parent shows message. */
  markCompleteDisabled?: boolean;
  onBreakFast: () => void;
  onSkip: () => void;
}

export const DashboardHero = ({
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
}: DashboardHeroProps) => {
  const todayEntry = getTodayFastingLog(progress, todayStr);
  const todayComplete = progress.completedDays.includes(todayStr);
  const todaySkipped = progress.skippedDays?.includes(todayStr);
  const todayBroken = todayEntry?.status === "broken";
  const todayExcusedMenstruation = todayBroken && todayEntry?.brokenReason === "menstruation";

  /* Countdown always reflects time window: fasting window = time until Iftar; eating window = time until Suhoor */
  const countdown = inFastingWindow ? countdownToIftar : countdownToSuhoor;
  const targetLabel = inFastingWindow ? "Iftar" : "Suhoor";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="relative overflow-hidden"
    >
      {/* Large Hero Card */}
      <div
        className={`p-6 md:p-8 rounded-2xl border-2 ${
          todayExcusedMenstruation
            ? "bg-muted/50 border-border"
            : todayBroken
              ? "bg-destructive/5 border-destructive/30"
              : isFasting
                ? "bg-primary/10 border-primary/30"
                : "bg-muted/50 border-border"
        }`}
      >
        {/* Status Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div
              className={`w-12 h-12 rounded-full flex items-center justify-center ${
                todayExcusedMenstruation ? "bg-muted" : todayBroken ? "bg-destructive/20" : isFasting ? "bg-primary/20" : "bg-muted"
              }`}
            >
              {todayExcusedMenstruation ? (
                <Sun className="w-6 h-6 text-muted-foreground" />
              ) : todayBroken ? (
                <AlertTriangle className="w-6 h-6 text-destructive" />
              ) : isFasting ? (
                <Moon className="w-6 h-6 text-primary" />
              ) : (
                <Sun className="w-6 h-6 text-muted-foreground" />
              )}
            </div>
            <div>
              <Tooltip>
                <TooltipTrigger asChild>
                  <h2 className="text-xl md:text-2xl font-bold cursor-help border-b border-dotted border-transparent hover:border-foreground/40">
                    {todayExcusedMenstruation
                      ? "No need to fast"
                      : todayBroken
                        ? "Broke fast"
                        : inFastingWindow
                          ? "Currently Fasting"
                          : "Eating Window"}
                  </h2>
                </TooltipTrigger>
                <TooltipContent className="max-w-xs p-3">
                  <p className="font-semibold text-sm">
                    {todayExcusedMenstruation
                      ? "No need to fast"
                      : todayBroken
                        ? "Broke fast"
                        : inFastingWindow
                          ? GENERAL_TOOLTIPS.fastingPeriod.title
                          : "Eating Window"}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {todayExcusedMenstruation
                      ? "You're in your menstrual period. In Islam there is no obligation to fast during menstruation. These days don't break your streak."
                      : todayBroken
                        ? "You logged that you broke your fast today. Countdown below is until Iftar or next Suhoor."
                        : inFastingWindow
                          ? GENERAL_TOOLTIPS.fastingPeriod.body
                          : "You're between sunset (Maghrib) and dawn (Fajr). You can eat and drink."}
                  </p>
                </TooltipContent>
              </Tooltip>
              <p className="text-sm text-muted-foreground">
                {todayExcusedMenstruation
                  ? "Excused (menstruation)"
                  : todayBroken
                    ? "Logged breaking fast today"
                    : inFastingWindow
                      ? "No food or drink"
                      : "You can eat now"}
              </p>
            </div>
          </div>

          {/* Status Badge */}
          {todayComplete && (
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-secondary/20 text-secondary border border-secondary/40">
              Completed ✓
            </span>
          )}
          {todaySkipped && (
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-muted/80 text-muted-foreground border border-border">
              Skipped
            </span>
          )}
          {todayExcusedMenstruation && (
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-muted/80 text-muted-foreground border border-border">
              No need to fast
            </span>
          )}
          {todayBroken && !todayExcusedMenstruation && (
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-destructive/20 text-destructive border border-destructive/40">
              Broke Fast
            </span>
          )}
        </div>

        {/* Countdown always shown: fasting window = time until Iftar; eating window = time until Suhoor (regardless of completion/skip status) */}
        <div className="text-center py-6 md:py-8">
          {(todayComplete || todaySkipped) && (
            <p className="text-sm font-semibold text-muted-foreground mb-2">
              {todayComplete ? "Day complete" : "Skipped"}
            </p>
          )}
          <motion.div
            key={`${countdown.h}-${countdown.m}-${countdown.s}`}
            initial={{ scale: 0.95, opacity: 0.8 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.2 }}
            className="text-5xl md:text-7xl font-bold tabular-nums mb-2"
            aria-live="polite"
            aria-atomic="true"
            aria-label={`${countdown.h} hours ${countdown.m} minutes ${countdown.s} seconds until ${targetLabel}`}
          >
            {String(countdown.h).padStart(2, "0")}:
            {String(countdown.m).padStart(2, "0")}:
            {String(countdown.s).padStart(2, "0")}
          </motion.div>
          <p className="text-lg md:text-xl text-muted-foreground" title={inFastingWindow ? EATING_TIME_TITLE.iftarTime : EATING_TIME_TITLE.suhoor}>
            until {targetLabel}
            {todayBroken && (
              <span className="block text-sm mt-1 text-destructive/90">(you broke fast today)</span>
            )}
          </p>
        </div>

        {/* Next Prayer + countdown */}
        {nextPrayer && (
          <div className="text-center mb-6 pb-6 border-b border-border">
            <p className="text-sm text-muted-foreground mb-1">Next Prayer</p>
            <p className="text-lg font-semibold mb-1">
              🕌 {nextPrayer.name} at {nextPrayer.time}
            </p>
            <p
              className="text-2xl md:text-3xl font-bold tabular-nums text-secondary"
              aria-live="polite"
              aria-atomic="true"
              aria-label={`${nextPrayer.name} in ${nextPrayer.countdown}`}
            >
              {typeof nextPrayer.h === "number" && typeof nextPrayer.m === "number" && typeof nextPrayer.s === "number"
                ? `${String(nextPrayer.h).padStart(2, "0")}:${String(nextPrayer.m).padStart(2, "0")}:${String(nextPrayer.s).padStart(2, "0")}`
                : nextPrayer.countdown}
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">until {nextPrayer.name}</p>
          </div>
        )}

        {/* Action Buttons */}
        {!todayComplete && !todaySkipped && !todayBroken && (
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={onMarkComplete}
              aria-disabled={markCompleteDisabled}
              className={`flex-1 py-3 px-4 rounded-xl font-semibold flex items-center justify-center gap-2 min-h-[48px] transition-colors ${
                markCompleteDisabled
                  ? "bg-muted text-muted-foreground cursor-not-allowed opacity-70"
                  : "bg-primary text-primary-foreground hover:bg-primary/90"
              }`}
            >
              <Moon className="w-5 h-5" />
              Mark Complete
            </button>
            {isFasting && (
              <button
                onClick={onBreakFast}
                className="hidden md:flex flex-1 py-3 px-4 rounded-xl border-2 border-destructive/40 bg-destructive/10 text-destructive font-semibold hover:bg-destructive/20 transition-colors items-center justify-center gap-2 min-h-[48px]"
              >
                <AlertTriangle className="w-5 h-5" />
                Break Fast
              </button>
            )}
            {!isFasting && !todayComplete && (
              <button
                onClick={onSkip}
                className="flex-1 py-3 px-4 rounded-xl border-2 border-border bg-background font-semibold hover:bg-muted/50 transition-colors min-h-[48px]"
              >
                I Didn't Fast Today
              </button>
            )}
          </div>
        )}

        {/* Suhoor & Iftar Times Footer */}
        {prayerTimes && (
          <div className="mt-6 pt-6 border-t border-border flex items-center justify-center gap-4 text-sm text-muted-foreground">
            <span title={EATING_TIME_TITLE.suhoor}>
              Suhoor: <span className="font-semibold">{prayerTimes.imsak}</span>
            </span>
            <span>•</span>
            <span title={EATING_TIME_TITLE.iftar}>
              Iftar: <span className="font-semibold">{prayerTimes.maghrib}</span>
            </span>
          </div>
        )}
      </div>
    </motion.div>
  );
};
