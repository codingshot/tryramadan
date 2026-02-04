# Third-Party Risk Review

Review of third-party libraries and external APIs that run client-side: data shared, compromise impact, and mitigations.

---

## 1. Inventory

### 1.1 External APIs (network requests)

| Service | Domain | When used | Data sent |
|---------|--------|-----------|-----------|
| **Aladhan** | api.aladhan.com | Prayer times (lat, lng, date) | `latitude`, `longitude`, `date` (DD-MM-YYYY), `method=2` |
| **Nominatim** | nominatim.openstreetmap.org | Location search, reverse geocode | Search: `q` (user query), `Accept-Language: en`, `User-Agent: TryRamadan.app`; Reverse: `lat`, `lon`, `User-Agent` |
| **ipapi.co** | ipapi.co | IP-based fallback location | None (IP inferred by server) |
| **TimeAPI** | timeapi.io | Timezone from coords | `latitude`, `longitude` in URL |
| **Quran.com API** | api.quran.com | Juz verses | `juzNumber`, `translations`, `language`, `per_page`, `page`, `fields` in URL |
| **Aladhan CDN** | cdn.aladhan.com | Adhan audio | None (static `/audio/abdul-basit/1.mp3`) |

### 1.2 External resources (HTML / load-time)

| Resource | Domain | When | Data exposed |
|----------|--------|------|--------------|
| **Google Fonts (CSS)** | fonts.googleapis.com | Every page load | URL (font family names), `User-Agent`, `Accept-Language`, `Referer` |
| **Google Fonts (font files)** | fonts.gstatic.com | After CSS load | Same + font URL |

### 1.3 Third-party npm libraries (bundled)

All run as part of the app bundle; no runtime CDN scripts.

| Category | Packages | Runtime behavior |
|----------|----------|------------------|
| **UI primitives** | @radix-ui/* (20+), shadcn patterns | Render DOM, handle events; no network by default |
| **State / data** | @tanstack/react-query | Can fetch; uses our fetch/API_CONFIG |
| **Forms** | react-hook-form, @hookform/resolvers, zod | Form state only; no external calls |
| **Routing** | react-router-dom | Client-side routing; no external calls |
| **Animation** | framer-motion | DOM manipulation; no network |
| **Charts** | recharts | Renders SVG; no network |
| **Icons** | lucide-react | Inline SVG; no network |
| **Theme** | next-themes | localStorage + DOM; no network |
| **PWA** | vite-plugin-pwa | Generates SW; Workbox caches APIs (see service worker doc) |
| **Utilities** | date-fns, clsx, tailwind-merge, class-variance-authority, vaul, cmdk, sonner, etc. | Pure logic or DOM; no network |

### 1.4 External links (user-initiated)

| Link | Use | Risk |
|------|-----|------|
| quran.com, sunnah.com | User clicks to read content | No embedded script; user navigates away |
| Google Maps, Apple Maps | Culture page mosque links | Same |
| schema.org | JSON-LD context URL | Metadata only; no script load |

### 1.5 Analytics

- **reportWebVitals.ts:** No-op by default. Comment references gtag/Vercel Analytics but none are loaded.
- **Current state:** No analytics scripts; no third-party tracking.

---

## 2. Data received by each third party

| Third party | Data received | Sensitivity |
|-------------|---------------|-------------|
| **Aladhan** | Coordinates (lat, lng), date | Location (approximate) |
| **Nominatim** | Search query (city name) or lat/lng | Location, search intent |
| **ipapi.co** | User IP (implicit) | High (IP = approximate location + identity) |
| **TimeAPI** | Lat, lng | Location |
| **Quran.com API** | Juz number, language, page | Low (no PII) |
| **Aladhan CDN** | None (static asset) | None |
| **Google Fonts** | URL, User-Agent, Referer, Accept-Language | Browsing context |

---

## 3. Compromise impact

### 3.1 Supply-chain (malicious npm package)

| Scenario | Impact |
|----------|--------|
| **Compromised dependency** (e.g. radix, react-query) | Attacker code runs in app context: full access to DOM, localStorage, fetch. Can exfiltrate journal, fasting log, preferences, location. Can modify UI, inject phishing. |
| **Typosquat / dependency confusion** | Same as above if malicious package is installed. |

### 3.2 Malicious API response

| API | If compromised / MITM |
|-----|------------------------|
| **Aladhan** | Wrong prayer times (confusion, missed suhoor/iftar); possible XSS if response is rendered unsafely (currently JSON parsed, not injected into HTML). |
| **Nominatim** | Wrong location names; possible XSS if response displayed without sanitization. |
| **ipapi.co** | Wrong location; IP already shared, server could log/track. |
| **TimeAPI** | Wrong timezone (scheduling errors). |
| **Quran.com API** | Wrong verses; possible XSS if verse text rendered with dangerouslySetInnerHTML. |
| **cdn.aladhan.com** | Malicious audio (unlikely); or 404/redirect. |
| **Google Fonts** | Malicious CSS/JS (if loaded as script) or tracking; fonts are loaded as stylesheet/font, lower risk. |

### 3.3 Malicious script (Google Fonts)

- Google Fonts CSS is loaded via `<link rel="stylesheet">`. CSS can request resources (fonts) but cannot execute arbitrary JS in the same way as `<script>`.
- Risk: Google (or attacker via Google) could serve CSS that loads tracking pixels or fetches unexpected URLs. Font URLs could change to track users.
- Mitigation: Self-host fonts to eliminate this vector.

---

## 4. Proposed mitigations

### 4.1 Version pinning (npm)

| Current | Recommendation |
|---------|----------------|
| Caret ranges (`^1.2.3`) | Use exact versions or lockfile. `package-lock.json` / `bun.lockb` already pins. Ensure lockfile is committed and CI uses it. |
| | Add `npm audit` or `bun audit` to CI. |
| | Consider `overrides` / `resolutions` to force transitive deps to patched versions. |

### 4.2 Subresource Integrity (SRI)

| Resource | Feasibility | Recommendation |
|----------|-------------|----------------|
| **Google Fonts CSS** | Yes | Add `integrity` and `crossorigin` to font `<link>`. Hashes change when font CSS is updated; requires maintenance or automation. |
| **Google Font files** | Possible | Font URLs are in CSS; SRI would need to be applied when we control the CSS (e.g. self-hosted). |
| **Aladhan/Nominatim/APIs** | No | API responses are dynamic; SRI applies to static assets. |
| **Bundled JS** | N/A | Same-origin; Vite bundles. |

### 4.3 Content Security Policy (CSP)

| Directive | Recommendation |
|-----------|----------------|
| **default-src** | `'self'` |
| **script-src** | `'self'` (no `'unsafe-inline'` if possible; Vite can use nonces/hashes) |
| **style-src** | `'self' https://fonts.googleapis.com` |
| **font-src** | `'self' https://fonts.gstatic.com` |
| **connect-src** | `'self' https://api.aladhan.com https://nominatim.openstreetmap.org https://ipapi.co https://timeapi.io https://api.quran.com https://cdn.aladhan.com` |
| **img-src** | `'self' data: blob:` |
| **media-src** | `'self' https://cdn.aladhan.com` |

This restricts which origins can be contacted. Add to `vercel.json` headers or meta tag.

### 4.4 Minimal scopes

| API | Current | Recommendation |
|-----|---------|----------------|
| **Nominatim** | User-Agent: TryRamadan.app | Keep; required by ToS. Add `Accept-Language: en` only if needed. |
| **Aladhan** | No custom headers | Add `User-Agent: TryRamadan.app` for abuse contact if needed. |
| **ipapi.co** | No params | Consider: use only as fallback; document that IP is shared. |
| **TimeAPI** | Lat/lng in URL | Minimal; no way to reduce further. |

### 4.5 Self-host fonts

- **Current:** Google Fonts (fonts.googleapis.com, fonts.gstatic.com)
- **Recommendation:** Download font files (Playfair Display, Inter, Amiri), serve from `/fonts/`, update `index.html` and CSS. Eliminates Google as a third party for fonts.

### 4.6 Documentation of data shared

Maintain a short "Data we share" section (e.g. in Privacy page or docs):

| Service | Purpose | Data shared |
|---------|---------|-------------|
| Aladhan | Prayer times | Approximate location (coordinates), date |
| Nominatim (OpenStreetMap) | Location search & reverse geocoding | Search query or coordinates, User-Agent |
| ipapi.co | Fallback location when GPS unavailable | Your IP address |
| TimeAPI | Timezone from coordinates | Coordinates |
| Quran.com API | Quran verses | Juz number, language preference |
| Aladhan CDN | Adhan (call to prayer) audio | None (static file) |
| Google Fonts | Typography | Page URL, browser type, language (if used) |

---

## 5. Summary table

| Third party | Type | Data sent | Compromise impact | Mitigation |
|-------------|------|-----------|-------------------|------------|
| **Aladhan** | API | lat, lng, date | Wrong times; possible XSS if response mishandled | CSP connect-src; validate/sanitize responses |
| **Nominatim** | API | query or lat/lng | Wrong location; XSS risk | CSP; sanitize displayed strings |
| **ipapi.co** | API | IP (implicit) | Location/tracking | Document; use only as fallback |
| **TimeAPI** | API | lat, lng | Wrong timezone | CSP |
| **Quran.com API** | API | juz, language, page | Wrong content; XSS risk | CSP; avoid dangerouslySetInnerHTML for verse text |
| **cdn.aladhan.com** | Static | None | Malicious audio (low) | CSP media-src |
| **Google Fonts** | External CSS/fonts | URL, UA, Referer | Tracking; malicious CSS/font | Self-host fonts; or SRI + CSP |
| **npm deps** | Bundled | — | Full app compromise if malicious | Lockfile; audit; minimal deps |
| **Analytics** | — | None currently | — | Document before adding |

---

## 6. Implementation checklist

1. [x] Add CSP headers to `vercel.json` with restricted `connect-src`, `style-src`, `font-src`. (Done: enforcing CSP in vercel.json.)
2. [ ] Pin npm versions; run `npm audit` / `bun audit` in CI.
3. [ ] Document "Data we share" in Privacy page. (Privacy states data stays on device; no server sharing.)
4. [ ] (Optional) Self-host Google Fonts to remove that third party.
5. [ ] (Optional) Add SRI to font `<link>` if continuing to use Google Fonts.
6. [ ] Ensure no API response is rendered with `dangerouslySetInnerHTML` without sanitization. (Audit: JSON-LD and controlled data only.)
7. [ ] Before adding analytics, document in Privacy and restrict to minimal scope.
