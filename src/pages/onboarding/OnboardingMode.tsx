import { useEffect } from "react";
import { motion } from "framer-motion";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { ArrowLeft, ArrowRight, Check } from "lucide-react";
import { useOnboarding } from "@/contexts/OnboardingContext";

const KNOWLEDGE_QUIZ_LENGTH = 5;

export default function OnboardingMode() {
  const { state, setMode, setKnowledgeScore } = useOnboarding();
  const navigate = useNavigate();
  const location = useLocation();
  const preSelectMuslim = (location.state as { preSelectMuslim?: boolean } | null)?.preSelectMuslim;

  useEffect(() => {
    if (preSelectMuslim) setMode("muslim");
  }, [preSelectMuslim, setMode]);

  const handleSelect = (mode: "new" | "muslim") => {
    setMode(mode);
    if (mode === "muslim") {
      setKnowledgeScore(KNOWLEDGE_QUIZ_LENGTH);
      navigate("/onboarding/health");
    } else {
      navigate("/onboarding/knowledge");
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <Link
        to="/onboarding/welcome"
        className="inline-flex items-center gap-1 text-muted-foreground hover:text-foreground mb-6"
      >
        <ArrowLeft className="w-4 h-4" /> Back
      </Link>
      <h2 className="font-display text-2xl font-bold mb-2">Choose your mode</h2>
      <p className="text-muted-foreground mb-6 font-arabic">أخبرنا عن نفسك</p>

      <div className="space-y-4">
        <button
          type="button"
          onClick={() => handleSelect("new")}
          className={`w-full min-h-[44px] p-6 rounded-2xl border-2 transition-all text-left hover:border-secondary cursor-pointer touch-manipulation ${
            state.mode === "new" ? "border-secondary bg-secondary/5" : "border-border"
          }`}
        >
          <div className="flex items-start gap-4">
            <span className="text-3xl">🌱</span>
            <div className="flex-1">
              <h3 className="font-bold text-lg">Non-Muslim Mode</h3>
              <p className="font-arabic text-secondary text-sm">تعلم واختبر</p>
              <p className="text-muted-foreground text-sm mt-1">
                Learning focus: explore fasting, culture, and wellness at your own pace.
              </p>
            </div>
            {state.mode === "new" && <Check className="w-5 h-5 text-secondary flex-shrink-0" />}
          </div>
        </button>

        <button
          type="button"
          onClick={() => handleSelect("muslim")}
          className={`w-full min-h-[44px] p-6 rounded-2xl border-2 transition-all text-left hover:border-secondary cursor-pointer touch-manipulation ${
            state.mode === "muslim" ? "border-secondary bg-secondary/5" : "border-border"
          }`}
        >
          <div className="flex items-start gap-4">
            <span className="text-3xl">☪️</span>
            <div className="flex-1">
              <h3 className="font-bold text-lg">Muslim Mode</h3>
              <p className="font-arabic text-secondary text-sm">أنا مسلم</p>
              <p className="text-muted-foreground text-sm mt-1">
                Full religious observance support: prayer times, Ramadan tracking, and spiritual content.
              </p>
            </div>
            {state.mode === "muslim" && <Check className="w-5 h-5 text-secondary flex-shrink-0" />}
          </div>
        </button>
      </div>
    </motion.div>
  );
}
