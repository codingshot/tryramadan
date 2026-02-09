import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowLeft, GitCompare } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { CulturalCarousel } from "@/components/CulturalCarousel";
import culturalData from "@/data/cultural-traditions.json";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PageSEO } from "@/components/PageSEO";
import { getRecipes } from "@/lib/cultureRecipes";

type Country = {
  id: string;
  name: string;
  flag: string;
  regionName: string;
  traditions: { name: string; arabicName: string; description: string }[];
  foods: string[];
  specialNote: string;
};

const allCountries: Country[] = ((culturalData as unknown) as { regions: { name: string; countries: Omit<Country, 'regionName'>[] }[] }).regions.flatMap((r) =>
  r.countries.map((c) => ({ ...c, regionName: r.name }))
);

export default function DashboardCulture() {
  const [compareA, setCompareA] = useState<string>(allCountries[0]?.id ?? "");
  const [compareB, setCompareB] = useState<string>(allCountries[1]?.id ?? "");

  const countryA = useMemo(() => allCountries.find((c) => c.id === compareA), [compareA]);
  const countryB = useMemo(() => allCountries.find((c) => c.id === compareB), [compareB]);
  const recipesA = useMemo(() => getRecipes({ countryId: compareA }), [compareA]);
  const recipesB = useMemo(() => getRecipes({ countryId: compareB }), [compareB]);

  return (
    <div className="min-h-screen bg-background">
      <PageSEO
        title="Culture | TryRamadan.app"
        description="Compare Ramadan traditions across countries. Explore foods, customs, and regional practices."
        path="/dashboard/culture"
      />
      <Navbar />
      <main id="main-content" className="main-content">
        <div className="container mx-auto px-4 sm:px-6 max-w-5xl min-w-0">
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </Link>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 text-center sm:text-left"
          >
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-display font-bold">
              Cultural Explorer
            </h1>
            <p className="text-muted-foreground mt-2 text-sm sm:text-base max-w-2xl">
              Ramadan traditions by region. Explore customs, foods, and stories from Muslim communities worldwide.
            </p>
          </motion.div>
          <CulturalCarousel />

          {/* Compare traditions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mt-10 p-6 rounded-2xl bg-card border border-border"
          >
            <h3 className="font-display font-bold mb-4 flex items-center gap-2">
              <GitCompare className="w-5 h-5 text-secondary" />
              Compare traditions
            </h3>
            <div className="flex flex-wrap gap-4 mb-6">
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Region A</span>
                <Select value={compareA} onValueChange={setCompareA}>
                  <SelectTrigger className="w-[200px]">
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    {allCountries.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.flag} {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Region B</span>
                <Select value={compareB} onValueChange={setCompareB}>
                  <SelectTrigger className="w-[200px]">
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    {allCountries.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.flag} {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
              {countryA && (
                <div className="p-4 rounded-xl bg-muted/50 border border-border">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-2xl">{countryA.flag}</span>
                    <div>
                      <Link to={`/culture/${countryA.id}`} className="font-bold block hover:text-secondary hover:underline">
                        {countryA.name}
                      </Link>
                      <span className="text-xs text-muted-foreground">{countryA.regionName}</span>
                    </div>
                  </div>
                  <p className="text-xs text-secondary mb-2 font-medium">Traditions</p>
                  <ul className="text-sm space-y-1 mb-3">
                    {countryA.traditions.map((t, i) => (
                      <li key={i}><strong>{t.name}</strong> — {t.description}</li>
                    ))}
                  </ul>
                  <p className="text-xs text-secondary mb-1 font-medium">Foods</p>
                  <p className="text-sm">{countryA.foods.join(", ")}</p>
                  {recipesA.length > 0 && (
                    <div className="mt-3">
                      <p className="text-xs text-secondary mb-1.5 font-medium">Recipes</p>
                      <div className="flex flex-wrap gap-1.5" role="navigation" aria-label={`Recipes from ${countryA.name}`}>
                        {recipesA.map(({ mealType, recipe }) => (
                          <Link
                            key={`${mealType}-${recipe.id}`}
                            to={`/recipe/${mealType}/${recipe.id}`}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-secondary/10 text-secondary border border-secondary/20 hover:bg-secondary/20"
                          >
                            {recipe.emoji && <span aria-hidden>{recipe.emoji}</span>}
                            {recipe.name}
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}
                  {countryA.specialNote && (
                    <p className="text-xs text-muted-foreground mt-2 italic">{countryA.specialNote}</p>
                  )}
                </div>
              )}
              {countryB && (
                <div className="p-4 rounded-xl bg-muted/50 border border-border">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-2xl">{countryB.flag}</span>
                    <div>
                      <Link to={`/culture/${countryB.id}`} className="font-bold block hover:text-secondary hover:underline">
                        {countryB.name}
                      </Link>
                      <span className="text-xs text-muted-foreground">{countryB.regionName}</span>
                    </div>
                  </div>
                  <p className="text-xs text-secondary mb-2 font-medium">Traditions</p>
                  <ul className="text-sm space-y-1 mb-3">
                    {countryB.traditions.map((t, i) => (
                      <li key={i}><strong>{t.name}</strong> — {t.description}</li>
                    ))}
                  </ul>
                  <p className="text-xs text-secondary mb-1 font-medium">Foods</p>
                  <p className="text-sm">{countryB.foods.join(", ")}</p>
                  {recipesB.length > 0 && (
                    <div className="mt-3">
                      <p className="text-xs text-secondary mb-1.5 font-medium">Recipes</p>
                      <div className="flex flex-wrap gap-1.5" role="navigation" aria-label={`Recipes from ${countryB.name}`}>
                        {recipesB.map(({ mealType, recipe }) => (
                          <Link
                            key={`${mealType}-${recipe.id}`}
                            to={`/recipe/${mealType}/${recipe.id}`}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-secondary/10 text-secondary border border-secondary/20 hover:bg-secondary/20"
                          >
                            {recipe.emoji && <span aria-hidden>{recipe.emoji}</span>}
                            {recipe.name}
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}
                  {countryB.specialNote && (
                    <p className="text-xs text-muted-foreground mt-2 italic">{countryB.specialNote}</p>
                  )}
                </div>
              )}
            </div>
          </motion.div>

          <div className="mt-6 text-center">
            <Link
              to="/culture"
              className="text-sm text-secondary hover:underline"
            >
              Open full Cultural Explorer page →
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
