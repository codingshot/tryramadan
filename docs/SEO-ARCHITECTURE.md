# TryRamadan – Technical SEO & AEO Architecture

## 1. Structure discovery

### Framework
- **Stack:** Vite + React 18 + React Router (SPA). No SSR; head/meta are set client-side.
- **Head/meta:** Single utility component **`PageSEO`** (`src/components/PageSEO.tsx`) used on every key route. It sets `document.title`, `<meta name="description">`, `<link rel="canonical">`, Open Graph and Twitter Card tags, and optional `robots` via `useEffect`. This is the recommended approach for a Vite/React SPA (no Next.js/Nuxt head APIs).

### Page types

| Type | Routes | Notes |
|------|--------|--------|
| **Home** | `/` (Index) | Hero, features, CTAs. Has WebApplication + FAQPage JSON-LD in `index.html`. |
| **Category/listing** | `/culture`, `/recipes`, `/programs`, `/guides`, `/personas` | All use PageSEO with unique title/description; canonical when path set. |
| **Detail** | `/recipe/:mealType/:id`, `/culture/:countryId`, `/guides/:slug`, `/programs/:slug`, `/personas/:slug` | Dynamic title/description/path. GuidePage has HowTo JSON-LD; CultureCountry has WebPage + Article; RecipeDetail has no schema yet. |
| **Marketing/utility** | `/faq`, `/health`, `/health-safety`, `/emergency`, `/terms`, `/legal`, `/privacy` | FAQ has no page-level FAQPage schema. Health has Article JSON-LD. |
| **App** | `/dashboard`, `/dashboard/*`, `/settings` | PageSEO on each; dashboard routes are app-focused (indexed per product decision). |
| **Onboarding** | `/onboarding/*` | Single PageSEO on layout with noindex in product; flow not content. |
| **404** | `*` (NotFound) | PageSEO with `robots="noindex, nofollow"`. Canonical should not point to the 404 URL. |

### Files touched by SEO work

- **`src/components/PageSEO.tsx`** – Central meta/canonical/OG/Twitter; add og:site_name, ensure canonical logic for 404.
- **`index.html`** – Default title/meta/OG/JSON-LD; already solid.
- **`src/pages/Index.tsx`** – Add short AEO summary (2–3 sentences) near top.
- **`src/pages/FAQ.tsx`** – Add JSON-LD FAQPage from faqs data.
- **`src/pages/RecipeDetail.tsx`** – Add Recipe JSON-LD.
- **`src/pages/NotFound.tsx`** – Omit canonical on 404 (or set to home).
- **`src/lib/jsonld.ts`** (new) – Reusable JSON-LD builders (FAQ, Recipe, etc.) and optional script injector.
- **Footer/Navbar** – Already strong internal links; minor additions if needed (e.g. FAQ, Health, Emergency).

---

## 2. On-page SEO (current + planned)

- **Title & description:** Every key route uses PageSEO with unique `title` and `description` (dynamic where needed). No change required except ensuring 404 and canonical behavior.
- **Canonical:** PageSEO sets `<link rel="canonical">` when `path` is provided. Detail pages pass dynamic path. **Change:** For NotFound, do not set canonical to the 404 URL (omit `path` or pass empty so canonical is not written).
- **Open Graph / Twitter:** PageSEO already sets og:title, og:description, og:url, og:type, og:image, og:image:alt, twitter:card, twitter:title, twitter:description, twitter:image. **Change:** Add `og:site_name` in PageSEO so all SPA-rendered pages match index.html.

---

## 3. AEO (Answer Engine Optimization)

- **Direct answer / summary:** Add a 2–3 sentence “What is TryRamadan?” summary near the top of the home page (e.g. right after hero) so crawlers and LLMs get a clear, concise answer.
- **H2/H3 structure:** FAQ already uses H2 per category; Health/HealthSafety use clear headings. Keep and reinforce where needed.
- **FAQ schema:** Index has a small static FAQPage in index.html. The **/faq** page should output a **full FAQPage** JSON-LD built from its `faqs` array so answer engines can use the real Q&A.
- **JSON-LD:** Add **Recipe** schema on RecipeDetail. Keep existing Article (Health, CultureCountry), HowTo (GuidePage), WebApplication (index). Optionally add **Organization** in a single place (e.g. index or Footer) for consistency.

---

## 4. Internal linking

- **Navbar:** Features, Programs, Health, Recipes, Culture, About (FAQ). Good coverage.
- **Footer:** Quick Links (Features, Programs, Recipes, Culture, Health-safety); Your fasting (Dashboard, Today, Progress, Meals, Journal, Quran); Resources (Guides, Personas, Glossary, Hadith, Health & Safety, FAQ, Emergency, Settings). Strong.
- **Planned:** Add or clarify one or two links (e.g. from home “Learn more” to FAQ; from Health to Emergency) if not already present.

---

## 5. Implementation batches

| Batch | What | Files |
|-------|------|--------|
| 1 | PageSEO: add og:site_name. NotFound: omit canonical on 404. | PageSEO.tsx, NotFound.tsx |
| 2 | AEO: direct-answer summary on Index. FAQ page: inject FAQPage JSON-LD. | Index.tsx, FAQ.tsx |
| 3 | Reusable JSON-LD helper + Recipe schema on RecipeDetail. | jsonld.ts (new), RecipeDetail.tsx |
| 4 | Internal link: Index → FAQ “Learn more”; Health → Emergency CTA if missing. | Index.tsx, Health.tsx |

---

## 6. Schema overview (after implementation)

| Page | Schema |
|------|--------|
| Index | WebApplication, FAQPage (in index.html) |
| FAQ | FAQPage (from page data via `buildFAQPageSchema`) |
| Health | Article |
| HealthSafety | (optional Article later) |
| CultureCountry | WebPage + Article |
| GuidePage | HowTo |
| RecipeDetail | Recipe (via `buildRecipeSchema`) |
| 404 | No schema; noindex |

---

## 7. Implementation batch summaries

**Batch 1 – On-page foundations**
- **PageSEO:** Added `og:site_name` so all SPA-rendered pages send consistent site name for shares.
- **NotFound:** Removed `path` so canonical is not set on 404 (avoids canonicalizing error URLs). Kept `robots="noindex, nofollow"`.
- **Why:** Cleaner share previews and correct canonical behavior on 404 for crawlers and AEO.

**Batch 2 – AEO direct answer + FAQ schema**
- **HeroSection:** Added a 2–3 sentence direct answer (“TryRamadan is a free app…”) and an internal link to the FAQ (“Learn more in our FAQ”).
- **FAQ page:** Injected JSON-LD `FAQPage` built from the page’s `faqs` array (via `buildFAQPageSchema` in `src/lib/jsonld.ts`).
- **Why:** Answer engines and LLMs get a concise summary and a full, structured FAQ set for extraction and citations.

**Batch 3 – Reusable JSON-LD + Recipe schema**
- **`src/lib/jsonld.ts`:** Added `buildFAQPageSchema()` and `buildRecipeSchema()` for reuse across pages.
- **RecipeDetail:** Injected Recipe JSON-LD (name, description, url, recipeCategory, recipeCuisine, nutrition when available).
- **Why:** Consistent, valid schema and better discovery of recipe content for search and AEO.

**Batch 4 – Internal linking**
- **HeroSection:** Link to `/faq` in the AEO summary (“Learn more in our FAQ”).
- **Health:** Already links to `/emergency` in “When to break fast”; no change.
- **Why:** Stronger internal links to key utility pages (FAQ, Emergency) from high-traffic entry points.
