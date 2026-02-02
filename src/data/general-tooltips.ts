/**
 * Shared tooltip content for terms and actions that may be unclear to non-Muslims.
 * Use for: Ramadan, Sunnah, Taraweeh, Laylat al-Qadr, Adhan, Mark complete, I'm fasting, etc.
 */

export const GENERAL_TOOLTIPS = {
  ramadan: {
    title: "Ramadan • رمضان",
    body: "The ninth month of the Islamic lunar calendar. Muslims fast from dawn (Fajr) to sunset (Maghrib) each day. It's a month of worship, reflection, and community. Non-Muslims can join in solidarity by following the same eating window.",
    bodyAr: "شهر الصيام والقرآن والعبادة",
  },
  sunnah: {
    title: "Sunnah • سنة",
    body: "Practices recommended by the Prophet (peace be upon him). Sunnah fasting means voluntary fasting—e.g. Monday and Thursday, or the 'white days' (13th, 14th, 15th of the lunar month). Not obligatory but rewarded.",
    bodyAr: "صيام مستحب؛ الاثنين والخميس وأيام البيض",
  },
  taraweeh: {
    title: "Taraweeh • تراويح",
    body: "Optional night prayers during Ramadan, performed after Isha. In many mosques, one thirtieth of the Quran is recited each night so the full Quran is completed by Eid. You can attend or pray at home.",
    bodyAr: "قيام الليل في رمضان بعد العشاء",
  },
  laylatAlQadr: {
    title: "Laylat al-Qadr • ليلة القدر",
    body: "The Night of Power—one of the odd nights in the last ten days of Ramadan (21st, 23rd, 25th, 27th, 29th). Worship on this night is better than a thousand months. Muslims seek it through prayer and remembrance.",
    bodyAr: "خير من ألف شهر؛ ليلة نزول القرآن",
  },
  adhan: {
    title: "Adhan • أذان",
    body: "The Islamic call to prayer, recited before each of the five daily prayers. It marks the time for Fajr (dawn), Dhuhr, Asr, Maghrib (sunset), and Isha. Hearing it can remind you when to stop or start eating during Ramadan.",
    bodyAr: "نداء الصلاة خمس مرات في اليوم",
  },
  fivePrayers: {
    title: "Five daily prayers • الصلوات الخمس",
    body: "Fajr (dawn), Dhuhr (noon), Asr (afternoon), Maghrib (sunset), Isha (night). Muslims pray at these times. For fasting: Fajr is when the fast begins; Maghrib is when you break the fast (iftar).",
    bodyAr: "الفجر والظهر والعصر والمغرب والعشاء",
  },
  imFasting: {
    title: "I'm fasting",
    body: "Tap this after you've finished your pre-dawn meal (suhoor) and the fast has begun. It tells the app you're fasting today so you can later log breaking fast or marking the day complete.",
    bodyAr: "أنا صائم بعد السحور",
  },
  breakMyFast: {
    title: "Break my fast",
    body: "Tap when you're ending your fast at sunset (Maghrib/iftar time)—or earlier if you need to break fast for health reasons. You'll choose a reason to log. Only shown when you've already tapped \"I'm fasting\" today.",
    bodyAr: "أفطر عند المغرب",
  },
  markComplete: {
    title: "Mark complete / I fasted today",
    body: "Use this when you've completed a full day of fasting (from dawn to sunset). It logs the day as successfully fasted. If you broke the fast early, use \"I broke my fast\" instead.",
    bodyAr: "تم صيام اليوم",
  },
  brokeFast: {
    title: "I broke my fast",
    body: "Use this if you had to end your fast before sunset (e.g. illness, travel, or need). You'll pick a reason so the app can track it. Your day won't count as 'completed' but your effort is still recorded.",
    bodyAr: "أفطرت قبل المغرب",
  },
  fastingPeriod: {
    title: "Fasting period",
    body: "Between dawn (Fajr) and sunset (Maghrib)—no food or drink. This countdown shows time left until you can break your fast at Maghrib.",
    bodyAr: "من الفجر إلى المغرب لا أكل ولا شراب",
  },
  eatingPeriod: {
    title: "Eating period",
    body: "Between sunset (Maghrib) and the next dawn (Fajr). You can eat and drink now. The countdown shows time left until Suhoor end (cut-off)—after that, the next fast begins.",
    bodyAr: "بعد المغرب حتى الفجر يمكن الأكل والشرب",
  },
  goalsUntilRamadan: {
    title: "Goals until Ramadan",
    body: "Intentions or habits you want to complete before Ramadan starts—e.g. read Quran, give charity, try suhoor recipes, or learn about the month. Helps you prepare spiritually and practically.",
    bodyAr: "أهداف قبل رمضان",
  },
  ramadanMubarak: {
    title: "Ramadan Mubarak • رمضان مبارك",
    body: "A greeting meaning 'Blessed Ramadan.' Said at the start of the month to wish others a blessed and successful fast.",
    bodyAr: "تهنئة بقدوم رمضان",
  },
  ayyamAlBeed: {
    title: "Ayyam al-Beed • أيام البيض",
    body: "The 'white days'—13th, 14th, and 15th of each Islamic month (full moon period). Voluntary fasting on these days is a Sunnah (recommended) practice.",
    bodyAr: "صيام أيام البيض سنة",
  },
  todayMissions: {
    title: "Today's missions",
    body: "Small, actionable steps for your fasting day: start fasting, log meals, add a note, read a hadith, and complete or break your fast. Tap an item to open the right page.",
    bodyAr: "مهام اليوم",
  },
  hijriDate: {
    title: "Hijri date",
    body: "The Islamic (lunar) calendar date. Ramadan and other Islamic months follow this calendar. 'AH' means 'After Hijrah' (the Prophet's migration to Medina).",
    bodyAr: "التاريخ الهجري",
  },
  prayerTimes: {
    title: "Prayer times",
    body: "The five daily prayer times for your location: Fajr (dawn), Dhuhr, Asr, Maghrib (sunset), Isha. Fasting starts at Fajr and ends at Maghrib. Times vary by location and season.",
    bodyAr: "أوقات الصلاة",
  },
} as const;
