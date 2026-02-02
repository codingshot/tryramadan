/**
 * Maps recipes to culture countries by ID. Country IDs match cultural-traditions.json.
 * Used for culture-based recipe search and cross-linking recipe ↔ country pages.
 */

import recipesData from "@/data/recipes.json";
import culturalData from "@/data/cultural-traditions.json";

export type MealType = "suhoor" | "iftar";

export interface Recipe {
  id: number;
  name: string;
  region: string;
  description: string;
  ingredients: string[];
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

export interface Country {
  id: string;
  name: string;
  flag: string;
  regionId: string;
  regionName: string;
  traditions: { name: string; arabicName?: string; transliteration?: string; description: string }[];
  foods: string[];
  specialNote: string;
  cities?: CityPractice[];
  /** Muslim population (e.g. "~95%", "242 million (87%)") */
  muslimPopulation?: string;
  /** Short note on Muslim community (e.g. "World's largest Muslim-majority country") */
  muslimPopulationNote?: string;
  majorMosques?: MajorMosque[];
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

/** All recipes with mealType; optionally filter by countryId */
export function getRecipes(options?: { countryId?: string; mealType?: MealType }): { mealType: MealType; recipe: Recipe }[] {
  const out: { mealType: MealType; recipe: Recipe }[] = [];
  (["suhoor", "iftar"] as const).forEach((mealType) => {
    if (options?.mealType && options.mealType !== mealType) return;
    const list = recipes[mealType];
    list.forEach((recipe) => {
      if (options?.countryId && recipe.countryId !== options.countryId) return;
      out.push({ mealType, recipe });
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
