#!/usr/bin/env node
/**
 * Move the host config files Astro copies from public/ into dist/docs/ up to
 * dist/, the root of the Worker's static assets.
 *
 * The site is built into dist/docs (Astro's outDir) so its files sit at the
 * /docs/... paths the Worker receives, but Workers only reads `_redirects`
 * and `_headers` at the top of the assets directory (dist/, see
 * wrangler.jsonc). Left in dist/docs they'd be ignored.
 *
 * Usage: node scripts/hoist-host-files.js  # runs after `astro build`
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const assetsDir = path.join(root, 'dist');
const outDir = path.join(assetsDir, 'docs');

for (const name of ['_redirects', '_headers']) {
  const from = path.join(outDir, name);
  if (!fs.existsSync(from)) {
    console.error(`Error: ${path.relative(root, from)} not found; run astro build first.`);
    process.exit(1);
  }
  fs.renameSync(from, path.join(assetsDir, name));
  console.log(`Moved ${name} to dist/`);
}
