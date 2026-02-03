---
name: tryramadan-accessibility
description: Accessibility (a11y) in TryRamadan. Covers skip link, focus visibility, aria-live for countdowns and dynamic content, RTL for Arabic, and axe-core tests. Use when adding or changing UI components, forms, or dynamic content to keep the app accessible.
---

# Accessibility (TryRamadan)

Use this skill when **adding or changing UI** so the app stays accessible to keyboard and screen-reader users.

---

## 1. Global requirements

- **Skip link:** "Skip to main content" at the top (focusable first); target `id="main-content"` on main landmark.
- **Focus visibility:** Interactive elements (buttons, links, custom controls) must have visible focus ring, e.g. `focus-visible:ring-2 focus-visible:ring-offset-2`. Avoid removing outline without a replacement.
- **Landmarks:** Use semantic HTML (`<main>`, `<nav>`, `<header>`, `<footer>`) and one `<h1>` per page where appropriate.

---

## 2. Dynamic content and countdowns

- **Countdown timers** (e.g. time until Iftar, Suhoor end): Use `aria-live="polite"` and `aria-label` describing the value (e.g. "X hours Y minutes until Iftar") so screen readers announce updates.
- **Next prayer / status:** Wrap in `role="status"` or `aria-live="polite"` so changes are announced.
- **FastingTimer, Dashboard countdown, DashboardPrayers next-prayer block:** Already use aria-live and aria-label; preserve when editing.

---

## 3. Forms and controls

- **Labels:** Use `<label>` with `htmlFor` or `Label` component; avoid placeholders as sole labels.
- **Errors:** Associate error text with inputs (e.g. `aria-describedby` or `aria-invalid`).
- **Buttons:** Prefer `<button type="button">` for actions; use `aria-label` when icon-only (e.g. Settings gear).

---

## 4. Arabic and RTL

- **Arabic text:** Use `dir="rtl"` on containers for Arabic content (e.g. `bodyAr`, glossary Arabic).
- **Mixed content:** Keep surrounding layout LTR unless the whole section is RTL; use `dir="rtl"` on the Arabic phrase/block (e.g. `<p className="font-arabic" dir="rtl">`).
- **Transliteration:** Keep consistent (e.g. Suhoor, Iftar, Fajr) as used in the app.

---

## 5. Testing

- **File:** `src/test/accessibility.test.tsx`.
- **Tool:** vitest-axe (axe-core). Run `expect(...).toHaveNoViolations()` after rendering a page or component.
- **Coverage:** HeroSection, OnboardingWelcome, ArabicHover/ArabicTerm, and other critical flows. Add new pages or components that introduce new interactive or dynamic content.

---

## 6. Checklist for UI changes

- [ ] New interactive elements have visible focus and sensible tab order.
- [ ] New countdowns or live-updating text have aria-live and aria-label.
- [ ] New forms have proper labels and error association.
- [ ] Arabic content has dir="rtl" where needed.
- [ ] Add or extend axe test for the changed flow if it’s a critical path.
