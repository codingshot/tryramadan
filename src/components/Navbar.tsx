import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Menu, X, MapPin, User } from "lucide-react";
import logo from "@/assets/logo.png";
import { useUserPreferences, useFastingProgress, isFastingToday, useDisplayTimezone } from "@/hooks/useLocalStorage";
import { useAutoLocation } from "@/hooks/useLocation";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

export const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [localTime, setLocalTime] = useState("");
  const [preferences] = useUserPreferences();
  const [progress] = useFastingProgress();
  const { location: autoLocation } = useAutoLocation();
  const fastingToday = isFastingToday(progress);
  const daysFasting = progress.completedDays.length;

  const displayLocation = preferences.location || (autoLocation ? autoLocation.displayName : null);
  const locationShort = displayLocation ? displayLocation.split(",").slice(0, 2).join(",").trim() : "Set location";
  const displayTimezone = useDisplayTimezone();

  useEffect(() => {
    const formatTime = () => {
      setLocalTime(
        new Date().toLocaleTimeString(undefined, {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          ...(displayTimezone && { timeZone: displayTimezone }),
        })
      );
    };
    formatTime();
    const interval = setInterval(formatTime, 1000);
    return () => clearInterval(interval);
  }, [displayTimezone]);

  const navLinks = [
    { name: "Features", nameAr: "المميزات", to: "/" },
    { name: "Programs", nameAr: "البرامج", to: "/programs" },
    { name: "Health", nameAr: "الصحة", to: "/health" },
    { name: "Recipes", nameAr: "وصفات", to: "/recipes" },
    { name: "Culture", nameAr: "الثقافة", to: "/culture" },
    { name: "About", nameAr: "عنا", to: "/faq" },
  ];

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleStartJourney = () => setIsOpen(false);

  return (
    <>
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[100] focus:px-4 focus:py-2 focus:rounded-lg focus:ring-2 focus:ring-secondary focus:ring-offset-2 focus:bg-background focus:outline-none"
      >
        Skip to main content
      </a>
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
                <img src={logo} alt="" width={44} height={44} decoding="async" className="w-9 h-9 md:w-11 md:h-11" aria-hidden />
                <span className="font-display font-bold text-base md:text-lg leading-tight text-foreground">
                  Try<span className="text-primary-contrast">Ramadan</span>
                </span>
              </Link>
              {fastingToday && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Link
                      to="/dashboard"
                      onClick={() => setIsOpen(false)}
                      className="inline-flex items-center px-2 py-0.5 rounded-full bg-secondary/20 text-secondary text-xs font-medium shrink-0 cursor-pointer hover:bg-secondary/30 transition-colors"
                      aria-label={`Fasting today; ${daysFasting} day${daysFasting === 1 ? "" : "s"} completed — open dashboard`}
                    >
                      <span className="sm:hidden">{daysFasting} day{daysFasting === 1 ? "" : "s"}</span>
                      <span className="hidden sm:inline">Fasting · {daysFasting} day{daysFasting === 1 ? "" : "s"}</span>
                    </Link>
                  </TooltipTrigger>
                  <TooltipContent side="bottom" className="max-w-xs">
                    <p className="font-medium text-sm">You&apos;re fasting today</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {daysFasting} day{daysFasting === 1 ? "" : "s"} completed this Ramadan. Click to open dashboard.
                    </p>
                  </TooltipContent>
                </Tooltip>
              )}
            </div>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center gap-6">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.to}
                  onClick={() => setIsOpen(false)}
                  className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                >
                  {link.name}
                </Link>
              ))}
            </div>

            {/* Location, time, profile & CTA */}
            <div className="hidden md:flex items-center gap-3">
              <Link
                to="/settings"
                className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors min-w-0 max-w-[140px] cursor-pointer"
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
                  aria-label="Start your journey"
                >
                  Start your journey
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
                {navLinks.map((link) => (
                  <Link
                    key={link.name}
                    to={link.to}
                    onClick={() => setIsOpen(false)}
                    className="flex items-center justify-between py-3 px-4 rounded-lg hover:bg-muted transition-colors min-h-[44px]"
                  >
                    <span className="text-sm font-medium text-foreground">
                      {link.name}
                    </span>
                  </Link>
                ))}
                <div className="mt-4 pt-4 border-t border-border flex flex-col gap-2">
                  <Link to="/settings" onClick={() => setIsOpen(false)} className="flex items-center gap-2 text-sm text-muted-foreground min-h-[44px] items-center cursor-pointer">
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
                    Start Your Journey
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
