/**
 * Ramadan 101 context card for non-Muslim users.
 * Shows clear info about fasting times, what Muslims do, duration, and current progress.
 */
import { Moon, Sun, Sunrise, Sunset, Clock, Calendar, Utensils, BookOpen } from "lucide-react";
import { useRamadanRange } from "@/hooks/useRamadanRange";
import { getDaysUntilRamadan } from "@/lib/ramadan";
import { usePrayerTimes } from "@/hooks/usePrayerTimes";
import { useUserPreferences, useDisplayTimezone } from "@/hooks/useLocalStorage";

interface RamadanContextCardProps {
  /** Compact mode for dashboard (less detail) */
  compact?: boolean;
  className?: string;
}

export function RamadanContextCard({ compact = false, className = "" }: RamadanContextCardProps) {
  const [preferences] = useUserPreferences();
  const displayTimezone = useDisplayTimezone();
  const ramadanRange = useRamadanRange();
  const { prayerTimes } = usePrayerTimes(
    preferences.locationCoords?.lat || null,
    preferences.locationCoords?.lng || null,
    displayTimezone
  );

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const inRamadan = ramadanRange.isRamadanDay(today);
  const ramadanDay = inRamadan ? (ramadanRange.getRamadanDayNumber(today) ?? 1) : null;
  const totalDays = ramadanRange.totalDays ?? 30;
  const daysUntil = inRamadan ? 0 : getDaysUntilRamadan();
  const progressPct = ramadanDay ? Math.round((ramadanDay / totalDays) * 100) : 0;

  const startDateStr = ramadanRange.start.toLocaleDateString("en", { month: "long", day: "numeric", year: "numeric" });
  const endDateStr = ramadanRange.end.toLocaleDateString("en", { month: "long", day: "numeric", year: "numeric" });

  // Fasting hours estimate
  const fastingHours = prayerTimes?.imsak && prayerTimes?.maghrib
    ? (() => {
        const [ih, im] = prayerTimes.imsak.split(":").map(Number);
        const [mh, mm] = prayerTimes.maghrib.split(":").map(Number);
        const diff = (mh * 60 + mm) - (ih * 60 + im);
        return diff > 0 ? Math.round(diff / 60) : null;
      })()
    : null;

  if (compact) {
    return (
      <div className={`p-4 rounded-2xl bg-gradient-to-br from-primary/5 to-secondary/5 border border-border ${className}`}>
        <h3 className="font-semibold text-sm mb-2 flex items-center gap-2">
          <Moon className="w-4 h-4 text-secondary" />
          {inRamadan ? "Ramadan in Progress" : "About Ramadan"}
        </h3>
        {inRamadan && ramadanDay ? (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Day {ramadanDay} of {totalDays}</span>
              <span className="font-medium">{progressPct}% complete</span>
            </div>
            <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
              <div className="h-full bg-secondary rounded-full transition-all" style={{ width: `${progressPct}%` }} />
            </div>
            {prayerTimes && (
              <p className="text-xs text-muted-foreground">
                Today's fast: {prayerTimes.imsak} (dawn) → {prayerTimes.maghrib} (sunset)
                {fastingHours ? ` · ~${fastingHours} hours` : ""}
              </p>
            )}
          </div>
        ) : daysUntil > 0 ? (
          <p className="text-sm text-muted-foreground">
            Ramadan starts in <span className="font-semibold text-foreground">{daysUntil} day{daysUntil !== 1 ? "s" : ""}</span> ({startDateStr}).
            Muslims fast from dawn to sunset for {totalDays} days.
          </p>
        ) : (
          <p className="text-sm text-muted-foreground">
            Ramadan is the holy month when Muslims fast from dawn to sunset. It lasts about {totalDays} days.
          </p>
        )}
      </div>
    );
  }

  // Full version (for onboarding)
  return (
    <div className={`space-y-4 ${className}`}>
      <div className="p-5 rounded-2xl bg-gradient-to-br from-primary/5 to-secondary/5 border border-border">
        <h3 className="font-display font-bold text-lg mb-3 flex items-center gap-2">
          <Moon className="w-5 h-5 text-secondary" />
          What is Ramadan?
        </h3>
        <p className="text-sm text-muted-foreground leading-relaxed mb-4">
          Ramadan is the ninth month of the Islamic calendar—a time of fasting, reflection, and community for over 1.8 billion Muslims worldwide. During this month, Muslims abstain from food and drink from <strong className="text-foreground">dawn to sunset</strong> each day.
        </p>

        {/* Timeline visual */}
        <div className="flex items-center gap-2 p-3 rounded-xl bg-background border border-border mb-3">
          <div className="flex flex-col items-center text-center flex-1">
            <Sunrise className="w-5 h-5 text-amber-500 mb-1" />
            <span className="text-xs font-semibold">Suhoor</span>
            <span className="text-[10px] text-muted-foreground">Pre-dawn meal</span>
            {prayerTimes && <span className="text-xs font-mono mt-0.5">{prayerTimes.imsak}</span>}
          </div>
          <div className="flex-1 flex flex-col items-center">
            <div className="w-full h-1 bg-gradient-to-r from-amber-400 via-orange-400 to-orange-500 rounded-full relative">
              <Sun className="w-4 h-4 text-amber-500 absolute -top-1.5 left-1/2 -translate-x-1/2" />
            </div>
            <span className="text-[10px] text-muted-foreground mt-1.5 font-medium">
              Fasting{fastingHours ? ` (~${fastingHours}h)` : ""}
            </span>
          </div>
          <div className="flex flex-col items-center text-center flex-1">
            <Sunset className="w-5 h-5 text-orange-500 mb-1" />
            <span className="text-xs font-semibold">Iftar</span>
            <span className="text-[10px] text-muted-foreground">Break fast</span>
            {prayerTimes && <span className="text-xs font-mono mt-0.5">{prayerTimes.maghrib}</span>}
          </div>
        </div>

        {/* Quick facts */}
        <div className="grid grid-cols-2 gap-2">
          <div className="flex items-start gap-2 p-2.5 rounded-lg bg-background border border-border">
            <Calendar className="w-4 h-4 text-primary mt-0.5 shrink-0" />
            <div>
              <p className="text-xs font-semibold">Duration</p>
              <p className="text-[10px] text-muted-foreground">{totalDays} days ({startDateStr} – {endDateStr})</p>
            </div>
          </div>
          <div className="flex items-start gap-2 p-2.5 rounded-lg bg-background border border-border">
            <Utensils className="w-4 h-4 text-primary mt-0.5 shrink-0" />
            <div>
              <p className="text-xs font-semibold">No food or drink</p>
              <p className="text-[10px] text-muted-foreground">From dawn to sunset only</p>
            </div>
          </div>
          <div className="flex items-start gap-2 p-2.5 rounded-lg bg-background border border-border">
            <Clock className="w-4 h-4 text-primary mt-0.5 shrink-0" />
            <div>
              <p className="text-xs font-semibold">Daily fast</p>
              <p className="text-[10px] text-muted-foreground">{fastingHours ? `~${fastingHours} hours` : "Varies by location"}</p>
            </div>
          </div>
          <div className="flex items-start gap-2 p-2.5 rounded-lg bg-background border border-border">
            <BookOpen className="w-4 h-4 text-primary mt-0.5 shrink-0" />
            <div>
              <p className="text-xs font-semibold">Beyond food</p>
              <p className="text-[10px] text-muted-foreground">Prayer, charity, reflection</p>
            </div>
          </div>
        </div>

        {/* Ramadan progress if in Ramadan */}
        {inRamadan && ramadanDay && (
          <div className="mt-4 p-3 rounded-xl bg-secondary/10 border border-secondary/30">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-semibold">Day {ramadanDay} of {totalDays}</span>
              <span className="text-xs font-medium text-secondary">{progressPct}% of Ramadan</span>
            </div>
            <div className="w-full h-2.5 bg-muted rounded-full overflow-hidden">
              <div className="h-full bg-secondary rounded-full transition-all" style={{ width: `${progressPct}%` }} />
            </div>
            <p className="text-xs text-muted-foreground mt-1.5">
              {totalDays - ramadanDay} day{totalDays - ramadanDay !== 1 ? "s" : ""} remaining
            </p>
          </div>
        )}

        {daysUntil > 0 && !inRamadan && (
          <div className="mt-4 p-3 rounded-xl bg-primary/10 border border-primary/30 text-center">
            <p className="text-sm font-semibold">
              Ramadan starts in {daysUntil} day{daysUntil !== 1 ? "s" : ""}
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">{startDateStr}</p>
          </div>
        )}
      </div>
    </div>
  );
}
