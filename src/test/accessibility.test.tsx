import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { axe } from "vitest-axe";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ArabicHover } from "@/components/ArabicHover";
import { ArabicTerm } from "@/components/ArabicTerm";
import { HeroSection } from "@/components/HeroSection";
import OnboardingWelcome from "@/pages/onboarding/OnboardingWelcome";

describe("Accessibility (axe-core)", () => {
  it("HeroSection has no axe violations", async () => {
    const { container } = render(
      <TooltipProvider>
        <MemoryRouter>
          <HeroSection />
        </MemoryRouter>
      </TooltipProvider>
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it("OnboardingWelcome has no axe violations", async () => {
    const { container } = render(
      <TooltipProvider>
        <MemoryRouter>
          <OnboardingWelcome />
        </MemoryRouter>
      </TooltipProvider>
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it("ArabicHover and ArabicTerm have no axe violations", async () => {
    const { container } = render(
      <TooltipProvider>
        <div>
          <ArabicHover arabic="رمضان" explanation="The ninth month of the Islamic calendar.">Ramadan</ArabicHover>
          <ArabicTerm term="Sawm" arabic="صوم" definition="Fasting">Fasting</ArabicTerm>
        </div>
      </TooltipProvider>
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});

describe("Arabic translations and tooltips", () => {
  it("ArabicHover has focusable trigger for touch and keyboard", () => {
    render(
      <TooltipProvider>
        <ArabicHover arabic="رمضان" explanation="The ninth month of the Islamic calendar; Muslims fast from dawn to sunset.">Ramadan</ArabicHover>
      </TooltipProvider>
    );
    const trigger = screen.getByRole("button", { name: /ramadan/i });
    expect(trigger).toBeInTheDocument();
    expect(trigger).toHaveAttribute("tabIndex", "0");
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
