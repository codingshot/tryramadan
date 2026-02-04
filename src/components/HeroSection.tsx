import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { FastingTimer } from "./FastingTimer";
import logo from "@/assets/logo.png";
import { useUserPreferences } from "@/hooks/useLocalStorage";
import { useAutoLocation } from "@/hooks/useLocation";

// Hero image served from public/ so index.html can preload it for LCP (see docs/PERFORMANCE.md)
const HERO_BG_URL = "/hero-bg.jpg";
import { getDaysUntilRamadan } from "@/lib/ramadan";
import { useRamadanRange } from "@/hooks/useRamadanRange";

export const HeroSection = () => {
  const [preferences] = useUserPreferences();
  const { location: autoLocation } = useAutoLocation();
  const ramadanRange = useRamadanRange();
  const hasLocation = !!(preferences.locationCoords || (autoLocation?.lat != null && autoLocation?.lng != null));
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const inRamadan = ramadanRange.isRamadanDay(today);
  const ramadanDay = inRamadan ? ramadanRange.getRamadanDayNumber(today) ?? 1 : null;
  const daysUntil = inRamadan ? 0 : today < ramadanRange.start ? Math.ceil((ramadanRange.start.getTime() - today.getTime()) / 86400000) : getDaysUntilRamadan();
  return (
    <>
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Background image: <img> with dimensions + fetchpriority for LCP; avoids CLS from unknown-size bg */}
        <img
          src={HERO_BG_URL}
          alt="Peaceful Ramadan atmosphere - mosque silhouettes at dusk, TryRamadan fasting app hero"
          width={1920}
          height={1080}
          decoding="async"
          fetchPriority="high"
          className="absolute inset-0 w-full h-full object-cover object-center"
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

        <div className="relative z-10 container mx-auto px-4 pb-20 sm:pb-24 md:pb-32 pt-[calc(4rem+env(safe-area-inset-top,0px))] md:pt-[calc(5rem+env(safe-area-inset-top,0px))]">
          <div className="max-w-5xl mx-auto">
            {/* Logo and badge */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col items-center mb-6"
            >
              <motion.picture
                className="block mb-4"
                animate={{ scale: [1, 1.03, 1] }}
                transition={{ duration: 4, repeat: Infinity }}
              >
                <img
                  src={logo}
                  alt="TryRamadan app logo - experience Ramadan fasting, prayer times, suhoor and iftar"
                  width={112}
                  height={112}
                  decoding="async"
                  fetchPriority="low"
                  className="w-20 h-20 md:w-28 md:h-28 drop-shadow-2xl"
                />
              </motion.picture>
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary/20 text-secondary text-sm font-medium backdrop-blur-sm">
                <span className="w-2 h-2 rounded-full bg-secondary animate-pulse" />
                {inRamadan && ramadanDay
                  ? ramadanRange.isLastDayOfRamadan(new Date())
                    ? "Last day of Ramadan"
                    : `Day ${ramadanDay} of Ramadan`
                  : `${daysUntil} day${daysUntil === 1 ? "" : "s"} until Ramadan`}
              </span>
              <p className="text-xs text-primary-foreground/70 mt-2 text-center">
                New? Start your journey below
              </p>
            </motion.div>

            {/* Main headline - responsive for mobile */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-2xl sm:text-3xl md:text-5xl lg:text-6xl font-display font-bold text-center text-primary-foreground mb-4 leading-tight px-1"
            >
              Experience{" "}
              <span className="text-gradient-gold text-xl sm:text-2xl md:text-4xl">Ramadan</span>
              <br />
              <span className="text-primary-foreground/90 text-xl sm:text-2xl md:text-4xl">Through Cultural Immersion</span>
            </motion.h1>

            {/* Subtitle + AEO direct answer */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-base md:text-lg text-primary-foreground/80 text-center max-w-2xl mx-auto mb-4"
            >
              Fast like a Muslim for the holy month of{" "}
              <span className="text-secondary font-semibold">Ramadan</span>.
            </motion.p>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
              className="text-sm md:text-base text-primary-foreground/70 text-center max-w-2xl mx-auto mb-8"
            >
              TryRamadan is a free app that gives you prayer times, suhoor and iftar reminders, and cultural education so you can experience Ramadan-style fasting safely. It’s for everyone—Muslims and non-Muslims alike.{" "}
              <Link to="/faq" className="text-secondary font-medium underline underline-offset-2 hover:text-secondary/90">Learn more in our FAQ</Link>.
            </motion.p>

            {/* CTA Buttons - touch-friendly min height */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 mb-12"
            >
              <Link 
                to="/onboarding/welcome"
                className="btn-hero group flex items-center justify-center gap-2 w-full sm:w-auto min-h-[48px] px-6 py-3"
                aria-label="Start your Ramadan journey"
              >
                Start your journey
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform shrink-0" />
              </Link>
              <Link 
                to="/onboarding/mode"
                state={{ preSelectMuslim: true }}
                className="btn-hero-outline w-full sm:w-auto flex items-center justify-center gap-2 min-h-[48px] px-6 py-3"
                aria-label="I'm Muslim — skip to Muslim mode"
              >
                I'm Muslim
              </Link>
            </motion.div>
            {!hasLocation && (
              <p className="text-xs text-primary-foreground/60 text-center -mt-8 mb-4">
                Both paths set your location for accurate times.
              </p>
            )}

            {/* Timer preview — min-height reserves space to avoid CLS while timer loads */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4 }}
              className="max-w-xl mx-auto min-h-[300px]"
            >
              <FastingTimer />
            </motion.div>

            {/* Stats — dark backdrop so text stays visible in light mode on mobile (gradient fades to background) */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="grid grid-cols-3 gap-4 md:gap-8 max-w-2xl mx-auto mt-12 rounded-2xl bg-primary/95 dark:bg-primary/90 px-4 py-5 md:px-6 md:py-6 shadow-xl"
            >
              <div className="text-center">
                <p className="text-2xl md:text-3xl mb-2" aria-hidden>👥</p>
                <p className="text-xl md:text-2xl font-bold text-primary-foreground">1.8B+</p>
                <p className="text-xs md:text-sm text-primary-foreground/80">Muslims • مسلمين</p>
              </div>
              <div className="text-center">
                <p className="text-2xl md:text-3xl mb-2" aria-hidden>📖</p>
                <p className="text-xl md:text-2xl font-bold text-primary-foreground">30</p>
                <p className="text-xs md:text-sm text-primary-foreground/80">Days • يوم</p>
              </div>
              <div className="text-center">
                <p className="text-2xl md:text-3xl mb-2" aria-hidden>❤️</p>
                <p className="text-xl md:text-2xl font-bold text-primary-foreground">100+</p>
                <p className="text-xs md:text-sm text-primary-foreground/80">Traditions • تقاليد</p>
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
