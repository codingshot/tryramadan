import { useState, useMemo, useEffect } from "react";
import { motion } from "framer-motion";
import { Link, useSearchParams } from "react-router-dom";
import { ArrowLeft, Coffee, Utensils, Globe, Clock, ChevronRight, Search } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { PageSEO } from "@/components/PageSEO";
import {
  getAllCountries,
  getAllRegions,
  getRecipes,
  getTotalTimeMinutes,
  recipeHasIngredient,
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
import { Input } from "@/components/ui/input";

const countries = getAllCountries();
const regions = getAllRegions();
const allRecipes = getRecipes();

const VALID_TIME_FILTERS = ["all", "under15", "15-30", "30-60", "60plus"] as const;

function buildRecipesSearchParams(meal: string, region: string, country: string, time: string, q: string): Record<string, string> {
  const next: Record<string, string> = {};
  if (meal === "suhoor" || meal === "iftar") next.meal = meal;
  if (region && region !== "all") next.region = region;
  if (country && country !== "all") next.country = country;
  if (time && time !== "all" && VALID_TIME_FILTERS.includes(time as typeof VALID_TIME_FILTERS[number])) next.time = time;
  if (q.trim()) next.q = q.trim();
  return next;
}

export default function Recipes() {
  const [searchParams, setSearchParams] = useSearchParams();
  const mealFromUrl = searchParams.get("meal");
  const regionFromUrl = searchParams.get("region");
  const countryFromUrl = searchParams.get("country");
  const timeFromUrl = searchParams.get("time");
  const qFromUrl = searchParams.get("q");

  const [countryFilter, setCountryFilter] = useState<string>(() =>
    countryFromUrl && (countryFromUrl === "all" || countries.some((c) => c.id === countryFromUrl)) ? countryFromUrl : "all"
  );
  const [mealFilter, setMealFilter] = useState<string>(() => (mealFromUrl === "suhoor" || mealFromUrl === "iftar" ? mealFromUrl : "all"));
  const [regionFilter, setRegionFilter] = useState<string>(() => regionFromUrl ?? "all");
  const [timeFilter, setTimeFilter] = useState<string>(() =>
    timeFromUrl && VALID_TIME_FILTERS.includes(timeFromUrl as (typeof VALID_TIME_FILTERS)[number]) ? timeFromUrl : "all"
  );
  const [ingredientSearch, setIngredientSearch] = useState<string>(() => qFromUrl ?? "");

  useEffect(() => {
    const meal = mealFromUrl === "suhoor" || mealFromUrl === "iftar" ? mealFromUrl : "all";
    const region = regionFromUrl ?? "all";
    const country =
      countryFromUrl && (countryFromUrl === "all" || countries.some((c) => c.id === countryFromUrl)) ? countryFromUrl : "all";
    const time =
      timeFromUrl && VALID_TIME_FILTERS.includes(timeFromUrl as (typeof VALID_TIME_FILTERS)[number]) ? timeFromUrl : "all";
    const q = qFromUrl ?? "";
    setMealFilter(meal);
    setRegionFilter(region);
    setCountryFilter(country);
    setTimeFilter(time);
    setIngredientSearch(q);
  }, [mealFromUrl, regionFromUrl, countryFromUrl, timeFromUrl, qFromUrl]);

  const updateUrl = (meal: string, region: string, country: string, time: string, q: string) => {
    const next = buildRecipesSearchParams(meal, region, country, time, q);
    setSearchParams(next, { replace: true });
  };

  const setMealFilterAndUrl = (value: string) => {
    setMealFilter(value);
    updateUrl(value, regionFilter, countryFilter, timeFilter, ingredientSearch);
  };

  const setRegionFilterAndUrl = (value: string) => {
    setRegionFilter(value);
    updateUrl(mealFilter, value, countryFilter, timeFilter, ingredientSearch);
  };

  const setCountryFilterAndUrl = (value: string) => {
    setCountryFilter(value);
    updateUrl(mealFilter, regionFilter, value, timeFilter, ingredientSearch);
  };

  const setTimeFilterAndUrl = (value: string) => {
    setTimeFilter(value);
    updateUrl(mealFilter, regionFilter, countryFilter, value, ingredientSearch);
  };

  const setIngredientSearchAndUrl = (value: string) => {
    setIngredientSearch(value);
    updateUrl(mealFilter, regionFilter, countryFilter, timeFilter, value);
  };

  const clearAllFilters = () => {
    setCountryFilter("all");
    setMealFilter("all");
    setRegionFilter("all");
    setTimeFilter("all");
    setIngredientSearch("");
    setSearchParams({}, { replace: true });
  };

  const filtered = useMemo(() => {
    return allRecipes.filter(({ mealType, recipe }) => {
      if (countryFilter !== "all" && recipe.countryId !== countryFilter) return false;
      if (mealFilter !== "all" && mealType !== mealFilter) return false;
      if (regionFilter !== "all" && recipe.region !== regionFilter) return false;
      const minutes = getTotalTimeMinutes(recipe);
      if (timeFilter === "under15" && minutes > 15) return false;
      if (timeFilter === "15-30" && (minutes < 15 || minutes > 30)) return false;
      if (timeFilter === "30-60" && (minutes < 30 || minutes > 60)) return false;
      if (timeFilter === "60plus" && minutes < 60) return false;
      if (!recipeHasIngredient(recipe, ingredientSearch)) return false;
      return true;
    });
  }, [countryFilter, mealFilter, regionFilter, timeFilter, ingredientSearch]);

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
            <div className="mt-4 pt-4 border-t border-border">
              <p className="text-xs font-medium text-muted-foreground mb-2">Browse by region</p>
              <div className="flex flex-wrap gap-2">
                {regions.slice(0, 10).map((r) => (
                  <Link
                    key={r}
                    to={`/recipes?region=${encodeURIComponent(r)}`}
                    onClick={() => setRegionFilterAndUrl(r)}
                    className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-sm transition-colors ${
                      regionFilter === r
                        ? "bg-secondary text-secondary-foreground"
                        : "bg-muted/70 text-muted-foreground hover:bg-muted hover:text-foreground"
                    }`}
                  >
                    <Globe className="w-3.5 h-3.5" aria-hidden />
                    {r}
                  </Link>
                ))}
              </div>
            </div>
          </motion.header>

          {/* Filters: culture, meal, time, ingredients */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="space-y-4 mb-8"
            aria-label="Filter recipes"
          >
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-2">
                <Globe className="w-4 h-4 text-muted-foreground" aria-hidden />
                <label htmlFor="filter-country" className="sr-only">Culture</label>
                <Select value={countryFilter} onValueChange={setCountryFilterAndUrl}>
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
              <div className="flex items-center gap-2">
                <label htmlFor="filter-region" className="sr-only">Region</label>
                <Select value={regionFilter} onValueChange={setRegionFilterAndUrl}>
                  <SelectTrigger className="w-[180px]" id="filter-region" aria-label="Filter by region">
                    <SelectValue placeholder="All regions" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All regions</SelectItem>
                    {regions.map((r) => (
                      <SelectItem key={r} value={r}>
                        {r}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-muted-foreground" aria-hidden />
                <label htmlFor="filter-time" className="sr-only">Time to make</label>
                <Select value={timeFilter} onValueChange={setTimeFilterAndUrl}>
                  <SelectTrigger className="w-[180px]" id="filter-time" aria-label="Filter by time to make">
                    <SelectValue placeholder="Any time" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Any time</SelectItem>
                    <SelectItem value="under15">Under 15 min</SelectItem>
                    <SelectItem value="15-30">15–30 min</SelectItem>
                    <SelectItem value="30-60">30–60 min</SelectItem>
                    <SelectItem value="60plus">60+ min</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-4">
              <div className="relative flex-1 min-w-[200px] max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" aria-hidden />
                <label htmlFor="filter-ingredient" className="sr-only">Search by ingredient</label>
                <Input
                  id="filter-ingredient"
                  type="search"
                  placeholder="Search by ingredient (e.g. dates, chicken, rice)"
                  value={ingredientSearch}
                  onChange={(e) => setIngredientSearchAndUrl(e.target.value)}
                  className="pl-9"
                  aria-label="Search by ingredient"
                />
              </div>
              <span className="text-sm text-muted-foreground">
                {filtered.length} {filtered.length === 1 ? "recipe" : "recipes"}
              </span>
              {(countryFilter !== "all" || mealFilter !== "all" || regionFilter !== "all" || timeFilter !== "all" || ingredientSearch.trim() !== "") && (
                <button
                  type="button"
                  onClick={clearAllFilters}
                  className="text-sm text-secondary hover:underline"
                >
                  Clear filters
                </button>
              )}
            </div>
          </motion.section>

          {/* Recipe list */}
          <section aria-label="Recipe list" className="space-y-4">
            {filtered.length === 0 ? (
              <div className="py-8 px-4 rounded-2xl bg-muted/30 border border-border text-center">
                <p className="text-muted-foreground mb-3">No recipes match your filters.</p>
                <p className="text-sm text-muted-foreground mb-4">Try a different region, meal type, or clear filters to see all recipes.</p>
                <button
                  type="button"
                  onClick={clearAllFilters}
                  className="px-4 py-2 rounded-xl bg-secondary text-secondary-foreground text-sm font-medium hover:bg-secondary/90 transition-colors"
                >
                  Clear all filters
                </button>
              </div>
            ) : (
              filtered.map(({ mealType, recipe }, index) => (
                <RecipeCard key={`${mealType}-${recipe.id}`} mealType={mealType} recipe={recipe} index={index} />
              ))
            )}
          </section>

          <div className="mt-8 space-y-4">
            <div className="p-4 rounded-2xl bg-card border border-border space-y-2">
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
            <div className="p-4 rounded-2xl bg-secondary/5 border border-secondary/20">
              <p className="text-sm text-foreground">
                <strong>Explore traditions by country</strong> — suhoor and iftar customs, foods, and culture.{" "}
                <Link to="/culture" className="text-secondary font-medium hover:underline inline-flex items-center gap-1">
                  Ramadan around the world
                  <ChevronRight className="w-4 h-4" aria-hidden />
                </Link>
              </p>
            </div>
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
      className="p-6 rounded-2xl bg-card border border-border hover:border-secondary/50 transition-all group"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <Link
              to={recipePath}
              className="font-display font-bold text-lg hover:text-secondary transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-secondary focus-visible:ring-offset-2 rounded"
              aria-label={`View recipe: ${recipe.name}`}
            >
              {recipe.name}
            </Link>
            <span
              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                mealType === "suhoor" ? "bg-secondary/20 text-secondary" : "bg-primary/20 text-foreground"
              }`}
            >
              {mealType === "suhoor" ? <Coffee className="w-3 h-3" /> : <Utensils className="w-3 h-3" />}
              {mealType === "suhoor" ? "Suhoor" : "Iftar"}
            </span>
            {recipe.dietary && recipe.dietary.length > 0 && (
              <span className="flex flex-wrap gap-1">
                {recipe.dietary.map((d) => (
                  <span key={d} className="px-1.5 py-0.5 rounded bg-muted text-[10px] uppercase tracking-wide text-muted-foreground">
                    {d.replace("-", " ")}
                  </span>
                ))}
              </span>
            )}
          </div>
          <p className="text-sm text-muted-foreground mt-1">{recipe.description}</p>
          <div className="flex flex-wrap items-center gap-3 mt-2 text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <Clock className="w-4 h-4" aria-hidden />
              {recipe.totalTime || recipe.prepTime}
            </span>
            {recipe.nutrition && (
              <span className="text-xs">
                {recipe.nutrition.calories} cal
                {recipe.nutrition.protein && ` · P ${recipe.nutrition.protein}`}
                {recipe.nutrition.carbs && ` · C ${recipe.nutrition.carbs}`}
                {recipe.nutrition.fat && ` · F ${recipe.nutrition.fat}`}
              </span>
            )}
            {recipe.region && (
              <Link
                to={`/recipes?region=${encodeURIComponent(recipe.region)}`}
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-muted/80 text-muted-foreground hover:bg-secondary/20 hover:text-secondary transition-colors"
                title={`Filter recipes by ${recipe.region}`}
              >
                <Globe className="w-3 h-3" aria-hidden />
                {recipe.region}
              </Link>
            )}
            {country && (
              <Link
                to={`/recipes?country=${country.id}`}
                className="flex items-center gap-1 text-muted-foreground hover:text-secondary transition-colors"
                title={`Filter by ${country.name}`}
              >
                {country.flag} {country.name}
              </Link>
            )}
          </div>
        </div>
        <Link
          to={recipePath}
          className="shrink-0 p-2 rounded-lg text-muted-foreground hover:bg-muted hover:text-secondary transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-secondary"
          aria-label={`View ${recipe.name} recipe`}
        >
          <ChevronRight className="w-5 h-5" aria-hidden />
        </Link>
      </div>
    </motion.article>
  );
}
