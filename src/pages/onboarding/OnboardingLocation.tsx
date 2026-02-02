import { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, ArrowRight, MapPin, Check, Loader2, Navigation } from "lucide-react";
import { useOnboarding } from "@/contexts/OnboardingContext";
import { LocationSearch } from "@/components/LocationSearch";
import { LocationResult, getLocationFromIP, getTimezoneFromCoords } from "@/hooks/useLocation";

export default function OnboardingLocation() {
  const { state, setLocation } = useOnboarding();
  const [detecting, setDetecting] = useState(false);
  const [initialTried, setInitialTried] = useState(false);
  const navigate = useNavigate();

  const runAutoDetect = useCallback(async () => {
    setDetecting(true);
    let loc: LocationResult | null = null;

    try {
      if ("geolocation" in navigator) {
        try {
          const position = await new Promise<GeolocationPosition>((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject, {
              enableHighAccuracy: false,
              timeout: 8000,
              maximumAge: 300000,
            });
          });
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${position.coords.latitude}&lon=${position.coords.longitude}`,
            { headers: { "User-Agent": "TryRamadan.app" } }
          );
          if (response.ok) {
            const data = await response.json();
            loc = {
              name: data.address?.city || data.address?.town || data.address?.village || "Your Location",
              displayName: data.display_name,
              lat: position.coords.latitude,
              lng: position.coords.longitude,
              country: data.address?.country || "",
            };
          }
        } catch {
          // Fall back to IP
        }
      }
      if (!loc) loc = await getLocationFromIP();
      if (loc) {
        if (!loc.timezone) {
          const tz = await getTimezoneFromCoords(loc.lat, loc.lng);
          loc = { ...loc, timezone: tz ?? undefined };
        }
        setLocation(loc);
      }
    } catch {
      // leave loc null
    } finally {
      setDetecting(false);
    }
  }, [setLocation]);

  useEffect(() => {
    if (!state.location && !initialTried) {
      setInitialTried(true);
      runAutoDetect();
    }
  }, [state.location, initialTried, runAutoDetect]);

  const handleSelect = async (loc: LocationResult) => {
    if (loc.timezone) {
      setLocation(loc);
      return;
    }
    const timezone = await getTimezoneFromCoords(loc.lat, loc.lng);
    setLocation({ ...loc, timezone: timezone ?? undefined });
  };

  const handleContinue = () => {
    navigate("/onboarding/schedule");
  };

  const hasLocation = !!state.location;

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
        Location is required for accurate prayer and fasting times. Your data is stored only on this device.
      </p>

      {/* Auto-detect: visible button + loading state */}
      <div className="mb-4">
        <button
          type="button"
          onClick={runAutoDetect}
          disabled={detecting}
          className="w-full min-h-[44px] flex items-center justify-center gap-2 py-3 px-4 rounded-xl border-2 border-secondary/50 bg-secondary/10 hover:bg-secondary/20 hover:border-secondary/70 text-secondary font-medium transition-all cursor-pointer touch-manipulation disabled:opacity-70 disabled:cursor-wait"
        >
          {detecting ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin shrink-0" aria-hidden />
              <span>Detecting your location...</span>
            </>
          ) : (
            <>
              <Navigation className="w-5 h-5 shrink-0" aria-hidden />
              <span>Auto-detect my location</span>
            </>
          )}
        </button>
      </div>

      {hasLocation ? (
        <div className="flex items-center gap-3 p-4 rounded-xl bg-secondary/10 border border-secondary/30 mb-4">
          <MapPin className="w-5 h-5 text-secondary flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="font-medium">{state.location!.name}</p>
            <p className="text-xs text-muted-foreground truncate">{state.location!.country}</p>
          </div>
          <Check className="w-5 h-5 text-secondary flex-shrink-0" />
        </div>
      ) : (
        <p className="text-sm text-muted-foreground mb-4">
          Or search for a city below if auto-detect doesn’t work or you prefer a different location.
        </p>
      )}

      <LocationSearch
        value={state.location?.name ?? ""}
        onSelect={handleSelect}
        placeholder="Search for a city..."
      />

      {!hasLocation && (
        <p className="text-sm text-amber-600 dark:text-amber-500 mt-3" role="alert">
          Please enter a city or use auto-detect to continue.
        </p>
      )}

      <button
        type="button"
        onClick={handleContinue}
        disabled={!hasLocation}
        className="w-full mt-6 min-h-[44px] py-3 px-6 rounded-xl bg-primary text-primary-foreground font-medium hover:bg-primary/90 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Continue <ArrowRight className="w-5 h-5" />
      </button>
    </motion.div>
  );
}
