import { useEffect, useRef } from "react";
import { useUserPreferences } from "@/hooks/useLocalStorage";
import { useNotificationSettings } from "@/hooks/useLocalStorage";
import { usePrayerTimes } from "@/hooks/usePrayerTimes";

const REMINDERS_SENT_KEY = "tryramadan-reminders-sent";

type ReminderType = "suhoor" | "iftar" | "iftar-time";

function getRemindersSent(): Record<string, ReminderType[]> {
  try {
    const raw = window.localStorage.getItem(REMINDERS_SENT_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as Record<string, string[]>;
    return parsed as Record<string, ReminderType[]>;
  } catch {
    return {};
  }
}

function markReminderSent(dateStr: string, type: ReminderType) {
  try {
    const prev = getRemindersSent();
    const list = prev[dateStr] ?? [];
    if (list.includes(type)) return;
    const next = { ...prev, [dateStr]: [...list, type] };
    window.localStorage.setItem(REMINDERS_SENT_KEY, JSON.stringify(next));
  } catch {
    // ignore
  }
}

function timeToMinutes(timeStr: string): number {
  const [h, m] = timeStr.split(":").map(Number);
  return (h ?? 0) * 60 + (m ?? 0);
}

/**
 * When the app is open, checks every 60 seconds if we're in the suhoor/iftar reminder window.
 * Uses NotificationSettings (suhoorEnabled, iftarEnabled, suhoorMinutesBefore, iftarMinutesBefore)
 * and today's prayer times (imsak = suhoor end, maghrib = iftar). Fires browser notifications
 * and marks them sent per day so we don't double-fire.
 */
export function ReminderScheduler() {
  const [preferences] = useUserPreferences();
  const [notifSettings] = useNotificationSettings();
  const { prayerTimes } = usePrayerTimes(
    preferences.locationCoords?.lat ?? null,
    preferences.locationCoords?.lng ?? null
  );
  const sentRef = useRef<Record<string, ReminderType[]>>(getRemindersSent());

  useEffect(() => {
    if (!prayerTimes) return;
    if (!("Notification" in window)) return;
    if (Notification.permission !== "granted") return;

    const checkAndNotify = () => {
      sentRef.current = getRemindersSent();
      const now = new Date();
      const todayStr = now.toISOString().split("T")[0];
      const nowMinutes = now.getHours() * 60 + now.getMinutes();
      let sent = (sentRef.current[todayStr] ?? []) as ReminderType[];

      const addSent = (type: ReminderType) => {
        sent = [...sent, type];
        sentRef.current = { ...sentRef.current, [todayStr]: sent };
        markReminderSent(todayStr, type);
      };

      // Suhoor reminder: X minutes before Imsak (stop eating)
      if (notifSettings.suhoorEnabled) {
        const imsakMin = timeToMinutes(prayerTimes.imsak);
        const reminderMin = imsakMin - notifSettings.suhoorMinutesBefore;
        const diff = Math.abs(nowMinutes - reminderMin);
        if (diff <= 2 && !sent.includes("suhoor")) {
          addSent("suhoor");
          new Notification("Suhoor Reminder • سحور", {
            body: `${notifSettings.suhoorMinutesBefore} minutes until suhoor ends (Imsak). Finish eating soon!`,
            icon: "/favicon.png",
            tag: `suhoor-${todayStr}`,
          });
        }
      }

      // Iftar reminder: X minutes before Maghrib
      if (notifSettings.iftarEnabled) {
        const maghribMin = timeToMinutes(prayerTimes.maghrib);
        const reminderMin = maghribMin - notifSettings.iftarMinutesBefore;
        const diff = Math.abs(nowMinutes - reminderMin);
        if (diff <= 2 && !sent.includes("iftar")) {
          addSent("iftar");
          new Notification("Iftar Reminder • إفطار", {
            body: `${notifSettings.iftarMinutesBefore} minutes until iftar. Prepare to break your fast!`,
            icon: "/favicon.png",
            tag: `iftar-reminder-${todayStr}`,
          });
        }
        // Iftar time (at Maghrib)
        const atIftarDiff = Math.abs(nowMinutes - maghribMin);
        if (atIftarDiff <= 2 && !sent.includes("iftar-time")) {
          addSent("iftar-time");
          new Notification("Iftar Time! • وقت الإفطار", {
            body: "It's time to break your fast. Bismillah! 🌙",
            icon: "/favicon.png",
            tag: `iftar-time-${todayStr}`,
          });
        }
      }
    };

    checkAndNotify();
    const interval = setInterval(checkAndNotify, 60 * 1000);
    return () => clearInterval(interval);
  }, [prayerTimes, notifSettings.suhoorEnabled, notifSettings.iftarEnabled, notifSettings.suhoorMinutesBefore, notifSettings.iftarMinutesBefore]);

  return null;
}
