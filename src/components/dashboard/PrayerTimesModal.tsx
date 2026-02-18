import { motion } from "framer-motion";
import { X } from "lucide-react";
import { type PrayerTimes } from "@/hooks/usePrayerTimes";
import { EATING_TIME_TITLE } from "@/data/eating-times-tooltips";
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

        <div className="mt-6 pt-4 border-t border-border">
          <p className="text-xs text-muted-foreground text-center">
            Prayer times are calculated for your location
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};
