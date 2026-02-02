import { useParams, Link } from "react-router-dom";
import { useEffect } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Coffee, Utensils, ChevronRight, Globe, MapPin, Users, Building2, ExternalLink } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { PageSEO } from "@/components/PageSEO";
import {
  getCountryById,
  getRecipes,
} from "@/lib/cultureRecipes";
import { useIftarLabel } from "@/hooks/useLocalStorage";

const SITE_URL = "https://tryramadan.app";

export default function CultureCountry() {
  const { countryId } = useParams<{ countryId: string }>();
  const iftarLabel = useIftarLabel();
  const country = countryId ? getCountryById(countryId) : undefined;

  if (!country) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="main-content container mx-auto px-4 max-w-4xl min-w-0">
          <h1 className="text-2xl font-display font-bold">Country not found</h1>
          <p className="text-muted-foreground mt-2">This culture or country page doesn't exist.</p>
          <Link to="/culture" className="mt-4 inline-block text-secondary hover:underline">
            Explore all cultures →
          </Link>
        </main>
        <Footer />
      </div>
    );
  }

  const recipesFromCountry = getRecipes({ countryId: country.id });
  const title = `Ramadan in ${country.name} | ${iftarLabel} Traditions, Foods & Mosques | TryRamadan`;
  const description =
    country.specialNote ||
    `Explore Ramadan traditions, foods, and customs in ${country.name}. ${country.traditions.length} traditions and ${country.foods.join(", ")}.`;
  const canonicalPath = `/culture/${country.id}`;
  const canonicalUrl = `${SITE_URL}${canonicalPath}`;
  const keywords = [
    `Ramadan ${country.name}`,
    `${country.name} iftar`,
    `${country.name} suhoor`,
    "Ramadan traditions",
    country.regionName,
    ...country.foods.slice(0, 3),
  ].join(", ");

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        "@id": `${canonicalUrl}#webpage`,
        url: canonicalUrl,
        name: title,
        description: description.slice(0, 160),
        isPartOf: { "@id": `${SITE_URL}#website` },
        about: {
          "@type": "Place",
          name: country.name,
          description: `Ramadan traditions and iftar customs in ${country.name}.`,
        },
      },
      {
        "@type": "Article",
        "@id": `${canonicalUrl}#article`,
        headline: `Ramadan in ${country.name}`,
        description: description.slice(0, 160),
        mainEntityOfPage: { "@id": `${canonicalUrl}#webpage` },
        keywords,
      },
    ],
  };

  useEffect(() => {
    let el = document.querySelector('meta[name="keywords"]');
    if (!el) {
      el = document.createElement("meta");
      el.setAttribute("name", "keywords");
      document.head.appendChild(el);
    }
    el.setAttribute("content", keywords);
  }, [keywords]);

  return (
    <div className="min-h-screen bg-background">
      <PageSEO
        title={title}
        description={description.slice(0, 160)}
        path={canonicalPath}
        type="article"
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Navbar />
      <main className="main-content" role="main" aria-label={`Ramadan traditions in ${country.name}`}>
        <div className="container mx-auto px-4 max-w-4xl min-w-0">
          <Link
            to="/culture"
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 min-h-[44px] items-center"
          >
            <ArrowLeft className="w-4 h-4 flex-shrink-0" aria-hidden />
            Back to Cultural Explorer
          </Link>

          <motion.article
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-10"
          >
            <header className="mb-8">
              <div className="flex items-center gap-3 mb-2">
                <span className="text-4xl" aria-hidden>{country.flag}</span>
                <div>
                  <span className="text-sm text-muted-foreground">{country.regionName}</span>
                </div>
              </div>
              <h1 className="text-2xl md:text-4xl font-display font-bold">
                Ramadan in {country.name}
                <span className="block font-arabic text-lg text-secondary mt-1">رمضان في {country.name}</span>
              </h1>
            </header>

            <section className="mb-8" aria-labelledby="traditions-heading">
              <h2 id="traditions-heading" className="font-display font-bold text-lg mb-4">Traditions</h2>
              <ul className="space-y-4">
                {country.traditions.map((t, i) => (
                  <li key={i} className="p-4 rounded-2xl bg-card border border-border">
                    <h3 className="font-medium">{t.name}</h3>
                    {t.arabicName && (
                      <p className="text-sm text-secondary font-arabic">{t.arabicName}</p>
                    )}
                    <p className="text-sm text-muted-foreground mt-1">{t.description}</p>
                  </li>
                ))}
              </ul>
            </section>

            <section className="mb-8" aria-labelledby="foods-heading">
              <h2 id="foods-heading" className="font-display font-bold text-lg mb-3">Traditional foods</h2>
              <p className="text-muted-foreground">{country.foods.join(", ")}</p>
            </section>

            {(country.muslimPopulation || country.muslimPopulationNote) && (
              <section className="mb-8 p-5 rounded-2xl bg-card border border-border" aria-labelledby="population-heading">
                <h2 id="population-heading" className="font-display font-bold text-lg mb-3 flex items-center gap-2">
                  <Users className="w-5 h-5 text-secondary" aria-hidden />
                  Muslim population & context
                </h2>
                {country.muslimPopulation && (
                  <p className="font-medium text-secondary">{country.muslimPopulation}</p>
                )}
                {country.muslimPopulationNote && (
                  <p className="text-sm text-muted-foreground mt-1">{country.muslimPopulationNote}</p>
                )}
              </section>
            )}

            {country.majorMosques && country.majorMosques.length > 0 && (
              <section className="mb-8" aria-labelledby="mosques-heading">
                <h2 id="mosques-heading" className="font-display font-bold text-lg mb-4 flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-secondary" aria-hidden />
                  Major mosques
                </h2>
                <ul className="space-y-3">
                  {country.majorMosques.map((mosque, i) => (
                    <li key={i} className="p-4 rounded-xl bg-card border border-border">
                      <span className="font-medium">{mosque.name}</span>
                      {mosque.city && <span className="text-sm text-muted-foreground ml-2">· {mosque.city}</span>}
                      {mosque.address && (
                        <p className="text-sm text-muted-foreground mt-1 flex items-center gap-1.5">
                          <MapPin className="w-4 h-4 flex-shrink-0 text-secondary" aria-hidden />
                          {mosque.address}
                        </p>
                      )}
                      {mosque.note && <p className="text-sm text-muted-foreground mt-1">{mosque.note}</p>}
                      {(mosque.googleMapsUrl || mosque.appleMapsUrl) && (
                        <div className="flex flex-wrap gap-2 mt-2">
                          {mosque.googleMapsUrl && (
                            <a
                              href={mosque.googleMapsUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1.5 text-sm text-secondary hover:underline"
                            >
                              <ExternalLink className="w-4 h-4" aria-hidden />
                              Open in Google Maps
                            </a>
                          )}
                          {mosque.appleMapsUrl && (
                            <a
                              href={mosque.appleMapsUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1.5 text-sm text-secondary hover:underline"
                            >
                              <ExternalLink className="w-4 h-4" aria-hidden />
                              Open in Apple Maps
                            </a>
                          )}
                        </div>
                      )}
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {country.cities && country.cities.length > 0 && (
              <section className="mb-8" aria-labelledby="cities-heading">
                <h2 id="cities-heading" className="font-display font-bold text-lg mb-4 flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-secondary" aria-hidden />
                  Practices by city
                </h2>
                <div className="space-y-6">
                  {country.cities.map((city, idx) => (
                    <motion.div
                      key={city.name}
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      className="p-5 rounded-2xl bg-card border border-border"
                    >
                      <h3 className="font-display font-bold text-base mb-3">{city.name}</h3>
                      <div className="grid gap-3 text-sm">
                        <div>
                          <span className="font-medium text-muted-foreground">Suhoor</span>
                          <p className="mt-0.5">{city.suhoor_meals.join(", ")}</p>
                        </div>
                        <div>
                          <span className="font-medium text-muted-foreground">{iftarLabel}</span>
                          <p className="mt-0.5">{city.iftar_meals.join(", ")}</p>
                        </div>
                        <div>
                          <span className="font-medium text-muted-foreground">Desserts & drinks</span>
                          <p className="mt-0.5">{city.desserts_and_drinks.join(", ")}</p>
                        </div>
                        {city.rituals_and_traditions.length > 0 && (
                          <div>
                            <span className="font-medium text-muted-foreground">Rituals & traditions</span>
                            <ul className="mt-0.5 list-disc pl-4 space-y-0.5">
                              {city.rituals_and_traditions.map((r, i) => (
                                <li key={i}>{r}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                        {city.notes && (
                          <p className="text-muted-foreground italic border-l-2 border-secondary/40 pl-3">{city.notes}</p>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </section>
            )}

            {country.specialNote && (
              <section className="p-4 rounded-2xl bg-secondary/10 border border-secondary/20 mb-8" aria-labelledby="note-heading">
                <h2 id="note-heading" className="font-medium mb-2">Did you know?</h2>
                <p className="text-sm">{country.specialNote}</p>
              </section>
            )}

            {/* Recipes from this region */}
            <section aria-labelledby="recipes-heading">
              <h2 id="recipes-heading" className="font-display font-bold text-lg mb-4 flex items-center gap-2">
                <Globe className="w-5 h-5 text-secondary" aria-hidden />
                Recipes from this region
              </h2>
              {recipesFromCountry.length === 0 ? (
                <p className="text-muted-foreground text-sm">
                  No recipes are tagged with this region yet.{" "}
                  <Link to="/recipes" className="text-secondary hover:underline">
                    Browse all recipes
                  </Link>
                  .
                </p>
              ) : (
                <ul className="space-y-3">
                  {recipesFromCountry.map(({ mealType, recipe }) => (
                    <li key={`${mealType}-${recipe.id}`}>
                      <Link
                        to={`/recipe/${mealType}/${recipe.id}`}
                        className="flex items-center justify-between p-4 rounded-2xl bg-card border border-border hover:border-secondary/50 transition-all group"
                      >
                        <div className="flex items-center gap-3">
                          <span
                            className={`p-2 rounded-lg ${
                              mealType === "suhoor" ? "bg-secondary/20" : "bg-primary/20"
                            }`}
                          >
                            {mealType === "suhoor" ? (
                              <Coffee className="w-4 h-4 text-secondary" aria-hidden />
                            ) : (
                              <Utensils className="w-4 h-4 text-primary" aria-hidden />
                            )}
                          </span>
                          <div>
                            <span className="font-medium">{recipe.name}</span>
                            <span className="text-sm text-muted-foreground block">
                              {mealType === "suhoor" ? "Suhoor" : iftarLabel} · {recipe.prepTime}
                            </span>
                          </div>
                        </div>
                        <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-secondary" aria-hidden />
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </motion.article>

          <p className="text-sm text-muted-foreground">
            <Link to="/culture" className="text-secondary hover:underline">
              Explore all cultures →
            </Link>
            {" · "}
            <Link to="/recipes" className="text-secondary hover:underline">
              All recipes
            </Link>
          </p>
        </div>
      </main>
      <Footer />
    </div>
  );
}
