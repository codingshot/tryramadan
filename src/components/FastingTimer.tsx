import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Moon, Sun, Clock, Calendar } from "lucide-react";

interface FastingTimerProps {
  suhoorTime?: string;
  iftarTime?: string;
  isFasting?: boolean;
}

// Ramadan 2025 starts on February 28, 2025 (approximate)
const RAMADAN_START_DATE = new Date('2025-02-28T00:00:00');

export const FastingTimer = ({ 
  suhoorTime = "05:23", 
  iftarTime = "18:47",
  isFasting = true 
}: FastingTimerProps) => {
  const [timeRemaining, setTimeRemaining] = useState({ hours: 0, minutes: 0, seconds: 0 });
  const [daysUntilRamadan, setDaysUntilRamadan] = useState(0);
  const [isRamadan, setIsRamadan] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      
      // Calculate days until Ramadan
      const ramadanEnd = new Date(RAMADAN_START_DATE);
      ramadanEnd.setDate(ramadanEnd.getDate() + 30); // Ramadan is ~30 days
      
      if (now >= RAMADAN_START_DATE && now <= ramadanEnd) {
        setIsRamadan(true);
        setDaysUntilRamadan(0);
      } else if (now < RAMADAN_START_DATE) {
        setIsRamadan(false);
        const diffTime = RAMADAN_START_DATE.getTime() - now.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        setDaysUntilRamadan(diffDays);
      } else {
        // After Ramadan 2025, calculate for 2026
        const nextRamadan = new Date('2026-02-17T00:00:00');
        const diffTime = nextRamadan.getTime() - now.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        setDaysUntilRamadan(diffDays);
        setIsRamadan(false);
      }
      
      // Parse target time (iftar if fasting, suhoor if not)
      const targetTimeStr = isFasting ? iftarTime : suhoorTime;
      const [targetHours, targetMinutes] = targetTimeStr.split(':').map(Number);
      
      const target = new Date();
      target.setHours(targetHours, targetMinutes, 0, 0);
      
      // If target time has passed, set it for next day
      if (target <= now) {
        target.setDate(target.getDate() + 1);
      }
      
      const diff = target.getTime() - now.getTime();
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);
      
      setTimeRemaining({ hours, minutes, seconds });
    }, 1000);

    return () => clearInterval(interval);
  }, [isFasting, suhoorTime, iftarTime]);

  const formatNumber = (num: number) => num.toString().padStart(2, '0');

  return (
    <motion.div 
      className="timer-display relative overflow-hidden"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* Background pattern */}
      <div className="absolute inset-0 pattern-islamic opacity-10" />
      
      <div className="relative z-10">
        {/* Days until Ramadan Badge */}
        {!isRamadan && daysUntilRamadan > 0 && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-center gap-2 mb-4 px-4 py-2 rounded-full bg-secondary/20 mx-auto w-fit"
          >
            <Calendar className="w-4 h-4 text-secondary" />
            <span className="text-secondary font-bold text-lg">{daysUntilRamadan}</span>
            <span className="text-primary-foreground/80 text-sm">
              days until Ramadan • أيام حتى رمضان
            </span>
          </motion.div>
        )}
        
        {isRamadan && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-center gap-2 mb-4 px-4 py-2 rounded-full bg-secondary/30 mx-auto w-fit"
          >
            <span className="text-2xl">🌙</span>
            <span className="text-secondary font-bold">
              Ramadan Mubarak! • رمضان مبارك
            </span>
          </motion.div>
        )}

        {/* Status indicator */}
        <div className="flex items-center justify-center gap-2 mb-4">
          {isFasting ? (
            <>
              <Sun className="w-5 h-5 text-secondary animate-pulse" />
              <span className="text-primary-foreground/80 font-medium">
                Currently Fasting • صائم حالياً
              </span>
            </>
          ) : (
            <>
              <Moon className="w-5 h-5 text-secondary" />
              <span className="text-primary-foreground/80 font-medium">
                Eating Window • وقت الأكل
              </span>
            </>
          )}
        </div>

        {/* Main timer display */}
        <div className="flex items-center justify-center gap-2 md:gap-4 mb-4">
          <div className="text-center">
            <motion.span 
              key={`hours-${timeRemaining.hours}`}
              initial={{ opacity: 0.5, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="timer-digit block"
            >
              {formatNumber(timeRemaining.hours)}
            </motion.span>
            <span className="block text-sm text-primary-foreground/60 mt-1">hours • ساعات</span>
          </div>
          
          <span className="timer-digit animate-pulse">:</span>
          
          <div className="text-center">
            <motion.span 
              key={`mins-${timeRemaining.minutes}`}
              initial={{ opacity: 0.5, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="timer-digit block"
            >
              {formatNumber(timeRemaining.minutes)}
            </motion.span>
            <span className="block text-sm text-primary-foreground/60 mt-1">minutes • دقائق</span>
          </div>
          
          <span className="timer-digit animate-pulse">:</span>
          
          <div className="text-center">
            <motion.span 
              key={`secs-${timeRemaining.seconds}`}
              initial={{ opacity: 0.5, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="timer-digit block"
            >
              {formatNumber(timeRemaining.seconds)}
            </motion.span>
            <span className="block text-sm text-primary-foreground/60 mt-1">seconds • ثواني</span>
          </div>
        </div>

        {/* Target time */}
        <div className="flex items-center justify-center gap-2 text-primary-foreground/70">
          <Clock className="w-4 h-4" />
          <span className="text-sm">
            Until{" "}
            <span className="text-secondary font-semibold">
              {isFasting ? "Iftar • إفطار" : "Suhoor • سحور"}
            </span>
            {" "}at {isFasting ? iftarTime : suhoorTime}
          </span>
        </div>

        {/* Prayer times info with Arabic */}
        <div className="mt-6 pt-4 border-t border-primary-foreground/10 grid grid-cols-2 gap-4 text-sm">
          <div className="text-center p-3 rounded-lg bg-primary-foreground/5">
            <span className="text-primary-foreground/50 block text-xs mb-1">Suhoor Ends • نهاية السحور</span>
            <span className="text-secondary font-bold text-lg">{suhoorTime}</span>
            <span className="block text-xs text-primary-foreground/40 mt-1">Eat Cutoff • موعد التوقف</span>
          </div>
          <div className="text-center p-3 rounded-lg bg-primary-foreground/5">
            <span className="text-primary-foreground/50 block text-xs mb-1">Iftar Time • وقت الإفطار</span>
            <span className="text-secondary font-bold text-lg">{iftarTime}</span>
            <span className="block text-xs text-primary-foreground/40 mt-1">Break Fast • الفطور</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
