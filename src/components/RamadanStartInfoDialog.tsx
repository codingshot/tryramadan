import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Calendar, Moon } from "lucide-react";

/** Exact date for Ramadan 2025 (Gregorian and Islamic). */
const RAMADAN_2025_START = new Date("2025-02-28T00:00:00");
const RAMADAN_2025_GREGORIAN = RAMADAN_2025_START.toLocaleDateString("en", {
  weekday: "long",
  year: "numeric",
  month: "long",
  day: "numeric",
});
const RAMADAN_1446_HIJRI = "1 Ramadan 1446 AH";

interface RamadanStartInfoDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function RamadanStartInfoDialog({ open, onOpenChange }: RamadanStartInfoDialogProps) {
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
              <p className="font-medium text-foreground">Exact date for Ramadan 2025</p>
              <p className="text-foreground mt-1">
                <strong>{RAMADAN_2025_GREGORIAN}</strong>
              </p>
              <p className="text-muted-foreground mt-0.5 font-arabic">
                {RAMADAN_1446_HIJRI} · ١ رمضان ١٤٤٦
              </p>
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
