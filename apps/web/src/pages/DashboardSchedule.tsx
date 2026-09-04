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
  Zap,
  BookOpen,
  MapPin,
  Image,
  Printer,
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
  copyToClipboard,
} from "@/lib/utils";
import { usePrayerTimes, usePrayerTimesForDate, getEffectivePrayerTimes, useRamadanPrayerTimes } from "@/hooks/usePrayerTimes";
import { buildIcalContent, downloadIcal } from "@/lib/ical";
import { fetchPrayerTimesForMonth } from "@/hooks/usePrayerTimes";
import { getRecipes, getRecipe, parseNutrient, getAllCountries, type MealType } from "@/lib/cultureRecipes";
import { EATING_TIME_TOOLTIPS, EATING_TIME_TITLE } from "@/data/eating-times-tooltips";
import { EXTERNAL_LINKS } from "@/lib/config";
import { GENERAL_TOOLTIPS } from "@/data/general-tooltips";
import { resizeImageToDataUrl } from "@/lib/foodImage";
import { PageSEO } from "@/components/PageSEO";
import { LocationRequiredCTA } from "@/components/LocationRequiredCTA";
import { LocationDisplay } from "@/components/LocationDisplay";
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
import { CatchUpDialog } from "@/components/CatchUpDialog";

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
  const recipeEmoji = entry.recipeId ? (() => {
    const [mt, idStr] = entry.recipeId.split("-");
    const id = parseInt(idStr, 10);
    const r = getRecipe(mt as MealType, id);
    return r?.emoji;
  })() : undefined;
  return (
    <li className="flex flex-wrap items-center gap-2 text-sm py-1 border-b border-border/50 last:border-0">
      {entry.imageDataUrl ? (
        <img src={entry.imageDataUrl} alt="" className="h-10 w-10 rounded object-cover shrink-0 border border-border" />
      ) : null}
      {recipeEmoji && <span className="shrink-0" aria-hidden>{recipeEmoji}</span>}
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
      {entry.recipeId && (() => {
        const idPart = entry.recipeId.includes("-") ? entry.recipeId.split("-")[1] : undefined;
        return idPart ? (
          <Link to={`/recipe/${entry.mealType}/${idPart}`} className="text-xs text-secondary hover:underline shrink-0">
            View recipe
          </Link>
        ) : null;
      })()}
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

  /** Effective prayer times for every Ramadan day (for table and sync). Uses startStr/endStr; ensures every day has times (fallback to previous day if API missing). */
  const effectiveRamadanTimesMap = useMemo(() => {
    const map: Record<string, import("@/hooks/usePrayerTimes").PrayerTimes> = {};
    const startStr = ramadanRange.startStr ?? toLocalDateString(ramadanRange.start);
    const endStr = ramadanRange.endStr ?? toLocalDateString(ramadanRange.end);
    const [sy, sm, sd] = startStr.split("-").map(Number);
    const [ey, em, ed] = endStr.split("-").map(Number);
    const d = new Date(sy, sm - 1, sd);
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
  const [quickActionDragIndex, setQuickActionDragIndex] = useState<number | null>(null);
  const [quickActionDropTargetIndex, setQuickActionDropTargetIndex] = useState<number | null>(null);
  const [addFoodMeal, setAddFoodMeal] = useState<MealType | null>(null);
  /** Which recipe Select dropdown is open; close after picking so user can edit the added row. */
  const [recipeSelectOpen, setRecipeSelectOpen] = useState<"mealplan-suhoor" | "mealplan-iftar" | "foodlog" | null>(null);
  const [addFoodCustomInputs, setAddFoodCustomInputs] = useState({ name: "", cal: "", portions: "1", protein: "", carbs: "", fat: "", imageDataUrl: "" });
  const [addFoodImageResizing, setAddFoodImageResizing] = useState(false);
  const [exportLoading, setExportLoading] = useState(false);
  const [exportTimeRange, setExportTimeRange] = useState<"month" | "30days" | "ramadan" | "day">("month");
  const [exportTypePreset, setExportTypePreset] = useState<"fasting" | "full" | "custom">("full");
  const [exportIncludeMealBlocking, setExportIncludeMealBlocking] = useState(false);
  const [taraweehMosqueName] = useLocalStorage<string>("tryramadan-taraweeh-mosque", "");
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
  const [copyMealsToSelectedOpen, setCopyMealsToSelectedOpen] = useState(false);
  const [copyToSelectedDates, setCopyToSelectedDates] = useState<Set<string>>(new Set());
  const [catchUpOpen, setCatchUpOpen] = useState(false);
  const [scheduleTableSort, setScheduleTableSort] = useState<"date" | "hoursAsc" | "hoursDesc">("date");
  const [scheduleTableMonthOnly, setScheduleTableMonthOnly] = useState(false);
  const [scheduleLocationEditorOpen, setScheduleLocationEditorOpen] = useState(false);
  const [prayerTimesExporting, setPrayerTimesExporting] = useState<"png" | "pdf" | null>(null);
  const prayerTimesFlyerRef = useRef<HTMLDivElement>(null);
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
  const imsakTomorrow = tomorrowPrayerTimes?.fajr ?? todayPrayerTimes?.fajr;
  const { prayerTimes: selectedDayPrayerTimes } = usePrayerTimesForDate(lat, lng, selectedDate);
  /** Effective prayer times for selected day (API + overrides). */
  const effectiveSelectedDayPrayerTimes = useMemo(
    () => getEffectivePrayerTimes(selectedDayPrayerTimes ?? null, selectedDate ? prayerTimeOverrides[selectedDate] : undefined),
    [selectedDayPrayerTimes, selectedDate, prayerTimeOverrides]
  );
  /** Today's prayer times with overrides applied (for countdown and fasting status). */
  const effectiveTodayPrayerTimes = useMemo(
    () => getEffectivePrayerTimes(todayPrayerTimes ?? null, todayStr ? prayerTimeOverrides[todayStr] : undefined),
    [todayPrayerTimes, todayStr, prayerTimeOverrides]
  );
  const hasTodayPrayerTimes = Boolean(effectiveTodayPrayerTimes?.fajr && effectiveTodayPrayerTimes?.maghrib);

  /** Same as Dashboard: can mark *today* complete after Maghrib (iftar); disabled only while still in fasting window and fasting. */
  const scheduleMarkTodayComplete = useMemo(() => {
    if (!effectiveTodayPrayerTimes?.fajr || !effectiveTodayPrayerTimes?.maghrib) {
      return { disabled: false, toastMessage: "Fasting is not done yet. You can mark complete after iftar." as string };
    }
    const nowSec = displayTimezone
      ? getNowSecondsSinceMidnightInTimezone(displayTimezone)
      : (() => {
          const d = new Date();
          return d.getHours() * 3600 + d.getMinutes() * 60 + d.getSeconds();
        })();
    const imsakSec = timeStringToSecondsSinceMidnight(effectiveTodayPrayerTimes.fajr);
    const maghribSec = timeStringToSecondsSinceMidnight(effectiveTodayPrayerTimes.maghrib);
    const inFastingWindow = nowSec >= imsakSec && nowSec < maghribSec;
    const fastingToday = isFastingToday(progress, todayStr);
    const disabled = inFastingWindow && fastingToday;
    const toastMessage = "Fasting is not done yet. You can mark complete after iftar.";
    return { disabled, toastMessage };
  }, [displayTimezone, effectiveTodayPrayerTimes, progress, todayStr]);
  const scheduleMarkTodayCompleteDisabled = scheduleMarkTodayComplete.disabled;

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

  // Keyboard: arrow keys change selected day (within ~3 months of today to avoid infinite range)
  useEffect(() => {
    if (!selectedDate) return;
    const onKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (target.closest("input, textarea, select, [contenteditable=true]")) return;
      const step = e.key === "ArrowLeft" || e.key === "ArrowUp" ? -1 : e.key === "ArrowRight" || e.key === "ArrowDown" ? 1 : 0;
      if (step === 0) return;
      const days = e.key === "ArrowUp" || e.key === "ArrowDown" ? 7 : 1;
      const d = new Date(selectedDate + "T12:00:00");
      d.setDate(d.getDate() + step * days);
      const min = new Date(ramadanRange.start);
      min.setDate(min.getDate() - 14);
      const max = new Date(ramadanRange.end);
      max.setDate(max.getDate() + 14);
      if (d.getTime() < min.getTime() || d.getTime() > max.getTime()) return;
      e.preventDefault();
      const nextStr = toLocalDateString(d);
      setCurrentMonth(new Date(d.getFullYear(), d.getMonth(), 1));
      setSelectedDate(nextStr);
      setNoteInput(scheduleNotes[nextStr] || "");
      setSearchParams({ date: nextStr }, { replace: true });
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [selectedDate, scheduleNotes, ramadanRange.start, ramadanRange.end, setSearchParams]);

  /** Remaining Ramadan days from today (or selected date if in future) through end of Ramadan (inclusive). Uses ramadanRange from preferences (localStorage: ramadanStartOverride/ramadanEndOverride or app calendar). */
  const remainingRamadanDates = useMemo(() => {
    const startStr = ramadanRange.startStr ?? toLocalDateString(ramadanRange.start);
    const endStr = ramadanRange.endStr ?? toLocalDateString(ramadanRange.end);
    const fromStr = selectedDate && selectedDate >= todayStr && selectedDate <= endStr ? selectedDate : todayStr;
    if (fromStr > endStr) return [];
    const [fy, fm, fd] = fromStr.split("-").map(Number);
    const [ey, em, ed] = endStr.split("-").map(Number);
    const fromDate = new Date(fy, fm - 1, fd);
    const endDate = new Date(ey, em - 1, ed);
    const dates: { dayNum: number; dateStr: string }[] = [];
    for (const d = new Date(fromDate); d.getTime() <= endDate.getTime(); d.setDate(d.getDate() + 1)) {
      const dateStr = toLocalDateString(d);
      if (dateStr < todayStr) continue;
      const dayNum = ramadanRange.getRamadanDayNumber(d);
      if (dayNum != null) dates.push({ dayNum, dateStr });
    }
    return dates;
  }, [ramadanRange.startStr, ramadanRange.endStr, ramadanRange.start, ramadanRange.end, todayStr, selectedDate]);

  /** Copy selected day's eating cutoff and break-fast times to clipboard. */
  const copySelectedDayTimes = useCallback(() => {
    if (!selectedDate || !effectiveSelectedDayPrayerTimes) {
      toast.info("Set your location to see times for this day.");
      return;
    }
    const pt = effectiveSelectedDayPrayerTimes;
    const d = new Date(selectedDate + "T12:00:00");
    const dateLabel = d.toLocaleDateString("en", { weekday: "short", month: "short", day: "numeric", year: "numeric" });
    const hrs = getFastingHoursForDay(pt.fajr, pt.maghrib);
    const line = `${dateLabel}: ${suhoorLabel} end ${pt.fajr ?? "—"}, ${iftarLabel} ${pt.maghrib ?? "—"}${hrs != null ? ` (${hrs}h fast)` : ""}`;
    copyToClipboard(line)
      .then((ok) => {
        if (ok) toast.success("Times copied to clipboard");
        else toast.error("Could not copy");
      })
      .catch(() => toast.error("Could not copy"));
  }, [selectedDate, effectiveSelectedDayPrayerTimes, suhoorLabel, iftarLabel]);

  /** Copy as reminder text (Suhoor ends at X, Iftar at Y) for pasting into reminder apps. */
  const copyAsReminder = useCallback(() => {
    if (!selectedDate || !effectiveSelectedDayPrayerTimes) {
      toast.info("Set your location to see Suhoor and Iftar times for this day.");
      return;
    }
    const pt = effectiveSelectedDayPrayerTimes;
    const imsak = pt.fajr ?? "—";
    const maghrib = pt.maghrib ?? "—";
    const lines = [
      `Remind me: ${suhoorLabel} ends at ${imsak}`,
      `Remind me: ${iftarLabel} at ${maghrib}`,
    ];
    copyToClipboard(lines.join("\n"))
      .then((ok) => {
        if (ok) toast.success("Reminder text copied");
        else toast.error("Could not copy");
      })
      .catch(() => toast.error("Could not copy"));
  }, [selectedDate, effectiveSelectedDayPrayerTimes, suhoorLabel, iftarLabel]);

  /** Copy one table row's times to clipboard. */
  const copyTableRowTimes = useCallback(
    (dateStr: string, pt: { fajr?: string; maghrib?: string }) => {
      const d = new Date(dateStr + "T12:00:00");
      const dateLabel = d.toLocaleDateString("en", { weekday: "short", month: "short", day: "numeric", year: "numeric" });
      const hrs = getFastingHoursForDay(pt.fajr, pt.maghrib);
      const line = `${dateLabel}: ${suhoorLabel} end ${pt.fajr ?? "—"}, ${iftarLabel} ${pt.maghrib ?? "—"}${hrs != null ? ` (${hrs}h fast)` : ""}`;
      copyToClipboard(line)
        .then((ok) => {
          if (ok) toast.success("Times copied");
          else toast.error("Could not copy");
        })
        .catch(() => toast.error("Could not copy"));
    },
    [suhoorLabel, iftarLabel]
  );

  /** Save prayer times flyer as PNG (html2canvas on the flyer ref). */
  const handlePrayerTimesPNG = useCallback(async () => {
    if (!prayerTimesFlyerRef.current || Object.keys(effectiveRamadanTimesMap).length === 0) return;
    setPrayerTimesExporting("png");
    try {
      const html2canvas = (await import("html2canvas")).default;
      const canvas = await html2canvas(prayerTimesFlyerRef.current, {
        backgroundColor: "hsl(var(--background))",
        scale: 2,
        logging: false,
      });
      const link = document.createElement("a");
      link.download = `ramadan-prayer-times-${preferences.location?.replace(/\s*,\s*/g, "-").slice(0, 40) || "location"}-${new Date().toISOString().split("T")[0]}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
      toast.success("Prayer times saved as PNG");
    } catch {
      toast.error("Could not save image.");
    } finally {
      setPrayerTimesExporting(null);
    }
  }, [effectiveRamadanTimesMap, preferences.location]);

  /** Open prayer times in a new window and trigger print (user can choose Save as PDF). */
  const handlePrayerTimesPrint = useCallback(() => {
    if (Object.keys(effectiveRamadanTimesMap).length === 0) return;
    setPrayerTimesExporting("pdf");
    const locationName = preferences.location || "Your location";
    const year = ramadanRange.start ? new Date(ramadanRange.startStr + "T12:00:00").getFullYear() : new Date().getFullYear();
    const rows = Object.entries(effectiveRamadanTimesMap)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([dateStr, pt]) => {
        const d = new Date(dateStr + "T12:00:00");
        const hrs = getFastingHoursForDay(pt.fajr, pt.maghrib);
        return `<tr><td>${d.toLocaleDateString("en", { month: "short", day: "numeric", year: "numeric" })}</td><td>${pt.fajr ?? "—"}</td><td>${pt.maghrib ?? "—"}</td><td>${hrs != null ? hrs + "h" : "—"}</td></tr>`;
      })
      .join("");
    const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>Ramadan Prayer Times ${year}</title><style>
      body{font-family:system-ui,sans-serif;padding:24px;max-width:800px;margin:0 auto;background:#fff;color:#111;}
      h1{font-size:1.5rem;margin-bottom:0.25rem;}
      .location{color:#666;font-size:0.9rem;margin-bottom:1rem;}
      table{width:100%;border-collapse:collapse;}
      th,td{text-align:left;padding:8px 12px;border-bottom:1px solid #eee;}
      th{font-weight:600;}
      .muted{color:#666;font-size:0.85rem;margin-top:1rem;}
    </style></head><body>
      <h1>Ramadan Prayer Times · ${year}</h1>
      <p class="location">${locationName}</p>
      <p class="muted">Eating cutoff (Suhoor end) · Break fast (Iftar/Maghrib)</p>
      <table><thead><tr><th>Date</th><th>Eating cutoff</th><th>Break fast</th><th>Fasting hrs</th></tr></thead><tbody>${rows}</tbody></table>
      <p class="muted">Generated by TryRamadan.app</p>
      <script>window.onload=function(){window.print();window.close();}</script>
    </body></html>`;
    const w = window.open("", "_blank");
    if (w) {
      w.document.write(html);
      w.document.close();
    } else {
      toast.error("Allow pop-ups to print or save as PDF.");
    }
    setPrayerTimesExporting(null);
  }, [effectiveRamadanTimesMap, preferences.location, ramadanRange.start, ramadanRange.startStr]);

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

  /** Copy selected day's meals to the next 6 days (7 days total including selected). Only today and future. */
  const copyMealsToThisWeek = useCallback(() => {
    if (!selectedDate) return;
    const source = mealPlans[selectedDate];
    if (!source?.suhoor && !source?.iftar) {
      toast.info("This day has no meals planned to copy.");
      return;
    }
    const dateStrs: string[] = [];
    const start = new Date(selectedDate + "T12:00:00");
    for (let i = 1; i <= 6; i++) {
      const d = new Date(start);
      d.setDate(d.getDate() + i);
      const str = toLocalDateString(d);
      if (str >= todayStr) dateStrs.push(str);
    }
    if (dateStrs.length === 0) {
      toast.info("No future days in this week to copy to.");
      return;
    }
    setMealPlans((prev) => {
      const next = { ...prev };
      dateStrs.forEach((str) => {
        next[str] = { ...(next[str] ?? {}), ...source };
      });
      return next;
    });
    toast.success(`Meals copied to ${dateStrs.length} day(s) (this week).`);
  }, [selectedDate, todayStr, mealPlans, setMealPlans]);

  /** Copy selected day's meals to the set of dates chosen in the "Copy to selected days" dialog. */
  const copyMealsToSelectedDays = useCallback(() => {
    if (!selectedDate || copyToSelectedDates.size === 0) return;
    const source = mealPlans[selectedDate];
    if (!source?.suhoor && !source?.iftar) {
      toast.info("This day has no meals planned to copy.");
      return;
    }
    const dateStrs = [...copyToSelectedDates].filter((str) => str >= todayStr && str !== selectedDate);
    if (dateStrs.length === 0) {
      toast.info("No future days selected to copy to.");
      setCopyMealsToSelectedOpen(false);
      return;
    }
    setMealPlans((prev) => {
      const next = { ...prev };
      dateStrs.forEach((str) => {
        next[str] = { ...(next[str] ?? {}), ...source };
      });
      return next;
    });
    toast.success(`Meals copied to ${dateStrs.length} day(s).`);
    setCopyToSelectedDates(new Set());
    setCopyMealsToSelectedOpen(false);
  }, [selectedDate, todayStr, mealPlans, setMealPlans, copyToSelectedDates]);

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

  /** Longest and shortest fasting hours in the currently viewed month (from Ramadan table data). */
  const monthFastRange = useMemo(() => {
    const entries = Object.entries(effectiveRamadanTimesMap).filter(([dateStr]) => {
      const d = new Date(dateStr + "T12:00:00");
      return d.getFullYear() === currentMonth.getFullYear() && d.getMonth() === currentMonth.getMonth();
    });
    const hours = entries
      .map(([, pt]) => getFastingHoursForDay(pt.fajr, pt.maghrib))
      .filter((h): h is number => h != null);
    if (hours.length === 0) return null;
    return { min: Math.min(...hours), max: Math.max(...hours) };
  }, [effectiveRamadanTimesMap, currentMonth]);

  /** Next 7 days from today for the "Next 7 days" strip (date + times when in Ramadan). */
  const nextSevenDays = useMemo(() => {
    const out: { dateStr: string; pt?: import("@/hooks/usePrayerTimes").PrayerTimes; fastingHrs: number | null }[] = [];
    const start = new Date(todayStr + "T12:00:00");
    for (let i = 0; i < 7; i++) {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      const dateStr = toLocalDateString(d);
      const pt = effectiveRamadanTimesMap[dateStr];
      out.push({
        dateStr,
        pt,
        fastingHrs: pt ? getFastingHoursForDay(pt.fajr, pt.maghrib) : null,
      });
    }
    return out;
  }, [todayStr, effectiveRamadanTimesMap]);

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
    // Keep meal plan text in sync: append recipe name so plan summary stays visible
    setMealPlans((prev) => {
      const current = prev[selectedDate]?.[meal]?.trim() ?? "";
      const appended = current ? `${current}, ${recipe.name}` : recipe.name;
      return {
        ...prev,
        [selectedDate]: { ...prev[selectedDate], [meal]: appended },
      };
    });
    setRecipeSelectOpen(null);
  };

  const scheduleAddFoodCulturalFoods = useMemo(() => [...new Set(getAllCountries().flatMap((c) => c.foods ?? []))].filter(Boolean), []);
  const scheduleAddFoodSuggestions = useMemo(() => {
    if (!addFoodMeal) return { recipes: [], foods: [] };
    const q = addFoodCustomInputs.name.trim().toLowerCase();
    if (!q || q.length < 1) return { recipes: [], foods: [] };
    const recipes = allRecipesForPicker
      .filter((r) => r.mealType === addFoodMeal && r.recipe.name.toLowerCase().includes(q))
      .slice(0, 6);
    const foods = scheduleAddFoodCulturalFoods
      .filter((f) => f.toLowerCase().includes(q) && !recipes.some((r) => r.recipe.name.toLowerCase() === f.toLowerCase()))
      .slice(0, 4);
    return { recipes, foods };
  }, [addFoodMeal, addFoodCustomInputs.name, scheduleAddFoodCulturalFoods]);

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
      time = (pt as unknown as Record<string, string>)[template.timeKey] ?? time;
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

  /** Quick-add all prayer events for the selected day (suhoor, iftar, 5 prayers, Taraweeh). Skips types already added. */
  const quickAddAllPrayers = () => {
    if (!selectedDate) return;
    const existing = new Set((calendarEvents[selectedDate] ?? []).map((e) => e.type));
    const prayerTemplates = QUICK_ADD_TEMPLATES.filter((t) => t.type !== "get_food");
    let added = 0;
    prayerTemplates.forEach((t) => {
      if (!existing.has(t.type)) {
        quickAddCalendarEvent(t.type, t);
        existing.add(t.type);
        added++;
      }
    });
    if (added > 0) toast.success(`Added ${added} prayer event${added === 1 ? "" : "s"} to ${selectedDate}`);
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
          const time = (pt as unknown as Record<string, string>)[timeKey] ?? "06:00";
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
    if (!pt?.fajr || !pt?.maghrib) return;
    const suhoorForTomorrow = imsakTomorrow ?? pt.fajr;
    if (displayTimezone) {
      const nowSeconds = getNowSecondsSinceMidnightInTimezone(displayTimezone);
      const imsakSeconds = timeStringToSecondsSinceMidnight(pt.fajr);
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
      const imsakStr = (pt.fajr ?? "").trim().split(" ")[0] || "05:00";
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

  const handleExportIcal = async () => {
    const range = exportTimeRange;
    if (!lat || !lng) return;
    if (range === "day") {
      if (!selectedDate || !effectiveSelectedDayPrayerTimes) {
        toast.info("Select a day in the calendar to export that day’s times.");
        return;
      }
    }
    setExportLoading(true);
    try {
      let start: Date;
      let end: Date;
      let startStr: string;
      let endStr: string;
      let prayerTimesMap: Record<string, import("@/hooks/usePrayerTimes").PrayerTimes> = {};
      if (range === "day" && selectedDate && effectiveSelectedDayPrayerTimes) {
        startStr = selectedDate;
        endStr = selectedDate;
        prayerTimesMap = { [selectedDate]: effectiveSelectedDayPrayerTimes };
      } else if (range === "month") {
        const [y, m] = todayStr.split("-").map(Number);
        start = new Date(y, m - 1, 1);
        end = new Date(y, m, 0);
        startStr = toLocalDateString(start);
        endStr = toLocalDateString(end);
      } else if (range === "30days") {
        start = new Date(todayStr + "T12:00:00");
        end = new Date(todayStr + "T12:00:00");
        end.setDate(end.getDate() + 29);
        startStr = toLocalDateString(start);
        endStr = toLocalDateString(end);
      } else {
        // Ramadan: use effective range (includes user overrides from Settings) for accurate export
        startStr = ramadanRange.startStr ?? toLocalDateString(ramadanRange.start);
        endStr = ramadanRange.endStr ?? toLocalDateString(ramadanRange.end);
        start = new Date(startStr + "T00:00:00");
        end = new Date(endStr + "T23:59:59");
        // Use same prayer times as table/sync (with fallback-to-previous-day) so export matches UI
        const ramadanMapKeys = Object.keys(effectiveRamadanTimesMap).filter(
          (d) => d >= startStr && d <= endStr
        );
        if (ramadanMapKeys.length > 0) {
          prayerTimesMap = { ...effectiveRamadanTimesMap };
        }
      }
      if (Object.keys(prayerTimesMap).length === 0) {
        const startDate = new Date(startStr + "T12:00:00");
        const endDate = new Date(endStr + "T12:00:00");
        const startYear = startDate.getFullYear();
        const endYear = endDate.getFullYear();
        const method = preferences.prayerCalculationMethod ?? 2;
        for (let y = startYear; y <= endYear; y++) {
          for (let m = 1; m <= 12; m++) {
            const monthStart = new Date(y, m - 1, 1);
            const monthEnd = new Date(y, m, 0);
            if (monthEnd < startDate || monthStart > endDate) continue;
            const data = await fetchPrayerTimesForMonth(lat, lng, y, m, method);
            Object.assign(prayerTimesMap, data);
          }
        }
        Object.keys(prayerTimesMap).forEach((dateStr) => {
          const effective = getEffectivePrayerTimes(prayerTimesMap[dateStr], prayerTimeOverrides[dateStr]);
          if (effective) prayerTimesMap[dateStr] = effective;
        });
      }
      const exportTimezone =
        preferences.timezone?.trim() ||
        displayTimezone?.trim() ||
        (typeof Intl !== "undefined" && Intl.DateTimeFormat?.().resolvedOptions?.().timeZone) ||
        undefined;
      const isCustom = exportTypePreset === "custom";
      const ics = buildIcalContent({
        prayerTimesMap,
        customEvents: calendarEvents,
        dateRange: [startStr, endStr],
        includeTaraweeh: isCustom ? calendarIncludeTypes.taraweeh !== false : exportTypePreset === "full",
        includePrayers: true,
        timezone: exportTimezone,
        exportMode: isCustom ? undefined : exportTypePreset === "fasting" ? "fasting" : "full",
        includeTypes: isCustom ? calendarIncludeTypes : undefined,
        eventDurations: defaultDurations,
        taraweehMosque: taraweehMosqueName || undefined,
        includeMealBlocking: exportIncludeMealBlocking,
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
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            <ArrowLeft className="w-4 h-4" aria-hidden />
            Back to Dashboard
          </Link>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-4 sm:mb-6" role="region" aria-label="Schedule intro">
            <h1 className="text-xl sm:text-2xl md:text-3xl font-display font-bold">
              Fasting Schedule
            </h1>
            <p className="text-sm sm:text-base text-muted-foreground mt-1.5 sm:mt-2">
              Tap a day to view or edit meal plan, food log, and prayer times. Override past days by selecting the day and marking it complete or skipped. Plan ahead by copying meals to future days.
            </p>
            <div className="mt-4 flex flex-wrap gap-2 sm:gap-3">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setCatchUpOpen(true)}
                className="gap-2"
                aria-label="Catch up on past days"
              >
                <Zap className="w-4 h-4" aria-hidden />
                Catch up
              </Button>
              <span className="hidden sm:inline self-center text-xs text-muted-foreground">Log fasting, journal, or meals for past days.</span>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => document.getElementById("plan-ahead-meals")?.scrollIntoView({ behavior: "smooth" })}
                className="gap-2"
                aria-label="Scroll to plan ahead meals"
              >
                <Utensils className="w-4 h-4" aria-hidden />
                Plan ahead
              </Button>
              <span className="hidden sm:inline self-center text-xs text-muted-foreground">Meals for the next 7 days.</span>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => document.getElementById("ramadan-daily-schedule")?.scrollIntoView({ behavior: "smooth" })}
                className="gap-2 text-muted-foreground"
                aria-label="View Ramadan days table"
              >
                <CalendarDays className="w-4 h-4" aria-hidden />
                Past days
              </Button>
            </div>
          </motion.div>

          {/* Plan ahead meals: next 7 days with inline Suhoor/Iftar inputs from this view */}
          {(() => {
            const planAheadDays: string[] = [];
            const start = new Date(todayStr + "T12:00:00");
            for (let i = 0; i < 7; i++) {
              const d = new Date(start);
              d.setDate(start.getDate() + i);
              planAheadDays.push(toLocalDateString(d));
            }
            return (
              <motion.div
                id="plan-ahead-meals"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 }}
                className="mb-6 p-4 rounded-2xl bg-card border border-border scroll-mt-4"
                role="region"
                aria-label="Plan ahead meals for upcoming days"
              >
                <h2 className="font-display font-bold mb-1 flex items-center gap-2">
                  <Utensils className="w-5 h-5 text-secondary" />
                  Plan ahead meals
                </h2>
                <p className="text-sm text-muted-foreground mb-4">
                  Add Suhoor and {iftarLabel} plans for the next 7 days. Tap a day in the calendar to add recipes or log food.
                </p>
                <div className="overflow-x-auto -mx-1">
                  <table className="w-full min-w-[400px] text-sm border-collapse">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left py-2 px-2 font-medium w-[120px]">Date</th>
                        <th className="text-left py-2 px-2 font-medium" title={EATING_TIME_TITLE.suhoor}>Suhoor</th>
                        <th className="text-left py-2 px-2 font-medium" title={EATING_TIME_TITLE.iftar}>{iftarLabel}</th>
                        <th className="relative w-10"><span className="sr-only">Go to day</span></th>
                      </tr>
                    </thead>
                    <tbody>
                      {planAheadDays.map((dateStr) => {
                        const d = new Date(dateStr + "T12:00:00");
                        const isToday = dateStr === todayStr;
                        const label = d.toLocaleDateString("en", { weekday: "short", month: "short", day: "numeric" });
                        const suhoorVal = mealPlans[dateStr]?.suhoor ?? "";
                        const iftarVal = mealPlans[dateStr]?.iftar ?? "";
                        return (
                          <tr key={dateStr} className="border-b border-border/50 hover:bg-muted/20">
                            <td className="py-2 px-2 align-middle">
                              <span className="font-medium">{label}</span>
                              {isToday && <span className="ml-1 text-xs text-secondary">Today</span>}
                            </td>
                            <td className="py-1.5 px-2 align-middle">
                              <Input
                                placeholder="e.g. Oats & dates"
                                value={suhoorVal}
                                onChange={(e) =>
                                  setMealPlans((prev) => ({
                                    ...prev,
                                    [dateStr]: { ...(prev[dateStr] ?? {}), suhoor: e.target.value.trim() || undefined },
                                  }))
                                }
                                className="h-9 bg-background text-sm min-w-0"
                                aria-label={`Suhoor plan for ${label}`}
                              />
                            </td>
                            <td className="py-1.5 px-2 align-middle">
                              <Input
                                placeholder={`e.g. Harira & dates`}
                                value={iftarVal}
                                onChange={(e) =>
                                  setMealPlans((prev) => ({
                                    ...prev,
                                    [dateStr]: { ...(prev[dateStr] ?? {}), iftar: e.target.value.trim() || undefined },
                                  }))
                                }
                                className="h-9 bg-background text-sm min-w-0"
                                aria-label={`${iftarLabel} plan for ${label}`}
                              />
                            </td>
                            <td className="py-1.5 px-2 align-middle">
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0"
                                onClick={() => {
                                  setSelectedDate(dateStr);
                                  setNoteInput(scheduleNotes[dateStr] || "");
                                  setSearchParams({ date: dateStr }, { replace: true });
                                  document.getElementById("schedule-day-detail")?.scrollIntoView({ behavior: "smooth" });
                                }}
                                aria-label={`Open ${label} to add recipes or log food`}
                              >
                                <ChevronRight className="w-4 h-4" />
                              </Button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
                <p className="text-xs text-muted-foreground mt-3">
                  Use &quot;Add from recipe&quot; in the day panel below to add items with calories. Tap the arrow to open that day.
                </p>
              </motion.div>
            );
          })()}

          {/* Set location for prayer/fasting times — shown when location not set so page still has clear next step */}
          {(!lat || !lng) && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6"
            >
              <LocationRequiredCTA message="Set your location to see Suhoor and Iftar times, the Ramadan table, and export to calendar." />
            </motion.div>
          )}

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
                  {today.getDay() === 1 ? "Monday" : "Thursday"} — voluntary fasting is recommended in Islamic tradition.
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
              aria-expanded={showQuickActionsEditor}
              aria-controls="quick-actions-editor"
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
                  id="quick-actions-editor"
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
                          className={`flex items-center gap-2 p-2 rounded-xl border transition-colors ${
                            quickActionDragIndex === index ? "opacity-50 bg-muted/30 border-dashed" : "bg-muted/50 border-border"
                          } ${quickActionDropTargetIndex === index ? "ring-2 ring-primary/50 ring-offset-2 ring-offset-background" : ""}`}
                          onDragOver={(e) => {
                            e.preventDefault();
                            e.dataTransfer.dropEffect = "move";
                            if (quickActionDragIndex !== null && quickActionDragIndex !== index) {
                              setQuickActionDropTargetIndex(index);
                            }
                          }}
                          onDragLeave={() => setQuickActionDropTargetIndex(null)}
                          onDrop={(e) => {
                            e.preventDefault();
                            setQuickActionDropTargetIndex(null);
                            const dragIndexStr = e.dataTransfer.getData("text/plain");
                            if (dragIndexStr === "") return;
                            const dragIndex = parseInt(dragIndexStr, 10);
                            if (Number.isNaN(dragIndex) || dragIndex === index) return;
                            const next = [...quickActionOrder];
                            const [removed] = next.splice(dragIndex, 1);
                            next.splice(index, 0, removed);
                            setQuickActionOrder(next);
                          }}
                        >
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <span
                                draggable
                                onDragStart={(e) => {
                                  e.dataTransfer.effectAllowed = "move";
                                  e.dataTransfer.setData("text/plain", String(index));
                                  setQuickActionDragIndex(index);
                                }}
                                onDragEnd={() => {
                                  setQuickActionDragIndex(null);
                                  setQuickActionDropTargetIndex(null);
                                }}
                                className="cursor-grab active:cursor-grabbing touch-none p-1 -m-1 rounded text-muted-foreground hover:text-foreground hover:bg-muted/80 shrink-0"
                                role="button"
                                tabIndex={0}
                                aria-label={`Drag to reorder ${action.label}`}
                              >
                                <GripVertical className="w-4 h-4" aria-hidden />
                              </span>
                            </TooltipTrigger>
                            <TooltipContent side="right">
                              <p>Drag to reorder</p>
                            </TooltipContent>
                          </Tooltip>
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
            className="mb-3 sm:mb-6 p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-card border border-border"
            role="region"
            aria-label="Export to calendar"
          >
            <h2 className="font-display font-bold text-sm sm:text-lg mb-1 sm:mb-2 flex items-center gap-2">
              <Download className="w-4 h-4 text-secondary shrink-0" aria-hidden />
              Add to calendar
            </h2>
            <p className="text-xs text-muted-foreground mb-1.5 sm:mb-2">
              Export .ics for Google, Apple, or Outlook.
            </p>
            <p className="text-[11px] sm:text-xs text-muted-foreground mb-2 sm:mb-3">
              <Link to="/guides/schedule-calendar" className="text-secondary hover:underline inline-flex items-center gap-1"><BookOpen className="w-3 h-3 shrink-0" aria-hidden />Schedule guide</Link>
            </p>

            {/* Time + type: one row on sm+, stacked on mobile */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 mb-2 sm:mb-3">
              <div className="space-y-1">
                <Label htmlFor="export-time" className="text-xs sm:text-sm font-medium">
                  Choose time
                </Label>
                <Select
                  value={exportTimeRange}
                  onValueChange={(v: "month" | "30days" | "ramadan" | "day") => setExportTimeRange(v)}
                >
                  <SelectTrigger id="export-time" className="w-full min-h-[40px] sm:min-h-[36px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="month">This month</SelectItem>
                    <SelectItem value="30days">Next 30 days</SelectItem>
                    <SelectItem value="ramadan">Ramadan only</SelectItem>
                    <SelectItem value="day">Selected day</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label htmlFor="export-type" className="text-xs sm:text-sm font-medium">
                  Choose add to calendar type
                </Label>
                <Select
                  value={exportTypePreset}
                  onValueChange={(v: "fasting" | "full" | "custom") => setExportTypePreset(v)}
                >
                  <SelectTrigger id="export-type" className="w-full min-h-[40px] sm:min-h-[36px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="fasting">Fasting only (Suhoor + {iftarLabelShort})</SelectItem>
                    <SelectItem value="full">Full (all prayers + Taraweeh)</SelectItem>
                    <SelectItem value="custom">Custom (choose below)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {exportTypePreset === "custom" && (
              <div className="flex flex-wrap gap-x-3 sm:gap-x-5 gap-y-1.5 py-2 mb-2">
                {(["suhoor", "iftar"] as const).map((t) => (
                  <label key={t} className="flex items-center gap-2 cursor-pointer min-h-[32px]">
                    <input
                      type="checkbox"
                      checked={calendarIncludeTypes[t] !== false}
                      onChange={(e) => setCalendarIncludeTypes((prev) => ({ ...prev, [t]: e.target.checked }))}
                      className="rounded border-border"
                    />
                    <span className="text-xs sm:text-sm" title={t === "suhoor" ? EATING_TIME_TITLE.suhoorEnd : EATING_TIME_TITLE.iftarTime}>{t === "suhoor" ? "Suhoor end" : iftarLabelShort}</span>
                  </label>
                ))}
                {(["fajr", "dhuhr", "asr", "maghrib", "isha"] as const).map((t) => (
                  <label key={t} className="flex items-center gap-2 cursor-pointer min-h-[32px]">
                    <input
                      type="checkbox"
                      checked={calendarIncludeTypes[t] !== false}
                      onChange={(e) => setCalendarIncludeTypes((prev) => ({ ...prev, [t]: e.target.checked }))}
                      className="rounded border-border"
                    />
                    <span className="text-xs sm:text-sm capitalize">{t}</span>
                  </label>
                ))}
                <label className="flex items-center gap-2 cursor-pointer min-h-[32px]">
                  <input
                    type="checkbox"
                    checked={calendarIncludeTypes.taraweeh !== false}
                    onChange={(e) => setCalendarIncludeTypes((prev) => ({ ...prev, taraweeh: e.target.checked }))}
                    className="rounded border-border"
                  />
                  <span className="text-xs sm:text-sm">Taraweeh</span>
                </label>
              </div>
            )}

            {/* Extra export options */}
            <div className="flex flex-wrap gap-x-4 gap-y-1.5 py-2 mb-2 border-t border-border pt-3">
              <label className="flex items-center gap-2 cursor-pointer min-h-[32px]">
                <input
                  type="checkbox"
                  checked={exportIncludeMealBlocking}
                  onChange={(e) => setExportIncludeMealBlocking(e.target.checked)}
                  className="rounded border-border"
                />
                <span className="text-xs sm:text-sm">Block off meal prep time (1hr before Suhoor & Iftar)</span>
              </label>
              {taraweehMosqueName && (
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <MapPin className="w-3 h-3" /> Taraweeh location: {taraweehMosqueName}
                  <Link to="/dashboard/prayers" className="text-secondary hover:underline ml-1">Edit</Link>
                </p>
              )}
            </div>

            <div className="flex flex-col gap-2 mb-2">
              <Button
                onClick={handleExportIcal}
                disabled={
                  exportLoading ||
                  !lat ||
                  !lng ||
                  (exportTimeRange === "day" && (!selectedDate || !effectiveSelectedDayPrayerTimes))
                }
                className="gap-2 min-h-[44px] w-full sm:w-auto sm:min-w-[160px] touch-manipulation"
                aria-label="Add to calendar (download .ics)"
              >
                {exportLoading ? (
                  <span className="animate-pulse">Preparing…</span>
                ) : (
                  <>
                    <Download className="w-4 h-4 shrink-0" />
                    Add to calendar
                  </>
                )}
              </Button>
              {(!lat || !lng) && (
                <LocationRequiredCTA
                  compact
                  message="Set your location in Settings to include prayer times."
                  className="sm:ml-0"
                />
              )}
            </div>

            <div className="pt-2 sm:pt-3 border-t border-border flex flex-col sm:flex-row sm:items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={syncRamadanToCalendar}
                disabled={ramadanPrayersLoading || !lat || !lng || Object.keys(effectiveRamadanTimesMap).length === 0}
                className="gap-2 w-full sm:w-auto min-h-[40px] sm:min-h-0 touch-manipulation"
              >
                {ramadanPrayersLoading ? "Loading…" : <CalendarDays className="w-4 h-4 shrink-0" />}
                <span className="truncate">Sync Ramadan to calendar</span>
              </Button>
              <span className="text-[11px] sm:text-xs text-muted-foreground hidden sm:inline">
                Adds selected events per Ramadan day. Then export above.
              </span>
            </div>

            <details className="mt-2 sm:mt-3 pt-2 sm:pt-3 border-t border-border">
              <summary className="text-xs sm:text-sm font-medium cursor-pointer hover:text-foreground py-1">Default event durations (minutes)</summary>
              <p className="text-xs text-muted-foreground mt-1 mb-2">Used when you sync Ramadan. Edit each event after adding.</p>
              <div className="flex flex-wrap gap-3 items-center">
                {(["suhoor", "iftar", "fajr", "dhuhr", "asr", "maghrib", "isha", "taraweeh"] as const).map((type) => (
                  <label key={type} className="flex items-center gap-1.5 text-sm">
                    <span className="capitalize w-16 truncate" title={type === "suhoor" ? EATING_TIME_TITLE.suhoor : type === "iftar" ? EATING_TIME_TITLE.iftar : undefined}>{type === "suhoor" ? "Suhoor" : type === "iftar" ? "Iftar" : type}</span>
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
              id="ramadan-daily-schedule"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.065 }}
              className="mb-6 p-4 rounded-2xl bg-card border border-border scroll-mt-4"
            >
              <h2 className="font-display font-bold mb-2 flex items-center gap-2">
                <Sunrise className="w-5 h-5 text-secondary" />
                Ramadan daily schedule
              </h2>
              <p className="text-sm text-muted-foreground mb-2">
                Eating cutoff (Suhoor end) and break fast times for each day of Ramadan. Prayer times change every day and are calculated for your location. Override any date in the day panel below.
              </p>
              <div className="text-sm text-muted-foreground mb-4 flex flex-wrap items-center gap-1.5">
                <span>Prayer times for</span>
                <LocationDisplay
                  compact
                  open={scheduleLocationEditorOpen}
                  onOpenChange={setScheduleLocationEditorOpen}
                />
                <span className="text-muted-foreground">— click to change location</span>
              </div>
              {ramadanPrayersLoading ? (
                <p className="text-sm text-muted-foreground py-4">Loading prayer times…</p>
              ) : Object.keys(effectiveRamadanTimesMap).length === 0 ? (
                <p className="text-sm text-muted-foreground py-4">Set your location in Settings to see times.</p>
              ) : (
                <>
                  <div className="flex flex-wrap items-center gap-3 mb-3">
                    <span className="text-xs text-muted-foreground">Sort:</span>
                    <div className="flex gap-1">
                      <Button variant={scheduleTableSort === "date" ? "secondary" : "ghost"} size="sm" className="h-8 text-xs" onClick={() => setScheduleTableSort("date")}>Date</Button>
                      <Button variant={scheduleTableSort === "hoursDesc" ? "secondary" : "ghost"} size="sm" className="h-8 text-xs" onClick={() => setScheduleTableSort("hoursDesc")}>Longest first</Button>
                      <Button variant={scheduleTableSort === "hoursAsc" ? "secondary" : "ghost"} size="sm" className="h-8 text-xs" onClick={() => setScheduleTableSort("hoursAsc")}>Shortest first</Button>
                    </div>
                    <label className="flex items-center gap-1.5 text-xs text-muted-foreground cursor-pointer">
                      <input
                        type="checkbox"
                        checked={scheduleTableMonthOnly}
                        onChange={(e) => setScheduleTableMonthOnly(e.target.checked)}
                        className="rounded border-border"
                        aria-label="Show only days in current calendar month"
                      />
                      This month only
                    </label>
                    {monthFastRange && (
                      <span className="text-xs text-muted-foreground">
                        This month: longest {monthFastRange.max}h, shortest {monthFastRange.min}h
                      </span>
                    )}
                    <span className="flex-1" />
                    <span className="text-xs text-muted-foreground">Save prayer times:</span>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 text-xs gap-1"
                      onClick={handlePrayerTimesPNG}
                      disabled={prayerTimesExporting !== null}
                      aria-label="Download prayer times as PNG image"
                    >
                      <Image className="w-3.5 h-3.5" aria-hidden />
                      PNG
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 text-xs gap-1"
                      onClick={handlePrayerTimesPrint}
                      disabled={prayerTimesExporting !== null}
                      aria-label="Print prayer times or save as PDF"
                    >
                      <Printer className="w-3.5 h-3.5" aria-hidden />
                      Print / PDF
                    </Button>
                  </div>
                  {/* Off-screen flyer for PNG export (same data as table, clean layout) */}
                  <div
                    ref={prayerTimesFlyerRef}
                    className="absolute left-[-9999px] top-0 w-[800px] p-6 bg-background text-foreground rounded-2xl border border-border shadow-lg"
                    aria-hidden
                  >
                    <h3 className="font-display font-bold text-xl mb-1">Ramadan Prayer Times</h3>
                    <p className="text-sm text-muted-foreground mb-4">{preferences.location || "Your location"}</p>
                    <p className="text-xs text-muted-foreground mb-3">Eating cutoff (Suhoor end) · Break fast (Iftar)</p>
                    <table className="w-full text-sm border-collapse">
                      <thead>
                        <tr className="border-b border-border">
                          <th className="text-left py-2 font-medium">Date</th>
                          <th className="text-right py-2 font-medium">Eating cutoff</th>
                          <th className="text-right py-2 font-medium">Break fast</th>
                          <th className="text-right py-2 font-medium">Fasting hrs</th>
                        </tr>
                      </thead>
                      <tbody>
                        {Object.entries(effectiveRamadanTimesMap)
                          .sort(([a], [b]) => a.localeCompare(b))
                          .map(([dateStr, pt]) => {
                            const d = new Date(dateStr + "T12:00:00");
                            const fastingHrs = getFastingHoursForDay(pt.fajr, pt.maghrib);
                            return (
                              <tr key={dateStr} className="border-b border-border/50">
                                <td className="py-1.5">{d.toLocaleDateString("en", { month: "short", day: "numeric", year: "numeric" })}</td>
                                <td className="py-1.5 text-right font-mono tabular-nums">{pt.fajr ?? "—"}</td>
                                <td className="py-1.5 text-right font-mono tabular-nums">{pt.maghrib ?? "—"}</td>
                                <td className="py-1.5 text-right font-mono tabular-nums">{fastingHrs != null ? `${fastingHrs}h` : "—"}</td>
                              </tr>
                            );
                          })}
                      </tbody>
                    </table>
                    <p className="text-xs text-muted-foreground mt-3">TryRamadan.app</p>
                  </div>
                <div className="overflow-x-auto -mx-2">
                  <table className="w-full min-w-[380px] text-sm border-collapse">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left py-2 px-2 font-medium">Date</th>
                        <th className="text-left py-2 px-2 font-medium">Day</th>
                        <th className="text-right py-2 px-2 font-medium">Eating cutoff</th>
                        <th className="text-right py-2 px-2 font-medium">Break fast</th>
                        <th className="text-right py-2 px-2 font-medium">Fasting hrs</th>
                        <th className="relative w-8"><span className="sr-only">Copy times</span></th>
                        <th className="relative w-8"><span className="sr-only">Day details</span></th>
                      </tr>
                    </thead>
                    <tbody>
                      {Object.entries(effectiveRamadanTimesMap)
                        .filter(([dateStr]) => {
                          if (!scheduleTableMonthOnly) return true;
                          const d = new Date(dateStr + "T12:00:00");
                          return d.getFullYear() === currentMonth.getFullYear() && d.getMonth() === currentMonth.getMonth();
                        })
                        .sort(([a, ptA], [b, ptB]) => {
                          if (scheduleTableSort === "date") return a.localeCompare(b);
                          const hrsA = getFastingHoursForDay(ptA.fajr, ptA.maghrib) ?? 0;
                          const hrsB = getFastingHoursForDay(ptB.fajr, ptB.maghrib) ?? 0;
                          return scheduleTableSort === "hoursDesc" ? hrsB - hrsA : hrsA - hrsB;
                        })
                        .map(([dateStr, pt]) => {
                          const d = new Date(dateStr + "T12:00:00");
                          const dayNum = ramadanRange.getRamadanDayNumber(d);
                          const isSelected = selectedDate === dateStr;
                          const fastingHrs = getFastingHoursForDay(pt.fajr, pt.maghrib);
                          return (
                            <tr
                              key={dateStr}
                              className={`border-b border-border/50 hover:bg-muted/30 ${isSelected ? "bg-primary/10" : ""}`}
                            >
                              <td className="py-2 px-2">
                                {d.toLocaleDateString("en", { month: "short", day: "numeric", year: "numeric" })}
                              </td>
                              <td className="py-2 px-2 text-muted-foreground">R{dayNum ?? "—"}</td>
                              <td className="py-2 px-2 text-right font-mono tabular-nums">{pt.fajr || "—"}</td>
                              <td className="py-2 px-2 text-right font-mono tabular-nums">{pt.maghrib || "—"}</td>
                              <td className="py-2 px-2 text-right font-mono tabular-nums">
                                {fastingHrs != null ? `${fastingHrs}h` : "—"}
                              </td>
                              <td className="py-2 px-2">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 shrink-0"
                                  onClick={(e) => { e.stopPropagation(); copyTableRowTimes(dateStr, pt); }}
                                  aria-label={`Copy times for ${d.toLocaleDateString("en", { month: "short", day: "numeric" })}`}
                                >
                                  <Copy className="w-3.5 h-3.5" />
                                </Button>
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
                </>
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
                  <span className="block text-[10px] sm:text-xs text-muted-foreground mt-0.5">Ramadan days in {monthName}</span>
                </div>
              </TooltipTrigger>
              <TooltipContent className="max-w-xs">
                <p className="font-medium text-sm">Fasting days in this calendar month</p>
                <p className="text-xs text-muted-foreground mt-1">Number of days in {monthName} that fall within Ramadan. Use the arrows above the calendar to change the month.</p>
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

          {/* Next 7 days strip — only when viewing today or a past day; hide when viewing a future day */}
          {lat != null && lng != null && nextSevenDays.length > 0 && (!selectedDate || selectedDate <= todayStr) && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="mb-4 p-3 rounded-xl bg-muted/50 border border-border overflow-x-auto"
            >
              <p className="text-xs font-medium text-muted-foreground mb-2">Next 7 days</p>
              <div className="flex gap-2 min-w-0">
                {nextSevenDays.map(({ dateStr, pt, fastingHrs }) => {
                  const d = new Date(dateStr + "T12:00:00");
                  const isSelected = selectedDate === dateStr;
                  const isToday = dateStr === todayStr;
                  return (
                    <button
                      key={dateStr}
                      type="button"
                      onClick={() => selectDay(dateStr)}
                      className={`shrink-0 flex flex-col items-center p-2 rounded-lg border text-left min-w-[88px] sm:min-w-[96px] transition-colors ${
                        isSelected ? "border-primary bg-primary/10 ring-1 ring-primary/30" : "border-border hover:bg-muted/50"
                      } ${isToday ? "ring-2 ring-secondary ring-offset-2 ring-offset-background" : ""}`}
                      aria-label={`${d.toLocaleDateString("en", { weekday: "short", month: "short", day: "numeric" })}${isToday ? ", Today" : ""}${isSelected ? ", selected" : ""}`}
                      aria-pressed={isSelected}
                    >
                      <span className="text-xs font-medium text-muted-foreground">{d.toLocaleDateString("en", { weekday: "short" })}</span>
                      <span className="text-sm font-bold tabular-nums">{d.getDate()}</span>
                      {pt ? (
                        <>
                          <span className="text-[10px] font-mono text-secondary truncate w-full text-center" title={`Suhoor end ${pt.fajr}`}>{pt.fajr ?? "—"}</span>
                          <span className="text-[10px] font-mono text-secondary truncate w-full text-center" title={`${iftarLabelShort} ${pt.maghrib}`}>{pt.maghrib ?? "—"}</span>
                          {fastingHrs != null && <span className="text-[10px] text-muted-foreground">{fastingHrs}h</span>}
                        </>
                      ) : (
                        <span className="text-[10px] text-muted-foreground">—</span>
                      )}
                    </button>
                  );
                })}
              </div>
            </motion.div>
          )}

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
                <h2 className="font-display font-bold text-base sm:text-lg min-w-0 text-center flex-1">
                  {monthName}
                </h2>
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
              Click any day to view or edit. For past days you can mark &quot;I fasted this day&quot; or &quot;I didn&apos;t fast&quot; in the panel below. Meal planning applies to today and future days.
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
                        data-testid="calendar-day-cell"
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
                        const hrs = getFastingHoursForDay(pt.fajr, pt.maghrib);
                        return (
                          <span className="block mt-1 text-xs">
                            Cutoff {pt.fajr} · Break fast {pt.maghrib}
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
                  className="mt-6 overflow-hidden scroll-mt-4"
                  aria-label={`Details for ${selectedDateObj?.toLocaleDateString("en", { weekday: "long", month: "long", day: "numeric" })}`}
                >
                  <div className="p-4 sm:p-5 rounded-xl sm:rounded-2xl bg-muted/50 border border-border space-y-4">
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <h3 className="font-display font-bold text-base sm:text-lg flex items-center gap-2 flex-wrap">
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
                      </h3>
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
                                {!hasTodayPrayerTimes ? "Prayer times unavailable" : isFasting ? "Right now: Fasting window" : "Right now: Eating window"}
                              </span>
                              {!hasTodayPrayerTimes ? (
                                <p className="text-xs text-muted-foreground mt-1">Set your location or retry prayer times. You can still log your day.</p>
                              ) : isFasting ? (
                                <div className="flex items-baseline gap-1.5 mt-0.5" aria-live="polite" aria-atomic="true" aria-label={`${countdownToIftar.h} hours ${countdownToIftar.m} minutes until ${iftarLabel}`}>
                                  <span className="text-lg font-bold tabular-nums">
                                    {String(countdownToIftar.h).padStart(2, "0")}:{String(countdownToIftar.m).padStart(2, "0")}:{String(countdownToIftar.s).padStart(2, "0")}
                                  </span>
                                  <span className="text-xs text-muted-foreground">until {iftarLabel}</span>
                                </div>
                              ) : (
                                <div className="flex items-baseline gap-1.5 mt-0.5" aria-live="polite" aria-atomic="true" aria-label={`${countdownToSuhoor.h} hours ${countdownToSuhoor.m} minutes until ${suhoorLabel}`}>
                                  <span className="text-xs text-muted-foreground">Next: {suhoorLabel} —</span>
                                  <span className="text-lg font-bold tabular-nums">
                                    {String(countdownToSuhoor.h).padStart(2, "0")}:{String(countdownToSuhoor.m).padStart(2, "0")}:{String(countdownToSuhoor.s).padStart(2, "0")}
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>
                          <p className="text-xs font-medium text-muted-foreground">Today&apos;s status</p>
                          <div className="flex flex-wrap items-center gap-2">
                            {todayComplete ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-secondary/20 text-secondary border border-secondary/40" aria-live="polite">Complete ✓</span>
                            ) : todaySkipped ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-muted text-muted-foreground border border-border" aria-live="polite">Skipped</span>
                            ) : todayLog?.status === "broken" ? (
                              <span className="text-xs font-semibold" role="status">{todayLog.brokenReason === "menstruation" ? "Excused (menstruation)" : "Broke fast"}</span>
                            ) : fastingToday ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-primary/20 text-primary border border-primary/40" aria-live="polite">Fasting</span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-muted/80 text-muted-foreground border border-border" aria-live="polite">Not logged yet</span>
                            )}
                          </div>
                          {todayLog?.startedAt && !todayLog?.completedAt && (
                            <p className="text-xs text-muted-foreground">
                              Started {new Date(todayLog.startedAt).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}
                            </p>
                          )}
                          {!todaySkipped && !todayComplete && (
                            <div className="flex flex-col gap-1.5" role="group" aria-labelledby="schedule-mark-today-label">
                              <p className="text-xs font-semibold text-muted-foreground" id="schedule-mark-today-label">Mark today</p>
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
                                  className="hidden md:inline-flex border-destructive/50 text-destructive hover:bg-destructive/10"
                                  onClick={() => setShowBreakFastConfirm(true)}
                                >
                                  <Sunset className="w-4 h-4" />
                                  Break fast
                                </Button>
                              )}
                              </div>
                            </div>
                          )}
                          {todaySkipped && (
                            <span className="text-sm text-muted-foreground">I didn&apos;t fast today</span>
                          )}
                          <Link
                            to="/dashboard"
                            className="text-xs text-secondary hover:underline inline-flex items-center gap-1 mt-1"
                          >
                            See today&apos;s progress and checklist on Dashboard
                          </Link>
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
                      onSelectReason={(reasonId, brokeAt) => {
                        breakFastingToday(progress, setProgress, reasonId, todayStr, brokeAt);
                        setShowBreakFastDialog(false);
                        toast.success("Fast logged as broken");
                      }}
                      userType={preferences?.userType}
                      notInFastingPeriod={!isFasting}
                    />

                    {/* Eating cutoff & break fast — prominent; when no location show CTA so panel has content */}
                    {effectiveSelectedDayPrayerTimes ? (
                      <div className="rounded-xl bg-secondary/10 border-2 border-secondary/20 p-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide" title={EATING_TIME_TITLE.suhoorEnd}>Eating cutoff (Suhoor end)</p>
                          <p className="font-mono text-lg font-bold text-secondary tabular-nums">{effectiveSelectedDayPrayerTimes.fajr || "—"}</p>
                        </div>
                        <div>
                          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide" title={EATING_TIME_TITLE.iftarTime}>Break fast ({iftarLabelShort})</p>
                          <p className="font-mono text-lg font-bold text-secondary tabular-nums">{effectiveSelectedDayPrayerTimes.maghrib || "—"}</p>
                        </div>
                        {getFastingHoursForDay(effectiveSelectedDayPrayerTimes.fajr, effectiveSelectedDayPrayerTimes.maghrib) != null && (
                          <div className="sm:col-span-2">
                            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Total fasting hours (this day)</p>
                            <p className="font-mono text-lg font-bold text-secondary tabular-nums">
                              {getFastingHoursForDay(effectiveSelectedDayPrayerTimes.fajr, effectiveSelectedDayPrayerTimes.maghrib)}h
                            </p>
                          </div>
                        )}
                        <div className="sm:col-span-2 flex flex-wrap gap-2">
                          <Button variant="outline" size="sm" onClick={copySelectedDayTimes} className="gap-2" aria-label="Copy eating cutoff and break fast times to clipboard">
                            <Copy className="w-4 h-4" />
                            Copy times
                          </Button>
                          <Button variant="outline" size="sm" onClick={copyAsReminder} className="gap-2" aria-label="Copy as reminder text for Suhoor and Iftar">
                            <Clock className="w-4 h-4" />
                            Copy as reminder
                          </Button>
                        </div>
                        {selectedDate && (prayerTimeOverrides[selectedDate]?.fajr != null || prayerTimeOverrides[selectedDate]?.maghrib != null) && (
                          <div className="sm:col-span-2 flex gap-2 items-end flex-wrap">
                            <Label htmlFor="override-fajr" className="text-xs w-full sm:w-auto">Override Fajr</Label>
                            <input
                              id="override-fajr"
                              type="time"
                              value={prayerTimeOverrides[selectedDate]?.fajr ?? ""}
                              onChange={(e) => setOverrideForDate(selectedDate, "fajr", e.target.value)}
                              className="h-9 px-2 rounded-md border border-border bg-background text-sm"
                            />
                            <Label htmlFor="override-maghrib" className="text-xs w-full sm:w-auto">Override Maghrib</Label>
                            <input
                              id="override-maghrib"
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
                                  const { fajr: _, maghrib: __, ...rest } = day;
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
                        {selectedDate && !prayerTimeOverrides[selectedDate]?.fajr && !prayerTimeOverrides[selectedDate]?.maghrib && (
                          <div className="sm:col-span-2">
                            <Button variant="outline" size="sm" onClick={() => setPrayerTimeOverrides((prev) => ({ ...prev, [selectedDate]: { ...(prev[selectedDate] ?? {}), fajr: effectiveSelectedDayPrayerTimes?.fajr ?? "", maghrib: effectiveSelectedDayPrayerTimes?.maghrib ?? "" } }))}>
                              Override times for this day
                            </Button>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="rounded-xl border border-border bg-muted/30 p-4">
                        <LocationRequiredCTA message="Set your location to see eating cutoff and break-fast times for this day." compact />
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
                              ? (() => {
                                  const reason = getBrokenReasonLabel(selectedFastingLog.brokenReason);
                                  const atTime = selectedFastingLog.completedAt
                                    ? new Date(selectedFastingLog.completedAt).toLocaleTimeString("en", { hour: "numeric", minute: "2-digit", hour12: true })
                                    : "";
                                  const hours = selectedFastingLog.hoursFasted != null ? `${selectedFastingLog.hoursFasted}h fasted` : "";
                                  return `Broke fast${atTime ? ` at ${atTime}` : ""} — ${reason}${hours ? `. ${hours}` : ""}`;
                                })()
                              : selectedFastingLog?.startedAt
                                ? "Started fasting (not completed)"
                                : "No fast logged"}
                          {selectedFastingLog && effectiveSelectedDayPrayerTimes && (() => {
                            const imsakStr = effectiveSelectedDayPrayerTimes.fajr;
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
                              disabled={selectedDate === todayStr && scheduleMarkTodayCompleteDisabled}
                              onClick={() => {
                                if (selectedDate === todayStr && scheduleMarkTodayCompleteDisabled) {
                                  toast.info(scheduleMarkTodayComplete.toastMessage);
                                  return;
                                }
                                toggleCompleted(selectedDate!);
                              }}
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
                      <div className="flex flex-wrap gap-1.5 mb-2 items-center">
                        {preferences?.userType === "muslim" && (
                          <Button
                            type="button"
                            variant="secondary"
                            size="sm"
                            className="text-xs h-8"
                            onClick={quickAddAllPrayers}
                            disabled={!effectiveSelectedDayPrayerTimes}
                          >
                            Quick add all prayers
                          </Button>
                        )}
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
                          aria-label="Custom event title"
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
                                    aria-label="Duration (minutes)"
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
                    {effectiveSelectedDayPrayerTimes?.fajr != null && effectiveSelectedDayPrayerTimes?.maghrib != null && (
                      <div className="rounded-xl border border-border bg-card p-3 space-y-2">
                        <p className="text-xs font-medium text-muted-foreground">Meals & times</p>
                        <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm">
                          <span className="flex items-center gap-2">
                            <span className="font-mono text-secondary shrink-0">{effectiveSelectedDayPrayerTimes.fajr.split(" ")[0]}</span>
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
                              ? `Type short notes or use “Add from recipe” to pick recipes for Suhoor and ${iftarLabel}. Items are added to the food log below with portions and calories.`
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
                        <div className="space-y-1.5">
                          <div className="flex flex-wrap items-center gap-2">
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
                              placeholder={canEditMealPlan ? "e.g. Oats & dates or add from recipe" : "Nothing planned"}
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
                              className="bg-background flex-1 min-w-[140px]"
                              aria-label={canEditMealPlan ? "Suhoor meal plan" : "Suhoor (past day, read-only)"}
                            />
                            {canEditMealPlan && (
                              <Select
                                open={recipeSelectOpen === "mealplan-suhoor"}
                                onOpenChange={(open) => setRecipeSelectOpen(open ? "mealplan-suhoor" : null)}
                                onValueChange={(v) => { addFoodFromRecipe("suhoor", v); setRecipeSelectOpen(null); }}
                                value=""
                              >
                                <SelectTrigger className="w-[180px] h-9 shrink-0" aria-label="Add Suhoor recipe">
                                  <SelectValue placeholder="Add from recipe…" />
                                </SelectTrigger>
                                <SelectContent>
                                  {allRecipesForPicker
                                    .filter((r) => r.mealType === "suhoor")
                                    .map(({ recipe, mealType }) => (
                                      <SelectItem key={`${mealType}-${recipe.id}`} value={`${mealType}-${recipe.id}`}>
                                        {recipe.name} ({recipe.nutrition?.calories ?? "?"} cal)
                                      </SelectItem>
                                    ))}
                                </SelectContent>
                              </Select>
                            )}
                          </div>
                          <div className="flex flex-wrap items-center gap-2">
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
                              placeholder={canEditMealPlan ? `e.g. Harira & dates or add from recipe` : "Nothing planned"}
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
                              className="bg-background flex-1 min-w-[140px]"
                              aria-label={canEditMealPlan ? `${iftarLabel} meal plan` : `${iftarLabel} (past day, read-only)`}
                            />
                            {canEditMealPlan && (
                              <Select
                                open={recipeSelectOpen === "mealplan-iftar"}
                                onOpenChange={(open) => setRecipeSelectOpen(open ? "mealplan-iftar" : null)}
                                onValueChange={(v) => { addFoodFromRecipe("iftar", v); setRecipeSelectOpen(null); }}
                                value=""
                              >
                                <SelectTrigger className="w-[180px] h-9 shrink-0" aria-label={`Add ${iftarLabel} recipe`}>
                                  <SelectValue placeholder="Add from recipe…" />
                                </SelectTrigger>
                                <SelectContent>
                                  {allRecipesForPicker
                                    .filter((r) => r.mealType === "iftar")
                                    .map(({ recipe, mealType }) => (
                                      <SelectItem key={`${mealType}-${recipe.id}`} value={`${mealType}-${recipe.id}`}>
                                        {recipe.name} ({recipe.nutrition?.calories ?? "?"} cal)
                                      </SelectItem>
                                    ))}
                                </SelectContent>
                              </Select>
                            )}
                          </div>
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
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={copyMealsToThisWeek}
                                className="gap-1"
                              >
                                Copy to this week
                              </Button>
                              {selectedIsRamadan && (
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  onClick={copyMealsToRemainingRamadan}
                                  className="gap-1"
                                >
                                  Copy to rest of Ramadan
                                </Button>
                              )}
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => setCopyMealsToSelectedOpen(true)}
                                className="gap-1"
                              >
                                Copy to selected days…
                              </Button>
                            </>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Plan the rest of days: quick jump + copy this plan to remaining / by weekday / Sunnah */}
                    {selectedDate && remainingRamadanDates.length > 0 && (selectedDayMeals?.suhoor || selectedDayMeals?.iftar) && (
                      <div className="rounded-xl border border-border bg-background/50 p-3 space-y-3">
                        <p className="text-xs font-medium text-muted-foreground">Plan the rest of days</p>
                        <p className="text-xs text-muted-foreground">
                          Jump to a day or copy this day&apos;s meal plan to multiple days (by weekday or all remaining).
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {remainingRamadanDates.slice(0, 14).map(({ dayNum, dateStr }) => (
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
                          {remainingRamadanDates.length > 14 && (
                            <span className="px-2 py-1.5 text-xs text-muted-foreground">+{remainingRamadanDates.length - 14} more</span>
                          )}
                        </div>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setCopyMealsToSelectedOpen(true);
                            setCopyToSelectedDates(new Set());
                          }}
                          className="gap-1 w-full sm:w-auto"
                        >
                          <Copy className="w-3.5 h-3.5" />
                          Copy this plan to selected days…
                        </Button>
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
                      {(selectedDayFoodLog?.suhoor?.length ?? 0) === 0 && (selectedDayFoodLog?.iftar?.length ?? 0) === 0 && (
                        <p className="text-xs text-muted-foreground mb-2">
                          Log your first meal. <Link to="/guides/meals-recipes" className="text-secondary hover:underline inline-flex items-center gap-1"><BookOpen className="w-3 h-3 shrink-0" aria-hidden />Meals guide</Link>
                        </p>
                      )}

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
                                  open={recipeSelectOpen === "foodlog"}
                                  onOpenChange={(open) => setRecipeSelectOpen(open ? "foodlog" : null)}
                                  onValueChange={(v) => { addFoodFromRecipe(addFoodMeal, v); setRecipeSelectOpen(null); }}
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
                                <div className="relative">
                                  <Input
                                    placeholder="Name"
                                    className="w-28 h-9"
                                    value={addFoodCustomInputs.name}
                                    onChange={(e) => setAddFoodCustomInputs((c) => ({ ...c, name: e.target.value }))}
                                    autoComplete="off"
                                  />
                                  {scheduleAddFoodSuggestions.recipes.length > 0 || scheduleAddFoodSuggestions.foods.length > 0 ? (
                                    <ul className="absolute top-full left-0 mt-0.5 rounded-lg border border-border bg-background shadow-lg max-h-40 overflow-auto z-20 min-w-[180px]" role="listbox" aria-label="Recipe and food suggestions">
                                      {scheduleAddFoodSuggestions.recipes.map(({ mealType, recipe }) => (
                                        <li key={`${mealType}-${recipe.id}`}>
                                          <button
                                            type="button"
                                            onClick={() => {
                                              addFoodFromRecipe(addFoodMeal, `${mealType}-${recipe.id}`);
                                              setAddFoodCustomInputs({ name: "", cal: "", portions: "1", protein: "", carbs: "", fat: "", imageDataUrl: "" });
                                            }}
                                            className="w-full text-left px-3 py-2 text-sm hover:bg-muted flex items-center justify-between gap-2"
                                          >
                                            <span>{recipe.name}</span>
                                            <span className="text-xs text-muted-foreground">{recipe.nutrition?.calories ?? "?"} cal</span>
                                          </button>
                                        </li>
                                      ))}
                                      {scheduleAddFoodSuggestions.foods.map((f) => (
                                        <li key={f}>
                                          <button
                                            type="button"
                                            onClick={() => setAddFoodCustomInputs((c) => ({ ...c, name: f }))}
                                            className="w-full text-left px-3 py-2 text-sm hover:bg-muted"
                                          >
                                            {f}
                                          </button>
                                        </li>
                                      ))}
                                    </ul>
                                  ) : null}
                                </div>
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

            {/* When no day selected, prompt to click with quick actions */}
            {!selectedDate && (
              <div className="mt-6 p-4 sm:p-5 rounded-2xl bg-muted/50 border border-border space-y-3">
                <p className="text-sm text-center text-muted-foreground">
                  Click a day in the calendar above to view meal plan, food log, fasting actions, and notes.
                </p>
                <div className="flex flex-wrap gap-2 justify-center">
                  <Button variant="outline" size="sm" onClick={goToToday} className="gap-2">
                    <CalendarDays className="w-4 h-4" />
                    Jump to today
                  </Button>
                  <Button variant="outline" size="sm" onClick={goToRamadan} className="gap-2">
                    <CalendarDays className="w-4 h-4" />
                    Jump to Ramadan
                  </Button>
                </div>
              </div>
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

      {/* Catch up on past days */}
      <CatchUpDialog open={catchUpOpen} onOpenChange={setCatchUpOpen} todayStr={todayStr} />

      {/* Copy meals from another day */}
      <Dialog open={copyMealsFromOpen} onOpenChange={setCopyMealsFromOpen}>
        <DialogContent className="max-w-sm">
          <DialogTitle>Copy meals from another day</DialogTitle>
          <p className="text-xs text-muted-foreground mb-3">
            Copy that day&apos;s Suhoor and {iftarLabel} plan to the currently selected day ({selectedDate}). Meal planning is for today and future days only.
          </p>
          <ul className="space-y-1 max-h-60 overflow-auto">
            {(() => {
              const todayDate = new Date(todayStr + "T12:00:00");
              const yesterday = new Date(todayDate);
              yesterday.setDate(yesterday.getDate() - 1);
              const yesterdayStr = toLocalDateString(yesterday);
              const ramadanStart = ramadanRange.startStr ?? toLocalDateString(ramadanRange.start);
              const ramadanEnd = ramadanRange.endStr ?? toLocalDateString(ramadanRange.end);
              const options: { label: string; dateStr: string; sortKey: number }[] = [];
              for (let i = 0; i <= 13; i++) {
                const d = new Date(todayDate);
                d.setDate(d.getDate() - i);
                const dateStr = toLocalDateString(d);
                const dayNum = ramadanRange.getRamadanDayNumber(d);
                const label = dayNum != null
                  ? `Ramadan Day ${dayNum} (${dateStr})`
                  : i === 0 ? `Today (${dateStr})` : i === 1 ? `Yesterday (${dateStr})` : dateStr;
                options.push({ label, dateStr, sortKey: i });
              }
              const ramadanDays = Array.from({ length: 30 }, (_, i) => {
                const d = new Date(ramadanStart + "T12:00:00");
                d.setDate(d.getDate() + i);
                const dateStr = toLocalDateString(d);
                if (dateStr > todayStr) return null;
                return { label: `Ramadan Day ${i + 1} (${dateStr})`, dateStr, sortKey: 100 + i };
              }).filter(Boolean) as { label: string; dateStr: string; sortKey: number }[];
              const allOptions = [...options];
              ramadanDays.forEach((r) => {
                if (!allOptions.some((o) => o.dateStr === r.dateStr)) allOptions.push(r);
              });
              const withMeals = allOptions
                .filter((o) => mealPlans[o.dateStr]?.suhoor || mealPlans[o.dateStr]?.iftar)
                .sort((a, b) => new Date(b.dateStr).getTime() - new Date(a.dateStr).getTime());
              if (withMeals.length === 0) {
                return (
                  <li className="text-sm text-muted-foreground py-4 text-center">
                    No days with meals planned yet. Plan meals on another day first, then copy here.
                  </li>
                );
              }
              return withMeals.map(({ label, dateStr }) => (
                <li key={dateStr}>
                  <button
                    type="button"
                    onClick={() => copyMealsFromDay(dateStr)}
                    className="w-full text-left px-3 py-2 rounded-lg text-sm transition-colors hover:bg-muted"
                  >
                    {label}
                  </button>
                </li>
              ));
            })()}
          </ul>
        </DialogContent>
      </Dialog>

      {/* Copy to selected days: plan by day type (weekday, Sunnah) or select all / rest of Ramadan */}
      <Dialog
        open={copyMealsToSelectedOpen}
        onOpenChange={(open) => {
          if (!open) setCopyToSelectedDates(new Set());
          setCopyMealsToSelectedOpen(open);
        }}
      >
        <DialogContent className="max-w-sm max-h-[90vh] flex flex-col">
          <DialogTitle>Copy meals to selected days</DialogTitle>
          <p className="text-xs text-muted-foreground mb-3">
            Copy this day&apos;s meal plan to the days you check below. Only today and future days are applied. Use quick-select to apply by calendar day type (e.g. all Mondays in Ramadan).
          </p>
          {(() => {
            // Candidate range: today through end of Ramadan (when Ramadan is current/future), else next 30 days. Ramadan range from preferences (localStorage).
            const ramadanEnd = ramadanRange.end ? new Date(ramadanRange.end) : null;
            const todayDate = new Date(todayStr + "T12:00:00");
            const fallbackEnd = new Date(todayDate);
            fallbackEnd.setDate(fallbackEnd.getDate() + 29);
            const endDate =
              ramadanEnd && ramadanEnd >= todayDate ? ramadanEnd : fallbackEnd;
            const candidateDates: string[] = [];
            for (const d = new Date(todayDate); d <= endDate; d.setDate(d.getDate() + 1)) {
              candidateDates.push(toLocalDateString(d));
            }
            const voluntary = preferences.voluntaryFasting ?? [];
            const participatesSunnahMonThu = voluntary.includes("monday-thursday");
            const weekdayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
            const selectByWeekday = (weekday: number) => {
              const set = new Set(candidateDates.filter((str) => new Date(str + "T12:00:00").getDay() === weekday));
              setCopyToSelectedDates(set);
            };
            const selectRestOfRamadan = () => setCopyToSelectedDates(new Set(candidateDates));
            const selectSunnahDays = () => {
              const set = new Set(candidateDates.filter((str) => {
                const day = new Date(str + "T12:00:00").getDay();
                return day === 1 || day === 4;
              }));
              setCopyToSelectedDates(set);
            };
            const toggle = (dateStr: string) => {
              setCopyToSelectedDates((prev) => {
                const next = new Set(prev);
                if (next.has(dateStr)) next.delete(dateStr);
                else next.add(dateStr);
                return next;
              });
            };
            const selectAll = () => setCopyToSelectedDates(new Set(candidateDates));
            const clearAll = () => setCopyToSelectedDates(new Set());
            return (
              <>
                <div className="flex flex-wrap gap-1.5 mb-2">
                  <Button type="button" variant="outline" size="sm" onClick={selectAll} className="text-xs">Select all</Button>
                  <Button type="button" variant="outline" size="sm" onClick={selectRestOfRamadan} className="text-xs">Rest of Ramadan</Button>
                  <Button type="button" variant="outline" size="sm" onClick={clearAll} className="text-xs">Clear</Button>
                  {participatesSunnahMonThu && (
                    <Button type="button" variant="outline" size="sm" onClick={selectSunnahDays} className="text-xs">Sunnah (Mon/Thu)</Button>
                  )}
                </div>
                <p className="text-[10px] text-muted-foreground mb-1">By weekday (same schedule for that day type):</p>
                <div className="flex flex-wrap gap-1 mb-2">
                  {[0, 1, 2, 3, 4, 5, 6].map((wd) => (
                    <Button key={wd} type="button" variant="ghost" size="sm" onClick={() => selectByWeekday(wd)} className="text-xs h-7 px-2">
                      {weekdayNames[wd]}
                    </Button>
                  ))}
                </div>
                <ul className="space-y-1 max-h-48 overflow-auto border rounded-lg p-2 flex-1 min-h-0">
                  {candidateDates.length === 0 ? (
                    <li className="text-sm text-muted-foreground py-2 text-center">No days in range.</li>
                  ) : (
                    candidateDates.map((dateStr) => {
                      const dayNum = ramadanRange.getRamadanDayNumber(new Date(dateStr + "T12:00:00"));
                      const wd = new Date(dateStr + "T12:00:00").getDay();
                      const label = dayNum != null ? `Day ${dayNum} · ${weekdayNames[wd]} ${dateStr}` : `${weekdayNames[wd]} ${dateStr}`;
                      return (
                        <li key={dateStr}>
                          <label className="flex items-center gap-2 cursor-pointer py-1 rounded hover:bg-muted/50 px-2">
                            <input
                              type="checkbox"
                              checked={copyToSelectedDates.has(dateStr)}
                              onChange={() => toggle(dateStr)}
                              className="rounded border-input"
                              aria-label={`Select ${dateStr}`}
                            />
                            <span className="text-sm">{label}</span>
                          </label>
                        </li>
                      );
                    })
                  )}
                </ul>
                <div className="flex justify-end gap-2 pt-2 shrink-0">
                  <Button type="button" variant="outline" onClick={() => setCopyMealsToSelectedOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="button" onClick={copyMealsToSelectedDays}>
                    Apply to {copyToSelectedDates.size} day{copyToSelectedDates.size !== 1 ? "s" : ""}
                  </Button>
                </div>
              </>
            );
          })()}
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
};

export default DashboardSchedule;
