import { useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { 
  ArrowLeft, Calendar, Check, Moon, ChevronLeft, ChevronRight, Star
} from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { useFastingProgress } from "@/hooks/useLocalStorage";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

const DashboardSchedule = () => {
  const [progress, setProgress] = useFastingProgress();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  
  // Ramadan 2025 dates
  const RAMADAN_START = new Date('2025-02-28');
  const RAMADAN_END = new Date('2025-03-29');
  
  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };
  
  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };
  
  const isRamadanDay = (date: Date) => {
    return date >= RAMADAN_START && date <= RAMADAN_END;
  };
  
  const getRamadanDayNumber = (date: Date) => {
    if (!isRamadanDay(date)) return null;
    const diff = Math.floor((date.getTime() - RAMADAN_START.getTime()) / (1000 * 60 * 60 * 24));
    return diff + 1;
  };
  
  const isCompleted = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    return progress.completedDays.includes(dateStr);
  };
  
  const toggleDay = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    if (isCompleted(date)) {
      setProgress({
        ...progress,
        completedDays: progress.completedDays.filter(d => d !== dateStr)
      });
    } else {
      setProgress({
        ...progress,
        completedDays: [...progress.completedDays, dateStr]
      });
    }
  };
  
  const isSunnahDay = (date: Date) => {
    const day = date.getDay();
    return day === 1 || day === 4; // Monday or Thursday
  };
  
  const prevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };
  
  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };
  
  const daysInMonth = getDaysInMonth(currentMonth);
  const firstDay = getFirstDayOfMonth(currentMonth);
  const monthName = currentMonth.toLocaleDateString('en', { month: 'long', year: 'numeric' });
  
  const completedCount = progress.completedDays.length;
  const today = new Date();

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
              Fasting Schedule
              <span className="block font-arabic text-lg text-secondary mt-1">جدول الصيام</span>
            </h1>
            <p className="text-muted-foreground mt-2">
              View and manage your Ramadan fasting calendar
            </p>
          </motion.div>
          
          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="grid grid-cols-3 gap-4 mb-8"
          >
            <div className="p-4 rounded-2xl bg-secondary/10 border border-secondary/20 text-center">
              <span className="text-3xl font-bold text-secondary">{completedCount}</span>
              <span className="block text-sm text-muted-foreground">Days Completed</span>
            </div>
            <div className="p-4 rounded-2xl bg-card border border-border text-center">
              <span className="text-3xl font-bold">30</span>
              <span className="block text-sm text-muted-foreground">Total Days</span>
            </div>
            <div className="p-4 rounded-2xl bg-card border border-border text-center">
              <span className="text-3xl font-bold">{30 - completedCount}</span>
              <span className="block text-sm text-muted-foreground">Remaining</span>
            </div>
          </motion.div>
          
          {/* Calendar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="p-6 rounded-2xl bg-card border border-border"
          >
            {/* Calendar header */}
            <div className="flex items-center justify-between mb-6">
              <button 
                onClick={prevMonth}
                className="p-2 rounded-lg hover:bg-muted transition-colors"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <h3 className="font-display font-bold text-lg">{monthName}</h3>
              <button 
                onClick={nextMonth}
                className="p-2 rounded-lg hover:bg-muted transition-colors"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
            
            {/* Day names */}
            <div className="grid grid-cols-7 gap-1 mb-2">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                <div key={day} className="text-center text-xs text-muted-foreground py-2">
                  {day}
                </div>
              ))}
            </div>
            
            {/* Calendar grid */}
            <div className="grid grid-cols-7 gap-1">
              {/* Empty cells for days before the first of the month */}
              {Array.from({ length: firstDay }).map((_, i) => (
                <div key={`empty-${i}`} className="aspect-square" />
              ))}
              
              {/* Day cells */}
              {Array.from({ length: daysInMonth }).map((_, i) => {
                const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), i + 1);
                const isRamadan = isRamadanDay(date);
                const ramadanDay = getRamadanDayNumber(date);
                const completed = isCompleted(date);
                const isSunnah = isSunnahDay(date);
                const isToday = date.toDateString() === today.toDateString();
                const isPast = date < today;
                
                return (
                  <Tooltip key={i}>
                    <TooltipTrigger asChild>
                      <button
                        onClick={() => toggleDay(date)}
                        disabled={!isRamadan && !isSunnah}
                        className={`
                          aspect-square rounded-lg flex flex-col items-center justify-center text-sm relative
                          transition-all
                          ${isToday ? 'ring-2 ring-secondary' : ''}
                          ${completed ? 'bg-secondary text-secondary-foreground' : ''}
                          ${isRamadan && !completed ? 'bg-secondary/10 hover:bg-secondary/20' : ''}
                          ${isSunnah && !isRamadan && !completed ? 'bg-primary/10 hover:bg-primary/20' : ''}
                          ${!isRamadan && !isSunnah ? 'text-muted-foreground/50 cursor-default' : 'cursor-pointer'}
                        `}
                      >
                        <span className="font-medium">{i + 1}</span>
                        {ramadanDay && (
                          <span className="text-[10px] opacity-70">R{ramadanDay}</span>
                        )}
                        {completed && (
                          <Check className="w-3 h-3 absolute top-1 right-1" />
                        )}
                        {isSunnah && !isRamadan && (
                          <Star className="w-2 h-2 absolute top-1 right-1 text-secondary" />
                        )}
                      </button>
                    </TooltipTrigger>
                    <TooltipContent>
                      {isRamadan && `Ramadan Day ${ramadanDay}`}
                      {isSunnah && !isRamadan && 'Sunnah fasting day (Mon/Thu)'}
                      {!isRamadan && !isSunnah && 'Regular day'}
                      {completed && ' - Completed ✓'}
                    </TooltipContent>
                  </Tooltip>
                );
              })}
            </div>
            
            {/* Legend */}
            <div className="flex flex-wrap gap-4 mt-6 pt-4 border-t border-border text-xs">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-secondary" />
                <span>Completed</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-secondary/20" />
                <span>Ramadan Day</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-primary/20" />
                <span>Sunnah Day</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded ring-2 ring-secondary" />
                <span>Today</span>
              </div>
            </div>
          </motion.div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default DashboardSchedule;
