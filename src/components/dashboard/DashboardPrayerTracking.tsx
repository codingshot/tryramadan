import { useState } from "react";
import { motion } from "framer-motion";
import { ChevronRight, ChevronDown, ChevronUp, Flame, Check } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { type PrayerTimes } from "@/hooks/usePrayerTimes";
import { type FastingProgress, useDisplayTimezone } from "@/hooks/useLocalStorage";
import { timeStringToSecondsSinceMidnight, getNowSecondsSinceMidnightInTimezone } from "@/lib/utils";
import { getOptionalPrayersByParent } from "@/data/optionalPrayers";

/** Prayer tracker value: boolean for daily prayers; 'half' | 'full' for Taraweeh. */
export type PrayerTrackerValue = boolean | 'half' | 'full';

interface DashboardPrayerTrackingProps {
  prayerTimes: PrayerTimes | null;
  progress: FastingProgress;
  completionRate: number;
  prayerTracker: Record<string, Record<string, PrayerTrackerValue>>;
  todayStr: string;
  onPrayerCheck: (prayer: string, value: PrayerTrackerValue) => void;
  onViewAllPrayers: () => void;
}

export const DashboardPrayerTracking = ({
  prayerTimes,
  progress,
  completionRate,
  prayerTracker,
  todayStr,
  onPrayerCheck,
  onViewAllPrayers,
}: DashboardPrayerTrackingProps) => {
  const displayTimezone = useDisplayTimezone();
  const [expandedPrayer, setExpandedPrayer] = useState<string | null>(null);

  if (!prayerTimes) return null;

  const nowSec = displayTimezone
    ? getNowSecondsSinceMidnightInTimezone(displayTimezone)
    : (() => {
        const n = new Date();
        return n.getHours() * 3600 + n.getMinutes() * 60 + n.getSeconds();
      })();

  const allPrayers = [
    { name: "Fajr", time: prayerTimes.fajr },
    { name: "Dhuhr", time: prayerTimes.dhuhr },
    { name: "Asr", time: prayerTimes.asr },
    { name: "Maghrib", time: prayerTimes.maghrib },
    { name: "Isha", time: prayerTimes.isha },
  ];

  const taraweehValue = prayerTracker[todayStr]?.taraweeh;
  const taraweehDone = taraweehValue === 'half' || taraweehValue === 'full';

  const prayersWithTime = allPrayers.map((prayer) => {
    const prayerSec = timeStringToSecondsSinceMidnight(prayer.time);
    const isPast = nowSec > prayerSec;
    const raw = prayerTracker[todayStr]?.[prayer.name.toLowerCase()];
    const isChecked = raw === true || raw === 'half' || raw === 'full';
    const secondsUntil = isPast ? 0 : prayerSec - nowSec;
    const optionalPrayers = getOptionalPrayersByParent(prayer.name);
    return { ...prayer, seconds: prayerSec, isPast, isChecked, secondsUntil, optionalPrayers };
  });

  const upcomingPrayers = prayersWithTime.filter((p) => !p.isPast);
  const pastPrayers = prayersWithTime.filter((p) => p.isPast);
  const nextPrayer = upcomingPrayers[0];

  const formatCountdown = (seconds: number) => {
    if (seconds === 0) return "Passed";
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    if (h > 0) return `In ${h}h ${m}m`;
    return `In ${m}m`;
  };

  const renderPrayerRow = (prayer: typeof prayersWithTime[number], isNext: boolean) => {
    const hasOptional = prayer.optionalPrayers.length > 0;
    const isExpanded = expandedPrayer === prayer.name;

    return (
      <div key={prayer.name}>
        <div
          className={`flex items-center justify-between p-3 rounded-xl transition-colors ${
            isNext
              ? "bg-primary/10 border-2 border-primary/30"
              : "bg-muted/30"
          } ${prayer.isPast && !prayer.isChecked ? "opacity-60" : ""}`}
        >
          <label className="flex items-center gap-3 flex-1 cursor-pointer min-w-0">
            <input
              type="checkbox"
              checked={prayer.isChecked}
              onChange={(e) => onPrayerCheck(prayer.name.toLowerCase(), e.target.checked)}
              className="w-5 h-5 rounded border-2 border-primary text-primary focus:ring-2 focus:ring-primary/20 cursor-pointer shrink-0 accent-primary"
            />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className={`font-medium ${prayer.isChecked ? "line-through text-muted-foreground" : ""}`}>
                  {prayer.name}
                </span>
                {isNext && (
                  <span className="text-xs px-2 py-0.5 rounded-full bg-primary text-primary-foreground">Next</span>
                )}
              </div>
              <span className="text-sm text-muted-foreground">{prayer.time}</span>
            </div>
          </label>

          <div className="flex items-center gap-2 shrink-0">
            <div className="text-sm text-muted-foreground">
              {prayer.isChecked ? (
                <span className="flex items-center gap-1 text-secondary">
                  <Check className="w-4 h-4" /> Done
                </span>
              ) : (
                <span>{formatCountdown(prayer.secondsUntil)}</span>
              )}
            </div>
            {hasOptional && (
              <button
                type="button"
                onClick={() => setExpandedPrayer(isExpanded ? null : prayer.name)}
                className="p-1 rounded-md hover:bg-muted/50"
                aria-label={`${isExpanded ? "Hide" : "Show"} optional prayers for ${prayer.name}`}
                aria-expanded={isExpanded}
              >
                {isExpanded ? (
                  <ChevronUp className="w-4 h-4 text-muted-foreground" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-muted-foreground" />
                )}
              </button>
            )}
          </div>
        </div>

        {/* Optional prayers nested under this fard prayer */}
        {hasOptional && isExpanded && (
          <div className="ml-6 mt-1 space-y-1 mb-1">
            {prayer.optionalPrayers.map((opt) => {
              const raw = prayerTracker[todayStr]?.[opt.id];
              const optChecked = raw === true || raw === "half" || raw === "full";
              return (
                <Tooltip key={opt.id}>
                  <TooltipTrigger asChild>
                    <label className="flex items-center gap-2.5 p-2 rounded-lg bg-muted/20 hover:bg-muted/40 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={optChecked}
                        onChange={(e) => onPrayerCheck(opt.id, e.target.checked)}
                        className="w-4 h-4 rounded border-2 border-primary/60 text-primary focus:ring-2 focus:ring-primary/20 cursor-pointer shrink-0 accent-primary"
                        aria-label={`Mark ${opt.label} as ${optChecked ? "not " : ""}prayed`}
                      />
                      <span className={`text-xs font-medium truncate ${optChecked ? "line-through text-muted-foreground" : ""}`}>
                        {opt.label}
                        {opt.rakah && <span className="text-muted-foreground font-normal ml-1">({opt.rakah})</span>}
                      </span>
                    </label>
                  </TooltipTrigger>
                  <TooltipContent side="right" className="max-w-xs p-3 z-50 bg-popover border border-border">
                    <p className="font-medium text-sm">{opt.label}</p>
                    <p className="text-xs text-muted-foreground mt-1">{opt.description}</p>
                  </TooltipContent>
                </Tooltip>
              );
            })}
          </div>
        )}
      </div>
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.1 }}
      className="space-y-4"
    >
      <div className="p-4 rounded-2xl bg-card border border-border">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-lg">Today's Prayers</h3>
          <button
            onClick={onViewAllPrayers}
            className="text-sm text-primary hover:underline flex items-center gap-1"
          >
            View All
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Upcoming prayers */}
        {upcomingPrayers.length > 0 && (
          <div className="space-y-2">
            {upcomingPrayers.map((prayer) => renderPrayerRow(prayer, prayer.name === nextPrayer?.name))}
          </div>
        )}

        {/* Past prayers — show below upcoming for quick marking */}
        {pastPrayers.length > 0 && (
          <div className={upcomingPrayers.length > 0 ? "mt-3 pt-3 border-t border-border/60" : ""}>
            <p className="text-xs text-muted-foreground mb-2 font-medium">Earlier today</p>
            <div className="space-y-2">
              {pastPrayers.map((prayer) => renderPrayerRow(prayer, false))}
            </div>
          </div>
        )}

        {/* Taraweeh — mobile-responsive stacked layout */}
        <div className="mt-3 pt-3 border-t border-border">
          <div className="p-3 rounded-xl bg-muted/30 space-y-2">
            <div className="flex items-center justify-between gap-2">
              <Tooltip>
                <TooltipTrigger asChild>
                  <span className="font-medium cursor-help border-b border-dotted border-muted-foreground/40">
                    Taraweeh
                  </span>
                </TooltipTrigger>
                <TooltipContent side="top" className="max-w-xs p-3 z-50 bg-popover border border-border">
                  <p className="font-medium text-sm">Taraweeh (optional)</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Optional night prayer during Ramadan. Time depends on your mosque (usually after Isha).
                    Half = typically 8 rak&apos;ahs, Full = typically 20 rak&apos;ahs.
                  </p>
                </TooltipContent>
              </Tooltip>
              <span className="text-xs text-muted-foreground">After Isha</span>
            </div>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => onPrayerCheck('taraweeh', false)}
                className={`flex-1 py-2 rounded-lg text-xs font-medium transition-colors ${
                  !taraweehDone ? "bg-primary text-primary-foreground" : "bg-muted/70 text-muted-foreground hover:bg-muted"
                }`}
                aria-pressed={!taraweehDone}
                aria-label="Taraweeh: none"
              >
                Not done
              </button>
              <button
                type="button"
                onClick={() => onPrayerCheck('taraweeh', taraweehValue === 'half' ? false : 'half')}
                className={`flex-1 py-2 rounded-lg text-xs font-medium transition-colors ${
                  taraweehValue === 'half' ? "bg-primary text-primary-foreground" : "bg-muted/70 text-muted-foreground hover:bg-muted"
                }`}
                aria-pressed={taraweehValue === 'half'}
                aria-label="Taraweeh: half (8 rak'ahs)"
              >
                Half (8)
              </button>
              <button
                type="button"
                onClick={() => onPrayerCheck('taraweeh', taraweehValue === 'full' ? false : 'full')}
                className={`flex-1 py-2 rounded-lg text-xs font-medium transition-colors ${
                  taraweehValue === 'full' ? "bg-primary text-primary-foreground" : "bg-muted/70 text-muted-foreground hover:bg-muted"
                }`}
                aria-pressed={taraweehValue === 'full'}
                aria-label="Taraweeh: full (20 rak'ahs)"
              >
                Full (20)
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Stats Row */}
      <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 p-4 rounded-xl bg-muted/30">
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 cursor-help border-b border-transparent hover:border-foreground/30 transition-colors pb-0.5">
              <div className="flex items-center gap-2">
                <Flame className="w-5 h-5 text-orange-500 shrink-0" aria-hidden />
                <span className="font-semibold">{progress.currentStreak}</span>
                <span className="text-sm text-muted-foreground">days</span>
              </div>
              <span className="text-xs text-muted-foreground sm:block">Streak</span>
            </div>
          </TooltipTrigger>
          <TooltipContent side="top" className="max-w-[240px] z-50 bg-popover border border-border">
            <p className="font-medium">Fasting streak</p>
            <p className="text-muted-foreground text-xs mt-0.5">
              Consecutive days you completed the full fast (dawn to sunset). Skipped or broken days reset the streak.
            </p>
          </TooltipContent>
        </Tooltip>

        <div className="w-px h-8 bg-border shrink-0" aria-hidden />

        <Tooltip>
          <TooltipTrigger asChild>
            <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 cursor-help border-b border-transparent hover:border-foreground/30 transition-colors pb-0.5">
              <div className="flex items-center gap-2">
                <Check className="w-5 h-5 text-secondary shrink-0" aria-hidden />
                <span className="font-semibold">
                  {progress.completedDays.length}/{progress.totalDays}
                </span>
              </div>
              <span className="text-xs text-muted-foreground sm:block">Fasts done</span>
            </div>
          </TooltipTrigger>
          <TooltipContent side="top" className="max-w-[240px] z-50 bg-popover border border-border">
            <p className="font-medium">Fasts completed</p>
            <p className="text-muted-foreground text-xs mt-0.5">
              Days you marked as &quot;Mark complete&quot; (fasted full day) out of total Ramadan days so far.
            </p>
          </TooltipContent>
        </Tooltip>

        <div className="w-px h-8 bg-border shrink-0" aria-hidden />

        <Tooltip>
          <TooltipTrigger asChild>
            <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 cursor-help border-b border-transparent hover:border-foreground/30 transition-colors pb-0.5">
              <div className="flex items-center gap-2">
                <span className="text-xl sm:text-2xl" aria-hidden>📊</span>
                <span className="font-semibold">{completionRate}%</span>
              </div>
              <span className="text-xs text-muted-foreground sm:block">Completion</span>
            </div>
          </TooltipTrigger>
          <TooltipContent side="top" className="max-w-[240px] z-50 bg-popover border border-border">
            <p className="font-medium">Ramadan completion</p>
            <p className="text-muted-foreground text-xs mt-0.5">
              Percentage of Ramadan days you completed (full fast). Based on total days in this Ramadan so far.
            </p>
          </TooltipContent>
        </Tooltip>
      </div>
    </motion.div>
  );
};
