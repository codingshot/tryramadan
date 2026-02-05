---
name: culture-recipes-authenticity
description: Fact-check and verify culture pages, traditions, and recipes; add and validate hyperlink sources; test authenticity of cultural and culinary claims. Use when adding or editing cultural-traditions.json, recipes.json, country pages, recipe pages, or any tradition/food/recipe content in TryRamadan.
---

# Culture & Recipes Authenticity

Use this skill when adding or reviewing **country culture pages**, **traditions**, **foods**, **recipes**, and **sources** in TryRamadan. Verify claims against authoritative sources and add hyperlinks where appropriate.

---

## 1. Data locations

| Data | File | Notes |
|------|------|--------|
| Countries, traditions, foods, cities, mosques | `src/data/cultural-traditions.json` | Regions → countries → traditions[], foods[], cities[], majorMosques[] |
| Recipes (suhoor & iftar) | `src/data/recipes.json` | suhoor[] and iftar[]; each has countryId, region, ingredients, steps, etc. |
| Types | `src/lib/cultureRecipes.ts` | Country, Recipe, CityPractice, MajorMosque interfaces |

Optional fields for sourcing:
- **Country / tradition**: `sources` array: `{ "title": "Short label", "url": "https://..." }`
- **Recipe**: `sources` array: `{ "title": "Short label", "url": "https://..." }`

---

## 2. Fact-checking workflow

### Before adding or editing any tradition or food

1. **Identify the claim** – What exactly are we stating? (e.g. "Fanous is a Ramadan lantern in Egypt", "Harira is the iconic iftar soup in Morocco".)
2. **Find at least one authoritative source** – Prefer:
   - Official or national tourism/culture sites (e.g. Saudi, UAE, Egypt)
   - UNESCO Intangible Cultural Heritage (e.g. iftar listing, country pages)
   - Academic or well-sourced references (Wikipedia with citations, peer-reviewed)
   - Reputable news or culture outlets (BBC, The National, Egypt Today)
3. **Cross-check** – Ensure the source supports the claim; note if it’s “widely reported” vs “officially documented”.
4. **Add a source link** – Add a `sources` entry with a short `title` and the `url`. Do not invent URLs; verify each link.

### Before adding or editing any recipe

1. **Dish authenticity** – Is the dish actually associated with the stated country/region and with Ramadan/suhoor/iftar where we say so?
2. **Ingredients and method** – Are they consistent with traditional preparations? Flag if the recipe is a simplified or fusion version and add a note in `significance` or `tips` if needed.
3. **Nutrition and times** – Prefer realistic prep/cook/total times and plausible nutrition (or omit if unknown).
4. **Source** – Add `sources` (e.g. "Traditional preparation", "Regional cookery") with a URL to a recipe, food history, or cultural article when available.

---

## 3. Preferred source types

| Type | Use for | Example |
|------|---------|--------|
| UNESCO ICH | Iftar, shared Ramadan practices, country heritage | [Iftar – UNESCO](https://ich.unesco.org/en/RL/iftar-eftari-iftar-iftor-and-its-socio-cultural-traditions-01984) |
| Wikipedia | Traditions, dishes, demographics (check citations) | Fanous, Ramadan in Saudi Arabia |
| Official tourism / culture | Country-specific Ramadan and foods | Saudi, UAE, Egypt, Morocco tourism sites |
| Reputable media | Cultural stories, history of a tradition | BBC, The National, Egypt Today |
| Academic / food history | Recipe origins, ingredients | Use only if accessible and cited |

Avoid: blogs with no citations, commercial recipe sites without cultural context, social media.

---

## 4. Red flags

- **Traditions**: Claiming a tradition is “ancient” or “official” without a source; attributing a practice to the wrong country or region.
- **Foods**: Listing a dish as “Ramadan staple” for a country where it isn’t; mixing up similar dishes (e.g. thareed vs tashreeb).
- **Recipes**: Recipe that doesn’t match the stated cuisine; fabricated nutrition or timing; copied text without attribution.
- **Demographics**: Muslim population figures that are outdated or wrong; always prefer recent census or Pew/demographic reports and add a source.
- **Arabic names**: Verify spelling and transliteration (see also `islamic-content-authenticity` for Arabic/glossary).

---

## 5. Per-country checklist (when expanding or editing)

For each country in `cultural-traditions.json`:

- [ ] Traditions: each has a clear description; at least one has a source if it’s a strong or contested claim.
- [ ] Foods: list matches common Ramadan/suhoor/iftar foods for that country; add a country-level or tradition-level source where possible.
- [ ] Cities: suhoor_meals, iftar_meals, desserts_and_drinks, rituals_and_traditions are consistent with the country and not copy-pasted from elsewhere.
- [ ] majorMosques: names and cities are correct; links (googleMapsUrl, appleMapsUrl) work.
- [ ] muslimPopulation / muslimPopulationNote: plausible and sourced if possible (e.g. Wikipedia demography, Pew Research).

---

## 6. Per-recipe checklist

- [ ] countryId matches a country in `cultural-traditions.json`.
- [ ] region is consistent (e.g. "Levant", "South Asia").
- [ ] ingredients and steps are coherent and feasible.
- [ ] significance/tips/benefits are accurate and not overstated.
- [ ] Optional: add `sources` with at least one URL (recipe, culture, or food history).

---

## 7. Testing authenticity (how to “test”)

When asked to **test** authenticity of culture, traditions, or recipes:

1. **Read** the current text (tradition description, food list, recipe name/description/significance).
2. **Search** for the tradition or dish + country/region + “Ramadan” (or “iftar”/“suhoor”) and open 1–2 authoritative links.
3. **Compare**: Does the source confirm or contradict our text? Note any correction (e.g. “Fanous is Fatimid-era” not “Pharaonic”; or “Harira is Moroccan iftar soup” confirmed).
4. **Suggest**: Add or update a `sources` entry with the verified URL; or propose an edit to the description if wrong.
5. **Document**: In a PR or comment, briefly state: “Verified: [claim] via [source]. Added source link.”

Do not mark content as “authentic” without at least one real, checked source. Prefer “sourced” or “verified against [X]” rather than “authenticated” in formal wording.

---

## 8. References

| Resource | Use |
|----------|-----|
| [UNESCO Intangible Cultural Heritage](https://ich.unesco.org/en/lists) | Iftar, country heritage lists, food-related inscriptions. |
| [Wikipedia](https://en.wikipedia.org) | Traditions, Ramadan by country, dishes; prefer articles with citations. |
| Country tourism/culture ministries | Saudi, UAE, Egypt, Morocco, etc. – Ramadan and food. |
| App data | `src/data/cultural-traditions.json`, `src/data/recipes.json`. |
| Islamic content | For hadith, Quran, Arabic terms use `islamic-content-authenticity` skill. |

When in doubt, add a source link and a short note (e.g. “Source: …”) rather than leaving claims unsourced. Prefer accuracy over quantity; one well-sourced tradition is better than several unverified ones.
