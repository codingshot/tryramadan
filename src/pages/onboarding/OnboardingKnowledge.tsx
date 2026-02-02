import { useState } from "react";
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { useOnboarding } from "@/contexts/OnboardingContext";

const QUIZ = [
  { q: "What is Ramadan?", options: ["A festival", "A month of fasting", "A prayer"], correct: 1 },
  { q: "When do Muslims break their daily fast?", options: ["At noon", "At sunset (Maghrib)", "At midnight"], correct: 1 },
  { q: "What is Suhoor?", options: ["Evening meal", "Pre-dawn meal", "Midday snack"], correct: 1 },
  { q: "How long does Ramadan last?", options: ["One week", "One lunar month", "One year"], correct: 1 },
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
    correct: 5, // Jihad is not a pillar; the five pillars are Shahada, Salat, Zakat, Sawm, Hajj
  },
];

export default function OnboardingKnowledge() {
  const { state, setKnowledgeScore } = useOnboarding();
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const navigate = useNavigate();

  const question = QUIZ[current];
  const isLast = current === QUIZ.length - 1;

  const handleAnswer = (optionIndex: number) => {
    const newAnswers = [...answers, optionIndex];
    setAnswers(newAnswers);
    if (isLast) {
      const score = newAnswers.filter((a, i) => a === QUIZ[i].correct).length;
      setKnowledgeScore(score);
      navigate("/onboarding/health");
    } else {
      setCurrent(current + 1);
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <Link
        to={current === 0 ? "/onboarding/mode" : "#"}
        onClick={(e) => {
          if (current > 0) {
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
          {question.options.map((opt, i) => (
            <button
              key={i}
              type="button"
              onClick={() => handleAnswer(i)}
              className="w-full min-h-[44px] p-4 rounded-xl border-2 border-border hover:border-secondary text-left transition-all cursor-pointer touch-manipulation"
            >
              {opt}
            </button>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
