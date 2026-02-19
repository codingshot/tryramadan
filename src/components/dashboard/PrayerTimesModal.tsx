import { useState } from "react";
import { motion } from "framer-motion";
import { ChevronDown, ChevronUp } from "lucide-react";
import { type PrayerTimes } from "@/hooks/usePrayerTimes";
import { EATING_TIME_TITLE } from "@/data/eating-times-tooltips";
import { OPTIONAL_PRAYERS } from "@/data/optionalPrayers";
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
  const [optionalOpen, setOptionalOpen] = useState(false);
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

        <div className="space-y-3 mt-4">
          {prayers.map((prayer) => {
            const raw = prayerTracker[todayStr]?.[prayer.name.toLowerCase()];
            const isChecked = raw === true || raw === 'half' || raw === 'full';

            return (
              <motion.div
                key={prayer.name}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center justify-between p-3 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors"
                title={prayer.name === "Maghrib" ? EATING_TIME_TITLE.iftarTime : undefined}
              >
                <div className="flex items-center gap-3">
                  {!prayer.noCheckbox && (
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={(e) =>
                        onPrayerCheck(prayer.name.toLowerCase(), e.target.checked)
                      }
                      className="w-5 h-5 rounded border-2 border-primary text-primary focus:ring-2 focus:ring-primary/20 cursor-pointer"
                      aria-label={`Mark ${prayer.name} as prayed`}
                    />
                  )}
                  <span className="text-2xl">{prayer.icon}</span>
                  <div>
                    <p
                      className={`font-medium ${
                        isChecked ? "line-through text-muted-foreground" : ""
                      }`}
                    >
                      {prayer.name}
                    </p>
                    {prayer.noCheckbox && (
                      <p className="text-xs text-muted-foreground">
                        (Not a prayer time)
                      </p>
                    )}
                  </div>
                </div>
                <span className="font-semibold tabular-nums">{prayer.time}</span>
              </motion.div>
            );
          })}
        </div>

        {/* Optional prayers (Sunnah & Witr) */}
        <div className="mt-4 pt-4 border-t border-border">
          <button
            type="button"
            onClick={() => setOptionalOpen((o) => !o)}
            className="w-full flex items-center justify-between gap-2 py-2 text-left rounded-lg hover:bg-muted/50"
            aria-expanded={optionalOpen}
            aria-controls="modal-optional-prayers"
          >
            <span className="text-sm font-medium text-muted-foreground">
              Optional prayers (Sunnah & Witr)
            </span>
            {optionalOpen ? (
              <ChevronUp className="w-4 h-4 shrink-0" aria-hidden />
            ) : (
              <ChevronDown className="w-4 h-4 shrink-0" aria-hidden />
            )}
          </button>
          {optionalOpen && (
            <div id="modal-optional-prayers" className="mt-2 space-y-1.5">
              {OPTIONAL_PRAYERS.map((prayer) => {
                const raw = prayerTracker[todayStr]?.[prayer.id];
                const isChecked = raw === true || raw === "half" || raw === "full";
                return (
                  <Tooltip key={prayer.id}>
                    <TooltipTrigger asChild>
                      <label className="flex items-center gap-3 p-3 rounded-xl bg-muted/30 hover:bg-muted/50 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={(e) => onPrayerCheck(prayer.id, e.target.checked)}
                          className="w-5 h-5 rounded border-2 border-primary text-primary focus:ring-2 focus:ring-primary/20 cursor-pointer"
                          aria-label={`Mark ${prayer.label} as ${isChecked ? "not " : ""}prayed`}
                        />
                        <span
                          className={`font-medium text-sm ${
                            isChecked ? "line-through text-muted-foreground" : ""
                          }`}
                        >
                          {prayer.label}
                          {prayer.rakah && (
                            <span className="text-muted-foreground font-normal"> ({prayer.rakah})</span>
                          )}
                        </span>
                      </label>
                    </TooltipTrigger>
                    <TooltipContent side="right" className="max-w-xs p-3">
                      <p className="font-medium text-sm">{prayer.label}</p>
                      <p className="text-xs text-muted-foreground mt-1">{prayer.description}</p>
                    </TooltipContent>
                  </Tooltip>
                );
              })}
            </div>
          )}
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
