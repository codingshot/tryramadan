import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Heart, ExternalLink, Sun, Moon, Monitor, LogIn, Activity, Utensils, BookOpen, BookMarked } from "lucide-react";
import logo from "@/assets/logo.png";
import { useUserPreferences } from "@/hooks/useLocalStorage";

function applyTheme(theme: "light" | "dark" | "system") {
  if (theme === "dark") document.documentElement.classList.add("dark");
  else if (theme === "light") document.documentElement.classList.remove("dark");
  else {
    if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }
}

export const Footer = () => {
  const currentYear = new Date().getFullYear();
  const [preferences, setPreferences] = useUserPreferences();

  const handleThemeChange = (theme: "light" | "dark" | "system") => {
    setPreferences({ ...preferences, theme });
    applyTheme(theme);
  };

  return (
    <footer className="bg-primary text-primary-foreground">
      {/* Main footer content */}
      <div className="container mx-auto px-4 py-10 sm:py-12 md:py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
          {/* Brand */}
          <div className="sm:col-span-2">
            <div className="flex items-center gap-3 mb-4">
              <img src={logo} alt="TryRamadan" className="w-12 h-12" />
              <span className="font-display font-bold text-xl">
                Try<span className="text-secondary">Ramadan</span>
              </span>
            </div>
            <p className="text-primary-foreground/70 mb-6 max-w-md text-sm sm:text-base">
              A culturally immersive wellness app that introduces non-Muslims to the practice 
              of Ramadan fasting through a progressive, educational, and respectful approach.
            </p>
          </div>

          {/* Quick Links - touch-friendly on mobile */}
          <div>
            <h4 className="font-display font-bold mb-4">Quick Links</h4>
            <ul className="space-y-1 sm:space-y-2">
              <li>
                <Link to="/" state={{ scrollTo: "features" }} className="inline-block py-2 sm:py-0 text-primary-foreground/70 hover:text-secondary transition-colors text-sm min-h-[44px] sm:min-h-0 flex items-center">
                  Features
                </Link>
              </li>
              <li>
                <Link to="/programs" className="inline-block py-2 sm:py-0 text-primary-foreground/70 hover:text-secondary transition-colors text-sm min-h-[44px] sm:min-h-0 flex items-center">Fasting Programs</Link>
              </li>
              <li>
                <Link to="/recipes" className="inline-block py-2 sm:py-0 text-primary-foreground/70 hover:text-secondary transition-colors text-sm min-h-[44px] sm:min-h-0 flex items-center">Recipes</Link>
              </li>
              <li>
                <Link to="/culture" className="inline-block py-2 sm:py-0 text-primary-foreground/70 hover:text-secondary transition-colors text-sm min-h-[44px] sm:min-h-0 flex items-center">Culture</Link>
              </li>
              <li>
                <Link to="/health-safety" className="inline-block py-2 sm:py-0 text-primary-foreground/70 hover:text-secondary transition-colors text-sm min-h-[44px] sm:min-h-0 flex items-center">Health Benefits</Link>
              </li>
            </ul>
          </div>

          {/* Your fasting */}
          <div>
            <h4 className="font-display font-bold mb-4">Your fasting</h4>
            <ul className="space-y-1 sm:space-y-2">
              <li>
                <Link to="/dashboard/today" className="inline-flex items-center gap-2 py-2 sm:py-0 text-primary-foreground/70 hover:text-secondary transition-colors text-sm min-h-[44px] sm:min-h-0">
                  <LogIn className="w-4 h-4 flex-shrink-0" aria-hidden />
                  Log your fast
                </Link>
              </li>
              <li>
                <Link to="/dashboard/progress" className="inline-flex items-center gap-2 py-2 sm:py-0 text-primary-foreground/70 hover:text-secondary transition-colors text-sm min-h-[44px] sm:min-h-0">
                  <Activity className="w-4 h-4 flex-shrink-0" aria-hidden />
                  Fasting state
                </Link>
              </li>
              <li>
                <Link to="/dashboard/meals" className="inline-flex items-center gap-2 py-2 sm:py-0 text-primary-foreground/70 hover:text-secondary transition-colors text-sm min-h-[44px] sm:min-h-0">
                  <Utensils className="w-4 h-4 flex-shrink-0" aria-hidden />
                  Log your meal
                </Link>
              </li>
              <li>
                <Link to="/dashboard/journal" className="inline-flex items-center gap-2 py-2 sm:py-0 text-primary-foreground/70 hover:text-secondary transition-colors text-sm min-h-[44px] sm:min-h-0">
                  <BookOpen className="w-4 h-4 flex-shrink-0" aria-hidden />
                  Journal for today
                </Link>
              </li>
              <li>
                <Link to="/dashboard/quran" className="inline-flex items-center gap-2 py-2 sm:py-0 text-primary-foreground/70 hover:text-secondary transition-colors text-sm min-h-[44px] sm:min-h-0">
                  <BookMarked className="w-4 h-4 flex-shrink-0" aria-hidden />
                  Quran of the day
                </Link>
              </li>
              <li>
                <Link to="/dashboard" className="inline-block py-2 sm:py-0 text-primary-foreground/70 hover:text-secondary transition-colors text-sm min-h-[44px] sm:min-h-0">
                  Dashboard
                </Link>
              </li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h4 className="font-display font-bold mb-4">Resources</h4>
            <ul className="space-y-1 sm:space-y-2">
              <li>
                <Link to="/guides" className="inline-block py-2 sm:py-0 text-primary-foreground/70 hover:text-secondary transition-colors text-sm min-h-[44px] sm:min-h-0 flex items-center">User Guides</Link>
              </li>
              <li>
                <Link to="/personas" className="inline-block py-2 sm:py-0 text-primary-foreground/70 hover:text-secondary transition-colors text-sm min-h-[44px] sm:min-h-0 flex items-center">Personas</Link>
              </li>
              <li>
                <Link to="/learn/glossary" className="inline-block py-2 sm:py-0 text-primary-foreground/70 hover:text-secondary transition-colors text-sm min-h-[44px] sm:min-h-0 flex items-center">Glossary</Link>
              </li>
              <li>
                <Link to="/learn/hadith" className="inline-block py-2 sm:py-0 text-primary-foreground/70 hover:text-secondary transition-colors text-sm min-h-[44px] sm:min-h-0 flex items-center">Hadith</Link>
              </li>
              <li>
                <Link to="/health-safety" className="inline-block py-2 sm:py-0 text-primary-foreground/70 hover:text-secondary transition-colors text-sm min-h-[44px] sm:min-h-0 flex items-center">
                  Health & Safety
                </Link>
              </li>
              <li>
                <Link to="/faq" className="text-primary-foreground/70 hover:text-secondary transition-colors text-sm">
                  FAQ
                </Link>
              </li>
              <li>
                <Link to="/emergency" className="text-primary-foreground/70 hover:text-secondary transition-colors text-sm">
                  Emergency: break fast & resources
                </Link>
              </li>
              <li>
                <Link to="/settings" className="text-primary-foreground/70 hover:text-secondary transition-colors text-sm">
                  Settings (location, notifications)
                </Link>
              </li>
              <li>
                <a 
                  href="https://sunnah.com" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-primary-foreground/70 hover:text-secondary transition-colors text-sm flex items-center gap-1"
                >
                  Sunnah.com <ExternalLink className="w-3 h-3" />
                </a>
              </li>
              <li>
                <a 
                  href="https://quran.com" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-primary-foreground/70 hover:text-secondary transition-colors text-sm flex items-center gap-1"
                >
                  Quran.com <ExternalLink className="w-3 h-3" />
                </a>
              </li>
              <li>
                <Link to="/" state={{ scrollTo: "about" }} className="text-primary-foreground/70 hover:text-secondary transition-colors text-sm">
                  About Us
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-primary-foreground/10">
        <div className="container mx-auto px-4 py-4 sm:py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-xs sm:text-sm text-primary-foreground/60 text-center md:text-left">
              © {currentYear} TryRamadan.app. All rights reserved.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2">
              {/* Theme toggle */}
              <span className="text-xs sm:text-sm text-primary-foreground/60 mr-1">Theme</span>
              <div className="flex rounded-lg border border-primary-foreground/20 overflow-hidden" role="group" aria-label="Theme">
                {[
                  { id: "light" as const, label: "Light", Icon: Sun },
                  { id: "dark" as const, label: "Dark", Icon: Moon },
                  { id: "system" as const, label: "System", Icon: Monitor },
                ].map(({ id, label, Icon }) => (
                  <button
                    key={id}
                    type="button"
                    onClick={() => handleThemeChange(id)}
                    title={label}
                    aria-pressed={preferences.theme === id}
                    className={`min-h-[44px] min-w-[44px] sm:min-w-[48px] p-2 flex items-center justify-center transition-colors ${
                      preferences.theme === id
                        ? "bg-secondary text-secondary-foreground"
                        : "text-primary-foreground/70 hover:bg-primary-foreground/10 hover:text-primary-foreground"
                    }`}
                  >
                    <Icon className="w-5 h-5" aria-hidden />
                    <span className="sr-only">{label}</span>
                  </button>
                ))}
              </div>
              <Link to="/terms" className="text-xs sm:text-sm text-primary-foreground/60 hover:text-secondary transition-colors min-h-[44px] min-w-[44px] inline-flex items-center justify-center">
                Terms
              </Link>
              <Link to="/legal" className="text-xs sm:text-sm text-primary-foreground/60 hover:text-secondary transition-colors min-h-[44px] min-w-[44px] inline-flex items-center justify-center">
                Legal
              </Link>
              <Link to="/privacy" className="text-xs sm:text-sm text-primary-foreground/60 hover:text-secondary transition-colors min-h-[44px] min-w-[44px] inline-flex items-center justify-center">
                Privacy
              </Link>
              <a 
                href="https://ummah.build" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-sm text-primary-foreground/60 flex items-center gap-1 hover:text-secondary transition-colors"
              >
                Built with <Heart className="w-4 h-4 text-secondary fill-secondary" /> by{" "}
                <span className="text-secondary font-semibold">ummah.build</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};
