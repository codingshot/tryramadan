# XSS and DOM-Based Injection Testing Guide

Identification of user-controlled inputs that end up rendered, malicious payload examples, sanitization strategies, safe patterns for localStorage, and automated test/ESLint recommendations.

---

## 1. User-controlled inputs that end up rendered

| Input source | Storage key | Fields | Where rendered |
|--------------|-------------|--------|----------------|
| **Journal** | `tryramadan-journal` | `content`, `gratitude` | DashboardJournal, Dashboard (selected day card), DashboardSchedule (day detail) |
| **Wellness notes** | `tryramadan-wellness` | `note` | DashboardHealth (wellness list) |
| **Schedule notes** | `tryramadan-schedule-notes` | value per date | DashboardSchedule (textarea `value={noteInput}`; displayed in day detail when `selectedDate` matches) |
| **Goals until Ramadan** | `tryramadan-goals-until-ramadan` | `title` | DashboardGoals, GoalsUntilRamadanCard |
| **Custom calendar events** | `tryramadan-calendar-events` | `title` | DashboardSchedule (event list, line ~1261: `{e.time} — {e.title}`) |
| **Food/meal names** | `tryramadan-day-food-log`, `tryramadan-day-planned-items`, `tryramadan-day-meal-plans` | `name`, meal plan text | DashboardMacros, DashboardSchedule, Dashboard (add-food, meal list) |
| **Today intention** | `tryramadan-today` | `intention` | DashboardToday (input value + display) |
| **Location display name** | `tryramadan-preferences` | `location` | Navbar, Settings, various (from API or user selection) |
| **Onboarding draft** | `tryramadan-onboarding-draft` | `goals`, `intention` | Merged into prefs on completion; goals rendered in GoalsUntilRamadanCard |
| **Symptom** | `tryramadan-symptoms` | `symptom` | DashboardHealth (list item) — from fixed SYMPTOM_OPTIONS; lower risk |

**Note:** `daily-facts`, `hadiths`, `recipes`, `cultural-traditions`, `guides`, `personas`, `glossary` are from JSON/app data, not user input. They are lower risk unless the build pipeline is compromised.

---

## 2. Malicious payload examples and reflection points

### 2.1 Journal (content, gratitude)

| Payload | Purpose | Reflection point |
|---------|---------|------------------|
| `<script>alert(1)</script>` | Classic script injection | DashboardJournal `{entry.content}`, Dashboard card, Schedule day detail |
| `<img src=x onerror="alert(1)">` | Event handler injection | Same |
| `javascript:alert(1)` | In links (if ever wrapped in `<a href={content}>`) | N/A — not used as href |
| `{{7*7}}` or `<%= 7*7 %>` | Template injection test | Same |
| `<svg onload=alert(1)>` | SVG-based XSS | Same |
| `"><img src=x onerror=alert(1)>` | Break out of attribute (if in `title=`, `aria-label=`) | Check `title={entry.content}` or similar |

**Current behavior:** React renders `{entry.content}` as text (auto-escaped). **Safe** unless `dangerouslySetInnerHTML` is ever used for journal.

### 2.2 Wellness notes

| Payload | Reflection point |
|---------|------------------|
| `<script>alert(1)</script>` | DashboardHealth: `{e.note && ': ${e.note}'}` (inside JSX, so escaped) |
| `<img src=x onerror=alert(1)>` | Same |

**Current behavior:** Rendered inside `{}` in JSX. **Safe.**

### 2.3 Schedule notes

| Payload | Reflection point |
|---------|------------------|
| `<script>alert(1)</script>` | Textarea `value={noteInput}`; persisted value shown when switching days. Displayed in day detail as `{selectedDayJournal.content}` — wait, schedule notes are separate. Let me check. |
| | `scheduleNotes[selectedDate]` is used in textarea and possibly in day summary. Need to verify if it's rendered in DOM outside a controlled input. |

**Check:** DashboardSchedule uses `value={noteInput}` (controlled) and `noteInput` is synced from `scheduleNotes[selectedDate]`. When displayed elsewhere, is it `{scheduleNotes[...]}` in a `<span>` or similar? If so, React escapes it. **Safe** if always in `{ }`.

### 2.4 Goals (title)

| Payload | Reflection point |
|---------|------------------|
| `<script>alert(1)</script>` | DashboardGoals: `{goal.title}` in list item |
| `<img src=x onerror=alert(1)>` | Same |

**Current behavior:** `{goal.title}` — React escapes. **Safe.**

### 2.5 Custom calendar events (title)

| Payload | Reflection point |
|---------|------------------|
| `<script>alert(1)</script>` | DashboardSchedule: `{e.time} — {e.title}` |
| `" onmouseover="alert(1)` | If ever in attribute context |

**Current behavior:** `{e.title}` in JSX. **Safe.**

### 2.6 Food/meal names

| Payload | Reflection point |
|---------|------------------|
| `<script>alert(1)</script>` | DashboardMacros `{i.name}`, `{e.name}`; DashboardSchedule meal list `{entry.name}`; Dashboard add-food |
| `<img src=x onerror=alert(1)>` | Same |

**Current behavior:** Rendered as `{entry.name}`, `{i.name}` in JSX. **Safe.**

### 2.7 Location

| Payload | Reflection point |
|---------|------------------|
| `"><img src=x onerror=alert(1)>` | `title={preferences.location}`, `aria-label={`Select ${location.name}...`}` |

**Current behavior:** Location comes from Nominatim API or user selection (LocationSearch). API response could be malicious if API is compromised. `title` and `aria-label` receive string values — React escapes attribute values. **Generally safe** but validate API responses.

### 2.8 dangerouslySetInnerHTML audit

| File | Usage | User input? | Risk |
|------|-------|-------------|------|
| CultureCountry | `JSON.stringify(jsonLd)` | No — jsonLd built from country (app data) | Low |
| Health | `JSON.stringify(...)` | No — schema | Low |
| RecipeDetail | `JSON.stringify(recipeJsonLd)` | No — recipe from app data | Low |
| FAQ | `JSON.stringify(faqPageJsonLd)` | No — FAQ items from app data | Low |
| chart.tsx | CSS from THEMES object | No — build-time config | Low |

**Critical rule:** Never use `dangerouslySetInnerHTML` with user-controlled or localStorage-sourced data.

---

## 3. Sanitization and encoding strategies

### 3.1 React component level

| Strategy | When to use | How |
|----------|-------------|-----|
| **Never use dangerouslySetInnerHTML for user data** | All user/localStorage content | Always render with `{value}` — React escapes by default |
| **Avoid string concatenation into HTML** | If you ever need to set `innerHTML` or construct HTML strings | Use `createElement` or React components instead |
| **Sanitize before storing in href** | If user input becomes `href` | Validate URL scheme (allow only `https:` or relative); or use `rel="noopener noreferrer"` and ensure not `javascript:` |
| **Trim/length limits** | All free-text inputs | Prevent abuse (e.g. 10k char limit for journal); optional max for notes |

### 3.2 Utility functions

Use `src/lib/sanitize.ts` (`stripHtml`, `isSafeUrl`). Use `stripHtml` when:
- Setting `document.title` from user content (e.g. PageSEO with user-provided title)
- Writing to `meta` tags or `aria-label` from user content (if dynamic)

### 3.3 Safe patterns for localStorage

```typescript
// ✅ SAFE: Read, parse with try/catch, use in JSX
function useJournal() {
  const [entries, setEntries] = useLocalStorage<JournalEntry[]>("tryramadan-journal", []);
  return entries;
}
// In component: {entry.content} — React escapes

// ✅ SAFE: JSON.stringify before storing (no HTML in keys/values)
localStorage.setItem(key, JSON.stringify(value));

// ❌ UNSAFE: Never do this
// <div dangerouslySetInnerHTML={{ __html: entry.content }} />

// ❌ UNSAFE: Building HTML from user input
// el.innerHTML = userInput;

// ⚠️ CAREFUL: If using in attribute
// title={entry.content} — React escapes, OK
// But: style={{ background: userInput }} could be unsafe if userInput is "url('javascript:...')"
// Avoid user-controlled style/url values.
```

---

## 4. Automated tests

### 4.1 Vitest tests for XSS

See `src/test/xss.test.tsx` (journal, goals, wellness tests). Example:

```typescript
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import DashboardJournal from "@/pages/DashboardJournal";
import DashboardGoals from "@/pages/DashboardGoals";
import DashboardSchedule from "@/pages/DashboardSchedule";
import DashboardMacros from "@/pages/DashboardMacros";
import DashboardHealth from "@/pages/DashboardHealth";
import { renderAt } from "./mainFeatures";

const XSS_PAYLOADS = [
  '<script>alert(1)</script>',
  '<img src=x onerror="alert(1)">',
  '<svg onload=alert(1)>',
  '"><img src=x onerror=alert(1)>',
  "javascript:alert(1)",
];

describe("XSS: user-controlled inputs are escaped when rendered", () => {
  beforeEach(() => {
    localStorage.clear();
    localStorage.setItem("tryramadan-preferences", JSON.stringify({
      onboardingComplete: true,
      userType: "muslim",
      locationCoords: { lat: 51.5, lng: -0.1 },
    }));
  });

  it("journal content is escaped (no script execution)", () => {
    localStorage.setItem("tryramadan-journal", JSON.stringify([{
      date: "2025-03-15",
      content: '<script>alert(1)</script>',
      gratitude: '<img src=x onerror="alert(1)">',
    }]));
    renderAt("/dashboard/journal", <DashboardJournal />);
    expect(screen.getByText(/<script>alert\(1\)<\/script>/)).toBeInTheDocument();
    expect(screen.getByText(/<img src=x onerror="alert\(1\)">/)).toBeInTheDocument();
  });

  it("goals title is escaped", () => {
    localStorage.setItem("tryramadan-goals-until-ramadan", JSON.stringify([{
      id: "1",
      title: '<script>alert(1)</script>',
      completed: false,
      createdAt: new Date().toISOString(),
    }]));
    renderAt("/dashboard/goals", <DashboardGoals />);
    expect(screen.getByText(/<script>alert\(1\)<\/script>/)).toBeInTheDocument();
  });

  it("wellness note is escaped", () => {
    localStorage.setItem("tryramadan-wellness", JSON.stringify({
      "2025-03-15": [{ timeOfDay: "morning", mood: 3, note: '<img src=x onerror="alert(1)">', timestamp: new Date().toISOString() }],
    }));
    renderAt("/dashboard/health", <DashboardHealth />);
    expect(screen.getByText(/<img src=x onerror="alert\(1\)">/)).toBeInTheDocument();
  });
});
```

### 4.2 ESLint rules

Install `eslint-plugin-react` (provides `react/no-danger`):

```bash
npm install eslint-plugin-react --save-dev
```

Add to `eslint.config.js`:

```js
import react from "eslint-plugin-react";

// In config:
{
  plugins: { react },
  rules: {
    "react/no-danger": "warn",
    "react/no-danger-with-children": "warn",
  },
  settings: { react: { version: "detect" } },
}
```

`react/no-danger` warns on `dangerouslySetInnerHTML`. Use `"error"` to fail the build.

### 4.3 Custom ESLint rule (optional)

To catch `dangerouslySetInnerHTML` with variables that might come from localStorage:

```javascript
// eslint-plugin-no-dangerous-localstorage (simplified concept)
// Rule: warn when dangerouslySetInnerHTML={{ __html: someVariable }}
// and someVariable is traced to localStorage or user input.
```

A simpler approach: **grep in CI** for `dangerouslySetInnerHTML` and ensure no user/localStorage variable is passed:

```bash
# In CI or pre-commit
rg "dangerouslySetInnerHTML" -A 1 src/
# Manual review: __html: must only be JSON.stringify(buildTimeObject) or similar
```

### 4.4 TypeScript / ESLint: ban dangerous patterns

```json
{
  "rules": {
    "no-restricted-syntax": [
      "error",
      {
        "selector": "CallExpression[callee.name='dangerouslySetInnerHTML']",
        "message": "Avoid dangerouslySetInnerHTML; use React children for user content"
      }
    ]
  }
}
```

(Adjust selector to match your AST — the idea is to flag any `dangerouslySetInnerHTML` usage.)

---

## 5. Summary

| Input | Rendered as | React escape? | Risk |
|-------|-------------|---------------|------|
| Journal content, gratitude | `{entry.content}` | Yes | Low (current) |
| Wellness note | `{e.note}` | Yes | Low |
| Schedule notes | `{noteInput}` (textarea value) | Yes | Low |
| Goals title | `{goal.title}` | Yes | Low |
| Calendar event title | `{e.title}` | Yes | Low |
| Food/meal names | `{entry.name}`, etc. | Yes | Low |
| Location | `title={}`, `aria-label={}` | Yes | Low |
| dangerouslySetInnerHTML | JSON-LD, schema, chart CSS only | N/A | Low (no user data) |

**Recommendations:**
1. Keep rendering user data only via `{value}` in JSX — never `dangerouslySetInnerHTML`.
2. Add `react/no-danger` ESLint rule (warn or error).
3. Add Vitest tests that inject XSS payloads into localStorage and assert they appear as literal text, not executed.
4. Add `stripHtml` utility for any future use of user content in `document.title`, meta, or non-React DOM.
5. Grep for `dangerouslySetInnerHTML` in CI and manually verify no user/localStorage data is passed.
