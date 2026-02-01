import { useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowLeft, ChevronDown, Search, HelpCircle } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { ArabicHover } from "@/components/ArabicHover";

const FAQ = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  
  const faqs = [
    {
      category: "About Fasting",
      questions: [
        {
          q: "What is Ramadan fasting?",
          qAr: "ما هو صيام رمضان؟",
          a: "Ramadan fasting (Sawm) involves abstaining from food, drink, and other physical needs from dawn (Fajr) until sunset (Maghrib). It's one of the Five Pillars of Islam and is observed during the 9th month of the Islamic lunar calendar."
        },
        {
          q: "What are the hours of fasting?",
          qAr: "ما هي ساعات الصيام؟",
          a: "Fasting begins at Fajr (dawn prayer time) and ends at Maghrib (sunset prayer time). The exact times vary by location and change daily. Our app provides accurate prayer times based on your location."
        },
        {
          q: "Can I drink water while fasting?",
          qAr: "هل يمكنني شرب الماء أثناء الصيام؟",
          a: "No, during fasting hours you cannot consume any food or drink, including water. However, you should hydrate well between Iftar (sunset) and Suhoor (pre-dawn meal)."
        },
        {
          q: "What breaks a fast?",
          qAr: "ما الذي يفسد الصيام؟",
          a: "A fast is broken by eating, drinking, smoking, or intimate relations during fasting hours. Unintentional actions (forgetting you're fasting) generally don't break the fast according to most scholars."
        }
      ]
    },
    {
      category: "Health & Safety",
      questions: [
        {
          q: "Is fasting safe?",
          qAr: "هل الصيام آمن؟",
          a: "For most healthy adults, fasting is safe. However, those with certain medical conditions, pregnant or breastfeeding women, and the elderly should consult a doctor. Islam exempts those for whom fasting poses health risks."
        },
        {
          q: "Can I take medication while fasting?",
          qAr: "هل يمكنني تناول الأدوية أثناء الصيام؟",
          a: "Essential medications should be taken. If you must take medication during fasting hours, Islam permits breaking the fast for health reasons. You can make up missed days later or pay fidya (compensation)."
        },
        {
          q: "What if I feel unwell while fasting?",
          qAr: "ماذا لو شعرت بالتعب أثناء الصيام؟",
          a: "If you experience severe symptoms like dizziness, fainting, or extreme weakness, you should break your fast immediately. Your health is a priority in Islam."
        }
      ]
    },
    {
      category: "Using TryRamadan",
      questions: [
        {
          q: "Do I need to be Muslim to use this app?",
          qAr: "هل يجب أن أكون مسلماً لاستخدام التطبيق؟",
          a: "Not at all! TryRamadan welcomes everyone. Whether you're curious about fasting, interested in the health benefits, or simply want to learn about Ramadan culture, this app is for you."
        },
        {
          q: "How accurate are the prayer times?",
          qAr: "ما مدى دقة أوقات الصلاة؟",
          a: "We use the Aladhan API which calculates prayer times based on your exact location. Times are calculated using established astronomical methods approved by Islamic scholars."
        },
        {
          q: "Is my data private?",
          qAr: "هل بياناتي خاصة؟",
          a: "Yes, your fasting progress and preferences are stored locally on your device. We don't collect or store personal data on our servers."
        },
        {
          q: "Can I track non-Ramadan fasts?",
          qAr: "هل يمكنني تتبع الصيام خارج رمضان؟",
          a: "Yes! The app supports Sunnah fasting (Mondays, Thursdays, Ayyam al-Beed) and you can track any voluntary fasts throughout the year."
        }
      ]
    },
    {
      category: "Cultural & Religious",
      questions: [
        {
          q: "What is Suhoor and Iftar?",
          qAr: "ما هو السحور والإفطار؟",
          a: "Suhoor is the pre-dawn meal eaten before Fajr to prepare for the day's fast. Iftar is the meal eaten at sunset (Maghrib) to break the fast, traditionally starting with dates and water."
        },
        {
          q: "What are Sunnah fasting days?",
          qAr: "ما هي أيام صيام السنة؟",
          a: "Sunnah fasts are voluntary fasts based on Prophet Muhammad's (PBUH) practice. These include Mondays and Thursdays, the 13th-15th of each Islamic month (Ayyam al-Beed), and specific days like Ashura."
        },
        {
          q: "What is Laylat al-Qadr?",
          qAr: "ما هي ليلة القدر؟",
          a: "Laylat al-Qadr (Night of Power) falls in the last 10 nights of Ramadan. It's considered the holiest night of the year, when the Quran was first revealed. Worship on this night equals worship for a thousand months."
        }
      ]
    }
  ];
  
  const filteredFaqs = faqs.map(category => ({
    ...category,
    questions: category.questions.filter(
      q => q.q.toLowerCase().includes(searchQuery.toLowerCase()) ||
           q.a.toLowerCase().includes(searchQuery.toLowerCase())
    )
  })).filter(category => category.questions.length > 0);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="pt-20 pb-16">
        <div className="container mx-auto px-4 max-w-4xl">
          <Link 
            to="/" 
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <h1 className="text-2xl md:text-3xl font-display font-bold">
              <ArabicHover arabic="الأسئلة الشائعة">Frequently Asked Questions</ArabicHover>
            </h1>
            <p className="text-muted-foreground mt-2">
              Everything you need to know about fasting and using TryRamadan
            </p>
          </motion.div>
          
          {/* Search */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-8"
          >
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search questions..."
                className="w-full pl-12 pr-4 py-3 rounded-xl border border-border bg-background focus:border-secondary focus:ring-1 focus:ring-secondary outline-none transition-all"
              />
            </div>
          </motion.div>
          
          {/* FAQ categories */}
          <div className="space-y-8">
            {filteredFaqs.map((category, catIndex) => (
              <motion.div
                key={category.category}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 + catIndex * 0.05 }}
              >
                <h2 className="font-display font-bold text-lg mb-4 flex items-center gap-2">
                  <HelpCircle className="w-5 h-5 text-secondary" />
                  {category.category}
                </h2>
                
                <div className="space-y-3">
                  {category.questions.map((faq, qIndex) => {
                    const globalIndex = catIndex * 100 + qIndex;
                    const isOpen = openIndex === globalIndex;
                    
                    return (
                      <div 
                        key={qIndex}
                        className="rounded-2xl border border-border overflow-hidden"
                      >
                        <button
                          onClick={() => setOpenIndex(isOpen ? null : globalIndex)}
                          className="w-full p-4 flex items-center justify-between text-left bg-card hover:bg-muted/50 transition-colors"
                        >
                          <div>
                            <span className="font-medium">
                              <ArabicHover arabic={faq.qAr}>{faq.q}</ArabicHover>
                            </span>
                          </div>
                          <ChevronDown className={`w-5 h-5 text-muted-foreground transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                        </button>
                        
                        {isOpen && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="px-4 pb-4"
                          >
                            <p className="text-muted-foreground pt-2 border-t border-border">
                              {faq.a}
                            </p>
                          </motion.div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            ))}
          </div>
          
          {filteredFaqs.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              <HelpCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No questions found matching "{searchQuery}"</p>
            </div>
          )}
          
          {/* Contact section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mt-12 p-6 rounded-2xl bg-gradient-to-r from-primary/10 to-secondary/10 border border-border text-center"
          >
            <h3 className="font-display font-bold text-lg mb-2">Still have questions?</h3>
            <p className="text-muted-foreground mb-4">
              We're here to help you on your Ramadan journey
            </p>
            <a 
              href="mailto:support@tryramadan.app"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-secondary text-secondary-foreground font-medium"
            >
              Contact Support
            </a>
          </motion.div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default FAQ;
