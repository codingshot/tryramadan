import { useState, useEffect, useCallback } from 'react';

export interface NotificationState {
  permission: NotificationPermission;
  supported: boolean;
}

export function useNotifications() {
  const [state, setState] = useState<NotificationState>({
    permission: 'default',
    supported: false,
  });

  useEffect(() => {
    const supported = 'Notification' in window;
    setState({
      permission: supported ? Notification.permission : 'denied',
      supported,
    });
  }, []);

  const requestPermission = useCallback(async (): Promise<boolean> => {
    if (!state.supported) return false;

    try {
      const permission = await Notification.requestPermission();
      setState(prev => ({ ...prev, permission }));
      return permission === 'granted';
    } catch (error) {
      console.error('Notification permission error:', error);
      return false;
    }
  }, [state.supported]);

  const scheduleNotification = useCallback((title: string, body: string, scheduledTime: Date) => {
    if (!state.supported || state.permission !== 'granted') return null;

    const now = new Date();
    const delay = scheduledTime.getTime() - now.getTime();

    if (delay <= 0) return null;

    const timeoutId = setTimeout(() => {
      new Notification(title, {
        body,
        icon: '/favicon.png',
        badge: '/favicon.png',
        tag: title.toLowerCase().replace(/\s+/g, '-'),
      });
    }, delay);

    return timeoutId;
  }, [state.supported, state.permission]);

  const sendTestNotification = useCallback(() => {
    if (!state.supported || state.permission !== 'granted') return;

    new Notification('TryRamadan Test', {
      body: 'Notifications are working! You will receive suhoor and iftar reminders.',
      icon: '/favicon.png',
    });
  }, [state.supported, state.permission]);

  // Schedule prayer time reminders
  const schedulePrayerReminders = useCallback((
    suhoorTime: string, // "05:23" format
    iftarTime: string,
    reminderMinutes: number = 15
  ) => {
    if (!state.supported || state.permission !== 'granted') return [];

    const timeouts: ReturnType<typeof setTimeout>[] = [];
    const today = new Date();

    // Parse suhoor time
    const [suhoorHour, suhoorMin] = suhoorTime.split(':').map(Number);
    const suhoorDate = new Date(today);
    suhoorDate.setHours(suhoorHour, suhoorMin - reminderMinutes, 0, 0);

    if (suhoorDate > today) {
      const t1 = scheduleNotification(
        'Suhoor Reminder • سحور',
        `${reminderMinutes} minutes until suhoor ends. Finish eating soon!`,
        suhoorDate
      );
      if (t1) timeouts.push(t1);
    }

    // Parse iftar time  
    const [iftarHour, iftarMin] = iftarTime.split(':').map(Number);
    const iftarDate = new Date(today);
    iftarDate.setHours(iftarHour, iftarMin - reminderMinutes, 0, 0);

    if (iftarDate > today) {
      const t2 = scheduleNotification(
        'Iftar Reminder • إفطار',
        `${reminderMinutes} minutes until iftar. Prepare to break your fast!`,
        iftarDate
      );
      if (t2) timeouts.push(t2);
    }

    // Iftar time notification
    const iftarExact = new Date(today);
    iftarExact.setHours(iftarHour, iftarMin, 0, 0);
    if (iftarExact > today) {
      const t3 = scheduleNotification(
        'Iftar Time! • وقت الإفطار',
        'It\'s time to break your fast. Bismillah! 🌙',
        iftarExact
      );
      if (t3) timeouts.push(t3);
    }

    return timeouts;
  }, [state.supported, state.permission, scheduleNotification]);

  return {
    ...state,
    requestPermission,
    scheduleNotification,
    sendTestNotification,
    schedulePrayerReminders,
  };
}
