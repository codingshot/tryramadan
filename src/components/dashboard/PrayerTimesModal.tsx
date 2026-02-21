import { useState } from "react";
import { motion } from "framer-motion";
import { ChevronDown, ChevronUp } from "lucide-react";
import { type PrayerTimes } from "@/hooks/usePrayerTimes";
import { EATING_TIME_TITLE } from "@/data/eating-times-tooltips";
import { getOptionalPrayersByParent } from "@/data/optionalPrayers";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface PrayerTimesModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  prayerTimes: PrayerTimes | null;
  prayerTracker: Record<string, Record<string, boolean | 'half' | 'full'>>;
  todayStr: string;
  onPrayerCheck: (prayer: string, value: boolean | 'half' | 'full') => void;
}

export const PrayerTimesModal = ({
  open,
  onOpenChange,
  prayerTimes,
  prayerTracker,
  todayStr,
  onPrayerCheck,
}: PrayerTimesModalProps) => {
  const [expandedPrayer, setExpandedPrayer] = useState<string | null>(null);
  if (!prayerTimes) return null;

  const prayers = [
    { name: "Fajr", time: prayerTimes.fajr, icon: "🌅" },
    { name: "Sunrise", time: prayerTimes.sunrise, icon: "🌄", noCheckbox: true },
    { name: "Dhuhr", time: prayerTimes.dhuhr, icon: "☀️" },
    { name: "Asr", time: prayerTimes.asr, icon: "🌤️" },
    { name: "Maghrib", time: prayerTimes.maghrib, icon: "🌇" },
    { name: "Isha", time: prayerTimes.isha, icon: "🌙" },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Today's Prayer Times</DialogTitle>
        </DialogHeader>

        <div className="space-y-2 mt-4">
          {prayers.map((prayer) => {
            const raw = prayerTracker[todayStr]?.[prayer.name.toLowerCase()];
            const isChecked = raw === true || raw === 'half' || raw === 'full';
            const optionals = prayer.noCheckbox ? [] : getOptionalPrayersByParent(prayer.name);
            const isExpanded = expandedPrayer === prayer.name;

            return (
              <div key={prayer.name}>
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex items-center justify-between p-3 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors"
                  title={prayer.name === "Maghrib" ? EATING_TIME_TITLE.iftarTime : undefined}
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    {!prayer.noCheckbox && (
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={(e) => onPrayerCheck(prayer.name.toLowerCase(), e.target.checked)}
                        className="w-5 h-5 rounded border-2 border-primary text-primary focus:ring-2 focus:ring-primary/20 cursor-pointer shrink-0"
                        aria-label={`Mark ${prayer.name} as prayed`}
                      />
                    )}
                    <span className="text-2xl shrink-0">{prayer.icon}</span>
                    <div className="min-w-0">
                      <p className={`font-medium ${isChecked ? "line-through text-muted-foreground" : ""}`}>
                        {prayer.name}
                      </p>
                      {prayer.noCheckbox && (
                        <p className="text-xs text-muted-foreground">(Not a prayer time)</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="font-semibold tabular-nums">{prayer.time}</span>
                    {optionals.length > 0 && (
                      <button
                        type="button"
                        onClick={() => setExpandedPrayer(isExpanded ? null : prayer.name)}
                        className="p-1 rounded-md hover:bg-muted/50"
                        aria-label={`${isExpanded ? "Hide" : "Show"} optional prayers for ${prayer.name}`}
                      >
                        {isExpanded ? (
                          <ChevronUp className="w-4 h-4 text-muted-foreground" />
                        ) : (
                          <ChevronDown className="w-4 h-4 text-muted-foreground" />
                        )}
                      </button>
                    )}
                  </div>
                </motion.div>

                {/* Optional prayers nested under this prayer */}
                {optionals.length > 0 && isExpanded && (
                  <div className="ml-8 mt-1 space-y-1 mb-1">
                    {optionals.map((opt) => {
                      const optRaw = prayerTracker[todayStr]?.[opt.id];
                      const optChecked = optRaw === true || optRaw === "half" || optRaw === "full";
                      return (
                        <Tooltip key={opt.id}>
                          <TooltipTrigger asChild>
                            <label className="flex items-center gap-2.5 p-2 rounded-lg bg-muted/20 hover:bg-muted/40 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={optChecked}
                                onChange={(e) => onPrayerCheck(opt.id, e.target.checked)}
                                className="w-4 h-4 rounded border-2 border-primary/60 text-primary focus:ring-2 focus:ring-primary/20 cursor-pointer shrink-0"
                                aria-label={`Mark ${opt.label} as ${optChecked ? "not " : ""}prayed`}
                              />
                              <span className={`text-xs font-medium ${optChecked ? "line-through text-muted-foreground" : ""}`}>
                                {opt.label}
                                {opt.rakah && <span className="text-muted-foreground font-normal ml-1">({opt.rakah})</span>}
                              </span>
                            </label>
                          </TooltipTrigger>
                          <TooltipContent side="right" className="max-w-xs p-3 z-50 bg-popover border border-border">
                            <p className="font-medium text-sm">{opt.label}</p>
                            <p className="text-xs text-muted-foreground mt-1">{opt.description}</p>
                          </TooltipContent>
                        </Tooltip>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="mt-6 pt-4 border-t border-border">
          <p className="text-xs text-muted-foreground text-center">
            Prayer times are calculated for your location
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};
