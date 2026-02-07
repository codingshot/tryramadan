import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  ChevronLeft,
  ChevronRight,
  Check,
  PenLine,
  BookOpen,
  Flame,
  Utensils,
  Zap,
} from "lucide-react";
import { toast } from "sonner";
import {
  useUserPreferences,
  useFastingProgress,
  useLocalStorage,
  useDayFoodLog,
  useQuranVerseViewedDates,
  useHadithViewedDates,
  completeFastingToday,
  setDaySkipped,
  normalizeDayFoodLog,
} from "@/hooks/useLocalStorage";
import { toLocalDateString } from "@/lib/utils";
import { useRamadanRange } from "@/hooks/useRamadanRange";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

const CATCH_UP_DAYS = 14;

interface DayCatchUp {
  dateStr: string;
  label: string;
  missing: {
    journal: boolean;
    fasting: boolean;
    macro: boolean;
    quran: boolean;
    hadith: boolean;
  };
  missingCount: number;
}

interface CatchUpDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  todayStr: string;
}

export function CatchUpDialog({ open, onOpenChange, todayStr }: CatchUpDialogProps) {
  const [preferences] = useUserPreferences();
  const [progress, setProgress] = useFastingProgress();
  const [journalEntries] = useLocalStorage<{ date: string }[]>("tryramadan-journal", []);
  const [foodLogs] = useDayFoodLog();
  const [quranDates, markQuranViewed] = useQuranVerseViewedDates();
  const [hadithDates, markHadithViewed] = useHadithViewedDates();
  const ramadanRange = useRamadanRange();

  const wantQuran = (preferences.quranPriority ?? "some") !== "none";
  const wantHadith = (preferences.learningPriority ?? "moderate") !== "minimal";
  const wantMacro = preferences.macroTrackingEnabled ?? false;

  const daysNeedingCatchUp = useMemo(() => {
    const todayDate = new Date(todayStr + "T12:00:00");
    const result: DayCatchUp[] = [];
    for (let i = 1; i <= CATCH_UP_DAYS; i++) {
      const d = new Date(todayDate);
      d.setDate(d.getDate() - i);
      const dateStr = toLocalDateString(d);
      if (dateStr > todayStr) continue;

      const hasJournal = journalEntries.some((e) => e.date === dateStr);
      const completed = progress.completedDays.includes(dateStr);
      const skipped = (progress.skippedDays ?? []).includes(dateStr);
      const fastingDone = completed || skipped;
      const dayLog = normalizeDayFoodLog(foodLogs[dateStr]);
      const hasMacro = (dayLog.suhoor?.length ?? 0) > 0 || (dayLog.iftar?.length ?? 0) > 0;
      const hasQuran = quranDates.includes(dateStr);
      const hasHadith = hadithDates.includes(dateStr);

      const missing = {
        journal: !hasJournal,
        fasting: !fastingDone,
        macro: wantMacro && !hasMacro,
        quran: wantQuran && !hasQuran,
        hadith: wantHadith && !hasHadith,
      };
      const missingCount =
        (missing.journal ? 1 : 0) +
        (missing.fasting ? 1 : 0) +
        (missing.macro ? 1 : 0) +
        (missing.quran ? 1 : 0) +
        (missing.hadith ? 1 : 0);
      if (missingCount === 0) continue;

      const dayNum = ramadanRange.getRamadanDayNumber(d);
      const label =
        dayNum != null
          ? `Ramadan Day ${dayNum} (${dateStr})`
          : i === 1
            ? `Yesterday (${dateStr})`
            : dateStr;
      result.push({ dateStr, label, missing, missingCount });
    }
    return result;
  }, [
    todayStr,
    journalEntries,
    progress.completedDays,
    progress.skippedDays,
    foodLogs,
    quranDates,
    hadithDates,
    wantQuran,
    wantHadith,
    wantMacro,
    ramadanRange,
  ]);

  const [stepIndex, setStepIndex] = useState(0);
  const currentDay = daysNeedingCatchUp[stepIndex];

  const handleMarkFastingCompleted = () => {
    if (!currentDay) return;
    completeFastingToday(progress, setProgress, currentDay.dateStr);
    toast.success(`Marked ${currentDay.dateStr} as completed`);
  };

  const handleMarkFastingSkipped = () => {
    if (!currentDay) return;
    setDaySkipped(progress, setProgress, currentDay.dateStr);
    toast.success(`Marked ${currentDay.dateStr} as skipped`);
  };

  const handleMarkQuranViewed = () => {
    if (!currentDay) return;
    markQuranViewed(currentDay.dateStr);
    toast.success(`Quran marked for ${currentDay.dateStr}`);
  };

  const handleMarkHadithViewed = () => {
    if (!currentDay) return;
    markHadithViewed(currentDay.dateStr);
    toast.success(`Hadith marked for ${currentDay.dateStr}`);
  };

  const goNext = () => {
    if (stepIndex < daysNeedingCatchUp.length - 1) {
      setStepIndex((i) => i + 1);
    } else {
      onOpenChange(false);
      setStepIndex(0);
    }
  };

  const goPrev = () => {
    if (stepIndex > 0) setStepIndex((i) => i - 1);
  };

  if (!open) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-w-md"
        aria-describedby="catch-up-description"
        onCloseAutoFocus={() => setStepIndex(0)}
      >
        <DialogTitle>Catch up on past days</DialogTitle>
        <p id="catch-up-description" className="text-sm text-muted-foreground">
          Speed through days that need journal, fasting log, macro tracking, Quran, or Hadith.
        </p>

        {daysNeedingCatchUp.length === 0 ? (
          <p className="text-sm text-muted-foreground py-4 text-center">
            All caught up! No past days need attention based on your settings.
          </p>
        ) : (
          <>
            <div className="flex items-center justify-between gap-2 py-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={goPrev}
                disabled={stepIndex === 0}
                aria-label="Previous day"
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <span className="text-sm font-medium">
                {stepIndex + 1} of {daysNeedingCatchUp.length}
              </span>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={goNext}
                aria-label="Next day"
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>

            {currentDay && (
              <div className="space-y-3 py-2">
                <h3 className="font-semibold text-base">{currentDay.label}</h3>
                <ul className="space-y-2" role="list">
                  {currentDay.missing.journal && (
                    <li className="flex items-center justify-between gap-2 p-2 rounded-lg bg-muted/50 border border-border">
                      <span className="flex items-center gap-2 text-sm">
                        <PenLine className="w-4 h-4 text-secondary" aria-hidden />
                        Journal
                      </span>
                      <Link
                        to={`/dashboard/journal?date=${currentDay.dateStr}`}
                        className="text-xs font-medium text-secondary hover:underline"
                        onClick={() => onOpenChange(false)}
                      >
                        Open Journal
                      </Link>
                    </li>
                  )}
                  {currentDay.missing.fasting && (
                    <li className="flex items-center justify-between gap-2 p-2 rounded-lg bg-muted/50 border border-border">
                      <span className="flex items-center gap-2 text-sm">
                        <Flame className="w-4 h-4 text-secondary" aria-hidden />
                        Fasting log
                      </span>
                      <div className="flex gap-1">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={handleMarkFastingCompleted}
                          className="text-xs"
                        >
                          <Check className="w-3 h-3 mr-0.5" aria-hidden />
                          Completed
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={handleMarkFastingSkipped}
                          className="text-xs"
                        >
                          Skipped
                        </Button>
                      </div>
                    </li>
                  )}
                  {currentDay.missing.macro && (
                    <li className="flex items-center justify-between gap-2 p-2 rounded-lg bg-muted/50 border border-border">
                      <span className="flex items-center gap-2 text-sm">
                        <Utensils className="w-4 h-4 text-secondary" aria-hidden />
                        Macro tracking
                      </span>
                      <Link
                        to={`/dashboard/macros?date=${currentDay.dateStr}`}
                        className="text-xs font-medium text-secondary hover:underline"
                        onClick={() => onOpenChange(false)}
                      >
                        Open Macros
                      </Link>
                    </li>
                  )}
                  {currentDay.missing.quran && (
                    <li className="flex items-center justify-between gap-2 p-2 rounded-lg bg-muted/50 border border-border">
                      <span className="flex items-center gap-2 text-sm">
                        <BookOpen className="w-4 h-4 text-secondary" aria-hidden />
                        Quran verse
                      </span>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={handleMarkQuranViewed}
                        className="text-xs"
                      >
                        <Check className="w-3 h-3 mr-0.5" aria-hidden />
                        Mark viewed
                      </Button>
                    </li>
                  )}
                  {currentDay.missing.hadith && (
                    <li className="flex items-center justify-between gap-2 p-2 rounded-lg bg-muted/50 border border-border">
                      <span className="flex items-center gap-2 text-sm">
                        <Zap className="w-4 h-4 text-secondary" aria-hidden />
                        Hadith
                      </span>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={handleMarkHadithViewed}
                        className="text-xs"
                      >
                        <Check className="w-3 h-3 mr-0.5" aria-hidden />
                        Mark viewed
                      </Button>
                    </li>
                  )}
                </ul>
                <div className="pt-2 flex justify-end">
                  <Button type="button" variant="secondary" size="sm" onClick={goNext}>
                    Next day
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
