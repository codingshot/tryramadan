import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Heart, ExternalLink } from "lucide-react";
import logo from "@/assets/logo.png";

export const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-primary text-primary-foreground">
      {/* Main footer content */}
      <div className="container mx-auto px-4 py-16">
        <div className="grid md:grid-cols-4 gap-12">
          {/* Brand */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-3 mb-4">
              <img src={logo} alt="TryRamadan" className="w-12 h-12" />
              <span className="font-display font-bold text-xl">
                Try<span className="text-secondary">Ramadan</span>
              </span>
            </div>
            <p className="text-primary-foreground/70 mb-6 max-w-md">
              A culturally immersive wellness app that introduces non-Muslims to the practice 
              of Ramadan fasting through a progressive, educational, and respectful approach.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-display font-bold mb-4">Quick Links</h4>
            <ul className="space-y-2">
              <li>
                <a href="/#features" className="text-primary-foreground/70 hover:text-secondary transition-colors text-sm">
                  Features
                </a>
              </li>
              <li>
                <Link to="/programs" className="text-primary-foreground/70 hover:text-secondary transition-colors text-sm">
                  Fasting Programs
                </Link>
              </li>
              <li>
                <Link to="/culture" className="text-primary-foreground/70 hover:text-secondary transition-colors text-sm">
                  Culture
                </Link>
              </li>
              <li>
                <a href="/#health" className="text-primary-foreground/70 hover:text-secondary transition-colors text-sm">
                  Health Benefits
                </a>
              </li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h4 className="font-display font-bold mb-4">Resources</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/learn/glossary" className="text-primary-foreground/70 hover:text-secondary transition-colors text-sm">
                  Glossary
                </Link>
              </li>
              <li>
                <Link to="/learn/hadith" className="text-primary-foreground/70 hover:text-secondary transition-colors text-sm">
                  Hadith
                </Link>
              </li>
              <li>
                <Link to="/health-safety" className="text-primary-foreground/70 hover:text-secondary transition-colors text-sm">
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
                  Emergency
                </Link>
              </li>
              <li>
                <Link to="/settings" className="text-primary-foreground/70 hover:text-secondary transition-colors text-sm">
                  Settings
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
                <a href="/#about" className="text-primary-foreground/70 hover:text-secondary transition-colors text-sm">
                  About Us
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-primary-foreground/10">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm text-primary-foreground/60">
              © {currentYear} TryRamadan.app. All rights reserved.
            </p>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
              <Link to="/terms" className="text-sm text-primary-foreground/60 hover:text-secondary transition-colors">
                Terms
              </Link>
              <Link to="/legal" className="text-sm text-primary-foreground/60 hover:text-secondary transition-colors">
                Legal
              </Link>
              <Link to="/privacy" className="text-sm text-primary-foreground/60 hover:text-secondary transition-colors">
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
