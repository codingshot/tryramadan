/**
 * Optional food image: resize and compress for storage in food log (localStorage).
 * Max dimension and JPEG quality keep data URL size reasonable.
 */

const MAX_SIZE = 400;
const JPEG_QUALITY = 0.82;

/** Resize image to max dimension (never upscale) and return as JPEG data URL, or null on error. */
export function resizeImageToDataUrl(file: File): Promise<string | null> {
  if (!file.type.startsWith("image/")) return Promise.resolve(null);
  return new Promise((resolve) => {
    const url = URL.createObjectURL(file);
    const img = document.createElement("img");
    img.onload = () => {
      URL.revokeObjectURL(url);
      try {
        const w = img.naturalWidth;
        const h = img.naturalHeight;
        if (!w || !h) {
          resolve(null);
          return;
        }
        const scale = Math.min(1, MAX_SIZE / w, MAX_SIZE / h);
        const width = Math.round(w * scale);
        const height = Math.round(h * scale);
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          resolve(null);
          return;
        }
        ctx.drawImage(img, 0, 0, width, height);
        const dataUrl = canvas.toDataURL("image/jpeg", JPEG_QUALITY);
        resolve(dataUrl);
      } catch {
        resolve(null);
      }
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      resolve(null);
    };
    img.src = url;
  });
}
