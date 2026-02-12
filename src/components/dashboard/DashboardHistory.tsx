import { motion } from "framer-motion";
import { Calendar, ChevronLeft, ChevronRight, ChevronDown, ChevronUp, Target } from "lucide-react";
import { Link } from "react-router-dom";
import { type FastingProgress } from "@/hooks/useLocalStorage";
import { toLocalDateString } from "@/lib/utils";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { useState } from "react";

interface DashboardHistoryProps {
  selectedDate: string;
  setSelectedDate: (date: string) => void;
  progress: FastingProgress;
  todayStr: string;
}

export const DashboardHistory = ({
  selectedDate,
  setSelectedDate,
  progress,
  todayStr,
}: DashboardHistoryProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const selectedDateObj = new Date(selectedDate + "T12:00:00");
  const isSelectedToday = selectedDate === todayStr;

  const goPrevDay = () => {
    const d = new Date(selectedDate + "T12:00:00");
    d.setDate(d.getDate() - 1);
    setSelectedDate(toLocalDateString(d));
  };

  const goNextDay = () => {
    const d = new Date(selectedDate + "T12:00:00");
    d.setDate(d.getDate() + 1);
    setSelectedDate(toLocalDateString(d));
  };

  const goToToday = () => setSelectedDate(todayStr);

  const jumpToDaysAgo = (daysAgo: number) => {
    const d = new Date(todayStr + "T12:00:00");
    d.setDate(d.getDate() - daysAgo);
    setSelectedDate(toLocalDateString(d));
    setIsOpen(true);
  };

  // Recent fasting log (last 7 entries)
  const recentLog = (progress.fastingLog || []).slice(-7).reverse();

  // Helper to get broken reason label
  const getBrokenReasonLabel = (reasonId: string) => {
    const reasons: Record<string, string> = {
      illness: "Illness",
      travel: "Travel",
      menstruation: "Menstruation",
      pregnancy: "Pregnancy",
      "intentional-food": "Intentional",
      "unintentional-food": "Unintentional",
      other: "Other",
    };
    return reasons[reasonId] || reasonId;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.4 }}
    >
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <div className="p-4 rounded-2xl bg-card border border-border">
          {/* Header with Toggle */}
          <CollapsibleTrigger asChild>
            <button className="w-full flex items-center justify-between mb-3">
              <h3 className="font-semibold text-lg flex items-center gap-2">
                <Calendar className="w-5 h-5 text-primary" />
                View Past Days
              </h3>
              {isOpen ? (
                <ChevronUp className="w-5 h-5 text-muted-foreground" />
              ) : (
                <ChevronDown className="w-5 h-5 text-muted-foreground" />
              )}
            </button>
          </CollapsibleTrigger>

          {/* Quick Jump Buttons (Always Visible) */}
          {!isOpen && (
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => jumpToDaysAgo(1)}
                className="px-3 py-1.5 rounded-lg bg-muted/50 hover:bg-muted text-sm font-medium transition-colors"
              >
                Yesterday
              </button>
              <button
                onClick={() => jumpToDaysAgo(3)}
                className="px-3 py-1.5 rounded-lg bg-muted/50 hover:bg-muted text-sm font-medium transition-colors"
              >
                3 Days Ago
              </button>
              <button
                onClick={() => jumpToDaysAgo(7)}
                className="px-3 py-1.5 rounded-lg bg-muted/50 hover:bg-muted text-sm font-medium transition-colors"
              >
                Week Ago
              </button>
            </div>
          )}

          {/* Expanded Content */}
          <CollapsibleContent>
            {/* Date Navigation */}
            <div className="flex items-center gap-2 mb-4 mt-4 p-3 rounded-xl bg-muted/30">
              <button
                onClick={goPrevDay}
                className="p-2 rounded-lg hover:bg-muted transition-colors"
                aria-label="Previous day"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>

              <div className="flex-1 text-center">
                <p className="font-semibold">
                  {selectedDateObj.toLocaleDateString("en", {
                    weekday: "short",
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </p>
                {isSelectedToday && (
                  <span className="text-xs text-secondary">Today</span>
                )}
              </div>

              <button
                onClick={goNextDay}
                className="p-2 rounded-lg hover:bg-muted transition-colors"
                aria-label="Next day"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>

            {!isSelectedToday && (
              <button
                onClick={goToToday}
                className="w-full mb-4 px-4 py-2 rounded-lg bg-primary/20 text-primary hover:bg-primary/30 transition-colors font-medium"
              >
                Jump to Today
              </button>
            )}

            {/* Selected Day Info */}
            <div className="mb-4 p-4 rounded-xl bg-muted/30 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Fast Status:</span>
                <span className="font-semibold">
                  {progress.completedDays.includes(selectedDate) ? (
                    <span className="text-secondary">✓ Completed</span>
                  ) : progress.skippedDays?.includes(selectedDate) ? (
                    <span className="text-muted-foreground">⊘ Skipped</span>
                  ) : (progress.fastingLog ?? []).some(
                      (e) => e.date === selectedDate && e.status === "broken"
                    ) ? (
                    <span className="text-destructive">✗ Broke Fast</span>
                  ) : (
                    <span className="text-muted-foreground">Not logged</span>
                  )}
                </span>
              </div>

              <div className="text-sm text-center pt-2 border-t border-border">
                <Link
                  to={`/dashboard/schedule?date=${selectedDate}`}
                  className="text-primary hover:underline"
                >
                  View Full Day Details →
                </Link>
              </div>
            </div>

            {/* Recent Fasting Log */}
            {recentLog.length > 0 && (
              <div className="mt-4">
                <h4 className="font-semibold mb-3 flex items-center gap-2 text-sm">
                  <Target className="w-4 h-4 text-secondary" />
                  Recent Fasting Log
                </h4>
                <ul className="space-y-2 text-sm">
                  {recentLog.map((entry) => (
                    <li
                      key={entry.date}
                      className="flex items-center justify-between py-2 px-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
                    >
                      <span className="font-medium">{entry.date}</span>
                      <span
                        className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                          entry.status === "completed"
                            ? "bg-secondary/20 text-secondary"
                            : entry.status === "broken"
                            ? "bg-destructive/20 text-destructive"
                            : "bg-primary/20 text-foreground"
                        }`}
                      >
                        {entry.status === "completed"
                          ? "✓ Complete"
                          : entry.status === "broken"
                          ? entry.brokenReason
                            ? `✗ ${getBrokenReasonLabel(entry.brokenReason)}`
                            : "✗ Broken"
                          : "🔵 In Progress"}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="mt-4 text-center">
              <Link
                to="/dashboard/schedule"
                className="text-sm text-primary hover:underline"
              >
                View Full Calendar →
              </Link>
            </div>
          </CollapsibleContent>
        </div>
      </Collapsible>
    </motion.div>
  );
};
