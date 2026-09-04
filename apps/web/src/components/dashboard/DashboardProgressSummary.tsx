import { motion } from "framer-motion";
import { Flame, TrendingUp } from "lucide-react";
import { Link } from "react-router-dom";
import { ProgressRing } from "@/components/ProgressRing";
import { type FastingProgress, calculateStreak } from "@/hooks/useLocalStorage";

interface DashboardProgressSummaryProps {
  progress: FastingProgress;
  ramadanRange: {
    start: Date;
    end: Date;
    totalDays: number;
    isRamadanDay: (date: Date) => boolean;
  };
  completionRate: number;
  todayStr: string;
}

export const DashboardProgressSummary = ({
  progress,
  ramadanRange,
  completionRate,
  todayStr,
}: DashboardProgressSummaryProps) => {
  const streak = calculateStreak(progress, todayStr);
  const totalDays = ramadanRange.totalDays ?? 30;

  const ramadanStart = ramadanRange.start.toISOString().split("T")[0];
  const ramadanEnd = ramadanRange.end.toISOString().split("T")[0];
  const completedInRange = (progress.completedDays ?? []).filter(
    (d) => d >= ramadanStart && d <= ramadanEnd
  );
  const ramadanCompletionPct = totalDays > 0
    ? Math.round((completedInRange.length / totalDays) * 100)
    : 0;

  // Check for milestone streaks
  const isMilestoneStreak = [7, 15, 30].includes(streak);
  const milestoneLabel =
    streak === 7 ? "Week streak!" :
    streak === 15 ? "Half-month streak!" :
    "Full month streak!";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.3 }}
      className="space-y-4"
    >
      {/* Progress Card - Compact for Sidebar */}
      <div className="p-4 rounded-2xl bg-card border border-border">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold">Your Progress</h3>
          <Link
            to="/dashboard/progress"
            className="text-xs text-primary hover:underline flex items-center gap-1"
          >
            Details
            <TrendingUp className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Compact Progress Ring */}
        <div className="flex justify-center mb-4">
          <ProgressRing
            value={ramadanCompletionPct}
            size={100}
            strokeWidth={8}
            centerLabel={completedInRange.length}
            sublabel={`of ${totalDays}`}
          />
        </div>

        {/* Compact Stats */}
        <div className="space-y-2">
          <div className="flex items-center justify-between py-2 px-3 rounded-lg bg-muted/30">
            <div className="flex items-center gap-2">
              <Flame className="w-4 h-4 text-orange-500" />
              <span className="text-xs text-muted-foreground">Streak</span>
            </div>
            <span className="font-bold text-sm">{streak}d</span>
          </div>

          <div className="flex items-center justify-between py-2 px-3 rounded-lg bg-muted/30">
            <div className="flex items-center gap-2">
              <span>📊</span>
              <span className="text-xs text-muted-foreground">Rate</span>
            </div>
            <span className="font-bold text-sm">{completionRate}%</span>
          </div>

          <div className="flex items-center justify-between py-2 px-3 rounded-lg bg-muted/30">
            <div className="flex items-center gap-2">
              <span>✓</span>
              <span className="text-xs text-muted-foreground">Total</span>
            </div>
            <span className="font-bold text-sm">{progress.completedDays.length}</span>
          </div>
        </div>
      </div>

      {/* Milestone Celebration */}
      {isMilestoneStreak && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="p-3 rounded-2xl bg-secondary/20 border-2 border-secondary/50 text-center"
        >
          <span className="text-2xl block mb-1">🎉</span>
          <span className="font-bold text-secondary text-sm">{milestoneLabel}</span>
          <span className="block text-xs text-muted-foreground mt-1">
            {streak} days
          </span>
        </motion.div>
      )}
    </motion.div>
  );
};
