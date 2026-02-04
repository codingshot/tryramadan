import { useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
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
} from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { PageSEO } from "@/components/PageSEO";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  useDailyGoals,
  useUserPreferences,
  getRecommendedCaloriesFromPreferences,
  useDayPlannedItems,
  useDayFoodLog,
  getDayTotalsFromPlanned,
  getDayTotalsFromFoodLog,
  normalizeDayFoodLog,
  clampCalories,
  type MealCategory,
  type PlannedItem,
  type FoodLogEntry,
} from "@/hooks/useLocalStorage";

const MEAL_LABELS: Record<MealCategory, { label: string; Icon: typeof Sunrise }> = {
  suhoor: { label: "Suhoor (morning)", Icon: Sunrise },
  iftar: { label: "Iftar (evening)", Icon: Sunset },
  between: { label: "Between meals", Icon: UtensilsCrossed },
};

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

export default function DashboardMacros() {
  const todayStr = new Date().toISOString().split("T")[0];
  const [selectedDate, setSelectedDate] = useState(todayStr);
  const [preferences] = useUserPreferences();
  const [dailyGoals, setDailyGoals] = useDailyGoals();
  const [planned, setPlanned] = useDayPlannedItems();
  const [foodLogs, setFoodLogs] = useDayFoodLog();
  const recommendedCal = getRecommendedCaloriesFromPreferences(preferences);
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
  }>({ active: false, mealType: "suhoor", name: "", cal: "", protein: "", carbs: "", fat: "", portions: "1" });

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
    const name = logForm.name.trim() || "Logged item";
    const cal = parseInt(logForm.cal, 10) || 0;
    const portions = Math.max(0.1, parseFloat(logForm.portions) || 1);
    const protein = parseFloat(logForm.protein) || 0;
    const carbs = parseFloat(logForm.carbs) || 0;
    const fat = parseFloat(logForm.fat) || 0;
    const mealType = logForm.mealType;
    const entry: FoodLogEntry = {
      id: `log-${Date.now()}`,
      type: "custom",
      mealType,
      name,
      portions,
      caloriesPerPortion: clampCalories(cal),
      proteinPerPortion: protein || undefined,
      carbsPerPortion: carbs || undefined,
      fatPerPortion: fat || undefined,
    };
    const day = selectedLog;
    const list = [...(day[mealType] ?? []), entry];
    setFoodLogs((prev) => ({
      ...prev,
      [selectedDate]: { ...day, [mealType]: list },
    }));
    setLogForm({ ...logForm, active: false, name: "", cal: "", protein: "", carbs: "", fat: "", portions: "1" });
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
    setSelectedDate(d.toISOString().split("T")[0]);
  };
  const goNextDay = () => {
    const d = new Date(selectedDate + "T12:00:00");
    d.setDate(d.getDate() + 1);
    setSelectedDate(d.toISOString().split("T")[0]);
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

          {/* Day selector */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="flex items-center justify-between gap-4 mb-6 p-3 rounded-2xl bg-card border border-border"
          >
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
              <div><span className="text-muted-foreground">Calories</span><span className="block font-bold">{dailyGoals.calories}</span></div>
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
            <h2 className="font-display font-bold mb-3">Actual food eaten (logs)</h2>
            <p className="text-sm text-muted-foreground mb-3">Quick add what you ate:</p>
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
                    onClick={() => setLogForm({ active: true, mealType: m, name: "", cal: "", protein: "", carbs: "", fat: "", portions: "1" })}
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
                  <button type="button" onClick={() => setLogForm((f) => ({ ...f, active: false }))} className="p-1 rounded hover:bg-muted" aria-label="Close">
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <Input placeholder="Name" value={logForm.name} onChange={(e) => setLogForm((f) => ({ ...f, name: e.target.value }))} />
                  <Input type="number" placeholder="Cal" value={logForm.cal} onChange={(e) => setLogForm((f) => ({ ...f, cal: e.target.value }))} />
                  <Input type="number" step="0.5" placeholder="Portions" value={logForm.portions} onChange={(e) => setLogForm((f) => ({ ...f, portions: e.target.value }))} />
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
            className="mb-8 p-4 rounded-2xl bg-card border border-border"
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
        </div>
      </main>
      <Footer />
    </div>
  );
}
