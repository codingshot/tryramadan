import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, ArrowRight, Clock, Check } from "lucide-react";
import { useOnboarding } from "@/contexts/OnboardingContext";

/** Only Ramadan-based option; other fasting plans hidden for now. */
const PROGRAMS = [
  { id: "traditional", name: "Full Ramadan", desc: "Dawn to sunset (Fajr to Maghrib)", hours: "Full" },
];

export default function OnboardingSchedule() {
  const { state, setSelectedProgram } = useOnboarding();
  const navigate = useNavigate();

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
        Full Ramadan fast (dawn to sunset). Voluntary Sunnah fasting is available in the app.
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
            <Clock className="w-5 h-5 text-secondary flex-shrink-0" />
            <div className="flex-1">
              <span className="font-medium">{prog.name}</span>
              <p className="text-sm text-muted-foreground">{prog.desc}</p>
            </div>
            {state.selectedProgram === prog.id && <Check className="w-5 h-5 text-secondary flex-shrink-0" />}
          </button>
        ))}
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
