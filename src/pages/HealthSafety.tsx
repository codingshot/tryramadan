import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { 
  ArrowLeft, AlertTriangle, Heart, Shield, Stethoscope, 
  AlertCircle, CheckCircle, XCircle, Baby, Pill
} from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { PageSEO } from "@/components/PageSEO";

const HealthSafety = () => {
  const contraindications = [
    { icon: Baby, title: "Pregnancy & Breastfeeding", titleAr: "الحمل والرضاعة", desc: "Fasting may affect nutrition for baby" },
    { icon: Pill, title: "Diabetes", titleAr: "السكري", desc: "Risk of hypoglycemia without food" },
    { icon: Heart, title: "Heart Conditions", titleAr: "أمراض القلب", desc: "May affect medication schedules" },
    { icon: Stethoscope, title: "Chronic Illness", titleAr: "الأمراض المزمنة", desc: "Consult doctor before fasting" },
  ];
  
  const safetyTips = [
    { do: true, text: "Stay hydrated between Iftar and Suhoor" },
    { do: true, text: "Eat balanced, nutritious meals" },
    { do: true, text: "Get adequate sleep and rest" },
    { do: true, text: "Break fast immediately if feeling unwell" },
    { do: false, text: "Don't overeat at Iftar" },
    { do: false, text: "Don't skip Suhoor meal" },
    { do: false, text: "Don't engage in extreme physical activity" },
    { do: false, text: "Don't ignore warning signs from your body" },
  ];

  return (
    <div className="min-h-screen bg-background">
      <PageSEO
        title="Health & Safety | TryRamadan.app"
        description="Ramadan fasting health and safety: who should avoid fasting, when to break a fast, hydration and nutrition tips, and when to seek medical advice."
        path="/health-safety"
      />
      <Navbar />
      
      <main className="main-content">
        <div className="container mx-auto px-4 max-w-4xl min-w-0">
          <Link 
            to="/" 
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <h1 className="text-2xl md:text-3xl font-display font-bold">
              Health & Safety
            </h1>
            <p className="text-muted-foreground mt-2">
              Important information for safe fasting practices
            </p>
          </motion.div>
          
          {/* Important disclaimer */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="p-6 rounded-2xl bg-destructive/10 border border-destructive/30 mb-8"
          >
            <div className="flex items-start gap-4">
              <AlertTriangle className="w-6 h-6 text-destructive flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-bold text-lg mb-2">Medical Disclaimer</h3>
                <p className="text-muted-foreground">
                  This app is for informational purposes only and does not constitute medical advice. 
                  Always consult with a healthcare professional before starting any fasting regimen, 
                  especially if you have pre-existing health conditions or take medications.
                </p>
              </div>
            </div>
          </motion.div>
          
          {/* Contraindications */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-8"
          >
            <h2 className="font-display font-bold text-xl mb-4 flex items-center gap-2 flex-wrap">
              <AlertCircle className="w-5 h-5 text-amber-500 flex-shrink-0" />
              Who Should Not Fast
            </h2>
            
            <div className="grid md:grid-cols-2 gap-4">
              {contraindications.map((item, index) => {
                const Icon = item.icon;
                return (
                  <div key={index} className="p-4 rounded-2xl bg-card border border-border">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center flex-shrink-0">
                        <Icon className="w-5 h-5 text-amber-600" />
                      </div>
                      <div>
                        <h4 className="font-medium">{item.title}</h4>
                        <p className="text-sm text-muted-foreground mt-1">{item.desc}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>
          
          {/* Safety tips */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mb-8"
          >
            <h2 className="font-display font-bold text-xl mb-4 flex items-center gap-2 flex-wrap">
              <Shield className="w-5 h-5 text-secondary flex-shrink-0" />
              Safe Fasting Guidelines
            </h2>
            
            <div className="grid md:grid-cols-2 gap-3">
              {safetyTips.map((tip, index) => (
                <div 
                  key={index} 
                  className={`p-3 rounded-xl border flex items-center gap-3 ${
                    tip.do 
                      ? 'bg-green-500/5 border-green-500/20' 
                      : 'bg-red-500/5 border-red-500/20'
                  }`}
                >
                  {tip.do ? (
                    <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                  ) : (
                    <XCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                  )}
                  <span className="text-sm">{tip.text}</span>
                </div>
              ))}
            </div>
          </motion.div>
          
          {/* When to break fast */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="p-6 rounded-2xl bg-card border border-border"
          >
            <h2 className="font-display font-bold text-xl mb-4 flex items-center gap-2">
              <Heart className="w-5 h-5 text-red-500" />
              When to Break Your Fast • متى تفطر
            </h2>
            
            <p className="text-muted-foreground mb-4">
              Islam prioritizes health and life. You should break your fast immediately if you experience:
            </p>
            
            <ul className="space-y-2 text-muted-foreground">
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-red-500" />
                Severe dizziness or fainting
              </li>
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-red-500" />
                Chest pain or difficulty breathing
              </li>
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-red-500" />
                Extreme weakness or confusion
              </li>
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-red-500" />
                Signs of dehydration (dark urine, extreme thirst)
              </li>
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-red-500" />
                Need to take essential medication
              </li>
            </ul>
            
            <div className="mt-4 p-4 rounded-xl bg-secondary/10 border border-secondary/20">
              <p className="text-sm">
                <strong>Remember:</strong> Your health is a trust (Amanah) from Allah. 
                Taking care of your body is an act of worship. Breaking your fast for health reasons is not only 
                permissible but obligatory when necessary.
              </p>
            </div>
          </motion.div>
          
          {/* Emergency link */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mt-8"
          >
            <Link
              to="/emergency"
              className="flex items-center justify-center gap-2 w-full p-4 rounded-2xl border-2 border-destructive/50 text-destructive hover:bg-destructive/10 transition-colors"
            >
              <AlertTriangle className="w-5 h-5" />
              I need to break my fast — open emergency resources
            </Link>
          </motion.div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default HealthSafety;
