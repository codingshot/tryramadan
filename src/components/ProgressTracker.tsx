import { motion } from "framer-motion";

interface ProgressTrackerProps {
  currentDay: number;
  totalDays: number;
  completedDays: number[];
  /** Consecutive days completed (from dashboard logic). When provided, streak display uses this. */
  streak?: number;
  /** Total hours fasted from fastingLog. Shown when provided and > 0. */
  totalHoursFasted?: number;
  /** When true, section is a sample preview (not yet tracking). */
  isPlaceholder?: boolean;
}

export const ProgressTracker = ({ 
  currentDay = 5, 
  totalDays = 30,
  completedDays = [1, 2, 3, 4],
  streak,
  totalHoursFasted = 0,
  isPlaceholder = false,
}: ProgressTrackerProps) => {
  const progressPercentage = (completedDays.length / totalDays) * 100;
  const displayStreak = streak !== undefined ? streak : completedDays.length;
  const showHoursFasted = totalHoursFasted !== undefined && totalHoursFasted > 0;
  
  // Show a window of days around current day
  const visibleDays = 7;
  const startDay = Math.max(1, currentDay - Math.floor(visibleDays / 2));
  const endDay = Math.min(totalDays, startDay + visibleDays - 1);
  const daysToShow = Array.from({ length: endDay - startDay + 1 }, (_, i) => startDay + i);

  return (
    <div className="space-y-6">
      {/* Header with Arabic */}
      <div className="text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary/10 text-secondary text-sm font-medium mb-2">
          <span aria-hidden>📅</span>
          <span>Ramadan Calendar</span>
          <span className="font-arabic">تقويم رمضان</span>
        </div>
        {isPlaceholder && (
          <p className="text-xs text-muted-foreground mt-1">Sample preview — complete setup to track your own</p>
        )}
      </div>

      {/* Overall progress bar */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">
            Progress • التقدم
          </span>
          <span className="font-semibold text-secondary">
            Day {currentDay} • اليوم {currentDay} من {totalDays}
          </span>
        </div>
        <div className="progress-ramadan">
          <motion.div 
            className="progress-ramadan-fill"
            initial={{ width: 0 }}
            animate={{ width: `${progressPercentage}%` }}
            transition={{ duration: 1, ease: "easeOut" }}
          />
        </div>
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>{completedDays.length} completed • مكتمل</span>
          <span>{totalDays - completedDays.length} remaining • متبقي</span>
        </div>
      </div>

      {/* Day indicators */}
      <div className="flex items-center justify-center gap-2 flex-wrap">
        {daysToShow.map((day, index) => {
          const isCompleted = completedDays.includes(day);
          const isCurrent = day === currentDay;
          const isFuture = day > currentDay;

          return (
            <motion.div
              key={`day-${day}`}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.05 }}
              className={`
                relative w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium
                transition-all duration-300 cursor-pointer
                ${isCurrent 
                  ? "bg-gradient-gold text-foreground shadow-gold glow-pulse" 
                  : isCompleted 
                    ? "bg-primary text-primary-foreground" 
                    : isFuture 
                      ? "bg-muted text-muted-foreground" 
                      : "bg-muted text-muted-foreground"
                }
              `}
            >
              {isCompleted ? (
                <span aria-hidden>✅</span>
              ) : isCurrent ? (
                <span aria-hidden>⭐</span>
              ) : (
                day
              )}
              
              {/* Day label */}
              <span className="absolute -bottom-5 left-1/2 -translate-x-1/2 text-xs text-muted-foreground">
                {day}
              </span>
            </motion.div>
          );
        })}
      </div>

      {/* Streak counter */}
      <div className="flex items-center justify-center gap-2 pt-4 flex-wrap">
        <motion.div 
          className="flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-gold text-foreground"
          animate={displayStreak > 0 ? { scale: [1, 1.02, 1] } : {}}
          transition={{ duration: 2, repeat: displayStreak > 0 ? Infinity : 0 }}
        >
          <span className="text-2xl">🔥</span>
          <span className="font-bold">
            {displayStreak > 0 ? `${displayStreak} Day Streak!` : "No streak yet"}
          </span>
          <span className="font-arabic text-sm">{displayStreak > 0 ? "سلسلة أيام!" : "ابدأ الصيام"}</span>
        </motion.div>
        {showHoursFasted && (
          <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-muted text-foreground text-sm font-medium">
            <span aria-hidden>⏱</span>
            <span>{totalHoursFasted.toFixed(1)}h fasted</span>
          </div>
        )}
      </div>
    </div>
  );
};
