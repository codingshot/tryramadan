# Guide assets (screenshots & GIFs)

Place user-guide screenshots and optional GIFs here. Paths are referenced in `src/data/guides.ts`.

## Naming

- **Screenshots**: PNG or WebP, mobile-first (e.g. 390×844 or similar). Examples:
  - `getting-started-home.png`
  - `onboarding-welcome.png`
  - `onboarding-mode.png`
  - `onboarding-location.png`
  - `dashboard-overview.png`
  - `today-fast.png`
  - `schedule-calendar.png`
  - `prayers.png`
  - `meals.png`
  - `progress.png`
  - `journal.png`
  - `emergency.png`
  - `settings.png`
- **GIFs** (optional): Use the same base name with `.gif` in guide step data when you want an animated step (e.g. `onboarding-flow.gif`).

## How to capture

1. Run the app (`npm run dev`) and open in a browser.
2. Use DevTools device toolbar (mobile view) for primary screenshots.
3. Capture each screen from the guide steps (see `src/data/guides.ts` for step titles and suggested filenames).
4. For GIFs: use a screen recorder (e.g. LICEcap, Kap, or browser extension) to record the flow, then export as GIF or WebP.

Guides will fall back to the app placeholder if an image is missing.
