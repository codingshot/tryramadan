import { useEffect, useRef } from "react";
import { useUserPreferences } from "@/hooks/useLocalStorage";
import { usePrayerTimes } from "@/hooks/usePrayerTimes";
import {
  usePrayerNotificationPrefs,
  useAdhanSoundEnabled,
  useAdhanNotifiedToday,
} from "@/hooks/useLocalStorage";
import { playAdhan } from "@/lib/adhanAudio";

const PRAYER_NAMES = ["Fajr", "Dhuhr", "Asr", "Maghrib", "Isha"] as const;

function timeToMinutes(timeStr: string): number {
  const [h, m] = timeStr.split(":").map(Number);
  return (h ?? 0) * 60 + (m ?? 0);
}

/**
 * When the app is open, checks every 60 seconds if current time matches a prayer time.
 * If the prayer's notification is enabled and we haven't notified for it today,
 * shows a browser notification and optionally plays adhan sound.
 */
export function AdhanScheduler() {
  const [preferences] = useUserPreferences();
  const { prayerTimes } = usePrayerTimes(
    preferences.locationCoords?.lat ?? null,
    preferences.locationCoords?.lng ?? null
  );
  const [prayerNotifications] = usePrayerNotificationPrefs();
  const [adhanSoundEnabled] = useAdhanSoundEnabled();
  const [adhanNotifiedToday, setAdhanNotifiedToday] = useAdhanNotifiedToday();
  const notifiedRef = useRef<Set<string>>(new Set());
  const notifiedStoreRef = useRef(adhanNotifiedToday);
  notifiedStoreRef.current = adhanNotifiedToday;

  useEffect(() => {
    if (preferences.userType !== "muslim") return; // Prayer alarms only for Muslim users
    if (!prayerTimes) return;

    const fireAdhan = (name: string, timeStr: string, todayStr: string) => {
      if (typeof window !== "undefined" && "Notification" in window) {
        const doNotify = () => {
          new Notification(`Adhan • ${name} • أذان`, {
            body: `Time for ${name} prayer. ${timeStr}`,
            icon: "/favicon.png",
            tag: `adhan-${todayStr}-${name}`,
          });
          if (adhanSoundEnabled) playAdhan();
        };
        if (Notification.permission === "default") {
          Notification.requestPermission().then((perm) => {
            if (perm === "granted") doNotify();
          });
        } else if (Notification.permission === "granted") {
          doNotify();
        }
      }
    };

    const checkAndNotify = () => {
      const now = new Date();
      const todayStr = now.toISOString().split("T")[0];
      const nowMinutes = now.getHours() * 60 + now.getMinutes();
      const store = notifiedStoreRef.current;

      for (const name of PRAYER_NAMES) {
        if (prayerNotifications[name] === false) continue;
        const timeStr =
          name === "Fajr"
            ? prayerTimes.fajr
            : name === "Dhuhr"
              ? prayerTimes.dhuhr
              : name === "Asr"
                ? prayerTimes.asr
                : name === "Maghrib"
                  ? prayerTimes.maghrib
                  : prayerTimes.isha;
        const prayerMinutes = timeToMinutes(timeStr);
        const diff = Math.abs(nowMinutes - prayerMinutes);
        if (diff > 2) continue;

        const key = `${todayStr}-${name}`;
        if (notifiedRef.current.has(key)) continue;
        if (store[todayStr]?.includes(name)) {
          notifiedRef.current.add(key);
          continue;
        }

        notifiedRef.current.add(key);
        setAdhanNotifiedToday((prev) => ({
          ...prev,
          [todayStr]: [...(prev[todayStr] || []), name],
        }));
        fireAdhan(name, timeStr, todayStr);
      }
    };

    checkAndNotify();
    const interval = setInterval(checkAndNotify, 60 * 1000);
    return () => clearInterval(interval);
  }, [preferences.userType, prayerTimes, prayerNotifications, adhanSoundEnabled, setAdhanNotifiedToday]);

  return null;
}
