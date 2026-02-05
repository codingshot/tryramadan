/**
 * Food image helper: non-image file rejection, API shape.
 */
import { describe, it, expect } from "vitest";
import { resizeImageToDataUrl } from "@/lib/foodImage";

describe("resizeImageToDataUrl", () => {
  it("returns null for non-image file", async () => {
    const file = new File(["not an image"], "file.txt", { type: "text/plain" });
    const result = await resizeImageToDataUrl(file);
    expect(result).toBe(null);
  });

  it("returns null for file with empty image type", async () => {
    const file = new File(["x"], "x", { type: "application/octet-stream" });
    const result = await resizeImageToDataUrl(file);
    expect(result).toBe(null);
  });

  it("returns a Promise", () => {
    const file = new File([], "x", { type: "image/jpeg" });
    const result = resizeImageToDataUrl(file);
    expect(result).toBeInstanceOf(Promise);
  });
});
