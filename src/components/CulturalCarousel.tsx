import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ChevronLeft, ChevronRight, ExternalLink, Keyboard, Utensils } from "lucide-react";
import { useState, useEffect, useCallback, useMemo } from "react";
import culturalData from "@/data/cultural-traditions.json";
import { getRecipes } from "@/lib/cultureRecipes";

export const CulturalCarousel = () => {
  const [activeRegion, setActiveRegion] = useState(0);
  const [activeCountry, setActiveCountry] = useState(0);

  const regions = culturalData.regions;
  const currentRegion = regions[activeRegion];
  const countries = currentRegion.countries;
  const currentCountry = countries[activeCountry];
  const recipesForCountry = useMemo(
    () => (currentCountry ? getRecipes({ countryId: currentCountry.id }) : []),
    [currentCountry?.id]
  );

  const nextRegion = useCallback(() => {
    setActiveRegion((prev) => (prev + 1) % regions.length);
    setActiveCountry(0);
  }, [regions.length]);

  const prevRegion = useCallback(() => {
    setActiveRegion((prev) => (prev - 1 + regions.length) % regions.length);
    setActiveCountry(0);
  }, [regions.length]);

  /** Next country; at last country in region, switch to next region's first. */
  const nextCountry = useCallback(() => {
    if (activeCountry < countries.length - 1) {
      setActiveCountry((prev) => prev + 1);
    } else {
      setActiveRegion((prev) => (prev + 1) % regions.length);
      setActiveCountry(0);
    }
  }, [activeCountry, countries.length, regions.length]);

  /** Previous country; at first country in region, switch to previous region's last. */
  const prevCountry = useCallback(() => {
    if (activeCountry > 0) {
      setActiveCountry((prev) => prev - 1);
    } else {
      const prevRegionIndex = (activeRegion - 1 + regions.length) % regions.length;
      const lastCountryIndex = regions[prevRegionIndex].countries.length - 1;
      setActiveRegion(prevRegionIndex);
      setActiveCountry(lastCountryIndex);
    }
  }, [activeCountry, activeRegion, regions]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (target.closest("input") || target.closest("textarea") || target.closest("[contenteditable]")) return;
      switch (e.key) {
        case "ArrowLeft":
          e.preventDefault();
          prevCountry();
          break;
        case "ArrowRight":
          e.preventDefault();
          nextCountry();
          break;
        case "ArrowUp":
          e.preventDefault();
          prevRegion();
          break;
        case "ArrowDown":
          e.preventDefault();
          nextRegion();
          break;
        default:
          break;
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [nextCountry, prevCountry, nextRegion, prevRegion]);

  return (
    <div className="space-y-6" role="region" aria-label="Cultural Explorer">
      {/* Region selector */}
      <div className="flex items-center justify-center gap-4">
        <button
          type="button"
          onClick={prevRegion}
          className="p-2 rounded-full bg-muted hover:bg-muted/80 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-secondary"
          aria-label="Previous region (or press Up arrow)"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        <motion.h3
          key={currentRegion.id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-xl md:text-2xl font-display font-bold text-center min-w-[200px]"
        >
          {currentRegion.name}
        </motion.h3>

        <button
          type="button"
          onClick={nextRegion}
          className="p-2 rounded-full bg-muted hover:bg-muted/80 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-secondary"
          aria-label="Next region (or press Down arrow)"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* Country tabs — Left/Right arrows move between countries */}
      <div className="flex flex-wrap justify-center gap-2">
        {countries.map((country, index) => (
          <button
            key={country.id}
            type="button"
            onClick={() => setActiveCountry(index)}
            className={`
              px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-secondary
              ${activeCountry === index
                ? "bg-gradient-gold text-foreground shadow-gold"
                : "bg-muted text-muted-foreground hover:bg-muted/80"
              }
            `}
            aria-label={`${country.name} (country ${index + 1} of ${countries.length})`}
            aria-current={activeCountry === index ? "true" : undefined}
          >
            <span className="mr-2">{country.flag}</span>
            {country.name}
          </button>
        ))}
      </div>

      {/* Country content */}
      <motion.div
        key={currentCountry.id}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3 }}
        className="card-cultural"
      >
        <div className="flex items-center gap-3 mb-4">
          <span className="text-4xl">{currentCountry.flag}</span>
          <div>
            <h4 className="text-lg font-bold font-display">{currentCountry.name}</h4>
            <p className="text-sm text-muted-foreground">{currentCountry.specialNote}</p>
          </div>
        </div>

        {/* Traditions */}
        <div className="space-y-4 mb-6">
          <h5 className="font-semibold text-sm uppercase tracking-wide text-muted-foreground">
            Traditions
          </h5>
          <div className="grid gap-3">
            {currentCountry.traditions.map((tradition, index) => (
              <motion.div
                key={tradition.name}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="p-4 rounded-xl bg-muted/50"
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <span className="font-semibold text-foreground">{tradition.name}</span>
                </div>
                {tradition.transliteration && (
                  <p className="text-xs text-muted-foreground italic mb-1">
                    /{tradition.transliteration}/
                  </p>
                )}
                <p className="text-sm text-muted-foreground">{tradition.description}</p>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Foods */}
        <div className="mb-4">
          <h5 className="font-semibold text-sm uppercase tracking-wide text-muted-foreground mb-3">
            Traditional Foods
          </h5>
          <div className="flex flex-wrap gap-2">
            {currentCountry.foods.map((food) => (
              <span 
                key={food}
                className="px-3 py-1 rounded-full text-sm bg-accent/10 text-accent border border-accent/20"
              >
                {food}
              </span>
            ))}
          </div>
        </div>

        {/* Recipe pills — link to recipes for this country */}
        {recipesForCountry.length > 0 && (
          <div className="mb-4">
            <h5 className="font-semibold text-sm uppercase tracking-wide text-muted-foreground mb-2">
              Recipes
            </h5>
            <div className="flex flex-wrap gap-2" role="navigation" aria-label={`Recipes from ${currentCountry.name}`}>
              {recipesForCountry.map(({ mealType, recipe }) => (
                <Link
                  key={`${mealType}-${recipe.id}`}
                  to={`/recipe/${mealType}/${recipe.id}`}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium bg-secondary/10 text-secondary border border-secondary/20 hover:bg-secondary/20 transition-colors min-h-[44px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                >
                  {recipe.emoji && <span aria-hidden>{recipe.emoji}</span>}
                  {recipe.name}
                </Link>
              ))}
            </div>
          </div>
        )}

        <div className="flex flex-wrap items-center gap-3">
          <Link
            to={`/culture/${currentCountry.id}`}
            className="inline-flex items-center gap-2 text-sm font-medium text-secondary hover:underline"
          >
            Explore Ramadan in {currentCountry.name}
            <ExternalLink className="w-4 h-4" aria-hidden />
          </Link>
          <Link
            to={`/recipes?country=${encodeURIComponent(currentCountry.id)}`}
            className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-secondary hover:underline"
          >
            <Utensils className="w-4 h-4" aria-hidden />
            {recipesForCountry.length > 0
              ? `All ${currentCountry.name} recipes (${recipesForCountry.length})`
              : `Recipes from ${currentRegion.name}`}
          </Link>
        </div>
      </motion.div>

      {/* Region indicator dots */}
      <div className="flex justify-center gap-2">
        {regions.map((_, index) => (
          <button
            key={index}
            type="button"
            onClick={() => {
              setActiveRegion(index);
              setActiveCountry(0);
            }}
            className={`
              w-2 h-2 rounded-full transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-secondary focus-visible:ring-offset-2
              ${activeRegion === index ? "w-6 bg-secondary" : "bg-muted"}
            `}
            aria-label={`Region ${index + 1}: ${regions[index].name}`}
            aria-current={activeRegion === index ? "true" : undefined}
          />
        ))}
      </div>

      {/* Keyboard shortcut hint */}
      <p className="text-center text-xs text-muted-foreground flex items-center justify-center gap-1.5 flex-wrap">
        <Keyboard className="w-3.5 h-3.5" aria-hidden />
        <span>Arrow keys: ← → countries, ↑ ↓ regions</span>
      </p>
    </div>
  );
};
