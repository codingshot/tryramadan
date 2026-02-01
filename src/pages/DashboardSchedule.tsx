import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  Check,
  ChevronLeft,
  ChevronRight,
  Star,
  Sparkles,
  PenLine,
  Utensils,
  Target,
  Coffee,
  Flame,
  CalendarDays,
  X,
} from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import {
  useFastingProgress,
  useLocalStorage,
  useDailyGoals,
  useDayMealPlans,
  useDayNutrition,
} from "@/hooks/useLocalStorage";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const DashboardSchedule = () => {
  const [progress, setProgress] = useFastingProgress();
  const [scheduleNotes, setScheduleNotes] = useLocalStorage<Record<string, string>>(
    "tryramadan-schedule-notes",
    {}
  );
  const [dailyGoals, setDailyGoals] = useDailyGoals();
  const [mealPlans, setMealPlans] = useDayMealPlans();
  const [nutrition, setNutrition] = useDayNutrition();

  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [noteInput, setNoteInput] = useState("");
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [showGoalsEditor, setShowGoalsEditor] = useState(false);

  const RAMADAN_START = new Date("2025-02-28");
  const RAMADAN_END = new Date("2025-03-29");
  const today = new Date();
  const todayStr = today.toISOString().split("T")[0];

  const getDaysInMonth = (date: Date) =>
    new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  const getFirstDayOfMonth = (date: Date) =>
    new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  const isRamadanDay = (date: Date) => date >= RAMADAN_START && date <= RAMADAN_END;
  const getRamadanDayNumber = (date: Date) => {
    if (!isRamadanDay(date)) return null;
    return (
      Math.floor((date.getTime() - RAMADAN_START.getTime()) / (1000 * 60 * 60 * 24)) + 1
    );
  };
  const isLaylatAlQadrNight = (date: Date) => {
    const day = getRamadanDayNumber(date);
    return day !== null && [21, 23, 25, 27, 29].includes(day);
  };
  const getMoonPhase = (ramadanDay: number | null): string => {
    if (ramadanDay == null) return "";
    if (ramadanDay <= 2) return "🌑";
    if (ramadanDay <= 7) return "🌒";
    if (ramadanDay <= 10) return "🌓";
    if (ramadanDay <= 14) return "🌔";
    if (ramadanDay <= 16) return "🌕";
    if (ramadanDay <= 20) return "🌖";
    if (ramadanDay <= 23) return "🌗";
    if (ramadanDay <= 28) return "🌘";
    return "🌑";
  };
  const isCompleted = (date: Date) => {
    const dateStr = date.toISOString().split("T")[0];
    return progress.completedDays.includes(dateStr);
  };
  const toggleCompleted = (dateStr: string) => {
    if (progress.completedDays.includes(dateStr)) {
      setProgress({
        ...progress,
        completedDays: progress.completedDays.filter((d) => d !== dateStr),
      });
    } else {
      setProgress({
        ...progress,
        completedDays: [...progress.completedDays, dateStr],
      });
    }
  };
  const isSunnahDay = (date: Date) => {
    const day = date.getDay();
    return day === 1 || day === 4;
  };

  const goToToday = useCallback(() => {
    setCurrentMonth(new Date(today.getFullYear(), today.getMonth(), 1));
    setSelectedDate(todayStr);
    setNoteInput(scheduleNotes[todayStr] || "");
  }, [todayStr, scheduleNotes]);

  const selectDay = useCallback(
    (dateStr: string) => {
      setSelectedDate(dateStr);
      setNoteInput(scheduleNotes[dateStr] || "");
    },
    [scheduleNotes]
  );

  const prevMonth = () =>
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  const nextMonth = () =>
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));

  const daysInMonth = getDaysInMonth(currentMonth);
  const firstDay = getFirstDayOfMonth(currentMonth);
  const monthName = currentMonth.toLocaleDateString("en", { month: "long", year: "numeric" });
  const completedCount = progress.completedDays.length;

  const selectedDayMeals = selectedDate ? mealPlans[selectedDate] : undefined;
  const selectedDayNutrition = selectedDate ? nutrition[selectedDate] : undefined;
  const selectedDateObj = selectedDate ? new Date(selectedDate + "T12:00:00") : null;
  const selectedIsRamadan = selectedDateObj ? isRamadanDay(selectedDateObj) : false;
  const selectedRamadanDay = selectedDateObj ? getRamadanDayNumber(selectedDateObj) : null;
  const selectedIsSunnah = selectedDateObj ? isSunnahDay(selectedDateObj) : false;
  const selectedCompleted = selectedDate ? progress.completedDays.includes(selectedDate) : false;

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

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
            <h1 className="text-2xl md:text-3xl font-display font-bold">
              Fasting Schedule
              <span className="block font-arabic text-lg text-secondary mt-1">جدول الصيام</span>
            </h1>
            <p className="text-muted-foreground mt-2">
              Click any day to view history, meal plan, and macros
            </p>
          </motion.div>

          {/* Daily goals */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            transition={{ delay: 0.05 }}
            className="mb-6 p-4 rounded-2xl bg-card border border-border"
          >
            <button
              type="button"
              onClick={() => setShowGoalsEditor(!showGoalsEditor)}
              className="w-full flex items-center justify-between font-medium"
            >
              <span className="flex items-center gap-2">
                <Target className="w-4 h-4 text-secondary" />
                Daily goals (calories & macros)
              </span>
              <span className="text-sm text-muted-foreground">
                {dailyGoals.calories} cal · P {dailyGoals.protein}g · C {dailyGoals.carbs}g · F{" "}
                {dailyGoals.fat}g
              </span>
            </button>
            <AnimatePresence>
              {showGoalsEditor && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4 pt-4 border-t border-border">
                    <div>
                      <Label className="text-xs">Calories</Label>
                      <Input
                        type="number"
                        min={0}
                        value={dailyGoals.calories}
                        onChange={(e) =>
                          setDailyGoals((g) => ({ ...g, calories: parseInt(e.target.value, 10) || 0 }))
                        }
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label className="text-xs">Protein (g)</Label>
                      <Input
                        type="number"
                        min={0}
                        value={dailyGoals.protein}
                        onChange={(e) =>
                          setDailyGoals((g) => ({ ...g, protein: parseInt(e.target.value, 10) || 0 }))
                        }
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label className="text-xs">Carbs (g)</Label>
                      <Input
                        type="number"
                        min={0}
                        value={dailyGoals.carbs}
                        onChange={(e) =>
                          setDailyGoals((g) => ({ ...g, carbs: parseInt(e.target.value, 10) || 0 }))
                        }
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label className="text-xs">Fat (g)</Label>
                      <Input
                        type="number"
                        min={0}
                        value={dailyGoals.fat}
                        onChange={(e) =>
                          setDailyGoals((g) => ({ ...g, fat: parseInt(e.target.value, 10) || 0 }))
                        }
                        className="mt-1"
                      />
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            transition={{ delay: 0.1 }}
            className="grid grid-cols-3 gap-4 mb-6"
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
            transition={{ delay: 0.2 }}
            className="p-6 rounded-2xl bg-card border border-border"
          >
            <div className="flex items-center justify-between mb-6 flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <button
                  onClick={prevMonth}
                  className="p-2 rounded-lg hover:bg-muted transition-colors"
                  aria-label="Previous month"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <h3 className="font-display font-bold text-lg min-w-[180px] text-center">
                  {monthName}
                </h3>
                <button
                  onClick={nextMonth}
                  className="p-2 rounded-lg hover:bg-muted transition-colors"
                  aria-label="Next month"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
              <Button variant="outline" size="sm" onClick={goToToday} className="gap-2">
                <CalendarDays className="w-4 h-4" />
                Go to today
              </Button>
            </div>

            <div className="grid grid-cols-7 gap-1 mb-2">
              {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                <div key={day} className="text-center text-xs text-muted-foreground py-2">
                  {day}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-1">
              {Array.from({ length: firstDay }).map((_, i) => (
                <div key={`empty-${i}`} className="aspect-square" />
              ))}
              {Array.from({ length: daysInMonth }).map((_, i) => {
                const date = new Date(
                  currentMonth.getFullYear(),
                  currentMonth.getMonth(),
                  i + 1
                );
                const dateStr = date.toISOString().split("T")[0];
                const isRamadan = isRamadanDay(date);
                const ramadanDay = getRamadanDayNumber(date);
                const completed = isCompleted(date);
                const isSunnah = isSunnahDay(date);
                const isToday = date.toDateString() === today.toDateString();
                const isSpecialNight = isLaylatAlQadrNight(date);
                const hasNote = scheduleNotes[dateStr];
                const hasMeals =
                  mealPlans[dateStr]?.suhoor || mealPlans[dateStr]?.iftar;
                const hasNutrition =
                  nutrition[dateStr]?.calories != null ||
                  nutrition[dateStr]?.protein != null;
                const isSelected = selectedDate === dateStr;

                return (
                  <Tooltip key={i}>
                    <TooltipTrigger asChild>
                      <button
                        type="button"
                        onClick={() => selectDay(dateStr)}
                        className={`
                          aspect-square rounded-lg flex flex-col items-center justify-center text-sm relative
                          transition-all min-h-[44px] cursor-pointer
                          ${isToday ? "ring-2 ring-secondary" : ""}
                          ${isSelected ? "ring-2 ring-primary bg-primary/10" : ""}
                          ${completed ? "bg-secondary text-secondary-foreground" : ""}
                          ${isSpecialNight && !completed ? "bg-amber-500/20 border border-amber-500/40" : ""}
                          ${isRamadan && !completed && !isSpecialNight ? "bg-secondary/10 hover:bg-secondary/20" : ""}
                          ${isSunnah && !isRamadan && !completed ? "bg-primary/10 hover:bg-primary/20" : ""}
                          ${!isRamadan && !isSunnah ? "bg-muted/50 hover:bg-muted text-muted-foreground" : ""}
                        `}
                      >
                        <span className="font-medium">{i + 1}</span>
                        {ramadanDay != null && (
                          <>
                            <span className="text-[10px] opacity-70">R{ramadanDay}</span>
                            <span className="text-xs leading-none">
                              {getMoonPhase(ramadanDay)}
                            </span>
                          </>
                        )}
                        {completed && (
                          <Check className="w-3 h-3 absolute top-0.5 right-0.5" />
                        )}
                        {isSunnah && !isRamadan && (
                          <Star className="w-2 h-2 absolute top-0.5 right-0.5 text-secondary" />
                        )}
                        {isSpecialNight && (
                          <Sparkles className="w-2.5 h-2.5 absolute bottom-0.5 text-amber-600" />
                        )}
                        {hasNote && (
                          <PenLine className="w-2.5 h-2.5 absolute top-0.5 left-0.5 text-muted-foreground" />
                        )}
                        {(hasMeals || hasNutrition) && (
                          <span className="absolute bottom-0.5 left-0.5 text-[10px] opacity-70">
                            •
                          </span>
                        )}
                      </button>
                    </TooltipTrigger>
                    <TooltipContent>
                      {date.toLocaleDateString("en", { weekday: "short", month: "short", day: "numeric", year: "numeric" })}
                      {isRamadan && ` · Ramadan Day ${ramadanDay}`}
                      {isSpecialNight && " · Laylat al-Qadr"}
                      {isSunnah && !isRamadan && " · Sunnah day"}
                      {completed && " · Completed ✓"}
                      {hasNote && " · Has note"}
                      {" · Click to view/edit"}
                    </TooltipContent>
                  </Tooltip>
                );
              })}
            </div>

            {/* Day detail panel */}
            <AnimatePresence>
              {selectedDate && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-6 overflow-hidden"
                >
                  <div className="p-4 rounded-2xl bg-muted/50 border border-border space-y-4">
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <h4 className="font-display font-bold flex items-center gap-2">
                        {selectedDateObj?.toLocaleDateString("en", {
                          weekday: "long",
                          month: "long",
                          day: "numeric",
                          year: "numeric",
                        })}
                        {selectedRamadanDay != null && (
                          <span className="text-sm font-normal text-secondary">
                            Ramadan Day {selectedRamadanDay}
                          </span>
                        )}
                      </h4>
                      <button
                        type="button"
                        onClick={() => setSelectedDate(null)}
                        className="p-1 rounded hover:bg-muted"
                        aria-label="Close"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>

                    {/* Mark complete (Ramadan/Sunnah only) */}
                    {(selectedIsRamadan || selectedIsSunnah) && (
                      <div className="flex items-center gap-2">
                        <Button
                          variant={selectedCompleted ? "secondary" : "outline"}
                          size="sm"
                          onClick={() => toggleCompleted(selectedDate)}
                          className="gap-2"
                        >
                          <Check className="w-4 h-4" />
                          {selectedCompleted ? "Marked complete" : "Mark day complete"}
                        </Button>
                      </div>
                    )}

                    {/* Note */}
                    <div>
                      <Label className="flex items-center gap-2 text-sm font-medium mb-1">
                        <PenLine className="w-4 h-4" />
                        Note
                      </Label>
                      <textarea
                        value={noteInput}
                        onChange={(e) => setNoteInput(e.target.value)}
                        onBlur={() => {
                          if (selectedDate) {
                            setScheduleNotes((prev) => ({
                              ...prev,
                              [selectedDate]: noteInput.trim(),
                            }));
                          }
                        }}
                        placeholder="Reflection or note for this day..."
                        className="w-full p-3 rounded-lg border border-border bg-background text-sm min-h-[72px] resize-none focus:ring-2 focus:ring-secondary outline-none"
                      />
                    </div>

                    {/* Meal plan */}
                    <div>
                      <Label className="flex items-center gap-2 text-sm font-medium mb-2">
                        <Utensils className="w-4 h-4" />
                        Meal plan
                      </Label>
                      <div className="grid gap-2">
                        <div className="flex items-center gap-2">
                          <Coffee className="w-4 h-4 text-muted-foreground" />
                          <Input
                            placeholder="Suhoor (e.g. Oats & dates or suhoor-1)"
                            value={selectedDayMeals?.suhoor ?? ""}
                            onChange={(e) =>
                              setMealPlans((prev) => ({
                                ...prev,
                                [selectedDate]: {
                                  ...prev[selectedDate],
                                  suhoor: e.target.value.trim() || undefined,
                                },
                              }))
                            }
                            className="bg-background"
                          />
                        </div>
                        <div className="flex items-center gap-2">
                          <Utensils className="w-4 h-4 text-muted-foreground" />
                          <Input
                            placeholder="Iftar (e.g. Harira & dates or iftar-2)"
                            value={selectedDayMeals?.iftar ?? ""}
                            onChange={(e) =>
                              setMealPlans((prev) => ({
                                ...prev,
                                [selectedDate]: {
                                  ...prev[selectedDate],
                                  iftar: e.target.value.trim() || undefined,
                                },
                              }))
                            }
                            className="bg-background"
                          />
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        Use recipe IDs like suhoor-1, iftar-2 to link to app recipes
                      </p>
                    </div>

                    {/* Calories & macros */}
                    <div>
                      <Label className="flex items-center gap-2 text-sm font-medium mb-2">
                        <Flame className="w-4 h-4" />
                        Calories & macros (estimate or log)
                      </Label>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        <div>
                          <Label className="text-xs text-muted-foreground">Calories</Label>
                          <Input
                            type="number"
                            min={0}
                            placeholder={String(dailyGoals.calories)}
                            value={selectedDayNutrition?.calories ?? ""}
                            onChange={(e) =>
                              setNutrition((prev) => ({
                                ...prev,
                                [selectedDate]: {
                                  ...prev[selectedDate],
                                  calories:
                                    e.target.value === ""
                                      ? undefined
                                      : parseInt(e.target.value, 10) || 0,
                                },
                              }))
                            }
                            className="mt-0.5 bg-background"
                          />
                        </div>
                        <div>
                          <Label className="text-xs text-muted-foreground">Protein (g)</Label>
                          <Input
                            type="number"
                            min={0}
                            placeholder={String(dailyGoals.protein)}
                            value={selectedDayNutrition?.protein ?? ""}
                            onChange={(e) =>
                              setNutrition((prev) => ({
                                ...prev,
                                [selectedDate]: {
                                  ...prev[selectedDate],
                                  protein:
                                    e.target.value === ""
                                      ? undefined
                                      : parseInt(e.target.value, 10) || 0,
                                },
                              }))
                            }
                            className="mt-0.5 bg-background"
                          />
                        </div>
                        <div>
                          <Label className="text-xs text-muted-foreground">Carbs (g)</Label>
                          <Input
                            type="number"
                            min={0}
                            placeholder={String(dailyGoals.carbs)}
                            value={selectedDayNutrition?.carbs ?? ""}
                            onChange={(e) =>
                              setNutrition((prev) => ({
                                ...prev,
                                [selectedDate]: {
                                  ...prev[selectedDate],
                                  carbs:
                                    e.target.value === ""
                                      ? undefined
                                      : parseInt(e.target.value, 10) || 0,
                                },
                              }))
                            }
                            className="mt-0.5 bg-background"
                          />
                        </div>
                        <div>
                          <Label className="text-xs text-muted-foreground">Fat (g)</Label>
                          <Input
                            type="number"
                            min={0}
                            placeholder={String(dailyGoals.fat)}
                            value={selectedDayNutrition?.fat ?? ""}
                            onChange={(e) =>
                              setNutrition((prev) => ({
                                ...prev,
                                [selectedDate]: {
                                  ...prev[selectedDate],
                                  fat:
                                    e.target.value === ""
                                      ? undefined
                                      : parseInt(e.target.value, 10) || 0,
                                },
                              }))
                            }
                            className="mt-0.5 bg-background"
                          />
                        </div>
                      </div>
                      {(selectedDayNutrition?.calories != null ||
                        selectedDayNutrition?.protein != null) && (
                        <div className="mt-2 flex flex-wrap gap-3 text-xs">
                          <span className="text-muted-foreground">Goal today:</span>
                          <span>
                            Cal{" "}
                            {(selectedDayNutrition?.calories ?? dailyGoals.calories) >= dailyGoals.calories
                              ? "✓"
                              : ""}{" "}
                            {selectedDayNutrition?.calories ?? "—"} / {dailyGoals.calories}
                          </span>
                          <span>
                            P {selectedDayNutrition?.protein ?? "—"} / {dailyGoals.protein}g
                          </span>
                          <span>
                            C {selectedDayNutrition?.carbs ?? "—"} / {dailyGoals.carbs}g
                          </span>
                          <span>
                            F {selectedDayNutrition?.fat ?? "—"} / {dailyGoals.fat}g
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Legend */}
            <div className="flex flex-wrap gap-4 mt-6 pt-4 border-t border-border text-xs">
              <span className="text-muted-foreground">Click any day to view history, meal plan & macros</span>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-secondary" />
                <span>Completed</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-secondary/20" />
                <span>Ramadan</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-amber-500/30 border border-amber-500/40" />
                <span>Laylat al-Qadr</span>
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
