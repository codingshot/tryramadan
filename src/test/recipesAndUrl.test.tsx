/**
 * Recipes page and URL search params: filters from URL, clear filters.
 */
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import { TooltipProvider } from "@/components/ui/tooltip";
import Recipes from "@/pages/Recipes";

function renderRecipes(initialEntries = ["/recipes"]) {
  return render(
    <TooltipProvider>
      <MemoryRouter initialEntries={initialEntries}>
        <Routes>
          <Route path="/recipes" element={<Recipes />} />
        </Routes>
      </MemoryRouter>
    </TooltipProvider>
  );
}

describe("Recipes and URL params", () => {
  it("renders Recipes page with heading", () => {
    renderRecipes();
    expect(screen.getByRole("heading", { name: /ramadan recipes/i })).toBeInTheDocument();
  });

  it("applies region from URL and shows Clear filters", () => {
    renderRecipes(["/recipes?region=West%20Africa"]);
    expect(screen.getByRole("heading", { name: /ramadan recipes/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /clear filters/i })).toBeInTheDocument();
  });

  it("applies meal from URL and shows Clear filters", () => {
    renderRecipes(["/recipes?meal=suhoor"]);
    expect(screen.getByRole("button", { name: /clear filters/i })).toBeInTheDocument();
  });
});
