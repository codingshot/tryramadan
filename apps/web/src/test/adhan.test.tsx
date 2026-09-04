import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import { TooltipProvider } from "@/components/ui/tooltip";
import DashboardPrayers from "@/pages/DashboardPrayers";

vi.mock("@/lib/adhanAudio", () => ({ playAdhan: vi.fn() }));

const mockNotification = vi.fn();
const mockRequestPermission = vi.fn();

beforeEach(() => {
  vi.clearAllMocks();
  localStorage.setItem(
    "tryramadan-preferences",
    JSON.stringify({ userType: "muslim", locationCoords: { lat: 51.5, lng: -0.1 } })
  );
  Object.defineProperty(window, "Notification", {
    writable: true,
    value: Object.assign(mockNotification, {
      permission: "granted",
      requestPermission: mockRequestPermission,
    }),
  });
});

function renderPrayers() {
  return render(
    <TooltipProvider>
      <MemoryRouter initialEntries={["/dashboard/prayers"]}>
        <Routes>
          <Route path="/dashboard/prayers" element={<DashboardPrayers />} />
        </Routes>
      </MemoryRouter>
    </TooltipProvider>
  );
}

describe("Adhan at prayer times", () => {
  it("shows Adhan section with Play adhan sound switch and Test adhan button", async () => {
    renderPrayers();
    expect(screen.getByRole("heading", { name: /adhan at prayer times/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/play adhan sound when notifying/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /test adhan/i })).toBeInTheDocument();
  });

  it("Test adhan button shows notification when permission is granted", async () => {
    renderPrayers();
    const testBtn = screen.getByRole("button", { name: /test adhan/i });
    fireEvent.click(testBtn);
    expect(mockNotification).toHaveBeenCalledWith(
      "Adhan • Test • أذان",
      expect.objectContaining({
        body: expect.stringContaining("test"),
        icon: "/favicon.png",
        tag: "adhan-test",
      })
    );
  });
});
