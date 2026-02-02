import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, ArrowRight, BookOpen, Utensils, BookMarked, Scale, MapPin } from "lucide-react";
import { useOnboarding } from "@/contexts/OnboardingContext";

const LEARNING_OPTIONS = [
  { value: "minimal" as const, label: "Minimal", desc: "Just fasting basics", emoji: "📖" },
  { value: "moderate" as const, label: "Moderate", desc: "Some learning & hadith", emoji: "📚" },
  { value: "deep" as const, label: "Deep", desc: "Religion, guides, glossary", emoji: "📕" },
];

const CULTURE_OPTIONS = [
  { value: "none" as const, label: "None", desc: "Skip culture & recipes", emoji: "🚫" },
  { value: "some" as const, label: "Some", desc: "Occasional recipes", emoji: "🍽️" },
  { value: "lots" as const, label: "Lots", desc: "Culture & food focus", emoji: "🎉" },
];

const QURAN_OPTIONS = [
  { value: "none" as const, label: "None", desc: "Skip Quran section", emoji: "📖" },
  { value: "some" as const, label: "Some", desc: "Glossary & occasional reading", emoji: "📜" },
  { value: "daily" as const, label: "Daily", desc: "Quran & glossary every day", emoji: "📿" },
];

export default function OnboardingPriorities() {
  const { state, setPriorities } = useOnboarding();
  const navigate = useNavigate();
  const p = state.priorities;

  const handleContinue = () => {
    navigate("/onboarding/goals");
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <Link
        to="/onboarding/notifications"
        className="inline-flex items-center gap-1 text-muted-foreground hover:text-foreground mb-6"
      >
        <ArrowLeft className="w-4 h-4" /> Back
      </Link>

      <div className="mb-6">
        <h2 className="font-display text-2xl font-bold mb-2">Your priorities</h2>
        <p className="text-muted-foreground">
          We’ll prioritize your dashboard and keep things simple based on what you care about. You can still access everything from Learn.
        </p>
      </div>

      {/* Learning */}
      <div className="mb-6">
        <h3 className="text-sm font-semibold mb-2 flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-secondary" />
          How much do you want to learn?
        </h3>
        <div className="space-y-2">
          {LEARNING_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => setPriorities({ learningPriority: opt.value })}
              className={`w-full min-h-[44px] p-3 rounded-xl border-2 text-left transition-all flex items-center gap-3 cursor-pointer touch-manipulation ${
                p.learningPriority === opt.value ? "border-secondary bg-secondary/10" : "border-border hover:border-secondary/50"
              }`}
            >
              <span className="text-xl shrink-0" aria-hidden>{opt.emoji}</span>
              <span className="font-medium flex-1">{opt.label}</span>
              <span className="text-xs text-muted-foreground">{opt.desc}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Culture & recipes */}
      <div className="mb-6">
        <h3 className="text-sm font-semibold mb-2 flex items-center gap-2">
          <Utensils className="w-4 h-4 text-secondary" />
          Culture & food recipes
        </h3>
        <div className="space-y-2">
          {CULTURE_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => setPriorities({ cultureRecipesPriority: opt.value })}
              className={`w-full min-h-[44px] p-3 rounded-xl border-2 text-left transition-all flex items-center gap-3 cursor-pointer touch-manipulation ${
                p.cultureRecipesPriority === opt.value ? "border-secondary bg-secondary/10" : "border-border hover:border-secondary/50"
              }`}
            >
              <span className="text-xl shrink-0" aria-hidden>{opt.emoji}</span>
              <span className="font-medium flex-1">{opt.label}</span>
              <span className="text-xs text-muted-foreground">{opt.desc}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Quran */}
      <div className="mb-6">
        <h3 className="text-sm font-semibold mb-2 flex items-center gap-2">
          <BookMarked className="w-4 h-4 text-secondary" />
          Quran & glossary
        </h3>
        <div className="space-y-2">
          {QURAN_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => setPriorities({ quranPriority: opt.value })}
              className={`w-full min-h-[44px] p-3 rounded-xl border-2 text-left transition-all flex items-center gap-3 cursor-pointer touch-manipulation ${
                p.quranPriority === opt.value ? "border-secondary bg-secondary/10" : "border-border hover:border-secondary/50"
              }`}
            >
              <span className="text-xl shrink-0" aria-hidden>{opt.emoji}</span>
              <span className="font-medium flex-1">{opt.label}</span>
              <span className="text-xs text-muted-foreground">{opt.desc}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Macro tracking */}
      <div className="mb-6">
        <h3 className="text-sm font-semibold mb-2 flex items-center gap-2">
          <Scale className="w-4 h-4 text-secondary" />
          Macro tracking (calories, protein, carbs)
        </h3>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setPriorities({ macroTrackingEnabled: false })}
            className={`flex-1 min-h-[44px] p-3 rounded-xl border-2 transition-all cursor-pointer touch-manipulation flex flex-col items-center justify-center gap-0.5 ${
              !p.macroTrackingEnabled ? "border-secondary bg-secondary/10" : "border-border hover:border-secondary/50"
            }`}
          >
            <span className="text-xl" aria-hidden>❌</span>
            <span className="font-medium">No</span>
            <span className="text-xs text-muted-foreground">Keep it simple</span>
          </button>
          <button
            type="button"
            onClick={() => setPriorities({ macroTrackingEnabled: true })}
            className={`flex-1 min-h-[44px] p-3 rounded-xl border-2 transition-all cursor-pointer touch-manipulation flex flex-col items-center justify-center gap-0.5 ${
              p.macroTrackingEnabled ? "border-secondary bg-secondary/10" : "border-border hover:border-secondary/50"
            }`}
          >
            <span className="text-xl" aria-hidden>✅</span>
            <span className="font-medium">Yes</span>
            <span className="text-xs text-muted-foreground">Track macros</span>
          </button>
        </div>
      </div>

      {/* Simplify by location */}
      <div className="mb-8">
        <h3 className="text-sm font-semibold mb-2 flex items-center gap-2">
          <MapPin className="w-4 h-4 text-secondary" />
          Use my location to simplify
        </h3>
        <p className="text-xs text-muted-foreground mb-2">
          Prayer times, local relevance, and fewer options when possible.
        </p>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setPriorities({ simplifyByLocation: true })}
            className={`flex-1 min-h-[44px] p-3 rounded-xl border-2 transition-all cursor-pointer touch-manipulation flex items-center justify-center gap-2 ${
              p.simplifyByLocation ? "border-secondary bg-secondary/10" : "border-border hover:border-secondary/50"
            }`}
          >
            <span className="text-xl" aria-hidden>📍</span>
            <span className="font-medium">Yes</span>
          </button>
          <button
            type="button"
            onClick={() => setPriorities({ simplifyByLocation: false })}
            className={`flex-1 min-h-[44px] p-3 rounded-xl border-2 transition-all cursor-pointer touch-manipulation flex items-center justify-center gap-2 ${
              !p.simplifyByLocation ? "border-secondary bg-secondary/10" : "border-border hover:border-secondary/50"
            }`}
          >
            <span className="text-xl" aria-hidden>🌐</span>
            <span className="font-medium">No</span>
          </button>
        </div>
      </div>

      <button
        type="button"
        onClick={handleContinue}
        className="w-full min-h-[44px] py-3 px-6 rounded-xl bg-primary text-primary-foreground font-medium hover:bg-primary/90 flex items-center justify-center gap-2 cursor-pointer"
      >
        Continue <ArrowRight className="w-5 h-5" />
      </button>
    </motion.div>
  );
}
