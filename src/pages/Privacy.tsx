import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { PageSEO } from "@/components/PageSEO";

const PRIVACY_TITLE = "Privacy Policy | TryRamadan.app";
const PRIVACY_DESCRIPTION =
  "Privacy Policy for TryRamadan.app — how we collect, use, and protect your data. Local storage, location, and no account required.";

export default function Privacy() {
  return (
    <div className="min-h-screen bg-background">
      <PageSEO title={PRIVACY_TITLE} description={PRIVACY_DESCRIPTION} path="/privacy" />
      <Navbar />
      <main id="main-content" className="main-content">
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
              Privacy Policy
            </h1>
            <p className="text-muted-foreground text-sm mb-8">
              Last updated: February 2025
            </p>

            <section>
              <h2 className="text-xl font-display font-bold mt-8 mb-4">1. Introduction</h2>
              <p>
                TryRamadan.app (“we”, “the App”) respects your privacy. This Privacy Policy
                explains what data we collect, how we use it, and how we protect it. The App is
                designed to work without requiring an account; most data stays on your device.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-display font-bold mt-8 mb-4">2. Data We Collect</h2>
              <h3 className="text-lg font-semibold mt-4 mb-2">Data stored on your device (local storage)</h3>
              <p>
                When you use the App, we store the following on your device only (e.g. in your
                browser’s local storage). This data is not sent to our servers:
              </p>
              <ul className="list-disc pl-6 my-4 space-y-1">
                <li>Preferences (theme, location name and coordinates, fasting goal, onboarding state)</li>
                <li>Fasting progress (completed days, streaks, fasting log)</li>
                <li>Notification settings and prayer notification toggles</li>
                <li>Today’s intention, hydration, and energy check-ins</li>
                <li>Recipe favorites, wellness log, and similar in-app choices</li>
              </ul>
              <h3 className="text-lg font-semibold mt-4 mb-2">Location</h3>
              <p>
                To show prayer and fasting times, the App may use your location via browser
                geolocation or IP-based detection. Location can be set by you (e.g. city search) or
                auto-detected. Coordinates are stored locally and may be sent to third-party
                prayer-time APIs (e.g. Aladhan) only to fetch times for your area. We do not store
                your location on our servers.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-display font-bold mt-8 mb-4">3. How We Use Data</h2>
              <p>
                Data stored on your device is used solely to provide and personalize the App
                (e.g. prayer times for your location, fasting tracker, reminders). We do not sell
                your data. If we use analytics (e.g. anonymized usage metrics), we will describe that
                in an updated policy.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-display font-bold mt-8 mb-4">4. Third-Party Services</h2>
              <p>
                The App may call third-party APIs for prayer times (e.g. Aladhan), location search
                (e.g. Nominatim), or IP-based location. Those services have their own privacy
                practices. We recommend reviewing their policies. We do not control data collected
                by your browser or device (e.g. PWA install prompts, notifications).
              </p>
            </section>

            <section>
              <h2 className="text-xl font-display font-bold mt-8 mb-4">5. Cookies & Storage</h2>
              <p>
                We use local storage (and similar browser storage) to keep your preferences and
                progress. We do not use tracking cookies for advertising. Session or essential
                cookies, if any, would be used only to operate the App.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-display font-bold mt-8 mb-4">6. Data Retention</h2>
              <p>
                Data on your device remains until you clear it (e.g. clear site data in browser
                settings) or uninstall the app. We do not retain copies of your local data on our
                servers.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-display font-bold mt-8 mb-4">7. Your Rights</h2>
              <p>
                Depending on your jurisdiction, you may have rights to access, correct, or delete
                your data. Because most data is stored only on your device, you can clear it via
                your browser or device settings. For any requests relating to data we might hold,
                contact us via the details below.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-display font-bold mt-8 mb-4">8. Children</h2>
              <p>
                The App is not directed at children under 13. We do not knowingly collect
                personal data from children. If you believe a child has provided us data, please
                contact us so we can address it.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-display font-bold mt-8 mb-4">9. Changes</h2>
              <p>
                We may update this Privacy Policy from time to time. The “Last updated” date at the
                top will change when we do. Continued use of the App after changes constitutes
                acceptance of the updated policy.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-display font-bold mt-8 mb-4">10. Contact</h2>
              <p>
                For privacy-related questions or requests, contact us via{" "}
                <a href="https://ummah.build" target="_blank" rel="noopener noreferrer" className="text-primary-contrast hover:underline">
                  ummah.build
                </a>{" "}
                or the contact information provided on the App.
              </p>
            </section>

            <p className="mt-10 text-sm text-muted-foreground">
              See also our{" "}
              <Link to="/terms" className="text-primary-contrast hover:underline">Terms of Use</Link> and{" "}
              <Link to="/legal" className="text-primary-contrast hover:underline">Legal</Link> page.
            </p>
          </motion.article>
        </div>
      </main>
      <Footer />
    </div>
  );
}
