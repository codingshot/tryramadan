import { motion } from "framer-motion";
import { ArrowRight, Users, BookOpen, Heart } from "lucide-react";
import { FastingTimer } from "./FastingTimer";
import { ArabicTerm } from "./ArabicTerm";
import heroBg from "@/assets/hero-bg.jpg";
import logo from "@/assets/logo.png";

export const HeroSection = () => {
  return (
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
        className="absolute top-20 left-10 text-6xl opacity-20"
        animate={{ y: [0, -20, 0], rotate: [0, 5, 0] }}
        transition={{ duration: 6, repeat: Infinity }}
      >
        ☪
      </motion.div>
      <motion.div 
        className="absolute bottom-40 right-10 text-4xl opacity-20"
        animate={{ y: [0, 20, 0], rotate: [0, -5, 0] }}
        transition={{ duration: 5, repeat: Infinity, delay: 1 }}
      >
        🌙
      </motion.div>

      <div className="relative z-10 container mx-auto px-4 py-32 md:py-40">
        <div className="max-w-5xl mx-auto">
          {/* Logo and badge */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center mb-8"
          >
            <motion.img 
              src={logo} 
              alt="TryRamadan" 
              className="w-24 h-24 md:w-32 md:h-32 mb-6 drop-shadow-2xl"
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 4, repeat: Infinity }}
            />
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary/20 text-secondary text-sm font-medium backdrop-blur-sm">
              <span className="w-2 h-2 rounded-full bg-secondary animate-pulse" />
              Ramadan 2025 • Experience the Journey
            </span>
          </motion.div>

          {/* Main headline */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-6xl lg:text-7xl font-display font-bold text-center text-primary-foreground mb-6 leading-tight"
          >
            Experience{" "}
            <ArabicTerm
              term="Ramadan"
              arabic="رمضان"
              transliteration="Ramaḍān"
              definition="The ninth month of the Islamic lunar calendar, a time of fasting, reflection, and community"
            >
              <span className="text-gradient-gold">Ramadan</span>
            </ArabicTerm>
            <br />
            <span className="text-primary-foreground/90">Through Cultural Immersion</span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-lg md:text-xl text-primary-foreground/80 text-center max-w-3xl mx-auto mb-10"
          >
            A respectful wellness journey for non-Muslims curious about{" "}
            <ArabicTerm
              term="fasting"
              arabic="صوم"
              transliteration="Ṣawm"
              definition="Abstaining from food, drink, and other physical needs from dawn to sunset"
            >
              fasting
            </ArabicTerm>
            , interfaith understanding, and the beautiful traditions of Ramadan.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16"
          >
            <button className="btn-hero group flex items-center gap-2">
              Start Your Journey
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
            <button className="btn-hero-outline">
              I'm Already Muslim
            </button>
          </motion.div>

          {/* Timer preview */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4 }}
            className="max-w-lg mx-auto"
          >
            <FastingTimer />
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="grid grid-cols-3 gap-8 max-w-2xl mx-auto mt-16"
          >
            <div className="text-center">
              <Users className="w-6 h-6 text-secondary mx-auto mb-2" />
              <p className="text-2xl font-bold text-primary-foreground">1.8B+</p>
              <p className="text-sm text-primary-foreground/60">Muslims Worldwide</p>
            </div>
            <div className="text-center">
              <BookOpen className="w-6 h-6 text-secondary mx-auto mb-2" />
              <p className="text-2xl font-bold text-primary-foreground">30</p>
              <p className="text-sm text-primary-foreground/60">Days of Ramadan</p>
            </div>
            <div className="text-center">
              <Heart className="w-6 h-6 text-secondary mx-auto mb-2" />
              <p className="text-2xl font-bold text-primary-foreground">100+</p>
              <p className="text-sm text-primary-foreground/60">Cultural Traditions</p>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Scroll indicator */}
      <motion.div 
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
        animate={{ y: [0, 10, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        <div className="w-6 h-10 rounded-full border-2 border-primary-foreground/30 flex items-start justify-center p-2">
          <div className="w-1 h-2 rounded-full bg-secondary" />
        </div>
      </motion.div>
    </section>
  );
};
