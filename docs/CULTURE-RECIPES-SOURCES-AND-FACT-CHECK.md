# Culture & Recipes: Sources and Fact-Check Guide

Use this with the **culture-recipes-authenticity** Cursor skill when adding or verifying traditions, foods, and recipes.

## Data files

- **`src/data/cultural-traditions.json`** – Regions → countries → traditions, foods, cities, majorMosques. Optional: `sources` (country-level and/or per tradition).
- **`src/data/recipes.json`** – Suhoor and iftar recipes. Optional: `sources` per recipe.

## Source links (schema)

- **Country**: `"sources": [{"title": "Short label", "url": "https://..."}]`
- **Tradition**: add `"sources": [{"title": "...", "url": "..."}]` inside the tradition object.
- **Recipe**: `"sources": [{"title": "...", "url": "..."}]`

Use authoritative links: UNESCO ICH, Wikipedia (with citations), official tourism/culture sites, reputable media.

## Country-by-country checklist

When going through each country:

1. **Traditions** – Verify each tradition name and description; add at least one source for contested or strong claims (e.g. Fanous, Mesaharati, Gargee'an).
2. **Foods** – Confirm the food list matches common Ramadan/suhoor/iftar dishes for that country; add a country-level source if helpful.
3. **Cities** – Check suhoor_meals, iftar_meals, desserts_and_drinks, rituals_and_traditions for consistency with the country (no copy-paste from another).
4. **majorMosques** – Names and cities correct; googleMapsUrl and appleMapsUrl work.
5. **muslimPopulation / muslimPopulationNote** – Plausible; add a source in `sources` if citing a specific figure (e.g. Pew, census, Wikipedia demography).

## Recipe checklist

- `countryId` must match a country id in cultural-traditions.json.
- `region` consistent (e.g. Levant, South Asia).
- Ingredients and steps coherent; significance/tips factually accurate.
- Add `sources` with at least one URL where possible (recipe, culture, or food history).

## Already added

**Culture (country and/or tradition sources):**
- **Egypt**: Fanous (tradition + country); UNESCO Iftar.
- **Saudi Arabia**: Wikipedia – Ramadan in Saudi Arabia.
- **Morocco**: UNESCO Iftar; UNESCO Morocco intangible heritage.
- **Turkey**: Mahya (tradition + country); UNESCO Iftar.
- **Lebanon**: Iftar cannon (Wikipedia).
- **Jordan**: Mansaf (Wikipedia).
- **UAE**: Garangao/Gargee'an (Qatar National Library).
- **Qatar**: Garangao (QNL).
- **Algeria**: Ramadan in Algeria (About Algeria); UNESCO Iftar.
- **Tunisia**: UNESCO Iftar.
- **Indonesia**: Bedug (tradition); UNESCO Iftar; Takjil (Manual Jakarta).
- **Pakistan**: Rooh Afza and Ramadan (Dawn); UNESCO Iftar.
- **Bangladesh**: UNESCO Iftar.
- **Nigeria**: UNESCO Iftar.

**Recipes:** Moroccan Harira, Egyptian Konafa, Jordanian Mansaf, Lebanese Fattoush & Jallab, Pakistani Fruit Chaat, Algerian Chorba, Senegalese Thieboudienne, Indonesian Kolak (each with 1+ source link).

## Expanding content

- Add more countries or traditions only after a quick fact-check and, where possible, a source.
- Prefer one well-sourced tradition over several unsourced ones.
- Use the culture-recipes-authenticity skill for the full workflow (fact-check steps, red flags, testing authenticity).
