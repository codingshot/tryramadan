import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Calendar, Moon } from "lucide-react";
import { getNextRamadanStart } from "@/lib/ramadan";

/** Approximate Hijri year for a Gregorian year (e.g. 2025 → 1446 AH). */
function getApproxHijriYear(gregorianYear: number): number {
  return Math.round(622 + (gregorianYear - 622) * (33 / 32));
}

interface RamadanStartInfoDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function RamadanStartInfoDialog({ open, onOpenChange }: RamadanStartInfoDialogProps) {
  const nextStart = getNextRamadanStart();
  const gregorianFormatted = nextStart.toLocaleDateString("en", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  const hijriYear = getApproxHijriYear(nextStart.getFullYear());

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md bg-background text-foreground border-border">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg">
            <Calendar className="w-5 h-5 text-secondary" />
            When does Ramadan start?
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 text-sm">
          <p className="text-muted-foreground">
            Ramadan begins with the <strong>sighting of the new moon</strong> (hilāl) that marks the start of the month of Ramadan in the Islamic (Hijri) calendar. Because the Islamic calendar is lunar, the exact Gregorian date varies by year and by region (some communities rely on local sighting, others on a global announcement).
          </p>
          <div className="flex items-start gap-2 p-3 rounded-xl bg-secondary/10 border border-secondary/20">
            <Moon className="w-4 h-4 text-secondary shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-foreground">Upcoming Ramadan (approximate)</p>
              <p className="text-foreground mt-1">
                <strong>{gregorianFormatted}</strong>
              </p>
              <p className="text-muted-foreground mt-0.5 font-arabic">
                1 Ramadan {hijriYear} AH · ١ رمضان {hijriYear}
              </p>
              <p className="text-xs text-muted-foreground mt-1">Moon sighting may shift the date by a day.</p>
            </div>
          </div>
          <p className="text-xs text-muted-foreground">
            Double‑click the “days until Ramadan” badge anytime to see this info.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
