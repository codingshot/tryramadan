import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

interface ArabicHoverProps {
  /** English text shown by default */
  children: React.ReactNode;
  /** Arabic form shown in tooltip (supplementary) */
  arabic: string;
  /** Explanation of what the term means – primary content in tooltip */
  explanation?: string;
  /** Optional transliteration */
  transliteration?: string;
  className?: string;
}

/**
 * Shows English by default; on hover shows explanation of the term first, then Arabic as supplementary.
 * Use for Islamic terms—tooltip explains what the word means, not just the Arabic translation.
 */
export const ArabicHover = ({
  children,
  arabic,
  explanation,
  transliteration,
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
        <div className="space-y-2">
          {explanation && (
            <p className="text-sm text-foreground leading-relaxed">{explanation}</p>
          )}
          <div className="pt-1 border-t border-border/50">
            <p className="text-xs text-muted-foreground mb-0.5">Arabic</p>
            <p className="font-arabic text-base text-secondary" dir="rtl">{arabic}</p>
            {transliteration && (
              <p className="text-xs text-muted-foreground italic mt-0.5">/{transliteration}/</p>
            )}
          </div>
        </div>
      </TooltipContent>
    </Tooltip>
  );
};
