# Content Security Policy and Client-Side Hardening

> **Implementation status:** Done. CSP **enforcing** in vercel.json (`Content-Security-Policy`: default-src 'self'; script-src 'self'; style-src, font-src, img-src, connect-src, frame-ancestors, base-uri, form-action). JSON-LD injected via React (`src/lib/jsonld.ts`, `main.tsx`); no inline script. Font loading in main.tsx; ESLint rules; HSTS.

Proposed CSP, safe asset-loading patterns, and additional hardening measures for TryRamadan.app.

---

## 1. CSP Proposal

### 1.1 Goals

- Block inline script injection (XSS).
- Restrict script, style, and connect sources to required domains only.
- Allow JSON-LD and fonts without `'unsafe-inline'` or `'unsafe-eval'`.

### 1.2 Current constraints

| Resource | Current usage | CSP consideration |
|----------|---------------|-------------------|
| **Scripts** | `index.html`: 2 inline JSON-LD blocks, 1 `<script src="/src/main.tsx">` (Vite outputs `src=/assets/...`) | Inline JSON-LD needs hashes or relocation |
| **Fonts** | `<link rel="preload" ... onload="this.onload=null;this.rel='stylesheet'">` | `onload` is an inline event handler; CSP blocks it |
| **APIs** | Aladhan, Nominatim, ipapi, TimeAPI, Quran.com, cdn.aladhan.com | Must be in `connect-src` |
| **Styles** | Bundled CSS + Google Fonts | `style-src` for self + fonts.googleapis.com |
| **Images** | Same-origin (`/hero-bg.jpg`, etc.) + `data:` for SVG patterns | `img-src 'self' data:` |
| **Media** | cdn.aladhan.com (adhan audio) | `media-src` |

### 1.3 Proposed CSP (report-only first, then enforce)

```
default-src 'self';
script-src 'self' 'sha256-<HASH1>' 'sha256-<HASH2>';
style-src 'self' https://fonts.googleapis.com;
font-src 'self' https://fonts.gstatic.com;
img-src 'self' data: blob:;
media-src 'self' https://cdn.aladhan.com;
connect-src 'self' https://api.aladhan.com https://nominatim.openstreetmap.org https://ipapi.co https://timeapi.io https://api.quran.com https://cdn.aladhan.com;
frame-ancestors 'none';
base-uri 'self';
form-action 'self';
upgrade-insecure-requests;  # optional: force HTTPS for any http: URLs
```

**Hashes:** Replace `<HASH1>` and `<HASH2>` with SHA-256 of the exact JSON-LD script contents (including whitespace). Compute via:

```sh
echo -n '<exact script content>' | openssl dgst -sha256 -binary | openssl base64 -A
```

Or use a build step to generate them. If JSON-LD is moved to React (see §2.2), hashes can be removed and `script-src` becomes `'self'` only.

### 1.4 Font loading without inline handlers

The current font link uses `onload="this.onload=null;this.rel='stylesheet'"`, which is an inline event handler blocked by CSP.

**Option A — Move font loading to main bundle (recommended):**

1. Remove the `onload` attribute from `index.html`.
2. In `main.tsx` (or a small init module), add:

```ts
// Load fonts non-blocking (CSP-safe: no inline handlers)
const link = document.createElement('link');
link.rel = 'stylesheet';
link.href = 'https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;600;700&family=Inter:wght@300;400;500;600;700&family=Amiri:wght@400;700&display=swap';
document.head.appendChild(link);
```

3. Keep `preconnect` in HTML for early connection; remove the `preload` + `onload` link.
4. `noscript` fallback can remain for users without JS.

**Option B — Self-host fonts:**

Serve font files from `/fonts/`; no external `style-src` or `font-src` needed. See §2.1.

### 1.5 JSON-LD under CSP

**Option A — Use hashes (keep JSON-LD in HTML):**

1. Compute SHA-256 of each JSON-LD block (exact bytes, no trailing newline).
2. Add to `script-src`: `'sha256-<base64>'`.
3. No `'unsafe-inline'` required.

**Option B — Move JSON-LD to React (eliminate inline scripts):**

1. Remove both `<script type="application/ld+json">` blocks from `index.html`.
2. Add a `JsonLd` component that renders `application/ld+json` for the home/FAQ schema.
3. With only `<script src="/assets/...">` in HTML, `script-src 'self'` suffices (no hashes).
4. Slight delay before schema is in DOM until React mounts; usually acceptable for crawlers.

---

## 2. Safe patterns for fonts, icons, and assets

### 2.1 Fonts

| Pattern | CSP impact | Recommendation |
|---------|------------|----------------|
| **External stylesheet with `onload`** | Blocks (inline handler) | Avoid |
| **External stylesheet (sync)** | OK; render-blocking | Use only if acceptable for LCP |
| **JS-injected `<link rel="stylesheet">`** | OK; script from `src=` creates element | **Recommended** for Google Fonts |
| **Self-hosted fonts** | OK; `font-src 'self'` | Best for CSP and privacy |

**Self-hosting steps (optional):**

1. Download woff2 files (Playfair Display, Inter, Amiri) from Google Fonts or fonts.google.com.
2. Place in `public/fonts/`.
3. Add `@font-face` in `index.css` or a font CSS file.
4. Remove Google Fonts links; set `style-src 'self'`, `font-src 'self'`.

### 2.2 Icons

- **lucide-react:** Inline SVG components; no external requests. No CSP changes.
- **Favicon, PWA icons:** Served from `'self'`. No changes.

### 2.3 External assets

| Asset | Source | CSP |
|-------|--------|-----|
| Hero image, og-image, favicon | `'self'` | `img-src 'self'` |
| Adhan audio | cdn.aladhan.com | `media-src 'self' https://cdn.aladhan.com` |
| SVG patterns (data URL) | `data:` | `img-src 'self' data:` |
| Recipe/guide images | Bundled or `/public` | `img-src 'self'` |

### 2.4 Connect (fetch / XHR)

Restrict to known APIs only:

```
connect-src 'self' https://api.aladhan.com https://nominatim.openstreetmap.org https://ipapi.co https://timeapi.io https://api.quran.com https://cdn.aladhan.com;
```

Avoid `'*'` or broad wildcards. Add new domains only when required.

---

## 3. Additional client-side hardening

### 3.1 Avoid eval and Function(string)

**Current state:** No `eval`, `new Function`, or string-based `setTimeout`/`setInterval` in `src/`.

**Recommendations:**

- Add ESLint rules to block these.
- Avoid `JSON.parse` on untrusted input without validation (e.g. API responses); validate shape before use.
- Do not use `dangerouslySetInnerHTML` with user-controlled or API-sourced HTML; prefer `JSON.stringify` for JSON-LD (already used) and React children for text.

### 3.2 Strict mode and TypeScript

**Current tsconfig:** `strictNullChecks: false`, `noImplicitAny: false`.

**Recommendations:**

- Enable `strict: true` (or at minimum `strictNullChecks: true`, `noImplicitAny: true`) in `tsconfig.json` for safer types.
- Add `"use strict";` at top of entry if not already implied by bundler (Vite/ESM usually implies strict).

### 3.3 ESLint rules against dangerous APIs

Add to `eslint.config.js`:

```js
rules: {
  // ... existing
  "no-eval": "error",
  "no-implied-eval": "error",
  "no-new-func": "error",
  "no-script-url": "error",
  "no-useless-call": "warn",
}
```

**Optional — restrict dangerouslySetInnerHTML:**

```bash
npm install eslint-plugin-react --save-dev
```

```js
// In ESLint config
"react/no-danger": "warn",
```

Then review each `dangerouslySetInnerHTML` usage; ensure the value is always from `JSON.stringify` of controlled data, never raw user/API HTML. Consider a custom rule or convention (e.g. only allow in a `SafeJsonLd` component).

### 3.4 Summary of hardening checklist

| Measure | Status | Action |
|---------|--------|--------|
| No eval/Function | ✅ Clean | Add ESLint rules to enforce |
| Strict TypeScript | ⚠️ Partial | Enable strictNullChecks, noImplicitAny |
| CSP | ✅ Implemented | Enforcing header in vercel.json; script-src 'self'; JSON-LD injected via React. |
| Lint dangerous APIs | ❌ | Add no-eval, no-new-func, react/no-danger |
| Font loading | ⚠️ Uses onload | Move to JS or self-host |
| JSON-LD | ⚠️ Inline scripts | Use hashes or move to React |

---

## 4. Implementation: vercel.json CSP header

Add a CSP header (start with `Content-Security-Policy-Report-Only` to validate before enforcing):

```json
{
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        { "key": "X-Content-Type-Options", "value": "nosniff" },
        { "key": "X-Frame-Options", "value": "DENY" },
        { "key": "X-XSS-Protection", "value": "1; mode=block" },
        {
          "key": "Content-Security-Policy-Report-Only",
          "value": "default-src 'self'; script-src 'self'; style-src 'self' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: blob:; media-src 'self' https://cdn.aladhan.com; connect-src 'self' https://api.aladhan.com https://nominatim.openstreetmap.org https://ipapi.co https://timeapi.io https://api.quran.com https://cdn.aladhan.com; frame-ancestors 'none'; base-uri 'self'; form-action 'self';"
        }
      ]
    }
  ]
}
```

**Note:** This uses `script-src 'self'` only. If JSON-LD remains inline in HTML, add the `'sha256-...'` hashes or switch to Report-Only and fix violations before enforcing. After font loading is moved to JS, the `onload` handler violation will disappear.

---

## 5. Rollout order

1. Move font loading to main bundle (remove inline `onload`).
2. Move JSON-LD to React, or compute hashes for inline blocks.
3. Add ESLint rules (no-eval, no-new-func, react/no-danger).
4. Deploy CSP as Report-Only; fix any reported violations.
5. Switch to enforcing CSP (`Content-Security-Policy`).
6. (Optional) Enable stricter TypeScript and self-host fonts.
