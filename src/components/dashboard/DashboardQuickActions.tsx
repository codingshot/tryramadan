import { motion } from "framer-motion";
import { Utensils, Activity, TrendingUp, Link2 } from "lucide-react";
import { Link } from "react-router-dom";
import { DailyMissionsCard } from "@/components/DailyMissionsCard";

interface DashboardQuickActionsProps {
  onViewAllPrayers: () => void;
}

export const DashboardQuickActions = ({
  onViewAllPrayers,
}: DashboardQuickActionsProps) => {
  // Top 3 quick actions based on user preferences
  const quickActions = [
    {
      icon: Utensils,
      label: "Log Meals",
      description: "Track Suhoor & Iftar",
      href: "/dashboard/schedule",
      color: "text-orange-500",
      bgColor: "bg-orange-500/10",
      borderColor: "border-orange-500/20",
    },
    {
      icon: Activity,
      label: "Prayers",
      description: "Track your prayers",
      onClick: onViewAllPrayers,
      color: "text-blue-500",
      bgColor: "bg-blue-500/10",
      borderColor: "border-blue-500/20",
    },
    {
      icon: TrendingUp,
      label: "Progress",
      description: "View your stats",
      href: "/dashboard/progress",
      color: "text-green-500",
      bgColor: "bg-green-500/10",
      borderColor: "border-green-500/20",
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.2 }}
      className="space-y-4"
    >
      {/* Quick Actions */}
      <div className="p-4 rounded-2xl bg-card border border-border">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-lg">Quick Actions</h3>
          <Link
            to="/dashboard"
            className="text-sm text-primary hover:underline flex items-center gap-1"
          >
            More
            <Link2 className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-3 gap-3">
          {quickActions.map((action) => {
            const Icon = action.icon;
            const content = (
              <>
                <div className={`w-12 h-12 rounded-full ${action.bgColor} flex items-center justify-center mb-3`}>
                  <Icon className={`w-6 h-6 ${action.color}`} />
                </div>
                <div className="text-center space-y-1">
                  <p className="font-semibold text-sm leading-tight">{action.label}</p>
                  <p className="text-xs text-muted-foreground leading-tight">
                    {action.description}
                  </p>
                </div>
              </>
            );

            const cardClasses = `flex flex-col items-center justify-center p-4 rounded-xl border ${action.borderColor} ${action.bgColor} hover:opacity-80 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer h-full min-h-[140px]`;

            if (action.href) {
              return (
                <Link key={action.label} to={action.href} className={cardClasses}>
                  {content}
                </Link>
              );
            }

            return (
              <button
                key={action.label}
                onClick={action.onClick}
                className={cardClasses}
              >
                {content}
              </button>
            );
          })}
        </div>
      </div>

      {/* Daily Missions */}
      <DailyMissionsCard />
    </motion.div>
  );
};
