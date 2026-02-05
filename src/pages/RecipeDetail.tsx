import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Coffee, Utensils, Clock, Globe, BookOpen, Flame, ListOrdered, ExternalLink, Users, ChevronRight } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { PageSEO } from "@/components/PageSEO";
import {
  getRecipeWithType,
  getCountryForRecipe,
  getIngredientDisplay,
  getDefaultServings,
  getRecipeIngredientStrings,
  getSimilarRecipes,
  type MealType,
} from "@/lib/cultureRecipes";
import { useIftarLabel } from "@/hooks/useLocalStorage";
import { buildRecipeSchema, buildBreadcrumbSchema } from "@/lib/jsonld";

export default function RecipeDetail() {
  const { mealType, id } = useParams<{ mealType: string; id: string }>();
  const iftarLabel = useIftarLabel();
  const meal = mealType as MealType | undefined;
  const recipeId = id ? parseInt(id, 10) : NaN;

  const result = meal && !isNaN(recipeId) ? getRecipeWithType(meal, recipeId) : undefined;
  const recipe = result?.recipe;
  const country = recipe ? getCountryForRecipe(recipe) : undefined;
  const defaultServings = recipe ? getDefaultServings(recipe) : 4;
  const [portions, setPortions] = useState(defaultServings);
  const multiplier = recipe && defaultServings > 0 ? portions / defaultServings : 1;

  if (!recipe || !result) {
    return (
      <div className="min-h-screen bg-background">
        <PageSEO
          title="Recipe not found | TryRamadan"
          description="The recipe you're looking for doesn't exist or was removed. Browse Ramadan suhoor and iftar recipes."
          robots="noindex, follow"
        />
        <Navbar />
        <main id="main-content" className="main-content container mx-auto px-4 max-w-4xl min-w-0">
          <h1 className="text-2xl font-display font-bold">Recipe not found</h1>
          <p className="text-muted-foreground mt-2">The recipe you're looking for doesn't exist or was removed.</p>
          <Link to="/recipes" className="mt-4 inline-block text-secondary hover:underline">
            Browse all recipes →
          </Link>
        </main>
        <Footer />
      </div>
    );
  }

  const { mealType: type } = result;
  const mealLabel = type === "suhoor" ? "Suhoor" : iftarLabel;
  const title = `${recipe.name} | ${mealLabel} Recipe | Ramadan | TryRamadan`;
  const description =
    recipe.significance || recipe.description;
  const metaDesc = [
    recipe.name,
    mealLabel,
    "Ramadan recipe",
    recipe.region && `from ${recipe.region}`,
    "—",
    description.slice(0, 100),
  ]
    .filter(Boolean)
    .join(" ")
    .slice(0, 160);
  const recipePath = `/recipe/${type}/${recipe.id}`;
  const recipeUrl = `https://tryramadan.app${recipePath}`;
  const recipeJsonLd = buildRecipeSchema({
    name: recipe.name,
    description: description.slice(0, 160),
    url: recipeUrl,
    recipeCategory: mealLabel,
    recipeCuisine: recipe.region ?? undefined,
    ingredients: getRecipeIngredientStrings(recipe, 1),
    steps: recipe.steps,
    prepTime: recipe.prepTime,
    cookTime: recipe.cookTime,
    totalTime: recipe.totalTime,
    calories: recipe.nutrition?.calories,
    protein: recipe.nutrition?.protein,
    carbs: recipe.nutrition?.carbs,
    fat: recipe.nutrition?.fat,
  });
  const breadcrumbJsonLd = buildBreadcrumbSchema([
    { name: "Home", url: "/" },
    { name: "Recipes", url: "/recipes" },
    { name: recipe.name, url: recipePath },
  ]);

  return (
    <div className="min-h-screen bg-background">
      <PageSEO
        title={title}
        description={metaDesc}
        path={recipePath}
        type="article"
        imageAlt={`${recipe.name} — ${mealLabel} recipe for Ramadan from TryRamadan`}
      />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(recipeJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />
      <Navbar />
      <main id="main-content" className="main-content" aria-label="Recipe">
        <div className="container mx-auto px-4 max-w-3xl min-w-0">
          <Link
            to="/recipes"
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 min-h-[44px] items-center"
          >
            <ArrowLeft className="w-4 h-4 flex-shrink-0" aria-hidden />
            Back to Recipes
          </Link>

          <motion.article
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <header className="mb-6">
              <div className="flex items-center gap-2 mb-2">
                <span
                  className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-sm font-medium ${
                    type === "suhoor" ? "bg-secondary/20 text-secondary" : "bg-primary/20 text-foreground"
                  }`}
                >
                  {type === "suhoor" ? <Coffee className="w-4 h-4" /> : <Utensils className="w-4 h-4" />}
                  {type === "suhoor" ? "Suhoor" : iftarLabel}
                </span>
                {recipe.region && (
                  <Link
                    to={`/recipes?region=${encodeURIComponent(recipe.region)}`}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-sm font-medium bg-muted/60 text-muted-foreground hover:bg-secondary/20 hover:text-secondary border border-border/60 transition-colors"
                    title={`Filter recipes by region: ${recipe.region}`}
                  >
                    <Globe className="w-3.5 h-3.5" aria-hidden />
                    {recipe.region}
                  </Link>
                )}
              </div>
              <h1 className="text-xl sm:text-2xl md:text-4xl font-display font-bold break-words">{recipe.name}</h1>
              <p className="text-muted-foreground mt-2 sm:mt-3 text-sm sm:text-base max-w-2xl">
                {recipe.name} is a {mealLabel.toLowerCase()} recipe for Ramadan{recipe.region ? ` from ${recipe.region}` : ""}. {recipe.description}
                {recipe.ingredients.length > 0 && ` Ingredients include ${getRecipeIngredientStrings(recipe, 1).slice(0, 4).join(", ")}.`}
              </p>
            </header>

            {recipe.significance && (
              <section className="p-4 rounded-2xl bg-secondary/10 border border-secondary/20 mb-6" aria-labelledby="significance-heading">
                <h2 id="significance-heading" className="font-medium flex items-center gap-2 mb-2">
                  <BookOpen className="w-4 h-4 text-secondary" aria-hidden />
                  Cultural significance
                </h2>
                <p className="text-sm">{recipe.significance}</p>
              </section>
            )}

            {country && (
              <section className="mb-6">
                <h2 className="sr-only">Part of this culture</h2>
                <Link
                  to={`/culture/${country.id}`}
                  className="inline-flex items-center gap-2 p-4 rounded-2xl bg-card border border-border hover:border-secondary/50 transition-all"
                >
                  <span className="text-2xl" aria-hidden>{country.flag}</span>
                  <div>
                    <span className="font-medium">Part of {country.name} traditions</span>
                    <p className="text-sm text-muted-foreground">Explore Ramadan customs in {country.name}</p>
                  </div>
                  <Globe className="w-5 h-5 text-muted-foreground ml-auto" aria-hidden />
                </Link>
              </section>
            )}

            <section className="mb-6" aria-labelledby="ingredients-heading">
              <div className="flex flex-wrap items-center justify-between gap-4 mb-3">
                <h2 id="ingredients-heading" className="font-display font-bold text-lg">Ingredients</h2>
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-muted-foreground" aria-hidden />
                  <label htmlFor="recipe-portions" className="text-sm font-medium text-muted-foreground">
                    Servings
                  </label>
                  <select
                    id="recipe-portions"
                    value={portions}
                    onChange={(e) => setPortions(Number(e.target.value))}
                    className="rounded-lg border border-border bg-background px-3 py-1.5 text-sm font-medium focus:outline-none focus-visible:ring-2 focus-visible:ring-secondary"
                    aria-label="Number of servings"
                  >
                    {[1, 2, 3, 4, 5, 6, 8, 10, 12].map((n) => (
                      <option key={n} value={n}>
                        {n} {n === 1 ? "serving" : "servings"}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              {portions !== defaultServings && (
                <p className="text-xs text-muted-foreground mb-2">
                  Amounts scaled for {portions} {portions === 1 ? "serving" : "servings"} (recipe written for {defaultServings}).
                </p>
              )}
              <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                {recipe.ingredients.map((ing, i) => (
                  <li key={i}>{getIngredientDisplay(ing, multiplier)}</li>
                ))}
              </ul>
            </section>

            {recipe.steps && recipe.steps.length > 0 && (
              <section className="mb-6" aria-labelledby="steps-heading">
                <h2 id="steps-heading" className="font-display font-bold text-lg mb-3 flex items-center gap-2">
                  <ListOrdered className="w-5 h-5 text-secondary" aria-hidden />
                  Instructions
                </h2>
                <ol className="list-decimal list-inside space-y-2 text-muted-foreground">
                  {recipe.steps.map((step, i) => (
                    <li key={i} className="pl-1">{step}</li>
                  ))}
                </ol>
              </section>
            )}

            <section className="mb-6" aria-labelledby="details-heading">
              <h2 id="details-heading" className="font-display font-bold text-lg mb-3">Details</h2>
              <div className="flex flex-wrap gap-4 text-sm">
                <span className="flex items-center gap-1">
                  <Clock className="w-4 h-4" aria-hidden />
                  Prep: {recipe.prepTime}
                </span>
                {recipe.cookTime && (
                  <span className="flex items-center gap-1">
                    <Clock className="w-4 h-4" aria-hidden />
                    Cook: {recipe.cookTime}
                  </span>
                )}
                {recipe.totalTime && (
                  <span className="flex items-center gap-1">
                    <Clock className="w-4 h-4" aria-hidden />
                    Total: {recipe.totalTime}
                  </span>
                )}
                {recipe.nutrition && (
                  <span>
                    {recipe.nutrition.calories} cal · P: {recipe.nutrition.protein} · C: {recipe.nutrition.carbs} · F: {recipe.nutrition.fat}
                  </span>
                )}
              </div>
              <p className="mt-2 text-muted-foreground flex items-start gap-2">
                <Flame className="w-4 h-4 shrink-0 mt-0.5" aria-hidden />
                {recipe.benefits}
              </p>
              <p className="mt-2 text-secondary text-sm flex items-start gap-2">
                <span className="shrink-0">💡</span>
                {recipe.tips}
              </p>
            </section>

            {recipe.dietary && recipe.dietary.length > 0 && (
              <p className="text-xs text-muted-foreground">
                Dietary: {recipe.dietary.map((d) => d.replace("-", " ")).join(", ")}
              </p>
            )}

            {recipe.sources && recipe.sources.length > 0 && (
              <section className="mt-6 p-4 rounded-2xl bg-muted/30 border border-border" aria-labelledby="recipe-sources-heading">
                <h2 id="recipe-sources-heading" className="font-display font-bold text-sm mb-2 flex items-center gap-2">
                  <ExternalLink className="w-4 h-4 text-secondary" aria-hidden />
                  Sources & further reading
                </h2>
                <ul className="space-y-1.5">
                  {recipe.sources.map((s, i) => (
                    <li key={i}>
                      <a href={s.url} target="_blank" rel="noopener noreferrer" className="text-sm text-secondary hover:underline inline-flex items-center gap-1.5">
                        <ExternalLink className="w-3.5 h-3.5 flex-shrink-0" aria-hidden />
                        {s.title}
                      </a>
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {(() => {
              const similar = getSimilarRecipes(recipe, type, recipe.id, 6);
              if (similar.length === 0) return null;
              return (
                <section className="mt-8 pt-6 border-t border-border" aria-labelledby="similar-recipes-heading">
                  <h2 id="similar-recipes-heading" className="font-display font-bold text-lg mb-3">
                    Similar recipes
                  </h2>
                  <p className="text-sm text-muted-foreground mb-4">
                    More {type === "suhoor" ? "suhoor" : "iftar"} ideas from the same region, country, or with overlapping ingredients.
                  </p>
                  <ul className="space-y-2">
                    {similar.map(({ mealType: mt, recipe: r }) => (
                      <li key={`${mt}-${r.id}`}>
                        <Link
                          to={`/recipe/${mt}/${r.id}`}
                          className="flex items-center gap-2 p-3 rounded-xl bg-card border border-border hover:border-secondary/50 transition-all group"
                        >
                          <span className="font-medium flex-1 min-w-0">{r.name}</span>
                          {r.region && <span className="text-xs text-muted-foreground shrink-0">{r.region}</span>}
                          <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-secondary shrink-0" aria-hidden />
                        </Link>
                      </li>
                    ))}
                  </ul>
                </section>
              );
            })()}
          </motion.article>
        </div>
      </main>
      <Footer />
    </div>
  );
}
