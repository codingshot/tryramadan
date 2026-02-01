import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { FastingPrograms } from "@/components/FastingPrograms";
import { ArabicHover } from "@/components/ArabicHover";

const Programs = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-20 pb-16">
        <div className="container mx-auto px-4 sm:px-6 max-w-5xl">
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
            className="mb-8"
          >
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-display font-bold">
              <ArabicHover arabic="البرامج">Fasting Programs</ArabicHover>
            </h1>
            <p className="text-muted-foreground mt-2 text-sm sm:text-base">
              Choose a path that fits your experience level. Start gently or embrace the full Ramadan experience.
            </p>
          </motion.div>
          <FastingPrograms />
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Programs;
