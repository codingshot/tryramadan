import { useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { 
  ArrowLeft, MapPin, Bell, Moon, Sun, Trash2, Download, 
  ChevronRight, Check, Loader2, Monitor
} from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { ArabicHover } from "@/components/ArabicHover";
import { LocationSearch } from "@/components/LocationSearch";
import { LocationResult, getLocationFromIP } from "@/hooks/useLocation";
import { 
  useUserPreferences, 
  useFastingProgress, 
  useNotificationSettings,
  defaultPreferences,
  defaultProgress,
  defaultNotificationSettings
} from "@/hooks/useLocalStorage";
import { useNotifications } from "@/hooks/useNotifications";
import { PageSEO } from "@/components/PageSEO";

const Settings = () => {
  const [preferences, setPreferences] = useUserPreferences();
  const [progress, setProgress] = useFastingProgress();
  const [notifSettings, setNotifSettings] = useNotificationSettings();
  const { permission, requestPermission, supported } = useNotifications();
  const [locationLoading, setLocationLoading] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  
  const handleLocationSelect = (location: LocationResult) => {
    setPreferences({
      ...preferences,
      location: location.displayName,
      locationCoords: { lat: location.lat, lng: location.lng }
    });
  };
  
  const handleAutoDetect = async () => {
    setLocationLoading(true);
    const location = await getLocationFromIP();
    if (location) {
      handleLocationSelect(location);
    }
    setLocationLoading(false);
  };
  
  const handleEnableNotifications = async () => {
    await requestPermission();
  };
  
  const handleThemeChange = (theme: 'light' | 'dark' | 'system') => {
    setPreferences({ ...preferences, theme });
    
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else if (theme === 'light') {
      document.documentElement.classList.remove('dark');
    } else {
      // System preference
      if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }
  };
  
  const handleResetProgress = () => {
    setProgress(defaultProgress);
    setShowResetConfirm(false);
  };
  
  const handleExportData = () => {
    const data = {
      preferences,
      progress,
      notificationSettings: notifSettings,
      exportedAt: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `tryramadan-data-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-background">
      <PageSEO
        title="Settings | TryRamadan.app"
        description="TryRamadan.app settings: location for prayer times, notifications for suhoor and iftar, theme, and data export."
        path="/settings"
      />
      <Navbar />
      
      <main className="main-content">
        <div className="container mx-auto px-4 max-w-2xl min-w-0">
          <Link 
            to="/dashboard" 
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </Link>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <h1 className="text-2xl md:text-3xl font-display font-bold">
              <ArabicHover arabic="الإعدادات">Settings</ArabicHover>
            </h1>
          </motion.div>
          
          {/* Location Settings */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="p-6 rounded-2xl bg-card border border-border mb-6"
          >
            <h2 className="font-display font-bold mb-4 flex items-center gap-2 flex-wrap">
              <MapPin className="w-5 h-5 text-secondary flex-shrink-0" />
              <ArabicHover arabic="الموقع">Location</ArabicHover>
            </h2>
            
            <p className="text-sm text-muted-foreground mb-4">
              Your location is used to calculate accurate prayer and fasting times.
            </p>
            
            {preferences.location && (
              <div className="p-3 rounded-xl bg-secondary/10 border border-secondary/30 mb-4 flex items-center gap-3">
                <MapPin className="w-5 h-5 text-secondary flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{preferences.location.split(',')[0]}</p>
                  <p className="text-xs text-muted-foreground truncate">{preferences.location}</p>
                </div>
                <Check className="w-5 h-5 text-secondary flex-shrink-0" />
              </div>
            )}
            
            <LocationSearch
              value=""
              onSelect={handleLocationSelect}
              placeholder="Search for a different city..."
            />
            
            <button
              onClick={handleAutoDetect}
              disabled={locationLoading}
              className="mt-3 w-full flex items-center justify-center gap-2 p-3 rounded-xl text-sm text-secondary hover:bg-secondary/10 transition-colors border border-border disabled:opacity-50"
            >
              {locationLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <MapPin className="w-4 h-4" />
              )}
              Auto-detect my location
            </button>
          </motion.div>
          
          {/* Notification Settings */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="p-6 rounded-2xl bg-card border border-border mb-6"
          >
            <h2 className="font-display font-bold mb-4 flex items-center gap-2 flex-wrap">
              <Bell className="w-5 h-5 text-secondary flex-shrink-0" />
              <ArabicHover arabic="الإشعارات">Notifications</ArabicHover>
            </h2>
            
            {!supported ? (
              <p className="text-sm text-muted-foreground">
                Notifications are not supported in your browser.
              </p>
            ) : permission === 'granted' ? (
              <>
                <div className="p-3 rounded-xl bg-secondary/10 border border-secondary/30 mb-4 flex items-center gap-2">
                  <Check className="w-5 h-5 text-secondary" />
                  <span className="text-sm">Notifications enabled</span>
                </div>
                
                <div className="space-y-3">
                  <label className="flex flex-wrap items-center justify-between gap-2 p-3 rounded-xl bg-muted/50">
                    <span className="text-sm">Suhoor reminder</span>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min={5}
                        max={120}
                        value={notifSettings.suhoorMinutesBefore}
                        onChange={(e) => setNotifSettings({ ...notifSettings, suhoorMinutesBefore: Math.max(5, Math.min(120, Number(e.target.value) || 30)) })}
                        className="w-14 rounded border border-border bg-background px-2 py-1 text-sm tabular-nums"
                      />
                      <span className="text-xs text-muted-foreground">min before</span>
                      <input
                        type="checkbox"
                        checked={notifSettings.suhoorEnabled}
                        onChange={(e) => setNotifSettings({ ...notifSettings, suhoorEnabled: e.target.checked })}
                        className="rounded"
                      />
                    </div>
                  </label>
                  <p className="text-xs text-muted-foreground px-1">Notify before Imsak (suhoor ends). Uses today&apos;s prayer times.</p>
                  
                  <label className="flex flex-wrap items-center justify-between gap-2 p-3 rounded-xl bg-muted/50">
                    <span className="text-sm">Iftar reminder</span>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min={5}
                        max={120}
                        value={notifSettings.iftarMinutesBefore}
                        onChange={(e) => setNotifSettings({ ...notifSettings, iftarMinutesBefore: Math.max(5, Math.min(120, Number(e.target.value) || 15)) })}
                        className="w-14 rounded border border-border bg-background px-2 py-1 text-sm tabular-nums"
                      />
                      <span className="text-xs text-muted-foreground">min before</span>
                      <input
                        type="checkbox"
                        checked={notifSettings.iftarEnabled}
                        onChange={(e) => setNotifSettings({ ...notifSettings, iftarEnabled: e.target.checked })}
                        className="rounded"
                      />
                    </div>
                  </label>
                  <p className="text-xs text-muted-foreground px-1">Notify before Maghrib (iftar). Plus one at iftar time. Uses today&apos;s prayer times.</p>
                </div>
              </>
            ) : (
              <button
                onClick={handleEnableNotifications}
                className="w-full py-3 rounded-xl bg-secondary text-secondary-foreground font-medium"
              >
                Enable Notifications
              </button>
            )}
          </motion.div>
          
          {/* Theme Settings */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="p-6 rounded-2xl bg-card border border-border mb-6"
          >
            <h2 className="font-display font-bold mb-4 flex items-center gap-2 flex-wrap">
              <Sun className="w-5 h-5 text-secondary flex-shrink-0" />
              <ArabicHover arabic="المظهر">Theme</ArabicHover>
            </h2>
            
            <div className="flex gap-2">
              {[
                { id: 'light', label: 'Light', icon: Sun },
                { id: 'dark', label: 'Dark', icon: Moon },
                { id: 'system', label: 'System', icon: Monitor },
              ].map((theme) => {
                const Icon = theme.icon;
                return (
                  <button
                    key={theme.id}
                    onClick={() => handleThemeChange(theme.id as 'light' | 'dark' | 'system')}
                    className={`flex-1 p-3 rounded-xl border-2 transition-all flex flex-col items-center gap-2 ${
                      preferences.theme === theme.id 
                        ? 'border-secondary bg-secondary/10' 
                        : 'border-border hover:border-secondary/50'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="text-sm">{theme.label}</span>
                  </button>
                );
              })}
            </div>
          </motion.div>
          
          {/* Data Management */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="p-6 rounded-2xl bg-card border border-border"
          >
            <h2 className="font-display font-bold mb-4">
              <ArabicHover arabic="إدارة البيانات">Data Management</ArabicHover>
            </h2>
            
            <div className="space-y-3">
              <button
                onClick={handleExportData}
                className="w-full flex items-center justify-between p-3 rounded-xl bg-muted/50 hover:bg-muted transition-colors"
              >
                <div className="flex items-center gap-3">
                  <Download className="w-5 h-5 text-muted-foreground" />
                  <span className="text-sm">Export my data</span>
                </div>
                <ChevronRight className="w-4 h-4 text-muted-foreground" />
              </button>
              
              <button
                onClick={() => setShowResetConfirm(true)}
                className="w-full flex items-center justify-between p-3 rounded-xl bg-destructive/10 hover:bg-destructive/20 transition-colors text-destructive"
              >
                <div className="flex items-center gap-3">
                  <Trash2 className="w-5 h-5" />
                  <span className="text-sm">Reset all progress</span>
                </div>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
            
            {showResetConfirm && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-4 p-4 rounded-xl bg-destructive/10 border border-destructive/30"
              >
                <p className="text-sm mb-3">Are you sure? This will delete all your fasting progress.</p>
                <div className="flex gap-2">
                  <button
                    onClick={handleResetProgress}
                    className="flex-1 py-2 rounded-lg bg-destructive text-destructive-foreground text-sm font-medium"
                  >
                    Yes, reset everything
                  </button>
                  <button
                    onClick={() => setShowResetConfirm(false)}
                    className="flex-1 py-2 rounded-lg bg-muted text-sm font-medium"
                  >
                    Cancel
                  </button>
                </div>
              </motion.div>
            )}
          </motion.div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Settings;
