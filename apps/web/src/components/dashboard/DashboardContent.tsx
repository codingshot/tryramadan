import { motion } from "framer-motion";
import { BookOpen, Book, Globe, Activity, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import dailyFactsData from "@/data/daily-facts.json";

interface DashboardContentProps {
  userType?: string;
}

export const DashboardContent = ({ userType }: DashboardContentProps) => {
  // Get today's fact (cycle through facts based on day of month)
  const today = new Date();
  const dayOfMonth = today.getDate();
  const factDay = ((dayOfMonth - 1) % 30) + 1;
  const dailyFact =
    dailyFactsData.facts.find((f) => f.day === factDay) ||
    dailyFactsData.facts[0];

  // Explore links
  const exploreLinks = [
    {
      icon: Book,
      label: "Learn",
      description: "Islamic knowledge",
      href: "/learn",
      color: "text-blue-500",
      bgColor: "bg-blue-500/10",
    },
    {
      icon: Globe,
      label: "Culture",
      description: "Global traditions",
      href: "/culture",
      color: "text-green-500",
      bgColor: "bg-green-500/10",
    },
    {
      icon: BookOpen,
      label: "Quran",
      description: "Daily verses",
      href: "/quran",
      color: "text-purple-500",
      bgColor: "bg-purple-500/10",
    },
    {
      icon: Activity,
      label: "Habits",
      description: "Track daily habits",
      href: "/habits",
      color: "text-orange-500",
      bgColor: "bg-orange-500/10",
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.5 }}
      className="space-y-6"
    >
      {/* Daily Ramadan Fact */}
      <Link
        to="/learn"
        className="block p-5 rounded-2xl bg-gradient-to-br from-primary/5 to-secondary/5 border border-border hover:border-secondary/50 transition-colors"
      >
        <h3 className="font-semibold mb-2 flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-secondary" />
          Today's Ramadan Fact
        </h3>
        <p className="font-medium text-foreground mb-1">{dailyFact.title}</p>
        <p className="text-sm text-muted-foreground">{dailyFact.content}</p>
      </Link>

      {/* Explore More Links */}
      <div className="p-4 rounded-2xl bg-card border border-border">
        <h3 className="font-semibold mb-3 flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-primary" />
          Explore More
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {exploreLinks.map((link) => {
            const Icon = link.icon;
            return (
              <Link
                key={link.label}
                to={link.href}
                className={`flex flex-col items-center gap-2 p-4 rounded-xl border border-border ${link.bgColor} hover:opacity-80 transition-opacity`}
              >
                <div
                  className={`w-10 h-10 rounded-full ${link.bgColor} flex items-center justify-center`}
                >
                  <Icon className={`w-5 h-5 ${link.color}`} />
                </div>
                <div className="text-center">
                  <p className="font-semibold text-sm">{link.label}</p>
                  <p className="text-xs text-muted-foreground hidden sm:block">
                    {link.description}
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
};
