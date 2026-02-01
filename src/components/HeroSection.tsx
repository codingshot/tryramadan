import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, Users, BookOpen, Heart, Calendar } from "lucide-react";
import { FastingTimer } from "./FastingTimer";
import { OnboardingModal } from "./OnboardingModal";
import heroBg from "@/assets/hero-bg.jpg";
import logo from "@/assets/logo.png";

// Calculate days until Ramadan 2025
const RAMADAN_START = new Date('2025-02-28T00:00:00');
const getDaysUntilRamadan = () => {
  const now = new Date();
  const diffTime = RAMADAN_START.getTime() - now.getTime();
  return Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
};

export const HeroSection = () => {
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [userMode, setUserMode] = useState<"new" | "muslim" | null>(null);
  const daysUntil = getDaysUntilRamadan();

  const handleStartJourney = () => {
    setShowOnboarding(true);
  };

  const handleOnboardingComplete = (data: any) => {
    console.log("Onboarding complete:", data);
    setUserMode(data.userType);
    // Here you would save to state/context/backend
  };

  return (
    <>
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Background image */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url(${heroBg})` }}
        />
        
        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-primary/80 via-primary/70 to-background" />
        
        {/* Floating decorations */}
        <motion.div 
          className="absolute top-20 left-10 text-6xl opacity-20 hidden md:block"
          animate={{ y: [0, -20, 0], rotate: [0, 5, 0] }}
          transition={{ duration: 6, repeat: Infinity }}
        >
          ☪
        </motion.div>
        <motion.div 
          className="absolute bottom-40 right-10 text-4xl opacity-20 hidden md:block"
          animate={{ y: [0, 20, 0], rotate: [0, -5, 0] }}
          transition={{ duration: 5, repeat: Infinity, delay: 1 }}
        >
          🌙
        </motion.div>

        <div className="relative z-10 container mx-auto px-4 py-24 md:py-32">
          <div className="max-w-5xl mx-auto">
            {/* Days until Ramadan - prominent banner */}
            {daysUntil > 0 && (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex justify-center mb-8"
              >
                <div className="inline-flex items-center gap-3 px-6 py-3 rounded-2xl bg-secondary/20 backdrop-blur-sm border border-secondary/30">
                  <Calendar className="w-6 h-6 text-secondary" />
                  <div className="text-center">
                    <span className="text-3xl md:text-4xl font-bold text-secondary">{daysUntil}</span>
                    <span className="text-primary-foreground/80 ml-2 text-sm md:text-base">
                      days until Ramadan
                    </span>
                  </div>
                  <span className="font-arabic text-secondary text-sm md:text-base">
                    يوم حتى رمضان
                  </span>
                </div>
              </motion.div>
            )}

            {/* Logo and badge */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col items-center mb-6"
            >
              <motion.img 
                src={logo} 
                alt="TryRamadan" 
                className="w-20 h-20 md:w-28 md:h-28 mb-4 drop-shadow-2xl"
                animate={{ scale: [1, 1.03, 1] }}
                transition={{ duration: 4, repeat: Infinity }}
              />
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary/20 text-secondary text-sm font-medium backdrop-blur-sm">
                <span className="w-2 h-2 rounded-full bg-secondary animate-pulse" />
                Ramadan 2025 • رمضان ٢٠٢٥
              </span>
            </motion.div>

            {/* Main headline */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-3xl md:text-5xl lg:text-6xl font-display font-bold text-center text-primary-foreground mb-4 leading-tight"
            >
              Experience{" "}
              <span className="text-gradient-gold">Ramadan</span>
              <span className="font-arabic text-2xl md:text-4xl text-secondary ml-3">رمضان</span>
              <br />
              <span className="text-primary-foreground/90 text-2xl md:text-4xl">Through Cultural Immersion</span>
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-base md:text-lg text-primary-foreground/80 text-center max-w-2xl mx-auto mb-8"
            >
              A wellness journey combining{" "}
              <span className="text-secondary font-semibold">Sawm (صوم)</span> fasting 
              with cultural education and interfaith understanding.
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12"
            >
              <button 
                onClick={handleStartJourney}
                className="btn-hero group flex items-center gap-2 w-full sm:w-auto justify-center"
              >
                <span>Start Your Journey</span>
                <span className="font-arabic text-sm">ابدأ رحلتك</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
              <button 
                onClick={handleStartJourney}
                className="btn-hero-outline w-full sm:w-auto flex items-center justify-center gap-2"
              >
                <span>I'm Already Muslim</span>
                <span className="font-arabic text-sm">أنا مسلم</span>
              </button>
            </motion.div>

            {/* Timer preview */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4 }}
              className="max-w-xl mx-auto"
            >
              <FastingTimer />
            </motion.div>

            {/* Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="grid grid-cols-3 gap-4 md:gap-8 max-w-2xl mx-auto mt-12"
            >
              <div className="text-center">
                <Users className="w-5 h-5 md:w-6 md:h-6 text-secondary mx-auto mb-2" />
                <p className="text-xl md:text-2xl font-bold text-primary-foreground">1.8B+</p>
                <p className="text-xs md:text-sm text-primary-foreground/60">Muslims • مسلمين</p>
              </div>
              <div className="text-center">
                <BookOpen className="w-5 h-5 md:w-6 md:h-6 text-secondary mx-auto mb-2" />
                <p className="text-xl md:text-2xl font-bold text-primary-foreground">30</p>
                <p className="text-xs md:text-sm text-primary-foreground/60">Days • يوم</p>
              </div>
              <div className="text-center">
                <Heart className="w-5 h-5 md:w-6 md:h-6 text-secondary mx-auto mb-2" />
                <p className="text-xl md:text-2xl font-bold text-primary-foreground">100+</p>
                <p className="text-xs md:text-sm text-primary-foreground/60">Traditions • تقاليد</p>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Scroll indicator */}
        <motion.div 
          className="absolute bottom-6 left-1/2 -translate-x-1/2"
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <div className="w-6 h-10 rounded-full border-2 border-primary-foreground/30 flex items-start justify-center p-2">
            <div className="w-1 h-2 rounded-full bg-secondary" />
          </div>
        </motion.div>
      </section>

      {/* Onboarding Modal */}
      <OnboardingModal
        isOpen={showOnboarding}
        onClose={() => setShowOnboarding(false)}
        onComplete={handleOnboardingComplete}
      />
    </>
  );
};
