/**
 * Merges more-city-data.json into cities.json:
 * - Populates existing cities with population, muslim_population, ramadan_traditions, etc.
 * - Adds new cities/countries from more-city-data that don't exist in cities.json
 * - Combines similar things (same city/country = merge extra fields)
 */

const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const citiesPath = path.join(ROOT, "cities.json");
const morePath = path.join(ROOT, "more-city-data.json");

const citiesJson = JSON.parse(fs.readFileSync(citiesPath, "utf8"));
const moreData = JSON.parse(fs.readFileSync(morePath, "utf8"));

// Normalize country name for matching (more-city-data -> cities.json style)
const countryNorm = (c) => {
  const n = (c || "").trim();
  if (n === "UAE") return "United Arab Emirates";
  return n;
};

// Normalize city name for matching
const cityNorm = (name) => {
  if (!name || typeof name !== "string") return "";
  return name
    .replace(/\s+/g, " ")
    .trim()
    .replace(/^Sana'a$/i, "Sanaa")
    .replace(/^Washington D\.C\.?$/i, "Washington D.C.");
};

// Build set of (countryNorm, cityNorm) that exist in cities.json
const existing = new Set();
citiesJson.data.forEach((block) => {
  const country = countryNorm(block.country);
  (block.cities || []).forEach((city) => {
    existing.add(`${country}\t${cityNorm(city.name)}`);
  });
});

// Build map: key = countryNorm + "\t" + cityNorm -> more-city-data entry
const moreByKey = new Map();
moreData.forEach((entry) => {
  const country = countryNorm(entry.country);
  const city = cityNorm(entry.city);
  const key = `${country}\t${city}`;
  // Keep first occurrence; could prefer longer ramadanTraditions
  if (!moreByKey.has(key)) moreByKey.set(key, entry);
});

// Helper: map more-city-data entry to optional city fields for merge
function extraFields(entry) {
  const out = {};
  if (entry.totalPopulation != null) out.population = entry.totalPopulation;
  if (entry.muslimPopulation != null) out.muslim_population = entry.muslimPopulation;
  if (entry.muslimPercentage != null) out.muslim_percentage = entry.muslimPercentage;
  if (entry.ramadanTraditions != null) out.ramadan_traditions = entry.ramadanTraditions;
  if (entry.religiousCultural != null) out.religious_cultural = entry.religiousCultural;
  if (entry.tags && entry.tags.length) out.tags = entry.tags;
  if (entry.slug != null) out.slug = entry.slug;
  return out;
}

// 1) Populate existing cities with extra fields from more-city-data
citiesJson.data.forEach((block) => {
  const country = countryNorm(block.country);
  (block.cities || []).forEach((city) => {
    const key = `${country}\t${cityNorm(city.name)}`;
    const more = moreByKey.get(key);
    if (more) {
      Object.assign(city, extraFields(more));
    }
  });
});

// 2) Group more-city-data by country for new cities
const moreByCountry = new Map();
moreData.forEach((entry) => {
  const country = countryNorm(entry.country);
  const city = cityNorm(entry.city);
  const key = `${country}\t${city}`;
  if (existing.has(key)) return;
  if (!moreByCountry.has(country)) moreByCountry.set(country, []);
  moreByCountry.get(country).push(entry);
});

// Region mapping: more-city-data region -> cities.json region style
function mapRegion(region) {
  if (!region) return "Other";
  const r = (region || "").toLowerCase();
  if (r.includes("middle east") || r.includes("levant") || r.includes("gcc") || r.includes("caucasus")) return "Middle East";
  if (r.includes("north africa")) return "North Africa";
  if (r.includes("south asia") || r.includes("southeast")) return "South Asia";
  if (r.includes("east africa") || r.includes("west africa") || r.includes("africa")) return "Africa";
  if (r.includes("central asia")) return "Central Asia";
  if (r.includes("europe") || r.includes("united kingdom") || r.includes("france") || r.includes("belgium") || r.includes("netherlands")) return "Europe";
  if (r.includes("americas") || r.includes("united states") || r.includes("canada")) return "Americas";
  return region || "Other";
}

// 3) Add new cities: either append to existing country or add new country
moreByCountry.forEach((entries, countryNormName) => {
  const existingBlock = citiesJson.data.find((b) => countryNorm(b.country) === countryNormName);
  const newCities = entries.map((e) => ({
    name: e.city,
    suhoor_meals: [],
    iftar_meals: [],
    desserts_and_drinks: [],
    rituals_and_traditions: [],
    notes: e.ramadanTraditions || "",
    ...extraFields(e),
  }));

  if (existingBlock) {
    existingBlock.cities = existingBlock.cities || [];
    newCities.forEach((c) => existingBlock.cities.push(c));
  } else {
    const region = mapRegion(entries[0].region);
    citiesJson.data.push({
      country: countryNormName,
      region,
      cities: newCities,
    });
  }
});

// Sort data by country name for consistency
citiesJson.data.sort((a, b) => (a.country || "").localeCompare(b.country || ""));

// Update schema to include optional city fields
citiesJson.schema = {
  country: "string",
  region: "string",
  cities: [
    {
      name: "string",
      suhoor_meals: ["string"],
      iftar_meals: ["string"],
      desserts_and_drinks: ["string"],
      rituals_and_traditions: ["string"],
      notes: "string",
      population: "string (optional)",
      muslim_population: "string (optional)",
      muslim_percentage: "number (optional)",
      ramadan_traditions: "string (optional)",
      religious_cultural: "string (optional)",
      tags: ["string (optional)"],
      slug: "string (optional)",
    },
  ],
};

fs.writeFileSync(citiesPath, JSON.stringify(citiesJson, null, 2), "utf8");
console.log("Merged more-city-data.json into cities.json.");
console.log("Countries in cities.json:", citiesJson.data.length);
console.log("Total city entries:", citiesJson.data.reduce((acc, b) => acc + (b.cities || []).length, 0));
