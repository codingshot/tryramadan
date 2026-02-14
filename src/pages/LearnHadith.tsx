import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowLeft, BookOpen, Check, ExternalLink, Filter } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { HadithSunnahLink } from "@/components/HadithSunnahLink";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useActivityLog, useDisplayTimezone, getTodayDateString } from "@/hooks/useLocalStorage";
import { getTodayStringInTimezone } from "@/lib/utils";
import hadithsData from "@/data/hadiths.json";
import { PageSEO } from "@/components/PageSEO";

const LearnHadith = () => {
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
  const [activityEntries, addEntry] = useActivityLog();
  const displayTimezone = useDisplayTimezone();
  const todayStr = displayTimezone ? getTodayStringInTimezone(displayTimezone) : getTodayDateString();

  const readHadithIds = useMemo(
    () => new Set(activityEntries.filter((e) => e.type === "hadith_read" && e.hadithId != null).map((e) => e.hadithId)),
    [activityEntries],
  );

  const topics = [...new Set(hadithsData.hadiths.map((h) => h.topic))];

  const filteredHadiths = selectedTopic
    ? hadithsData.hadiths.filter((h) => h.topic === selectedTopic)
    : hadithsData.hadiths;

  return (
    <div className="min-h-screen bg-background">
      <PageSEO
        title="Hadith Collection | TryRamadan.app"
        description="Prophetic sayings about fasting, Ramadan, and spiritual conduct. Browse hadith by topic for daily reflection."
        path="/learn/hadith"
      />
      <Navbar />
      
      <main id="main-content" className="main-content">
        <div className="container mx-auto px-4 max-w-4xl min-w-0">
          <Link 
            to="/dashboard/learn" 
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Learn
          </Link>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <h1 className="text-2xl md:text-3xl font-display font-bold">
              Hadith Collection
            </h1>
            <p className="text-muted-foreground mt-2">
              Prophetic sayings about fasting, Ramadan, and spiritual conduct
            </p>
          </motion.div>
          
          {/* Topic filters */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="flex flex-wrap gap-2 mb-8"
          >
            <button
              onClick={() => setSelectedTopic(null)}
              className={`px-4 py-2 rounded-full text-sm transition-all flex items-center gap-2 ${
                !selectedTopic 
                  ? 'bg-secondary text-secondary-foreground' 
                  : 'bg-muted hover:bg-muted/80'
              }`}
            >
              <Filter className="w-4 h-4" />
              All Topics
            </button>
            {topics.map(topic => (
              <button
                key={topic}
                onClick={() => setSelectedTopic(topic)}
                className={`px-4 py-2 rounded-full text-sm transition-all ${
                  selectedTopic === topic 
                    ? 'bg-secondary text-secondary-foreground' 
                    : 'bg-muted hover:bg-muted/80'
                }`}
              >
                {topic}
              </button>
            ))}
          </motion.div>
          
          {/* Hadith cards */}
          <div className="space-y-6">
            {filteredHadiths.map((hadith, index) => (
              <motion.div
                key={hadith.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 + index * 0.05 }}
                className="p-6 rounded-2xl bg-card border border-border"
              >
                <Tooltip delayDuration={200}>
                  <TooltipTrigger asChild>
                    <div className="flex items-center gap-2 mb-4">
                      <BookOpen className="w-5 h-5 text-secondary" />
                      <span className="text-sm text-secondary font-medium">{hadith.topic}</span>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>View this hadith on Sunnah.com</p>
                  </TooltipContent>
                </Tooltip>
                
                <blockquote className="text-lg leading-relaxed mb-4 pl-4 border-l-4 border-secondary">
                  "{hadith.text}"
                </blockquote>
                
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <HadithSunnahLink source={hadith.source} className="text-sm text-muted-foreground hover:text-secondary transition-colors flex items-center gap-1">
                    {hadith.source}
                    <ExternalLink className="w-3 h-3 ml-0.5" />
                  </HadithSunnahLink>
                  {readHadithIds.has(String(hadith.id)) ? (
                    <span className="inline-flex items-center gap-1.5 text-xs font-medium text-secondary">
                      <Check className="w-4 h-4" aria-hidden />
                      Read
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => addEntry({ type: "hadith_read", date: todayStr, hadithId: String(hadith.id) })}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border bg-muted/50 hover:bg-muted text-sm font-medium transition-colors"
                    >
                      <Check className="w-4 h-4" aria-hidden />
                      Mark as read
                    </button>
                  )}
                </div>

                <div className="mt-4 pt-4 border-t border-border">
                  <p className="text-sm text-muted-foreground">
                    <span className="font-medium text-foreground">Context: </span>
                    {hadith.context}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
          
          {/* Source attribution */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mt-8 p-4 rounded-2xl bg-muted/50 border border-border text-center"
          >
            <p className="text-sm text-muted-foreground">
              Hadith sourced from authentic collections. For more, visit{" "}
              <a 
                href="https://sunnah.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-secondary hover:underline"
              >
                Sunnah.com
              </a>
            </p>
          </motion.div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default LearnHadith;
