import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Heart, ExternalLink } from "lucide-react";
import logo from "@/assets/logo.png";

export const Footer = () => {
  const currentYear = new Date().getFullYear();

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
