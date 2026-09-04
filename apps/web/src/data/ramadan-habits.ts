/**
 * Ramadan habits: forbidden (to avoid) and sunnah (recommended).
 * Each habit has Quran/hadith quote first, source link, and muslimOnly tag.
 * muslimOnly = true: applies to Muslims (e.g. prayer, taraweeh); false = applies to everyone (e.g. eating during fast, lying).
 */

export type HabitType = "forbidden" | "sunnah";
export type HabitTag = "muslim" | "everyone";

export interface RamadanHabit {
  id: string;
  type: HabitType;
  /** "muslim" = for Muslims only (e.g. neglecting prayers, taraweeh); "everyone" = for all including non-Muslims trying Ramadan */
  tag: HabitTag;
  title: string;
  /** Short label for journal tracker */
  shortLabel: string;
  /** Quran verse or hadith quote (show first) */
  quote: string;
  /** Source citation, e.g. "Quran 2:187" or "Sahih al-Bukhari 1923" */
  sourceLabel: string;
  /** Full URL to quran.com or sunnah.com */
  sourceUrl: string;
  /** Optional second source (e.g. hadith that elaborates on Quran) */
  sourceLabel2?: string;
  sourceUrl2?: string;
  /** Detailed explanation for the page */
  explanation: string;
}

const QURAN_BASE = "https://quran.com";
const SUNNAH_BASE = "https://sunnah.com";

export const RAMADAN_HABITS_FORBIDDEN: RamadanHabit[] = [
  {
    id: "eating-drinking-fasting-hours",
    type: "forbidden",
    tag: "everyone",
    title: "Eating and drinking during fasting hours",
    shortLabel: "No food/drink during fast",
    quote: "And eat and drink until the white thread of dawn becomes distinct to you from the black thread [of night]. Then complete the fast until the sunset.",
    sourceLabel: "Quran 2:187",
    sourceUrl: `${QURAN_BASE}/2/187`,
    explanation: "From Surah Al-Baqarah, Allah permits eating and drinking until the clear appearance of the white thread of dawn (Fajr) and the black thread of night. After that, the fast must be completed until sunset (Maghrib). This is the core physical observance of Ramadan for everyone who chooses to fast.",
  },
  {
    id: "sexual-relations-fasting-hours",
    type: "forbidden",
    tag: "everyone",
    title: "Sexual relations during fasting hours",
    shortLabel: "No sexual relations during fast",
    quote: "They are clothing for you and you are clothing for them. Allah knows that you used to deceive yourselves, so He accepted your repentance and forgave you. So now have relations with them and seek what Allah has decreed for you. And eat and drink until the white thread of dawn becomes distinct to you from the black thread [of night]. Then complete the fast until the sunset.",
    sourceLabel: "Quran 2:187",
    sourceUrl: `${QURAN_BASE}/2/187`,
    explanation: "The same verse (2:187) clarifies that sexual relations with one's spouse are prohibited during the daylight fasting hours but permitted at night (after Maghrib until Fajr). This applies to those observing the fast.",
  },
  {
    id: "lying-false-speech",
    type: "forbidden",
    tag: "everyone",
    title: "Lying and false speech",
    shortLabel: "No lying or false speech",
    quote: "So avoid the uncleanliness of idols and avoid false statement.",
    sourceLabel: "Quran 22:30",
    sourceUrl: `${QURAN_BASE}/22/30`,
    sourceLabel2: "Sahih al-Bukhari 1903",
    sourceUrl2: `${SUNNAH_BASE}/bukhari:1903`,
    explanation: "The Prophet (ﷺ) said: \"Whoever does not give up false speech and acting upon it, Allah has no need of his giving up food and drink.\" (Bukhari) Fasting is not only abstaining from food and drink; it requires abstaining from falsehood, so that the fast is spiritually valid.",
  },
  {
    id: "backbiting-gossip",
    type: "forbidden",
    tag: "everyone",
    title: "Backbiting and gossip",
    shortLabel: "No backbiting or gossip",
    quote: "And do not spy or backbite each other. Would one of you like to eat the flesh of his brother when dead? You would detest it.",
    sourceLabel: "Quran 49:12",
    sourceUrl: `${QURAN_BASE}/49/12`,
    explanation: "Allah compares backbiting to eating the flesh of one's dead brother—something naturally detestable. During Ramadan, guarding the tongue from backbiting and gossip is especially important so that the fast is not invalidated in spirit.",
  },
  {
    id: "anger-fighting",
    type: "forbidden",
    tag: "everyone",
    title: "Anger and fighting",
    shortLabel: "No anger or quarrelling",
    quote: "Fight in the way of Allah those who fight you but do not transgress. Indeed, Allah does not like transgressors.",
    sourceLabel: "Quran 2:190",
    sourceUrl: `${QURAN_BASE}/2/190`,
    sourceLabel2: "Sahih al-Bukhari 1894",
    sourceUrl2: `${SUNNAH_BASE}/bukhari:1894`,
    explanation: "The Prophet (ﷺ) said: \"When one of you is fasting, he should not behave in an obscene manner, nor should he act foolishly. If someone fights with him or insults him, he should say: 'I am fasting.'\" Controlling anger and avoiding quarrels preserves the dignity and reward of the fast.",
  },
  {
    id: "vain-talk-idle-speech",
    type: "forbidden",
    tag: "everyone",
    title: "Vain talk and idle speech",
    shortLabel: "No vain or idle speech",
    quote: "And they who turn away from ill speech.",
    sourceLabel: "Quran 23:3",
    sourceUrl: `${QURAN_BASE}/23/3`,
    explanation: "The believers are those who avoid useless and ill speech. During Ramadan, refraining from vain talk and focusing on remembrance of Allah and good speech increases the spiritual benefit of the fast.",
  },
  {
    id: "arrogance-pride",
    type: "forbidden",
    tag: "everyone",
    title: "Arrogance and pride",
    shortLabel: "No arrogance or pride",
    quote: "And do not turn your cheek [in contempt] toward people and do not walk through the earth exultantly. Indeed, Allah does not like everyone self-deluded and boastful.",
    sourceLabel: "Quran 31:18",
    sourceUrl: `${QURAN_BASE}/31/18`,
    explanation: "Humility is central to worship. Arrogance and walking with pride contradict the spirit of fasting, which is meant to cultivate humility and dependence on Allah.",
  },
  {
    id: "wasteful-spending",
    type: "forbidden",
    tag: "everyone",
    title: "Wasteful spending",
    shortLabel: "No wasteful spending",
    quote: "And give the relative his right, and [also] the poor and the traveler, and do not spend wastefully. Indeed, the wasteful are brothers of the devils.",
    sourceLabel: "Quran 17:26-27",
    sourceUrl: `${QURAN_BASE}/17/26-27`,
    explanation: "Allah commands giving to relatives, the poor, and the traveler, and forbids waste. Ramadan is a time to increase charity and reduce excess; wasteful spending opposes this.",
  },
  {
    id: "slander-accusations",
    type: "forbidden",
    tag: "everyone",
    title: "Slander and false accusations",
    shortLabel: "No slander or false accusations",
    quote: "And those who accuse chaste women and then do not produce four witnesses—lash them with eighty lashes and do not accept from them testimony ever after. And those are the defiantly disobedient.",
    sourceLabel: "Quran 24:4",
    sourceUrl: `${QURAN_BASE}/24/4`,
    explanation: "False accusation and slander are grave sins. During Ramadan, protecting the honor of others and avoiding slander is part of guarding the tongue and the fast.",
  },
  {
    id: "dishonesty-business",
    type: "forbidden",
    tag: "everyone",
    title: "Dishonesty in business",
    shortLabel: "No dishonesty in business",
    quote: "Woe to those who give less [than due], who, when they take a measure from people, take in full. But if they give by measure or by weight to them, they cause loss.",
    sourceLabel: "Quran 83:1-3",
    sourceUrl: `${QURAN_BASE}/83/1-3`,
    explanation: "Cheating in measure or weight is condemned in the Quran. Honesty in all transactions, especially during Ramadan, aligns the believer with the spirit of the month.",
  },
  {
    id: "neglecting-prayer",
    type: "forbidden",
    tag: "muslim",
    title: "Neglecting the five daily prayers",
    shortLabel: "Don’t neglect prayers",
    quote: "And when you have completed the prayer, remember Allah standing, sitting, or [lying] on your sides. But when you become secure, re-establish [regular] prayer. Indeed, prayer has been decreed upon the believers a decree of specified times.",
    sourceLabel: "Quran 4:103",
    sourceUrl: `${QURAN_BASE}/4/103`,
    explanation: "Prayer is obligatory at fixed times. During Ramadan, maintaining the five daily prayers is essential for Muslims; neglecting them undermines the completeness of one's worship. This applies to those who have embraced Islam.",
  },
];

export const RAMADAN_HABITS_SUNNAH: RamadanHabit[] = [
  {
    id: "suhoor",
    type: "sunnah",
    tag: "everyone",
    title: "Taking Suhoor (pre-dawn meal)",
    shortLabel: "Ate Suhoor",
    quote: "Take suhoor as there is a blessing in it.",
    sourceLabel: "Sahih al-Bukhari 1923, Sahih Muslim 1095",
    sourceUrl: `${SUNNAH_BASE}/bukhari:1923`,
    sourceLabel2: "Sahih Muslim 1095",
    sourceUrl2: `${SUNNAH_BASE}/muslim:1095`,
    explanation: "The Prophet (ﷺ) encouraged the pre-dawn meal (suhoor) and said there is blessing in it. It helps sustain the body during the fast and distinguishes Islamic fasting from simply going hungry. Even a small amount (e.g. a date and water) fulfills the sunnah.",
  },
  {
    id: "break-fast-dates",
    type: "sunnah",
    tag: "everyone",
    title: "Breaking fast with dates",
    shortLabel: "Broke fast with dates",
    quote: "The Prophet (ﷺ) used to break his fast with fresh dates before praying; if there were no fresh dates, then with dried dates; if there were no dried dates, then with a few sips of water.",
    sourceLabel: "Sunan Abi Dawud 2356",
    sourceUrl: `${SUNNAH_BASE}/abudawud:2356`,
    explanation: "Breaking the fast with dates (or water if dates are unavailable) follows the example of the Prophet (ﷺ). Dates provide quick energy and nutrients after a long fast.",
  },
  {
    id: "dua-at-iftar",
    type: "sunnah",
    tag: "everyone",
    title: "Making du'a (supplication) at Iftar",
    shortLabel: "Made du'a at Iftar",
    quote: "Dhahaba al-zama' wa abtalat al-'urooq wa thabat al-ajr in sha Allah. (The thirst is gone, the veins are moistened, and the reward is confirmed, if Allah wills.)",
    sourceLabel: "Sunan Abi Dawud 2358",
    sourceUrl: `${SUNNAH_BASE}/abudawud:2358`,
    explanation: "The Prophet (ﷺ) would say this supplication when breaking the fast. The fasting person's du'a at the time of breaking fast is not rejected, so it is a blessed moment to ask of Allah.",
  },
  {
    id: "taraweeh",
    type: "sunnah",
    tag: "muslim",
    title: "Taraweeh (night prayers during Ramadan)",
    shortLabel: "Prayed Taraweeh",
    quote: "Whoever stands (in prayer) during Ramadan with faith and seeking reward will have his past sins forgiven.",
    sourceLabel: "Sahih al-Bukhari 2008, Sahih Muslim 760",
    sourceUrl: `${SUNNAH_BASE}/bukhari:2008`,
    sourceLabel2: "Sahih Muslim 760",
    sourceUrl2: `${SUNNAH_BASE}/muslim:760`,
    explanation: "Taraweeh are extra night prayers performed in congregation during Ramadan. They are a sunnah for Muslims and a means of drawing closer to Allah and having past sins forgiven.",
  },
  {
    id: "increase-quran",
    type: "sunnah",
    tag: "everyone",
    title: "Increased Quran recitation",
    shortLabel: "Read/recited Quran",
    quote: "The Prophet (ﷺ) would review the Quran with Jibreel (Angel Gabriel) every Ramadan.",
    sourceLabel: "Sahih al-Bukhari 4998",
    sourceUrl: `${SUNNAH_BASE}/bukhari:4998`,
    explanation: "Ramadan is the month in which the Quran was revealed. Increasing recitation and reflection on the Quran—even a few verses or a page daily—aligns with the spirit of the month.",
  },
  {
    id: "itikaf",
    type: "sunnah",
    tag: "muslim",
    title: "I'tikaf (spiritual retreat in the mosque)",
    shortLabel: "I'tikaf (last 10 nights)",
    quote: "The Prophet (ﷺ) used to observe i'tikaf in the last ten days of Ramadan until he passed away.",
    sourceLabel: "Sahih al-Bukhari 2026, Sahih Muslim 1172",
    sourceUrl: `${SUNNAH_BASE}/bukhari:2026`,
    explanation: "I'tikaf is seclusion in the mosque for worship, especially in the last ten days of Ramadan to seek Laylat al-Qadr. It is a sunnah for those who are able.",
  },
  {
    id: "laylat-al-qadr",
    type: "sunnah",
    tag: "everyone",
    title: "Seeking Laylat al-Qadr (Night of Power)",
    shortLabel: "Sought Laylat al-Qadr",
    quote: "Indeed, We sent the Quran down during the Night of Decree. And what can make you know what is the Night of Decree? The Night of Decree is better than a thousand months.",
    sourceLabel: "Quran 97:1-5",
    sourceUrl: `${QURAN_BASE}/97`,
    explanation: "Laylat al-Qadr falls in the last ten nights of Ramadan (often the odd nights). Worship on this night is better than that of a thousand months. Striving for it through prayer, du'a, and remembrance is highly recommended.",
  },
  {
    id: "charity",
    type: "sunnah",
    tag: "everyone",
    title: "Increased charity",
    shortLabel: "Gave charity",
    quote: "The Prophet (ﷺ) was the most generous of people, and he was most generous in Ramadan when Jibreel met him.",
    sourceLabel: "Sahih al-Bukhari 1902, Sahih Muslim 2308",
    sourceUrl: `${SUNNAH_BASE}/bukhari:1902`,
    explanation: "Giving in charity during Ramadan carries great reward. The Prophet (ﷺ) increased his generosity in this month; following his example benefits both the giver and those in need.",
  },
  {
    id: "control-tongue",
    type: "sunnah",
    tag: "everyone",
    title: "Controlling the tongue",
    shortLabel: "Guarded my tongue",
    quote: "Whoever believes in Allah and the Last Day, let him speak good or remain silent.",
    sourceLabel: "Sahih al-Bukhari 6475, Sahih Muslim 47",
    sourceUrl: `${SUNNAH_BASE}/bukhari:6475`,
    explanation: "Refraining from useless talk, backbiting, and falsehood, and using the tongue for remembrance of Allah and kind speech, completes the fast and increases its reward.",
  },
  {
    id: "patience-self-control",
    type: "sunnah",
    tag: "everyone",
    title: "Patience and self-control",
    shortLabel: "Practiced patience",
    quote: "Fasting is a shield. So when one of you is fasting, he should not behave in an obscene manner, nor should he act foolishly.",
    sourceLabel: "Sahih al-Bukhari 1894",
    sourceUrl: `${SUNNAH_BASE}/bukhari:1894`,
    explanation: "Fasting trains patience and self-control. When provoked, saying \"I am fasting\" reminds oneself and others of the spiritual purpose and helps avoid anger and foolish behavior.",
  },
  {
    id: "forgiveness",
    type: "sunnah",
    tag: "everyone",
    title: "Seeking forgiveness and forgiving others",
    shortLabel: "Sought/offered forgiveness",
    quote: "And let them pardon and overlook. Would you not like that Allah should forgive you?",
    sourceLabel: "Quran 24:22",
    sourceUrl: `${QURAN_BASE}/24/22`,
    explanation: "Ramadan is a time to seek Allah's forgiveness and to forgive others. Letting go of grudges and apologizing or accepting apologies uplifts the soul and aligns with the mercy of the month.",
  },
  {
    id: "hasten-iftar",
    type: "sunnah",
    tag: "everyone",
    title: "Breaking fast promptly at Maghrib",
    shortLabel: "Broke fast on time",
    quote: "The people will remain upon goodness as long as they hasten to break the fast.",
    sourceLabel: "Sahih al-Bukhari 1957, Sahih Muslim 1098",
    sourceUrl: `${SUNNAH_BASE}/bukhari:1957`,
    explanation: "The Prophet (ﷺ) encouraged breaking the fast as soon as it is time (Maghrib), without delay. This preserves the sunnah and avoids extending the fast beyond the prescribed time.",
  },
  {
    id: "delay-suhoor",
    type: "sunnah",
    tag: "everyone",
    title: "Delaying Suhoor (eating close to Fajr)",
    shortLabel: "Delayed Suhoor",
    quote: "The Prophet (ﷺ) said: 'Take suhoor, for in suhoor there is blessing.' And he would delay it until just before Fajr.",
    sourceLabel: "Sahih al-Bukhari 1921, Sahih Muslim 1097",
    sourceUrl: `${SUNNAH_BASE}/bukhari:1921`,
    explanation: "Eating suhoor closer to the time of Fajr (while still stopping before the adhan) follows the practice of the Prophet (ﷺ) and helps sustain one through the day.",
  },
];

export const ALL_RAMADAN_HABITS: RamadanHabit[] = [
  ...RAMADAN_HABITS_FORBIDDEN,
  ...RAMADAN_HABITS_SUNNAH,
];

export const RAMADAN_HABIT_IDS = ALL_RAMADAN_HABITS.map((h) => h.id);

/** Habit IDs that are recommended for daily tracking in the journal (sunnah only, short list). */
export const JOURNAL_TRACKABLE_HABIT_IDS = RAMADAN_HABITS_SUNNAH.map((h) => h.id);

export function getHabitById(id: string): RamadanHabit | undefined {
  return ALL_RAMADAN_HABITS.find((h) => h.id === id);
}

export function getHabitsForUser(userType: "muslim" | "new" | null): RamadanHabit[] {
  if (userType === "muslim") return ALL_RAMADAN_HABITS;
  return ALL_RAMADAN_HABITS.filter((h) => h.tag === "everyone");
}

/** Get short labels for checked habit IDs (for display in history). */
export function getShortLabelsForHabitIds(habitIds: string[]): string[] {
  return habitIds
    .map((id) => getHabitById(id)?.shortLabel)
    .filter((label): label is string => !!label);
}

/**
 * Consecutive days (including today) with at least one habit logged.
 * dateStr must be YYYY-MM-DD; iterates backward from that day.
 */
export function getHabitLogStreak(
  habitLog: Record<string, Record<string, boolean>>,
  todayStr: string
): number {
  let streak = 0;
  const d = new Date(todayStr + "T12:00:00");
  while (true) {
    const dateStr = d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");
    const dayLog = habitLog[dateStr];
    const count = dayLog ? Object.values(dayLog).filter(Boolean).length : 0;
    if (count === 0) break;
    streak++;
    d.setDate(d.getDate() - 1);
  }
  return streak;
}

/** Total number of habit checkmarks in habitLog. */
export function getTotalHabitCheckmarks(habitLog: Record<string, Record<string, boolean>>): number {
  return Object.values(habitLog).reduce((sum, day) => sum + Object.values(day).filter(Boolean).length, 0);
}

/** Per-habit count of how many times each habit was checked. */
export function getPerHabitCounts(habitLog: Record<string, Record<string, boolean>>): Record<string, number> {
  const counts: Record<string, number> = {};
  Object.values(habitLog).forEach((day) => {
    Object.entries(day).forEach(([id, checked]) => {
      if (checked) counts[id] = (counts[id] ?? 0) + 1;
    });
  });
  return counts;
}
