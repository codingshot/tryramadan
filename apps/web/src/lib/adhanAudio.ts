/**
 * Adhan (call to prayer) audio. Play at prayer times when user has enabled adhan sound.
 * Using a public domain / CDN adhan clip. Falls back to no audio if load fails.
 */
import { API_CONFIG } from "@/lib/config";

const ADHAN_AUDIO_URL = `${API_CONFIG.adhanAudio}/audio/abdul-basit/1.mp3`;

let audioInstance: HTMLAudioElement | null = null;

export function playAdhan(): void {
  if (typeof window === "undefined" || !window.Audio) return;
  try {
    if (audioInstance) {
      audioInstance.currentTime = 0;
      audioInstance.play().catch(() => {});
      return;
    }
    const audio = new Audio(ADHAN_AUDIO_URL);
    audioInstance = audio;
    audio.play().catch(() => {});
    audio.onended = () => {};
  } catch {
    // Ignore if audio fails (e.g. CORS, no support)
  }
}

export function stopAdhan(): void {
  if (audioInstance) {
    audioInstance.pause();
    audioInstance.currentTime = 0;
  }
}
