import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { 
  Moon, Sun, Clock, Calendar, MapPin, Settings, 
  TrendingUp, Check, Bell, ChevronRight, Flame,
  Utensils, Coffee, Droplets
} from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { FastingTimer } from "@/components/FastingTimer";
import { SunnahFastingBadge } from "@/components/SunnahFastingBadge";
import { DailyHadith } from "@/components/DailyHadith";
import { useUserPreferences, useFastingProgress } from "@/hooks/useLocalStorage";
import { usePrayerTimes, getSunnahFastingInfo, checkAyyamAlBeed } from "@/hooks/usePrayerTimes";
import { useAutoLocation } from "@/hooks/useLocation";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Footer } from "@/components/Footer";

const Dashboard = () => {
  const navigate = useNavigate();
  const [preferences, setPreferences] = useUserPreferences();
  const [progress, setProgress] = useFastingProgress();
  const [isFasting, setIsFasting] = useState(true);
  const [ayyamAlBeed, setAyyamAlBeed] = useState<{ isAyyamAlBeed: boolean; hijriDay: number } | null>(null);
  
  // Auto-detect location if not set
  const { location: autoLocation, loading: locationLoading } = useAutoLocation();
  
  // Use saved location or auto-detected
  const locationCoords = preferences.locationCoords || 
    (autoLocation ? { lat: autoLocation.lat, lng: autoLocation.lng } : null);
  
  // Get prayer times
  const { prayerTimes, hijriDate, loading: timesLoading } = usePrayerTimes(
    locationCoords?.lat || null,
    locationCoords?.lng || null
  );
  
  const sunnahInfo = getSunnahFastingInfo();
  
  // Update location in preferences if auto-detected
  useEffect(() => {
    if (autoLocation && !preferences.location) {
      setPreferences({
        ...preferences,
        location: autoLocation.displayName,
        locationCoords: { lat: autoLocation.lat, lng: autoLocation.lng }
      });
    }
  }, [autoLocation, preferences, setPreferences]);
  
  // Check Ayyam al-Beed
  useEffect(() => {
    if (locationCoords) {
      checkAyyamAlBeed(locationCoords.lat, locationCoords.lng).then(setAyyamAlBeed);
    }
  }, [locationCoords]);
  
  // Determine if currently fasting based on time
  useEffect(() => {
    if (prayerTimes) {
      const now = new Date();
      const [fajrH, fajrM] = prayerTimes.fajr.split(':').map(Number);
      const [maghribH, maghribM] = prayerTimes.maghrib.split(':').map(Number);
      
      const fajrTime = new Date();
      fajrTime.setHours(fajrH, fajrM, 0);
      
      const maghribTime = new Date();
      maghribTime.setHours(maghribH, maghribM, 0);
      
      setIsFasting(now >= fajrTime && now < maghribTime);
    }
  }, [prayerTimes]);
  
  // Calculate streak
  const calculateStreak = () => {
    const today = new Date().toISOString().split('T')[0];
    const completedDays = progress.completedDays.sort().reverse();
    
    let streak = 0;
    let currentDate = new Date();
    
    for (const day of completedDays) {
      const dayStr = new Date(currentDate).toISOString().split('T')[0];
      if (day === dayStr) {
        streak++;
        currentDate.setDate(currentDate.getDate() - 1);
      } else {
        break;
      }
    }
    
    return streak;
  };
  
  // Toggle today's fast as complete
  const toggleTodayComplete = () => {
    const today = new Date().toISOString().split('T')[0];
    const isComplete = progress.completedDays.includes(today);
    
    if (isComplete) {
      setProgress({
        ...progress,
        completedDays: progress.completedDays.filter(d => d !== today)
      });
    } else {
      setProgress({
        ...progress,
        completedDays: [...progress.completedDays, today]
      });
    }
  };
  
  const todayComplete = progress.completedDays.includes(new Date().toISOString().split('T')[0]);
  const streak = calculateStreak();

  // Quick tips based on time of day
  const getQuickTip = () => {
    const hour = new Date().getHours();
    if (hour < 6) return { icon: Coffee, text: "Time for Suhoor! Eat protein-rich foods.", textAr: "وقت السحور! تناول أطعمة غنية بالبروتين" };
    if (hour < 12) return { icon: Droplets, text: "Remember to make morning duas.", textAr: "لا تنسى أذكار الصباح" };
    if (hour < 15) return { icon: TrendingUp, text: "Stay productive, you're halfway there!", textAr: "ابق منتجاً، أنت في المنتصف!" };
    if (hour < 18) return { icon: Sun, text: "Almost Iftar time, prepare your meal.", textAr: "اقترب وقت الإفطار، حضّر وجبتك" };
    return { icon: Utensils, text: "Don't overeat at Iftar. Start with dates.", textAr: "لا تفرط في الإفطار. ابدأ بالتمر" };
  };
  
  const tip = getQuickTip();

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="pt-20 pb-16">
        <div className="container mx-auto px-4">
          {/* Header */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-2xl md:text-3xl font-display font-bold">
                  {preferences.userType === 'muslim' ? 'Ramadan Mubarak' : 'Your Fasting Journey'}
                  <span className="block font-arabic text-lg text-secondary mt-1">
                    {preferences.userType === 'muslim' ? 'رمضان مبارك' : 'رحلة صيامك'}
                  </span>
                </h1>
              </div>
              
              <Tooltip>
                <TooltipTrigger asChild>
                  <button className="p-2 rounded-full hover:bg-muted transition-colors">
                    <Settings className="w-5 h-5 text-muted-foreground" />
                  </button>
                </TooltipTrigger>
                <TooltipContent>Settings • الإعدادات</TooltipContent>
              </Tooltip>
            </div>
            
            {/* Location display */}
            <div className="flex items-center gap-2 text-muted-foreground">
              <MapPin className="w-4 h-4" />
              <span className="text-sm">
                {preferences.location?.split(',')[0] || autoLocation?.name || 'Detecting location...'}
              </span>
              {(locationLoading || timesLoading) && (
                <span className="text-xs text-muted-foreground animate-pulse">updating...</span>
              )}
            </div>
          </motion.div>
          
          {/* Main Timer Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-8"
          >
            <FastingTimer 
              suhoorTime={prayerTimes?.imsak} 
              iftarTime={prayerTimes?.maghrib}
              isFasting={isFasting}
            />
          </motion.div>
          
          {/* Quick Actions Grid */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
          >
            {/* Mark Complete */}
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={toggleTodayComplete}
                  className={`p-4 rounded-2xl border-2 transition-all ${
                    todayComplete 
                      ? 'bg-secondary/20 border-secondary' 
                      : 'bg-card border-border hover:border-secondary'
                  }`}
                >
                  <div className="flex flex-col items-center gap-2">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      todayComplete ? 'bg-secondary text-secondary-foreground' : 'bg-muted'
                    }`}>
                      <Check className="w-5 h-5" />
                    </div>
                    <span className="text-sm font-medium">
                      {todayComplete ? 'Completed!' : 'Mark Done'}
                    </span>
                    <span className="text-xs text-muted-foreground font-arabic">
                      {todayComplete ? 'مكتمل' : 'تم الصيام'}
                    </span>
                  </div>
                </button>
              </TooltipTrigger>
              <TooltipContent>
                {todayComplete 
                  ? "Today's fast is marked complete! Click to undo." 
                  : "Mark today's fast as complete when you break your fast at Iftar."}
              </TooltipContent>
            </Tooltip>
            
            {/* Streak */}
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="p-4 rounded-2xl bg-card border border-border">
                  <div className="flex flex-col items-center gap-2">
                    <div className="w-10 h-10 rounded-full bg-gradient-gold flex items-center justify-center">
                      <Flame className="w-5 h-5 text-foreground" />
                    </div>
                    <span className="text-2xl font-bold text-secondary">{streak}</span>
                    <span className="text-xs text-muted-foreground">Day Streak • أيام متتالية</span>
                  </div>
                </div>
              </TooltipTrigger>
              <TooltipContent>
                You've completed {streak} consecutive days of fasting!
              </TooltipContent>
            </Tooltip>
            
            {/* Total Days */}
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="p-4 rounded-2xl bg-card border border-border">
                  <div className="flex flex-col items-center gap-2">
                    <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                      <Calendar className="w-5 h-5 text-foreground" />
                    </div>
                    <span className="text-2xl font-bold">{progress.completedDays.length}</span>
                    <span className="text-xs text-muted-foreground">Total Days • إجمالي الأيام</span>
                  </div>
                </div>
              </TooltipTrigger>
              <TooltipContent>
                Total fasting days completed this month
              </TooltipContent>
            </Tooltip>
            
            {/* Sunnah Days */}
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="p-4 rounded-2xl bg-card border border-border">
                  <div className="flex flex-col items-center gap-2">
                    <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                      <Moon className="w-5 h-5 text-primary" />
                    </div>
                    <span className="text-2xl font-bold">{progress.sunnahDaysCompleted}</span>
                    <span className="text-xs text-muted-foreground">Sunnah Days • أيام السنة</span>
                  </div>
                </div>
              </TooltipTrigger>
              <TooltipContent>
                Voluntary fasting days (Mon/Thu/White Days) completed
              </TooltipContent>
            </Tooltip>
          </motion.div>
          
          {/* Sunnah Fasting Info */}
          {(sunnahInfo || ayyamAlBeed?.isAyyamAlBeed) && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="mb-8"
            >
              <SunnahFastingBadge hijriDay={ayyamAlBeed?.hijriDay} />
            </motion.div>
          )}
          
          {/* Prayer Times Grid */}
          {prayerTimes && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35 }}
              className="mb-8"
            >
              <h3 className="font-display font-bold mb-4 flex items-center gap-2">
                <Clock className="w-5 h-5 text-secondary" />
                Today's Prayer Times • أوقات الصلاة
              </h3>
              <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
                {[
                  { name: 'Fajr', nameAr: 'الفجر', time: prayerTimes.fajr, highlight: true },
                  { name: 'Sunrise', nameAr: 'الشروق', time: prayerTimes.sunrise },
                  { name: 'Dhuhr', nameAr: 'الظهر', time: prayerTimes.dhuhr },
                  { name: 'Asr', nameAr: 'العصر', time: prayerTimes.asr },
                  { name: 'Maghrib', nameAr: 'المغرب', time: prayerTimes.maghrib, highlight: true },
                  { name: 'Isha', nameAr: 'العشاء', time: prayerTimes.isha },
                ].map((prayer) => (
                  <Tooltip key={prayer.name}>
                    <TooltipTrigger asChild>
                      <div className={`p-3 rounded-xl text-center ${
                        prayer.highlight 
                          ? 'bg-secondary/20 border border-secondary/30' 
                          : 'bg-card border border-border'
                      }`}>
                        <span className="text-xs text-muted-foreground block">{prayer.name}</span>
                        <span className="text-lg font-bold block">{prayer.time}</span>
                        <span className="text-xs font-arabic text-secondary">{prayer.nameAr}</span>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      {prayer.name === 'Fajr' && 'Start of fasting - last chance for Suhoor'}
                      {prayer.name === 'Maghrib' && 'Time to break your fast (Iftar)'}
                      {!['Fajr', 'Maghrib'].includes(prayer.name) && `${prayer.name} prayer time`}
                    </TooltipContent>
                  </Tooltip>
                ))}
              </div>
            </motion.div>
          )}
          
          {/* Quick Tip */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mb-8 p-4 rounded-2xl bg-gradient-to-r from-primary/10 to-secondary/10 border border-border"
          >
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-secondary/20 flex items-center justify-center flex-shrink-0">
                <tip.icon className="w-5 h-5 text-secondary" />
              </div>
              <div>
                <p className="font-medium">{tip.text}</p>
                <p className="text-sm text-muted-foreground font-arabic mt-1">{tip.textAr}</p>
              </div>
            </div>
          </motion.div>
          
          {/* Daily Hadith */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mb-8"
          >
            <DailyHadith />
          </motion.div>
          
          {/* Fasting History/Calendar Preview */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="card-cultural"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-display font-bold">
                This Week • هذا الأسبوع
              </h3>
              <button className="text-sm text-secondary flex items-center gap-1">
                View All <ChevronRight className="w-4 h-4" />
              </button>
            </div>
            
            <div className="flex gap-2 justify-between">
              {Array.from({ length: 7 }).map((_, i) => {
                const date = new Date();
                date.setDate(date.getDate() - 6 + i);
                const dateStr = date.toISOString().split('T')[0];
                const isComplete = progress.completedDays.includes(dateStr);
                const isToday = i === 6;
                const dayName = date.toLocaleDateString('en', { weekday: 'short' });
                
                return (
                  <Tooltip key={i}>
                    <TooltipTrigger asChild>
                      <div className={`flex-1 p-2 rounded-xl text-center cursor-default ${
                        isToday ? 'ring-2 ring-secondary' : ''
                      } ${isComplete ? 'bg-secondary/20' : 'bg-muted/50'}`}>
                        <span className="text-xs text-muted-foreground block">{dayName}</span>
                        <span className="text-sm font-bold block">{date.getDate()}</span>
                        {isComplete && <Check className="w-3 h-3 text-secondary mx-auto mt-1" />}
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      {isComplete ? 'Fast completed ✓' : isToday ? 'Today' : 'Not fasted'}
                    </TooltipContent>
                  </Tooltip>
                );
              })}
            </div>
          </motion.div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Dashboard;
