import { motion } from "framer-motion";
import { AlertTriangle, CheckCircle, XCircle, Info } from "lucide-react";
import ramadanInfo from "@/data/ramadan-info.json";
import { ArabicTerm } from "./ArabicTerm";

export const FastingRulesSection = () => {
  const rules = ramadanInfo.fastingRules;

  const iconMap: Record<string, React.ReactNode> = {
    "What Invalidates the Fast": <XCircle className="w-5 h-5 text-destructive" />,
    "What Does NOT Invalidate the Fast": <CheckCircle className="w-5 h-5 text-emerald-light" />,
    "Who is Exempt from Fasting": <Info className="w-5 h-5 text-secondary" />,
  };

  return (
    <section className="py-16">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center max-w-3xl mx-auto mb-12"
        >
          <h3 className="text-2xl md:text-3xl font-display font-bold mb-4">
            Understanding the Rules of{" "}
            <ArabicTerm
              term="Sawm"
              arabic="صوم"
              transliteration="Ṣawm"
              definition="The Arabic word for fasting, one of the Five Pillars of Islam"
            >
              <span className="text-gradient-gold">Fasting</span>
            </ArabicTerm>
          </h3>
          <p className="text-muted-foreground">
            Learn the traditional guidelines that Muslims follow during Ramadan to help you 
            understand and participate respectfully.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6">
          {rules.map((ruleSet, index) => (
            <motion.div
              key={ruleSet.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="card-cultural"
            >
              <div className="flex items-center gap-3 mb-4">
                {iconMap[ruleSet.title]}
                <h4 className="font-display font-bold">{ruleSet.title}</h4>
              </div>
              
              <ul className="space-y-2 mb-4">
                {ruleSet.rules.map((rule, ruleIndex) => (
                  <li key={ruleIndex} className="flex items-start gap-2 text-sm text-muted-foreground">
                    <span className="text-secondary mt-0.5">•</span>
                    {rule}
                  </li>
                ))}
              </ul>

              {ruleSet.note && (
                <div className="pt-3 border-t border-border">
                  <p className="text-xs text-muted-foreground italic flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 text-secondary flex-shrink-0 mt-0.5" />
                    {ruleSet.note}
                  </p>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
