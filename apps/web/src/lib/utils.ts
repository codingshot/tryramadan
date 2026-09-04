import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Format a Date as local YYYY-MM-DD. Use for calendar keys and "today" so behavior is correct in all timezones. */
export function toLocalDateString(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/** Current time in a given IANA timezone (for display and comparisons). */
export function getNowInTimezone(timeZone: string): { hours: number; minutes: number; seconds: number } {
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    hour12: false,
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
  const parts = formatter.formatToParts(new Date());
  const get = (type: string) => parseInt(parts.find((p) => p.type === type)?.value ?? "0", 10);
  return { hours: get("hour"), minutes: get("minute"), seconds: get("second") };
}

/** Seconds since midnight in the given IANA timezone (for countdown math). */
export function getNowSecondsSinceMidnightInTimezone(timeZone: string): number {
  const n = getNowInTimezone(timeZone);
  return n.hours * 3600 + n.minutes * 60 + n.seconds;
}

/** Parse "HH:mm" or "HH:mm:ss" to seconds since midnight. Handles optional suffix after space (e.g. "05:15 (EAT)"). */
export function timeStringToSecondsSinceMidnight(timeStr: string): number {
  const clean = (timeStr ?? "").trim().indexOf(" ") >= 0
    ? (timeStr ?? "").trim().slice(0, (timeStr ?? "").trim().indexOf(" ")).trim()
    : (timeStr ?? "").trim();
  const parts = clean.split(":").map((p) => parseInt(p, 10));
  const h = Number.isFinite(parts[0]) ? parts[0] : 0;
  const m = Number.isFinite(parts[1]) ? parts[1] : 0;
  const s = Number.isFinite(parts[2]) ? parts[2] : 0;
  return h * 3600 + m * 60 + s;
}

/** Seconds until the next occurrence of time (HH:mm) in the same timezone day. If that time has passed today, returns seconds until next day same time. */
export function secondsUntilTimeInTimezone(nowSecondsSinceMidnight: number, timeSecondsSinceMidnight: number): number {
  let diff = timeSecondsSinceMidnight - nowSecondsSinceMidnight;
  if (diff <= 0) diff += 24 * 3600;
  return diff;
}

/** Format seconds as "Xh Xm" or "Xm" for display. past=true for "ago" label. */
export function formatSecondsAsTimeLabel(seconds: number, past = false): string {
  const abs = Math.abs(seconds);
  if (past && abs < 60) return "just now";
  const h = Math.floor(abs / 3600);
  const m = Math.floor((abs % 3600) / 60);
  if (h > 0) return past ? `${h}h ${m}m ago` : `in ${h}h ${m}m`;
  return past ? `${m}m ago` : `in ${m}m`;
}

/** Today's date as YYYY-MM-DD in the given IANA timezone. Use when "today" should follow location, not system clock. */
export function getTodayStringInTimezone(timeZone: string): string {
  if (!timeZone || typeof timeZone !== "string" || !timeZone.trim()) {
    return toLocalDateString(new Date());
  }
  try {
    return new Date().toLocaleDateString("en-CA", { timeZone });
  } catch {
    return toLocalDateString(new Date());
  }
}

function copyViaExecCommand(text: string): boolean {
  try {
    const el = document.createElement("textarea");
    el.value = text;
    el.setAttribute("readonly", "");
    el.style.position = "fixed";
    el.style.top = "0";
    el.style.left = "0";
    el.style.width = "2em";
    el.style.height = "2em";
    el.style.padding = "0";
    el.style.border = "none";
    el.style.outline = "none";
    el.style.boxShadow = "none";
    el.style.background = "transparent";
    el.style.opacity = "0";
    el.style.pointerEvents = "none";
    document.body.appendChild(el);
    el.focus();
    el.select();
    el.setSelectionRange(0, text.length);
    const ok = document.execCommand("copy");
    document.body.removeChild(el);
    return !!ok;
  } catch {
    return false;
  }
}

/** Copy text to clipboard. Works in secure and non-secure contexts; falls back to execCommand if needed. Returns true if successful. */
export function copyToClipboard(text: string): Promise<boolean> {
  if (typeof text !== "string" || !text) return Promise.resolve(false);
  if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
    try {
      return navigator.clipboard
        .writeText(text)
        .then(() => true)
        .catch(() => copyViaExecCommand(text));
    } catch {
      return Promise.resolve(copyViaExecCommand(text));
    }
  }
  return Promise.resolve(copyViaExecCommand(text));
}
