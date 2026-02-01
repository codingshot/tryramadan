import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Heart, Mail, ExternalLink } from "lucide-react";
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
            <div className="flex items-center gap-4">
              <a 
                href="mailto:hello@tryramadan.app" 
                className="flex items-center gap-2 text-sm text-secondary hover:text-secondary/80 transition-colors"
              >
                <Mail className="w-4 h-4" />
                hello@tryramadan.app
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-display font-bold mb-4">Quick Links</h4>
            <ul className="space-y-2">
              <li>
                <a href="#features" className="text-primary-foreground/70 hover:text-secondary transition-colors text-sm">
                  Features
                </a>
              </li>
              <li>
                <a href="#programs" className="text-primary-foreground/70 hover:text-secondary transition-colors text-sm">
                  Fasting Programs
                </a>
              </li>
              <li>
                <a href="#culture" className="text-primary-foreground/70 hover:text-secondary transition-colors text-sm">
                  Cultural Education
                </a>
              </li>
              <li>
                <a href="#health" className="text-primary-foreground/70 hover:text-secondary transition-colors text-sm">
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
                <a href="#" className="text-primary-foreground/70 hover:text-secondary transition-colors text-sm">
                  Privacy Policy
                </a>
              </li>
              <li>
                <a href="#" className="text-primary-foreground/70 hover:text-secondary transition-colors text-sm">
                  Terms of Service
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
            <p className="text-sm text-primary-foreground/60 flex items-center gap-1">
              Made with <Heart className="w-4 h-4 text-secondary fill-secondary" /> for interfaith understanding
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};
