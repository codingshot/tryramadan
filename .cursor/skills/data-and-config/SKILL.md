---
name: tryramadan-data-and-config
description: Central config and static data in TryRamadan. Covers API base URLs and env (config.ts), Aladhan and Quran APIs, and data files (hadiths, glossary, cultural traditions, cities, guides). Use when adding APIs, changing env, or editing content or locale data.
---

# Data and Config (TryRamadan)

Use this skill when **adding or changing APIs**, **env variables**, or **static content** (hadiths, glossary, cultural data, cities, guides).

---

## 1. Config and env (`src/lib/config.ts`)

- **API base URLs:** `API_CONFIG.aladhan`, `API_CONFIG.quranApi`, timezone/geocode endpoints. Use these instead of hardcoding URLs.
- **External links:** `EXTERNAL_LINKS.quran`, `EXTERNAL_LINKS.sunnah`, etc. for outbound links in UI.
- **Env:** Use `import.meta.env` for build-time values (e.g. `MODE`, `VITE_*` if added). Keep secrets out of client bundle; no API keys in repo for public APIs that don’t require them (Aladhan, Quran.com are public).

---

## 2. Prayer times and location

- **Aladhan:** Timings and calendar; base URL from `API_CONFIG.aladhan`. Method 2 (Muslim World League or app default).
- **Location search:** Nominatim or configured geocode; timezone from coords via timeapi.io or similar (see `useLocation.ts`). Location and timezone stored in preferences; timezone used for display and countdowns (see timezone-and-countdown skill).

---

## 3. Content data files

| Path | Purpose |
|------|---------|
| `src/data/hadiths.json` | Hadith entries: source, text, topic. Must cite collection + number; verify on Sunnah.com (see islamic-content-authenticity skill). |
| `src/data/glossary.json` | Islamic terms: term, arabic, pronunciation, definition, definitionAr. |
| `src/data/cultural-traditions.json` | Country traditions, labels, optional Arabic. |
| `src/data/eating-times-tooltips.ts` | Suhoor, Iftar, Fajr tooltips (body, bodyAr). |
| `src/data/general-tooltips.ts` | General fasting/UI tooltips. |
| `src/data/guides.ts` | User guides: slug, title, steps, quickLink. |
| `src/data/daily-facts.json` | Ramadan daily facts. |
| `cities.json` / `more-city-data.json` | City list for location search; optional backfill for culture country. |

---

## 4. Adding a new API or env

- Add base URL or flag to `src/lib/config.ts` (and document in CONTRIBUTING if needed).
- Use the config in the hook or service that fetches; do not scatter URLs across components.
- For new env vars: use `VITE_` prefix for client-exposed values; document in README or CONTRIBUTING.

---

## 5. Adding or editing static content

- **Hadith / Quran:** Follow `islamic-content-authenticity` skill (sources, numbering, no fabrication).
- **Glossary / tooltips:** Keep Arabic and transliteration consistent; use existing fields (e.g. `bodyAr`).
- **Guides:** Update `src/data/guides.ts`; steps can reference routes and quickLink path for deep links.
