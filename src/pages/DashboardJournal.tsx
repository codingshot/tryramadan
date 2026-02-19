import { useState, useMemo, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useSearchParams } from "react-router-dom";
import {
  ArrowLeft,
  BookOpen,
  PenLine,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
  Download,
  Calendar as CalendarIcon,
  Smile,
  Trash2,
  CheckSquare,
  Search,
  SlidersHorizontal,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { useLocalStorage, useUserPreferences, useHabitLog } from "@/hooks/useLocalStorage";
import { Clock } from "lucide-react";
import { getHabitsForUser, getShortLabelsForHabitIds } from "@/data/ramadan-habits";
import { OPTIONAL_PRAYERS } from "@/data/optionalPrayers";
import { isRamadanDay } from "@/lib/ramadan";
import { Calendar } from "@/components/ui/calendar";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { PageSEO } from "@/components/PageSEO";

/** Journal slot: time-of-day for better tracking. Entries without slot = "general" (backward compat). */
export type JournalSlot = "morning" | "suhoor" | "iftar" | "general";

export interface JournalEntry {
  date: string;
  prompt: string;
  content: string;
  gratitude?: string;
  mood?: number; // 1-5
  /** Time-of-day slot. morning=intention/to-do, suhoor=pre-dawn, iftar=evening, general=reflection */
  slot?: JournalSlot;
  /** Set on first save (QA doc: timeline / last edited) */
  createdAt?: string;
  /** Set on every save */
  updatedAt?: string;
}

const SLOT_LABELS: Record<JournalSlot, string> = {
  morning: "Morning (intention / to-do)",
  suhoor: "Suhoor",
  iftar: "Iftar",
  general: "Reflection",
};

const PROMPTS_MUSLIM = [
  "What did you learn about yourself today while fasting?",
  "How did you feel at suhoor vs iftar?",
  "One thing you're grateful for today.",
  "A small act of kindness you gave or received.",
  "What would you tell someone new to fasting?",
  "How did today's fast change your perspective?",
  "What intention will you carry into tomorrow?",
];

const PROMPTS_NON_MUSLIM = [
  "What did you learn about yourself today while fasting?",
  "How did you feel in the morning (before the fast) vs when you broke your fast?",
  "One thing you're grateful for today.",
  "A small act of kindness you gave or received.",
  "What would you tell someone new to fasting?",
  "How did today's fast change your perspective?",
  "What intention will you carry into tomorrow?",
];

const SLOT_PROMPTS: Record<JournalSlot, Record<string, string>> = {
  morning: {
    muslim: "What's your intention or to-do for today?",
    "non-muslim": "What's your intention or to-do for today?",
  },
  suhoor: {
    muslim: "How did suhoor go? What did you eat?",
    "non-muslim": "How did your pre-dawn meal go? What did you eat?",
  },
  iftar: {
    muslim: "How did you feel breaking your fast?",
    "non-muslim": "How did you feel breaking your fast?",
  },
  general: {
    muslim: "", // use rotating prompt
    "non-muslim": "",
  },
};

const MOOD_LABELS = ["Low", "Okay", "Good", "Great", "Amazing"];
const MOOD_EMOJI = ["😢", "😐", "🙂", "😊", "😄"];

const GRATITUDE_QUICK_ADD = [
  "Family",
  "Health",
  "Food",
  "This moment",
  "Friends",
  "Faith",
  "Peace",
  "Community",
];

export function getPromptForDate(isoDate: string, userType?: string, slot?: JournalSlot): string {
  const u = userType === "muslim" ? "muslim" : "non-muslim";
  if (slot && slot !== "general") {
    const fixed = SLOT_PROMPTS[slot][u];
    if (fixed) return fixed;
  }
  const day = parseInt(isoDate.slice(8, 10), 10) || 1;
  const prompts = userType === "muslim" ? PROMPTS_MUSLIM : PROMPTS_NON_MUSLIM;
  return prompts[(day - 1) % prompts.length];
}

function isValidDateString(s: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(s)) return false;
  const d = new Date(s + "T12:00:00");
  return !isNaN(d.getTime()) && d.toISOString().startsWith(s);
}

/** Normalize stored value to array of valid entries so corrupted localStorage never throws. */
function safeJournalEntries(raw: unknown): JournalEntry[] {
  if (!Array.isArray(raw)) return [];
  return raw.filter(
    (e): e is JournalEntry =>
      e != null &&
      typeof e === "object" &&
      typeof (e as JournalEntry).date === "string" &&
      typeof (e as JournalEntry).content === "string"
  );
}

/** Normalize to record so corrupted localStorage never throws. */
function safeRecord<K extends string, V>(raw: unknown, defaultVal: Record<K, V>): Record<K, V> {
  if (raw !== null && typeof raw === "object" && !Array.isArray(raw)) return raw as Record<K, V>;
  return defaultVal;
}

export default function DashboardJournal() {
  const [searchParams] = useSearchParams();
  const [preferences] = useUserPreferences();
  const [storedEntries, setStoredEntries] = useLocalStorage<JournalEntry[]>("tryramadan-journal", []);
  const entries = useMemo(() => safeJournalEntries(storedEntries), [storedEntries]);
  const setEntries = useCallback(
    (value: JournalEntry[] | ((prev: JournalEntry[]) => JournalEntry[])) => {
      setStoredEntries(
        typeof value === "function"
          ? (raw: JournalEntry[]) => {
              const prev = safeJournalEntries(raw);
              const next = value(prev);
              return Array.isArray(next) ? next : [];
            }
          : Array.isArray(value) ? value : []
      );
    },
    [setStoredEntries]
  );
  const [storedHabitLog, setHabitLog] = useHabitLog();
  const habitLog = useMemo(() => safeRecord(storedHabitLog, {}), [storedHabitLog]);
  const [storedPrayerTracker, setPrayerTracker] = useLocalStorage<Record<string, Record<string, boolean>>>("tryramadan-prayer-tracker", {});
  const prayerTracker = useMemo(() => safeRecord(storedPrayerTracker, {}), [storedPrayerTracker]);
  const [storedTaraweehTracker, setTaraweehTracker] = useLocalStorage<Record<string, { done: boolean; rakats?: number }>>("tryramadan-taraweeh", {});
  const taraweehTracker = useMemo(() => safeRecord(storedTaraweehTracker, {}), [storedTaraweehTracker]);
  const today = new Date().toISOString().split("T")[0];
  const dateFromUrl = searchParams.get("date");
  const initialDate = dateFromUrl && isValidDateString(dateFromUrl) ? dateFromUrl : today;
  const trackableHabits = useMemo(
    () => getHabitsForUser(preferences.userType).filter((h) => h.type === "sunnah"),
    [preferences.userType]
  );

  const [writeDate, setWriteDate] = useState(initialDate);
  const [activeSlot, setActiveSlot] = useState<JournalSlot>("general");
  const [content, setContent] = useState("");
  const [gratitude, setGratitude] = useState("");
  const [mood, setMood] = useState<number | undefined>(undefined);

  const existingForWriteDate = entries.find((e) => e.date === writeDate && (e.slot ?? "general") === activeSlot);
  const prompt = getPromptForDate(writeDate, preferences.userType, activeSlot);
  const hasTodayEntry = entries.some((e) => e.date === today);
  const isFutureDate = writeDate > today;
  const showWriteTodayPrompt = isFutureDate && !hasTodayEntry;

  useEffect(() => {
    const urlDate = searchParams.get("date");
    if (urlDate && isValidDateString(urlDate)) {
      setWriteDate(urlDate);
    }
  }, [searchParams]);

  // When non-Muslim, only morning and general slots are shown; reset if activeSlot is suhoor/iftar
  useEffect(() => {
    if (preferences.userType !== "muslim" && (activeSlot === "suhoor" || activeSlot === "iftar")) {
      setActiveSlot("general");
    }
  }, [preferences.userType, activeSlot]);

  useEffect(() => {
    const entry = entries.find((e) => e.date === writeDate && (e.slot ?? "general") === activeSlot);
    setContent(entry?.content ?? "");
    setGratitude(entry?.gratitude ?? "");
    setMood(entry?.mood);
  }, [writeDate, activeSlot, entries]);

  // Optional journal retention: auto-delete entries older than N days (see docs/DATA-LIFECYCLE-POLICIES.md)
  useEffect(() => {
    const days = preferences.journalRetentionDays ?? null;
    if (days == null || days <= 0 || entries.length === 0) return;
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - days);
    const cutoffStr = cutoff.toISOString().split("T")[0];
    const kept = entries.filter((e) => e.date >= cutoffStr);
    if (kept.length < entries.length) {
      setEntries(kept);
    }
  }, [preferences.journalRetentionDays, entries, setEntries]);

  const JOURNAL_CONTENT_MAX_LENGTH = 10000;

  const handleSave = () => {
    if (!content.trim()) {
      toast.error("Write something before saving. A few words are enough.");
      return;
    }
    if (content.trim().length > JOURNAL_CONTENT_MAX_LENGTH) {
      toast.error("Entry is too long. Consider shortening or splitting into multiple days.");
      return;
    }
    const now = new Date().toISOString();
    const existing = entries.find((e) => e.date === writeDate);
    const newEntry: JournalEntry = {
      date: writeDate,
      prompt,
      content: content.trim(),
      gratitude: gratitude.trim() || undefined,
      mood,
      slot: activeSlot,
      createdAt: existing?.createdAt ?? now,
      updatedAt: now,
    };
    setEntries((prev) => {
      const rest = prev.filter((e) => e.date !== writeDate);
      return [...rest, newEntry].sort((a, b) => b.date.localeCompare(a.date));
    });
    toast.success("Entry saved");
    if (typeof window !== "undefined" && !window.localStorage.getItem(JOURNAL_NOTICE_KEY)) {
      setShowStorageNotice(true);
    }
  };

  const handleSelectDate = (date: Date | undefined) => {
    if (!date) return;
    const iso = date.toISOString().split("T")[0];
    if (iso === writeDate) return;
    // Save current entry before switching date if there are unsaved changes
    const currentExisting = entries.find((e) => e.date === writeDate);
    const hasDirtyContent =
      content.trim() !== (currentExisting?.content ?? "") ||
      gratitude.trim() !== (currentExisting?.gratitude ?? "") ||
      mood !== currentExisting?.mood;
    if (content.trim() && hasDirtyContent) {
      const newEntry: JournalEntry = {
        date: writeDate,
        prompt: getPromptForDate(writeDate, preferences.userType),
        content: content.trim(),
        gratitude: gratitude.trim() || undefined,
        mood,
      };
      setEntries((prev) => {
        const rest = prev.filter((e) => e.date !== writeDate);
        return [...rest, newEntry].sort((a, b) => b.date.localeCompare(a.date));
      });
    }
    setWriteDate(iso);
    const existing = entries.find((e) => e.date === iso);
    setContent(existing?.content ?? "");
    setGratitude(existing?.gratitude ?? "");
    setMood(existing?.mood);
  };

  const undoDeleteRef = useRef<JournalEntry[] | null>(null);
  const handleDeleteEntry = () => {
    if (!existingForWriteDate) return;
    if (typeof window !== "undefined" && !window.confirm("Delete this entry? You can undo within a few seconds.")) return;
    undoDeleteRef.current = entries;
    setEntries((prev) => prev.filter((e) => e.date !== writeDate));
    setContent("");
    setGratitude("");
    setMood(undefined);
    toast.success("Entry deleted", {
      action: {
        label: "Undo",
        onClick: () => {
          if (undoDeleteRef.current) {
            setEntries(undoDeleteRef.current);
            undoDeleteRef.current = null;
            toast.info("Entry restored");
          }
        },
      },
      duration: 8000,
    });
  };

  const handleExport = () => {
    if (entries.length === 0) {
      toast.info("No entries to export.");
      return;
    }
    const data = {
      exportedAt: new Date().toISOString(),
      entries: entries.map((e) => ({
        date: e.date,
        prompt: e.prompt,
        content: e.content,
        gratitude: e.gratitude,
        mood: e.mood,
      })),
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `tryramadan-journal-${today}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const JOURNAL_NOTICE_KEY = "tryramadan-journal-notice-dismissed";
  const [showStorageNotice, setShowStorageNotice] = useState(() =>
    typeof window !== "undefined" ? !window.localStorage.getItem(JOURNAL_NOTICE_KEY) : false
  );
  const [expandedDate, setExpandedDate] = useState<string | null>(null);
  const INITIAL_SHOW = 14;
  const [showCount, setShowCount] = useState(INITIAL_SHOW);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"newest" | "oldest">("newest");
  const [slotFilter, setSlotFilter] = useState<JournalSlot | "all">("all");
  const [moodFilter, setMoodFilter] = useState<number | "all">("all");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [readModeOpen, setReadModeOpen] = useState(false);
  const [readModeIndex, setReadModeIndex] = useState(0);
  const swipeStartX = useRef<number | null>(null);
  const readModeRef = useRef<HTMLDivElement>(null);

  const filteredAndSortedEntries = useMemo(() => {
    let result = [...entries];
    const q = searchQuery.trim().toLowerCase();
    if (q) {
      result = result.filter(
        (e) =>
          e.content.toLowerCase().includes(q) ||
          (e.gratitude?.toLowerCase().includes(q) ?? false) ||
          (e.prompt?.toLowerCase().includes(q) ?? false)
      );
    }
    if (slotFilter !== "all") {
      result = result.filter((e) => (e.slot ?? "general") === slotFilter);
    }
    if (moodFilter !== "all") {
      result = result.filter((e) => e.mood === moodFilter);
    }
    result.sort((a, b) =>
      sortBy === "newest" ? b.date.localeCompare(a.date) : a.date.localeCompare(b.date)
    );
    return result;
  }, [entries, searchQuery, sortBy, slotFilter, moodFilter]);

  const displayEntries = filteredAndSortedEntries.slice(0, showCount);
  const hasMore = filteredAndSortedEntries.length > showCount;

  useEffect(() => {
    setShowCount(INITIAL_SHOW);
  }, [searchQuery, sortBy, slotFilter, moodFilter]);
  const editorSectionRef = useRef<HTMLDivElement>(null);
  const pastEntriesSectionRef = useRef<HTMLDivElement>(null);

  const scrollToPastEntries = useCallback(() => {
    pastEntriesSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);

  const scrollToEditor = useCallback(() => {
    editorSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);

  const entryDates = useMemo(() => new Set(entries.map((e) => e.date)), [entries]);
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [calendarMonth, setCalendarMonth] = useState(() => {
    const d = new Date(writeDate + "T12:00:00");
    return new Date(d.getFullYear(), d.getMonth(), 1);
  });

  useEffect(() => {
    if (typeof window !== "undefined" && window.location.hash === "#past-entries") {
      const t = setTimeout(() => scrollToPastEntries(), 300);
      return () => clearTimeout(t);
    }
  }, [scrollToPastEntries]);

  useEffect(() => {
    if (readModeOpen && readModeRef.current) {
      readModeRef.current.focus();
    }
  }, [readModeOpen]);

  return (
    <div className="min-h-screen bg-background">
      <PageSEO
        title="Journal | TryRamadan.app"
        description="Ramadan fasting journal: mood tracking, daily prompts, gratitude, and calendar. Reflect on your fasting journey."
        path="/dashboard/journal"
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
              Reflection Journal
            </h1>
            <p className="text-muted-foreground mt-2">
              Daily gratitude and mindfulness. Write for any date — past, today, or future. Your entries stay on this device.
            </p>
            {entries.length > 0 && (
              <button
                type="button"
                onClick={scrollToPastEntries}
                className="mt-3 inline-flex items-center gap-2 text-sm font-medium text-secondary hover:underline"
              >
                <BookOpen className="w-4 h-4" />
                View past entries ({entries.length})
              </button>
            )}
          </motion.div>

          {/* Write for date + prompt + content + gratitude + mood — journal entry above calendar */}
          <motion.div
            ref={editorSectionRef}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-8 p-6 rounded-2xl bg-card border border-border"
          >
            {showStorageNotice && entries.length > 0 && (
              <div className="mb-4 p-4 rounded-xl bg-muted/50 border border-border flex items-start justify-between gap-3">
                <p className="text-sm text-muted-foreground">
                  Your journal is stored only on this device. Anyone with access to this device (or browser extensions) could read it. Avoid sensitive details on shared devices.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    try {
                      window.localStorage.setItem(JOURNAL_NOTICE_KEY, "1");
                    } catch {
                      // ignore
                    }
                    setShowStorageNotice(false);
                  }}
                  className="shrink-0 text-sm font-medium text-muted-foreground hover:text-foreground"
                  aria-label="Dismiss notice"
                >
                  Dismiss
                </button>
              </div>
            )}
            {showWriteTodayPrompt && (
              <div className="mb-4 p-4 rounded-xl border-2 border-secondary/40 bg-secondary/5">
                <p className="text-sm font-medium text-foreground mb-1">
                  Want to start with today?
                </p>
                <p className="text-sm text-muted-foreground mb-3">
                  Writing today first helps you keep a steady habit; you can add or edit any date anytime.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    handleSelectDate(new Date(today + "T12:00:00"));
                    setCalendarMonth(new Date(today + "T12:00:00"));
                    scrollToEditor();
                  }}
                  className="inline-flex items-center gap-2 py-2 px-4 rounded-xl bg-secondary text-secondary-foreground font-medium text-sm hover:bg-secondary/90 transition-colors"
                >
                  <PenLine className="w-4 h-4" />
                  Write for today
                </button>
              </div>
            )}
            <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
              <h3 className="font-display font-bold flex items-center gap-2">
                <PenLine className="w-5 h-5 text-secondary" />
                {writeDate === today
                  ? "Today's prompt"
                  : writeDate > today
                    ? `Entry for ${writeDate} (future)`
                    : `Entry for ${writeDate}`}
              </h3>
              <div className="flex items-center gap-2">
                {existingForWriteDate && (
                  <button
                    type="button"
                    onClick={handleDeleteEntry}
                    className="inline-flex items-center gap-1.5 py-1.5 px-3 rounded-lg border border-destructive/30 bg-destructive/10 text-destructive text-sm font-medium hover:bg-destructive/20 transition-colors"
                    aria-label="Delete this entry"
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete this entry
                  </button>
                )}
                <label className="text-sm text-muted-foreground flex items-center gap-2">
                  Date
                  <input
                    type="date"
                    value={writeDate}
                    onChange={(e) => handleSelectDate(new Date(e.target.value + "T12:00:00"))}
                    className="px-2 py-1 rounded-lg border border-border bg-background text-sm"
                    title="Pick any date — past, today, or future"
                  />
                </label>
              </div>
            </div>
            <div className="flex flex-wrap gap-1 mb-4">
              {(preferences.userType === "muslim"
                ? (["morning", "suhoor", "iftar", "general"] as JournalSlot[])
                : (["morning", "general"] as JournalSlot[])
              ).map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setActiveSlot(s)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    activeSlot === s
                      ? "bg-secondary text-secondary-foreground"
                      : "bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground"
                  }`}
                >
                  {SLOT_LABELS[s]}
                </button>
              ))}
            </div>
            <p className="text-sm text-muted-foreground mb-4">{prompt}</p>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Write a few lines..."
              maxLength={JOURNAL_CONTENT_MAX_LENGTH}
              className="w-full p-4 rounded-xl border border-border bg-background min-h-[100px] text-sm resize-none focus:ring-2 focus:ring-secondary outline-none"
              aria-describedby="journal-char-hint"
            />
            {content.length > JOURNAL_CONTENT_MAX_LENGTH * 0.9 && (
              <p id="journal-char-hint" className="text-xs text-muted-foreground mt-1">
                {content.length.toLocaleString()} / {JOURNAL_CONTENT_MAX_LENGTH.toLocaleString()} characters
              </p>
            )}
            <label className="block text-sm font-medium mt-3 mb-1 flex items-center gap-2">
              <Smile className="w-4 h-4 text-secondary" />
              How was your day? (optional)
            </label>
            <div className="flex gap-2 mb-3">
              {(MOOD_EMOJI as string[]).map((emoji, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setMood(i + 1)}
                  title={MOOD_LABELS[i]}
                  className={`p-2 rounded-xl border-2 text-lg transition-all ${
                    mood === i + 1
                      ? "border-secondary bg-secondary/10"
                      : "border-border hover:border-secondary/50"
                  }`}
                >
                  {emoji}
                </button>
              ))}
            </div>
            <label className="block text-sm font-medium mb-1">One thing I'm grateful for (optional)</label>
            <div className="flex flex-wrap gap-1.5 mb-2">
              {GRATITUDE_QUICK_ADD.map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => setGratitude(option)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${
                    gratitude === option
                      ? "bg-secondary text-secondary-foreground"
                      : "bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground"
                  }`}
                >
                  {option}
                </button>
              ))}
            </div>
            <input
              type="text"
              value={gratitude}
              onChange={(e) => setGratitude(e.target.value)}
              placeholder="Or type your own..."
              className="w-full p-3 rounded-xl border border-border bg-background text-sm focus:ring-2 focus:ring-secondary outline-none"
            />
            {preferences.userType === "muslim" && (
              <div className="mt-4 pt-4 border-t border-border">
                <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-secondary" />
                  Prayers completed ({writeDate})
                </h4>
                <p className="text-xs text-muted-foreground mb-3">
                  Mark which prayers you completed for this day.
                </p>
                <div className="flex flex-wrap gap-3">
                  {['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'].map((name) => {
                    const done = (prayerTracker[writeDate] ?? {})[name] ?? false;
                    return (
                      <label key={name} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={!!done}
                          onChange={(e) => {
                            setPrayerTracker((prev) => ({
                              ...prev,
                              [writeDate]: { ...(prev[writeDate] ?? {}), [name]: e.target.checked },
                            }));
                          }}
                          className="rounded border-border"
                          aria-label={`Mark ${name} as ${done ? "not " : ""}completed`}
                        />
                        <span className="text-sm font-medium">{name}</span>
                      </label>
                    );
                  })}
                </div>
                <Collapsible>
                  <CollapsibleTrigger className="flex items-center gap-2 mt-3 text-xs font-medium text-muted-foreground hover:text-foreground">
                    Optional prayers (Sunnah & Witr)
                    <ChevronDown className="w-3.5 h-3.5" aria-hidden />
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {OPTIONAL_PRAYERS.map((prayer) => {
                        const done = (prayerTracker[writeDate] ?? {})[prayer.id];
                        const isChecked = done === true || done === "half" || done === "full";
                        return (
                          <label key={prayer.id} className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={!!isChecked}
                              onChange={(e) => {
                                setPrayerTracker((prev) => ({
                                  ...prev,
                                  [writeDate]: { ...(prev[writeDate] ?? {}), [prayer.id]: e.target.checked },
                                }));
                              }}
                              className="rounded border-border"
                              aria-label={`Mark ${prayer.label} as ${isChecked ? "not " : ""}completed`}
                            />
                            <span className="text-sm font-medium">{prayer.label}</span>
                          </label>
                        );
                      })}
                    </div>
                  </CollapsibleContent>
                </Collapsible>
                {isRamadanDay(new Date(writeDate + "T12:00:00")) && (
                  <div className="mt-4 pt-3 border-t border-border/60">
                    <p className="text-xs font-medium text-muted-foreground mb-2">
                      Taraweeh (optional night prayer during Ramadan)
                    </p>
                    <div className="flex flex-wrap items-center gap-3">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={!!(taraweehTracker[writeDate] ?? {}).done}
                          onChange={(e) => {
                            setTaraweehTracker((prev) => ({
                              ...prev,
                              [writeDate]: {
                                done: e.target.checked,
                                rakats: (prev[writeDate] ?? {}).rakats ?? 8,
                              },
                            }));
                          }}
                          className="rounded border-border"
                          aria-label="Mark Taraweeh as completed"
                        />
                        <span className="text-sm font-medium">Completed</span>
                      </label>
                      <label className="flex items-center gap-2 text-sm">
                        <span className="text-muted-foreground">Rak&apos;ats:</span>
                        <Select
                          value={(taraweehTracker[writeDate] ?? {}).rakats != null ? String((taraweehTracker[writeDate] ?? {}).rakats) : "none"}
                          onValueChange={(v) => {
                            const n = v === "none" ? undefined : parseInt(v, 10);
                            setTaraweehTracker((prev) => ({
                              ...prev,
                              [writeDate]: {
                                ...(prev[writeDate] ?? { done: false }),
                                rakats: n,
                              },
                            }));
                          }}
                        >
                          <SelectTrigger className="w-[72px] h-8 text-sm" aria-label="Taraweeh rak'ats">
                            <SelectValue placeholder="—" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="none">—</SelectItem>
                            <SelectItem value="8">8</SelectItem>
                            <SelectItem value="20">20</SelectItem>
                          </SelectContent>
                        </Select>
                      </label>
                    </div>
                    <p className="text-[11px] text-muted-foreground mt-1.5">
                      Often 8 or 20 rak&apos;ats; varies by mosque and tradition.
                    </p>
                  </div>
                )}
              </div>
            )}
            {trackableHabits.length > 0 && (
              <div className="mt-4 pt-4 border-t border-border">
                <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                  <CheckSquare className="w-4 h-4 text-secondary" />
                  Habits for this day (optional)
                </h4>
                <p className="text-xs text-muted-foreground mb-3">
                  Sunnah habits from the Quran and hadith. Check what you did. <Link to="/habits" className="text-secondary hover:underline">See all habits</Link>
                </p>
                <ul className="space-y-2">
                  {trackableHabits.map((habit) => {
                    const checked = !!habitLog[writeDate]?.[habit.id];
                    return (
                      <li key={habit.id}>
                        <label className="flex items-center gap-2 text-sm cursor-pointer">
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={(e) => {
                              setHabitLog((prev) => ({
                                ...prev,
                                [writeDate]: {
                                  ...(prev[writeDate] ?? {}),
                                  [habit.id]: e.target.checked,
                                },
                              }));
                            }}
                            className="rounded border-border"
                          />
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <span className="cursor-help border-b border-dotted border-transparent hover:border-muted-foreground/40">
                                {habit.shortLabel}
                              </span>
                            </TooltipTrigger>
                            <TooltipContent side="right" className="max-w-sm p-3">
                              <p className="font-medium mb-1">{habit.title}</p>
                              <blockquote className="text-xs text-muted-foreground italic border-l-2 border-secondary/50 pl-2 my-1">
                                &ldquo;{habit.quote}&rdquo;
                              </blockquote>
                              <div className="text-xs text-muted-foreground mt-1 space-y-1">
                                <a
                                  href={habit.sourceUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-secondary hover:underline"
                                >
                                  {habit.sourceLabel} ↗
                                </a>
                                {habit.sourceUrl2 && habit.sourceLabel2 && (
                                  <>
                                    <span className="mx-1">·</span>
                                    <a
                                      href={habit.sourceUrl2}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="text-secondary hover:underline"
                                    >
                                      {habit.sourceLabel2} ↗
                                    </a>
                                  </>
                                )}
                              </div>
                              <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{habit.explanation}</p>
                            </TooltipContent>
                          </Tooltip>
                        </label>
                      </li>
                    );
                  })}
                </ul>
              </div>
            )}
            <button
              onClick={handleSave}
              className="mt-4 py-2 px-4 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90"
            >
              {existingForWriteDate ? "Update entry" : "Save entry"}
            </button>
          </motion.div>

          {/* Export */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.12 }}
            className="mb-8"
          >
            <button
              type="button"
              onClick={handleExport}
              className="inline-flex items-center gap-2 py-2 px-4 rounded-xl border border-border bg-card hover:bg-muted/50 text-sm font-medium"
            >
              <Download className="w-4 h-4" />
              Download journal as JSON
            </button>
          </motion.div>

          {/* Day strip + calendar (dashboard-style): date with sliders, Today button, calendar only on expand */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.08 }}
            className="mb-8 p-4 rounded-2xl bg-card border border-border"
          >
            <div className="flex flex-wrap items-center gap-2 sm:gap-3 p-2 rounded-xl bg-muted/50 border border-border">
              <button
                type="button"
                onClick={() => {
                  const d = new Date(writeDate + "T12:00:00");
                  d.setDate(d.getDate() - 1);
                  handleSelectDate(d);
                  setCalendarMonth(d);
                }}
                className="p-2.5 rounded-lg hover:bg-muted transition-colors min-h-[44px] min-w-[44px] touch-manipulation shrink-0"
                aria-label="Previous day"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <span className="flex-1 min-w-0 text-center sm:text-left font-display font-semibold text-sm sm:text-base truncate px-2">
                {new Date(writeDate + "T12:00:00").toLocaleDateString("en", { weekday: "short", month: "short", day: "numeric", year: "numeric" })}
              </span>
              {writeDate !== today && (
                <button
                  type="button"
                  onClick={() => {
                    handleSelectDate(new Date(today + "T12:00:00"));
                    setCalendarMonth(new Date(today + "T12:00:00"));
                    scrollToEditor();
                  }}
                  className="px-3 py-1.5 rounded-lg bg-primary/20 text-foreground text-sm font-medium hover:bg-primary/30 shrink-0"
                  aria-label="Go to today"
                >
                  Today
                </button>
              )}
              <button
                type="button"
                onClick={() => {
                  const d = new Date(writeDate + "T12:00:00");
                  d.setDate(d.getDate() + 1);
                  handleSelectDate(d);
                  setCalendarMonth(d);
                }}
                className="p-2.5 rounded-lg hover:bg-muted transition-colors min-h-[44px] min-w-[44px] touch-manipulation shrink-0"
                aria-label="Next day"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
            <Collapsible open={calendarOpen} onOpenChange={setCalendarOpen} className="mt-3">
              <CollapsibleTrigger
                className="inline-flex items-center gap-2 w-full justify-center sm:justify-start py-2 px-3 rounded-lg border border-border bg-background text-sm font-medium hover:bg-muted/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                aria-expanded={calendarOpen}
                aria-label={calendarOpen ? "Hide calendar" : "Show calendar"}
              >
                <CalendarIcon className="w-4 h-4 text-secondary" />
                Calendar
                {calendarOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </CollapsibleTrigger>
              <CollapsibleContent>
                <p className="text-xs text-muted-foreground mt-2 mb-2">
                  Days with an entry are marked. Click a day to write or edit.
                </p>
                <div className="inline-block">
                  <Calendar
                    mode="single"
                    selected={new Date(writeDate + "T12:00:00")}
                    onSelect={(date) => {
                      if (date) {
                        handleSelectDate(date);
                        setCalendarMonth(date);
                        setCalendarOpen(false);
                        scrollToEditor();
                      }
                    }}
                    month={calendarMonth}
                    onMonthChange={(month) => month && setCalendarMonth(month)}
                    className="rounded-xl border border-border p-2"
                    classNames={{
                      month: "space-y-2",
                      caption_label: "text-xs font-medium",
                      head_cell: "text-muted-foreground rounded-md w-8 font-normal text-[0.7rem]",
                      row: "flex w-full mt-1",
                      cell: "h-8 w-8 text-center text-xs p-0 relative [&:has([aria-selected].day-range-end)]:rounded-r-md [&:has([aria-selected].day-outside)]:bg-accent/50 [&:has([aria-selected])]:bg-accent first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20",
                      day: "h-8 w-8 p-0 text-xs font-normal rounded-md hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground aria-selected:opacity-100",
                      day_selected: "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground",
                      day_today: "bg-accent text-accent-foreground",
                      day_outside: "text-muted-foreground opacity-50",
                      nav_button: "h-6 w-6",
                    }}
                    modifiers={{
                      hasEntry: (date) => entryDates.has(date.toISOString().split("T")[0]),
                    }}
                    modifiersClassNames={{
                      hasEntry: "bg-secondary/20 font-semibold",
                    }}
                  />
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  {entries.length} entr{entries.length === 1 ? "y" : "ies"} total
                </p>
              </CollapsibleContent>
            </Collapsible>
          </motion.div>

          {/* Past entries list */}
          <motion.div
            ref={pastEntriesSectionRef}
            id="past-entries"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
          >
            <h3 className="font-display font-bold mb-4 flex items-center gap-2 flex-wrap">
              <BookOpen className="w-5 h-5 text-secondary" />
              Past entries
              {filteredAndSortedEntries.length < entries.length && (
                <span className="text-sm font-normal text-muted-foreground">
                  ({filteredAndSortedEntries.length} of {entries.length})
                </span>
              )}
              {filteredAndSortedEntries.length > 0 && (
                <button
                  type="button"
                  onClick={() => {
                    setReadModeIndex(0);
                    setReadModeOpen(true);
                  }}
                  className="ml-auto inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border border-secondary/50 bg-secondary/10 text-secondary text-sm font-medium hover:bg-secondary/20 transition-colors"
                  aria-label="Open swipe to read mode"
                >
                  <ChevronLeft className="w-4 h-4" aria-hidden />
                  <ChevronRight className="w-4 h-4" aria-hidden />
                  Swipe to read
                </button>
              )}
            </h3>

            {/* Search */}
            <div className="relative mb-3">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" aria-hidden />
              <Input
                type="search"
                placeholder="Search entries..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
                aria-label="Search past journal entries"
              />
            </div>

            {/* Sort and filters - mobile: collapsible, desktop: always visible */}
            <div className="mb-4">
              {/* Mobile: collapsible panel */}
              <Collapsible open={filtersOpen} onOpenChange={setFiltersOpen} className="sm:hidden">
                <CollapsibleTrigger
                  className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-border bg-card text-sm font-medium hover:bg-muted/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  aria-expanded={filtersOpen}
                  aria-label="Toggle sort and filters"
                >
                  <SlidersHorizontal className="h-4 w-4" />
                  Sort & filters
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <div className="flex flex-col gap-2 pt-3">
                    <Select value={sortBy} onValueChange={(v) => setSortBy(v as "newest" | "oldest")}>
                      <SelectTrigger className="w-full h-9" aria-label="Sort order">
                        <SelectValue placeholder="Sort" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="newest">Newest first</SelectItem>
                        <SelectItem value="oldest">Oldest first</SelectItem>
                      </SelectContent>
                    </Select>
                    <Select value={slotFilter} onValueChange={(v) => setSlotFilter(v as JournalSlot | "all")}>
                      <SelectTrigger className="w-full h-9" aria-label="Filter by slot">
                        <SelectValue placeholder="Slot" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All slots</SelectItem>
                        {(["morning", "suhoor", "iftar", "general"] as const).map((s) => (
                          <SelectItem key={s} value={s}>
                            {SLOT_LABELS[s]}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Select
                      value={moodFilter === "all" ? "all" : String(moodFilter)}
                      onValueChange={(v) => setMoodFilter(v === "all" ? "all" : Number(v))}
                    >
                      <SelectTrigger className="w-full h-9" aria-label="Filter by mood">
                        <SelectValue placeholder="Mood" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All moods</SelectItem>
                        {MOOD_LABELS.map((label, i) => (
                          <SelectItem key={i} value={String(i + 1)}>
                            {MOOD_EMOJI[i]} {label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </CollapsibleContent>
              </Collapsible>
              {/* Desktop: inline row */}
              <div className="hidden sm:flex flex-wrap items-center gap-3">
                <Select value={sortBy} onValueChange={(v) => setSortBy(v as "newest" | "oldest")}>
                  <SelectTrigger className="w-[140px] h-9" aria-label="Sort order">
                    <SelectValue placeholder="Sort" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="newest">Newest first</SelectItem>
                    <SelectItem value="oldest">Oldest first</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={slotFilter} onValueChange={(v) => setSlotFilter(v as JournalSlot | "all")}>
                  <SelectTrigger className="w-[140px] h-9" aria-label="Filter by slot">
                    <SelectValue placeholder="Slot" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All slots</SelectItem>
                    {(["morning", "suhoor", "iftar", "general"] as const).map((s) => (
                      <SelectItem key={s} value={s}>
                        {SLOT_LABELS[s]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select
                  value={moodFilter === "all" ? "all" : String(moodFilter)}
                  onValueChange={(v) => setMoodFilter(v === "all" ? "all" : Number(v))}
                >
                  <SelectTrigger className="w-[140px] h-9" aria-label="Filter by mood">
                    <SelectValue placeholder="Mood" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All moods</SelectItem>
                    {MOOD_LABELS.map((label, i) => (
                      <SelectItem key={i} value={String(i + 1)}>
                        {MOOD_EMOJI[i]} {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {displayEntries.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                {entries.length === 0
                  ? "Your journal is ready for you. Write whenever it helps — a line or two about your day, mood, or gratitude is enough. Pick a date above to get started."
                  : "No entries match your search or filters. Try different keywords or clear filters."}
              </p>
            ) : (
              <ul className="space-y-3">
                {displayEntries.map((entry) => {
                  const entryKey = `${entry.date}-${entry.slot ?? "general"}`;
                  const isExpanded = expandedDate === entryKey;
                  const dayHabits = habitLog && typeof habitLog === "object" ? habitLog[entry.date] : undefined;
                  const checkedHabitIds = dayHabits && typeof dayHabits === "object" ? Object.entries(dayHabits).filter(([, v]) => v).map(([id]) => id) : [];
                  const habitLabels = getShortLabelsForHabitIds(checkedHabitIds);
                  return (
                    <li
                      key={entryKey}
                      className="p-4 rounded-xl bg-card border border-border min-w-0"
                    >
                      <div className="flex items-center justify-between gap-2 flex-wrap">
                        <span className="text-xs text-muted-foreground">{entry.date}</span>
                        {(entry.slot ?? "general") !== "general" && (
                          <span className="text-xs px-1.5 py-0.5 rounded bg-secondary/10 text-secondary">
                            {SLOT_LABELS[entry.slot ?? "general"]}
                          </span>
                        )}
                        {entry.mood != null && (
                          <span className="text-sm" title={MOOD_LABELS[entry.mood - 1]}>
                            {MOOD_EMOJI[entry.mood - 1]}
                          </span>
                        )}
                      </div>
                      <p className={`text-sm mt-1 ${isExpanded ? "" : "line-clamp-2"}`}>
                        {entry.content}
                      </p>
                      {habitLabels.length > 0 && (
                        <p className="text-xs text-muted-foreground mt-2 flex flex-wrap gap-1 items-center">
                          <span className="font-medium text-foreground">Habits:</span>
                          {habitLabels.map((l) => (
                            <span key={l} className="px-1.5 py-0.5 rounded bg-secondary/10 text-secondary text-xs">
                              {l}
                            </span>
                          ))}
                        </p>
                      )}
                      {entry.gratitude && (
                        <p className="text-xs text-secondary mt-2">Grateful: {entry.gratitude}</p>
                      )}
                      <div className="flex flex-wrap gap-2 mt-2">
                        <button
                          type="button"
                          onClick={() => {
                            setWriteDate(entry.date);
                            setActiveSlot(entry.slot ?? "general");
                            setCalendarMonth(new Date(entry.date + "T12:00:00"));
                            handleSelectDate(new Date(entry.date + "T12:00:00"));
                            setTimeout(scrollToEditor, 150);
                          }}
                          className="text-xs font-medium text-secondary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => setExpandedDate(isExpanded ? null : entryKey)}
                          className="text-xs font-medium text-secondary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded"
                        >
                          {isExpanded ? "Show less" : "View full"}
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            const idx = filteredAndSortedEntries.findIndex(
                              (e) => e.date === entry.date && (e.slot ?? "general") === (entry.slot ?? "general")
                            );
                            setReadModeIndex(idx >= 0 ? idx : 0);
                            setReadModeOpen(true);
                          }}
                          className="text-xs font-medium text-secondary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded"
                        >
                          Swipe to read
                        </button>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
            {hasMore && (
              <button
                type="button"
                onClick={() => setShowCount((c) => c + 14)}
                className="mt-4 text-sm font-medium text-secondary hover:underline"
              >
                Show more entries
              </button>
            )}
            {entries.length > 0 && (
              <button
                type="button"
                onClick={scrollToEditor}
                className="mt-4 block text-sm font-medium text-secondary hover:underline"
              >
                ↑ Back to write / edit
              </button>
            )}
          </motion.div>
        </div>
      </main>

      {/* Swipe / Read mode: full-screen reader with swipe or arrows */}
      <AnimatePresence>
        {readModeOpen && filteredAndSortedEntries.length > 0 && (
          <motion.div
            ref={readModeRef}
            tabIndex={0}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 bg-background flex flex-col outline-none"
            role="dialog"
            aria-modal="true"
            aria-label="Journal read mode — swipe or use arrows to navigate"
            onKeyDown={(e) => {
              if (e.key === "Escape") setReadModeOpen(false);
              if (e.key === "ArrowLeft" && readModeIndex > 0) {
                e.preventDefault();
                setReadModeIndex((i) => i - 1);
              }
              if (e.key === "ArrowRight" && readModeIndex < filteredAndSortedEntries.length - 1) {
                e.preventDefault();
                setReadModeIndex((i) => i + 1);
              }
            }}
          >
            <div className="flex items-center justify-between gap-4 p-4 border-b border-border shrink-0 bg-background">
              <span className="text-sm font-medium text-muted-foreground tabular-nums">
                {Math.min(readModeIndex + 1, filteredAndSortedEntries.length)} of {filteredAndSortedEntries.length}
              </span>
              <button
                type="button"
                onClick={() => setReadModeOpen(false)}
                className="p-2 rounded-lg hover:bg-muted transition-colors"
                aria-label="Close read mode"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div
              className="flex-1 overflow-hidden flex items-stretch min-h-0 touch-pan-y"
              onTouchStart={(e) => {
                swipeStartX.current = e.touches[0].clientX;
              }}
              onTouchEnd={(e) => {
                const start = swipeStartX.current;
                if (start == null) return;
                const end = e.changedTouches[0].clientX;
                const delta = end - start;
                if (delta > 60 && readModeIndex > 0) {
                  setReadModeIndex((i) => i - 1);
                } else if (delta < -60 && readModeIndex < filteredAndSortedEntries.length - 1) {
                  setReadModeIndex((i) => i + 1);
                }
                swipeStartX.current = null;
              }}
            >
              <div className="flex-1 overflow-y-auto overflow-x-hidden w-full">
                <AnimatePresence mode="wait" initial={false}>
                  {(() => {
                    const entry = filteredAndSortedEntries[Math.min(readModeIndex, filteredAndSortedEntries.length - 1)];
                    if (!entry) return null;
                    const entryKey = `${entry.date}-${entry.slot ?? "general"}`;
                    return (
                      <motion.article
                        key={entryKey}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.2 }}
                        className="p-6 max-w-xl mx-auto pb-24"
                      >
                        <p className="text-sm text-muted-foreground mb-1">
                          {new Date(entry.date + "T12:00:00").toLocaleDateString("en", {
                            weekday: "long",
                            month: "long",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </p>
                        {(entry.slot ?? "general") !== "general" && (
                          <p className="text-xs text-secondary mb-3">{SLOT_LABELS[entry.slot ?? "general"]}</p>
                        )}
                        <div className="prose prose-sm dark:prose-invert max-w-none">
                          <p className="whitespace-pre-wrap text-foreground leading-relaxed">{entry.content}</p>
                        </div>
                        {entry.gratitude && (
                          <p className="text-sm text-secondary mt-4 font-medium">Grateful: {entry.gratitude}</p>
                        )}
                        {entry.mood != null && (
                          <p className="text-sm text-muted-foreground mt-2 flex items-center gap-2">
                            <span aria-hidden>{MOOD_EMOJI[entry.mood - 1]}</span>
                            {MOOD_LABELS[entry.mood - 1]}
                          </p>
                        )}
                        <button
                          type="button"
                          onClick={() => {
                            setWriteDate(entry.date);
                            setActiveSlot(entry.slot ?? "general");
                            setCalendarMonth(new Date(entry.date + "T12:00:00"));
                            handleSelectDate(new Date(entry.date + "T12:00:00"));
                            setReadModeOpen(false);
                            setTimeout(scrollToEditor, 150);
                          }}
                          className="mt-6 text-sm font-medium text-secondary hover:underline"
                        >
                          Edit this entry
                        </button>
                      </motion.article>
                    );
                  })()}
                </AnimatePresence>
              </div>
            </div>
            <div className="shrink-0 flex items-center justify-between gap-4 p-4 border-t border-border bg-background safe-area-bottom">
              <button
                type="button"
                onClick={() => setReadModeIndex((i) => Math.max(0, i - 1))}
                disabled={readModeIndex === 0}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-border bg-card font-medium text-sm disabled:opacity-40 disabled:pointer-events-none hover:bg-muted transition-colors min-h-[44px] touch-manipulation"
                aria-label="Previous entry"
              >
                <ChevronLeft className="w-5 h-5" />
                Previous
              </button>
              <p className="text-xs text-muted-foreground hidden sm:block">Swipe or use ← → keys</p>
              <button
                type="button"
                onClick={() => setReadModeIndex((i) => Math.min(filteredAndSortedEntries.length - 1, i + 1))}
                disabled={readModeIndex >= filteredAndSortedEntries.length - 1}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-border bg-card font-medium text-sm disabled:opacity-40 disabled:pointer-events-none hover:bg-muted transition-colors min-h-[44px] touch-manipulation"
                aria-label="Next entry"
              >
                Next
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <Footer />
    </div>
  );
}
