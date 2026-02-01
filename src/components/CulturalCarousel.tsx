import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";
import culturalData from "@/data/cultural-traditions.json";

export const CulturalCarousel = () => {
  const [activeRegion, setActiveRegion] = useState(0);
  const [activeCountry, setActiveCountry] = useState(0);

  const regions = culturalData.regions;
  const currentRegion = regions[activeRegion];
  const currentCountry = currentRegion.countries[activeCountry];

  const nextRegion = () => {
    setActiveRegion((prev) => (prev + 1) % regions.length);
    setActiveCountry(0);
  };

  const prevRegion = () => {
    setActiveRegion((prev) => (prev - 1 + regions.length) % regions.length);
    setActiveCountry(0);
  };

  return (
    <div className="space-y-6">
      {/* Region selector */}
      <div className="flex items-center justify-center gap-4">
        <button 
          onClick={prevRegion}
          className="p-2 rounded-full bg-muted hover:bg-muted/80 transition-colors"
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
          onClick={nextRegion}
          className="p-2 rounded-full bg-muted hover:bg-muted/80 transition-colors"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* Country tabs */}
      <div className="flex flex-wrap justify-center gap-2">
        {currentRegion.countries.map((country, index) => (
          <button
            key={country.id}
            onClick={() => setActiveCountry(index)}
            className={`
              px-4 py-2 rounded-full text-sm font-medium transition-all duration-300
              ${activeCountry === index 
                ? "bg-gradient-gold text-foreground shadow-gold" 
                : "bg-muted text-muted-foreground hover:bg-muted/80"
              }
            `}
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
                  {tradition.arabicName && (
                    <span className="font-arabic text-lg text-secondary">
                      {tradition.arabicName}
                    </span>
                  )}
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
        <div>
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
      </motion.div>

      {/* Region indicator dots */}
      <div className="flex justify-center gap-2">
        {regions.map((_, index) => (
          <button
            key={index}
            onClick={() => {
              setActiveRegion(index);
              setActiveCountry(0);
            }}
            className={`
              w-2 h-2 rounded-full transition-all duration-300
              ${activeRegion === index ? "w-6 bg-secondary" : "bg-muted"}
            `}
          />
        ))}
      </div>
    </div>
  );
};
