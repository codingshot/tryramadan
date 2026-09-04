import { useState, useCallback } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { 
  ArrowLeft, BookOpen, Globe, Languages, Heart, Moon, Calendar, 
  ChevronRight, Star, Award, CheckCircle, Lightbulb, RotateCcw
} from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { HeroDailySlider } from "@/components/HeroDailySlider";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import dailyFactsData from "@/data/daily-facts.json";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { PageSEO } from "@/components/PageSEO";

const QUIZ_QUESTIONS = [
  { q: "In which month of the Islamic calendar does Ramadan fall?", options: ["Seventh", "Eighth", "Ninth", "Tenth"], correct: 2, explanation: "Ramadan is the ninth month of the Islamic (lunar) calendar. It is the month in which the Quran was first revealed." },
  { q: "What is the pre-dawn meal before fasting called?", options: ["Iftar", "Suhoor", "Taraweeh", "Zakat"], correct: 1, explanation: "Suhoor is the meal eaten before dawn. Iftar is the meal at sunset when the fast is broken; Zakat is charity." },
  { q: "Laylat al-Qadr is often sought on which nights?", options: ["First ten", "Even nights of last ten", "Odd nights of last ten", "First and last night"], correct: 2, explanation: "Laylat al-Qadr (Night of Decree) is most likely one of the odd nights of the last ten days of Ramadan (21st, 23rd, 25th, 27th, or 29th)." },
  { q: "When does the daily fast begin?", options: ["At midnight", "At dawn (before Fajr)", "At sunrise", "At noon"], correct: 1, explanation: "The fast begins at dawn (Fajr time). The pre-dawn meal (suhoor) should be finished before Fajr begins." },
  { q: "When do Muslims break the fast?", options: ["At noon (Dhuhr)", "At sunset (Maghrib)", "At midnight", "After Isha"], correct: 1, explanation: "The fast is broken at Maghrib (sunset). Many break it with dates and water, following the Prophet’s tradition." },
  { q: "Which intentionally breaks the fast?", options: ["Rinsing the mouth", "Eating or drinking", "Brushing teeth without swallowing water", "Using eye drops"], correct: 1, explanation: "Intentionally eating or drinking breaks the fast. Rinsing the mouth, brushing teeth without swallowing, and eye drops are generally considered not to break it." },
  { q: "Who is generally exempt from fasting?", options: ["Only children under 7", "Travelers, the sick, pregnant/nursing women", "Only the elderly", "Only those who work"], correct: 1, explanation: "Exemptions include travelers, the sick, pregnant and nursing women, the elderly, and children. Missed days are made up (qada) when possible." },
  { q: "What should Muslims who miss fasts do?", options: ["Nothing", "Make up missed days later (qada)", "Donate only", "Fast double next year"], correct: 1, explanation: "Missed fasts must be made up later (qada) when one is able. Fidyah (feeding the poor) may apply for those who cannot make them up." },
  { q: "What is the intention (niyyah) for fasting?", options: ["Optional", "Required for the fast to be valid", "Only on the first day", "Only for voluntary fasts"], correct: 1, explanation: "Having the intention (niyyah) to fast is required for the fast to be valid. It can be made in the heart, ideally before Fajr." },
  { q: "What is the night prayer often performed in Ramadan called?", options: ["Isha", "Fajr", "Taraweeh", "Witr only"], correct: 2, explanation: "Taraweeh is the extra night prayer performed in Ramadan, usually after Isha. It is a sunnah (recommended) practice." },
];

const DashboardLearn = () => {
  const [readLinks, setReadLinks] = useLocalStorage<string[]>("tryramadan-learn-read", []);
  const [quizStarted, setQuizStarted] = useState(false);
  const [quizIndex, setQuizIndex] = useState(0);
  const [quizAnswer, setQuizAnswer] = useState<number | null>(null);
  const [quizScore, setQuizScore] = useState<number | null>(null);

  const factDay = (new Date().getDate() % 30) || 30;
  const dailyFact = (dailyFactsData as { facts: { day: number; title: string; content: string }[] }).facts.find((f) => f.day === factDay) || (dailyFactsData as { facts: { day: number; title: string; content: string }[] }).facts[0];

  const markAsRead = useCallback((e: React.MouseEvent, link: string) => {
    e.preventDefault();
    e.stopPropagation();
    setReadLinks((prev) => (prev.includes(link) ? prev : [...prev, link]));
  }, [setReadLinks]);

  const handleQuizSubmit = useCallback(() => {
    if (quizAnswer === null) return;
    const correct = quizAnswer === QUIZ_QUESTIONS[quizIndex].correct;
    const isLast = quizIndex + 1 >= QUIZ_QUESTIONS.length;
    setQuizScore((prev) => (prev ?? 0) + (correct ? 1 : 0));
    if (isLast) {
      setQuizStarted(false);
      setQuizIndex(0);
      setQuizAnswer(null);
    } else {
      setQuizIndex((i) => i + 1);
      setQuizAnswer(null);
    }
  }, [quizIndex, quizAnswer]);

  const startQuiz = useCallback(() => {
    setQuizStarted(true);
    setQuizIndex(0);
    setQuizAnswer(null);
    setQuizScore(null);
  }, []);

  const learningPaths = [
    {
      title: 'Ramadan Basics',
      titleAr: 'أساسيات رمضان',
      description: 'Understanding the fundamentals of Ramadan',
      icon: Moon,
      link: '/faq',
      color: 'bg-secondary/20 text-secondary',
    },
    {
      title: 'Fasting Rules',
      titleAr: 'أحكام الصيام',
      description: 'What breaks a fast and best practices',
      icon: BookOpen,
      link: '/faq',
      color: 'bg-primary/20 text-foreground',
    },
    {
      title: 'Taraweeh Prayer',
      titleAr: 'صلاة التراويح',
      description: 'Night prayers in Ramadan, Quran completion, and mosque traditions',
      icon: Moon,
      link: '/dashboard/prayers',
      color: 'bg-violet-500/20 text-violet-600',
    },
    {
      title: 'Islamic Glossary',
      titleAr: 'المصطلحات الإسلامية',
      description: 'Arabic-English terms with definitions',
      icon: Languages,
      link: '/learn/glossary',
      color: 'bg-amber-500/20 text-amber-600',
    },
    {
      title: 'Sunnah Fasting',
      titleAr: 'صوم السنة',
      description: 'Voluntary fasting throughout the year',
      icon: Star,
      link: '/learn/hadith',
      color: 'bg-blue-500/20 text-blue-600',
    },
    {
      title: 'Health Benefits',
      titleAr: 'الفوائد الصحية',
      description: 'Science-backed benefits of fasting',
      icon: Heart,
      link: '/health-safety',
      color: 'bg-red-500/20 text-red-600',
    },
    {
      title: 'Hadith Collection',
      titleAr: 'مجموعة الأحاديث',
      description: 'Prophetic sayings about fasting',
      icon: BookOpen,
      link: '/learn/hadith',
      color: 'bg-emerald-500/20 text-emerald-600',
    },
    {
      title: 'World Traditions',
      titleAr: 'تقاليد العالم',
      description: 'Ramadan customs from different countries',
      icon: Globe,
      link: '/dashboard/culture',
      color: 'bg-purple-500/20 text-purple-600',
    },
    {
      title: 'Prayer Tutorials',
      titleAr: 'تعليم الصلاة',
      description: 'Learn about the five daily prayers',
      icon: Calendar,
      link: '/dashboard/prayers',
      color: 'bg-indigo-500/20 text-indigo-600',
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <PageSEO
        title="Learn | TryRamadan.app"
        description="Learn about Ramadan: daily hadith, Islamic facts, glossary, and quiz. Build knowledge while you fast."
        path="/dashboard/learn"
      />
      <Navbar />
      
      <main id="main-content" className="main-content">
        <div className="container mx-auto px-4 max-w-4xl min-w-0">
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
              Learn & Explore
              <span className="block font-arabic text-lg text-secondary mt-1">تعلم واستكشف</span>
            </h1>
            <p className="text-muted-foreground mt-2">
              Deepen your understanding of Ramadan, Islamic traditions, and fasting
            </p>
          </motion.div>
          
          {/* Daily Ramadan fact */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="p-5 rounded-2xl bg-secondary/10 border border-secondary/20 mb-6"
          >
            <div className="flex items-center gap-2 mb-2">
              <Lightbulb className="w-5 h-5 text-secondary" />
              <span className="font-display font-bold text-secondary">Daily Ramadan fact • حقيقة اليوم</span>
            </div>
            <h3 className="font-medium mb-1">{dailyFact.title}</h3>
            <p className="text-sm text-muted-foreground">{dailyFact.content}</p>
          </motion.div>

          {/* Daily Hadith & Quran (tabs + day arrows) */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-8"
          >
            <HeroDailySlider />
          </motion.div>

          {/* Quiz */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.12 }}
            className="p-6 rounded-2xl bg-card border border-border mb-8"
          >
            <h3 className="font-display font-bold mb-2">Quick knowledge check</h3>
            <p className="text-sm text-muted-foreground mb-4">Test your Ramadan knowledge: basic rules, when to fast, what breaks the fast, who is exempt, and more.</p>
            {!quizStarted && quizScore === null && (
              <Button variant="outline" onClick={startQuiz}>Start quiz</Button>
            )}
            {quizStarted && (
              <div>
                <p className="font-medium mb-3">{QUIZ_QUESTIONS[quizIndex].q}</p>
                <div className="space-y-2">
                  {QUIZ_QUESTIONS[quizIndex].options.map((opt, i) => {
                    const correctIdx = QUIZ_QUESTIONS[quizIndex].correct;
                    const selected = quizAnswer === i;
                    const showCorrect = quizAnswer !== null && i === correctIdx;
                    const showIncorrect = quizAnswer !== null && selected && i !== correctIdx;
                    return (
                      <button
                        key={i}
                        type="button"
                        onClick={() => quizAnswer === null && setQuizAnswer(i)}
                        disabled={quizAnswer !== null}
                        className={`block w-full text-left px-4 py-2 rounded-lg border transition-colors ${
                          quizAnswer === null
                            ? "border-border hover:border-secondary/50"
                            : showCorrect
                              ? "border-green-600 bg-green-500/10 text-green-700 dark:text-green-400"
                              : showIncorrect
                                ? "border-destructive/60 bg-destructive/10 text-destructive"
                                : "border-border text-muted-foreground"
                        }`}
                      >
                        {opt}
                      </button>
                    );
                  })}
                </div>
                {quizAnswer !== null && (
                  <div className="mt-4 p-4 rounded-xl border border-secondary/30 bg-secondary/5 space-y-2" role="status" aria-live="polite">
                    <p className={`font-medium text-sm ${quizAnswer === QUIZ_QUESTIONS[quizIndex].correct ? "text-green-700 dark:text-green-400" : "text-destructive"}`}>
                      {quizAnswer === QUIZ_QUESTIONS[quizIndex].correct ? "Correct!" : `Correct answer: ${QUIZ_QUESTIONS[quizIndex].options[QUIZ_QUESTIONS[quizIndex].correct]}`}
                    </p>
                    <p className="text-sm text-muted-foreground">{QUIZ_QUESTIONS[quizIndex].explanation}</p>
                  </div>
                )}
                <Button className="mt-4" onClick={handleQuizSubmit} disabled={quizAnswer === null}>
                  {quizIndex + 1 >= QUIZ_QUESTIONS.length ? "Finish" : "Next"}
                </Button>
              </div>
            )}
            {quizScore !== null && !quizStarted && (
              <div>
                <p className="font-medium text-secondary">Score: {quizScore} / {QUIZ_QUESTIONS.length}</p>
                <Button variant="outline" size="sm" className="mt-2 gap-1" onClick={startQuiz}>
                  <RotateCcw className="w-4 h-4" /> Retake quiz
                </Button>
              </div>
            )}
          </motion.div>
          
          {/* Learning paths grid */}
          <div className="grid md:grid-cols-2 gap-4">
            {learningPaths.map((path, index) => {
              const Icon = path.icon;
              
              return (
                <motion.div
                  key={path.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15 + index * 0.05 }}
                >
                  <Link 
                    to={path.link}
                    className="block p-5 rounded-2xl bg-card border border-border hover:border-secondary/50 hover:shadow-lg transition-all group relative"
                  >
                    {readLinks.includes(path.link) && (
                      <span className="absolute top-3 right-3 text-secondary" title="Read • مقروء" aria-hidden>
                        <CheckCircle className="w-5 h-5" />
                      </span>
                    )}
                    <div className="flex items-start gap-4">
                      <div className={`w-12 h-12 rounded-xl ${path.color} flex items-center justify-center flex-shrink-0`}>
                        <Icon className="w-6 h-6" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="font-display font-bold">{path.title}</h3>
                            <span className="text-sm text-secondary font-arabic">{path.titleAr}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <button
                                  type="button"
                                  onClick={(e) => markAsRead(e, path.link)}
                                  className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-secondary transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
                                  aria-label={readLinks.includes(path.link) ? "Mark as unread" : "Mark as read"}
                                >
                                  <CheckCircle className={`w-4 h-4 ${readLinks.includes(path.link) ? "text-secondary" : ""}`} />
                                </button>
                              </TooltipTrigger>
                              <TooltipContent>
                                {readLinks.includes(path.link) ? "Mark as unread" : "Mark as read"} • {path.titleAr}
                              </TooltipContent>
                            </Tooltip>
                            <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-secondary group-hover:translate-x-1 transition-all" />
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">{path.description}</p>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </div>
          
          {/* Achievement teaser */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="mt-8 p-6 rounded-2xl bg-gradient-to-r from-secondary/20 to-primary/20 border border-secondary/30"
          >
            <div className="flex items-center gap-4 flex-wrap">
              <div className="w-16 h-16 rounded-full bg-gradient-gold flex items-center justify-center shrink-0">
                <Award className="w-8 h-8 text-foreground" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-display font-bold text-lg">Earn Learning Badges</h3>
                <p className="text-sm text-muted-foreground">
                  {readLinks.length > 0 && (
                    <span className="text-secondary font-medium">{readLinks.length} of {learningPaths.length} topics marked as read. </span>
                  )}
                  Complete learning modules to unlock achievements and track your progress.
                </p>
              </div>
              <Link 
                to="/dashboard/achievements"
                className="px-4 py-2 rounded-lg bg-secondary text-secondary-foreground text-sm font-medium shrink-0"
              >
                View Badges
              </Link>
            </div>
          </motion.div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default DashboardLearn;
