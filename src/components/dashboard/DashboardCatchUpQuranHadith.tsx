import { useMemo, useState, useCallback } from "react";
import { ChevronDown, ChevronUp, ChevronLeft, ChevronRight, BookOpen, Quote, Check, Eye } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Button } from "@/components/ui/button";
import { useQuranVerseViewedDates, useHadithViewedDates } from "@/hooks/useLocalStorage";
import { useRamadanRange } from "@/hooks/useRamadanRange";
import { toLocalDateString } from "@/lib/utils";
import hadithsData from "@/data/hadiths.json";
import dailyQuran from "@/data/daily-quran-verses.json";

function getDayOfYear(dateStr: string): number {
  const d = new Date(dateStr + "T12:00:00");
  const start = new Date(d.getFullYear(), 0, 0);
  return Math.floor((d.getTime() - start.getTime()) / 86400000);
}

function getVerseForDate(dateStr: string): (typeof dailyQuran.verses)[number] {
  const dayOfYear = getDayOfYear(dateStr);
  const index = dayOfYear % dailyQuran.verses.length;
  return dailyQuran.verses[index];
}

function getHadithForDate(dateStr: string): (typeof hadithsData.hadiths)[number] {
  const dayOfYear = getDayOfYear(dateStr);
  const index = dayOfYear % hadithsData.hadiths.length;
  return hadithsData.hadiths[index];
}

const CATCH_UP_MAX_DAYS = 60;

type CatchUpItem = {
  dateStr: string;
  label: string;
  type: "quran" | "hadith";
  title: string;
  content: string;
  source: string;
  isRead: boolean;
};

interface DashboardCatchUpQuranHadithProps {
  todayStr: string;
}

export function DashboardCatchUpQuranHadith({ todayStr }: DashboardCatchUpQuranHadithProps) {
  const [quranDates, markQuranViewed] = useQuranVerseViewedDates();
  const [hadithDates, markHadithViewed] = useHadithViewedDates();
  const ramadanRange = useRamadanRange();
  const [open, setOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(0);
  const [hasScrolledToBottom, setHasScrolledToBottom] = useState(false);

  const catchUpDates = useMemo(() => {
    const today = new Date(todayStr + "T12:00:00");
    const ramadanStart = ramadanRange.start;
    const startDate = new Date(today);
    startDate.setDate(startDate.getDate() - CATCH_UP_MAX_DAYS);
    const from = ramadanStart && ramadanStart < startDate ? ramadanStart : startDate;
    const dates: string[] = [];
    const d = new Date(today);
    d.setDate(d.getDate() - 1);
    while (d >= from) {
      dates.push(toLocalDateString(d));
      d.setDate(d.getDate() - 1);
    }
    return dates;
  }, [todayStr, ramadanRange.start]);

  // Build flat list of unread items (quran + hadith per missed day)
  const items: CatchUpItem[] = useMemo(() => {
    const result: CatchUpItem[] = [];
    for (const dateStr of catchUpDates) {
      const qRead = quranDates.includes(dateStr);
      const hRead = hadithDates.includes(dateStr);
      if (qRead && hRead) continue;
      const dateLabel =
        dateStr === toLocalDateString(new Date(Date.now() - 86400000))
          ? "Yesterday"
          : new Date(dateStr + "T12:00:00").toLocaleDateString(undefined, {
              weekday: "short",
              month: "short",
              day: "numeric",
            });
      if (!qRead) {
        const verse = getVerseForDate(dateStr);
        result.push({
          dateStr,
          label: dateLabel,
          type: "quran",
          title: `${verse.surah} ${verse.reference}`,
          content: verse.text,
          source: `Quran ${verse.reference} — ${verse.topic}`,
          isRead: false,
        });
      }
      if (!hRead) {
        const hadith = getHadithForDate(dateStr);
        result.push({
          dateStr,
          label: dateLabel,
          type: "hadith",
          title: hadith.topic,
          content: hadith.text,
          source: hadith.source,
          isRead: false,
        });
      }
    }
    return result.slice(0, 60); // cap for performance
  }, [catchUpDates, quranDates, hadithDates]);

  const currentItem = items[currentIndex];

  const goNext = useCallback(() => {
    if (currentIndex < items.length - 1) {
      setDirection(1);
      setCurrentIndex((i) => i + 1);
      setHasScrolledToBottom(false);
    }
  }, [currentIndex, items.length]);

  const goPrev = useCallback(() => {
    if (currentIndex > 0) {
      setDirection(-1);
      setCurrentIndex((i) => i - 1);
      setHasScrolledToBottom(false);
    }
  }, [currentIndex]);

  const markCurrentAsRead = useCallback(() => {
    if (!currentItem) return;
    if (currentItem.type === "quran") {
      markQuranViewed(currentItem.dateStr);
    } else {
      markHadithViewed(currentItem.dateStr);
    }
    // Auto-advance to next if available
    if (currentIndex < items.length - 1) {
      setTimeout(() => goNext(), 300);
    }
  }, [currentItem, currentIndex, items.length, markQuranViewed, markHadithViewed, goNext]);

  const handleContentScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    const el = e.currentTarget;
    const atBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 24;
    if (atBottom) setHasScrolledToBottom(true);
  }, []);

  // Check if content is short enough that scrolling isn't needed
  const handleContentRef = useCallback((el: HTMLDivElement | null) => {
    if (el) {
      // If content doesn't overflow, consider it "scrolled"
      if (el.scrollHeight <= el.clientHeight + 8) {
        setHasScrolledToBottom(true);
      }
    }
  }, []);

  if (items.length === 0) return null;

  const variants = {
    enter: (d: number) => ({ x: d > 0 ? 200 : -200, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (d: number) => ({ x: d > 0 ? -200 : 200, opacity: 0 }),
  };

  return (
    <Collapsible open={open} onOpenChange={setOpen} className="w-full">
      <div className="rounded-xl border border-border bg-muted/20 overflow-hidden">
        <CollapsibleTrigger asChild>
          <button
            type="button"
            className="w-full flex items-center justify-between gap-2 px-4 py-3 text-left hover:bg-muted/40 transition-colors"
            aria-expanded={open}
          >
            <span className="font-medium text-sm">Catch up on Quran & Hadith</span>
            <span className="text-xs text-muted-foreground">
              {items.length} item{items.length !== 1 ? "s" : ""} to read
            </span>
            {open ? (
              <ChevronUp className="w-4 h-4 text-muted-foreground shrink-0" aria-hidden />
            ) : (
              <ChevronDown className="w-4 h-4 text-muted-foreground shrink-0" aria-hidden />
            )}
          </button>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <div className="border-t border-border px-4 pb-4 pt-3">
            {/* Progress bar */}
            <div className="flex items-center gap-2 mb-3">
              <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden">
                <div
                  className="h-full rounded-full bg-primary transition-all duration-300"
                  style={{ width: `${((currentIndex + 1) / items.length) * 100}%` }}
                />
              </div>
              <span className="text-xs text-muted-foreground tabular-nums">
                {currentIndex + 1}/{items.length}
              </span>
            </div>

            {/* Card reader */}
            <div className="relative min-h-[240px] overflow-hidden">
              <AnimatePresence mode="wait" custom={direction}>
                {currentItem && (
                  <motion.div
                    key={`${currentItem.dateStr}-${currentItem.type}`}
                    custom={direction}
                    variants={variants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    transition={{ duration: 0.25, ease: "easeInOut" }}
                    className="rounded-lg border border-border bg-card p-4 flex flex-col"
                  >
                    {/* Header */}
                    <div className="flex items-center gap-2 mb-3">
                      <div className={`p-1.5 rounded-md ${currentItem.type === "quran" ? "bg-primary/10" : "bg-secondary/10"}`}>
                        {currentItem.type === "quran" ? (
                          <BookOpen className="w-4 h-4 text-primary" />
                        ) : (
                          <Quote className="w-4 h-4 text-secondary" />
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-medium text-muted-foreground">{currentItem.label}</p>
                        <p className="text-sm font-semibold truncate">{currentItem.title}</p>
                      </div>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${
                        currentItem.type === "quran" ? "bg-primary/10 text-primary" : "bg-secondary/10 text-secondary"
                      }`}>
                        {currentItem.type === "quran" ? "Quran" : "Hadith"}
                      </span>
                    </div>

                    {/* Scrollable content */}
                    <div
                      ref={handleContentRef}
                      onScroll={handleContentScroll}
                      className="text-sm leading-relaxed text-foreground/90 max-h-[140px] overflow-y-auto pr-1"
                    >
                      <p className="italic">"{currentItem.content}"</p>
                    </div>

                    {/* Source */}
                    <p className="text-[11px] text-muted-foreground mt-2 pt-2 border-t border-border/50">
                      {currentItem.source}
                    </p>

                    {/* Scroll hint or Mark as read */}
                    <div className="mt-3">
                      {!hasScrolledToBottom ? (
                        <p className="text-xs text-muted-foreground flex items-center gap-1 justify-center animate-pulse">
                          <Eye className="w-3 h-3" /> Read the full excerpt to mark as read
                        </p>
                      ) : (
                        <Button
                          size="sm"
                          className="w-full text-xs"
                          onClick={markCurrentAsRead}
                        >
                          <Check className="w-3.5 h-3.5 mr-1" />
                          Mark as read
                        </Button>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Navigation arrows */}
            <div className="flex items-center justify-between mt-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={goPrev}
                disabled={currentIndex === 0}
                className="text-xs gap-1"
              >
                <ChevronLeft className="w-4 h-4" /> Prev
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={goNext}
                disabled={currentIndex >= items.length - 1}
                className="text-xs gap-1"
              >
                Next <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CollapsibleContent>
      </div>
    </Collapsible>
  );
}
