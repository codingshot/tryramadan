/**
 * Hydration tracker: region-based and gender-based defaults with unit formatting.
 * 
 * Guidelines (general recommendations, NOT medical advice):
 * - Women: ~2.7 L (11 cups) total water intake per day (from food + beverages)
 * - Men: ~3.7 L (15 cups) total water intake per day (from food + beverages)
 * - ~80% typically from beverages → Women ~2.2 L, Men ~3 L
 * 
 * During Ramadan fasting, water intake window is limited (after iftar to before fajr),
 * so goals are adjusted to be achievable within the eating window.
 */

export const ML_PER_US_CUP = 236.588;

/** Countries that typically use US customary cups for drinks; others use metric (ml/L). */
const CUP_COUNTRIES = new Set(['US']);

export type HydrationUnit = 'ml' | 'cups';
export type GenderForHydration = 'male' | 'female' | 'prefer-not-to-say' | null;

/**
 * Gender-based hydration recommendations in ml.
 * Based on IOM (Institute of Medicine) guidelines for adequate intake.
 * Ramadan adjustment: slightly reduced since intake window is limited.
 */
export const HYDRATION_RECOMMENDATIONS = {
  male: {
    standard: 3000,      // ~3 L (about 13 cups) - recommended for average adult male
    ramadan: 2500,       // Adjusted for limited drinking window
    label: 'Based on male hydration guidelines',
  },
  female: {
    standard: 2200,      // ~2.2 L (about 9 cups) - recommended for average adult female
    ramadan: 2000,       // Adjusted for limited drinking window
    label: 'Based on female hydration guidelines',
  },
  default: {
    standard: 2500,      // Middle ground
    ramadan: 2200,
    label: 'General hydration guideline',
  },
} as const;

/**
 * Get recommended hydration goal based on gender.
 * Returns the Ramadan-adjusted value (smaller window for drinking).
 */
export function getGenderBasedHydrationGoalMl(gender: GenderForHydration): number {
  if (gender === 'male') return HYDRATION_RECOMMENDATIONS.male.ramadan;
  if (gender === 'female') return HYDRATION_RECOMMENDATIONS.female.ramadan;
  return HYDRATION_RECOMMENDATIONS.default.ramadan;
}

/**
 * Get hydration recommendation label based on gender.
 */
export function getHydrationRecommendationLabel(gender: GenderForHydration): string {
  if (gender === 'male') return HYDRATION_RECOMMENDATIONS.male.label;
  if (gender === 'female') return HYDRATION_RECOMMENDATIONS.female.label;
  return HYDRATION_RECOMMENDATIONS.default.label;
}

/**
 * Default daily water goal in ml by region (fallback when no gender set).
 * Based on common guidelines (~2 L) and regional habits (US often cited as "8 cups").
 */
export function getDefaultHydrationGoalMl(countryCode: string): number {
  if (countryCode === 'US') {
    return Math.round(8 * ML_PER_US_CUP); // 8 cups ≈ 1893 ml
  }
  return 2000; // 2 L default for metric regions (UK, EU, Middle East, Asia, etc.)
}

/**
 * Get the recommended hydration goal, prioritizing gender-based recommendation
 * if available, otherwise falling back to region-based default.
 */
export function getRecommendedHydrationGoalMl(
  gender: GenderForHydration,
  countryCode: string,
  customGoalMl?: number
): number {
  // If user has set a custom goal, use it
  if (customGoalMl && customGoalMl > 0) return customGoalMl;
  
  // If gender is set, use gender-based recommendation
  if (gender === 'male' || gender === 'female') {
    return getGenderBasedHydrationGoalMl(gender);
  }
  
  // Fall back to region-based default
  return getDefaultHydrationGoalMl(countryCode);
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

/**
 * Tips for staying hydrated during Ramadan.
 */
export const HYDRATION_TIPS = [
  'Drink water gradually between iftar and suhoor, not all at once',
  'Avoid caffeinated drinks as they can increase dehydration',
  'Eat water-rich foods like watermelon, cucumber, and soup',
  'Keep a water bottle nearby after iftar as a reminder',
  'Start and end your eating window with a glass of water',
] as const;
