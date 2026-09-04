/**
 * Optional (sunnah and nafl) prayers around the five daily prayers.
 * Used for the prayer checklist dropdown and tracking.
 * Storage key is used in tryramadan-prayer-tracker as the checkbox key.
 */

export interface OptionalPrayer {
  id: string;
  label: string;
  rakah?: string;
  description: string;
  /** Which fard prayer this optional prayer is associated with. */
  parentPrayer: "fajr" | "dhuhr" | "asr" | "maghrib" | "isha";
}

/** Optional prayers: sunnah mu'akkadah and witr. Order follows the day (before Fajr through after Isha / Witr). */
export const OPTIONAL_PRAYERS: OptionalPrayer[] = [
  {
    id: "sunnah_before_fajr",
    label: "Sunnah before Fajr",
    rakah: "2 rakʿah",
    description:
      "Very strongly emphasized sunnah (sunnah mu'akkadah). After adhan of Fajr, before the two fard rakʿahs; the Prophet ﷺ never left it except when travelling.",
    parentPrayer: "fajr",
  },
  {
    id: "sunnah_before_dhuhr",
    label: "Sunnah before Ẓuhr",
    rakah: "2 or 4 rakʿah",
    description:
      "After adhan and before the fard of Ẓuhr. Strongly recommended; brings great reward and protection of the main prayer.",
    parentPrayer: "dhuhr",
  },
  {
    id: "sunnah_after_dhuhr",
    label: "Sunnah after Ẓuhr",
    rakah: "2 rakʿah",
    description:
      "Immediately after the fard of Ẓuhr. Part of the twelve famous sunnah rakʿāt that build a house in Jannah.",
    parentPrayer: "dhuhr",
  },
  {
    id: "sunnah_after_maghrib",
    label: "Sunnah after Maghrib",
    rakah: "2 rakʿah",
    description: "Immediately after the three fard of Maghrib. Also from the regular emphasized sunnah.",
    parentPrayer: "maghrib",
  },
  {
    id: "sunnah_after_isha",
    label: "Sunnah after ʿIshā'",
    rakah: "2 rakʿah",
    description: "After the four fard of ʿIshā'. Often followed by Witr.",
    parentPrayer: "isha",
  },
  {
    id: "witr",
    label: "Witr",
    rakah: "1, 3, 5, 7, 9 or 11 rakʿah",
    description:
      "Technically nafl in most madhhabs, but very strongly stressed (wājib according to Ḥanafīs). After ʿIshā' and its sunnah, or after Tahajjud. Closes the night prayers with an odd number.",
    parentPrayer: "isha",
  },
];

export const OPTIONAL_PRAYER_IDS = OPTIONAL_PRAYERS.map((p) => p.id);

/** Get optional prayers grouped by parent fard prayer. */
export function getOptionalPrayersByParent(parentPrayer: string): OptionalPrayer[] {
  return OPTIONAL_PRAYERS.filter((p) => p.parentPrayer === parentPrayer.toLowerCase());
}
