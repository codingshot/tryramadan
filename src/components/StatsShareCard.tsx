/**
 * Unified stats card with fasting, journal, prayer stats.
 * Renders graphs (recharts), screenshot export (html2canvas), and social sharing (Web Share API).
 */
import { useCallback, useRef, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";
import { ChartContainer } from "@/components/ui/chart";
import { Button } from "@/components/ui/button";
import { Share2, Image, Loader2 } from "lucide-react";
import { toLocalDateString } from "@/lib/utils";
import { toast } from "sonner";

export type StatsShareCardProps = {
  completedDays: number;
  totalDays: number;
  completionRate: number;
  currentStreak: number;
  journalStreak: number;
  mindfulEatingStreak: number;
  prayerStreak: number;
  totalPrayers: number;
  isMuslim: boolean;
  /** Dates with completed fasts for chart (last 14 days) */
  completedDates: string[];
  ramadanStart: string;
  ramadanEnd: string;
};

const chartConfig = {
  days: { label: "Days", color: "hsl(var(--secondary))" },
};

function buildChartData(
  completedDates: string[],
  ramadanStart: string,
  ramadanEnd: string
): { week: string; completed: number }[] {
  const set = new Set(completedDates);
  const weeks: { week: string; completed: number }[] = [];
  if (!ramadanStart || !ramadanEnd) return weeks.length > 0 ? weeks : [{ week: "—", completed: 0 }];
  const start = new Date(ramadanStart + "T12:00:00");
  const end = new Date(ramadanEnd + "T12:00:00");
  if (isNaN(start.getTime()) || isNaN(end.getTime())) return [{ week: "—", completed: 0 }];
  let d = new Date(start);
  while (d <= end) {
    const weekEnd = new Date(d);
    weekEnd.setDate(weekEnd.getDate() + 6);
    const weekLabel = `${d.getMonth() + 1}/${d.getDate()}`;
    let count = 0;
    for (let i = 0; i < 7; i++) {
      const day = new Date(d);
      day.setDate(day.getDate() + i);
      const dayStr = toLocalDateString(day);
      if (set.has(dayStr)) count++;
    }
    weeks.push({ week: weekLabel, completed: count });
    d.setDate(d.getDate() + 7);
    if (weeks.length >= 5) break; // cap at 5 weeks for chart readability
  }
  return weeks.length > 0 ? weeks : [{ week: "—", completed: 0 }];
}

export function StatsShareCard({
  completedDays,
  totalDays,
  completionRate,
  currentStreak,
  journalStreak,
  mindfulEatingStreak,
  prayerStreak,
  totalPrayers,
  isMuslim,
  completedDates,
  ramadanStart,
  ramadanEnd,
}: StatsShareCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [capturing, setCapturing] = useState(false);

  const chartData = buildChartData(completedDates, ramadanStart, ramadanEnd);

  const handleShare = useCallback(async () => {
    const text = [
      `My Ramadan stats: ${completedDays}/${totalDays} days fasted`,
      completionRate ? `${completionRate}% completion` : "",
      currentStreak ? `${currentStreak} day streak` : "",
      journalStreak ? `${journalStreak} day journal streak` : "",
      isMuslim && totalPrayers ? `${totalPrayers} prayers completed` : "",
    ]
      .filter(Boolean)
      .join(" • ");
    const url = window.location.origin + "/dashboard/progress";
    const shareData: ShareData = {
      title: "TryRamadan Progress",
      text: text.trim(),
      url,
    };
    if (navigator.share && navigator.canShare?.(shareData)) {
      try {
        await navigator.share(shareData);
        toast.success("Stats shared");
      } catch (err) {
        if (err instanceof Error && err.name !== "AbortError") {
          toast.error("Could not share. Try copying instead.");
        }
      }
    } else {
      try {
        await navigator.clipboard.writeText(`${text}\n${url}`);
        toast.success("Stats copied to clipboard");
      } catch {
        toast.error("Could not copy to clipboard");
      }
    }
  }, [
    completedDays,
    totalDays,
    completionRate,
    currentStreak,
    journalStreak,
    isMuslim,
    totalPrayers,
  ]);

  const handleSaveImage = useCallback(async () => {
    if (!cardRef.current) return;
    setCapturing(true);
    try {
      const html2canvas = (await import("html2canvas")).default;
      const canvas = await html2canvas(cardRef.current, {
        backgroundColor: "hsl(var(--background))",
        scale: 2,
        useCORS: true,
        logging: false,
      });
      const link = document.createElement("a");
      link.download = `tryramadan-stats-${new Date().toISOString().split("T")[0]}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
      toast.success("Image saved");
    } catch {
      toast.error("Could not save image. Try again.");
    } finally {
      setCapturing(false);
    }
  }, []);

  return (
    <div
      ref={cardRef}
      className="p-6 rounded-2xl bg-card border border-border"
      data-stats-share-card
    >
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <h3 className="font-display font-bold text-lg">My Ramadan Stats • <span dir="rtl" className="font-arabic">إحصائياتي</span></h3>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleShare}
            aria-label="Share stats"
          >
            <Share2 className="w-4 h-4 mr-1" aria-hidden />
            Share
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleSaveImage}
            disabled={capturing}
            aria-label="Save as image"
          >
            {capturing ? (
              <Loader2 className="w-4 h-4 mr-1 animate-spin" aria-hidden />
            ) : (
              <Image className="w-4 h-4 mr-1" aria-hidden />
            )}
            Save image
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
        <div className="p-3 rounded-xl bg-secondary/10 border border-secondary/20 text-center">
          <span className="text-lg font-bold text-secondary">{completedDays}</span>
          <span className="block text-xs text-muted-foreground">Days fasted</span>
        </div>
        <div className="p-3 rounded-xl bg-card border border-border text-center">
          <span className="text-lg font-bold">{currentStreak}</span>
          <span className="block text-xs text-muted-foreground">Fasting streak</span>
        </div>
        <div className="p-3 rounded-xl bg-card border border-border text-center">
          <span className="text-lg font-bold">{journalStreak}</span>
          <span className="block text-xs text-muted-foreground">Journal streak</span>
        </div>
        <div className="p-3 rounded-xl bg-card border border-border text-center">
          <span className="text-lg font-bold">{mindfulEatingStreak}</span>
          <span className="block text-xs text-muted-foreground">Meals logged</span>
        </div>
        {isMuslim && (
          <div className="p-3 rounded-xl bg-secondary/10 border border-secondary/20 text-center col-span-2 sm:col-span-1">
            <span className="text-lg font-bold text-secondary">{totalPrayers}</span>
            <span className="block text-xs text-muted-foreground">Prayers ({prayerStreak} day streak)</span>
          </div>
        )}
      </div>

      {chartData.length > 0 && chartData.some((d) => d.completed > 0) && (
        <ChartContainer config={chartConfig} className="h-[160px] w-full">
          <BarChart data={chartData} margin={{ top: 4, right: 4, left: 4, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="week" tickLine={false} axisLine={false} />
            <YAxis tickLine={false} axisLine={false} allowDecimals={false} />
            <Bar dataKey="completed" fill="var(--color-days)" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ChartContainer>
      )}

      <p className="text-xs text-muted-foreground mt-3">
        {completionRate}% completion • {completedDays}/{totalDays} days
      </p>
    </div>
  );
}
