import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { readFile, stat } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { server } from '../server.mjs';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const html = await readFile(resolve(root, 'index.html'), 'utf8');
const styles = await readFile(resolve(root, 'styles.css'), 'utf8');
const js = await readFile(resolve(root, 'js/main.js'), 'utf8');

for (const expected of [
  'DAN', 'GERWIN', 'Mask.png', 'Me.png', 'SWAM', 'Salt Water Algae',
  'Casmy', 'dangerwinmolo05@gmail.com', 'https://github.com/dangerwin',
  'https://www.facebook.com/share/1CX4QhW4NZ/', 'UI/UX BASICS',
  'SPORTSWEAR DESIGN', 'CONTINUOUS LEARNING', 'ADAPTABLE & DRIVEN'
]) {
  assert.ok(html.toLowerCase().includes(expected.toLowerCase()), `Missing site content: ${expected}`);
}
assert.match(html, /data-profile/);
assert.match(html, /data-profile[^>]*aria-pressed="false"/);
assert.match(html, /id="gerwin-lettering"/);
assert.match(html, /id="projects"/);
assert.match(html, /project-visual/);
assert.match(js, /setupLettering/);
assert.match(js, /setupProfile/);
assert.match(styles, /prefers-reduced-motion/);
assert.doesNotMatch(html, /mriduljain|Mridul|mridulpfp|index-Cws5ERoW/);
assert.doesNotMatch(html, /href="(?!#)[^"]*(?:undefined|null)"/);

// All relative stylesheet, image, icon and JavaScript references resolve.
for (const [, relative] of html.matchAll(/(?:src|href)="(\.\/[^"?#]+)"/g)) {
  const info = await stat(resolve(root, relative));
  assert.ok(info.isFile(), `Broken local HTML reference: ${relative}`);
}

const files = [
  'index.html', 'styles.css', 'favicon.svg', 'package.json', 'server.mjs',
  'js/main.js', 'js/lettering.js', 'js/profile.js',
  'styles/lettering.css', 'styles/profile.css',
  'Assets/Mask.png', 'Assets/Me.png'
];
for (const file of files) {
  const info = await stat(resolve(root, file));
  assert.ok(info.isFile() && info.size > 0, `File missing or empty: ${file}`);
}

for (const file of ['server.mjs', 'js/main.js', 'js/lettering.js', 'js/profile.js']) {
  execFileSync(process.execPath, ['--check', resolve(root, file)]);
}

await new Promise((accept) => server.listen(0, '127.0.0.1', accept));
try {
  for (const file of files.filter((path) => path !== 'package.json' && path !== 'server.mjs')) {
    const uri = file === 'index.html' ? '/' : `/${file}`;
    const response = await fetch(`http://127.0.0.1:${server.address().port}${uri}`);
    assert.equal(response.status, 200, `${uri} returned HTTP ${response.status}`);
    assert.ok((await response.arrayBuffer()).byteLength > 0, `Empty HTTP response: ${uri}`);
  }
  const missingResponse = await fetch(`http://127.0.0.1:${server.address().port}/missing.png`);
  assert.equal(missingResponse.status, 404);
} finally {
  await new Promise((accept) => server.close(accept));
}

console.log(`Passed: personalized content, valid JS modules, ${files.length} required files, and local HTTP asset checks.`);
