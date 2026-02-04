# Security Regression Checklist

> **Implementation status:** Done. ESLint rules, HSTS, SW cleanup in place. Run this checklist when shipping new features.

Run these checks when shipping new features. TryRamadan is a local-only PWA—no backend—so focus is on storage, XSS, service worker, third parties, exports, and UX expectations.

---

## Storage

- [ ] **Are we storing anything new in localStorage?** If yes: add the key to `TRYRAMADAN_LOCALSTORAGE_KEYS` in the delete-my-data flow and to `docs/DATA-LIFECYCLE-POLICIES.md`.
- [ ] **Is the new stored data sensitive?** (health, location, spirituality, personal prose). If yes: document in `docs/SECURITY-LOCALSTORAGE-AUDIT.md`; consider UX warning or optional encryption for highly sensitive fields.
- [ ] **Do we need to purge it in "Delete all data"?** All `tryramadan-*` keys and service worker caches must be cleared.

---

## XSS

- [ ] **Did we add any new user input that gets rendered as HTML?** (journal, notes, goals, event titles, meal names, etc.) If yes: render via React children `{value}` only—never `dangerouslySetInnerHTML` with user or API content.
- [ ] **Did we add `dangerouslySetInnerHTML` anywhere?** Only allow for trusted, build-time or `JSON.stringify`-based content (e.g. JSON-LD). Never with user input or API responses.
- [ ] **Did we add any URL/hash/query parsing that ends up in the DOM?** Check for DOM-XSS (e.g. `location.hash`, `location.search`) and ensure values are not injected as HTML.

---

## PWA / Service worker

- [ ] **Did we add new runtime caching rules or domains?** Update `vite.config.ts` workbox config; consider NetworkFirst (not CacheFirst) for API responses. Document in `docs/SECURITY-SERVICE-WORKER-PWA-REVIEW.md`.
- [ ] **Do new caches need to be cleared in "Delete all data"?** The purge flow deletes all Cache Storage entries; verify no TryRamadan data survives in other caches.

---

## Third-party

- [ ] **Did we add new third-party scripts or APIs?** (analytics, CDNs, fonts, APIs) If yes: add to `connect-src` / `style-src` / `font-src` in CSP; document in `docs/SECURITY-THIRD-PARTY-RISK.md`. Pin dependency versions; run `npm audit` or `bun audit`.
- [ ] **Do new API responses get rendered in the DOM?** Validate and sanitize before render; never trust API JSON as HTML.

---

## Exports

- [ ] **Did we add new export formats (CSV, JSON, ICS)?** Ensure exported data is escaped/sanitized. Avoid injecting user content into file names or headers without sanitization.
- [ ] **Does "Delete all data" still clear everything we export?** All exported fields must come from storage that is purged.

---

## UX expectations

- [ ] **Are we implying "secure" or "encrypted" storage?** Do not. Use "local storage," "device storage," "anyone with device access can read it." See `docs/SECURITY-PHYSICAL-ACCESS-AND-LIMITATIONS.md`.
- [ ] **Did we add features that store highly sensitive data?** Consider optional passphrase encryption or a prominent UX warning. Ensure "Delete all data" and "Data & privacy" copy remain accurate.
