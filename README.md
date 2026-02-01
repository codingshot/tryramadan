# TryRamadan.app 🌙

> A culturally immersive wellness app for non-Muslims to experience Ramadan fasting through progressive programs, cultural education, and interfaith understanding.

**Live URL**: [https://tryramadan.app](https://tryramadan.app)

## ✨ Features

### Core Functionality
- **🕐 Smart Fasting Timer** - Real-time countdown to Suhoor and Iftar with live prayer times from Aladhan API
- **📍 Location-Based Prayer Times** - Auto-detect location or search any city for accurate fasting times
- **📅 Ramadan Countdown** - Shows days until Ramadan with Hijri calendar integration
- **⭐ Sunnah Fasting Indicators** - Highlights Monday/Thursday fasting and Ayyam al-Beed (13th-15th lunar)
- **📊 Progress Tracking** - Track completed fasting days with streak counters and visual progress
- **🔔 Push Notifications** - Suhoor and Iftar reminders via Web Notifications API
- **📱 PWA Support** - Install as a native app, works offline

### Educational Content
- **📚 Daily Hadith** - Curated hadith about fasting from authentic sources
- **🌍 Cultural Traditions** - Explore Ramadan customs from 20+ countries
- **🍽️ Recipes** - Traditional Suhoor and Iftar recipes from various cultures
- **📖 Fasting Rules** - Comprehensive guide to Islamic fasting etiquette
- **💪 Health Benefits** - Science-backed benefits of intermittent fasting

### User Experience
- **🎯 Personalized Onboarding** - Choose between "New to Ramadan" or "Already Muslim" paths
- **🔄 Progressive Programs** - Three fasting tracks: Beginner (12h), Intermediate (16h), Full Ramadan
- **💾 Local Storage** - All preferences and progress saved locally
- **🌐 Bilingual** - English and Arabic translations throughout
- **🎨 Beautiful Design** - Islamic-inspired aesthetics with emerald, gold, and burgundy palette

## 🛠️ Tech Stack

- **Frontend**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS + shadcn/ui components
- **Animations**: Framer Motion
- **State**: React Hooks + localStorage
- **APIs**: 
  - [Aladhan API](https://aladhan.com/prayer-times-api) - Prayer times
  - [Nominatim/OpenStreetMap](https://nominatim.openstreetmap.org) - Location search
  - [ipapi.co](https://ipapi.co) - IP geolocation
- **PWA**: vite-plugin-pwa with Workbox

## 📁 Project Structure

```
src/
├── assets/           # Images, logos, backgrounds
├── components/       # React components
│   ├── ui/          # shadcn/ui base components
│   ├── ArabicTerm.tsx
│   ├── CTASection.tsx
│   ├── CulturalCarousel.tsx
│   ├── DailyHadith.tsx
│   ├── FastingPrograms.tsx
│   ├── FastingRulesSection.tsx
│   ├── FastingTimer.tsx
│   ├── FeaturesSection.tsx
│   ├── Footer.tsx
│   ├── HealthBenefits.tsx
│   ├── HeroSection.tsx
│   ├── LoadingSpinner.tsx
│   ├── LocationSearch.tsx
│   ├── Navbar.tsx
│   ├── OnboardingModal.tsx
│   ├── ProgressTracker.tsx
│   ├── RecipeSection.tsx
│   ├── SkeletonCard.tsx
│   └── SunnahFastingBadge.tsx
├── data/            # JSON data files
│   ├── cultural-traditions.json
│   ├── fasting-programs.json
│   ├── hadiths.json
│   ├── ramadan-info.json
│   └── recipes.json
├── hooks/           # Custom React hooks
│   ├── useLocalStorage.ts   # Persistent user preferences
│   ├── useLocation.ts       # Geolocation & search
│   ├── useNotifications.ts  # Push notification management
│   ├── usePrayerTimes.ts    # Aladhan API integration
│   └── use-mobile.tsx
├── lib/             # Utility functions
├── pages/           # Route pages
│   ├── Index.tsx
│   └── NotFound.tsx
└── index.css        # Design system & Tailwind config
```

## 🚀 Getting Started

```bash
# Clone the repository
git clone https://github.com/your-username/tryramadan.git
cd tryramadan

# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## ✅ Completed Features

- [x] Landing page with hero section
- [x] Fasting countdown timer
- [x] Days until Ramadan counter
- [x] Prayer times API integration (Aladhan)
- [x] Location auto-detect (IP + GPS)
- [x] Location search with typeahead
- [x] User onboarding flow
- [x] Progressive fasting programs
- [x] Cultural traditions carousel
- [x] Daily hadith display
- [x] Recipe section
- [x] Health benefits section
- [x] Fasting rules education
- [x] Progress tracker
- [x] Local storage persistence
- [x] PWA support (offline capable)
- [x] Push notifications
- [x] Sunnah fasting day indicators
- [x] Hijri calendar display
- [x] Arabic translations
- [x] Mobile responsive design
- [x] SEO optimization
- [x] Vercel routing config

## 🔮 Future Improvements

- [ ] User authentication & cloud sync
- [ ] Community features & social sharing
- [ ] Qibla direction finder
- [ ] Quran reading tracker
- [ ] Zakat calculator
- [ ] Taraweeh prayer tracker
- [ ] Multi-language support (Urdu, Indonesian, etc.)
- [ ] Dark mode toggle
- [ ] Charity donation integration
- [ ] Blog with SEO-optimized articles

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is open source under the MIT License.

## 🙏 Acknowledgments

- [Aladhan API](https://aladhan.com) for prayer times data
- [Sunnah.com](https://sunnah.com) for hadith references
- [OpenStreetMap/Nominatim](https://nominatim.openstreetmap.org) for location services
- Built with ❤️ by [ummah.build](https://ummah.build)
