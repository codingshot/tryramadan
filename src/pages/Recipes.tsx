import { useState, useMemo, useEffect } from "react";
import { motion } from "framer-motion";
import { Link, useSearchParams } from "react-router-dom";
import { ArrowLeft, Coffee, Utensils, Globe, Clock, ChevronRight } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { PageSEO } from "@/components/PageSEO";
import {
  getAllCountries,
  getRecipes,
  type MealType,
  type Recipe,
} from "@/lib/cultureRecipes";
import { buildRecipeListSchema } from "@/lib/jsonld";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const countries = getAllCountries();
const allRecipes = getRecipes();

export default function Recipes() {
  const [searchParams, setSearchParams] = useSearchParams();
  const mealFromUrl = searchParams.get("meal");
  const [countryFilter, setCountryFilter] = useState<string>("all");
  const [mealFilter, setMealFilter] = useState<string>(mealFromUrl === "suhoor" || mealFromUrl === "iftar" ? mealFromUrl : "all");

  useEffect(() => {
    if (mealFromUrl === "suhoor" || mealFromUrl === "iftar") setMealFilter(mealFromUrl);
  }, [mealFromUrl]);

  const setMealFilterAndUrl = (value: string) => {
    setMealFilter(value);
    if (value === "suhoor" || value === "iftar") setSearchParams({ meal: value });
    else setSearchParams({});
  };

  const filtered = useMemo(() => {
    return allRecipes.filter(({ mealType, recipe }) => {
      if (countryFilter !== "all" && recipe.countryId !== countryFilter) return false;
      if (mealFilter !== "all" && mealType !== mealFilter) return false;
      return true;
    });
  }, [countryFilter, mealFilter]);

  const listSchema = useMemo(
    () =>
      buildRecipeListSchema(
        filtered.map(({ mealType, recipe }) => ({
          name: recipe.name,
          url: `/recipe/${mealType}/${recipe.id}`,
          mealType: mealType === "suhoor" ? "Suhoor" : "Iftar",
        })),
        "/recipes"
      ),
    [filtered]
  );

  return (
    <div className="min-h-screen bg-background">
      <PageSEO
        title="Ramadan Recipes | Suhoor & Iftar by Culture | TryRamadan"
        description="Discover suhoor and iftar recipes from around the world. Ramadan meal ideas by culture: Middle East, South Asia, Turkey, and more. Filter by meal type. TryRamadan."
        path="/recipes"
      />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(listSchema) }} />
      <Navbar />
      <main id="main-content" className="main-content" aria-label="Recipes">
        <div className="container mx-auto px-4 max-w-4xl min-w-0">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 min-h-[44px] items-center"
          >
            <ArrowLeft className="w-4 h-4 flex-shrink-0" aria-hidden />
            Back to Home
          </Link>

          <motion.header
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-display font-bold">
              Ramadan Recipes
            </h1>
            <p className="text-muted-foreground mt-2 max-w-2xl">
              Suhoor (pre-dawn) and Iftar (evening break-fast) recipes from Muslim communities worldwide. Ramadan meal ideas by culture: Middle East, South Asia, Turkey, Southeast Asia, Levant, and more. Filter by culture or meal type; open any recipe for ingredients, steps, and nutrition.
            </p>
            <div className="flex flex-wrap gap-3 mt-4">
              <Link
                to="/recipes?meal=suhoor"
                onClick={() => setMealFilterAndUrl("suhoor")}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-secondary/10 text-secondary text-sm font-medium hover:bg-secondary/20 transition-colors"
              >
                <Coffee className="w-4 h-4" aria-hidden />
                Suhoor only
              </Link>
              <Link
                to="/recipes?meal=iftar"
                onClick={() => setMealFilterAndUrl("iftar")}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/10 text-foreground text-sm font-medium hover:bg-primary/20 transition-colors"
              >
                <Utensils className="w-4 h-4" aria-hidden />
                Iftar only
              </Link>
              <Link to="/dashboard/meals" className="text-sm text-muted-foreground hover:text-secondary transition-colors">
                Plan meals in Dashboard →
              </Link>
            </div>
          </motion.header>

          {/* Culture-based search */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="flex flex-wrap items-center gap-4 mb-8"
            aria-label="Filter recipes"
          >
            <div className="flex items-center gap-2">
              <Globe className="w-4 h-4 text-muted-foreground" aria-hidden />
              <label htmlFor="filter-country" className="sr-only">Culture</label>
              <Select value={countryFilter} onValueChange={setCountryFilter}>
                <SelectTrigger className="w-[220px]" id="filter-country" aria-label="Filter by culture or country">
                  <SelectValue placeholder="All cultures" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All cultures</SelectItem>
                  {countries.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.flag} {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2">
              <label htmlFor="filter-meal" className="sr-only">Meal type</label>
              <Select value={mealFilter} onValueChange={setMealFilterAndUrl}>
                <SelectTrigger className="w-[160px]" id="filter-meal" aria-label="Filter by meal type">
                  <SelectValue placeholder="All meals" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All meals</SelectItem>
                  <SelectItem value="suhoor">Suhoor</SelectItem>
                  <SelectItem value="iftar">Iftar</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <span className="text-sm text-muted-foreground">
              {filtered.length} {filtered.length === 1 ? "recipe" : "recipes"}
            </span>
            {(countryFilter !== "all" || mealFilter !== "all") && (
              <button
                type="button"
                onClick={() => { setCountryFilter("all"); setMealFilterAndUrl("all"); }}
                className="text-sm text-secondary hover:underline"
              >
                Clear filters
              </button>
            )}
          </motion.section>

          {/* Recipe list */}
          <section aria-label="Recipe list" className="space-y-4">
            {filtered.length === 0 ? (
              <p className="text-muted-foreground">No recipes match your filters. Try a different culture or meal type.</p>
            ) : (
              filtered.map(({ mealType, recipe }, index) => (
                <RecipeCard key={`${mealType}-${recipe.id}`} mealType={mealType} recipe={recipe} index={index} />
              ))
            )}
          </section>

          <div className="mt-8 p-4 rounded-2xl bg-card border border-border space-y-2">
            <p className="text-sm text-muted-foreground">
              <strong className="text-foreground">Plan & track:</strong>{" "}
              <Link to="/dashboard/meals" className="text-secondary hover:underline">
                Dashboard → Meals
              </Link>
              {" "}to add recipes to your meal plan, build a grocery list, and add items to your food log (macro tracker).
            </p>
            <p className="text-sm text-muted-foreground">
              <strong className="text-foreground">Create your own meal?</strong> In Meals, use “Create your own meal” to add a custom dish to today’s food log and meal plan. Or open{" "}
              <Link to="/dashboard/schedule" className="text-secondary hover:underline">
                Schedule
              </Link>
              , pick a day, and add custom food under the food log.
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

function RecipeCard({
  mealType,
  recipe,
  index,
}: {
  mealType: MealType;
  recipe: Recipe;
  index: number;
}) {
  const country = recipe.countryId
    ? countries.find((c) => c.id === recipe.countryId)
    : null;
  const recipePath = `/recipe/${mealType}/${recipe.id}`;

  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.05 * index }}
    >
      <Link
        to={recipePath}
        className="block p-6 rounded-2xl bg-card border border-border hover:border-secondary/50 transition-all group cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-secondary"
        aria-label={`View recipe: ${recipe.name} (${mealType})`}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-display font-bold text-lg">{recipe.name}</span>
              <span
                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                  mealType === "suhoor" ? "bg-secondary/20 text-secondary" : "bg-primary/20 text-foreground"
                }`}
              >
                {mealType === "suhoor" ? <Coffee className="w-3 h-3" /> : <Utensils className="w-3 h-3" />}
                {mealType === "suhoor" ? "Suhoor" : "Iftar"}
              </span>
            </div>
            <p className="text-sm text-muted-foreground mt-1">{recipe.description}</p>
            <div className="flex flex-wrap items-center gap-3 mt-2 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <Clock className="w-4 h-4" aria-hidden />
                {recipe.prepTime}
              </span>
              {recipe.nutrition && (
                <span className="text-xs">
                  {recipe.nutrition.calories} cal
                  {recipe.nutrition.protein && ` · P ${recipe.nutrition.protein}`}
                  {recipe.nutrition.carbs && ` · C ${recipe.nutrition.carbs}`}
                  {recipe.nutrition.fat && ` · F ${recipe.nutrition.fat}`}
                </span>
              )}
              {country && (
                <span className="flex items-center gap-1 text-muted-foreground">
                  {country.flag} {country.name}
                </span>
              )}
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-secondary shrink-0" aria-hidden />
        </div>
      </Link>
    </motion.article>
  );
}
