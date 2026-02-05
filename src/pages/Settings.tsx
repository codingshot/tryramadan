import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { 
  ArrowLeft, MapPin, Bell, Moon, Sun, Trash2, Download, 
  ChevronRight, Check, Loader2, Monitor, Globe, Sunrise, Sunset,
  BookOpen, Utensils, BookMarked, Scale, Target, Droplets, Settings2, Trophy, Calendar
} from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { LocationSearch } from "@/components/LocationSearch";
import { LocationResult, getLocationFromIP, getTimezoneFromCoords } from "@/hooks/useLocation";
import { 
  useUserPreferences, 
  useFastingProgress, 
  useNotificationSettings,
  useLocalStorage,
  getQuickActionOrderFromPriorities,
  useDashboardQuickActions,
  defaultPreferences,
  defaultProgress,
  defaultNotificationSettings,
  getTotalHoursFasted,
  calculateStreak,
  getLongestStreak,
  getSunnahDaysCompleted,
  getSuggestedCalories,
  getRecommendedCaloriesFromPreferences,
  useDailyGoals,
  type LearningPriority,
  type CultureRecipesPriority,
  type QuranPriority,
  useIftarLabel,
  useIftarLabelShort,
  useDisplayTimezone,
} from "@/hooks/useLocalStorage";
import { getTodayStringInTimezone } from "@/lib/utils";
import { useNotifications } from "@/hooks/useNotifications";
import { PageSEO } from "@/components/PageSEO";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { LANGUAGE_OPTIONS, COUNTRY_OPTIONS } from "@/data/languages-and-countries";
import { getDefaultHydrationGoalMl, getHydrationUnit, ML_PER_US_CUP } from "@/lib/hydration";
import { getRamadanDayNumber, isRamadanDay, getRamadanDateRange } from "@/lib/ramadan";
import { useRamadanRange } from "@/hooks/useRamadanRange";
import { deleteAllUserData, clearJournalOnly, clearHealthDataOnly, clearLocationFromPreferences, saveBackupBeforeClear, TRYRAMADAN_LOCALSTORAGE_KEYS } from "@/lib/dataLifecycle";
import type { UserPreferences } from "@/hooks/useLocalStorage";

function RamadanDatesSection({
  preferences,
  setPreferences,
}: {
  preferences: UserPreferences;
  setPreferences: (v: UserPreferences | ((p: UserPreferences) => UserPreferences)) => void;
}) {
  const useAppCalendar = preferences.ramadanStartOverride == null && preferences.ramadanEndOverride == null;
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.35 }}
      className="p-6 rounded-2xl bg-card border border-border mb-6"
    >
      <h2 className="font-display font-bold mb-2 flex items-center gap-2">
        <Calendar className="w-5 h-5 text-secondary flex-shrink-0" />
        Ramadan dates
      </h2>
      <p className="text-sm text-muted-foreground mb-4">
        Moon sighting can shift the start by a day. Set dates here to match your locality.
      </p>
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <input
            type="radio"
            id="ramadan-use-app"
            name="ramadan-dates"
            checked={useAppCalendar}
            onChange={() => setPreferences({ ...preferences, ramadanStartOverride: null, ramadanEndOverride: null })}
            className="rounded-full"
          />
          <label htmlFor="ramadan-use-app" className="text-sm cursor-pointer">Use app&apos;s calendar (approximate)</label>
        </div>
        <div className="flex items-center gap-2">
          <input
            type="radio"
            id="ramadan-match-community"
            name="ramadan-dates"
            checked={!useAppCalendar}
            onChange={() => {
              if (useAppCalendar) {
                const { startStr, endStr } = getRamadanDateRange();
                setPreferences({ ...preferences, ramadanStartOverride: startStr, ramadanEndOverride: endStr });
              }
            }}
            className="rounded-full"
          />
          <label htmlFor="ramadan-match-community" className="text-sm cursor-pointer">Match my community</label>
        </div>
      </div>
      {!useAppCalendar && (
        <div className="mt-4 pt-4 border-t border-border grid gap-3 sm:grid-cols-2">
          <div>
            <label htmlFor="ramadan-start" className="text-sm font-medium block mb-1">Start date</label>
            <input
              id="ramadan-start"
              type="date"
              value={preferences.ramadanStartOverride ?? ""}
              onChange={(e) => setPreferences({ ...preferences, ramadanStartOverride: e.target.value || null })}
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label htmlFor="ramadan-end" className="text-sm font-medium block mb-1">End date</label>
            <input
              id="ramadan-end"
              type="date"
              value={preferences.ramadanEndOverride ?? ""}
              onChange={(e) => setPreferences({ ...preferences, ramadanEndOverride: e.target.value || null })}
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
            />
          </div>
        </div>
      )}
    </motion.div>
  );
}

const Settings = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [preferences, setPreferences] = useUserPreferences();
  const [progress, setProgress] = useFastingProgress();
  const displayTimezone = useDisplayTimezone();
  const ramadanRange = useRamadanRange();
  const todayStr = displayTimezone ? getTodayStringInTimezone(displayTimezone) : undefined;
  const [notifSettings, setNotifSettings] = useNotificationSettings();
  const [journalEntries] = useLocalStorage<Array<{ date: string; prompt?: string; content: string; gratitude?: string; mood?: number; createdAt?: string; updatedAt?: string }>>("tryramadan-journal", []);
  const iftarLabel = useIftarLabel();
  const iftarLabelShort = useIftarLabelShort();
  const [, setQuickActionOrder] = useDashboardQuickActions();
  const [, setDailyGoals] = useDailyGoals();
  const { permission, requestPermission, supported } = useNotifications();
  const [locationLoading, setLocationLoading] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [showExportPreview, setShowExportPreview] = useState(false);
  const [showClearAllConfirm, setShowClearAllConfirm] = useState(false);
  const [clearing, setClearing] = useState(false);
  const [showPartialDelete, setShowPartialDelete] = useState(false);
  const hydrationUnit = getHydrationUnit(preferences.country || "US");
  const effectiveGoalMl =
    preferences.hydrationGoalMl && preferences.hydrationGoalMl > 0
      ? preferences.hydrationGoalMl
      : getDefaultHydrationGoalMl(preferences.country || "US");

  const applyPrioritiesToDashboard = () => {
    setQuickActionOrder(getQuickActionOrderFromPriorities(preferences));
  };

  useEffect(() => {
    const id = location.hash.replace("#", "");
    if (id === "settings-notifications" || id === "settings-fasting-path") {
      const el = document.getElementById(id);
      el?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [location.hash]);
  
  const handleLocationSelect = async (location: LocationResult) => {
    let timezone: string | null = location.timezone ?? null;
    if (!timezone) {
      timezone = await getTimezoneFromCoords(location.lat, location.lng);
    }
    setPreferences({
      ...preferences,
      location: location.displayName,
      locationCoords: { lat: location.lat, lng: location.lng },
      timezone,
    });
  };
  
  const handleAutoDetect = async () => {
    setLocationLoading(true);
    const location = await getLocationFromIP();
    if (location) {
      handleLocationSelect(location);
    }
    setLocationLoading(false);
  };
  
  const handleEnableNotifications = async () => {
    const granted = await requestPermission();
    if (granted) setPreferences((prev) => ({ ...prev, notificationsEnabled: true }));
  };
  
  const handleThemeChange = (theme: 'light' | 'dark' | 'system') => {
    setPreferences({ ...preferences, theme });
    
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else if (theme === 'light') {
      document.documentElement.classList.remove('dark');
    } else {
      // System preference
      if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }
  };
  
  const handleResetProgress = () => {
    setProgress(defaultProgress);
    setShowResetConfirm(false);
  };
  
  const getExportData = () => ({
    preferences,
    progress,
    journal: journalEntries,
    notificationSettings: notifSettings,
    exportedAt: new Date().toISOString(),
  });

  const handleExportData = () => {
    const data = getExportData();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `tryramadan-data-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleOpenExportPreview = () => setShowExportPreview(true);
  const handleDownloadFromPreview = () => {
    handleExportData();
    setShowExportPreview(false);
  };

  const handleClearAllData = async () => {
    setClearing(true);
    const backup: Record<string, unknown> = {};
    for (const key of TRYRAMADAN_LOCALSTORAGE_KEYS) {
      try {
        const v = window.localStorage.getItem(key);
        if (v != null) backup[key] = JSON.parse(v);
      } catch {
        // skip
      }
    }
    saveBackupBeforeClear(backup);
    await deleteAllUserData();
    setShowClearAllConfirm(false);
    setClearing(false);
    navigate("/", { replace: true });
    window.location.reload();
  };

  const handleClearJournalOnly = () => {
    clearJournalOnly();
    setShowPartialDelete(false);
    navigate("/dashboard/journal", { replace: true });
    window.location.reload();
  };
  const handleClearHealthDataOnly = () => {
    clearHealthDataOnly();
    setShowPartialDelete(false);
    navigate("/dashboard/health", { replace: true });
    window.location.reload();
  };
  const handleClearLocation = () => {
    clearLocationFromPreferences();
    setPreferences({ ...preferences, location: "", locationCoords: null, timezone: null });
    setShowPartialDelete(false);
  };

  return (
    <div className="min-h-screen bg-background">
      <PageSEO
        title="Settings | TryRamadan.app"
        description={`TryRamadan.app settings: location for prayer times, notifications for suhoor and ${iftarLabelShort}, theme, and data export.`}
        path="/settings"
      />
      <Navbar />
      
      <main id="main-content" className="main-content">
        <div className="container mx-auto px-4 max-w-2xl min-w-0">
          <Link 
            to="/dashboard" 
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </Link>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <h1 className="text-2xl md:text-3xl font-display font-bold">
              Settings
            </h1>
          </motion.div>

          {/* Fasting path — mode (New/Muslim) & program */}
          <motion.div
            id="settings-fasting-path"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.02 }}
            className="p-6 rounded-2xl bg-card border border-border mb-6"
          >
            <h2 className="font-display font-bold mb-1 flex items-center gap-2 flex-wrap">
              <Moon className="w-5 h-5 text-secondary flex-shrink-0" />
              Fasting path
            </h2>
            <p className="text-sm text-muted-foreground mb-4">
              Choose how you&apos;re using the app. This affects labels (e.g. &quot;Iftar&quot; vs &quot;Breaking Fast&quot;) and content tone.
            </p>
            <div className="space-y-4">
              <fieldset className="space-y-2 border-0 p-0 m-0">
                <legend className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5 mb-2">Mode</legend>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => setPreferences({ ...preferences, userType: "new" })}
                    className={`min-h-[44px] flex-1 min-w-[120px] sm:min-w-0 px-4 py-3 rounded-xl border-2 text-left transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${
                      (preferences.userType ?? null) === "new"
                        ? "border-secondary bg-secondary/10 text-secondary"
                        : "border-border hover:border-secondary/50"
                    }`}
                    aria-pressed={(preferences.userType ?? null) === "new"}
                  >
                    <span className="font-semibold block">Non-Muslim</span>
                    <span className="text-xs text-muted-foreground">Learning & trying fasting</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setPreferences({ ...preferences, userType: "muslim" })}
                    className={`min-h-[44px] flex-1 min-w-[120px] sm:min-w-0 px-4 py-3 rounded-xl border-2 text-left transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${
                      preferences.userType === "muslim"
                        ? "border-secondary bg-secondary/10 text-secondary"
                        : "border-border hover:border-secondary/50"
                    }`}
                    aria-pressed={preferences.userType === "muslim"}
                  >
                    <span className="font-semibold block">Muslim</span>
                    <span className="text-xs text-muted-foreground">Full religious observance</span>
                  </button>
                </div>
              </fieldset>
              <fieldset className="space-y-2 border-0 p-0 m-0">
                <legend className="text-xs font-semibold text-muted-foreground mb-2 block">Program</legend>
                <div className="p-3 rounded-xl bg-muted/50 border border-border">
                  <span className="font-medium">Full Ramadan Fast</span>
                  <span className="text-muted-foreground text-sm ml-2">(dawn to sunset)</span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">This is the only program available right now.</p>
              </fieldset>
              <fieldset className="space-y-2 border-0 p-0 m-0">
                <legend className="text-xs font-semibold text-muted-foreground mb-2 block">Voluntary Sunnah fasting</legend>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <p className="text-xs text-muted-foreground mb-2 cursor-help border-b border-dotted border-transparent hover:border-muted-foreground/40 w-fit">Add optional Sunnah fasts (can be combined with Ramadan).</p>
                  </TooltipTrigger>
                  <TooltipContent side="bottom" className="max-w-xs">
                    Sunnah = voluntary fasts recommended by the Prophet (e.g. Monday & Thursday).
                  </TooltipContent>
                </Tooltip>
                <div className="space-y-2">
                  {[
                    { id: "monday-thursday", name: "Monday & Thursday", freq: "Weekly" },
                    { id: "ayyam-al-beed", name: "Ayyam al-Beed (13–15 of each month)", freq: "Monthly" },
                  ].map((opt) => {
                    const selected = (preferences.voluntaryFasting ?? []).includes(opt.id);
                    return (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => {
                          const curr = preferences.voluntaryFasting ?? [];
                          const next = selected ? curr.filter((x) => x !== opt.id) : [...curr, opt.id];
                          setPreferences({ ...preferences, voluntaryFasting: next });
                        }}
                        className={`w-full min-h-[44px] p-3 rounded-xl border-2 text-left transition-all flex items-center justify-between focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${
                          selected ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"
                        }`}
                        aria-pressed={selected}
                      >
                        <span className="text-sm font-medium">{opt.name}</span>
                        <span className="text-xs text-muted-foreground">{opt.freq}</span>
                      </button>
                    );
                  })}
                </div>
                <Link to="/programs" className="text-xs text-secondary hover:underline mt-2 inline-block">
                  Learn more about voluntary fasting →
                </Link>
              </fieldset>
            </div>
          </motion.div>

          {/* Your Priorities — personalize dashboard & features */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="p-6 rounded-2xl bg-gradient-to-br from-primary/5 to-secondary/5 border border-border mb-6"
          >
            <h2 className="font-display font-bold mb-1 flex items-center gap-2 flex-wrap">
              <Target className="w-5 h-5 text-secondary flex-shrink-0" />
              Your priorities
            </h2>
            <p className="text-sm text-muted-foreground mb-4">
              We prioritize your dashboard and simplify features based on this. Full access remains under Learn.
            </p>

            <div className="space-y-4">
              <fieldset className="space-y-2 border-0 p-0 m-0">
                <legend className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5 mb-2">
                  <BookOpen className="w-3.5 h-3.5" aria-hidden /> Learning
                </legend>
                <div className="flex flex-wrap gap-2">
                  {(["minimal", "moderate", "deep"] as LearningPriority[]).map((v) => (
                    <button
                      key={v}
                      type="button"
                      onClick={() => setPreferences({ ...preferences, learningPriority: v })}
                      className={`min-h-[44px] px-3 py-1.5 rounded-lg text-sm font-medium capitalize transition-colors border focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${
                        (preferences.learningPriority ?? "moderate") === v
                          ? "bg-secondary text-secondary-foreground border-secondary"
                          : "bg-muted/70 hover:bg-muted border-border text-foreground"
                      }`}
                      aria-pressed={(preferences.learningPriority ?? "moderate") === v}
                    >
                      {v}
                    </button>
                  ))}
                </div>
              </fieldset>

              <fieldset className="space-y-2 border-0 p-0 m-0">
                <legend className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5 mb-2">
                  <Utensils className="w-3.5 h-3.5" aria-hidden /> Culture & recipes
                </legend>
                <div className="flex flex-wrap gap-2">
                  {(["none", "some", "lots"] as CultureRecipesPriority[]).map((v) => (
                    <button
                      key={v}
                      type="button"
                      onClick={() => setPreferences({ ...preferences, cultureRecipesPriority: v })}
                      className={`min-h-[44px] px-3 py-1.5 rounded-lg text-sm font-medium capitalize transition-colors border focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${
                        (preferences.cultureRecipesPriority ?? "some") === v
                          ? "bg-secondary text-secondary-foreground border-secondary"
                          : "bg-muted/70 hover:bg-muted border-border text-foreground"
                      }`}
                      aria-pressed={(preferences.cultureRecipesPriority ?? "some") === v}
                    >
                      {v}
                    </button>
                  ))}
                </div>
              </fieldset>

              <fieldset className="space-y-2 border-0 p-0 m-0">
                <legend className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5 mb-2">
                  <BookMarked className="w-3.5 h-3.5" aria-hidden /> Quran & glossary
                </legend>
                <div className="flex flex-wrap gap-2">
                  {(["none", "some", "daily"] as QuranPriority[]).map((v) => (
                    <button
                      key={v}
                      type="button"
                      onClick={() => setPreferences({ ...preferences, quranPriority: v })}
                      className={`min-h-[44px] px-3 py-1.5 rounded-lg text-sm font-medium capitalize transition-colors border focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${
                        (preferences.quranPriority ?? "some") === v
                          ? "bg-secondary text-secondary-foreground border-secondary"
                          : "bg-muted/70 hover:bg-muted border-border text-foreground"
                      }`}
                      aria-pressed={(preferences.quranPriority ?? "some") === v}
                    >
                      {v}
                    </button>
                  ))}
                </div>
              </fieldset>

              <div className="flex flex-wrap items-center gap-4 pt-2">
                <div className="flex items-center gap-2">
                  <Scale className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm">Macro tracking</span>
                </div>
                <button
                  onClick={() => setPreferences({ ...preferences, macroTrackingEnabled: !(preferences.macroTrackingEnabled ?? false) })}
                  className={`min-h-[44px] px-3 py-1.5 rounded-lg text-sm font-medium transition-colors border ${
                    preferences.macroTrackingEnabled ? "bg-secondary text-secondary-foreground border-secondary" : "bg-muted/70 hover:bg-muted border-border text-foreground"
                  }`}
                >
                  {preferences.macroTrackingEnabled ? "On" : "Off"}
                </button>
              </div>

              <div className="flex flex-wrap items-center gap-4">
                <span className="text-sm">Simplify by location</span>
                <button
                  onClick={() => setPreferences({ ...preferences, simplifyByLocation: !(preferences.simplifyByLocation ?? true) })}
                  className={`min-h-[44px] px-3 py-1.5 rounded-lg text-sm font-medium transition-colors border ${
                    preferences.simplifyByLocation ? "bg-secondary text-secondary-foreground border-secondary" : "bg-muted/70 hover:bg-muted border-border text-foreground"
                  }`}
                >
                  {preferences.simplifyByLocation ? "On" : "Off"}
                </button>
              </div>
            </div>

            <button
              onClick={applyPrioritiesToDashboard}
              className="mt-4 w-full min-h-[44px] py-2.5 rounded-xl border-2 border-secondary/50 text-secondary hover:bg-secondary/10 font-medium text-sm flex items-center justify-center gap-2"
            >
              <Target className="w-4 h-4" />
              Apply to dashboard quick access
            </button>
          </motion.div>

          {/* Gender & menstruation — personalization and excused fasting days */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.07 }}
            className="p-6 rounded-2xl bg-card border border-border mb-6"
          >
            <h2 className="font-display font-bold mb-1 flex items-center gap-2 flex-wrap">
              <Settings2 className="w-5 h-5 text-secondary flex-shrink-0" />
              Gender & wellness
            </h2>
            <p className="text-sm text-muted-foreground mb-4">
              Optional. Used for calorie estimates and, for women, menstruation pattern tracking so you can easily mark excused fasting days. Data stays on this device.
            </p>
            <div className="space-y-4">
              <div>
                <p className="text-xs font-semibold text-muted-foreground mb-2">Gender</p>
                <div className="flex flex-wrap gap-2">
                  {(['female', 'male', null] as const).map((value) => {
                    const label = value === null ? "Prefer not to say" : value === "male" ? "Male" : "Female";
                    const isSelected = (preferences.gender ?? null) === value;
                    return (
                      <button
                        key={value ?? "none"}
                        type="button"
                        onClick={() => {
                          setPreferences({ 
                            ...preferences, 
                            gender: value,
                            sexForCalories: value,
                            ...(value === "female" ? {} : { menstruationTrackingEnabled: false }),
                          });
                          setDailyGoals((g) => ({ ...g, calories: getSuggestedCalories(value, preferences.bodyWeightKg ?? null) }));
                        }}
                        className={`min-h-[44px] px-3 py-1.5 rounded-lg text-sm font-medium transition-colors border ${
                          isSelected ? "bg-secondary text-secondary-foreground border-secondary" : "bg-muted/70 hover:bg-muted border-border text-foreground"
                        }`}
                      >
                        {label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Menstruation pattern (female only) */}
              {preferences.gender === "female" && (
                <div className="p-4 rounded-xl bg-muted/50 border border-border space-y-4">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-secondary" />
                      Menstruation pattern
                    </p>
                    <button
                      type="button"
                      onClick={() => setPreferences({ ...preferences, menstruationTrackingEnabled: !(preferences.menstruationTrackingEnabled ?? false) })}
                      className={`min-h-[44px] px-3 py-1.5 rounded-lg text-sm font-medium transition-colors border ${
                        preferences.menstruationTrackingEnabled ? "bg-secondary text-secondary-foreground border-secondary" : "bg-muted/70 hover:bg-muted border-border text-foreground"
                      }`}
                    >
                      {preferences.menstruationTrackingEnabled ? "On" : "Off"}
                    </button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    We&apos;ll predict your excused fasting days during Ramadan. Tradition recognises these days as exempt—no guilt. You can still log them as &quot;I didn&apos;t fast today&quot; or use the break-fast reason.
                  </p>
                  {preferences.menstruationTrackingEnabled && (
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label htmlFor="menstruation-cycle" className="text-xs font-semibold text-muted-foreground block mb-1">Cycle length (days)</label>
                        <input
                          id="menstruation-cycle"
                          type="number"
                          min={21}
                          max={45}
                          value={preferences.menstruationCycleDays ?? 28}
                          onChange={(e) => {
                            const v = parseInt(e.target.value, 10);
                            if (!Number.isNaN(v) && v >= 21 && v <= 45) {
                              setPreferences({ ...preferences, menstruationCycleDays: v });
                            }
                          }}
                          className="w-full min-h-[44px] px-3 rounded-lg border border-border bg-background text-sm"
                        />
                      </div>
                      <div>
                        <label htmlFor="menstruation-period" className="text-xs font-semibold text-muted-foreground block mb-1">Period length (days)</label>
                        <input
                          id="menstruation-period"
                          type="number"
                          min={1}
                          max={14}
                          value={preferences.menstruationPeriodDays ?? 5}
                          onChange={(e) => {
                            const v = parseInt(e.target.value, 10);
                            if (!Number.isNaN(v) && v >= 1 && v <= 14) {
                              setPreferences({ ...preferences, menstruationPeriodDays: v });
                            }
                          }}
                          className="w-full min-h-[44px] px-3 rounded-lg border border-border bg-background text-sm"
                        />
                      </div>
                      <div>
                        <label htmlFor="menstruation-last" className="text-xs font-semibold text-muted-foreground block mb-1">Last period start</label>
                        <input
                          id="menstruation-last"
                          type="date"
                          value={preferences.menstruationLastStartDate ?? ""}
                          onChange={(e) => setPreferences({ ...preferences, menstruationLastStartDate: e.target.value || null })}
                          className="w-full min-h-[44px] px-3 rounded-lg border border-border bg-background text-sm"
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}

              <div>
                <label htmlFor="settings-body-weight" className="text-xs font-semibold text-muted-foreground block mb-2">Body weight (kg)</label>
                <input
                  id="settings-body-weight"
                  type="number"
                  min={20}
                  max={300}
                  step={0.5}
                  placeholder="e.g. 70"
                  className="w-full max-w-[120px] min-h-[44px] px-3 rounded-lg border border-border bg-background text-foreground text-sm"
                  value={preferences.bodyWeightKg != null && preferences.bodyWeightKg > 0 ? String(preferences.bodyWeightKg) : ""}
                  onChange={(e) => {
                    const v = e.target.value.trim();
                    const num = v === "" ? null : parseFloat(v);
                    const bodyWeightKg = num != null && !Number.isNaN(num) && num > 0 ? num : null;
                    setPreferences({ ...preferences, bodyWeightKg });
                    setDailyGoals((g) => ({ ...g, calories: getSuggestedCalories(preferences.sexForCalories ?? null, bodyWeightKg) }));
                  }}
                />
                <p className="text-xs text-muted-foreground mt-1">Optional. With gender, used to suggest daily calories in the macro tracker.</p>
              </div>
              {((preferences.sexForCalories != null) || (preferences.bodyWeightKg != null && preferences.bodyWeightKg > 0)) && (
                <p className="text-xs text-muted-foreground">
                  Recommended daily calories: <strong className="text-foreground">{getRecommendedCaloriesFromPreferences(preferences)}</strong> cal (applied to your macro goal).
                </p>
              )}
            </div>
          </motion.div>
          
          {/* Location Settings */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="p-6 rounded-2xl bg-card border border-border mb-6"
          >
            <h2 className="font-display font-bold mb-4 flex items-center gap-2 flex-wrap">
              <MapPin className="w-5 h-5 text-secondary flex-shrink-0" />
              Location
            </h2>
            
            <p className="text-sm text-muted-foreground mb-4">
              Your location is used to calculate accurate prayer and fasting times. Changing location updates prayer and iftar times everywhere in the app.
            </p>

            <p className="text-xs font-semibold text-muted-foreground mb-2">Current location</p>
            {preferences.location ? (
              <div className="p-3 rounded-xl bg-secondary/10 border border-secondary/30 mb-4 flex items-center gap-3" title={preferences.location}>
                <MapPin className="w-5 h-5 text-secondary flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{preferences.location.split(',')[0]}</p>
                  <p className="text-xs text-muted-foreground truncate">{preferences.location}</p>
                </div>
                <Check className="w-5 h-5 text-secondary flex-shrink-0" />
              </div>
            ) : (
              <p className="text-sm text-muted-foreground mb-4 py-3 px-3 rounded-xl bg-muted/50 border border-border">
                No location set. Search below or use Auto-detect.
              </p>
            )}
            <label htmlFor="location-search" className="sr-only">
              Search for a city to set prayer times location
            </label>
            <LocationSearch
              value=""
              onSelect={handleLocationSelect}
              placeholder="Search for a different city..."
            />
            
            <button
              onClick={handleAutoDetect}
              disabled={locationLoading}
              className="mt-3 w-full min-h-[44px] flex items-center justify-center gap-2 p-3 rounded-xl text-sm text-secondary hover:bg-secondary/10 transition-colors border border-border disabled:opacity-50"
            >
              {locationLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <MapPin className="w-4 h-4" />
              )}
              Auto-detect my location
            </button>
          </motion.div>

          {/* Language & region */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="p-6 rounded-2xl bg-card border border-border mb-6"
          >
            <h2 className="font-display font-bold mb-4 flex items-center gap-2 flex-wrap">
              <Globe className="w-5 h-5 text-secondary flex-shrink-0" />
              Language & region
            </h2>
            <p className="text-sm text-muted-foreground mb-4">
              Display preference. Location above is used for prayer times.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="settings-country" className="text-xs font-medium text-muted-foreground block mb-2">
                  Country
                </label>
                <Select
                  value={preferences.country ?? "US"}
                  onValueChange={(v) => setPreferences({ ...preferences, country: v })}
                >
                  <SelectTrigger id="settings-country" className="w-full" aria-label="Select country">
                    <SelectValue placeholder="Select country" />
                  </SelectTrigger>
                  <SelectContent>
                    {COUNTRY_OPTIONS.map((c) => (
                      <SelectItem key={c.value} value={c.value}>
                        <span className="inline-flex items-center gap-2">
                          <span aria-hidden>{c.flag}</span>
                          {c.label}
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label htmlFor="settings-language" className="text-xs font-medium text-muted-foreground block mb-2">
                  Language
                </label>
                <Select
                  value={preferences.language ?? "en"}
                  onValueChange={(v) => setPreferences({ ...preferences, language: v })}
                >
                  <SelectTrigger id="settings-language" className="w-full" aria-label="Select language">
                    <SelectValue placeholder="Select language" />
                  </SelectTrigger>
                  <SelectContent>
                    {LANGUAGE_OPTIONS.map((lang) => (
                      <SelectItem key={lang.value} value={lang.value}>
                        <span className="inline-flex items-center gap-2">
                          <span aria-hidden>{lang.flag}</span>
                          {lang.label}
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </motion.div>
          
          {/* Notification Settings */}
          <motion.div
            id="settings-notifications"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="p-6 rounded-2xl bg-card border border-border mb-6 scroll-mt-24"
          >
            <h2 className="font-display font-bold mb-4 flex items-center gap-2 flex-wrap">
              <Bell className="w-5 h-5 text-secondary flex-shrink-0" />
              Notifications
            </h2>
            
            {!supported ? (
              <p className="text-sm text-muted-foreground">
                Notifications are not supported in your browser.
              </p>
            ) : permission === 'granted' ? (
              <>
                <div className="p-3 rounded-xl bg-secondary/10 border border-secondary/30 mb-4 flex items-center gap-2">
                  <Check className="w-5 h-5 text-secondary" />
                  <span className="text-sm">Notifications enabled</span>
                </div>
                
                <div className="space-y-3">
                  <label className="flex flex-wrap items-center justify-between gap-2 p-3 rounded-xl bg-muted/50">
                    <span className="text-sm flex items-center gap-2">
                      <Sunrise className="w-4 h-4 text-secondary" aria-hidden />
                      Suhoor reminder (morning meal)
                    </span>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min={5}
                        max={120}
                        value={notifSettings.suhoorMinutesBefore}
                        onChange={(e) => setNotifSettings({ ...notifSettings, suhoorMinutesBefore: Math.max(5, Math.min(120, Number(e.target.value) || 30)) })}
                        className="w-14 rounded border border-border bg-background px-2 py-1 text-sm tabular-nums"
                      />
                      <span className="text-xs text-muted-foreground">min before</span>
                      <input
                        type="checkbox"
                        checked={notifSettings.suhoorEnabled}
                        onChange={(e) => setNotifSettings({ ...notifSettings, suhoorEnabled: e.target.checked })}
                        className="rounded"
                      />
                    </div>
                  </label>
                  <p className="text-xs text-muted-foreground px-1">Notify before Imsak (suhoor ends). Uses today&apos;s prayer times.</p>
                  
                  <label className="flex flex-wrap items-center justify-between gap-2 p-3 rounded-xl bg-muted/50">
                    <span className="text-sm flex items-center gap-2">
                      <Sunset className="w-4 h-4 text-secondary" aria-hidden />
                      {iftarLabel} reminder (evening meal)
                    </span>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min={5}
                        max={120}
                        value={notifSettings.iftarMinutesBefore}
                        onChange={(e) => setNotifSettings({ ...notifSettings, iftarMinutesBefore: Math.max(5, Math.min(120, Number(e.target.value) || 15)) })}
                        className="w-14 rounded border border-border bg-background px-2 py-1 text-sm tabular-nums"
                      />
                      <span className="text-xs text-muted-foreground">min before</span>
                      <input
                        type="checkbox"
                        checked={notifSettings.iftarEnabled}
                        onChange={(e) => setNotifSettings({ ...notifSettings, iftarEnabled: e.target.checked })}
                        className="rounded"
                      />
                    </div>
                  </label>
                  <p className="text-xs text-muted-foreground px-1">Notify before Maghrib ({iftarLabelShort}). Plus one at {iftarLabelShort} time. Uses today&apos;s prayer times.</p>
                </div>
              </>
            ) : (
              <button
                onClick={handleEnableNotifications}
                className="w-full min-h-[44px] py-3 rounded-xl bg-secondary text-secondary-foreground font-medium"
              >
                Enable Notifications
              </button>
            )}
          </motion.div>

          {/* Hydration */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="p-6 rounded-2xl bg-card border border-border mb-6"
          >
            <h2 className="font-display font-bold mb-4 flex items-center gap-2 flex-wrap">
              <Droplets className="w-5 h-5 text-blue-500 flex-shrink-0" aria-hidden />
              Hydration
            </h2>
            <p className="text-sm text-muted-foreground mb-4">
              Daily water goal and reminders during non-fasting hours. Default goal is based on your selected region.
            </p>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium block mb-2">Daily goal</label>
                <div className="flex flex-wrap items-center gap-2">
                  <input
                    type="number"
                    min={1}
                    max={hydrationUnit === "cups" ? 20 : 5}
                    step={hydrationUnit === "cups" ? 1 : 0.5}
                    value={
                      hydrationUnit === "cups"
                        ? Math.round((effectiveGoalMl || getDefaultHydrationGoalMl(preferences.country || "US")) / ML_PER_US_CUP)
                        : (effectiveGoalMl || getDefaultHydrationGoalMl(preferences.country || "US")) / 1000
                    }
                    onChange={(e) => {
                      const v = Number(e.target.value);
                      if (isNaN(v)) return;
                      const ml = hydrationUnit === "cups" ? Math.round(v * ML_PER_US_CUP) : Math.round(v * 1000);
                      setPreferences({ ...preferences, hydrationGoalMl: Math.max(500, Math.min(5000, ml)) });
                    }}
                    className="w-24 rounded-lg border border-border bg-background px-3 py-2 text-sm tabular-nums"
                  />
                  <span className="text-sm text-muted-foreground">{hydrationUnit === "cups" ? "cups" : "L"}</span>
                  <button
                    type="button"
                    onClick={() => setPreferences({ ...preferences, hydrationGoalMl: 0 })}
                    className="text-xs text-muted-foreground hover:text-foreground underline"
                  >
                    Reset to region default
                  </button>
                </div>
              </div>
              <div className="flex items-center gap-2 p-3 rounded-xl bg-muted/50">
                <input
                  type="checkbox"
                  id="hydration-reminder"
                  checked={preferences.hydrationReminderEnabled ?? false}
                  onChange={(e) => setPreferences({ ...preferences, hydrationReminderEnabled: e.target.checked })}
                  className="rounded"
                />
                <label htmlFor="hydration-reminder" className="text-sm">Remind me to log water during non-fasting hours</label>
              </div>
              {preferences.hydrationReminderEnabled && (
                <div>
                  <label className="text-sm font-medium block mb-2">Reminder times (HH:mm)</label>
                  <div className="flex flex-wrap gap-2">
                    {(preferences.hydrationReminderTimes ?? ["12:00", "15:00", "19:00"]).map((t, i) => (
                      <input
                        key={i}
                        type="time"
                        value={t}
                        onChange={(e) => {
                          const next = [...(preferences.hydrationReminderTimes ?? ["12:00", "15:00", "19:00"])];
                          next[i] = e.target.value;
                          setPreferences({ ...preferences, hydrationReminderTimes: next });
                        }}
                        className="rounded-lg border border-border bg-background px-3 py-2 text-sm"
                      />
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">Notifications fire at these times (when app is open). Set times during {iftarLabelShort}/suhoor window.</p>
                </div>
              )}
            </div>
          </motion.div>
          
          {/* Theme Settings */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="p-6 rounded-2xl bg-card border border-border mb-6"
          >
            <h2 className="font-display font-bold mb-4 flex items-center gap-2 flex-wrap">
              <Sun className="w-5 h-5 text-secondary flex-shrink-0" />
              Theme
            </h2>
            
            <div className="flex gap-2">
              {[
                { id: 'light', label: 'Light', icon: Sun },
                { id: 'dark', label: 'Dark', icon: Moon },
                { id: 'system', label: 'System', icon: Monitor },
              ].map((theme) => {
                const Icon = theme.icon;
                return (
                  <button
                    key={theme.id}
                    onClick={() => handleThemeChange(theme.id as 'light' | 'dark' | 'system')}
                    className={`flex-1 min-h-[44px] p-3 rounded-xl border-2 transition-all flex flex-col items-center gap-2 ${
                      preferences.theme === theme.id 
                        ? 'border-secondary bg-secondary/10 text-foreground' 
                        : 'border-border hover:border-secondary/50 text-foreground'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="text-sm">{theme.label}</span>
                  </button>
                );
              })}
            </div>
          </motion.div>
          
          {/* Progress & achievements */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
            className="p-6 rounded-2xl bg-card border border-border mb-6"
          >
            <h2 className="font-display font-bold mb-4 flex items-center gap-2 flex-wrap">
              <Trophy className="w-5 h-5 text-secondary flex-shrink-0" />
              Progress & achievements
            </h2>
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="font-medium text-sm">Show streak and achievements</p>
                <p className="text-xs text-muted-foreground mt-0.5">Show streak counter and achievement badges. Turn off for a simpler view.</p>
              </div>
              <Switch
                checked={preferences.showStreakAndAchievements !== false}
                onCheckedChange={(checked) => setPreferences({ ...preferences, showStreakAndAchievements: checked })}
                aria-label="Show streak and achievements"
              />
            </div>
          </motion.div>

          {/* Ramadan dates (match community) */}
          <RamadanDatesSection preferences={preferences} setPreferences={setPreferences} />

          {/* Data & privacy */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
            className="p-6 rounded-2xl bg-muted/30 border border-border mb-6"
          >
            <h2 className="font-display font-bold mb-3">Data &amp; privacy</h2>
            <p className="text-sm text-muted-foreground mb-2">
              Your data stays on this device. TryRamadan stores journal, fasting history, meal plans, and preferences locally. Nothing is sent to our servers.
            </p>
            <p className="text-sm text-muted-foreground mb-2">
              Your data stays until you delete it or clear browser data. Anyone with access to this device (or browser extensions) could read it. For sensitive entries, avoid shared or public devices.
            </p>
            <Link to="/privacy" className="text-sm text-secondary hover:underline">
              Privacy policy →
            </Link>
            <div className="mt-4 pt-4 border-t border-border">
              <label className="text-sm font-medium block mb-2">Auto-delete journals older than</label>
              <Select
                value={String(preferences.journalRetentionDays ?? "keep")}
                onValueChange={(v) =>
                  setPreferences({
                    ...preferences,
                    journalRetentionDays: v === "keep" ? null : parseInt(v, 10),
                  })
                }
              >
                <SelectTrigger className="w-full max-w-[200px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="keep">Keep forever</SelectItem>
                  <SelectItem value="30">30 days</SelectItem>
                  <SelectItem value="90">90 days</SelectItem>
                  <SelectItem value="365">1 year</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground mt-1">
                Optional. Older journal entries are removed when you visit the Journal page.
              </p>
            </div>
            <div className="mt-4 pt-4 border-t border-border">
              <label className="text-sm font-medium block mb-2">Auto-delete wellness check-ins older than</label>
              <Select
                value={String(preferences.wellnessRetentionDays ?? "keep")}
                onValueChange={(v) =>
                  setPreferences({
                    ...preferences,
                    wellnessRetentionDays: v === "keep" ? null : parseInt(v, 10),
                  })
                }
              >
                <SelectTrigger className="w-full max-w-[200px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="keep">Keep forever</SelectItem>
                  <SelectItem value="30">30 days</SelectItem>
                  <SelectItem value="90">90 days</SelectItem>
                  <SelectItem value="365">1 year</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground mt-1">
                Applied when you visit the Health page.
              </p>
            </div>
            <div className="mt-4 pt-4 border-t border-border">
              <label className="text-sm font-medium block mb-2">Auto-delete symptom logs older than</label>
              <Select
                value={String(preferences.symptomRetentionDays ?? "keep")}
                onValueChange={(v) =>
                  setPreferences({
                    ...preferences,
                    symptomRetentionDays: v === "keep" ? null : parseInt(v, 10),
                  })
                }
              >
                <SelectTrigger className="w-full max-w-[200px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="keep">Keep forever</SelectItem>
                  <SelectItem value="30">30 days</SelectItem>
                  <SelectItem value="90">90 days</SelectItem>
                  <SelectItem value="365">1 year</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground mt-1">
                Applied when you visit the Health page.
              </p>
            </div>
          </motion.div>

          {/* Data Management */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="p-6 rounded-2xl bg-card border border-border"
          >
            <h2 className="font-display font-bold mb-4">
              Data Management
            </h2>
            
            <div className="space-y-3">
              <button
                onClick={handleOpenExportPreview}
                className="w-full min-h-[44px] flex items-center justify-between p-3 rounded-xl bg-muted/50 hover:bg-muted border border-border transition-colors text-foreground"
              >
                <div className="flex items-center gap-3">
                  <Download className="w-5 h-5 text-foreground" />
                  <span className="text-sm">Export my data</span>
                </div>
                <ChevronRight className="w-4 h-4 text-foreground" />
              </button>
              
              <button
                onClick={() => setShowResetConfirm(true)}
                className="w-full min-h-[44px] flex items-center justify-between p-3 rounded-xl bg-destructive/10 hover:bg-destructive/20 border border-destructive/30 transition-colors text-destructive"
              >
                <div className="flex items-center gap-3">
                  <Trash2 className="w-5 h-5" />
                  <span className="text-sm">Reset all progress</span>
                </div>
                <ChevronRight className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={() => setShowPartialDelete(!showPartialDelete)}
                className="w-full min-h-[44px] flex items-center justify-between p-3 rounded-xl bg-muted/50 hover:bg-muted border border-border transition-colors text-foreground"
              >
                <span className="text-sm">Clear specific data</span>
                <ChevronRight className={`w-4 h-4 transition-transform ${showPartialDelete ? "rotate-90" : ""}`} />
              </button>
              {showPartialDelete && (
                <div className="mt-2 p-3 rounded-xl bg-muted/30 border border-border space-y-2">
                  <button
                    type="button"
                    onClick={handleClearJournalOnly}
                    className="w-full min-h-[44px] px-3 py-2 rounded-lg border border-border hover:bg-destructive/10 hover:border-destructive/30 text-sm"
                  >
                    Clear journal only
                  </button>
                  <button
                    type="button"
                    onClick={handleClearHealthDataOnly}
                    className="w-full min-h-[44px] px-3 py-2 rounded-lg border border-border hover:bg-destructive/10 hover:border-destructive/30 text-sm"
                  >
                    Clear health data (wellness & symptoms)
                  </button>
                  <button
                    type="button"
                    onClick={handleClearLocation}
                    className="w-full min-h-[44px] px-3 py-2 rounded-lg border border-border hover:bg-muted text-sm"
                  >
                    Clear location (keeps rest of preferences)
                  </button>
                </div>
              )}

              <button
                onClick={() => setShowClearAllConfirm(true)}
                disabled={clearing}
                className="w-full min-h-[44px] flex items-center justify-between p-3 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 transition-colors text-amber-700 dark:text-amber-400"
              >
                <div className="flex items-center gap-3">
                  {clearing ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <Trash2 className="w-5 h-5" />
                  )}
                  <span className="text-sm font-medium">Clear all data</span>
                </div>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
            
            {showResetConfirm && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-4 p-4 rounded-xl bg-destructive/10 border border-destructive/30"
              >
                <p className="text-sm font-medium mb-3">Are you sure? This will delete all your fasting progress.</p>
                <div className="rounded-lg bg-background/80 border border-border p-3 mb-4 text-sm">
                  <p className="font-semibold text-muted-foreground mb-2">Current progress (will be lost)</p>
                  <ul className="space-y-1 text-muted-foreground">
                    <li>Completed days: <span className="font-medium text-foreground">{progress.completedDays?.length ?? 0}</span></li>
                    <li>Current day: <span className="font-medium text-foreground">{ramadanRange.isRamadanDay(new Date()) ? ramadanRange.getRamadanDayNumber(new Date()) ?? progress.currentDay ?? 1 : progress.currentDay ?? 1}</span> of {ramadanRange.totalDays ?? 30}</li>
                    <li>Current streak: <span className="font-medium text-foreground">{calculateStreak(progress, todayStr)}</span> days</li>
                    <li>Longest streak: <span className="font-medium text-foreground">{getLongestStreak(progress)}</span> days</li>
                    <li>Total hours fasted: <span className="font-medium text-foreground">{getTotalHoursFasted(progress).toFixed(1)}</span>h</li>
                    <li>Sunnah days completed: <span className="font-medium text-foreground">{getSunnahDaysCompleted(progress)}</span></li>
                    {(progress.fastingLog?.length ?? 0) > 0 && (
                      <li>Fasting log entries: <span className="font-medium text-foreground">{progress.fastingLog?.length ?? 0}</span></li>
                    )}
                  </ul>
                </div>
                <div className="flex flex-col gap-2">
                  <button
                    type="button"
                    onClick={() => setShowExportPreview(true)}
                    className="w-full min-h-[44px] py-2 rounded-lg border-2 border-secondary/50 text-secondary hover:bg-secondary/10 text-sm font-medium flex items-center justify-center gap-2"
                  >
                    <Download className="w-4 h-4" />
                    Download progress (backup before reset)
                  </button>
                  <div className="flex gap-2">
                    <button
                      onClick={handleResetProgress}
                      className="flex-1 min-h-[44px] py-2 rounded-lg bg-destructive text-destructive-foreground text-sm font-medium"
                    >
                      Yes, reset everything
                    </button>
                    <button
                      onClick={() => setShowResetConfirm(false)}
                      className="flex-1 min-h-[44px] py-2 rounded-lg bg-muted border border-border text-foreground text-sm font-medium"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </motion.div>
            )}

            {showClearAllConfirm && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-4 p-4 rounded-xl bg-amber-500/10 border border-amber-500/30"
              >
                <p className="text-sm font-medium mb-3">
                  This will permanently delete all your data from this device: journal entries, fasting history, meal plans, preferences, and cached content. You cannot undo this.
                </p>
                <p className="text-sm text-muted-foreground mb-4">
                  Export your data first if you want a backup. The app will reload on the home page after clearing.
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={handleClearAllData}
                    disabled={clearing}
                    className="flex-1 min-h-[44px] py-2 rounded-lg bg-amber-600 text-white text-sm font-medium flex items-center justify-center gap-2 disabled:opacity-70"
                  >
                    {clearing ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                    Yes, clear everything
                  </button>
                  <button
                    onClick={() => setShowClearAllConfirm(false)}
                    disabled={clearing}
                    className="flex-1 min-h-[44px] py-2 rounded-lg bg-muted border border-border text-foreground text-sm font-medium"
                  >
                    Cancel
                  </button>
                </div>
              </motion.div>
            )}
          </motion.div>
        </div>
      </main>
      
      <Footer />

      <Dialog open={showExportPreview} onOpenChange={setShowExportPreview}>
        <DialogContent className="max-w-2xl max-h-[85vh] flex flex-col gap-4">
          <DialogHeader>
            <DialogTitle>Export preview</DialogTitle>
            <DialogDescription>
              Review the data below. Click Download to save as a JSON file.
            </DialogDescription>
          </DialogHeader>
          <div className="flex-1 min-h-[200px] overflow-auto rounded-lg border border-border bg-muted/30 p-3">
            <pre className="text-xs text-foreground whitespace-pre-wrap break-words font-mono">
              {JSON.stringify(getExportData(), null, 2)}
            </pre>
          </div>
          <DialogFooter className="flex-row gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowExportPreview(false)}
            >
              Close
            </Button>
            <Button
              type="button"
              onClick={handleDownloadFromPreview}
              className="gap-2"
            >
              <Download className="w-4 h-4" />
              Download JSON
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Settings;
