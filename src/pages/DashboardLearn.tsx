import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { 
  ArrowLeft, BookOpen, Globe, Languages, Heart, Moon, Calendar, 
  ChevronRight, Star, Award
} from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { DailyHadith } from "@/components/DailyHadith";

const DashboardLearn = () => {
  const learningPaths = [
    {
      title: 'Ramadan Basics',
      titleAr: 'أساسيات رمضان',
      description: 'Understanding the fundamentals of Ramadan',
      icon: Moon,
      link: '/learn/ramadan-basics',
      color: 'bg-secondary/20 text-secondary',
    },
    {
      title: 'Fasting Rules',
      titleAr: 'أحكام الصيام',
      description: 'What breaks a fast and best practices',
      icon: BookOpen,
      link: '/learn/fasting-rules',
      color: 'bg-primary/20 text-primary',
    },
    {
      title: 'Islamic Glossary',
      titleAr: 'المصطلحات الإسلامية',
      description: 'Arabic-English terms with definitions',
      icon: Languages,
      link: '/learn/glossary',
      color: 'bg-amber-500/20 text-amber-600',
    },
    {
      title: 'Sunnah Fasting',
      titleAr: 'صوم السنة',
      description: 'Voluntary fasting throughout the year',
      icon: Star,
      link: '/learn/sunnah-fasting',
      color: 'bg-blue-500/20 text-blue-600',
    },
    {
      title: 'Health Benefits',
      titleAr: 'الفوائد الصحية',
      description: 'Science-backed benefits of fasting',
      icon: Heart,
      link: '/learn/health-benefits',
      color: 'bg-red-500/20 text-red-600',
    },
    {
      title: 'Hadith Collection',
      titleAr: 'مجموعة الأحاديث',
      description: 'Prophetic sayings about fasting',
      icon: BookOpen,
      link: '/learn/hadith',
      color: 'bg-emerald-500/20 text-emerald-600',
    },
    {
      title: 'World Traditions',
      titleAr: 'تقاليد العالم',
      description: 'Ramadan customs from different countries',
      icon: Globe,
      link: '/dashboard/culture',
      color: 'bg-purple-500/20 text-purple-600',
    },
    {
      title: 'Prayer Tutorials',
      titleAr: 'تعليم الصلاة',
      description: 'Learn about the five daily prayers',
      icon: Calendar,
      link: '/learn/prayers',
      color: 'bg-indigo-500/20 text-indigo-600',
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="pt-20 pb-16">
        <div className="container mx-auto px-4 max-w-4xl">
          <Link 
            to="/dashboard" 
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </Link>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <h1 className="text-2xl md:text-3xl font-display font-bold">
              Learn & Explore
              <span className="block font-arabic text-lg text-secondary mt-1">تعلم واستكشف</span>
            </h1>
            <p className="text-muted-foreground mt-2">
              Deepen your understanding of Ramadan, Islamic traditions, and fasting
            </p>
          </motion.div>
          
          {/* Daily Hadith */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-8"
          >
            <DailyHadith />
          </motion.div>
          
          {/* Learning paths grid */}
          <div className="grid md:grid-cols-2 gap-4">
            {learningPaths.map((path, index) => {
              const Icon = path.icon;
              
              return (
                <motion.div
                  key={path.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15 + index * 0.05 }}
                >
                  <Link 
                    to={path.link}
                    className="block p-5 rounded-2xl bg-card border border-border hover:border-secondary/50 hover:shadow-lg transition-all group"
                  >
                    <div className="flex items-start gap-4">
                      <div className={`w-12 h-12 rounded-xl ${path.color} flex items-center justify-center flex-shrink-0`}>
                        <Icon className="w-6 h-6" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="font-display font-bold">{path.title}</h3>
                            <span className="text-sm text-secondary font-arabic">{path.titleAr}</span>
                          </div>
                          <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-secondary group-hover:translate-x-1 transition-all" />
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">{path.description}</p>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </div>
          
          {/* Achievement teaser */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="mt-8 p-6 rounded-2xl bg-gradient-to-r from-secondary/20 to-primary/20 border border-secondary/30"
          >
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-gradient-gold flex items-center justify-center">
                <Award className="w-8 h-8 text-foreground" />
              </div>
              <div className="flex-1">
                <h3 className="font-display font-bold text-lg">Earn Learning Badges</h3>
                <p className="text-sm text-muted-foreground">
                  Complete learning modules to unlock achievements and track your progress
                </p>
              </div>
              <Link 
                to="/dashboard/achievements"
                className="px-4 py-2 rounded-lg bg-secondary text-secondary-foreground text-sm font-medium"
              >
                View Badges
              </Link>
            </div>
          </motion.div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default DashboardLearn;
