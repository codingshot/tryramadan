import { useState, useMemo, useEffect } from "react";
import { motion } from "framer-motion";
import { Link, useSearchParams } from "react-router-dom";
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Plus,
  Sunrise,
  Sunset,
  UtensilsCrossed,
  Target,
  Flame,
  Calendar,
  X,
  Trash2,
  ImagePlus,
  LayoutList,
  Grid3X3,
  TrendingUp,
} from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { PageSEO } from "@/components/PageSEO";
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
  useDailyGoals,
  useUserPreferences,
  getRecommendedCaloriesFromPreferences,
  getRecommendedCaloriesExplanation,
  useDayPlannedItems,
  useDayFoodLog,
  useFastingProgress,
  getDayTotalsFromPlanned,
  getDayTotalsFromFoodLog,
  normalizeDayFoodLog,
  clampCalories,
  useDisplayTimezone,
  getBrokenReasonLabel,
  type MealCategory,
  type PlannedItem,
  type FoodLogEntry,
} from "@/hooks/useLocalStorage";
import { getTodayStringInTimezone, toLocalDateString } from "@/lib/utils";
import recipesData from "@/data/recipes.json";
import { parseNutrient, getAllCountries, getRecipe, type MealType } from "@/lib/cultureRecipes";
import { resizeImageToDataUrl } from "@/lib/foodImage";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { toast } from "sonner";

const MEAL_LABELS: Record<MealCategory, { label: string; Icon: typeof Sunrise }> = {
  suhoor: { label: "Suhoor (morning)", Icon: Sunrise },
  iftar: { label: "Iftar (evening)", Icon: Sunset },
  between: { label: "Between meals", Icon: UtensilsCrossed },
};

type RecipeOption = { mealType: "suhoor" | "iftar"; id: number; name: string; calories: number; protein: number; carbs: number; fat: number };

function buildRecipeOptions(): RecipeOption[] {
  const data = recipesData as { suhoor: Array<{ id: number; name: string; nutrition?: { calories: number; protein?: string; carbs?: string; fat?: string } }>; iftar: Array<{ id: number; name: string; nutrition?: { calories: number; protein?: string; carbs?: string; fat?: string } }> };
  const suhoor = (data.suhoor ?? []).map((r) => ({
    mealType: "suhoor" as const,
    id: r.id,
    name: r.name,
    calories: r.nutrition?.calories ?? 0,
    protein: parseNutrient(r.nutrition?.protein) ?? 0,
    carbs: parseNutrient(r.nutrition?.carbs) ?? 0,
    fat: parseNutrient(r.nutrition?.fat) ?? 0,
  }));
  const iftar = (data.iftar ?? []).map((r) => ({
    mealType: "iftar" as const,
    id: r.id,
    name: r.name,
    calories: r.nutrition?.calories ?? 0,
    protein: parseNutrient(r.nutrition?.protein) ?? 0,
    carbs: parseNutrient(r.nutrition?.carbs) ?? 0,
    fat: parseNutrient(r.nutrition?.fat) ?? 0,
  }));
  return [...suhoor, ...iftar];
}

function MacroBar({ current, goal, label }: { current: number; goal: number; label: string }) {
  const pct = goal > 0 ? Math.min(100, (current / goal) * 100) : 0;
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-medium">{Math.round(current)} / {goal}</span>
      </div>
      <div className="h-2 bg-muted rounded-full overflow-hidden">
        <div
          className="h-full bg-secondary rounded-full transition-all"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

function isValidDateString(s: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(s)) return false;
  const d = new Date(s + "T12:00:00");
  return !isNaN(d.getTime()) && d.toISOString().startsWith(s);
}

export default function DashboardMacros() {
  const [searchParams, setSearchParams] = useSearchParams();
  const displayTimezone = useDisplayTimezone();
  const todayStr = displayTimezone ? getTodayStringInTimezone(displayTimezone) : toLocalDateString(new Date());
  const dateFromUrl = searchParams.get("date");
  const initialDate = dateFromUrl && isValidDateString(dateFromUrl) ? dateFromUrl : todayStr;
  const [selectedDate, setSelectedDate] = useState(initialDate);
  const [preferences] = useUserPreferences();

  useEffect(() => {
    const next = dateFromUrl && isValidDateString(dateFromUrl) ? dateFromUrl : todayStr;
    setSelectedDate(next);
  }, [dateFromUrl, todayStr]);

  const setSelectedDateAndUrl = (dateStr: string) => {
    setSelectedDate(dateStr);
    setSearchParams(dateStr === todayStr ? {} : { date: dateStr }, { replace: true });
  };
  const [dailyGoals, setDailyGoals] = useDailyGoals();
  const [planned, setPlanned] = useDayPlannedItems();
  const [foodLogs, setFoodLogs] = useDayFoodLog();
  const [progress] = useFastingProgress();
  const recommendedCal = getRecommendedCaloriesFromPreferences(preferences);

  /** Fasting status for the selected day (for display on macro tracker). */
  const selectedDayFastingStatus = useMemo(() => {
    const date = selectedDate;
    if ((progress.completedDays ?? []).includes(date)) return "completed";
    if ((progress.skippedDays ?? []).includes(date)) return "skipped";
    const logEntry = (progress.fastingLog ?? []).find((e) => e.date === date);
    if (logEntry?.status === "broken") return "broken";
    if (logEntry?.status === "in_progress") return "in_progress";
    return null;
  }, [progress.completedDays, progress.skippedDays, progress.fastingLog, selectedDate]);
  const hasRecommendation = preferences.sexForCalories != null || (preferences.bodyWeightKg != null && preferences.bodyWeightKg > 0);
  const canUseRecommended = hasRecommendation && recommendedCal !== dailyGoals.calories;

  const selectedPlanned = planned[selectedDate] ?? { suhoor: [], iftar: [], between: [] };
  const selectedLog = normalizeDayFoodLog(foodLogs[selectedDate]);
  const plannedTotals = getDayTotalsFromPlanned(selectedPlanned);
  const actualTotals = getDayTotalsFromFoodLog(foodLogs[selectedDate]);

  const [planForm, setPlanForm] = useState({
    mealType: "suhoor" as MealCategory,
    name: "",
    cal: "",
    protein: "",
    carbs: "",
    fat: "",
    portions: "1",
  });
  const [logForm, setLogForm] = useState<{
    active: boolean;
    mealType: MealCategory;
    name: string;
    cal: string;
    protein: string;
    carbs: string;
    fat: string;
    portions: string;
    imageDataUrl: string;
  }>({ active: false, mealType: "suhoor", name: "", cal: "", protein: "", carbs: "", fat: "", portions: "1", imageDataUrl: "" });
  const [selectedRecipe, setSelectedRecipe] = useState<{ mealType: "suhoor" | "iftar"; id: number } | null>(null);
  const [mealHistoryView, setMealHistoryView] = useState<"list" | "feed">("list");
  const [imageResizing, setImageResizing] = useState(false);

  const recipeOptions = useMemo(() => buildRecipeOptions(), []);
  const macrosCulturalFoods = useMemo(() => [...new Set(getAllCountries().flatMap((c) => c.foods ?? []))].filter(Boolean), []);
  const macrosLogFormSuggestions = useMemo(() => {
    if (!logForm.active) return { recipes: [], foods: [] };
    const q = logForm.name.trim().toLowerCase();
    if (!q || q.length < 1) return { recipes: [], foods: [] };
    const mt = logForm.mealType;
    const recipes = recipeOptions
      .filter((r) => (mt === "between" || r.mealType === mt) && r.name.toLowerCase().includes(q))
      .slice(0, 6);
    const foods = macrosCulturalFoods
      .filter((f) => f.toLowerCase().includes(q) && !recipes.some((r) => r.name.toLowerCase() === f.toLowerCase()))
      .slice(0, 4);
    return { recipes, foods };
  }, [logForm.active, logForm.mealType, logForm.name, recipeOptions, macrosCulturalFoods]);

  /** All log entries across all days, newest first, for meal history. */
  const mealHistoryEntries = useMemo(() => {
    const out: { dateStr: string; mealType: MealCategory; entry: FoodLogEntry }[] = [];
    Object.keys(foodLogs).sort().reverse().forEach((dateStr) => {
      const day = normalizeDayFoodLog(foodLogs[dateStr]);
      (["suhoor", "iftar", "between"] as const).forEach((mealType) => {
        (day[mealType] ?? []).forEach((entry) => out.push({ dateStr, mealType, entry }));
      });
    });
    return out;
  }, [foodLogs]);

  const mealHistoryWithImages = useMemo(() => mealHistoryEntries.filter((x) => x.entry.imageDataUrl), [mealHistoryEntries]);

  /** Recent fasting log entries (last 14), newest first, for fasting history block. */
  const recentFastingLog = useMemo(
    () => (progress.fastingLog ?? []).slice(-14).reverse(),
    [progress.fastingLog]
  );

  const addPlanned = () => {
    const name = planForm.name.trim() || "Planned item";
    const cal = parseInt(planForm.cal, 10) || 0;
    const portions = Math.max(0.1, parseFloat(planForm.portions) || 1);
    const protein = parseFloat(planForm.protein) || 0;
    const carbs = parseFloat(planForm.carbs) || 0;
    const fat = parseFloat(planForm.fat) || 0;
    const mealType = planForm.mealType;
    const item: PlannedItem = {
      id: `plan-${Date.now()}`,
      mealType,
      name,
      portions,
      caloriesPerPortion: clampCalories(cal),
      proteinPerPortion: protein || undefined,
      carbsPerPortion: carbs || undefined,
      fatPerPortion: fat || undefined,
    };
    const day = selectedPlanned;
    const list = [...(day[mealType] ?? []), item];
    setPlanned((prev) => ({
      ...prev,
      [selectedDate]: { ...day, [mealType]: list },
    }));
    setPlanForm({ ...planForm, name: "", cal: "", protein: "", carbs: "", fat: "", portions: "1" });
  };

  const removePlanned = (mealType: MealCategory, id: string) => {
    const day = selectedPlanned;
    const list = (day[mealType] ?? []).filter((i) => i.id !== id);
    setPlanned((prev) => ({
      ...prev,
      [selectedDate]: { ...day, [mealType]: list },
    }));
  };

  const addToLog = () => {
    if (!logForm.active) return;
    const portions = Math.max(0.1, parseFloat(logForm.portions) || 1);
    const mealType = logForm.mealType;

    let entry: FoodLogEntry;
    if (selectedRecipe) {
      const recipe = recipeOptions.find((r) => r.mealType === selectedRecipe.mealType && r.id === selectedRecipe.id);
      if (!recipe) {
        setSelectedRecipe(null);
        return;
      }
      entry = {
        id: `log-${Date.now()}`,
        type: "recipe",
        mealType,
        name: recipe.name,
        portions,
        caloriesPerPortion: clampCalories(recipe.calories),
        proteinPerPortion: recipe.protein || undefined,
        carbsPerPortion: recipe.carbs || undefined,
        fatPerPortion: recipe.fat || undefined,
        recipeId: `${selectedRecipe.mealType}-${selectedRecipe.id}`,
        ...(logForm.imageDataUrl ? { imageDataUrl: logForm.imageDataUrl } : {}),
      };
    } else {
      const name = logForm.name.trim() || "Logged item";
      const cal = parseInt(logForm.cal, 10) || 0;
      const protein = parseFloat(logForm.protein) || 0;
      const carbs = parseFloat(logForm.carbs) || 0;
      const fat = parseFloat(logForm.fat) || 0;
      entry = {
        id: `log-${Date.now()}`,
        type: "custom",
        mealType,
        name,
        portions,
        caloriesPerPortion: clampCalories(cal),
        proteinPerPortion: protein || undefined,
        carbsPerPortion: carbs || undefined,
        fatPerPortion: fat || undefined,
        ...(logForm.imageDataUrl ? { imageDataUrl: logForm.imageDataUrl } : {}),
      };
    }

    const day = selectedLog;
    const list = [...(day[mealType] ?? []), entry];
    setFoodLogs((prev) => ({
      ...prev,
      [selectedDate]: { ...day, [mealType]: list },
    }));
    setLogForm({ ...logForm, active: false, name: "", cal: "", protein: "", carbs: "", fat: "", portions: "1", imageDataUrl: "" });
    setSelectedRecipe(null);
    toast.success("Added to log");
  };

  const removeFromLog = (mealType: MealCategory, id: string) => {
    const day = selectedLog;
    const list = (day[mealType] ?? []).filter((e) => e.id !== id);
    setFoodLogs((prev) => ({
      ...prev,
      [selectedDate]: { ...day, [mealType]: list },
    }));
  };

  const setPortions = (mealType: MealCategory, id: string, portions: number) => {
    const day = selectedLog;
    const list = (day[mealType] ?? []).map((e) =>
      e.id === id ? { ...e, portions: Math.max(0.1, portions) } : e
    );
    setFoodLogs((prev) => ({ ...prev, [selectedDate]: { ...day, [mealType]: list } }));
  };

  const goPrevDay = () => {
    const d = new Date(selectedDate + "T12:00:00");
    d.setDate(d.getDate() - 1);
    setSelectedDateAndUrl(d.toISOString().split("T")[0]);
  };
  const goNextDay = () => {
    const d = new Date(selectedDate + "T12:00:00");
    d.setDate(d.getDate() + 1);
    setSelectedDateAndUrl(d.toISOString().split("T")[0]);
  };
  const isToday = selectedDate === todayStr;
  const selectedDateObj = new Date(selectedDate + "T12:00:00");

  return (
    <div className="min-h-screen bg-background">
      <PageSEO
        title="Macro Tracker | TryRamadan.app"
        description="Plan meals and track macros: planned vs actual food, daily goals, Suhoor, Iftar, and between meals."
        path="/dashboard/macros"
      />
      <Navbar />
      <main id="main-content" className="main-content">
        <div className="container mx-auto px-4 max-w-3xl min-w-0">
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 min-h-[44px] items-center"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </Link>

          <motion.header
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6"
          >
            <h1 className="text-2xl sm:text-3xl font-display font-bold flex items-center gap-2">
              <Target className="w-8 h-8 text-secondary" />
              Macro Tracker
            </h1>
            <p className="text-muted-foreground mt-1">
              Plan meals for the day, log what you eat, and compare to your goals. Quick add Suhoor, Iftar, or between meals.
            </p>
          </motion.header>

          {/* Day selector + fasting status for this day */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="mb-6 space-y-2"
          >
            <div className="flex items-center justify-between gap-4 p-3 rounded-2xl bg-card border border-border">
              <Button variant="outline" size="icon" onClick={goPrevDay} aria-label="Previous day">
                <ChevronLeft className="w-5 h-5" />
              </Button>
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-secondary" />
                <span className="font-semibold">
                  {selectedDateObj.toLocaleDateString("en", { weekday: "short", month: "short", day: "numeric", year: "numeric" })}
                  {isToday && " (Today)"}
                </span>
              </div>
              <Button variant="outline" size="icon" onClick={goNextDay} aria-label="Next day">
                <ChevronRight className="w-5 h-5" />
              </Button>
            </div>
            <div className="flex flex-wrap items-center gap-2 px-3 py-2 rounded-xl bg-muted/30 border border-border text-sm">
              <span className="text-muted-foreground">Fasting this day:</span>
              {selectedDayFastingStatus === "completed" && (
                <span className="px-2 py-0.5 rounded-full bg-secondary/20 text-secondary font-medium">Completed</span>
              )}
              {selectedDayFastingStatus === "skipped" && (
                <span className="px-2 py-0.5 rounded-full bg-muted text-muted-foreground font-medium">Skipped</span>
              )}
              {selectedDayFastingStatus === "broken" && (
                <span className="px-2 py-0.5 rounded-full bg-destructive/20 text-destructive font-medium">Broken</span>
              )}
              {selectedDayFastingStatus === "in_progress" && (
                <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-700 dark:text-amber-400 font-medium">In progress</span>
              )}
              {selectedDayFastingStatus == null && (
                <span className="text-muted-foreground">Not logged</span>
              )}
              <Link to="/dashboard/schedule" className="text-xs text-secondary hover:underline ml-auto">Set on Schedule →</Link>
            </div>
          </motion.div>

          {/* Daily goals */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.08 }}
            className="mb-6 p-4 rounded-2xl bg-card border border-border"
          >
            <h2 className="font-display font-bold mb-3 flex items-center gap-2">
              <Target className="w-5 h-5 text-secondary" />
              Daily goals
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
              <div>
                <span className="text-muted-foreground">Calories</span>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Link
                      to="/settings#daily-calorie-goal"
                      className="block font-bold text-foreground hover:text-secondary hover:underline cursor-pointer border-b border-dotted border-transparent hover:border-secondary/50 w-fit focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded"
                      aria-label="How we got this goal (click to change in Settings)"
                    >
                      {dailyGoals.calories}
                    </Link>
                  </TooltipTrigger>
                  <TooltipContent side="bottom" className="max-w-xs p-3">
                    <p className="font-medium text-sm mb-1">How we got this goal</p>
                    <p className="text-xs text-muted-foreground">{getRecommendedCaloriesExplanation(preferences)}</p>
                    <Link to="/settings#daily-calorie-goal" className="text-xs text-secondary hover:underline mt-2 inline-block font-medium">
                      Click to change in Settings →
                    </Link>
                  </TooltipContent>
                </Tooltip>
              </div>
              <div><span className="text-muted-foreground">Protein</span><span className="block font-bold">{dailyGoals.protein}g</span></div>
              <div><span className="text-muted-foreground">Carbs</span><span className="block font-bold">{dailyGoals.carbs}g</span></div>
              <div><span className="text-muted-foreground">Fat</span><span className="block font-bold">{dailyGoals.fat}g</span></div>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Suggested calories are estimates only—not medical or nutrition advice.
            </p>
            {dailyGoals.calories > 0 && dailyGoals.calories < 1200 && (
              <p className="text-xs text-amber-600 dark:text-amber-400 mt-1 flex items-center gap-1">
                Very low calorie goals may not be enough during fasting. Consider consulting a nutritionist.{" "}
                <Link to="/health" className="text-secondary hover:underline">Health guide →</Link>
              </p>
            )}
            {hasRecommendation && (
              <p className="text-xs text-muted-foreground mt-2">
                From your profile (Settings → Advanced): recommended {recommendedCal} cal
                {canUseRecommended && (
                  <Button
                    type="button"
                    variant="link"
                    className="h-auto p-0 ml-1 text-xs text-secondary"
                    onClick={() => setDailyGoals((g) => ({ ...g, calories: recommendedCal }))}
                  >
                    Use recommended
                  </Button>
                )}
              </p>
            )}
          </motion.div>

          {/* Add to plan form */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-6 p-4 rounded-2xl bg-card border border-border"
          >
            <h2 className="font-display font-bold mb-3">Add to plan for this day</h2>
            <p className="text-sm text-muted-foreground mb-3">Plan what you intend to eat (meal prep). Macros are per portion.</p>
            <div className="flex flex-wrap gap-2 mb-3">
              {(["suhoor", "iftar", "between"] as const).map((m) => {
                const { label, Icon } = MEAL_LABELS[m];
                return (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setPlanForm((f) => ({ ...f, mealType: m }))}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm border transition-colors ${
                      planForm.mealType === m ? "border-secondary bg-secondary/10" : "border-border hover:border-secondary/50"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {label}
                  </button>
                );
              })}
            </div>
            <div className="space-y-2 mb-3">
              <Label className="text-xs text-muted-foreground">Quick add from recipe</Label>
              <Select
                value=""
                onValueChange={(value) => {
                  if (!value) return;
                  const [mealType, idStr] = value.split("-");
                  const id = parseInt(idStr, 10);
                  if ((mealType !== "suhoor" && mealType !== "iftar") || !Number.isFinite(id)) return;
                  const recipe = recipeOptions.find((r) => r.mealType === mealType && r.id === id);
                  if (recipe) {
                    setPlanForm((f) => ({
                      ...f,
                      name: recipe.name,
                      cal: String(recipe.calories),
                      protein: recipe.protein ? String(recipe.protein) : "",
                      carbs: recipe.carbs ? String(recipe.carbs) : "",
                      fat: recipe.fat ? String(recipe.fat) : "",
                      portions: "1",
                    }));
                  }
                }}
              >
                <SelectTrigger className="w-full" aria-label="Choose a recipe to add to plan">
                  <SelectValue placeholder="Select a recipe…" />
                </SelectTrigger>
                <SelectContent>
                  {recipeOptions.map((r) => (
                    <SelectItem key={`plan-${r.mealType}-${r.id}`} value={`${r.mealType}-${r.id}`}>
                      {r.name} ({r.mealType === "suhoor" ? "Suhoor" : "Iftar"}) · {r.calories} cal
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-3">
              <div>
                <Label className="text-xs">Name</Label>
                <Input
                  placeholder="e.g. Oats"
                  value={planForm.name}
                  onChange={(e) => setPlanForm((f) => ({ ...f, name: e.target.value }))}
                  className="mt-0.5"
                />
              </div>
              <div>
                <Label className="text-xs">Cal</Label>
                <Input type="number" min={0} placeholder="0" value={planForm.cal} onChange={(e) => setPlanForm((f) => ({ ...f, cal: e.target.value }))} className="mt-0.5" />
              </div>
              <div>
                <Label className="text-xs">Portions</Label>
                <Input type="number" step="0.5" min={0.1} placeholder="1" value={planForm.portions} onChange={(e) => setPlanForm((f) => ({ ...f, portions: e.target.value }))} className="mt-0.5" />
              </div>
              <div>
                <Label className="text-xs">P / C / F (g)</Label>
                <div className="flex gap-1 mt-0.5">
                  <Input type="number" min={0} placeholder="P" value={planForm.protein} onChange={(e) => setPlanForm((f) => ({ ...f, protein: e.target.value }))} className="w-12 text-center" />
                  <Input type="number" min={0} placeholder="C" value={planForm.carbs} onChange={(e) => setPlanForm((f) => ({ ...f, carbs: e.target.value }))} className="w-12 text-center" />
                  <Input type="number" min={0} placeholder="F" value={planForm.fat} onChange={(e) => setPlanForm((f) => ({ ...f, fat: e.target.value }))} className="w-12 text-center" />
                </div>
              </div>
            </div>
            <Button type="button" onClick={addPlanned} className="gap-2">
              <Plus className="w-4 h-4" />
              Add to plan
            </Button>
          </motion.div>

          {/* Planned (meal prep) */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.12 }}
            className="mb-6 p-4 rounded-2xl bg-card border border-border"
          >
            <h2 className="font-display font-bold mb-3 flex items-center gap-2">
              <Flame className="w-5 h-5 text-secondary" />
              Meal prep plan (planned)
            </h2>
            {selectedPlanned.suhoor.length === 0 && selectedPlanned.iftar.length === 0 && (selectedPlanned.between?.length ?? 0) === 0 ? (
              <p className="text-sm text-muted-foreground">No plan for this day yet. Plan suhoor and iftar above if you want to hit calorie targets — or skip and just log what you eat.</p>
            ) : (
              <>
                {(["suhoor", "iftar", "between"] as const).map((mealType) => {
                  const items = selectedPlanned[mealType] ?? [];
                  if (items.length === 0) return null;
                  const { label, Icon } = MEAL_LABELS[mealType];
                  return (
                    <div key={mealType} className="mb-4 last:mb-0">
                      <h3 className="text-sm font-medium flex items-center gap-2 mb-2">
                        <Icon className="w-4 h-4" />
                        {label}
                      </h3>
                      <ul className="space-y-1">
                        {items.map((i) => {
                          const totalCal = Math.round(i.caloriesPerPortion * i.portions);
                          return (
                            <li key={i.id} className="flex items-center justify-between gap-2 text-sm py-1 border-b border-border/50">
                              <span>{i.name}</span>
                              <span className="text-muted-foreground">{i.portions}× {i.caloriesPerPortion} cal = {totalCal} cal</span>
                              <button type="button" onClick={() => removePlanned(mealType, i.id)} className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded border border-transparent hover:border-destructive/30 hover:bg-destructive/20 text-muted-foreground hover:text-destructive shrink-0" aria-label="Remove">
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </li>
                          );
                        })}
                      </ul>
                    </div>
                  );
                })}
                <p className="text-xs text-muted-foreground mt-2">
                  Planned totals: {Math.round(plannedTotals.calories ?? 0)} cal · P {Math.round(plannedTotals.protein ?? 0)} · C {Math.round(plannedTotals.carbs ?? 0)} · F {Math.round(plannedTotals.fat ?? 0)}
                </p>
              </>
            )}
          </motion.div>

          {/* Quick add + Actual food eaten (logs) */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.14 }}
            className="mb-6 p-4 rounded-2xl bg-card border border-border"
          >
            <h2 className="font-display font-bold mb-3">Log food for this day</h2>
            <p className="text-sm text-muted-foreground mb-3">
              Food is logged for <strong>{selectedDateObj.toLocaleDateString("en", { weekday: "short", month: "short", day: "numeric" })}</strong>. Choose a meal (Suhoor, Iftar, or between), then add what you ate—each item is saved for that day and meal.
            </p>
            <div className="flex flex-wrap gap-2 mb-4">
              {(["suhoor", "iftar", "between"] as const).map((m) => {
                const { label, Icon } = MEAL_LABELS[m];
                return (
                  <Button
                    key={m}
                    type="button"
                    variant="outline"
                    size="sm"
                    className="gap-1.5"
                    onClick={() => { setSelectedRecipe(null); setLogForm({ active: true, mealType: m, name: "", cal: "", protein: "", carbs: "", fat: "", portions: "1", imageDataUrl: "" }); }}
                  >
                    <Icon className="w-4 h-4" />
                    {label}
                  </Button>
                );
              })}
            </div>

            {logForm.active && (
              <form
                onSubmit={(e) => { e.preventDefault(); addToLog(); }}
                className="p-3 rounded-xl border border-border bg-muted/30 mb-4 space-y-2"
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium flex items-center gap-2">
                    {(() => {
                      const { Icon } = MEAL_LABELS[logForm.mealType];
                      return <Icon className="w-4 h-4" />;
                    })()}
                    Add to {MEAL_LABELS[logForm.mealType].label}
                  </span>
                  <button type="button" onClick={() => { setSelectedRecipe(null); setLogForm((f) => ({ ...f, active: false, imageDataUrl: "" })); }} className="p-1 rounded hover:bg-muted" aria-label="Close">
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground">Quick add from recipe</Label>
                  <Select
                    value={selectedRecipe ? `${selectedRecipe.mealType}-${selectedRecipe.id}` : ""}
                    onValueChange={(value) => {
                      if (!value) { setSelectedRecipe(null); return; }
                      const [mealType, idStr] = value.split("-");
                      const id = parseInt(idStr, 10);
                      if (mealType !== "suhoor" && mealType !== "iftar") return;
                      const recipe = recipeOptions.find((r) => r.mealType === mealType && r.id === id);
                      if (recipe) {
                        setSelectedRecipe({ mealType, id });
                        setLogForm((f) => ({
                          ...f,
                          name: recipe.name,
                          cal: String(recipe.calories),
                          protein: recipe.protein ? String(recipe.protein) : "",
                          carbs: recipe.carbs ? String(recipe.carbs) : "",
                          fat: recipe.fat ? String(recipe.fat) : "",
                          portions: "1",
                        }));
                      }
                    }}
                  >
                    <SelectTrigger className="w-full" aria-label="Choose a recipe to fill the form">
                      <SelectValue placeholder="Select a recipe…" />
                    </SelectTrigger>
                    <SelectContent>
                      {recipeOptions.map((r) => (
                        <SelectItem key={`${r.mealType}-${r.id}`} value={`${r.mealType}-${r.id}`}>
                          {r.name} ({r.mealType === "suhoor" ? "Suhoor" : "Iftar"}) · {r.calories} cal
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground">Photo (optional)</Label>
                  <div className="flex items-center gap-2 flex-wrap">
                    <input
                      type="file"
                      accept="image/*"
                      capture="environment"
                      className="hidden"
                      id="log-form-photo"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        setImageResizing(true);
                        const dataUrl = await resizeImageToDataUrl(file);
                        setImageResizing(false);
                        if (dataUrl) setLogForm((f) => ({ ...f, imageDataUrl: dataUrl }));
                        e.target.value = "";
                      }}
                    />
                    <label htmlFor="log-form-photo" className="inline-flex items-center gap-2 min-h-[44px] px-3 py-2 rounded-lg border border-border bg-background hover:bg-muted/50 cursor-pointer text-sm">
                      <ImagePlus className="w-4 h-4 text-muted-foreground" />
                      {imageResizing ? "Resizing…" : "Add photo"}
                    </label>
                    {logForm.imageDataUrl && (
                      <div className="relative inline-block">
                        <img src={logForm.imageDataUrl} alt="" className="h-14 w-14 object-cover rounded-lg border border-border" />
                        <button type="button" onClick={() => setLogForm((f) => ({ ...f, imageDataUrl: "" }))} className="absolute -top-1 -right-1 rounded-full bg-destructive text-destructive-foreground w-5 h-5 flex items-center justify-center text-xs" aria-label="Remove photo">
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <div className="relative col-span-2 sm:col-span-1">
                    <Input
                      placeholder="Name"
                      value={logForm.name}
                      onChange={(e) => { setSelectedRecipe(null); setLogForm((f) => ({ ...f, name: e.target.value })); }}
                      autoComplete="off"
                    />
                    {macrosLogFormSuggestions.recipes.length > 0 || macrosLogFormSuggestions.foods.length > 0 ? (
                      <ul className="absolute top-full left-0 right-0 mt-0.5 rounded-lg border border-border bg-background shadow-lg max-h-40 overflow-auto z-10" role="listbox" aria-label="Recipe and food suggestions">
                        {macrosLogFormSuggestions.recipes.map((r) => (
                          <li key={`${r.mealType}-${r.id}`}>
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedRecipe({ mealType: r.mealType, id: r.id });
                                setLogForm((f) => ({
                                  ...f,
                                  name: r.name,
                                  cal: String(r.calories),
                                  protein: r.protein ? String(r.protein) : "",
                                  carbs: r.carbs ? String(r.carbs) : "",
                                  fat: r.fat ? String(r.fat) : "",
                                  portions: "1",
                                }));
                              }}
                              className="w-full text-left px-3 py-2 text-sm hover:bg-muted flex items-center justify-between gap-2"
                            >
                              <span>{r.name}</span>
                              <span className="text-xs text-muted-foreground">{r.calories} cal</span>
                            </button>
                          </li>
                        ))}
                        {macrosLogFormSuggestions.foods.map((f) => (
                          <li key={f}>
                            <button
                              type="button"
                              onClick={() => setLogForm((lf) => ({ ...lf, name: f }))}
                              className="w-full text-left px-3 py-2 text-sm hover:bg-muted"
                            >
                              {f}
                            </button>
                          </li>
                        ))}
                      </ul>
                    ) : null}
                  </div>
                  <Input type="number" placeholder="Cal" value={logForm.cal} onChange={(e) => setLogForm((f) => ({ ...f, cal: e.target.value }))} />
                  <Input type="number" step="0.5" min={0.1} placeholder="Portions" value={logForm.portions} onChange={(e) => setLogForm((f) => ({ ...f, portions: e.target.value }))} />
                  <div className="flex gap-1">
                    <Input type="number" placeholder="P" value={logForm.protein} onChange={(e) => setLogForm((f) => ({ ...f, protein: e.target.value }))} className="w-12 text-center" />
                    <Input type="number" placeholder="C" value={logForm.carbs} onChange={(e) => setLogForm((f) => ({ ...f, carbs: e.target.value }))} className="w-12 text-center" />
                    <Input type="number" placeholder="F" value={logForm.fat} onChange={(e) => setLogForm((f) => ({ ...f, fat: e.target.value }))} className="w-12 text-center" />
                  </div>
                </div>
                <Button type="submit" size="sm">Add to log</Button>
              </form>
            )}

            {selectedLog.suhoor.length === 0 && selectedLog.iftar.length === 0 && (selectedLog.between?.length ?? 0) === 0 ? (
              <p className="text-sm text-muted-foreground">Nothing logged for this day yet. Quick-add what you ate for suhoor, iftar, or in between — rough estimates are fine.</p>
            ) : (
              <>
                {(["suhoor", "iftar", "between"] as const).map((mealType) => {
                  const entries = selectedLog[mealType] ?? [];
                  if (entries.length === 0) return null;
                  const { label, Icon } = MEAL_LABELS[mealType];
                  return (
                    <div key={mealType} className="mb-4 last:mb-0">
                      <h3 className="text-sm font-medium flex items-center gap-2 mb-2">
                        <Icon className="w-4 h-4" />
                        {label}
                      </h3>
                      <ul className="space-y-1">
                        {entries.map((e) => {
                          const totalCal = Math.round((e.caloriesPerPortion || 0) * e.portions);
                          return (
                            <li key={e.id} className="flex flex-wrap items-center gap-2 text-sm py-1 border-b border-border/50">
                              {e.imageDataUrl ? (
                                <img src={e.imageDataUrl} alt="" className="h-10 w-10 rounded object-cover shrink-0 border border-border" />
                              ) : null}
                              <span className="font-medium">{e.name}</span>
                              <input
                                type="number"
                                step="0.5"
                                min={0.1}
                                className="w-12 py-0.5 px-1 rounded border border-border bg-background text-center text-xs"
                                value={e.portions}
                                onChange={(ev) => setPortions(mealType, e.id, parseFloat(ev.target.value) || 1)}
                              />
                              <span>× {e.caloriesPerPortion} cal = {totalCal} cal</span>
                              <button type="button" onClick={() => removeFromLog(mealType, e.id)} className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded border border-transparent hover:border-destructive/30 hover:bg-destructive/20 text-muted-foreground hover:text-destructive ml-auto shrink-0" aria-label="Remove">
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </li>
                          );
                        })}
                      </ul>
                    </div>
                  );
                })}
                <p className="text-xs text-muted-foreground mt-2">
                  Actual totals: {Math.round(actualTotals.calories ?? 0)} cal · P {Math.round(actualTotals.protein ?? 0)} · C {Math.round(actualTotals.carbs ?? 0)} · F {Math.round(actualTotals.fat ?? 0)}
                </p>
              </>
            )}
          </motion.div>

          {/* Planned vs Actual vs Goals */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.16 }}
            className="mb-6 p-4 rounded-2xl bg-card border border-border"
          >
            <h2 className="font-display font-bold mb-3">This day: planned vs actual vs goals</h2>
            <div className="space-y-4">
              <MacroBar current={plannedTotals.calories ?? 0} goal={dailyGoals.calories} label="Planned calories" />
              <MacroBar current={actualTotals.calories ?? 0} goal={dailyGoals.calories} label="Actual calories" />
              <MacroBar current={actualTotals.protein ?? 0} goal={dailyGoals.protein} label="Actual protein (g)" />
              <MacroBar current={actualTotals.carbs ?? 0} goal={dailyGoals.carbs} label="Actual carbs (g)" />
              <MacroBar current={actualTotals.fat ?? 0} goal={dailyGoals.fat} label="Actual fat (g)" />
            </div>
          </motion.div>

          {/* Fasting history: recent fasts (date, time, status) */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="mb-8 p-4 rounded-2xl bg-card border border-border"
          >
            <h2 className="font-display font-bold mb-3 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-secondary" aria-hidden />
              Fasting history
            </h2>
            {recentFastingLog.length > 0 ? (
              <>
                <ul className="space-y-2 text-sm max-h-[240px] overflow-y-auto">
                  {recentFastingLog.map((entry) => (
                    <li
                      key={entry.date}
                      className="flex items-center justify-between gap-2 py-2 border-b border-border/50 last:border-0"
                    >
                      <span className="font-medium shrink-0">
                        {new Date(entry.date + "T12:00:00").toLocaleDateString("en", { weekday: "short", month: "short", day: "numeric" })}
                      </span>
                      <span className="text-muted-foreground text-xs shrink-0">
                        {entry.startedAt ? new Date(entry.startedAt).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" }) : "—"}
                        {entry.completedAt && ` → ${new Date(entry.completedAt).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}`}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded-full text-xs font-medium shrink-0 ${
                          entry.status === "completed"
                            ? "bg-secondary/20 text-secondary"
                            : entry.status === "broken"
                              ? "bg-destructive/20 text-destructive"
                              : "bg-primary/20 text-foreground"
                        }`}
                      >
                        {entry.status === "completed"
                          ? "Done"
                          : entry.status === "broken"
                            ? entry.brokenReason
                              ? `Broken (${getBrokenReasonLabel(entry.brokenReason)})`
                              : "Broken"
                            : "In progress"}
                      </span>
                    </li>
                  ))}
                </ul>
                <Link
                  to="/dashboard/progress"
                  className="inline-flex items-center gap-1.5 mt-3 text-sm font-medium text-secondary hover:underline"
                >
                  Full fasting tracker →
                </Link>
              </>
            ) : (
              <p className="text-sm text-muted-foreground mb-2">
                Your fasting log will show here. Start or complete a fast on the Dashboard or Today page to see history.
              </p>
            )}
          </motion.div>

          {/* Meal history: list or feed (image) mode */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.18 }}
            className="mb-8 p-4 rounded-2xl bg-card border border-border"
          >
            <h2 className="font-display font-bold mb-3">Meal history</h2>
            <div className="flex flex-wrap items-center gap-2 mb-4">
              <span className="text-sm text-muted-foreground">View:</span>
              <div className="flex rounded-lg border border-border p-0.5">
                <button
                  type="button"
                  onClick={() => setMealHistoryView("list")}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm transition-colors ${mealHistoryView === "list" ? "bg-secondary text-secondary-foreground" : "hover:bg-muted/50"}`}
                  aria-pressed={mealHistoryView === "list"}
                >
                  <LayoutList className="w-4 h-4" />
                  List
                </button>
                <button
                  type="button"
                  onClick={() => setMealHistoryView("feed")}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm transition-colors ${mealHistoryView === "feed" ? "bg-secondary text-secondary-foreground" : "hover:bg-muted/50"}`}
                  aria-pressed={mealHistoryView === "feed"}
                  title="Entries with photos only"
                >
                  <Grid3X3 className="w-4 h-4" />
                  Feed
                </button>
              </div>
            </div>

            {mealHistoryView === "list" ? (
              mealHistoryEntries.length === 0 ? (
                <p className="text-sm text-muted-foreground">No meals logged yet. Add food above to see history here.</p>
              ) : (
                <ul className="space-y-2 max-h-[320px] overflow-y-auto">
                  {mealHistoryEntries.slice(0, 50).map(({ dateStr, mealType, entry }) => {
                    const totalCal = Math.round((entry.caloriesPerPortion || 0) * entry.portions);
                    const dateLabel = new Date(dateStr + "T12:00:00").toLocaleDateString("en", { weekday: "short", month: "short", day: "numeric" });
                    const recipeEmoji = entry.recipeId ? (() => {
                      const [mt, idStr] = entry.recipeId.split("-");
                      const id = parseInt(idStr, 10);
                      const r = getRecipe(mt as MealType, id);
                      return r?.emoji;
                    })() : undefined;
                    return (
                      <li key={`${dateStr}-${entry.id}`} className="flex items-center gap-2 text-sm py-2 border-b border-border/50 last:border-0">
                        {entry.imageDataUrl ? (
                          <img src={entry.imageDataUrl} alt="" className="h-9 w-9 rounded object-cover shrink-0" />
                        ) : null}
                        {recipeEmoji && <span className="shrink-0" aria-hidden>{recipeEmoji}</span>}
                        <button type="button" onClick={() => setSelectedDateAndUrl(dateStr)} className="text-left font-medium text-foreground hover:text-secondary truncate min-w-0 flex-1">
                          {entry.name}
                        </button>
                        <span className="text-muted-foreground shrink-0">{dateLabel}</span>
                        <span className="text-muted-foreground shrink-0">{MEAL_LABELS[mealType].label}</span>
                        <span className="shrink-0">{totalCal} cal</span>
                      </li>
                    );
                  })}
                </ul>
              )
            ) : mealHistoryWithImages.length === 0 ? (
              <p className="text-sm text-muted-foreground">No meals with photos yet. Add a photo when logging food to see them in feed mode.</p>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {mealHistoryWithImages.map(({ dateStr, mealType, entry }) => {
                  const dateLabel = new Date(dateStr + "T12:00:00").toLocaleDateString("en", { weekday: "short", month: "short", day: "numeric" });
                  return (
                    <button
                      key={`${dateStr}-${entry.id}`}
                      type="button"
                      onClick={() => setSelectedDateAndUrl(dateStr)}
                      className="rounded-xl border border-border overflow-hidden bg-muted/20 hover:bg-muted/40 text-left transition-colors"
                    >
                      <div className="aspect-square relative">
                        <img src={entry.imageDataUrl} alt="" className="absolute inset-0 w-full h-full object-cover" />
                      </div>
                      <div className="p-2">
                        <p className="font-medium text-sm truncate">{entry.name}</p>
                        <p className="text-xs text-muted-foreground">{dateLabel} · {MEAL_LABELS[mealType].label}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </motion.div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
