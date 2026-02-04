import { useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowLeft, Target, Plus, Check, Circle, Trash2, Moon } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { useGoalsUntilRamadan, type GoalUntilRamadan } from "@/hooks/useLocalStorage";
import { getDaysUntilRamadan, getNextRamadanStart, isCurrentlyRamadan } from "@/lib/ramadan";
import { GENERAL_TOOLTIPS } from "@/data/general-tooltips";
import { PageSEO } from "@/components/PageSEO";

function generateId(): string {
  return `goal-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export default function DashboardGoals() {
  const [goals, setGoals] = useGoalsUntilRamadan();
  const [newTitle, setNewTitle] = useState("");
  const daysUntil = getDaysUntilRamadan();
  const nextStart = getNextRamadanStart();
  const inRamadan = isCurrentlyRamadan();

  const addGoal = () => {
    const title = newTitle.trim();
    if (!title) return;
    const entry: GoalUntilRamadan = {
      id: generateId(),
      title,
      completed: false,
      createdAt: new Date().toISOString(),
    };
    setGoals((prev) => [...prev, entry]);
    setNewTitle("");
  };

  const toggleGoal = (id: string) => {
    setGoals((prev) =>
      prev.map((g) => (g.id === id ? { ...g, completed: !g.completed } : g))
    );
  };

  const removeGoal = (id: string) => {
    setGoals((prev) => prev.filter((g) => g.id !== id));
  };

  const completedCount = goals.filter((g) => g.completed).length;

  return (
    <div className="min-h-screen bg-background">
      <PageSEO
        title="Goals Until Ramadan | TryRamadan.app"
        description="Set and track goals before Ramadan: spiritual, health, and learning goals. Countdown to Ramadan."
        path="/dashboard/goals"
      />
      <Navbar />
      <main id="main-content" className="main-content">
        <div className="container mx-auto px-4 max-w-2xl min-w-0">
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </Link>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <h1 className="text-2xl md:text-3xl font-display font-bold">
              Goals until Ramadan
            </h1>
            <p className="text-muted-foreground mt-2">
              Set intentions and habits to complete before Ramadan begins.
            </p>
          </motion.div>

          {/* Countdown / Ramadan status */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="p-6 rounded-2xl bg-card border border-border mb-8"
          >
            <div className="flex items-center gap-3 mb-2">
              <Moon className="w-8 h-8 text-secondary" />
              {inRamadan ? (
                <div>
                  <h2 className="font-display font-bold text-secondary">
                    Ramadan Mubarak!
                  </h2>
                </div>
              ) : daysUntil > 0 ? (
                <div>
                  <span className="text-3xl font-bold text-secondary">{daysUntil}</span>
                  <span className="text-muted-foreground ml-2">days until Ramadan</span>
                  <p className="text-xs text-muted-foreground mt-1">
                    Approx. start: {nextStart.toLocaleDateString("en", { weekday: "long", month: "long", day: "numeric", year: "numeric" })}
                  </p>
                </div>
              ) : (
                <p className="text-muted-foreground">Next Ramadan is ahead. Set your goals for the coming year.</p>
              )}
            </div>
          </motion.div>

          {/* Add goal */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-8"
          >
            <label className="block text-sm font-medium mb-2">Add a goal</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addGoal()}
                placeholder="e.g. Read 1 juz of Quran, Give charity, Prepare suhoor recipes"
                className="flex-1 px-4 py-3 rounded-xl border border-border bg-background text-sm focus:ring-2 focus:ring-secondary outline-none"
              />
              <button
                type="button"
                onClick={addGoal}
                className="p-3 rounded-xl bg-secondary text-secondary-foreground hover:bg-secondary/90 flex items-center gap-2"
                aria-label="Add goal"
              >
                <Plus className="w-5 h-5" />
              </button>
            </div>
          </motion.div>

          {/* List */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
          >
            <h3 className="font-display font-bold mb-4 flex items-center gap-2">
              <Target className="w-5 h-5 text-secondary" />
              Your goals ({completedCount} / {goals.length} done)
            </h3>
            {goals.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4">
                Set intentions that matter to you. Goals are optional — add one or two if you&apos;d like a focus (e.g. read Quran, give charity, try new recipes).
              </p>
            ) : (
              <ul className="space-y-2">
                {goals.map((goal) => (
                  <li
                    key={goal.id}
                    className="flex items-center gap-3 p-4 rounded-xl bg-card border border-border"
                  >
                    <button
                      type="button"
                      onClick={() => toggleGoal(goal.id)}
                      className="flex-shrink-0 rounded-full p-0.5 hover:bg-muted transition-colors"
                      aria-label={goal.completed ? "Mark incomplete" : "Mark complete"}
                    >
                      {goal.completed ? (
                        <Check className="w-6 h-6 text-secondary" />
                      ) : (
                        <Circle className="w-6 h-6 text-muted-foreground" />
                      )}
                    </button>
                    <span
                      className={`flex-1 text-sm ${
                        goal.completed ? "line-through text-muted-foreground" : ""
                      }`}
                    >
                      {goal.title}
                    </span>
                    <button
                      type="button"
                      onClick={() => removeGoal(goal.id)}
                      className="p-2 rounded-lg hover:bg-destructive/20 text-muted-foreground hover:text-destructive transition-colors"
                      aria-label="Remove goal"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </motion.div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
