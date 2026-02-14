import { useState, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Coffee, Utensils, Clock, Globe, BookOpen, Flame, ListOrdered, ExternalLink, Users, ChevronRight, Download, Share2, Image, Printer } from "lucide-react";
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
import { getRecipeAsText, getRecipeAsMarkdown, getRecipeAsJson, downloadString } from "@/lib/recipeExport";
import { RecipeShareCard, type RecipeCardStyle } from "@/components/RecipeShareCard";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { toast } from "sonner";

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
  const [exportPopoverOpen, setExportPopoverOpen] = useState(false);
  const [imageCardStyle, setImageCardStyle] = useState<RecipeCardStyle>("full");
  const [generatingImage, setGeneratingImage] = useState(false);
  const recipeCardRef = useRef<HTMLDivElement>(null);

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

  const handleDownload = (format: "text" | "json" | "markdown") => {
    const baseName = recipe.name.replace(/[^\w\s-]/g, "").replace(/\s+/g, "-").slice(0, 40);
    if (format === "text") {
      downloadString(getRecipeAsText(recipe, mealLabel, portions, multiplier), `${baseName}.txt`, "text/plain");
      toast.success("Downloaded as text");
    } else if (format === "json") {
      downloadString(getRecipeAsJson(recipe, mealLabel, portions, multiplier), `${baseName}.json`, "application/json");
      toast.success("Downloaded as JSON");
    } else {
      downloadString(getRecipeAsMarkdown(recipe, mealLabel, portions, multiplier), `${baseName}.md`, "text/markdown");
      toast.success("Downloaded as Markdown");
    }
    setExportPopoverOpen(false);
  };

  const handleGenerateImage = async () => {
    if (!recipeCardRef.current) return;
    setGeneratingImage(true);
    try {
      const html2canvas = (await import("html2canvas")).default;
      const canvas = await html2canvas(recipeCardRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: "#1a1a1a",
        logging: false,
      });
      const dataUrl = canvas.toDataURL("image/png");
      const fileName = `${recipe.name.replace(/[^\w\s-]/g, "").replace(/\s+/g, "-").slice(0, 30)}-recipe.png`;

      if (navigator.share && navigator.canShare?.({ files: [] })) {
        try {
          const blob = await (await fetch(dataUrl)).blob();
          const file = new File([blob], fileName, { type: "image/png" });
          if (navigator.canShare({ files: [file] })) {
            await navigator.share({
              title: recipe.name,
              text: `${mealLabel} recipe from TryRamadan`,
              files: [file],
            });
            toast.success("Image shared");
            setExportPopoverOpen(false);
            return;
          } catch (e) {
            if ((e as Error).name !== "AbortError") throw e;
          }
        } catch {
          // fall back to download
        }
      }
      const a = document.createElement("a");
      a.href = dataUrl;
      a.download = fileName;
      a.click();
      toast.success("Image downloaded");
      setExportPopoverOpen(false);
    } catch (err) {
      toast.error("Could not generate image");
      console.error(err);
    } finally {
      setGeneratingImage(false);
    }
  };

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
            <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
              <Link
                to="/recipes"
                className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground min-h-[44px] items-center"
              >
                <ArrowLeft className="w-4 h-4 flex-shrink-0" aria-hidden />
                Back to Recipes
              </Link>
              <Popover open={exportPopoverOpen} onOpenChange={setExportPopoverOpen}>
                <PopoverTrigger asChild>
                  <button
                    type="button"
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-border bg-muted/50 hover:bg-muted text-sm font-medium min-h-[44px]"
                    aria-label="Download or share recipe"
                  >
                    <Download className="w-4 h-4" aria-hidden />
                    Download / Share
                  </button>
                </PopoverTrigger>
                <PopoverContent align="end" className="w-[min(100vw-2rem,360px)] p-4" aria-label="Recipe download and share options">
                  <h3 className="font-semibold text-sm mb-3 flex items-center gap-2">
                    <Download className="w-4 h-4" aria-hidden />
                    Download recipe
                  </h3>
                  <p className="text-xs text-muted-foreground mb-3">Save in different formats.</p>
                  <div className="flex flex-wrap gap-2 mb-4">
                    <button
                      type="button"
                      onClick={() => handleDownload("text")}
                      className="px-3 py-2 rounded-lg border border-border bg-background hover:bg-muted text-sm font-medium"
                    >
                      Plain text
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDownload("json")}
                      className="px-3 py-2 rounded-lg border border-border bg-background hover:bg-muted text-sm font-medium"
                    >
                      JSON
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDownload("markdown")}
                      className="px-3 py-2 rounded-lg border border-border bg-background hover:bg-muted text-sm font-medium"
                    >
                      Markdown
                    </button>
                    <button
                      type="button"
                      onClick={() => { window.print(); setExportPopoverOpen(false); toast.success("Print dialog opened — save as PDF from there"); }}
                      className="px-3 py-2 rounded-lg border border-border bg-background hover:bg-muted text-sm font-medium inline-flex items-center gap-1.5"
                    >
                      <Printer className="w-3.5 h-3.5" aria-hidden />
                      Print / PDF
                    </button>
                  </div>
                  <h3 className="font-semibold text-sm mb-2 flex items-center gap-2">
                    <Image className="w-4 h-4" aria-hidden />
                    Recipe image card
                  </h3>
                  <p className="text-xs text-muted-foreground mb-2">Generate an image to share. Pick a card style:</p>
                  <div className="flex flex-wrap gap-2 mb-3">
                    {(["minimal", "full", "nutrition"] as RecipeCardStyle[]).map((style) => (
                      <button
                        key={style}
                        type="button"
                        onClick={() => setImageCardStyle(style)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize ${
                          imageCardStyle === style ? "bg-secondary text-secondary-foreground" : "bg-muted/70 hover:bg-muted border border-transparent"
                        }`}
                        aria-pressed={imageCardStyle === style}
                      >
                        {style}
                      </button>
                    ))}
                  </div>
                  <button
                    type="button"
                    onClick={handleGenerateImage}
                    disabled={generatingImage}
                    className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 disabled:opacity-50"
                  >
                    {generatingImage ? (
                      "Generating…"
                    ) : (
                      <>
                        <Share2 className="w-4 h-4" aria-hidden />
                        Generate image &amp; download or share
                      </>
                    )}
                  </button>
                </PopoverContent>
              </Popover>
            </div>

            {/* Off-screen card for html2canvas (rendered when popover open so ref is ready) */}
            {exportPopoverOpen && (
              <div
                style={{ position: "fixed", left: -9999, top: 0, zIndex: -1 }}
                aria-hidden="true"
              >
                <div ref={recipeCardRef}>
                  <RecipeShareCard
                    recipe={recipe}
                    mealLabel={mealLabel}
                    portions={portions}
                    multiplier={multiplier}
                    style={imageCardStyle}
                    forImage
                  />
                </div>
              </div>
            )}

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
                {country && (
                  <Link
                    to={`/culture/${country.id}`}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-sm font-medium bg-muted/60 text-muted-foreground hover:bg-secondary/20 hover:text-secondary border border-border/60 transition-colors"
                    title={`Explore ${country.name} traditions`}
                  >
                    <span aria-hidden>{country.flag}</span>
                    <span>{country.name}</span>
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
