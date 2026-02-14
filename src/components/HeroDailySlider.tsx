import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, Quote, BookOpen } from "lucide-react";
import hadiths from "@/data/hadiths.json";
import dailyQuran from "@/data/daily-quran-verses.json";
import { useState, useMemo, useRef, useEffect } from "react";
import { HadithSunnahLink } from "@/components/HadithSunnahLink";
import { EXTERNAL_LINKS } from "@/lib/config";

function getDayOfYear(d: Date): number {
  const start = new Date(d.getFullYear(), 0, 0);
  return Math.floor((d.getTime() - start.getTime()) / 86400000);
}

function addDays(d: Date, n: number): Date {
  const out = new Date(d);
  out.setDate(out.getDate() + n);
  return out;
}

type Mode = "hadith" | "quran";

export const HeroDailySlider = () => {
  const today = useMemo(() => {
    const t = new Date();
    t.setHours(0, 0, 0, 0);
    return t;
  }, []);

  const [dayOffset, setDayOffset] = useState(0);
  const [mode, setMode] = useState<Mode>("hadith");

  const viewDate = addDays(today, dayOffset);
  const dayOfYear = getDayOfYear(viewDate);
  const hadithIndex = dayOfYear % hadiths.hadiths.length;
  const verseIndex = dayOfYear % dailyQuran.verses.length;
  const hadith = hadiths.hadiths[hadithIndex];
  const verse = dailyQuran.verses[verseIndex];

  const dateLabel = viewDate.toLocaleDateString(undefined, {
    weekday: "long",
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  const isToday = dayOffset === 0;
  const sectionRef = useRef<HTMLDivElement>(null);
  const touchStartX = useRef<number | null>(null);
  const SWIPE_THRESHOLD = 50;

  // Arrow keys to change day when focus is inside the slider
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const el = sectionRef.current;
      if (!el || !el.contains(document.activeElement)) return;
      if (e.key === "ArrowLeft") {
        setDayOffset((o) => o - 1);
        e.preventDefault();
      } else if (e.key === "ArrowRight") {
        setDayOffset((o) => o + 1);
        e.preventDefault();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.targetTouches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current == null) return;
    const endX = e.changedTouches[0].clientX;
    const delta = touchStartX.current - endX;
    touchStartX.current = null;
    if (Math.abs(delta) < SWIPE_THRESHOLD) return;
    if (delta > 0) setDayOffset((o) => o + 1); // swipe left -> next day
    else setDayOffset((o) => o - 1); // swipe right -> previous day
  };

  return (
    <motion.div
      ref={sectionRef}
      tabIndex={0}
      role="region"
      aria-label="Daily hadith and Quran; use Left and Right arrow keys to change day"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.35 }}
      className="w-full rounded-2xl bg-primary-foreground/10 backdrop-blur-sm border border-primary-foreground/20 overflow-hidden outline-none focus-visible:ring-2 focus-visible:ring-secondary focus-visible:ring-offset-2 focus-visible:ring-offset-primary touch-pan-y"
    >
      {/* Toggle: Daily Hadith | Daily Quran */}
      <div className="flex border-b border-primary-foreground/20">
        <button
          type="button"
          onClick={() => setMode("hadith")}
          className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-medium transition-colors ${
            mode === "hadith"
              ? "bg-primary text-primary-foreground"
              : "text-primary-foreground/80 hover:bg-primary-foreground/10"
          }`}
          aria-pressed={mode === "hadith"}
          aria-label="Show daily hadith"
        >
          <Quote className="w-4 h-4 shrink-0" aria-hidden />
          Daily Hadith
        </button>
        <button
          type="button"
          onClick={() => setMode("quran")}
          className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-medium transition-colors ${
            mode === "quran"
              ? "bg-primary text-primary-foreground"
              : "text-primary-foreground/80 hover:bg-primary-foreground/10"
          }`}
          aria-pressed={mode === "quran"}
          aria-label="Show daily Quran verse"
        >
          <BookOpen className="w-4 h-4 shrink-0" aria-hidden />
          Daily Quran
        </button>
      </div>

      {/* Date + prev/next */}
      <div className="flex items-center justify-between gap-2 px-4 py-2 bg-primary-foreground/5">
        <button
          type="button"
          onClick={() => setDayOffset((o) => o - 1)}
          className="p-2 rounded-lg text-primary-foreground/80 hover:bg-primary-foreground/10 hover:text-primary-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-secondary"
          aria-label="Previous day"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <time dateTime={viewDate.toISOString().slice(0, 10)} className="text-sm text-primary-foreground font-medium">
          {dateLabel}
          {isToday && (
            <span className="ml-2 text-xs text-secondary font-normal">(today)</span>
          )}
        </time>
        <button
          type="button"
          onClick={() => setDayOffset((o) => o + 1)}
          className="p-2 rounded-lg text-primary-foreground/80 hover:bg-primary-foreground/10 hover:text-primary-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-secondary"
          aria-label="Next day"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* Content */}
      <div className="px-4 pb-4 pt-1 min-h-[120px]">
        <AnimatePresence mode="wait">
          {mode === "hadith" ? (
            <motion.div
              key={`hadith-${dayOffset}`}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 8 }}
              transition={{ duration: 0.2 }}
              className="space-y-2"
            >
              <blockquote className="text-sm md:text-base leading-relaxed text-primary-foreground font-display">
                "{hadith.text}"
              </blockquote>
              <p className="text-xs text-primary-foreground/80">
                <HadithSunnahLink source={hadith.source} className="text-secondary hover:text-secondary/90">
                  {hadith.source}
                </HadithSunnahLink>
                {" · "}
                {hadith.topic}
              </p>
            </motion.div>
          ) : (
            <motion.div
              key={`quran-${dayOffset}`}
              initial={{ opacity: 0, x: 8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -8 }}
              transition={{ duration: 0.2 }}
              className="space-y-2"
            >
              <blockquote className="text-sm md:text-base leading-relaxed text-primary-foreground font-display">
                "{verse.text}"
              </blockquote>
              <p className="text-xs text-primary-foreground/80">
                <a
                  href={`${EXTERNAL_LINKS.quran}/${verse.surahNumber}/${verse.verseNumber}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-secondary hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-secondary rounded"
                >
                  Surah {verse.surah} {verse.reference}
                </a>
                {" · "}
                {verse.topic}
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};
