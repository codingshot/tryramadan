import { createContext, useContext, useState, useCallback, useEffect, ReactNode } from "react";
import { LocationResult } from "@/hooks/useLocation";

const ONBOARDING_DRAFT_KEY = "tryramadan-onboarding-draft";

export type OnboardingMode = "new" | "muslim" | null;

import type { LearningPriority, CultureRecipesPriority, QuranPriority } from "@/hooks/useLocalStorage";

export interface OnboardingPriorities {
  learningPriority: LearningPriority;
  cultureRecipesPriority: CultureRecipesPriority;
  quranPriority: QuranPriority;
  macroTrackingEnabled: boolean;
  simplifyByLocation: boolean;
}

export interface OnboardingState {
  mode: OnboardingMode;
  experience: string;
  knowledgeScore: number; // 0-5 from quiz
  healthWarnings: string[]; // e.g. ["diabetes", "pregnancy"]
  location: LocationResult | null;
  selectedProgram: string; // beginner | intermediate | traditional
  voluntaryFasting: string[]; // monday-thursday, ayyam-al-beed, etc.
  notifications: {
    suhoor: boolean;
    iftar: boolean;
    hydration: boolean;
    suhoorTime: string;
    iftarTime: string;
  };
  priorities: OnboardingPriorities;
  goals: string[];
  intention: string;
}

const defaultPriorities: OnboardingPriorities = {
  learningPriority: "moderate",
  cultureRecipesPriority: "some",
  quranPriority: "some",
  macroTrackingEnabled: false,
  simplifyByLocation: true,
};

const defaultState: OnboardingState = {
  mode: null,
  experience: "",
  knowledgeScore: 0,
  healthWarnings: [],
  location: null,
  selectedProgram: "traditional",
  voluntaryFasting: [],
  notifications: {
    suhoor: true,
    iftar: true,
    hydration: false,
    suhoorTime: "04:30",
    iftarTime: "18:30",
  },
  priorities: defaultPriorities,
  goals: [],
  intention: "",
};

type OnboardingContextValue = {
  state: OnboardingState;
  setMode: (mode: OnboardingMode) => void;
  setExperience: (exp: string) => void;
  setKnowledgeScore: (score: number) => void;
  setHealthWarnings: (warnings: string[] | ((prev: string[]) => string[])) => void;
  setLocation: (loc: LocationResult | null) => void;
  setSelectedProgram: (id: string) => void;
  setVoluntaryFasting: (ids: string[] | ((prev: string[]) => string[])) => void;
  setNotifications: (n: Partial<OnboardingState["notifications"]>) => void;
  setPriorities: (p: Partial<OnboardingPriorities>) => void;
  setGoals: (goals: string[]) => void;
  setIntention: (text: string) => void;
  reset: () => void;
  /** Persist current state to localStorage so it can be restored later. */
  saveDraft: () => void;
};

/** Load saved onboarding draft from localStorage, if any. Merges with defaults so missing/corrupt fields are safe. */
function loadDraft(): OnboardingState | null {
  try {
    const raw = typeof window !== "undefined" ? window.localStorage.getItem(ONBOARDING_DRAFT_KEY) : null;
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<OnboardingState>;
    if (!parsed || typeof parsed !== "object" || !(parsed.mode === null || parsed.mode === "new" || parsed.mode === "muslim")) return null;
    return {
      ...defaultState,
      ...parsed,
      healthWarnings: Array.isArray(parsed.healthWarnings) ? parsed.healthWarnings : defaultState.healthWarnings,
      voluntaryFasting: Array.isArray(parsed.voluntaryFasting) ? parsed.voluntaryFasting : defaultState.voluntaryFasting,
      priorities: parsed.priorities && typeof parsed.priorities === "object"
        ? { ...defaultPriorities, ...parsed.priorities }
        : defaultPriorities,
      notifications: parsed.notifications && typeof parsed.notifications === "object"
        ? { ...defaultState.notifications, ...parsed.notifications }
        : defaultState.notifications,
    };
  } catch {
    // ignore
  }
  return null;
}

/** Save onboarding state to localStorage. */
export function saveOnboardingDraft(state: OnboardingState): void {
  try {
    if (typeof window !== "undefined") {
      window.localStorage.setItem(ONBOARDING_DRAFT_KEY, JSON.stringify(state));
    }
  } catch {
    // ignore
  }
}

const OnboardingContext = createContext<OnboardingContextValue | null>(null);

export function OnboardingProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<OnboardingState>(() => loadDraft() ?? defaultState);

  const saveDraft = useCallback(() => {
    saveOnboardingDraft(state);
  }, [state]);

  const setMode = useCallback((mode: OnboardingMode) => {
    setState((s) => ({ ...s, mode }));
  }, []);
  const setExperience = useCallback((experience: string) => {
    setState((s) => ({ ...s, experience }));
  }, []);
  const setKnowledgeScore = useCallback((knowledgeScore: number) => {
    setState((s) => ({ ...s, knowledgeScore }));
  }, []);
  const setHealthWarnings = useCallback((healthWarnings: string[] | ((prev: string[]) => string[])) => {
    setState((s) => ({
      ...s,
      healthWarnings: typeof healthWarnings === "function" ? healthWarnings(s.healthWarnings) : healthWarnings,
    }));
  }, []);
  const setLocation = useCallback((location: LocationResult | null) => {
    setState((s) => ({ ...s, location }));
  }, []);
  const setSelectedProgram = useCallback((selectedProgram: string) => {
    setState((s) => ({ ...s, selectedProgram }));
  }, []);
  const setVoluntaryFasting = useCallback((voluntaryFasting: string[] | ((prev: string[]) => string[])) => {
    setState((s) => ({
      ...s,
      voluntaryFasting: typeof voluntaryFasting === "function" ? voluntaryFasting(s.voluntaryFasting) : voluntaryFasting,
    }));
  }, []);
  const setNotifications = useCallback((n: Partial<OnboardingState["notifications"]>) => {
    setState((s) => ({ ...s, notifications: { ...s.notifications, ...n } }));
  }, []);
  const setPriorities = useCallback((p: Partial<OnboardingPriorities>) => {
    setState((s) => ({ ...s, priorities: { ...s.priorities, ...p } }));
  }, []);
  const setGoals = useCallback((goals: string[]) => {
    setState((s) => ({ ...s, goals }));
  }, []);
  const setIntention = useCallback((intention: string) => {
    setState((s) => ({ ...s, intention }));
  }, []);
  const reset = useCallback(() => setState(defaultState), []);

  useEffect(() => {
    saveOnboardingDraft(state);
  }, [state]);

  const value: OnboardingContextValue = {
    state,
    setMode,
    setExperience,
    setKnowledgeScore,
    setHealthWarnings,
    setLocation,
    setSelectedProgram,
    setVoluntaryFasting,
    setNotifications,
    setPriorities,
    setGoals,
    setIntention,
    reset,
    saveDraft,
  };

  return (
    <OnboardingContext.Provider value={value}>
      {children}
    </OnboardingContext.Provider>
  );
}

export function useOnboarding() {
  const ctx = useContext(OnboardingContext);
  if (!ctx) throw new Error("useOnboarding must be used within OnboardingProvider");
  return ctx;
}
