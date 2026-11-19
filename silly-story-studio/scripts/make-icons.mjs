// Renders public/favicon.svg into the PNG app icons the PWA manifest needs.
// Requires Playwright with Chromium (`npm i -D playwright && npx playwright install chromium`).
// The generated PNGs are committed, so you only need this if you change the icon.
import { readFile, writeFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const require = createRequire(import.meta.url);
const { chromium } = require('playwright');

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const svg = await readFile(path.join(root, 'public/favicon.svg'), 'utf8');

// Maskable icons need a full-bleed background with the artwork inside the central safe zone.
const maskable = svg
  .replace('rx="112"', 'rx="0"')
  .replace(/<g stroke=/, '<g transform="translate(51 51) scale(0.8)"><g stroke=')
  .replace(/<\/svg>\s*$/, '</g></svg>');

const targets = [
  { file: 'icons/icon-192.png', size: 192, src: svg },
  { file: 'icons/icon-512.png', size: 512, src: svg },
  { file: 'icons/apple-touch-icon.png', size: 180, src: svg.replace('rx="112"', 'rx="0"') },
  { file: 'icons/maskable-512.png', size: 512, src: maskable },
];

const browser = await chromium.launch();
const page = await browser.newPage({ deviceScaleFactor: 1 });
for (const t of targets) {
  await page.setViewportSize({ width: t.size, height: t.size });
  await page.setContent(
    `<html><body style="margin:0;background:transparent">${t.src.replace('<svg ', `<svg width="${t.size}" height="${t.size}" `)}</body></html>`,
  );
  const buf = await page.screenshot({ omitBackground: true, clip: { x: 0, y: 0, width: t.size, height: t.size } });
  await writeFile(path.join(root, 'public', t.file), buf);
  console.log('wrote', t.file);
}
await browser.close();
