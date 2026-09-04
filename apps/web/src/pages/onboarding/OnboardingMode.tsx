import { useEffect, useCallback, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { ArrowLeft, ArrowRight, Check } from "lucide-react";
import { useOnboarding } from "@/contexts/OnboardingContext";
import { RamadanContextCard } from "@/components/RamadanContextCard";

const KNOWLEDGE_QUIZ_LENGTH = 6; // used for Muslim skip (full score)

export default function OnboardingMode() {
  const { state, setMode, setKnowledgeScore } = useOnboarding();
  const navigate = useNavigate();
  const location = useLocation();
  const preSelectMuslim = (location.state as { preSelectMuslim?: boolean } | null)?.preSelectMuslim;

  useEffect(() => {
    if (preSelectMuslim) {
      setMode("muslim");
      setKnowledgeScore(KNOWLEDGE_QUIZ_LENGTH);
      navigate("/onboarding/health", { replace: true });
    }
  }, [preSelectMuslim, setMode, setKnowledgeScore, navigate]);

  const [showRamadan101, setShowRamadan101] = useState(false);

  const handleSelect = useCallback((mode: "new" | "muslim") => {
    setMode(mode);
    setKnowledgeScore(mode === "muslim" ? KNOWLEDGE_QUIZ_LENGTH : 0);
    if (mode === "new") {
      setShowRamadan101(true);
    } else {
      navigate("/onboarding/health");
    }
  }, [setMode, setKnowledgeScore, navigate]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key !== "Enter") return;
      const target = e.target as HTMLElement;
      if (target.closest("input") || target.closest("textarea") || target.closest("select")) return;
      if (state.mode) {
        e.preventDefault();
        handleSelect(state.mode);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [state.mode, handleSelect]);

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <Link
        to="/onboarding/welcome"
        className="inline-flex items-center gap-1 text-muted-foreground hover:text-foreground mb-6"
      >
        <ArrowLeft className="w-4 h-4" /> Back
      </Link>
      <h2 className="font-display text-2xl font-bold mb-2">Choose your mode</h2>
      <p className="text-muted-foreground mb-6">Tell us about yourself</p>

      <div className="space-y-4">
        <button
          type="button"
          onClick={() => handleSelect("new")}
          className={`w-full min-h-[44px] p-6 rounded-2xl border-2 transition-all text-left hover:border-secondary cursor-pointer touch-manipulation ${
            state.mode === "new" ? "border-secondary bg-secondary/5" : "border-border"
          }`}
        >
          <div className="flex items-start gap-4">
            <span className="text-3xl">🌱</span>
            <div className="flex-1">
              <h3 className="font-bold text-lg">Non-Muslim Mode</h3>
              <p className="text-muted-foreground text-sm mt-1">
                Learning focus: explore fasting, culture, and wellness at your own pace.
              </p>
            </div>
            {state.mode === "new" && <Check className="w-5 h-5 text-secondary flex-shrink-0" />}
          </div>
        </button>

        <button
          type="button"
          onClick={() => handleSelect("muslim")}
          className={`w-full min-h-[44px] p-6 rounded-2xl border-2 transition-all text-left hover:border-secondary cursor-pointer touch-manipulation ${
            state.mode === "muslim" ? "border-secondary bg-secondary/5" : "border-border"
          }`}
        >
          <div className="flex items-start gap-4">
            <span className="text-3xl">☪️</span>
            <div className="flex-1">
              <h3 className="font-bold text-lg">Muslim Mode</h3>
              <p className="text-muted-foreground text-sm mt-1">
                Full religious observance support: prayer times, Ramadan tracking, and spiritual content.
              </p>
            </div>
            {state.mode === "muslim" && <Check className="w-5 h-5 text-secondary flex-shrink-0" />}
          </div>
        </button>
      </div>

      {/* Ramadan 101 for non-Muslims after selecting mode */}
      <AnimatePresence>
        {showRamadan101 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden mt-6"
          >
            <RamadanContextCard />
            <button
              type="button"
              onClick={() => navigate("/onboarding/knowledge")}
              className="w-full mt-4 min-h-[44px] py-3 px-6 rounded-xl bg-primary text-primary-foreground font-medium hover:bg-primary/90 flex items-center justify-center gap-2 cursor-pointer"
            >
              Got it, continue <ArrowRight className="w-5 h-5" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
