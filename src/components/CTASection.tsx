import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowRight, Users, Heart, Shield, Moon } from "lucide-react";

export const CTASection = () => {
  return (
    <>
      <section className="py-24 relative overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary via-emerald-dark to-primary" />
        <div className="absolute inset-0 pattern-islamic opacity-10" />

        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-4xl mx-auto text-center"
          >
            {/* Badge */}
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary/20 text-secondary text-sm font-medium mb-6">
              <Heart className="w-4 h-4 fill-current" />
              <span>Join the Community</span>
              <span className="font-arabic">انضم إلينا</span>
            </span>

            {/* Headline */}
            <h2 className="text-3xl md:text-5xl font-display font-bold text-primary-foreground mb-6">
              Ready to Experience the<br />
              <span className="text-gradient-gold">Beauty of Ramadan?</span>
              <span className="block font-arabic text-2xl text-secondary mt-2">جمال رمضان</span>
            </h2>

            {/* Description */}
            <p className="text-lg text-primary-foreground/80 max-w-2xl mx-auto mb-10">
              Join thousands of curious learners who are discovering the wellness benefits, 
              cultural richness, and spiritual depth of Ramadan fasting. Start your journey today — completely free.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
              <Link 
                to="/onboarding/welcome"
                className="btn-hero group flex items-center gap-2"
              >
                <Moon className="w-5 h-5" />
                <span>Begin Your Ramadan Journey</span>
                <span className="font-arabic text-sm">ابدأ</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link 
                to="/programs"
                className="btn-hero-outline flex items-center gap-2"
              >
                <span>View Fasting Programs</span>
                <span className="font-arabic text-sm">البرامج</span>
              </Link>
            </div>

            {/* Trust indicators */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-8 text-primary-foreground/60">
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5" />
                <span className="text-sm">100% Free</span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                <span className="text-sm">Respectful & educational</span>
              </div>
              <div className="flex items-center gap-2">
                <Heart className="w-5 h-5" />
                <span className="text-sm">Interfaith solidarity</span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </>
  );
};
