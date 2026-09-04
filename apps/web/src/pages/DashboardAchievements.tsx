import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowLeft, Trophy, ChevronRight } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import {
  useFastingProgress,
  useLocalStorage,
  calculateStreak,
  useDisplayTimezone,
  getStreakDays,
  useRecentRecipes,
} from "@/hooks/useLocalStorage";
import { useRamadanRange } from "@/hooks/useRamadanRange";
import { getTodayStringInTimezone } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { PageSEO } from "@/components/PageSEO";

function formatDate(dateStr: string): string {
  try {
    return new Date(dateStr + "T12:00:00").toLocaleDateString(undefined, {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return dateStr;
  }
}

export default function DashboardAchievements() {
  const [progress] = useFastingProgress();
  const ramadanRange = useRamadanRange();
  const [learnRead] = useLocalStorage<string[]>("tryramadan-learn-read", []);
  const [journalEntries] = useLocalStorage<{ date: string }[]>("tryramadan-journal", []);
  const [recentRecipes] = useRecentRecipes();
  const displayTimezone = useDisplayTimezone();
  const todayStr = displayTimezone ? getTodayStringInTimezone(displayTimezone) : undefined;
  const ramadanStart = ramadanRange.startStr ?? "";
  const ramadanEnd = ramadanRange.endStr ?? "";
  const completedInRamadan = (progress.completedDays ?? []).filter(
    (d) => d >= ramadanStart && d <= ramadanEnd
  );
  const completedDays = completedInRamadan.length;
  const completedSorted = useMemo(() => [...completedInRamadan].sort(), [completedInRamadan]);
  const totalDays = ramadanRange.totalDays ?? 30;
  const eagerLearnerUnlocked = learnRead.length >= 5;
  const currentStreak = calculateStreak(progress, todayStr);
  const streakDays = getStreakDays(progress, todayStr);

  const [selectedBadgeId, setSelectedBadgeId] = useState<string | null>(null);

  const badges = [
    {
      id: "first-fast",
      name: "First Fast",
      desc: "Complete your first fast",
      icon: "🌙",
      unlocked: completedDays >= 1,
    },
    {
      id: "week-one",
      name: "Week One",
      desc: "Complete 7 days",
      icon: "⭐",
      unlocked: completedDays >= 7,
    },
    {
      id: "halfway",
      name: "Halfway There",
      desc: "Complete 15 days",
      icon: "🏅",
      unlocked: completedDays >= 15,
    },
    {
      id: "streak-5",
      name: "Consistent",
      desc: "5-day streak",
      icon: "🔥",
      unlocked: currentStreak >= 5,
    },
    {
      id: "streak-10",
      name: "Dedicated",
      desc: "10-day streak",
      icon: "💪",
      unlocked: currentStreak >= 10,
    },
    {
      id: "full-month",
      name: "Ramadan Champion",
      desc: `Complete all ${totalDays} days`,
      icon: "🏆",
      unlocked: totalDays > 0 && completedDays >= totalDays,
    },
    {
      id: "learner",
      name: "Eager Learner",
      desc: "Read 5 educational topics",
      icon: "📚",
      unlocked: eagerLearnerUnlocked,
    },
  ];

  const unlocked = badges.filter((b) => b.unlocked);
  const locked = badges.filter((b) => !b.unlocked);

  function getBadgeDetail(badgeId: string): {
    when?: string;
    how: string;
    progress?: string;
    stats?: string;
  } {
    const statsParts: string[] = [];
    if (completedDays > 0) statsParts.push(`${completedDays} day${completedDays === 1 ? "" : "s"} fasted in Ramadan`);
    if (journalEntries.length > 0) statsParts.push(`${journalEntries.length} journal entr${journalEntries.length === 1 ? "y" : "ies"}`);
    if (recentRecipes.length > 0) statsParts.push(`${recentRecipes.length} recipe${recentRecipes.length === 1 ? "" : "s"} tried`);
    const stats = statsParts.length > 0 ? statsParts.join("; ") : undefined;

    switch (badgeId) {
      case "first-fast": {
        const firstDate = completedSorted[0];
        return {
          when: firstDate ? formatDate(firstDate) : undefined,
          how: "You completed your first full fast during this Ramadan.",
          progress: completedDays >= 1 ? undefined : "Complete a full fast and mark it done on the Dashboard or Schedule.",
          stats,
        };
      }
      case "week-one": {
        const seventhDate = completedSorted[6];
        return {
          when: seventhDate ? formatDate(seventhDate) : undefined,
          how: "You completed 7 full days of fasting in Ramadan.",
          progress: completedDays >= 7 ? undefined : `You've completed ${completedDays} of 7 days. Keep going!`,
          stats,
        };
      }
      case "halfway": {
        const fifteenthDate = completedSorted[14];
        return {
          when: fifteenthDate ? formatDate(fifteenthDate) : undefined,
          how: "You reached the halfway mark: 15 days of fasting in Ramadan.",
          progress: completedDays >= 15 ? undefined : `You've completed ${completedDays} of 15 days.`,
          stats,
        };
      }
      case "streak-5": {
        const fifthStreakDate = streakDays[4];
        return {
          when: fifthStreakDate ? formatDate(fifthStreakDate) : undefined,
          how: "You built a 5-day streak of consecutive completed or excused fasting days.",
          progress: currentStreak >= 5 ? undefined : `Your current streak is ${currentStreak} day${currentStreak === 1 ? "" : "s"}. Complete or excuse each day to grow it.`,
          stats: streakDays.length >= 5
            ? `Streak days: ${streakDays.slice(0, 5).map(formatDate).join(", ")}${streakDays.length > 5 ? "…" : ""}`
            : stats,
        };
      }
      case "streak-10": {
        const tenthStreakDate = streakDays[9];
        return {
          when: tenthStreakDate ? formatDate(tenthStreakDate) : undefined,
          how: "You built a 10-day streak of consecutive completed or excused fasting days.",
          progress: currentStreak >= 10 ? undefined : `Your current streak is ${currentStreak} day${currentStreak === 1 ? "" : "s"}. Keep it going!`,
          stats: streakDays.length >= 10
            ? `Streak includes: ${streakDays.slice(0, 3).map(formatDate).join(", ")} … ${formatDate(streakDays[9])}`
            : stats,
        };
      }
      case "full-month": {
        const lastDate = completedSorted[completedSorted.length - 1];
        return {
          when: lastDate ? formatDate(lastDate) : undefined,
          how: `You completed all ${totalDays} days of Ramadan fasting.`,
          progress: completedDays >= totalDays ? undefined : `You've completed ${completedDays} of ${totalDays} days.`,
          stats,
        };
      }
      case "learner": {
        return {
          how: `You marked ${learnRead.length} learning topic${learnRead.length === 1 ? "" : "s"} as read on the Learn page (e.g. Ramadan basics, fasting rules, glossary, hadith).`,
          progress: learnRead.length >= 5 ? undefined : `You've read ${learnRead.length} of 5 topics. Open Learn and mark topics as read.`,
          stats,
        };
      }
      default:
        return { how: "", progress: undefined, stats };
    }
  }

  const selectedBadge = selectedBadgeId ? badges.find((b) => b.id === selectedBadgeId) : null;
  const detail = selectedBadge ? getBadgeDetail(selectedBadge.id) : null;

  return (
    <div className="min-h-screen bg-background">
      <PageSEO
        title="Achievements | TryRamadan.app"
        description="Ramadan fasting achievements and badges: first fast, streaks, and learning milestones."
        path="/dashboard/achievements"
      />
      <Navbar />
      <main id="main-content" className="main-content">
        <div className="container mx-auto px-4 max-w-4xl min-w-0">
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
              Achievements
            </h1>
            <p className="text-muted-foreground mt-2">
              Badges for milestones. Tap a badge to see how and when you earned it.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-8 p-6 rounded-2xl bg-secondary/10 border border-secondary/20 text-center"
          >
            <Trophy className="w-10 h-10 text-secondary mx-auto mb-2" />
            <span className="text-3xl font-bold text-secondary">{unlocked.length}</span>
            <span className="block text-sm text-muted-foreground">of {badges.length} badges earned</span>
          </motion.div>

          {unlocked.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="mb-8"
            >
              <h3 className="font-display font-bold mb-4">Earned</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {unlocked.map((b) => (
                  <button
                    key={b.id}
                    type="button"
                    onClick={() => setSelectedBadgeId(b.id)}
                    className="p-4 rounded-2xl bg-gradient-to-br from-secondary/20 to-secondary/5 border border-secondary/30 text-center hover:border-secondary/50 focus:outline-none focus-visible:ring-2 focus-visible:ring-secondary cursor-pointer"
                  >
                    <span className="text-4xl block mb-2">{b.icon}</span>
                    <span className="font-bold text-sm block">{b.name}</span>
                    <span className="text-xs text-muted-foreground">{b.desc}</span>
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <h3 className="font-display font-bold mb-4">Upcoming</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {locked.map((b) => (
                <button
                  key={b.id}
                  type="button"
                  onClick={() => setSelectedBadgeId(b.id)}
                  className="p-4 rounded-2xl bg-muted/50 border border-border text-center opacity-70 hover:opacity-90 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring cursor-pointer"
                >
                  <span className="text-4xl block mb-2 grayscale">{b.icon}</span>
                  <span className="font-bold text-sm block">{b.name}</span>
                  <span className="text-xs text-muted-foreground">Locked</span>
                </button>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mt-8"
          >
            <Link
              to="/dashboard/progress"
              className="flex items-center justify-between p-4 rounded-2xl bg-card border border-border hover:border-secondary/50 transition-all"
            >
              <span className="font-medium">View full progress & stats</span>
              <ChevronRight className="w-5 h-5 text-muted-foreground" />
            </Link>
          </motion.div>
        </div>
      </main>
      <Footer />

      <Dialog open={!!selectedBadgeId} onOpenChange={(open) => !open && setSelectedBadgeId(null)}>
        <DialogContent className="max-w-md">
          {selectedBadge && detail && (
            <>
              <DialogHeader>
                <div className="flex items-center gap-3">
                  <span className="text-4xl" aria-hidden>
                    {selectedBadge.icon}
                  </span>
                  <DialogTitle className="text-xl">{selectedBadge.name}</DialogTitle>
                </div>
                <DialogDescription className="text-left mt-1">
                  {selectedBadge.desc}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-3 text-sm text-left">
                {selectedBadge.unlocked ? (
                  <>
                    {detail.when && (
                      <p className="text-muted-foreground">
                        <span className="font-medium text-foreground">When: </span>
                        {detail.when}
                      </p>
                    )}
                    <p className="text-muted-foreground">
                      <span className="font-medium text-foreground">How you earned it: </span>
                      {detail.how}
                    </p>
                    {detail.stats && (
                      <p className="text-muted-foreground pt-2 border-t border-border">
                        <span className="font-medium text-foreground">Your progress: </span>
                        {detail.stats}
                      </p>
                    )}
                  </>
                ) : (
                  <>
                    <p className="text-muted-foreground">
                      <span className="font-medium text-foreground">How to earn it: </span>
                      {detail.progress ?? detail.how}
                    </p>
                    {detail.stats && (
                      <p className="text-muted-foreground pt-2 border-t border-border">
                        <span className="font-medium text-foreground">So far: </span>
                        {detail.stats}
                      </p>
                    )}
                  </>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
