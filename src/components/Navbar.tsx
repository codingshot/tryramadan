import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { useState } from "react";
import logo from "@/assets/logo.png";

export const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);

  const navLinks = [
    { name: "Features", nameAr: "المميزات", href: "#features" },
    { name: "Programs", nameAr: "البرامج", href: "#programs" },
    { name: "Culture", nameAr: "الثقافة", href: "#culture" },
    { name: "Health", nameAr: "الصحة", href: "#health" },
    { name: "About", nameAr: "عنا", href: "#about" },
  ];

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <motion.nav 
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border"
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <Link to="/" onClick={scrollToTop} className="flex items-center gap-2 md:gap-3">
            <img src={logo} alt="TryRamadan" className="w-9 h-9 md:w-11 md:h-11" />
            <div className="flex flex-col">
              <span className="font-display font-bold text-base md:text-lg leading-tight">
                Try<span className="text-secondary">Ramadan</span>
              </span>
              <span className="font-arabic text-xs text-secondary hidden sm:block">تجربة رمضان</span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-6">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors group"
              >
                <span>{link.name}</span>
                <span className="font-arabic text-xs text-secondary ml-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  {link.nameAr}
                </span>
              </a>
            ))}
          </div>

          {/* CTA Button */}
          <div className="hidden md:flex items-center gap-4">
            <button className="btn-hero text-sm px-5 py-2.5 flex items-center gap-2">
              <span>Start Journey</span>
              <span className="font-arabic text-xs">ابدأ</span>
            </button>
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-muted transition-colors"
            aria-label="Toggle menu"
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden py-4 border-t border-border"
          >
            <div className="flex flex-col gap-2">
              {navLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.href}
                  onClick={() => setIsOpen(false)}
                  className="flex items-center justify-between py-3 px-2 rounded-lg hover:bg-muted transition-colors"
                >
                  <span className="text-sm font-medium">{link.name}</span>
                  <span className="font-arabic text-sm text-secondary">{link.nameAr}</span>
                </a>
              ))}
              <button className="btn-hero text-sm w-full mt-4 flex items-center justify-center gap-2">
                <span>Start Your Journey</span>
                <span className="font-arabic">ابدأ رحلتك</span>
              </button>
            </div>
          </motion.div>
        )}
      </div>
    </motion.nav>
  );
};
