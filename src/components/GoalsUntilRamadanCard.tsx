import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Target, ChevronRight, Check, Circle, Moon } from "lucide-react";
import { useGoalsUntilRamadan } from "@/hooks/useLocalStorage";
import { getDaysUntilRamadan, isCurrentlyRamadan } from "@/lib/ramadan";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { GENERAL_TOOLTIPS } from "@/data/general-tooltips";

export function GoalsUntilRamadanCard() {
  const [goals, setGoals] = useGoalsUntilRamadan();
  const daysUntil = getDaysUntilRamadan();
  const inRamadan = isCurrentlyRamadan();
  const completedCount = goals.filter((g) => g.completed).length;
  const displayGoals = goals.slice(0, 4);

  const toggleGoal = (id: string) => {
    setGoals((prev) =>
      prev.map((g) => (g.id === id ? { ...g, completed: !g.completed } : g))
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="p-6 rounded-2xl bg-card border border-border"
    >
      <div className="flex items-center justify-between mb-4">
        <Tooltip>
          <TooltipTrigger asChild>
            <h3 className="font-display font-bold flex items-center gap-2 cursor-help border-b border-dotted border-transparent hover:border-muted-foreground/40 w-fit">
              <Target className="w-5 h-5 text-secondary" />
              Goals until Ramadan
            </h3>
          </TooltipTrigger>
          <TooltipContent className="max-w-xs p-3">
            <p className="font-medium">{GENERAL_TOOLTIPS.goalsUntilRamadan.title}</p>
            <p className="text-xs mt-1 text-muted-foreground">{GENERAL_TOOLTIPS.goalsUntilRamadan.body}</p>
            <p className="font-arabic text-xs text-muted-foreground mt-1" dir="rtl">{GENERAL_TOOLTIPS.goalsUntilRamadan.bodyAr}</p>
          </TooltipContent>
        </Tooltip>
        <Link
          to="/dashboard/goals"
          className="text-sm text-secondary hover:underline flex items-center gap-1"
        >
          Manage goals <ChevronRight className="w-4 h-4" />
        </Link>
      </div>
      {inRamadan ? (
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="flex items-center gap-2 p-3 rounded-xl bg-secondary/10 border border-secondary/20 mb-4 cursor-help">
              <Moon className="w-5 h-5 text-secondary" />
              <span className="font-medium text-secondary border-b border-dotted border-secondary/40">Ramadan Mubarak! • رمضان مبارك</span>
            </div>
          </TooltipTrigger>
          <TooltipContent className="max-w-xs p-3">
            <p className="font-medium">{GENERAL_TOOLTIPS.ramadanMubarak.title}</p>
            <p className="text-xs mt-1 text-muted-foreground">{GENERAL_TOOLTIPS.ramadanMubarak.body}</p>
            <p className="font-arabic text-xs text-muted-foreground mt-1" dir="rtl">{GENERAL_TOOLTIPS.ramadanMubarak.bodyAr}</p>
          </TooltipContent>
        </Tooltip>
      ) : daysUntil > 0 ? (
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="flex items-center gap-2 p-3 rounded-xl bg-secondary/10 border border-secondary/20 mb-4 cursor-help">
              <span className="text-2xl font-bold text-secondary">{daysUntil}</span>
              <span className="text-sm text-muted-foreground border-b border-dotted border-muted-foreground/40">days until Ramadan</span>
            </div>
          </TooltipTrigger>
          <TooltipContent className="max-w-xs p-3">
            <p className="font-medium">{GENERAL_TOOLTIPS.ramadan.title}</p>
            <p className="text-xs mt-1 text-muted-foreground">{GENERAL_TOOLTIPS.ramadan.body}</p>
            <p className="font-arabic text-xs text-muted-foreground mt-1" dir="rtl">{GENERAL_TOOLTIPS.ramadan.bodyAr}</p>
          </TooltipContent>
        </Tooltip>
      ) : null}
      {goals.length === 0 ? (
        <>
          <p className="text-sm text-muted-foreground mb-2">
            Set intentions before Ramadan: read Quran, give charity, prepare spiritually.
          </p>
          <Link
            to="/dashboard/goals"
            className="inline-flex items-center gap-2 py-2 px-4 rounded-xl bg-secondary/20 text-secondary font-medium text-sm hover:bg-secondary/30"
          >
            <Target className="w-4 h-4" />
            Add or edit goals
          </Link>
        </>
      ) : (
        <ul className="space-y-2">
          {displayGoals.map((goal) => (
            <li
              key={goal.id}
              className="flex items-center gap-3 py-1.5"
            >
              <button
                type="button"
                onClick={() => toggleGoal(goal.id)}
                className="flex-shrink-0 rounded-full p-0.5 hover:bg-muted transition-colors"
                aria-label={goal.completed ? "Mark incomplete" : "Mark complete"}
              >
                {goal.completed ? (
                  <Check className="w-5 h-5 text-secondary" />
                ) : (
                  <Circle className="w-5 h-5 text-muted-foreground" />
                )}
              </button>
              <span
                className={`text-sm flex-1 ${
                  goal.completed ? "line-through text-muted-foreground" : ""
                }`}
              >
                {goal.title}
              </span>
            </li>
          ))}
        </ul>
      )}
      {goals.length > 0 && (
        <p className="text-xs text-muted-foreground mt-3">
          {completedCount} / {goals.length} completed
        </p>
      )}
    </motion.div>
  );
}
