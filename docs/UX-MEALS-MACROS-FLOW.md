## UX: Meals × Macro Tracker Cohesion

### 1. Ideal health-focused journey

1. **Plan the day (Suhoor & Iftar)**  
   - Browse curated recipes, favourites, or cultural picks.  
   - Add selections to *today’s* plan with one tap.  
   - Confirm portions or swaps while seeing estimated calories/macros at a glance.
2. **Track nutrition (macro tracker)**  
   - Review planned menu carried over automatically.  
   - Adjust goals or portions and log actual intake (including between-meal snacks).  
   - Compare planned vs actual totals without re-entering items.
3. **See fasting impact**  
   - At the end of the day, Today/Dashboard shows “Fuel summary” powered by macros (hydration, energy check-ins, fasting hours, satiety).  
   - `/dashboard/progress` highlights how nutrition relates to streaks, energy, or reflections (“Days you met hydration goal → higher energy score”).  
   - Insights prompt learning (“Lighter suhoor + higher protein → steadier energy”).

### 2. Friction in current experience

| Stage | Issue | Details |
|-------|-------|---------|
| Planning | Separate date anchors | Meals page locks to `today`; Macro tracker allows browsing any date. Switching dates resets context; user can’t plan tomorrow’s meals via Meals page. |
| Planning → Tracking | Duplicate entry | Adding recipe to plan requires multiple clicks; to log macros later, user must re-enter macros or rely on recipe nutrition (only if data present). Custom meals typed on Meals page must be re-entered on Macro tracker for other days. |
| Tracking | Fragmented tabs | Macro tracker splits “Add to plan” and “Actual food eaten” forms; Meals page uses Suhoor/Iftar tabs. Users switch between two pages plus multiple forms. |
| Tracking → Impact | No summary loop | Fasting status cards and Progress page don’t surface nutrient impact; user cannot tell if meeting goals changed energy or hydration. |
| Context | Route hopping | Jumping from Meals to Macros opens a new page; no inline tray or persistence of what user was editing. No shared breadcrumbs or chips to move between steps. |

### 3. UX affordances to unify flow

1. **Shared date picker ribbon**  
   - Persistent pill across Meals, Macros, and Today (`Today · Tomorrow · calendar`).  
   - When user changes date in one page, others follow (stored in context).  
   - Add `“Viewing: Tue 18 Mar (Ramadan Day 7)”` chip with quick switch.

2. **Plan/log segmented control**  
   - Top-level tabs: `Plan · Log · Impact`.  
   - `Plan` renders existing Meals content (recipes, favourites) in-pane.  
   - `Log` reveals macro tracker forms for the same date.  
   - `Impact` summarises progress stats (hydration, energy, macros vs goal).  
   - Users never leave the flow; they slide between stages with the same layout.

3. **Inline recipe-to-macro cards**  
   - Each recipe card shows estimated calories/macros (if available) with quick add chips: `Add to Plan`, `Log now`, `Swap portion`.  
   - When tapped, show a compact confirmation card at screen bottom with portion slider instead of redirecting to macros page.

4. **Sticky “Today’s intake” tray**  
   - Once any item is logged, a mini panel floats at bottom indicating total calories/macros and meal coverage.  
   - Tapping opens macro drawer for quick edits; ensures user retains context while browsing recipes.

5. **Cross-page breadcrumbs**  
   - Under page titles, display subtle chips: `Plan` • `Macros` • `Insights` with the current one filled.  
   - Clicking chips routes without losing date/selection state (persisted in context/localStorage).

6. **Contextual prompts**  
   - After adding a recipe, toast: “Logged to Suhoor plan. Want to adjust macros?” with inline `Adjust` action that opens macro drawer.  
   - On Macro tracker, show banner: “Need meal ideas? Browse recipes →” linking back but maintaining date filter.

### 4. Macro-light mode

Target users who care about remembering meals but not grams.

**Configuration**: Toggle in Settings → Your priorities (`Macro tracking detail: Off / Macro-light / Full`).  

**Behaviour when Macro-light is on:**
- Hide protein/carbs/fat fields; show simple checkboxes or emoji (`✅ Ate planned suhoor`, `🕯️ Light iftar`, `🍵 Hydration`).  
- Replace numeric goal bars with qualitative cards: “Suhoor: Balanced”, “Iftar: Heavy”, derived from simple categories (light/normal/heavy).  
- Allow quick tags on logged meals: `Carb-heavy`, `High protein`, `Sweet`, `Comfort food`.  
- Provide a daily note (“How did this meal feel?”) to tie into journal/reflection.  
- Insights in Progress page focus on patterns (“3 light suhoors → higher energy scores”) without numbers.

Users can switch to Full mode anytime; existing numeric data remains but hidden. This maintains inclusivity for wellness-focused users while keeping core macro infrastructure intact.
