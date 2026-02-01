import { motion } from "framer-motion";
import { Quote } from "lucide-react";
import hadiths from "@/data/hadiths.json";
import { useState, useEffect } from "react";

export const DailyHadith = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  
  // Rotate daily based on date
  useEffect(() => {
    const today = new Date();
    const dayOfYear = Math.floor((today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) / (1000 * 60 * 60 * 24));
    setCurrentIndex(dayOfYear % hadiths.hadiths.length);
  }, []);

  const hadith = hadiths.hadiths[currentIndex];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="relative overflow-hidden rounded-2xl p-8 bg-gradient-to-br from-primary to-emerald-dark text-primary-foreground"
    >
      {/* Background pattern */}
      <div className="absolute inset-0 pattern-islamic opacity-10" />
      
      {/* Quote icon */}
      <div className="absolute top-4 right-4 opacity-20">
        <Quote className="w-16 h-16" />
      </div>

      <div className="relative z-10">
        <span className="inline-block px-3 py-1 rounded-full bg-secondary/20 text-secondary text-xs font-medium mb-4">
          Daily Hadith
        </span>

        <blockquote className="text-lg md:text-xl leading-relaxed mb-6 font-display">
          "{hadith.text}"
        </blockquote>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-4 border-t border-primary-foreground/20">
          <div>
            <p className="text-sm font-semibold text-secondary">{hadith.source}</p>
            <p className="text-xs text-primary-foreground/60">Topic: {hadith.topic}</p>
          </div>
          
          <div className="text-xs text-primary-foreground/70 max-w-xs">
            💡 {hadith.context}
          </div>
        </div>
      </div>
    </motion.div>
  );
};
