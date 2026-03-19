import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  Calendar,
  Check,
  Minus,
  Plus,
  Target,
  TrendingDown,
  Sparkles,
  CalendarPlus,
  Trash2,
} from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { PageSEO } from "@/components/PageSEO";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { ArabicTerm } from "@/components/ArabicTerm";
import { useQadaTracker, type QadaScheduledDay } from "@/hooks/useLocalStorage";
import { toast } from "sonner";

// ── Sunnah day helpers ────────────────────────────────────────────────────────

/** Get upcoming Sunnah fasting days (Mon, Thu, Ayyam al-Beed 13/14/15 of Islamic month). */
function getUpcomingSunnahDays(count = 12): { date: Date; label: string }[] {
  const days: { date: Date; label: string }[] = [];
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  // start from tomorrow
  d.setDate(d.getDate() + 1);

  for (let i = 0; i < 90 && days.length < count; i++) {
    const dayOfWeek = d.getDay();
    // Monday (1) or Thursday (4)
    if (dayOfWeek === 1) {
      days.push({ date: new Date(d), label: "Monday" });
    } else if (dayOfWeek === 4) {
      days.push({ date: new Date(d), label: "Thursday" });
    }
    // Ayyam al-Beed: approximation using Hijri day 13-15
    // Simple approach: use lunar month approximation
    const dayOfLunarMonth = getApproxHijriDay(d);
    if (dayOfLunarMonth >= 13 && dayOfLunarMonth <= 15 && dayOfWeek !== 1 && dayOfWeek !== 4) {
      days.push({ date: new Date(d), label: `White Day (${dayOfLunarMonth}th)` });
    }
    d.setDate(d.getDate() + 1);
  }
  return days;
}

function getApproxHijriDay(date: Date): number {
  // Simple approximation based on lunar cycle (~29.53 days)
  const lunarCycle = 29.53058770576;
  const epoch = new Date(2024, 0, 11); // ~1 Rajab 1445 AH
  const diffDays = (date.getTime() - epoch.getTime()) / (1000 * 60 * 60 * 24);
  const dayInCycle = ((diffDays % lunarCycle) + lunarCycle) % lunarCycle;
  return Math.floor(dayInCycle) + 1;
}

function toISODate(d: Date): string {
  return d.toISOString().split("T")[0];
}

function formatDate(iso: string): string {
  return new Date(iso + "T12:00:00").toLocaleDateString("en", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function DashboardQada() {
  const [qada, setQada] = useQadaTracker();
  const [showScheduler, setShowScheduler] = useState(false);

  const remaining = Math.max(0, qada.totalOwed - qada.completedDays.length);
  const progressPct = qada.totalOwed > 0 ? Math.round((qada.completedDays.length / qada.totalOwed) * 100) : 0;

  const upcomingSunnah = useMemo(() => getUpcomingSunnahDays(12), []);

  // Already-scheduled dates for quick lookup
  const scheduledSet = useMemo(
    () => new Set([...qada.scheduledDays.map((s) => s.date), ...qada.completedDays.map((s) => s.date)]),
    [qada.scheduledDays, qada.completedDays]
  );

  // ── Handlers ───

  const setTotalOwed = (n: number) => {
    setQada((prev) => ({ ...prev, totalOwed: Math.max(0, n) }));
  };

  const scheduleDay = (date: string, sunnahLabel?: string) => {
    if (scheduledSet.has(date)) return;
    const entry: QadaScheduledDay = { date, sunnahLabel, completed: false };
    setQada((prev) => ({
      ...prev,
      scheduledDays: [...prev.scheduledDays, entry].sort((a, b) => a.date.localeCompare(b.date)),
    }));
    toast.success(`Qaḍā' fast scheduled for ${formatDate(date)}`);
  };

  const completeScheduled = (date: string) => {
    setQada((prev) => {
      const entry = prev.scheduledDays.find((s) => s.date === date);
      if (!entry) return prev;
      const completed: QadaScheduledDay = { ...entry, completed: true, completedAt: new Date().toISOString() };
      return {
        ...prev,
        scheduledDays: prev.scheduledDays.filter((s) => s.date !== date),
        completedDays: [...prev.completedDays, completed].sort((a, b) => a.date.localeCompare(b.date)),
      };
    });
    toast.success("Makeup fast completed! Your debt decreases 📉");
  };

  const removeScheduled = (date: string) => {
    setQada((prev) => ({
      ...prev,
      scheduledDays: prev.scheduledDays.filter((s) => s.date !== date),
    }));
  };

  const setIntention = (intention: "qada" | "sunnah" | "both") => {
    setQada((prev) => ({ ...prev, intention }));
  };

  return (
    <>
      <PageSEO
        title="Qaḍā' Tracker – Make Up Missed Fasts | TryRamadan"
        description="Track and schedule your missed Ramadan fasts (qaḍā'). Schedule on Sunnah days for double reward."
      />
      <Navbar />
      <main className="min-h-screen bg-background pb-32">
        <div className="container mx-auto px-4 py-6 max-w-2xl space-y-6">
          {/* Header */}
          <div className="flex items-center gap-3">
            <Link to="/dashboard" className="p-2 rounded-lg hover:bg-muted transition-colors" aria-label="Back">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-2xl font-bold flex items-center gap-2">
                <ArabicTerm term="Qaḍā'" arabic="قضاء" definition="Making up missed obligatory fasts" /> Tracker
              </h1>
              <p className="text-sm text-muted-foreground">
                Make up your missed Ramadan fasts
              </p>
            </div>
          </div>

          {/* Fasting Debt Counter */}
          <Card className="border-primary/20">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Target className="w-5 h-5 text-primary" />
                Fasting Debt
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Missed Ramadan fasts to make up</span>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => setTotalOwed(qada.totalOwed - 1)}
                    disabled={qada.totalOwed <= 0}
                    aria-label="Decrease"
                  >
                    <Minus className="w-4 h-4" />
                  </Button>
                  <span className="text-2xl font-bold w-10 text-center tabular-nums">{qada.totalOwed}</span>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => setTotalOwed(qada.totalOwed + 1)}
                    aria-label="Increase"
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {qada.totalOwed > 0 && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  className="space-y-2"
                >
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">
                      {qada.completedDays.length} completed · {remaining} remaining
                    </span>
                    <span className="font-semibold text-primary">{progressPct}%</span>
                  </div>
                  <Progress value={progressPct} className="h-3" />
                  {remaining === 0 && qada.totalOwed > 0 && (
                    <motion.p
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="text-center text-sm font-semibold text-primary flex items-center justify-center gap-1"
                    >
                      <Sparkles className="w-4 h-4" /> All makeup fasts completed! Alhamdulillah!
                    </motion.p>
                  )}
                </motion.div>
              )}
            </CardContent>
          </Card>

          {/* Intention Selector */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-secondary" />
                Primary Intention (<ArabicTerm term="Niyyah" arabic="نية" />)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-3">
                When fasting on a Sunnah day, set your primary intention to maximise reward.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {([
                  { id: "qada" as const, label: "Making up Ramadan", desc: "Primary: Qaḍā'" },
                  { id: "both" as const, label: "Qaḍā' + Sunnah", desc: "Double reward (scholars' view)" },
                  { id: "sunnah" as const, label: "Sunnah day only", desc: "Voluntary fast" },
                ]).map((opt) => (
                  <button
                    key={opt.id}
                    onClick={() => setIntention(opt.id)}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      qada.intention === opt.id
                        ? "border-primary bg-primary/10 ring-1 ring-primary"
                        : "border-border hover:border-primary/40"
                    }`}
                  >
                    <p className="text-sm font-medium">{opt.label}</p>
                    <p className="text-xs text-muted-foreground">{opt.desc}</p>
                  </button>
                ))}
              </div>
              <p className="text-xs text-muted-foreground mt-3 italic">
                Many scholars hold that you can combine the intention of making up a Ramadan fast with fasting on a Sunnah day, earning reward for both insha'Allah.
              </p>
            </CardContent>
          </Card>

          {/* Schedule on Sunnah Days */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg flex items-center gap-2">
                  <CalendarPlus className="w-5 h-5 text-primary" />
                  Schedule on Sunnah Days
                </CardTitle>
                <Button variant="ghost" size="sm" onClick={() => setShowScheduler(!showScheduler)}>
                  {showScheduler ? "Hide" : "Show"} days
                </Button>
              </div>
            </CardHeader>
            <AnimatePresence>
              {showScheduler && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                >
                  <CardContent className="pt-0">
                    <p className="text-sm text-muted-foreground mb-3">
                      Tap a Sunnah day to schedule a qaḍā' fast. Mondays, Thursdays, and the White Days (13th–15th of the Islamic month) are recommended.
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-72 overflow-y-auto pr-1">
                      {upcomingSunnah.map(({ date, label }) => {
                        const iso = toISODate(date);
                        const alreadyScheduled = scheduledSet.has(iso);
                        return (
                          <button
                            key={iso}
                            disabled={alreadyScheduled || remaining <= qada.scheduledDays.length + qada.completedDays.length - qada.totalOwed + remaining && remaining <= 0}
                            onClick={() => scheduleDay(iso, label)}
                            className={`flex items-center justify-between p-3 rounded-lg border text-left transition-all ${
                              alreadyScheduled
                                ? "border-primary/30 bg-primary/5 opacity-60"
                                : "border-border hover:border-primary hover:bg-primary/5"
                            }`}
                          >
                            <div>
                              <p className="text-sm font-medium">{formatDate(iso)}</p>
                              <p className="text-xs text-muted-foreground">{label}</p>
                            </div>
                            {alreadyScheduled ? (
                              <Badge variant="secondary" className="text-xs">Scheduled</Badge>
                            ) : (
                              <Plus className="w-4 h-4 text-primary" />
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </CardContent>
                </motion.div>
              )}
            </AnimatePresence>
          </Card>

          {/* Upcoming Scheduled Fasts */}
          {qada.scheduledDays.length > 0 && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-primary" />
                  Upcoming Makeup Fasts
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {qada.scheduledDays.map((s) => {
                  const isPast = s.date <= toISODate(new Date());
                  return (
                    <motion.div
                      key={s.date}
                      layout
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 10 }}
                      className="flex items-center justify-between p-3 rounded-lg border border-border bg-muted/30"
                    >
                      <div>
                        <p className="text-sm font-medium">{formatDate(s.date)}</p>
                        {s.sunnahLabel && (
                          <p className="text-xs text-muted-foreground">{s.sunnahLabel} · {qada.intention === "both" ? "Qaḍā' + Sunnah" : qada.intention === "qada" ? "Qaḍā' intention" : "Sunnah intention"}</p>
                        )}
                      </div>
                      <div className="flex items-center gap-1">
                        {isPast && (
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button size="icon" variant="ghost" className="h-8 w-8 text-primary" onClick={() => completeScheduled(s.date)}>
                                <Check className="w-4 h-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>Mark completed</TooltipContent>
                          </Tooltip>
                        )}
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive" onClick={() => removeScheduled(s.date)}>
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Remove</TooltipContent>
                        </Tooltip>
                      </div>
                    </motion.div>
                  );
                })}
              </CardContent>
            </Card>
          )}

          {/* Completion History */}
          {qada.completedDays.length > 0 && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <TrendingDown className="w-5 h-5 text-primary" />
                  Completed Makeup Fasts
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {[...qada.completedDays].reverse().map((s, i) => (
                    <motion.div
                      key={s.date}
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.03 }}
                      className="flex items-center justify-between p-3 rounded-lg bg-primary/5 border border-primary/10"
                    >
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center">
                          <Check className="w-3.5 h-3.5 text-primary" />
                        </div>
                        <div>
                          <p className="text-sm font-medium">{formatDate(s.date)}</p>
                          {s.sunnahLabel && <p className="text-xs text-muted-foreground">{s.sunnahLabel}</p>}
                        </div>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        Debt: {Math.max(0, qada.totalOwed - (qada.completedDays.length - qada.completedDays.indexOf(s)))} left
                      </Badge>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Info Card */}
          <Card className="bg-secondary/5 border-secondary/20">
            <CardContent className="pt-6">
              <h3 className="font-semibold mb-2">📖 About Qaḍā' Fasting</h3>
              <ul className="text-sm text-muted-foreground space-y-2">
                <li>• If you missed Ramadan fasts due to illness, travel, or menstruation, you should make them up before the next Ramadan.</li>
                <li>• Many scholars say you can fast on Sunnah days (Mon/Thu/White Days) with the intention of making up a missed fast — earning reward for both.</li>
                <li>• The key is to set your <strong>primary intention</strong> as qaḍā' (making up the missed fast).</li>
                <li>• There is no specific order required — you can make them up whenever you're able.</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </>
  );
}
