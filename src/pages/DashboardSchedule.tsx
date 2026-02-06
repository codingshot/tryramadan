import { useState, useCallback, useMemo, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useLocation, useSearchParams } from "react-router-dom";
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
  Moon,
  Sun,
  ImagePlus,
  Copy,
} from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import {
  useFastingProgress,
  useLocalStorage,
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
  startFastingToday,
  breakFastingToday,
  isFastingToday,
  getTodayFastingLog,
  useUserPreferences,
  getRecommendedCaloriesFromPreferences,
  useDisplayTimezone,
  useCalendarEvents,
  usePrayerTimeOverrides,
  useDefaultPrayerDurations,
  useCalendarIncludeTypes,
  getDefaultDurationForType,
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
import {
  toLocalDateString,
  getTodayStringInTimezone,
  getNowSecondsSinceMidnightInTimezone,
  timeStringToSecondsSinceMidnight,
  secondsUntilTimeInTimezone,
} from "@/lib/utils";
import { usePrayerTimes, usePrayerTimesForDate, getEffectivePrayerTimes, useRamadanPrayerTimes } from "@/hooks/usePrayerTimes";
import { buildIcalContent, downloadIcal } from "@/lib/ical";
import { fetchPrayerTimesForMonth } from "@/hooks/usePrayerTimes";
import { getRecipes, getRecipe, parseNutrient, type MealType } from "@/lib/cultureRecipes";
import { EATING_TIME_TOOLTIPS } from "@/data/eating-times-tooltips";
import { EXTERNAL_LINKS } from "@/lib/config";
import { GENERAL_TOOLTIPS } from "@/data/general-tooltips";
import { resizeImageToDataUrl } from "@/lib/foodImage";
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
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
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
      {entry.imageDataUrl ? (
        <img src={entry.imageDataUrl} alt="" className="h-10 w-10 rounded object-cover shrink-0 border border-border" />
      ) : null}
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

/** Valid YYYY-MM-DD for URL/sync. */
function isValidDateString(s: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(s)) return false;
  const t = new Date(s + "T12:00:00").getTime();
  return Number.isFinite(t);
}

/** Fasting hours for a day from imsak (suhoor end) to maghrib (iftar). Returns null if times missing or invalid. */
function getFastingHoursForDay(imsak: string | undefined, maghrib: string | undefined): number | null {
  if (!imsak?.trim() || !maghrib?.trim()) return null;
  const imsakSec = timeStringToSecondsSinceMidnight(imsak.trim().split(" ")[0] ?? imsak);
  const maghribSec = timeStringToSecondsSinceMidnight(maghrib.trim().split(" ")[0] ?? maghrib);
  const diffSec = maghribSec - imsakSec;
  if (diffSec <= 0) return null;
  return Math.round((diffSec / 3600) * 10) / 10;
}

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
  const [mealPlans, setMealPlans] = useDayMealPlans();
  const [nutrition, setNutrition] = useDayNutrition();
  const [foodLogs, setFoodLogs] = useDayFoodLog();
  const [calendarEvents, setCalendarEvents] = useCalendarEvents();
  const [prayerTimeOverrides, setPrayerTimeOverrides] = usePrayerTimeOverrides();
  const [defaultDurations, setDefaultDurations] = useDefaultPrayerDurations();
  const [calendarIncludeTypes, setCalendarIncludeTypes] = useCalendarIncludeTypes();
  const locationCoords = preferences.locationCoords;
  const lat = locationCoords?.lat ?? null;
  const lng = locationCoords?.lng ?? null;
  const { prayerTimesMap: ramadanPrayerTimesMap, loading: ramadanPrayersLoading, refetch: refetchRamadanPrayers } = useRamadanPrayerTimes(lat, lng);

  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const todayStrForInit = toLocalDateString(new Date());
  const dateFromUrl = searchParams.get("date");
  const initialDateFromUrl = dateFromUrl && isValidDateString(dateFromUrl) ? dateFromUrl : null;
  const initialDateFromState = (location.state as { date?: string } | null)?.date;
  const initialDate = initialDateFromUrl ?? initialDateFromState ?? todayStrForInit;
  const [selectedDate, setSelectedDate] = useState<string | null>(initialDate);
  const [noteInput, setNoteInput] = useState(() => scheduleNotes[initialDate] || "");
  const [currentMonth, setCurrentMonth] = useState(() => {
    const d = new Date(initialDate + "T12:00:00");
    return new Date(d.getFullYear(), d.getMonth(), 1);
  });
  // Sync URL -> state when URL date changes (e.g. browser back, or link with ?date=)
  useEffect(() => {
    const urlDate = searchParams.get("date");
    if (urlDate && isValidDateString(urlDate)) {
      setSelectedDate(urlDate);
      setNoteInput(scheduleNotes[urlDate] || "");
      const d = new Date(urlDate + "T12:00:00");
      setCurrentMonth(new Date(d.getFullYear(), d.getMonth(), 1));
    }
  }, [searchParams]);
  // When navigating from Dashboard popup with state (no ?date= in URL yet), sync and add date to URL
  useEffect(() => {
    const date = (location.state as { date?: string } | null)?.date;
    if (date && isValidDateString(date) && !searchParams.get("date")) {
      setSelectedDate(date);
      setNoteInput(scheduleNotes[date] || "");
      const d = new Date(date + "T12:00:00");
      setCurrentMonth(new Date(d.getFullYear(), d.getMonth(), 1));
      setSearchParams({ date }, { replace: true });
    }
  }, [location.state, searchParams]);
  const [showQuickActionsEditor, setShowQuickActionsEditor] = useState(false);
  const [quickActionOrder, setQuickActionOrder] = useDashboardQuickActions();
  const [addFoodMeal, setAddFoodMeal] = useState<MealType | null>(null);
  const [addFoodCustomInputs, setAddFoodCustomInputs] = useState({ name: "", cal: "", portions: "1", protein: "", carbs: "", fat: "", imageDataUrl: "" });
  const [addFoodImageResizing, setAddFoodImageResizing] = useState(false);
  const [exportLoading, setExportLoading] = useState(false);
  const [customEventTitle, setCustomEventTitle] = useState("");
  const [customEventTime, setCustomEventTime] = useState("18:00");
  const [editReasonOpen, setEditReasonOpen] = useState(false);
  const [confirmCompleteOpen, setConfirmCompleteOpen] = useState(false);
  const [confirmInProgressOpen, setConfirmInProgressOpen] = useState(false);
  const [showBreakFastConfirm, setShowBreakFastConfirm] = useState(false);
  const [showBreakFastDialog, setShowBreakFastDialog] = useState(false);
  const [isFasting, setIsFasting] = useState(true);
  const [editingEventId, setEditingEventId] = useState<string | null>(null);
  const [editEventTime, setEditEventTime] = useState("09:00");
  const [editEventDuration, setEditEventDuration] = useState(15);
  const [countdownToIftar, setCountdownToIftar] = useState({ h: 0, m: 0, s: 0 });
  const [countdownToSuhoor, setCountdownToSuhoor] = useState({ h: 0, m: 0, s: 0 });
  const [copyMealsFromOpen, setCopyMealsFromOpen] = useState(false);
  const dayDetailPanelRef = useRef<HTMLDivElement>(null);
  const isInitialSelectionRef = useRef(true);

  const [journalEntries] = useLocalStorage<{ date: string; content?: string; gratitude?: string }[]>("tryramadan-journal", []);
  const journalDates = new Set(journalEntries.map((e) => e.date));
  const selectedDayJournal = selectedDate ? journalEntries.find((e) => e.date === selectedDate) : undefined;

  const displayTimezone = useDisplayTimezone();
  const today = new Date();
  const todayStr = displayTimezone ? getTodayStringInTimezone(displayTimezone) : toLocalDateString(today);
  const { prayerTimes: todayPrayerTimes } = usePrayerTimes(lat, lng, displayTimezone);
  const tomorrowDate = new Date(todayStr + "T12:00:00");
  tomorrowDate.setDate(tomorrowDate.getDate() + 1);
  const tomorrowStr = toLocalDateString(tomorrowDate);
  const { prayerTimes: tomorrowPrayerTimes } = usePrayerTimesForDate(lat, lng, tomorrowStr);
  const imsakTomorrow = tomorrowPrayerTimes?.imsak ?? todayPrayerTimes?.imsak;
  const { prayerTimes: selectedDayPrayerTimes } = usePrayerTimesForDate(lat, lng, selectedDate);
  /** Today's prayer times with overrides applied (for countdown and fasting status). */
  const effectiveTodayPrayerTimes = useMemo(
    () => getEffectivePrayerTimes(todayPrayerTimes ?? null, todayStr ? prayerTimeOverrides[todayStr] : undefined),
    [todayPrayerTimes, todayStr, prayerTimeOverrides]
  );

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
    const str = displayTimezone ? getTodayStringInTimezone(displayTimezone) : toLocalDateString(new Date());
    const d = new Date(str + "T12:00:00");
    setCurrentMonth(new Date(d.getFullYear(), d.getMonth(), 1));
    setSelectedDate(str);
    setNoteInput(scheduleNotes[str] || "");
    setSearchParams({ date: str }, { replace: true });
  }, [displayTimezone, scheduleNotes, setSearchParams]);

  const goToRamadan = useCallback(() => {
    const start = ramadanRange.start;
    setCurrentMonth(new Date(start.getFullYear(), start.getMonth(), 1));
    const startStr = toLocalDateString(start);
    setSelectedDate(startStr);
    setNoteInput(scheduleNotes[startStr] || "");
    setSearchParams({ date: startStr }, { replace: true });
  }, [scheduleNotes, ramadanRange.start, setSearchParams]);

  const selectDay = useCallback(
    (dateStr: string) => {
      setSelectedDate(dateStr);
      setNoteInput(scheduleNotes[dateStr] || "");
      setSearchParams({ date: dateStr }, { replace: true });
    },
    [scheduleNotes, setSearchParams]
  );

  // Scroll day detail panel into view when user selects a different day (skip on initial load)
  useEffect(() => {
    if (!selectedDate) return;
    if (isInitialSelectionRef.current) {
      isInitialSelectionRef.current = false;
      return;
    }
    const t = setTimeout(() => {
      dayDetailPanelRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 150);
    return () => clearTimeout(t);
  }, [selectedDate]);

  /** Last 5 days of Ramadan (day 26–30) for quick "Plan last days" links */
  const lastFiveRamadanDates = useMemo(() => {
    const start = new Date(ramadanRange.start.getTime());
    const dates: { dayNum: number; dateStr: string }[] = [];
    for (let dayNum = 26; dayNum <= 30; dayNum++) {
      const d = new Date(start);
      d.setDate(d.getDate() + dayNum - 1);
      dates.push({ dayNum, dateStr: toLocalDateString(d) });
    }
    return dates;
  }, [ramadanRange.start]);

  const copyMealsFromDay = useCallback(
    (sourceDateStr: string) => {
      if (!selectedDate) return;
      const source = mealPlans[sourceDateStr];
      if (!source?.suhoor && !source?.iftar) {
        toast.info("That day has no meals planned to copy.");
        setCopyMealsFromOpen(false);
        return;
      }
      setMealPlans((prev) => ({
        ...prev,
        [selectedDate]: { ...(prev[selectedDate] ?? {}), ...source },
      }));
      toast.success("Meals copied to this day.");
      setCopyMealsFromOpen(false);
    },
    [selectedDate, mealPlans, setMealPlans]
  );

  /** Copy selected day's meals to the next day (only if next day is today or future). */
  const copyMealsToNextDay = useCallback(() => {
    if (!selectedDate) return;
    const source = mealPlans[selectedDate];
    if (!source?.suhoor && !source?.iftar) {
      toast.info("This day has no meals planned to copy.");
      return;
    }
    const next = new Date(selectedDate + "T12:00:00");
    next.setDate(next.getDate() + 1);
    const nextStr = toLocalDateString(next);
    if (nextStr < todayStr) {
      toast.info("Next day is in the past; planning is for today and future only.");
      return;
    }
    setMealPlans((prev) => ({
      ...prev,
      [nextStr]: { ...(prev[nextStr] ?? {}), ...source },
    }));
    toast.success(`Meals copied to ${nextStr}.`);
  }, [selectedDate, todayStr, mealPlans, setMealPlans]);

  /** Copy selected day's meals to all remaining Ramadan days (from selectedDate+1 to end, today or future only). */
  const copyMealsToRemainingRamadan = useCallback(() => {
    if (!selectedDate) return;
    const source = mealPlans[selectedDate];
    if (!source?.suhoor && !source?.iftar) {
      toast.info("This day has no meals planned to copy.");
      return;
    }
    const start = new Date(selectedDate + "T12:00:00");
    start.setDate(start.getDate() + 1);
    const end = new Date(ramadanRange.end);
    end.setHours(0, 0, 0, 0);
    const dateStrs: string[] = [];
    for (const d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      const str = toLocalDateString(d);
      if (str >= todayStr) dateStrs.push(str);
    }
    if (dateStrs.length === 0) {
      toast.info("No future days left in Ramadan to copy to.");
      return;
    }
    setMealPlans((prev) => {
      const next = { ...prev };
      dateStrs.forEach((str) => {
        next[str] = { ...(next[str] ?? {}), ...source };
      });
      return next;
    });
    toast.success(`Meals copied to ${dateStrs.length} day(s) through end of Ramadan.`);
  }, [selectedDate, todayStr, mealPlans, setMealPlans, ramadanRange.end]);

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
      ...(addFoodCustomInputs.imageDataUrl ? { imageDataUrl: addFoodCustomInputs.imageDataUrl } : {}),
    };
    setFoodLogs((prev) => {
      const day = normalizeDayFoodLog(prev[selectedDate]);
      const list = mealType === "suhoor" ? [...day.suhoor, entry] : [...day.iftar, entry];
      return { ...prev, [selectedDate]: { ...day, [mealType]: list } };
    });
    setAddFoodCustomInputs({ name: "", cal: "", portions: "1", protein: "", carbs: "", fat: "", imageDataUrl: "" });
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
    const pt = effectiveSelectedDayPrayerTimes ?? selectedDayPrayerTimes;
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

  /** Effective prayer times for every Ramadan day (for table and sync). Uses startStr/endStr; ensures every day has times (fallback to previous day if API missing). */
  const effectiveRamadanTimesMap = useMemo(() => {
    const map: Record<string, import("@/hooks/usePrayerTimes").PrayerTimes> = {};
    const startStr = ramadanRange.startStr ?? toLocalDateString(ramadanRange.start);
    const endStr = ramadanRange.endStr ?? toLocalDateString(ramadanRange.end);
    const [sy, sm, sd] = startStr.split("-").map(Number);
    const [ey, em, ed] = endStr.split("-").map(Number);
    let d = new Date(sy, sm - 1, sd);
    const end = new Date(ey, em - 1, ed);
    let lastEffective: import("@/hooks/usePrayerTimes").PrayerTimes | null = null;
    while (d.getTime() <= end.getTime()) {
      const dateStr = toLocalDateString(d);
      const api = ramadanPrayerTimesMap[dateStr];
      let effective = getEffectivePrayerTimes(api ?? null, prayerTimeOverrides[dateStr]);
      if (!effective && lastEffective) {
        effective = { ...lastEffective, date: dateStr };
      }
      if (effective) {
        map[dateStr] = effective;
        lastEffective = effective;
      }
      d.setDate(d.getDate() + 1);
    }
    return map;
  }, [ramadanRange.startStr, ramadanRange.endStr, ramadanRange.start, ramadanRange.end, ramadanPrayerTimesMap, prayerTimeOverrides]);

  /** Sync Ramadan: add only selected types (eat times + prayers) as calendar events for each day. Skips days that already have that event type. */
  const syncRamadanToCalendar = useCallback(async () => {
    if (!lat || !lng) return;
    const allTypes: { type: CalendarEventType; title: string; timeKey: keyof import("@/hooks/usePrayerTimes").PrayerTimes; durationKey: CalendarEventType }[] = [
      { type: "suhoor", title: "Suhoor ends (eat before)", timeKey: "imsak", durationKey: "suhoor" },
      { type: "iftar", title: iftarLabelShort, timeKey: "maghrib", durationKey: "iftar" },
      { type: "fajr", title: "Fajr", timeKey: "fajr", durationKey: "fajr" },
      { type: "dhuhr", title: "Dhuhr", timeKey: "dhuhr", durationKey: "dhuhr" },
      { type: "asr", title: "Asr", timeKey: "asr", durationKey: "asr" },
      { type: "maghrib", title: "Maghrib", timeKey: "maghrib", durationKey: "maghrib" },
      { type: "isha", title: "Isha", timeKey: "isha", durationKey: "isha" },
    ];
    const typesToSync = allTypes.filter((t) => calendarIncludeTypes[t.type] !== false);
    setCalendarEvents((prev) => {
      const next = { ...prev };
      Object.entries(effectiveRamadanTimesMap).forEach(([dateStr, pt]) => {
        let dayEvents = next[dateStr] ?? [];
        const existingTypes = new Set(dayEvents.map((e) => e.type));
        typesToSync.forEach(({ type, title, timeKey, durationKey }) => {
          if (existingTypes.has(type)) return;
          const time = (pt as Record<string, string>)[timeKey] ?? "06:00";
          const duration = getDefaultDurationForType(durationKey, defaultDurations);
          const entry: CalendarEvent = {
            id: eventId(),
            title: type === "iftar" ? iftarLabel : title,
            type,
            time,
            durationMinutes: duration,
            date: dateStr,
          };
          dayEvents = [...dayEvents, entry];
          next[dateStr] = dayEvents;
          existingTypes.add(type);
        });
        if (calendarIncludeTypes.taraweeh !== false && pt.isha) {
          if (!existingTypes.has("taraweeh")) {
            const [ih, im] = pt.isha.split(":").map(Number);
            const tm = (im || 0) + 30;
            const tHour = (ih ?? 20) + 1 + Math.floor(tm / 60);
            const tMin = tm % 60;
            const tStr = `${tHour.toString().padStart(2, "0")}:${tMin.toString().padStart(2, "0")}`;
            const duration = getDefaultDurationForType("taraweeh", defaultDurations);
            dayEvents = [...dayEvents, { id: eventId(), title: "Taraweeh (optional)", type: "taraweeh", time: tStr, durationMinutes: duration, date: dateStr }];
            next[dateStr] = dayEvents;
          }
        }
      });
      return next;
    });
    toast.success("Ramadan days synced to calendar. Export .ics to add to your calendar app.");
  }, [lat, lng, effectiveRamadanTimesMap, defaultDurations, calendarIncludeTypes, iftarLabel, iftarLabelShort, setCalendarEvents]);

  const selectedDayCalendarEvents = selectedDate ? (calendarEvents[selectedDate] ?? []) : [];

  /** Effective prayer times for selected day (API + overrides). */
  const effectiveSelectedDayPrayerTimes = useMemo(
    () => getEffectivePrayerTimes(selectedDayPrayerTimes ?? null, selectedDate ? prayerTimeOverrides[selectedDate] : undefined),
    [selectedDayPrayerTimes, selectedDate, prayerTimeOverrides]
  );

  const setOverrideForDate = useCallback((dateStr: string, field: "imsak" | "maghrib" | "fajr" | "dhuhr" | "asr" | "isha", value: string) => {
    setPrayerTimeOverrides((prev) => ({
      ...prev,
      [dateStr]: { ...(prev[dateStr] ?? {}), [field]: value.trim() || undefined },
    }));
  }, []);

  const updateCalendarEvent = useCallback((dateStr: string, eventId: string, updates: Partial<Pick<CalendarEvent, "time" | "durationMinutes" | "title">>) => {
    setCalendarEvents((prev) => {
      const day = prev[dateStr] ?? [];
      return {
        ...prev,
        [dateStr]: day.map((e) => (e.id === eventId ? { ...e, ...updates } : e)),
      };
    });
  }, [setCalendarEvents]);

  // Live countdown when viewing today (same logic as Dashboard). Use effective today times so overrides apply.
  const tickFastingAndCountdown = useCallback(() => {
    const pt = effectiveTodayPrayerTimes ?? todayPrayerTimes;
    if (!pt?.imsak || !pt?.maghrib) return;
    const suhoorForTomorrow = imsakTomorrow ?? pt.imsak;
    if (displayTimezone) {
      const nowSeconds = getNowSecondsSinceMidnightInTimezone(displayTimezone);
      const imsakSeconds = timeStringToSecondsSinceMidnight(pt.imsak);
      const imsakTomorrowSeconds = timeStringToSecondsSinceMidnight(suhoorForTomorrow);
      const maghribSeconds = timeStringToSecondsSinceMidnight(pt.maghrib);
      const fasting = nowSeconds >= imsakSeconds && nowSeconds < maghribSeconds;
      setIsFasting(fasting);
      if (fasting) {
        const diff = secondsUntilTimeInTimezone(nowSeconds, maghribSeconds);
        setCountdownToIftar({
          h: Math.floor(diff / 3600),
          m: Math.floor((diff % 3600) / 60),
          s: diff % 60,
        });
      } else {
        const diff = secondsUntilTimeInTimezone(nowSeconds, imsakTomorrowSeconds);
        setCountdownToSuhoor({
          h: Math.floor(diff / 3600),
          m: Math.floor((diff % 3600) / 60),
          s: diff % 60,
        });
      }
    } else {
      const now = new Date();
      const imsakStr = (pt.imsak ?? "").trim().split(" ")[0] || "05:00";
      const maghribStr = (pt.maghrib ?? "").trim().split(" ")[0] || "18:00";
      const imsakTomorrowStr = (suhoorForTomorrow ?? "").trim().split(" ")[0] || "05:00";
      const imsakTime = new Date(todayStr + "T" + (imsakStr.length === 5 ? imsakStr + ":00" : imsakStr + ":00"));
      const maghribTime = new Date(todayStr + "T" + (maghribStr.length === 5 ? maghribStr + ":00" : maghribStr + ":00"));
      const imsakTomorrowTime = new Date(tomorrowStr + "T" + (imsakTomorrowStr.length === 5 ? imsakTomorrowStr + ":00" : imsakTomorrowStr + ":00"));
      const fasting = now >= imsakTime && now < maghribTime;
      setIsFasting(fasting);
      if (fasting) {
        const diff = maghribTime.getTime() - now.getTime();
        if (diff > 0) setCountdownToIftar({
          h: Math.floor(diff / 36e5),
          m: Math.floor((diff % 36e5) / 6e4),
          s: Math.floor((diff % 6e4) / 1000),
        });
      } else {
        const diff = imsakTomorrowTime.getTime() - now.getTime();
        if (diff > 0) setCountdownToSuhoor({
          h: Math.floor(diff / 36e5),
          m: Math.floor((diff % 36e5) / 6e4),
          s: Math.floor((diff % 6e4) / 1000),
        });
      }
    }
  }, [effectiveTodayPrayerTimes, todayPrayerTimes, imsakTomorrow, displayTimezone, todayStr, tomorrowStr]);

  useEffect(() => {
    tickFastingAndCountdown();
  }, [tickFastingAndCountdown]);

  useEffect(() => {
    const t = setInterval(tickFastingAndCountdown, 2000);
    return () => clearInterval(t);
  }, [tickFastingAndCountdown]);

  const handleExportIcal = async (range: "month" | "30days" | "ramadan") => {
    if (!lat || !lng) return;
    setExportLoading(true);
    try {
      const now = new Date();
      let start: Date;
      let end: Date;
      let startStr: string;
      let endStr: string;
      if (range === "month") {
        start = new Date(now.getFullYear(), now.getMonth(), 1);
        end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        startStr = toLocalDateString(start);
        endStr = toLocalDateString(end);
      } else if (range === "30days") {
        start = new Date(now);
        end = new Date(now);
        end.setDate(end.getDate() + 29);
        startStr = toLocalDateString(start);
        endStr = toLocalDateString(end);
      } else {
        // Ramadan: use effective range (includes user overrides from Settings) for accurate export
        startStr = ramadanRange.startStr ?? toLocalDateString(ramadanRange.start);
        endStr = ramadanRange.endStr ?? toLocalDateString(ramadanRange.end);
        start = new Date(startStr + "T00:00:00");
        end = new Date(endStr + "T23:59:59");
      }
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
      Object.keys(prayerTimesMap).forEach((dateStr) => {
        const effective = getEffectivePrayerTimes(prayerTimesMap[dateStr], prayerTimeOverrides[dateStr]);
        if (effective) prayerTimesMap[dateStr] = effective;
      });
      const exportTimezone =
        preferences.timezone?.trim() ||
        displayTimezone?.trim() ||
        (typeof Intl !== "undefined" && Intl.DateTimeFormat?.().resolvedOptions?.().timeZone) ||
        undefined;
      const ics = buildIcalContent({
        prayerTimesMap,
        customEvents: calendarEvents,
        dateRange: [startStr, endStr],
        includeTaraweeh: calendarIncludeTypes.taraweeh !== false,
        includePrayers: true,
        timezone: exportTimezone,
        includeTypes: calendarIncludeTypes,
        eventDurations: defaultDurations,
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

      <main id="main-content" className="main-content" aria-label="Fasting schedule">
        <div className="container mx-auto px-4 max-w-4xl min-w-0 min-h-[50vh]">
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </Link>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-4 sm:mb-6" role="region" aria-label="Schedule intro">
            <h1 className="text-xl sm:text-2xl md:text-3xl font-display font-bold">
              Fasting Schedule
            </h1>
            <p className="text-sm sm:text-base text-muted-foreground mt-1.5 sm:mt-2">
              Tap a day to view or edit meal plan, food log, and prayer times. Times vary by location.
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

          {/* Configure dashboard quick access */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.06 }}
            className="mb-4 sm:mb-6 p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-card border border-border"
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
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.07 }}
            className="mb-4 sm:mb-6 p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-card border border-border"
          >
            <h3 className="font-display font-bold text-base sm:text-lg mb-1.5 sm:mb-2 flex items-center gap-2">
              <Download className="w-4 h-4 sm:w-5 sm:h-5 text-secondary shrink-0" />
              Export to calendar
            </h3>
            <p className="text-xs sm:text-sm text-muted-foreground mb-2 sm:mb-3">
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
            <div className="mt-3 pt-3 border-t border-border">
              <p className="text-sm font-medium mb-2">What to include in calendar</p>
              <p className="text-xs text-muted-foreground mb-2">Choose which events to sync and export. Eat times (Suhoor end, {iftarLabelShort}) and prayer times use your custom durations below.</p>
              <div className="flex flex-wrap gap-x-6 gap-y-2 mb-3">
                {(["suhoor", "iftar"] as const).map((t) => (
                  <label key={t} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={calendarIncludeTypes[t] !== false}
                      onChange={(e) => setCalendarIncludeTypes((prev) => ({ ...prev, [t]: e.target.checked }))}
                      className="rounded border-border"
                    />
                    <span className="text-sm">{t === "suhoor" ? "Suhoor end" : iftarLabelShort}</span>
                  </label>
                ))}
                {(["fajr", "dhuhr", "asr", "maghrib", "isha"] as const).map((t) => (
                  <label key={t} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={calendarIncludeTypes[t] !== false}
                      onChange={(e) => setCalendarIncludeTypes((prev) => ({ ...prev, [t]: e.target.checked }))}
                      className="rounded border-border"
                    />
                    <span className="text-sm capitalize">{t}</span>
                  </label>
                ))}
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={calendarIncludeTypes.taraweeh !== false}
                    onChange={(e) => setCalendarIncludeTypes((prev) => ({ ...prev, taraweeh: e.target.checked }))}
                    className="rounded border-border"
                  />
                  <span className="text-sm">Taraweeh</span>
                </label>
              </div>
            </div>
            <div className="mt-3 pt-3 border-t border-border flex flex-wrap gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={syncRamadanToCalendar}
                disabled={ramadanPrayersLoading || !lat || !lng || Object.keys(effectiveRamadanTimesMap).length === 0}
                className="gap-2"
              >
                {ramadanPrayersLoading ? "Loading…" : <CalendarDays className="w-4 h-4" />}
                Sync Ramadan to calendar
              </Button>
              <span className="text-xs text-muted-foreground self-center">
                Adds only the selected events above for each Ramadan day (only where not already added). Then export .ics.
              </span>
            </div>
            <details className="mt-3 pt-3 border-t border-border">
              <summary className="text-sm font-medium cursor-pointer hover:text-foreground">Default event durations (minutes)</summary>
              <p className="text-xs text-muted-foreground mt-1 mb-2">Used when you sync Ramadan. You can edit each event after adding.</p>
              <div className="flex flex-wrap gap-3 items-center">
                {(["suhoor", "iftar", "fajr", "dhuhr", "asr", "maghrib", "isha", "taraweeh"] as const).map((type) => (
                  <label key={type} className="flex items-center gap-1.5 text-sm">
                    <span className="capitalize w-16 truncate">{type === "suhoor" ? "Suhoor" : type === "iftar" ? "Iftar" : type}</span>
                    <input
                      type="number"
                      min={1}
                      max={120}
                      value={defaultDurations[type] ?? (type === "taraweeh" ? 60 : type === "iftar" ? 10 : 5)}
                      onChange={(e) => setDefaultDurations((prev) => ({ ...prev, [type]: Math.max(1, parseInt(e.target.value, 10) || 5) }))}
                      className="w-12 h-8 px-1 rounded border border-border bg-background text-center text-sm"
                    />
                    <span className="text-xs text-muted-foreground">min</span>
                  </label>
                ))}
              </div>
            </details>
          </motion.div>

          {/* Ramadan daily schedule: every day with eating cutoff & break fast times */}
          {(lat != null && lng != null) && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.065 }}
              className="mb-6 p-4 rounded-2xl bg-card border border-border"
            >
              <h3 className="font-display font-bold mb-2 flex items-center gap-2">
                <Sunrise className="w-5 h-5 text-secondary" />
                Ramadan daily schedule
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                Eating cutoff (Suhoor end) and break fast times for each day of Ramadan. Prayer times change every day and are calculated for your location. Override any date in the day panel below.
              </p>
              {ramadanPrayersLoading ? (
                <p className="text-sm text-muted-foreground py-4">Loading prayer times…</p>
              ) : Object.keys(effectiveRamadanTimesMap).length === 0 ? (
                <p className="text-sm text-muted-foreground py-4">Set your location in Settings to see times.</p>
              ) : (
                <div className="overflow-x-auto -mx-2">
                  <table className="w-full min-w-[380px] text-sm border-collapse">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left py-2 px-2 font-medium">Date</th>
                        <th className="text-left py-2 px-2 font-medium">Day</th>
                        <th className="text-right py-2 px-2 font-medium">Eating cutoff</th>
                        <th className="text-right py-2 px-2 font-medium">Break fast</th>
                        <th className="text-right py-2 px-2 font-medium">Fasting hrs</th>
                        <th className="w-8" />
                      </tr>
                    </thead>
                    <tbody>
                      {Object.entries(effectiveRamadanTimesMap)
                        .sort(([a], [b]) => a.localeCompare(b))
                        .map(([dateStr, pt]) => {
                          const d = new Date(dateStr + "T12:00:00");
                          const dayNum = ramadanRange.getRamadanDayNumber(d);
                          const isSelected = selectedDate === dateStr;
                          const fastingHrs = getFastingHoursForDay(pt.imsak, pt.maghrib);
                          return (
                            <tr
                              key={dateStr}
                              className={`border-b border-border/50 hover:bg-muted/30 ${isSelected ? "bg-primary/10" : ""}`}
                            >
                              <td className="py-2 px-2">
                                {d.toLocaleDateString("en", { month: "short", day: "numeric", year: "numeric" })}
                              </td>
                              <td className="py-2 px-2 text-muted-foreground">R{dayNum ?? "—"}</td>
                              <td className="py-2 px-2 text-right font-mono tabular-nums">{pt.imsak || "—"}</td>
                              <td className="py-2 px-2 text-right font-mono tabular-nums">{pt.maghrib || "—"}</td>
                              <td className="py-2 px-2 text-right font-mono tabular-nums">
                                {fastingHrs != null ? `${fastingHrs}h` : "—"}
                              </td>
                              <td className="py-2 px-2">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-8 text-xs"
                                  onClick={() => { setSelectedDate(dateStr); setNoteInput(scheduleNotes[dateStr] || ""); setSearchParams({ date: dateStr }, { replace: true }); }}
                                >
                                  {isSelected ? "Open" : "View"}
                                </Button>
                              </td>
                            </tr>
                          );
                        })}
                    </tbody>
                  </table>
                </div>
              )}
            </motion.div>
          )}

          {/* Stats: Ramadan, Sunnah, completed, hours fasted */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-4 mb-4 sm:mb-6"
          >
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-secondary/10 border border-secondary/20 text-center cursor-help">
                  <span className="text-xl sm:text-2xl md:text-3xl font-bold text-secondary tabular-nums">{ramadanDaysInMonth}</span>
                  <span className="block text-[10px] sm:text-xs text-muted-foreground mt-0.5">Ramadan this month</span>
                </div>
              </TooltipTrigger>
              <TooltipContent className="max-w-xs">
                <p className="text-sm text-foreground">{GENERAL_TOOLTIPS.ramadan.body}</p>
                <p className="text-xs text-muted-foreground mt-2 pt-2 border-t border-border/50">Arabic: <span className="font-arabic" dir="rtl">{GENERAL_TOOLTIPS.ramadan.bodyAr}</span></p>
              </TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-primary/10 border border-primary/20 text-center cursor-help">
                  <span className="text-xl sm:text-2xl md:text-3xl font-bold tabular-nums">{sunnahDaysInMonth}</span>
                  <span className="block text-[10px] sm:text-xs text-muted-foreground mt-0.5">Sunnah (Mon/Thu)</span>
                </div>
              </TooltipTrigger>
              <TooltipContent className="max-w-xs p-3">
                <p className="text-sm text-foreground">{GENERAL_TOOLTIPS.sunnah.body}</p>
                <p className="text-xs text-muted-foreground mt-2 pt-2 border-t border-border/50">Arabic: <span className="font-arabic" dir="rtl">{GENERAL_TOOLTIPS.sunnah.bodyAr}</span></p>
              </TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-card border border-border text-center cursor-help">
                  <span className="text-xl sm:text-2xl md:text-3xl font-bold text-secondary tabular-nums">{completedCount}</span>
                  <span className="block text-[10px] sm:text-xs text-muted-foreground mt-0.5">Days completed</span>
                </div>
              </TooltipTrigger>
              <TooltipContent className="max-w-xs">
                <p className="font-medium">Days you logged as fasted (dawn to sunset)</p>
                <p className="text-xs mt-1">Fasting days you’ve marked complete in this month. Tap a day in the calendar and use “I fasted this day — mark complete” to log it.</p>
              </TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-card border border-border text-center cursor-help">
                  <span className="text-xl sm:text-2xl md:text-3xl font-bold tabular-nums">{totalHoursFasted > 0 ? totalHoursFasted.toFixed(1) : "—"}</span>
                  <span className="block text-[10px] sm:text-xs text-muted-foreground mt-0.5">Hours fasted</span>
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
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="p-4 sm:p-6 rounded-xl sm:rounded-2xl bg-card border border-border"
          >
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4 sm:mb-6">
              <div className="flex items-center justify-between gap-2">
                <button
                  onClick={prevMonth}
                  className="p-2 rounded-lg hover:bg-muted transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
                  aria-label="Previous month"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <h3 className="font-display font-bold text-base sm:text-lg min-w-0 text-center flex-1">
                  {monthName}
                </h3>
                <button
                  onClick={nextMonth}
                  className="p-2 rounded-lg hover:bg-muted transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
                  aria-label="Next month"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
              <div className="flex gap-2 flex-wrap justify-center sm:justify-end">
                <Button variant="outline" size="sm" onClick={goToRamadan} className="gap-2 flex-1 sm:flex-initial min-h-[40px]">
                  <CalendarDays className="w-4 h-4 shrink-0" />
                  <span className="truncate">Jump to Ramadan</span>
                </Button>
                <Button variant="outline" size="sm" onClick={goToToday} className="gap-2 flex-1 sm:flex-initial min-h-[40px]">
                  Jump to today
                </Button>
              </div>
            </div>
            <p className="text-xs sm:text-sm text-muted-foreground mb-3 sm:mb-4">
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
                        aria-label={`${date.toLocaleDateString("en", { weekday: "short", month: "short", day: "numeric" })}${isToday ? ", Today" : ""}${isSelected ? ", selected" : ""}`}
                        aria-pressed={isSelected}
                        className={`
                          aspect-square rounded-lg flex flex-col items-center justify-center text-sm relative
                          transition-all min-h-[44px] min-w-[36px] sm:min-w-0 cursor-pointer
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
                      {isRamadan && effectiveRamadanTimesMap[dateStr] && (() => {
                        const pt = effectiveRamadanTimesMap[dateStr];
                        const hrs = getFastingHoursForDay(pt.imsak, pt.maghrib);
                        return (
                          <span className="block mt-1 text-xs">
                            Cutoff {pt.imsak} · Break fast {pt.maghrib}
                            {hrs != null && ` · ${hrs}h fast`}
                          </span>
                        );
                      })()}
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
                  ref={dayDetailPanelRef}
                  id="schedule-day-detail"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-6 overflow-hidden"
                  aria-label={`Details for ${selectedDateObj?.toLocaleDateString("en", { weekday: "long", month: "long", day: "numeric" })}`}
                >
                  <div className="p-4 sm:p-5 rounded-xl sm:rounded-2xl bg-muted/50 border border-border space-y-4">
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <h4 className="font-display font-bold text-base sm:text-lg flex items-center gap-2 flex-wrap">
                        {selectedDateObj?.toLocaleDateString("en", {
                          weekday: "long",
                          month: "long",
                          day: "numeric",
                          year: "numeric",
                        })}
                        {selectedRamadanDay != null && (
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <span className="text-xs sm:text-sm font-normal text-secondary cursor-help border-b border-dotted border-secondary/50">
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
                      {selectedDate !== todayStr ? (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => { setSelectedDate(todayStr); setNoteInput(scheduleNotes[todayStr] || ""); setSearchParams({ date: todayStr }, { replace: true }); }}
                          className="gap-1.5 shrink-0"
                          aria-label="Go to today"
                        >
                          Today
                          <X className="w-3.5 h-3.5 shrink-0" />
                        </Button>
                      ) : (
                        <span className="text-xs font-medium text-secondary px-2 py-1 rounded-md bg-secondary/10 shrink-0">Today</span>
                      )}
                    </div>

                    {/* Today's live status: countdown + I'm fasting / Break fast / I didn't fast (same as Dashboard) */}
                    {selectedDate === todayStr && (() => {
                      const todaySkipped = (progress.skippedDays ?? []).includes(todayStr);
                      const todayComplete = progress.completedDays.includes(todayStr);
                      const fastingToday = isFastingToday(progress, todayStr);
                      const todayLog = getTodayFastingLog(progress, todayStr);
                      return (
                        <div className={`p-4 rounded-2xl border-2 flex flex-col gap-3 ${
                          isFasting ? "bg-primary/10 border-primary/30" : "bg-muted/50 border-border"
                        }`}>
                          <div className="flex items-center gap-2">
                            <div className={`w-10 h-10 shrink-0 rounded-full flex items-center justify-center ${isFasting ? "bg-primary/20" : "bg-muted"}`}>
                              {isFasting ? <Moon className="w-5 h-5 text-foreground" /> : <Sun className="w-5 h-5 text-muted-foreground" />}
                            </div>
                            <div>
                              <span className="text-sm font-semibold" aria-live="polite">
                                {isFasting ? "Right now: Fasting" : "Right now: Eating window"}
                              </span>
                              {isFasting ? (
                                <div className="flex items-baseline gap-1.5 mt-0.5">
                                  <span className="text-lg font-bold tabular-nums">
                                    {String(countdownToIftar.h).padStart(2, "0")}:{String(countdownToIftar.m).padStart(2, "0")}:{String(countdownToIftar.s).padStart(2, "0")}
                                  </span>
                                  <span className="text-xs text-muted-foreground">until {iftarLabel}</span>
                                </div>
                              ) : (
                                <div className="flex items-baseline gap-1.5 mt-0.5">
                                  <span className="text-xs text-muted-foreground">Next: {suhoorLabel} —</span>
                                  <span className="text-lg font-bold tabular-nums">
                                    {String(countdownToSuhoor.h).padStart(2, "0")}:{String(countdownToSuhoor.m).padStart(2, "0")}:{String(countdownToSuhoor.s).padStart(2, "0")}
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>
                          {todayLog?.startedAt && !todayLog?.completedAt && (
                            <p className="text-xs text-muted-foreground">
                              Started {new Date(todayLog.startedAt).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}
                            </p>
                          )}
                          {!todaySkipped && !todayComplete && (
                            <div className="flex flex-wrap gap-2">
                              {!fastingToday ? (
                                <>
                                  <Button
                                    size="sm"
                                    onClick={() => startFastingToday(progress, setProgress, todayStr)}
                                    className="gap-1"
                                  >
                                    <Sunrise className="w-4 h-4" />
                                    I&apos;m fasting
                                  </Button>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setDaySkipped(progress, setProgress, todayStr)}
                                  >
                                    I didn&apos;t fast today
                                  </Button>
                                </>
                              ) : (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="border-destructive/50 text-destructive hover:bg-destructive/10"
                                  onClick={() => setShowBreakFastConfirm(true)}
                                >
                                  <Sunset className="w-4 h-4" />
                                  Break fast
                                </Button>
                              )}
                            </div>
                          )}
                          {todaySkipped && (
                            <span className="text-sm text-muted-foreground">I didn&apos;t fast today</span>
                          )}
                        </div>
                      );
                    })()}

                    {/* Break fast confirm + reason (for today on Schedule) */}
                    <AlertDialog open={showBreakFastConfirm} onOpenChange={setShowBreakFastConfirm}>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Break fast?</AlertDialogTitle>
                          <AlertDialogDescription>
                            {isFasting
                              ? "Log that you broke your fast early. Choose a reason."
                              : "It's not fasting period right now (you're in the eating window). Did you break your fast earlier, during the fasting window (before Maghrib)? If so, choose a reason below."}
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => {
                              setShowBreakFastConfirm(false);
                              setShowBreakFastDialog(true);
                            }}
                          >
                            Sure
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                    <BreakFastReasonDialog
                      open={showBreakFastDialog}
                      onOpenChange={setShowBreakFastDialog}
                      onSelectReason={(reasonId) => {
                        breakFastingToday(progress, setProgress, reasonId, todayStr);
                        setShowBreakFastDialog(false);
                        toast.success("Fast logged as broken");
                      }}
                      userType={preferences?.userType}
                      notInFastingPeriod={!isFasting}
                    />

                    {/* Eating cutoff & break fast — prominent */}
                    {effectiveSelectedDayPrayerTimes && (
                      <div className="rounded-xl bg-secondary/10 border-2 border-secondary/20 p-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Eating cutoff (Suhoor end)</p>
                          <p className="font-mono text-lg font-bold text-secondary tabular-nums">{effectiveSelectedDayPrayerTimes.imsak || "—"}</p>
                        </div>
                        <div>
                          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Break fast ({iftarLabelShort})</p>
                          <p className="font-mono text-lg font-bold text-secondary tabular-nums">{effectiveSelectedDayPrayerTimes.maghrib || "—"}</p>
                        </div>
                        {getFastingHoursForDay(effectiveSelectedDayPrayerTimes.imsak, effectiveSelectedDayPrayerTimes.maghrib) != null && (
                          <div className="sm:col-span-2">
                            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Total fasting hours (this day)</p>
                            <p className="font-mono text-lg font-bold text-secondary tabular-nums">
                              {getFastingHoursForDay(effectiveSelectedDayPrayerTimes.imsak, effectiveSelectedDayPrayerTimes.maghrib)}h
                            </p>
                          </div>
                        )}
                        {selectedDate && (prayerTimeOverrides[selectedDate]?.imsak != null || prayerTimeOverrides[selectedDate]?.maghrib != null) && (
                          <div className="sm:col-span-2 flex gap-2 items-end flex-wrap">
                            <Label className="text-xs w-full sm:w-auto">Override Imsak</Label>
                            <input
                              type="time"
                              value={prayerTimeOverrides[selectedDate]?.imsak ?? ""}
                              onChange={(e) => setOverrideForDate(selectedDate, "imsak", e.target.value)}
                              className="h-9 px-2 rounded-md border border-border bg-background text-sm"
                            />
                            <Label className="text-xs w-full sm:w-auto">Override Maghrib</Label>
                            <input
                              type="time"
                              value={prayerTimeOverrides[selectedDate]?.maghrib ?? ""}
                              onChange={(e) => setOverrideForDate(selectedDate, "maghrib", e.target.value)}
                              className="h-9 px-2 rounded-md border border-border bg-background text-sm"
                            />
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                if (!selectedDate) return;
                                setPrayerTimeOverrides((prev) => {
                                  const next = { ...prev };
                                  const day = next[selectedDate];
                                  if (!day) return prev;
                                  const { imsak: _, maghrib: __, ...rest } = day;
                                  if (Object.keys(rest).length === 0) {
                                    const o = { ...next };
                                    delete o[selectedDate];
                                    return o;
                                  }
                                  return { ...next, [selectedDate]: rest };
                                });
                              }}
                            >
                              Clear overrides
                            </Button>
                          </div>
                        )}
                        {selectedDate && !prayerTimeOverrides[selectedDate]?.imsak && !prayerTimeOverrides[selectedDate]?.maghrib && (
                          <div className="sm:col-span-2">
                            <Button variant="outline" size="sm" onClick={() => setPrayerTimeOverrides((prev) => ({ ...prev, [selectedDate]: { ...(prev[selectedDate] ?? {}), imsak: effectiveSelectedDayPrayerTimes?.imsak ?? "", maghrib: effectiveSelectedDayPrayerTimes?.maghrib ?? "" } }))}>
                              Override times for this day
                            </Button>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Day summary: prayer times, meals, journal, fasting context */}
                    <div className="rounded-xl bg-card border border-border p-3 space-y-2 text-sm">
                      <p className="font-semibold text-muted-foreground text-xs uppercase tracking-wide">Day at a glance</p>
                      {effectiveSelectedDayPrayerTimes && (
                        <p className="text-muted-foreground">
                          <span className="font-medium text-foreground">Prayer:</span> Fajr {effectiveSelectedDayPrayerTimes.fajr} · Maghrib ({iftarLabelShort}) {effectiveSelectedDayPrayerTimes.maghrib}
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
                          {selectedFastingLog && effectiveSelectedDayPrayerTimes && (() => {
                            const imsakStr = effectiveSelectedDayPrayerTimes.imsak ?? effectiveSelectedDayPrayerTimes.fajr;
                            const imsakTime = new Date((selectedDate ?? "") + "T" + (imsakStr?.length === 5 ? imsakStr + ":00" : imsakStr ?? "05:00")).getTime();
                            const maghribTime = new Date((selectedDate ?? "") + "T" + (effectiveSelectedDayPrayerTimes.maghrib?.length === 5 ? effectiveSelectedDayPrayerTimes.maghrib + ":00" : effectiveSelectedDayPrayerTimes.maghrib)).getTime();
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

                    {/* Today's schedule timeline for selected day (uses effective times including overrides) */}
                    {effectiveSelectedDayPrayerTimes && (
                      <div className="mb-4">
                        <TodayScheduleTimeline
                          prayerTimes={effectiveSelectedDayPrayerTimes}
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
                              className="flex flex-wrap items-center gap-2 py-1.5 px-2 rounded-lg bg-muted/50 text-sm"
                            >
                              {editingEventId === e.id ? (
                                <>
                                  <input
                                    type="time"
                                    value={editEventTime}
                                    onChange={(ev) => setEditEventTime(ev.target.value)}
                                    className="h-8 px-2 rounded border border-border bg-background text-xs"
                                  />
                                  <input
                                    type="number"
                                    min={1}
                                    max={240}
                                    value={editEventDuration}
                                    onChange={(ev) => setEditEventDuration(parseInt(ev.target.value, 10) || 15)}
                                    className="w-14 h-8 px-2 rounded border border-border bg-background text-xs"
                                    title="Duration (minutes)"
                                  />
                                  <span className="text-xs text-muted-foreground">min</span>
                                  <Button size="sm" className="h-8" onClick={() => { if (selectedDate) { updateCalendarEvent(selectedDate, e.id, { time: editEventTime, durationMinutes: editEventDuration }); setEditingEventId(null); toast.success("Event updated"); } }}>
                                    Save
                                  </Button>
                                  <Button variant="ghost" size="sm" className="h-8" onClick={() => setEditingEventId(null)}>Cancel</Button>
                                </>
                              ) : (
                                <>
                                  <span className="flex items-center gap-2">
                                    <Clock className="w-3.5 h-3.5 text-muted-foreground" />
                                    {e.time} — {e.title}
                                    {e.durationMinutes != null && (
                                      <span className="text-xs text-muted-foreground">({e.durationMinutes} min)</span>
                                    )}
                                  </span>
                                  <div className="flex items-center gap-0.5 ml-auto">
                                    <button
                                      type="button"
                                      onClick={() => { setEditingEventId(e.id); setEditEventTime(e.time); setEditEventDuration(e.durationMinutes ?? 15); }}
                                      className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded border border-transparent hover:bg-muted text-muted-foreground hover:text-foreground"
                                      aria-label="Edit time and duration"
                                    >
                                      <PenLine className="w-3.5 h-3.5" />
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => removeCalendarEvent(e.id)}
                                      className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded border border-transparent hover:border-destructive/30 hover:bg-destructive/20 text-muted-foreground hover:text-destructive"
                                      aria-label="Remove"
                                    >
                                      <X className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                </>
                              )}
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>

                    {/* Meals in line with times (compact timeline for this day) */}
                    {effectiveSelectedDayPrayerTimes?.imsak != null && effectiveSelectedDayPrayerTimes?.maghrib != null && (
                      <div className="rounded-xl border border-border bg-card p-3 space-y-2">
                        <p className="text-xs font-medium text-muted-foreground">Meals & times</p>
                        <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm">
                          <span className="flex items-center gap-2">
                            <span className="font-mono text-secondary shrink-0">{effectiveSelectedDayPrayerTimes.imsak.split(" ")[0]}</span>
                            <Sunrise className="w-4 h-4 text-muted-foreground shrink-0" />
                            <span className="text-muted-foreground">Suhoor end</span>
                            {selectedDayMeals?.suhoor ? (
                              <span className="truncate max-w-[180px]" title={selectedDayMeals.suhoor}>— {selectedDayMeals.suhoor}</span>
                            ) : (
                              <span className="text-muted-foreground/70">—</span>
                            )}
                          </span>
                          <span className="flex items-center gap-2">
                            <span className="font-mono text-secondary shrink-0">{effectiveSelectedDayPrayerTimes.maghrib.split(" ")[0]}</span>
                            <Sunset className="w-4 h-4 text-muted-foreground shrink-0" />
                            <span className="text-muted-foreground">{iftarLabel}</span>
                            {selectedDayMeals?.iftar ? (
                              <span className="truncate max-w-[180px]" title={selectedDayMeals.iftar}>— {selectedDayMeals.iftar}</span>
                            ) : (
                              <span className="text-muted-foreground/70">—</span>
                            )}
                          </span>
                        </div>
                      </div>
                    )}

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
                      {canEditMealPlan && (
                        <div className="flex flex-wrap items-center gap-2 mt-2">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => setCopyMealsFromOpen(true)}
                            className="gap-1"
                          >
                            <Copy className="w-3.5 h-3.5" />
                            Copy meals from another day
                          </Button>
                          {(selectedDayMeals?.suhoor || selectedDayMeals?.iftar) && (
                            <>
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={copyMealsToNextDay}
                                className="gap-1"
                              >
                                Copy to next day
                              </Button>
                              {selectedIsRamadan && (
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  onClick={copyMealsToRemainingRamadan}
                                  className="gap-1"
                                >
                                  Copy to remaining Ramadan days
                                </Button>
                              )}
                            </>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Plan last days of Ramadan — quick jump */}
                    {selectedDate && (selectedIsRamadan || selectedRamadanDay == null) && lastFiveRamadanDates.length > 0 && (
                      <div className="rounded-xl border border-border bg-background/50 p-3">
                        <p className="text-xs font-medium text-muted-foreground mb-2">Plan last days of Ramadan</p>
                        <div className="flex flex-wrap gap-2">
                          {lastFiveRamadanDates.map(({ dayNum, dateStr }) => (
                            <button
                              key={dateStr}
                              type="button"
                              onClick={() => selectDay(dateStr)}
                              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                                selectedDate === dateStr
                                  ? "bg-secondary text-secondary-foreground"
                                  : "bg-muted hover:bg-muted/80"
                              }`}
                            >
                              Day {dayNum}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Food log: what you ate with portions & macros */}
                    <div>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Label className="flex items-center gap-2 text-sm font-medium mb-2 cursor-help w-fit">
                            <Flame className="w-4 h-4" />
                            Food log
                          </Label>
                        </TooltipTrigger>
                        <TooltipContent className="max-w-xs">
                          <p className="font-medium">What you ate — calories (and optional P/C/F) per portion</p>
                          <p className="text-xs mt-1">Log Suhoor and Iftar items. Each item has calories per portion; protein, carbs, fat are optional. Total shows below with recommended (from Settings) when set.</p>
                        </TooltipContent>
                      </Tooltip>
                      <p className="text-xs text-muted-foreground mb-2">
                        Add items from recipes or custom. Set portions; calories and optional P/C/F are per portion.
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

                      {/* Total calories from food log; show vs recommended when gender/weight in profile */}
                      <div className="p-2 rounded-lg bg-muted/50 text-xs flex flex-wrap items-baseline gap-2 mb-3">
                        <span>Total: <strong>{Math.round(selectedDayTotalsFromFood.calories ?? 0)} cal</strong></span>
                        {(preferences.sexForCalories != null || (preferences.bodyWeightKg != null && preferences.bodyWeightKg > 0)) && (
                          <span className="text-muted-foreground">
                            / {getRecommendedCaloriesFromPreferences(preferences)} recommended
                          </span>
                        )}
                      </div>

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
                              <form
                                onSubmit={(e) => {
                                  e.preventDefault();
                                  submitAddFoodCustom(addFoodMeal);
                                }}
                                className="contents flex flex-wrap gap-2 items-end"
                              >
                                <input
                                  type="file"
                                  accept="image/*"
                                  capture="environment"
                                  className="hidden"
                                  id="schedule-add-food-photo"
                                  onChange={async (e) => {
                                    const file = e.target.files?.[0];
                                    if (!file) return;
                                    setAddFoodImageResizing(true);
                                    const dataUrl = await resizeImageToDataUrl(file);
                                    setAddFoodImageResizing(false);
                                    if (dataUrl) setAddFoodCustomInputs((c) => ({ ...c, imageDataUrl: dataUrl }));
                                    e.target.value = "";
                                  }}
                                />
                                <label htmlFor="schedule-add-food-photo" className="inline-flex items-center gap-1 min-h-[36px] px-2 py-1.5 rounded border border-border hover:bg-muted/50 cursor-pointer text-xs">
                                  <ImagePlus className="w-3.5 h-3.5" /> {addFoodImageResizing ? "…" : "Photo"}
                                </label>
                                {addFoodCustomInputs.imageDataUrl ? (
                                  <div className="relative inline-block">
                                    <img src={addFoodCustomInputs.imageDataUrl} alt="" className="h-9 w-9 rounded object-cover border border-border" />
                                    <button type="button" onClick={() => setAddFoodCustomInputs((c) => ({ ...c, imageDataUrl: "" }))} className="absolute -top-0.5 -right-0.5 rounded-full bg-destructive text-destructive-foreground w-4 h-4 flex items-center justify-center text-xs" aria-label="Remove photo">
                                      <X className="w-2.5 h-2.5" />
                                    </button>
                                  </div>
                                ) : null}
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
                                <Button type="submit" size="sm">
                                  Add this meal to food log
                                </Button>
                                <Button type="button" variant="ghost" size="sm" onClick={() => { setAddFoodMeal(null); setAddFoodCustomInputs({ name: "", cal: "", portions: "1", protein: "", carbs: "", fat: "", imageDataUrl: "" }); }}>
                                  Cancel (don't add)
                                </Button>
                              </form>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* When no day selected, prompt to click */}
            {!selectedDate && (
              <p className="mt-6 p-4 rounded-2xl bg-muted/50 border border-border text-sm text-center text-muted-foreground">
                Click a day above to view meal plan, food log, fasting actions, and notes.
              </p>
            )}

            {/* Legend */}
            <div className="flex flex-wrap gap-4 mt-6 pt-4 border-t border-border text-xs">
              <span className="text-muted-foreground">Click any day to log food and hours fasted</span>
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

      {/* Copy meals from another day */}
      <Dialog open={copyMealsFromOpen} onOpenChange={setCopyMealsFromOpen}>
        <DialogContent className="max-w-sm">
          <DialogTitle>Copy meals from another day</DialogTitle>
          <p className="text-xs text-muted-foreground mb-3">
            Copy that day&apos;s Suhoor and {iftarLabel} plan to the currently selected day ({selectedDate}). Meal planning is for today and future days only.
          </p>
          <ul className="space-y-1 max-h-60 overflow-auto">
            {(() => {
              const yesterday = new Date(todayStr + "T12:00:00");
              yesterday.setDate(yesterday.getDate() - 1);
              const yesterdayStr = toLocalDateString(yesterday);
              const options: { label: string; dateStr: string }[] = [
                { label: `Today (${todayStr})`, dateStr: todayStr },
                { label: `Yesterday (${yesterdayStr})`, dateStr: yesterdayStr },
                ...lastFiveRamadanDates.map(({ dayNum, dateStr }) => ({
                  label: `Ramadan Day ${dayNum} (${dateStr})`,
                  dateStr,
                })),
              ];
              return options.map(({ label, dateStr }) => {
                const hasPlans = mealPlans[dateStr]?.suhoor || mealPlans[dateStr]?.iftar;
                return (
                  <li key={dateStr}>
                    <button
                      type="button"
                      onClick={() => copyMealsFromDay(dateStr)}
                      className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                        hasPlans ? "hover:bg-muted" : "text-muted-foreground"
                      }`}
                    >
                      {label}
                      {!hasPlans && " (no meals planned)"}
                    </button>
                  </li>
                );
              });
            })()}
          </ul>
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
};

export default DashboardSchedule;
