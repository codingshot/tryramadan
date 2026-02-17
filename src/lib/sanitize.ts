/**
 * Sanitization utilities for user input.
 * Use when displaying in non-React context (document.title, meta tags) or as defense-in-depth.
 * For React JSX {value}, React already escapes — these are optional.
 *
 * @see docs/SECURITY-XSS-TESTING-GUIDE.md
 */

/**
 * Strip HTML/script characters from user input.
 * Use when setting document.title, meta tags, or aria-label from user content.
 */
export function stripHtml(unsafe: string): string {
  if (typeof unsafe !== "string") return "";
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

/**
 * Validate that a string is safe for use in href (no javascript:, data:, vbscript:).
 */
export function isSafeUrl(s: string): boolean {
  const trimmed = s.trim().toLowerCase();
  // Reject script-like URL schemes (we check the prefix to reject, not to use as URL)
  if (
    trimmed.startsWith("javascript:") || // eslint-disable-line no-script-url -- checking prefix to reject
    trimmed.startsWith("data:") ||
    trimmed.startsWith("vbscript:")
  )
    return false;
  return true;
}
