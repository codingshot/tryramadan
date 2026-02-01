import { useState, useEffect } from "react";

/** BeforeInstallPromptEvent is not in all browsers' types */
interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

const DISMISS_STORAGE_KEY = "tryramadan-pwa-install-dismissed";

export function usePWAInstall() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [dismissed, setDismissed] = useState(() => {
    if (typeof window === "undefined") return false;
    try {
      return window.localStorage.getItem(DISMISS_STORAGE_KEY) === "1";
    } catch {
      return false;
    }
  });

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };
    window.addEventListener("beforeinstallprompt", handler);

    const checkStandalone = () => {
      const standalone =
        window.matchMedia("(display-mode: standalone)").matches ||
        (window.navigator as { standalone?: boolean }).standalone === true ||
        document.referrer.includes("android-app://");
      setIsInstalled(standalone);
    };
    checkStandalone();
    window.matchMedia("(display-mode: standalone)").addEventListener("change", checkStandalone);

    return () => {
      window.removeEventListener("beforeinstallprompt", handler);
    };
  }, []);

  const prompt = async (): Promise<boolean> => {
    if (!deferredPrompt) return false;
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") setDeferredPrompt(null);
    return outcome === "accepted";
  };

  const dismiss = () => {
    setDismissed(true);
    try {
      window.localStorage.setItem(DISMISS_STORAGE_KEY, "1");
    } catch {
      // ignore
    }
  };

  const canShow =
    !isInstalled &&
    !dismissed &&
    !!deferredPrompt &&
    typeof window !== "undefined" &&
    "serviceWorker" in navigator;

  return { canShow, prompt, dismiss, isInstalled };
}
