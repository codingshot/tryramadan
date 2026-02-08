/**
 * TryRamadan Brand Kit — colors, typography, tone, assets.
 * Not linked from nav/footer. SEO optimized. Easy download of logos and preview images.
 */
import { useState } from "react";
import { Download, Moon, Sun } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { PageSEO } from "@/components/PageSEO";
import { Button } from "@/components/ui/button";

const ASSETS = [
  { path: "/favicon.png", label: "Logo / Favicon (PNG, 512×512)", filename: "tryramadan-logo.png" },
  { path: "/favicon.ico", label: "Favicon (ICO)", filename: "tryramadan-favicon.ico" },
  { path: "/og-image.jpg", label: "Social preview (1200×630)", filename: "tryramadan-og-image.jpg" },
  { path: "/hero-bg.jpg", label: "Hero background", filename: "tryramadan-hero-bg.jpg" },
] as const;

const LIGHT_COLORS = [
  { name: "Primary (Emerald)", hsl: "158 45% 22%", hex: "#1a3d2e", usage: "Buttons, headings, links" },
  { name: "Secondary (Gold)", hsl: "42 85% 55%", hex: "#e5a839", usage: "Accents, highlights" },
  { name: "Background", hsl: "45 30% 97%", hex: "#f8f6f1", usage: "Page background" },
  { name: "Foreground", hsl: "160 30% 15%", hex: "#1e2d29", usage: "Body text" },
  { name: "Accent (Burgundy)", hsl: "10 55% 35%", hex: "#8b3a2e", usage: "Dates, special elements" },
];

const DARK_COLORS = [
  { name: "Primary (Emerald)", hsl: "158 45% 28%", hex: "#2d5a4a", usage: "Buttons, headings" },
  { name: "Secondary (Gold)", hsl: "42 80% 52%", hex: "#d99b2e", usage: "Accents" },
  { name: "Background", hsl: "158 40% 6%", hex: "#0d1915", usage: "Page background" },
  { name: "Foreground", hsl: "45 25% 92%", hex: "#e8e4dc", usage: "Body text" },
];

const TYPOGRAPHY = [
  { name: "Display (Headings)", font: "Playfair Display", usage: "Headings, hero text", class: "font-display" },
  { name: "Body", font: "Inter", usage: "Body text, UI", class: "font-sans" },
  { name: "Arabic", font: "Amiri", usage: "Arabic text, Quran", class: "font-arabic" },
];

const TONE = [
  { title: "Clear and helpful", body: "Explain features and benefits in plain language." },
  { title: "Respectful", body: "Of faith, culture, and individual choice." },
  { title: "Inclusive", body: "Use “everyone,” “you choose,” “your journey.”" },
  { title: "Warm but not casual", body: "Friendly, not slangy or irreverent about religion." },
];

export default function Brand() {
  const [theme, setTheme] = useState<"light" | "dark">("dark");

  const handleZip = () => {
    window.open(`${window.location.origin}/brand-assets.zip`, "_blank");
  };

  return (
    <div className={`min-h-screen ${theme === "dark" ? "dark" : ""}`}>
      <PageSEO
        title="Brand Kit | TryRamadan.app"
        description="TryRamadan brand kit: logo, colors, typography, tone, and design system. Download logos, meta preview images, and assets for Ramadan fasting app."
        path="/brand"
        image="/og-image.jpg"
        imageAlt="TryRamadan.app — Fast like a Muslim for the holy month of Ramadan"
      />
      <Navbar />

      <main id="main-content" className="main-content">
        <div className="container mx-auto px-4 max-w-4xl py-12">
          <header className="mb-12">
            <h1 className="text-3xl md:text-4xl font-display font-bold mb-2">
              TryRamadan Brand Kit
            </h1>
            <p className="text-muted-foreground text-lg">
              Logo, colors, typography, tone, and assets for TryRamadan. Use for press, partnerships, and marketing.
            </p>
          </header>

          {/* Theme toggle */}
          <div className="flex items-center gap-2 mb-10 p-3 rounded-xl bg-muted/50 border border-border">
            <span className="text-sm font-medium">Preview theme:</span>
            <Button
              variant={theme === "light" ? "secondary" : "outline"}
              size="sm"
              onClick={() => setTheme("light")}
            >
              <Sun className="w-4 h-4 mr-1" />
              Light
            </Button>
            <Button
              variant={theme === "dark" ? "secondary" : "outline"}
              size="sm"
              onClick={() => setTheme("dark")}
            >
              <Moon className="w-4 h-4 mr-1" />
              Dark
            </Button>
          </div>

          {/* Logos & meta images */}
          <section className="mb-14">
            <h2 className="text-xl font-display font-bold mb-4">Logos & meta preview images</h2>
            <p className="text-muted-foreground mb-6">
              Download individual assets or the full zip. Right-click and “Save as” for individual files.
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
              {ASSETS.map(({ path, label, filename }) => (
                <div
                  key={path}
                  className="rounded-xl border border-border bg-card p-4 flex flex-col items-center"
                >
                  <div className="w-full aspect-square max-w-[120px] rounded-lg overflow-hidden bg-muted mb-3">
                    <img
                      src={path}
                      alt={label}
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <p className="text-sm font-medium text-center mb-2">{label}</p>
                  <a
                    href={path}
                    download={filename}
                    className="inline-flex items-center gap-1 text-sm text-secondary hover:underline"
                  >
                    <Download className="w-3.5 h-3.5" />
                    Download
                  </a>
                </div>
              ))}
            </div>
            <Button onClick={handleZip} variant="outline" size="sm">
              <Download className="w-4 h-4 mr-2" />
              Download all as ZIP
            </Button>
            <p className="text-xs text-muted-foreground mt-2">
              Run <code className="px-1 py-0.5 rounded bg-muted">npm run brand:zip</code> to generate the zip, then deploy so <code className="px-1 py-0.5 rounded bg-muted">/brand-assets.zip</code> is served.
            </p>
          </section>

          {/* Colors */}
          <section className="mb-14">
            <h2 className="text-xl font-display font-bold mb-4">Colors</h2>
            <p className="text-muted-foreground mb-6">
              TryRamadan uses emerald green (Islamic heritage), warm gold (crescent, lanterns), and cream. Light and dark themes supported.
            </p>
            <h3 className="text-sm font-semibold mb-3">Light mode</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-8">
              {LIGHT_COLORS.map(({ name, hsl, hex, usage }) => (
                <div key={name} className="rounded-lg border border-border overflow-hidden">
                  <div
                    className="h-16"
                    style={{ backgroundColor: `hsl(${hsl.replace(/\s+/g, ", ")})` }}
                  />
                  <div className="p-3 text-sm">
                    <p className="font-medium">{name}</p>
                    <p className="text-muted-foreground text-xs">{hex} · {hsl}</p>
                    <p className="text-xs mt-1">{usage}</p>
                  </div>
                </div>
              ))}
            </div>
            <h3 className="text-sm font-semibold mb-3">Dark mode</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {DARK_COLORS.map(({ name, hsl, hex, usage }) => (
                <div key={name} className="rounded-lg border border-border overflow-hidden">
                  <div
                    className="h-16"
                    style={{ backgroundColor: `hsl(${hsl.replace(/\s+/g, ", ")})` }}
                  />
                  <div className="p-3 text-sm">
                    <p className="font-medium">{name}</p>
                    <p className="text-muted-foreground text-xs">{hex} · {hsl}</p>
                    <p className="text-xs mt-1">{usage}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Typography */}
          <section className="mb-14">
            <h2 className="text-xl font-display font-bold mb-4">Typography</h2>
            <p className="text-muted-foreground mb-6">
              Playfair Display for headings, Inter for body, Amiri for Arabic. Load from Google Fonts.
            </p>
            <ul className="space-y-6">
              {TYPOGRAPHY.map(({ name, font, usage, class: cls }) => (
                <li key={font} className="rounded-xl border border-border p-4 bg-card">
                  <p className={`text-2xl ${cls} mb-1`}>TryRamadan — {font}</p>
                  <p className="text-sm text-muted-foreground">{name} · {usage}</p>
                </li>
              ))}
            </ul>
          </section>

          {/* Tone & voice */}
          <section className="mb-14">
            <h2 className="text-xl font-display font-bold mb-4">Tone & voice</h2>
            <p className="text-muted-foreground mb-6">
              Clear, helpful, respectful, inclusive. Warm but not casual.
            </p>
            <ul className="space-y-4">
              {TONE.map(({ title, body }) => (
                <li key={title} className="flex gap-4">
                  <span className="font-medium shrink-0">{title}:</span>
                  <span className="text-muted-foreground">{body}</span>
                </li>
              ))}
            </ul>
            <p className="text-sm text-muted-foreground mt-4">
              Avoid: promises we can’t keep, speaking for all Muslims, altering religious text, weight-loss or medical claims.
            </p>
          </section>

          {/* Taglines */}
          <section className="mb-14">
            <h2 className="text-xl font-display font-bold mb-4">Taglines</h2>
            <ul className="space-y-2 text-muted-foreground">
              <li>• <strong className="text-foreground">Fast like a Muslim for the holy month</strong> — positioning</li>
              <li>• One month, one app</li>
              <li>• For everyone</li>
              <li>• Your Ramadan in one app</li>
              <li>• Prayer times, countdown, meals</li>
            </ul>
          </section>

          {/* Meta preview */}
          <section>
            <h2 className="text-xl font-display font-bold mb-4">Meta preview (og:image)</h2>
            <p className="text-muted-foreground mb-4">
              1200×630 recommended for social sharing. Use for og:image, twitter:image.
            </p>
            <div className="rounded-xl border border-border overflow-hidden max-w-md">
              <img
                src="/og-image.jpg"
                alt="TryRamadan social preview"
                className="w-full"
              />
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              URL: {window.location.origin}/og-image.jpg
            </p>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}
