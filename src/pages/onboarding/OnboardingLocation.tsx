import { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, ArrowRight, MapPin, Check, Loader2, Navigation } from "lucide-react";
import { useOnboarding } from "@/contexts/OnboardingContext";
import { LocationSearch } from "@/components/LocationSearch";
import { LocationResult, getLocationFromIP, getTimezoneFromCoords } from "@/hooks/useLocation";
import { API_CONFIG } from "@/lib/config";

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
            `${API_CONFIG.nominatim}/reverse?format=json&lat=${position.coords.latitude}&lon=${position.coords.longitude}`,
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
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (hasLocation) handleContinue();
        }}
      >
      <Link
        to="/onboarding/gender"
        className="inline-flex items-center gap-1 text-muted-foreground hover:text-foreground mb-6"
      >
        <ArrowLeft className="w-4 h-4" /> Back
      </Link>
      <h2 className="font-display text-2xl font-bold mb-2">Location</h2>
      <p className="text-muted-foreground mb-6">
        We use your location for prayer and fasting times. It’s set from your IP automatically; type a city below to change it. Stored only on this device.
      </p>

      {hasLocation ? (
        <div className="flex items-center gap-3 p-4 rounded-xl bg-secondary/10 border border-secondary/30 mb-4">
          <span className="text-2xl shrink-0" aria-hidden>📍</span>
          <MapPin className="w-5 h-5 text-secondary flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="font-medium">{state.location!.name}</p>
            <p className="text-xs text-muted-foreground truncate">{state.location!.country}</p>
          </div>
          <Check className="w-5 h-5 text-secondary flex-shrink-0" />
        </div>
      ) : detecting ? (
        <div className="flex items-center gap-2 p-4 rounded-xl bg-muted/50 border border-border mb-4">
          <Loader2 className="w-5 h-5 animate-spin shrink-0 text-muted-foreground" aria-hidden />
          <span className="text-sm text-muted-foreground">Detecting location from IP...</span>
        </div>
      ) : (
        <>
          {initialTried && !hasLocation && (
            <p className="text-sm text-amber-600 dark:text-amber-400 mb-2">
              We couldn&apos;t detect your location. Search for your city for accurate prayer times.
            </p>
          )}
          <p className="text-sm text-muted-foreground mb-4">
            Or search for your city below. You can also use the button to detect from IP.
          </p>
        </>
      )}

      <LocationSearch
        value={state.location?.name ?? ""}
        onSelect={handleSelect}
        placeholder="Type a city name..."
      />

      <button
        type="button"
        onClick={runAutoDetect}
        disabled={detecting}
        className="w-full mt-3 min-h-[44px] flex items-center justify-center gap-2 py-3 px-4 rounded-xl border border-border bg-muted/30 hover:bg-muted/50 text-sm font-medium transition-colors disabled:opacity-70"
      >
        {detecting ? (
          <Loader2 className="w-5 h-5 animate-spin shrink-0" aria-hidden />
        ) : (
          <>
            <span aria-hidden>🌐</span>
            <Navigation className="w-5 h-5 shrink-0" aria-hidden />
          </>
        )}
        {detecting ? "Detecting..." : "Use my location (from IP)"}
      </button>

      <button
        type="submit"
        disabled={!hasLocation}
        className="w-full mt-6 min-h-[44px] py-3 px-6 rounded-xl bg-primary text-primary-foreground font-medium hover:bg-primary/90 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-primary"
      >
        Continue <ArrowRight className="w-5 h-5" />
      </button>
      {!hasLocation && (
        <>
          <p className="mt-2 text-sm text-muted-foreground text-center">
            Select or detect a location above to continue. Prayer and fasting times need your location.
          </p>
          <button
            type="button"
            onClick={() => navigate("/onboarding/schedule")}
            className="w-full mt-3 min-h-[44px] py-2 px-4 rounded-xl border border-border text-muted-foreground hover:bg-muted/50 text-sm"
          >
            Skip for now (set location later in Settings)
          </button>
        </>
      )}
      </form>
    </motion.div>
  );
}
