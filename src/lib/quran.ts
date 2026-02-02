/**
 * Quran reading plan: API helpers for api.quran.com (Quran.com).
 * Used for day-by-day juz plan with translation preview.
 */
import { API_CONFIG, EXTERNAL_LINKS } from "@/lib/config";

export const QURAN_API_BASE = API_CONFIG.quranApi;
/** Saheeh International (English) */
export const DEFAULT_TRANSLATION_ID = 20;

/** Quran.com URL for a juz (e.g. open juz 1 with translation). */
export function getQuranComJuzUrl(juzNumber: number): string {
  return `${EXTERNAL_LINKS.quran}/juz/${juzNumber}`;
}

/** Quran.com URL for a chapter (surah). */
export function getQuranComChapterUrl(chapterNumber: number): string {
  return `${EXTERNAL_LINKS.quran}/${chapterNumber}`;
}

export interface QuranVerse {
  id: number;
  verse_key: string;
  verse_number: number;
  text_uthmani: string;
  translations?: { resource_id: number; text: string }[];
  page_number: number;
  juz_number: number;
}

export interface VersesByJuzResponse {
  verses: QuranVerse[];
  pagination: {
    per_page: number;
    current_page: number;
    next_page: number | null;
    total_pages: number;
    total_records: number;
  };
}

/** Fetch verses for a juz with Arabic + English translation (paginated). */
export async function fetchVersesByJuz(
  juzNumber: number,
  page = 1,
  perPage = 15,
  translationId = DEFAULT_TRANSLATION_ID
): Promise<VersesByJuzResponse> {
  const params = new URLSearchParams({
    translations: String(translationId),
    language: "en",
    per_page: String(perPage),
    page: String(page),
    fields: "text_uthmani,translations",
  });
  const res = await fetch(
    `${QURAN_API_BASE}/verses/by_juz/${juzNumber}?${params}`
  );
  if (!res.ok) throw new Error("Failed to fetch verses");
  const data = await res.json();
  return {
    verses: data.verses ?? [],
    pagination: data.pagination ?? { per_page: perPage, current_page: page, next_page: null, total_pages: 1, total_records: 0 },
  };
}

/** Total juz in the Quran. */
export const TOTAL_JUZ = 30;
