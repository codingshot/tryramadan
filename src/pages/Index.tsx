import { useEffect } from "react";
import { motion } from "framer-motion";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { HeroSection } from "@/components/HeroSection";
import { FeaturesSection } from "@/components/FeaturesSection";
import { CulturalCarousel } from "@/components/CulturalCarousel";
import { HealthBenefits } from "@/components/HealthBenefits";
import { HeroDailySlider } from "@/components/HeroDailySlider";
import { FastingRulesSection } from "@/components/FastingRulesSection";
import { RecipeSection } from "@/components/RecipeSection";
import { ProgressTracker } from "@/components/ProgressTracker";
import { CTASection } from "@/components/CTASection";
import { Footer } from "@/components/Footer";
import { GoalsUntilRamadanCard } from "@/components/GoalsUntilRamadanCard";
import { ArabicTerm } from "@/components/ArabicTerm";
import { useFastingProgress, useIftarLabelShort, useUserPreferences, calculateStreak, getTotalHoursFasted } from "@/hooks/useLocalStorage";
import { PageSEO } from "@/components/PageSEO";
import { useRamadanRange } from "@/hooks/useRamadanRange";
import { ChevronRight } from "lucide-react";

const Index = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [progress] = useFastingProgress();
  const [preferences] = useUserPreferences();
  const ramadanRange = useRamadanRange();
  const iftarLabelShort = useIftarLabelShort();
  const today = new Date();
  const todayRamadanDay = ramadanRange.getRamadanDayNumber(today);
  const currentDay = todayRamadanDay ?? progress.currentDay ?? 1;
  const ramadanStart = ramadanRange.startStr ?? "";
  const ramadanEnd = ramadanRange.endStr ?? "";
  const completedInRange = (progress.completedDays ?? []).filter((d) => d >= ramadanStart && d <= ramadanEnd);
  const completedDayNumbers = completedInRange
    .map((d) => ramadanRange.getRamadanDayNumber(new Date(d + "T12:00:00")))
    .filter((n): n is number => n != null);
  const TOTAL_DAYS = ramadanRange.totalDays ?? 30;
  const streak = calculateStreak(progress);
  const totalHoursFasted = getTotalHoursFasted(progress);
  const onboardingComplete = preferences.onboardingComplete ?? false;
  const useRealData = onboardingComplete;
  const hasRealProgress = useRealData && (completedDayNumbers.length > 0 || (todayRamadanDay != null && todayRamadanDay <= TOTAL_DAYS));

  // After onboarding, dashboard is the home page — redirect "/" to "/dashboard"
  useEffect(() => {
    if (onboardingComplete) {
      navigate("/dashboard", { replace: true });
    }
  }, [onboardingComplete, navigate]);

  // Scroll to section when landing on home with hash or state (e.g. footer "Features" / "About")
  useEffect(() => {
    if (location.pathname !== "/") return;
    const id =
      (location.state as { scrollTo?: string } | null)?.scrollTo ||
      (location.hash ? location.hash.replace("#", "") : null);
    const el = id ? document.getElementById(id) : null;
    if (el) {
      const raf = requestAnimationFrame(() => {
        el.scrollIntoView({ behavior: "smooth", block: "start" });
      });
      return () => cancelAnimationFrame(raf);
    }
  }, [location.pathname, location.hash, location.state]);

  // Avoid flashing landing content when redirecting to dashboard
  if (onboardingComplete) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <PageSEO
        title="TryRamadan.app | Fast Like a Muslim for the Holy Month of Ramadan"
        description={`Fast like a Muslim for the holy month of Ramadan. Free app: prayer times, suhoor & ${iftarLabelShort}, cultural education, and progressive fasting. For everyone.`}
        path="/"
      />
      <Navbar />
      <main id="main-content">
      {/* Hero Section */}
      <HeroSection />

      {/* Days until Ramadan — green section (countdown, explanation, add to calendar) */}
      <section className="py-12 md:py-16 bg-secondary/10 border-y border-secondary/20">
        <div className="container mx-auto px-4 max-w-2xl">
          <GoalsUntilRamadanCard />
        </div>
      </section>

      {/* Features Section */}
      <FeaturesSection />

      {/* Fasting path — clear CTAs to Settings and Programs */}
      <section id="programs" className="py-24">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center max-w-2xl mx-auto"
          >
            <span className="inline-block px-4 py-1.5 rounded-full bg-secondary/10 text-secondary text-sm font-medium mb-4">
              Fasting path
            </span>
            <h2 className="text-3xl md:text-4xl font-display font-bold mb-3">
              Choose Your <span className="text-gradient-gold">Fasting Path</span>
            </h2>
            <p className="text-muted-foreground mb-8">
              Full Ramadan (dawn to sunset) or voluntary Sunnah fasting — set your mode and program once, and we’ll guide you through the month.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                to="/settings#settings-fasting-path"
                className="inline-flex items-center gap-2 min-h-[48px] px-6 py-3 rounded-2xl bg-secondary text-secondary-foreground font-semibold shadow-md hover:bg-secondary/90 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-secondary focus-visible:ring-offset-2 focus-visible:ring-offset-background"
              >
                Set your fasting path
                <ChevronRight className="w-5 h-5 shrink-0" />
              </Link>
              <Link
                to="/programs"
                className="inline-flex items-center gap-2 min-h-[48px] px-6 py-3 rounded-2xl border-2 border-secondary/50 text-secondary font-medium hover:bg-secondary/10 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-secondary focus-visible:ring-offset-2 focus-visible:ring-offset-background"
              >
                Compare programs
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Progress Preview – real data when available, CTA to Dashboard */}
      <section className="py-8 sm:py-10 bg-muted/30">
        <div className="container mx-auto px-3 sm:px-4">
          <Link
            to={hasRealProgress ? "/dashboard/progress" : "/dashboard"}
            className="block max-w-2xl mx-auto group"
          >
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="p-4 sm:p-5 md:p-6 rounded-xl sm:rounded-2xl bg-card border border-border hover:border-secondary/50 transition-all shadow-sm hover:shadow-md"
            >
              <div className="text-center mb-4 sm:mb-5">
                <h3 className="text-xl sm:text-2xl font-display font-bold mb-1 sm:mb-2 group-hover:text-secondary transition-colors">
                  Track Your Journey
                </h3>
                <p className="text-muted-foreground text-xs sm:text-sm">
                  {useRealData
                    ? hasRealProgress
                      ? "See your progress and log your fasts in the Dashboard"
                      : "Log your first fast on the dashboard — your progress will appear here"
                    : "Celebrate each day as you progress through the blessed month"}
                </p>
              </div>
              <ProgressTracker
                currentDay={useRealData ? currentDay : 5}
                totalDays={TOTAL_DAYS}
                completedDays={useRealData ? completedDayNumbers : [1, 2, 3, 4]}
                streak={useRealData ? streak : undefined}
                totalHoursFasted={useRealData ? totalHoursFasted : undefined}
                isPlaceholder={!useRealData}
              />
              <div className="mt-4 sm:mt-5 flex items-center justify-center gap-2 text-secondary font-medium text-xs sm:text-sm">
                <span>
                  {useRealData ? "View your progress on dashboard" : "Go to dashboard (see today & progress)"}
                </span>
                <ChevronRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 group-hover:translate-x-1 transition-transform shrink-0" />
              </div>
            </motion.div>
          </Link>
        </div>
      </section>

      {/* Daily Hadith & Quran — above Fasting Rules (dark wrapper so slider text stays readable) */}
      <section className="py-16 bg-primary/95 text-primary-foreground" aria-label="Daily Hadith and Quran verse">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-3xl mx-auto"
          >
            <HeroDailySlider />
          </motion.div>
        </div>
      </section>

      {/* Fasting Rules */}
      <FastingRulesSection />

      {/* Cultural Education Section */}
      <section id="culture" className="py-24 bg-muted/30">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center max-w-3xl mx-auto mb-16"
          >
            <Link
              to="/culture"
              className="inline-block px-4 py-1.5 rounded-full bg-secondary/10 text-secondary text-sm font-medium mb-4 hover:bg-secondary/20 transition-colors"
            >
              Cultural Education
            </Link>
            <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">
              <Link to="/culture" className="hover:opacity-90 transition-opacity focus:outline-none focus-visible:ring-2 focus-visible:ring-secondary focus-visible:ring-offset-2 rounded">
                Ramadan Around the <span className="text-gradient-gold">World</span>
              </Link>
            </h2>
            <p className="text-muted-foreground">
              Explore the rich traditions, unique customs, and delicious foods from 
              Muslim communities across the globe.
            </p>
          </motion.div>

          <CulturalCarousel />
        </div>
      </section>

      {/* Recipes Section */}
      <RecipeSection />

      {/* Health Benefits Section */}
      <section id="health" className="py-24">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center max-w-3xl mx-auto mb-16"
          >
            <span className="inline-block px-4 py-1.5 rounded-full bg-secondary/10 text-secondary text-sm font-medium mb-4">
              Health & Science
            </span>
            <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">
              The Science Behind <span className="text-gradient-gold">Fasting Benefits</span>
            </h2>
            <p className="text-muted-foreground">
              Intermittent fasting has been studied extensively. Here's what the research says 
              about its health benefits.
            </p>
          </motion.div>

          <HealthBenefits />
          <div className="text-center mt-8">
            <Link
              to="/health"
              className="inline-flex items-center gap-2 text-secondary font-medium hover:underline"
            >
              Full health guide (benefits, safety, when to break fast)
              <ChevronRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-24 bg-muted/30">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-4xl mx-auto"
          >
            <div className="text-center mb-12">
              <span className="inline-block px-4 py-1.5 rounded-full bg-secondary/10 text-secondary text-sm font-medium mb-4">
                About TryRamadan
              </span>
              <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">
                Building Bridges Through <span className="text-gradient-gold">Understanding</span>
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
              <div className="card-cultural">
                <h3 className="font-display font-bold text-xl mb-4">Our Mission</h3>
                <p className="text-muted-foreground leading-relaxed">
                  TryRamadan.app bridges cultural understanding and wellness by offering 
                  non-Muslims a structured, safe way to experience intermittent fasting 
                  inspired by Ramadan traditions. We create solidarity and shared experience 
                  while emphasizing education, respect, and interfaith dialogue.
                </p>
              </div>
              
              <div className="card-cultural">
                <h3 className="font-display font-bold text-xl mb-4">Our Approach</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Unlike generic fasting apps, we combine wellness with cultural immersion. 
                  We respectfully introduce users to Ramadan traditions while making the 
                  experience accessible, educational, and health-focused—helping users 
                  appreciate the discipline, spirituality, and community aspects of Ramadan.
                </p>
              </div>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="mt-8 p-6 rounded-2xl bg-gradient-to-r from-primary/5 to-secondary/5 border border-border"
            >
              <div className="flex items-start gap-4">
                <span className="text-4xl">🤝</span>
                <div>
                  <h4 className="font-display font-bold mb-2">Respectful Framing</h4>
                  <p className="text-muted-foreground text-sm">
                    We position this as a cultural learning and wellness experience, not religious 
                    practice. Our goal is to foster understanding between communities and support 
                    those who want to participate in solidarity with their Muslim friends, 
                    colleagues, and family members during Ramadan.
                  </p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <CTASection />
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default Index;
