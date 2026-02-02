import { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Check } from "lucide-react";
import { useOnboarding } from "@/contexts/OnboardingContext";
import { useUserPreferences, getQuickActionOrderFromPriorities } from "@/hooks/useLocalStorage";
import { useDashboardQuickActions } from "@/hooks/useLocalStorage";

const GOAL_OPTIONS = [
  "Learn about Ramadan culture",
  "Try intermittent fasting safely",
  "Support Muslim friends and family",
  "Spiritual reflection",
  "Health and wellness",
  "Build discipline",
];

export default function OnboardingGoals() {
  const { state, setGoals, setIntention } = useOnboarding();
  const [preferences, setPreferences] = useUserPreferences();
  const [, setQuickActionOrder] = useDashboardQuickActions();
  const [selectedGoals, setSelectedGoals] = useState<string[]>(state.goals);
  const [intention, setIntentionLocal] = useState(state.intention);
  const navigate = useNavigate();

  const toggleGoal = (g: string) => {
    setSelectedGoals((prev) =>
      prev.includes(g) ? prev.filter((x) => x !== g) : [...prev, g]
    );
  };

  const handleComplete = () => {
    setGoals(selectedGoals);
    setIntention(intention);
    const priorities = state.priorities;
    // Persist to preferences and mark onboarding complete
    setPreferences({
      ...preferences,
      userType: state.mode,
      experience: state.experience,
      location: state.location?.displayName ?? "",
      locationCoords: state.location ? { lat: state.location.lat, lng: state.location.lng } : null,
      fastingGoal: state.selectedProgram === "traditional" ? "full" : state.selectedProgram,
      selectedProgram: state.selectedProgram,
      onboardingComplete: true,
      notificationsEnabled: state.notifications.suhoor || state.notifications.iftar,
      learningPriority: priorities.learningPriority,
      cultureRecipesPriority: priorities.cultureRecipesPriority,
      quranPriority: priorities.quranPriority,
      macroTrackingEnabled: priorities.macroTrackingEnabled,
      simplifyByLocation: priorities.simplifyByLocation,
    });
    // Set dashboard quick action order from priorities
    setQuickActionOrder(
      getQuickActionOrderFromPriorities(priorities)
    );
    navigate("/dashboard");
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <button
        onClick={() => navigate("/onboarding/priorities")}
        className="inline-flex items-center gap-1 text-muted-foreground hover:text-foreground mb-6"
      >
        <ArrowLeft className="w-4 h-4" /> Back
      </button>
      <h2 className="font-display text-2xl font-bold mb-2">Goals & intentions</h2>
      <p className="text-muted-foreground mb-6">
        Set your personal focus for this fasting journey. Optional but helps us tailor content.
      </p>

      <div className="space-y-2 mb-6">
        {GOAL_OPTIONS.map((g) => (
          <button
            key={g}
            onClick={() => toggleGoal(g)}
            className={`w-full p-4 rounded-xl border-2 text-left transition-all flex items-center gap-3 ${
              selectedGoals.includes(g) ? "border-secondary bg-secondary/5" : "border-border hover:border-secondary/50"
            }`}
          >
            <span className="flex-1">{g}</span>
            {selectedGoals.includes(g) && <Check className="w-5 h-5 text-secondary flex-shrink-0" />}
          </button>
        ))}
      </div>

      <label className="block text-sm font-medium mb-2">Personal intention (optional)</label>
      <textarea
        value={intention}
        onChange={(e) => setIntentionLocal(e.target.value)}
        placeholder="e.g. I want to understand and respect my colleagues' practice..."
        className="w-full p-4 rounded-xl border border-border bg-background min-h-[80px] text-sm resize-none focus:ring-2 focus:ring-secondary focus:border-secondary outline-none"
      />

      <button
        onClick={handleComplete}
        className="w-full mt-6 py-3 px-6 rounded-xl bg-primary text-primary-foreground font-medium hover:bg-primary/90 flex items-center justify-center gap-2"
      >
        Finish setup and go to dashboard <Check className="w-5 h-5" />
      </button>
    </motion.div>
  );
}
