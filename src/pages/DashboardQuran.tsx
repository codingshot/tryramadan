import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  BookOpen,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Loader2,
} from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { PageSEO } from "@/components/PageSEO";
import {
  TOTAL_JUZ,
  getQuranComJuzUrl,
  fetchVersesByJuz,
  type QuranVerse,
  type VersesByJuzResponse,
} from "@/lib/quran";
import { getRamadanDayNumber, isRamadanDay } from "@/lib/ramadan";
import { Button } from "@/components/ui/button";

const DashboardQuran = () => {
  const today = new Date();
  const ramadanDay = isRamadanDay(today) ? getRamadanDayNumber(today) : null;

  const [planDay, setPlanDay] = useState<number>(ramadanDay ?? 1);
  const [data, setData] = useState<VersesByJuzResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [syncWithRamadan, setSyncWithRamadan] = useState(!!ramadanDay);

  const juzNumber = Math.min(TOTAL_JUZ, Math.max(1, planDay));
  const quranComUrl = getQuranComJuzUrl(juzNumber);

  useEffect(() => {
    if (syncWithRamadan && ramadanDay != null) {
      setPlanDay(ramadanDay);
    }
  }, [syncWithRamadan, ramadanDay]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    fetchVersesByJuz(juzNumber, 1, 12)
      .then((res) => {
        if (!cancelled) setData(res);
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof Error ? err.message : "Failed to load");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, [juzNumber]);

  const goPrev = () => setPlanDay((d) => Math.max(1, d - 1));
  const goNext = () => setPlanDay((d) => Math.min(TOTAL_JUZ, d + 1));
  const goFirst = () => setPlanDay(1);
  const goLast = () => setPlanDay(TOTAL_JUZ);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = document.activeElement as HTMLElement | null;
      const isInput = target?.tagName === "INPUT" || target?.tagName === "TEXTAREA" || target?.isContentEditable;
      if (isInput) return;

      if (e.key === "ArrowLeft") {
        e.preventDefault();
        if (e.ctrlKey || e.metaKey) goFirst();
        else goPrev();
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        if (e.ctrlKey || e.metaKey) goLast();
        else goNext();
      } else if (e.key === "Home") {
        e.preventDefault();
        goFirst();
      } else if (e.key === "End") {
        e.preventDefault();
        goLast();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <PageSEO
        title="Quran Reading Plan | TryRamadan.app"
        description="Read the Quran in order: one juz per day with translation from Quran.com. Plan each day of Ramadan with Arabic text and English translation."
        path="/dashboard/quran"
      />
      <Navbar />
      <main className="main-content" role="main" aria-label="Quran reading plan">
        <div className="container mx-auto px-4 max-w-3xl min-w-0">
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 min-h-[44px] items-center"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </Link>

          <motion.header
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <h1 className="text-2xl sm:text-3xl font-display font-bold">
              Quran Reading Plan
              <span className="block font-arabic text-lg text-secondary mt-1">
                خطة تلاوة القرآن
              </span>
            </h1>
            <p className="text-muted-foreground mt-2">
              Move through the Quran in order: one juz (part) per day. Read with Arabic and English translation from Quran.com. Plan each day below.
            </p>
          </motion.header>

          {/* Day selector + sync with Ramadan */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="mb-6 p-4 rounded-2xl bg-card border border-border"
          >
            {ramadanDay != null && (
              <label className="flex items-center gap-2 mb-4 cursor-pointer">
                <input
                  type="checkbox"
                  checked={syncWithRamadan}
                  onChange={(e) => setSyncWithRamadan(e.target.checked)}
                  className="rounded"
                />
                <span className="text-sm">Sync with Ramadan day (today = Day {ramadanDay})</span>
              </label>
            )}
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={goPrev}
                  disabled={planDay <= 1}
                  aria-label="Previous day"
                >
                  <ChevronLeft className="w-5 h-5" />
                </Button>
                <div className="text-center min-w-[120px]">
                  <span className="block text-2xl font-bold text-secondary">Day {planDay}</span>
                  <span className="text-sm text-muted-foreground">Juz {juzNumber} of {TOTAL_JUZ}</span>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={goNext}
                  disabled={planDay >= TOTAL_JUZ}
                  aria-label="Next day"
                >
                  <ChevronRight className="w-5 h-5" />
                </Button>
              </div>
              <a
                href={quranComUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-secondary text-secondary-foreground font-medium text-sm hover:bg-secondary/90 transition-colors"
              >
                Open Juz {juzNumber} on Quran.com (read with translation)
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
            <p className="text-xs text-muted-foreground mt-3">
              Content and translation from Quran.com (api.quran.com). Open the link above to read the full juz with multiple translations and tafsir.
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Keyboard: ← → prev/next day · Ctrl+← / Ctrl+→ first/last · Home / End jump to day 1 / 30
            </p>
          </motion.div>

          {/* Preview: first verses of this juz with translation */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-8"
            aria-label="Verse preview"
          >
            <h2 className="font-display font-bold mb-3 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-secondary" />
              Preview — Juz {juzNumber} (with translation)
            </h2>
            {loading && (
              <div className="flex items-center justify-center py-12 text-muted-foreground">
                <Loader2 className="w-8 h-8 animate-spin" />
              </div>
            )}
            {error && (
              <p className="text-destructive text-sm py-4">
                {error}. You can still open{" "}
                <a href={quranComUrl} target="_blank" rel="noopener noreferrer" className="underline">
                  Quran.com
                </a>{" "}
                to read Juz {juzNumber}.
              </p>
            )}
            {!loading && !error && data && data.verses.length > 0 && (
              <div className="rounded-2xl border border-border bg-card overflow-hidden">
                <ul className="divide-y divide-border">
                  {data.verses.map((verse: QuranVerse) => (
                    <li key={verse.id} className="p-4">
                      <div className="flex gap-3">
                        <span className="text-xs font-medium text-muted-foreground shrink-0 pt-0.5">
                          {verse.verse_key}
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className="font-arabic text-lg leading-relaxed text-foreground" dir="rtl">
                            {verse.text_uthmani}
                          </p>
                          {verse.translations?.[0]?.text && (
                            <p className="text-sm text-muted-foreground mt-2" dir="ltr">
                              {verse.translations[0].text}
                            </p>
                          )}
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
                <div className="px-4 py-3 bg-muted/50 border-t border-border text-center">
                  <a
                    href={quranComUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-secondary hover:underline inline-flex items-center gap-1"
                  >
                    Read full Juz {juzNumber} on Quran.com
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            )}
          </motion.section>

          {/* Full 30-day plan grid */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="mb-8"
            aria-label="30-day plan"
          >
            <h2 className="font-display font-bold mb-3">30-day plan</h2>
            <p className="text-sm text-muted-foreground mb-4">
              One juz per day. Tap a day to view that day's portion.
            </p>
            <div className="grid grid-cols-5 sm:grid-cols-10 gap-2">
              {Array.from({ length: TOTAL_JUZ }, (_, i) => i + 1).map((day) => (
                <button
                  key={day}
                  type="button"
                  onClick={() => setPlanDay(day)}
                  className={`p-2 sm:p-3 rounded-xl border text-center transition-colors min-h-[44px] ${
                    planDay === day
                      ? "bg-secondary text-secondary-foreground border-secondary"
                      : "bg-card border-border hover:border-secondary/50"
                  }`}
                  aria-pressed={planDay === day}
                  aria-label={`Day ${day}, Juz ${day}`}
                >
                  <span className="block font-bold text-sm">{day}</span>
                  <span className="block text-[10px] sm:text-xs text-muted-foreground">Juz {day}</span>
                </button>
              ))}
            </div>
          </motion.section>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default DashboardQuran;
