import { motion, AnimatePresence } from "framer-motion";
import { Keyboard, X } from "lucide-react";
import { useState, useEffect } from "react";

/** True when primary input is touch (mobile/tablet) — hide keyboard shortcuts UI. */
function useIsTouchDevice() {
  const [isTouch, setIsTouch] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(pointer: coarse)");
    setIsTouch(mq.matches);
    const handler = () => setIsTouch(mq.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);
  return isTouch;
}

/** True when viewport is mobile-sized — hide keyboard shortcuts icon. */
function useIsMobileViewport() {
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 767px)");
    setIsMobile(mq.matches);
    const handler = () => setIsMobile(mq.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);
  return isMobile;
}

const SHORTCUTS = [
  { keys: ["g", "d"], description: "Go to Dashboard" },
  { keys: ["g", "t"], description: "Go to Today" },
  { keys: ["g", "s"], description: "Go to Schedule" },
  { keys: ["g", "p"], description: "Go to Prayers" },
  { keys: ["g", "q"], description: "Go to Quran" },
  { keys: ["g", "h"], description: "Go to Home" },
  { keys: [","], description: "Open Settings" },
  { keys: ["?"], description: "Show this help" },
  { keys: ["←", "→"], description: "Navigate days (Quran, Schedule)" },
  { keys: ["Ctrl", "←/→"], description: "Jump to first/last (Quran)" },
];

export function KeyboardShortcutsHelp() {
  const [isOpen, setIsOpen] = useState(false);
  const isTouch = useIsTouchDevice();
  const isMobileViewport = useIsMobileViewport();

  useEffect(() => {
    if (isTouch || isMobileViewport) return;
    const handler = () => setIsOpen(true);
    window.addEventListener("show-keyboard-shortcuts", handler);
    return () => window.removeEventListener("show-keyboard-shortcuts", handler);
  }, [isTouch, isMobileViewport]);

  // Don't show on mobile/touch devices or narrow viewports (no physical keyboard, icon clutters small screens)
  if (isTouch || isMobileViewport) return null;

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 right-4 z-40 p-3 rounded-full bg-secondary/90 text-secondary-foreground shadow-lg hover:bg-secondary transition-colors focus:outline-none focus:ring-2 focus:ring-secondary focus:ring-offset-2"
        aria-label="Show keyboard shortcuts"
        title="Keyboard shortcuts (press ?)"
      >
        <Keyboard className="w-5 h-5" />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => setIsOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-card border border-border rounded-2xl p-6 max-w-md w-full shadow-elevated"
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-display font-bold flex items-center gap-2">
                  <Keyboard className="w-5 h-5 text-secondary" />
                  Keyboard Shortcuts
                </h2>
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="p-2 rounded-full hover:bg-muted transition-colors"
                  aria-label="Close"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="space-y-2">
                {SHORTCUTS.map((shortcut, i) => (
                  <div key={i} className="flex items-center justify-between py-2 border-b border-border/50 last:border-0">
                    <span className="text-sm text-muted-foreground">{shortcut.description}</span>
                    <div className="flex items-center gap-1">
                      {shortcut.keys.map((key, j) => (
                        <span key={j}>
                          <kbd className="px-2 py-1 text-xs font-mono rounded bg-muted border border-border">
                            {key}
                          </kbd>
                          {j < shortcut.keys.length - 1 && shortcut.keys.length > 1 && shortcut.keys[0] === "g" && (
                            <span className="text-muted-foreground mx-1">then</span>
                          )}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
              <p className="text-xs text-muted-foreground mt-4">
                Press <kbd className="px-1.5 py-0.5 text-xs font-mono rounded bg-muted border border-border">?</kbd> anytime to show this help
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
