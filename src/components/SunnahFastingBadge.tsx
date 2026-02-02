import { motion } from 'framer-motion';
import { Star, Moon, Calendar } from 'lucide-react';
import { getSunnahFastingInfo } from '@/hooks/usePrayerTimes';

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
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary/20 border-2 border-secondary/40 ring-2 ring-secondary/30">
          <Star className="w-4 h-4 text-secondary fill-secondary shrink-0" />
          <div className="text-sm">
            <span className="font-semibold text-secondary">Today · {sunnahInfo.reason}</span>
            <span className="font-arabic text-secondary/80 ml-2">{sunnahInfo.reasonAr}</span>
          </div>
        </div>
      )}

      {isAyyamAlBeed && (
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/20 border border-primary/30">
          <Moon className="w-4 h-4 text-primary" />
          <div className="text-sm">
            <span className="font-semibold text-primary">Ayyam al-Beed</span>
            <span className="font-arabic text-primary/80 ml-2">أيام البيض</span>
            <span className="text-muted-foreground ml-2">(Day {hijriDay} of lunar month)</span>
          </div>
        </div>
      )}

      {(sunnahInfo || isAyyamAlBeed) && (
        <p className="w-full text-center text-xs text-muted-foreground mt-1">
          💡 Today is a recommended day to fast in Islamic tradition • يوم صيام سنة
        </p>
      )}
    </motion.div>
  );
};
