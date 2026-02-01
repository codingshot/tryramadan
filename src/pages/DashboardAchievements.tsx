import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowLeft, Trophy, ChevronRight } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { useFastingProgress } from "@/hooks/useLocalStorage";
import { ArabicHover } from "@/components/ArabicHover";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

export default function DashboardAchievements() {
  const [progress] = useFastingProgress();
  const completedDays = progress.completedDays.length;
  const totalDays = 30;

  const calculateStreak = () => {
    const today = new Date();
    const sortedDays = [...progress.completedDays].sort().reverse();
    let streak = 0;
    let currentDate = new Date();
    for (const day of sortedDays) {
      const dayStr = currentDate.toISOString().split("T")[0];
      if (day === dayStr) {
        streak++;
        currentDate.setDate(currentDate.getDate() - 1);
      } else break;
    }
    return streak;
  };
  const currentStreak = calculateStreak();

  const badges = [
    { id: "first-fast", name: "First Fast", desc: "Complete your first fast", icon: "🌙", unlocked: completedDays >= 1 },
    { id: "week-one", name: "Week One", desc: "Complete 7 days", icon: "⭐", unlocked: completedDays >= 7 },
    { id: "halfway", name: "Halfway There", desc: "Complete 15 days", icon: "🏅", unlocked: completedDays >= 15 },
    { id: "streak-5", name: "Consistent", desc: "5-day streak", icon: "🔥", unlocked: currentStreak >= 5 },
    { id: "streak-10", name: "Dedicated", desc: "10-day streak", icon: "💪", unlocked: currentStreak >= 10 },
    { id: "full-month", name: "Ramadan Champion", desc: "Complete all 30 days", icon: "🏆", unlocked: completedDays >= 30 },
  ];

  const unlocked = badges.filter((b) => b.unlocked);
  const locked = badges.filter((b) => !b.unlocked);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-20 pb-16">
        <div className="container mx-auto px-4 max-w-4xl">
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
              <ArabicHover arabic="الإنجازات">Achievements</ArabicHover>
            </h1>
            <p className="text-muted-foreground mt-2">
              Badges for milestones. Celebrate every fast.
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
                  <div
                    key={b.id}
                    className="p-4 rounded-2xl bg-gradient-to-br from-secondary/20 to-secondary/5 border border-secondary/30 text-center"
                  >
                    <span className="text-4xl block mb-2">{b.icon}</span>
                    <span className="font-bold text-sm block">{b.name}</span>
                    <span className="text-xs text-muted-foreground">{b.desc}</span>
                  </div>
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
                <Tooltip key={b.id}>
                  <TooltipTrigger asChild>
                    <div className="p-4 rounded-2xl bg-muted/50 border border-border text-center opacity-70">
                      <span className="text-4xl block mb-2 grayscale">{b.icon}</span>
                      <span className="font-bold text-sm block">{b.name}</span>
                      <span className="text-xs text-muted-foreground">Locked</span>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>{b.desc}</TooltipContent>
                </Tooltip>
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
    </div>
  );
}
