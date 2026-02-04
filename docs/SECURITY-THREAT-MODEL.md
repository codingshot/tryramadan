# TryRamadan.app Threat Model

Client-only PWA storing all data in localStorage and caches. No backend; no server-side authentication. This document lists realistic threat scenarios, data at risk, impact severity, and prioritized mitigations that work without a backend.

**Scope:** Front-end security hardening only (CSP, input handling, dependencies, service worker).

---

## 1. Data inventory (what’s stored)

| Storage | Keys / content | Sensitivity |
|---------|----------------|-------------|
| **localStorage** | `tryramadan-preferences` | Location, coords, timezone, userType, gender, menstruation data, notification settings, theme |
| | `tryramadan-progress` | Fasting history, completedDays, brokenDays, skippedDays, fastingLog (dates, status, reasons) |
| | `tryramadan-journal` | Journal entries (content, gratitude, mood, dates) |
| | `tryramadan-day-meal-plans`, `tryramadan-day-food-log` | Meal plans, food logs, macros |
| | `tryramadan-wellness-log`, `tryramadan-symptom-log` | Wellness check-ins, symptoms, severity |
| | `tryramadan-today` | Intention, hydration, energy entries |
| | `tryramadan-onboarding-draft` | Health screening answers, location, goals |
| | Prayer times cache, Ramadan prayers cache | API response cache |
| | Various (goals, quick actions, hadith/quran viewed dates, etc.) | Lower sensitivity |
| **Cache (Workbox)** | Aladhan API, fonts, Nominatim, ipapi, timeapi responses | Cached JSON/HTML |

---

## 2. Threat scenarios

### 2.1 Cross-Site Scripting (XSS)

| Scenario | Vector | Data at risk | Severity |
|----------|--------|--------------|----------|
| **Stored XSS via journal/content** | User enters `<script>...</script>` or `javascript:` in journal; app renders it unescaped | Journal, gratitude, notes; could steal all localStorage if script runs | **High** |
| **DOM XSS via URL/route** | Malicious link with payload in hash/query; app parses and injects | All localStorage | **High** |
| **Reflected XSS via API response** | Aladhan, Nominatim, etc. return malicious JSON; app parses and renders | All localStorage | **Medium** (trusted APIs, but not immutable) |

**Current state:** Journal content is rendered via React `{entry.content}` (auto-escaped). `dangerouslySetInnerHTML` is used only for JSON-LD and chart CSS—both use `JSON.stringify` or build-time data. **Risk is low today** but any future raw HTML rendering of user/content data would introduce XSS.

---

### 2.2 Malicious browser extensions

| Scenario | Mechanism | Data at risk | Severity |
|----------|-----------|--------------|----------|
| **Extension reads localStorage** | Extensions with `storage` or page access can read `window.localStorage` | **All** (preferences, journal, fasting, health, location) | **High** |
| **Extension injects scripts** | Content script or `document.write` can run in page context | Session hijack, keylog, exfiltrate data | **High** |
| **Extension modifies page** | Replace links, inject phishing forms | Credential theft, misdirection | **Medium** |

**Mitigation scope:** Cannot prevent extensions from reading same-origin storage. Can reduce impact by avoiding storage of highly sensitive data (no passwords; already the case) and by defending against script injection (CSP).

---

### 2.3 Compromised device

| Scenario | Mechanism | Data at risk | Severity |
|----------|-----------|--------------|----------|
| **Malware/rootkit** | Reads browser profile, localStorage files | **All** stored data | **High** |
| **Physical access** | Unlocked device; open app | **All** visible in app | **High** |
| **Shared device** | Another user uses same browser | **All** | **Medium** |

**Mitigation scope:** No front-end fix. Educate users: avoid shared/untrusted devices; lock device when not in use.

---

### 2.4 Supply-chain attacks (third-party scripts & dependencies)

| Scenario | Vector | Data at risk | Severity |
|----------|--------|--------------|----------|
| **Compromised npm package** | Malicious code in `react`, `radix`, `framer-motion`, etc. | All; can exfiltrate localStorage, inject keyloggers | **Critical** |
| **Compromised CDN** | Google Fonts, or any future CDN-hosted script, serves malicious CSS/JS | All | **High** |
| **Build-time compromise** | Vite plugin, lovable-tagger, or other build tool injects backdoor | All; persists in built bundle | **Critical** |

**Current state:** Fonts loaded from `fonts.googleapis.com` / `fonts.gstatic.com`. No runtime script loading from CDN. 40+ npm dependencies—each is a potential supply-chain vector.

---

### 2.5 Insecure service worker

| Scenario | Mechanism | Data at risk | Severity |
|----------|-----------|--------------|----------|
| **SW intercepts fetch, serves malicious response** | If SW is compromised (e.g. via cache poisoning), it can return malicious HTML/JS for app routes | All; could inject persistent malicious code | **High** |
| **SW caches poisoned response** | Malicious API response (man-in-the-middle or compromised API) cached; SW serves it offline | Prayer times, location data; possible XSS if response is rendered unsafely | **Medium** |
| **SW scope / update abuse** | Old SW with vulnerability keeps running; or update mechanism is abused | Depends on vulnerability | **Medium** |

**Current state:** Vite PWA + Workbox. `registerType: "autoUpdate"`—SW updates automatically. Cache stores API responses. No integrity checks on cached responses.

---

### 2.6 Man-in-the-middle (MITM)

| Scenario | Mechanism | Data at risk | Severity |
|----------|-----------|--------------|----------|
| **HTTPS downgrade** | Attacker on same network (e.g. public Wi‑Fi) performs SSL stripping | All fetch traffic; API responses could be replaced with malicious payloads | **High** (mitigated by HSTS) |
| **Compromised CA / proxy** | Enterprise proxy or compromised CA issues cert for tryramadan.app | Same as above | **Medium** (harder to achieve) |

**Mitigation:** Rely on HTTPS, HSTS (if configured by host). No backend—no credentials in transit from app to “our” server.

---

### 2.7 JSON / prototype pollution

| Scenario | Vector | Data at risk | Severity |
|----------|--------|--------------|----------|
| **Malicious JSON in localStorage** | User or extension writes `{"__proto__": {...}}` into a key; `JSON.parse` + merging could pollute prototypes | Logic bugs; possible RCE in rare cases | **Low–Medium** |
| **API response pollution** | Aladhan, etc. return `__proto__` or `constructor` in JSON | Same | **Low** |

**Current state:** `JSON.parse` used widely. No explicit prototype-pollution safeguards. Risk is lower because we don’t typically merge parsed API data onto existing objects recursively.

---

### 2.8 Insecure direct object reference (IDOR)

| Scenario | Mechanism | Data at risk | Severity |
|----------|-----------|--------------|----------|
| **N/A for client-only app** | All data is local; no server-side objects or IDs | — | **N/A** |

---

## 3. Data-by-threat matrix

| Data | XSS | Extensions | Compromised device | Supply chain | SW | MITM |
|------|-----|------------|--------------------|--------------|----|------|
| Journal entries | ✓ | ✓ | ✓ | ✓ | ✓ | — |
| Health / wellness / symptoms | ✓ | ✓ | ✓ | ✓ | ✓ | — |
| Fasting history | ✓ | ✓ | ✓ | ✓ | ✓ | — |
| Location / coords | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Notification settings | ✓ | ✓ | ✓ | ✓ | ✓ | — |
| Onboarding / health screening | ✓ | ✓ | ✓ | ✓ | ✓ | — |
| Cached API responses | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |

---

## 4. Prioritized mitigations (no backend)

### P0 — Critical

| # | Mitigation | Threat | Effort |
|---|------------|--------|--------|
| 1 | **Content Security Policy (CSP)** | XSS, injection, unauthorized script execution | Medium |
| 2 | **Avoid `dangerouslySetInnerHTML` for user/content data** | XSS via journal, notes, etc. | Low (already mostly done) |
| 3 | **Dependency hygiene** | Supply chain | Low–Medium |

### P1 — High

| # | Mitigation | Threat | Effort |
|---|------------|--------|--------|
| 4 | **Subresource Integrity (SRI) for external resources** | Compromised CDN (fonts, any future scripts) | Low |
| 5 | **Strict cache and scope for service worker** | SW abuse, cache poisoning | Medium |
| 6 | **Validate and sanitize JSON from APIs before use** | Malicious API response, prototype pollution | Medium |
| 7 | **Sanitize localStorage reads** | Corrupt/malicious data in storage (extension or bug) | Medium |

### P2 — Medium

| # | Mitigation | Threat | Effort |
|---|------------|--------|--------|
| 8 | **Review all `dangerouslySetInnerHTML` usage** | XSS via JSON-LD, chart CSS | Low |
| 9 | **Audit npm dependencies** | Supply chain | Low |
| 10 | **Consider read-only / integrity checks for SW cache** | Cache poisoning | Medium |

### P3 — Lower

| # | Mitigation | Threat | Effort |
|---|------------|--------|--------|
| 11 | **Prototype-pollution hardening** | JSON parse + merge bugs | Low |
| 12 | **Document user guidance** | Compromised device, extensions | Low |

---

## 5. Detailed mitigation recommendations

### 5.1 Content Security Policy (CSP)

Add CSP meta tag or header (prefer header if host supports it):

```
Content-Security-Policy:
  default-src 'self';
  script-src 'self';
  style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
  font-src 'self' https://fonts.gstatic.com;
  img-src 'self' data: https:;
  connect-src 'self' https://api.aladhan.com https://nominatim.openstreetmap.org https://ipapi.co https://timeapi.io https://api.quran.com https://cdn.aladhan.com;
  frame-ancestors 'none';
  base-uri 'self';
  form-action 'self';
```

- `'unsafe-inline'` for style may be needed for Tailwind/chart styles. Prefer nonce- or hash-based CSP if feasible.
- `connect-src` limits fetch to known API origins.
- `frame-ancestors 'none'` reduces clickjacking risk.

**Vite:** Use `vite-plugin-csp` or configure headers in preview/production server.

---

### 5.2 Input handling

| Location | Current | Recommendation |
|----------|---------|----------------|
| Journal `content`, `gratitude` | Rendered as `{entry.content}` (React escape) | Keep; never use `dangerouslySetInnerHTML` for user content |
| Schedule notes, meal plan text | Rendered as text | Same |
| API response rendering | Prayer times, location names, etc. as text | Ensure never rendered as HTML; trim/sanitize if displayed in attributes |
| JSON-LD `dangerouslySetInnerHTML` | `JSON.stringify(obj)` | Safe if `obj` has no user-controlled raw HTML; keep using `JSON.stringify` |

---

### 5.3 Dependencies

- Run `npm audit` regularly; fix high/critical issues.
- Prefer well-maintained packages; check downloads and maintenance.
- Pin versions in `package.json` (avoid `^`/`~` for critical deps if policy allows).
- Consider `pnpm` / `npm ci` and lockfiles for reproducible installs.

---

### 5.4 Service worker

- Use Workbox `CacheFirst` only for truly static assets (fonts, images).
- For API responses, prefer `NetworkFirst` or `StaleWhileRevalidate` so stale/poisoned cache is overwritten.
- Restrict `globPatterns` to app assets; avoid caching arbitrary URLs.
- Consider cache versioning so bad caches can be invalidated on deploy.

**Current `runtimeCaching`:** `CacheFirst` for Aladhan, fonts, Nominatim, ipapi, timeapi. For prayer times and geolocation, `NetworkFirst` with short fallback would reduce impact of cache poisoning.

---

### 5.5 Subresource Integrity (SRI)

For external scripts/stylesheets (e.g. fonts loaded as CSS that might pull in more resources):

- Prefer self-hosting fonts to avoid CDN risk, or
- Use SRI hashes if the font URLs are stable.

Google Fonts URLs change often; SRI is difficult. Self-hosting is the most robust option.

---

### 5.6 localStorage hardening

- Wrap `JSON.parse` in try/catch (already done in several places).
- Consider a safe parse helper that rejects keys like `__proto__`, `constructor`, `prototype` when merging.
- Validate shape of parsed data before use (e.g. ensure arrays are arrays, expected fields exist).

---

## 6. Summary

| Threat | Severity | Primary mitigation |
|--------|----------|--------------------|
| XSS | High | CSP; no raw HTML for user data |
| Malicious extensions | High | Cannot block; CSP limits injection impact |
| Compromised device | High | Out of scope; user guidance |
| Supply chain | Critical | Dependency hygiene; audit; pinning |
| Insecure SW | High | NetworkFirst for APIs; strict cache scope |
| MITM | Medium | HTTPS; HSTS |
| JSON / prototype pollution | Low | Safe parse; validation |

**Highest-impact, no-backend mitigations:** CSP, dependency auditing, service worker cache strategy, and strict rules for where user/content data may be rendered.
