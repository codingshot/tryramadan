# UX: Guides & Personas — In-App Strategy

Evaluation of how `/guides` and `/personas` support the in-app experience: main journeys, which guides each persona should see first, contextual surfacing, and UX patterns to tie guides/personas into the live app.

**Related:** [guides.ts](../src/data/guides.ts), [personas.json](../src/data/personas.json).

---

## 1. Guides and personas: main journeys

### 1.1 Guides (from README and guides.ts)

| Guide slug | Category | Main journey represented |
|------------|----------|---------------------------|
| getting-started | onboarding | First-time setup → Dashboard |
| onboarding-flow | onboarding | Full onboarding walkthrough |
| personas-and-journeys | general | Understanding user types |
| dashboard-overview | dashboard | Core daily use |
| today-fast | dashboard | Fasting timer, log fast, intention, hydration |
| schedule-calendar | dashboard | Calendar, events, export .ics |
| prayers | dashboard | Prayer times, Imsak/Fajr/Maghrib |
| meals-recipes | dashboard | Meal planning, suhoor/iftar recipes |
| learn-glossary-hadith | learn | Glossary, hadith, learning content |
| progress-goals | dashboard | Streak, completed days, badges |
| journal | dashboard | Reflection, mood, gratitude |
| health-safety-emergency | health | When to break fast, emergency |
| settings | settings | Location, notifications, theme |
| recipes-explore | general | Browse recipes by suhoor/iftar |
| macro-tracker | dashboard | Meal plan, macros, calories |
| quran | dashboard | Juz plan, Quran.com |
| culture | general | Traditions by country, recipes |
| achievements | dashboard | Badges, milestones |
| voluntary-fasting-programs | general | Full Ramadan, Sunnah options |
| keyboard-shortcuts | general | Desktop power users |
| adhan-prayer-notifications | dashboard | Adhan sound, prayer reminders |
| install-as-app | general | PWA install |
| goals-until-ramadan | dashboard | Pre-Ramadan checklist |
| print-and-export | settings | Print, export journal/calendar |
| faq-and-help | general | FAQ, guides, emergency |

### 1.2 Personas (from personas.json)

| Persona | Main journey | Primary resources |
|---------|--------------|-------------------|
| **Non-Muslim curious** | Discover → Set up → Daily use → Go deeper | Learn, Culture, Recipes, Glossary, Health & safety |
| **Muslim observer** | Discover → Set up → Daily use → Observe | Prayers, Quran, Glossary, Hadith, Schedule, Meals |
| **Health & wellness** | Discover → Set up → Daily use → Track | Today, Macros, Schedule, Health, Meals, Programs |
| **Culture & food** | Discover → Set up → Daily use → Explore | Culture, Recipes, Meals, Learn |
| **Quran & learning** | Discover → Set up → Daily use → Read & learn | Quran, Glossary, Learn, Hadith, Prayers |

---

## 2. Persona → Guides: what to see first

### 2.1 Non-Muslim curious (learner)

| Priority | Guide | Rationale |
|----------|-------|-----------|
| **First** | getting-started | Quick path to dashboard. |
| **First** | today-fast | Core: "I'm fasting" / "Break fast" — explains timer and logging. |
| **First** | learn-glossary-hadith | Suhoor, Iftar, Ramadan terms; daily hadith. |
| **Second** | dashboard-overview | Quick access grid, streak, day plan. |
| **Second** | meals-recipes | Suhoor/iftar ideas by culture. |
| **Second** | health-safety-emergency | When to break fast; safety. |
| **Third** | culture | Traditions by country. |
| **Third** | recipes-explore | Full recipe list. |
| **Third** | personas-and-journeys | "If you're learning, see Curious explorer." |

### 2.2 Muslim observer (devout Muslim)

| Priority | Guide | Rationale |
|----------|-------|-----------|
| **First** | getting-started | Quick setup. |
| **First** | today-fast | Log fast, timer, intention. |
| **First** | prayers | Prayer times, Imsak/Fajr/Maghrib. |
| **First** | adhan-prayer-notifications | Adhan sound, prayer reminders. |
| **Second** | quran | Juz plan, Quran.com. |
| **Second** | schedule-calendar | Events, export .ics. |
| **Second** | dashboard-overview | Quick access. |
| **Third** | meals-recipes | Suhoor/iftar recipes. |
| **Third** | voluntary-fasting-programs | Sunnah options. |
| **Third** | health-safety-emergency | When to break fast. |

### 2.3 Health & wellness focus

| Priority | Guide | Rationale |
|----------|-------|-----------|
| **First** | getting-started | Setup. |
| **First** | today-fast | Hydration, energy check-in, intention. |
| **First** | macro-tracker | Meal plan, macros, calories. |
| **Second** | health-safety-emergency | When to break fast, contraindications. |
| **Second** | meals-recipes | Nutritious suhoor/iftar ideas. |
| **Second** | schedule-calendar | Food log, meal plans. |
| **Third** | progress-goals | Streak, completed days. |
| **Third** | voluntary-fasting-programs | Progressive fasting. |

### 2.4 Culture & food explorer

| Priority | Guide | Rationale |
|----------|-------|-----------|
| **First** | getting-started | Setup. |
| **First** | culture | Traditions by country. |
| **First** | meals-recipes | Daily meal suggestions. |
| **First** | recipes-explore | Full recipe list. |
| **Second** | schedule-calendar | Add recipes to day plan. |
| **Second** | dashboard-overview | Quick access to Culture, Meals. |
| **Third** | learn-glossary-hadith | Cultural education. |

### 2.5 Quran & learning focus

| Priority | Guide | Rationale |
|----------|-------|-----------|
| **First** | getting-started | Setup. |
| **First** | quran | Juz plan, Quran.com. |
| **First** | learn-glossary-hadith | Glossary, hadith. |
| **Second** | prayers | Prayer times. |
| **Second** | adhan-prayer-notifications | Prayer reminders. |
| **Second** | today-fast | Timer, intention. |
| **Third** | dashboard-overview | Quick access. |

---

## 3. Contextual surfacing: where and how

### 3.1 Dashboard (/dashboard)

| Surface | Placement | Content | Persona-aware? |
|---------|-----------|---------|----------------|
| **Need help?** section | Below Quick access | "New here? See [Getting started](guides/getting-started) or [Dashboard guide](guides/dashboard-overview)." | Yes: show persona-specific first guide (e.g. Curious → Learn; Muslim → Prayers). |
| **Inline guide chips** | Next to complex blocks | e.g. "Timer" → chip "Guide: Today's Fast"; "Streak" → chip "Guide: Progress & Goals" | No (contextual to feature). |
| **First-visit banner** | Top of dashboard | "Welcome. [See your journey](/personas/non-muslim-curious) or [Guides](/guides)." Dismissible. | Yes: link to persona from userType. |

### 3.2 Today (/dashboard/today)

| Surface | Placement | Content | Persona-aware? |
|---------|-----------|---------|----------------|
| **Guide chip** | Near "Fasting timer" heading | "Need help? [Today's Fast guide](/guides/today-fast)" | No. |
| **Inline tip** | Near "I'm fasting" / "Break fast" | First-visit tooltip: "After suhoor → I'm fasting. At sunset → Mark complete." Links to today-fast guide. | No. |
| **Emergency CTA** | Near "Need to break fast early?" | Link to health-safety-emergency guide. | No. |

### 3.3 Schedule (/dashboard/schedule)

| Surface | Placement | Content | Persona-aware? |
|---------|-----------|---------|----------------|
| **Guide chip** | Near "Add to calendar" or Export | "How to export? [Schedule guide](/guides/schedule-calendar)" | No. |
| **Inline tip** | Near food log (empty state) | "Add suhoor/iftar to your log. [Meals guide](/guides/meals-recipes)." | No. |
| **Quick-add events** | Near Suhoor/Iftar buttons | Chip: "Guide: Schedule & Calendar" | No. |

### 3.4 Other surfaces

| Page | Surface | Content |
|------|---------|---------|
| **Prayers** | Chip near prayer times | "Guide: Prayer times" |
| **Meals** | Chip near meal cards | "Guide: Meals & Recipes" |
| **Quran** | Chip near juz selector | "Guide: Quran reading plan" |
| **Macros** | Chip near plan/log | "Guide: Macro tracker" |
| **Journal** | Chip near write area | "Guide: Journal & Reflection" |
| **Learn** | Chip near glossary | "Guide: Glossary & Hadith" |
| **Culture** | Chip near country list | "Guide: Culture & Traditions" |
| **Settings** | Section "Need help?" | Links: FAQ, Guides, Personas |

---

## 4. UX patterns to tie guides/personas into the app

### 4.1 "Need help?" sections

**Pattern:** Compact block with 1–3 links, always visible or collapsible.

**Placement:**
- **Dashboard:** Below Quick access (existing HelpCircle + User Guides). Expand to: "Need help? [Guides](/guides) · [Your journey](/personas/{slug}) · [FAQ](/faq)."
- **Settings:** Bottom of each major section (Location, Notifications, etc.): "Guide: [Settings](/guides/settings)."
- **First-time user:** "New? [Getting started](/guides/getting-started) · [Your persona](/personas/{slug})."

**Copy:** Short, action-oriented. "See guide" / "Your journey" / "FAQ."

### 4.2 Inline "Guide" chips

**Pattern:** Small pill/chip near a feature. Low visual weight, optional.

**Design:**
- Text: "Guide" or "How does this work?"
- Link: `/guides/{slug}` or `/guides/{slug}#step-N`
- Style: Secondary/muted; icon optional (BookOpen, HelpCircle).

**Placement:**
- Fasting timer → today-fast
- Prayer times grid → prayers
- Quick-add events → schedule-calendar
- Food log → meals-recipes or macro-tracker
- Juz selector → quran
- Glossary preview → learn-glossary-hadith
- Culture country cards → culture

**Rule:** One chip per section; avoid clutter. Collapse to "?" icon on mobile.

### 4.3 Persona-aware first guide

**Pattern:** Use `userType` (from preferences) to suggest the most relevant guide or persona.

**Logic:**
- `userType === "new"` (Non-Muslim) → first guide: learn-glossary-hadith or today-fast; persona: non-muslim-curious.
- `userType === "muslim"` → first guide: prayers or today-fast; persona: muslim-observer.

**Additional signals (optional):**
- `macroTrackingEnabled` → surface macro-tracker guide.
- `cultureRecipesPriority === "lots"` → surface culture, recipes-explore.
- `quranPriority === "daily"` → surface quran, learn-glossary-hadith.

**Placement:** "Need help?" block or first-visit banner: "For your journey: [Learn guide](/guides/learn-glossary-hadith)" or "See [Curious explorer](/personas/non-muslim-curious)."

### 4.4 First-visit contextual banner

**Pattern:** One-time dismissible banner at top of Dashboard or Today.

**Copy:** "Welcome to TryRamadan. [See getting started](/guides/getting-started) or [your journey](/personas/{slug})." [Dismiss]

**Storage:** `localStorage` key `tryramadan-first-visit-banner-dismissed` (or similar). Show only once.

### 4.5 Empty-state links

**Pattern:** When a section is empty, add a guide link.

**Examples:**
- No journal entries → "Start reflecting. [Journal guide](/guides/journal)."
- No food log → "Log your first meal. [Meals guide](/guides/meals-recipes)."
- No goals → "Set pre-Ramadan goals. [Goals guide](/guides/goals-until-ramadan)."

### 4.6 Footer and nav consistency

**Current:** Footer has "User Guides" and "Personas."

**Enhancement:** Ensure these are visible on Dashboard subpages (Today, Schedule, etc.). Consider a persistent "Help" entry in nav/menu that opens a dropdown: Guides, Personas, FAQ, Emergency.

---

## 5. Implementation summary

| Pattern | Where | Effort | Impact |
|---------|-------|--------|--------|
| **Need help?** (expand existing) | Dashboard, Settings | Low | Medium |
| **Guide chips** | Today, Schedule, Prayers, Meals, Quran, Macros, Journal, Learn, Culture | Medium | High |
| **Persona-aware first guide** | Dashboard Need help?, first-visit banner | Low | Medium |
| **First-visit banner** | Dashboard | Low | Medium |
| **Empty-state guide links** | Journal, Schedule food log, Goals | Low | Low–Medium |
| **Help dropdown in nav** | Navbar | Medium | Medium |

---

## 6. Persona–guide mapping (reference)

| Persona | First guides (3–5) | Contextual chips |
|---------|--------------------|------------------|
| Non-Muslim curious | getting-started, today-fast, learn-glossary-hadith | Learn, Today, Health |
| Muslim observer | getting-started, today-fast, prayers, adhan-prayer-notifications | Prayers, Quran, Schedule |
| Health & wellness | getting-started, today-fast, macro-tracker, health-safety-emergency | Today, Macros, Health |
| Culture & food | getting-started, culture, meals-recipes, recipes-explore | Culture, Meals |
| Quran & learning | getting-started, quran, learn-glossary-hadith | Quran, Learn, Prayers |
