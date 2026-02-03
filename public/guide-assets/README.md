# Guide assets (screenshots & GIFs)

Place user-guide screenshots and optional GIFs here. Paths are referenced in `src/data/guides.ts`.

## Auto-capture screenshots

1. Install Playwright: `npm install`
2. Start the app: `npm run dev` (in another terminal)
3. Run: `npm run guides:screenshots`

Screenshots are saved to `public/guide-assets/` in PNG format, mobile viewport (390×844).

## Manual capture

If you prefer to capture manually:

1. Run the app (`npm run dev`) and open in a browser
2. Use DevTools device toolbar (mobile view) for primary screenshots
3. Save each screenshot with these names:

| File | Screen |
|------|--------|
| `getting-started-home.png` | Home page |
| `onboarding-welcome.png` | Onboarding welcome |
| `onboarding-mode.png` | Experience mode (new/Muslim) |
| `onboarding-knowledge.png` | Knowledge quiz |
| `onboarding-health.png` | Health disclaimer |
| `onboarding-location.png` | Location setup |
| `onboarding-schedule.png` | Schedule / Ramadan start |
| `onboarding-notifications.png` | Notifications |
| `onboarding-priorities.png` | Priorities |
| `onboarding-goals.png` | Goals |
| `dashboard-overview.png` | Dashboard home |
| `today-fast.png` | Today's Fast |
| `schedule-calendar.png` | Schedule / calendar |
| `prayers.png` | Prayer times |
| `meals.png` | Meals |
| `progress.png` | Progress |
| `journal.png` | Journal |
| `emergency.png` | Emergency page |
| `settings.png` | Settings |
| `learn.png` | Learn (dashboard) |
| `programs.png` | Fasting Programs |
| `goals.png` | Goals until Ramadan |

## GIFs

For animated steps, use the same base name with `.gif` and set `gif` in the guide step (e.g. `onboarding-flow.gif`). Use a screen recorder (LICEcap, Kap, or browser extension) to capture.

## Fallback

Guides fall back to the app placeholder if an image is missing.
