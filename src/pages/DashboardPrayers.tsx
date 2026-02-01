import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { 
  ArrowLeft, Clock, MapPin, Bell, ChevronRight, Sun, Moon, Sunrise, Sunset
} from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { useUserPreferences } from "@/hooks/useLocalStorage";
import { usePrayerTimes } from "@/hooks/usePrayerTimes";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

const DashboardPrayers = () => {
  const [preferences] = useUserPreferences();
  const [currentTime, setCurrentTime] = useState(new Date());
  
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
  
  const getNextPrayer = () => {
    if (!prayerTimes) return null;
    
    const now = currentTime.getHours() * 60 + currentTime.getMinutes();
    
    for (const prayer of prayers) {
      const [h, m] = prayer.time.split(':').map(Number);
      const prayerMinutes = h * 60 + m;
      if (prayerMinutes > now) {
        return prayer.name;
      }
    }
    return 'Fajr'; // Next day
  };
  
  const nextPrayer = getNextPrayer();

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
            <p className="text-muted-foreground mt-2 flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              {preferences.location?.split(',')[0] || 'Location not set'}
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
                <p className="mt-3 text-secondary">
                  Next: <span className="font-bold">{nextPrayer}</span>
                </p>
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
                    
                    <div className="text-right">
                      <span className="text-2xl font-bold">{prayer.time}</span>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
          
          {/* Prayer tutorial link */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mt-8 p-4 rounded-2xl bg-muted/50 border border-border"
          >
            <Link 
              to="/learn/prayers"
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
