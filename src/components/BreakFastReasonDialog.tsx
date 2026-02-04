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

interface BreakFastReasonDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelectReason: (reasonId: string) => void;
  /** Optional title override */
  title?: string;
  /** When non-Muslim, show tooltip on Travel reason (COPY-AUDIT) */
  userType?: "muslim" | "non-muslim";
}

const TRAVEL_TOOLTIP_NON_MUSLIM = "Travelers may be exempt from fasting; make up days later.";

export function BreakFastReasonDialog({
  open,
  onOpenChange,
  onSelectReason,
  title = "Why did you break your fast?",
  userType,
}: BreakFastReasonDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display">{title}</DialogTitle>
        </DialogHeader>
        <p className="text-sm text-muted-foreground -mt-2">
          Choose a reason so you can track it. No judgment — your intention matters.
        </p>
        <p className="text-xs text-muted-foreground mt-2">
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
                onClick={() => {
                  onSelectReason(id);
                  onOpenChange(false);
                }}
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
