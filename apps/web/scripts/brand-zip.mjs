#!/usr/bin/env node
/**
 * Create brand-assets.zip from public assets and logo.
 * Run: npm run brand:zip
 * Output: public/brand-assets.zip
 */
import { existsSync, copyFileSync } from "fs";
import { execSync } from "child_process";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const publicDir = join(root, "public");
const zipPath = join(publicDir, "brand-assets.zip");

const ASSETS = [
  "favicon.png",
  "favicon.ico",
  "og-image.jpg",
  "hero-bg.jpg",
];

// Copy logo from src/assets to public for inclusion (temporary for zip)
const logoSrc = join(root, "src", "assets", "logo.png");
const logoDest = join(publicDir, "logo.png");

if (existsSync(logoSrc)) {
  copyFileSync(logoSrc, logoDest);
  ASSETS.push("logo.png");
}

try {
  const cwd = publicDir;
  const files = ASSETS.filter((f) => existsSync(join(publicDir, f)));
  if (files.length === 0) {
    console.warn("No brand assets found in public/");
    process.exit(1);
  }
  // Remove existing zip
  if (existsSync(zipPath)) {
    const { unlinkSync } = await import("fs");
    unlinkSync(zipPath);
  }
  // Create zip (macOS/Linux: zip; Windows: use archiver if needed)
  execSync(`zip -r brand-assets.zip ${files.join(" ")}`, { cwd });
  console.log("Created public/brand-assets.zip");
  // Remove temp logo copy if we added it
  if (ASSETS.includes("logo.png") && logoSrc !== logoDest) {
    const { unlinkSync } = await import("fs");
    try {
      unlinkSync(logoDest);
    } catch {
      /* ignore */
    }
  }
} catch (err) {
  if (err.message?.includes("zip")) {
    console.warn("zip command not found. On macOS/Linux install via: brew install zip (or use system zip)");
  }
  process.exit(1);
}
