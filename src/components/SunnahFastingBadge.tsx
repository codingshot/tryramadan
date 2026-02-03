import { motion } from 'framer-motion';
import { Star, Moon, ExternalLink } from 'lucide-react';
import { getSunnahFastingInfo } from '@/hooks/usePrayerTimes';
import { EXTERNAL_LINKS } from '@/lib/config';
import type { PrayerTimes } from '@/hooks/usePrayerTimes';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

interface SunnahFastingBadgeProps {
  hijriDay?: number;
  /** Today's prayer times for user's location — shown on hover */
  prayerTimes?: PrayerTimes | null;
  locationLabel?: string;
}

export const SunnahFastingBadge = ({ hijriDay, prayerTimes, locationLabel }: SunnahFastingBadgeProps) => {
  const sunnahInfo = getSunnahFastingInfo();
  
  // Check for Ayyam al-Beed (13th, 14th, 15th of lunar month)
  const isAyyamAlBeed = hijriDay && hijriDay >= 13 && hijriDay <= 15;

  const todayTimesNote = prayerTimes
    ? `Today${locationLabel ? ` (${locationLabel})` : ' (your location)'}: Suhoor end (Fajr) ${prayerTimes.fajr} · Iftar (Maghrib) ${prayerTimes.maghrib}`
    : "Set your location in settings for today's prayer times.";

  if (!sunnahInfo && !isAyyamAlBeed) {
    return null;
  }

  const wrapWithTooltip = (node: React.ReactNode) => (
    <Tooltip>
      <TooltipTrigger asChild>{node}</TooltipTrigger>
      <TooltipContent className="max-w-xs p-3" side="top">
        <p className="text-xs font-medium">Today&apos;s fasting times</p>
        <p className="text-xs text-muted-foreground mt-1">{todayTimesNote}</p>
      </TooltipContent>
    </Tooltip>
  );

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-wrap items-center justify-center gap-2"
    >
      {sunnahInfo && wrapWithTooltip(
        <a
          href={`${EXTERNAL_LINKS.sunnah}/search?q=${encodeURIComponent("Sahih Muslim 1162 Monday Thursday fasting")}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary/20 border-2 border-secondary/40 ring-2 ring-secondary/30 cursor-pointer hover:bg-secondary/30 hover:border-secondary/60 transition-colors"
          title="View hadith on Sunnah.com: Deeds are presented to Allah on Mondays and Thursdays, so the Prophet (ﷺ) loved to fast on these days."
        >
          <Star className="w-4 h-4 text-secondary fill-secondary shrink-0" />
          <div className="text-sm">
            <span className="font-semibold text-secondary">Today · {sunnahInfo.reason}</span>
          </div>
          <ExternalLink className="w-3.5 h-3.5 text-secondary/70 shrink-0" />
        </a>
      )}

      {isAyyamAlBeed && wrapWithTooltip(
        <a
          href={`${EXTERNAL_LINKS.sunnah}/search?q=${encodeURIComponent("Sahih al-Bukhari 1981 Ayyam al-Beed white days fasting")}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/20 border border-primary/30 cursor-pointer hover:bg-primary/30 hover:border-primary/50 transition-colors"
          title="View hadith on Sunnah.com: Fasting three days of each month (the white days—13th, 14th, 15th) is equivalent to fasting the whole year."
        >
          <Moon className="w-4 h-4 text-foreground" aria-hidden />
          <div className="text-sm">
            <span className="font-semibold text-foreground">Ayyam al-Beed</span>
            <span className="text-muted-foreground ml-2">(Day {hijriDay} of lunar month)</span>
          </div>
          <ExternalLink className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
        </a>
      )}

      {(sunnahInfo || isAyyamAlBeed) && (
        <p className="w-full text-center text-xs text-muted-foreground mt-1">
          💡 Today is a recommended day to fast in Islamic tradition
        </p>
      )}
    </motion.div>
  );
};
