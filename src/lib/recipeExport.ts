/**
 * Recipe export: plain text, JSON, Markdown for download.
 * Used with RecipeDetail download/share popover.
 */

import type { Recipe } from "@/lib/cultureRecipes";
import { getIngredientDisplay } from "@/lib/cultureRecipes";

export type MealLabel = "Suhoor" | string;

export function getRecipeAsText(
  recipe: Recipe,
  mealLabel: MealLabel,
  portions: number,
  multiplier: number
): string {
  const lines: string[] = [
    recipe.name,
    `${mealLabel} · Ramadan recipe${recipe.region ? ` · ${recipe.region}` : ""}`,
    "",
    recipe.description,
    "",
    "--- Ingredients ---",
    ...(recipe.ingredients ?? []).map((ing) => `• ${getIngredientDisplay(ing, multiplier)}`),
    "",
  ];
  if (recipe.steps && recipe.steps.length > 0) {
    lines.push("--- Instructions ---");
    recipe.steps.forEach((step, i) => lines.push(`${i + 1}. ${step}`));
    lines.push("");
  }
  lines.push(
    "--- Details ---",
    `Prep: ${recipe.prepTime}`,
    ...(recipe.cookTime ? [`Cook: ${recipe.cookTime}`] : []),
    ...(recipe.totalTime ? [`Total: ${recipe.totalTime}`] : []),
    `Servings: ${portions}`
  );
  if (recipe.nutrition) {
    lines.push(
      `${recipe.nutrition.calories} cal · P: ${recipe.nutrition.protein} · C: ${recipe.nutrition.carbs} · F: ${recipe.nutrition.fat}`
    );
  }
  if (recipe.significance) {
    lines.push("", "Cultural significance:", recipe.significance);
  }
  lines.push("", "— TryRamadan.app");
  return lines.join("\n");
}

export function getRecipeAsMarkdown(
  recipe: Recipe,
  mealLabel: MealLabel,
  portions: number,
  multiplier: number
): string {
  const lines: string[] = [
    `# ${recipe.name}`,
    "",
    `*${mealLabel} recipe${recipe.region ? ` · ${recipe.region}` : ""}*`,
    "",
    recipe.description,
    "",
    "## Ingredients",
    "",
    ...(recipe.ingredients ?? []).map((ing) => `- ${getIngredientDisplay(ing, multiplier)}`),
    "",
  ];
  if (recipe.steps && recipe.steps.length > 0) {
    lines.push("## Instructions", "");
    recipe.steps.forEach((step, i) => lines.push(`${i + 1}. ${step}`));
    lines.push("");
  }
  lines.push(
    "## Details",
    "",
    `- **Prep:** ${recipe.prepTime}`,
    ...(recipe.cookTime ? [`- **Cook:** ${recipe.cookTime}`] : []),
    ...(recipe.totalTime ? [`- **Total:** ${recipe.totalTime}`] : []),
    `- **Servings:** ${portions}`,
    ""
  );
  if (recipe.nutrition) {
    lines.push(
      `- **Nutrition:** ${recipe.nutrition.calories} cal · P: ${recipe.nutrition.protein} · C: ${recipe.nutrition.carbs} · F: ${recipe.nutrition.fat}`,
      ""
    );
  }
  if (recipe.significance) {
    lines.push("## Cultural significance", "", recipe.significance, "");
  }
  lines.push("— [TryRamadan.app](https://tryramadan.app)");
  return lines.join("\n");
}

export function getRecipeAsJson(
  recipe: Recipe,
  mealLabel: MealLabel,
  portions: number,
  multiplier: number
): string {
  const payload = {
    name: recipe.name,
    mealType: mealLabel,
    region: recipe.region ?? null,
    description: recipe.description,
    servings: portions,
    ingredients: (recipe.ingredients ?? []).map((ing) => getIngredientDisplay(ing, multiplier)),
    steps: recipe.steps ?? [],
    prepTime: recipe.prepTime,
    cookTime: recipe.cookTime ?? null,
    totalTime: recipe.totalTime ?? null,
    nutrition: recipe.nutrition ?? null,
    significance: recipe.significance ?? null,
    dietary: recipe.dietary ?? [],
    source: "TryRamadan.app",
  };
  return JSON.stringify(payload, null, 2);
}

/** Trigger browser download of a string as a file. */
export function downloadString(content: string, filename: string, mimeType: string): void {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.rel = "noopener";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
