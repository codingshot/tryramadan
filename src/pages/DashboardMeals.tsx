import { useState, useMemo, useEffect } from "react";
import { motion } from "framer-motion";
import { Link, useSearchParams } from "react-router-dom";
import { 
  ArrowLeft, Clock, ShoppingCart, Sunrise, Sunset,
  Flame, Plus, Heart, Filter, Globe, BookOpen, ImagePlus, X
} from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useRecipeFavorites, useRecentRecipes, useDayMealPlans, useDayFoodLog, normalizeDayFoodLog, clampCalories, useSuhoorLabel, useIftarLabel, useUserPreferences, useFastingProgress, isFastingToday } from "@/hooks/useLocalStorage";
import { getRecipes, getAllRegions, parseNutrient, getIngredientName, type Recipe, type RecipeIngredient } from "@/lib/cultureRecipes";
import { resizeImageToDataUrl } from "@/lib/foodImage";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PageSEO } from "@/components/PageSEO";

type MealType = "suhoor" | "iftar";

/** All recipes from same source as /recipes page (cultureRecipes). */
const allRecipesWithType = getRecipes();
const allRegions = getAllRegions();
const dietaryOptions = ["vegetarian", "vegan-option", "halal"] as const;

function buildMealsSearchParams(meal: string, region: string, diet: string): Record<string, string> {
  const next: Record<string, string> = {};
  if (meal === "suhoor" || meal === "iftar") next.meal = meal;
  if (region && region !== "all") next.region = region;
  if (diet && diet !== "all" && dietaryOptions.includes(diet as (typeof dietaryOptions)[number])) next.diet = diet;
  return next;
}

const DashboardMeals = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const mealFromUrl = searchParams.get("meal");
  const regionFromUrl = searchParams.get("region");
  const dietFromUrl = searchParams.get("diet");

  const [preferences] = useUserPreferences();
  const suhoorLabel = useSuhoorLabel();
  const iftarLabel = useIftarLabel();
  const [activeTab, setActiveTab] = useState<MealType>(() =>
    mealFromUrl === "suhoor" || mealFromUrl === "iftar" ? mealFromUrl : "suhoor"
  );
  const [selectedRecipes, setSelectedRecipes] = useState<number[]>([]);
  const [favorites, setFavorites] = useRecipeFavorites();
  const [recentRecipes, addRecentRecipe] = useRecentRecipes();
  const [mealPlans, setMealPlans] = useDayMealPlans();
  const [foodLogs, setFoodLogs] = useDayFoodLog();
  const [regionFilter, setRegionFilter] = useState<string>(() => regionFromUrl ?? "all");
  const [dietaryFilter, setDietaryFilter] = useState<string>(() =>
    dietFromUrl && dietaryOptions.includes(dietFromUrl as (typeof dietaryOptions)[number]) ? dietFromUrl : "all"
  );
  useEffect(() => {
    setActiveTab(mealFromUrl === "suhoor" || mealFromUrl === "iftar" ? mealFromUrl : "suhoor");
    setRegionFilter(regionFromUrl ?? "all");
    setDietaryFilter(
      dietFromUrl && dietaryOptions.includes(dietFromUrl as (typeof dietaryOptions)[number]) ? dietFromUrl : "all"
    );
  }, [mealFromUrl, regionFromUrl, dietFromUrl]);

  const setActiveTabAndUrl = (value: MealType) => {
    setActiveTab(value);
    setSearchParams(buildMealsSearchParams(value, regionFilter, dietaryFilter), { replace: true });
  };
  const setRegionFilterAndUrl = (value: string) => {
    setRegionFilter(value);
    setSearchParams(buildMealsSearchParams(activeTab, value, dietaryFilter), { replace: true });
  };
  const setDietaryFilterAndUrl = (value: string) => {
    setDietaryFilter(value);
    setSearchParams(buildMealsSearchParams(activeTab, regionFilter, value), { replace: true });
  };
  const clearMealsFilters = () => {
    setRegionFilter("all");
    setDietaryFilter("all");
    setSearchParams(buildMealsSearchParams(activeTab, "all", "all"), { replace: true });
  };

  const [showCreateMeal, setShowCreateMeal] = useState(false);
  const [customMeal, setCustomMeal] = useState({
    name: "",
    mealType: "suhoor" as MealType,
    cal: "",
    protein: "",
    carbs: "",
    fat: "",
    portions: "1",
    imageDataUrl: "",
  });
  const [customMealImageResizing, setCustomMealImageResizing] = useState(false);
  const today = new Date().toISOString().split("T")[0];
  const [progress] = useFastingProgress();
  const fastingToday = isFastingToday(progress, today);

  const baseRecipes = useMemo(
    () => allRecipesWithType.filter((r) => r.mealType === activeTab).map((r) => r.recipe),
    [activeTab]
  );
  const recipes = useMemo(() => {
    let list = baseRecipes;
    if (regionFilter !== "all") list = list.filter(r => r.region === regionFilter);
    if (dietaryFilter !== "all") list = list.filter(r => r.dietary?.includes(dietaryFilter));
    const keyFor = (r: Recipe) => `${activeTab}-${r.id}`;
    list = [...list].sort((a, b) => {
      const aFav = favorites.includes(keyFor(a));
      const bFav = favorites.includes(keyFor(b));
      if (aFav && !bFav) return -1;
      if (!aFav && bFav) return 1;
      const aRecent = recentRecipes.indexOf(keyFor(a));
      const bRecent = recentRecipes.indexOf(keyFor(b));
      if (aRecent >= 0 && bRecent < 0) return -1;
      if (aRecent < 0 && bRecent >= 0) return 1;
      if (aRecent >= 0 && bRecent >= 0) return aRecent - bRecent;
      return 0;
    });
    return list;
  }, [baseRecipes, regionFilter, dietaryFilter, activeTab, favorites, recentRecipes]);

  const favoriteKey = (type: MealType, id: number) => `${type}-${id}`;
  const isFavorite = (type: MealType, id: number) => favorites.includes(favoriteKey(type, id));
  const toggleFavorite = (type: MealType, id: number) => {
    const key = favoriteKey(type, id);
    setFavorites(prev => prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]);
  };

  const toggleRecipe = (id: number) => {
    setSelectedRecipes(prev => 
      prev.includes(id) ? prev.filter(r => r !== id) : [...prev, id]
    );
  };

  // Grocery list from selected recipes (from current filtered list that user added)
  const groceryList = baseRecipes
    .filter(r => selectedRecipes.includes(r.id))
    .flatMap(r => r.ingredients.map(getIngredientName));
  const uniqueGroceries = [...new Set(groceryList)];

  const copyGroceryList = () => {
    if (uniqueGroceries.length === 0) {
      toast.info("Select recipes first to build a grocery list.");
      return;
    }
    const text = uniqueGroceries.join("\n");
    navigator.clipboard.writeText(text).then(
      () => toast.success("Grocery list copied to clipboard."),
      () => toast.error("Could not copy to clipboard.")
    );
  };

  const addSelectedToTodaySchedule = () => {
    if (selectedRecipes.length === 0) {
      toast.info("Select at least one recipe to add to today's schedule.");
      return;
    }
    const keys = selectedRecipes.map((id) => `${activeTab}-${id}`);
    const newValue = keys.join(",");
    setMealPlans((prev) => {
      const current = prev[today] || {};
      const existing = (activeTab === "suhoor" ? current.suhoor : current.iftar) || "";
      const merged = existing ? `${existing},${newValue}` : newValue;
      const deduped = [...new Set(merged.split(","))].filter(Boolean).join(",");
      return {
        ...prev,
        [today]: {
          ...current,
          [activeTab]: deduped,
        },
      };
    });
    selectedRecipes.forEach((id) => addRecentRecipe(`${activeTab}-${id}`));
    toast.success(`Added ${selectedRecipes.length} recipe(s) to today's ${activeTab}.`);
  };

  /** Add a recipe to today's food log (macro tracker) and optionally to meal plan notes */
  const addRecipeToFoodLog = (recipe: Recipe, mealType: MealType, alsoAddToPlan = true) => {
    const cal = recipe.nutrition?.calories ?? 0;
    const protein = parseNutrient(recipe.nutrition?.protein);
    const carbs = parseNutrient(recipe.nutrition?.carbs);
    const fat = parseNutrient(recipe.nutrition?.fat);
    const entry = {
      id: `${Date.now()}-${mealType}-${recipe.id}`,
      type: "recipe" as const,
      mealType,
      name: recipe.name,
      portions: 1,
      caloriesPerPortion: cal,
      proteinPerPortion: protein || undefined,
      carbsPerPortion: carbs || undefined,
      fatPerPortion: fat || undefined,
      recipeId: `${mealType}-${recipe.id}`,
    };
    setFoodLogs((prev) => {
      const day = normalizeDayFoodLog(prev[today]);
      const list = mealType === "suhoor" ? [...day.suhoor, entry] : [...day.iftar, entry];
      return { ...prev, [today]: { ...day, [mealType]: list } };
    });
    if (alsoAddToPlan) {
      setMealPlans((prev) => {
        const current = prev[today] || {};
        const existing = (mealType === "suhoor" ? current.suhoor : current.iftar) || "";
        const merged = existing ? `${existing}, ${recipe.name}` : recipe.name;
        return { ...prev, [today]: { ...current, [mealType]: merged } };
      });
    }
    addRecentRecipe(`${mealType}-${recipe.id}`);
    toast.success(`Added ${recipe.name} to today's food log and meal plan.`);
  };

  /** Create your own meal: add to food log (macro tracker) and meal plan */
  const submitCreateOwnMeal = () => {
    const name = customMeal.name.trim() || "My meal";
    const cal = parseInt(customMeal.cal, 10) || 0;
    const portions = Math.max(0.1, parseFloat(customMeal.portions) || 1);
    const protein = parseFloat(customMeal.protein) || 0;
    const carbs = parseFloat(customMeal.carbs) || 0;
    const fat = parseFloat(customMeal.fat) || 0;
    if (cal <= 0 && !protein && !carbs && !fat) {
      toast.info("Enter at least calories or one macro.");
      return;
    }
    const mealType = customMeal.mealType;
    const entry = {
      id: `custom-${Date.now()}`,
      type: "custom" as const,
      mealType,
      name,
      portions,
      caloriesPerPortion: clampCalories(cal),
      proteinPerPortion: protein || undefined,
      carbsPerPortion: carbs || undefined,
      fatPerPortion: fat || undefined,
      ...(customMeal.imageDataUrl ? { imageDataUrl: customMeal.imageDataUrl } : {}),
    };
    setFoodLogs((prev) => {
      const day = normalizeDayFoodLog(prev[today]);
      const list = mealType === "suhoor" ? [...day.suhoor, entry] : [...day.iftar, entry];
      return { ...prev, [today]: { ...day, [mealType]: list } };
    });
    setMealPlans((prev) => {
      const current = prev[today] || {};
      const existing = (mealType === "suhoor" ? current.suhoor : current.iftar) || "";
      const merged = existing ? `${existing}, ${name}` : name;
      return { ...prev, [today]: { ...current, [mealType]: merged } };
    });
    setCustomMeal({ name: "", mealType: "suhoor", cal: "", protein: "", carbs: "", fat: "", portions: "1", imageDataUrl: "" });
    setShowCreateMeal(false);
    toast.success(`Added "${name}" to today's food log and meal plan.`);
  };

  return (
    <div className="min-h-screen bg-background">
      <PageSEO
        title="Meals | TryRamadan.app"
        description="Suhoor and iftar meal ideas: recipes by region, favorites, and meal planning. Plan nutritious meals for Ramadan fasting."
        path="/dashboard/meals"
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
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <h1 className="text-2xl md:text-3xl font-display font-bold">
              Meal Planning
            </h1>
            <p className="text-muted-foreground mt-2">
              {suhoorLabel} and {iftarLabel} recipes from around the world. Pick recipes to add to today’s schedule; open any for full ingredients and step-by-step instructions.
            </p>
            <p className="mt-2 text-sm">
              <Link to="/recipes" className="text-secondary hover:underline font-medium">
                Browse all recipes by culture →
              </Link>
            </p>
            {fastingToday && (
              <p className="mt-3 text-sm text-muted-foreground rounded-lg bg-muted/50 border border-border px-3 py-2">
                Logging food here doesn&apos;t break your fast; use &quot;Break fast&quot; on the Dashboard if you ate.
              </p>
            )}
          </motion.div>
          
          {/* Tab switcher */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="flex gap-2 mb-8"
          >
            <button
              onClick={() => setActiveTabAndUrl('suhoor')}
              className={`flex-1 p-4 rounded-2xl border-2 transition-all flex items-center justify-center gap-3 ${
                activeTab === 'suhoor' 
                  ? 'border-secondary bg-secondary/10' 
                  : 'border-border hover:border-secondary/50'
              }`}
              aria-label={preferences?.userType === "muslim" ? "Suhoor — morning meal" : "Suhoor — pre-dawn meal"}
            >
              <Sunrise className="w-5 h-5 shrink-0" aria-hidden />
              <div className="text-left">
                <span className="font-bold block">{suhoorLabel}</span>
                <span className="text-xs text-muted-foreground">Morning</span>
              </div>
            </button>
            <button
              onClick={() => setActiveTabAndUrl('iftar')}
              className={`flex-1 p-4 rounded-2xl border-2 transition-all flex items-center justify-center gap-3 ${
                activeTab === 'iftar' 
                  ? 'border-secondary bg-secondary/10' 
                  : 'border-border hover:border-secondary/50'
              }`}
              aria-label={`${iftarLabel} — evening meal`}
            >
              <Sunset className="w-5 h-5 shrink-0" aria-hidden />
              <div className="text-left">
                <span className="font-bold block">{iftarLabel}</span>
                <span className="text-xs text-muted-foreground">Evening</span>
              </div>
            </button>
          </motion.div>
          
          {/* Filters */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.12 }}
            className="flex flex-wrap items-center gap-3 mb-6"
            aria-label="Filter recipes"
          >
            <div className="flex items-center gap-2">
              <Label htmlFor="filter-region" className="text-xs text-muted-foreground whitespace-nowrap">Region</Label>
              <Select value={regionFilter} onValueChange={setRegionFilterAndUrl}>
                <SelectTrigger id="filter-region" className="w-[180px]" aria-label="Filter by region">
                  <SelectValue placeholder="All regions" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All regions</SelectItem>
                  {allRegions.map(r => (
                    <SelectItem key={r} value={r}>{r}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2">
              <Label htmlFor="filter-diet" className="text-xs text-muted-foreground whitespace-nowrap">Diet</Label>
              <Select value={dietaryFilter} onValueChange={setDietaryFilterAndUrl}>
                <SelectTrigger id="filter-diet" className="w-[160px]" aria-label="Filter by diet">
                  <SelectValue placeholder="All" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  {dietaryOptions.map(d => (
                    <SelectItem key={d} value={d}>{d.replace("-", " ")}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <span className="text-sm text-muted-foreground">
              {recipes.length} {recipes.length === 1 ? "recipe" : "recipes"}
            </span>
            {(regionFilter !== "all" || dietaryFilter !== "all") && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={clearMealsFilters}
              >
                Clear filters
              </Button>
            )}
          </motion.div>

          {/* Create your own meal — add to food log (macro tracker) and meal plan */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.13 }}
            className="mb-8 p-4 rounded-2xl bg-card border border-border"
          >
            <button
              type="button"
              onClick={() => setShowCreateMeal(!showCreateMeal)}
              className="w-full flex items-center justify-between font-medium text-left"
              aria-expanded={showCreateMeal}
            >
              <span className="flex items-center gap-2">
                <Plus className="w-5 h-5 text-secondary" />
                Create your own meal
              </span>
              <span className="text-sm text-muted-foreground">
                {showCreateMeal ? "Hide" : "Add custom meal to macro tracker & plan"}
              </span>
            </button>
            {showCreateMeal && (
              <form
                onSubmit={(e) => { e.preventDefault(); submitCreateOwnMeal(); }}
                className="mt-4 pt-4 border-t border-border space-y-3"
              >
                <p className="text-xs text-muted-foreground">
                  Add a custom meal for today. It will appear in your food log (macro tracker) on the Schedule page and in your meal plan notes.
                </p>
                <div className="flex flex-wrap gap-2 items-center">
                  <Label className="text-xs shrink-0">Meal</Label>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant={customMeal.mealType === "suhoor" ? "secondary" : "outline"}
                      size="sm"
                      onClick={() => setCustomMeal((c) => ({ ...c, mealType: "suhoor" }))}
                    >
                      Suhoor
                    </Button>
                    <Button
                      type="button"
                      variant={customMeal.mealType === "iftar" ? "secondary" : "outline"}
                      size="sm"
                      onClick={() => setCustomMeal((c) => ({ ...c, mealType: "iftar" }))}
                    >
                      Iftar
                    </Button>
                  </div>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <div className="col-span-2 sm:col-span-1">
                    <Label className="text-xs">Name</Label>
                    <Input
                      placeholder="e.g. Homemade soup"
                      value={customMeal.name}
                      onChange={(e) => setCustomMeal((c) => ({ ...c, name: e.target.value }))}
                      className="mt-0.5"
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Cal</Label>
                    <Input
                      type="number"
                      min={0}
                      placeholder="0"
                      value={customMeal.cal}
                      onChange={(e) => setCustomMeal((c) => ({ ...c, cal: e.target.value }))}
                      className="mt-0.5"
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Portions</Label>
                    <Input
                      type="number"
                      step="0.5"
                      min={0.1}
                      placeholder="1"
                      value={customMeal.portions}
                      onChange={(e) => setCustomMeal((c) => ({ ...c, portions: e.target.value }))}
                      className="mt-0.5"
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Protein (g)</Label>
                    <Input
                      type="number"
                      min={0}
                      placeholder="0"
                      value={customMeal.protein}
                      onChange={(e) => setCustomMeal((c) => ({ ...c, protein: e.target.value }))}
                      className="mt-0.5"
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Carbs (g)</Label>
                    <Input
                      type="number"
                      min={0}
                      placeholder="0"
                      value={customMeal.carbs}
                      onChange={(e) => setCustomMeal((c) => ({ ...c, carbs: e.target.value }))}
                      className="mt-0.5"
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Fat (g)</Label>
                    <Input
                      type="number"
                      min={0}
                      placeholder="0"
                      value={customMeal.fat}
                      onChange={(e) => setCustomMeal((c) => ({ ...c, fat: e.target.value }))}
                      className="mt-0.5"
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">Photo (optional)</Label>
                  <div className="flex items-center gap-2 flex-wrap">
                    <input
                      type="file"
                      accept="image/*"
                      capture="environment"
                      className="hidden"
                      id="custom-meal-photo"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        setCustomMealImageResizing(true);
                        const dataUrl = await resizeImageToDataUrl(file);
                        setCustomMealImageResizing(false);
                        if (dataUrl) setCustomMeal((c) => ({ ...c, imageDataUrl: dataUrl }));
                        e.target.value = "";
                      }}
                    />
                    <label htmlFor="custom-meal-photo" className="inline-flex items-center gap-2 min-h-[44px] px-3 py-2 rounded-lg border border-border bg-background hover:bg-muted/50 cursor-pointer text-sm">
                      <ImagePlus className="w-4 h-4 text-muted-foreground" />
                      {customMealImageResizing ? "Resizing…" : "Add photo"}
                    </label>
                    {customMeal.imageDataUrl && (
                      <div className="relative inline-block">
                        <img src={customMeal.imageDataUrl} alt="" className="h-14 w-14 object-cover rounded-lg border border-border" />
                        <button type="button" onClick={() => setCustomMeal((c) => ({ ...c, imageDataUrl: "" }))} className="absolute -top-1 -right-1 rounded-full bg-destructive text-destructive-foreground w-5 h-5 flex items-center justify-center" aria-label="Remove photo">
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button type="submit" size="sm">
                    Add to food log & meal plan
                  </Button>
                  <Button type="button" variant="ghost" size="sm" onClick={() => { setShowCreateMeal(false); setCustomMeal((c) => ({ ...c, imageDataUrl: "" })); }}>
                    Cancel (don't add)
                  </Button>
                </div>
              </form>
            )}
          </motion.div>

          {/* Meal tips */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="p-4 rounded-2xl bg-gradient-to-r from-primary/10 to-secondary/10 border border-border mb-8"
          >
            <div className="flex items-start gap-3">
              <span className="text-2xl">{activeTab === 'suhoor' ? '🌙' : '🌅'}</span>
              <div>
                {activeTab === 'suhoor' ? (
                  <>
                    <p className="font-medium">Suhoor Tips • نصائح السحور</p>
                    <p className="text-sm text-muted-foreground">
                      Eat protein-rich foods and complex carbs for sustained energy. Drink plenty of water!
                    </p>
                  </>
                ) : (
                  <>
                    <p className="font-medium">Iftar Tips • نصائح الإفطار</p>
                    <p className="text-sm text-muted-foreground">
                      Break your fast with dates and water. Don't overeat - start small and eat slowly.
                    </p>
                  </>
                )}
              </div>
            </div>
          </motion.div>
          
          {/* Selected for meal plan — compact strip so user doesn't scroll forever to see selection */}
          {selectedRecipes.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-4 p-3 rounded-2xl bg-secondary/10 border border-secondary/30"
            >
              <p className="text-xs font-medium text-secondary mb-2">
                Selected for meal plan ({selectedRecipes.length})
              </p>
              <div className="max-h-24 overflow-y-auto overflow-x-hidden flex flex-wrap gap-1.5">
                {recipes
                  .filter((r) => selectedRecipes.includes(r.id))
                  .map((r) => (
                    <span
                      key={r.id}
                      className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-background/80 text-sm border border-border"
                    >
                      {r.name}
                      <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); toggleRecipe(r.id); }}
                        className="shrink-0 rounded p-0.5 hover:bg-muted"
                        aria-label={`Remove ${r.name} from selection`}
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </span>
                  ))}
              </div>
            </motion.div>
          )}

          {/* Recipe cards — extra bottom padding when sticky bar is shown so last card isn't hidden */}
          <div className={`space-y-4 ${selectedRecipes.length > 0 ? "mb-28 md:mb-24" : "mb-8"}`}>
            {recipes.map((recipe, index) => (
              <motion.div
                key={recipe.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + index * 0.1 }}
                className={`p-6 rounded-2xl border transition-all cursor-pointer ${
                  selectedRecipes.includes(recipe.id)
                    ? 'bg-secondary/10 border-secondary'
                    : 'bg-card border-border hover:border-secondary/50'
                }`}
                onClick={() => toggleRecipe(recipe.id)}
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-display font-bold text-lg">{recipe.name}</h3>
                    <span className="text-sm text-secondary">{recipe.region}</span>
                    {recipe.dietary && recipe.dietary.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-1">
                        {recipe.dietary.map(d => (
                          <span key={d} className="px-1.5 py-0.5 rounded bg-muted text-[10px] capitalize">
                            {d.replace("-", " ")}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-1">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button
                          type="button"
                          onClick={(e) => { e.stopPropagation(); toggleFavorite(activeTab, recipe.id); }}
                          className={`p-2 rounded-full transition-colors ${
                            isFavorite(activeTab, recipe.id) ? "text-red-500 bg-red-500/10" : "bg-muted hover:bg-muted/80"
                          }`}
                        >
                          <Heart className={`w-4 h-4 ${isFavorite(activeTab, recipe.id) ? "fill-current" : ""}`} />
                        </button>
                      </TooltipTrigger>
                      <TooltipContent>
                        {isFavorite(activeTab, recipe.id) ? "Remove from favorites" : "Save to favorites"}
                      </TooltipContent>
                    </Tooltip>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button
                          type="button"
                          onClick={(e) => { e.stopPropagation(); toggleRecipe(recipe.id); }}
                          className={`p-2 rounded-full transition-colors ${
                            selectedRecipes.includes(recipe.id) ? "bg-secondary text-secondary-foreground" : "bg-muted"
                          }`}
                        >
                          <Plus className={`w-4 h-4 transition-transform ${selectedRecipes.includes(recipe.id) ? "rotate-45" : ""}`} />
                        </button>
                      </TooltipTrigger>
                      <TooltipContent>
                        {selectedRecipes.includes(recipe.id) ? "Remove from meal plan" : "Add to meal plan"}
                      </TooltipContent>
                    </Tooltip>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            addRecipeToFoodLog(recipe, activeTab);
                          }}
                          className="p-2 rounded-full transition-colors bg-muted hover:bg-primary/20 text-foreground"
                          aria-label={`Add ${recipe.name} to food log and macro tracker`}
                        >
                          <Flame className="w-4 h-4" />
                        </button>
                      </TooltipTrigger>
                      <TooltipContent>
                        Add to today's food log (macro tracker) & meal plan
                      </TooltipContent>
                    </Tooltip>
                  </div>
                </div>

                <p className="text-muted-foreground text-sm mb-3">{recipe.description}</p>

                {recipe.significance && (
                  <div className="flex items-start gap-2 p-3 rounded-xl bg-secondary/10 border border-secondary/20 mb-3">
                    <BookOpen className="w-4 h-4 text-secondary shrink-0 mt-0.5" />
                    <p className="text-xs text-foreground/90">{recipe.significance}</p>
                  </div>
                )}

                {recipe.nutrition && (
                  <div className="flex flex-wrap gap-3 text-xs text-muted-foreground mb-3">
                    <span><strong className="text-foreground">{recipe.nutrition.calories}</strong> cal</span>
                    <span>P: {recipe.nutrition.protein}</span>
                    <span>C: {recipe.nutrition.carbs}</span>
                    <span>F: {recipe.nutrition.fat}</span>
                  </div>
                )}
                
                <div className="flex flex-wrap gap-2 mb-4">
                  {recipe.ingredients.slice(0, 5).map((ingredient, i) => (
                    <span key={i} className="px-2 py-1 rounded-full bg-muted text-xs">
                      {getIngredientName(ingredient)}
                    </span>
                  ))}
                  {recipe.ingredients.length > 5 && (
                    <span className="px-2 py-1 rounded-full bg-muted text-xs">
                      +{recipe.ingredients.length - 5} more
                    </span>
                  )}
                </div>
                
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    {recipe.prepTime}
                  </div>
                  <div className="flex items-center gap-1">
                    <Flame className="w-4 h-4" />
                    {recipe.benefits.split(" ").slice(0, 3).join(" ")}...
                  </div>
                </div>
                
                <div className="mt-3 pt-3 border-t border-border flex items-center justify-between gap-2 flex-wrap">
                  <p className="text-xs text-secondary">💡 {recipe.tips}</p>
                  <Link
                    to={`/recipe/${activeTab}/${recipe.id}`}
                    onClick={(e) => e.stopPropagation()}
                    className="text-xs font-medium text-secondary hover:underline"
                  >
                    View full recipe →
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
          
          {/* Grocery List */}
          {uniqueGroceries.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-6 rounded-2xl bg-card border border-border"
            >
              <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
                <div className="flex items-center gap-2">
                  <ShoppingCart className="w-5 h-5 text-secondary" />
                  <h3 className="font-display font-bold">
                    Grocery List • قائمة التسوق
                  </h3>
                  <span className="text-sm text-muted-foreground">({uniqueGroceries.length} items)</span>
                </div>
                <button
                  type="button"
                  onClick={copyGroceryList}
                  className="px-4 py-2 rounded-xl bg-secondary text-secondary-foreground text-sm font-medium hover:bg-secondary/90"
                >
                  Copy grocery list
                </button>
              </div>
              
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {uniqueGroceries.map((item, i) => (
                  <div key={i} className="flex items-center gap-2 p-2 rounded-lg bg-muted/50">
                    <input type="checkbox" className="rounded" />
                    <span className="text-sm">{item}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Add selected to today's schedule — fixed on mobile (safe-area), in-flow on desktop */}
          {selectedRecipes.length > 0 && (
            <>
              <div className="hidden md:block mt-6" aria-hidden>
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="pt-4 pb-4">
                  <button
                    type="button"
                    onClick={addSelectedToTodaySchedule}
                    className="w-full py-3 px-4 rounded-2xl border-2 border-secondary bg-secondary text-secondary-foreground font-medium hover:bg-secondary/90 transition-colors shadow-lg"
                  >
                    Add {selectedRecipes.length} selected recipe{selectedRecipes.length !== 1 ? "s" : ""} to today&apos;s meal plan ({activeTab})
                  </button>
                </motion.div>
              </div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="md:hidden fixed bottom-0 left-0 right-0 z-20 pt-3 px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))] bg-background/95 backdrop-blur border-t border-border shadow-[0_-4px_12px_rgba(0,0,0,0.06)]"
              >
                <button
                  type="button"
                  onClick={addSelectedToTodaySchedule}
                  className="w-full py-3 px-4 rounded-2xl border-2 border-secondary bg-secondary text-secondary-foreground font-medium hover:bg-secondary/90 transition-colors shadow-lg min-h-[48px]"
                >
                  Add {selectedRecipes.length} to today&apos;s meal plan ({activeTab})
                </button>
              </motion.div>
            </>
          )}
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default DashboardMeals;
