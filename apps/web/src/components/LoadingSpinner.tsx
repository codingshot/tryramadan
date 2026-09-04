import { motion } from "framer-motion";

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg";
  showLogo?: boolean;
}

export const LoadingSpinner = ({ size = "md", showLogo = true }: LoadingSpinnerProps) => {
  const sizeClasses = {
    sm: "w-8 h-8",
    md: "w-16 h-16",
    lg: "w-24 h-24",
  };

  return (
    <div className="flex flex-col items-center justify-center gap-4">
      <div className={`relative ${sizeClasses[size]}`}>
        {/* Outer ring */}
        <motion.div
          className="absolute inset-0 rounded-full border-4 border-muted"
          initial={{ opacity: 0.3 }}
          animate={{ opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 2, repeat: Infinity }}
        />
        
        {/* Spinning ring */}
        <motion.div
          className="absolute inset-0 rounded-full border-4 border-transparent border-t-secondary"
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        />
        
        {/* Inner glow */}
        <motion.div
          className="absolute inset-2 rounded-full bg-gradient-to-br from-secondary/20 to-transparent"
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
        />
        
        {/* Center crescent */}
        {showLogo && (
          <motion.div
            className="absolute inset-0 flex items-center justify-center text-secondary"
            animate={{ opacity: [0.7, 1, 0.7] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <span className="text-lg">☪</span>
          </motion.div>
        )}
      </div>
    </div>
  );
};
