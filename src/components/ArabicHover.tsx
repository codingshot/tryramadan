import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

interface ArabicHoverProps {
  /** English text shown by default */
  children: React.ReactNode;
  /** Arabic translation shown only on hover */
  arabic: string;
  /** Optional transliteration */
  transliteration?: string;
  /** Optional hint text (e.g. "Translation") */
  hint?: string;
  className?: string;
}

/**
 * Shows English text by default; Arabic translation appears only in a tooltip on hover.
 * Use for page titles, labels, and inline terms where Arabic should not clutter the UI.
 */
export const ArabicHover = ({
  children,
  arabic,
  transliteration,
  hint = "Translation",
  className = "",
}: ArabicHoverProps) => {
  return (
    <Tooltip delayDuration={300}>
      <TooltipTrigger asChild>
        <span
          role="button"
          tabIndex={0}
          className={cn(
            "cursor-help border-b border-dotted border-muted-foreground/40 hover:border-secondary/60 focus:outline-none focus-visible:ring-2 focus-visible:ring-secondary focus-visible:ring-offset-2 rounded-sm transition-colors py-0.5",
            className
          )}
          title={arabic}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              (e.currentTarget as HTMLElement).click();
            }
          }}
        >
          {children}
        </span>
      </TooltipTrigger>
      <TooltipContent
        side="top"
        className="max-w-xs bg-card border-border shadow-elevated p-3 rounded-xl"
      >
        <div className="space-y-1">
          <p className="text-xs text-muted-foreground uppercase tracking-wide">{hint}</p>
          <p className="font-arabic text-lg text-secondary">{arabic}</p>
          {transliteration && (
            <p className="text-sm text-muted-foreground italic">/{transliteration}/</p>
          )}
        </div>
      </TooltipContent>
    </Tooltip>
  );
};
