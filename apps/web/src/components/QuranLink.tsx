import { useState, useCallback } from "react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { API_CONFIG, EXTERNAL_LINKS } from "@/lib/config";

type QuranLinkProps = {
  /** Chapter number 1–114; omit for main Quran link */
  chapterNumber?: number;
  /** Link text (e.g. "Quran", "Al-Fatiha") */
  children: React.ReactNode;
  className?: string;
};

export function QuranLink({ chapterNumber, children, className = "" }: QuranLinkProps) {
  const [hoverContent, setHoverContent] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const url = chapterNumber
    ? `${EXTERNAL_LINKS.quran}/${chapterNumber}`
    : EXTERNAL_LINKS.quran;

  const loadHoverContent = useCallback(async () => {
    if (hoverContent !== null) return;
    setLoading(true);
    try {
      if (chapterNumber) {
        const res = await fetch(`${API_CONFIG.quranApi}/chapters/${chapterNumber}`);
        const data = await res.json();
        const ch = data?.chapter;
        if (ch) {
          const name = ch.name_simple || ch.translated_name?.name || "Surah";
          const verses = ch.verses_count ?? 0;
          const arabic = ch.name_arabic ? ` • ${ch.name_arabic}` : "";
          setHoverContent(`${name} — ${verses} verses${arabic}. Read on Quran.com`);
        } else {
          setHoverContent("Read this surah on Quran.com");
        }
      } else {
        const res = await fetch(`${API_CONFIG.quranApi}/chapters`);
        const data = await res.json();
        const chapters = data?.chapters ?? [];
        const count = chapters.length;
        const first = chapters[0];
        const firstName = first?.name_simple ? ` (e.g. ${first.name_simple})` : "";
        setHoverContent(`The Quran — ${count} surahs${firstName}. Read on Quran.com`);
      }
    } catch {
      setHoverContent("Read on Quran.com");
    } finally {
      setLoading(false);
    }
  }, [chapterNumber, hoverContent]);

  const tooltipText = loading ? "Loading…" : (hoverContent ?? "Read on Quran.com");

  return (
    <Tooltip delayDuration={300}>
      <TooltipTrigger asChild>
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className={`text-secondary hover:underline focus:outline-none focus:ring-2 focus:ring-secondary rounded ${className}`}
          onMouseEnter={loadHoverContent}
          onFocus={loadHoverContent}
        >
          {children}
        </a>
      </TooltipTrigger>
      <TooltipContent side="top" className="max-w-xs">
        <p>{tooltipText}</p>
      </TooltipContent>
    </Tooltip>
  );
}
