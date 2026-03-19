import { useEffect, useState, useCallback, useRef } from "react";
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, ArrowRight, MapPin, Check, Loader2, Navigation } from "lucide-react";
import { useOnboarding } from "@/contexts/OnboardingContext";
import { LocationSearch } from "@/components/LocationSearch";
import {
  LocationResult,
  getLocationFromIP,
  getTimezoneFromCoords,
  detectLocationWithGeolocation,
} from "@/hooks/useLocation";

export default function OnboardingLocation() {
  const { state, setLocation } = useOnboarding();
  const [detecting, setDetecting] = useState(false);
  const [initialTried, setInitialTried] = useState(false);
  const navigate = useNavigate();

  // Initial load: IP only (no browser location request)
  const runAutoDetectIPOnly = useCallback(async () => {
    setDetecting(true);
    try {
      const loc = await getLocationFromIP();
      if (loc) {
        let withTz = loc;
        if (!loc.timezone) {
          const tz = await getTimezoneFromCoords(loc.lat, loc.lng);
          withTz = { ...loc, timezone: tz ?? undefined };
        }
        setLocation(withTz);
      }
    } catch {
      // leave as null
    } finally {
      setDetecting(false);
    }
  }, [setLocation]);

  // When user clicks "Use my location": try browser geolocation first, then IP
  const runUseMyLocation = useCallback(async () => {
    setDetecting(true);
    try {
      const loc = await detectLocationWithGeolocation();
      if (loc) {
        let withTz = loc;
        if (!loc.timezone) {
          const tz = await getTimezoneFromCoords(loc.lat, loc.lng);
          withTz = { ...loc, timezone: tz ?? undefined };
        }
        setLocation(withTz);
      } else {
        const ipLoc = await getLocationFromIP();
        if (ipLoc) {
          let withTz = ipLoc;
          if (!ipLoc.timezone) {
            const tz = await getTimezoneFromCoords(ipLoc.lat, ipLoc.lng);
            withTz = { ...ipLoc, timezone: tz ?? undefined };
          }
          setLocation(withTz);
        }
      }
    } catch {
      // leave as null
    } finally {
      setDetecting(false);
    }
  }, [setLocation]);

  useEffect(() => {
    if (!state.location && !initialTried) {
      setInitialTried(true);
      runAutoDetectIPOnly();
    }
  }, [state.location, initialTried, runAutoDetectIPOnly]);

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
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col min-h-0 flex-1">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (hasLocation) handleContinue();
        }}
        className="flex flex-col min-h-0 flex-1"
      >
        <div className="flex-1 min-h-0 overflow-y-auto pb-24 sm:pb-0">
          <Link
            to="/onboarding/gender"
            className="inline-flex items-center gap-1 text-muted-foreground hover:text-foreground mb-6"
          >
            <ArrowLeft className="w-4 h-4" /> Back
          </Link>
          <h2 className="font-display text-2xl font-bold mb-2">Location</h2>
          <p className="text-muted-foreground mb-6">
            We use your location for prayer and fasting times. It's set from your IP automatically; type a city below to change it. Stored only on this device.
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
              <span className="text-sm text-muted-foreground">Detecting location...</span>
            </div>
          ) : (
            <>
              {initialTried && !hasLocation && (
                <p className="text-sm text-amber-600 dark:text-amber-400 mb-2">
                  We couldn&apos;t detect your location. Search for your city for accurate prayer times.
                </p>
              )}
              <p className="text-sm text-muted-foreground mb-4">
                Search for your city below, or use the buttons to detect from IP or from your device.
              </p>
            </>
          )}

          <LocationSearch
            value={state.location?.name ?? ""}
            onSelect={handleSelect}
            placeholder="Type a city name..."
          />

          <div className="flex flex-col sm:flex-row gap-2 mt-3">
            <button
              type="button"
              onClick={runAutoDetectIPOnly}
              disabled={detecting}
              className="flex-1 min-h-[44px] flex items-center justify-center gap-2 py-3 px-4 rounded-xl border border-border bg-muted/30 hover:bg-muted/50 text-sm font-medium transition-colors disabled:opacity-70"
            >
              {detecting ? (
                <Loader2 className="w-5 h-5 animate-spin shrink-0" aria-hidden />
              ) : (
                <span aria-hidden>🌐</span>
              )}
              {detecting ? "Detecting..." : "Use IP location"}
            </button>
            <button
              type="button"
              onClick={runUseMyLocation}
              disabled={detecting}
              className="flex-1 min-h-[44px] flex items-center justify-center gap-2 py-3 px-4 rounded-xl border border-border bg-muted/30 hover:bg-muted/50 text-sm font-medium transition-colors disabled:opacity-70"
            >
              {detecting ? (
                <Loader2 className="w-5 h-5 animate-spin shrink-0" aria-hidden />
              ) : (
                <Navigation className="w-5 h-5 shrink-0" aria-hidden />
              )}
              {detecting ? "Detecting..." : "Use device location"}
            </button>
          </div>

          {!hasLocation && (
            <p className="mt-4 text-sm text-muted-foreground text-center">
              Select or detect a location above to continue. Prayer and fasting times need your location.
            </p>
          )}
        </div>

        <div className="fixed bottom-0 left-0 right-0 z-20 bg-background border-t border-border pt-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] px-4 sm:static sm:border-0 sm:pt-4 sm:pb-0 sm:px-0 sm:z-0">
          <div className="max-w-lg mx-auto space-y-2">
            <button
              type="submit"
              disabled={!hasLocation}
              className="w-full min-h-[44px] py-3 px-6 rounded-xl bg-primary text-primary-foreground font-medium hover:bg-primary/90 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-primary"
            >
              Continue <ArrowRight className="w-5 h-5" />
            </button>
            {!hasLocation && (
              <button
                type="button"
                onClick={() => navigate("/onboarding/schedule")}
                className="w-full min-h-[44px] py-2 px-4 rounded-xl border border-border text-muted-foreground hover:bg-muted/50 text-sm"
              >
                Skip for now (set location later in Settings)
              </button>
            )}
          </div>
        </div>
      </form>
    </motion.div>
  );
}
