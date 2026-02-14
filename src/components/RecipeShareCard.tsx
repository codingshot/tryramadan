/**
 * Recipe card layouts for image generation (html2canvas).
 * Used in RecipeDetail download popover: pick a card style, generate PNG, download or share.
 */

import type { Recipe } from "@/lib/cultureRecipes";
import { getIngredientDisplay } from "@/lib/cultureRecipes";

export type RecipeCardStyle = "minimal" | "full" | "nutrition";

const CARD_WIDTH = 400;

interface RecipeShareCardProps {
  recipe: Recipe;
  mealLabel: string;
  portions: number;
  multiplier: number;
  style: RecipeCardStyle;
  /** When true, use neutral background for clean image (no theme dependency). */
  forImage?: boolean;
}

export function RecipeShareCard({
  recipe,
  mealLabel,
  portions,
  multiplier,
  style,
  forImage = true,
}: RecipeShareCardProps) {
  const bg = forImage ? "#1a1a1a" : "var(--background)";
  const fg = forImage ? "#fafafa" : "var(--foreground)";
  const muted = forImage ? "#a1a1aa" : "var(--muted-foreground)";
  const accent = forImage ? "#22c55e" : "var(--primary)";
  const border = forImage ? "#3f3f46" : "var(--border)";

  const common = {
    width: CARD_WIDTH,
    padding: 24,
    fontFamily: "system-ui, -apple-system, sans-serif",
    boxSizing: "border-box" as const,
  };

  return (
    <div
      style={{
        ...common,
        background: bg,
        color: fg,
        borderRadius: 16,
        border: `1px solid ${border}`,
        fontSize: 14,
        lineHeight: 1.5,
      }}
      data-recipe-card
    >
      {/* Header: name + meal */}
      <div style={{ marginBottom: style === "minimal" ? 0 : 16 }}>
        <div style={{ fontSize: 11, color: muted, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 4 }}>
          {mealLabel} · Ramadan
        </div>
        <h2 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: fg }}>{recipe.name}</h2>
        {recipe.region && (
          <div style={{ fontSize: 12, color: muted, marginTop: 4 }}>{recipe.region}</div>
        )}
      </div>

      {style === "minimal" && (
        <div style={{ fontSize: 12, color: muted }}>
          {recipe.prepTime}
          {recipe.cookTime ? ` · Cook ${recipe.cookTime}` : ""}
          {recipe.totalTime ? ` · Total ${recipe.totalTime}` : ""}
        </div>
      )}

      {(style === "full" || style === "nutrition") && (
        <>
          <div style={{ borderTop: `1px solid ${border}`, paddingTop: 12, marginTop: 8 }}>
            <div style={{ fontSize: 10, color: muted, textTransform: "uppercase", marginBottom: 6 }}>Ingredients</div>
            <ul style={{ margin: 0, paddingLeft: 18, color: fg }}>
              {(recipe.ingredients ?? []).slice(0, 8).map((ing, i) => (
                <li key={i} style={{ marginBottom: 2 }}>
                  {getIngredientDisplay(ing, multiplier)}
                </li>
              ))}
              {(recipe.ingredients?.length ?? 0) > 8 && (
                <li style={{ color: muted }}>+{(recipe.ingredients?.length ?? 0) - 8} more</li>
              )}
            </ul>
          </div>
          {recipe.steps && recipe.steps.length > 0 && (
            <div style={{ marginTop: 12 }}>
              <div style={{ fontSize: 10, color: muted, textTransform: "uppercase", marginBottom: 4 }}>Steps</div>
              <div style={{ fontSize: 12, color: muted }}>{recipe.steps.length} steps</div>
            </div>
          )}
        </>
      )}

      {style === "nutrition" && recipe.nutrition && (
        <div
          style={{
            marginTop: 12,
            paddingTop: 12,
            borderTop: `1px solid ${border}`,
            display: "flex",
            gap: 16,
            fontSize: 12,
            color: accent,
          }}
        >
          <span>{recipe.nutrition.calories} cal</span>
          <span>P: {recipe.nutrition.protein}</span>
          <span>C: {recipe.nutrition.carbs}</span>
          <span>F: {recipe.nutrition.fat}</span>
        </div>
      )}

      <div style={{ marginTop: 16, fontSize: 10, color: muted }}>TryRamadan.app</div>
    </div>
  );
}
