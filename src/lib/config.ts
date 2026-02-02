/**
 * Centralized API and external service URLs.
 * Use for easier staging, mocking, and environment overrides.
 */

export const API_CONFIG = {
  /** Aladhan prayer times API */
  aladhan: "https://api.aladhan.com",
  /** Nominatim (OpenStreetMap) geocoding and reverse geocoding */
  nominatim: "https://nominatim.openstreetmap.org",
  /** TimeAPI for timezone lookup by coordinates */
  timeapi: "https://timeapi.io",
  /** ipapi.co for IP-based geolocation */
  ipapi: "https://ipapi.co",
  /** Quran.com API */
  quranApi: "https://api.quran.com/api/v4",
  /** Adhan audio CDN */
  adhanAudio: "https://cdn.aladhan.com",
} as const;

export const EXTERNAL_LINKS = {
  quran: "https://quran.com",
  sunnah: "https://sunnah.com",
} as const;
