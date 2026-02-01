import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { FastingTimer } from "./FastingTimer";
import { ArabicHover } from "./ArabicHover";
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
  const daysUntil = getDaysUntilRamadan();

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
                  <span className="text-2xl md:text-3xl" aria-hidden>📅</span>
                  <div className="text-center">
                    <span className="text-3xl md:text-4xl font-bold text-secondary">{daysUntil}</span>
                    <ArabicHover arabic="يوم حتى رمضان" className="text-primary-foreground/80 ml-2 text-sm md:text-base border-0">
                      days until Ramadan
                    </ArabicHover>
                  </div>
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
                <ArabicHover arabic="رمضان ٢٠٢٥" className="border-0">Ramadan 2025</ArabicHover>
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
              <ArabicHover arabic="رمضان" className="border-0 text-gradient-gold text-2xl md:text-4xl">
                Ramadan
              </ArabicHover>
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
              <ArabicHover arabic="صوم" transliteration="Sawm" className="text-secondary font-semibold">
                Sawm
              </ArabicHover>{" "}fasting 
              with cultural education and interfaith understanding.
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12"
            >
              <Link 
                to="/onboarding/welcome"
                className="btn-hero group flex items-center gap-2 w-full sm:w-auto justify-center"
              >
                <ArabicHover arabic="ابدأ رحلتك" className="border-0 text-inherit">Start Your Journey</ArabicHover>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link 
                to="/onboarding/welcome"
                className="btn-hero-outline w-full sm:w-auto flex items-center justify-center gap-2"
              >
                <ArabicHover arabic="أنا مسلم" className="border-0 text-inherit">I'm Already Muslim</ArabicHover>
              </Link>
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
                <p className="text-2xl md:text-3xl mb-2" aria-hidden>👥</p>
                <p className="text-xl md:text-2xl font-bold text-primary-foreground">1.8B+</p>
                <p className="text-xs md:text-sm text-primary-foreground/60">Muslims • مسلمين</p>
              </div>
              <div className="text-center">
                <p className="text-2xl md:text-3xl mb-2" aria-hidden>📖</p>
                <p className="text-xl md:text-2xl font-bold text-primary-foreground">30</p>
                <p className="text-xs md:text-sm text-primary-foreground/60">Days • يوم</p>
              </div>
              <div className="text-center">
                <p className="text-2xl md:text-3xl mb-2" aria-hidden>❤️</p>
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
    </>
  );
};
