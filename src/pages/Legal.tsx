import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { PageSEO } from "@/components/PageSEO";

const LEGAL_TITLE = "Legal Notice & Disclaimers | TryRamadan.app";
const LEGAL_DESCRIPTION =
  "Legal notice and disclaimers for TryRamadan.app — health, religious, and general liability disclaimers for the Ramadan fasting app.";

export default function Legal() {
  return (
    <div className="min-h-screen bg-background">
      <PageSEO title={LEGAL_TITLE} description={LEGAL_DESCRIPTION} path="/legal" />
      <Navbar />
      <main className="pt-20 pb-16">
        <div className="container mx-auto px-4 max-w-3xl">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-8"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to home
          </Link>
          <motion.article
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="prose prose-neutral dark:prose-invert max-w-none"
          >
            <h1 className="text-3xl md:text-4xl font-display font-bold mb-2">
              Legal Notice & Disclaimers
            </h1>
            <p className="text-muted-foreground text-sm mb-8">
              Last updated: February 2025
            </p>

            <section>
              <h2 className="text-xl font-display font-bold mt-8 mb-4">General</h2>
              <p>
                TryRamadan.app (“we”, “the App”) is a free web and progressive web application
                intended for educational and wellness purposes. This Legal page sets out important
                disclaimers that apply to your use of the App.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-display font-bold mt-8 mb-4">Health Disclaimer</h2>
              <p>
                <strong>The App is not medical advice.</strong> Fasting can pose risks for people
                with certain conditions (e.g. diabetes, eating disorders, pregnancy, cardiovascular
                disease). Prayer times and fasting windows are for informational use only. Always
                consult a qualified healthcare provider before starting or changing any diet or
                fasting practice. If you feel unwell while fasting, stop and seek medical attention
                as needed.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-display font-bold mt-8 mb-4">Religious Disclaimer</h2>
              <p>
                Content about Islam, Ramadan, hadith, and prayer is provided for cultural and
                educational understanding. We do not claim religious authority. For matters of
                Islamic jurisprudence (fiqh), users should rely on qualified scholars and
                authoritative sources. Prayer time calculations follow common methods but may differ
                from local mosques or authorities.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-display font-bold mt-8 mb-4">No Professional Advice</h2>
              <p>
                Nothing in the App constitutes legal, tax, medical, or religious advice. You are
                responsible for your own decisions and for verifying any information that affects
                your health or religious practice.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-display font-bold mt-8 mb-4">Third-Party Services</h2>
              <p>
                The App may use third-party services (e.g. location, prayer-time APIs). We are not
                responsible for their availability, accuracy, or terms. Your use of such services
                may be subject to their respective policies.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-display font-bold mt-8 mb-4">Accuracy of Content</h2>
              <p>
                We strive to provide accurate, up-to-date information but do not warrant that
                content is complete or error-free. Recipes, cultural information, and other
                materials are for general use; we are not liable for any reliance you place on them.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-display font-bold mt-8 mb-4">Liability</h2>
              <p>
                To the maximum extent permitted by law, TryRamadan.app and its operators shall not
                be liable for any loss, damage, or injury arising from your use of the App. Your
                use of the App is at your sole risk.
              </p>
            </section>

            <p className="mt-10 text-sm text-muted-foreground">
              For full terms, see our{" "}
              <Link to="/terms" className="text-primary hover:underline">Terms of Use</Link>. For
              how we handle data, see our{" "}
              <Link to="/privacy" className="text-primary hover:underline">Privacy Policy</Link>.
            </p>
          </motion.article>
        </div>
      </main>
      <Footer />
    </div>
  );
}
