import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  Heart,
  Shield,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Baby,
  Pill,
  Stethoscope,
  Droplets,
  TrendingUp,
  Brain,
  Zap,
  AlertCircle,
} from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { PageSEO } from "@/components/PageSEO";
import { useUserPreferences } from "@/hooks/useLocalStorage";
import ramadanInfo from "@/data/ramadan-info.json";

const iconMap: Record<string, React.ReactNode> = {
  "Metabolic Health": <TrendingUp className="w-6 h-6" />,
  "Weight Management": <Zap className="w-6 h-6" />,
  "Cardiovascular Benefits": <Heart className="w-6 h-6" />,
  "Cellular Health": <Shield className="w-6 h-6" />,
  "Brain Health": <Brain className="w-6 h-6" />,
};

const contraindications = [
  { icon: Baby, title: "Pregnancy & Breastfeeding", desc: "Fasting may affect nutrition for baby. Islamic tradition exempts pregnant and breastfeeding women." },
  { icon: Pill, title: "Diabetes", desc: "Risk of hypoglycemia without food. Consult your doctor; many Muslims with diabetes use modified fasting or medical exemption." },
  { icon: Heart, title: "Heart Conditions", desc: "May affect medication schedules and fluid balance. Always consult a cardiologist before fasting." },
  { icon: Stethoscope, title: "Chronic Illness", desc: "Kidney disease, eating disorders, or other chronic conditions require professional guidance before fasting." },
];

const safetyTips = [
  { do: true, text: "Stay hydrated between Iftar and Suhoor" },
  { do: true, text: "Eat balanced, nutritious meals at Suhoor and Iftar" },
  { do: true, text: "Get adequate sleep and rest" },
  { do: true, text: "Break fast immediately if feeling unwell" },
  { do: false, text: "Don't overeat at Iftar" },
  { do: false, text: "Don't skip Suhoor meal" },
  { do: false, text: "Don't engage in extreme physical activity while fasting" },
  { do: false, text: "Don't ignore warning signs from your body" },
];

const breakFastReasons = [
  "Severe dizziness or fainting",
  "Chest pain or difficulty breathing",
  "Extreme weakness or confusion",
  "Signs of dehydration (dark urine, extreme thirst)",
  "Need to take essential medication",
];

const HEALTH_TITLE = "Ramadan Fasting Health Guide | Benefits, Safety & When to Break Fast | TryRamadan.app";
const HEALTH_DESCRIPTION = "Ramadan fasting health guide: evidence-based benefits (metabolic, cardiovascular, brain), who should not fast, hydration and nutrition tips, when to break a fast, and safe fasting guidelines. Educational resource for Muslims and non-Muslims.";

export default function Health() {
  const [preferences] = useUserPreferences();
  return (
    <div className="min-h-screen bg-background">
      <PageSEO
        title={HEALTH_TITLE}
        description={HEALTH_DESCRIPTION}
        path="/health"
        type="article"
        imageAlt="Ramadan fasting health guide: benefits, safety, and when to break fast."
      />
      {/* JSON-LD for SEO and AI engines */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Article",
            headline: "Ramadan Fasting Health Guide: Benefits, Safety & When to Break Fast",
            description: HEALTH_DESCRIPTION,
            url: "https://tryramadan.app/health",
            publisher: { "@type": "Organization", name: "TryRamadan.app" },
            mainEntityOfPage: { "@type": "WebPage", "@id": "https://tryramadan.app/health" },
          }),
        }}
      />
      <Navbar />

      <main id="main-content" className="main-content">
        <div className="container mx-auto px-4 max-w-4xl min-w-0">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>

          <article>
            <header className="mb-8">
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-2xl md:text-4xl font-display font-bold"
              >
                Ramadan Fasting Health Guide
              </motion.h1>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 }}
                className="text-muted-foreground mt-2 text-lg"
              >
                Evidence-based benefits, who should not fast, hydration and nutrition, and when to break your fast. This guide is for educational purposes and supports safe fasting during Ramadan.
              </motion.p>
            </header>

            {/* Medical disclaimer */}
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="p-6 rounded-2xl bg-destructive/10 border border-destructive/30 mb-8"
              aria-labelledby="disclaimer-heading"
            >
              <h2 id="disclaimer-heading" className="font-bold text-lg mb-2 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-destructive flex-shrink-0" />
                Medical Disclaimer
              </h2>
              <p className="text-muted-foreground">
                This app is for informational purposes only and does not constitute medical advice. Always consult a healthcare professional before starting any fasting regimen, especially if you have pre-existing health conditions or take medications.
              </p>
            </motion.section>

            {/* Health benefits */}
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="mb-10"
              aria-labelledby="benefits-heading"
            >
              <h2 id="benefits-heading" className="font-display font-bold text-xl mb-4 flex items-center gap-2">
                <Heart className="w-5 h-5 text-secondary flex-shrink-0" />
                Health Benefits of Ramadan Fasting
              </h2>
              <p className="text-muted-foreground mb-6">
                Research on intermittent fasting aligns with the Ramadan pattern (fasting from dawn to sunset). Below are evidence-based benefits often cited in studies. Individual results vary.
              </p>
              <div className="grid md:grid-cols-2 gap-4">
                {(ramadanInfo.healthBenefits as { title: string; description: string; source: string }[]).map((benefit, index) => (
                  <div
                    key={benefit.title}
                    className="p-4 rounded-2xl bg-card border border-border"
                  >
                    <div className="flex items-start gap-3">
                      <div className="p-2 rounded-xl bg-secondary/20 text-secondary flex-shrink-0">
                        {iconMap[benefit.title] ?? <Heart className="w-5 h-5" />}
                      </div>
                      <div>
                        <h3 className="font-semibold">{benefit.title}</h3>
                        <p className="text-sm text-muted-foreground mt-1">{benefit.description}</p>
                        <p className="text-xs text-secondary italic mt-2">Source: {benefit.source}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.section>

            {/* Who should not fast */}
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="mb-10"
              aria-labelledby="who-not-heading"
            >
              <h2 id="who-not-heading" className="font-display font-bold text-xl mb-4 flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-amber-500 flex-shrink-0" />
                Who Should Not Fast (or Consult a Doctor First)
              </h2>
              <p className="text-muted-foreground mb-4">
                Islamic tradition exempts those for whom fasting would cause harm. If any of the following apply, speak with your doctor before fasting.
              </p>
              <div className="grid md:grid-cols-2 gap-4">
                {contraindications.map((item, index) => {
                  const Icon = item.icon;
                  return (
                    <div key={index} className="p-4 rounded-2xl bg-card border border-border">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center flex-shrink-0">
                          <Icon className="w-5 h-5 text-amber-600" />
                        </div>
                        <div>
                          <h3 className="font-medium">{item.title}</h3>
                          <p className="text-sm text-muted-foreground mt-1">{item.desc}</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </motion.section>

            {/* Hydration & nutrition */}
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
              className="mb-10"
              aria-labelledby="hydration-heading"
            >
              <h2 id="hydration-heading" className="font-display font-bold text-xl mb-4 flex items-center gap-2">
                <Droplets className="w-5 h-5 text-blue-500 flex-shrink-0" />
                Hydration & Nutrition During Ramadan
              </h2>
              <p className="text-muted-foreground mb-4">
                During the eating window (after Maghrib until before Fajr), focus on fluids and balanced meals to support the next day's fast.
              </p>
              <ul className="space-y-2 text-muted-foreground mb-4">
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
                  Drink plenty of water between Iftar and Suhoor; avoid sugary drinks.
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
                  {preferences?.userType === "new"
                    ? "Traditionally, Muslims break fast with dates and water (Sunnah), then a light meal."
                    : "Break fast with dates and water (following the Sunnah), then a light meal."}
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
                  Include protein, complex carbs, and fiber at Suhoor for sustained energy.
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
                  Eat Suhoor as close to Fajr as permissible to shorten the fasting hours.
                </li>
              </ul>
            </motion.section>

            {/* Safe fasting guidelines */}
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="mb-10"
              aria-labelledby="guidelines-heading"
            >
              <h2 id="guidelines-heading" className="font-display font-bold text-xl mb-4 flex items-center gap-2">
                <Shield className="w-5 h-5 text-secondary flex-shrink-0" />
                Safe Fasting Guidelines
              </h2>
              <div className="grid md:grid-cols-2 gap-3">
                {safetyTips.map((tip, index) => (
                  <div
                    key={index}
                    className={`p-3 rounded-xl border flex items-center gap-3 ${
                      tip.do ? "bg-green-500/5 border-green-500/20" : "bg-red-500/5 border-red-500/20"
                    }`}
                  >
                    {tip.do ? (
                      <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                    ) : (
                      <XCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                    )}
                    <span className="text-sm">{tip.text}</span>
                  </div>
                ))}
              </div>
            </motion.section>

            {/* When to break fast */}
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35 }}
              className="mb-10 p-6 rounded-2xl bg-card border border-border"
              aria-labelledby="break-fast-heading"
            >
              <h2 id="break-fast-heading" className="font-display font-bold text-xl mb-4 flex items-center gap-2">
                <Heart className="w-5 h-5 text-red-500" />
                When to Break Your Fast
              </h2>
              <p className="text-muted-foreground mb-4">
                Islam prioritizes health and life. Break your fast immediately if you experience any of the following:
              </p>
              <ul className="space-y-2 text-muted-foreground mb-4">
                {breakFastReasons.map((reason, index) => (
                  <li key={index} className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-red-500 flex-shrink-0" />
                    {reason}
                  </li>
                ))}
              </ul>
              <div className="p-4 rounded-xl bg-secondary/10 border border-secondary/20">
                <p className="text-sm font-medium">
                  Your health is a trust (Amanah) from Allah. Taking care of your body is an act of worship. Breaking your fast for health reasons is not only permissible but obligatory when necessary.
                </p>
              </div>
            </motion.section>

            {/* Related links */}
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="flex flex-col sm:flex-row gap-4"
            >
              <Link
                to="/health-safety"
                className="flex items-center justify-center gap-2 flex-1 p-4 rounded-2xl border-2 border-border hover:border-secondary/50 hover:bg-secondary/5 transition-colors font-medium"
              >
                <Shield className="w-5 h-5" />
                Health & Safety (full guide)
              </Link>
              <Link
                to="/emergency"
                className="flex items-center justify-center gap-2 flex-1 p-4 rounded-2xl border-2 border-destructive/50 text-destructive hover:bg-destructive/10 transition-colors font-medium"
              >
                <AlertTriangle className="w-5 h-5" />
                I need to break my fast — emergency
              </Link>
            </motion.section>
          </article>
        </div>
      </main>

      <Footer />
    </div>
  );
}
