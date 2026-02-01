import { motion } from "framer-motion";
import { Clock, BookOpen, Heart, Bell, Shield, Globe, Utensils, Calendar } from "lucide-react";

const features = [
  {
    icon: <Clock className="w-6 h-6" />,
    title: "Smart Fasting Timer",
    description: "Location-based sunrise/sunset calculations synced with actual Ramadan fasting times in your area.",
  },
  {
    icon: <Calendar className="w-6 h-6" />,
    title: "Progressive Program",
    description: "Start with 12-hour fasts and gradually build up to full dawn-to-sunset fasting over 4 weeks.",
  },
  {
    icon: <BookOpen className="w-6 h-6" />,
    title: "Cultural Education",
    description: "Daily content about Ramadan traditions, customs from different countries, and spiritual themes.",
  },
  {
    icon: <Bell className="w-6 h-6" />,
    title: "Smart Reminders",
    description: "Customizable suhoor and iftar notifications, plus hydration reminders during non-fasting hours.",
  },
  {
    icon: <Shield className="w-6 h-6" />,
    title: "Health & Safety First",
    description: "Health screening, contraindication warnings, emergency 'break fast' button, and daily wellness check-ins.",
  },
  {
    icon: <Utensils className="w-6 h-6" />,
    title: "Meal Planning",
    description: "Nutritious suhoor and iftar recipe suggestions from various cultures to sustain energy.",
  },
  {
    icon: <Heart className="w-6 h-6" />,
    title: "Progress Tracking",
    description: "Visual streak counters, achievement badges, energy level monitoring, and reflection journaling.",
  },
  {
    icon: <Globe className="w-6 h-6" />,
    title: "Global Traditions",
    description: "Explore how Ramadan is celebrated across different cultures and countries worldwide.",
  },
];

export const FeaturesSection = () => {
  return (
    <section id="features" className="py-24 bg-muted/30">
      <div className="container mx-auto px-4">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center max-w-3xl mx-auto mb-16"
        >
          <span className="inline-block px-4 py-1.5 rounded-full bg-secondary/10 text-secondary text-sm font-medium mb-4">
            Features
          </span>
          <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">
            Everything You Need for Your <span className="text-gradient-gold">Ramadan Journey</span>
          </h2>
          <p className="text-muted-foreground">
            A thoughtfully designed experience that combines wellness with cultural education, 
            helping you understand and appreciate the practice of Ramadan fasting.
          </p>
        </motion.div>

        {/* Features grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="card-cultural group"
            >
              <div className="p-3 rounded-xl bg-gradient-gold text-foreground w-fit mb-4 group-hover:scale-110 transition-transform">
                {feature.icon}
              </div>
              <h3 className="font-display font-bold text-lg mb-2">{feature.title}</h3>
              <p className="text-sm text-muted-foreground">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
