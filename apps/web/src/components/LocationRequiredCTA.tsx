import { Link } from "react-router-dom";
import { MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";

interface LocationRequiredCTAProps {
  /** Short context, e.g. "for accurate prayer times" or "to include prayer times in export" */
  message?: string;
  className?: string;
  /** Use compact style (e.g. inline with other content) */
  compact?: boolean;
  /** For hero/dark backgrounds: light text and link */
  variant?: "default" | "dark";
}

const DEFAULT_MESSAGE = "Set your location for accurate prayer and fasting times.";

export function LocationRequiredCTA({
  message = DEFAULT_MESSAGE,
  className = "",
  compact = false,
  variant = "default",
}: LocationRequiredCTAProps) {
  const linkClass =
    variant === "dark"
      ? "text-primary-foreground/90 hover:text-primary-foreground underline focus-visible:ring-2 focus-visible:ring-primary-foreground focus-visible:ring-offset-2 focus-visible:ring-offset-primary rounded"
      : "text-secondary font-medium hover:underline focus-visible:ring-2 focus-visible:ring-secondary focus-visible:ring-offset-2 rounded";
  const textClass = variant === "dark" ? "text-primary-foreground/80" : "text-muted-foreground";

  if (compact) {
    return (
      <p className={`text-sm ${textClass} ${className}`}>
        {message}{" "}
        <Link to="/settings" className={linkClass}>
          Set location in Settings
        </Link>
      </p>
    );
  }
  return (
    <div
      className={`rounded-2xl border border-border bg-muted/30 text-center px-4 py-6 ${className}`}
      role="region"
      aria-label="Location required"
    >
      <MapPin className="w-10 h-10 mx-auto mb-3 text-muted-foreground" aria-hidden />
      <p className={`${textClass} mb-4`}>{message}</p>
      <Link to="/settings">
        <Button variant="secondary" size="sm" className="gap-2">
          <MapPin className="w-4 h-4" />
          Set location in Settings
        </Button>
      </Link>
    </div>
  );
}
