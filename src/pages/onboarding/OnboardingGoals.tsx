import { useState } from "react";
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Check, BookOpen } from "lucide-react";
import { useOnboarding } from "@/contexts/OnboardingContext";
import { useUserPreferences, getQuickActionOrderFromPriorities, persistPreferencesSync, persistQuickActionsSync } from "@/hooks/useLocalStorage";
import { useDashboardQuickActions } from "@/hooks/useLocalStorage";

const GOAL_OPTIONS_NON_MUSLIM: { emoji: string; label: string }[] = [
  { emoji: "📚", label: "Learn about Ramadan culture" },
  { emoji: "⏱️", label: "Try intermittent fasting safely" },
  { emoji: "🤝", label: "Support Muslim friends and family" },
  { emoji: "🧘", label: "Spiritual reflection" },
  { emoji: "💪", label: "Health and wellness" },
  { emoji: "📐", label: "Build discipline" },
];

const GOAL_OPTIONS_MUSLIM: { emoji: string; label: string }[] = [
  { emoji: "🌙", label: "Complete Ramadan with devotion" },
  { emoji: "📖", label: "Recite Quran daily" },
  { emoji: "💝", label: "Give charity (Sadaqah)" },
  { emoji: "🧘", label: "Spiritual reflection" },
  { emoji: "💪", label: "Health and wellness" },
  { emoji: "📐", label: "Build discipline" },
];

export default function OnboardingGoals() {
  const { state, setGoals, setIntention } = useOnboarding();
  const [preferences, setPreferences] = useUserPreferences();
  const [, setQuickActionOrder] = useDashboardQuickActions();
  const [selectedGoals, setSelectedGoals] = useState<string[]>(state.goals);
  const [intention, setIntentionLocal] = useState(state.intention);
  const navigate = useNavigate();

  const toggleGoal = (label: string) => {
    setSelectedGoals((prev) =>
      prev.includes(label) ? prev.filter((x) => x !== label) : [...prev, label]
    );
  };

  const handleComplete = () => {
    setGoals(selectedGoals);
    setIntention(intention);
    const priorities = state.priorities && typeof state.priorities === "object" ? state.priorities : {
      learningPriority: "moderate" as const,
      cultureRecipesPriority: "some" as const,
      quranPriority: "some" as const,
      macroTrackingEnabled: false,
      simplifyByLocation: true,
    };
    const voluntaryFasting = Array.isArray(state.voluntaryFasting) ? state.voluntaryFasting : [];
    const genderPref = state.gender === 'prefer-not-to-say' ? null : state.gender;
    const healthWarnings = Array.isArray(state.healthWarnings) ? state.healthWarnings.filter((id) => id && id !== "none") : [];
    const newPrefs = {
      ...preferences,
      userType: state.mode,
      experience: state.experience,
      gender: genderPref,
      location: state.location?.displayName ?? "",
      locationCoords: state.location ? { lat: state.location.lat, lng: state.location.lng } : null,
      timezone: state.location?.timezone ?? null,
      fastingGoal: state.selectedProgram === "traditional" ? "full" : state.selectedProgram,
      selectedProgram: state.selectedProgram,
      voluntaryFasting,
      healthWarnings,
      onboardingComplete: true,
      notificationsEnabled: state.notifications.suhoor || state.notifications.iftar,
      learningPriority: priorities.learningPriority,
      cultureRecipesPriority: priorities.cultureRecipesPriority,
      quranPriority: priorities.quranPriority,
      macroTrackingEnabled: priorities.macroTrackingEnabled,
      simplifyByLocation: priorities.simplifyByLocation,
    };
    // Persist synchronously BEFORE navigating so Dashboard reads fresh data from localStorage
    persistPreferencesSync(newPrefs);
    persistQuickActionsSync(getQuickActionOrderFromPriorities(priorities));
    setPreferences(newPrefs);
    setQuickActionOrder(getQuickActionOrderFromPriorities(priorities));
    navigate("/dashboard");
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col min-h-0 flex-1">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleComplete();
        }}
        className="flex flex-col min-h-0 flex-1"
      >
        <div className="flex-1 min-h-0 overflow-y-auto">
      <button
        type="button"
        onClick={() => navigate("/onboarding/priorities")}
        className="inline-flex items-center gap-1 text-muted-foreground hover:text-foreground mb-6 min-h-[44px] cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4" /> Back
      </button>
      <h2 className="font-display text-2xl font-bold mb-2">Goals & intentions</h2>
      <p className="text-muted-foreground mb-6">
        Set your personal focus for this fasting journey. Optional but helps us tailor content.
      </p>
      {!preferences.hideHabitsFromOnboarding && (
        <div className="mb-6 p-4 rounded-xl border border-border bg-card">
          <h3 className="font-medium text-sm mb-1 flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-secondary" />
            Ramadan habits (Quran & hadith)
          </h3>
          <p className="text-xs text-muted-foreground mb-3">
            Learn good habits to follow and habits to avoid during Ramadan, with direct links to the Quran and hadith.
          </p>
          <Link
            to="/habits"
            className="inline-flex items-center gap-1 text-sm font-medium text-secondary hover:underline"
          >
            View habits page →
          </Link>
        </div>
      )}
      {state.mode === "muslim" && (
        <button
          type="button"
          onClick={handleComplete}
          className="w-full mb-6 py-2.5 px-4 rounded-xl border border-secondary/50 text-secondary font-medium text-sm hover:bg-secondary/10 transition-colors"
        >
          Skip — go to dashboard
        </button>
      )}

      <div className="space-y-2 mb-6">
        {(state.mode === "muslim" ? GOAL_OPTIONS_MUSLIM : GOAL_OPTIONS_NON_MUSLIM).map((g) => (
          <button
            key={g.label}
            type="button"
            onClick={() => toggleGoal(g.label)}
            className={`w-full min-h-[44px] p-4 rounded-xl border-2 text-left transition-all flex items-center gap-3 cursor-pointer touch-manipulation ${
              selectedGoals.includes(g.label) ? "border-secondary bg-secondary/5" : "border-border hover:border-secondary/50"
            }`}
          >
            <span className="text-2xl shrink-0" aria-hidden>{g.emoji}</span>
            <span className="flex-1">{g.label}</span>
            {selectedGoals.includes(g.label) && <Check className="w-5 h-5 text-secondary flex-shrink-0" />}
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

      <p className="mt-4 mb-2 text-sm text-muted-foreground">
        You&apos;re all set. When Ramadan begins, you&apos;ll see your dashboard with a countdown, daily tasks, and fasting timer.
      </p>
      <p className="mt-2 mb-2 text-xs text-muted-foreground">
        You can change prayer-time method and more in Settings after setup.
      </p>
        </div>

        <div className="sticky bottom-0 left-0 right-0 z-10 bg-background border-t border-border pt-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] -mx-4 px-4 mt-4 sm:static sm:border-0 sm:pt-0 sm:pb-0 sm:mx-0 sm:px-0 sm:mt-0">
          <button
            type="submit"
            className="w-full min-h-[44px] py-3 px-6 rounded-xl bg-primary text-primary-foreground font-medium hover:bg-primary/90 flex items-center justify-center gap-2 cursor-pointer"
          >
            Go to dashboard <Check className="w-5 h-5" />
          </button>
        </div>
      </form>
    </motion.div>
  );
}
