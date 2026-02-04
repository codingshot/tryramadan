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

// Custom hook for location: auto-detect from IP only on load (no browser location request). Use detectLocation for explicit "use my location" (geolocation then IP).
export function useAutoLocation() {
  const [state, setState] = useState<LocationState>({
    location: null,
    loading: true,
    error: null,
  });

  const detectLocation = useCallback(async () => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    const location = await detectLocationWithGeolocation();
    if (location) {
      setState({ location, loading: false, error: null });
      return location;
    }
    setState({ location: null, loading: false, error: 'Could not detect location' });
    return null;
  }, []);

  // On load: IP only (no browser geolocation). User can request precise location when selecting location (e.g. "Use my location" button).
  useEffect(() => {
    const run = async () => {
      setState(prev => ({ ...prev, loading: true, error: null }));
      const ipLocation = await detectLocationFromIPOnly();
      if (ipLocation) {
        setState({ location: ipLocation, loading: false, error: null });
      } else {
        setState({ location: null, loading: false, error: 'Could not detect location' });
      }
    };
    const id =
      typeof requestIdleCallback !== 'undefined'
        ? requestIdleCallback(() => run(), { timeout: 500 })
        : setTimeout(run, 0);
    return () => {
      if (typeof cancelIdleCallback !== 'undefined') cancelIdleCallback(id as number);
      else clearTimeout(id as number);
    };
  }, []);

  return { ...state, detectLocation };
}
