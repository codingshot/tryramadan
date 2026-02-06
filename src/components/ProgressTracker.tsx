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
    <div className="space-y-3 sm:space-y-4">
      {/* Header – compact on mobile */}
      <div className="text-center">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1.5 sm:px-4 sm:py-2 rounded-full bg-secondary/10 text-secondary text-xs sm:text-sm font-medium">
          <span aria-hidden>📅</span>
          Ramadan Calendar
        </div>
        {isPlaceholder && (
          <p className="text-[10px] sm:text-xs text-muted-foreground mt-1">Sample preview — get started to track your own</p>
        )}
      </div>

      {/* Overall progress bar */}
      <div className="space-y-1.5">
        <div className="flex justify-between text-xs sm:text-sm">
          <span className="text-muted-foreground">Progress</span>
          <span className="font-semibold text-secondary tabular-nums">Day {currentDay} of {totalDays}</span>
        </div>
        <div className="progress-ramadan">
          <motion.div 
            className="progress-ramadan-fill"
            initial={{ width: 0 }}
            animate={{ width: `${progressPercentage}%` }}
            transition={{ duration: 1, ease: "easeOut" }}
          />
        </div>
        <div className="flex justify-between text-[10px] sm:text-xs text-muted-foreground">
          <span>{completedDays.length} completed</span>
          <span>{totalDays - completedDays.length} remaining</span>
        </div>
      </div>

      {/* Day indicators – smaller on mobile, no labels under circles to save space */}
      <div className="flex items-center justify-center gap-1 sm:gap-2 flex-wrap">
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
                relative w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 rounded-full flex items-center justify-center text-xs sm:text-sm font-medium
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
              title={`Day ${day}`}
            >
              {isCompleted ? (
                <span aria-hidden className="text-[10px] sm:text-xs">✅</span>
              ) : isCurrent ? (
                <span aria-hidden className="text-xs sm:text-sm">⭐</span>
              ) : (
                day
              )}
            </motion.div>
          );
        })}
      </div>

      {/* Streak + hours – single row, compact */}
      <div className="flex items-center justify-center gap-1.5 sm:gap-2 pt-2 sm:pt-3 flex-wrap">
        <motion.div 
          className="flex items-center gap-1.5 sm:gap-2 px-2.5 py-1.5 sm:px-4 sm:py-2 rounded-full bg-gradient-gold text-foreground"
          animate={displayStreak > 0 ? { scale: [1, 1.02, 1] } : {}}
          transition={{ duration: 2, repeat: displayStreak > 0 ? Infinity : 0 }}
        >
          <span className="text-base sm:text-xl md:text-2xl">🔥</span>
          <span className="font-bold text-xs sm:text-sm">
            {displayStreak > 0 ? `${displayStreak} Day Streak!` : "No streak yet"}
          </span>
        </motion.div>
        {displayStreak === 0 && (
          <p className="text-[10px] sm:text-xs text-muted-foreground w-full text-center sm:w-auto sm:mt-0">Log your first fast to start</p>
        )}
        {showHoursFasted && (
          <div className="flex items-center gap-1.5 px-2.5 py-1.5 sm:px-4 sm:py-2 rounded-full bg-muted text-foreground text-xs sm:text-sm font-medium">
            <span aria-hidden>⏱</span>
            <span>{totalHoursFasted.toFixed(1)}h fasted</span>
          </div>
        )}
      </div>
    </div>
  );
};
