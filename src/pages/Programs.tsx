import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowLeft, ChevronRight } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { FastingPrograms } from "@/components/FastingPrograms";
import { ArabicHover } from "@/components/ArabicHover";
import { PageSEO } from "@/components/PageSEO";

const Programs = () => {
  return (
    <div className="min-h-screen bg-background">
      <PageSEO
        title="Fasting Programs | TryRamadan.app"
        description="Ramadan fasting: full dawn-to-sunset experience and Sunnah voluntary fasting. TryRamadan.app"
        path="/programs"
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
            className="mb-8"
          >
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-display font-bold">
              <ArabicHover arabic="البرامج">Fasting Programs</ArabicHover>
            </h1>
            <p className="text-muted-foreground mt-2 text-sm sm:text-base">
              Full Ramadan fast (dawn to sunset) and voluntary Sunnah fasting. The authentic Ramadan experience.
            </p>
          </motion.div>
          <FastingPrograms />
          {/* CTA to set program in Settings */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mt-10 p-6 rounded-2xl bg-muted/50 border border-border text-center"
          >
            <p className="font-medium text-foreground mb-4">Ready to commit? Set your program in Settings.</p>
            <Link
              to="/settings#settings-fasting-path"
              className="inline-flex items-center gap-2 min-h-[48px] px-6 py-3 rounded-2xl bg-secondary text-secondary-foreground font-semibold hover:bg-secondary/90 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-secondary focus-visible:ring-offset-2"
            >
              Set fasting path in Settings
              <ChevronRight className="w-5 h-5 shrink-0" />
            </Link>
          </motion.div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Programs;
