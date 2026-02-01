import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
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
  const [countryFilter, setCountryFilter] = useState<string>("all");
  const [mealFilter, setMealFilter] = useState<string>("all");

  const filtered = useMemo(() => {
    return allRecipes.filter(({ mealType, recipe }) => {
      if (countryFilter !== "all" && recipe.countryId !== countryFilter) return false;
      if (mealFilter !== "all" && mealType !== mealFilter) return false;
      return true;
    });
  }, [countryFilter, mealFilter]);

  return (
    <div className="min-h-screen bg-background">
      <PageSEO
        title="Ramadan Recipes | Suhoor & Iftar by Culture | TryRamadan"
        description="Discover suhoor and iftar recipes from around the world. Filter by culture and region. TryRamadan helps you plan meals for Ramadan fasting."
        path="/recipes"
      />
      <Navbar />
      <main className="pt-20 pb-16" role="main" aria-label="Recipes">
        <div className="container mx-auto px-4 max-w-4xl">
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
            <h1 className="text-2xl md:text-4xl font-display font-bold">
              Ramadan Recipes
              <span className="block font-arabic text-lg text-secondary mt-1">وصفات رمضان</span>
            </h1>
            <p className="text-muted-foreground mt-2">
              Suhoor and iftar recipes from Muslim communities worldwide. Filter by culture or meal type.
            </p>
          </motion.header>

          {/* Culture-based search */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="flex flex-wrap gap-4 mb-8"
            aria-label="Filter recipes"
          >
            <div className="flex items-center gap-2">
              <Globe className="w-4 h-4 text-muted-foreground" aria-hidden />
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
              <Select value={mealFilter} onValueChange={setMealFilter}>
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

          <p className="mt-8 text-sm text-muted-foreground">
            <Link to="/dashboard/meals" className="text-secondary hover:underline">
              Plan meals in Dashboard →
            </Link>
          </p>
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

  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.05 * index }}
    >
      <Link
        to={`/recipe/${mealType}/${recipe.id}`}
        className="block p-6 rounded-2xl bg-card border border-border hover:border-secondary/50 transition-all group"
        aria-label={`View recipe: ${recipe.name} (${mealType})`}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-display font-bold text-lg">{recipe.name}</span>
              <span
                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                  mealType === "suhoor" ? "bg-secondary/20 text-secondary" : "bg-primary/20 text-primary"
                }`}
              >
                {mealType === "suhoor" ? <Coffee className="w-3 h-3" /> : <Utensils className="w-3 h-3" />}
                {mealType === "suhoor" ? "Suhoor" : "Iftar"}
              </span>
            </div>
            <p className="text-sm text-muted-foreground mt-1">{recipe.description}</p>
            <div className="flex items-center gap-3 mt-2 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <Clock className="w-4 h-4" aria-hidden />
                {recipe.prepTime}
              </span>
              {country && (
                <Link
                  to={`/culture/${recipe.countryId}`}
                  onClick={(e) => e.stopPropagation()}
                  className="flex items-center gap-1 text-secondary hover:underline"
                >
                  {country.flag} {country.name}
                </Link>
              )}
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-secondary shrink-0" aria-hidden />
        </div>
      </Link>
    </motion.article>
  );
}
