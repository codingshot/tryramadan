import { useState } from "react";
import { motion } from "framer-motion";
import { ChevronRight, Flame, Check } from "lucide-react";
import { type PrayerTimes } from "@/hooks/usePrayerTimes";
import { type FastingProgress, useDisplayTimezone } from "@/hooks/useLocalStorage";
import { timeStringToSecondsSinceMidnight, getNowSecondsSinceMidnightInTimezone } from "@/lib/utils";

interface DashboardPrayerTrackingProps {
  prayerTimes: PrayerTimes | null;
  progress: FastingProgress;
  completionRate: number;
  prayerTracker: Record<string, Record<string, boolean>>;
  todayStr: string;
  onPrayerCheck: (prayer: string, checked: boolean) => void;
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

  if (!prayerTimes) {
    return null;
  }

  // Get current time in seconds since midnight
  const nowSec = displayTimezone
    ? getNowSecondsSinceMidnightInTimezone(displayTimezone)
    : (() => {
        const n = new Date();
        return n.getHours() * 3600 + n.getMinutes() * 60 + n.getSeconds();
      })();

  // Define all prayers with their times
  const allPrayers = [
    { name: "Fajr", time: prayerTimes.fajr },
    { name: "Dhuhr", time: prayerTimes.dhuhr },
    { name: "Asr", time: prayerTimes.asr },
    { name: "Maghrib", time: prayerTimes.maghrib },
    { name: "Isha", time: prayerTimes.isha },
  ];

  // Find next 3 prayers
  const prayersWithTime = allPrayers.map((prayer) => {
    const prayerSec = timeStringToSecondsSinceMidnight(prayer.time);
    const isPast = nowSec > prayerSec;
    const isChecked = prayerTracker[todayStr]?.[prayer.name.toLowerCase()] || false;
    const secondsUntil = isPast ? 0 : prayerSec - nowSec;

    return {
      ...prayer,
      seconds: prayerSec,
      isPast,
      isChecked,
      secondsUntil,
    };
  });

  // Get next 3 upcoming prayers (or last 3 if all are past)
  const upcomingPrayers = prayersWithTime.filter((p) => !p.isPast);
  const next3Prayers =
    upcomingPrayers.length >= 3
      ? upcomingPrayers.slice(0, 3)
      : [
          ...upcomingPrayers,
          ...prayersWithTime.filter((p) => p.isPast).slice(-(3 - upcomingPrayers.length)),
        ];

  // Find the very next prayer
  const nextPrayer = upcomingPrayers[0];

  // Format countdown
  const formatCountdown = (seconds: number) => {
    if (seconds === 0) return "Passed";
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    if (h > 0) return `In ${h}h ${m}m`;
    return `In ${m}m`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.1 }}
      className="space-y-4"
    >
      {/* Prayer Tracking Card */}
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

        {/* Next 3 Prayers */}
        <div className="space-y-2">
          {next3Prayers.map((prayer, index) => {
            const isNext = prayer.name === nextPrayer?.name;

            return (
              <div
                key={prayer.name}
                className={`flex items-center justify-between p-3 rounded-xl transition-colors ${
                  isNext
                    ? "bg-primary/10 border-2 border-primary/30"
                    : "bg-muted/30"
                } ${prayer.isPast && !prayer.isChecked ? "opacity-60" : ""}`}
              >
                {/* Checkbox + Prayer Name */}
                <div className="flex items-center gap-3 flex-1">
                  <input
                    type="checkbox"
                    checked={prayer.isChecked}
                    onChange={(e) => onPrayerCheck(prayer.name.toLowerCase(), e.target.checked)}
                    className="w-5 h-5 rounded border-2 border-primary text-primary focus:ring-2 focus:ring-primary/20 cursor-pointer"
                    aria-label={`Mark ${prayer.name} as prayed`}
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <span
                        className={`font-medium ${
                          prayer.isChecked ? "line-through text-muted-foreground" : ""
                        }`}
                      >
                        {prayer.name}
                      </span>
                      {isNext && (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-primary text-primary-foreground">
                          Next
                        </span>
                      )}
                    </div>
                    <span className="text-sm text-muted-foreground">{prayer.time}</span>
                  </div>
                </div>

                {/* Status */}
                <div className="text-sm text-muted-foreground">
                  {prayer.isChecked ? (
                    <span className="flex items-center gap-1 text-secondary">
                      <Check className="w-4 h-4" />
                      Done
                    </span>
                  ) : (
                    <span>{formatCountdown(prayer.secondsUntil)}</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Quick Stats Row */}
      <div className="flex items-center justify-center gap-4 p-4 rounded-xl bg-muted/30">
        <div className="flex items-center gap-2">
          <Flame className="w-5 h-5 text-orange-500" />
          <span className="font-semibold">{progress.currentStreak}</span>
          <span className="text-sm text-muted-foreground">days</span>
        </div>

        <div className="w-px h-6 bg-border" />

        <div className="flex items-center gap-2">
          <Check className="w-5 h-5 text-secondary" />
          <span className="font-semibold">
            {progress.completedDays.length}/{progress.totalDays}
          </span>
        </div>

        <div className="w-px h-6 bg-border" />

        <div className="flex items-center gap-2">
          <span className="text-2xl">📊</span>
          <span className="font-semibold">{completionRate}%</span>
        </div>
      </div>
    </motion.div>
  );
};
