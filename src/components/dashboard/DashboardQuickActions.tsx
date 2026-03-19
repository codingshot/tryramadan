import { motion } from "framer-motion";
import {
  Calendar,
  Target,
  CalendarDays,
  Activity,
  Utensils,
  Scale,
  BookOpen,
  Book,
  TrendingUp,
  Globe,
  Heart,
  FileText,
  Trophy,
  Link2,
  RotateCcw,
  type LucideIcon,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useDashboardQuickActions, DASHBOARD_QUICK_ACTIONS } from "@/hooks/useLocalStorage";
import type { DashboardQuickActionId } from "@/hooks/useLocalStorage";
import { DailyMissionsCard } from "@/components/DailyMissionsCard";

const QUICK_ACTION_ICONS: Record<DashboardQuickActionId, LucideIcon> = {
  today: Calendar,
  goals: Target,
  schedule: CalendarDays,
  prayers: Activity,
  meals: Utensils,
  macros: Scale,
  learn: BookOpen,
  glossary: Book,
  quran: BookOpen,
  progress: TrendingUp,
  culture: Globe,
  health: Heart,
  journal: FileText,
  achievements: Trophy,
  qada: RotateCcw,
};

const QUICK_ACTION_COLORS: Record<DashboardQuickActionId, { color: string; bgColor: string; borderColor: string }> = {
  today: { color: "text-primary", bgColor: "bg-primary/10", borderColor: "border-primary/20" },
  goals: { color: "text-amber-600", bgColor: "bg-amber-500/10", borderColor: "border-amber-500/20" },
  schedule: { color: "text-blue-500", bgColor: "bg-blue-500/10", borderColor: "border-blue-500/20" },
  prayers: { color: "text-blue-500", bgColor: "bg-blue-500/10", borderColor: "border-blue-500/20" },
  meals: { color: "text-orange-500", bgColor: "bg-orange-500/10", borderColor: "border-orange-500/20" },
  macros: { color: "text-emerald-600", bgColor: "bg-emerald-500/10", borderColor: "border-emerald-500/20" },
  learn: { color: "text-blue-500", bgColor: "bg-blue-500/10", borderColor: "border-blue-500/20" },
  glossary: { color: "text-violet-500", bgColor: "bg-violet-500/10", borderColor: "border-violet-500/20" },
  quran: { color: "text-purple-500", bgColor: "bg-purple-500/10", borderColor: "border-purple-500/20" },
  progress: { color: "text-green-500", bgColor: "bg-green-500/10", borderColor: "border-green-500/20" },
  culture: { color: "text-green-500", bgColor: "bg-green-500/10", borderColor: "border-green-500/20" },
  health: { color: "text-rose-500", bgColor: "bg-rose-500/10", borderColor: "border-rose-500/20" },
  journal: { color: "text-amber-600", bgColor: "bg-amber-500/10", borderColor: "border-amber-500/20" },
  achievements: { color: "text-yellow-600", bgColor: "bg-yellow-500/10", borderColor: "border-yellow-500/20" },
};

const SIDEBAR_QUICK_ACTIONS_SHOWN = 9;

interface DashboardQuickActionsProps {
  onViewAllPrayers?: () => void;
}

export const DashboardQuickActions = ({
  onViewAllPrayers,
}: DashboardQuickActionsProps) => {
  const [quickActionOrder] = useDashboardQuickActions();
  const displayed = quickActionOrder.slice(0, SIDEBAR_QUICK_ACTIONS_SHOWN);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.2 }}
      className="space-y-4"
    >
      <div className="p-4 rounded-2xl bg-card border border-border">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-lg">Quick Actions</h3>
          <Link
            to="/dashboard/schedule"
            className="text-sm text-primary hover:underline flex items-center gap-1"
            aria-label="Customize quick access on Schedule"
          >
            More
            <Link2 className="w-3.5 h-3.5" aria-hidden />
          </Link>
        </div>

        <div className="grid grid-cols-3 gap-3">
          {displayed.map((id) => {
            const action = DASHBOARD_QUICK_ACTIONS.find((a) => a.id === id);
            if (!action) return null;
            const Icon = QUICK_ACTION_ICONS[id];
            const { color, bgColor, borderColor } = QUICK_ACTION_COLORS[id];
            const content = (
              <>
                <div className={`w-12 h-12 rounded-full ${bgColor} flex items-center justify-center mb-3`}>
                  <Icon className={`w-6 h-6 ${color}`} aria-hidden />
                </div>
                <div className="text-center space-y-1">
                  <p className="font-semibold text-sm leading-tight">{action.label}</p>
                </div>
              </>
            );
            const cardClasses = `flex flex-col items-center justify-center p-4 rounded-xl border ${borderColor} ${bgColor} hover:opacity-80 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer h-full min-h-[100px]`;

            if (id === "prayers" && onViewAllPrayers) {
              return (
                <button
                  key={action.id}
                  type="button"
                  onClick={onViewAllPrayers}
                  className={cardClasses}
                  aria-label={`Open ${action.label}`}
                >
                  {content}
                </button>
              );
            }

            return (
              <Link
                key={action.id}
                to={action.path}
                className={cardClasses}
                aria-label={`Go to ${action.label}`}
              >
                {content}
              </Link>
            );
          })}
        </div>
      </div>

      <DailyMissionsCard />
    </motion.div>
  );
};
