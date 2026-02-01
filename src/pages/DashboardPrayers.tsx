import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { 
  ArrowLeft, ChevronRight, Sun, Moon, Sunrise, Sunset, Check, Bell
} from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { useUserPreferences, useLocalStorage, usePrayerNotificationPrefs } from "@/hooks/useLocalStorage";
import { usePrayerTimes } from "@/hooks/usePrayerTimes";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { PrayerLocationBadge } from "@/components/PrayerLocationBadge";

const DashboardPrayers = () => {
  const [preferences] = useUserPreferences();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [prayerTracker, setPrayerTracker] = useLocalStorage<Record<string, Record<string, boolean>>>("tryramadan-prayer-tracker", {});
  const [prayerNotifications, setPrayerNotifications] = usePrayerNotificationPrefs();
  const todayStr = currentTime.toISOString().split("T")[0];
  const todayPrayers = prayerTracker[todayStr] || {};
  const setTodayPrayer = (name: string, done: boolean) => {
    setPrayerTracker((prev) => ({
      ...prev,
      [todayStr]: { ...(prev[todayStr] || {}), [name]: done },
    }));
  };
  
  const { prayerTimes, hijriDate, loading } = usePrayerTimes(
    preferences.locationCoords?.lat || null,
    preferences.locationCoords?.lng || null
  );
  
  useEffect(() => {
    const interval = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);
  
  const prayers = prayerTimes ? [
    { name: 'Fajr', nameAr: 'الفجر', time: prayerTimes.fajr, icon: Moon, description: 'Dawn prayer - marks the start of fasting', highlight: true },
    { name: 'Sunrise', nameAr: 'الشروق', time: prayerTimes.sunrise, icon: Sunrise, description: 'Sun rises - fasting continues' },
    { name: 'Dhuhr', nameAr: 'الظهر', time: prayerTimes.dhuhr, icon: Sun, description: 'Midday prayer' },
    { name: 'Asr', nameAr: 'العصر', time: prayerTimes.asr, icon: Sun, description: 'Afternoon prayer' },
    { name: 'Maghrib', nameAr: 'المغرب', time: prayerTimes.maghrib, icon: Sunset, description: 'Sunset prayer - time to break fast (Iftar)', highlight: true },
    { name: 'Isha', nameAr: 'العشاء', time: prayerTimes.isha, icon: Moon, description: 'Night prayer' },
  ] : [];
  
  const getNextPrayer = (): { name: string; minutesUntil: number } | null => {
    if (!prayerTimes || prayers.length === 0) return null;
    const now = currentTime.getHours() * 60 + currentTime.getMinutes() + currentTime.getSeconds() / 60;
    for (const prayer of prayers) {
      const [h, m] = prayer.time.split(':').map(Number);
      const prayerMinutes = h * 60 + m;
      if (prayerMinutes > now) return { name: prayer.name, minutesUntil: prayerMinutes - now };
    }
    const [fajrH, fajrM] = prayers[0].time.split(':').map(Number);
    const fajrToday = fajrH * 60 + fajrM;
    const minutesUntilMidnight = 24 * 60 - now;
    return { name: "Fajr", minutesUntil: minutesUntilMidnight + fajrToday };
  };
  
  const nextPrayerResult = getNextPrayer();
  const nextPrayer = nextPrayerResult?.name ?? null;
  const minutesUntilNext = nextPrayerResult?.minutesUntil ?? 0;
  const countdownNext = nextPrayer ? `${Math.floor(minutesUntilNext / 60)}h ${Math.floor(minutesUntilNext % 60)}m` : "";

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="pt-20 pb-16">
        <div className="container mx-auto px-4 max-w-4xl">
          <Link 
            to="/dashboard" 
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </Link>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <h1 className="text-2xl md:text-3xl font-display font-bold">
              Prayer Times
              <span className="block font-arabic text-lg text-secondary mt-1">أوقات الصلاة</span>
            </h1>
            <p className="text-muted-foreground mt-2 flex flex-wrap items-center gap-x-4 gap-y-1">
              <PrayerLocationBadge />
            </p>
          </motion.div>
          
          {/* Current time and date */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="p-6 rounded-2xl bg-primary text-primary-foreground mb-8"
          >
            <div className="text-center">
              <p className="text-sm opacity-80 mb-1">
                {currentTime.toLocaleDateString('en', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
              </p>
              {hijriDate && (
                <p className="text-sm opacity-80 mb-3">
                  {hijriDate.day} {hijriDate.month} {hijriDate.year} AH
                  <span className="font-arabic ml-2">{hijriDate.monthAr}</span>
                </p>
              )}
              <p className="text-5xl font-bold font-display">
                {currentTime.toLocaleTimeString('en', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
              </p>
              {nextPrayer && (
                <div className="mt-3">
                  <p className="text-secondary">
                    Next: <span className="font-bold">{nextPrayer}</span>
                  </p>
                  <p className="text-sm opacity-90">Countdown: <span className="font-bold">{countdownNext}</span></p>
                </div>
              )}
            </div>
          </motion.div>
          
          {/* Prayer times list */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-3"
          >
            {loading ? (
              <div className="text-center py-8 text-muted-foreground">Loading prayer times...</div>
            ) : prayers.map((prayer, index) => {
              const Icon = prayer.icon;
              const isNext = prayer.name === nextPrayer;
              
              return (
                <motion.div
                  key={prayer.name}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 * index }}
                  className={`
                    p-4 rounded-2xl border transition-all
                    ${isNext ? 'bg-secondary/20 border-secondary shadow-gold' : 'bg-card border-border'}
                    ${prayer.highlight ? 'ring-1 ring-secondary/30' : ''}
                  `}
                >
                  <div className="flex items-center gap-4">
                    <div className={`
                      w-12 h-12 rounded-xl flex items-center justify-center
                      ${isNext ? 'bg-secondary text-secondary-foreground' : 'bg-muted'}
                    `}>
                      <Icon className="w-6 h-6" />
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold">{prayer.name}</span>
                        <span className="text-secondary font-arabic">{prayer.nameAr}</span>
                        {isNext && (
                          <span className="px-2 py-0.5 rounded-full bg-secondary text-secondary-foreground text-xs">
                            Next
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">{prayer.description}</p>
                    </div>
                    
                    <div className="text-right flex items-center gap-3 flex-wrap justify-end">
                      {["Fajr", "Dhuhr", "Asr", "Maghrib", "Isha"].includes(prayer.name) && (
                        <div className="flex items-center gap-2">
                          <Bell className="w-4 h-4 text-muted-foreground" />
                          <Switch
                            id={`notify-${prayer.name}`}
                            checked={prayerNotifications[prayer.name] !== false}
                            onCheckedChange={(checked) => {
                              setPrayerNotifications((prev) => ({ ...prev, [prayer.name]: checked }));
                            }}
                          />
                          <Label htmlFor={`notify-${prayer.name}`} className="text-xs text-muted-foreground sr-only">
                            Notify for {prayer.name}
                          </Label>
                        </div>
                      )}
                      <span className="text-2xl font-bold">{prayer.time}</span>
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          setTodayPrayer(prayer.name, !todayPrayers[prayer.name]);
                        }}
                        className={`p-2 rounded-lg border-2 transition-colors ${
                          todayPrayers[prayer.name] ? "bg-secondary border-secondary text-secondary-foreground" : "border-border hover:border-secondary"
                        }`}
                        title="Mark as prayed"
                      >
                        <Check className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
          
          {/* Notification note */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-6 p-4 rounded-2xl bg-muted/50 border border-border text-sm text-muted-foreground"
          >
            <p className="flex items-center gap-2">
              <Bell className="w-4 h-4 shrink-0" />
              Prayer reminders use browser notifications. Enable notifications in your device settings and allow this site to send them when prompted.
            </p>
          </motion.div>

          {/* Prayer tutorial link */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mt-8 p-4 rounded-2xl bg-muted/50 border border-border"
          >
            <Link 
              to="/dashboard/learn"
              className="flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">🤲</span>
                <div>
                  <span className="font-medium">New to Islamic Prayer?</span>
                  <p className="text-sm text-muted-foreground">Learn about the five daily prayers</p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-muted-foreground" />
            </Link>
          </motion.div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default DashboardPrayers;
