import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { EXTERNAL_LINKS } from "@/lib/config";

type HadithSunnahLinkProps = {
  /** Hadith source text (e.g. "Sahih al-Bukhari 1899") for search */
  source: string;
  /** Link content */
  children: React.ReactNode;
  /** Optional class for the link */
  className?: string;
};

/**
 * Link to Sunnah.com search for a hadith source, with tooltip explaining it.
 */
export function HadithSunnahLink({ source, children, className = "" }: HadithSunnahLinkProps) {
  const searchUrl = `${EXTERNAL_LINKS.sunnah}/search?q=${encodeURIComponent(source)}`;

  return (
    <Tooltip delayDuration={200}>
      <TooltipTrigger asChild>
        <a
          href={searchUrl}
          target="_blank"
          rel="noopener noreferrer"
          className={`text-secondary hover:underline focus:outline-none focus:ring-2 focus:ring-secondary rounded ${className}`}
        >
          {children}
        </a>
      </TooltipTrigger>
      <TooltipContent side="top" className="max-w-xs">
        <p>View this hadith in full context on Sunnah.com</p>
      </TooltipContent>
    </Tooltip>
  );
}
