# QA Smoke Tests: Route Load & Render Checklist

> **Implementation status:** Doc complete. Route list and pseudo-code for Playwright/Cypress/RTL defined. `src/test/routes.test.tsx` and `e2e/happy-path.spec.ts` cover core routes. Run checklist manually or via CI.

Smoke tests to ensure every route in TryRamadan.app loads and renders its core elements. Run after deployments or major changes.

---

## 1. Expected Routes (from README + App.tsx)

### Public / Landing
| Route | Key Heading/Landmark | Notes |
|-------|----------------------|-------|
| `/` | "Experience Ramadan" or TryRamadan logo link | Index / Home |
| `/programs` | "Fasting Programs" | Programs listing |
| `/programs/:slug` | Program name (e.g. "Monday & Thursday Fasting") | Use slug: `monday-thursday` |
| `/culture` | "Ramadan Around the World" | Culture explorer |
| `/culture/:countryId` | Country name or "Country not found" | Use id: `saudi-arabia` or `egypt` |
| `/recipes` | "Ramadan Recipes" | Recipes listing |
| `/recipe/:mealType/:id` | Recipe name or "Recipe not found" | Use: `suhoor/1`, `iftar/2` |
| `/health` | "Ramadan Fasting Health Guide" | Health guide |
| `/health-safety` | "Health & Safety" | Health & safety page |
| `/emergency` | "Break Fast Safely" | Emergency / break fast |
| `/faq` | "Frequently Asked Questions" | FAQ |
| `/settings` | "Settings" | Settings page |
| `/terms` | "Terms of Use" | Terms |
| `/legal` | "Legal Notice" | Legal |
| `/privacy` | "Privacy Policy" | Privacy |
| `/guides` | "User Guides" | Guides listing |
| `/guides/:slug` | Guide title or "Guide not found" | Use slug: `getting-started` |
| `/personas` | "Personas & Journeys" | Personas listing |
| `/personas/:slug` | Persona name or "Persona not found" | Use slug: `non-muslim-curious` |
| `/learn/glossary` | "Glossary" | Islamic glossary |
| `/learn/hadith` | "Hadith Collection" | Hadith page |

### Dashboard (may redirect to onboarding if no location)
| Route | Key Heading/Landmark | Notes |
|-------|----------------------|-------|
| `/dashboard` | "Dashboard" or day selector / fasting status | Main dashboard |
| `/dashboard/today` | "Today" | Today's fast view |
| `/dashboard/schedule` | "Fasting Schedule" | Schedule / calendar |
| `/dashboard/prayers` | "Prayer Times" | Prayer times |
| `/dashboard/meals` | "Meals" | Meal planning |
| `/dashboard/learn` | "Learn" | Learn hub |
| `/dashboard/progress` | "Progress" | Progress & stats |
| `/dashboard/culture` | "Culture" | Cultural explorer |
| `/dashboard/health` | "Health" | Health tracker |
| `/dashboard/journal` | "Journal" | Reflection journal |
| `/dashboard/goals` | "Goals Until Ramadan" | Pre-Ramadan goals |
| `/dashboard/achievements` | "Achievements" | Achievements / badges |
| `/dashboard/quran` | "Quran Reading Plan" | Quran plan |
| `/dashboard/macros` | "Macro Tracker" | Macro tracking |
| `/dashboard/glossary` | "Glossary" | Same as /learn/glossary |

### Onboarding
| Route | Key Heading/Landmark | Notes |
|-------|----------------------|-------|
| `/onboarding` | Redirects to `/onboarding/welcome` | |
| `/onboarding/welcome` | "Welcome" or "Get started" | First step |
| `/onboarding/mode` | "Choose your experience" or mode options | Mode selection |
| `/onboarding/knowledge` | Knowledge quiz content | Knowledge step |
| `/onboarding/health` | "Health Screening" or health questions | Health step |
| `/onboarding/gender` | Gender selection | Gender step |
| `/onboarding/location` | "Location" or location search | Location step |
| `/onboarding/schedule` | "Schedule" or Ramadan schedule | Schedule step |
| `/onboarding/notifications` | "Notifications" or reminder options | Notifications step |
| `/onboarding/priorities` | "Priorities" or learning/culture options | Priorities step |
| `/onboarding/goals` | "Goals" or goals step | Goals step |

### Fallback
| Route | Key Heading/Landmark |
|-------|----------------------|
| `/unknown-404` | "404" or "Page not found" |

---

## 2. Smoke Test Checklist

For each route:
- [ ] Navigate to the route (no redirect loop; URL matches or redirects as expected)
- [ ] Page loads without uncaught JS errors (check console)
- [ ] Main layout (Navbar, main content area) is present
- [ ] Key heading or landmark for the page is visible

### Quick checklist by route group

**Public**
- [ ] `/` — Index loads, hero/timer or CTA visible
- [ ] `/programs` — Fasting Programs heading
- [ ] `/programs/monday-thursday` — Program detail heading
- [ ] `/culture` — Ramadan Around the World
- [ ] `/culture/saudi-arabia` — Saudi Arabia or country content
- [ ] `/recipes` — Ramadan Recipes heading
- [ ] `/recipe/suhoor/1` — Recipe name or not found
- [ ] `/health` — Health Guide heading
- [ ] `/health-safety` — Health & Safety heading
- [ ] `/emergency` — Break Fast Safely heading
- [ ] `/faq` — FAQ heading
- [ ] `/settings` — Settings heading
- [ ] `/terms` — Terms of Use heading
- [ ] `/legal` — Legal Notice heading
- [ ] `/privacy` — Privacy Policy heading
- [ ] `/guides` — User Guides heading
- [ ] `/guides/getting-started` — Guide title
- [ ] `/personas` — Personas & Journeys heading
- [ ] `/personas/non-muslim-curious` — Persona name
- [ ] `/learn/glossary` — Glossary heading
- [ ] `/learn/hadith` — Hadith heading

**Dashboard** (requires onboarding complete or location set for some)
- [ ] `/dashboard` — Dashboard content or redirect to onboarding
- [ ] `/dashboard/today` — Today heading
- [ ] `/dashboard/schedule` — Fasting Schedule heading
- [ ] `/dashboard/prayers` — Prayer Times heading
- [ ] `/dashboard/meals` — Meals heading
- [ ] `/dashboard/learn` — Learn heading
- [ ] `/dashboard/progress` — Progress heading
- [ ] `/dashboard/culture` — Culture heading
- [ ] `/dashboard/health` — Health heading
- [ ] `/dashboard/journal` — Journal heading
- [ ] `/dashboard/goals` — Goals Until Ramadan heading
- [ ] `/dashboard/achievements` — Achievements heading
- [ ] `/dashboard/quran` — Quran Reading Plan heading
- [ ] `/dashboard/macros` — Macro Tracker heading
- [ ] `/dashboard/glossary` — Glossary heading

**Onboarding**
- [ ] `/onboarding/welcome` — Welcome / Get started
- [ ] `/onboarding/mode` — Mode selection
- [ ] `/onboarding/knowledge` — Knowledge step
- [ ] `/onboarding/health` — Health step
- [ ] `/onboarding/gender` — Gender step
- [ ] `/onboarding/location` — Location step
- [ ] `/onboarding/schedule` — Schedule step
- [ ] `/onboarding/notifications` — Notifications step
- [ ] `/onboarding/priorities` — Priorities step
- [ ] `/onboarding/goals` — Goals step

**Fallback**
- [ ] `/xyz-unknown` — 404 / Page not found

---

## 3. Pseudo-code: Playwright

```javascript
// Playwright smoke test (pseudo-code)
// Run: npx playwright test smoke-routes.spec.ts

import { test, expect } from '@playwright/test';

const ROUTES = [
  { path: '/', heading: /experience|ramadan|tryramadan/i, role: 'link' },
  { path: '/programs', heading: /fasting programs/i, role: 'heading' },
  { path: '/programs/monday-thursday', heading: /monday.*thursday|fasting/i, role: 'heading' },
  { path: '/culture', heading: /ramadan around the world/i, role: 'heading' },
  { path: '/culture/saudi-arabia', heading: /saudi arabia|country not found/i, role: 'heading' },
  { path: '/recipes', heading: /ramadan recipes/i, role: 'heading' },
  { path: '/recipe/suhoor/1', heading: /.+/, role: 'heading' },
  { path: '/health', heading: /ramadan fasting health|health guide/i, role: 'heading' },
  { path: '/health-safety', heading: /health.*safety/i, role: 'heading' },
  { path: '/emergency', heading: /break fast safely/i, role: 'heading' },
  { path: '/faq', heading: /frequently asked questions/i, role: 'heading' },
  { path: '/settings', heading: /settings/i, role: 'heading' },
  { path: '/terms', heading: /terms of use/i, role: 'heading' },
  { path: '/legal', heading: /legal notice/i, role: 'heading' },
  { path: '/privacy', heading: /privacy policy/i, role: 'heading' },
  { path: '/guides', heading: /user guides/i, role: 'heading' },
  { path: '/guides/getting-started', heading: /.+/, role: 'heading' },
  { path: '/personas', heading: /personas.*journeys/i, role: 'heading' },
  { path: '/personas/non-muslim-curious', heading: /.+/, role: 'heading' },
  { path: '/learn/glossary', heading: /glossary/i, role: 'heading' },
  { path: '/learn/hadith', heading: /hadith/i, role: 'heading' },
  { path: '/dashboard', heading: /dashboard|day|fasting/i, role: 'heading' },
  { path: '/dashboard/today', heading: /today/i, role: 'heading' },
  { path: '/dashboard/schedule', heading: /fasting schedule|schedule/i, role: 'heading' },
  { path: '/dashboard/prayers', heading: /prayer times/i, role: 'heading' },
  { path: '/dashboard/meals', heading: /meals/i, role: 'heading' },
  { path: '/dashboard/learn', heading: /learn/i, role: 'heading' },
  { path: '/dashboard/progress', heading: /progress/i, role: 'heading' },
  { path: '/dashboard/culture', heading: /culture/i, role: 'heading' },
  { path: '/dashboard/health', heading: /health/i, role: 'heading' },
  { path: '/dashboard/journal', heading: /journal/i, role: 'heading' },
  { path: '/dashboard/goals', heading: /goals until ramadan/i, role: 'heading' },
  { path: '/dashboard/achievements', heading: /achievements/i, role: 'heading' },
  { path: '/dashboard/quran', heading: /quran|reading plan/i, role: 'heading' },
  { path: '/dashboard/macros', heading: /macro tracker|macros/i, role: 'heading' },
  { path: '/onboarding/welcome', heading: /welcome|get started/i, role: 'heading' },
  { path: '/onboarding/mode', heading: /mode|choose|experience/i, role: 'heading' },
  { path: '/onboarding/knowledge', heading: /knowledge|quiz/i, role: 'heading' },
  { path: '/onboarding/health', heading: /health/i, role: 'heading' },
  { path: '/onboarding/gender', heading: /gender/i, role: 'heading' },
  { path: '/onboarding/location', heading: /location/i, role: 'heading' },
  { path: '/onboarding/schedule', heading: /schedule/i, role: 'heading' },
  { path: '/onboarding/notifications', heading: /notifications/i, role: 'heading' },
  { path: '/onboarding/priorities', heading: /priorities/i, role: 'heading' },
  { path: '/onboarding/goals', heading: /goals/i, role: 'heading' },
  { path: '/xyz-unknown-404', heading: /404|page not found/i, role: 'heading' },
];

for (const { path, heading, role } of ROUTES) {
  test(`smoke: ${path} loads and shows key content`, async ({ page }) => {
    const errors = [];
    page.on('pageerror', (err) => errors.push(err.message));

    await page.goto(path, { waitUntil: 'domcontentloaded', timeout: 10000 });

    expect(errors, `No uncaught errors on ${path}`).toEqual([]);

    if (role === 'heading') {
      await expect(page.getByRole('heading', { name: heading })).toBeVisible({ timeout: 5000 });
    } else {
      await expect(page.getByRole(role, { name: heading })).toBeVisible({ timeout: 5000 });
    }

    // Main layout: main landmark or nav
    await expect(page.locator('main, [role="main"], nav')).toBeVisible();
  });
}
```

---

## 4. Pseudo-code: React Testing Library (Vitest)

```javascript
// RTL smoke test (pseudo-code)
// Uses MemoryRouter; mocks localStorage, location APIs, and external fetches as needed.

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { TooltipProvider } from '@/components/ui/tooltip';

// Mock hooks that need location/APIs
vi.mock('@/hooks/useLocation', () => ({ useAutoLocation: () => ({ location: null, loading: false }) }));
vi.mock('@/hooks/usePrayerTimes', () => ({
  usePrayerTimes: () => ({ prayerTimes: null, loading: false }),
  usePrayerTimesForDate: () => ({ prayerTimes: null }),
}));

function renderAt(path, element) {
  return render(
    <TooltipProvider>
      <MemoryRouter initialEntries={[path]}>
        <Routes>
          <Route path={path} element={element} />
        </Routes>
      </MemoryRouter>
    </TooltipProvider>
  );
}

const SMOKE_TESTS = [
  { path: '/', component: Index, heading: /experience|ramadan/i },
  { path: '/terms', component: Terms, heading: /terms of use/i },
  { path: '/legal', component: Legal, heading: /legal notice/i },
  { path: '/privacy', component: Privacy, heading: /privacy policy/i },
  { path: '/faq', component: FAQ, heading: /frequently asked questions/i },
  { path: '/health', component: Health, heading: /ramadan fasting health|health guide/i },
  { path: '/health-safety', component: HealthSafety, heading: /health.*safety/i },
  { path: '/emergency', component: Emergency, heading: /break fast safely/i },
  { path: '/guides', component: Guides, heading: /user guides/i },
  { path: '/personas', component: Personas, heading: /personas.*journeys/i },
  { path: '/learn/glossary', component: LearnGlossary, heading: /glossary/i },
  { path: '/learn/hadith', component: LearnHadith, heading: /hadith/i },
  { path: '/programs', component: Programs, heading: /fasting programs/i },
  { path: '/culture', component: Culture, heading: /ramadan around the world/i },
  { path: '/recipes', component: Recipes, heading: /ramadan recipes/i },
  { path: '/settings', component: Settings, heading: /settings/i },
  { path: '/dashboard', component: Dashboard, heading: /dashboard|day|fasting/i },
  { path: '/dashboard/today', component: DashboardToday, heading: /today/i },
  { path: '/dashboard/schedule', component: DashboardSchedule, heading: /fasting schedule|schedule/i },
  { path: '/dashboard/prayers', component: DashboardPrayers, heading: /prayer times/i },
  { path: '/dashboard/meals', component: DashboardMeals, heading: /meals/i },
  { path: '/dashboard/learn', component: DashboardLearn, heading: /learn/i },
  { path: '/dashboard/progress', component: DashboardProgress, heading: /progress/i },
  { path: '/dashboard/culture', component: DashboardCulture, heading: /culture/i },
  { path: '/dashboard/health', component: DashboardHealth, heading: /health/i },
  { path: '/dashboard/journal', component: DashboardJournal, heading: /journal/i },
  { path: '/dashboard/goals', component: DashboardGoals, heading: /goals until ramadan/i },
  { path: '/dashboard/achievements', component: DashboardAchievements, heading: /achievements/i },
  { path: '/dashboard/quran', component: DashboardQuran, heading: /quran|reading plan/i },
  { path: '/dashboard/macros', component: DashboardMacros, heading: /macro tracker|macros/i },
  { path: '/onboarding/welcome', component: OnboardingWelcome, heading: /welcome|get started/i },
  { path: '/onboarding/mode', component: OnboardingMode, heading: /mode|choose|experience/i },
  { path: '/onboarding/health', component: OnboardingHealth, heading: /health/i },
  { path: '/onboarding/goals', component: OnboardingGoals, heading: /goals/i },
  { path: '*', component: NotFound, heading: /404|page not found/i },
];

describe('Route smoke tests', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  SMOKE_TESTS.forEach(({ path, component: Component, heading }) => {
    it(`${path} loads and shows key heading`, () => {
      renderAt(path === '*' ? '/xyz-unknown' : path, <Component />);
      expect(screen.getByRole('heading', { name: heading })).toBeInTheDocument();
    });
  });
});
```

---

## 5. Pseudo-code: Cypress

```javascript
// Cypress smoke test (pseudo-code)

describe('Route smoke tests', () => {
  const routes = [
    { path: '/', heading: 'Experience Ramadan' },
    { path: '/programs', heading: 'Fasting Programs' },
    { path: '/culture', heading: 'Ramadan Around the World' },
    { path: '/recipes', heading: 'Ramadan Recipes' },
    { path: '/faq', heading: 'Frequently Asked Questions' },
    { path: '/settings', heading: 'Settings' },
    { path: '/guides', heading: 'User Guides' },
    { path: '/personas', heading: 'Personas' },
    { path: '/dashboard', heading: 'Dashboard' },
    { path: '/onboarding/welcome', heading: 'Welcome' },
  ];

  routes.forEach(({ path, heading }) => {
    it(`loads ${path}`, () => {
      cy.visit(path);
      cy.contains('h1, h2', new RegExp(heading, 'i')).should('be.visible');
      cy.get('main, [role="main"], nav').should('exist');
    });
  });
});
```

---

## 6. Notes

- **Dashboard redirect**: `/dashboard` may redirect to `/onboarding/welcome` if user has no location and onboarding incomplete. Smoke test should either seed localStorage with `onboardingComplete: true` and `locationCoords`, or assert redirect behavior.
- **Dynamic routes**: Use known slugs/ids: `monday-thursday`, `saudi-arabia`, `suhoor/1`, `getting-started`, `non-muslim-curious`.
- **Lazy loading**: Routes use `React.lazy`; allow time for Suspense to resolve before asserting.
- **Console errors**: Playwright/Cypress can listen for `pageerror`; RTL runs in Node so uncaught errors surface as test failures.
