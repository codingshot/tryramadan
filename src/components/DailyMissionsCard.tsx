import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Target, Check, Circle, ChevronRight } from "lucide-react";
import { useDailyMissions, type DailyMission } from "@/hooks/useLocalStorage";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { ArabicHover } from "@/components/ArabicHover";
import { GENERAL_TOOLTIPS } from "@/data/general-tooltips";

const MISSION_TOOLTIPS: Record<string, string> = {
  start_fasting: "Tap \"I'm fasting\" on the dashboard after suhoor to mark that you've started today's fast.",
  complete_fast: "When you break your fast at Maghrib (or earlier), use the dashboard to log it. Mark the day complete if you fasted dawn to sunset.",
  log_suhoor: "On the Schedule page, add a meal plan note or food log entry for your pre-dawn meal (suhoor).",
  log_iftar: "On the Schedule page, add a meal plan note or food log entry for your break-fast meal (iftar).",
  add_note: "On the Schedule page, click a day and add a note in the Note field—e.g. how you felt or what you ate.",
  read_hadith: "Open the Hadith page (Learn → Hadith) and read a short saying of the Prophet (peace be upon him) about fasting or Ramadan.",
};

function MissionRow({ mission }: { mission: DailyMission }) {
  const tip = MISSION_TOOLTIPS[mission.id];
  const content = (
    <span className="flex items-center gap-2 text-sm">
      {mission.completed ? (
        <Check className="w-4 h-4 shrink-0 text-secondary" aria-hidden />
      ) : (
        <Circle className="w-4 h-4 shrink-0 text-muted-foreground" aria-hidden />
      )}
      {tip ? (
        <Tooltip>
          <TooltipTrigger asChild>
            <span className={`cursor-help border-b border-dotted border-muted-foreground/30 ${mission.completed ? "text-muted-foreground line-through" : ""}`}>
              {mission.label}
            </span>
          </TooltipTrigger>
          <TooltipContent side="right" className="max-w-xs">
            <p className="text-xs text-muted-foreground">{tip}</p>
          </TooltipContent>
        </Tooltip>
      ) : (
        <span className={mission.completed ? "text-muted-foreground line-through" : ""}>
          {mission.label}
        </span>
      )}
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
        <Tooltip>
          <TooltipTrigger asChild>
            <h3 className="font-display font-bold flex items-center gap-2 cursor-help w-fit border-b border-dotted border-transparent hover:border-muted-foreground/40">
              <Target className="w-5 h-5 text-secondary" />
              <ArabicHover arabic="مهام اليوم" explanation={GENERAL_TOOLTIPS.todayMissions.body}>Today&apos;s missions</ArabicHover>
            </h3>
          </TooltipTrigger>
          <TooltipContent>
            <p className="font-medium">{GENERAL_TOOLTIPS.todayMissions.title}</p>
            <p className="text-xs mt-1 text-muted-foreground">{GENERAL_TOOLTIPS.todayMissions.body}</p>
          </TooltipContent>
        </Tooltip>
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
