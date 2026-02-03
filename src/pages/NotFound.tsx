import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { PageSEO } from "@/components/PageSEO";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted px-4">
      <PageSEO
        title="404 | Page Not Found | TryRamadan.app"
        description="The page you're looking for doesn't exist. Return to TryRamadan.app to start your Ramadan fasting journey."
        robots="noindex, nofollow"
      />
      <main id="main-content" className="text-center max-w-md">
        <h1 className="mb-4 text-3xl sm:text-4xl font-bold">404</h1>
        <p className="mb-6 text-lg sm:text-xl text-muted-foreground">Oops! Page not found</p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <a
            href="/"
            className="inline-flex items-center justify-center min-h-[44px] px-6 py-3 rounded-xl bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors"
          >
            Return to Home
          </a>
          <a
            href="/dashboard"
            className="inline-flex items-center justify-center min-h-[44px] px-6 py-3 rounded-xl border border-border bg-background font-medium hover:bg-muted transition-colors"
          >
            Go to Dashboard
          </a>
        </div>
      </main>
    </div>
  );
};

export default NotFound;
