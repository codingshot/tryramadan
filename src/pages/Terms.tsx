import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { PageSEO } from "@/components/PageSEO";

const TERMS_TITLE = "Terms of Use | TryRamadan.app";
const TERMS_DESCRIPTION =
  "Terms of Use for TryRamadan.app — free Ramadan fasting experience app. Acceptable use, disclaimers, and user agreement.";

export default function Terms() {
  return (
    <div className="min-h-screen bg-background">
      <PageSEO title={TERMS_TITLE} description={TERMS_DESCRIPTION} path="/terms" />
      <Navbar />
      <main className="main-content">
        <div className="container mx-auto px-4 max-w-3xl min-w-0">
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
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-display font-bold mb-2">
              Terms of Use
            </h1>
            <p className="text-muted-foreground text-sm mb-8">
              Last updated: February 2025
            </p>

            <section>
              <h2 className="text-xl font-display font-bold mt-8 mb-4">1. Acceptance of Terms</h2>
              <p>
                By accessing or using TryRamadan.app (“the App”), you agree to be bound by these
                Terms of Use. If you do not agree, do not use the App. We may update these terms from
                time to time; continued use after changes constitutes acceptance.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-display font-bold mt-8 mb-4">2. Description of Service</h2>
              <p>
                TryRamadan.app is a free wellness and educational app that helps users experience
                Ramadan fasting through progressive programs, cultural education, prayer times, and
                related features. The App is provided “as is” for informational and experiential
                purposes only.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-display font-bold mt-8 mb-4">3. Acceptable Use</h2>
              <p>You agree to use the App only for lawful purposes. You must not:</p>
              <ul className="list-disc pl-6 my-4 space-y-1">
                <li>Use the App in any way that violates applicable laws or regulations</li>
                <li>Attempt to gain unauthorized access to our systems or other users’ data</li>
                <li>Use the App to harass, abuse, or harm others</li>
                <li>Scrape, copy, or redistribute content in bulk without permission</li>
                <li>Use the App for any commercial purpose without our consent</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-display font-bold mt-8 mb-4">4. Health & Religious Disclaimer</h2>
              <p>
                The App is not a substitute for medical or religious advice. Fasting may not be
                suitable for everyone. You should consult a healthcare provider before starting any
                fasting program. Religious content is offered for educational and cultural
                understanding only; for religious rulings, please consult qualified scholars.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-display font-bold mt-8 mb-4">5. Intellectual Property</h2>
              <p>
                Content, design, and branding of TryRamadan.app are owned by us or our licensors.
                You may not copy, modify, or distribute our content without permission. Third-party
                content (e.g. hadith, recipes) may be subject to their own licenses.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-display font-bold mt-8 mb-4">6. Limitation of Liability</h2>
              <p>
                To the fullest extent permitted by law, TryRamadan.app and its operators shall not
                be liable for any indirect, incidental, special, or consequential damages arising
                from your use of the App. Our total liability shall not exceed the amount you paid
                to use the App (which is zero for the free service).
              </p>
            </section>

            <section>
              <h2 className="text-xl font-display font-bold mt-8 mb-4">7. Termination</h2>
              <p>
                We may suspend or terminate your access to the App at any time, with or without
                cause. You may stop using the App at any time. Provisions that by their nature
                should survive (e.g. disclaimers, limitation of liability) will survive termination.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-display font-bold mt-8 mb-4">8. Governing Law</h2>
              <p>
                These Terms are governed by the laws of the jurisdiction in which the operator
                resides, without regard to conflict of law principles. Any disputes shall be
                resolved in the courts of that jurisdiction.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-display font-bold mt-8 mb-4">9. Contact</h2>
              <p>
                For questions about these Terms, please contact us via{" "}
                <a href="https://ummah.build" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                  ummah.build
                </a>{" "}
                or the contact information provided on the App.
              </p>
            </section>

            <p className="mt-10 text-sm text-muted-foreground">
              By using TryRamadan.app, you acknowledge that you have read, understood, and agree
              to these Terms of Use. See also our{" "}
              <Link to="/privacy" className="text-primary hover:underline">Privacy Policy</Link> and{" "}
              <Link to="/legal" className="text-primary hover:underline">Legal</Link> page.
            </p>
          </motion.article>
        </div>
      </main>
      <Footer />
    </div>
  );
}
