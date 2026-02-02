import { useState } from "react";
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, ArrowRight, AlertTriangle } from "lucide-react";
import { useOnboarding } from "@/contexts/OnboardingContext";

const HEALTH_OPTIONS = [
  { id: "none", label: "None of these", emoji: "✅", safe: true },
  { id: "diabetes", label: "Diabetes or blood sugar issues", emoji: "🩸", safe: false },
  { id: "pregnancy", label: "Pregnancy or breastfeeding", emoji: "🤰", safe: false },
  { id: "heart", label: "Heart or blood pressure conditions", emoji: "❤️", safe: false },
  { id: "chronic", label: "Chronic illness or on regular medication", emoji: "💊", safe: false },
  { id: "other", label: "Other health concern", emoji: "📋", safe: false },
];

export default function OnboardingHealth() {
  const { state, setHealthWarnings } = useOnboarding();
  const [selected, setSelected] = useState<string[]>(() =>
    Array.isArray(state.healthWarnings) ? state.healthWarnings : []
  );
  const navigate = useNavigate();

  const sel = Array.isArray(selected) ? selected : [];

  const toggle = (id: string) => {
    if (id === "none") {
      setSelected([]);
      return;
    }
    setSelected((prev) => {
      const p = Array.isArray(prev) ? prev : [];
      return p.includes(id) ? p.filter((x) => x !== id) : p.filter((x) => x !== "none").concat(id);
    });
  };

  const handleContinue = () => {
    setHealthWarnings(sel.filter((x) => x !== "none"));
    navigate("/onboarding/location");
  };

  const hasWarning = sel.some((id) => id !== "none" && HEALTH_OPTIONS.find((o) => o.id === id)?.safe === false);

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <Link
        to="/onboarding/knowledge"
        className="inline-flex items-center gap-1 text-muted-foreground hover:text-foreground mb-6"
      >
        <ArrowLeft className="w-4 h-4" /> Back
      </Link>
      <h2 className="font-display text-2xl font-bold mb-2">Health screening</h2>
      <p className="text-muted-foreground mb-6">
        So we can show relevant safety information. Always consult a doctor before fasting.
      </p>

      <div className="space-y-2 mb-6">
        {HEALTH_OPTIONS.map((opt) => (
          <button
            key={opt.id}
            type="button"
            onClick={() => toggle(opt.id)}
            className={`w-full min-h-[44px] p-4 rounded-xl border-2 text-left transition-all cursor-pointer touch-manipulation flex items-center gap-3 ${
              sel.includes(opt.id)
                ? "border-secondary bg-secondary/5"
                : "border-border hover:border-secondary/50"
            }`}
          >
            <span className="text-2xl shrink-0" aria-hidden>{opt.emoji}</span>
            <span>{opt.label}</span>
          </button>
        ))}
      </div>

      {hasWarning && (
        <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 flex gap-3 mb-6">
          <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-muted-foreground">
            We'll show health & safety guidance. Please speak to your doctor before fasting.
          </p>
        </div>
      )}

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
