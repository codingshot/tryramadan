/**
 * Guided walkthrough overlay for first-time non-Muslim users on the dashboard.
 * Tracks completion stage in localStorage so users can resume or dismiss.
 */
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ArrowRight, ChevronRight, Moon, Timer, Utensils, BookOpen, Target, Calendar } from "lucide-react";
import { useLocalStorage } from "@/hooks/useLocalStorage";

const WALKTHROUGH_KEY = "tryramadan-walkthrough";

interface WalkthroughState {
  completed: boolean;
  lastStep: number;
  dismissedAt?: string;
}

const STEPS = [
  {
    icon: Moon,
    title: "Welcome to your Dashboard!",
    body: "This is your home during Ramadan. Here's a quick tour of what you can do.",
    tip: "You can always come back to this tour from the help button.",
  },
  {
    icon: Timer,
    title: "Fasting Timer & Countdown",
    body: "The countdown shows time until iftar (sunset meal) or suhoor (pre-dawn meal). Muslims fast from dawn to sunset — no food or water.",
    tip: "Your fasting hours depend on your location. Set it in settings for accurate times.",
  },
  {
    icon: Utensils,
    title: "Log Your Fast",
    body: "Each day, tap \"I'm fasting\" to start. At sunset, mark it complete. If you need to break early, that's OK — log the reason.",
    tip: "Your streak tracks consecutive fasting days. Don't worry about perfect scores!",
  },
  {
    icon: Calendar,
    title: "Schedule & Calendar",
    body: "View the full Ramadan calendar with daily suhoor/iftar times. Plan meals, export to your calendar app, and track your progress day by day.",
    tip: "Navigate to Schedule from the sidebar or quick actions.",
  },
  {
    icon: BookOpen,
    title: "Learn & Explore",
    body: "Discover why Muslims fast, cultural traditions from around the world, recipes for suhoor and iftar, and a glossary of Arabic terms.",
    tip: "The Learn section adapts to your knowledge level from onboarding.",
  },
  {
    icon: Target,
    title: "Goals & Progress",
    body: "Track your personal goals, see your fasting streak, earn badges, and monitor your health with hydration and energy tracking.",
    tip: "You're all set! Explore at your own pace. This tour won't show again, but you can find help in Settings.",
  },
];

interface DashboardWalkthroughProps {
  userType?: string;
}

export function DashboardWalkthrough({ userType }: DashboardWalkthroughProps) {
  const [walkthrough, setWalkthrough] = useLocalStorage<WalkthroughState>(WALKTHROUGH_KEY, {
    completed: false,
    lastStep: 0,
  });
  const [currentStep, setCurrentStep] = useState(walkthrough.lastStep || 0);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Only show for non-Muslim users who haven't completed/dismissed
    if (userType === "muslim") return;
    if (walkthrough.completed) return;
    if (walkthrough.dismissedAt) return;
    // Small delay so dashboard renders first
    const t = setTimeout(() => setVisible(true), 800);
    return () => clearTimeout(t);
  }, [userType, walkthrough.completed, walkthrough.dismissedAt]);

  const step = STEPS[currentStep];
  const isLast = currentStep === STEPS.length - 1;

  const handleNext = () => {
    if (isLast) {
      setWalkthrough({ completed: true, lastStep: STEPS.length - 1 });
      setVisible(false);
    } else {
      const next = currentStep + 1;
      setCurrentStep(next);
      setWalkthrough({ ...walkthrough, lastStep: next });
    }
  };

  const handleDismiss = () => {
    setWalkthrough({ ...walkthrough, dismissedAt: new Date().toISOString(), lastStep: currentStep });
    setVisible(false);
  };

  const handleResume = () => {
    setVisible(true);
  };

  // Show resume button if dismissed but not completed
  if (!visible && walkthrough.dismissedAt && !walkthrough.completed) {
    return (
      <motion.button
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        type="button"
        onClick={handleResume}
        className="fixed bottom-20 right-4 z-40 p-3 rounded-full bg-secondary text-secondary-foreground shadow-lg hover:bg-secondary/90 transition-colors"
        aria-label="Resume walkthrough tour"
      >
        <BookOpen className="w-5 h-5" />
      </motion.button>
    );
  }

  if (!visible) return null;

  const Icon = step.icon;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-end sm:items-center justify-center p-4"
        onClick={(e) => { if (e.target === e.currentTarget) handleDismiss(); }}
      >
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 40 }}
          className="w-full max-w-md bg-card border border-border rounded-2xl shadow-xl overflow-hidden"
        >
          {/* Progress dots */}
          <div className="flex items-center justify-between px-4 pt-4">
            <div className="flex gap-1.5">
              {STEPS.map((_, i) => (
                <div
                  key={i}
                  className={`h-1.5 rounded-full transition-all ${
                    i === currentStep ? "w-6 bg-secondary" : i < currentStep ? "w-3 bg-secondary/50" : "w-3 bg-muted"
                  }`}
                />
              ))}
            </div>
            <button
              type="button"
              onClick={handleDismiss}
              className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
              aria-label="Dismiss tour"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 pt-4">
            <div className="w-12 h-12 rounded-xl bg-secondary/15 flex items-center justify-center mb-4">
              <Icon className="w-6 h-6 text-secondary" />
            </div>
            <h3 className="font-display font-bold text-lg mb-2">{step.title}</h3>
            <p className="text-sm text-muted-foreground leading-relaxed mb-3">{step.body}</p>
            <p className="text-xs text-muted-foreground/70 italic flex items-start gap-1.5">
              <span className="text-secondary shrink-0">💡</span>
              {step.tip}
            </p>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between px-6 pb-6">
            <span className="text-xs text-muted-foreground">
              {currentStep + 1} of {STEPS.length}
            </span>
            <div className="flex items-center gap-2">
              {currentStep > 0 && (
                <button
                  type="button"
                  onClick={() => {
                    const prev = currentStep - 1;
                    setCurrentStep(prev);
                    setWalkthrough({ ...walkthrough, lastStep: prev });
                  }}
                  className="px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                >
                  Back
                </button>
              )}
              <button
                type="button"
                onClick={handleNext}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-secondary text-secondary-foreground font-medium text-sm hover:bg-secondary/90 transition-colors"
              >
                {isLast ? "Get Started" : "Next"}
                {isLast ? <ChevronRight className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

/** Check if walkthrough was completed */
export function isWalkthroughCompleted(): boolean {
  try {
    const raw = window.localStorage.getItem(WALKTHROUGH_KEY);
    if (!raw) return false;
    const state = JSON.parse(raw) as WalkthroughState;
    return state.completed === true;
  } catch {
    return false;
  }
}
