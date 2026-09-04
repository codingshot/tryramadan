import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowLeft, Utensils, ChevronRight } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { CulturalCarousel } from "@/components/CulturalCarousel";
import { PageSEO } from "@/components/PageSEO";
import { getAllCountries } from "@/lib/cultureRecipes";

const SITE_URL = "https://tryramadan.app";

const CULTURE_META_DESCRIPTION =
  "Ramadan around the world: explore iftar and suhoor traditions, foods, and customs by country. Cultural education for Ramadan fasting and interfaith understanding.";

const Culture = () => {
  const countries = getAllCountries();
  const collectionJsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "@id": `${SITE_URL}/culture#collection`,
    url: `${SITE_URL}/culture`,
    name: "Ramadan Around the World | Cultural Explorer",
    description: CULTURE_META_DESCRIPTION,
    isPartOf: { "@id": `${SITE_URL}#website` },
    mainEntity: {
      "@type": "ItemList",
      name: "Ramadan traditions by country",
      numberOfItems: countries.length,
      itemListElement: countries.slice(0, 50).map((c, i) => ({
        "@type": "ListItem",
        position: i + 1,
        item: {
          "@type": "Place",
          name: `Ramadan in ${c.name}`,
          url: `${SITE_URL}/culture/${c.id}`,
          description: `Ramadan traditions, iftar and suhoor foods, and customs in ${c.name}.`,
        },
      })),
    },
  };

  return (
    <div className="min-h-screen bg-background">
      <PageSEO
        title="Ramadan Around the World | Culture & Traditions | TryRamadan.app"
        description={CULTURE_META_DESCRIPTION}
        path="/culture"
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionJsonLd) }}
      />
      <Navbar />
      <main id="main-content" className="main-content" aria-label="Ramadan culture and traditions by country">
        <div className="container mx-auto px-4 sm:px-6 max-w-5xl min-w-0">
          <nav aria-label="Breadcrumb" className="mb-6">
            <Link
              to="/"
              className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground min-h-[44px] items-center"
            >
              <ArrowLeft className="w-4 h-4 flex-shrink-0" aria-hidden />
              <span>Back to Home</span>
            </Link>
          </nav>
          <motion.header
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 text-center sm:text-left"
          >
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-display font-bold">
              Ramadan Around the World
            </h1>
            <p className="text-muted-foreground mt-2 text-sm sm:text-base max-w-2xl">
              Explore iftar and suhoor traditions, foods, and customs from Muslim communities by country.
            </p>
            <Link
              to="/recipes"
              className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-secondary/10 text-secondary font-medium hover:bg-secondary/20 transition-colors text-sm"
            >
              <Utensils className="w-4 h-4" aria-hidden />
              Browse recipes by region
              <ChevronRight className="w-4 h-4" aria-hidden />
            </Link>
          </motion.header>
          <section aria-label="Countries and regions">
            <CulturalCarousel />
          </section>
          <p className="mt-8 text-center text-sm text-muted-foreground">
            <Link to="/recipes" className="text-secondary hover:underline">
              View all Ramadan recipes by culture and meal type →
            </Link>
          </p>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Culture;
