import { motion } from "framer-motion";
import { TrendingUp, Heart, Brain, Zap, Shield } from "lucide-react";
import ramadanInfo from "@/data/ramadan-info.json";

const iconMap: Record<string, React.ReactNode> = {
  "Metabolic Health": <TrendingUp className="w-6 h-6" />,
  "Weight Management": <Zap className="w-6 h-6" />,
  "Cardiovascular Benefits": <Heart className="w-6 h-6" />,
  "Cellular Health": <Shield className="w-6 h-6" />,
  "Brain Health": <Brain className="w-6 h-6" />,
};

export const HealthBenefits = () => {
  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
      {ramadanInfo.healthBenefits.map((benefit, index) => (
        <motion.div
          key={benefit.title}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: index * 0.1 }}
          className="card-cultural group"
        >
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-xl bg-gradient-gold text-foreground group-hover:scale-110 transition-transform">
              {iconMap[benefit.title] || <Heart className="w-6 h-6" />}
            </div>
            <div className="flex-1">
              <h4 className="font-display font-bold mb-2">{benefit.title}</h4>
              <p className="text-sm text-muted-foreground mb-3">
                {benefit.description}
              </p>
              <p className="text-xs text-secondary italic">
                📚 {benefit.source}
              </p>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
};
