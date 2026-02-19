/**
 * Aladhan API prayer time calculation methods.
 * @see https://api.aladhan.com/v1/methods
 * Method IDs match the Aladhan API (e.g. ?method=2 for ISNA).
 */

export interface PrayerCalculationMethod {
  id: number;
  name: string;
}

/** All supported calculation methods (subset of Aladhan API). */
export const PRAYER_CALCULATION_METHODS: PrayerCalculationMethod[] = [
  { id: 2, name: "Islamic Society of North America (ISNA)" },
  { id: 3, name: "Muslim World League" },
  { id: 4, name: "Umm Al-Qura University, Makkah" },
  { id: 5, name: "Egyptian General Authority of Survey" },
  { id: 1, name: "University of Islamic Sciences, Karachi" },
  { id: 8, name: "Gulf Region" },
  { id: 9, name: "Kuwait" },
  { id: 10, name: "Qatar" },
  { id: 11, name: "Majlis Ugama Islam Singapura" },
  { id: 12, name: "Union Organization Islamic de France" },
  { id: 13, name: "Diyanet İşleri Başkanlığı, Turkey" },
  { id: 14, name: "Spiritual Administration of Muslims of Russia" },
  { id: 16, name: "Dubai" },
  { id: 17, name: "JAKIM (Malaysia)" },
  { id: 18, name: "Tunisia" },
  { id: 19, name: "Algeria" },
  { id: 20, name: "KEMENAG (Indonesia)" },
  { id: 21, name: "Morocco" },
  { id: 22, name: "Comunidade Islamica de Lisboa (Portugal)" },
  { id: 23, name: "Ministry of Awqaf, Jordan" },
  { id: 0, name: "Shia Ithna-Ashari (Leva Institute, Qum)" },
  { id: 7, name: "Institute of Geophysics, University of Tehran" },
];

/** Default Aladhan method when no preference is set (ISNA). */
export const DEFAULT_PRAYER_METHOD_ID = 2;

/**
 * Preferred calculation method by country/region code (ISO 3166-1 alpha-2 or common codes).
 * Used to suggest a default in Settings when the user's country is known.
 */
const COUNTRY_TO_METHOD: Record<string, number> = {
  US: 2,  // ISNA
  CA: 2,  // ISNA
  GB: 3,  // Muslim World League (common in UK)
  UK: 3,
  EG: 5,  // Egyptian General Authority
  SA: 4,  // Umm Al-Qura, Makkah
  AE: 8,  // Gulf Region
  KW: 9,  // Kuwait
  QA: 10, // Qatar
  BH: 8,  // Gulf
  OM: 8,  // Gulf
  YE: 4,  // Makkah
  MY: 17, // JAKIM Malaysia
  ID: 20, // KEMENAG Indonesia
  SG: 11, // Singapore
  TR: 13, // Turkey
  FR: 12, // France
  TN: 18, // Tunisia
  DZ: 19, // Algeria
  MA: 21, // Morocco
  JO: 23, // Jordan
  PT: 22, // Portugal
  RU: 14, // Russia
  PK: 1,  // Karachi
  IN: 1,  // Karachi (common for South Asia)
  IR: 7,  // Tehran (or 0 for Jafari)
  IQ: 0,  // Jafari (common)
  AZ: 13, // Turkey (or 14 Russia)
};

/**
 * Returns the recommended method ID for a country code, or DEFAULT_PRAYER_METHOD_ID if unknown.
 */
export function getDefaultPrayerMethodForCountry(countryCode: string | null | undefined): number {
  if (!countryCode || typeof countryCode !== "string") return DEFAULT_PRAYER_METHOD_ID;
  const upper = countryCode.trim().toUpperCase();
  return COUNTRY_TO_METHOD[upper] ?? DEFAULT_PRAYER_METHOD_ID;
}

export function getPrayerMethodById(id: number): PrayerCalculationMethod | undefined {
  return PRAYER_CALCULATION_METHODS.find((m) => m.id === id);
}
