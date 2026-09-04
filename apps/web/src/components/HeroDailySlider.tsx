import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, Quote, BookOpen, Check, ExternalLink } from "lucide-react";
import hadiths from "@/data/hadiths.json";
import dailyQuran from "@/data/daily-quran-verses.json";
import { useState, useMemo, useRef, useEffect } from "react";
import { HadithSunnahLink } from "@/components/HadithSunnahLink";
import { EXTERNAL_LINKS } from "@/lib/config";
import { toLocalDateString } from "@/lib/utils";
import { useQuranVerseViewedDates, useHadithViewedDates } from "@/hooks/useLocalStorage";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { fetchVerseByChapterAndVerse } from "@/lib/quran";

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
  const [detailOpen, setDetailOpen] = useState<"verse" | "hadith" | null>(null);

  const [quranDates, markQuranViewed, unmarkQuranDate] = useQuranVerseViewedDates();
  const [hadithDates, markHadithViewed, unmarkHadithDate] = useHadithViewedDates();

  const viewDate = addDays(today, dayOffset);
  const viewDateStr = toLocalDateString(viewDate);
  const dayOfYear = getDayOfYear(viewDate);
  const hadithIndex = dayOfYear % hadiths.hadiths.length;
  const verseIndex = dayOfYear % dailyQuran.verses.length;
  const hadith = hadiths.hadiths[hadithIndex];
  const verse = dailyQuran.verses[verseIndex];

  const quranRead = quranDates.includes(viewDateStr);
  const hadithRead = hadithDates.includes(viewDateStr);

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
    if (delta > 0) setDayOffset((o) => o + 1);
    else setDayOffset((o) => o - 1);
  };

  const openVerseDetail = () => setDetailOpen("verse");
  const openHadithDetail = () => setDetailOpen("hadith");
  const closeDetail = () => setDetailOpen(null);

  return (
    <>
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
        className="w-full rounded-2xl bg-card backdrop-blur-sm border border-border overflow-hidden outline-none focus-visible:ring-2 focus-visible:ring-secondary focus-visible:ring-offset-2 focus-visible:ring-offset-background touch-pan-y"
      >
        <div className="flex border-b border-border">
          <button
            type="button"
            onClick={() => setMode("hadith")}
            className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-medium transition-colors ${
              mode === "hadith"
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-muted"
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
                : "text-muted-foreground hover:bg-muted"
            }`}
            aria-pressed={mode === "quran"}
            aria-label="Show daily Quran verse"
          >
            <BookOpen className="w-4 h-4 shrink-0" aria-hidden />
            Daily Quran
          </button>
        </div>

        <div className="flex items-center justify-between gap-2 px-4 py-2 bg-muted/50">
          <button
            type="button"
            onClick={() => setDayOffset((o) => o - 1)}
            className="p-2 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-secondary"
            aria-label="Previous day"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <time dateTime={viewDateStr} className="text-sm text-foreground font-medium">
            {dateLabel}
            {isToday && (
              <span className="ml-2 text-xs text-secondary font-normal">(today)</span>
            )}
          </time>
          <button
            type="button"
            onClick={() => setDayOffset((o) => o + 1)}
            className="p-2 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-secondary"
            aria-label="Next day"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

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
                <Tooltip delayDuration={300}>
                  <TooltipTrigger asChild>
                    <blockquote
                      className="text-sm md:text-base leading-relaxed text-foreground font-display cursor-pointer hover:bg-muted/50 rounded-lg p-2 -mx-2 border border-transparent hover:border-border transition-colors"
                      onClick={openHadithDetail}
                    >
                      "{hadith.text}"
                    </blockquote>
                  </TooltipTrigger>
                  <TooltipContent side="top" className="max-w-md p-3" aria-describedby={undefined}>
                    <p className="font-display text-sm leading-relaxed">"{hadith.text}"</p>
                    {(hadith as { context?: string }).context && (
                      <p className="text-xs text-muted-foreground mt-2 pt-2 border-t border-border">
                        {(hadith as { context: string }).context}
                      </p>
                    )}
                    <p className="text-xs text-muted-foreground mt-2">Click to open full hadith</p>
                  </TooltipContent>
                </Tooltip>
                <p className="text-xs text-muted-foreground">
                  <HadithSunnahLink source={hadith.source} className="text-secondary hover:text-secondary/90">
                    {hadith.source}
                  </HadithSunnahLink>
                  {" · "}
                  {hadith.topic}
                  {hadithRead && (
                    <span className="ml-1.5 text-secondary font-medium">· Read</span>
                  )}
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
                <Tooltip delayDuration={300}>
                  <TooltipTrigger asChild>
                    <blockquote
                      className="text-sm md:text-base leading-relaxed text-foreground font-display cursor-pointer hover:bg-muted/50 rounded-lg p-2 -mx-2 border border-transparent hover:border-border transition-colors"
                      onClick={openVerseDetail}
                    >
                      "{verse.text}"
                    </blockquote>
                  </TooltipTrigger>
                  <TooltipContent side="top" className="max-w-md p-3" aria-describedby={undefined}>
                    <p className="font-display text-sm leading-relaxed">"{verse.text}"</p>
                    <p className="text-xs text-muted-foreground mt-2">Click to open full verse and translation</p>
                  </TooltipContent>
                </Tooltip>
                <p className="text-xs text-muted-foreground">
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
                  {quranRead && (
                    <span className="ml-1.5 text-secondary font-medium">· Read</span>
                  )}
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>

      {/* Verse detail dialog */}
      <Dialog open={detailOpen === "verse"} onOpenChange={(open) => !open && closeDetail()}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto" aria-describedby="verse-detail-desc">
          <DialogTitle className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-secondary shrink-0" aria-hidden />
            Quran verse · {dateLabel}
          </DialogTitle>
          <VerseDetailContent
            verse={verse}
            viewDateStr={viewDateStr}
            isRead={quranRead}
            onMarkRead={() => { markQuranViewed(viewDateStr); closeDetail(); }}
            onMarkUnread={() => { unmarkQuranDate(viewDateStr); closeDetail(); }}
            onClose={closeDetail}
          />
        </DialogContent>
      </Dialog>

      {/* Hadith detail dialog */}
      <Dialog open={detailOpen === "hadith"} onOpenChange={(open) => !open && closeDetail()}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto" aria-describedby="hadith-detail-desc">
          <DialogTitle className="flex items-center gap-2">
            <Quote className="w-5 h-5 text-secondary shrink-0" aria-hidden />
            Hadith · {dateLabel}
          </DialogTitle>
          <p id="hadith-detail-desc" className="sr-only">
            Full hadith text, source, and option to mark as read for your checklist.
          </p>
          <div className="space-y-3 pt-1">
            <blockquote className="text-sm md:text-base leading-relaxed font-display">
              "{hadith.text}"
            </blockquote>
            {(hadith as { context?: string }).context && (
              <p className="text-xs text-muted-foreground italic">{(hadith as { context: string }).context}</p>
            )}
            <p className="text-xs text-muted-foreground">
              <HadithSunnahLink source={hadith.source}>{hadith.source}</HadithSunnahLink>
              {" · "}
              {hadith.topic}
            </p>
            <div className="flex flex-wrap gap-2 pt-2">
              {hadithRead ? (
                <Button type="button" variant="outline" size="sm" onClick={() => { unmarkHadithDate(viewDateStr); closeDetail(); }}>
                  Mark as unread
                </Button>
              ) : (
                <Button type="button" size="sm" onClick={() => { markHadithViewed(viewDateStr); closeDetail(); }}>
                  <Check className="w-4 h-4 mr-1" aria-hidden />
                  Mark as read
                </Button>
              )}
              <Button
                type="button"
                variant="outline"
                size="sm"
                asChild
              >
                <a
                  href={`${EXTERNAL_LINKS.sunnah}/search?q=${encodeURIComponent(hadith.source)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5"
                >
                  Read on Sunnah
                  <ExternalLink className="w-3.5 h-3.5" aria-hidden />
                </a>
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

/** Loads translation from API and shows verse + source + Mark as read. */
function VerseDetailContent({
  verse,
  viewDateStr,
  isRead,
  onMarkRead,
  onMarkUnread,
  onClose,
}: {
  verse: (typeof dailyQuran.verses)[number];
  viewDateStr: string;
  isRead: boolean;
  onMarkRead: () => void;
  onMarkUnread: () => void;
  onClose: () => void;
}) {
  const [translation, setTranslation] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetchVerseByChapterAndVerse(verse.surahNumber, verse.verseNumber)
      .then((r) => {
        if (!cancelled) setTranslation(r.translation || "");
      })
      .catch(() => {
        if (!cancelled) setTranslation("");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, [verse.surahNumber, verse.verseNumber]);

  return (
    <div className="space-y-3 pt-1">
      <p id="verse-detail-desc" className="sr-only">
        Full verse, English translation from Quran.com, and option to mark as read for your checklist.
      </p>
      <blockquote className="text-sm md:text-base leading-relaxed font-display">
        "{verse.text}"
      </blockquote>
      {loading ? (
        <p className="text-xs text-muted-foreground">Loading translation…</p>
      ) : translation ? (
        <p className="text-sm text-muted-foreground border-l-2 border-muted pl-3">
          {translation}
        </p>
      ) : null}
      <p className="text-xs text-muted-foreground">
        Surah {verse.surah} {verse.reference} · {verse.topic}
      </p>
      <div className="flex flex-wrap gap-2 pt-2">
        {isRead ? (
          <Button type="button" variant="outline" size="sm" onClick={onMarkUnread}>
            Mark as unread
          </Button>
        ) : (
          <Button type="button" size="sm" onClick={onMarkRead}>
            <Check className="w-4 h-4 mr-1" aria-hidden />
            Mark as read
          </Button>
        )}
        <Button type="button" variant="outline" size="sm" asChild>
          <a
            href={`${EXTERNAL_LINKS.quran}/${verse.surahNumber}/${verse.verseNumber}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5"
          >
            Read on Quran.com
            <ExternalLink className="w-3.5 h-3.5" aria-hidden />
          </a>
        </Button>
      </div>
    </div>
  );
}
