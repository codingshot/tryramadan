import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { PageSEO } from "@/components/PageSEO";
import { ArrowRight, Users, Map } from "lucide-react";
import personasData from "@/data/personas.json";

type OnboardingStep = { path: string; label: string; description?: string };
type JourneyPhase = { phase: string; description: string; path: string };
type Resource = { label: string; path: string; description: string };
type Persona = {
  slug: string;
  name: string;
  shortName: string;
  description: string;
  icon: string;
  mode: string;
  goals: string[];
  onboardingStepIds: string[];
  journey: JourneyPhase[];
  resources: Resource[];
};

type PersonasData = {
  onboardingSteps: OnboardingStep[];
  personas: Persona[];
};

const data = personasData as PersonasData;

const Personas = () => {
  return (
    <div className="min-h-screen bg-background">
      <PageSEO
        title="Personas & Journeys | TryRamadan.app"
        description="TryRamadan personas and user journeys: Non-Muslim curious, Muslim observer, health & wellness, culture & food, Quran & learning. Onboarding flows and related resources."
        path="/personas"
      />
      <Navbar />

      <main id="main-content" className="main-content">
        <div className="container mx-auto px-4 max-w-4xl min-w-0 py-8 sm:py-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-10"
          >
            <div className="flex items-center gap-2 text-secondary mb-2">
              <Users className="w-5 h-5" />
              <span className="text-sm font-medium">Personas & Journeys</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-display font-bold mb-3">
              Who uses TryRamadan
            </h1>
            <p className="text-muted-foreground max-w-2xl">
              We outline personas and their journeys based on onboarding flows and related resources. Each persona has a dedicated page with full journey mapping.
            </p>
          </motion.div>

          {/* Onboarding flow reference */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-12 p-6 rounded-2xl bg-muted/50 border border-border"
          >
            <h2 className="font-display font-bold mb-4 flex items-center gap-2">
              <Map className="w-5 h-5 text-secondary" />
              Onboarding flow (all personas)
            </h2>
            <ol className="space-y-2 text-sm">
              {data.onboardingSteps.map((step, i) => (
                <li key={step.path} className="flex gap-3">
                  <span className="text-muted-foreground font-mono w-6">{i + 1}.</span>
                  <span className="font-medium">{step.label}</span>
                  <span className="text-muted-foreground">— {step.description}</span>
                  <Link
                    to={`/onboarding/${step.path}`}
                    className="text-secondary hover:underline ml-auto shrink-0"
                  >
                    Go
                  </Link>
                </li>
              ))}
            </ol>
          </motion.section>

          {/* Persona cards */}
          <section className="space-y-8">
            <h2 className="font-display font-bold text-xl mb-4">Personas</h2>
            {data.personas.map((persona, index) => (
              <motion.article
                key={persona.slug}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 + index * 0.05 }}
                className="p-6 rounded-2xl bg-card border border-border hover:border-secondary/50 transition-colors"
              >
                <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                  <div className="flex items-center gap-3">
                    <span className="text-4xl" aria-hidden>{persona.icon}</span>
                    <div>
                      <h3 className="font-display font-bold text-lg">{persona.name}</h3>
                      <p className="text-sm text-muted-foreground">{persona.shortName}</p>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground flex-1">{persona.description}</p>
                  <Link
                    to={`/personas/${persona.slug}`}
                    className="inline-flex items-center gap-1 text-secondary font-medium text-sm hover:underline shrink-0"
                  >
                    View journey <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
                <div className="mt-4 pt-4 border-t border-border grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div>
                    <span className="text-muted-foreground block mb-1">Journey (high level)</span>
                    <ul className="space-y-0.5">
                      {persona.journey.map((j) => (
                        <li key={j.phase}>
                          <strong>{j.phase}</strong> — {j.description.slice(0, 50)}
                          {j.description.length > 50 ? "…" : ""}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <span className="text-muted-foreground block mb-1">Key resources</span>
                    <ul className="space-y-0.5">
                      {persona.resources.slice(0, 4).map((r) => (
                        <li key={r.path}>
                          <Link to={r.path} className="text-secondary hover:underline">
                            {r.label}
                          </Link>
                        </li>
                      ))}
                      {persona.resources.length > 4 && (
                        <li className="text-muted-foreground">
                          +{persona.resources.length - 4} more on persona page
                        </li>
                      )}
                    </ul>
                  </div>
                </div>
              </motion.article>
            ))}
          </section>

          <p className="mt-10 text-sm text-muted-foreground">
            <Link to="/onboarding/welcome" className="text-secondary hover:underline">
              Start onboarding
            </Link>
            {" · "}
            <Link to="/guides" className="text-secondary hover:underline">
              User guides
            </Link>
          </p>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Personas;
