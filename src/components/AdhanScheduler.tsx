import { useEffect, useRef, useState } from "react";
import { useUserPreferences, useDisplayTimezone } from "@/hooks/useLocalStorage";
import { usePrayerTimes } from "@/hooks/usePrayerTimes";
import {
  usePrayerNotificationPrefs,
  useAdhanSoundEnabled,
  useAdhanNotifiedToday,
} from "@/hooks/useLocalStorage";
import { useNotifications } from "@/hooks/useNotifications";
import { playAdhan } from "@/lib/adhanAudio";
import { getTodayStringInTimezone, toLocalDateString, getNowInTimezone } from "@/lib/utils";
import { IftarDuaDialog } from "@/components/IftarDuaDialog";

const PRAYER_NAMES = ["Fajr", "Dhuhr", "Asr", "Maghrib", "Isha"] as const;

function timeToMinutes(timeStr: string): number {
  const [h, m] = timeStr.split(":").map(Number);
  return (h ?? 0) * 60 + (m ?? 0);
}

/**
 * When the app is open, checks every 60 seconds if current time matches a prayer time.
 * At Maghrib (iftar): shows Iftar Dua popup and plays adhan for everyone (if adhan sound enabled).
 * For Muslim users with notifications: also shows browser notification for each prayer.
 */
export function AdhanScheduler() {
  const [preferences] = useUserPreferences();
  const displayTimezone = useDisplayTimezone();
  const { permission, requestPermission } = useNotifications();
  const { prayerTimes } = usePrayerTimes(
    preferences.locationCoords?.lat ?? null,
    preferences.locationCoords?.lng ?? null,
    displayTimezone
  );
  const [prayerNotifications] = usePrayerNotificationPrefs();
  const [adhanSoundEnabled] = useAdhanSoundEnabled();
  const [adhanNotifiedToday, setAdhanNotifiedToday] = useAdhanNotifiedToday();
  const notifiedRef = useRef<Set<string>>(new Set());
  const notifiedStoreRef = useRef(adhanNotifiedToday);
  notifiedStoreRef.current = adhanNotifiedToday;
  const iftarPopupShownForDayRef = useRef<string | null>(null);
  const [showIftarPopup, setShowIftarPopup] = useState(false);
  const permissionRequestedRef = useRef(false);

  // When prayer/iftar notifications are enabled, request permission so push notifications fire when alarm time comes
  const hasPrayerNotification = preferences.userType === "muslim" && preferences.notificationsEnabled && PRAYER_NAMES.some((name) => prayerNotifications[name] !== false);
  useEffect(() => {
    if (!hasPrayerNotification || permission !== "default" || permissionRequestedRef.current) return;
    permissionRequestedRef.current = true;
    requestPermission();
  }, [hasPrayerNotification, permission, requestPermission]);

  useEffect(() => {
    if (!prayerTimes) return;

    const checkIftarAndNotify = () => {
      const now = new Date();
      const todayStr = displayTimezone ? getTodayStringInTimezone(displayTimezone) : toLocalDateString(now);
      const nowInTz = displayTimezone ? getNowInTimezone(displayTimezone) : { hours: now.getHours(), minutes: now.getMinutes(), seconds: now.getSeconds() };
      const nowMinutes = nowInTz.hours * 60 + nowInTz.minutes;

      // At iftar time (within 2 min of Maghrib): show Iftar Dua popup and play adhan (once per day, for everyone)
      if (prayerTimes.maghrib) {
        const maghribMinutes = timeToMinutes(prayerTimes.maghrib);
        const diff = Math.abs(nowMinutes - maghribMinutes);
        if (diff <= 2 && iftarPopupShownForDayRef.current !== todayStr) {
          iftarPopupShownForDayRef.current = todayStr;
          setShowIftarPopup(true);
          if (adhanSoundEnabled) playAdhan();
        }
      }

      // Prayer notifications (Muslim users only)
      if (preferences.userType !== "muslim" || !preferences.notificationsEnabled) return;

      const fireAdhan = (name: string, timeStr: string, dayStr: string) => {
        if (typeof window !== "undefined" && "Notification" in window) {
          const doNotify = () => {
            new Notification(`Adhan • ${name} • أذان`, {
              body: `Time for ${name} prayer. ${timeStr}`,
              icon: "/favicon.png",
              tag: `adhan-${dayStr}-${name}`,
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

    checkIftarAndNotify();
    const interval = setInterval(checkIftarAndNotify, 60 * 1000);
    return () => clearInterval(interval);
  }, [preferences.userType, preferences.notificationsEnabled, displayTimezone, prayerTimes, prayerNotifications, adhanSoundEnabled, setAdhanNotifiedToday]);

  return (
    <>
      <IftarDuaDialog open={showIftarPopup} onOpenChange={setShowIftarPopup} />
    </>
  );
}
