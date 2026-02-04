import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Target, ChevronRight, Check, Circle, Moon, CalendarPlus, MapPin, ChevronDown, ChevronUp, Loader2 } from "lucide-react";
import { useGoalsUntilRamadan, useUserPreferences } from "@/hooks/useLocalStorage";
import { getDaysUntilRamadan, isCurrentlyRamadan, getRamadanDateRange } from "@/lib/ramadan";
import { useRamadanPrayerTimes } from "@/hooks/usePrayerTimes";
import { buildIcalContent, downloadIcal } from "@/lib/ical";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { GENERAL_TOOLTIPS } from "@/data/general-tooltips";
import { Button } from "@/components/ui/button";
import { LocationRequiredCTA } from "@/components/LocationRequiredCTA";

export function GoalsUntilRamadanCard() {
  const [goals, setGoals] = useGoalsUntilRamadan();
  const [preferences] = useUserPreferences();
  const [showExplanation, setShowExplanation] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [exportMode, setExportMode] = useState<"fasting" | "full">("full");
  const daysUntil = getDaysUntilRamadan();
  const inRamadan = isCurrentlyRamadan();
  const completedCount = goals.filter((g) => g.completed).length;
  const displayGoals = goals.slice(0, 4);
  const coords = preferences.locationCoords;
  const lat = coords?.lat ?? null;
  const lng = coords?.lng ?? null;
  const { prayerTimesMap, loading: prayersLoading, error: prayersError, refetch } = useRamadanPrayerTimes(lat, lng);
  const ramadanRange = getRamadanDateRange(preferences);
  const hasLocation = lat != null && lng != null;
  const hasPrayerData = Object.keys(prayerTimesMap).length > 0;

  const handleAddToCalendar = async () => {
    if (!hasLocation || !hasPrayerData) return;
    setExporting(true);
    try {
      const ics = buildIcalContent({
        prayerTimesMap,
        customEvents: {},
        dateRange: [ramadanRange.startStr, ramadanRange.endStr],
        includeTaraweeh: exportMode === "full",
        includePrayers: true,
        timezone: preferences.timezone ?? undefined,
        exportMode,
      });
      downloadIcal(ics, `ramadan-${ramadanRange.startStr}-to-${ramadanRange.endStr}.ics`);
    } finally {
      setExporting(false);
    }
  };

  const toggleGoal = (id: string) => {
    setGoals((prev) =>
      prev.map((g) => (g.id === id ? { ...g, completed: !g.completed } : g))
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="p-6 rounded-2xl bg-card border border-border"
    >
      <div className="flex items-center justify-between mb-4">
        <Tooltip>
          <TooltipTrigger asChild>
            <h3 className="font-display font-bold flex items-center gap-2 cursor-help border-b border-dotted border-transparent hover:border-muted-foreground/40 w-fit">
              <Target className="w-5 h-5 text-secondary" />
              Goals until Ramadan
            </h3>
          </TooltipTrigger>
          <TooltipContent className="max-w-xs p-3">
            <p className="text-sm text-foreground">{GENERAL_TOOLTIPS.goalsUntilRamadan.body}</p>
            <p className="text-xs text-muted-foreground mt-2 pt-2 border-t border-border/50">Arabic: <span className="font-arabic" dir="rtl">{GENERAL_TOOLTIPS.goalsUntilRamadan.bodyAr}</span></p>
          </TooltipContent>
        </Tooltip>
        <Link
          to="/dashboard/goals"
          className="text-sm text-secondary hover:underline flex items-center gap-1"
        >
          Manage goals <ChevronRight className="w-4 h-4" />
        </Link>
      </div>
      {inRamadan ? (
        <>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex items-center gap-2 p-3 rounded-xl bg-secondary/10 border border-secondary/20 mb-3 cursor-help">
                <Moon className="w-5 h-5 text-secondary" />
                <span className="font-medium text-secondary border-b border-dotted border-secondary/40">Ramadan Mubarak!</span>
              </div>
            </TooltipTrigger>
            <TooltipContent className="max-w-xs p-3">
              <p className="text-sm text-foreground">{GENERAL_TOOLTIPS.ramadanMubarak.body}</p>
              <p className="text-xs text-muted-foreground mt-2 pt-2 border-t border-border/50">Arabic: <span className="font-arabic" dir="rtl">{GENERAL_TOOLTIPS.ramadanMubarak.bodyAr}</span></p>
            </TooltipContent>
          </Tooltip>
          <button
            type="button"
            onClick={() => setShowExplanation(!showExplanation)}
            className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground mb-3"
          >
            {showExplanation ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            {showExplanation ? "Hide" : "Add Ramadan times to calendar"}
          </button>
          {showExplanation && (
            <div className="mb-4 p-3 rounded-xl bg-muted/50 border border-border text-sm space-y-2">
              {hasLocation ? (
                <>
                  <p className="text-muted-foreground">
                    Add Ramadan times for your location to Google Calendar, Apple Calendar, or Outlook.
                  </p>
                  <div className="flex flex-wrap gap-2 mb-3">
                    <button
                      type="button"
                      onClick={() => setExportMode("fasting")}
                      className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${exportMode === "fasting" ? "bg-secondary text-secondary-foreground" : "bg-muted hover:bg-muted/80"}`}
                    >
                      Fasting only (Suhoor + Iftar)
                    </button>
                    <button
                      type="button"
                      onClick={() => setExportMode("full")}
                      className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${exportMode === "full" ? "bg-secondary text-secondary-foreground" : "bg-muted hover:bg-muted/80"}`}
                    >
                      Full prayers
                    </button>
                  </div>
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={handleAddToCalendar}
                    disabled={!hasPrayerData || exporting}
                    className="w-full sm:w-auto"
                  >
                    {exporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <CalendarPlus className="w-4 h-4" />}
                    <span className="ml-2">{exporting ? "Preparing…" : "Add Ramadan to calendar"}</span>
                  </Button>
                  {prayersLoading && !hasPrayerData && (
                    <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                      <Loader2 className="w-3.5 h-3.5 animate-spin" /> Loading prayer times…
                    </p>
                  )}
                  {prayersError && (
                    <p className="text-xs text-destructive">Could not load prayer times. <button type="button" onClick={() => refetch()} className="underline">Try again</button></p>
                  )}
                </>
              ) : (
                <LocationRequiredCTA
                  compact
                  message="Set your location in Settings to add Ramadan times to your calendar."
                />
              )}
            </div>
          )}
        </>
      ) : daysUntil > 0 ? (
        <>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex items-center gap-2 p-3 rounded-xl bg-secondary/10 border border-secondary/20 mb-3 cursor-help">
                <span className="text-2xl font-bold text-secondary">{daysUntil}</span>
                <span className="text-sm text-muted-foreground border-b border-dotted border-muted-foreground/40">days until Ramadan</span>
              </div>
            </TooltipTrigger>
            <TooltipContent className="max-w-xs p-3">
              <p className="text-sm text-foreground">{GENERAL_TOOLTIPS.ramadan.body}</p>
              <p className="text-xs text-muted-foreground mt-2 pt-2 border-t border-border/50">Arabic: <span className="font-arabic" dir="rtl">{GENERAL_TOOLTIPS.ramadan.bodyAr}</span></p>
            </TooltipContent>
          </Tooltip>
          <button
            type="button"
            onClick={() => setShowExplanation(!showExplanation)}
            className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground mb-3"
          >
            {showExplanation ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            {showExplanation ? "Hide details" : "What does this mean? Add to calendar"}
          </button>
          {showExplanation && (
            <div className="mb-4 p-3 rounded-xl bg-muted/50 border border-border text-sm space-y-2">
              <p className="text-muted-foreground">
                Ramadan is the ninth month of the Islamic (lunar) calendar. The countdown is based on the <strong>approximate</strong> start date for your region. The actual start is confirmed by moon sighting and can vary by a day.
              </p>
              <p className="text-muted-foreground">
                <strong>Expected start:</strong> {ramadanRange.startDate.toLocaleDateString("en", { weekday: "long", month: "long", day: "numeric", year: "numeric" })} — <strong>End:</strong> {ramadanRange.endDate.toLocaleDateString("en", { weekday: "long", month: "long", day: "numeric", year: "numeric" })}.
              </p>
              {hasLocation ? (
                <>
                  <p className="text-muted-foreground">
                    Prayer times for this Ramadan are calculated for your selected location. Add them to your calendar.
                  </p>
                  <div className="flex flex-wrap gap-2 mb-3">
                    <button
                      type="button"
                      onClick={() => setExportMode("fasting")}
                      className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${exportMode === "fasting" ? "bg-secondary text-secondary-foreground" : "bg-muted hover:bg-muted/80"}`}
                    >
                      Fasting only (Suhoor + Iftar)
                    </button>
                    <button
                      type="button"
                      onClick={() => setExportMode("full")}
                      className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${exportMode === "full" ? "bg-secondary text-secondary-foreground" : "bg-muted hover:bg-muted/80"}`}
                    >
                      Full prayers
                    </button>
                  </div>
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={handleAddToCalendar}
                    disabled={!hasPrayerData || exporting}
                    className="w-full sm:w-auto"
                  >
                    {exporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <CalendarPlus className="w-4 h-4" />}
                    <span className="ml-2">{exporting ? "Preparing…" : "Add Ramadan to calendar"}</span>
                  </Button>
                  {prayersLoading && !hasPrayerData && (
                    <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                      <Loader2 className="w-3.5 h-3.5 animate-spin" /> Loading prayer times for your location…
                    </p>
                  )}
                  {prayersError && (
                    <p className="text-xs text-destructive">Could not load prayer times. <button type="button" onClick={() => refetch()} className="underline">Try again</button></p>
                  )}
                </>
              ) : (
                <LocationRequiredCTA
                  compact
                  message="Set your location in Settings to add Ramadan fasting and iftar times (Suhoor end & Maghrib) for your region to your calendar."
                />
              )}
            </div>
          )}
        </>
      ) : null}
      {goals.length === 0 ? (
        <>
          <p className="text-sm text-muted-foreground mb-2">
            Optional: set a few intentions. Before or during Ramadan, you can add goals like reading Quran or giving charity — or skip and just track your fasts.
          </p>
          <Link
            to="/dashboard/goals"
            className="inline-flex items-center gap-2 py-2 px-4 rounded-xl bg-secondary/20 text-secondary font-medium text-sm hover:bg-secondary/30"
          >
            <Target className="w-4 h-4" />
            Add or edit goals
          </Link>
        </>
      ) : (
        <ul className="space-y-2">
          {displayGoals.map((goal) => (
            <li
              key={goal.id}
              className="flex items-center gap-3 py-1.5"
            >
              <button
                type="button"
                onClick={() => toggleGoal(goal.id)}
                className="flex-shrink-0 rounded-full p-0.5 hover:bg-muted transition-colors"
                aria-label={goal.completed ? "Mark incomplete" : "Mark complete"}
              >
                {goal.completed ? (
                  <Check className="w-5 h-5 text-secondary" />
                ) : (
                  <Circle className="w-5 h-5 text-muted-foreground" />
                )}
              </button>
              <span
                className={`text-sm flex-1 ${
                  goal.completed ? "line-through text-muted-foreground" : ""
                }`}
              >
                {goal.title}
              </span>
            </li>
          ))}
        </ul>
      )}
      {goals.length > 0 && (
        <p className="text-xs text-muted-foreground mt-3">
          {completedCount} / {goals.length} completed
        </p>
      )}
    </motion.div>
  );
}
