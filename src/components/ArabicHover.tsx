import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

interface ArabicHoverProps {
  /** English text shown by default */
  children: React.ReactNode;
  /** Arabic form shown only in tooltip (next to English on hover) */
  arabic: string;
  /** Optional short explanation of the English term */
  explanation?: string;
  /** Optional transliteration */
  transliteration?: string;
  /** Optional hint text (e.g. "Arabic") */
  hint?: string;
  className?: string;
}

/**
 * Shows English only by default; on hover shows Arabic next to English with explanation.
 * Use for page titles, labels, and terms—Arabic appears only on hover with context.
 */
export const ArabicHover = ({
  children,
  arabic,
  explanation,
  transliteration,
  hint = "Arabic",
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
        <div className="space-y-1.5">
          <p className="font-arabic text-lg text-secondary" dir="rtl">{arabic}</p>
          {transliteration && (
            <p className="text-sm text-muted-foreground italic">/{transliteration}/</p>
          )}
          {explanation && (
            <>
              <p className="text-xs text-muted-foreground uppercase tracking-wide">{hint}</p>
              <p className="text-sm text-foreground leading-relaxed">{explanation}</p>
            </>
          )}
        </div>
      </TooltipContent>
    </Tooltip>
  );
};
