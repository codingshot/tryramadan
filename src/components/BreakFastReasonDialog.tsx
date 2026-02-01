import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { BROKEN_FAST_REASONS } from "@/hooks/useLocalStorage";
import { cn } from "@/lib/utils";

interface BreakFastReasonDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelectReason: (reasonId: string) => void;
  /** Optional title override */
  title?: string;
}

export function BreakFastReasonDialog({
  open,
  onOpenChange,
  onSelectReason,
  title = "Why did you break your fast?",
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
        <ul className="space-y-1 mt-2">
          {BROKEN_FAST_REASONS.map(({ id, label }) => (
            <li key={id}>
              <button
                type="button"
                onClick={() => {
                  onSelectReason(id);
                  onOpenChange(false);
                }}
                className={cn(
                  "w-full text-left py-3 px-4 rounded-xl border border-border",
                  "hover:bg-secondary/10 hover:border-secondary/40 transition-colors",
                  "font-medium text-sm"
                )}
              >
                {label}
              </button>
            </li>
          ))}
        </ul>
      </DialogContent>
    </Dialog>
  );
}
