import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { ArrowRight, ArrowLeft, Check, Moon, BookOpen, Heart, Bell, Loader2, MapPin } from "lucide-react";
import { LocationSearch } from "./LocationSearch";
import { LocationResult, getLocationFromIP } from "@/hooks/useLocation";
import { useUserPreferences, defaultPreferences } from "@/hooks/useLocalStorage";
import { useNotifications } from "@/hooks/useNotifications";

type UserType = "new" | "muslim" | null;
type Step = "welcome" | "userType" | "experience" | "location" | "notifications" | "complete";

interface OnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: (data: OnboardingData) => void;
}

interface OnboardingData {
  userType: UserType;
  experience: string;
  location: string;
  locationCoords: { lat: number; lng: number } | null;
  fastingGoal: string;
}

export const OnboardingModal = ({ isOpen, onClose, onComplete }: OnboardingModalProps) => {
  const [step, setStep] = useState<Step>("welcome");
  const [userType, setUserType] = useState<UserType>(null);
  const [experience, setExperience] = useState("");
  const [selectedLocation, setSelectedLocation] = useState<LocationResult | null>(null);
  const [fastingGoal, setFastingGoal] = useState("");
  const [preferences, setPreferences] = useUserPreferences();
  const { permission, supported, requestPermission, sendTestNotification } = useNotifications();
  const [notifLoading, setNotifLoading] = useState(false);
  const [locationLoading, setLocationLoading] = useState(false);
  const navigate = useNavigate();

  // Auto-detect location when reaching location step
  useEffect(() => {
    if (step === 'location' && !selectedLocation) {
      setLocationLoading(true);
      getLocationFromIP().then((location) => {
        if (location) {
          setSelectedLocation(location);
        }
        setLocationLoading(false);
      });
    }
  }, [step, selectedLocation]);

  const handleComplete = () => {
    const data: OnboardingData = {
      userType,
      experience,
      location: selectedLocation?.displayName || '',
      locationCoords: selectedLocation ? { lat: selectedLocation.lat, lng: selectedLocation.lng } : null,
      fastingGoal,
    };
    
    // Save to localStorage
    setPreferences({
      ...preferences,
      userType,
      experience,
      location: selectedLocation?.displayName || '',
      locationCoords: selectedLocation ? { lat: selectedLocation.lat, lng: selectedLocation.lng } : null,
      fastingGoal: fastingGoal || 'full',
      onboardingComplete: true,
      notificationsEnabled: permission === 'granted',
    });
    
    onComplete(data);
    onClose();
    
    // Navigate to dashboard
    navigate('/dashboard');
  };

  const handleLocationSelect = (location: LocationResult) => {
    setSelectedLocation(location);
  };

  const handleEnableNotifications = async () => {
    setNotifLoading(true);
    const granted = await requestPermission();
    if (granted) {
      sendTestNotification();
    }
    setNotifLoading(false);
  };

  const experienceLevels = [
    { id: "none", label: "New to fasting", labelAr: "جديد على الصيام", icon: "🌱" },
    { id: "some", label: "Some IF experience", labelAr: "بعض الخبرة", icon: "🌿" },
    { id: "regular", label: "Regular faster", labelAr: "صائم منتظم", icon: "🌳" },
  ];

  const muslimExperienceLevels = [
    { id: "born", label: "Lifelong Muslim", labelAr: "مسلم منذ الولادة", icon: "☪️" },
    { id: "convert", label: "New Muslim / Convert", labelAr: "مسلم جديد", icon: "🌙" },
    { id: "returning", label: "Returning to practice", labelAr: "عائد للممارسة", icon: "🕌" },
  ];

  const fastingGoals = [
    { id: "full", label: "Full Ramadan fast", labelAr: "صيام رمضان كامل", desc: "Dawn to sunset" },
    { id: "progressive", label: "Start gradual", labelAr: "البدء تدريجياً", desc: "Build up slowly" },
    { id: "learn", label: "Learn first", labelAr: "التعلم أولاً", desc: "Focus on education" },
  ];

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-foreground/50 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="bg-card rounded-3xl shadow-elevated max-w-lg w-full max-h-[90vh] overflow-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Progress bar */}
          <div className="h-1 bg-muted rounded-t-3xl overflow-hidden">
            <motion.div 
              className="h-full bg-gradient-gold"
              initial={{ width: "0%" }}
              animate={{ 
                width: step === "welcome" ? "16%" : 
                       step === "userType" ? "33%" :
                       step === "experience" ? "50%" :
                       step === "location" ? "66%" :
                       step === "notifications" ? "83%" : "100%"
              }}
            />
          </div>

          <div className="p-8">
            {/* Welcome Step */}
            {step === "welcome" && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="text-center"
              >
                <span className="text-6xl mb-6 block">🌙</span>
                <h2 className="font-display text-2xl md:text-3xl font-bold mb-4">
                  Welcome to TryRamadan
                  <span className="block font-arabic text-xl text-secondary mt-2">
                    مرحباً بك في تجربة رمضان
                  </span>
                </h2>
                <p className="text-muted-foreground mb-8">
                  Let's personalize your experience. This will only take a moment.
                </p>
                <button 
                  onClick={() => setStep("userType")}
                  className="btn-hero w-full flex items-center justify-center gap-2"
                >
                  Get Started • ابدأ
                  <ArrowRight className="w-5 h-5" />
                </button>
              </motion.div>
            )}

            {/* User Type Selection */}
            {step === "userType" && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
              >
                <button 
                  onClick={() => setStep("welcome")}
                  className="text-muted-foreground hover:text-foreground mb-4 flex items-center gap-1"
                >
                  <ArrowLeft className="w-4 h-4" /> Back
                </button>
                
                <h2 className="font-display text-2xl font-bold mb-2">
                  Tell us about yourself
                </h2>
                <p className="text-muted-foreground mb-6 font-arabic">
                  أخبرنا عن نفسك
                </p>

                <div className="space-y-4">
                  <button
                    onClick={() => {
                      setUserType("new");
                      setStep("experience");
                    }}
                    className={`w-full p-6 rounded-2xl border-2 transition-all text-left hover:border-secondary hover:shadow-gold ${
                      userType === "new" ? "border-secondary bg-secondary/5" : "border-border"
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      <span className="text-3xl">🌱</span>
                      <div>
                        <h3 className="font-bold text-lg">I'm New to Ramadan</h3>
                        <p className="font-arabic text-secondary text-sm">أنا جديد على رمضان</p>
                        <p className="text-muted-foreground text-sm mt-1">
                          Curious about fasting and want to learn
                        </p>
                      </div>
                    </div>
                  </button>

                  <button
                    onClick={() => {
                      setUserType("muslim");
                      setStep("experience");
                    }}
                    className={`w-full p-6 rounded-2xl border-2 transition-all text-left hover:border-secondary hover:shadow-gold ${
                      userType === "muslim" ? "border-secondary bg-secondary/5" : "border-border"
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      <span className="text-3xl">☪️</span>
                      <div>
                        <h3 className="font-bold text-lg">I'm Already Muslim</h3>
                        <p className="font-arabic text-secondary text-sm">أنا مسلم بالفعل</p>
                        <p className="text-muted-foreground text-sm mt-1">
                          Ready to track my Ramadan journey
                        </p>
                      </div>
                    </div>
                  </button>
                </div>
              </motion.div>
            )}

            {/* Experience Level */}
            {step === "experience" && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
              >
                <button 
                  onClick={() => setStep("userType")}
                  className="text-muted-foreground hover:text-foreground mb-4 flex items-center gap-1"
                >
                  <ArrowLeft className="w-4 h-4" /> Back
                </button>

                <h2 className="font-display text-2xl font-bold mb-2">
                  {userType === "muslim" ? "Your Experience" : "Fasting Experience"}
                </h2>
                <p className="text-muted-foreground mb-6 font-arabic">
                  {userType === "muslim" ? "خبرتك" : "خبرتك في الصيام"}
                </p>

                <div className="space-y-3 mb-6">
                  {(userType === "muslim" ? muslimExperienceLevels : experienceLevels).map((level) => (
                    <button
                      key={level.id}
                      onClick={() => setExperience(level.id)}
                      className={`w-full p-4 rounded-xl border-2 transition-all text-left hover:border-secondary ${
                        experience === level.id ? "border-secondary bg-secondary/5" : "border-border"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{level.icon}</span>
                        <div>
                          <span className="font-medium">{level.label}</span>
                          <span className="text-secondary text-sm ml-2 font-arabic">{level.labelAr}</span>
                        </div>
                        {experience === level.id && (
                          <Check className="w-5 h-5 text-secondary ml-auto" />
                        )}
                      </div>
                    </button>
                  ))}
                </div>

                <button 
                  onClick={() => setStep("location")}
                  disabled={!experience}
                  className="btn-hero w-full flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  Continue • متابعة
                  <ArrowRight className="w-5 h-5" />
                </button>
              </motion.div>
            )}

            {/* Location & Goal */}
            {step === "location" && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
              >
                <button 
                  onClick={() => setStep("experience")}
                  className="text-muted-foreground hover:text-foreground mb-4 flex items-center gap-1"
                >
                  <ArrowLeft className="w-4 h-4" /> Back
                </button>

                <h2 className="font-display text-2xl font-bold mb-2">
                  Your Goal • هدفك
                </h2>
                <p className="text-muted-foreground mb-6">
                  How would you like to approach fasting this Ramadan?
                </p>

                <div className="space-y-3 mb-6">
                  {fastingGoals.map((goal) => (
                    <button
                      key={goal.id}
                      onClick={() => setFastingGoal(goal.id)}
                      className={`w-full p-4 rounded-xl border-2 transition-all text-left hover:border-secondary ${
                        fastingGoal === goal.id ? "border-secondary bg-secondary/5" : "border-border"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="font-medium">{goal.label}</span>
                          <span className="text-secondary text-sm ml-2 font-arabic">{goal.labelAr}</span>
                          <p className="text-muted-foreground text-sm">{goal.desc}</p>
                        </div>
                        {fastingGoal === goal.id && (
                          <Check className="w-5 h-5 text-secondary" />
                        )}
                      </div>
                    </button>
                  ))}
                </div>

                {/* Location input with typeahead */}
                <div className="mb-6">
                  <label className="block text-sm font-medium mb-2">
                    Your Location • موقعك
                    <span className="text-muted-foreground font-normal ml-2">(for accurate prayer times)</span>
                  </label>
                  
                  {/* Auto-detected location card */}
                  {locationLoading ? (
                    <div className="flex items-center gap-3 p-4 rounded-xl bg-muted/50 border border-border mb-3">
                      <Loader2 className="w-5 h-5 animate-spin text-secondary" />
                      <span className="text-muted-foreground">Detecting your location...</span>
                    </div>
                  ) : selectedLocation ? (
                    <div className="flex items-center gap-3 p-4 rounded-xl bg-secondary/10 border border-secondary/30 mb-3">
                      <MapPin className="w-5 h-5 text-secondary flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-foreground">{selectedLocation.name}</p>
                        <p className="text-xs text-muted-foreground truncate">{selectedLocation.country}</p>
                      </div>
                      <Check className="w-5 h-5 text-secondary flex-shrink-0" />
                    </div>
                  ) : null}
                  
                  <LocationSearch
                    value={selectedLocation?.name || ''}
                    onSelect={handleLocationSelect}
                    placeholder="Search for a different city..."
                  />
                </div>

                <button 
                  onClick={() => setStep("notifications")}
                  disabled={!fastingGoal}
                  className="btn-hero w-full flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  Continue • متابعة
                  <ArrowRight className="w-5 h-5" />
                </button>
              </motion.div>
            )}

            {/* Notifications */}
            {step === "notifications" && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
              >
                <button 
                  onClick={() => setStep("location")}
                  className="text-muted-foreground hover:text-foreground mb-4 flex items-center gap-1"
                >
                  <ArrowLeft className="w-4 h-4" /> Back
                </button>

                <div className="text-center">
                  <div className="w-16 h-16 rounded-full bg-secondary/20 mx-auto mb-4 flex items-center justify-center">
                    <Bell className="w-8 h-8 text-secondary" />
                  </div>
                  
                  <h2 className="font-display text-2xl font-bold mb-2">
                    Enable Reminders
                  </h2>
                  <p className="font-arabic text-secondary mb-4">تفعيل التذكيرات</p>
                  
                  <p className="text-muted-foreground mb-6">
                    Get notified before Suhoor ends and when it's time for Iftar. Never miss a meal!
                  </p>

                  {!supported ? (
                    <p className="text-muted-foreground text-sm mb-6">
                      Notifications are not supported in your browser.
                    </p>
                  ) : permission === 'granted' ? (
                    <div className="p-4 rounded-xl bg-secondary/10 border border-secondary/20 mb-6">
                      <Check className="w-6 h-6 text-secondary mx-auto mb-2" />
                      <p className="text-sm font-medium">Notifications enabled!</p>
                    </div>
                  ) : permission === 'denied' ? (
                    <p className="text-muted-foreground text-sm mb-6">
                      Notifications are blocked. Please enable them in your browser settings.
                    </p>
                  ) : (
                    <button
                      onClick={handleEnableNotifications}
                      disabled={notifLoading}
                      className="btn-hero-outline w-full mb-4 flex items-center justify-center gap-2"
                    >
                      {notifLoading ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                      ) : (
                        <>
                          <Bell className="w-5 h-5" />
                          Enable Notifications
                        </>
                      )}
                    </button>
                  )}

                  <button 
                    onClick={() => setStep("complete")}
                    className="btn-hero w-full flex items-center justify-center gap-2"
                  >
                    {permission === 'granted' ? 'Continue' : 'Skip for now'}
                    <ArrowRight className="w-5 h-5" />
                  </button>
                </div>
              </motion.div>
            )}

            {/* Complete */}
            {step === "complete" && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", delay: 0.2 }}
                  className="w-20 h-20 rounded-full bg-gradient-gold mx-auto mb-6 flex items-center justify-center"
                >
                  <Check className="w-10 h-10 text-foreground" />
                </motion.div>

                <h2 className="font-display text-2xl md:text-3xl font-bold mb-2">
                  You're All Set!
                </h2>
                <p className="font-arabic text-xl text-secondary mb-4">
                  أنت جاهز!
                </p>
                <p className="text-muted-foreground mb-8">
                  {userType === "muslim" 
                    ? "Ramadan Mubarak! Your dashboard is ready."
                    : "Your personalized Ramadan journey awaits. Let's begin!"}
                </p>

                <div className="grid grid-cols-3 gap-4 mb-8 text-center">
                  <div className="p-3 rounded-xl bg-muted/50">
                    <Moon className="w-6 h-6 text-secondary mx-auto mb-2" />
                    <p className="text-xs text-muted-foreground">Timer Ready</p>
                  </div>
                  <div className="p-3 rounded-xl bg-muted/50">
                    <BookOpen className="w-6 h-6 text-secondary mx-auto mb-2" />
                    <p className="text-xs text-muted-foreground">Education</p>
                  </div>
                  <div className="p-3 rounded-xl bg-muted/50">
                    <Heart className="w-6 h-6 text-secondary mx-auto mb-2" />
                    <p className="text-xs text-muted-foreground">Tracking</p>
                  </div>
                </div>

                <button 
                  onClick={handleComplete}
                  className="btn-hero w-full flex items-center justify-center gap-2"
                >
                  Start My Journey • ابدأ رحلتي
                  <ArrowRight className="w-5 h-5" />
                </button>
              </motion.div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
