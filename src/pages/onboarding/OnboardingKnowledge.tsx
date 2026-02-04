import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, ArrowRight, Check, X } from "lucide-react";
import { useOnboarding } from "@/contexts/OnboardingContext";

const QUIZ = [
  { q: "What is Ramadan?", options: ["A festival", "A month of fasting", "A prayer"], emojis: ["🎉", "🌙", "🤲"], correct: 1 },
  { q: "When do Muslims break their daily fast?", options: ["At noon", "At sunset (Maghrib)", "At midnight"], emojis: ["☀️", "🌅", "🌙"], correct: 1 },
  { q: "What is Suhoor?", options: ["Evening meal", "Pre-dawn meal", "Midday snack"], emojis: ["🍽️", "🌄", "☀️"], correct: 1 },
  { q: "How long does Ramadan last?", options: ["One week", "One lunar month", "One year"], emojis: ["📅", "🌙", "📆"], correct: 1 },
  {
    q: "Which one is NOT one of the Five Pillars of Islam?",
    options: [
      "Declaration of faith (Shahada)",
      "Five daily prayers (Salat)",
      "Charity to the needy (Zakat)",
      "Fasting in Ramadan (Sawm)",
      "Pilgrimage to Mecca (Hajj)",
      "Jihad (striving or struggle)",
    ],
    emojis: ["📜", "🕌", "💝", "🌙", "🕋", "⚔️"],
    correct: 5, // Jihad is not a pillar; the five pillars are Shahada, Salat, Zakat, Sawm, Hajj
  },
];

export default function OnboardingKnowledge() {
  const { state, setKnowledgeScore } = useOnboarding();
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const navigate = useNavigate();

  const question = QUIZ[current];
  const isLast = current === QUIZ.length - 1;
  const correctIndex = question.correct;
  const isCorrect = selectedOption !== null && selectedOption === correctIndex;

  const handleAnswer = (optionIndex: number) => {
    if (selectedOption !== null) return;
    setSelectedOption(optionIndex);
  };

  const handleNext = () => {
    if (selectedOption === null) return;
    const newAnswers = [...answers, selectedOption];
    setAnswers(newAnswers);
    setSelectedOption(null);
    if (isLast) {
      const score = newAnswers.filter((a, i) => a === QUIZ[i].correct).length;
      setKnowledgeScore(score);
      navigate("/onboarding/health");
    } else {
      setCurrent(current + 1);
    }
  };

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key !== "ArrowLeft") return;
      const target = e.target as HTMLElement;
      if (target.closest("input") || target.closest("textarea") || target.closest("select")) return;
      if (current > 0 && selectedOption === null) {
        e.preventDefault();
        setCurrent((c) => c - 1);
        setAnswers((a) => a.slice(0, -1));
      } else if (current === 0) {
        e.preventDefault();
        navigate("/onboarding/mode");
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [current, selectedOption, navigate]);

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col min-h-0 flex-1">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (selectedOption !== null) handleNext();
        }}
        className="flex flex-col min-h-0 flex-1"
      >
        <div className="flex-1 min-h-0 overflow-y-auto">
      <Link
        to={current === 0 ? "/onboarding/mode" : "#"}
        onClick={(e) => {
          if (current > 0 && selectedOption === null) {
            e.preventDefault();
            setCurrent(current - 1);
            setAnswers(answers.slice(0, -1));
          }
        }}
        className="inline-flex items-center gap-1 text-muted-foreground hover:text-foreground mb-6"
      >
        <ArrowLeft className="w-4 h-4" /> Back
      </Link>
      <h2 className="font-display text-2xl font-bold mb-2">Quick knowledge check</h2>
      <p className="text-muted-foreground mb-6">We'll tailor content to your level. No pressure.</p>
      {state.mode === "muslim" && (
        <button
          type="button"
          onClick={() => {
            setKnowledgeScore(QUIZ.length);
            navigate("/onboarding/health");
          }}
          className="w-full mb-6 py-2.5 px-4 rounded-xl border border-secondary/50 text-secondary font-medium text-sm hover:bg-secondary/10 transition-colors"
        >
          Skip — I already know this
        </button>
      )}

      <div className="mb-6">
        <div className="flex gap-1 mb-4">
          {QUIZ.map((_, i) => (
            <div
              key={i}
              className={`h-1 flex-1 rounded ${
                i < current ? "bg-secondary" : i === current ? "bg-primary" : "bg-muted"
              }`}
            />
          ))}
        </div>
        <p className="text-sm font-medium mb-4">{question.q}</p>
        <div className="space-y-2">
          {question.options.map((opt, i) => {
            const isSelected = selectedOption === i;
            const showCorrect = selectedOption !== null && i === correctIndex;
            const showIncorrect = selectedOption !== null && isSelected && i !== correctIndex;
            const emoji = question.emojis?.[i] ?? "•";
            return (
              <button
                key={i}
                type="button"
                onClick={() => handleAnswer(i)}
                disabled={selectedOption !== null}
                className={`w-full min-h-[44px] p-4 rounded-xl border-2 text-left transition-all touch-manipulation flex items-center gap-3 ${
                  selectedOption !== null
                    ? "cursor-default"
                    : "cursor-pointer border-border hover:border-secondary"
                } ${
                  showCorrect
                    ? "border-green-600 bg-green-500/10 text-green-700 dark:text-green-400"
                    : showIncorrect
                      ? "border-destructive/60 bg-destructive/10 text-destructive"
                      : "border-border"
                }`}
              >
                <span className="text-xl shrink-0" aria-hidden>{emoji}</span>
                <span className="flex-1">{opt}</span>
                {showCorrect && <Check className="w-5 h-5 shrink-0 text-green-600 dark:text-green-400" aria-hidden />}
                {showIncorrect && <X className="w-5 h-5 shrink-0 text-destructive" aria-hidden />}
              </button>
            );
          })}
        </div>

        {selectedOption !== null && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 p-4 rounded-xl border-2 border-secondary/30 bg-secondary/5"
          >
            <p className={`font-medium flex items-center gap-2 ${isCorrect ? "text-green-700 dark:text-green-400" : "text-destructive"}`}>
              {isCorrect ? (
                <>
                  <Check className="w-5 h-5 shrink-0" aria-hidden />
                  Correct!
                </>
              ) : (
                <>
                  <X className="w-5 h-5 shrink-0" aria-hidden />
                  Incorrect. The correct answer is: {question.options[correctIndex]}
                </>
              )}
            </p>
          </motion.div>
        )}
      </div>
        </div>

        {selectedOption !== null && (
          <div className="sticky bottom-0 left-0 right-0 z-10 bg-background border-t border-border pt-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] -mx-4 px-4 mt-4 sm:static sm:border-0 sm:pt-0 sm:pb-0 sm:mx-0 sm:px-0 sm:mt-0">
            <button
              type="submit"
              className="w-full min-h-[44px] py-3 px-6 rounded-xl bg-primary text-primary-foreground font-medium hover:bg-primary/90 flex items-center justify-center gap-2 cursor-pointer"
            >
              {isLast ? "Continue" : "Next question"}
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        )}
      </form>
    </motion.div>
  );
}
