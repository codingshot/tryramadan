import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Loader2, Navigation, X } from 'lucide-react';
import { searchLocations, LocationResult, getLocationFromIP } from '@/hooks/useLocation';
import { API_CONFIG } from '@/lib/config';

interface LocationSearchProps {
  value: string;
  onSelect: (location: LocationResult) => void;
  placeholder?: string;
}

export const LocationSearch = ({ value, onSelect, placeholder = "Search city..." }: LocationSearchProps) => {
  const [query, setQuery] = useState(value);
  const [results, setResults] = useState<LocationResult[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [detectingLocation, setDetectingLocation] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();

  // Update query when value prop changes
  useEffect(() => {
    setQuery(value);
  }, [value]);

  // Search with debounce
  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    if (query.length < 2) {
      setResults([]);
      return;
    }

    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      const locations = await searchLocations(query);
      setResults(locations);
      setLoading(false);
      setIsOpen(locations.length > 0);
    }, 300);

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [query]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleDetectLocation = async () => {
    setDetectingLocation(true);
    
    // Try browser geolocation first
    if ('geolocation' in navigator) {
      try {
        const position = await new Promise<GeolocationPosition>((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, {
            enableHighAccuracy: false,
            timeout: 10000,
          });
        });

        // Reverse geocode
        const response = await fetch(
          `${API_CONFIG.nominatim}/reverse?format=json&lat=${position.coords.latitude}&lon=${position.coords.longitude}`,
          { headers: { 'User-Agent': 'TryRamadan.app' } }
        );

        if (response.ok) {
          const data = await response.json();
          const location: LocationResult = {
            name: data.address?.city || data.address?.town || data.address?.village || 'Your Location',
            displayName: data.display_name,
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            country: data.address?.country || '',
          };
          
          setQuery(location.name);
          onSelect(location);
          setDetectingLocation(false);
          setIsOpen(false);
          return;
        }
      } catch (error) {
        console.log('Geolocation failed, using IP:', error);
      }
    }

    // Fallback to IP
    const ipLocation = await getLocationFromIP();
    if (ipLocation) {
      setQuery(ipLocation.name);
      onSelect(ipLocation);
    }
    
    setDetectingLocation(false);
    setIsOpen(false);
  };

  const handleSelect = (location: LocationResult) => {
    setQuery(location.name);
    onSelect(location);
    setIsOpen(false);
  };

  return (
    <div ref={containerRef} className="relative">
      <div className="relative">
        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => results.length > 0 && setIsOpen(true)}
          placeholder={placeholder}
          className="w-full min-h-[44px] pl-10 pr-20 py-3 rounded-xl border border-border bg-background focus:border-secondary focus:ring-1 focus:ring-secondary outline-none transition-all text-foreground placeholder:text-muted-foreground"
          aria-label="Search for a city"
          autoComplete="off"
        />
        
        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
          {loading && <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />}
          
          {query && (
            <button
              type="button"
              onClick={() => { setQuery(''); setResults([]); }}
              className="min-h-[44px] min-w-[44px] p-2 hover:bg-muted rounded-full transition-colors touch-manipulation flex items-center justify-center"
              aria-label="Clear search"
            >
              <X className="w-4 h-4 text-muted-foreground" />
            </button>
          )}
          
          <button
            type="button"
            onClick={handleDetectLocation}
            disabled={detectingLocation}
            className="min-h-[44px] min-w-[44px] p-2 hover:bg-muted rounded-lg transition-colors text-secondary touch-manipulation flex items-center justify-center"
            title="Detect my location"
            aria-label="Detect my location"
          >
            {detectingLocation ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Navigation className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>

      {/* Dropdown */}
      <AnimatePresence>
        {isOpen && results.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute z-[100] w-full mt-2 bg-card border border-border rounded-xl shadow-2xl overflow-hidden"
            style={{ backgroundColor: 'hsl(var(--card))' }}
          >
            {results.map((location, index) => (
              <button
                key={`${location.lat}-${location.lng}-${index}`}
                type="button"
                onClick={() => handleSelect(location)}
                className="w-full min-h-[44px] px-4 py-3 text-left hover:bg-muted active:bg-muted/80 transition-colors border-b border-border last:border-b-0 flex items-start gap-3 touch-manipulation"
                style={{ backgroundColor: 'hsl(var(--card))' }}
                aria-label={`Select ${location.name}, ${location.country}`}
              >
                <MapPin className="w-4 h-4 text-secondary mt-0.5 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-foreground truncate">{location.name}</p>
                  <p className="text-xs text-muted-foreground truncate">{location.displayName}</p>
                </div>
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
