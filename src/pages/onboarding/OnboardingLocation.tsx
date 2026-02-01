import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, ArrowRight, MapPin, Check, Loader2 } from "lucide-react";
import { useOnboarding } from "@/contexts/OnboardingContext";
import { LocationSearch } from "@/components/LocationSearch";
import { LocationResult, getLocationFromIP } from "@/hooks/useLocation";

export default function OnboardingLocation() {
  const { state, setLocation } = useOnboarding();
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!state.location) {
      setLoading(true);
      getLocationFromIP().then((loc) => {
        if (loc) setLocation(loc);
        setLoading(false);
      });
    }
  }, [state.location, setLocation]);

  const handleSelect = (loc: LocationResult) => {
    setLocation(loc);
  };

  const handleContinue = () => {
    navigate("/onboarding/schedule");
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <Link
        to="/onboarding/health"
        className="inline-flex items-center gap-1 text-muted-foreground hover:text-foreground mb-6"
      >
        <ArrowLeft className="w-4 h-4" /> Back
      </Link>
      <h2 className="font-display text-2xl font-bold mb-2">Location</h2>
      <p className="text-muted-foreground mb-6">
        For accurate prayer and fasting times. Your location is stored only on this device.
      </p>

      {loading ? (
        <div className="flex items-center gap-3 p-4 rounded-xl bg-muted/50 border border-border mb-4">
          <Loader2 className="w-5 h-5 animate-spin text-secondary" />
          <span className="text-muted-foreground">Detecting your location...</span>
        </div>
      ) : state.location ? (
        <div className="flex items-center gap-3 p-4 rounded-xl bg-secondary/10 border border-secondary/30 mb-4">
          <MapPin className="w-5 h-5 text-secondary flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="font-medium">{state.location.name}</p>
            <p className="text-xs text-muted-foreground truncate">{state.location.country}</p>
          </div>
          <Check className="w-5 h-5 text-secondary flex-shrink-0" />
        </div>
      ) : null}

      <LocationSearch
        value={state.location?.name ?? ""}
        onSelect={handleSelect}
        placeholder="Search for a city..."
      />

      <button
        onClick={handleContinue}
        className="w-full mt-6 py-3 px-6 rounded-xl bg-primary text-primary-foreground font-medium hover:bg-primary/90 flex items-center justify-center gap-2"
      >
        Continue <ArrowRight className="w-5 h-5" />
      </button>
    </motion.div>
  );
}
