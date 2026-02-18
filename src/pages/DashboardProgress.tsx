import { useCallback, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import {
  ArrowLeft, TrendingUp, Flame, Calendar, Trophy,
  BookOpen, ChevronRight, Download, FileText, Utensils, Landmark
} from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { useFastingProgress, getTodayFastingLog, getBrokenReasonLabel, isFastingToday, useLocalStorage, calculateStreak, getLongestStreak, getJournalStreak, getMindfulEatingStreak, getPrayerStreak, getTotalPrayerCount, useDayMealPlans, useDayFoodLog, useUserPreferences, useDisplayTimezone } from "@/hooks/useLocalStorage";
import type { DayFoodLog, DayMealPlan, FoodLogEntry } from "@/hooks/useLocalStorage";
import { useRamadanRange } from "@/hooks/useRamadanRange";
import { getTodayStringInTimezone, toLocalDateString } from "@/lib/utils";
import type { EnergyEntry } from "@/hooks/useLocalStorage";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { PageSEO } from "@/components/PageSEO";
import { StatsShareCard } from "@/components/StatsShareCard";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

type TodayStore = Record<string, { energyEntries?: EnergyEntry[] }>;

const EXPORT_SECTIONS = [
  { id: "summary" as const, label: "Summary (days, streak, completion)" },
  { id: "fastingLog" as const, label: "Fasting log" },
  { id: "journal" as const, label: "Journal entries" },
  { id: "prayerLog" as const, label: "Prayer log" },
  { id: "meals" as const, label: "Meals (plans & food log)" },
];

function escapeCsvCell(value: string): string {
  return `"${String(value).replace(/"/g, '""')}"`;
}

function rowsToCsv(rows: string[][]): string {
  return rows.map((r) => r.map(escapeCsvCell).join(",")).join("\n");
}

const DashboardProgress = () => {
  const [preferences] = useUserPreferences();
  const [progress] = useFastingProgress();
  const ramadanRange = useRamadanRange();
  const [todayStore] = useLocalStorage<TodayStore>("tryramadan-today", {});
  const [journalEntries] = useLocalStorage<{ date: string }[]>("tryramadan-journal", []);
  const [mealPlans] = useDayMealPlans();
  const [foodLogs] = useDayFoodLog();
  const displayTimezone = useDisplayTimezone();
  const todayStr = displayTimezone ? getTodayStringInTimezone(displayTimezone) : toLocalDateString(new Date());
  const showStreakAndAchievements = preferences.showStreakAndAchievements !== false;
  const journalStreak = getJournalStreak(journalEntries);
  const mindfulEatingStreak = getMindfulEatingStreak(foodLogs, mealPlans);
  const [prayerTracker] = useLocalStorage<Record<string, Record<string, boolean>>>("tryramadan-prayer-tracker", {});
  const prayerStreak = getPrayerStreak(prayerTracker, todayStr);
  const totalPrayers = getTotalPrayerCount(prayerTracker);
  const isMuslim = preferences.userType === "muslim";

  const [exportDialogOpen, setExportDialogOpen] = useState(false);
  const [exportSections, setExportSections] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(EXPORT_SECTIONS.map((s) => [s.id, true]))
  );
  const [exportFormat, setExportFormat] = useState<"csv" | "json">("csv");

  const exportPayload = useMemo(() => {
    const totalDays = ramadanRange.totalDays || 30;
    const startStr = ramadanRange.startStr ?? "";
    const endStr = ramadanRange.endStr ?? "";
    const completedInRange = (progress.completedDays || []).filter((d) => d >= startStr && d <= endStr);
    const completedDaysCount = completedInRange.length;
    const completionRate = totalDays > 0 ? Math.round((completedDaysCount / totalDays) * 100) : 0;
    const payload: Record<string, unknown> = { exportedAt: new Date().toISOString() };
    if (exportSections.summary) {
      payload.summary = {
        daysCompleted: completedDaysCount,
        totalDays,
        completionRate,
        currentStreak: progress.currentStreak,
        longestStreak: getLongestStreak(progress),
        ramadanStart: startStr,
        ramadanEnd: endStr,
      };
    }
    if (exportSections.fastingLog && (progress.fastingLog?.length ?? 0) > 0) {
      payload.fastingLog = (progress.fastingLog || []).slice().reverse().map((e) => ({
        date: e.date,
        startedAt: e.startedAt ?? "",
        completedAt: e.completedAt ?? "",
        status: e.status,
        hoursFasted: e.hoursFasted,
      }));
    }
    if (exportSections.journal && (journalEntries?.length ?? 0) > 0) {
      payload.journal = journalEntries;
    }
    if (exportSections.prayerLog && prayerTracker && Object.keys(prayerTracker).length > 0) {
      payload.prayerLog = Object.entries(prayerTracker)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([date, day]) => ({ date, ...day }));
    }
    if (exportSections.meals) {
      const mealPlansList = Object.entries(mealPlans || {}).sort(([a], [b]) => a.localeCompare(b));
      const foodLogList = Object.entries(foodLogs || {}).sort(([a], [b]) => a.localeCompare(b));
      if (mealPlansList.length > 0 || foodLogList.length > 0) {
        payload.meals = {
          mealPlans: Object.fromEntries(mealPlansList),
          foodLog: Object.fromEntries(foodLogList),
        };
      }
    }
    return payload;
  }, [progress, ramadanRange, journalEntries, prayerTracker, mealPlans, foodLogs, exportSections]);

  const exportPreviewText = useMemo(() => {
    if (exportFormat === "json") {
      return JSON.stringify(exportPayload, null, 2);
    }
    const totalDays = ramadanRange.totalDays || 30;
    const startStr = ramadanRange.startStr ?? "";
    const endStr = ramadanRange.endStr ?? "";
    const completedInRange = (progress.completedDays || []).filter((d) => d >= startStr && d <= endStr);
    const completedDaysCount = completedInRange.length;
    const completionRate = totalDays > 0 ? Math.round((completedDaysCount / totalDays) * 100) : 0;
    const rows: string[][] = [];
    if (exportSections.summary) {
      rows.push(["TryRamadan Progress Report", ""], ["Generated", new Date().toISOString().split("T")[0]], [""], ["Summary", ""]);
      rows.push(["Days completed", String(completedDaysCount)], ["Total days", String(totalDays)], ["Completion rate (%)", String(completionRate)], ["Current streak", String(progress.currentStreak)], ["Longest streak", String(getLongestStreak(progress))], [""]);
    }
    if (exportSections.fastingLog && (progress.fastingLog?.length ?? 0) > 0) {
      rows.push(["Fasting log", ""], ["Date", "Started", "Completed", "Status"]);
      for (const e of (progress.fastingLog || []).slice().reverse()) {
        rows.push([e.date, e.startedAt ? new Date(e.startedAt).toLocaleTimeString() : "", e.completedAt ? new Date(e.completedAt).toLocaleTimeString() : "", e.status]);
      }
      rows.push([""]);
    }
    if (exportSections.journal && (journalEntries?.length ?? 0) > 0) {
      rows.push(["Journal", ""], ["Date", "Prompt", "Content", "Gratitude", "Mood"]);
      for (const e of journalEntries as Array<Record<string, unknown>>) {
        rows.push([String(e.date ?? ""), String((e as { prompt?: string }).prompt ?? ""), String((e as { content?: string }).content ?? ""), String((e as { gratitude?: string }).gratitude ?? ""), String((e as { mood?: number }).mood ?? "")]);
      }
      rows.push([""]);
    }
    if (exportSections.prayerLog && prayerTracker && Object.keys(prayerTracker).length > 0) {
      rows.push(["Prayer log", ""], ["Date", "Fajr", "Dhuhr", "Asr", "Maghrib", "Isha", "Taraweeh"]);
      for (const [date, day] of Object.entries(prayerTracker).sort(([a], [b]) => a.localeCompare(b))) {
        const d = day && typeof day === "object" ? day : {};
        const truthy = (key: string) => !!(d[key as keyof typeof d] ?? d[(key.charAt(0).toUpperCase() + key.slice(1)) as keyof typeof d]);
        const taraweeh = d.taraweeh ?? d.Taraweeh;
        const taraweehStr = taraweeh === "half" ? "Half" : taraweeh === "full" ? "Full" : "";
        rows.push([
          date,
          truthy("fajr") ? "1" : "0",
          truthy("dhuhr") ? "1" : "0",
          truthy("asr") ? "1" : "0",
          truthy("maghrib") ? "1" : "0",
          truthy("isha") ? "1" : "0",
          taraweehStr,
        ]);
      }
      rows.push([""]);
    }
    if (exportSections.meals) {
      const plans = mealPlans || {};
      const logs = foodLogs || {};
      const dates = [...new Set([...Object.keys(plans), ...Object.keys(logs)])].sort();
      if (dates.length > 0) {
        rows.push(["Meals", ""], ["Date", "Meal", "Type", "Content"]);
        for (const date of dates) {
          const plan = plans[date] as DayMealPlan | undefined;
          const dayLog = logs[date] as DayFoodLog | undefined;
          if (plan?.suhoor) rows.push([date, "suhoor", "plan", plan.suhoor]);
          if (plan?.iftar) rows.push([date, "iftar", "plan", plan.iftar]);
          const suhoor = dayLog?.suhoor ?? [];
          const iftar = dayLog?.iftar ?? [];
          const between = dayLog?.between ?? [];
          for (const item of suhoor as FoodLogEntry[]) rows.push([date, "suhoor", "log", `${item.name} (${item.portions} portions)`]);
          for (const item of iftar as FoodLogEntry[]) rows.push([date, "iftar", "log", `${item.name} (${item.portions} portions)`]);
          for (const item of between as FoodLogEntry[]) rows.push([date, "between", "log", `${item.name} (${item.portions} portions)`]);
        }
      }
    }
    if (rows.length > 0) return rowsToCsv(rows);
    const anySection = EXPORT_SECTIONS.some((s) => exportSections[s.id]);
    return anySection ? "No data for the selected sections." : "Select at least one section to export.";
  }, [exportFormat, exportPayload, exportSections, progress, ramadanRange, journalEntries, prayerTracker, mealPlans, foodLogs]);

  const hasAnySection = EXPORT_SECTIONS.some((s) => exportSections[s.id]);
  const canDownload = hasAnySection && (exportFormat === "json" ? Object.keys(exportPayload).length > 1 : !exportPreviewText.startsWith("Select") && !exportPreviewText.startsWith("No data"));

  const handleExportDownload = useCallback(() => {
    if (!canDownload) return;
    const mime = exportFormat === "json" ? "application/json" : "text/csv;charset=utf-8";
    const ext = exportFormat === "json" ? "json" : "csv";
    const blob = new Blob([exportPreviewText], { type: mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `tryramadan-progress-${new Date().toISOString().split("T")[0]}.${ext}`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success(exportFormat === "json" ? "JSON downloaded" : "CSV downloaded");
    setExportDialogOpen(false);
  }, [canDownload, exportFormat, exportPreviewText]);

  const fastingToday = isFastingToday(progress, todayStr);
  const todayLog = getTodayFastingLog(progress, todayStr);
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

  // Calculate stats (Ramadan-scoped from effective range)
  const totalDays = ramadanRange.totalDays ?? 30;
  const startStr = ramadanRange.startStr ?? "";
  const endStr = ramadanRange.endStr ?? "";
  const completedDays = (progress.completedDays ?? []).filter((d) => d >= startStr && d <= endStr).length;
  const completionRate = totalDays > 0 ? Math.round((completedDays / totalDays) * 100) : 0;
  
  const currentStreak = calculateStreak(progress, todayStr);
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
              Your Progress
            </h1>
            <p className="text-muted-foreground mt-2">
              Track your fasting journey and celebrate your achievements
            </p>
          </motion.div>

          {completedDays === 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 }}
              className="mb-6 p-4 rounded-xl bg-secondary/10 border border-secondary/30"
            >
              <p className="text-sm font-medium mb-1">Your progress starts with your first log</p>
              <p className="text-sm text-muted-foreground mb-3">
                Once you log a fast (start and complete, or break with a reason), your stats and streak will fill in here. Every day you log counts.
              </p>
              <Link to="/dashboard" className="text-sm font-medium text-secondary hover:underline">
                Go to Dashboard →
              </Link>
            </motion.div>
          )}
          
          {/* Stats overview */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className={`grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-6 sm:mb-8 ${showStreakAndAchievements ? "md:grid-cols-4" : "md:grid-cols-2"}`}
          >
            <div className="p-4 rounded-2xl bg-secondary/10 border border-secondary/20 text-center">
              <Calendar className="w-6 h-6 text-secondary mx-auto mb-2" />
              <span className="text-xl sm:text-2xl md:text-3xl font-bold text-secondary">{completedDays}</span>
              <span className="block text-sm text-muted-foreground">Days Completed</span>
            </div>
            {showStreakAndAchievements && (
              <div className="p-4 rounded-2xl bg-card border border-border text-center">
                <Flame className="w-6 h-6 text-orange-500 mx-auto mb-2" />
                <span className="text-xl sm:text-2xl md:text-3xl font-bold">{currentStreak}</span>
                <span className="block text-sm text-muted-foreground">Current Streak</span>
              </div>
            )}
            <div className="p-4 rounded-2xl bg-card border border-border text-center">
              <TrendingUp className="w-6 h-6 text-green-500 mx-auto mb-2" />
              <span className="text-xl sm:text-2xl md:text-3xl font-bold">{completionRate}%</span>
              <span className="block text-sm text-muted-foreground">Completion Rate</span>
            </div>
            {showStreakAndAchievements && (
              <div className="p-4 rounded-2xl bg-card border border-border text-center">
                <Trophy className="w-6 h-6 text-amber-500 mx-auto mb-2" />
                <span className="text-xl sm:text-2xl md:text-3xl font-bold">{unlockedBadges.length}</span>
                <span className="block text-sm text-muted-foreground">Badges Earned</span>
              </div>
            )}
          </motion.div>

          {/* Non-fasting wins: journal streak, mindful eating, prayer (Muslim) */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.12 }}
            className={`grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-6 sm:mb-8 ${isMuslim ? "md:grid-cols-3" : ""}`}
          >
            <div className="p-4 rounded-2xl bg-card border border-border text-center">
              <BookOpen className="w-6 h-6 text-secondary mx-auto mb-2" aria-hidden />
              <span className="text-xl sm:text-2xl font-bold">{journalStreak}</span>
              <span className="block text-sm text-muted-foreground">Journal streak (days)</span>
            </div>
            <div className="p-4 rounded-2xl bg-card border border-border text-center">
              <Utensils className="w-6 h-6 text-amber-500 mx-auto mb-2" aria-hidden />
              <span className="text-xl sm:text-2xl font-bold">{mindfulEatingStreak}</span>
              <span className="block text-sm text-muted-foreground">Both meals logged (days in a row)</span>
            </div>
            {isMuslim && (
              <div className="p-4 rounded-2xl bg-secondary/10 border border-secondary/20 text-center">
                <Landmark className="w-6 h-6 text-secondary mx-auto mb-2" aria-hidden />
                <span className="text-xl sm:text-2xl font-bold text-secondary">{prayerStreak}</span>
                <span className="block text-sm text-muted-foreground">Prayer streak (all 5/day)</span>
                <span className="mt-1 block text-xs text-muted-foreground">{totalPrayers} prayers total</span>
              </div>
            )}
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
              <p className="text-sm text-muted-foreground">
                Your fasting log will show up here. When you start a fast, break early, or mark a day complete on the Dashboard or Today page, it&apos;ll appear here.
              </p>
            )}
          </motion.div>
          
          {/* Badges — hidden when showStreakAndAchievements is off */}
          {showStreakAndAchievements && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="space-y-6"
            >
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
              <div>
                <h3 className="font-display font-bold mb-2 flex items-center gap-2">
                  <span className="opacity-50">🔒</span>
                  Upcoming Badges • الشارات القادمة
                </h3>
                {unlockedBadges.length === 0 && (
                  <p className="text-sm text-muted-foreground mb-4">
                    Badges unlock as you go. Your first fast, first streak, and other milestones will earn badges here — no rush.
                  </p>
                )}
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
          )}
          
          {/* Unified stats: share, screenshot, graphs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
            className="mt-8 mb-8"
          >
            <StatsShareCard
              completedDays={completedDays}
              totalDays={totalDays}
              completionRate={completionRate}
              currentStreak={currentStreak}
              journalStreak={journalStreak}
              mindfulEatingStreak={mindfulEatingStreak}
              prayerStreak={prayerStreak}
              totalPrayers={totalPrayers}
              isMuslim={isMuslim}
              completedDates={(progress.completedDays ?? []).filter((d) => d >= startStr && d <= endStr)}
              ramadanStart={startStr || new Date().toISOString().split("T")[0]}
              ramadanEnd={endStr || new Date().toISOString().split("T")[0]}
            />
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
                  <p className="text-sm text-muted-foreground">Choose data and format, preview, then download</p>
                </div>
              </div>
              <Button variant="outline" size="sm" onClick={() => setExportDialogOpen(true)} aria-label="Open export options">
                Export progress
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

      <Dialog open={exportDialogOpen} onOpenChange={setExportDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col gap-4" aria-describedby="export-preview-desc">
          <DialogHeader>
            <DialogTitle>Export progress</DialogTitle>
            <DialogDescription id="export-preview-desc">
              Select which data to include, choose CSV or JSON, then preview and download.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <fieldset className="space-y-3">
              <Label className="text-sm font-medium">Include in export</Label>
              <div className="flex flex-wrap gap-4">
                {EXPORT_SECTIONS.map(({ id, label }) => (
                  <div key={id} className="flex items-center space-x-2">
                    <Checkbox
                      id={`export-${id}`}
                      checked={!!exportSections[id]}
                      onCheckedChange={(checked) =>
                        setExportSections((prev) => ({ ...prev, [id]: checked === true }))
                      }
                      aria-describedby={id === "summary" ? undefined : undefined}
                    />
                    <Label htmlFor={`export-${id}`} className="text-sm font-normal cursor-pointer">
                      {label}
                    </Label>
                  </div>
                ))}
              </div>
            </fieldset>
            <fieldset className="space-y-2">
              <Label className="text-sm font-medium">Format</Label>
              <RadioGroup
                value={exportFormat}
                onValueChange={(v) => setExportFormat(v as "csv" | "json")}
                className="flex gap-4"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="csv" id="export-format-csv" />
                  <Label htmlFor="export-format-csv" className="font-normal cursor-pointer">CSV</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="json" id="export-format-json" />
                  <Label htmlFor="export-format-json" className="font-normal cursor-pointer">JSON</Label>
                </div>
              </RadioGroup>
            </fieldset>
            <div className="space-y-2">
              <Label className="text-sm font-medium">Preview</Label>
              <div className="rounded-lg border border-border bg-muted/30 p-3 min-h-[200px] max-h-[280px] overflow-auto">
                <pre className="text-xs text-foreground whitespace-pre-wrap break-words font-mono" role="log" aria-live="polite">
                  {exportPreviewText}
                </pre>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setExportDialogOpen(false)}>
              Close
            </Button>
            <Button type="button" onClick={handleExportDownload} disabled={!canDownload} className="gap-2">
              <Download className="w-4 h-4" aria-hidden />
              Download {exportFormat === "json" ? "JSON" : "CSV"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
};

export default DashboardProgress;
