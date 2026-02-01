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
    <Tooltip delayDuration={200}>
      <TooltipTrigger asChild>
        <span className="term-tooltip cursor-help">
          {children || term}
        </span>
      </TooltipTrigger>
      <TooltipContent 
        side="top" 
        className="max-w-xs bg-card border-border shadow-elevated p-4 rounded-xl"
      >
        <div className="space-y-2">
          <div className="flex items-center justify-between gap-4">
            <span className="font-semibold text-foreground">{term}</span>
            <span className="font-arabic text-xl text-secondary">{arabic}</span>
          </div>
          {transliteration && (
            <p className="text-sm text-muted-foreground italic">/{transliteration}/</p>
          )}
          <p className="text-sm text-foreground leading-relaxed">{definition}</p>
        </div>
      </TooltipContent>
    </Tooltip>
  );
};
