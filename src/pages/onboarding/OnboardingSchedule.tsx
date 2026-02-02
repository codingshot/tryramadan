import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, ArrowRight, Clock, Check, Star } from "lucide-react";
import { useOnboarding } from "@/contexts/OnboardingContext";

/** Only Ramadan-based option; other fasting plans hidden for now. */
const PROGRAMS = [
  { id: "traditional", name: "Full Ramadan", desc: "Dawn to sunset (Fajr to Maghrib)", hours: "Full", emoji: "🌙" },
];

/** Voluntary Sunnah fasting options for onboarding (multi-select). */
const VOLUNTARY_OPTIONS = [
  {
    id: "monday-thursday",
    name: "Monday & Thursday Fasting",
    desc: "The Prophet (ﷺ) fasted on Mondays and Thursdays—deeds are presented to Allah on these days.",
    frequency: "Weekly",
  },
  {
    id: "ayyam-al-beed",
    name: "Ayyam al-Beed",
    desc: "Fasting on the 13th, 14th, and 15th of each Islamic lunar month—the 'white days' (full moon).",
    frequency: "Monthly",
  },
];

export default function OnboardingSchedule() {
  const { state, setSelectedProgram, setVoluntaryFasting } = useOnboarding();
  const navigate = useNavigate();
  const voluntary = Array.isArray(state.voluntaryFasting) ? state.voluntaryFasting : [];

  const toggleVoluntary = (id: string) => {
    setVoluntaryFasting((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const handleContinue = () => {
    navigate("/onboarding/notifications");
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <Link
        to="/onboarding/location"
        className="inline-flex items-center gap-1 text-muted-foreground hover:text-foreground mb-6"
      >
        <ArrowLeft className="w-4 h-4" /> Back
      </Link>
      <h2 className="font-display text-2xl font-bold mb-2">Fasting schedule</h2>
      <p className="text-muted-foreground mb-6">
        Choose your Ramadan schedule. You can also add voluntary Sunnah fasting.
      </p>

      <div className="space-y-3 mb-6">
        {PROGRAMS.map((prog) => (
          <button
            key={prog.id}
            type="button"
            onClick={() => setSelectedProgram(prog.id)}
            className={`w-full min-h-[44px] p-4 rounded-xl border-2 text-left transition-all flex items-center gap-3 cursor-pointer touch-manipulation ${
              state.selectedProgram === prog.id ? "border-secondary bg-secondary/5" : "border-border hover:border-secondary/50"
            }`}
          >
            <span className="text-2xl shrink-0" aria-hidden>{prog.emoji}</span>
            <Clock className="w-5 h-5 text-secondary flex-shrink-0" />
            <div className="flex-1">
              <span className="font-medium">{prog.name}</span>
              <p className="text-sm text-muted-foreground">{prog.desc}</p>
            </div>
            {state.selectedProgram === prog.id && <Check className="w-5 h-5 text-secondary flex-shrink-0" />}
          </button>
        ))}
      </div>

      <h3 className="text-sm font-semibold text-foreground mb-2 flex items-center gap-2">
        <Star className="w-4 h-4 text-primary" />
        Add voluntary Sunnah fasting (optional)
      </h3>
      <p className="text-xs text-muted-foreground mb-3">
        These can be combined with Full Ramadan. Tap to add or remove.
      </p>
      <div className="space-y-2 mb-6">
        {VOLUNTARY_OPTIONS.map((opt) => {
          const selected = voluntary.includes(opt.id);
          return (
            <button
              key={opt.id}
              type="button"
              onClick={() => toggleVoluntary(opt.id)}
              className={`w-full min-h-[44px] p-4 rounded-xl border-2 text-left transition-all flex items-center gap-3 cursor-pointer touch-manipulation ${
                selected ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"
              }`}
            >
              <span className="text-xl shrink-0" aria-hidden>☪️</span>
              <div className="flex-1">
                <span className="font-medium text-sm">{opt.name}</span>
                <span className="text-xs text-secondary ml-2">· {opt.frequency}</span>
                <p className="text-xs text-muted-foreground mt-0.5">{opt.desc}</p>
              </div>
              {selected && <Check className="w-5 h-5 text-primary flex-shrink-0" />}
            </button>
          );
        })}
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
