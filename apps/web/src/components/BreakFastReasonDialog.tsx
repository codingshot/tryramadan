import { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { Landmark, Utensils, BookOpen, ExternalLink, Heart } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { BROKEN_FAST_REASONS } from "@/hooks/useLocalStorage";
import { cn } from "@/lib/utils";

/** Preset "broke X minutes ago" options. Value = minutes ago. */
const BROKE_AGO_MINUTES = [15, 30, 45, 60, 90, 120] as const;

/** LaunchGood campaigns for feeding people — rotate randomly when showing "Feed someone" CTA. */
const LAUNCHGOOD_FEED_LINKS = [
  "https://www.launchgood.com/v4/campaign/ramadan_for_sudan_provide_food_and_medical_relief_to_displaced_families",
  "https://www.launchgood.com/v4/campaign/feed_sudan_emergency_meals_today",
] as const;

interface BreakFastReasonDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** reasonId and optional ISO datetime when they broke (omit for "just now"). */
  onSelectReason: (reasonId: string, brokeAt?: string) => void;
  /** Optional title override */
  title?: string;
  /** When non-Muslim (new), show tooltip on Travel reason (COPY-AUDIT) */
  userType?: "muslim" | "new" | null;
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
  const feedSomeoneUrl = useMemo(
    () => LAUNCHGOOD_FEED_LINKS[Math.floor(Math.random() * LAUNCHGOOD_FEED_LINKS.length)],
    [open]
  );

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
      <DialogContent className="sm:max-w-md" aria-describedby="break-fast-reason-desc">
        <DialogHeader>
          <DialogTitle className="font-display">{title}</DialogTitle>
          <DialogDescription id="break-fast-reason-desc">
            Choose a reason so we can track how long you fasted. No judgment — your intention matters.
          </DialogDescription>
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

        {/* Making up the fast + verse 2:184 + Feed someone CTA */}
        <div className="mt-4 pt-4 border-t border-border space-y-4">
          <div>
            <p className="text-sm font-medium text-foreground mb-1">Making up the fast</p>
            <p className="text-xs text-muted-foreground">
              Make up missed days after Ramadan (any time before the next Ramadan). For those who find fasting extremely difficult—such as the very elderly or chronically ill who cannot make up the fasts—Allah has provided a ransom.
            </p>
          </div>
          <blockquote className="text-xs text-foreground pl-3 border-l-2 border-secondary/50 italic bg-secondary/5 py-2 pr-2 rounded-r">
            &ldquo;...and for those who can fast only with great difficulty, there is a ransom: feeding a poor person (for each day). But to fast is better for you, if you only knew.&rdquo;
            <cite className="block not-italic text-muted-foreground mt-1">— Quran, Surah al-Baqarah 2:184</cite>
          </blockquote>
          <a
            href={feedSomeoneUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 min-h-[40px] px-4 py-2 rounded-xl bg-primary text-primary-foreground font-medium text-sm hover:bg-primary/90 transition-colors"
            aria-label="Feed someone (opens LaunchGood in new tab)"
          >
            <Heart className="w-4 h-4 shrink-0" aria-hidden />
            Feed someone
            <ExternalLink className="w-3.5 h-3.5 shrink-0 opacity-80" aria-hidden />
          </a>
          <p className="text-xs text-muted-foreground">
            Need medical resources?{" "}
            <Link to="/health-safety" className="text-secondary hover:underline">
              Health & Safety →
            </Link>
          </p>
        </div>
        {userType === "muslim" && (
          <div className="mt-3 p-3 rounded-xl bg-secondary/10 border border-secondary/20 space-y-2">
            <p className="text-xs font-medium text-foreground flex items-center gap-2">
              <Landmark className="w-4 h-4 text-secondary shrink-0" aria-hidden />
              After breaking: pray Maghrib, then log your meal and journal
            </p>
            <div className="flex flex-wrap gap-2">
              <Link
                to="/dashboard/schedule"
                className="inline-flex items-center gap-1.5 text-xs font-medium text-secondary hover:underline"
              >
                <Utensils className="w-3.5 h-3.5" aria-hidden />
                Log food
              </Link>
              <Link
                to="/dashboard/journal"
                className="inline-flex items-center gap-1.5 text-xs font-medium text-secondary hover:underline"
              >
                <BookOpen className="w-3.5 h-3.5" aria-hidden />
                Journal
              </Link>
            </div>
          </div>
        )}
        <ul className="space-y-2 mt-2">
          {BROKEN_FAST_REASONS.map(({ id, label }) => {
            const isTravelNewUser = id === "travel" && userType === "new";
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
                {isTravelNewUser ? (
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
