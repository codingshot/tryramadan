import { useMemo } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, BookOpen, Sun, Moon, ExternalLink, TrendingUp, CheckSquare, Calendar } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { PageSEO } from "@/components/PageSEO";
import { useUserPreferences, useHabitLog, useDisplayTimezone } from "@/hooks/useLocalStorage";
import { getTodayStringInTimezone } from "@/lib/utils";
import {
  getHabitsForUser,
  getHabitLogStreak,
  getTotalHabitCheckmarks,
  getPerHabitCounts,
  getShortLabelsForHabitIds,
  getHabitById,
  type RamadanHabit,
} from "@/data/ramadan-habits";

function HabitCard({ habit }: { habit: RamadanHabit }) {
  return (
    <article className="rounded-2xl border border-border bg-card p-4 sm:p-5 space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <span
          className={`text-xs font-medium px-2 py-1 rounded-full ${
            habit.type === "forbidden"
              ? "bg-destructive/10 text-destructive border border-destructive/20"
              : "bg-secondary/10 text-secondary border border-secondary/20"
          }`}
        >
          {habit.type === "forbidden" ? "Avoid" : "Sunnah"}
        </span>
        <span
          className="text-xs font-medium px-2 py-1 rounded-full bg-muted text-muted-foreground border border-border"
          title={habit.tag === "muslim" ? "Applies to Muslims" : "Applies to everyone (including non-Muslims trying Ramadan)"}
        >
          {habit.tag === "muslim" ? "Muslim" : "Everyone"}
        </span>
      </div>
      <h3 className="font-display font-bold text-lg">{habit.title}</h3>
      <blockquote className="pl-3 border-l-2 border-secondary/50 text-sm text-muted-foreground italic">
        &ldquo;{habit.quote}&rdquo;
      </blockquote>
      <div className="flex flex-wrap gap-2">
        <a
          href={habit.sourceUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-xs font-medium text-secondary hover:underline"
        >
          {habit.sourceLabel}
          <ExternalLink className="w-3 h-3" />
        </a>
        {habit.sourceUrl2 && habit.sourceLabel2 && (
          <a
            href={habit.sourceUrl2}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-xs font-medium text-secondary hover:underline"
          >
            {habit.sourceLabel2}
            <ExternalLink className="w-3 h-3" />
          </a>
        )}
      </div>
      <p className="text-sm text-foreground leading-relaxed">{habit.explanation}</p>
    </article>
  );
}

const RECENT_LOG_DAYS = 14;

export default function Habits() {
  const [preferences] = useUserPreferences();
  const displayTimezone = useDisplayTimezone();
  const [habitLog] = useHabitLog();
  const userType = preferences.userType;
  const todayStr = displayTimezone ? getTodayStringInTimezone(displayTimezone) : new Date().toISOString().slice(0, 10);
  const habitsForUser = useMemo(() => getHabitsForUser(userType), [userType]);
  const forbiddenForUser = useMemo(
    () => habitsForUser.filter((h) => h.type === "forbidden"),
    [habitsForUser]
  );
  const sunnahForUser = useMemo(
    () => habitsForUser.filter((h) => h.type === "sunnah"),
    [habitsForUser]
  );

  const habitStreak = useMemo(() => getHabitLogStreak(habitLog, todayStr), [habitLog, todayStr]);
  const totalCheckmarks = useMemo(() => getTotalHabitCheckmarks(habitLog), [habitLog]);
  const perHabitCounts = useMemo(() => getPerHabitCounts(habitLog), [habitLog]);
  const recentLogEntries = useMemo(() => {
    const dates = Object.keys(habitLog).filter((d) => habitLog[d] && Object.values(habitLog[d]).some(Boolean));
    dates.sort((a, b) => b.localeCompare(a));
    return dates.slice(0, RECENT_LOG_DAYS).map((dateStr) => {
      const day = habitLog[dateStr];
      const ids = Object.entries(day).filter(([, v]) => v).map(([id]) => id);
      return { dateStr, labels: getShortLabelsForHabitIds(ids) };
    });
  }, [habitLog]);
  const topHabits = useMemo(() => {
    return Object.entries(perHabitCounts)
      .map(([id, count]) => ({ id, count, label: getHabitById(id)?.shortLabel ?? id }))
      .filter((h) => h.label)
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  }, [perHabitCounts]);

  const seoDescription =
    "Ramadan habits from the Quran and Sunnah: what to avoid (eating during fast, lying, backbiting, anger) and what to do (suhoor, break with dates, du'a at iftar, charity). With Quran and hadith sources and links. For Muslims and non-Muslims learning Ramadan.";

  return (
    <div className="min-h-screen bg-background">
      <PageSEO
        title="Ramadan Habits: Good and Bad Habits from Quran and Hadith | TryRamadan"
        description={seoDescription}
        path="/habits"
        type="article"
      />
      <Navbar />
      <main id="main-content" className="main-content pt-6 pb-12">
        <div className="container mx-auto px-4 max-w-3xl">
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </Link>

          <motion.header
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-display font-bold">
              Ramadan Habits: From the Quran and Sunnah
            </h1>
            <p className="text-muted-foreground mt-2 leading-relaxed">
              What to avoid and what to do during Ramadan, with direct quotes from the Quran and hadith. Each habit is tagged
              <span className="font-medium text-foreground"> For everyone </span>
              (including non-Muslims trying Ramadan) or
              <span className="font-medium text-foreground"> For Muslims </span>
              (e.g. prayer, Taraweeh). All sources link to Quran.com and Sunnah.com.
            </p>
          </motion.header>

          {/* Outline / quick nav */}
          <nav className="mb-6 rounded-2xl border border-border bg-muted/30 p-4" aria-label="Page outline">
            <h2 className="font-display font-bold text-sm uppercase tracking-wide text-muted-foreground mb-3">
              On this page
            </h2>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="#my-habits" className="text-secondary hover:underline font-medium inline-flex items-center gap-1">
                  <TrendingUp className="w-4 h-4" />
                  My habits & history
                </a>
              </li>
              <li>
                <a href="#forbidden" className="text-secondary hover:underline font-medium inline-flex items-center gap-1">
                  <Moon className="w-4 h-4" />
                  Habits to avoid (Quran & hadith)
                </a>
              </li>
              <li>
                <a href="#sunnah" className="text-secondary hover:underline font-medium inline-flex items-center gap-1">
                  <Sun className="w-4 h-4" />
                  Sunnah practices (recommended)
                </a>
              </li>
              <li>
                <Link to="/dashboard/journal" className="text-secondary hover:underline font-medium inline-flex items-center gap-1">
                  <BookOpen className="w-4 h-4" />
                  Track habits in your journal
                </Link>
              </li>
            </ul>
          </nav>

          {/* My habits: analytics + history */}
          <section id="my-habits" className="scroll-mt-6 mb-10 rounded-2xl border-2 border-secondary/20 bg-secondary/5 p-5 sm:p-6">
            <h2 className="font-display font-bold text-lg sm:text-xl mb-4 flex items-center gap-2">
              <CheckSquare className="w-5 h-5 text-secondary" />
              My habits & history
            </h2>
            <p className="text-sm text-muted-foreground mb-4">
              Your habit log is saved locally. Track sunnah habits in the Journal for each day.
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
              <div className="p-3 rounded-xl bg-background border border-border text-center">
                <span className="text-xl font-bold text-secondary tabular-nums">{habitStreak}</span>
                <p className="text-xs text-muted-foreground mt-0.5">Day streak</p>
              </div>
              <div className="p-3 rounded-xl bg-background border border-border text-center">
                <span className="text-xl font-bold tabular-nums">{totalCheckmarks}</span>
                <p className="text-xs text-muted-foreground mt-0.5">Total checkmarks</p>
              </div>
              <div className="p-3 rounded-xl bg-background border border-border text-center col-span-2 sm:col-span-2">
                <span className="text-xl font-bold tabular-nums">{recentLogEntries.length}</span>
                <p className="text-xs text-muted-foreground mt-0.5">Days with habits (recent)</p>
              </div>
            </div>
            {topHabits.length > 0 && (
              <div className="mb-6">
                <h3 className="text-sm font-semibold text-muted-foreground mb-2">Most tracked</h3>
                <ul className="space-y-1.5">
                  {topHabits.map(({ id, count, label }) => (
                    <li key={id} className="flex items-center justify-between text-sm">
                      <span>{label}</span>
                      <span className="font-mono text-secondary tabular-nums">{count}×</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            <div>
              <h3 className="text-sm font-semibold text-muted-foreground mb-2 flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                Recent habit log
              </h3>
              {recentLogEntries.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No habits logged yet. Open your <Link to="/dashboard/journal" className="text-secondary hover:underline">Journal</Link> and check off sunnah habits for any day.
                </p>
              ) : (
                <ul className="space-y-2">
                  {recentLogEntries.map(({ dateStr, labels }) => (
                    <li key={dateStr} className="flex flex-wrap items-center gap-2 text-sm py-1.5 border-b border-border/50 last:border-0">
                      <span className="font-medium text-muted-foreground shrink-0">{dateStr}</span>
                      <span className="flex flex-wrap gap-1">
                        {labels.map((l) => (
                          <span key={l} className="px-1.5 py-0.5 rounded bg-secondary/15 text-secondary text-xs">
                            {l}
                          </span>
                        ))}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <Link
              to="/dashboard/journal"
              className="inline-flex items-center gap-2 mt-4 text-sm font-medium text-secondary hover:underline"
            >
              <BookOpen className="w-4 h-4" />
              Log habits in Journal
            </Link>
          </section>

          {/* Habits forbidden */}
          <section id="forbidden" className="scroll-mt-6 mb-12">
            <h2 className="text-xl sm:text-2xl font-display font-bold mb-2 flex items-center gap-2">
              <Moon className="w-6 h-6 text-muted-foreground" />
              Habits to Avoid During Ramadan
            </h2>
            <p className="text-muted-foreground mb-6">
              The Quran and the Prophet (ﷺ) call us to abstain from these during the fast so that the fast is both physical and spiritual.
            </p>
            <ul className="space-y-6 list-none p-0 m-0">
              {forbiddenForUser.map((habit) => (
                <li key={habit.id}>
                  <HabitCard habit={habit} />
                </li>
              ))}
            </ul>
          </section>

          {/* Sunnah practices */}
          <section id="sunnah" className="scroll-mt-6 mb-12">
            <h2 className="text-xl sm:text-2xl font-display font-bold mb-2 flex items-center gap-2">
              <Sun className="w-6 h-6 text-secondary" />
              Sunnah Practices During Ramadan
            </h2>
            <p className="text-muted-foreground mb-6">
              The Sunnah (practices of Prophet Muhammad ﷺ) shows how to make the most of Ramadan: suhoor, breaking fast with dates, du'a, charity, and more.
            </p>
            <ul className="space-y-6 list-none p-0 m-0">
              {sunnahForUser.map((habit) => (
                <li key={habit.id}>
                  <HabitCard habit={habit} />
                </li>
              ))}
            </ul>
          </section>

          {/* Link to journal */}
          <motion.section
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="rounded-2xl border-2 border-secondary/20 bg-secondary/5 p-6 text-center"
          >
            <h2 className="font-display font-bold text-lg mb-2">Track your habits daily</h2>
            <p className="text-sm text-muted-foreground mb-4">
              In your Reflection Journal you can check off which sunnah habits you did each day. Your progress is saved locally on this device.
            </p>
            <Link
              to="/dashboard/journal"
              className="inline-flex items-center gap-2 rounded-lg bg-secondary text-secondary-foreground px-4 py-2 font-medium hover:opacity-90"
            >
              <BookOpen className="w-4 h-4" />
              Open Journal
            </Link>
          </motion.section>
        </div>
      </main>
      <Footer />
    </div>
  );
}
