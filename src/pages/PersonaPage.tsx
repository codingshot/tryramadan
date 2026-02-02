import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { PageSEO } from "@/components/PageSEO";
import {
  ArrowLeft,
  MapPin,
  BookOpen,
  ExternalLink,
  ChevronRight,
  Target,
} from "lucide-react";
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

const PersonaPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const persona = data.personas.find((p) => p.slug === slug);

  if (!persona) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="main-content container mx-auto px-4 py-16 text-center">
          <h1 className="text-2xl font-bold mb-2">Persona not found</h1>
          <p className="text-muted-foreground mb-4">
            No persona with slug &quot;{slug}&quot;.
          </p>
          <Link to="/personas" className="text-secondary hover:underline">
            ← Back to Personas
          </Link>
        </main>
        <Footer />
      </div>
    );
  }

  const onboardingStepsForPersona = persona.onboardingStepIds
    .map((id) => data.onboardingSteps.find((s) => s.path === id))
    .filter(Boolean) as OnboardingStep[];

  return (
    <div className="min-h-screen bg-background">
      <PageSEO
        title={`${persona.name} | Personas | TryRamadan.app`}
        description={`${persona.shortName}: ${persona.description.slice(0, 120)}… Journey, onboarding flow, and resources.`}
        path={`/personas/${persona.slug}`}
      />
      <Navbar />

      <main className="main-content">
        <div className="container mx-auto px-4 max-w-3xl min-w-0 py-8 sm:py-12">
          <Link
            to="/personas"
            className="inline-flex items-center gap-1 text-muted-foreground hover:text-foreground mb-6"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Personas
          </Link>

          <motion.header
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-10"
          >
            <div className="flex items-center gap-4">
              <span className="text-5xl" aria-hidden>{persona.icon}</span>
              <div>
                <h1 className="text-2xl md:text-3xl font-display font-bold">
                  {persona.name}
                </h1>
                <p className="text-muted-foreground">{persona.shortName}</p>
              </div>
            </div>
            <p className="mt-4 text-muted-foreground">{persona.description}</p>
            <p className="mt-2 text-sm text-muted-foreground">
              Mode: <strong className="text-foreground">{persona.mode === "muslim" ? "Muslim" : "Non-Muslim"}</strong>
            </p>
          </motion.header>

          {/* Journey */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-10"
          >
            <h2 className="font-display font-bold mb-4 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-secondary" />
              Journey
            </h2>
            <ol className="space-y-4">
              {persona.journey.map((step, i) => (
                <li
                  key={step.phase}
                  className="flex gap-4 p-4 rounded-xl bg-card border border-border"
                >
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-secondary/20 text-secondary font-bold text-sm">
                    {i + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold">{step.phase}</h3>
                    <p className="text-sm text-muted-foreground mt-0.5">
                      {step.description}
                    </p>
                    <Link
                      to={step.path}
                      className="inline-flex items-center gap-1 text-secondary text-sm mt-2 hover:underline"
                    >
                      {step.path} <ExternalLink className="w-3 h-3" />
                    </Link>
                  </div>
                  <ChevronRight className="w-5 h-5 text-muted-foreground shrink-0" />
                </li>
              ))}
            </ol>
          </motion.section>

          {/* Onboarding flow for this persona */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="mb-10"
          >
            <h2 className="font-display font-bold mb-4 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-secondary" />
              Onboarding flow
            </h2>
            <p className="text-sm text-muted-foreground mb-4">
              Steps this persona goes through (in order).
            </p>
            <ol className="space-y-2">
              {onboardingStepsForPersona.map((step, i) => (
                <li key={step.path} className="flex items-center gap-3">
                  <span className="text-muted-foreground font-mono w-6">{i + 1}.</span>
                  <Link
                    to={`/onboarding/${step.path}`}
                    className="flex-1 p-3 rounded-lg border border-border hover:border-secondary/50 hover:bg-muted/30 transition-colors flex items-center justify-between"
                  >
                    <span className="font-medium">{step.label}</span>
                    <span className="text-xs text-muted-foreground">
                      {step.description}
                    </span>
                  </Link>
                </li>
              ))}
            </ol>
          </motion.section>

          {/* Goals */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-10"
          >
            <h2 className="font-display font-bold mb-4 flex items-center gap-2">
              <Target className="w-5 h-5 text-secondary" />
              Typical goals
            </h2>
            <ul className="flex flex-wrap gap-2">
              {persona.goals.map((goal) => (
                <li
                  key={goal}
                  className="px-3 py-1.5 rounded-full bg-muted/70 text-sm"
                >
                  {goal}
                </li>
              ))}
            </ul>
          </motion.section>

          {/* Related resources */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
          >
            <h2 className="font-display font-bold mb-4">Related resources</h2>
            <p className="text-sm text-muted-foreground mb-4">
              Links mapped to this persona.
            </p>
            <ul className="space-y-2">
              {persona.resources.map((r) => (
                <li key={r.path}>
                  <Link
                    to={r.path}
                    className="flex items-center justify-between p-3 rounded-xl border border-border hover:border-secondary/50 hover:bg-muted/30 transition-colors group"
                  >
                    <div>
                      <span className="font-medium group-hover:text-secondary">
                        {r.label}
                      </span>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {r.description}
                      </p>
                    </div>
                    <ChevronRight className="w-5 h-5 text-muted-foreground shrink-0" />
                  </Link>
                </li>
              ))}
            </ul>
          </motion.section>

          <div className="mt-10 pt-6 border-t border-border flex flex-wrap gap-4 text-sm">
            <Link to="/personas" className="text-secondary hover:underline">
              ← All personas
            </Link>
            <Link to="/onboarding/welcome" className="text-secondary hover:underline">
              Start onboarding
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default PersonaPage;
