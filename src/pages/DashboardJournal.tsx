import { useState, useMemo, useEffect, useRef, useCallback } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  BookOpen,
  PenLine,
  ChevronDown,
  ChevronUp,
  Download,
  Calendar as CalendarIcon,
  Smile,
} from "lucide-react";
import { toast } from "sonner";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { useLocalStorage, useUserPreferences } from "@/hooks/useLocalStorage";
import { Calendar } from "@/components/ui/calendar";
import { PageSEO } from "@/components/PageSEO";

export interface JournalEntry {
  date: string;
  prompt: string;
  content: string;
  gratitude?: string;
  mood?: number; // 1-5
  /** Set on first save (QA doc: timeline / last edited) */
  createdAt?: string;
  /** Set on every save */
  updatedAt?: string;
}

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

const MOOD_LABELS = ["Low", "Okay", "Good", "Great", "Amazing"];
const MOOD_EMOJI = ["😢", "😐", "🙂", "😊", "😄"];

function getPromptForDate(isoDate: string, userType?: string): string {
  const day = parseInt(isoDate.slice(8, 10), 10) || 1;
  const prompts = userType === "muslim" ? PROMPTS_MUSLIM : PROMPTS_NON_MUSLIM;
  return prompts[(day - 1) % prompts.length];
}

export default function DashboardJournal() {
  const [preferences] = useUserPreferences();
  const [entries, setEntries] = useLocalStorage<JournalEntry[]>("tryramadan-journal", []);
  const today = new Date().toISOString().split("T")[0];

  const [writeDate, setWriteDate] = useState(today);
  const [content, setContent] = useState("");
  const [gratitude, setGratitude] = useState("");
  const [mood, setMood] = useState<number | undefined>(undefined);

  const existingForWriteDate = entries.find((e) => e.date === writeDate);
  const prompt = getPromptForDate(writeDate, preferences.userType);
  const hasTodayEntry = entries.some((e) => e.date === today);
  const isFutureDate = writeDate > today;
  const showWriteTodayPrompt = isFutureDate && !hasTodayEntry;

  useEffect(() => {
    const entry = entries.find((e) => e.date === writeDate);
    setContent(entry?.content ?? "");
    setGratitude(entry?.gratitude ?? "");
    setMood(entry?.mood);
  }, [writeDate, entries]);

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
      createdAt: existing?.createdAt ?? now,
      updatedAt: now,
    };
    setEntries((prev) => {
      const rest = prev.filter((e) => e.date !== writeDate);
      return [...rest, newEntry].sort((a, b) => b.date.localeCompare(a.date));
    });
    toast.success("Entry saved");
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

  const handleExport = () => {
    if (entries.length === 0) {
      toast.info("No entries to export.");
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

  const [expandedDate, setExpandedDate] = useState<string | null>(null);
  const INITIAL_SHOW = 14;
  const [showCount, setShowCount] = useState(INITIAL_SHOW);
  const displayEntries = entries.slice(0, showCount);
  const hasMore = entries.length > showCount;
  const editorSectionRef = useRef<HTMLDivElement>(null);
  const pastEntriesSectionRef = useRef<HTMLDivElement>(null);

  const scrollToPastEntries = useCallback(() => {
    pastEntriesSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);

  const scrollToEditor = useCallback(() => {
    editorSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);

  const entryDates = useMemo(() => new Set(entries.map((e) => e.date)), [entries]);
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

          {/* Calendar of entries */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="mb-8 p-6 rounded-2xl bg-card border border-border"
          >
            <h3 className="font-display font-bold mb-2 flex items-center gap-2">
              <CalendarIcon className="w-5 h-5 text-secondary" />
              Calendar
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              Days with an entry are marked. Click any day to write or edit — past, today, or future dates.
            </p>
            <Calendar
              mode="single"
              selected={new Date(writeDate + "T12:00:00")}
              onSelect={handleSelectDate}
              month={calendarMonth}
              onMonthChange={(month) => month && setCalendarMonth(month)}
              className="rounded-xl border border-border inline-block"
              modifiers={{
                hasEntry: (date) => entryDates.has(date.toISOString().split("T")[0]),
              }}
              modifiersClassNames={{
                hasEntry: "bg-secondary/20 font-semibold",
              }}
            />
            <p className="text-xs text-muted-foreground mt-2">
              {entries.length} entr{entries.length === 1 ? "y" : "ies"} total
            </p>
          </motion.div>

          {/* Write for date + prompt + content + gratitude + mood */}
          <motion.div
            ref={editorSectionRef}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-8 p-6 rounded-2xl bg-card border border-border"
          >
            {showWriteTodayPrompt && (
              <div className="mb-4 p-4 rounded-xl border-2 border-secondary/40 bg-secondary/5">
                <p className="text-sm font-medium text-foreground mb-1">
                  You're writing for a future date but haven't written for today yet.
                </p>
                <p className="text-sm text-muted-foreground mb-3">
                  We recommend writing today's entry first so you don't miss it.
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
            <input
              type="text"
              value={gratitude}
              onChange={(e) => setGratitude(e.target.value)}
              placeholder="e.g. Family, health, this moment..."
              className="w-full p-3 rounded-xl border border-border bg-background text-sm focus:ring-2 focus:ring-secondary outline-none"
            />
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

          {/* Past entries list */}
          <motion.div
            ref={pastEntriesSectionRef}
            id="past-entries"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
          >
            <h3 className="font-display font-bold mb-4 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-secondary" />
              Past entries
            </h3>
            {displayEntries.length === 0 ? (
              <p className="text-sm text-muted-foreground">No entries yet. Pick a date above and write.</p>
            ) : (
              <ul className="space-y-3">
                {displayEntries.map((entry) => {
                  const isExpanded = expandedDate === entry.date;
                  return (
                    <li
                      key={entry.date}
                      className="p-4 rounded-xl bg-card border border-border"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs text-muted-foreground">{entry.date}</span>
                        {entry.mood != null && (
                          <span className="text-sm" title={MOOD_LABELS[entry.mood - 1]}>
                            {MOOD_EMOJI[entry.mood - 1]}
                          </span>
                        )}
                      </div>
                      <p className={`text-sm mt-1 ${isExpanded ? "" : "line-clamp-2"}`}>
                        {entry.content}
                      </p>
                      {entry.gratitude && (
                        <p className="text-xs text-secondary mt-2">Grateful: {entry.gratitude}</p>
                      )}
                      <div className="flex gap-2 mt-2">
                        <button
                          type="button"
                          onClick={() => {
                            setWriteDate(entry.date);
                            setCalendarMonth(new Date(entry.date + "T12:00:00"));
                            handleSelectDate(new Date(entry.date + "T12:00:00"));
                            setTimeout(scrollToEditor, 150);
                          }}
                          className="text-xs font-medium text-secondary hover:underline"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => setExpandedDate(isExpanded ? null : entry.date)}
                          className="text-xs font-medium text-secondary hover:underline"
                        >
                          {isExpanded ? "Show less" : "View full"}
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
      <Footer />
    </div>
  );
}
