import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, ArrowRight, Clock, Check, Star } from "lucide-react";
import { useOnboarding } from "@/contexts/OnboardingContext";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

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
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col min-h-0 flex-1">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleContinue();
        }}
        className="flex flex-col min-h-0 flex-1"
      >
        <div className="flex-1 min-h-0 overflow-y-auto">
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

          <Tooltip>
            <TooltipTrigger asChild>
              <h3 className="text-sm font-semibold text-foreground mb-2 flex items-center gap-2 cursor-help border-b border-dotted border-transparent hover:border-muted-foreground/40 w-fit">
                <Star className="w-4 h-4 text-primary" />
                Add voluntary Sunnah fasting (optional)
              </h3>
            </TooltipTrigger>
            <TooltipContent side="bottom" className="max-w-xs">
              {state.mode === "new"
                ? "Extra voluntary fasts (e.g. Monday & Thursday) that many Muslims do in addition to Ramadan."
                : "These can be combined with Full Ramadan. Tap to add or remove."}
            </TooltipContent>
          </Tooltip>
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
        </div>

        <div className="sticky bottom-0 left-0 right-0 z-10 bg-background border-t border-border pt-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] -mx-4 px-4 mt-4 sm:static sm:border-0 sm:pt-0 sm:pb-0 sm:mx-0 sm:px-0 sm:mt-0">
          <button
            type="submit"
            className="w-full min-h-[44px] py-3 px-6 rounded-xl bg-primary text-primary-foreground font-medium hover:bg-primary/90 flex items-center justify-center gap-2 cursor-pointer"
          >
            Continue <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </form>
    </motion.div>
  );
}
