import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import {
  Home,
  LayoutDashboard,
  BookOpen,
  UtensilsCrossed,
  Globe,
  Heart,
  ChevronRight,
} from "lucide-react";
import { PageSEO } from "@/components/PageSEO";

const suggestions = [
  {
    to: "/",
    label: "Return to Home",
    ariaLabel: "Return to home page",
    description: "Landing page and countdown to Ramadan",
    icon: Home,
    primary: true,
  },
  {
    to: "/dashboard",
    label: "Go to Dashboard",
    ariaLabel: "Go to dashboard",
    description: "Today's fast, timer, and progress",
    icon: LayoutDashboard,
    primary: true,
  },
  {
    to: "/dashboard/learn",
    label: "Learn",
    ariaLabel: "Go to Learn – guides and hadith",
    description: "Guides, hadith, and glossary",
    icon: BookOpen,
    primary: false,
  },
  {
    to: "/recipes",
    label: "Recipes",
    ariaLabel: "Browse recipes",
    description: "Suhoor and iftar ideas",
    icon: UtensilsCrossed,
    primary: false,
  },
  {
    to: "/dashboard/culture",
    label: "Culture",
    ariaLabel: "Explore culture and traditions",
    description: "Traditions by country",
    icon: Globe,
    primary: false,
  },
  {
    to: "/health-safety",
    label: "Health & safety",
    ariaLabel: "Health and when to break fast",
    description: "When to break fast safely",
    icon: Heart,
    primary: false,
  },
];

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  const primaryLinks = suggestions.filter((s) => s.primary);
  const secondaryLinks = suggestions.filter((s) => !s.primary);

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted px-4 py-12">
      <PageSEO
        title="404 | Page Not Found | TryRamadan.app"
        description="The page you're looking for doesn't exist. Return to TryRamadan.app to start your Ramadan fasting journey."
        robots="noindex, nofollow"
      />
      <main id="main-content" className="w-full max-w-lg text-center">
        <h1 className="mb-2 text-4xl sm:text-5xl font-bold tracking-tight">404</h1>
        <p className="mb-2 text-lg sm:text-xl text-muted-foreground">
          Oops! Page not found
        </p>
        <p className="mb-8 text-sm text-muted-foreground max-w-sm mx-auto">
          The link may be broken or the page was moved. Here are some places that might help:
        </p>

        {/* Primary CTAs */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center mb-8">
          {primaryLinks.map(({ to, label, ariaLabel, icon: Icon }) => (
            <Link
              key={to}
              to={to}
              className="inline-flex items-center justify-center gap-2 min-h-[48px] px-6 py-3 rounded-xl bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              aria-label={ariaLabel}
            >
              <Icon className="w-5 h-5 shrink-0" aria-hidden />
              {label}
            </Link>
          ))}
        </div>

        {/* Suggested links */}
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-3">
          Or try one of these
        </p>
        <ul className="space-y-2 text-left" role="list">
          {secondaryLinks.map(({ to, label, ariaLabel, description, icon: Icon }) => (
            <li key={to}>
              <Link
                to={to}
                className="flex items-center gap-3 p-3 rounded-xl border border-border bg-background hover:bg-muted/50 hover:border-primary/30 transition-colors group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                aria-label={ariaLabel}
              >
                <span
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary"
                  aria-hidden
                >
                  <Icon className="w-5 h-5" />
                </span>
                <span className="flex-1 min-w-0 text-left">
                  <span className="font-medium text-foreground block">{label}</span>
                  <span className="text-sm text-muted-foreground">{description}</span>
                </span>
                <ChevronRight
                  className="w-5 h-5 shrink-0 text-muted-foreground group-hover:text-primary"
                  aria-hidden
                />
              </Link>
            </li>
          ))}
        </ul>
      </main>
    </div>
  );
};

export default NotFound;
