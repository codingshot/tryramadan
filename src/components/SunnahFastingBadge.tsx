import { motion } from 'framer-motion';
import { Star, Moon, Calendar } from 'lucide-react';
import { getSunnahFastingInfo } from '@/hooks/usePrayerTimes';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { GENERAL_TOOLTIPS } from '@/data/general-tooltips';

interface SunnahFastingBadgeProps {
  hijriDay?: number;
}

export const SunnahFastingBadge = ({ hijriDay }: SunnahFastingBadgeProps) => {
  const sunnahInfo = getSunnahFastingInfo();
  
  // Check for Ayyam al-Beed (13th, 14th, 15th of lunar month)
  const isAyyamAlBeed = hijriDay && hijriDay >= 13 && hijriDay <= 15;

  if (!sunnahInfo && !isAyyamAlBeed) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-wrap items-center justify-center gap-2"
    >
      {sunnahInfo && (
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary/20 border-2 border-secondary/40 ring-2 ring-secondary/30 cursor-help">
              <Star className="w-4 h-4 text-secondary fill-secondary shrink-0" />
              <div className="text-sm">
                <span className="font-semibold text-secondary">Today · {sunnahInfo.reason}</span>
                <span className="font-arabic text-secondary/80 ml-2">{sunnahInfo.reasonAr}</span>
              </div>
            </div>
          </TooltipTrigger>
          <TooltipContent className="max-w-xs p-3">
            <p className="font-medium">{GENERAL_TOOLTIPS.sunnah.title}</p>
            <p className="text-xs mt-1 text-muted-foreground">{GENERAL_TOOLTIPS.sunnah.body}</p>
            <p className="font-arabic text-xs text-muted-foreground mt-1" dir="rtl">{GENERAL_TOOLTIPS.sunnah.bodyAr}</p>
          </TooltipContent>
        </Tooltip>
      )}

      {isAyyamAlBeed && (
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/20 border border-primary/30 cursor-help">
              <Moon className="w-4 h-4 text-foreground" aria-hidden />
              <div className="text-sm">
                <span className="font-semibold text-foreground">Ayyam al-Beed</span>
                <span className="font-arabic text-muted-foreground ml-2">أيام البيض</span>
                <span className="text-muted-foreground ml-2">(Day {hijriDay} of lunar month)</span>
              </div>
            </div>
          </TooltipTrigger>
          <TooltipContent className="max-w-xs p-3">
            <p className="font-medium">{GENERAL_TOOLTIPS.ayyamAlBeed.title}</p>
            <p className="text-xs mt-1 text-muted-foreground">{GENERAL_TOOLTIPS.ayyamAlBeed.body}</p>
            <p className="font-arabic text-xs text-muted-foreground mt-1" dir="rtl">{GENERAL_TOOLTIPS.ayyamAlBeed.bodyAr}</p>
          </TooltipContent>
        </Tooltip>
      )}

      {(sunnahInfo || isAyyamAlBeed) && (
        <p className="w-full text-center text-xs text-muted-foreground mt-1">
          💡 Today is a recommended day to fast in Islamic tradition • يوم صيام سنة
        </p>
      )}
    </motion.div>
  );
};
