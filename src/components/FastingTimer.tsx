import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Moon, Sun, Clock } from "lucide-react";
import { ArabicTerm } from "./ArabicTerm";

interface FastingTimerProps {
  suhoorTime?: string;
  iftarTime?: string;
  isFasting?: boolean;
}

export const FastingTimer = ({ 
  suhoorTime = "05:23", 
  iftarTime = "18:47",
  isFasting = true 
}: FastingTimerProps) => {
  const [timeRemaining, setTimeRemaining] = useState({ hours: 0, minutes: 0, seconds: 0 });
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      setCurrentTime(now);
      
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
      
      {/* Status indicator */}
      <div className="relative z-10">
        <div className="flex items-center justify-center gap-2 mb-4">
          {isFasting ? (
            <>
              <Sun className="w-5 h-5 text-secondary animate-pulse" />
              <span className="text-primary-foreground/80 font-medium">
                Currently Fasting
              </span>
            </>
          ) : (
            <>
              <Moon className="w-5 h-5 text-secondary" />
              <span className="text-primary-foreground/80 font-medium">
                Eating Window
              </span>
            </>
          )}
        </div>

        {/* Main timer display */}
        <div className="flex items-center justify-center gap-2 md:gap-4 mb-4">
          <motion.div 
            className="text-center"
            key={timeRemaining.hours}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <span className="timer-digit">{formatNumber(timeRemaining.hours)}</span>
            <span className="block text-sm text-primary-foreground/60 mt-1">hours</span>
          </motion.div>
          
          <span className="timer-digit animate-pulse">:</span>
          
          <motion.div 
            className="text-center"
            key={timeRemaining.minutes}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <span className="timer-digit">{formatNumber(timeRemaining.minutes)}</span>
            <span className="block text-sm text-primary-foreground/60 mt-1">minutes</span>
          </motion.div>
          
          <span className="timer-digit animate-pulse">:</span>
          
          <motion.div 
            className="text-center"
            key={timeRemaining.seconds}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <span className="timer-digit">{formatNumber(timeRemaining.seconds)}</span>
            <span className="block text-sm text-primary-foreground/60 mt-1">seconds</span>
          </motion.div>
        </div>

        {/* Target time */}
        <div className="flex items-center justify-center gap-2 text-primary-foreground/70">
          <Clock className="w-4 h-4" />
          <span className="text-sm">
            Until{" "}
            <ArabicTerm 
              term={isFasting ? "Iftar" : "Suhoor"} 
              arabic={isFasting ? "إفطار" : "سحور"}
              definition={isFasting 
                ? "The evening meal that breaks the daily fast at sunset" 
                : "The pre-dawn meal eaten before beginning the daily fast"
              }
            >
              <span className="text-secondary font-semibold">
                {isFasting ? "Iftar" : "Suhoor"}
              </span>
            </ArabicTerm>
            {" "}at {isFasting ? iftarTime : suhoorTime}
          </span>
        </div>

        {/* Prayer times info */}
        <div className="mt-6 pt-4 border-t border-primary-foreground/10 flex justify-center gap-8 text-sm">
          <div className="text-center">
            <span className="text-primary-foreground/50 block">Suhoor ends</span>
            <span className="text-secondary font-semibold">{suhoorTime}</span>
          </div>
          <div className="text-center">
            <span className="text-primary-foreground/50 block">Iftar time</span>
            <span className="text-secondary font-semibold">{iftarTime}</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
