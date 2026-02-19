import { useMemo, useState } from "react";
import { ChevronDown, ChevronUp, BookOpen, Quote, Check, Circle } from "lucide-react";
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

interface DashboardCatchUpQuranHadithProps {
  todayStr: string;
}

export function DashboardCatchUpQuranHadith({ todayStr }: DashboardCatchUpQuranHadithProps) {
  const [quranDates, markQuranViewed, unmarkQuranDate] = useQuranVerseViewedDates();
  const [hadithDates, markHadithViewed, unmarkHadithDate] = useHadithViewedDates();
  const ramadanRange = useRamadanRange();
  const [open, setOpen] = useState(false);

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

  const daysWithMissing = useMemo(() => {
    return catchUpDates.filter((dateStr) => {
      const qRead = quranDates.includes(dateStr);
      const hRead = hadithDates.includes(dateStr);
      return !qRead || !hRead;
    });
  }, [catchUpDates, quranDates, hadithDates]);

  if (daysWithMissing.length === 0) return null;

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
              {daysWithMissing.length} day{daysWithMissing.length !== 1 ? "s" : ""} to catch up
            </span>
            {open ? (
              <ChevronUp className="w-4 h-4 text-muted-foreground shrink-0" aria-hidden />
            ) : (
              <ChevronDown className="w-4 h-4 text-muted-foreground shrink-0" aria-hidden />
            )}
          </button>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <div className="border-t border-border px-4 pb-4 pt-2 max-h-[320px] overflow-y-auto">
            <p className="text-xs text-muted-foreground mb-3">
              Swipe or tap to mark as read / unread. Updates your daily checklist.
            </p>
            <ul className="space-y-2" role="list">
              {daysWithMissing.slice(0, 30).map((dateStr) => {
                const verse = getVerseForDate(dateStr);
                const hadith = getHadithForDate(dateStr);
                const qRead = quranDates.includes(dateStr);
                const hRead = hadithDates.includes(dateStr);
                const label =
                  dateStr === toLocalDateString(new Date(Date.now() - 86400000))
                    ? "Yesterday"
                    : new Date(dateStr + "T12:00:00").toLocaleDateString(undefined, {
                        weekday: "short",
                        month: "short",
                        day: "numeric",
                      });
                return (
                  <li
                    key={dateStr}
                    className="flex flex-col sm:flex-row sm:items-center gap-2 p-3 rounded-lg bg-background border border-border"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium">{label}</p>
                      <p className="text-xs text-muted-foreground truncate">
                        {!qRead && <span className="inline-flex items-center gap-1"><BookOpen className="w-3 h-3" /> {verse.topic}</span>}
                        {!qRead && !hRead && " · "}
                        {!hRead && <span className="inline-flex items-center gap-1"><Quote className="w-3 h-3" /> {hadith.topic}</span>}
                      </p>
                    </div>
                    <div className="flex gap-2 shrink-0">
                      <Button
                        type="button"
                        variant={qRead ? "outline" : "secondary"}
                        size="sm"
                        className="text-xs"
                        onClick={() => (qRead ? unmarkQuranDate(dateStr) : markQuranViewed(dateStr))}
                        aria-pressed={qRead}
                        aria-label={qRead ? `Mark Quran as unread for ${dateStr}` : `Mark Quran as read for ${dateStr}`}
                      >
                        {qRead ? <Check className="w-3 h-3 mr-1" aria-hidden /> : <Circle className="w-3 h-3 mr-1" aria-hidden />}
                        Quran
                      </Button>
                      <Button
                        type="button"
                        variant={hRead ? "outline" : "secondary"}
                        size="sm"
                        className="text-xs"
                        onClick={() => (hRead ? unmarkHadithDate(dateStr) : markHadithViewed(dateStr))}
                        aria-pressed={hRead}
                        aria-label={hRead ? `Mark Hadith as unread for ${dateStr}` : `Mark Hadith as read for ${dateStr}`}
                      >
                        {hRead ? <Check className="w-3 h-3 mr-1" aria-hidden /> : <Circle className="w-3 h-3 mr-1" aria-hidden />}
                        Hadith
                      </Button>
                    </div>
                  </li>
                );
              })}
            </ul>
            {daysWithMissing.length > 30 && (
              <p className="text-xs text-muted-foreground mt-2 text-center">
                Showing first 30 days. Open Daily Quran / Hadith above and use prev day to go further back.
              </p>
            )}
          </div>
        </CollapsibleContent>
      </div>
    </Collapsible>
  );
}
