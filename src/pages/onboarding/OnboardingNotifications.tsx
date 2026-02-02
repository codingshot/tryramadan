import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, ArrowRight, Bell } from "lucide-react";
import { useOnboarding } from "@/contexts/OnboardingContext";
import { useNotifications } from "@/hooks/useNotifications";
import { useIftarLabelShort } from "@/hooks/useLocalStorage";
import { useState } from "react";

export default function OnboardingNotifications() {
  const { state, setNotifications } = useOnboarding();
  const { permission, requestPermission, supported } = useNotifications();
  const iftarLabelShort = useIftarLabelShort();
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleEnable = async () => {
    setLoading(true);
    await requestPermission();
    setNotifications({ suhoor: true, iftar: true });
    setLoading(false);
  };

  const handleContinue = () => {
    navigate("/onboarding/priorities");
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <Link
        to="/onboarding/schedule"
        className="inline-flex items-center gap-1 text-muted-foreground hover:text-foreground mb-6"
      >
        <ArrowLeft className="w-4 h-4" /> Back
      </Link>
      <div className="text-center mb-6">
        <div className="w-16 h-16 rounded-full bg-secondary/20 mx-auto mb-4 flex items-center justify-center">
          <Bell className="w-8 h-8 text-secondary" />
        </div>
        <h2 className="font-display text-2xl font-bold mb-2">Notifications</h2>
        <p className="text-muted-foreground">
          Get suhoor and {iftarLabelShort} reminders so you never miss a meal.
        </p>
      </div>

      {supported ? (
        permission === "granted" ? (
          <div className="p-4 rounded-xl bg-secondary/10 border border-secondary/30 mb-6">
            <p className="text-sm font-medium text-secondary">Notifications enabled</p>
            <p className="text-xs text-muted-foreground mt-1">You'll receive suhoor and {iftarLabelShort} reminders.</p>
          </div>
        ) : (
          <button
            onClick={handleEnable}
            disabled={loading}
            className="w-full py-3 px-6 rounded-xl bg-secondary text-secondary-foreground font-medium hover:bg-secondary/90 mb-6 disabled:opacity-50"
          >
            {loading ? "Requesting..." : "Enable reminders"}
          </button>
        )
      ) : (
        <p className="text-sm text-muted-foreground mb-6">Notifications are not supported in this browser.</p>
      )}

      <button
        onClick={handleContinue}
        className="w-full py-3 px-6 rounded-xl bg-primary text-primary-foreground font-medium hover:bg-primary/90 flex items-center justify-center gap-2"
      >
        Continue <ArrowRight className="w-5 h-5" />
      </button>
    </motion.div>
  );
}
