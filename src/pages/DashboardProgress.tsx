import { useCallback } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { 
  ArrowLeft, TrendingUp, Flame, Calendar, Trophy, 
  BookOpen, ChevronRight, Download, FileText
} from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { ArabicHover } from "@/components/ArabicHover";
import { Footer } from "@/components/Footer";
import { useFastingProgress, getTodayFastingLog, getBrokenReasonLabel, isFastingToday, useLocalStorage, calculateStreak, getLongestStreak } from "@/hooks/useLocalStorage";
import type { EnergyEntry } from "@/hooks/useLocalStorage";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { PageSEO } from "@/components/PageSEO";

type TodayStore = Record<string, { energyEntries?: EnergyEntry[] }>;

const DashboardProgress = () => {
  const [progress] = useFastingProgress();
  const [todayStore] = useLocalStorage<TodayStore>("tryramadan-today", {});

  const exportCsv = useCallback(() => {
    const totalDays = 30;
    const completedDays = progress.completedDays.length;
    const completionRate = Math.round((completedDays / totalDays) * 100);
    const rows = [
      ["TryRamadan Progress Report", ""],
      ["Generated", new Date().toISOString().split("T")[0]],
      ["", ""],
      ["Summary", ""],
      ["Days completed", String(completedDays)],
      ["Total days", String(totalDays)],
      ["Completion rate (%)", String(completionRate)],
      ["Current streak", String(progress.currentStreak)],
      ["Longest streak", String(getLongestStreak(progress))],
      ["", ""],
      ["Fasting log", ""],
      ["Date", "Started", "Completed", "Status"],
      ...(progress.fastingLog || []).slice().reverse().map((e) => [
        e.date,
        e.startedAt ? new Date(e.startedAt).toLocaleTimeString() : "",
        e.completedAt ? new Date(e.completedAt).toLocaleTimeString() : "",
        e.status,
      ]),
    ];
    const csv = rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `tryramadan-progress-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }, [progress]);
  const fastingToday = isFastingToday(progress);
  const todayLog = getTodayFastingLog(progress);
  const recentLog = (progress.fastingLog || []).slice(-14).reverse();

  // Energy over time: last 7 days from tryramadan-today
  const energyOverTime = (() => {
    const dates = Object.keys(todayStore).sort().reverse().slice(0, 7);
    return dates.map((date) => {
      const entries = todayStore[date]?.energyEntries || [];
      const lastLevel = entries.length > 0 ? entries[entries.length - 1].level : null;
      const avgLevel =
        entries.length > 0
          ? Math.round(entries.reduce((s, e) => s + e.level, 0) / entries.length)
          : null;
      return { date, lastLevel, avgLevel, count: entries.length };
    });
  })();

  // Calculate stats
  const totalDays = 30;
  const completedDays = progress.completedDays.length;
  const completionRate = Math.round((completedDays / totalDays) * 100);
  
  const currentStreak = calculateStreak(progress);
  const longestStreak = getLongestStreak(progress);
  
  // Learn-read count for Eager Learner badge
  const [learnRead] = useLocalStorage<string[]>("tryramadan-learn-read", []);
  const eagerLearnerUnlocked = learnRead.length >= 10;

  // Achievement badges
  const badges = [
    { id: 'first-fast', name: 'First Fast', description: 'Complete your first fast', icon: '🌙', unlocked: completedDays >= 1 },
    { id: 'week-one', name: 'Week One', description: 'Complete 7 days of fasting', icon: '⭐', unlocked: completedDays >= 7 },
    { id: 'halfway', name: 'Halfway There', description: 'Complete 15 days of fasting', icon: '🏅', unlocked: completedDays >= 15 },
    { id: 'streak-5', name: 'Consistent', description: '5-day fasting streak', icon: '🔥', unlocked: currentStreak >= 5 },
    { id: 'streak-10', name: 'Dedicated', description: '10-day fasting streak', icon: '💪', unlocked: currentStreak >= 10 },
    { id: 'full-month', name: 'Ramadan Champion', description: 'Complete all 30 days', icon: '🏆', unlocked: completedDays >= 30 },
    { id: 'early-bird', name: 'Early Bird', description: 'Never missed Suhoor', icon: '🌅', unlocked: false },
    { id: 'learner', name: 'Eager Learner', description: 'Read 10 educational articles', icon: '📚', unlocked: eagerLearnerUnlocked },
  ];
  
  const unlockedBadges = badges.filter(b => b.unlocked);
  const lockedBadges = badges.filter(b => !b.unlocked);

  return (
    <div className="min-h-screen bg-background">
      <PageSEO
        title="Progress | TryRamadan.app"
        description="Track your Ramadan fasting progress: completed days, streaks, and export your fasting report."
        path="/dashboard/progress"
      />
      <Navbar />
      
      <main className="main-content">
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
              <ArabicHover arabic="تقدمك" explanation="Your progress — track fasting days and achievements">Your Progress</ArabicHover>
            </h1>
            <p className="text-muted-foreground mt-2">
              Track your fasting journey and celebrate your achievements
            </p>
          </motion.div>
          
          {/* Stats overview */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8"
          >
            <div className="p-4 rounded-2xl bg-secondary/10 border border-secondary/20 text-center">
              <Calendar className="w-6 h-6 text-secondary mx-auto mb-2" />
              <span className="text-xl sm:text-2xl md:text-3xl font-bold text-secondary">{completedDays}</span>
              <span className="block text-sm text-muted-foreground">Days Completed</span>
            </div>
            <div className="p-4 rounded-2xl bg-card border border-border text-center">
              <Flame className="w-6 h-6 text-orange-500 mx-auto mb-2" />
              <span className="text-xl sm:text-2xl md:text-3xl font-bold">{currentStreak}</span>
              <span className="block text-sm text-muted-foreground">Current Streak</span>
            </div>
            <div className="p-4 rounded-2xl bg-card border border-border text-center">
              <TrendingUp className="w-6 h-6 text-green-500 mx-auto mb-2" />
              <span className="text-xl sm:text-2xl md:text-3xl font-bold">{completionRate}%</span>
              <span className="block text-sm text-muted-foreground">Completion Rate</span>
            </div>
            <div className="p-4 rounded-2xl bg-card border border-border text-center">
              <Trophy className="w-6 h-6 text-amber-500 mx-auto mb-2" />
              <span className="text-xl sm:text-2xl md:text-3xl font-bold">{unlockedBadges.length}</span>
              <span className="block text-sm text-muted-foreground">Badges Earned</span>
            </div>
          </motion.div>
          
          {/* Progress bar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="p-6 rounded-2xl bg-card border border-border mb-8"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="font-medium">Ramadan Progress • تقدم رمضان</span>
              <span className="text-secondary font-bold">{completedDays} / {totalDays} days</span>
            </div>
            <div className="h-6 bg-muted rounded-full overflow-hidden">
              <motion.div 
                className="h-full bg-gradient-gold rounded-full flex items-center justify-end pr-2"
                initial={{ width: 0 }}
                animate={{ width: `${completionRate}%` }}
                transition={{ duration: 1, ease: "easeOut" }}
              >
                {completionRate > 10 && (
                  <span className="text-xs font-bold text-foreground">{completionRate}%</span>
                )}
              </motion.div>
            </div>
          </motion.div>

          {/* Energy over time */}
          {energyOverTime.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.22 }}
              className="p-6 rounded-2xl bg-card border border-border mb-8"
            >
              <h3 className="font-display font-bold mb-3 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-secondary" />
                Energy over time
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                Last recorded energy (1–5) per day from Today's Fast check-ins.
              </p>
              <ul className="space-y-2 text-sm">
                {energyOverTime.map(({ date, lastLevel, avgLevel, count }) => (
                  <li
                    key={date}
                    className="flex items-center justify-between py-2 border-b border-border last:border-0"
                  >
                    <span className="font-medium">{date}</span>
                    <span className="text-muted-foreground">
                      {lastLevel != null ? (
                        <>Last: {lastLevel}/5</>
                      ) : (
                        "—"
                      )}
                      {count > 1 && avgLevel != null && (
                        <span className="ml-2">· Avg: {avgLevel}/5</span>
                      )}
                    </span>
                  </li>
                ))}
              </ul>
            </motion.div>
          )}

          {/* Fasting tracker status + log */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="p-6 rounded-2xl bg-card border border-border mb-8"
          >
            <h3 className="font-display font-bold mb-3 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-secondary" />
              Fasting tracker
            </h3>
            {fastingToday && todayLog && (
              <p className="text-sm text-secondary font-medium mb-3">
                Today: You're fasting (started {new Date(todayLog.startedAt).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })})
              </p>
            )}
            {recentLog.length > 0 ? (
              <ul className="space-y-2 text-sm">
                {recentLog.map((entry) => (
                  <li
                    key={entry.date}
                    className="flex items-center justify-between py-2 border-b border-border last:border-0"
                  >
                    <span className="font-medium">{entry.date}</span>
                    <span className="text-muted-foreground">
                      {new Date(entry.startedAt).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}
                      {entry.completedAt && ` → ${new Date(entry.completedAt).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}`}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                        entry.status === 'completed'
                          ? 'bg-secondary/20 text-secondary'
                          : entry.status === 'broken'
                            ? 'bg-destructive/20 text-destructive'
                            : 'bg-primary/20 text-foreground'
                      }`}
                    >
                      {entry.status === 'completed' ? 'Done' : entry.status === 'broken' ? (entry.brokenReason ? `Broken (${getBrokenReasonLabel(entry.brokenReason)})` : 'Broken') : 'In progress'}
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground">Log your fasts from the Dashboard or Today page.</p>
            )}
          </motion.div>
          
          {/* Badges */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="space-y-6"
          >
            {/* Unlocked badges */}
            {unlockedBadges.length > 0 && (
              <div>
                <h3 className="font-display font-bold mb-4 flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-secondary" />
                  Earned Badges • الشارات المكتسبة
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
                  {unlockedBadges.map((badge, index) => (
                    <motion.div
                      key={badge.id}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.4 + index * 0.1 }}
                      className="p-4 rounded-2xl bg-gradient-to-br from-secondary/20 to-secondary/5 border border-secondary/30 text-center"
                    >
                      <span className="text-4xl block mb-2">{badge.icon}</span>
                      <span className="font-bold text-sm block">{badge.name}</span>
                      <span className="text-xs text-muted-foreground">{badge.description}</span>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}
            
            {/* Locked badges */}
            <div>
              <h3 className="font-display font-bold mb-4 flex items-center gap-2">
                <span className="opacity-50">🔒</span>
                Upcoming Badges • الشارات القادمة
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
                {lockedBadges.map((badge) => (
                  <Tooltip key={badge.id}>
                    <TooltipTrigger asChild>
                      <div className="p-4 rounded-2xl bg-muted/50 border border-border text-center opacity-60">
                        <span className="text-4xl block mb-2 grayscale">{badge.icon}</span>
                        <span className="font-bold text-sm block">{badge.name}</span>
                        <span className="text-xs text-muted-foreground">Locked</span>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>{badge.description}</TooltipContent>
                  </Tooltip>
                ))}
              </div>
            </div>
          </motion.div>
          
          {/* Export & Journal */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="grid gap-4 md:grid-cols-2 mt-8"
          >
            <div className="p-4 rounded-2xl bg-card border border-border flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <Download className="w-6 h-6 text-secondary" />
                <div>
                  <span className="font-medium block">Export progress</span>
                  <p className="text-sm text-muted-foreground">Download report as CSV</p>
                </div>
              </div>
              <Button variant="outline" size="sm" onClick={exportCsv}>
                Download CSV
              </Button>
            </div>
            <Link
              to="/dashboard/journal"
              className="flex items-center justify-between p-4 rounded-2xl bg-card border border-border hover:border-secondary/50 transition-all"
            >
              <div className="flex items-center gap-3">
                <FileText className="w-6 h-6 text-secondary" />
                <div>
                  <span className="font-medium block">Journal archive</span>
                  <p className="text-sm text-muted-foreground">View all reflection entries</p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-muted-foreground" />
            </Link>
          </motion.div>

          {/* View full calendar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mt-6"
          >
            <Link 
              to="/dashboard/schedule"
              className="flex items-center justify-between p-4 rounded-2xl bg-card border border-border hover:border-secondary/50 transition-all"
            >
              <div className="flex items-center gap-3">
                <Calendar className="w-6 h-6 text-secondary" />
                <div>
                  <span className="font-medium">View Full Calendar</span>
                  <p className="text-sm text-muted-foreground">See your complete fasting schedule</p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-muted-foreground" />
            </Link>
          </motion.div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default DashboardProgress;
