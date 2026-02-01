import { useEffect, useCallback, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useParams, useNavigate, useLocation } from "react-router-dom";
import { ChevronLeft, ChevronRight, ExternalLink, ArrowLeft } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { PageSEO } from "@/components/PageSEO";
import {
  getGuideBySlug,
  getRelatedGuides,
  guides,
  type Guide,
  type GuideStep,
} from "@/data/guides";

function buildHowToJsonLd(guide: Guide): object {
  return {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name: guide.title,
    description: guide.description,
    step: guide.steps.map((s, i) => ({
      "@type": "HowToStep",
      position: i + 1,
      name: s.title,
      text: s.body,
    })),
  };
}

const HOWTO_SCRIPT_ID = "guide-howto-jsonld";

function StepContent({
  step,
  stepIndex,
  totalSteps,
}: {
  step: GuideStep;
  stepIndex: number;
  totalSteps: number;
}) {
  const imgSrc = step.gif ?? step.image ?? "/placeholder.svg";

  return (
    <section
      aria-labelledby={`step-${stepIndex}-title`}
      className="space-y-6"
    >
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <span aria-hidden="true">
          Step {stepIndex + 1} of {totalSteps}
        </span>
      </div>
      <h2
        id={`step-${stepIndex}-title`}
        className="text-2xl md:text-3xl font-display font-bold"
      >
        {step.title}
      </h2>
      <p className="text-muted-foreground leading-relaxed">{step.body}</p>
      {(step.image || step.gif) && (
        <figure className="rounded-2xl border border-border overflow-hidden bg-muted/30">
          <img
            src={imgSrc}
            alt={`Screenshot or illustration for: ${step.title}. Mobile view.`}
            className="w-full max-w-md mx-auto block object-contain"
            loading="lazy"
            onError={(e) => {
              const target = e.currentTarget;
              if (target.src !== "/placeholder.svg") {
                target.src = "/placeholder.svg";
              }
            }}
          />
          <figcaption className="sr-only">
            {step.title} — step {stepIndex + 1}
          </figcaption>
        </figure>
      )}
      {step.quickLink && (
        <p>
          <Link
            to={step.quickLink.anchor ? `${step.quickLink.path}#${step.quickLink.anchor}` : step.quickLink.path}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors text-sm"
          >
            {step.quickLink.label}
            <ExternalLink className="w-4 h-4" />
          </Link>
        </p>
      )}
    </section>
  );
}

const GuidePage = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const guide = slug ? getGuideBySlug(slug) : undefined;
  const initialStep = (location.state as { stepIndex?: number } | null)?.stepIndex ?? 0;
  const [stepIndex, setStepIndex] = useState(
    guide ? Math.min(initialStep, Math.max(0, guide.steps.length - 1)) : 0
  );

  const totalSteps = guide?.steps.length ?? 0;
  const currentStep = guide?.steps[stepIndex];
  const hasPrevStep = stepIndex > 0;
  const hasNextStep = stepIndex < totalSteps - 1;

  const currentGuideIndex = guide ? guides.findIndex((g) => g.slug === guide.slug) : -1;
  const prevGuide = currentGuideIndex > 0 ? guides[currentGuideIndex - 1] : null;
  const nextGuide = currentGuideIndex >= 0 && currentGuideIndex < guides.length - 1 ? guides[currentGuideIndex + 1] : null;

  const goPrev = useCallback(() => {
    if (hasPrevStep) {
      setStepIndex((i) => i - 1);
    } else if (prevGuide) {
      navigate(`/guides/${prevGuide.slug}`, {
        state: { stepIndex: prevGuide.steps.length - 1 },
      });
    }
  }, [hasPrevStep, prevGuide, navigate]);

  const goNext = useCallback(() => {
    if (hasNextStep) {
      setStepIndex((i) => i + 1);
    } else if (nextGuide) {
      navigate(`/guides/${nextGuide.slug}`, { state: { stepIndex: 0 } });
    }
  }, [hasNextStep, nextGuide, navigate]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!guide) return;
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        goPrev();
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        goNext();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [guide, goPrev, goNext]);

  useEffect(() => {
    if (!guide) return;
    const fromState = (location.state as { stepIndex?: number } | null)?.stepIndex;
    if (typeof fromState === "number" && fromState >= 0 && fromState < guide.steps.length) {
      setStepIndex(fromState);
    } else if (stepIndex >= guide.steps.length) {
      setStepIndex(0);
    }
  }, [guide?.slug]);

  useEffect(() => {
    if (guide && stepIndex >= guide.steps.length) {
      setStepIndex(guide.steps.length - 1);
    }
  }, [guide, stepIndex]);

  if (!guide) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="main-content container mx-auto px-4 max-w-2xl">
          <h1 className="text-2xl font-display font-bold mb-4">Guide not found</h1>
          <Link to="/guides" className="text-primary hover:underline">
            Back to all guides
          </Link>
        </main>
        <Footer />
      </div>
    );
  }

  const related = getRelatedGuides(guide);

  useEffect(() => {
    const jsonLd = buildHowToJsonLd(guide);
    let el = document.getElementById(HOWTO_SCRIPT_ID) as HTMLScriptElement | null;
    if (!el) {
      el = document.createElement("script");
      el.id = HOWTO_SCRIPT_ID;
      el.type = "application/ld+json";
      document.head.appendChild(el);
    }
    el.textContent = JSON.stringify(jsonLd);
    return () => {
      el?.remove();
    };
  }, [guide.slug]);

  return (
    <div className="min-h-screen bg-background">
      <PageSEO
        title={`${guide.title} | TryRamadan Guides`}
        description={guide.description}
        path={`/guides/${guide.slug}`}
        type="article"
      />
      <Navbar />

      <main className="main-content">
        <div className="container mx-auto px-4 max-w-3xl min-w-0">
          <Link
            to="/guides"
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            All guides
          </Link>

          <article>
            <header className="mb-10">
              <h1 className="text-3xl md:text-4xl font-display font-bold mb-2">
                {guide.title}
              </h1>
              <p className="text-muted-foreground text-lg">
                {guide.shortDescription}
              </p>
              <p className="text-sm text-muted-foreground mt-2" aria-hidden="true">
                Use ← → arrow keys to move between steps and guides.
              </p>
            </header>

            <AnimatePresence mode="wait">
              {currentStep && (
                <motion.div
                  key={stepIndex}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.2 }}
                >
                  <StepContent
                    step={currentStep}
                    stepIndex={stepIndex}
                    totalSteps={totalSteps}
                  />
                </motion.div>
              )}
            </AnimatePresence>

            <nav
              className="mt-10 sm:mt-12 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 border-t border-border pt-6 sm:pt-8"
              aria-label="Guide step navigation"
            >
              <div className="flex-1">
                {(hasPrevStep || prevGuide) ? (
                  <button
                    type="button"
                    onClick={goPrev}
                    className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground font-medium"
                  >
                    <ChevronLeft className="w-5 h-5" />
                    {hasPrevStep ? "Previous step" : prevGuide?.title}
                  </button>
                ) : (
                  <span />
                )}
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground" aria-live="polite">
                {stepIndex + 1} / {totalSteps}
              </div>
              <div className="flex-1 flex justify-end">
                {(hasNextStep || nextGuide) ? (
                  <button
                    type="button"
                    onClick={goNext}
                    className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground font-medium"
                  >
                    {hasNextStep ? "Next step" : nextGuide?.title}
                    <ChevronRight className="w-5 h-5" />
                  </button>
                ) : (
                  <span />
                )}
              </div>
            </nav>

            {related.length > 0 && (
              <aside className="mt-14 pt-10 border-t border-border">
                <h2 className="text-lg font-display font-bold mb-4">
                  Related guides
                </h2>
                <ul className="space-y-2">
                  {related.map((g) => (
                    <li key={g.slug}>
                      <Link
                        to={`/guides/${g.slug}`}
                        className="text-primary hover:underline font-medium"
                      >
                        {g.title}
                      </Link>
                    </li>
                  ))}
                </ul>
              </aside>
            )}
          </article>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default GuidePage;
