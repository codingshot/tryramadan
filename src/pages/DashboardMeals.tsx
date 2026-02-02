import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { 
  ArrowLeft, Clock, ShoppingCart, Sunrise, Sunset,
  Flame, Plus, Heart, Filter, Globe, BookOpen
} from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import recipesData from "@/data/recipes.json";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useRecipeFavorites, useDayMealPlans, useDayFoodLog } from "@/hooks/useLocalStorage";
import { parseNutrient } from "@/lib/cultureRecipes";
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
type Recipe = {
  id: number;
  name: string;
  region: string;
  description: string;
  ingredients: string[];
  prepTime: string;
  benefits: string;
  tips: string;
  nutrition?: { calories: number; protein: string; carbs: string; fat: string };
  significance?: string;
  dietary?: string[];
  countryId?: string;
};

const allSuhoor = (recipesData as { suhoor: Recipe[]; iftar: Recipe[] }).suhoor;
const allIftar = (recipesData as { suhoor: Recipe[]; iftar: Recipe[] }).iftar;
const allRegions = [...new Set([...allSuhoor.map(r => r.region), ...allIftar.map(r => r.region)])].sort();
const dietaryOptions = ["vegetarian", "vegan-option", "halal"] as const;

const DashboardMeals = () => {
  const [activeTab, setActiveTab] = useState<MealType>("suhoor");
  const [selectedRecipes, setSelectedRecipes] = useState<number[]>([]);
  const [favorites, setFavorites] = useRecipeFavorites();
  const [mealPlans, setMealPlans] = useDayMealPlans();
  const [foodLogs, setFoodLogs] = useDayFoodLog();
  const [regionFilter, setRegionFilter] = useState<string>("all");
  const [dietaryFilter, setDietaryFilter] = useState<string>("all");
  const [showCreateMeal, setShowCreateMeal] = useState(false);
  const [customMeal, setCustomMeal] = useState({
    name: "",
    mealType: "suhoor" as MealType,
    cal: "",
    protein: "",
    carbs: "",
    fat: "",
    portions: "1",
  });
  const today = new Date().toISOString().split("T")[0];

  const baseRecipes = activeTab === "suhoor" ? allSuhoor : allIftar;
  const recipes = useMemo(() => {
    let list = baseRecipes;
    if (regionFilter !== "all") list = list.filter(r => r.region === regionFilter);
    if (dietaryFilter !== "all") list = list.filter(r => r.dietary?.includes(dietaryFilter));
    return list;
  }, [baseRecipes, regionFilter, dietaryFilter]);

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
    .flatMap(r => r.ingredients);
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
      const day = prev[today] || { suhoor: [], iftar: [] };
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
      caloriesPerPortion: cal,
      proteinPerPortion: protein || undefined,
      carbsPerPortion: carbs || undefined,
      fatPerPortion: fat || undefined,
    };
    setFoodLogs((prev) => {
      const day = prev[today] || { suhoor: [], iftar: [] };
      const list = mealType === "suhoor" ? [...day.suhoor, entry] : [...day.iftar, entry];
      return { ...prev, [today]: { ...day, [mealType]: list } };
    });
    setMealPlans((prev) => {
      const current = prev[today] || {};
      const existing = (mealType === "suhoor" ? current.suhoor : current.iftar) || "";
      const merged = existing ? `${existing}, ${name}` : name;
      return { ...prev, [today]: { ...current, [mealType]: merged } };
    });
    setCustomMeal({ name: "", mealType: "suhoor", cal: "", protein: "", carbs: "", fat: "", portions: "1" });
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
      
      <main className="main-content">
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
              <span className="block font-arabic text-lg text-secondary mt-1">تخطيط الوجبات</span>
            </h1>
            <p className="text-muted-foreground mt-2">
              Suhoor (pre-dawn) and Iftar (evening break-fast) recipes from around the world. Pick recipes to add to today’s schedule; open any for full ingredients and step-by-step instructions.
            </p>
            <p className="mt-2 text-sm">
              <Link to="/recipes" className="text-secondary hover:underline font-medium">
                Browse all recipes by culture →
              </Link>
            </p>
          </motion.div>
          
          {/* Tab switcher */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="flex gap-2 mb-8"
          >
            <button
              onClick={() => setActiveTab('suhoor')}
              className={`flex-1 p-4 rounded-2xl border-2 transition-all flex items-center justify-center gap-3 ${
                activeTab === 'suhoor' 
                  ? 'border-secondary bg-secondary/10' 
                  : 'border-border hover:border-secondary/50'
              }`}
              aria-label="Suhoor — morning meal"
            >
              <Sunrise className="w-5 h-5 shrink-0" aria-hidden />
              <div className="text-left">
                <span className="font-bold block">Suhoor</span>
                <span className="text-xs text-muted-foreground font-arabic">السحور · morning</span>
              </div>
            </button>
            <button
              onClick={() => setActiveTab('iftar')}
              className={`flex-1 p-4 rounded-2xl border-2 transition-all flex items-center justify-center gap-3 ${
                activeTab === 'iftar' 
                  ? 'border-secondary bg-secondary/10' 
                  : 'border-border hover:border-secondary/50'
              }`}
              aria-label="Iftar — evening meal"
            >
              <Sunset className="w-5 h-5 shrink-0" aria-hidden />
              <div className="text-left">
                <span className="font-bold block">Iftar</span>
                <span className="text-xs text-muted-foreground font-arabic">الإفطار · evening</span>
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
              <Select value={regionFilter} onValueChange={setRegionFilter}>
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
              <Select value={dietaryFilter} onValueChange={setDietaryFilter}>
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
                onClick={() => { setRegionFilter("all"); setDietaryFilter("all"); }}
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
              <div className="mt-4 pt-4 border-t border-border space-y-3">
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
                <div className="flex gap-2">
                  <Button type="button" size="sm" onClick={submitCreateOwnMeal}>
                    Add to food log & meal plan
                  </Button>
                  <Button type="button" variant="ghost" size="sm" onClick={() => setShowCreateMeal(false)}>
                    Cancel (don't add)
                  </Button>
                </div>
              </div>
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
          
          {/* Recipe cards */}
          <div className="space-y-4 mb-8">
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
                      {ingredient}
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

          {/* Add selected to today's schedule */}
          {selectedRecipes.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-6"
            >
              <button
                type="button"
                onClick={addSelectedToTodaySchedule}
                className="w-full py-3 px-4 rounded-2xl border-2 border-secondary bg-secondary/10 text-secondary font-medium hover:bg-secondary/20 transition-colors"
              >
                Add selected recipes to today's meal plan ({activeTab})
              </button>
            </motion.div>
          )}
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default DashboardMeals;
