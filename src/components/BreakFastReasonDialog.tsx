import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { BROKEN_FAST_REASONS } from "@/hooks/useLocalStorage";
import { cn } from "@/lib/utils";

/** Preset "broke X minutes ago" options. Value = minutes ago. */
const BROKE_AGO_MINUTES = [15, 30, 45, 60, 90, 120] as const;

interface BreakFastReasonDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** reasonId and optional ISO datetime when they broke (omit for "just now"). */
  onSelectReason: (reasonId: string, brokeAt?: string) => void;
  /** Optional title override */
  title?: string;
  /** When non-Muslim, show tooltip on Travel reason (COPY-AUDIT) */
  userType?: "muslim" | "non-muslim" | "new" | null;
  /** When true, show reminder that it's not fasting period and they're logging a break during the fasting window */
  notInFastingPeriod?: boolean;
}

const TRAVEL_TOOLTIP_NON_MUSLIM = "Travelers may be exempt from fasting; make up days later.";

function getBrokeAtFromMinutesAgo(minutesAgo: number): string {
  return new Date(Date.now() - minutesAgo * 60 * 1000).toISOString();
}

export function BreakFastReasonDialog({
  open,
  onOpenChange,
  onSelectReason,
  title = "Why did you break your fast?",
  userType,
  notInFastingPeriod,
}: BreakFastReasonDialogProps) {
  const [brokeWhen, setBrokeWhen] = useState<"now" | number>("now");

  useEffect(() => {
    if (open) setBrokeWhen("now");
  }, [open]);

  const handleSelectReason = (id: string) => {
    const brokeAt = brokeWhen === "now" ? undefined : getBrokeAtFromMinutesAgo(brokeWhen);
    onSelectReason(id, brokeAt);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display">{title}</DialogTitle>
        </DialogHeader>
        {notInFastingPeriod && (
          <p className="text-sm text-amber-700 dark:text-amber-400 bg-amber-500/10 border border-amber-500/30 rounded-lg px-3 py-2 -mt-2">
            It&apos;s not fasting period right now (eating window). You&apos;re logging that you broke your fast earlier, during the fasting window (before Maghrib). Choose a reason below.
          </p>
        )}

        <div className="space-y-2">
          <p className="text-sm font-medium text-foreground">When did you break your fast?</p>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setBrokeWhen("now")}
              className={cn(
                "min-h-[36px] px-3 py-1.5 rounded-lg border text-sm font-medium transition-colors",
                brokeWhen === "now"
                  ? "bg-secondary text-secondary-foreground border-secondary"
                  : "border-border hover:bg-muted/50"
              )}
            >
              Just now
            </button>
            {BROKE_AGO_MINUTES.map((m) => {
              const label = m < 60 ? `${m} min ago` : m === 60 ? "1 hour ago" : m === 90 ? "1h 30m ago" : m === 120 ? "2 hours ago" : `${Math.floor(m / 60)}h ago`;
              return (
                <button
                  key={m}
                  type="button"
                  onClick={() => setBrokeWhen(m)}
                  className={cn(
                    "min-h-[36px] px-3 py-1.5 rounded-lg border text-sm font-medium transition-colors",
                    brokeWhen === m
                      ? "bg-secondary text-secondary-foreground border-secondary"
                      : "border-border hover:bg-muted/50"
                  )}
                >
                  {label}
                </button>
              );
            })}
          </div>
        </div>

        <p className="text-sm text-muted-foreground">
          Choose a reason so we can track how long you fasted. No judgment — your intention matters.
        </p>
        <p className="text-xs text-muted-foreground">
          Need medical resources?{" "}
          <Link to="/health-safety" className="text-secondary hover:underline">
            Health & Safety →
          </Link>
        </p>
        <ul className="space-y-2 mt-2">
          {BROKEN_FAST_REASONS.map(({ id, label }) => {
            const isTravelNonMuslim = id === "travel" && userType === "non-muslim";
            const button = (
              <button
                type="button"
                onClick={() => handleSelectReason(id)}
                className={cn(
                  "w-full min-h-[44px] text-left py-3 px-4 rounded-xl border border-border",
                  "hover:bg-secondary/10 hover:border-secondary/40 active:bg-secondary/20 transition-colors",
                  "font-medium text-sm touch-manipulation"
                )}
                aria-label={`Reason: ${label}`}
              >
                {label}
              </button>
            );
            return (
              <li key={id}>
                {isTravelNonMuslim ? (
                  <Tooltip>
                    <TooltipTrigger asChild>{button}</TooltipTrigger>
                    <TooltipContent side="top" className="max-w-xs">
                      {TRAVEL_TOOLTIP_NON_MUSLIM}
                    </TooltipContent>
                  </Tooltip>
                ) : (
                  button
                )}
              </li>
            );
          })}
        </ul>
      </DialogContent>
    </Dialog>
  );
}
