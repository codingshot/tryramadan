import { useState, useEffect, useCallback } from 'react';

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
    const response = await fetch('https://ipapi.co/json/');
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
      `https://timeapi.io/api/TimeZone/coordinate?latitude=${lat}&longitude=${lng}`
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
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5&addressdetails=1`,
      {
        headers: {
          'Accept-Language': 'en',
          'User-Agent': 'TryRamadan.app'
        }
      }
    );

    if (!response.ok) throw new Error('Location search failed');

    const data = await response.json();
    
    return data.map((item: any) => ({
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

// Custom hook for location with auto-detect
export function useAutoLocation() {
  const [state, setState] = useState<LocationState>({
    location: null,
    loading: true,
    error: null,
  });

  const detectLocation = useCallback(async () => {
    setState(prev => ({ ...prev, loading: true, error: null }));

    // Try browser geolocation first
    if ('geolocation' in navigator) {
      try {
        const position = await new Promise<GeolocationPosition>((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, {
            enableHighAccuracy: false,
            timeout: 5000,
            maximumAge: 300000, // 5 min cache
          });
        });

        // Reverse geocode to get city name
        const response = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${position.coords.latitude}&lon=${position.coords.longitude}`,
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
          
          setState({ location, loading: false, error: null });
          return location;
        }
      } catch (geoError) {
        console.log('Geolocation failed, falling back to IP:', geoError);
      }
    }

    // Fallback to IP-based location
    const ipLocation = await getLocationFromIP();
    if (ipLocation) {
      setState({ location: ipLocation, loading: false, error: null });
      return ipLocation;
    }

    setState({ location: null, loading: false, error: 'Could not detect location' });
    return null;
  }, []);

  useEffect(() => {
    detectLocation();
  }, [detectLocation]);

  return { ...state, detectLocation };
}
