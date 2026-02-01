import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Target, ChevronRight, Check, Circle, Moon } from "lucide-react";
import { useGoalsUntilRamadan } from "@/hooks/useLocalStorage";
import { getDaysUntilRamadan, isCurrentlyRamadan } from "@/lib/ramadan";

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
        <h3 className="font-display font-bold flex items-center gap-2">
          <Target className="w-5 h-5 text-secondary" />
          Goals until Ramadan
        </h3>
        <Link
          to="/dashboard/goals"
          className="text-sm text-secondary hover:underline flex items-center gap-1"
        >
          Manage <ChevronRight className="w-4 h-4" />
        </Link>
      </div>
      {inRamadan ? (
        <div className="flex items-center gap-2 p-3 rounded-xl bg-secondary/10 border border-secondary/20 mb-4">
          <Moon className="w-5 h-5 text-secondary" />
          <span className="font-medium text-secondary">Ramadan Mubarak! • رمضان مبارك</span>
        </div>
      ) : daysUntil > 0 ? (
        <div className="flex items-center gap-2 p-3 rounded-xl bg-secondary/10 border border-secondary/20 mb-4">
          <span className="text-2xl font-bold text-secondary">{daysUntil}</span>
          <span className="text-sm text-muted-foreground">days until Ramadan</span>
        </div>
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
            Add goals
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
