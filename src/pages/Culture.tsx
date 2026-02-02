import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { CulturalCarousel } from "@/components/CulturalCarousel";
import { PageSEO } from "@/components/PageSEO";

const Culture = () => {
  return (
    <div className="min-h-screen bg-background">
      <PageSEO
        title="Ramadan Around the World | TryRamadan.app"
        description="Explore Ramadan traditions, foods, and customs from Muslim communities across the globe. Cultural education for interfaith understanding."
        path="/culture"
      />
      <Navbar />
      <main className="main-content">
        <div className="container mx-auto px-4 sm:px-6 max-w-5xl min-w-0">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 min-h-[44px] items-center"
          >
            <ArrowLeft className="w-4 h-4 flex-shrink-0" />
            <span>Back to Home</span>
          </Link>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 text-center sm:text-left"
          >
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-display font-bold">
              Ramadan Around the World
            </h1>
            <p className="text-muted-foreground mt-2 text-sm sm:text-base max-w-2xl">
              Explore traditions, foods, and customs from Muslim communities across the globe.
            </p>
          </motion.div>
          <CulturalCarousel />
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Culture;
