import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowRight, BookOpen, ChevronRight } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { PageSEO } from "@/components/PageSEO";
import { guides, getGuidesByCategory, type Guide } from "@/data/guides";

const CATEGORY_LABELS: Record<Guide["category"], string> = {
  onboarding: "Onboarding",
  dashboard: "Dashboard",
  learn: "Learn",
  health: "Health & Safety",
  settings: "Settings",
  general: "General",
};

const Guides = () => {
  const categories: Guide["category"][] = [
    "onboarding",
    "dashboard",
    "learn",
    "health",
    "settings",
    "general",
  ];

  return (
    <div className="min-h-screen bg-background">
      <PageSEO
        title="User Guides | TryRamadan.app"
        description="Step-by-step user guides for TryRamadan: onboarding, dashboard, today's fast, schedule, prayers, meals, macro tracker, Quran, culture, personas and journeys, achievements, FAQ, health, settings, and more. Mobile and desktop."
        path="/guides"
      />
      <Navbar />

      <main className="main-content">
        <div className="container mx-auto px-4 max-w-4xl min-w-0">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6"
          >
            <ChevronRight className="w-4 h-4 rotate-180" />
            Back to Home
          </Link>

          <motion.header
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-12"
          >
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-display font-bold mb-4">
              User Guides
            </h1>
            <p className="text-muted-foreground text-lg max-w-2xl">
              Step-by-step guides with screenshots for every flow. Use quick links
              to jump to the right screen. Use arrow keys to move between steps.
            </p>
          </motion.header>

          <nav
            className="mb-12"
            aria-label="Guide categories"
          >
            <h2 className="sr-only">Guide categories</h2>
            <ul className="flex flex-wrap gap-2">
              {categories.map((cat) => (
                <li key={cat}>
                  <a
                    href={`#category-${cat}`}
                    className="px-3 py-1.5 rounded-full bg-muted text-muted-foreground hover:text-foreground text-sm font-medium transition-colors"
                  >
                    {CATEGORY_LABELS[cat]}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          {categories.map((category) => {
            const list = getGuidesByCategory(category);
            if (list.length === 0) return null;
            return (
              <motion.section
                key={category}
                id={`category-${category}`}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 }}
                className="mb-14"
              >
                <h2 className="text-xl font-display font-bold mb-6 flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-secondary" />
                  {CATEGORY_LABELS[category]}
                </h2>
                <ul className="space-y-4">
                  {list.map((guide) => {
                    const thumb = guide.steps[0]?.image ?? guide.steps[0]?.gif;
                    return (
                      <li key={guide.slug}>
                        <Link
                          to={`/guides/${guide.slug}`}
                          className="block p-4 rounded-2xl border border-border bg-card hover:bg-muted/30 hover:border-primary/30 transition-colors group"
                        >
                          <div className="flex items-start justify-between gap-4">
                            {thumb && (
                              <div className="w-16 h-24 shrink-0 hidden sm:block">
                                <img
                                  src={thumb}
                                  alt=""
                                  className="w-full h-full object-cover rounded-lg"
                                  loading="lazy"
                                  onError={(e) => { e.currentTarget.parentElement!.style.display = "none"; }}
                                />
                              </div>
                            )}
                            <div className="min-w-0 flex-1">
                              <h3 className="font-semibold text-foreground group-hover:text-secondary transition-colors">
                                {guide.title}
                              </h3>
                              <p className="text-sm text-muted-foreground mt-1">
                                {guide.shortDescription}
                              </p>
                            </div>
                            <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-secondary shrink-0 mt-0.5" />
                          </div>
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </motion.section>
            );
          })}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Guides;
