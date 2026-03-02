import { useState, useEffect, useCallback } from 'react';
import { API_CONFIG } from '@/lib/config';

export interface LocationResult {
  name: string;
  displayName: string;
  lat: number;
  lng: number;
  country: string;
  /** IANA timezone (e.g. America/New_York) when available (e.g. from ipapi.co). */
  timezone?: string;
}

export interface LocationState {
  location: LocationResult | null;
  loading: boolean;
  error: string | null;
}

// Get location from IP using free API
export async function getLocationFromIP(): Promise<LocationResult | null> {
  try {
    const response = await fetch(`${API_CONFIG.ipapi}/json/`);
    if (!response.ok) throw new Error('IP location failed');
    
    const data = await response.json();
    
    return {
      name: data.city,
      displayName: `${data.city}, ${data.country_name}`,
      lat: data.latitude,
      lng: data.longitude,
      country: data.country_name,
      timezone: data.timezone || undefined,
    };
  } catch (error) {
    console.error('IP location error:', error);
    return null;
  }
}

/** Resolve IANA timezone from coordinates (e.g. for Nominatim results that don't include timezone). */
export async function getTimezoneFromCoords(lat: number, lng: number): Promise<string | null> {
  try {
    const response = await fetch(
      `${API_CONFIG.timeapi}/api/TimeZone/coordinate?latitude=${lat}&longitude=${lng}`
    );
    if (!response.ok) return null;
    const data = await response.json();
    return typeof data.timeZone === 'string' ? data.timeZone : null;
  } catch (error) {
    console.error('Timezone lookup error:', error);
    return null;
  }
}

// Search for locations using Nominatim (OpenStreetMap) - free and open source
export async function searchLocations(query: string): Promise<LocationResult[]> {
  if (!query || query.length < 2) return [];

  try {
    const response = await fetch(
      `${API_CONFIG.nominatim}/search?format=json&q=${encodeURIComponent(query)}&limit=5&addressdetails=1`,
      {
        headers: {
          'Accept-Language': 'en',
          'User-Agent': 'TryRamadan.app'
        }
      }
    );

    if (!response.ok) throw new Error('Location search failed');

    const data = await response.json();
    interface NominatimItem {
      lat: string;
      lon: string;
      display_name: string;
      name?: string;
      address?: { city?: string; town?: string; village?: string; country?: string };
    }
    return (data as NominatimItem[]).map((item) => ({
      name: item.address?.city || item.address?.town || item.address?.village || item.name,
      displayName: item.display_name,
      lat: parseFloat(item.lat),
      lng: parseFloat(item.lon),
      country: item.address?.country || '',
    }));
  } catch (error) {
    console.error('Location search error:', error);
    return [];
  }
}

/** IP-only detection: no browser geolocation. Use for automatic load so we don't prompt for location. */
async function detectLocationFromIPOnly(): Promise<LocationResult | null> {
  return getLocationFromIP();
}

/** Full detection: try browser geolocation first, then fall back to IP. Call only when user explicitly chooses "use my location". */
export async function detectLocationWithGeolocation(): Promise<LocationResult | null> {
  if ('geolocation' in navigator) {
    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: false,
          timeout: 5000,
          maximumAge: 300000, // 5 min cache
        });
      });

      const response = await fetch(
        `${API_CONFIG.nominatim}/reverse?format=json&lat=${position.coords.latitude}&lon=${position.coords.longitude}`,
        { headers: { 'User-Agent': 'TryRamadan.app' } }
      );

      if (response.ok) {
        const data = await response.json();
        return {
          name: data.address?.city || data.address?.town || data.address?.village || 'Your Location',
          displayName: data.display_name,
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          country: data.address?.country || '',
        };
      }
    } catch (geoError) {
      console.log('Geolocation failed, falling back to IP:', geoError);
    }
  }
  return getLocationFromIP();
}

/**
 * Custom hook for location: returns saved preferences location if available,
 * otherwise auto-detects from IP on load. Updating location anywhere (Settings,
 * LocationDisplay, Onboarding) writes to useUserPreferences which triggers
 * re-renders in all consumers of useAutoLocation.
 */
export function useAutoLocation() {
  // Read preferences via a lightweight localStorage snapshot + storage event listener
  // to avoid circular hook dependencies with useLocalStorage
  const getPrefsSnapshot = useCallback(() => {
    try {
      const raw = window.localStorage.getItem('tryramadan-preferences');
      return raw ? JSON.parse(raw) : null;
    } catch { return null; }
  }, []);

  const [prefs, setPrefs] = useState(getPrefsSnapshot);

  // Listen for localStorage writes from other components (same tab: custom event, cross-tab: storage event)
  useEffect(() => {
    const handler = () => setPrefs(getPrefsSnapshot());
    // For cross-tab sync
    window.addEventListener('storage', handler);
    // For same-tab sync: we'll dispatch a custom event when preferences change
    window.addEventListener('tryramadan-prefs-updated', handler);
    return () => {
      window.removeEventListener('storage', handler);
      window.removeEventListener('tryramadan-prefs-updated', handler);
    };
  }, [getPrefsSnapshot]);

  const savedCoords = prefs?.locationCoords as { lat: number; lng: number } | null | undefined;
  const savedName = prefs?.location as string | undefined;

  const [ipLocation, setIpLocation] = useState<LocationResult | null>(null);
  const [loading, setLoading] = useState(!savedCoords);
  const [error, setError] = useState<string | null>(null);

  const detectLocation = useCallback(async () => {
    setLoading(true);
    setError(null);
    const location = await detectLocationWithGeolocation();
    if (location) {
      setIpLocation(location);
      setLoading(false);
      return location;
    }
    setError('Could not detect location');
    setLoading(false);
    return null;
  }, []);

  // On load: IP only if no saved location
  useEffect(() => {
    if (savedCoords && savedName) return;
    const run = async () => {
      setLoading(true);
      const loc = await detectLocationFromIPOnly();
      if (loc) {
        setIpLocation(loc);
      } else {
        setError('Could not detect location');
      }
      setLoading(false);
    };
    const id =
      typeof requestIdleCallback !== 'undefined'
        ? requestIdleCallback(() => run(), { timeout: 500 })
        : setTimeout(run, 0);
    return () => {
      if (typeof cancelIdleCallback !== 'undefined') cancelIdleCallback(id as number);
      else clearTimeout(id as number);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Prefer saved preferences location over IP-detected
  const location: LocationResult | null = (savedCoords && savedName)
    ? {
        name: savedName.split(',')[0] || savedName,
        displayName: savedName,
        lat: savedCoords.lat,
        lng: savedCoords.lng,
        country: '',
        timezone: prefs?.timezone ?? undefined,
      }
    : ipLocation;

  return {
    location,
    loading: !location && loading,
    error: location ? null : error,
    detectLocation,
  };
}
