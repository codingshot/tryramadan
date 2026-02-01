/**
 * Shared tooltip content for Suhoor, Iftar, and related eating times.
 * Used so people can learn what each term means on hover.
 */

export const EATING_TIME_TOOLTIPS = {
  suhoor: {
    title: "Suhoor • السحور",
    body: "The pre-dawn meal eaten before Fajr (dawn) prayer. It's the last chance to eat and drink before the day's fast begins. The Prophet (peace be upon him) said there is blessing in suhoor—eat something even if it's just a date or water.",
  },
  iftar: {
    title: "Iftar • الإفطار",
    body: "The meal at sunset (Maghrib) when Muslims break their fast. Traditionally started with dates and water, then Maghrib prayer, then the main meal. Iftar marks the end of the daily fast and is often shared with family or community.",
  },
  suhoorEnds: {
    title: "Suhoor ends • نهاية السحور",
    body: "Fajr (dawn) prayer time. After this moment, eating and drinking are not allowed until Maghrib. Finish your suhoor and seal your water before Fajr.",
  },
  iftarTime: {
    title: "Iftar time • وقت الإفطار",
    body: "Maghrib (sunset) prayer time. This is when you may break your fast. Many Muslims break fast with dates and water, then pray Maghrib, then enjoy the main meal.",
  },
  eatCutoff: {
    title: "Eat cutoff • موعد التوقف",
    body: "Same as Fajr—the cutoff time for eating and drinking. After this, the fast has begun.",
  },
  breakFast: {
    title: "Break fast • الفطور",
    body: "To end the day's fast at Maghrib. Breaking fast with dates and water is a Sunnah (Prophetic tradition) followed worldwide.",
  },
  untilSuhoor: {
    title: "Until Suhoor",
    body: "Time until the next pre-dawn meal (suhoor). During the eating window, you can eat and drink until Fajr, when the next fast begins.",
  },
  untilIftar: {
    title: "Until Iftar",
    body: "Time until sunset (Maghrib), when you break your fast. Iftar is the meal that ends the day's fast—traditionally started with dates and water.",
  },
  fajr: {
    title: "Fajr • الفجر",
    body: "Dawn prayer. Fasting begins at Fajr—no food or drink until Maghrib. Suhoor should be finished before Fajr.",
  },
  maghrib: {
    title: "Maghrib • المغرب",
    body: "Sunset prayer. Time to break your fast (iftar). Many break fast with dates and water, pray Maghrib, then have the main meal.",
  },
  dhuhr: {
    title: "Dhuhr • الظهر",
    body: "Noon prayer (when the sun passes the meridian). One of the five daily prayers. Fasting continues until Maghrib.",
  },
  asr: {
    title: "Asr • العصر",
    body: "Afternoon prayer (mid-afternoon). One of the five daily prayers. The fast continues until sunset (Maghrib).",
  },
  isha: {
    title: "Isha • العشاء",
    body: "Night prayer (after twilight). One of the five daily prayers. Often prayed after iftar and before the next suhoor.",
  },
} as const;
