# UX: Inclusivity Across Cultural and Faith Backgrounds

This document evaluates language, icons, and metaphors for cultural neutrality; designs a toggle or onboarding question that adapts terminology (Islamic vs secular fasting wording); and suggests inclusive illustrations, emoji, and color palettes that balance Islamic authenticity with openness to diverse users.

**Related:** [OnboardingMode](../src/pages/onboarding/OnboardingMode.tsx), [useLocalStorage (getIftarLabel, getSuhoorLabel)](../src/hooks/useLocalStorage.ts), [UX-FIRST-TIME-EXPERIENCE-REVIEW.md](./UX-FIRST-TIME-EXPERIENCE-REVIEW.md).

---

## 1. Evaluation: Language, icons, and metaphors for cultural neutrality

### 1.1 Language audit

| Term | Where used | Islamic-specific? | Cultural load | Recommendation |
|------|------------|-------------------|---------------|----------------|
| **Iftar** | Throughout | Yes | High for non-Muslims | Already adapted: Muslim → "Iftar"; Non-Muslim → "Breaking Fast (Iftar)". Keep; consider optional "Evening meal" as secular-only label. |
| **Suhoor** | Throughout | Yes | High | Already adapted: Muslim → "Suhoor"; Non-Muslim → "Suhoor (pre-dawn meal)". Keep; optional "Pre-dawn meal" as primary for secular mode. |
| **Ramadan** | App name, hero, content | Yes | Core to product | Keep; the app is Ramadan-themed. Ensure it's always introduced with a brief context for newcomers. |
| **Bismillah** | Iftar notification, some copy | Yes | High | Offer secular alternative: "Time to break your fast" vs "Bismillah!" in notification body. |
| **Maghrib** | Prayer times, tooltips | Yes | Moderate | Muslim mode: fine. Non-Muslim: use "sunset" with "(Maghrib)" in tooltips; glossary available. |
| **Fajr** | Prayer times | Yes | Moderate | Same: "dawn" with "(Fajr)" for non-Muslim. |
| **Five Pillars, Sunnah, Hadith** | Learn, Quran, glossary | Yes | High | Muslim mode: full. Non-Muslim: progressive disclosure via glossary; don't assume familiarity. |
| **Fast / fasting** | Universal | Neutral | Low | Works for both; "intermittent fasting" familiar to wellness users. |

### 1.2 Icons audit

| Icon | Where used | Cultural load | Recommendation |
|------|------------|---------------|----------------|
| **☪️ (Crescent)** | Onboarding Muslim mode, FastingPrograms, personas | Islamic symbol | Use only when Muslim mode is explicit (Mode selection, Muslim persona). Avoid in shared/neutral surfaces. |
| **🌙 (Moon)** | Fasting status, suhoor tab, achievements, hero | Moderate — lunar/ Ramadan association | Universally recognizable; keep. Lunar month = Ramadan; acceptable for all. |
| **🌅 / Sunrise** | Suhoor, dawn, morning | Low | Universal; keep. |
| **🌆 / Sunset** | Iftar, Maghrib | Low | Universal; keep. |
| **🍽️** | Meals, recipes | Low | Universal; keep. |
| **Lucide Moon, Sun, Sunrise, Sunset** | FastingTimer, Prayers, Schedule | Low | Abstract, neutral; keep. |

**Summary:** Crescents are Islamic-specific; use only in Muslim-specific contexts. Moon, sun, sunrise, sunset, food icons are culturally neutral.

### 1.3 Metaphors audit

| Metaphor | Where | Issue | Recommendation |
|----------|-------|-------|----------------|
| **"Fast like a Muslim"** | Hero, Index, PageSEO | Explicit Muslim framing | Keep for authenticity; balance with "for everyone" in subcopy. |
| **"Islamic heritage"** | index.css comments, primary color | Design-system-only | Fine; not user-facing. |
| **"Crescent, lanterns"** | CSS comments (gold = crescent) | Design-system-only | Fine. |
| **"Holy month"** | Hero, meta | Islamic | Keep; app is Ramadan-focused. |
| **"Bismillah"** | Iftar notification | Islamic | Offer toggle: Muslim sees "Bismillah!"; Non-Muslim sees "Time to break your fast." |

---

## 2. Toggle or onboarding question for terminology adaptation

### 2.1 Current state

- **OnboardingMode:** User chooses "Non-Muslim Mode" or "Muslim Mode" at `/onboarding/mode`.
- **Effect:** `userType` drives:
  - **Iftar:** Muslim → "Iftar"; Non-Muslim → "Breaking Fast (Iftar)"
  - **Suhoor:** Muslim → "Suhoor"; Non-Muslim → "Suhoor (pre-dawn meal)"
  - **Journal prompts:** PROMPTS_MUSLIM vs PROMPTS_NON_MUSLIM (e.g. "suhoor vs iftar" vs "morning vs when you broke fast")
  - **Prayer strip, Hadith, Quran:** Shown or emphasized for Muslim; reduced/hidden for Non-Muslim
  - **Bismillah:** Currently in notification for all; no userType check

### 2.2 Proposed: Explicit terminology preference

**Option A — Extend Mode (recommended):** Keep Mode as the primary driver. Mode already implies terminology. Ensure *all* copy paths respect it:

- Notification body: `userType === "muslim"` → "It's time to break your fast. Bismillah! 🌙"; `userType === "non-muslim"` → "It's time to break your fast. 🌙" (drop Bismillah).
- Any remaining hardcoded "Iftar" / "Suhoor" without label helper → fix to use `getIftarLabel` / `getSuhoorLabel`.

**Option B — Separate terminology toggle:** Add a second question, "How would you like terms shown?"

| Option | Iftar | Suhoor | Other |
|--------|-------|--------|-------|
| **Islamic** | Iftar | Suhoor | Bismillah in notifications |
| **Islamic + explanation** | Breaking Fast (Iftar) | Suhoor (pre-dawn meal) | — |
| **Secular** | Evening meal / Breaking fast | Pre-dawn meal | No Bismillah |

Use case: A Muslim user who prefers English-first labels for family members; a secular user who wants no Arabic/Islamic terms. Adds complexity; Option A is simpler and covers 95% of users.

**Option C — Refine Mode labels:** Make the Mode question clearer that it controls wording:

- **Non-Muslim:** "Learning mode: secular-friendly terms, cultural education, wellness focus."
- **Muslim:** "Muslim mode: Islamic terminology, prayer times, spiritual content."

### 2.3 Recommended design

1. **Keep Mode as single driver** (Option A).
2. **Add "Bismillah" toggle:** In notification body, only show "Bismillah!" when `userType === "muslim"`. Non-Muslim: "It's time to break your fast. 🌙"
3. **Settings override (optional):** In Settings → Fasting path, add "Terminology: Islamic (Iftar, Suhoor) | Secular (Breaking fast, Pre-dawn meal)" — allows Muslim users in shared households to switch without changing Mode.
4. **Onboarding copy:** In Mode step, add one line: "This also adjusts how we phrase things (e.g. Iftar vs Breaking fast). You can change it later in Settings."

---

## 3. Inclusive illustrations, emoji, and color palettes

### 3.1 Illustrations

**Current:** Hero uses `hero-bg.jpg`; logo; no character illustrations in-app.

| Principle | Recommendation |
|-----------|----------------|
| **Avoid single-culture imagery** | Hero: use landscapes (mosque silhouette at dusk, lanterns, dates, abstract patterns) rather than people of one ethnicity. If people appear, show diversity (various skin tones, dress styles). |
| **Islamic authenticity** | Geometric patterns, lanterns, crescents, arabesques are widely associated with Ramadan and are inclusive (decorative, not doctrinal). |
| **Avoid stereotype** | Don't default to Middle Eastern dress only; Ramadan is global (Southeast Asia, Africa, Europe, Americas). |
| **Empty states** | Use abstract shapes (moon, sun, food icons) or gentle patterns rather than culturally specific figures. |

**Suggested assets:** Lanterns, dates, abstract geometric borders, silhouettes of diverse hands breaking fast together, global food imagery (dates, water, bread) — universal and recognizable.

### 3.2 Emoji usage

| Context | Current | Inclusive approach |
|---------|---------|---------------------|
| **Mode selection** | Non-Muslim: 🌱; Muslim: ☪️ | Non-Muslim: 🌱 or 🌍 (learning, world); Muslim: ☪️ or 🌙. Keep ☪️ for Muslim-only; it signals authenticity. |
| **Goals** | Muslim: 🌙, 📖, 💝, etc.; Non-Muslim: 📚, ⏱️, 🤝, etc. | Already differentiated; avoid religious emoji in Non-Muslim goals. |
| **Achievements** | 🌙 (First Fast), 🌅 (Early Bird) | Moon/sun are neutral; keep. |
| **Notifications** | 🌙 in iftar body | Optional: Muslim gets 🌙; Non-Muslim gets 🌙 or none (some prefer minimal emoji). |
| **Journal mood** | 😢 😐 🙂 😊 😄 | Universal; keep. |

**Guideline:** Use ☪️ only in Muslim-specific UI. Use 🌙, 🌅, 🌆, 🍽️, 📖, etc. in shared UI. Avoid emoji that could read as sectarian (e.g. 🕌 only where context is clearly educational).

### 3.3 Color palettes

**Current (index.css):**

- **Primary:** Deep Emerald Green (158 45% 22%) — "Islamic heritage"
- **Secondary:** Warm Gold (42 85% 55%) — "crescent, lanterns"
- **Accent:** Rich Burgundy (10 55% 35%) — "dates"
- **Background:** Cream/warm neutral (45 30% 97%)

These colors are widely associated with Ramadan and Islamic art (green, gold, burgundy) but are also **universal** — green = growth, gold = warmth, burgundy = richness. No change needed for inclusivity; they read as "Ramadan" without excluding.

| Palette role | Color | Inclusive? | Note |
|--------------|-------|------------|------|
| Primary green | Emerald | Yes | Green is global (nature, peace, growth); strong Ramadan association. |
| Secondary gold | Warm gold | Yes | Lanterns, crescents, warmth; no single-culture lock. |
| Accent burgundy | Dates | Yes | Food, richness; neutral. |
| Cream background | Warm neutral | Yes | Calm, readable. |

**Optional: "Neutral" theme variant:** For users who want minimal religious association, offer a theme that shifts primary to a cooler blue-teal (e.g. 180 40% 30%) and keeps gold/burgundy as accents. Not required for inclusivity; current palette is already inclusive.

### 3.4 Typography

- **Playfair Display (display):** Elegant serif; not culturally specific.
- **Inter (body):** Neutral sans-serif.
- **Amiri (Arabic):** Used for Arabic phrases (e.g. "أنا مسلم"). Appropriate for Islamic content; use sparingly in Non-Muslim path — e.g. in Mode step as "أخبرنا عن نفسك" (Tell us about yourself) adds warmth without overwhelming.

**Recommendation:** Keep current fonts. Use Arabic font only where Arabic text appears (labels, hadith, glossary); avoid decorative Arabic where it could confuse non-readers.

---

## 4. Summary

| Area | Recommendation |
|------|----------------|
| **Language** | Mode already drives Iftar/Suhoor labels. Add Bismillah toggle (Muslim only in notifications). Audit remaining copy for hardcoded Islamic terms. |
| **Icons** | Use ☪️ only in Muslim-specific contexts. Moon, sun, sunrise, sunset, food icons are neutral. |
| **Metaphors** | Keep "Fast like a Muslim" with "for everyone" balance. Offer secular notification body (no Bismillah) for Non-Muslim. |
| **Terminology toggle** | Mode is sufficient; optionally add Settings override "Islamic | Secular" for edge cases. Clarify in Mode step that it controls wording. |
| **Illustrations** | Prefer landscapes, lanterns, geometric patterns, diverse hands/food. Avoid single-ethnicity or stereotypical imagery. |
| **Emoji** | ☪️ for Muslim mode only; 🌙/🌅/🍽️ for shared UI. |
| **Colors** | Current palette (emerald, gold, burgundy) is inclusive and Ramadan-authentic. Optional neutral theme for users who want minimal religious association. |

Implementing the Bismillah toggle, terminology clarification in Mode, and an illustration/asset guideline will strengthen inclusivity without diluting the app's Islamic authenticity for Muslim users.
