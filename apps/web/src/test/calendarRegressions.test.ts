import { afterEach, describe, expect, it, vi } from 'vitest';
import { getRamadanRangeLength, getRamadanDayNumberInRange, getRamadanStartForYear, getEffectiveRamadanRange, isCurrentlyRamadan, isLastDayOfRamadan } from '@tryramadan/core/ramadan';

afterEach(() => vi.useRealTimers());
describe('calendar regressions', () => {
  it('uses civil dates across spring daylight-saving changes', () => {
    const start = new Date(2025, 2, 1);
    const end = new Date(2025, 2, 30);
    expect(getRamadanRangeLength(start, end)).toBe(30);
    expect(getRamadanDayNumberInRange(new Date(2025, 2, 10), start, end)).toBe(10);
  });
  it('keeps unknown-year estimates near the requested year, not the reference year', () => {
    expect(getRamadanStartForYear(2033).getFullYear()).toBe(2032);
    expect(getRamadanStartForYear(2023).getFullYear()).toBe(2023);
  });
  it('keeps the late-2030 occurrence end in 2031', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2030, 11, 31, 20));
    const range = getEffectiveRamadanRange();
    expect(range.startStr).toBe('2030-12-26');
    expect(range.endStr).toBe('2031-01-23');
    expect(getRamadanRangeLength(range.start, range.end)).toBe(29);
    expect(isCurrentlyRamadan()).toBe(true);
  });
  it('includes the morning of the first and evening of the last day', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2025, 2, 1, 1));
    expect(isCurrentlyRamadan()).toBe(true);
    vi.setSystemTime(new Date(2025, 2, 30, 23));
    expect(isCurrentlyRamadan()).toBe(true);
  });
  it('checks a historical last day against its own occurrence, not today', () => {
    expect(isLastDayOfRamadan(new Date(2025, 2, 30))).toBe(true);
    expect(isLastDayOfRamadan(new Date(2031, 0, 23))).toBe(true);
  });
  it.each([
    ['2030-02-31', '2030-03-31'],
    ['2030-01-01', '2030-12-31'],
    ['2030-01-05', '2030-01-06'],
  ])('rejects invalid Ramadan override %s – %s', (start, end) => {
    expect(getEffectiveRamadanRange({ ramadanStartOverride: start, ramadanEndOverride: end }).fromOverride).toBe(false);
  });
});
