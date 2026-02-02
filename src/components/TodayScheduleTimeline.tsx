import { motion } from "framer-motion";
import { ArabicHover } from "@/components/ArabicHover";
import { Clock, Sunrise, Sunset, Moon } from "lucide-react";
import type { PrayerTimes } from "@/hooks/usePrayerTimes";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { EATING_TIME_TOOLTIPS } from "@/data/eating-times-tooltips";
import { GENERAL_TOOLTIPS } from "@/data/general-tooltips";

export interface TimelineItem {
  time: string;
  label: string;
  sublabel?: string;
  icon: React.ReactNode;
  highlight?: boolean;
}

/** Build ordered timeline items from prayer times for today. */
export function buildTodayTimeline(
  prayerTimes: PrayerTimes,
  iftarLabelShort: string
): TimelineItem[] {
  const items: TimelineItem[] = [
    {
      time: prayerTimes.imsak,
      label: "Suhoor end (cut-off)",
      sublabel: "Stop eating before Fajr",
      icon: <Sunrise className="w-4 h-4" />,
      highlight: true,
    },
    {
      time: prayerTimes.fajr,
      label: "Fajr",
      sublabel: "Dawn prayer",
      icon: <Sunrise className="w-4 h-4" />,
    },
    {
      time: prayerTimes.dhuhr,
      label: "Dhuhr",
      sublabel: "Midday prayer",
      icon: <Clock className="w-4 h-4" />,
    },
    {
      time: prayerTimes.asr,
      label: "Asr",
      sublabel: "Afternoon prayer",
      icon: <Clock className="w-4 h-4" />,
    },
    {
      time: prayerTimes.maghrib,
      label: iftarLabelShort,
      sublabel: "Break fast · Maghrib",
      icon: <Sunset className="w-4 h-4" />,
      highlight: true,
    },
    {
      time: prayerTimes.isha,
      label: "Isha",
      sublabel: "Night prayer",
      icon: <Moon className="w-4 h-4" />,
    },
  ];
  return items;
}

/** Optional: add Taraweeh (e.g. 1h after Isha). */
export function addTaraweehToTimeline(
  items: TimelineItem[],
  ishaTime: string
): TimelineItem[] {
  const [h, m] = ishaTime.split(":").map(Number);
  const th = h + 1;
  const tm = (m || 0) + 30;
  const th2 = th + Math.floor(tm / 60);
  const tm2 = tm % 60;
  const taraweehTime = `${String(th2).padStart(2, "0")}:${String(tm2).padStart(2, "0")}`;
  const taraweehItem: TimelineItem = {
    time: taraweehTime,
    label: "Taraweeh (optional)",
    sublabel: "Night prayer in Ramadan",
    icon: <Moon className="w-4 h-4" />,
  };
  return [...items, taraweehItem];
}

interface TodayScheduleTimelineProps {
  prayerTimes: PrayerTimes;
  iftarLabelShort?: string;
  includeTaraweeh?: boolean;
  className?: string;
}

export function TodayScheduleTimeline({
  prayerTimes,
  iftarLabelShort = "Iftar",
  includeTaraweeh = false,
  className = "",
}: TodayScheduleTimelineProps) {
  let items = buildTodayTimeline(prayerTimes, iftarLabelShort);
  if (includeTaraweeh) {
    items = addTaraweehToTimeline(items, prayerTimes.isha);
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`rounded-2xl bg-card border border-border overflow-hidden ${className}`}
    >
      <div className="p-3 border-b border-border">
        <h3 className="font-display font-bold text-sm flex items-center gap-2">
          <Clock className="w-4 h-4 text-secondary" />
          <ArabicHover arabic="جدول اليوم" explanation="Today's schedule — key fasting and prayer times">Today&apos;s schedule</ArabicHover>
        </h3>
        <p className="text-xs text-muted-foreground mt-0.5">
          Key times for fasting and prayer
        </p>
      </div>
      <ul className="divide-y divide-border">
        {items.map((item) => (
          <li
            key={`${item.time}-${item.label}`}
            className={`flex items-center gap-3 px-4 py-2.5 ${
              item.highlight ? "bg-secondary/5" : ""
            }`}
          >
            <span
              className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                item.highlight ? "bg-secondary/20 text-secondary" : "bg-muted text-muted-foreground"
              }`}
              aria-hidden
            >
              {item.icon}
            </span>
            <div className="min-w-0 flex-1">
              <Tooltip>
                <TooltipTrigger asChild>
                  <span className="font-medium text-sm block truncate cursor-help">{item.label}</span>
                </TooltipTrigger>
                <TooltipContent className="max-w-xs p-3">
                  <p className="font-medium">
                    {item.label.includes("Suhoor") ? EATING_TIME_TOOLTIPS.suhoorEnds.title : item.label === "Fajr" ? EATING_TIME_TOOLTIPS.fajr.title : item.label === "Dhuhr" ? EATING_TIME_TOOLTIPS.dhuhr.title : item.label === "Asr" ? EATING_TIME_TOOLTIPS.asr.title : (item.label === iftarLabelShort || item.label.includes("Iftar")) ? EATING_TIME_TOOLTIPS.iftarTime.title : item.label === "Isha" ? EATING_TIME_TOOLTIPS.isha.title : item.label.includes("Taraweeh") ? GENERAL_TOOLTIPS.taraweeh.title : item.label}
                  </p>
                  {item.sublabel && (
                    <p className="text-xs text-muted-foreground mt-1">{item.sublabel}</p>
                  )}
                  {item.label.includes("Suhoor") && (
                    <p className="text-xs text-muted-foreground mt-1">{EATING_TIME_TOOLTIPS.suhoorEnds.body}</p>
                  )}
                  {item.label === "Fajr" && <p className="text-xs text-muted-foreground mt-1">{EATING_TIME_TOOLTIPS.fajr.body}</p>}
                  {item.label === "Dhuhr" && <p className="text-xs text-muted-foreground mt-1">{EATING_TIME_TOOLTIPS.dhuhr.body}</p>}
                  {item.label === "Asr" && <p className="text-xs text-muted-foreground mt-1">{EATING_TIME_TOOLTIPS.asr.body}</p>}
                  {(item.label === iftarLabelShort || item.label.includes("Iftar")) && !item.label.includes("Taraweeh") && (
                    <p className="text-xs text-muted-foreground mt-1">{EATING_TIME_TOOLTIPS.iftarTime.body}</p>
                  )}
                  {item.label === "Isha" && <p className="text-xs text-muted-foreground mt-1">{EATING_TIME_TOOLTIPS.isha.body}</p>}
                  {item.label.includes("Taraweeh") && (
                    <p className="text-xs text-muted-foreground mt-1">{GENERAL_TOOLTIPS.taraweeh.body}</p>
                  )}
                </TooltipContent>
              </Tooltip>
              {item.sublabel && (
                <span className="text-xs text-muted-foreground truncate block mt-0.5">
                  {item.sublabel}
                </span>
              )}
            </div>
            <span className="font-mono text-sm font-semibold text-secondary shrink-0 tabular-nums">
              {item.time}
            </span>
          </li>
        ))}
      </ul>
    </motion.div>
  );
}
