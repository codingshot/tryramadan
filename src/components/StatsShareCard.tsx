/**
 * Unified stats card with fasting, journal, prayer stats.
 * Renders graphs (recharts), screenshot export (html2canvas), and social sharing (Web Share API).
 * Save image: preview, dimensions, file type, optional badges.
 */
import { useCallback, useRef, useState, useEffect } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";
import { ChartContainer } from "@/components/ui/chart";
import { Button } from "@/components/ui/button";
import { Share2, Image, Loader2, Flame, Trophy, Target } from "lucide-react";
import { toLocalDateString } from "@/lib/utils";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

const DIMENSION_PRESETS = [
  { id: "original", label: "Original", width: 0, height: 0 },
  { id: "square", label: "Square 1080×1080", width: 1080, height: 1080 },
  { id: "story", label: "Story 1080×1920", width: 1080, height: 1920 },
  { id: "twitter", label: "Twitter/Link 1200×630", width: 1200, height: 630 },
] as const;

const FILE_TYPES = [
  { id: "png", label: "PNG", mime: "image/png" as const },
  { id: "jpeg", label: "JPEG", mime: "image/jpeg" as const },
] as const;

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
  const [saveImageDialogOpen, setSaveImageDialogOpen] = useState(false);
  const [captureDataUrl, setCaptureDataUrl] = useState<string | null>(null);
  const [includeBadges, setIncludeBadges] = useState(true);
  const [dimensionPreset, setDimensionPreset] = useState<(typeof DIMENSION_PRESETS)[number]["id"]>("original");
  const [fileType, setFileType] = useState<(typeof FILE_TYPES)[number]["id"]>("png");
  const [capturingPreview, setCapturingPreview] = useState(false);

  const chartData = buildChartData(completedDates, ramadanStart, ramadanEnd);

  const captureCard = useCallback(async () => {
    if (!cardRef.current) return null;
    const html2canvas = (await import("html2canvas")).default;
    const canvas = await html2canvas(cardRef.current, {
      backgroundColor: "hsl(var(--background))",
      scale: 2,
      useCORS: true,
      logging: false,
    });
    return canvas.toDataURL("image/png");
  }, []);

  useEffect(() => {
    if (!saveImageDialogOpen || !cardRef.current) return;
    setCapturingPreview(true);
    const t = setTimeout(() => {
      captureCard()
        .then((dataUrl) => setCaptureDataUrl(dataUrl))
        .finally(() => setCapturingPreview(false));
    }, includeBadges ? 150 : 0);
    return () => clearTimeout(t);
  }, [saveImageDialogOpen, includeBadges, captureCard]);

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

  const handleSaveImageClick = useCallback(async () => {
    if (!cardRef.current) return;
    setCapturing(true);
    try {
      setSaveImageDialogOpen(true);
      setCaptureDataUrl(null);
    } finally {
      setCapturing(false);
    }
  }, []);

  const getImageBlob = useCallback(
    async (): Promise<{ blob: Blob; ext: string }> => {
      if (!captureDataUrl) throw new Error("No image");
      const preset = DIMENSION_PRESETS.find((p) => p.id === dimensionPreset);
      const ft = FILE_TYPES.find((f) => f.id === fileType)!;
      return new Promise((resolve, reject) => {
        const img = document.createElement("img");
        img.onload = () => {
          const origW = img.naturalWidth;
          const origH = img.naturalHeight;
          let canvas: HTMLCanvasElement;
          if (preset && preset.width > 0 && preset.height > 0) {
            const scale = Math.min(preset.width / origW, preset.height / origH);
            const drawW = Math.round(origW * scale);
            const drawH = Math.round(origH * scale);
            canvas = document.createElement("canvas");
            canvas.width = preset.width;
            canvas.height = preset.height;
            const c = canvas.getContext("2d")!;
            c.fillStyle = "hsl(var(--background))";
            c.fillRect(0, 0, canvas.width, canvas.height);
            const x = (canvas.width - drawW) / 2;
            const y = (canvas.height - drawH) / 2;
            c.drawImage(img, 0, 0, origW, origH, x, y, drawW, drawH);
          } else {
            canvas = document.createElement("canvas");
            canvas.width = origW;
            canvas.height = origH;
            canvas.getContext("2d")!.drawImage(img, 0, 0);
          }
          canvas.toBlob(
            (blob) => {
              if (blob) resolve({ blob, ext: ft.id === "jpeg" ? "jpg" : "png" });
              else reject(new Error("toBlob failed"));
            },
            ft.mime,
            ft.id === "jpeg" ? 0.92 : undefined
          );
        };
        img.onerror = () => reject(new Error("Image load failed"));
        img.src = captureDataUrl;
      });
    },
    [captureDataUrl, dimensionPreset, fileType]
  );

  const handleDownloadFromDialog = useCallback(async () => {
    try {
      const { blob, ext } = await getImageBlob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.download = `tryramadan-stats-${new Date().toISOString().split("T")[0]}.${ext}`;
      link.href = url;
      link.click();
      URL.revokeObjectURL(url);
      toast.success("Image saved");
      setSaveImageDialogOpen(false);
    } catch {
      toast.error("Could not save image. Try again.");
    }
  }, [getImageBlob]);

  const handleShareImageFromDialog = useCallback(async () => {
    try {
      const { blob, ext } = await getImageBlob();
      const file = new File(
        [blob],
        `tryramadan-stats-${new Date().toISOString().split("T")[0]}.${ext}`,
        { type: blob.type }
      );
      if (navigator.share && navigator.canShare?.({ files: [file] })) {
        await navigator.share({
          title: "TryRamadan Progress",
          text: `My Ramadan stats: ${completedDays}/${totalDays} days fasted`,
          files: [file],
        });
        toast.success("Image shared");
        setSaveImageDialogOpen(false);
      } else {
        await navigator.clipboard.writeText(window.location.origin + "/dashboard/progress");
        toast.success("Link copied. Share the image after downloading.");
      }
    } catch (err) {
      if (err instanceof Error && err.name !== "AbortError") {
        toast.error("Could not share image.");
      }
    }
  }, [getImageBlob, completedDays, totalDays]);

  return (
    <>
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
            onClick={handleSaveImageClick}
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

      {saveImageDialogOpen && includeBadges && (
        <div className="flex flex-wrap gap-2 mb-4" data-stats-badges>
          {currentStreak > 0 && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-secondary/20 text-secondary border border-secondary/30">
              <Flame className="w-3.5 h-3.5" aria-hidden />
              {currentStreak} day streak
            </span>
          )}
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-primary/15 text-primary border border-primary/30">
            <Target className="w-3.5 h-3.5" aria-hidden />
            {completionRate}% complete
          </span>
          {completedDays >= totalDays && totalDays > 0 && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-500/20 text-amber-700 dark:text-amber-400 border border-amber-500/40">
              <Trophy className="w-3.5 h-3.5" aria-hidden />
              Full month
            </span>
          )}
        </div>
      )}

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

    <Dialog open={saveImageDialogOpen} onOpenChange={setSaveImageDialogOpen}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto" aria-describedby="save-image-desc">
        <DialogTitle>Customize &amp; save image</DialogTitle>
        <p id="save-image-desc" className="text-sm text-muted-foreground">
          Preview your stats image. Choose dimensions and file type, then download or share.
        </p>
        <div className="space-y-4">
          <div className="rounded-xl border border-border bg-muted/30 p-2 flex items-center justify-center min-h-[200px]">
            {capturingPreview ? (
              <div className="flex flex-col items-center gap-2 text-muted-foreground">
                <Loader2 className="w-8 h-8 animate-spin" aria-hidden />
                <span className="text-sm">Updating preview…</span>
              </div>
            ) : captureDataUrl ? (
              <img
                src={captureDataUrl}
                alt="Preview of your stats card"
                className="max-h-[280px] w-auto object-contain rounded-lg"
              />
            ) : (
              <span className="text-sm text-muted-foreground">Loading preview…</span>
            )}
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="save-image-dimensions">Dimensions</Label>
              <select
                id="save-image-dimensions"
                value={dimensionPreset}
                onChange={(e) => setDimensionPreset(e.target.value as typeof dimensionPreset)}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
              >
                {DIMENSION_PRESETS.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="save-image-format">File type</Label>
              <select
                id="save-image-format"
                value={fileType}
                onChange={(e) => setFileType(e.target.value as typeof fileType)}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
              >
                {FILE_TYPES.map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="save-image-badges"
              checked={includeBadges}
              onChange={(e) => setIncludeBadges(e.target.checked)}
              className="h-4 w-4 rounded border-border"
            />
            <Label htmlFor="save-image-badges" className="text-sm font-normal cursor-pointer">
              Include badges on image (streak, % complete, full month)
            </Label>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button onClick={handleDownloadFromDialog}>
              <Image className="w-4 h-4 mr-2" aria-hidden />
              Download
            </Button>
            <Button variant="outline" onClick={handleShareImageFromDialog}>
              <Share2 className="w-4 h-4 mr-2" aria-hidden />
              Share image
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
    </>
  );
}
