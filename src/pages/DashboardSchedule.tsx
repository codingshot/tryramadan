import { useState, useCallback, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useLocation } from "react-router-dom";
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
  Flame,
  CalendarDays,
  X,
  Clock,
  Plus,
  Trash2,
  Download,
  Sunrise,
  Sunset,
  GripVertical,
  ChevronUp,
  ChevronDown,
} from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import {
  useFastingProgress,
  useLocalStorage,
  useDailyGoals,
  clampCalories,
  CALORIE_MIN,
  CALORIE_MAX,
  useDayMealPlans,
  useDayNutrition,
  useDayFoodLog,
  getDayTotalsFromFoodLog,
  normalizeDayFoodLog,
  getFastingLogForDate,
  getBrokenReasonLabel,
  hoursBetween,
  setDaySkipped,
  updateBrokenReason,
  setBrokenDayToCompleted,
  setBrokenDayToInProgress,
  useUserPreferences,
  getRecommendedCaloriesFromPreferences,
  useCalendarEvents,
  useDashboardQuickActions,
  DASHBOARD_QUICK_ACTIONS,
  DASHBOARD_QUICK_ACTION_IDS,
  useIftarLabel,
  useIftarLabelShort,
  useSuhoorLabel,
  type FoodLogEntry,
  type CalendarEvent,
  type CalendarEventType,
} from "@/hooks/useLocalStorage";
import { useRamadanRange } from "@/hooks/useRamadanRange";
import { toLocalDateString } from "@/lib/utils";
import { usePrayerTimesForDate } from "@/hooks/usePrayerTimes";
import { buildIcalContent, downloadIcal } from "@/lib/ical";
import { fetchPrayerTimesForMonth } from "@/hooks/usePrayerTimes";
import { getRecipes, getRecipe, parseNutrient, type MealType } from "@/lib/cultureRecipes";
import { EATING_TIME_TOOLTIPS } from "@/data/eating-times-tooltips";
import { EXTERNAL_LINKS } from "@/lib/config";
import { GENERAL_TOOLTIPS } from "@/data/general-tooltips";
import { PageSEO } from "@/components/PageSEO";
import { LocationRequiredCTA } from "@/components/LocationRequiredCTA";
import { TodayScheduleTimeline } from "@/components/TodayScheduleTimeline";
import { toast } from "sonner";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { BreakFastReasonDialog } from "@/components/BreakFastReasonDialog";

const allRecipesForPicker = getRecipes();

function FoodLogRow({
  entry,
  onPortionsChange,
  onRemove,
}: {
  entry: FoodLogEntry;
  onPortionsChange: (portions: number) => void;
  onRemove: () => void;
}) {
  const totalCal = Math.round((entry.caloriesPerPortion || 0) * entry.portions);
  const totalP = entry.proteinPerPortion != null ? Math.round(entry.proteinPerPortion * entry.portions) : null;
  const totalC = entry.carbsPerPortion != null ? Math.round(entry.carbsPerPortion * entry.portions) : null;
  const totalF = entry.fatPerPortion != null ? Math.round(entry.fatPerPortion * entry.portions) : null;
  return (
    <li className="flex flex-wrap items-center gap-2 text-sm py-1 border-b border-border/50 last:border-0">
      <span className="font-medium min-w-0 truncate">{entry.name}</span>
      <span className="text-muted-foreground shrink-0">
        <input
          type="number"
          step="0.5"
          min="0.1"
          className="w-12 py-0.5 px-1 rounded border border-border bg-background text-center text-xs"
          value={entry.portions}
          onChange={(e) => onPortionsChange(parseFloat(e.target.value) || 1)}
        />
        {" "}× {entry.caloriesPerPortion} cal
      </span>
      <span className="shrink-0 font-medium">= {totalCal} cal</span>
      {(totalP != null || totalC != null || totalF != null) && (
        <span className="text-xs text-muted-foreground">
          P{totalP ?? "—"} C{totalC ?? "—"} F{totalF ?? "—"}
        </span>
      )}
      {entry.recipeId && (
        <Link to={`/recipe/${entry.mealType}/${entry.recipeId.split("-")[1]}`} className="text-xs text-secondary hover:underline shrink-0">
          View recipe
        </Link>
      )}
      <button type="button" onClick={onRemove} className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded border border-transparent hover:border-destructive/30 hover:bg-destructive/20 text-muted-foreground hover:text-destructive ml-auto" aria-label="Remove">
        <Trash2 className="w-3.5 h-3.5" />
      </button>
    </li>
  );
}

function eventId(): string {
  return `ev-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

const QUICK_ADD_TEMPLATES: { type: CalendarEventType; title: string; timeKey: keyof import("@/hooks/usePrayerTimes").PrayerTimes }[] = [
  { type: "suhoor", title: "Suhoor (eat before)", timeKey: "imsak" },
  { type: "iftar", title: "Iftar (break fast)", timeKey: "maghrib" },
  { type: "fajr", title: "Fajr", timeKey: "fajr" },
  { type: "dhuhr", title: "Dhuhr", timeKey: "dhuhr" },
  { type: "asr", title: "Asr", timeKey: "asr" },
  { type: "maghrib", title: "Maghrib", timeKey: "maghrib" },
  { type: "isha", title: "Isha", timeKey: "isha" },
  { type: "taraweeh", title: "Taraweeh (optional)", timeKey: "isha" },
  { type: "get_food", title: "Get food / prepare", timeKey: "maghrib" },
];

const DashboardSchedule = () => {
  const [preferences] = useUserPreferences();
  const [progress, setProgress] = useFastingProgress();
  const ramadanRange = useRamadanRange();
  const iftarLabel = useIftarLabel();
  const iftarLabelShort = useIftarLabelShort();
  const suhoorLabel = useSuhoorLabel();
  const [scheduleNotes, setScheduleNotes] = useLocalStorage<Record<string, string>>(
    "tryramadan-schedule-notes",
    {}
  );
  const [dailyGoals, setDailyGoals] = useDailyGoals();
  const [mealPlans, setMealPlans] = useDayMealPlans();
  const [nutrition, setNutrition] = useDayNutrition();
  const [foodLogs, setFoodLogs] = useDayFoodLog();
  const [calendarEvents, setCalendarEvents] = useCalendarEvents();

  const location = useLocation();
  const todayStrForInit = toLocalDateString(new Date());
  const initialDateFromState = (location.state as { date?: string } | null)?.date;
  const initialDate = initialDateFromState ?? todayStrForInit;
  const [selectedDate, setSelectedDate] = useState<string | null>(initialDate);
  const [noteInput, setNoteInput] = useState(() => scheduleNotes[initialDate] || "");
  const [currentMonth, setCurrentMonth] = useState(() => {
    const d = new Date(initialDate + "T12:00:00");
    return new Date(d.getFullYear(), d.getMonth(), 1);
  });
  useEffect(() => {
    const date = (location.state as { date?: string } | null)?.date;
    if (date) {
      setSelectedDate(date);
      const d = new Date(date + "T12:00:00");
      setCurrentMonth(new Date(d.getFullYear(), d.getMonth(), 1));
    }
  }, [location.state]);
  const [showGoalsEditor, setShowGoalsEditor] = useState(false);
  const [showQuickActionsEditor, setShowQuickActionsEditor] = useState(false);
  const [quickActionOrder, setQuickActionOrder] = useDashboardQuickActions();
  const [addFoodMeal, setAddFoodMeal] = useState<MealType | null>(null);
  const [addFoodCustomInputs, setAddFoodCustomInputs] = useState({ name: "", cal: "", portions: "1", protein: "", carbs: "", fat: "" });
  const [exportLoading, setExportLoading] = useState(false);
  const [customEventTitle, setCustomEventTitle] = useState("");
  const [customEventTime, setCustomEventTime] = useState("18:00");
  const [editReasonOpen, setEditReasonOpen] = useState(false);
  const [confirmCompleteOpen, setConfirmCompleteOpen] = useState(false);
  const [confirmInProgressOpen, setConfirmInProgressOpen] = useState(false);

  const [journalEntries] = useLocalStorage<{ date: string; content?: string; gratitude?: string }[]>("tryramadan-journal", []);
  const journalDates = new Set(journalEntries.map((e) => e.date));
  const selectedDayJournal = selectedDate ? journalEntries.find((e) => e.date === selectedDate) : undefined;

  const locationCoords = preferences.locationCoords;
  const lat = locationCoords?.lat ?? null;
  const lng = locationCoords?.lng ?? null;
  const { prayerTimes: selectedDayPrayerTimes } = usePrayerTimesForDate(lat, lng, selectedDate);

  const today = new Date();
  const todayStr = toLocalDateString(today);

  const getDaysInMonth = (date: Date) =>
    new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  const getFirstDayOfMonth = (date: Date) =>
    new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  const isLaylatAlQadrNight = (date: Date) => {
    const day = ramadanRange.getRamadanDayNumber(date);
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
    const dateStr = toLocalDateString(date);
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
    const now = new Date();
    const str = toLocalDateString(now);
    setCurrentMonth(new Date(now.getFullYear(), now.getMonth(), 1));
    setSelectedDate(str);
    setNoteInput(scheduleNotes[str] || "");
  }, [scheduleNotes]);

  const goToRamadan = useCallback(() => {
    const start = ramadanRange.start;
    setCurrentMonth(new Date(start.getFullYear(), start.getMonth(), 1));
    const startStr = toLocalDateString(start);
    setSelectedDate(startStr);
    setNoteInput(scheduleNotes[startStr] || "");
  }, [scheduleNotes, ramadanRange.start]);

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
  
  // Memoize expensive month calculations
  const ramadanDaysInMonth = useMemo(() => {
    return Array.from({ length: daysInMonth }, (_, i) => {
      const d = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), i + 1);
      return ramadanRange.isRamadanDay(d) ? 1 : 0;
    }).reduce((a, b) => a + b, 0);
  }, [currentMonth, daysInMonth, ramadanRange]);
  
  const sunnahDaysInMonth = useMemo(() => {
    return Array.from({ length: daysInMonth }, (_, i) => {
      const d = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), i + 1);
      return isSunnahDay(d) && !ramadanRange.isRamadanDay(d) ? 1 : 0;
    }).reduce((a, b) => a + b, 0);
  }, [currentMonth, daysInMonth, ramadanRange]);
  
  const totalHoursFasted = useMemo(() => {
    return (progress.fastingLog ?? []).reduce((sum, e) => sum + (e.hoursFasted ?? (e.startedAt && e.completedAt ? hoursBetween(e.startedAt, e.completedAt) : 0)), 0);
  }, [progress.fastingLog]);

  const selectedDayMeals = selectedDate ? mealPlans[selectedDate] : undefined;
  const selectedDayNutrition = selectedDate ? nutrition[selectedDate] : undefined;
  const selectedDayFoodLog = useMemo(() => 
    selectedDate ? normalizeDayFoodLog(foodLogs[selectedDate]) : undefined,
    [selectedDate, foodLogs]
  );
  const selectedDayTotalsFromFood = useMemo(() => 
    getDayTotalsFromFoodLog(selectedDayFoodLog),
    [selectedDayFoodLog]
  );
  // Effective totals: manual nutrition if any set, otherwise food log totals (for goal comparison)
  const effectiveDayTotals = useMemo(() => selectedDate
    ? {
        calories: selectedDayNutrition?.calories ?? selectedDayTotalsFromFood.calories ?? 0,
        protein: selectedDayNutrition?.protein ?? selectedDayTotalsFromFood.protein ?? 0,
        carbs: selectedDayNutrition?.carbs ?? selectedDayTotalsFromFood.carbs ?? 0,
        fat: selectedDayNutrition?.fat ?? selectedDayTotalsFromFood.fat ?? 0,
      }
    : { calories: 0, protein: 0, carbs: 0, fat: 0 },
    [selectedDate, selectedDayNutrition, selectedDayTotalsFromFood]
  );
  const hasEffectiveTotals =
    effectiveDayTotals.calories > 0 ||
    effectiveDayTotals.protein > 0 ||
    effectiveDayTotals.carbs > 0 ||
    effectiveDayTotals.fat > 0;
  const selectedFastingLog = selectedDate ? getFastingLogForDate(progress, selectedDate) : undefined;
  const selectedDateObj = selectedDate ? new Date(selectedDate + "T12:00:00") : null;
  const selectedIsRamadan = selectedDateObj ? ramadanRange.isRamadanDay(selectedDateObj) : false;
  const selectedRamadanDay = selectedDateObj ? ramadanRange.getRamadanDayNumber(selectedDateObj) : null;
  const selectedIsSunnah = selectedDateObj ? isSunnahDay(selectedDateObj) : false;
  const selectedCompleted = selectedDate ? progress.completedDays.includes(selectedDate) : false;
  const selectedSkipped = selectedDate ? (progress.skippedDays ?? []).includes(selectedDate) : false;
  /** Meal planning is for today and future days only; past days show what was planned (read-only). */
  const isSelectedPastDay = selectedDate ? selectedDate < todayStr : false;
  const canEditMealPlan = selectedDate ? selectedDate >= todayStr : false;

  const addFoodFromRecipe = (mealType: MealType, recipeKey: string) => {
    if (!selectedDate) return;
    const [type, idStr] = recipeKey.split("-");
    const meal = type as MealType;
    const id = parseInt(idStr, 10);
    const recipe = getRecipe(meal, id);
    if (!recipe) return;
    const cal = recipe.nutrition?.calories ?? 0;
    const protein = parseNutrient(recipe.nutrition?.protein);
    const carbs = parseNutrient(recipe.nutrition?.carbs);
    const fat = parseNutrient(recipe.nutrition?.fat);
    const entry: FoodLogEntry = {
      id: `${Date.now()}-${recipeKey}`,
      type: "recipe",
      mealType,
      name: recipe.name,
      portions: 1,
      caloriesPerPortion: cal,
      proteinPerPortion: protein,
      carbsPerPortion: carbs,
      fatPerPortion: fat,
      recipeId: recipeKey,
    };
    setFoodLogs((prev) => {
      const day = normalizeDayFoodLog(prev[selectedDate]);
      const list = meal === "suhoor" ? [...day.suhoor, entry] : [...day.iftar, entry];
      return {
        ...prev,
        [selectedDate]: { ...day, [meal]: list },
      };
    });
    setAddFoodMeal(null);
  };

  const submitAddFoodCustom = (mealType: MealType) => {
    if (!selectedDate) return;
    const name = addFoodCustomInputs.name.trim();
    const cal = parseInt(addFoodCustomInputs.cal, 10) || 0;
    const portions = Math.max(0.1, parseFloat(addFoodCustomInputs.portions) || 1);
    const protein = parseFloat(addFoodCustomInputs.protein) || 0;
    const carbs = parseFloat(addFoodCustomInputs.carbs) || 0;
    const fat = parseFloat(addFoodCustomInputs.fat) || 0;
    if (!name && cal <= 0) {
      toast.error("Add a name or at least one calorie so we can save this item.");
      return;
    }
    const entry: FoodLogEntry = {
      id: `custom-${Date.now()}`,
      type: "custom",
      mealType,
      name: name || "Custom",
      portions,
      caloriesPerPortion: cal,
      proteinPerPortion: protein || undefined,
      carbsPerPortion: carbs || undefined,
      fatPerPortion: fat || undefined,
    };
    setFoodLogs((prev) => {
      const day = normalizeDayFoodLog(prev[selectedDate]);
      const list = mealType === "suhoor" ? [...day.suhoor, entry] : [...day.iftar, entry];
      return { ...prev, [selectedDate]: { ...day, [mealType]: list } };
    });
    setAddFoodCustomInputs({ name: "", cal: "", portions: "1", protein: "", carbs: "", fat: "" });
    setAddFoodMeal(null);
  };

  const removeFoodEntry = (mealType: MealType, id: string) => {
    if (!selectedDate) return;
    setFoodLogs((prev) => {
      const day = normalizeDayFoodLog(prev[selectedDate]);
      const list = mealType === "suhoor" ? day.suhoor.filter((e) => e.id !== id) : day.iftar.filter((e) => e.id !== id);
      return { ...prev, [selectedDate]: { ...day, [mealType]: list } };
    });
  };

  const updateFoodPortions = (mealType: MealType, id: string, portions: number) => {
    if (!selectedDate) return;
    setFoodLogs((prev) => {
      const day = normalizeDayFoodLog(prev[selectedDate]);
      const list = (mealType === "suhoor" ? day.suhoor : day.iftar).map((e) =>
        e.id === id ? { ...e, portions: Math.max(0.1, portions) } : e
      );
      return { ...prev, [selectedDate]: { ...day, [mealType]: list } };
    });
  };

  const addCalendarEvent = (type: CalendarEventType, title: string, time: string, durationMinutes: number = 15) => {
    if (!selectedDate) return;
    const entry: CalendarEvent = {
      id: eventId(),
      title,
      type,
      time,
      durationMinutes,
      date: selectedDate,
    };
    setCalendarEvents((prev) => {
      const day = prev[selectedDate] ?? [];
      return { ...prev, [selectedDate]: [...day, entry] };
    });
  };

  const quickAddCalendarEvent = (type: CalendarEventType, template: typeof QUICK_ADD_TEMPLATES[0]) => {
    if (!selectedDate) return;
    const pt = selectedDayPrayerTimes;
    let time = "06:00";
    if (pt && template.timeKey in pt) {
      time = (pt as Record<string, string>)[template.timeKey] ?? time;
      if (template.type === "taraweeh" && pt.isha) {
        const [h, m] = pt.isha.split(":").map(Number);
        const th = h + 1;
        const tm = (m || 0) + 30;
        time = `${(th + Math.floor(tm / 60)).toString().padStart(2, "0")}:${(tm % 60).toString().padStart(2, "0")}`;
      }
      if (template.type === "get_food") {
        const [h, m] = (pt.maghrib ?? "18:00").split(":").map(Number);
        time = `${h.toString().padStart(2, "0")}:${(Math.max(0, (m || 0) - 30)).toString().padStart(2, "0")}`;
      }
    }
    const duration = template.type === "taraweeh" ? 60 : template.type === "get_food" ? 30 : 15;
    addCalendarEvent(type, template.title, time, duration);
  };

  const addCustomCalendarEvent = () => {
    const title = customEventTitle.trim() || "Custom event";
    if (!selectedDate) return;
    addCalendarEvent("custom", title, customEventTime, 30);
    setCustomEventTitle("");
    setCustomEventTime("18:00");
  };

  const removeCalendarEvent = (id: string) => {
    if (!selectedDate) return;
    setCalendarEvents((prev) => {
      const day = (prev[selectedDate] ?? []).filter((e) => e.id !== id);
      return { ...prev, [selectedDate]: day };
    });
  };

  const selectedDayCalendarEvents = selectedDate ? (calendarEvents[selectedDate] ?? []) : [];

  const handleExportIcal = async (range: "month" | "30days" | "ramadan") => {
    if (!lat || !lng) return;
    setExportLoading(true);
    try {
      const now = new Date();
      let start: Date;
      let end: Date;
      if (range === "month") {
        start = new Date(now.getFullYear(), now.getMonth(), 1);
        end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      } else if (range === "30days") {
        start = new Date(now);
        end = new Date(now);
        end.setDate(end.getDate() + 29);
      } else {
        start = new Date(ramadanRange.start.getFullYear(), ramadanRange.start.getMonth(), ramadanRange.start.getDate());
        end = new Date(ramadanRange.end.getFullYear(), ramadanRange.end.getMonth(), ramadanRange.end.getDate());
      }
      const startStr = toLocalDateString(start);
      const endStr = toLocalDateString(end);
      const prayerTimesMap: Record<string, import("@/hooks/usePrayerTimes").PrayerTimes> = {};
      const startYear = start.getFullYear();
      const endYear = end.getFullYear();
      for (let y = startYear; y <= endYear; y++) {
        for (let m = 1; m <= 12; m++) {
          const monthStart = new Date(y, m - 1, 1);
          const monthEnd = new Date(y, m, 0);
          if (monthEnd < start || monthStart > end) continue;
          const data = await fetchPrayerTimesForMonth(lat, lng, y, m);
          Object.assign(prayerTimesMap, data);
        }
      }
      const ics = buildIcalContent({
        prayerTimesMap,
        customEvents: calendarEvents,
        dateRange: [startStr, endStr],
        includeTaraweeh: true,
        includePrayers: true,
        timezone: preferences.timezone ?? undefined,
      });
      downloadIcal(ics, `tryramadan-${startStr}-to-${endStr}.ics`);
      toast.success("Calendar exported successfully");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to export calendar. Try again.");
    } finally {
      setExportLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <PageSEO
        title="Schedule | TryRamadan.app"
        description={`Ramadan fasting schedule: calendar, suhoor and ${iftarLabelShort} times, events, and iCal export. Plan your fasting days.`}
        path="/dashboard/schedule"
      />
      <Navbar />

      <main id="main-content" className="main-content">
        <div className="container mx-auto px-4 max-w-4xl min-w-0">
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
            </h1>
            <p className="text-muted-foreground mt-2">
              Click a calendar day to view or edit its meal plan, food log, and macros. Hover stats and labels for tips.
            </p>
          </motion.div>

          {/* Today is Sunnah fasting day (Mon/Thu) — clear notice, clickable to hadith */}
          {isSunnahDay(today) && !ramadanRange.isRamadanDay(today) && (
            <motion.a
              href={`${EXTERNAL_LINKS.sunnah}/search?q=${encodeURIComponent("Sahih Muslim 1162 Monday Thursday fasting")}`}
              target="_blank"
              rel="noopener noreferrer"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 p-4 rounded-2xl bg-primary/15 border-2 border-primary/40 flex items-center gap-3 cursor-pointer hover:bg-primary/20 hover:border-primary/50 transition-colors"
              title="View hadith: Deeds are presented to Allah on Mondays and Thursdays, so the Prophet (ﷺ) fasted on these days."
            >
              <Star className="w-6 h-6 text-foreground fill-foreground shrink-0" aria-hidden />
              <div className="flex-1">
                <p className="font-semibold text-foreground">Today is a Sunnah fasting day</p>
                <p className="text-sm text-muted-foreground mt-0.5">
                  {today.getDay() === 1 ? "Monday" : "Thursday"} — voluntary fasting is recommended in Islamic tradition. • يوم صيام سنة
                </p>
                <p className="text-xs text-secondary mt-2">Click to view hadith on Sunnah.com →</p>
              </div>
            </motion.a>
          )}

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
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mt-4 pt-4 border-t border-border">
                    <div>
                      <Label className="text-xs">Calories</Label>
                      <Input
                        type="number"
                        min={CALORIE_MIN}
                        max={CALORIE_MAX}
                        value={dailyGoals.calories}
                        onChange={(e) =>
                          setDailyGoals((g) => ({ ...g, calories: clampCalories(parseInt(e.target.value, 10) || 0) }))
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
                  {(preferences.sexForCalories != null || (preferences.bodyWeightKg != null && preferences.bodyWeightKg > 0)) && (
                    <div className="mt-3 pt-3 border-t border-border flex flex-wrap items-center gap-2">
                      <span className="text-xs text-muted-foreground">
                        From your profile (Settings → Advanced): recommended {getRecommendedCaloriesFromPreferences(preferences)} cal
                      </span>
                      {getRecommendedCaloriesFromPreferences(preferences) !== dailyGoals.calories && (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="h-8 text-xs"
                          onClick={() => setDailyGoals((g) => ({ ...g, calories: getRecommendedCaloriesFromPreferences(preferences) }))}
                        >
                          Use recommended
                        </Button>
                      )}
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {/* Configure dashboard quick access */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            transition={{ delay: 0.06 }}
            className="mb-6 p-4 rounded-2xl bg-card border border-border"
          >
            <button
              type="button"
              onClick={() => setShowQuickActionsEditor(!showQuickActionsEditor)}
              className="w-full flex items-center justify-between font-medium"
            >
              <span className="flex items-center gap-2">
                <Target className="w-4 h-4 text-secondary" />
                Dashboard quick access
              </span>
              <span className="text-sm text-muted-foreground">
                {quickActionOrder.length} link{quickActionOrder.length !== 1 ? "s" : ""} on dashboard
              </span>
            </button>
            <p className="text-xs text-muted-foreground mt-1">Choose which links appear on the dashboard and in what order. Configure from this fasting schedule page.</p>
            <AnimatePresence>
              {showQuickActionsEditor && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  <ul className="mt-4 pt-4 border-t border-border space-y-2">
                    {quickActionOrder.map((id, index) => {
                      const action = DASHBOARD_QUICK_ACTIONS.find((a) => a.id === id);
                      if (!action) return null;
                      return (
                        <li
                          key={action.id}
                          className="flex items-center gap-2 p-2 rounded-xl bg-muted/50 border border-border"
                        >
                          <GripVertical className="w-4 h-4 text-muted-foreground shrink-0" aria-hidden />
                          <span className="font-medium text-sm flex-1 min-w-0 truncate">{action.label}</span>
                          <div className="flex items-center gap-0.5 shrink-0">
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 border border-transparent hover:border-border"
                              disabled={index === 0}
                              onClick={() => {
                                if (index === 0) return;
                                const next = [...quickActionOrder];
                                [next[index - 1], next[index]] = [next[index], next[index - 1]];
                                setQuickActionOrder(next);
                              }}
                              aria-label="Move up"
                            >
                              <ChevronUp className="w-4 h-4" />
                            </Button>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 border border-transparent hover:border-border"
                              disabled={index === quickActionOrder.length - 1}
                              onClick={() => {
                                if (index === quickActionOrder.length - 1) return;
                                const next = [...quickActionOrder];
                                [next[index], next[index + 1]] = [next[index + 1], next[index]];
                                setQuickActionOrder(next);
                              }}
                              aria-label="Move down"
                            >
                              <ChevronDown className="w-4 h-4" />
                            </Button>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 border border-transparent hover:border-destructive/30 text-muted-foreground hover:text-destructive"
                              onClick={() => setQuickActionOrder(quickActionOrder.filter((i) => i !== id))}
                              aria-label="Remove from quick access"
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                  {quickActionOrder.length < DASHBOARD_QUICK_ACTION_IDS.length && (
                    <div className="mt-3 pt-3 border-t border-border">
                      <span className="text-xs text-muted-foreground block mb-2">Add back:</span>
                      <div className="flex flex-wrap gap-2">
                        {DASHBOARD_QUICK_ACTION_IDS.filter((id) => !quickActionOrder.includes(id)).map((id) => {
                          const action = DASHBOARD_QUICK_ACTIONS.find((a) => a.id === id);
                          if (!action) return null;
                          return (
                            <Button
                              key={action.id}
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => setQuickActionOrder([...quickActionOrder, action.id])}
                            >
                              + {action.label}
                            </Button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {/* Export to calendar (.ics) */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            transition={{ delay: 0.07 }}
            className="mb-6 p-4 rounded-2xl bg-card border border-border"
          >
            <h3 className="font-display font-bold mb-2 flex items-center gap-2">
              <Download className="w-5 h-5 text-secondary" />
              Export to calendar
            </h3>
            <p className="text-sm text-muted-foreground mb-3">
              Download an .ics file with Suhoor, {iftarLabel}, all prayers, optional Taraweeh, and any events you add. Import into Google Calendar, Apple Calendar, or Outlook.
            </p>
            <div className="flex flex-wrap gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleExportIcal("month")}
                disabled={exportLoading || !lat || !lng}
                className="gap-2"
                aria-label="Download .ics file for current month"
              >
                {exportLoading ? <span className="animate-pulse">Loading…</span> : <Download className="w-4 h-4" />}
                Download .ics: this month
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleExportIcal("30days")}
                disabled={exportLoading || !lat || !lng}
                className="gap-2"
                aria-label="Download .ics file for next 30 days"
              >
                Download .ics: next 30 days
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleExportIcal("ramadan")}
                disabled={exportLoading || !lat || !lng}
                className="gap-2"
                aria-label="Download .ics file for Ramadan only"
              >
                Download .ics: Ramadan only
              </Button>
            </div>
            {(!lat || !lng) && (
              <LocationRequiredCTA
                compact
                message="Set your location in Settings to include prayer times in the export."
                className="mt-2"
              />
            )}
          </motion.div>

          {/* Stats: Ramadan, Sunnah, completed, hours fasted */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            transition={{ delay: 0.1 }}
            className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mb-6"
          >
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="p-4 rounded-2xl bg-secondary/10 border border-secondary/20 text-center cursor-help">
                  <span className="text-2xl md:text-3xl font-bold text-secondary">{ramadanDaysInMonth}</span>
                  <span className="block text-xs text-muted-foreground">Ramadan days this month</span>
                </div>
              </TooltipTrigger>
              <TooltipContent className="max-w-xs">
                <p className="text-sm text-foreground">{GENERAL_TOOLTIPS.ramadan.body}</p>
                <p className="text-xs text-muted-foreground mt-2 pt-2 border-t border-border/50">Arabic: <span className="font-arabic" dir="rtl">{GENERAL_TOOLTIPS.ramadan.bodyAr}</span></p>
              </TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="p-4 rounded-2xl bg-primary/10 border border-primary/20 text-center cursor-help">
                  <span className="text-2xl md:text-3xl font-bold">{sunnahDaysInMonth}</span>
                  <span className="block text-xs text-muted-foreground">Sunnah (Mon/Thu)</span>
                </div>
              </TooltipTrigger>
              <TooltipContent className="max-w-xs p-3">
                <p className="text-sm text-foreground">{GENERAL_TOOLTIPS.sunnah.body}</p>
                <p className="text-xs text-muted-foreground mt-2 pt-2 border-t border-border/50">Arabic: <span className="font-arabic" dir="rtl">{GENERAL_TOOLTIPS.sunnah.bodyAr}</span></p>
              </TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="p-4 rounded-2xl bg-card border border-border text-center cursor-help">
                  <span className="text-2xl md:text-3xl font-bold text-secondary">{completedCount}</span>
                  <span className="block text-xs text-muted-foreground">Days completed</span>
                </div>
              </TooltipTrigger>
              <TooltipContent className="max-w-xs">
                <p className="font-medium">Days you logged as fasted (dawn to sunset)</p>
                <p className="text-xs mt-1">Fasting days you’ve marked complete in this month. Tap a day in the calendar and use “I fasted this day — mark complete” to log it.</p>
              </TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="p-4 rounded-2xl bg-card border border-border text-center cursor-help">
                  <span className="text-2xl md:text-3xl font-bold">{totalHoursFasted > 0 ? totalHoursFasted.toFixed(1) : "—"}</span>
                  <span className="block text-xs text-muted-foreground">Total hours fasted</span>
                </div>
              </TooltipTrigger>
              <TooltipContent className="max-w-xs p-3">
                <p className="text-sm text-foreground">Sum of hours fasted on days where you logged start/end or hours. Shown for the currently viewed calendar month.</p>
                <p className="text-xs text-muted-foreground mt-2 pt-2 border-t border-border/50">Arabic: <span className="font-arabic" dir="rtl">إجمالي ساعات الصيام</span></p>
              </TooltipContent>
            </Tooltip>
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
                <h3 className="font-display font-bold text-base sm:text-lg min-w-0 text-center">
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
              <div className="flex gap-2 flex-wrap">
                <Button variant="outline" size="sm" onClick={goToRamadan} className="gap-2">
                  <CalendarDays className="w-4 h-4" />
                  Jump to Ramadan in calendar
                </Button>
                <Button variant="outline" size="sm" onClick={goToToday} className="gap-2">
                  Jump to today in calendar
                </Button>
              </div>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              Click any day to view meal plan, food log, and fasting log for that day. Past days are read-only.
            </p>

            <div className="grid grid-cols-7 gap-0.5 sm:gap-1 mb-2">
              {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                <div key={day} className="text-center text-xs text-muted-foreground py-2">
                  {day}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-0.5 sm:gap-1">
              {Array.from({ length: firstDay }).map((_, i) => (
                <div key={`empty-${i}`} className="aspect-square" />
              ))}
              {Array.from({ length: daysInMonth }).map((_, i) => {
                const date = new Date(
                  currentMonth.getFullYear(),
                  currentMonth.getMonth(),
                  i + 1
                );
                const dateStr = toLocalDateString(date);
                const isRamadan = ramadanRange.isRamadanDay(date);
                const ramadanDay = ramadanRange.getRamadanDayNumber(date);
                const completed = isCompleted(date);
                const isSunnah = isSunnahDay(date);
                const isToday = date.toDateString() === today.toDateString();
                const isSpecialNight = isLaylatAlQadrNight(date);
                const hasNote = scheduleNotes[dateStr];
                const hasJournal = journalDates.has(dateStr);
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
                          ${isSunnah && !isRamadan && !completed ? "bg-primary/10 hover:bg-primary/20 ring-2 ring-primary/50 border border-primary/40" : ""}
                          ${isToday && isSunnah && !isRamadan ? "ring-2 ring-primary ring-offset-2 ring-offset-background" : ""}
                          ${!isRamadan && !isSunnah ? "bg-muted/50 hover:bg-muted text-muted-foreground" : ""}
                        `}
                      >
                        {isToday && isSunnah && !isRamadan && (
                          <span className="absolute top-0 left-0 right-0 text-[9px] font-semibold text-foreground truncate px-0.5">Today</span>
                        )}
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
                          <Star className="w-2.5 h-2.5 absolute top-0.5 right-0.5 text-foreground fill-foreground" aria-hidden />
                        )}
                        {isSpecialNight && (
                          <Sparkles className="w-2.5 h-2.5 absolute bottom-0.5 text-amber-600" />
                        )}
                        {hasNote && (
                          <PenLine className="w-2.5 h-2.5 absolute top-0.5 left-0.5 text-muted-foreground" />
                        )}
                        {hasJournal && (
                          <span className="absolute bottom-0.5 right-0.5 w-1.5 h-1.5 rounded-full bg-foreground" title="Journal entry" />
                        )}
                        {(hasMeals || hasNutrition) && (
                          <span className="absolute bottom-0.5 left-0.5 text-[10px] opacity-70">
                            •
                          </span>
                        )}
                      </button>
                    </TooltipTrigger>
                    <TooltipContent className="max-w-xs p-3">
                      {date.toLocaleDateString("en", { weekday: "short", month: "short", day: "numeric", year: "numeric" })}
                      {isToday && " · Today"}
                      {isRamadan && ramadanDay != null && ` · Ramadan Day ${ramadanDay} (of 30)`}
                      {isSpecialNight && " · Laylat al-Qadr"}
                      {isSunnah && !isRamadan && (isToday ? " · Today is a Sunnah fasting day (Mon/Thu)" : " · Sunnah day (Mon/Thu)")}
                      {completed && " · Completed ✓"}
                      {hasNote && " · Has note"}
                      {hasJournal && " · Journal entry"}
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
                      <h4 className="font-display font-bold flex items-center gap-2 flex-wrap">
                        {selectedDateObj?.toLocaleDateString("en", {
                          weekday: "long",
                          month: "long",
                          day: "numeric",
                          year: "numeric",
                        })}
                        {selectedRamadanDay != null && (
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <span className="text-sm font-normal text-secondary cursor-help border-b border-dotted border-secondary/50">
                                Ramadan Day {selectedRamadanDay} (of 30)
                              </span>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p className="font-medium">Day {selectedRamadanDay} of 30 in Ramadan</p>
                              <p className="text-xs mt-1">This date is the {selectedRamadanDay}{selectedRamadanDay === 1 ? "st" : selectedRamadanDay === 2 ? "nd" : selectedRamadanDay === 3 ? "rd" : "th"} day of the blessed month of fasting.</p>
                            </TooltipContent>
                          </Tooltip>
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

                    {/* Day summary: prayer times, meals, journal, fasting context */}
                    <div className="rounded-xl bg-card border border-border p-3 space-y-2 text-sm">
                      <p className="font-semibold text-muted-foreground text-xs uppercase tracking-wide">Day at a glance</p>
                      {selectedDayPrayerTimes && (
                        <p className="text-muted-foreground">
                          <span className="font-medium text-foreground">Prayer:</span> Fajr {selectedDayPrayerTimes.fajr} · Maghrib ({iftarLabelShort}) {selectedDayPrayerTimes.maghrib}
                        </p>
                      )}
                      <p className="text-muted-foreground">
                        <span className="font-medium text-foreground">Meals:</span> Suhoor {selectedDayMeals?.suhoor?.trim() ? `— ${selectedDayMeals.suhoor}` : "—"} · {iftarLabel} {selectedDayMeals?.iftar?.trim() ? `— ${selectedDayMeals.iftar}` : "—"}
                      </p>
                      {selectedDayJournal && (selectedDayJournal.content || selectedDayJournal.gratitude) && (
                        <p className="text-muted-foreground">
                          <span className="font-medium text-foreground">Journal:</span>{" "}
                          {(selectedDayJournal.content ?? "").slice(0, 80)}
                          {(selectedDayJournal.content ?? "").length > 80 ? "…" : ""}
                          {selectedDayJournal.gratitude && (
                            <span className="block mt-0.5 text-secondary">Grateful: {selectedDayJournal.gratitude}</span>
                          )}
                          {" "}
                          <Link to="/dashboard/journal" className="text-secondary hover:underline text-xs">Open Journal →</Link>
                        </p>
                      )}
                      {(selectedIsRamadan || selectedIsSunnah) && (
                        <p className="text-muted-foreground">
                          <span className="font-medium text-foreground">Fast:</span>{" "}
                          {selectedCompleted
                            ? "Completed (full day dawn to sunset)"
                            : selectedFastingLog?.status === "broken"
                              ? `Broke fast — ${getBrokenReasonLabel(selectedFastingLog.brokenReason)}. ${selectedFastingLog.hoursFasted != null ? `${selectedFastingLog.hoursFasted}h fasted` : ""}`
                              : selectedFastingLog?.startedAt
                                ? "Started fasting (not completed)"
                                : "No fast logged"}
                          {selectedFastingLog && selectedDayPrayerTimes && (() => {
                            const imsakStr = selectedDayPrayerTimes.imsak ?? selectedDayPrayerTimes.fajr;
                            const imsakTime = new Date((selectedDate ?? "") + "T" + (imsakStr?.length === 5 ? imsakStr + ":00" : imsakStr ?? "05:00")).getTime();
                            const maghribTime = new Date((selectedDate ?? "") + "T" + (selectedDayPrayerTimes.maghrib?.length === 5 ? selectedDayPrayerTimes.maghrib + ":00" : selectedDayPrayerTimes.maghrib)).getTime();
                            const started = selectedFastingLog.startedAt ? new Date(selectedFastingLog.startedAt).getTime() : 0;
                            const completed = selectedFastingLog.completedAt ? new Date(selectedFastingLog.completedAt).getTime() : 0;
                            const parts: string[] = [];
                            if (started && started < imsakTime) parts.push("started before Suhoor end (eating window)");
                            else if (started && started < maghribTime) parts.push("started after Suhoor end (fasting)");
                            else if (started) parts.push("started after Iftar (eating window)");
                            if (completed && selectedFastingLog.status === "broken") {
                              if (completed < maghribTime) parts.push("broke before Iftar");
                              else parts.push("broke at/after Iftar");
                            }
                            return parts.length > 0 ? " · " + parts.join("; ") : null;
                          })()}
                        </p>
                      )}
                    </div>

                    {/* Today's schedule timeline for selected day */}
                    {selectedDayPrayerTimes && (
                      <div className="mb-4">
                        <TodayScheduleTimeline
                          prayerTimes={selectedDayPrayerTimes}
                          iftarLabelShort={iftarLabelShort}
                          includeTaraweeh
                        />
                      </div>
                    )}

                    {/* Mark complete / I didn't fast this day (FALL-OFF-AND-RETURN-FLOWS); broken day: Edit reason, B→C, B→I (STATE-TRANSITION-TESTING-FASTING) */}
                    {(selectedIsRamadan || selectedIsSunnah) && selectedDate && (
                      <div className="flex flex-wrap items-center gap-2">
                        {selectedFastingLog?.status === "broken" ? (
                          <>
                            <Button variant="outline" size="sm" onClick={() => setEditReasonOpen(true)} className="gap-2">
                              <PenLine className="w-4 h-4" />
                              Edit reason
                            </Button>
                            <Button variant="outline" size="sm" onClick={() => setConfirmCompleteOpen(true)} className="gap-2">
                              <Check className="w-4 h-4" />
                              Mark as completed anyway?
                            </Button>
                            <Button variant="outline" size="sm" onClick={() => setConfirmInProgressOpen(true)} className="gap-2">
                              <Clock className="w-4 h-4" />
                              Start fast again
                            </Button>
                            {!selectedSkipped && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setDaySkipped(progress, setProgress, selectedDate)}
                                className="gap-2 text-muted-foreground"
                              >
                                I didn&apos;t fast this day
                              </Button>
                            )}
                          </>
                        ) : (
                          <>
                            <Button
                              variant={selectedCompleted ? "secondary" : "outline"}
                              size="sm"
                              onClick={() => toggleCompleted(selectedDate)}
                              className="gap-2"
                            >
                              <Check className="w-4 h-4" />
                              {selectedCompleted ? "Yes, logged ✓" : "I fasted this day — mark complete"}
                            </Button>
                            {!selectedSkipped && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setDaySkipped(progress, setProgress, selectedDate)}
                                className="gap-2 text-muted-foreground"
                              >
                                I didn&apos;t fast this day
                              </Button>
                            )}
                          </>
                        )}
                      </div>
                    )}
                    {/* Edit broken reason (E8) */}
                    {selectedDate && (
                      <BreakFastReasonDialog
                        open={editReasonOpen}
                        onOpenChange={setEditReasonOpen}
                        title="Change reason for breaking fast"
                        onSelectReason={(reasonId) => {
                          updateBrokenReason(progress, setProgress, selectedDate, reasonId);
                          setEditReasonOpen(false);
                          toast.success("Reason updated");
                        }}
                        userType={preferences?.userType}
                      />
                    )}
                    {/* B→C: Mark broken day as completed (with confirmation) */}
                    <AlertDialog open={confirmCompleteOpen} onOpenChange={setConfirmCompleteOpen}>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Mark this day as completed?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This day is currently marked as broken. Do you want to change it to completed? (For example, if you made up the fast later or logged it by mistake.)
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => {
                              if (selectedDate) {
                                setBrokenDayToCompleted(progress, setProgress, selectedDate);
                                toast.success("Day marked as completed");
                              }
                              setConfirmCompleteOpen(false);
                            }}
                          >
                            Yes, mark complete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                    {/* B→I: Set broken day back to in-progress (with confirmation) */}
                    <AlertDialog open={confirmInProgressOpen} onOpenChange={setConfirmInProgressOpen}>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Start fast again for this day?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This will change the day from &quot;broken&quot; back to &quot;in progress&quot;. Use this if you broke the fast by mistake or want to log again.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => {
                              if (selectedDate) {
                                setBrokenDayToInProgress(progress, setProgress, selectedDate);
                                toast.success("Day set to in progress");
                              }
                              setConfirmInProgressOpen(false);
                            }}
                          >
                            Start fast again
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>

                    {/* Hours fasted (if logged) */}
                    {(selectedFastingLog?.hoursFasted != null ||
                      (selectedFastingLog?.startedAt && selectedFastingLog?.completedAt)) && (
                      <div className="flex items-center gap-2 p-3 rounded-xl bg-secondary/10 border border-secondary/20">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Clock className="w-4 h-4 text-secondary shrink-0" />
                          </TooltipTrigger>
                          <TooltipContent className="max-w-xs">
                            <p className="font-medium">{EATING_TIME_TOOLTIPS.suhoorEnds.title}</p>
                            <p className="text-xs mt-1">{EATING_TIME_TOOLTIPS.suhoorEnds.body}</p>
                          </TooltipContent>
                        </Tooltip>
                        <span className="text-sm font-medium">
                          Hours fasted: <strong>
                            {selectedFastingLog.hoursFasted ??
                              (selectedFastingLog.startedAt && selectedFastingLog.completedAt
                                ? hoursBetween(selectedFastingLog.startedAt, selectedFastingLog.completedAt)
                                : 0)}
                            h
                          </strong>
                        </span>
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

                    {/* Add to calendar: quick-add events + custom + list */}
                    <div>
                      <Label className="flex items-center gap-2 text-sm font-medium mb-2">
                        <CalendarDays className="w-4 h-4" />
                        Add to calendar (export .ics above)
                      </Label>
                      <p className="text-xs text-muted-foreground mb-2">
                        Quick-add {suhoorLabel}, {iftarLabel}, prayers, Taraweeh, get food. These plus your custom events are included when you export.
                      </p>
                      <div className="flex flex-wrap gap-1.5 mb-2">
                        {QUICK_ADD_TEMPLATES.map((t) => (
                          <Button
                            key={t.type}
                            type="button"
                            variant="outline"
                            size="sm"
                            className="text-xs h-8"
                            onClick={() => quickAddCalendarEvent(t.type, t)}
                          >
                            {t.type === "suhoor" ? `${suhoorLabel} (eat before)` : t.type === "iftar" ? iftarLabel : t.title}
                          </Button>
                        ))}
                      </div>
                      <div className="flex gap-2 mb-2 flex-wrap items-end">
                        <Input
                          placeholder="Custom event title"
                          value={customEventTitle}
                          onChange={(e) => setCustomEventTitle(e.target.value)}
                          className="flex-1 min-w-[120px] min-h-[44px] h-9 sm:h-9 text-sm"
                        />
                        <input
                          type="time"
                          value={customEventTime}
                          onChange={(e) => setCustomEventTime(e.target.value)}
                          className="min-h-[44px] h-9 px-2 rounded-md border border-border bg-background text-sm"
                          aria-label="Event time"
                        />
                        <Button type="button" size="sm" onClick={addCustomCalendarEvent} className="min-h-[44px] h-9">
                          Add
                        </Button>
                      </div>
                      {selectedDayCalendarEvents.length > 0 && (
                        <ul className="space-y-1.5 mt-2">
                          {selectedDayCalendarEvents.map((e) => (
                            <li
                              key={e.id}
                              className="flex items-center justify-between py-1.5 px-2 rounded-lg bg-muted/50 text-sm"
                            >
                              <span className="flex items-center gap-2">
                                <Clock className="w-3.5 h-3.5 text-muted-foreground" />
                                {e.time} — {e.title}
                              </span>
                              <button
                                type="button"
                                onClick={() => removeCalendarEvent(e.id)}
                                className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded border border-transparent hover:border-destructive/30 hover:bg-destructive/20 text-muted-foreground hover:text-destructive"
                                aria-label="Remove"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>

                    {/* Meal plan: for today and future days only; past days show read-only */}
                    <div>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Label className="flex items-center gap-2 text-sm font-medium mb-2 cursor-help w-fit">
                            <Sunrise className="w-4 h-4" aria-hidden />
                            <Sunset className="w-4 h-4" aria-hidden />
                            {canEditMealPlan ? `Meal plan (Suhoor & ${iftarLabel})` : `Meal plan — ${isSelectedPastDay ? "past day (read-only)" : "this day"}`}
                          </Label>
                        </TooltipTrigger>
                        <TooltipContent className="max-w-xs">
                          <p className="font-medium">
                            {canEditMealPlan
                              ? "Plan your Suhoor and break-fast for this day"
                              : "Past days are read-only. Meal planning is for today and future days."}
                          </p>
                          <p className="text-xs mt-1">
                            {canEditMealPlan
                              ? `Short notes for your pre-dawn meal (Suhoor) and break-fast meal (${iftarLabel}). Use the Meals page to browse recipes.`
                              : "What you had is in the food log below."}
                          </p>
                        </TooltipContent>
                      </Tooltip>
                      {isSelectedPastDay && (
                        <p className="text-xs text-muted-foreground mb-2">
                          Meal planning is for today and future days. Below shows what you had planned or logged for this past day.
                        </p>
                      )}
                      <div className="grid gap-2">
                        <div className="flex items-center gap-2">
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <span className="flex items-center gap-1 text-muted-foreground shrink-0">
                                <Sunrise className="w-4 h-4" aria-hidden />
                                <span className="text-xs">Suhoor (morning)</span>
                              </span>
                            </TooltipTrigger>
                            <TooltipContent className="max-w-xs">
                              <p className="font-medium">{EATING_TIME_TOOLTIPS.suhoor.title}</p>
                              <p className="text-xs mt-1">{EATING_TIME_TOOLTIPS.suhoor.body}</p>
                            </TooltipContent>
                          </Tooltip>
                          <Input
                            placeholder={canEditMealPlan ? "e.g. Oats & dates" : "Nothing planned"}
                            value={selectedDayMeals?.suhoor ?? ""}
                            onChange={(e) =>
                              canEditMealPlan &&
                              setMealPlans((prev) => ({
                                ...prev,
                                [selectedDate!]: {
                                  ...prev[selectedDate!],
                                  suhoor: e.target.value.trim() || undefined,
                                },
                              }))
                            }
                            readOnly={!canEditMealPlan}
                            className="bg-background"
                            aria-label={canEditMealPlan ? "Suhoor meal plan" : "Suhoor (past day, read-only)"}
                          />
                        </div>
                        <div className="flex items-center gap-2">
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <span className="flex items-center gap-1 text-muted-foreground shrink-0">
                                <Sunset className="w-4 h-4" aria-hidden />
                                <span className="text-xs">{iftarLabel} (evening)</span>
                              </span>
                            </TooltipTrigger>
                            <TooltipContent className="max-w-xs">
                              <p className="font-medium">{EATING_TIME_TOOLTIPS.iftar.title}</p>
                              <p className="text-xs mt-1">{EATING_TIME_TOOLTIPS.iftar.body}</p>
                            </TooltipContent>
                          </Tooltip>
                          <Input
                            placeholder={canEditMealPlan ? "e.g. Harira & dates" : "Nothing planned"}
                            value={selectedDayMeals?.iftar ?? ""}
                            onChange={(e) =>
                              canEditMealPlan &&
                              setMealPlans((prev) => ({
                                ...prev,
                                [selectedDate!]: {
                                  ...prev[selectedDate!],
                                  iftar: e.target.value.trim() || undefined,
                                },
                              }))
                            }
                            readOnly={!canEditMealPlan}
                            className="bg-background"
                            aria-label={canEditMealPlan ? `${iftarLabel} meal plan` : `${iftarLabel} (past day, read-only)`}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Food log: what you ate with portions & macros */}
                    <div>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Label className="flex items-center gap-2 text-sm font-medium mb-2 cursor-help w-fit">
                            <Flame className="w-4 h-4" />
                            Food log (calories & macros)
                          </Label>
                        </TooltipTrigger>
                        <TooltipContent className="max-w-xs">
                          <p className="font-medium">What you ate and nutrition per portion</p>
                          <p className="text-xs mt-1">Log Suhoor and Iftar items (from recipes or custom). Set portions; calories and macros are per portion. Totals feed into “Goal today” above.</p>
                        </TooltipContent>
                      </Tooltip>
                      <p className="text-xs text-muted-foreground mb-2">
                        Add items from recipes or type custom. Set portions; macros are per portion.
                      </p>

                      {/* Suhoor entries */}
                      <div className="mb-3">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <span className="text-xs font-medium text-muted-foreground flex items-center gap-1 mb-1">
                              <Sunrise className="w-3 h-3" aria-hidden /> Suhoor
                            </span>
                          </TooltipTrigger>
                          <TooltipContent className="max-w-xs">
                            <p className="font-medium">{EATING_TIME_TOOLTIPS.suhoor.title}</p>
                            <p className="text-xs mt-1">{EATING_TIME_TOOLTIPS.suhoor.body}</p>
                          </TooltipContent>
                        </Tooltip>
                        {(selectedDayFoodLog?.suhoor?.length ?? 0) === 0 ? (
                          <p className="text-xs text-muted-foreground pl-4">No items logged</p>
                        ) : (
                          <ul className="space-y-1.5 pl-4">
                            {(selectedDayFoodLog?.suhoor ?? []).map((e) => (
                              <FoodLogRow
                                key={e.id}
                                entry={e}
                                onPortionsChange={(p) => updateFoodPortions("suhoor", e.id, p)}
                                onRemove={() => removeFoodEntry("suhoor", e.id)}
                              />
                            ))}
                          </ul>
                        )}
                      </div>

                      {/* Iftar entries */}
                      <div className="mb-3">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <span className="text-xs font-medium text-muted-foreground flex items-center gap-1 mb-1">
                              <Sunset className="w-3 h-3" aria-hidden /> {iftarLabel}
                            </span>
                          </TooltipTrigger>
                          <TooltipContent className="max-w-xs">
                            <p className="font-medium">{EATING_TIME_TOOLTIPS.iftar.title}</p>
                            <p className="text-xs mt-1">{EATING_TIME_TOOLTIPS.iftar.body}</p>
                          </TooltipContent>
                        </Tooltip>
                        {(selectedDayFoodLog?.iftar?.length ?? 0) === 0 ? (
                          <p className="text-xs text-muted-foreground pl-4">No items logged</p>
                        ) : (
                          <ul className="space-y-1.5 pl-4">
                            {(selectedDayFoodLog?.iftar ?? []).map((e) => (
                              <FoodLogRow
                                key={e.id}
                                entry={e}
                                onPortionsChange={(p) => updateFoodPortions("iftar", e.id, p)}
                                onRemove={() => removeFoodEntry("iftar", e.id)}
                              />
                            ))}
                          </ul>
                        )}
                      </div>

                      {/* Totals from food log */}
                      {(selectedDayTotalsFromFood.calories != null && selectedDayTotalsFromFood.calories > 0) && (
                        <div className="p-2 rounded-lg bg-muted/50 text-xs flex flex-wrap gap-3 mb-3">
                          <span>Total from log: <strong>{Math.round(selectedDayTotalsFromFood.calories)} cal</strong></span>
                          {selectedDayTotalsFromFood.protein != null && selectedDayTotalsFromFood.protein > 0 && (
                            <span>P {Math.round(selectedDayTotalsFromFood.protein)}g</span>
                          )}
                          {selectedDayTotalsFromFood.carbs != null && selectedDayTotalsFromFood.carbs > 0 && (
                            <span>C {Math.round(selectedDayTotalsFromFood.carbs)}g</span>
                          )}
                          {selectedDayTotalsFromFood.fat != null && selectedDayTotalsFromFood.fat > 0 && (
                            <span>F {Math.round(selectedDayTotalsFromFood.fat)}g</span>
                          )}
                        </div>
                      )}

                      {/* Add food */}
                      <div className="space-y-2">
                        {addFoodMeal === null ? (
                          <div className="flex gap-2">
                            <Button type="button" variant="outline" size="sm" onClick={() => setAddFoodMeal("suhoor")} className="gap-1">
                              <Plus className="w-3 h-3" /> Log a Suhoor item
                            </Button>
                            <Button type="button" variant="outline" size="sm" onClick={() => setAddFoodMeal("iftar")} className="gap-1">
                              <Plus className="w-3 h-3" /> Log a {iftarLabel} item
                            </Button>
                          </div>
                        ) : (
                          <div className="p-3 rounded-xl border border-border bg-background space-y-3">
                            <p className="text-xs font-medium">
                              Add to {addFoodMeal === "suhoor" ? "Suhoor" : iftarLabel}
                            </p>
                            <div className="flex flex-wrap gap-2 items-end">
                              <div className="min-w-[160px]">
                                <Label className="text-xs">From recipe</Label>
                                <Select
                                  onValueChange={(v) => addFoodFromRecipe(addFoodMeal, v)}
                                  value=""
                                >
                                  <SelectTrigger className="mt-0.5 h-9">
                                    <SelectValue placeholder="Pick recipe..." />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {allRecipesForPicker
                                      .filter((r) => r.mealType === addFoodMeal)
                                      .map(({ recipe, mealType }) => (
                                        <SelectItem key={`${mealType}-${recipe.id}`} value={`${mealType}-${recipe.id}`}>
                                          {recipe.name} ({recipe.nutrition?.calories ?? "?"} cal)
                                        </SelectItem>
                                      ))}
                                  </SelectContent>
                                </Select>
                              </div>
                              <span className="text-xs font-medium text-muted-foreground">Create your own meal:</span>
                              <Input
                                placeholder="Name"
                                className="w-28 h-9"
                                value={addFoodCustomInputs.name}
                                onChange={(e) => setAddFoodCustomInputs((c) => ({ ...c, name: e.target.value }))}
                              />
                              <Input
                                type="number"
                                placeholder="Cal/portion"
                                className="w-20 h-9"
                                value={addFoodCustomInputs.cal}
                                onChange={(e) => setAddFoodCustomInputs((c) => ({ ...c, cal: e.target.value }))}
                              />
                              <Input
                                type="number"
                                step="0.5"
                                placeholder="Portions"
                                className="w-16 h-9"
                                value={addFoodCustomInputs.portions}
                                onChange={(e) => setAddFoodCustomInputs((c) => ({ ...c, portions: e.target.value }))}
                              />
                              <Input
                                type="number"
                                placeholder="P"
                                className="w-12 h-9"
                                value={addFoodCustomInputs.protein}
                                onChange={(e) => setAddFoodCustomInputs((c) => ({ ...c, protein: e.target.value }))}
                              />
                              <Input
                                type="number"
                                placeholder="C"
                                className="w-12 h-9"
                                value={addFoodCustomInputs.carbs}
                                onChange={(e) => setAddFoodCustomInputs((c) => ({ ...c, carbs: e.target.value }))}
                              />
                              <Input
                                type="number"
                                placeholder="F"
                                className="w-12 h-9"
                                value={addFoodCustomInputs.fat}
                                onChange={(e) => setAddFoodCustomInputs((c) => ({ ...c, fat: e.target.value }))}
                              />
                              <Button type="button" size="sm" onClick={() => submitAddFoodCustom(addFoodMeal)}>
                                Add this meal to food log
                              </Button>
                              <Button type="button" variant="ghost" size="sm" onClick={() => { setAddFoodMeal(null); setAddFoodCustomInputs({ name: "", cal: "", portions: "1", protein: "", carbs: "", fat: "" }); }}>
                                Cancel (don't add)
                              </Button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Calories & macros */}
                    <div>
                      <Label className="flex items-center gap-2 text-sm font-medium mb-2">
                        <Flame className="w-4 h-4" />
                        Calories & macros (estimate or log)
                      </Label>
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2 sm:gap-3">
                        <div>
                          <Label className="text-xs text-muted-foreground">Calories</Label>
                          <Input
                            type="number"
                            min={CALORIE_MIN}
                            max={CALORIE_MAX}
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
                                      : clampCalories(parseInt(e.target.value, 10) || 0),
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
                      {hasEffectiveTotals && (
                        <div className="mt-2 flex flex-wrap gap-3 text-xs">
                          <span className="text-muted-foreground">Goal today:</span>
                          <span>
                            Cal{" "}
                            {effectiveDayTotals.calories >= dailyGoals.calories ? "✓" : ""}{" "}
                            {Math.round(effectiveDayTotals.calories)} / {dailyGoals.calories}
                          </span>
                          <span>
                            P {Math.round(effectiveDayTotals.protein)} / {dailyGoals.protein}g
                          </span>
                          <span>
                            C {Math.round(effectiveDayTotals.carbs)} / {dailyGoals.carbs}g
                          </span>
                          <span>
                            F {Math.round(effectiveDayTotals.fat)} / {dailyGoals.fat}g
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
              <span className="text-muted-foreground">Click any day to log food, hours fasted & macros</span>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex items-center gap-2 cursor-help">
                    <div className="w-4 h-4 rounded bg-secondary" />
                    <span>Completed</span>
                  </div>
                </TooltipTrigger>
                <TooltipContent className="max-w-xs p-3">
                  <p className="text-sm text-foreground">{GENERAL_TOOLTIPS.markComplete.body}</p>
                  <p className="text-xs text-muted-foreground mt-2 pt-2 border-t border-border/50">Arabic: <span className="font-arabic" dir="rtl">{GENERAL_TOOLTIPS.markComplete.bodyAr}</span></p>
                </TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex items-center gap-2 cursor-help">
                    <div className="w-4 h-4 rounded bg-secondary/20" />
                    <span>Ramadan</span>
                  </div>
                </TooltipTrigger>
                <TooltipContent className="max-w-xs p-3">
                  <p className="text-sm text-foreground">{GENERAL_TOOLTIPS.ramadan.body}</p>
                  <p className="text-xs text-muted-foreground mt-2 pt-2 border-t border-border/50">Arabic: <span className="font-arabic" dir="rtl">{GENERAL_TOOLTIPS.ramadan.bodyAr}</span></p>
                </TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex items-center gap-2 cursor-help">
                    <div className="w-4 h-4 rounded bg-amber-500/30 border border-amber-500/40" />
                    <span>Laylat al-Qadr</span>
                  </div>
                </TooltipTrigger>
                <TooltipContent className="max-w-xs p-3">
                  <p className="text-sm text-foreground">{GENERAL_TOOLTIPS.laylatAlQadr.body}</p>
                  <p className="text-xs text-muted-foreground mt-2 pt-2 border-t border-border/50">Arabic: <span className="font-arabic" dir="rtl">{GENERAL_TOOLTIPS.laylatAlQadr.bodyAr}</span></p>
                </TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex items-center gap-2 cursor-help">
                    <div className="w-4 h-4 rounded bg-primary/20 border border-primary/30" title="Sunnah day" />
                    <span>Sunnah (Mon/Thu)</span>
                  </div>
                </TooltipTrigger>
                <TooltipContent className="max-w-xs p-3">
                  <p className="text-sm text-foreground">{GENERAL_TOOLTIPS.sunnah.body}</p>
                  <p className="text-xs text-muted-foreground mt-2 pt-2 border-t border-border/50">Arabic: <span className="font-arabic" dir="rtl">{GENERAL_TOOLTIPS.sunnah.bodyAr}</span></p>
                </TooltipContent>
              </Tooltip>
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
