/**
 * Tests for usePrayerTimes / useRamadanPrayerTimes: cache key, export functions.
 */
import { describe, it, expect, beforeEach, vi } from "vitest";
import { getRamadanPrayersCacheKey, fetchRamadanPrayerTimes } from "@/hooks/usePrayerTimes";
import { getRamadanDateRange } from "@/lib/ramadan";

describe("getRamadanPrayersCacheKey", () => {
  it("returns consistent key for same lat/lng/year", () => {
    const key1 = getRamadanPrayersCacheKey(40.7128, -74.006, 2025);
    const key2 = getRamadanPrayersCacheKey(40.7128, -74.006, 2025);
    expect(key1).toBe(key2);
  });

  it("returns different keys for different locations", () => {
    const keyNY = getRamadanPrayersCacheKey(40.7128, -74.006, 2025);
    const keyLA = getRamadanPrayersCacheKey(34.0522, -118.2437, 2025);
    expect(keyNY).not.toBe(keyLA);
  });

  it("returns different keys for different Ramadan years", () => {
    const key2025 = getRamadanPrayersCacheKey(40.7128, -74.006, 2025);
    const key2026 = getRamadanPrayersCacheKey(40.7128, -74.006, 2026);
    expect(key2025).not.toBe(key2026);
  });

  it("formats coordinates with 4 decimal places", () => {
    const key = getRamadanPrayersCacheKey(40.7128, -74.006, 2025);
    expect(key).toMatch(/^\d+\.\d{4}_-?\d+\.\d{4}_2025_\d+$/);
  });
});

describe("fetchRamadanPrayerTimes", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("throws on API failure", async () => {
    vi.spyOn(global, "fetch").mockResolvedValue({ ok: false } as Response);

    await expect(fetchRamadanPrayerTimes(40.7128, -74.006)).rejects.toThrow();
  });
});
