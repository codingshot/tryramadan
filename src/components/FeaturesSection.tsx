import { motion } from "framer-motion";

const features = [
  {
    emoji: "🕐",
    title: "Smart Fasting Timer",
    description: "Location-based sunrise/sunset calculations synced with actual Ramadan fasting times in your area.",
  },
  {
    emoji: "📅",
    title: "Progressive Program",
    description: "Start with 12-hour fasts and gradually build up to full dawn-to-sunset fasting over 4 weeks.",
  },
  {
    emoji: "📖",
    title: "Cultural Education",
    description: "Daily content about Ramadan traditions, customs from different countries, and spiritual themes.",
  },
  {
    emoji: "🔔",
    title: "Smart Reminders",
    description: "Customizable Suhoor and Iftar notifications, plus hydration reminders.",
  },
  {
    emoji: "🛡️",
    title: "Health & Safety",
    description: "Health screening, contraindication warnings, emergency 'break fast' button, and wellness check-ins.",
  },
  {
    emoji: "🍽️",
    title: "Meal Planning",
    description: "Nutritious Suhoor and Iftar recipes from various cultures to sustain energy.",
  },
  {
    emoji: "❤️",
    title: "Progress Tracking",
    description: "Visual streak counters, achievement badges, energy level monitoring, and reflection journaling.",
  },
  {
    emoji: "🌍",
    title: "Global Traditions",
    description: "Explore how Ramadan is celebrated across different cultures and countries worldwide.",
  },
];

export const FeaturesSection = () => {
  return (
    <section id="features" className="py-20 md:py-24 bg-muted/30">
      <div className="container mx-auto px-4">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center max-w-3xl mx-auto mb-12 md:mb-16"
        >
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-secondary/10 text-secondary text-sm font-medium mb-4">
            Features
          </span>
          <h2 className="text-2xl md:text-4xl font-display font-bold mb-4">
            Everything for Your{" "}
            <span className="text-gradient-gold">Ramadan Journey</span>
          </h2>
          <p className="text-muted-foreground text-sm md:text-base">
            A thoughtfully designed experience combining wellness with cultural education.
          </p>
        </motion.div>

        {/* Features grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="card-cultural group"
            >
              <div className="p-3 rounded-xl bg-gradient-gold text-foreground w-fit mb-4 group-hover:scale-110 transition-transform text-2xl" aria-hidden>
                {feature.emoji}
              </div>
              <h3 className="font-display font-bold text-lg mb-1">{feature.title}</h3>
              <p className="text-sm text-muted-foreground">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
