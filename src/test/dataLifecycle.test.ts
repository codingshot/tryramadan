/**
 * Tests for data lifecycle utilities. See docs/DATA-LIFECYCLE-POLICIES.md.
 */
import { describe, it, expect, beforeEach } from "vitest";
import {
  TRYRAMADAN_LOCALSTORAGE_KEYS,
  deleteAllUserData,
  clearJournalOnly,
  clearHealthDataOnly,
  clearLocationFromPreferences,
} from "@/lib/dataLifecycle";

describe("dataLifecycle", () => {
  beforeEach(() => {
    // Clear localStorage before each test
    window.localStorage.clear();
  });

  it("TRYRAMADAN_LOCALSTORAGE_KEYS includes expected keys", () => {
    expect(TRYRAMADAN_LOCALSTORAGE_KEYS).toContain("tryramadan-preferences");
    expect(TRYRAMADAN_LOCALSTORAGE_KEYS).toContain("tryramadan-journal");
    expect(TRYRAMADAN_LOCALSTORAGE_KEYS).toContain("tryramadan-progress");
    expect(TRYRAMADAN_LOCALSTORAGE_KEYS.length).toBeGreaterThan(10);
  });

  it("deleteAllUserData removes all known keys", async () => {
    // Populate some keys
    TRYRAMADAN_LOCALSTORAGE_KEYS.forEach((key, i) => {
      window.localStorage.setItem(key, JSON.stringify({ test: i }));
    });
    expect(window.localStorage.length).toBe(TRYRAMADAN_LOCALSTORAGE_KEYS.length);

    await deleteAllUserData();

    TRYRAMADAN_LOCALSTORAGE_KEYS.forEach((key) => {
      expect(window.localStorage.getItem(key)).toBeNull();
    });
  });

  it("deleteAllUserData does not throw", async () => {
    window.localStorage.setItem("tryramadan-journal", "[]");
    await expect(deleteAllUserData()).resolves.toBeUndefined();
  });

  it("deleteAllUserData leaves non-tryramadan keys intact", async () => {
    window.localStorage.setItem("tryramadan-journal", "[]");
    window.localStorage.setItem("other-app-key", "value");
    await deleteAllUserData();
    expect(window.localStorage.getItem("other-app-key")).toBe("value");
  });

  describe("partial delete", () => {
    it("clearJournalOnly removes only journal key", () => {
      window.localStorage.setItem("tryramadan-journal", '[{"id":"1"}]');
      window.localStorage.setItem("tryramadan-wellness", "{}");
      window.localStorage.setItem("tryramadan-progress", "{}");
      clearJournalOnly();
      expect(window.localStorage.getItem("tryramadan-journal")).toBeNull();
      expect(window.localStorage.getItem("tryramadan-wellness")).toBe("{}");
      expect(window.localStorage.getItem("tryramadan-progress")).toBe("{}");
    });

    it("clearHealthDataOnly removes only wellness and symptoms", () => {
      window.localStorage.setItem("tryramadan-wellness", '{"2025-01-01":[]}');
      window.localStorage.setItem("tryramadan-symptoms", '{"2025-01-01":[]}');
      window.localStorage.setItem("tryramadan-journal", "[]");
      clearHealthDataOnly();
      expect(window.localStorage.getItem("tryramadan-wellness")).toBeNull();
      expect(window.localStorage.getItem("tryramadan-symptoms")).toBeNull();
      expect(window.localStorage.getItem("tryramadan-journal")).toBe("[]");
    });

    it("clearLocationFromPreferences sets location/coords/timezone to empty or null", () => {
      const prefs = {
        location: "London",
        locationCoords: { lat: 51.5, lng: -0.1 },
        timezone: "Europe/London",
        onboardingComplete: true,
      };
      window.localStorage.setItem("tryramadan-preferences", JSON.stringify(prefs));
      clearLocationFromPreferences();
      const raw = window.localStorage.getItem("tryramadan-preferences");
      expect(raw).toBeTruthy();
      const updated = JSON.parse(raw!) as Record<string, unknown>;
      expect(updated.location).toBe("");
      expect(updated.locationCoords).toBeNull();
      expect(updated.timezone).toBeNull();
      expect(updated.onboardingComplete).toBe(true);
    });

    it("clearLocationFromPreferences does nothing when preferences key missing", () => {
      expect(() => clearLocationFromPreferences()).not.toThrow();
    });
  });
});
