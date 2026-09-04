import { describe, it, expect } from "vitest";
import { getAllCountries, getCountryById, getAllCountryIds } from "@/lib/cultureRecipes";

describe("Culture data (cities.json backfill)", () => {
  it("getAllCountries returns all regions and countries including new ones from cities", () => {
    const countries = getAllCountries();
    const ids = countries.map((c) => c.id);
    expect(ids).toContain("egypt");
    expect(ids).toContain("nigeria");
    expect(ids).toContain("lebanon");
    expect(ids).toContain("jordan");
    expect(ids).toContain("kenya");
    expect(ids).toContain("tanzania");
    expect(ids).toContain("south-africa");
    expect(ids).toContain("bosnia");
  });

  it("Egypt has cities from cities.json (Cairo, Alexandria)", () => {
    const country = getCountryById("egypt");
    expect(country).toBeDefined();
    expect(country!.cities).toBeDefined();
    expect(country!.cities!.length).toBeGreaterThanOrEqual(2);
    const cityNames = country!.cities!.map((c) => c.name);
    expect(cityNames).toContain("Cairo");
    expect(cityNames).toContain("Alexandria");
    expect(country!.cities![0].suhoor_meals).toBeDefined();
    expect(country!.cities![0].iftar_meals).toBeDefined();
    expect(country!.cities![0].rituals_and_traditions).toBeDefined();
  });

  it("New country Lebanon exists with cities (Beirut)", () => {
    const country = getCountryById("lebanon");
    expect(country).toBeDefined();
    expect(country!.name).toBe("Lebanon");
    expect(country!.cities).toBeDefined();
    expect(country!.cities!.some((c) => c.name === "Beirut")).toBe(true);
  });

  it("New country Kenya exists with cities (Nairobi, Mombasa)", () => {
    const country = getCountryById("kenya");
    expect(country).toBeDefined();
    expect(country!.name).toBe("Kenya");
    expect(country!.cities!.map((c) => c.name)).toEqual(
      expect.arrayContaining(["Nairobi", "Mombasa"])
    );
  });

  it("getAllCountryIds includes new country IDs for routing", () => {
    const ids = getAllCountryIds();
    expect(ids).toContain("lebanon");
    expect(ids).toContain("jordan");
    expect(ids).toContain("kenya");
    expect(ids).toContain("tanzania");
    expect(ids).toContain("south-africa");
    expect(ids).toContain("bosnia");
  });

  it("Senegal exists with cities (Dakar, Touba) from cities.json alignment", () => {
    const country = getCountryById("senegal");
    expect(country).toBeDefined();
    expect(country!.name).toContain("Senegal");
    expect(country!.cities).toBeDefined();
    expect(country!.cities!.length).toBeGreaterThanOrEqual(2);
    const cityNames = country!.cities!.map((c) => c.name);
    expect(cityNames).toContain("Dakar");
    expect(cityNames).toContain("Touba");
    expect(country!.cities![0].suhoor_meals).toBeDefined();
    expect(country!.cities![0].iftar_meals).toBeDefined();
  });
});
