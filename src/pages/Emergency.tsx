import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { 
  ArrowLeft, Heart, AlertTriangle, Phone, Droplets, 
  Coffee, Check, Home
} from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { ArabicHover } from "@/components/ArabicHover";
import { useFastingProgress, breakFastingToday } from "@/hooks/useLocalStorage";
import { BreakFastReasonDialog } from "@/components/BreakFastReasonDialog";
import { PageSEO } from "@/components/PageSEO";
import { useState } from "react";

const Emergency = () => {
  const navigate = useNavigate();
  const [progress, setProgress] = useFastingProgress();
  const [showReasonDialog, setShowReasonDialog] = useState(false);

  const handleBreakFastWithReason = (reasonId: string) => {
    breakFastingToday(progress, setProgress, reasonId);
    navigate("/dashboard");
  };
  
  const steps = [
    { icon: Droplets, text: "Drink water slowly", textAr: "اشرب الماء ببطء" },
    { icon: Coffee, text: "Eat something light (dates, fruit)", textAr: "تناول شيء خفيف (تمر، فاكهة)" },
    { icon: Heart, text: "Rest and take deep breaths", textAr: "استرح وتنفس بعمق" },
  ];

  return (
    <div className="min-h-screen bg-background">
      <PageSEO
        title="Break Fast Safely | TryRamadan.app"
        description="Break your fast safely: step-by-step guidance, when to seek help, and how to log breaking a fast. Your health comes first."
        path="/emergency"
      />
      <Navbar />
      
      <main className="main-content">
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
            className="text-center mb-8"
          >
            <div className="w-20 h-20 rounded-full bg-destructive/20 mx-auto mb-4 flex items-center justify-center">
              <AlertTriangle className="w-10 h-10 text-destructive" />
            </div>
            <h1 className="text-2xl md:text-3xl font-display font-bold">
              <ArabicHover arabic="لا بأس أن تفطر">It's Okay to Break Your Fast</ArabicHover>
            </h1>
          </motion.div>
          
          {/* Reassurance */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="p-6 rounded-2xl bg-card border border-border mb-8"
          >
            <p className="text-center text-lg leading-relaxed">
              Your health is a trust (<ArabicHover arabic="أمانة">trust</ArabicHover>) from Allah. 
              Taking care of your body is an act of worship. 
              <strong className="block mt-2">You are not a failure.</strong>
            </p>
          </motion.div>
          
          {/* Quick steps */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-8"
          >
            <h2 className="font-display font-bold text-lg mb-4 text-center">
              <ArabicHover arabic="ماذا تفعل الآن">What to do now</ArabicHover>
            </h2>
            
            <div className="space-y-3">
              {steps.map((step, index) => {
                const Icon = step.icon;
                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 + index * 0.1 }}
                    className="flex items-center gap-4 p-4 rounded-2xl bg-secondary/10 border border-secondary/20"
                  >
                    <div className="w-12 h-12 rounded-full bg-secondary/20 flex items-center justify-center">
                      <Icon className="w-6 h-6 text-secondary" />
                    </div>
                    <div>
                      <span className="font-medium block">
                        <ArabicHover arabic={step.textAr}>{step.text}</ArabicHover>
                      </span>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
          
          {/* Dua */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="p-6 rounded-2xl bg-gradient-to-br from-primary/10 to-secondary/10 border border-border mb-8 text-center"
          >
            <p className="font-arabic text-xl sm:text-2xl text-secondary mb-3 break-words">
              ذَهَبَ الظَّمَأُ وَابْتَلَّتِ الْعُرُوقُ وَثَبَتَ الْأَجْرُ إِنْ شَاءَ اللَّهُ
            </p>
            <p className="text-muted-foreground italic">
              "The thirst has gone, the veins are moistened, and the reward is confirmed, if Allah wills."
            </p>
            <p className="text-xs text-muted-foreground mt-2">
              — Dua for breaking fast (Sunan Abu Dawud)
            </p>
          </motion.div>
          
          {/* Important reminders */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="p-6 rounded-2xl bg-card border border-border mb-8"
          >
            <h3 className="font-bold mb-4 flex items-center gap-2">
              <Heart className="w-5 h-5 text-red-500" />
              Remember • تذكر
            </h3>
            <ul className="space-y-3 text-muted-foreground">
              <li className="flex items-start gap-2">
                <Check className="w-5 h-5 text-secondary flex-shrink-0 mt-0.5" />
                <span>The Prophet (PBUH) said: "Allah has no need for the hunger and thirst of someone who doesn't restrain from bad speech and actions."</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-5 h-5 text-secondary flex-shrink-0 mt-0.5" />
                <span>Missing one fast can be made up later (Qada). Your intention still matters.</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-5 h-5 text-secondary flex-shrink-0 mt-0.5" />
                <span>Allah knows your struggle. Every good intention is rewarded.</span>
              </li>
            </ul>
          </motion.div>
          
          {/* Emergency contacts */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="p-4 rounded-2xl bg-destructive/10 border border-destructive/30 mb-8"
          >
            <div className="flex items-center gap-3">
              <Phone className="w-5 h-5 text-destructive" />
              <div>
                <p className="font-medium">If you're experiencing a medical emergency</p>
                <p className="text-sm text-muted-foreground">Call emergency services immediately: 911 (US) / 999 (UK) / 112 (EU)</p>
              </div>
            </div>
          </motion.div>
          
          {/* Actions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="flex flex-col gap-3 [&_button]:min-h-[48px]"
          >
            <button
              onClick={() => setShowReasonDialog(true)}
              className="w-full py-4 rounded-2xl bg-secondary text-secondary-foreground font-medium flex items-center justify-center gap-2"
            >
              <Check className="w-5 h-5" />
              I've broken my fast — choose reason & return
            </button>
            <BreakFastReasonDialog
              open={showReasonDialog}
              onOpenChange={setShowReasonDialog}
              onSelectReason={handleBreakFastWithReason}
              title="Why did you break your fast?"
            />
            
            <button
              onClick={() => navigate('/dashboard')}
              className="w-full py-4 rounded-2xl bg-muted text-foreground font-medium flex items-center justify-center gap-2"
            >
              <Home className="w-5 h-5" />
              I'm okay - Continue fasting
            </button>
          </motion.div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Emergency;
