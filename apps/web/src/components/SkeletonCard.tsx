import { motion } from "framer-motion";

interface SkeletonCardProps {
  className?: string;
  lines?: number;
}

export const SkeletonCard = ({ className = "", lines = 3 }: SkeletonCardProps) => {
  return (
    <div className={`p-6 rounded-2xl bg-card border border-border ${className}`}>
      <motion.div
        className="space-y-3"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        {/* Title skeleton */}
        <div className="h-6 bg-muted rounded-lg w-1/3 animate-pulse" />
        
        {/* Content lines */}
        {Array.from({ length: lines }).map((_, i) => (
          <div
            key={i}
            className="h-4 bg-muted/70 rounded animate-pulse"
            style={{ width: `${80 - i * 10}%` }}
          />
        ))}
      </motion.div>
    </div>
  );
};

export const SkeletonPrayerTime = () => {
  return (
    <div className="flex items-center justify-between p-4 rounded-xl bg-card border border-border">
      <div className="space-y-2 flex-1">
        <div className="h-4 bg-muted rounded w-20 animate-pulse" />
        <div className="h-6 bg-muted rounded w-16 animate-pulse" />
      </div>
    </div>
  );
};

export const SkeletonTimer = () => {
  return (
    <div className="p-6 rounded-2xl bg-gradient-to-br from-secondary/10 to-secondary/5 border border-secondary/20">
      <div className="space-y-4">
        <div className="h-5 bg-muted/50 rounded w-32 mx-auto animate-pulse" />
        <div className="h-16 bg-muted/50 rounded-xl w-48 mx-auto animate-pulse" />
        <div className="h-4 bg-muted/50 rounded w-40 mx-auto animate-pulse" />
      </div>
    </div>
  );
};
