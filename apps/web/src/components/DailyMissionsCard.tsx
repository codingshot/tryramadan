import { motion } from "framer-motion";
import { memo, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { Target, Check, Circle, ChevronRight, PenLine } from "lucide-react";
import {
  useDailyMissions,
  useUserPreferences,
  useFastingProgress,
  useDisplayTimezone,
  getTodayDateString,
  startFastingToday,
  useLocalStorage,
  SCHEDULE_NOTES_KEY,
  type DailyMission,
} from "@/hooks/useLocalStorage";
import { getTodayStringInTimezone } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { GENERAL_TOOLTIPS } from "@/data/general-tooltips";
import { toast } from "sonner";

function getMissionTooltip(missionId: string, userType?: string): string | undefined {
  const tips: Record<string, string> = {
    start_fasting:
      userType === "muslim"
        ? "Tap \"I'm fasting\" on the dashboard after suhoor to mark that you've started today's fast."
        : "Tap \"I'm fasting\" on the dashboard after your pre-dawn meal (suhoor) to mark that you've started today's fast.",
    complete_fast: "When you break your fast at Maghrib (or earlier), use the dashboard to log it. Mark the day complete if you fasted dawn to sunset.",
    log_suhoor: "On the Schedule page, add a meal plan note or food log entry for your pre-dawn meal (suhoor).",
    log_iftar: "On the Schedule page, add a meal plan note or food log entry for your break-fast meal (iftar).",
    add_note: "Tap here to add a quick note in a popup, or open the Schedule page to add a note for the day.",
    read_hadith: "Open the Hadith page (Learn → Hadith) and read a short saying of the Prophet (peace be upon him) about fasting or Ramadan.",
  };
  return tips[missionId];
}

const MissionRow = memo(function MissionRow({
  mission,
  userType,
  onStartFasting,
  onQuickAddNote,
}: {
  mission: DailyMission;
  userType?: string;
  onStartFasting?: () => void;
  onQuickAddNote?: () => void;
}) {
  const tip = getMissionTooltip(mission.id, userType);
  const canQuickStart = mission.id === "start_fasting" && !mission.completed && onStartFasting;
  const canQuickAddNote = mission.id === "add_note" && !mission.completed && onQuickAddNote;
  const content = (
    <span className="flex items-center gap-2 text-sm">
      {mission.completed ? (
        <Check className="w-4 h-4 shrink-0 text-secondary" aria-hidden />
      ) : (
        <Circle className="w-4 h-4 shrink-0 text-muted-foreground" aria-hidden />
      )}
      {tip ? (
        <Tooltip>
          <TooltipTrigger asChild>
            <span
              className={`${canQuickStart || canQuickAddNote ? "cursor-pointer hover:text-secondary" : "cursor-help border-b border-dotted border-muted-foreground/30"} ${mission.completed ? "text-muted-foreground line-through" : ""}`}
            >
              {mission.label}
            </span>
          </TooltipTrigger>
          <TooltipContent side="right" className="max-w-xs">
            <p className="text-xs text-muted-foreground">
              {canQuickStart
                ? "Tap here or \"I'm fasting\" on the dashboard to mark that you've started today's fast."
                : tip}
            </p>
          </TooltipContent>
        </Tooltip>
      ) : (
        <span
          className={`${canQuickStart || canQuickAddNote ? "cursor-pointer hover:text-secondary" : ""} ${mission.completed ? "text-muted-foreground line-through" : ""}`}
        >
          {mission.label}
        </span>
      )}
      {(mission.path || canQuickStart || canQuickAddNote) && !mission.completed && (
        <ChevronRight className="w-3.5 h-3.5 text-muted-foreground ml-auto shrink-0" aria-hidden />
      )}
    </span>
  );

  if (canQuickStart) {
    return (
      <button
        type="button"
        onClick={onStartFasting}
        className="block w-full text-left py-2 px-3 rounded-lg hover:bg-muted/50 transition-colors"
        aria-label="Mark that you have started fasting today"
      >
        {content}
      </button>
    );
  }

  if (canQuickAddNote) {
    return (
      <button
        type="button"
        onClick={onQuickAddNote}
        className="block w-full text-left py-2 px-3 rounded-lg hover:bg-muted/50 transition-colors"
        aria-label="Add a note for today"
      >
        {content}
      </button>
    );
  }

  if (mission.path && !mission.completed) {
    return (
      <Link
        to={mission.path}
        className="block py-2 px-3 rounded-lg hover:bg-muted/50 transition-colors"
      >
        {content}
      </Link>
    );
  }

  return (
    <div className="py-2 px-3 rounded-lg">
      {content}
    </div>
  );
});

export const DailyMissionsCard = memo(function DailyMissionsCard() {
  const [preferences] = useUserPreferences();
  const [progress, setProgress] = useFastingProgress();
  const [scheduleNotes, setScheduleNotes] = useLocalStorage<Record<string, string>>(SCHEDULE_NOTES_KEY, {});
  const displayTimezone = useDisplayTimezone();
  const { missions, completedCount, totalCount } = useDailyMissions();
  const todayStr = displayTimezone ? getTodayStringInTimezone(displayTimezone) : getTodayDateString();

  const [noteDialogOpen, setNoteDialogOpen] = useState(false);
  const [noteDraft, setNoteDraft] = useState("");

  const handleStartFasting = () => {
    startFastingToday(progress, setProgress, todayStr);
  };

  const handleOpenNoteDialog = useCallback(() => {
    setNoteDraft(scheduleNotes[todayStr] ?? "");
    setNoteDialogOpen(true);
  }, [scheduleNotes, todayStr]);

  const handleSaveNote = useCallback(() => {
    const trimmed = noteDraft.trim();
    setScheduleNotes((prev) => {
      const next = { ...prev };
      if (trimmed) next[todayStr] = trimmed;
      else delete next[todayStr];
      return next;
    });
    setNoteDialogOpen(false);
    toast.success(trimmed ? "Note saved" : "Note cleared");
  }, [todayStr, noteDraft, setScheduleNotes]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.14 }}
      className="p-4 rounded-2xl bg-card border border-border w-full min-w-0"
    >
      <div className="flex items-center justify-between mb-3">
        <Tooltip>
          <TooltipTrigger asChild>
            <h3 className="font-display font-bold flex items-center gap-2 cursor-help w-fit border-b border-dotted border-transparent hover:border-muted-foreground/40">
              <Target className="w-5 h-5 text-secondary" />
              Today&apos;s progress
            </h3>
          </TooltipTrigger>
          <TooltipContent>
            <p className="text-sm text-foreground">{GENERAL_TOOLTIPS.todayMissions.body}</p>
            <p className="text-xs text-muted-foreground mt-2 pt-2 border-t border-border/50">Arabic: <span className="font-arabic" dir="rtl">{GENERAL_TOOLTIPS.todayMissions.bodyAr}</span></p>
          </TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <span className="text-sm font-medium text-secondary tabular-nums" aria-label={`${completedCount} of ${totalCount} items done today`}>
              {completedCount}/{totalCount}
            </span>
          </TooltipTrigger>
          <TooltipContent>
            <p className="font-medium">Daily progress</p>
            <p className="text-xs mt-1">Mark fasting, log meals, add a note, read a hadith, and complete or break your fast.</p>
          </TooltipContent>
        </Tooltip>
      </div>
      <p className="text-xs text-muted-foreground mb-3">
        Mark whether you&apos;re fasting, log meals, and complete the day. Tap an item to open the right page or tap &quot;Start fasting&quot; to log that you&apos;ve started.
      </p>
      <ul className="space-y-0.5">
        {missions.map((m) => (
          <li key={m.id}>
            <MissionRow
              mission={m}
              userType={preferences?.userType}
              onStartFasting={m.id === "start_fasting" ? handleStartFasting : undefined}
              onQuickAddNote={m.id === "add_note" ? handleOpenNoteDialog : undefined}
            />
          </li>
        ))}
      </ul>

      <Dialog open={noteDialogOpen} onOpenChange={setNoteDialogOpen}>
        <DialogContent className="max-w-md" aria-describedby="add-note-desc">
          <DialogTitle className="flex items-center gap-2">
            <PenLine className="w-5 h-5 text-secondary shrink-0" aria-hidden />
            Add a note for today
          </DialogTitle>
          <p id="add-note-desc" className="text-sm text-muted-foreground sr-only">
            Optional note for today—e.g. how you felt or what you ate. Saved to your schedule.
          </p>
          <div className="space-y-2 pt-2">
            <Label htmlFor="daily-note-textarea">Note</Label>
            <Textarea
              id="daily-note-textarea"
              value={noteDraft}
              onChange={(e) => setNoteDraft(e.target.value)}
              placeholder="e.g. Felt good today, light suhoor…"
              rows={4}
              className="resize-y min-h-[100px]"
              aria-describedby="add-note-desc"
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => setNoteDialogOpen(false)}>
              Cancel
            </Button>
            <Button type="button" onClick={handleSaveNote}>
              Save note
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
});
