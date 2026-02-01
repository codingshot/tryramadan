import { Link } from "react-router-dom";
import { MapPin } from "lucide-react";
import { useUserPreferences } from "@/hooks/useLocalStorage";
import { useAutoLocation } from "@/hooks/useLocation";

interface PrayerLocationBadgeProps {
  /** When provided, clicking opens this handler (e.g. location editor) instead of navigating to Settings */
  onClickToUpdate?: () => void;
}

/** Shows which location prayer times are for, with link/button to update (Settings or custom handler). */
export function PrayerLocationBadge({ onClickToUpdate }: PrayerLocationBadgeProps) {
  const [preferences] = useUserPreferences();
  const { location: autoLocation } = useAutoLocation();
  const displayLocation = preferences.location || (autoLocation ? autoLocation.displayName : null);
  const locationShort = displayLocation
    ? displayLocation.split(",").slice(0, 2).join(",").trim()
    : null;

  const label = locationShort ? `Prayer times for ${locationShort}` : "Set location for prayer times";
  const title = displayLocation ? `Prayer times for ${displayLocation}. Click to update.` : "Set location for prayer times";
  const className = "inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-secondary transition-colors";

  if (onClickToUpdate) {
    return (
      <button
        type="button"
        onClick={onClickToUpdate}
        className={className}
        title={title}
        aria-label={label}
      >
        <MapPin className="w-3.5 h-3.5" />
        {locationShort ? (
          <>
            <span>Prayer times for {locationShort}</span>
            <span className="opacity-70">· Update</span>
          </>
        ) : (
          <span>Set location for prayer times</span>
        )}
      </button>
    );
  }

  if (!locationShort) {
    return (
      <Link to="/settings" className={className} title={title}>
        <MapPin className="w-3.5 h-3.5" />
        Set location for prayer times
      </Link>
    );
  }

  return (
    <Link to="/settings" className={className} title={title}>
      <MapPin className="w-3.5 h-3.5" />
      <span>Prayer times for {locationShort}</span>
      <span className="opacity-70">· Update</span>
    </Link>
  );
}
