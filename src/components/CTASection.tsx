import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowRight, Users, Heart, Shield, Moon } from "lucide-react";
import { ArabicHover } from "@/components/ArabicHover";

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
              <ArabicHover arabic="انضم إلينا" explanation="Join us — connect with others exploring Ramadan">Join the Community</ArabicHover>
            </span>

            {/* Headline */}
            <h2 className="text-3xl md:text-5xl font-display font-bold text-primary-foreground mb-6">
              Ready to Experience the<br />
              <ArabicHover arabic="جمال رمضان" explanation="The beauty of Ramadan — spirituality, community, and wellness" className="text-gradient-gold border-0">
                <span className="text-gradient-gold">Beauty of Ramadan?</span>
              </ArabicHover>
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
                aria-label="Begin your Ramadan journey — start free setup"
              >
                <Moon className="w-5 h-5" />
                <span>Begin your Ramadan journey — start free setup</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link 
                to="/programs"
                className="btn-hero-outline flex items-center gap-2"
                aria-label="Compare fasting programs and set yours"
              >
                <span>Compare programs & set yours</span>
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
