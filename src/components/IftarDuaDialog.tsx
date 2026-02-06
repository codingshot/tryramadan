import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Sunset } from "lucide-react";
import { EXTERNAL_LINKS } from "@/lib/config";

export interface IftarDuaDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/** Iftar dua (Sunan Abi Dawud 2358): Dhahaba al-zama' wa abtalat al-'urooq wa thabat al-ajr in sha Allah */
const IFTAR_DUA_ARABIC = "ذَهَبَ الظَّمَأُ وَابْتَلَّتْ الْعُرُوقُ وَثَبَتَ الأَجْرُ إِنْ شَاءَ اللَّهُ";
const IFTAR_DUA_TRANSLITERATION = "Dhahaba al-zama' wa abtalat al-'urooq wa thabat al-ajr in sha Allah";
const IFTAR_DUA_TRANSLATION = "The thirst is gone, the veins are moistened, and the reward is confirmed, if Allah wills.";

export function IftarDuaDialog({ open, onOpenChange }: IftarDuaDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md sm:max-w-lg" aria-describedby="iftar-dua-desc">
        <DialogTitle className="flex items-center gap-2 text-xl">
          <Sunset className="w-6 h-6 text-secondary shrink-0" aria-hidden />
          Iftar time — time to break your fast
        </DialogTitle>
        <div id="iftar-dua-desc" className="space-y-4 pt-2">
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
        </div>
      </DialogContent>
    </Dialog>
  );
}
