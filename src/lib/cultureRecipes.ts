/**
 * Maps recipes to culture countries by ID. Country IDs match cultural-traditions.json.
 * Used for culture-based recipe search and cross-linking recipe ↔ country pages.
 */

import recipesData from "@/data/recipes.json";
import culturalData from "@/data/cultural-traditions.json";

export type MealType = "suhoor" | "iftar";

/** One ingredient: name only (string) or name + optional amount for scaling (object). */
export type RecipeIngredient = string | { name: string; amount?: string };

export interface Recipe {
  id: number;
  name: string;
  region: string;
  description: string;
  /** Ingredients with optional amounts. Amounts are for defaultServings and scale with portions. */
  ingredients: RecipeIngredient[];
  /** Default number of servings (portions); used when scaling. Default 4 if omitted. */
  defaultServings?: number;
  prepTime: string;
  /** Active cooking time (e.g. "25 min"). Optional; when set, shown with prep on detail page. */
  cookTime?: string;
  /** Total time (e.g. "45 min"). Optional; when set, shown as total. If omitted and cookTime present, can be derived from prep + cook. */
  totalTime?: string;
  benefits: string;
  tips: string;
  countryId?: string | null;
  nutrition?: { calories: number; protein: string; carbs: string; fat: string };
  significance?: string;
  dietary?: string[];
  /** Step-by-step instructions (optional). When present, shown on recipe detail page. */
  steps?: string[];
  /** Optional hyperlink sources for authenticity and discovery. */
  sources?: SourceLink[];
  /** Optional emoji for inline display with food (e.g. 🥣 🍲). Use when it accurately represents the dish. */
  emoji?: string;
}

export interface CityPractice {
  name: string;
  suhoor_meals: string[];
  iftar_meals: string[];
  desserts_and_drinks: string[];
  rituals_and_traditions: string[];
  notes: string;
}

export interface MajorMosque {
  name: string;
  city?: string;
  note?: string;
  /** Street address or area (e.g. "Al Haram, Mecca") for display and maps */
  address?: string;
  /** Google Maps link: open in Google Maps */
  googleMapsUrl?: string;
  /** Apple Maps link: open in Apple Maps */
  appleMapsUrl?: string;
}

/** Optional source link for fact-checking and discovery. */
export interface SourceLink {
  title: string;
  url: string;
}

export interface Country {
  id: string;
  name: string;
  flag: string;
  regionId: string;
  regionName: string;
  traditions: { name: string; arabicName?: string; transliteration?: string; description: string; sources?: SourceLink[] }[];
  foods: string[];
  specialNote: string;
  cities?: CityPractice[];
  /** Muslim population (e.g. "~95%", "242 million (87%)") */
  muslimPopulation?: string;
  /** Short note on Muslim community (e.g. "World's largest Muslim-majority country") */
  muslimPopulationNote?: string;
  majorMosques?: MajorMosque[];
  /** Optional hyperlink sources for traditions and culture (fact-checking, SEO). */
  sources?: SourceLink[];
}

const recipes = recipesData as { suhoor: Recipe[]; iftar: Recipe[] };
const culture = culturalData as {
  regions: {
    id: string;
    name: string;
    countries: {
      id: string;
      name: string;
      flag: string;
      traditions: Country["traditions"];
      foods: string[];
      specialNote: string;
      cities?: CityPractice[];
      muslimPopulation?: string;
      muslimPopulationNote?: string;
      majorMosques?: MajorMosque[];
      sources?: SourceLink[];
    }[];
  }[];
};

/** All countries flattened with regionId and regionName for lookup and SEO */
export function getAllCountries(): Country[] {
  return culture.regions.flatMap((r) =>
    r.countries.map((c) => ({
      id: c.id,
      name: c.name,
      flag: c.flag,
      regionId: r.id,
      regionName: r.name,
      traditions: c.traditions,
      foods: c.foods,
      specialNote: c.specialNote,
      cities: c.cities,
      muslimPopulation: c.muslimPopulation,
      muslimPopulationNote: c.muslimPopulationNote,
      majorMosques: c.majorMosques,
      sources: c.sources,
    }))
  );
}

/** Get country by ID (for /culture/:countryId pages) */
export function getCountryById(countryId: string): Country | undefined {
  return getAllCountries().find((c) => c.id === countryId);
}

/** All country IDs for validation and sitemap */
export function getAllCountryIds(): string[] {
  return getAllCountries().map((c) => c.id);
}

/** All recipes with mealType; optionally filter by countryId or region */
export function getRecipes(options?: { countryId?: string; mealType?: MealType; region?: string }): { mealType: MealType; recipe: Recipe }[] {
  const out: { mealType: MealType; recipe: Recipe }[] = [];
  (["suhoor", "iftar"] as const).forEach((mealType) => {
    if (options?.mealType && options.mealType !== mealType) return;
    const list = recipes[mealType];
    list.forEach((recipe) => {
      if (options?.countryId && recipe.countryId !== options.countryId) return;
      if (options?.region && recipe.region !== options.region) return;
      out.push({ mealType, recipe });
    });
  });
  return out;
}

/** Sorted list of unique region names from all recipes (for filters). */
export function getAllRegions(): string[] {
  const set = new Set<string>();
  (["suhoor", "iftar"] as const).forEach((mealType) => {
    recipes[mealType].forEach((r) => {
      if (r.region?.trim()) set.add(r.region.trim());
    });
  });
  return Array.from(set).sort((a, b) => a.localeCompare(b));
}

/** Short stopwords to skip when comparing description/keyword overlap (reduces noise). */
const DESC_STOP = new Set(["the", "and", "for", "with", "from", "this", "that", "are", "was", "has", "have", "can", "its", "it's", "you", "your", "our", "all", "any", "but", "not", "into", "out", "over", "such", "than", "then", "when", "which", "while", "will", "just", "also", "more", "most", "some", "very", "only", "same", "other", "each", "both", "few", "during", "before", "after", "being", "been"]);

function tokenizeForSimilarity(text: string): Set<string> {
  return new Set(
    text
      .toLowerCase()
      .replace(/[^\w\s]/g, " ")
      .split(/\s+/)
      .filter((w) => w.length > 1 && !DESC_STOP.has(w))
  );
}

/** Get ingredient tokens (e.g. "olive oil" → ["olive", "oil"]) for partial matching. */
function getIngredientTokens(ingredients: RecipeIngredient[]): Set<string> {
  const tokens = new Set<string>();
  (ingredients ?? []).forEach((i) => {
    const name = getIngredientName(i).toLowerCase().trim();
    name.replace(/[^\w\s]/g, " ").split(/\s+/).filter(Boolean).forEach((t) => tokens.add(t));
  });
  return tokens;
}

/** Score another recipe for similarity: country, region, meal type, ingredients, name, description. */
function scoreSimilarity(
  current: Recipe,
  currentMealType: MealType,
  candidate: Recipe,
  candidateMealType: MealType
): number {
  let score = 0;
  if (current.countryId && current.countryId === candidate.countryId) score += 3;
  if (current.region && current.region === candidate.region) score += 2;
  if (currentMealType === candidateMealType) score += 1;

  const currentIngNames = new Set(
    (current.ingredients ?? []).map((i) => getIngredientName(i).toLowerCase().trim())
  );
  const currentIngTokens = getIngredientTokens(current.ingredients ?? []);
  const candidateIngNames = (candidate.ingredients ?? []).map((i) => getIngredientName(i).toLowerCase().trim());
  candidateIngNames.forEach((name) => {
    if (currentIngNames.has(name)) score += 2;
    else if ([...currentIngNames].some((cur) => cur.includes(name) || name.includes(cur))) score += 1;
    else {
      const candTokens = name.replace(/[^\w\s]/g, " ").split(/\s+/).filter(Boolean);
      if (candTokens.some((t) => currentIngTokens.has(t))) score += 1;
    }
  });

  const currentNameWords = tokenizeForSimilarity(current.name);
  candidate.name
    .toLowerCase()
    .replace(/[^\w\s]/g, " ")
    .split(/\s+/)
    .filter(Boolean)
    .forEach((w) => {
      if (currentNameWords.has(w)) score += 1;
    });

  const currentDescWords = tokenizeForSimilarity((current.description ?? "") + " " + (current.significance ?? ""));
  const candidateDescWords = tokenizeForSimilarity((candidate.description ?? "") + " " + (candidate.significance ?? ""));
  let descOverlap = 0;
  currentDescWords.forEach((w) => {
    if (candidateDescWords.has(w)) descOverlap++;
  });
  score += Math.min(descOverlap * 0.5, 2);

  return score;
}

/** Get similar recipes by country, region, meal type, ingredients, name, description. Excludes current recipe. Falls back to same region then same meal when few scored matches. */
export function getSimilarRecipes(
  recipe: Recipe,
  currentMealType: MealType,
  currentRecipeId: number,
  limit: number = 6
): { mealType: MealType; recipe: Recipe }[] {
  const candidates: { mealType: MealType; recipe: Recipe; score: number }[] = [];
  const seen = new Set<string>();
  const key = (mt: MealType, r: Recipe) => `${mt}-${r.id}`;
  const isCurrent = (mt: MealType, r: Recipe) => r.id === currentRecipeId && mt === currentMealType;

  (["suhoor", "iftar"] as const).forEach((mealType) => {
    recipes[mealType].forEach((r) => {
      if (isCurrent(mealType, r)) return;
      const score = scoreSimilarity(recipe, currentMealType, r, mealType);
      if (score > 0) candidates.push({ mealType, recipe: r, score });
    });
  });
  candidates.sort((a, b) => b.score - a.score);
  const out: { mealType: MealType; recipe: Recipe }[] = candidates.slice(0, limit).map(({ mealType, recipe: r }) => {
    seen.add(key(mealType, r));
    return { mealType, recipe: r };
  });

  if (out.length >= limit) return out;

  const fallback: { mealType: MealType; recipe: Recipe }[] = [];
  (["suhoor", "iftar"] as const).forEach((mealType) => {
    recipes[mealType].forEach((r) => {
      if (isCurrent(mealType, r) || seen.has(key(mealType, r))) return;
      if (recipe.region && r.region === recipe.region) fallback.push({ mealType, recipe: r });
    });
  });
  fallback.forEach((x) => {
    if (out.length >= limit) return;
    if (seen.has(key(x.mealType, x.recipe))) return;
    seen.add(key(x.mealType, x.recipe));
    out.push(x);
  });

  if (out.length >= limit) return out;
  (["suhoor", "iftar"] as const).forEach((mealType) => {
    recipes[mealType].forEach((r) => {
      if (out.length >= limit || isCurrent(mealType, r) || seen.has(key(mealType, r))) return;
      if (mealType === currentMealType) {
        seen.add(key(mealType, r));
        out.push({ mealType, recipe: r });
      }
    });
  });

  return out;
}

/** Get a single recipe by mealType and id */
export function getRecipe(mealType: MealType, id: number): Recipe | undefined {
  const list = recipes[mealType];
  return list.find((r) => r.id === id);
}

/** Get recipe and mealType by mealType + id (for detail page) */
export function getRecipeWithType(mealType: MealType, id: number): { recipe: Recipe; mealType: MealType } | undefined {
  const recipe = getRecipe(mealType, id);
  return recipe ? { recipe, mealType } : undefined;
}

/** Get country for a recipe (for "Part of X traditions" link) */
export function getCountryForRecipe(recipe: Recipe): Country | undefined {
  if (!recipe.countryId) return undefined;
  return getCountryById(recipe.countryId);
}

/** Parse nutrition string e.g. "22g" to number for macros */
export function parseNutrient(s: string | undefined): number {
  if (s == null || s === "") return 0;
  const n = parseFloat(s.replace(/[^\d.]/g, ""));
  return Number.isFinite(n) ? n : 0;
}

/** Parse time string (e.g. "20 min", "45 min (+ overnight)") to minutes for filtering. Uses first number before "min". */
export function parseTimeToMinutes(s: string | undefined): number {
  if (s == null || s === "") return 0;
  const match = s.match(/(\d+)\s*min/);
  return match ? parseInt(match[1], 10) : 0;
}

/** Total active cooking + prep time in minutes (from totalTime, or prep + cook). For filters. */
export function getTotalTimeMinutes(recipe: Recipe): number {
  const fromTotal = parseTimeToMinutes(recipe.totalTime);
  if (fromTotal > 0) return fromTotal;
  const prep = parseTimeToMinutes(recipe.prepTime);
  const cook = parseTimeToMinutes(recipe.cookTime);
  return prep + cook;
}

/** Normalize ingredient to { name, amount? }. Handles legacy string ingredients. */
export function normalizeIngredient(ing: RecipeIngredient): { name: string; amount?: string } {
  if (typeof ing === "string") return { name: ing };
  return { name: ing.name, amount: ing.amount };
}

/** Get display name of ingredient (for search, labels). */
export function getIngredientName(ing: RecipeIngredient): string {
  return typeof ing === "string" ? ing : ing.name;
}

/** Parse amount string (e.g. "2 cups", "1/2 tsp") to numeric value and unit for scaling. */
export function parseAmount(amountStr: string): { num: number; unit: string } {
  const s = (amountStr ?? "").trim();
  if (!s) return { num: 0, unit: "" };
  // Match "1 1/2", "1/2", "2.5", "2" at start, rest is unit
  const mixed = s.match(/^(\d+)\s+(\d+)\/(\d+)\s*(.*)$/);
  if (mixed) {
    const whole = parseInt(mixed[1], 10);
    const num = whole + parseInt(mixed[2], 10) / parseInt(mixed[3], 10);
    return { num, unit: (mixed[4] ?? "").trim() };
  }
  const frac = s.match(/^(\d+)\/(\d+)\s*(.*)$/);
  if (frac) {
    const num = parseInt(frac[1], 10) / parseInt(frac[2], 10);
    return { num, unit: (frac[3] ?? "").trim() };
  }
  const numMatch = s.match(/^([\d.]+)\s*(.*)$/);
  if (numMatch) {
    const num = parseFloat(numMatch[1]);
    return { num: Number.isFinite(num) ? num : 0, unit: (numMatch[2] ?? "").trim() };
  }
  return { num: 0, unit: s };
}

/** Format a scaled number for display (e.g. 2.5 -> "2 1/2", 1 -> "1"). */
function formatScaledNum(n: number): string {
  if (n <= 0 || !Number.isFinite(n)) return "0";
  const int = Math.floor(n);
  const dec = n - int;
  if (dec < 0.05) return int.toString();
  if (Math.abs(dec - 0.25) < 0.05) return int ? `${int} 1/4` : "1/4";
  if (Math.abs(dec - 0.33) < 0.08) return int ? `${int} 1/3` : "1/3";
  if (Math.abs(dec - 0.5) < 0.05) return int ? `${int} 1/2` : "1/2";
  if (Math.abs(dec - 0.67) < 0.08) return int ? `${int} 2/3` : "2/3";
  if (Math.abs(dec - 0.75) < 0.05) return int ? `${int} 3/4` : "3/4";
  if (int === 0 && n < 1) return n.toFixed(2).replace(/\.?0+$/, "") || String(n);
  return n.toFixed(1).replace(/\.0$/, "") || String(n);
}

/** Scale an amount string by multiplier (e.g. portions / defaultServings). Returns display string. */
export function scaleAmount(amountStr: string | undefined, multiplier: number): string {
  if (!amountStr?.trim() || multiplier <= 0 || !Number.isFinite(multiplier)) return "";
  const { num, unit } = parseAmount(amountStr);
  if (num <= 0) return unit ? amountStr : "";
  const scaled = num * multiplier;
  const formatted = formatScaledNum(scaled);
  return unit ? `${formatted} ${unit}` : formatted;
}

/** Get ingredient display line (amount + name) for a given portions multiplier. multiplier = portions / defaultServings. */
export function getIngredientDisplay(ing: RecipeIngredient, multiplier: number): string {
  const { name, amount } = normalizeIngredient(ing);
  if (!amount) return name;
  const scaled = scaleAmount(amount, multiplier);
  return scaled ? `${scaled} ${name}` : name;
}

/** Get default number of servings for a recipe (for scaling). */
export function getDefaultServings(recipe: Recipe): number {
  return recipe.defaultServings ?? 4;
}

/** Ingredients as plain strings for JSON-LD / display without amounts (e.g. "2 cups flour" or "flour"). */
export function getRecipeIngredientStrings(recipe: Recipe, multiplier: number = 1): string[] {
  return (recipe.ingredients ?? []).map((ing) => getIngredientDisplay(ing, multiplier));
}

/** Whether recipe's ingredients list includes a term (case-insensitive substring). */
export function recipeHasIngredient(recipe: Recipe, searchTerm: string): boolean {
  const term = searchTerm.trim().toLowerCase();
  if (term === "") return true;
  return (recipe.ingredients ?? []).some((i) => getIngredientName(i).toLowerCase().includes(term));
}
