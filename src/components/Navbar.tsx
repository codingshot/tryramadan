import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Link, useLocation } from "react-router-dom";
import { Menu, X, MapPin, User } from "lucide-react";
import logo from "@/assets/logo.png";
import { useUserPreferences, useFastingProgress, isFastingToday, useDisplayTimezone } from "@/hooks/useLocalStorage";
import { useAutoLocation } from "@/hooks/useLocation";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

export const Navbar = () => {
  const { pathname } = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [localTime, setLocalTime] = useState("");
  const [preferences] = useUserPreferences();
  const [progress] = useFastingProgress();
  const { location: autoLocation } = useAutoLocation();
  const fastingToday = isFastingToday(progress);
  const daysFasting = (progress.completedDays ?? []).length;

  const displayLocation = preferences.location || (autoLocation ? autoLocation.displayName : null);
  const locationShort = displayLocation ? displayLocation.split(",").slice(0, 2).join(",").trim() : "Set location";
  const displayTimezone = useDisplayTimezone();

  useEffect(() => {
    const formatTime = () => {
      const tz = displayTimezone?.trim();
      if (tz) {
        const formatter = new Intl.DateTimeFormat(undefined, {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          timeZone: tz,
        });
        setLocalTime(formatter.format(new Date()));
      } else {
        setLocalTime(
          new Date().toLocaleTimeString(undefined, {
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
          })
        );
      }
    };
    formatTime();
    const interval = setInterval(formatTime, 2000);
    return () => clearInterval(interval);
  }, [displayTimezone]);

  const navLinks = [
    { name: "Programs", nameAr: "البرامج", to: "/programs" },
    { name: "Track meals", nameAr: "تتبع الوجبات", to: "/dashboard/meals" },
    { name: "Recipes", nameAr: "وصفات", to: "/recipes" },
    { name: "Culture", nameAr: "الثقافة", to: "/culture" },
    { name: "Journal", nameAr: "يوميات", to: "/dashboard/journal" },
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
                <picture className="w-9 h-9 md:w-11 md:h-11 shrink-0 block">
                  <img src={logo} alt="TryRamadan logo - Ramadan fasting app" width={44} height={44} decoding="async" className="w-full h-full" />
                </picture>
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
              {navLinks.map((link) => {
                const isActive = pathname === link.to || (link.to !== "/" && pathname.startsWith(link.to));
                return (
                  <Link
                    key={link.name}
                    to={link.to}
                    onClick={() => setIsOpen(false)}
                    className={`text-sm font-medium transition-colors rounded-md px-2 py-1.5 -mx-2 -my-1.5 ${
                      isActive
                        ? "text-foreground bg-muted/60 hover:bg-muted"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted/40"
                    }`}
                    aria-current={isActive ? "page" : undefined}
                  >
                    {link.name}
                  </Link>
                );
              })}
            </div>

            {/* Location, time, profile & CTA — only on lg so we don't duplicate profile icon with hamburger row */}
            <div className="hidden lg:flex items-center gap-3">
              <Link
                to="/settings"
                className={`flex items-center gap-1.5 text-sm transition-colors min-w-0 max-w-[140px] cursor-pointer rounded-md px-2 py-1.5 ${
                  pathname === "/settings" ? "text-foreground bg-muted/60" : "text-muted-foreground hover:text-foreground hover:bg-muted/40"
                }`}
                aria-current={pathname === "/settings" ? "page" : undefined}
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
                className={`p-2 rounded-lg transition-colors ${
                  pathname.startsWith("/dashboard") ? "bg-muted/60 text-foreground" : "hover:bg-muted"
                }`}
                aria-label="Go to dashboard"
                aria-current={pathname.startsWith("/dashboard") ? "page" : undefined}
              >
                <User className={`w-5 h-5 ${pathname.startsWith("/dashboard") ? "text-foreground" : "text-muted-foreground hover:text-foreground"}`} />
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
                className={`p-3 rounded-lg transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center ${
                  pathname.startsWith("/dashboard") ? "bg-muted/60" : "hover:bg-muted"
                }`}
                aria-label="Go to dashboard"
                aria-current={pathname.startsWith("/dashboard") ? "page" : undefined}
              >
                <User className={`w-5 h-5 ${pathname.startsWith("/dashboard") ? "text-foreground" : "text-muted-foreground hover:text-foreground"}`} />
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
                  const isActive = pathname === link.to || (link.to !== "/" && pathname.startsWith(link.to));
                  return (
                    <Link
                      key={link.name}
                      to={link.to}
                      onClick={() => setIsOpen(false)}
                      className={`flex items-center justify-between py-3 px-4 rounded-lg transition-colors min-h-[44px] ${
                        isActive ? "bg-muted/60 text-foreground font-medium" : "hover:bg-muted text-muted-foreground hover:text-foreground"
                      }`}
                      aria-current={isActive ? "page" : undefined}
                    >
                      <span className="text-sm font-medium">
                        {link.name}
                      </span>
                    </Link>
                  );
                })}
                <div className="mt-4 pt-4 border-t border-border flex flex-col gap-2">
                  <Link
                    to="/settings"
                    onClick={() => setIsOpen(false)}
                    className={`flex items-center gap-2 text-sm min-h-[44px] items-center cursor-pointer rounded-lg px-4 py-3 ${
                      pathname === "/settings" ? "bg-muted/60 text-foreground font-medium" : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    }`}
                    aria-current={pathname === "/settings" ? "page" : undefined}
                  >
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
