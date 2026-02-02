import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Target, Check, Circle, ChevronRight } from "lucide-react";
import { useDailyMissions, type DailyMission } from "@/hooks/useLocalStorage";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

function MissionRow({ mission }: { mission: DailyMission }) {
  const content = (
    <span className="flex items-center gap-2 text-sm">
      {mission.completed ? (
        <Check className="w-4 h-4 shrink-0 text-secondary" aria-hidden />
      ) : (
        <Circle className="w-4 h-4 shrink-0 text-muted-foreground" aria-hidden />
      )}
      <span className={mission.completed ? "text-muted-foreground line-through" : ""}>
        {mission.label}
      </span>
      {mission.path && !mission.completed && (
        <ChevronRight className="w-3.5 h-3.5 text-muted-foreground ml-auto shrink-0" aria-hidden />
      )}
    </span>
  );

  if (mission.path && !mission.completed) {
    return (
      <Link
        to={mission.path}
        className="block py-2 px-3 rounded-lg hover:bg-muted/50 transition-colors"
      >
        {content}
      </Link>
    );
  }

  return (
    <div className="py-2 px-3 rounded-lg">
      {content}
    </div>
  );
}

export function DailyMissionsCard() {
  const { missions, completedCount, totalCount } = useDailyMissions();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.14 }}
      className="p-4 rounded-2xl bg-card border border-border"
    >
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-display font-bold flex items-center gap-2">
          <Target className="w-5 h-5 text-secondary" />
          Today&apos;s missions
          <span className="font-arabic text-sm font-normal text-muted-foreground">مهام اليوم</span>
        </h3>
        <Tooltip>
          <TooltipTrigger asChild>
            <span className="text-sm font-medium text-secondary tabular-nums">
              {completedCount}/{totalCount}
            </span>
          </TooltipTrigger>
          <TooltipContent>
            <p className="font-medium">Daily missions completed</p>
            <p className="text-xs mt-1">Start fasting, log meals, add a note, read a hadith, and complete or break your fast.</p>
          </TooltipContent>
        </Tooltip>
      </div>
      <p className="text-xs text-muted-foreground mb-3">
        Small steps for your fasting day. Tap an item to open the right page.
      </p>
      <ul className="space-y-0.5">
        {missions.map((m) => (
          <li key={m.id}>
            <MissionRow mission={m} />
          </li>
        ))}
      </ul>
    </motion.div>
  );
}
