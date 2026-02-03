import { describe, it, expect } from "vitest";
import {
  getRamadanStartForYear,
  getRamadanEndForYear,
  getNextRamadanStart,
  getCurrentRamadanStart,
  isRamadanDay,
  getRamadanDayNumber,
  getDaysUntilRamadan,
  isCurrentlyRamadan,
} from "@/lib/ramadan";

describe("ramadan.ts", () => {
  it("returns Ramadan start/end for known years", () => {
    const start2025 = getRamadanStartForYear(2025);
    expect(start2025.getFullYear()).toBe(2025);
    expect(start2025.getMonth()).toBe(2); // Mar
    expect(start2025.getDate()).toBe(1);

    const end2025 = getRamadanEndForYear(2025);
    expect(end2025.getFullYear()).toBe(2025);
    expect(end2025.getMonth()).toBe(2); // Mar
    expect(end2025.getDate()).toBe(30);
  });

  it("Ramadan 2031 spans two Gregorian years (Dec 2030 – Jan 2031)", () => {
    const start2031 = getRamadanStartForYear(2031);
    expect(start2031.getFullYear()).toBe(2030);
    expect(start2031.getMonth()).toBe(11); // Dec
    expect(start2031.getDate()).toBe(26);

    const end2031 = getRamadanEndForYear(2031);
    expect(end2031.getFullYear()).toBe(2031);
    expect(end2031.getMonth()).toBe(0); // Jan
    expect(end2031.getDate()).toBe(23);
  });

  it("isRamadanDay true for Dec 31 2030 (within Ramadan 2031)", () => {
    const dec31_2030 = new Date(2030, 11, 31);
    expect(isRamadanDay(dec31_2030)).toBe(true);
  });

  it("getRamadanDayNumber returns 1–30 for dates in Ramadan", () => {
    const dec26_2030 = new Date(2030, 11, 26); // first day Ramadan 2031
    expect(getRamadanDayNumber(dec26_2030)).toBe(1);

    const dec31_2030 = new Date(2030, 11, 31);
    const day = getRamadanDayNumber(dec31_2030);
    expect(day).toBeGreaterThanOrEqual(1);
    expect(day).toBeLessThanOrEqual(30);
  });

  it("isRamadanDay false for dates outside Ramadan", () => {
    const jun1_2025 = new Date(2025, 5, 1); // Ramadan 2025 is Mar 1 – Mar 30
    expect(isRamadanDay(jun1_2025)).toBe(false);
  });

  it("isRamadanDay true for Jan 1 2031 (still in Ramadan 2031)", () => {
    const jan1_2031 = new Date(2031, 0, 1); // Ramadan 2031 ends Jan 23 2031
    expect(isRamadanDay(jan1_2031)).toBe(true);
  });

  it("getNextRamadanStart and getCurrentRamadanStart return valid dates", () => {
    const next = getNextRamadanStart();
    expect(next).toBeInstanceOf(Date);
    expect(Number.isNaN(next.getTime())).toBe(false);
    const current = getCurrentRamadanStart();
    expect(current).toBeInstanceOf(Date);
    expect(Number.isNaN(current.getTime())).toBe(false);
  });

  it("getDaysUntilRamadan returns a number", () => {
    const days = getDaysUntilRamadan();
    expect(Number.isInteger(days)).toBe(true);
    expect(days).toBeGreaterThanOrEqual(0);
  });

  it("isCurrentlyRamadan returns boolean", () => {
    const result = isCurrentlyRamadan();
    expect(typeof result).toBe("boolean");
  });
});
