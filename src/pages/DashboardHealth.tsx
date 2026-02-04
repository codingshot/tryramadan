import { useState, useCallback, useEffect } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowLeft, Heart, Droplets, AlertTriangle, Sun, Moon, Stethoscope, TrendingUp } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { useWellnessLog, useSymptomLog, useTodayData, useUserPreferences } from "@/hooks/useLocalStorage";
import { useRamadanRange } from "@/hooks/useRamadanRange";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { PageSEO } from "@/components/PageSEO";
import { toast } from "@/hooks/use-toast";
import { ToastAction } from "@/components/ui/toast";

const SYMPTOM_OPTIONS = ["Headache", "Dizziness", "Fatigue", "Nausea", "Low energy", "Other"];

export default function DashboardHealth() {
  const [preferences] = useUserPreferences();
  const ramadanRange = useRamadanRange();
  const today = new Date().toISOString().split("T")[0];
  const [wellnessLog, setWellnessLog] = useWellnessLog();
  const [symptomLog, setSymptomLog] = useSymptomLog();
  const { energyEntries, hydrationGlasses } = useTodayData();

  // Recent wellness: last 5 entries across all days, sorted by timestamp
  const recentWellness = (() => {
    const list: { date: string; timeOfDay: string; mood: number; note?: string; timestamp: string }[] = [];
    Object.entries(wellnessLog).forEach(([date, entries]) => {
      entries.forEach((e) =>
        list.push({
          date,
          timeOfDay: e.timeOfDay,
          mood: e.mood,
          note: e.note,
          timestamp: e.timestamp,
        })
      );
    });
    return list.sort((a, b) => (b.timestamp > a.timestamp ? 1 : -1)).slice(0, 5);
  })();

  const [wellnessTime, setWellnessTime] = useState<"morning" | "evening">("morning");
  const [wellnessMood, setWellnessMood] = useState<1 | 2 | 3 | 4 | 5>(3);
  const [wellnessNote, setWellnessNote] = useState("");
  const [symptomType, setSymptomType] = useState(SYMPTOM_OPTIONS[0]);
  const [symptomSeverity, setSymptomSeverity] = useState<1 | 2 | 3 | 4 | 5>(2);

  const todayWellness = wellnessLog[today] || [];
  const todaySymptoms = symptomLog[today] || [];

  const ramadanDay = ramadanRange.isRamadanDay(new Date()) ? ramadanRange.getRamadanDayNumber(new Date()) : null;
  const isRecurringCheckInDay = ramadanDay !== null && [7, 15, 21].includes(ramadanDay);

  // Low mood (1–2) for 3+ consecutive days? (UX-HEALTH-GUARDRAILS)
  const hasLowMoodThreePlusDays = (() => {
    const datesWithLowMood = Object.entries(wellnessLog)
      .filter(([, entries]) => entries.some((e) => e.mood === 1 || e.mood === 2))
      .map(([date]) => date)
      .sort();
    if (datesWithLowMood.length < 3) return false;
    let run = 1;
    for (let i = 1; i < datesWithLowMood.length; i++) {
      const prev = new Date(datesWithLowMood[i - 1] + "T12:00:00").getTime();
      const curr = new Date(datesWithLowMood[i] + "T12:00:00").getTime();
      if (curr - prev === 86400000) run++;
      else run = 1;
      if (run >= 3) return true;
    }
    return false;
  })();

  // Optional retention: trim wellness/symptom entries older than N days (see DATA-LIFECYCLE-POLICIES.md)
  const wellnessDays = preferences.wellnessRetentionDays ?? null;
  const symptomDays = preferences.symptomRetentionDays ?? null;
  const cutoffWellness = wellnessDays != null && wellnessDays > 0 ? (() => { const d = new Date(); d.setDate(d.getDate() - wellnessDays); return d.toISOString().split("T")[0]; })() : null;
  const cutoffSymptom = symptomDays != null && symptomDays > 0 ? (() => { const d = new Date(); d.setDate(d.getDate() - symptomDays); return d.toISOString().split("T")[0]; })() : null;
  useEffect(() => {
    if (cutoffWellness) {
      const next = Object.fromEntries(Object.entries(wellnessLog).filter(([date]) => date >= cutoffWellness));
      if (Object.keys(next).length < Object.keys(wellnessLog).length) setWellnessLog(next);
    }
  }, [cutoffWellness, wellnessLog, setWellnessLog]);
  useEffect(() => {
    if (cutoffSymptom) {
      const next = Object.fromEntries(Object.entries(symptomLog).filter(([date]) => date >= cutoffSymptom));
      if (Object.keys(next).length < Object.keys(symptomLog).length) setSymptomLog(next);
    }
  }, [cutoffSymptom, symptomLog, setSymptomLog]);

  const addWellness = useCallback(() => {
    const entry = {
      timeOfDay: wellnessTime,
      mood: wellnessMood,
      note: wellnessNote.trim() || undefined,
      timestamp: new Date().toISOString(),
    };
    setWellnessLog((prev) => ({
      ...prev,
      [today]: [...(prev[today] || []), entry],
    }));
    setWellnessNote("");
  }, [today, wellnessTime, wellnessMood, wellnessNote, setWellnessLog]);

  const addSymptom = useCallback(() => {
    const entry = {
      symptom: symptomType,
      severity: symptomSeverity,
      timestamp: new Date().toISOString(),
    };
    setSymptomLog((prev) => ({
      ...prev,
      [today]: [...(prev[today] || []), entry],
    }));
    if (symptomSeverity >= 4) {
      toast({
        title: "Symptom logged",
        description: "If symptoms persist or worsen, consider breaking your fast.",
        variant: "default",
        action: <ToastAction altText="Emergency" asChild><Link to="/emergency">Emergency →</Link></ToastAction>,
      });
    }
  }, [today, symptomType, symptomSeverity, setSymptomLog]);

  return (
    <div className="min-h-screen bg-background">
      <PageSEO
        title="Health | TryRamadan.app"
        description="Track wellness and symptoms during Ramadan: mood, hydration, energy, and when to seek medical advice."
        path="/dashboard/health"
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
              Health Tracker
            </h1>
            <p className="text-muted-foreground mt-2">
              Daily wellness check-ins, energy levels, and hydration. Pause or adjust fasting when needed.
            </p>
          </motion.div>

          {Array.isArray(preferences.healthWarnings) && preferences.healthWarnings.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.03 }}
              className="mb-6 p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 flex gap-4"
            >
              <AlertTriangle className="w-6 h-6 text-amber-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium mb-1">You indicated health considerations</p>
                <p className="text-sm text-muted-foreground mb-2">
                  Remember: consult your doctor before fasting.
                </p>
                <Link
                  to="/health-safety"
                  className="text-sm font-medium text-secondary hover:underline"
                >
                  Health & Safety →
                </Link>
              </div>
            </motion.div>
          )}

          {isRecurringCheckInDay && ramadanDay && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.04 }}
              className="mb-6 p-4 rounded-xl bg-secondary/10 border border-secondary/30 flex gap-4"
            >
              <Heart className="w-6 h-6 text-secondary flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium mb-1">Day {ramadanDay} check-in</p>
                <p className="text-sm text-muted-foreground mb-2">
                  How&apos;s fasting going? It&apos;s okay to adjust goals or take a break if you need to. Your health comes first.
                </p>
                <Link
                  to="/health-safety"
                  className="text-sm font-medium text-secondary hover:underline"
                >
                  Health & Safety →
                </Link>
              </div>
            </motion.div>
          )}

          {hasLowMoodThreePlusDays && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 }}
              className="mb-6 p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 flex gap-4"
            >
              <AlertTriangle className="w-6 h-6 text-amber-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium mb-1">You&apos;ve logged low energy recently</p>
                <p className="text-sm text-muted-foreground mb-2">
                  It&apos;s okay to adjust or pause. Your health comes first.
                </p>
                <Link
                  to="/health-safety"
                  className="text-sm font-medium text-secondary hover:underline"
                >
                  Health & Safety →
                </Link>
              </div>
            </motion.div>
          )}

          {/* Wellness check-in */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="p-6 rounded-2xl bg-card border border-border mb-6"
          >
            <h3 className="font-display font-bold mb-3 flex items-center gap-2">
              <Heart className="w-5 h-5 text-secondary" />
              Wellness check-in
            </h3>
            <p className="text-sm text-muted-foreground mb-4">Log how you feel this morning or evening (mood 1–5).</p>
            <div className="flex flex-wrap gap-4 mb-4">
              <div className="flex items-center gap-2">
                <Label className="text-sm">Time</Label>
                <Select value={wellnessTime} onValueChange={(v) => setWellnessTime(v as "morning" | "evening")}>
                  <SelectTrigger className="w-[140px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="morning"><Sun className="w-4 h-4 inline mr-2" /> Morning</SelectItem>
                    <SelectItem value="evening"><Moon className="w-4 h-4 inline mr-2" /> Evening</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center gap-2">
                <Label className="text-sm">Mood (1–5)</Label>
                <Select value={String(wellnessMood)} onValueChange={(v) => setWellnessMood(Number(v) as 1 | 2 | 3 | 4 | 5)}>
                  <SelectTrigger className="w-[100px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[1, 2, 3, 4, 5].map((n) => (
                      <SelectItem key={n} value={String(n)}>{n} — {n === 1 ? "Low" : n === 5 ? "Great" : "OK"}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <input
                type="text"
                placeholder="Optional note"
                value={wellnessNote}
                onChange={(e) => setWellnessNote(e.target.value)}
                className="flex-1 min-w-[120px] px-3 py-2 rounded-lg border border-border bg-background text-sm"
              />
              <Button size="sm" onClick={addWellness}>Log</Button>
            </div>
            {todayWellness.length > 0 && (
              <ul className="text-sm text-muted-foreground space-y-1">
                {todayWellness.slice(-5).reverse().map((e, i) => (
                  <li key={i}>
                    {e.timeOfDay} — mood {e.mood}
                    {e.note && `: ${e.note}`}
                    <span className="ml-2 text-xs">{new Date(e.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
                  </li>
                ))}
              </ul>
            )}
          </motion.div>

          {/* Symptom logger */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="p-6 rounded-2xl bg-card border border-border mb-6"
          >
            <h3 className="font-display font-bold mb-3 flex items-center gap-2">
              <Stethoscope className="w-5 h-5 text-secondary" />
              Symptom logger
            </h3>
            <p className="text-sm text-muted-foreground mb-4">Track headaches, dizziness, fatigue, etc. with severity (1–5).</p>
            <div className="flex flex-wrap gap-4 mb-4">
              <Select value={symptomType} onValueChange={setSymptomType}>
                <SelectTrigger className="w-[160px]">
                  <SelectValue placeholder="Symptom" />
                </SelectTrigger>
                <SelectContent>
                  {SYMPTOM_OPTIONS.map((s) => (
                    <SelectItem key={s} value={s}>{s}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={String(symptomSeverity)} onValueChange={(v) => setSymptomSeverity(Number(v) as 1 | 2 | 3 | 4 | 5)}>
                <SelectTrigger className="w-[100px]">
                  <SelectValue placeholder="Severity" />
                </SelectTrigger>
                <SelectContent>
                  {[1, 2, 3, 4, 5].map((n) => (
                    <SelectItem key={n} value={String(n)}>Severity {n}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button size="sm" onClick={addSymptom}>Log symptom</Button>
            </div>
            {todaySymptoms.length > 0 && (
              <ul className="text-sm text-muted-foreground space-y-1">
                {todaySymptoms.slice(-5).reverse().map((e, i) => (
                  <li key={i}>
                    {e.symptom} — severity {e.severity}
                    <span className="ml-2 text-xs">{new Date(e.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
                  </li>
                ))}
              </ul>
            )}
          </motion.div>

          {/* Hydration summary + quick link */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.12 }}
            className="mb-6"
          >
            <Link
              to="/dashboard/today"
              className="block p-6 rounded-2xl bg-card border border-border hover:border-secondary/50 transition-all"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center">
                  <Droplets className="w-6 h-6 text-blue-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold">Hydration today</h3>
                  <p className="text-sm text-muted-foreground">
                    {hydrationGlasses} / 8+ glasses · Track on Today's Fast
                  </p>
                </div>
                <span className="text-sm font-medium text-secondary">Update →</span>
              </div>
            </Link>
          </motion.div>

          {/* Energy trends today */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="grid gap-4 mb-6"
          >
            <Link
              to="/dashboard/today"
              className="p-6 rounded-2xl bg-card border border-border hover:border-secondary/50 transition-all flex items-center gap-4"
            >
              <div className="w-12 h-12 rounded-full bg-secondary/20 flex items-center justify-center">
                <Heart className="w-6 h-6 text-secondary" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold">Energy level check-in</h3>
                <p className="text-sm text-muted-foreground">
                  {energyEntries.length > 0
                    ? `Today: ${energyEntries.length} check-in(s) — latest: ${energyEntries[energyEntries.length - 1].level}/5`
                    : "Log how you feel on Today's Fast page"}
                </p>
              </div>
              <TrendingUp className="w-5 h-5 text-muted-foreground" />
            </Link>
          </motion.div>

          {/* Recent wellness */}
          {recentWellness.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.18 }}
              className="p-6 rounded-2xl bg-card border border-border mb-8"
            >
              <h3 className="font-display font-bold mb-3 flex items-center gap-2">
                <Heart className="w-5 h-5 text-secondary" />
                Recent wellness
              </h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                {recentWellness.map((e, i) => (
                  <li key={i} className="flex items-center justify-between py-1">
                    <span>
                      {e.date} · {e.timeOfDay} — mood {e.mood}
                      {e.note && `: ${e.note}`}
                    </span>
                    <span className="text-xs">{new Date(e.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
          )}

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="p-6 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex gap-4"
          >
            <AlertTriangle className="w-6 h-6 text-amber-600 flex-shrink-0 mt-1" />
            <div>
              <h3 className="font-bold mb-2">Health & safety</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Contraindications, safe fasting guidelines, and when to break your fast.
              </p>
              <Link
                to="/health-safety"
                className="text-sm font-medium text-secondary hover:underline"
              >
                Open Health & Safety guide →
              </Link>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-6"
          >
            <Link
              to="/emergency"
              className="inline-flex items-center justify-center gap-2 px-4 sm:px-6 py-3 rounded-xl border-2 border-destructive/50 text-destructive hover:bg-destructive/10 transition-colors min-h-[44px]"
            >
              <AlertTriangle className="w-5 h-5" />
              I need to break my fast — open emergency resources
            </Link>
          </motion.div>

          <p className="text-xs text-muted-foreground mt-8 mb-4 text-center max-w-xl mx-auto">
            TryRamadan is for tracking and education only. It does not replace medical, religious, or nutritional advice.
          </p>
        </div>
      </main>
      <Footer />
    </div>
  );
}
