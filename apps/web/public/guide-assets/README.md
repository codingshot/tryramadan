# Guide assets (screenshots & GIFs)

Real app screenshots for the User Guides live here. Paths are referenced in `src/data/guides.ts`.

## Add real screenshots (recommended)

1. **Install Playwright’s Chromium** (once per machine):
   ```bash
   npx playwright install chromium
   ```

2. **Start the app** (in one terminal):
   ```bash
   npm run dev
   ```

3. **Capture screenshots** (in another terminal):
   ```bash
   npm run guides:screenshots
   ```

Screenshots are saved to `public/guide-assets/` as PNGs, mobile viewport (390×844). The script seeds localStorage so dashboard/schedule routes render without redirecting to onboarding.

## Manual capture

If you prefer to capture manually:

1. Run the app (`npm run dev`) and open it in a browser.
2. Use DevTools device toolbar (mobile view) for primary screenshots.
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

For animated steps, use the same base name with `.gif` and set `gif` in the guide step. Use a screen recorder (LICEcap, Kap, or browser extension) to capture.

## Fallback

If an image is missing, the guide page shows the app placeholder (`/placeholder.svg`) so guides still work before screenshots are added.
