import { Link } from "react-router-dom";
import { MapPin } from "lucide-react";
import { useUserPreferences } from "@/hooks/useLocalStorage";
import { useAutoLocation } from "@/hooks/useLocation";

/** Shows which location prayer times are for, with link to update (Settings). */
export function PrayerLocationBadge() {
  const [preferences] = useUserPreferences();
  const { location: autoLocation } = useAutoLocation();
  const displayLocation = preferences.location || (autoLocation ? autoLocation.displayName : null);
  const locationShort = displayLocation
    ? displayLocation.split(",").slice(0, 2).join(",").trim()
    : null;

  if (!locationShort) {
    return (
      <Link
        to="/settings"
        className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-secondary transition-colors"
      >
        <MapPin className="w-3.5 h-3.5" />
        Set location for prayer times
      </Link>
    );
  }

  return (
    <Link
      to="/settings"
      className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-secondary transition-colors"
      title={`Prayer times for ${displayLocation}. Click to update.`}
    >
      <MapPin className="w-3.5 h-3.5" />
      <span>Prayer times for {locationShort}</span>
      <span className="opacity-70">· Update</span>
    </Link>
  );
}
