/**
 * Effective Ramadan range for "Day N", "Last day", and rest-of-month. When set, start/end come from preferences (localStorage: ramadanStartOverride, ramadanEndOverride); else app calendar.
 */
import { useMemo } from "react";
import { useUserPreferences } from "@/hooks/useLocalStorage";
import {
  getEffectiveRamadanRange,
  getRamadanRangeLength,
  isRamadanDayInRange,
  getRamadanDayNumberInRange,
  isLastDayOfRamadanInRange,
} from "@/lib/ramadan";

export function useRamadanRange() {
  const [preferences] = useUserPreferences();
  const overrides = useMemo(
    () =>
      preferences.ramadanStartOverride != null || preferences.ramadanEndOverride != null
        ? {
            ramadanStartOverride: preferences.ramadanStartOverride,
            ramadanEndOverride: preferences.ramadanEndOverride,
          }
        : null,
    [preferences.ramadanStartOverride, preferences.ramadanEndOverride]
  );

  const range = useMemo(() => getEffectiveRamadanRange(overrides), [overrides]);

  const isRamadanDay = useMemo(
    () => (date: Date) => isRamadanDayInRange(date, range.start, range.end),
    [range.start, range.end]
  );
  const getRamadanDayNumber = useMemo(
    () => (date: Date) => getRamadanDayNumberInRange(date, range.start, range.end),
    [range.start, range.end]
  );
  const isLastDayOfRamadan = useMemo(
    () => (date: Date) => isLastDayOfRamadanInRange(date, range.start, range.end),
    [range.start, range.end]
  );
  const totalDays = useMemo(
    () => getRamadanRangeLength(range.start, range.end),
    [range.start, range.end]
  );

  return {
    ...range,
    isRamadanDay,
    getRamadanDayNumber,
    isLastDayOfRamadan,
    totalDays,
  };
}
