/**
 * Reusable JSON-LD builders for SEO and AEO.
 * Use with <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(obj) }} />
 * or inject via document for dynamic pages.
 */

const SITE_URL = "https://tryramadan.app";

export interface FAQItem {
  q: string;
  a: string;
}

/** Build FAQPage schema from Q&A pairs (for /faq and similar). */
export function buildFAQPageSchema(items: FAQItem[], pageUrl = `${SITE_URL}/faq`) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "@id": `${pageUrl}#faqpage`,
    url: pageUrl,
    mainEntity: items.map((item) => ({
      "@type": "Question" as const,
      name: item.q,
      acceptedAnswer: { "@type": "Answer" as const, text: item.a },
    })),
  };
}

export interface RecipeSchemaInput {
  name: string;
  description: string;
  url: string;
  image?: string;
  recipeCategory?: string;
  recipeCuisine?: string;
  calories?: number;
  protein?: string;
  carbs?: string;
  fat?: string;
}

/** Build Recipe schema for recipe detail pages. */
export function buildRecipeSchema(input: RecipeSchemaInput) {
  const { name, description, url, image, recipeCategory, recipeCuisine, calories, protein, carbs, fat } = input;
  const schema: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Recipe",
    name,
    description,
    url: url.startsWith("http") ? url : `${SITE_URL}${url.startsWith("/") ? url : `/${url}`}`,
  };
  if (image) schema.image = image.startsWith("http") ? image : `${SITE_URL}${image}`;
  if (recipeCategory) schema.recipeCategory = recipeCategory;
  if (recipeCuisine) schema.recipeCuisine = recipeCuisine;
  if (calories != null || protein || carbs || fat) {
    schema.nutrition = {
      "@type": "NutritionInformation",
      ...(calories != null && { calories: `${calories} calories` }),
      ...(protein && { proteinContent: protein }),
      ...(carbs && { carbohydrateContent: carbs }),
      ...(fat && { fatContent: fat }),
    };
  }
  return schema;
}
