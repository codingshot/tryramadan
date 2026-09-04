# E2E Tests (Playwright)

Happy path and smoke tests run in a real browser.

## Setup

```bash
npx playwright install
```

## Run

```bash
npm run test:e2e              # All E2E tests
npm run test:e2e:happy        # Happy path only
npm run test:e2e:ui           # Interactive UI mode
```

## Happy Path Test

`happy-path.spec.ts` exercises the full onboarding flow (Muslim mode) and visits all major dashboard pages:

- **Onboarding**: Welcome → Mode → Health → Gender → Location (Skip) → Schedule → Notifications → Priorities → Goals → Dashboard
- **Dashboard pages**: /dashboard, /today, /schedule, /prayers, /meals, /journal, /progress, /learn

Each page asserts: main heading visible, nav and main content present. Fails if any page crashes or fails to render.
