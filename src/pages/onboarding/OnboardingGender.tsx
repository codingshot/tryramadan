import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, ArrowRight, Check } from "lucide-react";
import { useOnboarding } from "@/contexts/OnboardingContext";

const GENDER_OPTIONS = [
  { id: "female" as const, label: "Female", emoji: "👩", desc: "Enables menstruation pattern tracking for excused fasting days" },
  { id: "male" as const, label: "Male", emoji: "👨", desc: "No menstruation tracking" },
  { id: "prefer-not-to-say" as const, label: "Prefer not to say", emoji: "✨", desc: "Skip personalization" },
] as const;

export default function OnboardingGender() {
  const { state, setGender } = useOnboarding();
  const navigate = useNavigate();

  const handleSelect = (id: (typeof GENDER_OPTIONS)[number]["id"]) => {
    setGender(id);
    navigate("/onboarding/location");
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <Link
        to="/onboarding/health"
        className="inline-flex items-center gap-1 text-muted-foreground hover:text-foreground mb-6"
      >
        <ArrowLeft className="w-4 h-4" /> Back
      </Link>
      <h2 className="font-display text-2xl font-bold mb-2">Gender</h2>
      <p className="text-muted-foreground mb-6">
        Optional. We use this to offer menstruation pattern tracking for women—so you can easily mark excused fasting days (e.g. during your period) without guilt. Your data stays on this device.
      </p>

      <div className="space-y-2 mb-6">
        {GENDER_OPTIONS.map((opt) => {
          const isSelected = state.gender === opt.id;
          return (
            <button
              key={opt.id}
              type="button"
              onClick={() => handleSelect(opt.id)}
              className={`w-full min-h-[44px] p-4 rounded-xl border-2 text-left transition-all cursor-pointer touch-manipulation flex items-center gap-3 ${
                isSelected ? "border-secondary bg-secondary/5" : "border-border hover:border-secondary/50"
              }`}
            >
              <span className="text-2xl shrink-0" aria-hidden>{opt.emoji}</span>
              <div className="flex-1 min-w-0">
                <span className="font-medium block">{opt.label}</span>
                <span className="text-xs text-muted-foreground">{opt.desc}</span>
              </div>
              {isSelected && <Check className="w-5 h-5 text-secondary flex-shrink-0" />}
            </button>
          );
        })}
      </div>

      <button
        type="button"
        onClick={() => {
          setGender(state.gender ?? "prefer-not-to-say");
          navigate("/onboarding/location");
        }}
        className="w-full min-h-[44px] py-3 px-6 rounded-xl bg-primary text-primary-foreground font-medium hover:bg-primary/90 flex items-center justify-center gap-2"
      >
        Continue <ArrowRight className="w-5 h-5" />
      </button>
    </motion.div>
  );
}
