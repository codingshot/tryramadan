/**
 * Weight unit conversion and region-based default (kg vs lb).
 * Stored value is always kg; display and input can be lb for imperial regions.
 */

export const KG_PER_LB = 0.45359237;
export const LB_PER_KG = 1 / KG_PER_LB;

export function kgToLb(kg: number): number {
  return kg * LB_PER_KG;
}

export function lbToKg(lb: number): number {
  return lb * KG_PER_LB;
}

/** Countries that typically use pounds for body weight (US, UK, Myanmar, Liberia). */
const IMPERIAL_WEIGHT_COUNTRIES = new Set(["US", "GB", "MM", "LR"]);

/** Whether the region typically uses pounds for body weight. */
export function isImperialWeightCountry(countryCode: string | null | undefined): boolean {
  if (!countryCode || typeof countryCode !== "string") return false;
  return IMPERIAL_WEIGHT_COUNTRIES.has(countryCode.toUpperCase().trim());
}
