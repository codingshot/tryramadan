import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MapPin, ChevronDown, Loader2, X, Check } from "lucide-react";
import { LocationSearch } from "./LocationSearch";
import { LocationResult, getLocationFromIP } from "@/hooks/useLocation";
import { useUserPreferences } from "@/hooks/useLocalStorage";

interface LocationDisplayProps {
  compact?: boolean;
  showTimezone?: boolean;
  /** Controlled open state: when provided, clicking the display uses this instead of internal state */
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export const LocationDisplay = ({ compact = false, showTimezone = false, open: controlledOpen, onOpenChange }: LocationDisplayProps) => {
  const [preferences, setPreferences] = useUserPreferences();
  const [internalOpen, setInternalOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const isControlled = controlledOpen !== undefined && onOpenChange !== undefined;
  const isEditing = isControlled ? controlledOpen : internalOpen;
  const setIsEditing = isControlled ? onOpenChange! : setInternalOpen;
  
  const handleLocationSelect = (location: LocationResult) => {
    setPreferences({
      ...preferences,
      location: location.displayName,
      locationCoords: { lat: location.lat, lng: location.lng }
    });
    setIsEditing(false);
  };
  
  const handleAutoDetect = async () => {
    setLoading(true);
    const location = await getLocationFromIP();
    if (location) {
      handleLocationSelect(location);
    }
    setLoading(false);
  };
  
  const locationName = preferences.location?.split(',')[0] || 'Set location';
  const hasLocation = !!preferences.locationCoords;
  
  if (compact) {
    return (
      <button
        onClick={() => setIsEditing(!isEditing)}
        className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <MapPin className="w-3.5 h-3.5" />
        <span className="max-w-[150px] truncate">{locationName}</span>
        <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isEditing ? 'rotate-180' : ''}`} />
      </button>
    );
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsEditing(!isEditing)}
        className={`flex items-center gap-2 px-3 py-2 rounded-xl transition-all ${
          isEditing 
            ? 'bg-secondary/10 border border-secondary' 
            : 'bg-muted/50 border border-border hover:border-secondary/50'
        }`}
      >
        <MapPin className={`w-4 h-4 ${hasLocation ? 'text-secondary' : 'text-muted-foreground'}`} />
        <div className="text-left">
          <span className="text-sm font-medium block">{locationName}</span>
          {showTimezone && hasLocation && (
            <span className="text-xs text-muted-foreground">
              Prayer times calculated for this location
            </span>
          )}
        </div>
        <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform ${isEditing ? 'rotate-180' : ''}`} />
      </button>
      
      <AnimatePresence>
        {isEditing && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            className="absolute top-full left-0 right-0 mt-2 p-4 bg-card rounded-2xl border border-border shadow-elevated z-50 min-w-[300px]"
          >
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-medium text-sm">Update Location</h4>
              <button 
                onClick={() => setIsEditing(false)}
                className="p-1 rounded-lg hover:bg-muted transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            
            <LocationSearch
              value=""
              onSelect={handleLocationSelect}
              placeholder="Search for your city..."
            />
            
            <div className="mt-3 pt-3 border-t border-border">
              <button
                onClick={handleAutoDetect}
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 p-2 rounded-lg text-sm text-secondary hover:bg-secondary/10 transition-colors disabled:opacity-50"
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <MapPin className="w-4 h-4" />
                )}
                Auto-detect my location
              </button>
            </div>
            
            {preferences.location && (
              <div className="mt-3 p-2 rounded-lg bg-secondary/10 flex items-center gap-2">
                <Check className="w-4 h-4 text-secondary" />
                <span className="text-xs text-muted-foreground truncate">
                  Using: {preferences.location}
                </span>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
