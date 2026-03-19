import sharp from 'sharp';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { mkdirSync } from 'fs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const outputDir = join(__dirname, '..', 'public');
const outputPath = join(outputDir, 'ogp.png');

mkdirSync(outputDir, { recursive: true });

const WIDTH = 1200;
const HEIGHT = 630;

// X logo path from App.svelte (viewBox 0 0 24 24)
const X_LOGO_PATH =
  'M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.747l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z';

const svg = `
<svg width="${WIDTH}" height="${HEIGHT}" viewBox="0 0 ${WIDTH} ${HEIGHT}"
     xmlns="http://www.w3.org/2000/svg">
  <!-- Background -->
  <rect width="${WIDTH}" height="${HEIGHT}" fill="#000000"/>

  <!-- Red top accent bar -->
  <rect x="0" y="0" width="${WIDTH}" height="8" fill="#DC2626"/>

  <!-- Red bottom accent bar -->
  <rect x="0" y="${HEIGHT - 8}" width="${WIDTH}" height="8" fill="#DC2626"/>

  <!-- X logo: original viewBox 24x24, scaled to ~180px, positioned left-center -->
  <g transform="translate(80, 225) scale(7.5)" fill="#FFFFFF">
    <path d="${X_LOGO_PATH}"/>
  </g>

  <!-- Vertical divider -->
  <line x1="360" y1="120" x2="360" y2="510" stroke="#27272A" stroke-width="2"/>

  <!-- Main headline -->
  <text x="430" y="290"
        font-family="'Helvetica Neue', Arial, 'Hiragino Kaku Gothic ProN', 'Noto Sans JP', sans-serif"
        font-size="110"
        font-weight="900"
        fill="#FFFFFF"
        dominant-baseline="middle">X落ちてる？</text>

  <!-- Red alert badge -->
  <rect x="430" y="340" width="220" height="52" rx="26" fill="#DC2626"/>
  <text x="540" y="375"
        font-family="'Helvetica Neue', Arial, 'Hiragino Kaku Gothic ProN', 'Noto Sans JP', sans-serif"
        font-size="26"
        font-weight="700"
        fill="#FFFFFF"
        text-anchor="middle">障害速報</text>

  <!-- Subtitle -->
  <text x="430" y="440"
        font-family="'Helvetica Neue', Arial, 'Hiragino Kaku Gothic ProN', 'Noto Sans JP', sans-serif"
        font-size="30"
        font-weight="400"
        fill="#71717A">X障害時の緊急掲示板 on Nostr</text>
</svg>
`.trim();

await sharp(Buffer.from(svg)).png().toFile(outputPath);

console.log(`OGP image generated: ${outputPath}`);
