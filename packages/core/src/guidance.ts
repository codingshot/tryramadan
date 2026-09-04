/** Educational summaries, not quotations or individualized fatwas. */
export const guidanceNotice = 'Educational Sunni overview, not a fatwa. Details differ among the Hanafi, Maliki, Shafi‘i and Hanbali schools. Follow a qualified scholar and your local community; seek medical advice for health decisions.';

export const fastingGuidance = [
  {
    id: 'boundaries',
    title: 'From true dawn to sunset',
    summary: 'Ramadan fasting runs from true dawn (Fajr), not sunrise, until sunset (Maghrib). A shorter practice fast is not a replacement for an obligatory Ramadan fast. Calculated times and dates are estimates: confirm with your local mosque.',
    source: 'Quran 2:187',
    url: 'https://quran.com/2/187',
  },
  {
    id: 'illness-travel',
    title: 'Illness and travel',
    summary: 'The Quran provides concessions for illness and travel and speaks of making up missed days. Individual eligibility, ongoing inability, and fidya need personal guidance; do not delay necessary treatment to keep a fast.',
    source: 'Quran 2:184–185',
    url: 'https://quran.com/2/185',
  },
  {
    id: 'fitr',
    title: 'Zakat al-fitr',
    summary: 'Zakat al-fitr is distinct from fitrah (innate disposition). The hadith describes a sa‘ of staple food, paid before the Eid prayer—not simply the price of one meal. Ask a qualified local authority about quantity, eligibility and payment in money.',
    source: 'Sahih al-Bukhari 1503',
    url: 'https://sunnah.com/bukhari:1503',
  },
  {
    id: 'care',
    title: 'Pregnancy and nursing',
    summary: 'Inability to fast or concern about harm during pregnancy or nursing calls for medical and scholarly advice. Make-up fasts and any feeding obligation depend on circumstances and the school followed; do not use an app to decide your obligation.',
    source: 'Egypt’s Dar al-Ifta: pregnancy and nursing',
    url: 'https://www.dar-alifta.org/en/fatwa/details/20338/breaking-the-fast-due-to-pregnancy-and-nursing',
  },
] as const;
