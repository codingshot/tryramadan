import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ArabicHover } from "@/components/ArabicHover";
import { ArabicTerm } from "@/components/ArabicTerm";

describe("Arabic translations and tooltips", () => {
  it("ArabicHover has focusable trigger for touch and keyboard", () => {
    render(
      <TooltipProvider>
        <ArabicHover arabic="رمضان">Ramadan</ArabicHover>
      </TooltipProvider>
    );
    const trigger = screen.getByRole("button", { name: /ramadan/i });
    expect(trigger).toBeInTheDocument();
    expect(trigger).toHaveAttribute("tabIndex", "0");
    expect(trigger).toHaveAttribute("title", "رمضان");
  });

  it("ArabicTerm has focusable trigger for touch and keyboard", () => {
    render(
      <TooltipProvider>
        <ArabicTerm term="Sawm" arabic="صوم" definition="Fasting">
          Fasting
        </ArabicTerm>
      </TooltipProvider>
    );
    const trigger = screen.getByRole("button", { name: /fasting/i });
    expect(trigger).toBeInTheDocument();
    expect(trigger).toHaveAttribute("tabIndex", "0");
  });
});
