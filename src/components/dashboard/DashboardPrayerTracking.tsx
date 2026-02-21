import { useState } from "react";
import { motion } from "framer-motion";
import { ChevronRight, ChevronDown, ChevronUp, Flame, Check, Clock, AlertCircle, Lock, BookOpen } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { type PrayerTimes } from "@/hooks/usePrayerTimes";
import { type FastingProgress, useDisplayTimezone } from "@/hooks/useLocalStorage";
import { timeStringToSecondsSinceMidnight, getNowSecondsSinceMidnightInTimezone } from "@/lib/utils";
import { getOptionalPrayersByParent } from "@/data/optionalPrayers";

/** Prayer tracker value: boolean for daily prayers; 'half' | 'full' for Taraweeh. */
export type PrayerTrackerValue = boolean | 'half' | 'full';

/** How-to-pray guide data for each prayer */
const PRAYER_GUIDES: Record<string, { rakah: number; description: string; makeup: string }> = {
  fajr: {
    rakah: 2,
    description: "2 rak'ahs. Recite Al-Fatiha + a surah in each. Performed between dawn (adhan) and sunrise.",
    makeup: "Pray 2 rak'ahs as soon as you remember, even after sunrise. Make the intention for Qada (makeup) Fajr.",
  },
  dhuhr: {
    rakah: 4,
    description: "4 rak'ahs. Recite Al-Fatiha in each; add a surah in the first two. Performed after the sun passes its zenith.",
    makeup: "Pray 4 rak'ahs with intention for Qada Dhuhr. Best to make up before the next prayer time.",
  },
  asr: {
    rakah: 4,
    description: "4 rak'ahs. Same structure as Dhuhr. Performed in the late afternoon.",
    makeup: "Pray 4 rak'ahs with intention for Qada Asr. Should be made up as soon as possible.",
  },
  maghrib: {
    rakah: 3,
    description: "3 rak'ahs. Recite Al-Fatiha + surah in first two, Al-Fatiha only in the third. Performed right after sunset.",
    makeup: "Pray 3 rak'ahs with intention for Qada Maghrib. Make up before sleeping if missed.",
  },
  isha: {
    rakah: 4,
    description: "4 rak'ahs. Same structure as Dhuhr/Asr. Performed after twilight disappears.",
    makeup: "Pray 4 rak'ahs with intention for Qada Isha. Can be made up until Fajr of the next day, or later.",
  },
};

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
  const [showGuide, setShowGuide] = useState<string | null>(null);

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
    const guide = PRAYER_GUIDES[prayer.name.toLowerCase()];
    return { ...prayer, seconds: prayerSec, isPast, isChecked, secondsUntil, optionalPrayers, guide };
  });

  const upcomingPrayers = prayersWithTime.filter((p) => !p.isPast);
  const pastPrayers = prayersWithTime.filter((p) => p.isPast);
  const nextPrayer = upcomingPrayers[0];

  const formatCountdown = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    if (h > 0) return `${h}h ${m}m`;
    return `${m}m`;
  };

  const renderPrayerRow = (prayer: typeof prayersWithTime[number], isNext: boolean, section: "upcoming" | "past") => {
    const hasOptional = prayer.optionalPrayers.length > 0;
    const isExpanded = expandedPrayer === prayer.name;
    const isGuideOpen = showGuide === prayer.name;
    // Future prayers (not yet arrived) cannot be checked off
    const isFuture = !prayer.isPast && !isNext;
    // The "next" prayer is the one whose time just arrived or is imminent — allow check
    const canCheck = prayer.isPast || isNext;

    return (
      <div key={prayer.name}>
        <div
          className={`flex items-center justify-between p-3 rounded-xl transition-colors ${
            isNext
              ? "bg-primary/10 border-2 border-primary/30"
              : prayer.isPast && !prayer.isChecked
                ? "bg-destructive/5 border border-destructive/20"
                : isFuture
                  ? "bg-muted/20 border border-border/50"
                  : "bg-muted/30"
          }`}
        >
          <div className="flex items-center gap-3 flex-1 min-w-0">
            {canCheck ? (
              <label className="flex items-center cursor-pointer shrink-0">
                <input
                  type="checkbox"
                  checked={prayer.isChecked}
                  onChange={(e) => onPrayerCheck(prayer.name.toLowerCase(), e.target.checked)}
                  className="w-5 h-5 rounded border-2 border-primary text-primary focus:ring-2 focus:ring-primary/20 cursor-pointer accent-primary"
                />
              </label>
            ) : (
              <Tooltip>
                <TooltipTrigger asChild>
                  <span className="shrink-0">
                    <Lock className="w-4 h-4 text-muted-foreground/50" />
                  </span>
                </TooltipTrigger>
                <TooltipContent side="top" className="max-w-xs p-2 z-50 bg-popover border border-border">
                  <p className="text-xs">Prayer time hasn't arrived yet. You can mark it after {prayer.time}.</p>
                </TooltipContent>
              </Tooltip>
            )}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className={`font-medium ${prayer.isChecked ? "line-through text-muted-foreground" : isFuture ? "text-muted-foreground" : ""}`}>
                  {prayer.name}
                </span>
                {isNext && (
                  <span className="text-xs px-2 py-0.5 rounded-full bg-primary text-primary-foreground">Next</span>
                )}
                {prayer.isPast && !prayer.isChecked && (
                  <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-destructive/10 text-destructive font-medium">
                    Missed
                  </span>
                )}
              </div>
              <span className="text-sm text-muted-foreground">{prayer.time}</span>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <div className="text-sm text-muted-foreground">
              {prayer.isChecked ? (
                <span className="flex items-center gap-1 text-secondary">
                  <Check className="w-4 h-4" /> Done
                </span>
              ) : prayer.isPast ? (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      type="button"
                      onClick={() => setShowGuide(isGuideOpen ? null : prayer.name)}
                      className="flex items-center gap-1 text-destructive/70 hover:text-destructive text-xs"
                    >
                      <AlertCircle className="w-3.5 h-3.5" />
                      Make up
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="top" className="max-w-xs p-2 z-50 bg-popover border border-border">
                    <p className="text-xs">Tap for guidance on making up this prayer (Qada).</p>
                  </TooltipContent>
                </Tooltip>
              ) : (
                <span className="flex items-center gap-1 text-xs">
                  <Clock className="w-3 h-3" />
                  {formatCountdown(prayer.secondsUntil)}
                </span>
              )}
            </div>
            {(hasOptional || prayer.guide) && (
              <button
                type="button"
                onClick={() => setExpandedPrayer(isExpanded ? null : prayer.name)}
                className="p-1 rounded-md hover:bg-muted/50"
                aria-label={`${isExpanded ? "Hide" : "Show"} details for ${prayer.name}`}
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

        {/* Expanded: prayer guide + optional prayers */}
        {isExpanded && (
          <div className="ml-4 mt-1 space-y-1.5 mb-1">
            {/* How to pray guide */}
            {prayer.guide && (
              <div className="p-2.5 rounded-lg bg-primary/5 border border-primary/10">
                <div className="flex items-center gap-1.5 mb-1">
                  <BookOpen className="w-3.5 h-3.5 text-primary" />
                  <span className="text-xs font-semibold text-primary">How to pray {prayer.name}</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-primary/10 text-primary ml-auto">
                    {prayer.guide.rakah} rak'ah{prayer.guide.rakah > 1 ? "s" : ""}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">{prayer.guide.description}</p>
              </div>
            )}

            {/* Makeup guidance for missed prayers */}
            {prayer.isPast && !prayer.isChecked && prayer.guide && (
              <div className="p-2.5 rounded-lg bg-destructive/5 border border-destructive/10">
                <div className="flex items-center gap-1.5 mb-1">
                  <AlertCircle className="w-3.5 h-3.5 text-destructive" />
                  <span className="text-xs font-semibold text-destructive">Making up {prayer.name} (Qada)</span>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">{prayer.guide.makeup}</p>
                <button
                  type="button"
                  onClick={() => onPrayerCheck(prayer.name.toLowerCase(), true)}
                  className="mt-2 text-xs font-medium text-primary hover:underline"
                >
                  ✓ I've made up this prayer
                </button>
              </div>
            )}

            {/* Optional prayers */}
            {prayer.optionalPrayers.map((opt) => {
              const raw = prayerTracker[todayStr]?.[opt.id];
              const optChecked = raw === true || raw === "half" || raw === "full";
              // Optional prayers follow their parent's availability
              const optDisabled = !canCheck;
              return (
                <Tooltip key={opt.id}>
                  <TooltipTrigger asChild>
                    <label className={`flex items-center gap-2.5 p-2 rounded-lg bg-muted/20 hover:bg-muted/40 ${optDisabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}>
                      <input
                        type="checkbox"
                        checked={optChecked}
                        disabled={optDisabled}
                        onChange={(e) => onPrayerCheck(opt.id, e.target.checked)}
                        className="w-4 h-4 rounded border-2 border-primary/60 text-primary focus:ring-2 focus:ring-primary/20 shrink-0 accent-primary"
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

        {/* Standalone makeup guide (from "Make up" button) */}
        {isGuideOpen && !isExpanded && prayer.isPast && !prayer.isChecked && prayer.guide && (
          <div className="ml-4 mt-1 mb-1 p-2.5 rounded-lg bg-destructive/5 border border-destructive/10">
            <div className="flex items-center gap-1.5 mb-1">
              <AlertCircle className="w-3.5 h-3.5 text-destructive" />
              <span className="text-xs font-semibold text-destructive">Making up {prayer.name} (Qada)</span>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">{prayer.guide.makeup}</p>
            <div className="flex items-center gap-3 mt-2">
              <button
                type="button"
                onClick={() => {
                  onPrayerCheck(prayer.name.toLowerCase(), true);
                  setShowGuide(null);
                }}
                className="text-xs font-medium text-primary hover:underline"
              >
                ✓ I've made up this prayer
              </button>
              <button
                type="button"
                onClick={() => setShowGuide(null)}
                className="text-xs text-muted-foreground hover:underline"
              >
                Dismiss
              </button>
            </div>
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
            {upcomingPrayers.map((prayer) => renderPrayerRow(prayer, prayer.name === nextPrayer?.name, "upcoming"))}
          </div>
        )}

        {/* Past prayers — show below upcoming for quick marking */}
        {pastPrayers.length > 0 && (
          <div className={upcomingPrayers.length > 0 ? "mt-3 pt-3 border-t border-border/60" : ""}>
            <p className="text-xs text-muted-foreground mb-2 font-medium flex items-center gap-1">
              <Clock className="w-3 h-3" /> Earlier today
            </p>
            <div className="space-y-2">
              {pastPrayers.map((prayer) => renderPrayerRow(prayer, false, "past"))}
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
