import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Sunset, Check, AlertCircle } from "lucide-react";
import { EXTERNAL_LINKS } from "@/lib/config";

export interface IftarDuaDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** When true, show "Mark fast as complete" and "I broke fast earlier" CTAs. */
  isFastingToday?: boolean;
  /** Call when user taps "Mark fast as complete". Caller should mark complete and close. */
  onMarkComplete?: () => void;
  /** Call when user taps "I broke fast earlier". Caller should close and e.g. open break-fast reason or navigate. */
  onBreakFastEarlier?: () => void;
}

/** Iftar dua (Sunan Abi Dawud 2358): Dhahaba al-zama' wa abtalat al-'urooq wa thabat al-ajr in sha Allah */
const IFTAR_DUA_ARABIC = "ذَهَبَ الظَّمَأُ وَابْتَلَّتْ الْعُرُوقُ وَثَبَتَ الأَجْرُ إِنْ شَاءَ اللَّهُ";
const IFTAR_DUA_TRANSLITERATION = "Dhahaba al-zama' wa abtalat al-'urooq wa thabat al-ajr in sha Allah";
const IFTAR_DUA_TRANSLATION = "The thirst is gone, the veins are moistened, and the reward is confirmed, if Allah wills.";

export function IftarDuaDialog({
  open,
  onOpenChange,
  isFastingToday = false,
  onMarkComplete,
  onBreakFastEarlier,
}: IftarDuaDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md sm:max-w-lg" aria-describedby="iftar-dua-desc">
        <DialogTitle className="flex items-center gap-2 text-xl">
          <Sunset className="w-6 h-6 text-secondary shrink-0" aria-hidden />
          Iftar time — time to break your fast
        </DialogTitle>
        <DialogDescription id="iftar-dua-desc" className="sr-only">
          Iftar dua and actions to mark your fast complete or log that you broke fast earlier.
        </DialogDescription>
        <div className="space-y-4 pt-2">
          <p className="text-sm text-muted-foreground">
            Saying the Iftar dua when breaking the fast:
          </p>
          <p className="text-2xl sm:text-3xl font-arabic text-right leading-relaxed" dir="rtl">
            {IFTAR_DUA_ARABIC}
          </p>
          <p className="text-sm font-medium">
            {IFTAR_DUA_TRANSLITERATION}
          </p>
          <p className="text-sm text-muted-foreground italic">
            {IFTAR_DUA_TRANSLATION}
          </p>
          <a
            href={EXTERNAL_LINKS.iftarDuaHadith}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex"
          >
            <Button variant="outline" size="sm" className="gap-2">
              Read on Sunnah.com
            </Button>
          </a>

          {/* CTAs: Mark complete or I broke fast earlier */}
          {isFastingToday && (onMarkComplete != null || onBreakFastEarlier != null) && (
            <div className="pt-4 border-t border-border space-y-3">
              <p className="text-sm font-medium text-foreground">Log your fast</p>
              <div className="flex flex-col sm:flex-row gap-2">
                {onMarkComplete != null && (
                  <Button
                    onClick={() => {
                      onMarkComplete();
                      onOpenChange(false);
                    }}
                    className="flex-1 gap-2 bg-primary text-primary-foreground hover:bg-primary/90"
                  >
                    <Check className="w-4 h-4 shrink-0" aria-hidden />
                    Mark fast as complete
                  </Button>
                )}
                {onBreakFastEarlier != null && (
                  <Button
                    variant="outline"
                    onClick={() => {
                      onBreakFastEarlier();
                      onOpenChange(false);
                    }}
                    className="flex-1 gap-2"
                  >
                    <AlertCircle className="w-4 h-4 shrink-0" aria-hidden />
                    I broke fast earlier
                  </Button>
                )}
              </div>
              {onBreakFastEarlier != null && (
                <p className="text-xs text-muted-foreground">
                  Broke fast earlier during the fasting window? Tap &quot;I broke fast earlier&quot; — we&apos;ll ask when and log a reason (e.g. illness, travel). No judgment.
                </p>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
