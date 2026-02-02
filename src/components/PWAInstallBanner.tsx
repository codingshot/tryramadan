import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Smartphone, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePWAInstall } from "@/hooks/usePWAInstall";

/** Shown on dashboard when the app is installable and user hasn't dismissed. */
export function PWAInstallBanner() {
  const { canShow, prompt, dismiss } = usePWAInstall();
  const [installing, setInstalling] = useState(false);

  const handleInstall = async () => {
    setInstalling(true);
    try {
      await prompt();
    } finally {
      setInstalling(false);
    }
  };

  if (!canShow) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        className="mb-6 p-4 rounded-2xl bg-primary/10 border border-primary/30 flex flex-wrap items-center justify-between gap-4"
      >
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center flex-shrink-0">
            <Smartphone className="w-6 h-6 text-foreground" aria-hidden />
          </div>
          <div className="min-w-0">
            <p className="font-semibold text-foreground">Install TryRamadan</p>
            <p className="text-sm text-muted-foreground">
              Add to your home screen for quick access to your fasting timer and prayer times.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <Button
            variant="default"
            size="sm"
            onClick={handleInstall}
            disabled={installing}
            className="bg-primary text-primary-foreground hover:bg-primary/90"
          >
            {installing ? "Installing…" : "Install app on home screen"}
          </Button>
          <button
            type="button"
            onClick={dismiss}
            className="p-2 rounded-lg hover:bg-muted transition-colors"
            aria-label="Dismiss"
          >
            <X className="w-5 h-5 text-muted-foreground" />
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
