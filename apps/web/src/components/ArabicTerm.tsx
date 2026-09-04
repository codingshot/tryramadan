import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

interface ArabicTermProps {
  term: string;
  arabic: string;
  transliteration?: string;
  definition: string;
  children?: React.ReactNode;
}

export const ArabicTerm = ({ term, arabic, transliteration, definition, children }: ArabicTermProps) => {
  return (
    <Tooltip delayDuration={300}>
      <TooltipTrigger asChild>
        <span
          role="button"
          tabIndex={0}
          className="term-tooltip cursor-help focus:outline-none focus-visible:ring-2 focus-visible:ring-secondary focus-visible:ring-offset-2 rounded-sm py-0.5"
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              (e.currentTarget as HTMLElement).click();
            }
          }}
        >
          {children || term}
        </span>
      </TooltipTrigger>
      <TooltipContent 
        side="top" 
        className="max-w-xs bg-card border-border shadow-elevated p-4 rounded-xl"
      >
        <div className="space-y-2">
          <p className="text-sm text-foreground leading-relaxed">{definition}</p>
          <div className="pt-2 border-t border-border/50">
            <p className="text-xs text-muted-foreground mb-0.5">Arabic</p>
            <div className="flex items-center justify-between gap-4">
              <span className="font-semibold text-foreground">{term}</span>
              <span className="font-arabic text-lg text-secondary" dir="rtl">{arabic}</span>
            </div>
            {transliteration && (
              <p className="text-xs text-muted-foreground italic mt-0.5">/{transliteration}/</p>
            )}
          </div>
        </div>
      </TooltipContent>
    </Tooltip>
  );
};
