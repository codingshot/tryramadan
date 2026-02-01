import { useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowLeft, BookOpen, PenLine, ChevronRight } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { ArabicHover } from "@/components/ArabicHover";
import { useLocalStorage } from "@/hooks/useLocalStorage";

interface JournalEntry {
  date: string;
  prompt: string;
  content: string;
  gratitude?: string;
}

const PROMPTS = [
  "What did you learn about yourself today while fasting?",
  "How did you feel at suhoor vs iftar?",
  "One thing you're grateful for today.",
  "A small act of kindness you gave or received.",
  "What would you tell someone new to fasting?",
];

function getDailyPrompt(): string {
  const day = new Date().getDate();
  return PROMPTS[day % PROMPTS.length];
}

export default function DashboardJournal() {
  const [entries, setEntries] = useLocalStorage<JournalEntry[]>("tryramadan-journal", []);
  const [todayContent, setTodayContent] = useState("");
  const [todayGratitude, setTodayGratitude] = useState("");
  const today = new Date().toISOString().split("T")[0];
  const existingToday = entries.find((e) => e.date === today);
  const prompt = getDailyPrompt();

  const handleSave = () => {
    if (!todayContent.trim()) return;
    const newEntry: JournalEntry = {
      date: today,
      prompt,
      content: todayContent,
      gratitude: todayGratitude.trim() || undefined,
    };
    setEntries((prev) => {
      const rest = prev.filter((e) => e.date !== today);
      return [...rest, newEntry].sort((a, b) => b.date.localeCompare(a.date));
    });
    setTodayContent("");
    setTodayGratitude("");
  };

  const displayEntries = entries.slice(0, 7);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-20 pb-16">
        <div className="container mx-auto px-4 max-w-2xl">
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
              <ArabicHover arabic="يوميات التأمل">Reflection Journal</ArabicHover>
            </h1>
            <p className="text-muted-foreground mt-2">
              Daily gratitude and mindfulness. Your entries stay on this device.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-8 p-6 rounded-2xl bg-card border border-border"
          >
            <h3 className="font-display font-bold mb-2 flex items-center gap-2">
              <PenLine className="w-5 h-5 text-secondary" />
              Today's prompt
            </h3>
            <p className="text-sm text-muted-foreground mb-4">{prompt}</p>
            <textarea
              value={existingToday?.content ?? todayContent}
              onChange={(e) => setTodayContent(e.target.value)}
              placeholder="Write a few lines..."
              className="w-full p-4 rounded-xl border border-border bg-background min-h-[100px] text-sm resize-none focus:ring-2 focus:ring-secondary outline-none"
              disabled={!!existingToday}
            />
            <label className="block text-sm font-medium mt-3 mb-1">One thing I'm grateful for (optional)</label>
            <input
              type="text"
              value={existingToday?.gratitude ?? todayGratitude}
              onChange={(e) => setTodayGratitude(e.target.value)}
              placeholder="e.g. Family, health, this moment..."
              className="w-full p-3 rounded-xl border border-border bg-background text-sm focus:ring-2 focus:ring-secondary outline-none"
              disabled={!!existingToday}
            />
            {!existingToday && (
              <button
                onClick={handleSave}
                className="mt-4 py-2 px-4 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90"
              >
                Save today's entry
              </button>
            )}
            {existingToday && (
              <p className="mt-3 text-sm text-muted-foreground">Entry saved for today.</p>
            )}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <h3 className="font-display font-bold mb-4 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-secondary" />
              Past entries
            </h3>
            {displayEntries.length === 0 ? (
              <p className="text-sm text-muted-foreground">No entries yet. Start with today's prompt above.</p>
            ) : (
              <ul className="space-y-3">
                {displayEntries.map((entry) => (
                  <li
                    key={entry.date}
                    className="p-4 rounded-xl bg-card border border-border"
                  >
                    <span className="text-xs text-muted-foreground">{entry.date}</span>
                    <p className="text-sm mt-1 line-clamp-2">{entry.content}</p>
                    {entry.gratitude && (
                      <p className="text-xs text-secondary mt-2">Grateful: {entry.gratitude}</p>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </motion.div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
