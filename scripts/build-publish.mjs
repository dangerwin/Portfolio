/**
 * Produce a small, public, completely self-contained index.html.
 * The local-only player UI is embedded without embedding the copyrighted MP3.
 * The soundtrack remains in .source/assets and is not committed to GitHub.
 *
 * Requirements: bundled source files + Me.optimized.webp in Portraits.
 * Usage: node scripts/build-publish.mjs
 * Writes the public index.html one level above this private source directory.
 * Optional: node scripts/build-publish.mjs <output.html>
 */
import { readFile, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const read = (p) => readFile(resolve(root, p));
const txt = async (p) => (await read(p)).toString('utf8');
const dataUri = async (p, mime) => `data:${mime};base64,${(await read(p)).toString('base64')}`;

function replaceExactly(source, before, after, occurrences = 1) {
  const count = source.split(before).length - 1;
  if (count !== occurrences) {
    throw new Error(`Expected ${occurrences} occurrence(s) of ${before.slice(0, 100)}, found ${count}`);
  }
  return source.replaceAll(before, after);
}

let html = await txt('index-linked.html');
let react = await txt('assets/index-dan.js');
let css = await txt('assets/index-BOs8hB4_.css');
const tweaks = await txt('overrides/dan-tweaks.css');
const playerCss = await txt('overrides/music-player.css');
const playerJs = await txt('overrides/music-player.js');
const playerHtml = await txt('overrides/music-player.html');

const keyframesStart = css.indexOf('@keyframes petal-fall{');
const keyframesEnd = css.indexOf('::selection{', keyframesStart);
if (keyframesStart < 0 || keyframesEnd < 0) throw new Error('Missing original animation marker');
css = css.slice(0, keyframesStart) + css.slice(keyframesEnd);

// Optimized portrait, theme banners, and pluck sound remain local/offline.
for (const [before, path, mime] of [
  ['./Portraits/Me.optimized.webp', 'Portraits/Me.optimized.webp', 'image/webp'],
  ['./Portraits/4ef04f771f564738378377606ac3fee2.jpg', 'Portraits/4ef04f771f564738378377606ac3fee2.jpg', 'image/jpeg'],
  ['./Portraits/be09b0c53fd695a1f16c50f072cc0307.jpg', 'Portraits/be09b0c53fd695a1f16c50f072cc0307.jpg', 'image/jpeg'],
  ['./assets/click-effect-CaN82RwL.wav', 'assets/click-effect-CaN82RwL.wav', 'audio/wav'],
]) {
  react = replaceExactly(react, before, await dataUri(path, mime));
}
for (const icon of ['html5', 'css3', 'javascript', 'figma', 'git', 'github']) {
  react = replaceExactly(react, `./icons/${icon}.svg`, await dataUri(`icons/${icon}.svg`, 'image/svg+xml'));
}

// Keep the original grid, theme handling, and interactive GERWIN strings.
html = replaceExactly(html, '<meta name="robots" content="noindex,nofollow">', '<meta name="robots" content="index,follow">');
html = replaceExactly(html, 'href="./favicon.svg"', `href="${await dataUri('favicon.svg', 'image/svg+xml')}"`);
for (const [pattern, expected] of [
  [/<script defer src="\.\/assets\/index-dan\.js"><\/script>/g, 1],
  [/<link rel="stylesheet"[^>]*href="\.\/(?:assets\/index-BOs8hB4_\.css|overrides\/dan-tweaks\.css)"[^>]*>/g, 2],
  [/<link rel="preload" as="image" href="\.\/[^">]+"[^>]*>/g, 3],
]) {
  const matches = [...html.matchAll(pattern)];
  if (matches.length !== expected) throw new Error(`Unexpected HTML component count: ${matches.length}, expected ${expected}`);
  html = html.replace(pattern, '');
}

const safeScript = (js) => js.replace(/<\/script/gi, '<\\/script');
html = html.replace('</head>', () => `<style>\n${css}\n${tweaks}\n${playerCss}\n</style>\n</head>`);
html = html.replace('</body>', () => `${playerHtml}\n<script>\n${safeScript(react)}\n</script>\n<script>\n${safeScript(playerJs)}\n</script>\n</body>`);

for (const unwanted of [
  'dan-background-audio', 'data:audio/mpeg',
  'Portraits/Me.png', 'bgdark1.webp', 'bglight1.webp',
  'petal-fall', 'profile-hover', 'Mask.png',
]) {
  if (html.includes(unwanted)) throw new Error(`Unwanted artifact in public HTML: ${unwanted}`);
}
if (!html.includes('id="root"') || !html.includes('data:image/webp;base64,')) {
  throw new Error('React mount or optimized profile image is missing');
}
if (!html.includes('id="dan-media-player"') || !html.includes('id="dan-media-audio"')) {
  throw new Error('Local soundtrack player controls were not embedded');
}

const destination = process.argv[2]
  ? resolve(process.cwd(), process.argv[2])
  : resolve(root, '..', 'index.html');
await writeFile(destination, html, 'utf8');
console.log(`Built ${destination} (${(Buffer.byteLength(html) / 1048576).toFixed(2)} MiB)`);
