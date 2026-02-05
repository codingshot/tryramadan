# Todo: Macro & Recipe Section Improvements

A living list of improvements for the **Macro Tracker** (Dashboard Macros) and **Recipe** sections (Recipes page, Recipe detail, Dashboard Meals, Schedule) of TryRamadan.

---

## Macro section (Dashboard Macros)

### Data & consistency
- [ ] **Single recipe source** — Macro Tracker currently builds `recipeOptions` from `recipes.json` directly. Align with `/recipes` and Schedule by using `getRecipes()` from `cultureRecipes` so recipe list (and any new recipes) stay in sync everywhere.
- [ ] **Sync planned ↔ meal plan** — Consider syncing or linking “Meal prep plan (planned)” with the Schedule/day meal plan notes (e.g. show same day’s plan from Schedule) or document that they are separate by design.
- [ ] **Portions in planned items** — Ensure planned items support portions the same way as food log (e.g. “2 portions”) and that totals multiply correctly.

### UX & flows
- [ ] **Copy planned day** — Add “Copy planned meals to another day” or “Copy to next day” (similar to Schedule’s copy-meals) so users can duplicate a planned day.
- [ ] **Quick goals from Ramadan preset** — Optional one-tap “Ramadan default” daily goals (e.g. common calorie range) for users who haven’t set goals.
- [ ] **Planned vs actual clarity** — Make it obvious which list is “what I planned” vs “what I actually ate” (labels, icons, or short tooltips).
- [ ] **Empty states** — Clear empty state for “No planned items” and “No food log entries” with CTAs (e.g. “Add from recipe”, “Log your first meal”).
- [ ] **Meal history** — Meal history / feed could support filtering by meal type (suhoor / iftar / between) or date range.

### Mobile & layout
- [ ] **Sticky day selector on mobile** — Keep the day (and prev/next) visible or easily accessible when scrolling on small screens.
- [ ] **Collapsible sections** — Allow collapsing “Meal prep plan”, “Food log”, “Planned vs actual” so users can focus on one at a time on mobile.
- [ ] **Macro bars** — Ensure progress bars (planned vs actual vs goals) are readable and accessible (labels, contrast, optional numeric labels on bars).

### Goals & recommendations
- [ ] **Goal editing** — If daily goals are editable on the same page, make the edit flow obvious (e.g. “Edit goals” link near the goals summary).
- [ ] **Recommended calories** — Surface “Use recommended” (from body weight / sex) more clearly when the user hasn’t set a custom goal.
- [ ] **Protein/carbs/fat goals** — If goals support P/C/F, show them in the same “planned vs actual vs goals” area and in macro bars.

### Accessibility & polish
- [ ] **ARIA and labels** — Ensure all “Quick add from recipe” selects, portion inputs, and remove buttons have clear labels and roles.
- [ ] **Keyboard nav** — Day picker and meal history list should be fully keyboard-navigable.
- [ ] **Loading / saving** — If any persistence is async, show a brief “Saving…” or confirm save so users know data is stored.

---

## Recipe section

### Cross-app consistency
- [ ] **One recipe source everywhere** — Confirm Recipes page, Recipe detail, Dashboard Meals, Schedule, and Macro Tracker all use the same source (e.g. `getRecipes()` / `cultureRecipes`) so new or updated recipes appear everywhere.
- [ ] **Recipe IDs and deep links** — Ensure `/recipe/suhoor/1` and `/recipe/iftar/2` style URLs are stable and that “add to plan” / “add to log” use the same IDs across Meals, Schedule, and Macros.

### Recipes page (`/recipes`)
- [ ] **Performance** — If the recipe list grows large, consider virtualisation or pagination for the list; keep filters fast (e.g. keep current client-side filtering if dataset stays small).
- [ ] **Saved filters / presets** — Optional “Save this filter” (e.g. “West Africa Iftar”) that persists or shares via URL (URL already supports filters).
- [ ] **Sort options** — Allow sort by name, time, calories, or region so users can scan by preference.
- [ ] **Image placeholders** — If recipes get images later, add consistent placeholder or icon so cards have a uniform layout.

### Recipe detail page
- [ ] **Print / export** — “Print recipe” or “Copy ingredients list” for cooking without the phone.
- [ ] **Servings** — Current portions selector is good; ensure it’s obvious and that “default servings” is clear in the copy.
- [ ] **Related content** — “Similar recipes” and “Part of [Country] traditions” are in place; consider adding “More from this region” linking to `/recipes?region=...`.
- [ ] **Nutrition** — If nutrition is optional, show “Nutrition info not set” instead of blank so users know it’s missing by design.

### Dashboard Meals
- [ ] **Date for planning** — Currently adds to “today” only; consider optional date picker so users can add recipes to a future day’s plan from Meals (or rely on Schedule for that and document it).
- [ ] **Grocery list** — Optional “Export grocery list” (e.g. copy to clipboard or share) from selected recipes.
- [ ] **Favorites** — Favorites are in place; consider “View favorites only” filter or a dedicated favorites section at the top when the user has favorites.
- [ ] **Create your own meal** — Form is comprehensive; optional: suggest duplicating a recipe as a starting point for custom meals.

### Schedule page (recipe picker)
- [ ] **Recipe picker source** — Confirm the “From recipe” dropdown uses the same `getRecipes()` as elsewhere and shows meal-type–appropriate options (suhoor/iftar).
- [ ] **Add to plan + log** — When adding from recipe on Schedule, optionally add to both food log and day meal plan (like Dashboard Meals) so the day view stays consistent.
- [ ] **Last days of Ramadan** — “Copy to remaining Ramadan days” and “Copy to next day” are in place; consider a “Fill next 7 days from today” for quick planning.

### Content & data
- [ ] **New recipes** — Process for adding new recipes to `recipes.json` (and any CMS or script) so they appear in all sections.
- [ ] **Regions and countries** — Keep recipe `region` and `countryId` aligned with culture data so “Recipes from this country” and region filters stay accurate.
- [ ] **Dietary tags** — Ensure vegetarian, vegan-option, halal (and any new tags) are consistent and filterable where relevant (e.g. Recipes, Meals).

### Accessibility & SEO
- [ ] **Structured data** — Recipe detail already has JSON-LD; ensure list pages and meal-plan usage don’t need additional schema (e.g. ItemList for “today’s plan”).
- [ ] **Headings and landmarks** — Use a single `<h1>` per page and logical `<h2>`/`<h3>` for “Ingredients”, “Instructions”, “Similar recipes”, etc.
- [ ] **Focus and screen readers** — Recipe cards, filters, and “Add to meal plan” buttons should have clear focus order and labels.

---

## Shared / both

- [ ] **Offline** — If the app targets PWA/offline, ensure recipe list and macro data (or at least last-viewed recipes) work offline or degrade gracefully.
- [ ] **Analytics / feedback** — Optional: track which recipes are added to plan most, or which macro flows are used, to prioritise future improvements.
- [ ] **Onboarding** — Short tooltip or first-time hint for “Plan in Meals, log in Macros or Schedule” so new users understand the flow.

---

## Priority suggestions

| Priority | Area        | Item |
|----------|-------------|------|
| High     | Macros      | Single recipe source (`getRecipes()` in Macros) |
| High     | Recipes     | Confirm single recipe source everywhere |
| Medium   | Macros      | Copy planned day / copy to next day |
| Medium   | Macros      | Sticky day selector on mobile |
| Medium   | Recipe list | Sort options (name, time, region) |
| Low      | Recipe detail | Print / copy ingredients |
| Low      | Meals       | Grocery list export |

---

*Last updated: when this file was created. Check off items as they’re implemented and add new ideas as needed.*
