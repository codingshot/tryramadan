import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

export default function OnboardingWelcome() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="text-center py-8"
    >
      <span className="text-6xl mb-6 block">🌙</span>
      <h1 className="font-display text-2xl md:text-3xl font-bold mb-4">
        Welcome to TryRamadan
      </h1>
      <p className="text-muted-foreground mb-6">
        Fast like a Muslim for the holy month of Ramadan. We'll personalize your journey with a few quick steps.
      </p>
      <ul className="text-left text-sm text-muted-foreground space-y-2 mb-8 max-w-sm mx-auto">
        <li><span aria-hidden>🌱</span> Choose your mode (learning or full observance)</li>
        <li><span aria-hidden>📝</span> Quick knowledge check for tailored content</li>
        <li><span aria-hidden>❤️</span> Health screening for your safety</li>
        <li><span aria-hidden>📍</span> Location for accurate prayer & fasting times</li>
        <li><span aria-hidden>⏰</span> Schedule and reminders</li>
        <li><span aria-hidden>🎯</span> Set your goals and intentions</li>
      </ul>
      <Link
        to="/onboarding/mode"
        className="inline-flex items-center justify-center gap-2 w-full py-3 px-6 rounded-xl bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors"
      >
        <span aria-hidden>🚀</span> Get Started <ArrowRight className="w-5 h-5" />
      </Link>
    </motion.div>
  );
}
