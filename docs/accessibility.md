# Accessibility (WCAG 2.2 AA)

Patterns, shared UI map, and definition of done for TryRamadan. Target: **WCAG 2.2 Level AA**.

---

## 1. Shared UI map

| Component | Role | Semantics | Notes |
|-----------|------|-----------|--------|
| **Navbar** | Global navigation | `<nav>`, skip link to `#main-content` | `motion.nav`; logo + links + location + menu (mobile). Hamburger is `<button aria-label="Toggle menu">`. |
| **Footer** | Site footer | `<footer>`, `<h4>` for link groups | Quick Links, Your fasting, Resources, theme switcher. |
| **Page main** | Main content | `<main id="main-content">` | Every screen; optional `aria-label` on main for context. |
| **Cards** | Content containers | `<section>` or `<article>` where appropriate; avoid clickable `<div>` | Use `<Link>` or `<button>` for interactive cards. |
| **Buttons** | Actions | `<button type="button">` or `<Button>` (shadcn) | Never use `<div onClick>`. Use `focus-visible:ring-2` for visible focus. |
| **Location search** | Form control | `<input>` with associated `<label>` or `aria-label`; combobox pattern if needed | Debounced search; id + label for programmatic association. |
| **Selects** | Dropdowns | shadcn `<Select>` (Radix); `<Label>` + `id` on `<SelectTrigger>` | Country, language, method/madhhab when present. |
| **Date pickers** | Date input | shadcn `<Calendar>` / Popover; ensure label and keyboard nav | Dashboard Schedule, Dashboard date popover. |
| **Modals / dialogs** | Overlays | Radix Dialog (role=dialog, focus trap, focus restore) | Use `<DialogTitle>` and `<DialogDescription>`; close button has sr-only "Close". |
| **Menus / dropdowns** | Menus | Radix DropdownMenu / Popover | Keyboard operable; trigger has accessible name. |
| **Tabs** | Tab panels | shadcn `<Tabs>` (Radix) | `aria-selected`, `role="tablist"`, `role="tab"`, `role="tabpanel"`. |

---

## 2. Structural rules

- **One H1 per screen:** Each route should have exactly one `<h1>` that describes the page. Error/empty states (e.g. "Recipe not found") may use an H1 in that branch.
- **Heading hierarchy:** Use H1 → H2 → H3 in order; do not skip levels.
- **Semantic elements:** Prefer `<main>`, `<header>`, `<nav>`, `<footer>`, `<section>`, `<article>`, `<button>`, `<a>` instead of generic `<div>` for interactive or landmark content.
- **Skip link:** Navbar includes "Skip to main content" linking to `#main-content`; every page must have a `<main id="main-content">`.

---

## 3. Forms and interactions

- **Labels:** Every `<input>`, `<select>`, and custom control (e.g. location search) must have a programmatically associated label:
  - Prefer `<label htmlFor="id">` with matching `id` on the control.
  - Or `aria-label` / `aria-labelledby` when a visible label is not desired.
- **Groups:** Use `<fieldset>` and `<legend>` for logical groups (e.g. "Mode", "Learning priority"). Style the legend to match existing label styling if needed.
- **Descriptions:** Use `<p>` or `aria-describedby` for helper text (e.g. "Display preference. Location above is used for prayer times.").
- **Modals/dialogs:** Radix Dialog provides focus trap and restore. Always include:
  - `<DialogTitle>` (exposes `aria-labelledby`).
  - `<DialogDescription>` when it helps (exposes `aria-describedby`).
  - Close control with visible or sr-only "Close" text.
- **Menus and popovers:** Ensure full keyboard operation (Enter/Space to activate, Escape to close, arrow keys where applicable). Radix handles this; avoid blocking default behavior.

---

## 4. Visual and ARIA

- **Focus visible:** All interactive elements must show a visible focus indicator (keyboard only is OK). Use Tailwind/shadcn:
  - `focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2` (or `ring-secondary` for brand).
  - Do not rely on `:focus` only; use `focus-visible` so mouse users don’t see a ring on click unless desired.
- **ARIA:** Prefer semantic HTML over ARIA. Add ARIA only when necessary:
  - **Dialogs:** Radix sets `role="dialog"`, `aria-modal="true"`. Provide title/description.
  - **Tabs:** Radix Tabs sets roles and `aria-selected`; keep default behavior.
  - **Live regions:** Use `aria-live="polite"` (or `assertive`) for dynamic text that should be announced (e.g. countdown).
  - **Decorative:** Use `aria-hidden="true"` on purely decorative icons/images.
- **Remove incorrect ARIA:** Avoid redundant or wrong attributes (e.g. `role="main"` on `<main>` is redundant; `role="button"` on a `<div>` is wrong—use `<button>`).

---

## 5. Definition of done (per component or PR)

Before merging UI changes, confirm:

- [x] **Structure:** One H1 per screen; headings in order; landmarks (`main`, `nav`, `footer`) used where appropriate. Key pages use `<main id="main-content">` for skip link.
- [x] **Interactive elements:** Buttons and links are real `<button>` / `<a>` (or `<Link>`). No clickable `<div>` without role and full keyboard support.
- [x] **Labels:** Every form field has an associated label (or `aria-label` / `aria-labelledby`). Groups use `<fieldset>`/`<legend>` where it helps (e.g. Settings).
- [x] **Focus:** All focusable elements have a visible focus style (`focus-visible:ring-*` or equivalent). Focus order is logical.
- [x] **Dialogs/menus:** Dialog has title and optional description; focus is trapped and restored; close is keyboard operable. Menus are keyboard navigable.
- [x] **ARIA:** No redundant or incorrect ARIA; minimal ARIA on complex components (tabs, dialog, live regions). Decorative icons use `aria-hidden`.
- [ ] **Testing:** Manual test with keyboard only (Tab, Enter, Space, Escape); optional screen reader spot-check (e.g. VoiceOver, NVDA).

---

## 6. File reference

| Area | Files |
|------|--------|
| Nav / footer | `Navbar.tsx`, `Footer.tsx` |
| Dialogs | `ui/dialog.tsx`, `BreakFastReasonDialog.tsx`, `RamadanStartInfoDialog.tsx`, Settings/Dashboard dialogs |
| Forms / selects | `ui/input.tsx`, `ui/select.tsx`, `ui/label.tsx`, `LocationSearch.tsx`, `Settings.tsx` |
| Buttons | `ui/button.tsx` (has focus-visible ring) |
| Tabs | `ui/tabs.tsx` |
| Focus utilities | `index.css` (print hides focus); ensure no `outline: none` without replacement |

---

## 7. Changes in this pass (reference)

- **Settings:** Fasting path (Mode, Program, Voluntary) and Your priorities (Learning, Culture & recipes, Quran) wrapped in `<fieldset>`/`<legend>` for programmatic group labels. Custom buttons in those sections given `focus-visible:ring-2` and `aria-pressed` where they act as toggle groups.
- **LocationSearch:** Input given stable `id="location-search"` and `focus-visible:ring-2`; Settings page adds an sr-only `<label htmlFor="location-search">` so the control is explicitly associated.
- **Dialog (ui/dialog):** Close button uses `focus-visible:ring-2` (not `focus:ring`) and `aria-label="Close dialog"`; icon marked `aria-hidden`.
- **Sheet (ui/sheet):** Close button aligned with dialog: `focus-visible:ring-2`, `aria-label="Close"`, icon `aria-hidden`.
- **Redundant ARIA:** Removed `role="main"` from `<main>` on RecipeDetail, CultureCountry, Recipes, DashboardQuran, Health (element already has implicit role).
