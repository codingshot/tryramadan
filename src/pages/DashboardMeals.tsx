import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { 
  ArrowLeft, Coffee, Utensils, Clock, ShoppingCart, 
  Flame, Plus, Heart, Filter, Globe, BookOpen
} from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import recipesData from "@/data/recipes.json";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useRecipeFavorites, useDayMealPlans } from "@/hooks/useLocalStorage";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  const [regionFilter, setRegionFilter] = useState<string>("all");
  const [dietaryFilter, setDietaryFilter] = useState<string>("all");
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
            >
              <Coffee className="w-5 h-5" />
              <div className="text-left">
                <span className="font-bold block">Suhoor</span>
                <span className="text-xs text-muted-foreground font-arabic">السحور</span>
              </div>
            </button>
            <button
              onClick={() => setActiveTab('iftar')}
              className={`flex-1 p-4 rounded-2xl border-2 transition-all flex items-center justify-center gap-3 ${
                activeTab === 'iftar' 
                  ? 'border-secondary bg-secondary/10' 
                  : 'border-border hover:border-secondary/50'
              }`}
            >
              <Utensils className="w-5 h-5" />
              <div className="text-left">
                <span className="font-bold block">Iftar</span>
                <span className="text-xs text-muted-foreground font-arabic">الإفطار</span>
              </div>
            </button>
          </motion.div>
          
          {/* Filters */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.12 }}
            className="flex flex-wrap gap-3 mb-6"
          >
            <div className="flex items-center gap-2">
              <Globe className="w-4 h-4 text-muted-foreground" />
              <Select value={regionFilter} onValueChange={setRegionFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Region" />
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
              <Filter className="w-4 h-4 text-muted-foreground" />
              <Select value={dietaryFilter} onValueChange={setDietaryFilter}>
                <SelectTrigger className="w-[160px]">
                  <SelectValue placeholder="Diet" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  {dietaryOptions.map(d => (
                    <SelectItem key={d} value={d}>{d.replace("-", " ")}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
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
                Add selected to today's schedule ({activeTab})
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
