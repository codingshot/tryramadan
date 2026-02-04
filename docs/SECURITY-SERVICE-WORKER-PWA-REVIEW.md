# Service Worker & PWA Configuration Security Review

> **Implementation status:** Done. `cleanupOutdatedCaches: true`. API `cacheableResponse` statuses: [200] only. HSTS. Aladhan API uses NetworkFirst with networkTimeoutSeconds 10; other APIs remain CacheFirst.

Examination of how the service worker caches HTML, JS, CSS, API responses, and static assets; identification of risks; and proposed changes to reduce risk while preserving offline functionality.

---

## 1. Current configuration summary

### 1.1 What gets cached

| Resource type | Mechanism | Handler | TTL / limits |
|---------------|-----------|---------|--------------|
| **App shell (HTML, JS, CSS)** | Precache (Workbox generateSW) | StaleWhileRevalidate (default) | Until SW update |
| **Static assets** | Precache via `globPatterns` | Same | Until SW update |
| **includeAssets** | favicon, og-image, hero-bg | Precached | Until SW update |
| **Aladhan API** | Runtime cache | CacheFirst | 24h, 10 entries |
| **Google Fonts** | Runtime cache | CacheFirst | 1 year, 10 entries |
| **fonts.gstatic.com** | Runtime cache | CacheFirst | 1 year, 10 entries |
| **Nominatim** | Runtime cache | CacheFirst | 24h, 30 entries |
| **ipapi.co** | Runtime cache | CacheFirst | 24h, 5 entries |
| **timeapi.io** | Runtime cache | CacheFirst | 7 days, 20 entries |
| **api.quran.com, cdn.aladhan.com** | Not in runtimeCaching | Network only | — |

### 1.2 Registration

- **registerType:** `"autoUpdate"` — new SW activates immediately when ready; no user prompt.
- **Scope:** `/` (default)
- **Build:** `vite-plugin-pwa` generates `sw.js` + `workbox-*.js` at build time; injected into `index.html` via plugin.

---

## 2. Risk identification

### 2.1 Stale or poisoned cached responses

| Risk | Description | Severity |
|------|-------------|----------|
| **CacheFirst for APIs** | Aladhan, Nominatim, ipapi, timeapi use CacheFirst. A poisoned or malicious response (e.g. MITM at first request) is served indefinitely until TTL or cache eviction. | **High** |
| **statuses: [0, 200]** | Aladhan, Nominatim, ipapi, timeapi allow `statuses: [0, 200]`. Status 0 can indicate CORS failure, network error, or opaque responses. Caching opaque responses can persist bad data. | **Medium** |
| **Precache never expires** | Precached HTML/JS/CSS are tied to SW version. If SW update fails or is delayed, users may run old app shell for a long time. | **Medium** |
| **Font cache 1 year** | Google Fonts cached 1 year. Compromised CDN response would persist. | **Low–Medium** |

### 2.2 Over-broad caching of third-party content

| Risk | Description | Severity |
|------|-------------|----------|
| **fonts.googleapis.com regex** | `^https:\/\/fonts\.googleapis\.com\/.*` matches any path. A typo or malicious subdomain (e.g. fonts.googleapis.com.evil.com) wouldn’t match, but the pattern is broad for the real domain. | **Low** |
| **fonts.gstatic.com** | Same — matches all gstatic font URLs. | **Low** |
| **No allowlist for API paths** | Aladhan pattern `^https:\/\/api\.aladhan\.com\/.*` caches any path. Unused or deprecated endpoints could be cached. | **Low** |

### 2.3 Lack of integrity checks

| Risk | Description | Severity |
|------|-------------|----------|
| **No SRI on service worker** | SW is loaded by browser; there is no standard SRI for SW. Update integrity is enforced by browser’s byte-for-byte diff, but a compromised deploy could push a malicious SW. | **Medium** |
| **No SRI on precached assets** | Precached JS/CSS are not loaded with SRI. If CDN or server is compromised, malicious JS could be cached. | **Medium** (for assets served from CDN — TryRamadan serves from same origin) |
| **No integrity on API responses** | Cached API responses have no hash or signature. Tampered response is stored as-is. | **Medium** |
| **autoUpdate without user confirmation** | New SW takes over immediately. A malicious or buggy deploy affects all users on next visit without explicit opt-in. | **Low–Medium** |

### 2.4 Other risks

| Risk | Description | Severity |
|------|-------------|----------|
| **HTTPS** | Service workers require a secure context (HTTPS or localhost). Vercel provides HTTPS; ensure no downgrade. | **Mitigated** (Vercel default) |
| **Scope** | Scope `/` allows SW to control all routes. Appropriate for SPA; no over-broad scope. | **OK** |
| **Unbounded cache growth** | maxEntries limits (10, 20, 30) prevent unbounded growth. | **OK** |

---

## 3. Proposed changes

### 3.1 Caching strategy changes

| Change | Current | Proposed | Rationale |
|--------|---------|----------|-----------|
| **Aladhan, Nominatim, ipapi, timeapi** | CacheFirst | **NetworkFirst** (networkTimeoutSeconds: 5–10, fallback to cache) | Reduces impact of poisoned cache; fresh data when online; cache only for offline fallback |
| **API cacheableResponse** | statuses: [0, 200] | **statuses: [200]** only | Avoid caching opaque/error responses |
| **Fonts** | CacheFirst, 1 year | **StaleWhileRevalidate** or **CacheFirst** with shorter TTL (e.g. 7–30 days) | Reduces risk of long-lived compromised font response |
| **Precache** | Default (SW versioned) | Keep; ensure **cache version** changes on every deploy | Workbox includes revision hashes in precache manifest; new deploy = new SW = new precache |

### 3.2 Cache versioning

- Workbox generateSW produces a precache manifest with content hashes. Each deploy gets a new SW file and new precache entries.
- **Recommendation:** Ensure `generateSW` uses a deterministic cache ID (default is build time). Optionally set `workbox.cleanupOutdatedCaches: true` so old caches are removed after SW update.
- Add to `vite.config.ts`:

  ```ts
  workbox: {
    cleanupOutdatedCaches: true,
    // ...
  }
  ```

### 3.3 Registration logic

| Change | Current | Proposed | Rationale |
|--------|---------|----------|-----------|
| **registerType** | autoUpdate | Keep **autoUpdate** for UX, or consider **prompt** for critical deployments | `prompt` would require user to accept update; adds friction. For most deployments, autoUpdate is acceptable. Optional: add `onNeedRefresh` / `onOfflineReady` callbacks to notify user when update is available |
| **Update check interval** | Browser default | vite-plugin-pwa default | No change needed |
| **Skip waiting** | Default (immediate) | Same | Ensures new SW activates quickly |

### 3.4 HTTPS and security headers

- **HTTPS:** Vercel serves over HTTPS. Ensure `vercel.json` does not override. Add **Strict-Transport-Security (HSTS)** if not already set:
  ```json
  { "key": "Strict-Transport-Security", "value": "max-age=31536000; includeSubDomains; preload" }
  ```

### 3.5 SRI (where applicable)

| Resource | SRI feasible? | Recommendation |
|----------|---------------|----------------|
| **Service worker** | No standard SRI for SW | Rely on HTTPS + deploy integrity |
| **Precached JS/CSS** | Possible but complex | Same-origin assets: lower priority. If assets move to CDN, add SRI at build time |
| **External fonts** | URLs change often | Prefer **self-hosting fonts** to avoid CDN risk; or accept risk with StaleWhileRevalidate |
| **index.html** | Could add SRI for inline scripts | Low gain for same-origin; focus on CSP instead |

### 3.6 Monitoring

- **Unexpected SW changes:** Monitor SW file hash or size in CI. Alert if `dist/sw.js` changes in unexpected ways (e.g. large size delta).
- **Cache health:** No built-in metric. Optional: log cache hits/misses in SW (dev only) or use Workbox debug mode in dev.
- **Deploy verification:** After deploy, hit `/sw.js` and verify it returns 200 and expected content-type. Script in CI: `curl -sI https://tryramadan.app/sw.js | grep -E '^HTTP|content-type'`.

---

## 4. Recommended vite.config.ts changes

```ts
VitePWA({
  registerType: "autoUpdate",
  includeAssets: ["favicon.png", "favicon.ico", "og-image.jpg", "hero-bg.jpg"],
  manifest: { /* ... unchanged ... */ },
  workbox: {
    globPatterns: ["**/*.{js,css,html,ico,png,svg,jpg,jpeg,webp,woff,woff2}"],
    cleanupOutdatedCaches: true,  // NEW
    runtimeCaching: [
      {
        urlPattern: /^https:\/\/api\.aladhan\.com\/.*/i,
        handler: "NetworkFirst",  // CHANGED from CacheFirst
        options: {
          cacheName: "prayer-times-cache",
          networkTimeoutSeconds: 5,
          expiration: { maxEntries: 10, maxAgeSeconds: 60 * 60 * 24 },
          cacheableResponse: { statuses: [200] },  // CHANGED: remove 0
        },
      },
      {
        urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
        handler: "StaleWhileRevalidate",  // CHANGED from CacheFirst
        options: {
          cacheName: "google-fonts-cache",
          expiration: { maxEntries: 10, maxAgeSeconds: 60 * 60 * 24 * 30 },  // 30 days
        },
      },
      {
        urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
        handler: "StaleWhileRevalidate",  // CHANGED
        options: {
          cacheName: "gstatic-fonts-cache",
          expiration: { maxEntries: 10, maxAgeSeconds: 60 * 60 * 24 * 30 },
        },
      },
      {
        urlPattern: /^https:\/\/nominatim\.openstreetmap\.org\/.*/i,
        handler: "NetworkFirst",  // CHANGED
        options: {
          cacheName: "nominatim-cache",
          networkTimeoutSeconds: 5,
          expiration: { maxEntries: 30, maxAgeSeconds: 60 * 60 * 24 },
          cacheableResponse: { statuses: [200] },  // CHANGED
        },
      },
      {
        urlPattern: /^https:\/\/ipapi\.co\/.*/i,
        handler: "NetworkFirst",  // CHANGED
        options: {
          cacheName: "ipapi-cache",
          networkTimeoutSeconds: 5,
          expiration: { maxEntries: 5, maxAgeSeconds: 60 * 60 * 24 },
          cacheableResponse: { statuses: [200] },  // CHANGED
        },
      },
      {
        urlPattern: /^https:\/\/timeapi\.io\/.*/i,
        handler: "NetworkFirst",  // CHANGED
        options: {
          cacheName: "timeapi-cache",
          networkTimeoutSeconds: 5,
          expiration: { maxEntries: 20, maxAgeSeconds: 60 * 60 * 24 * 7 },
          cacheableResponse: { statuses: [200] },  // CHANGED
        },
      },
    ],
  },
})
```

---

## 5. vercel.json security headers

Add HSTS and ensure no conflicting headers:

```json
{
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        { "key": "X-Content-Type-Options", "value": "nosniff" },
        { "key": "X-Frame-Options", "value": "DENY" },
        { "key": "X-XSS-Protection", "value": "1; mode=block" },
        { "key": "Strict-Transport-Security", "value": "max-age=31536000; includeSubDomains; preload" }
      ]
    },
    ...
  ]
}
```

---

## 6. Summary

| Area | Risk | Mitigation |
|------|------|------------|
| **Stale/poisoned API cache** | High | Switch API runtime caches to NetworkFirst; cacheableResponse statuses: [200] only |
| **Over-broad caching** | Low | Current patterns are acceptable; optional: narrow URL patterns if needed |
| **No integrity checks** | Medium | cleanupOutdatedCaches; HTTPS; HSTS; optional SW hash monitoring in CI |
| **Font cache 1 year** | Low–Medium | StaleWhileRevalidate; reduce maxAge to 30 days |
| **HTTPS** | Mitigated | Vercel provides HTTPS; add HSTS header |
| **SRI** | Limited benefit | Same-origin assets; self-host fonts if CDN risk is a concern |

**Priority:** Implement NetworkFirst for APIs, statuses [200] only, cleanupOutdatedCaches, and HSTS. StaleWhileRevalidate for fonts is a secondary improvement.
