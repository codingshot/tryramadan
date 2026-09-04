import { useState } from "react";
import { motion } from "framer-motion";
import { ChevronDown, ChevronUp, Clock, AlertCircle, Lock, BookOpen } from "lucide-react";
import { type PrayerTimes } from "@/hooks/usePrayerTimes";
import { EATING_TIME_TITLE } from "@/data/eating-times-tooltips";
import { getOptionalPrayersByParent } from "@/data/optionalPrayers";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useDisplayTimezone } from "@/hooks/useLocalStorage";
import { timeStringToSecondsSinceMidnight, getNowSecondsSinceMidnightInTimezone } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

/** How-to-pray guide data for each prayer */
const PRAYER_GUIDES: Record<string, { rakah: number; sunnah: string; steps: string[]; makeup: string }> = {
  fajr: {
    rakah: 2,
    sunnah: "2 sunnah rak'ahs before the fard",
    steps: [
      "Make wudu (ablution) — wash hands, face, arms to elbows, wipe head, wash feet",
      "Stand facing the Qibla, raise hands to ears and say 'Allahu Akbar' (Takbir)",
      "Recite Al-Fatiha, then a short surah (e.g. Al-Ikhlas)",
      "Bow (ruku): say 'Subhana Rabbiyal Azeem' 3 times",
      "Stand upright: say 'Sami Allahu liman hamidah, Rabbana lakal hamd'",
      "Prostrate (sujud): say 'Subhana Rabbiyal A'la' 3 times",
      "Sit briefly, then prostrate again",
      "Repeat for the 2nd rak'ah, then sit for Tashahhud and end with Salam",
    ],
    makeup: "Pray 2 rak'ahs as soon as you remember, even after sunrise. Make the intention for Qada (makeup) Fajr.",
  },
  dhuhr: {
    rakah: 4,
    sunnah: "2–4 sunnah before, 2 sunnah after",
    steps: [
      "Same wudu and opening as Fajr",
      "1st & 2nd rak'ah: Al-Fatiha + surah, then ruku and sujud as above",
      "After 2nd rak'ah: sit for first Tashahhud",
      "3rd & 4th rak'ah: Al-Fatiha only (no additional surah), ruku and sujud",
      "After 4th rak'ah: full Tashahhud, Salawat on the Prophet ﷺ, then Salam",
    ],
    makeup: "Pray 4 rak'ahs with intention for Qada Dhuhr. Best to make up before the next prayer time.",
  },
  asr: {
    rakah: 4,
    sunnah: "No emphasized sunnah, but 2–4 nafl before is rewarded",
    steps: [
      "Same structure as Dhuhr (4 rak'ahs)",
      "Al-Fatiha + surah in first two, Al-Fatiha only in last two",
      "Intention: 'I intend to pray 4 rak'ahs of Asr'",
    ],
    makeup: "Pray 4 rak'ahs with intention for Qada Asr. Should be made up as soon as possible.",
  },
  maghrib: {
    rakah: 3,
    sunnah: "2 sunnah after the fard",
    steps: [
      "Performed immediately after sunset (iftar time during Ramadan)",
      "1st & 2nd rak'ah: Al-Fatiha + surah, ruku, sujud",
      "After 2nd rak'ah: first Tashahhud",
      "3rd rak'ah: Al-Fatiha only, ruku, sujud",
      "Final Tashahhud and Salam",
    ],
    makeup: "Pray 3 rak'ahs with intention for Qada Maghrib. Make up before sleeping if missed.",
  },
  isha: {
    rakah: 4,
    sunnah: "2 sunnah after, then Witr (1–11 rak'ahs)",
    steps: [
      "Same structure as Dhuhr/Asr (4 rak'ahs)",
      "Followed by 2 sunnah rak'ahs",
      "Then Witr prayer (odd number: 1, 3, 5, 7, 9, or 11 rak'ahs)",
      "During Ramadan, Taraweeh is prayed after Isha's sunnah (before or after Witr)",
    ],
    makeup: "Pray 4 rak'ahs with intention for Qada Isha. Can be made up until Fajr of the next day, or later.",
  },
};

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
  const displayTimezone = useDisplayTimezone();
  if (!prayerTimes) return null;

  const nowSec = displayTimezone
    ? getNowSecondsSinceMidnightInTimezone(displayTimezone)
    : (() => {
        const n = new Date();
        return n.getHours() * 3600 + n.getMinutes() * 60 + n.getSeconds();
      })();

  const prayers = [
    { name: "Fajr", time: prayerTimes.fajr, icon: "🌅" },
    { name: "Sunrise", time: prayerTimes.sunrise, icon: "🌄", noCheckbox: true },
    { name: "Dhuhr", time: prayerTimes.dhuhr, icon: "☀️" },
    { name: "Asr", time: prayerTimes.asr, icon: "🌤️" },
    { name: "Maghrib", time: prayerTimes.maghrib, icon: "🌇" },
    { name: "Isha", time: prayerTimes.isha, icon: "🌙" },
  ];

  const formatCountdown = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    if (h > 0) return `${h}h ${m}m`;
    return `${m}m`;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Today's Prayer Times</DialogTitle>
        </DialogHeader>

        <div className="space-y-2 mt-4">
          {prayers.map((prayer) => {
            const raw = prayerTracker[todayStr]?.[prayer.name.toLowerCase()];
            const isChecked = raw === true || raw === 'half' || raw === 'full';
            const optionals = prayer.noCheckbox ? [] : getOptionalPrayersByParent(prayer.name);
            const isExpanded = expandedPrayer === prayer.name;
            const prayerSec = timeStringToSecondsSinceMidnight(prayer.time);
            const isPast = nowSec > prayerSec;
            const secondsUntil = isPast ? 0 : prayerSec - nowSec;
            const guide = PRAYER_GUIDES[prayer.name.toLowerCase()];
            // Can only check past prayers or sunrise (which is not checkable)
            const canCheck = isPast || prayer.noCheckbox;

            return (
              <div key={prayer.name}>
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className={`flex items-center justify-between p-3 rounded-xl transition-colors ${
                    isPast && !isChecked && !prayer.noCheckbox
                      ? "bg-destructive/5 border border-destructive/15 hover:bg-destructive/10"
                      : !isPast && !prayer.noCheckbox
                        ? "bg-muted/20 hover:bg-muted/30"
                        : "bg-muted/30 hover:bg-muted/50"
                  }`}
                  title={prayer.name === "Maghrib" ? EATING_TIME_TITLE.iftarTime : undefined}
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    {!prayer.noCheckbox && canCheck ? (
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={(e) => onPrayerCheck(prayer.name.toLowerCase(), e.target.checked)}
                        className="w-5 h-5 rounded border-2 border-primary text-primary focus:ring-2 focus:ring-primary/20 cursor-pointer shrink-0"
                        aria-label={`Mark ${prayer.name} as prayed`}
                      />
                    ) : !prayer.noCheckbox ? (
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <span className="shrink-0">
                            <Lock className="w-4 h-4 text-muted-foreground/50" />
                          </span>
                        </TooltipTrigger>
                        <TooltipContent side="top" className="max-w-xs p-2 z-50 bg-popover border border-border">
                          <p className="text-xs">Available after {prayer.time}</p>
                        </TooltipContent>
                      </Tooltip>
                    ) : null}
                    <span className="text-2xl shrink-0">{prayer.icon}</span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className={`font-medium ${isChecked ? "line-through text-muted-foreground" : !isPast && !prayer.noCheckbox ? "text-muted-foreground" : ""}`}>
                          {prayer.name}
                        </p>
                        {isPast && !isChecked && !prayer.noCheckbox && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-destructive/10 text-destructive font-medium">
                            Missed
                          </span>
                        )}
                      </div>
                      {prayer.noCheckbox && (
                        <p className="text-xs text-muted-foreground">(Not a prayer time)</p>
                      )}
                      {!isPast && !prayer.noCheckbox && (
                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                          <Clock className="w-3 h-3" /> In {formatCountdown(secondsUntil)}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="font-semibold tabular-nums">{prayer.time}</span>
                    {!prayer.noCheckbox && (
                      <button
                        type="button"
                        onClick={() => setExpandedPrayer(isExpanded ? null : prayer.name)}
                        className="p-1 rounded-md hover:bg-muted/50"
                        aria-label={`${isExpanded ? "Hide" : "Show"} details for ${prayer.name}`}
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

                {/* Expanded details */}
                {!prayer.noCheckbox && isExpanded && (
                  <div className="ml-6 mt-1.5 space-y-1.5 mb-2">
                    {/* How to pray */}
                    {guide && (
                      <div className="p-3 rounded-lg bg-primary/5 border border-primary/10">
                        <div className="flex items-center gap-1.5 mb-2">
                          <BookOpen className="w-3.5 h-3.5 text-primary" />
                          <span className="text-xs font-semibold text-primary">How to pray {prayer.name}</span>
                          <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-primary/10 text-primary ml-auto">
                            {guide.rakah} rak'ah{guide.rakah > 1 ? "s" : ""}
                          </span>
                        </div>
                        <p className="text-[11px] text-muted-foreground mb-2">
                          <strong>Sunnah:</strong> {guide.sunnah}
                        </p>
                        <ol className="text-xs text-muted-foreground space-y-1 list-decimal list-inside">
                          {guide.steps.map((step, i) => (
                            <li key={i} className="leading-relaxed">{step}</li>
                          ))}
                        </ol>
                      </div>
                    )}

                    {/* Makeup guidance for missed prayers */}
                    {isPast && !isChecked && guide && (
                      <div className="p-3 rounded-lg bg-destructive/5 border border-destructive/10">
                        <div className="flex items-center gap-1.5 mb-1">
                          <AlertCircle className="w-3.5 h-3.5 text-destructive" />
                          <span className="text-xs font-semibold text-destructive">Making up {prayer.name} (Qada)</span>
                        </div>
                        <p className="text-xs text-muted-foreground leading-relaxed">{guide.makeup}</p>
                        <button
                          type="button"
                          onClick={() => onPrayerCheck(prayer.name.toLowerCase(), true)}
                          className="mt-2 text-xs font-medium text-primary hover:underline"
                        >
                          ✓ I've made up this prayer
                        </button>
                      </div>
                    )}

                    {/* Optional prayers grouped under this prayer */}
                    {optionals.length > 0 && (
                      <div className="space-y-1">
                        <p className="text-[11px] font-medium text-muted-foreground px-1">Optional (Sunnah)</p>
                        {optionals.map((opt) => {
                          const optRaw = prayerTracker[todayStr]?.[opt.id];
                          const optChecked = optRaw === true || optRaw === "half" || optRaw === "full";
                          return (
                            <Tooltip key={opt.id}>
                              <TooltipTrigger asChild>
                                <label className={`flex items-center gap-2.5 p-2 rounded-lg bg-muted/20 hover:bg-muted/40 ${!canCheck ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}>
                                  <input
                                    type="checkbox"
                                    checked={optChecked}
                                    disabled={!canCheck}
                                    onChange={(e) => onPrayerCheck(opt.id, e.target.checked)}
                                    className="w-4 h-4 rounded border-2 border-primary/60 text-primary focus:ring-2 focus:ring-primary/20 shrink-0"
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
                )}
              </div>
            );
          })}
        </div>

        <div className="mt-6 pt-4 border-t border-border">
          <p className="text-xs text-muted-foreground text-center">
            Prayer times are calculated for your location. Future prayers are locked until their time arrives.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};
