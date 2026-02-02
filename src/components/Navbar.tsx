import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Link, useLocation } from "react-router-dom";
import { Menu, X, MapPin, User } from "lucide-react";
import logo from "@/assets/logo.png";
import { ArabicHover } from "./ArabicHover";
import { useUserPreferences, useFastingProgress, isFastingToday } from "@/hooks/useLocalStorage";
import { useAutoLocation } from "@/hooks/useLocation";

export const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [localTime, setLocalTime] = useState("");
  const location = useLocation();
  const isHome = location.pathname === "/";
  const [preferences] = useUserPreferences();
  const [progress] = useFastingProgress();
  const { location: autoLocation } = useAutoLocation();
  const fastingToday = isFastingToday(progress);
  const daysFasting = progress.completedDays.length;

  const displayLocation = preferences.location || (autoLocation ? autoLocation.displayName : null);
  const locationShort = displayLocation ? displayLocation.split(",").slice(0, 2).join(",").trim() : "Set location";

  useEffect(() => {
    const formatTime = () => {
      setLocalTime(new Date().toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit", second: "2-digit" }));
    };
    formatTime();
    const interval = setInterval(formatTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const navLinks = [
    { name: "Features", nameAr: "المميزات", href: "#features", to: "/#features" },
    { name: "Programs", nameAr: "البرامج", href: "#programs", to: "/programs" },
    { name: "Recipes", nameAr: "وصفات", href: "", to: "/recipes" },
    { name: "Culture", nameAr: "الثقافة", href: "#culture", to: "/culture" },
    { name: "Health", nameAr: "الصحة", href: "#health", to: "/#health" },
    { name: "About", nameAr: "عنا", href: "#about", to: "/#about" },
  ];

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleStartJourney = () => setIsOpen(false);

  return (
    <>
      <motion.nav 
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-lg border-b border-border safe-area-top"
        style={{ paddingTop: 'env(safe-area-inset-top, 0px)' }}
      >
        <div className="container mx-auto px-3 sm:px-4">
          <div className="flex items-center justify-between h-14 sm:h-16 md:h-20 min-h-[44px]">
            {/* Logo + fasting tag when fasting */}
            <div className="flex items-center gap-2 min-w-0">
              <Link to="/" onClick={scrollToTop} className="flex items-center gap-2 md:gap-3 shrink-0">
                <img src={logo} alt="TryRamadan" className="w-9 h-9 md:w-11 md:h-11" />
                <ArabicHover arabic="تجربة رمضان" className="border-0">
                  <span className="font-display font-bold text-base md:text-lg leading-tight text-foreground">
                    Try<span className="text-primary">Ramadan</span>
                  </span>
                </ArabicHover>
              </Link>
              {fastingToday && (
                <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-secondary/20 text-secondary text-xs font-medium shrink-0" title={`Fasting · ${daysFasting} days completed`}>
                  <span className="sm:hidden">{daysFasting}d</span>
                  <span className="hidden sm:inline">Fasting · {daysFasting} days</span>
                </span>
              )}
            </div>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center gap-6">
              {navLinks.map((link) => {
                const isHashLink = link.to.startsWith("/#");
                const linkTo = !isHome && isHashLink
                  ? { pathname: "/" as const, hash: link.to.slice(2) }
                  : link.to;
                return isHome && link.href.startsWith("#") ? (
                  <a
                    key={link.name}
                    href={link.href}
                    className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <ArabicHover arabic={link.nameAr}>{link.name}</ArabicHover>
                  </a>
                ) : (
                  <Link
                    key={link.name}
                    to={linkTo}
                    onClick={() => setIsOpen(false)}
                    className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <ArabicHover arabic={link.nameAr}>{link.name}</ArabicHover>
                  </Link>
                );
              })}
            </div>

            {/* Location, time, profile & CTA */}
            <div className="hidden md:flex items-center gap-3">
              <Link
                to="/settings"
                className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors min-w-0 max-w-[140px]"
                title={displayLocation || "Set location for prayer times"}
              >
                <MapPin className="w-4 h-4 flex-shrink-0" />
                <span className="truncate">{locationShort}</span>
              </Link>
              <span className="text-sm text-muted-foreground tabular-nums" aria-live="polite">
                {localTime}
              </span>
              <Link
                to="/dashboard"
                onClick={() => setIsOpen(false)}
                className="p-2 rounded-lg hover:bg-muted transition-colors"
                aria-label="Go to dashboard"
              >
                <User className="w-5 h-5 text-muted-foreground hover:text-foreground" />
              </Link>
              {!preferences.onboardingComplete && (
                <Link
                  to="/onboarding/welcome"
                  onClick={handleStartJourney}
                  className="bg-primary text-primary-foreground hover:bg-primary/90 px-5 py-2.5 rounded-xl font-semibold text-sm transition-all"
                  aria-label="Start your journey — go to setup"
                >
                  <ArabicHover arabic="ابدأ" className="border-0 text-primary-foreground hover:border-primary-foreground/50">
                    Start your journey (setup)
                  </ArabicHover>
                </Link>
              )}
            </div>

            {/* Mobile: hamburger then profile icon to the right */}
            <div className="flex lg:hidden items-center gap-1">
              <button
                onClick={() => setIsOpen(!isOpen)}
                className="p-3 rounded-lg hover:bg-muted transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
                aria-label="Toggle menu"
              >
                {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
              <Link
                to="/dashboard"
                className="p-3 rounded-lg hover:bg-muted transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
                aria-label="Go to dashboard"
              >
                <User className="w-5 h-5 text-muted-foreground hover:text-foreground" />
              </Link>
            </div>
          </div>

          {/* Mobile Navigation */}
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="lg:hidden py-4 border-t border-border"
            >
              <div className="flex flex-col gap-0">
                {navLinks.map((link) => {
                  const isHashLink = link.to.startsWith("/#");
                  const linkTo = !isHome && isHashLink
                    ? { pathname: "/" as const, hash: link.to.slice(2) }
                    : link.to;
                  return isHome && link.href.startsWith("#") ? (
                    <a
                      key={link.name}
                      href={link.href}
                      onClick={() => setIsOpen(false)}
                      className="flex items-center justify-between py-3 px-4 rounded-lg hover:bg-muted transition-colors min-h-[44px]"
                    >
                      <span className="text-sm font-medium text-foreground">
                        <ArabicHover arabic={link.nameAr}>{link.name}</ArabicHover>
                      </span>
                    </a>
                  ) : (
                    <Link
                      key={link.name}
                      to={linkTo}
                      onClick={() => setIsOpen(false)}
                      className="flex items-center justify-between py-3 px-4 rounded-lg hover:bg-muted transition-colors min-h-[44px]"
                    >
                      <span className="text-sm font-medium text-foreground">
                        <ArabicHover arabic={link.nameAr}>{link.name}</ArabicHover>
                      </span>
                    </Link>
                  );
                })}
                <div className="mt-4 pt-4 border-t border-border flex flex-col gap-2">
                  <Link to="/settings" onClick={() => setIsOpen(false)} className="flex items-center gap-2 text-sm text-muted-foreground min-h-[44px] items-center">
                    <MapPin className="w-4 h-4" />
                    <span className="truncate">{locationShort}</span>
                  </Link>
                  <span className="text-sm text-muted-foreground tabular-nums py-2">{localTime}</span>
                </div>
                {!preferences.onboardingComplete && (
                  <Link 
                    to="/onboarding/welcome"
                    onClick={handleStartJourney}
                    className="bg-primary text-primary-foreground hover:bg-primary/90 text-sm w-full mt-4 py-3 min-h-[44px] rounded-xl font-semibold flex items-center justify-center"
                  >
                    <ArabicHover arabic="ابدأ رحلتك" className="border-0 text-primary-foreground">
                      Start Your Journey
                    </ArabicHover>
                  </Link>
                )}
              </div>
            </motion.div>
          )}
        </div>
      </motion.nav>

    </>
  );
};
