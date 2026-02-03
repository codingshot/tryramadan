import { Link } from "react-router-dom";
import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ApiErrorRetryProps {
  /** e.g. "Could not load prayer times" */
  title: string;
  /** Optional detail from API or generic message */
  message?: string;
  onRetry: () => void;
  /** Show a "Set location" link (for prayer/export flows) */
  showSetLocation?: boolean;
  /** When retry is in progress */
  retrying?: boolean;
  className?: string;
}

export function ApiErrorRetry({
  title,
  message,
  onRetry,
  showSetLocation = true,
  retrying = false,
  className = "",
}: ApiErrorRetryProps) {
  return (
    <div
      className={`rounded-2xl border border-destructive/30 bg-destructive/5 px-4 py-6 text-center ${className}`}
      role="alert"
    >
      <AlertCircle className="w-10 h-10 mx-auto mb-2 text-destructive" aria-hidden />
      <p className="font-medium text-destructive mb-1">{title}</p>
      {message && <p className="text-sm text-muted-foreground mb-4">{message}</p>}
      <div className="flex flex-wrap items-center justify-center gap-3">
        <Button
          variant="secondary"
          size="sm"
          onClick={onRetry}
          disabled={retrying}
          aria-busy={retrying}
        >
          {retrying ? "Retrying…" : "Try again"}
        </Button>
        {showSetLocation && (
          <Link to="/settings">
            <Button variant="outline" size="sm">
              Set location in Settings
            </Button>
          </Link>
        )}
      </div>
    </div>
  );
}
