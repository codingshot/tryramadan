---
name: islamic-content-authenticity
description: Verify Quran quotes, fact-check against the Quran, check hadith authenticity (source and grading), and validate Arabic translations. Use when adding or editing Quran verses, hadiths, glossary terms, fasting rules, or any Arabic text in TryRamadan.
---

# Islamic Content Authenticity

Use this skill when adding or reviewing **Quran quotes**, **hadith**, **Arabic terms**, or **translations** in TryRamadan. Always verify against canonical sources before committing.

---

## 1. Quran quotes and fact-checking

### Canonical reference
- **Standard text**: Uthmani script; verse numbering follows the standard 6236-verse (or 6235 by some counts) Mushaf.
- **Fasting verses**: Surah Al-Baqarah 2:183–187 are the primary fasting verses. Any claim about “what the Quran says about fasting” must align with these and not contradict them.

### Verification steps
1. **Verse reference** – Confirm surah number (1–114), verse number, and that the verse exists (e.g. Al-Baqarah has 286 verses).
2. **Wording** – If displaying a quote, cross-check the English (and Arabic if shown) against a trusted source (e.g. [Quran.com](https://quran.com), api.quran.com). Prefer Saheeh International (translation id 20) for consistency with the app.
3. **Fact-checking** – When making a claim “the Quran says X”:
   - Identify the exact verse(s) that support it.
   - Ensure no conflation with hadith or tafsir; label clearly (“Quran”, “hadith”, “scholarly explanation”).
4. **In-app usage** – Quran text in the app comes from `api.quran.com` (DashboardQuran). For static copy (e.g. fasting rules, tooltips), cite verse (e.g. “2:185”) and keep wording close to a standard translation.

### Red flags
- Verse reference that doesn’t exist (e.g. 2:300).
- Paraphrase presented as a direct quote without “based on” or “cf.”.
- Mixing Quran and hadith without labelling.

---

## 2. Hadith authenticity

### Sources used in TryRamadan
- **Sahih al-Bukhari** – Highest regard in Sunni Islam; cite by book/number (e.g. Sahih al-Bukhari 1899).
- **Sahih Muslim** – Same tier; cite by number (e.g. Sahih Muslim 1162).
- **Sunan al-Tirmidhi** – Often has grading in the source (e.g. “hasan sahih”).
- **Sunan Abi Dawud**, **Sunan an-Nasa’i**, **Muwatta Malik** – Sometimes referenced; include full source.

### Verification steps
1. **Source string** – Must include collection name and number (e.g. `Sahih al-Bukhari 1904`). No bare “Bukhari” or “Muslim” without number.
2. **Cross-check** – Look up the number on [Sunnah.com](https://sunnah.com) (Bukhari, Muslim, Tirmidhi, etc.) and confirm:
   - The Arabic/English text matches the intended meaning.
   - The hadith is about the topic we claim (e.g. fasting, suhoor, Laylat al-Qadr).
3. **Grading** – Prefer hadiths that are **sahih** or **hasan**. If using da’if or less common collections, note in context or avoid in prominent UI.
4. **Data file** – Hadiths live in `src/data/hadiths.json`. Each entry must have `source` (e.g. "Sahih al-Bukhari 1923"), `text` (English), `topic`, and optional `context`. Do not invent or paraphrase hadith; keep wording close to a standard translation and cite accurately.

### Red flags
- Wrong book number (e.g. Bukhari 38 for a suhoor hadith that is actually 1923).
- Quote that doesn’t appear in the cited source.
- Fabricated or weak hadith presented as “the Prophet said” without qualification.

---

## 3. Arabic translations and glossary

### Where Arabic appears
- **Glossary** – `src/data/glossary.json`: `term`, `arabic`, `pronunciation` or `transliteration`, `definition`, optional `definitionAr`.
- **Tooltips** – `src/data/eating-times-tooltips.ts`, `src/data/general-tooltips.ts`: some entries have `bodyAr` or Arabic text.
- **UI / cultural data** – `src/data/cultural-traditions.json`, labels, and other JSON: `arabic`, `arabicName`, or inline Arabic.

### Verification steps
1. **Correct script** – Arabic must be in proper Arabic script (no Latin letters in place of Arabic). Use Unicode; ensure direction is `dir="rtl"` where displayed.
2. **Term match** – Arabic word/phrase must match the English term (e.g. سحور for Suhoor, إفطار for Iftar). Cross-check with a standard dictionary or glossary (e.g. Wehr, or Quran.com glossary).
3. **Transliteration** – Use consistent scheme (e.g. IAST-style for Islamic terms: ḍ, ṣ, ṭ, ḥ, etc.). Match existing style in `glossary.json` and tooltips.
4. **definitionAr** – If provided, must be a correct Arabic explanation or equivalent of the English definition, not a mistranslation or unrelated phrase.

### Red flags
- Wrong diacritics or typo in Arabic (changes meaning).
- Reversed or mismatched term/translation (e.g. Arabic for “Iftar” next to “Suhoor”).
- Transliteration that misrepresents pronunciation (e.g. “Suhoor” vs “Suhur” – app uses “Suhoor”; keep consistency).

---

## 4. Quick checklist before committing

- [ ] **Quran**: Verse refs valid; wording matches a standard translation; no claim attributed to Quran that isn’t in the verse(s).
- [ ] **Hadith**: Source string with collection + number; looked up on Sunnah.com; meaning matches usage; grading acceptable.
- [ ] **Arabic**: Script correct; term–translation match; transliteration consistent; RTL where needed.
- [ ] **Labels**: “Quran” vs “hadith” vs “scholarly view” clearly distinguished in UI and copy.

---

## 5. References

| Resource | Use |
|----------|-----|
| [Quran.com](https://quran.com) / [api.quran.com](https://api.quran.com) | Verse text, chapter/verse bounds, translations (e.g. Saheeh International). |
| [Sunnah.com](https://sunnah.com) | Bukhari, Muslim, Tirmidhi, etc.; verify hadith number and text. |
| App config | `src/lib/config.ts`: `EXTERNAL_LINKS.quran`, `EXTERNAL_LINKS.sunnah`; `API_CONFIG.quranApi`. |
| App data | `src/data/hadiths.json`, `src/data/glossary.json`, `src/data/ramadan-info.json`, `src/data/eating-times-tooltips.ts`, `src/data/general-tooltips.ts`. |

When in doubt, prefer **not** adding a quote or hadith until it is verified. Prefer citing a verse or source and linking to Quran.com or Sunnah.com rather than inlining unverified text.
