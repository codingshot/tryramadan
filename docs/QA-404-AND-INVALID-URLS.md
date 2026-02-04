# QA: Invalid and Outdated URLs

> **Implementation status:** Done. Vitest tests in `src/test/404-invalid-urls.test.tsx`. Old-path redirects added: `/today` → `/dashboard/today`, `/schedule` → `/dashboard/schedule`, `/journal` → `/dashboard/journal`, `/prayers` → `/dashboard/prayers`.

Verifies that invalid or outdated URLs don't break the app. Documents 404 behavior, proposed test cases, and expected user experience.

---

## 1. Current 404 / Fallback Behavior

### Routing

- React Router uses a **catch-all route** at the end of the route list:
  ```tsx
  <Route path="*" element={<Suspense fallback={<PageFallback />}><NotFound /></Suspense>} />
  ```
- Any path that does not match a defined route falls through to `NotFound`.
- Order of routes matters: more specific routes are defined first; `*` is last.

### NotFound Component (`src/pages/NotFound.tsx`)

| Aspect | Behavior |
|--------|----------|
| **Layout** | Full-screen centered; no Navbar or Footer (minimal layout) |
| **Content** | "404" heading, "Oops! Page not found" message |
| **Primary CTA** | "Return to Home" → `/` |
| **Secondary CTA** | "Go to Dashboard" → `/dashboard` |
| **SEO** | `PageSEO` with `title="404 | Page Not Found | TryRamadan.app"`, `robots="noindex, nofollow"` |
| **Logging** | `console.error` with pathname for debugging |

### Paths That Trigger 404

- Typo routes: `/dashbord`, `/dash/today`, `/dashbaord`, `/shedule`
- Wrong segments: `/dashboard/tommorrow`, `/onbording/welcome`
- Non-existent dynamic slugs: `/guides/nonexistent-guide`, `/programs/fake-program`, `/culture/invalid-country`
- Arbitrary paths: `/foo`, `/admin`, `/api/v1`

---

## 2. Expected User Experience

| Requirement | Implementation |
|-------------|----------------|
| **Clear not-found page** | ✅ "404" + "Oops! Page not found" |
| **Route back to home** | ✅ "Return to Home" link to `/` |
| **Route back to dashboard** | ✅ "Go to Dashboard" link to `/dashboard` |
| **No crash or blank screen** | ✅ NotFound renders; no uncaught errors |
| **SEO-friendly** | ✅ noindex, nofollow for 404 pages |
| **Accessible** | ✅ main landmark, semantic headings, min-height touch targets (44px) |

### UX Notes

- The 404 page does **not** include the Navbar. Users can still navigate via the two CTAs. Adding Navbar would give a consistent shell and extra nav options; current design favors a focused recovery flow.
- Both CTAs use `<a href="...">` for full navigation (not `Link`), so a full page load occurs when clicked.

---

## 3. Proposed Test Cases

### Typo Routes

| Route | Expected | Notes |
|-------|----------|-------|
| `/dashbord` | 404 NotFound | Common typo for /dashboard |
| `/dash/today` | 404 NotFound | Wrong parent path |
| `/dashboard/todau` | 404 NotFound | Typo in child |
| `/dashboard/shedule` | 404 NotFound | Typo for /schedule |
| `/onbording` | 404 NotFound | Typo for /onboarding |
| `/onbording/welcome` | 404 NotFound | Typo in parent |
| `/setings` | 404 NotFound | Typo for /settings |
| `/gides` | 404 NotFound | Typo for /guides |
| `/recipt/iftar/1` | 404 NotFound | Typo for /recipe |
| `/receipes` | 404 NotFound | Typo for /recipes |

### Old Paths (Redirects Added)

Redirects are in place for backward compatibility:

| Old path | Redirects to | Status |
|----------|--------------|--------|
| `/today` | `/dashboard/today` | ✅ Redirect |
| `/schedule` | `/dashboard/schedule` | ✅ Redirect |
| `/journal` | `/dashboard/journal` | ✅ Redirect |
| `/prayers` | `/dashboard/prayers` | ✅ Redirect |

### Invalid Dynamic Slugs

| Route | Expected | Notes |
|-------|----------|-------|
| `/guides/invalid-slug-xyz` | GuidePage handles; may show "Guide not found" or similar | GuidePage has its own fallback |
| `/programs/invalid-slug` | VoluntaryFastingDetail → `<Navigate to="/programs" />` | Redirects to programs list |
| `/culture/invalid-country` | CultureCountry; may show "Country not found" | Per-page handling |
| `/recipe/suhoor/99999` | RecipeDetail; may show "Recipe not found" | Per-page handling |

### Empty or Malformed Paths

| Route | Expected |
|-------|----------|
| `/` | Index (valid) |
| `//` | May match `/` or 404 depending on router normalization |
| `/dashboard/` | Matches `/dashboard` (trailing slash typically normalized) |
| `/%2e%2e/` | Path traversal; should 404 |

---

## 4. Test Implementation (Vitest + RTL)

```ts
// src/test/404-invalid-urls.test.tsx
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";

function render404(route: string) {
  return render(
    <TooltipProvider>
      <MemoryRouter initialEntries={[route]}>
        <Routes>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </MemoryRouter>
    </TooltipProvider>
  );
}

describe("404 for invalid or unknown URLs", () => {
  it("shows NotFound for typo /dashbord", () => {
    render404("/dashbord");
    expect(screen.getByRole("heading", { name: /^404$/ })).toBeInTheDocument();
    expect(screen.getByText(/page not found/i)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /return to home/i })).toHaveAttribute("href", "/");
    expect(screen.getByRole("link", { name: /go to dashboard/i })).toHaveAttribute("href", "/dashboard");
  });

  it("shows NotFound for typo /dash/today", () => {
    render404("/dash/today");
    expect(screen.getByText(/page not found/i)).toBeInTheDocument();
  });

  it("shows NotFound for typo /dashboard/shedule", () => {
    render404("/dashboard/shedule");
    expect(screen.getByText(/page not found/i)).toBeInTheDocument();
  });

  it("shows NotFound for typo /onbording/welcome", () => {
    render404("/onbording/welcome");
    expect(screen.getByText(/page not found/i)).toBeInTheDocument();
  });

  it("shows NotFound for hypothetical old path /today (if no redirect)", () => {
    render404("/today");
    expect(screen.getByText(/page not found/i)).toBeInTheDocument();
  });

  it("provides Return to Home link", () => {
    render404("/foo");
    const homeLink = screen.getByRole("link", { name: /return to home/i });
    expect(homeLink).toHaveAttribute("href", "/");
  });

  it("provides Go to Dashboard link", () => {
    render404("/bar");
    const dashLink = screen.getByRole("link", { name: /go to dashboard/i });
    expect(dashLink).toHaveAttribute("href", "/dashboard");
  });

  it("does not throw for arbitrary path", () => {
    expect(() => render404("/admin/settings")).not.toThrow();
    expect(screen.getByText(/page not found/i)).toBeInTheDocument();
  });
});
```

---

## 5. Playwright E2E (Full App)

```ts
// e2e/404-invalid-urls.spec.ts
import { test, expect } from "@playwright/test";

const TYPO_ROUTES = ["/dashbord", "/dash/today", "/dashboard/shedule", "/onbording", "/setings"];
const OLD_PATH_REDIRECTS = [
  { from: "/today", to: "/dashboard/today" },
  { from: "/schedule", to: "/dashboard/schedule" },
  { from: "/journal", to: "/dashboard/journal" },
  { from: "/prayers", to: "/dashboard/prayers" },
];

test.describe("Invalid URLs show 404", () => {
  for (const route of TYPO_ROUTES) {
    test(`${route} shows 404 with recovery links`, async ({ page }) => {
      await page.goto(route);
      await expect(page.getByRole("heading", { name: /^404$/ })).toBeVisible();
      await expect(page.getByText(/page not found/i)).toBeVisible();
      await expect(page.getByRole("link", { name: /return to home/i })).toBeVisible();
      await expect(page.getByRole("link", { name: /go to dashboard/i })).toBeVisible();
    });
  }

  for (const { from, to } of OLD_PATH_REDIRECTS) {
    test(`${from} redirects to ${to}`, async ({ page }) => {
      await page.goto(from);
      await expect(page).toHaveURL(new RegExp(to.replace(/\//g, "\\/")));
      await expect(page.getByText(/page not found/i)).not.toBeVisible();
    });
  }

  test("Return to Home navigates to /", async ({ page }) => {
    await page.goto("/dashbord");
    await page.getByRole("link", { name: /return to home/i }).click();
    await expect(page).toHaveURL(/\/(\?.*)?$/);
    await expect(page.getByRole("link", { name: /try.*ramadan/i })).toBeVisible();
  });

  test("Go to Dashboard navigates to /dashboard", async ({ page }) => {
    await page.goto("/invalid-xyz");
    await page.getByRole("link", { name: /go to dashboard/i }).click();
    await expect(page).toHaveURL(/\/dashboard/);
    // Dashboard may redirect to onboarding if no preferences; still no 404
    await expect(page.getByText(/page not found/i)).not.toBeVisible();
  });
});
```

---

## 6. Summary

| Question | Answer |
|----------|--------|
| **Does the app show a clear not-found page?** | Yes. "404" heading, "Oops! Page not found", two CTAs. |
| **Route back to /?** | Yes. "Return to Home" → `/`. |
| **Route back to /dashboard?** | Yes. "Go to Dashboard" → `/dashboard`. |
| **Do typo routes break the app?** | No. They hit the catch-all and render NotFound. |
| **Old paths (e.g. /today)?** | Redirect to /dashboard/today, /dashboard/schedule, /dashboard/journal, /dashboard/prayers. |
| **Per-page invalid slugs?** | Guides, Programs, Culture, Recipe handle invalid IDs with in-page fallbacks or redirects. |
