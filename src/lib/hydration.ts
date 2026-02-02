/**
 * Hydration tracker: region-based defaults and unit formatting.
 * Defaults follow common guidelines (e.g. ~2 L / 8 cups) and local measurement habits.
 */

export const ML_PER_US_CUP = 236.588;

/** Countries that typically use US customary cups for drinks; others use metric (ml/L). */
const CUP_COUNTRIES = new Set(['US']);

export type HydrationUnit = 'ml' | 'cups';

/**
 * Default daily water goal in ml by region.
 * Based on common guidelines (~2 L) and regional habits (US often cited as "8 cups").
 */
export function getDefaultHydrationGoalMl(countryCode: string): number {
  if (countryCode === 'US') {
    return Math.round(8 * ML_PER_US_CUP); // 8 cups ≈ 1893 ml
  }
  return 2000; // 2 L default for metric regions (UK, EU, Middle East, Asia, etc.)
}

export function getHydrationUnit(countryCode: string): HydrationUnit {
  return CUP_COUNTRIES.has(countryCode) ? 'cups' : 'ml';
}

/**
 * Format a volume in ml for display in the user's region.
 */
export function formatHydrationAmount(ml: number, unit: HydrationUnit): string {
  if (unit === 'cups') {
    const cups = ml / ML_PER_US_CUP;
    if (cups >= 1 && cups === Math.round(cups)) return `${cups} cup${cups === 1 ? '' : 's'}`;
    return `${cups.toFixed(1)} cups`;
  }
  if (ml >= 1000) return `${(ml / 1000).toFixed(1)} L`;
  return `${ml} ml`;
}

/**
 * Format goal for display (e.g. "2 L" or "8 cups").
 */
export function formatHydrationGoal(goalMl: number, unit: HydrationUnit): string {
  if (unit === 'cups') {
    const cups = Math.round(goalMl / ML_PER_US_CUP);
    return `${cups} cups`;
  }
  if (goalMl >= 1000) return `${(goalMl / 1000).toFixed(1)} L`;
  return `${goalMl} ml`;
}

/** Preset amounts in ml for quick-add buttons (region-agnostic storage). */
export const HYDRATION_PRESETS_ML = [
  { ml: 200, labelSmall: '200', labelCups: '~1 cup' },
  { ml: 250, labelSmall: '250', labelCups: '1 cup' },
  { ml: 500, labelSmall: '500', labelCups: '2 cups' },
  { ml: 1000, labelSmall: '1L', labelCups: '4 cups' },
] as const;
