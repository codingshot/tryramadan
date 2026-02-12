import { motion } from "framer-motion";
import { Clock, Target, Lightbulb, AlertCircle } from "lucide-react";
import { Link } from "react-router-dom";
import { type PrayerTimes } from "@/lib/adhanService";
import { useDailyMissions, useUserPreferences, type FastingProgress } from "@/hooks/useLocalStorage";
import { DashboardProgressSummary } from "./DashboardProgressSummary";
import { DashboardQuickActions } from "./DashboardQuickActions";

interface DashboardSidebarProps {
  prayerTimes: PrayerTimes | null;
  todayStr: string;
  progress: FastingProgress;
  ramadanRange: {
    start: Date;
    end: Date;
    totalDays: number;
    isRamadanDay: (date: Date) => boolean;
  };
  completionRate: number;
  onViewAllPrayers: () => void;
}

export const DashboardSidebar = ({
  prayerTimes,
  todayStr,
  progress,
  ramadanRange,
  completionRate,
  onViewAllPrayers,
}: DashboardSidebarProps) => {
  const [preferences] = useUserPreferences();

  // Get today's missions
  const dailyMissions = useDailyMissions();

  // Get next 3 upcoming prayers
  const getUpcomingPrayers = () => {
    if (!prayerTimes) return [];

    const now = new Date();
    const prayers = [
      { name: "Fajr", time: prayerTimes.fajr },
      { name: "Dhuhr", time: prayerTimes.dhuhr },
      { name: "Asr", time: prayerTimes.asr },
      { name: "Maghrib", time: prayerTimes.maghrib },
      { name: "Isha", time: prayerTimes.isha },
    ];

    const upcoming = prayers
      .map((p) => ({
        ...p,
        date: new Date(p.time),
      }))
      .filter((p) => p.date > now)
      .slice(0, 3);

    return upcoming;
  };

  const upcomingPrayers = getUpcomingPrayers();

  // Time-based quick tip
  const getQuickTip = () => {
    const hour = new Date().getHours();
    if (hour < 6)
      return {
        text: "Time for Suhoor! Eat protein-rich foods.",
        icon: "🌙",
      };
    if (hour < 12)
      return {
        text: "Remember to make morning duas.",
        icon: "🤲",
      };
    if (hour < 15)
      return {
        text: "Stay productive, you're halfway there!",
        icon: "💪",
      };
    if (hour < 18)
      return {
        text: "Almost Iftar time, prepare your meal.",
        icon: "🌅",
      };
    return {
      text: "Don't overeat at Iftar. Start with dates.",
      icon: "🍽️",
    };
  };

  const tip = getQuickTip();

  return (
    <div className="hidden lg:block sticky top-4 space-y-4">
      {/* Quick Actions */}
      <DashboardQuickActions onViewAllPrayers={onViewAllPrayers} />

      {/* Progress Summary */}
      <DashboardProgressSummary
        progress={progress}
        ramadanRange={ramadanRange}
        completionRate={completionRate}
        todayStr={todayStr}
      />

      {/* Upcoming Prayers */}
      {upcomingPrayers.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="p-4 rounded-2xl bg-card border border-border"
        >
          <h3 className="font-semibold mb-3 flex items-center gap-2">
            <Clock className="w-5 h-5 text-primary" />
            Upcoming Prayers
          </h3>
          <div className="space-y-2">
            {upcomingPrayers.map((prayer, idx) => {
              const timeStr = prayer.date.toLocaleTimeString("en-US", {
                hour: "numeric",
                minute: "2-digit",
                hour12: true,
              });
              const now = new Date();
              const diff = prayer.date.getTime() - now.getTime();
              const hoursUntil = Math.floor(diff / (1000 * 60 * 60));
              const minsUntil = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
              const timeUntil =
                hoursUntil > 0
                  ? `in ${hoursUntil}h ${minsUntil}m`
                  : `in ${minsUntil}m`;

              return (
                <div
                  key={prayer.name}
                  className={`flex items-center justify-between p-2 rounded-lg ${
                    idx === 0 ? "bg-primary/10" : "bg-muted/30"
                  }`}
                >
                  <div>
                    <p className={`font-medium ${idx === 0 ? "text-primary" : ""}`}>
                      {prayer.name}
                    </p>
                    <p className="text-xs text-muted-foreground">{timeUntil}</p>
                  </div>
                  <p className="text-sm font-semibold">{timeStr}</p>
                </div>
              );
            })}
          </div>
        </motion.div>
      )}

      {/* Quick Tip */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.2 }}
        className="p-4 rounded-2xl bg-gradient-to-br from-secondary/5 to-primary/5 border border-border"
      >
        <h3 className="font-semibold mb-2 flex items-center gap-2">
          <Lightbulb className="w-5 h-5 text-secondary" />
          Quick Tip
        </h3>
        <p className="text-sm text-muted-foreground">
          <span className="mr-2">{tip.icon}</span>
          {tip.text}
        </p>
      </motion.div>

      {/* Today's Missions (Compact) */}
      {dailyMissions.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.3 }}
          className="p-4 rounded-2xl bg-card border border-border"
        >
          <h3 className="font-semibold mb-3 flex items-center gap-2">
            <Target className="w-5 h-5 text-secondary" />
            Today's Goals
          </h3>
          <ul className="space-y-2">
            {dailyMissions.slice(0, 3).map((mission) => (
              <li
                key={mission.id}
                className="text-sm flex items-start gap-2"
              >
                <span className="text-muted-foreground mt-0.5">•</span>
                <span className="text-muted-foreground">{mission.title}</span>
              </li>
            ))}
          </ul>
          {dailyMissions.length > 3 && (
            <p className="text-xs text-muted-foreground mt-2">
              +{dailyMissions.length - 3} more missions
            </p>
          )}
        </motion.div>
      )}

      {/* Emergency Link (if fasting) */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.4 }}
        className="p-4 rounded-2xl bg-destructive/5 border border-destructive/20"
      >
        <h3 className="font-semibold mb-2 flex items-center gap-2 text-destructive">
          <AlertCircle className="w-5 h-5" />
          Need Help?
        </h3>
        <p className="text-sm text-muted-foreground mb-2">
          Feeling unwell while fasting?
        </p>
        <Link
          to="/learn"
          className="text-sm text-destructive hover:underline font-medium"
        >
          Learn when to break your fast →
        </Link>
      </motion.div>
    </div>
  );
};
