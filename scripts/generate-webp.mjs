#!/usr/bin/env node
/**
 * Generate WebP version of logo for smaller LCP. Run: npm run generate:webp
 * Requires: npm install --save-dev sharp
 * Output: public/logo.webp (used by HeroSection, Navbar, Footer via <picture>)
 */
import { readFileSync, existsSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');
const logoPng = join(root, 'src', 'assets', 'logo.png');
const logoWebp = join(root, 'public', 'logo.webp');

if (!existsSync(logoPng)) {
  console.warn('scripts/generate-webp.mjs: src/assets/logo.png not found');
  process.exit(1);
}

try {
  const sharp = (await import('sharp')).default;
  const buf = readFileSync(logoPng);
  await sharp(buf)
    .webp({ quality: 85, effort: 4 })
    .toFile(logoWebp);
  console.log('Generated public/logo.webp');
} catch (err) {
  if (err.code === 'ERR_MODULE_NOT_FOUND' || err.message?.includes('sharp')) {
    console.warn('Install sharp to generate WebP: npm install --save-dev sharp');
    process.exit(1);
  }
  throw err;
}
