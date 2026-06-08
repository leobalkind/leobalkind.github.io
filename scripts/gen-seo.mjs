// =============================================================================
// Generates public/sitemap.xml and public/robots.txt from the games registry,
// so search engines can discover all 15 games (the QA pass found neither file
// existed). Registry-driven → never drifts from the actual game list.
//
//   node scripts/gen-seo.mjs
//
// Files land in public/, which Vite copies to the dist root on build.
// =============================================================================
import { writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
import { GAMES } from '../src/shared/games.js';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const ORIGIN = 'https://leobalkind.github.io';

// Build a clean URL list: hub + each game's directory (drop index.html).
const today = new Date().toISOString().slice(0, 10);
const urls = [
  { loc: `${ORIGIN}/`, priority: '1.0', changefreq: 'weekly' },
  ...GAMES.map((g) => ({
    loc: `${ORIGIN}${g.path.replace(/index\.html$/, '')}`,
    priority: '0.8',
    changefreq: 'weekly',
  })),
];

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map(
    (u) =>
      `  <url>\n    <loc>${u.loc}</loc>\n    <lastmod>${today}</lastmod>\n` +
      `    <changefreq>${u.changefreq}</changefreq>\n    <priority>${u.priority}</priority>\n  </url>`
  )
  .join('\n')}
</urlset>
`;

const robots = `# BORKADE — free pixel-pug arcade. No ads, no tracking.
User-agent: *
Allow: /

Sitemap: ${ORIGIN}/sitemap.xml
`;

writeFileSync(resolve(ROOT, 'public/sitemap.xml'), sitemap);
writeFileSync(resolve(ROOT, 'public/robots.txt'), robots);
console.log(`Wrote public/sitemap.xml (${urls.length} urls) and public/robots.txt`);
