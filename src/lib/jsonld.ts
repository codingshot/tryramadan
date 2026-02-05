/**
 * Structured data (JSON-LD) for SEO. Injected by main.tsx so we can use CSP script-src 'self' without inline scripts.
 * See https://developers.google.com/search/docs/appearance/structured-data
 */
const WEB_APP_SCHEMA = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "TryRamadan.app",
  url: "https://tryramadan.app",
  description:
    "Fast like a Muslim for the holy month of Ramadan. A free app with prayer times, suhoor & iftar, cultural education, and progressive fasting for everyone.",
  applicationCategory: "HealthApplication",
  operatingSystem: "Web",
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "USD",
  },
  creator: {
    "@type": "Organization",
    name: "ummah.build",
    url: "https://ummah.build",
  },
  featureList: [
    "Progressive fasting programs",
    "Cultural education about Ramadan",
    "Smart fasting timer with suhoor and iftar times",
    "Health and safety features",
    "Daily hadith and Islamic wisdom",
    "Meal planning suggestions",
  ],
};

const FAQ_SCHEMA = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "What is TryRamadan.app?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "TryRamadan.app lets you fast like a Muslim for the holy month of Ramadan. It's a free app with prayer times, suhoor and iftar reminders, cultural education, and progressive fasting programs for everyone.",
      },
    },
    {
      "@type": "Question",
      name: "Is TryRamadan.app free?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes, TryRamadan.app is completely free to use. There are no hidden costs or subscriptions required.",
      },
    },
    {
      "@type": "Question",
      name: "Can Muslims use TryRamadan.app?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Absolutely! Muslims can use TryRamadan.app to track their fasting, learn more about Ramadan traditions, and access prayer times and daily hadith.",
      },
    },
  ],
};

/** Build FAQPage schema from FAQ items. Used by FAQ page for per-page structured data. */
export function buildFAQPageSchema(
  items: { q: string; a: string }[],
  pageUrl: string
): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map(({ q, a }) => ({
      "@type": "Question",
      name: q,
      acceptedAnswer: { "@type": "Answer", text: a },
    })),
    url: pageUrl,
  };
}

/** Convert "10 min" or "1 hr" to ISO 8601 duration (e.g. PT10M, PT1H). */
function toISODuration(value: string | undefined): string | undefined {
  if (!value || typeof value !== "string") return undefined;
  const trimmed = value.trim();
  const minMatch = trimmed.match(/^(\d+)\s*min/i);
  if (minMatch) return `PT${minMatch[1]}M`;
  const hrMatch = trimmed.match(/^(\d+)\s*(?:hr|hour)s?/i);
  if (hrMatch) return `PT${hrMatch[1]}H`;
  return undefined;
}

/** Build Recipe schema for recipe detail pages. Full schema for rich results and AI discovery. */
export function buildRecipeSchema(params: {
  name: string;
  description: string;
  url: string;
  recipeCategory: string;
  recipeCuisine?: string;
  ingredients?: string[];
  steps?: string[];
  prepTime?: string;
  cookTime?: string;
  totalTime?: string;
  calories?: number;
  protein?: string;
  carbs?: string;
  fat?: string;
}): Record<string, unknown> {
  const recipe: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Recipe",
    name: params.name,
    description: params.description,
    url: params.url,
    recipeCategory: params.recipeCategory,
    author: {
      "@type": "Organization",
      name: "TryRamadan",
      url: "https://tryramadan.app",
    },
  };
  if (params.recipeCuisine) recipe.recipeCuisine = params.recipeCuisine;
  if (params.ingredients?.length) recipe.recipeIngredient = params.ingredients;
  if (params.steps?.length) {
    recipe.recipeInstructions = params.steps.map((text) => ({
      "@type": "HowToStep",
      text,
    }));
  }
  const prep = toISODuration(params.prepTime);
  if (prep) recipe.prepTime = prep;
  const cook = toISODuration(params.cookTime);
  if (cook) recipe.cookTime = cook;
  const total = toISODuration(params.totalTime);
  if (total) recipe.totalTime = total;
  if (
    params.calories != null ||
    params.protein ||
    params.carbs ||
    params.fat
  ) {
    const nutrition: Record<string, unknown> = { "@type": "NutritionInformation" };
    if (params.calories != null) nutrition.calories = `${params.calories} calories`;
    if (params.protein) nutrition.proteinContent = params.protein;
    if (params.carbs) nutrition.carbohydrateContent = params.carbs;
    if (params.fat) nutrition.fatContent = params.fat;
    recipe.nutrition = nutrition;
  }
  return recipe;
}

/** ItemList for recipe listing and other collection pages. */
export function buildRecipeListSchema(
  recipes: { name: string; url: string; mealType: string }[],
  pageUrl: string
): Record<string, unknown> {
  const baseUrl = "https://tryramadan.app";
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    url: pageUrl.startsWith("http") ? pageUrl : `https://tryramadan.app${pageUrl.startsWith("/") ? pageUrl : `/${pageUrl}`}`,
    name: "Ramadan recipes: suhoor and iftar by culture",
    description: "Suhoor (pre-dawn) and iftar (break-fast) recipes from Muslim communities worldwide. Filter by culture or meal type.",
    numberOfItems: recipes.length,
    itemListElement: recipes.slice(0, 50).map((r, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: r.name,
      url: r.url.startsWith("http") ? r.url : `${baseUrl}${r.url.startsWith("/") ? r.url : `/${r.url}`}`,
      item: {
        "@type": "Recipe",
        name: r.name,
        recipeCategory: r.mealType,
      },
    })),
  };
}

/** BreadcrumbList for recipe and culture detail pages. */
export function buildBreadcrumbSchema(
  items: { name: string; url: string }[]
): Record<string, unknown> {
  const baseUrl = "https://tryramadan.app";
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: item.url.startsWith("http") ? item.url : `${baseUrl}${item.url.startsWith("/") ? item.url : `/${item.url}`}`,
    })),
  };
}

/** Inject JSON-LD script tags into document.head. Call once from main.tsx. */
export function injectJsonLd(): void {
  if (typeof document === "undefined") return;
  const scripts = [
    { id: "jsonld-webapp", data: WEB_APP_SCHEMA },
    { id: "jsonld-faq", data: FAQ_SCHEMA },
  ];
  scripts.forEach(({ id, data }) => {
    if (document.getElementById(id)) return;
    const script = document.createElement("script");
    script.id = id;
    script.type = "application/ld+json";
    script.textContent = JSON.stringify(data);
    document.head.appendChild(script);
  });
}
