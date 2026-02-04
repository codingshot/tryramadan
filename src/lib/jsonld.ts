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

/** Build Recipe schema for recipe detail pages. Used by RecipeDetail for structured data. */
export function buildRecipeSchema(params: {
  name: string;
  description: string;
  url: string;
  recipeCategory: string;
}): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "Recipe",
    name: params.name,
    description: params.description,
    url: params.url,
    recipeCategory: params.recipeCategory,
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
