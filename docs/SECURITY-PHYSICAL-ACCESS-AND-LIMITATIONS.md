# Physical Access & Local Storage Limitations

> **Implementation status:** Done. Panic clear (Clear all data) in Settings; `deleteAllUserData()` in `src/lib/dataLifecycle.ts`. Data & privacy copy in Settings. See DATA-LIFECYCLE-POLICIES.md.

"Malicious user" perspective: how an attacker with physical access to a device where TryRamadan.app is installed could exfiltrate stored data; what the app can realistically mitigate; and developer documentation to avoid misrepresenting storage as "secure."

---

## 1. Exfiltration methods (malicious user with physical access)

### 1.1 Browser DevTools

**Steps:**

1. Open TryRamadan.app in the browser (or PWA window).
2. Open DevTools (F12 / Cmd+Opt+I / right-click → Inspect).
3. Go to **Application** (Chrome) or **Storage** (Firefox).
4. Under **Local Storage**, select the origin (e.g. `https://tryramadan.app`).
5. All `tryramadan-*` keys and their values are visible and copyable.
6. Under **Cache Storage**, list caches; open each and inspect cached responses (API responses, fonts, app shell).
7. Under **Service Workers**, inspect registration; no additional data beyond caches.
8. Under **IndexedDB** (if used), browse databases and object stores.

**Time to exfiltrate:** Under a minute. No special tools.

**Data exposed:** Journal entries, fasting log, preferences (including location, gender, menstruation), wellness, symptoms, meal plans, API responses (prayer times with coords).

### 1.2 Console-based localStorage dump

**One-liner in DevTools console:**

```javascript
Object.keys(localStorage)
  .filter(k => k.startsWith('tryramadan'))
  .forEach(k => console.log(k, localStorage.getItem(k)));
```

**Export to file:**

```javascript
const dump = {};
Object.keys(localStorage)
  .filter(k => k.startsWith('tryramadan'))
  .forEach(k => { dump[k] = localStorage.getItem(k); });
console.log(JSON.stringify(dump, null, 2));
// Copy output or use copy(JSON.stringify(dump))
```

**Blob download:**

```javascript
const dump = Object.fromEntries(
  Object.entries(localStorage).filter(([k]) => k.startsWith('tryramadan'))
);
const blob = new Blob([JSON.stringify(dump, null, 2)], { type: 'application/json' });
const a = document.createElement('a');
a.href = URL.createObjectURL(blob);
a.download = 'tryramadan-dump.json';
a.click();
```

### 1.3 Service worker caches

**List and read cached responses:**

```javascript
caches.keys().then(async names => {
  for (const n of names) {
    const c = await caches.open(n);
    const reqs = await c.keys();
    for (const r of reqs) {
      const res = await c.match(r);
      const text = await res?.text();
      console.log(r.url, text?.slice(0, 200));
    }
  }
});
```

**Data exposed:** Cached Aladhan, Nominatim, ipapi, TimeAPI responses (location, prayer times); fonts; precached app shell.

### 1.4 PWA / browser profile data directories

| Platform | Typical path | Contents |
|----------|--------------|----------|
| **Chrome (Windows)** | `%LocalAppData%\Google\Chrome\User Data\Default\Local Storage` | SQLite/LevelDB for localStorage |
| **Chrome (macOS)** | `~/Library/Application Support/Google/Chrome/Default/Local Storage` | Same |
| **Chrome (Linux)** | `~/.config/google-chrome/Default/Local Storage` | Same |
| **Firefox** | `~/Library/Application Support/Firefox/Profiles/<id>/storage/default` | Same |
| **PWA (Chrome)** | Same profile; PWA uses same origin storage | Same localStorage, caches |
| **Android WebView / Chrome** | App data; requires root or backup extraction | Same |
| **iOS (Safari / PWA)** | App container; requires jailbreak or backup extraction | Same |

**Steps:** Copy the profile directory or use a backup extractor; parse LevelDB/SQLite to recover localStorage and Cache API data.

**Barrier:** File system access. On a shared PC, another user may not have access to the primary user's profile. On a single-user device, anyone with login access can reach it. Mobile backups (iTunes, Android backup) can be extracted to access app data.

### 1.5 Other vectors

- **Screenshots / shoulder surfing:** If the device is unlocked and the app is open, an attacker can capture sensitive screens.
- **Malicious browser extension:** Extensions with appropriate permissions can read localStorage and caches via `chrome.storage` or by injecting scripts.
- **Malware:** Keyloggers, clipboard stealers, or memory scrapers can capture data when the user interacts with the app.
- **Device backup:** Unencrypted backups may include browser/PWA storage; extracting the backup yields the same data.

---

## 2. What the app can realistically do (no backend)

### 2.1 Cannot prevent exfiltration

- **Physical access + unlocked device:** There is no client-side defense. The browser exposes localStorage and caches to any code (or user) that can run in the same origin.
- **Malicious extension / malware:** The app cannot detect or block extensions. CSP limits *script* sources but does not prevent extensions from reading storage.
- **Backup extraction:** The app cannot control how the OS or backup tools store and expose data.

### 2.2 Optional client-side encryption (user passphrase)

**Mechanism:**

- User sets a passphrase (e.g. in Settings).
- Derive an encryption key via PBKDF2 or Argon2 from the passphrase.
- Encrypt sensitive values (journal, wellness, symptoms, optionally preferences) with AES-GCM before writing to localStorage.
- Decrypt on load; keep key in memory only during session.

**What it helps:**

- Exfiltrated data (localStorage dump, cache copy, profile copy) is ciphertext. Without the passphrase, content is unreadable.
- Protects against casual inspection (DevTools shows encrypted blobs) and offline backup extraction.

**What it does NOT help:**

- Device unlocked + app open: decrypted data is in memory; advanced attackers could extract it.
- Keylogger: passphrase can be captured when entered.
- No recovery if user forgets passphrase — data is effectively lost.

**Implementation cost:** Significant. Key derivation, encryption/decryption, migration of existing plaintext data, UX for passphrase entry and recovery (none). Recommended only as an opt-in for highly sensitive content (e.g. "Lock journal").

### 2.3 Quick "panic clear" button

**Mechanism:**

- A prominent "Clear all data" or "Panic clear" in Settings (and optionally on a secondary screen or via a shortcut).
- Single tap clears all `tryramadan-*` localStorage keys and all Cache Storage caches.
- Optional: Require confirmation or a short PIN to reduce accidental use.
- Redirect to home or onboarding after clear.

**What it helps:**

- User can rapidly wipe data before handing the device to someone else (e.g. repair, border, shared use).
- Limits exposure window: if the user clears before an attacker gains access, there is nothing to exfiltrate.

**What it does NOT help:**

- Data already copied before the clear.
- Attacker who has already dumped storage via DevTools.

**Implementation:** See `docs/DATA-LIFECYCLE-POLICIES.md` for `deleteAllUserData()` and key list. Add a Settings entry with clear copy: "Clear all data — removes everything from this device."

### 2.4 Reduced retention (auto-delete)

**Mechanism:**

- Optional setting: "Auto-delete journals older than 30/90/365 days."
- Same for wellness, symptoms, schedule notes.
- Run on app load or periodically; delete older entries.

**What it helps:**

- Less historical data to exfiltrate.
- Reduces impact of a one-time dump.

**What it does NOT help:**

- Current and recent data remain exposed.
- Does not protect against real-time or repeated exfiltration.

### 2.5 UX warnings

**Mechanism:**

- In Settings and/or on first use: "Your data stays on this device. Anyone with access to this device (or browser extensions) could read it. Avoid shared devices for sensitive entries."
- Link to a "How we store your data" or Privacy page with more detail.

**What it helps:**

- Sets correct expectations; reduces false sense of security.
- Does not prevent exfiltration but informs users so they can decide how to use the app.

---

## 3. Developer-visible documentation

### 3.1 Do not misrepresent storage

**Avoid:**

- "Secure storage"
- "Encrypted storage" (unless client-side encryption is implemented and documented)
- "Private" or "protected" without explicit caveats
- "Your data never leaves your device" as a security guarantee (it is accurate for *transmission* but not for *access*)

**Prefer:**

- "Local storage" / "Device storage"
- "Stored only on this device"
- "Anyone with access to this device can read it"
- "Not secure against physical access or malware"

### 3.2 Proposed docs structure

Add or extend the following:

#### A. `docs/SECURITY-STORAGE-LIMITATIONS.md` (this doc or summary)

- How data is stored (localStorage, Cache API).
- What physical access enables (DevTools, dumps, profile copy).
- What the app can and cannot mitigate.
- Encryption (if implemented): scope, trade-offs, key management.

#### B. In-code comments (e.g. `useLocalStorage.ts` or `lib/dataLifecycle.ts`)

```ts
/**
 * TryRamadan stores user data in localStorage. This is NOT secure storage:
 * - Anyone with physical access to the device can read it (DevTools, profile copy).
 * - Browser extensions and malware may access it.
 * - Do not rely on it for sensitive data without optional client-side encryption.
 * See docs/SECURITY-PHYSICAL-ACCESS-AND-LIMITATIONS.md.
 */
```

#### C. Privacy policy / user-facing

- Section: "How we store your data."
- Copy: "TryRamadan stores all data locally in your browser. We do not send it to our servers. However, anyone who can use your device (including anyone with access to browser developer tools, browser extensions, or your device backups) may be able to read this data. Do not store highly sensitive information if you use a shared or untrusted device."

#### D. README or CONTRIBUTING (for contributors)

- Note: "TryRamadan is a local-only app. Data is stored in localStorage and the Cache API. This is not secure against physical access or compromised devices. See docs/SECURITY-PHYSICAL-ACCESS-AND-LIMITATIONS.md for details."

### 3.3 Suggested copy for Settings "Data & privacy"

> **How your data is stored**  
> TryRamadan stores your journal, fasting history, and preferences only on this device. We do not send your data to any server.
>
> **Important:** Anyone with access to this device (or to browser developer tools, extensions, or device backups) can read this data. It is not secure against physical access or malware. For sensitive entries, avoid shared or public devices. You can clear all data at any time below.

---

## 4. Summary

| Attack vector | Ease | Mitigation |
|---------------|------|------------|
| DevTools → localStorage | Trivial | None; optional encryption for sensitive keys |
| DevTools → Cache Storage | Trivial | None; panic clear reduces future exposure |
| Console dump script | Trivial | None |
| Profile directory copy | Moderate | None; encryption helps if implemented |
| Backup extraction | Moderate | None; encryption helps |
| Malicious extension | Variable | None; UX warning |
| Panic clear | — | Reduces data available for later exfiltration |
| Encryption (opt-in) | — | Renders exfiltrated data unreadable without passphrase |

**Bottom line:** With physical access and an unlocked device, exfiltration is straightforward. The app can mitigate only by (1) encrypting sensitive data with a user passphrase, (2) offering a quick panic clear, (3) reducing retained data, and (4) clearly documenting these limitations so storage is never described as "secure."
