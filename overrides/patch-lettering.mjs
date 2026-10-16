/**
 * Write GERWIN with the reference's original interactive five-string canvas.
 *
 * Usage (run after `node scripts/personalize.mjs`):
 *   node overrides/patch-lettering.mjs
 *   node overrides/patch-lettering.mjs --check  # validate without writing
 *
 * The original T7() renderer, its five plucked audio strings, requestAnimationFrame
 * physics, bridge pins, mouse/touch input, color handling, and responsive canvas
 * layout are intentionally left intact. Only the v7 and x7 centerline arrays
 * are replaced. Both arrays describe ONE continuous pen/string stroke.
 */

import { readFile, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { Script } from 'node:vm';

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const bundlePath = resolve(projectRoot, 'assets/index-dan.js');
const checkOnly = process.argv.slice(2).includes('--check');
if (process.argv.slice(2).some(argument => argument !== '--check')) {
  throw new Error('Unknown argument. Usage: node overrides/patch-lettering.mjs [--check]');
}

// Single-stroke, mono-line capital lettering. These hand-placed 2D outlines
// deliberately retrace some E/R/I segments, exactly as a continuous filament
// must when it changes branches. A gentle wire connector joins each glyph.
// These are local 600×100 coordinates, with approximately 100 units/letter.
const glyphs = [
  {
    letter: 'G',
    points: [
      [6, 50], [8, 34], [17, 18], [36, 10], [56, 10], [73, 20],
      [64, 14], [48, 10], [29, 12], [14, 25], [8, 44], [8, 62],
      [17, 81], [35, 91], [55, 91], [73, 80], [76, 62],
      [76, 56], [48, 56], [76, 56], [76, 50],
    ],
  },
  {
    letter: 'E',
    points: [
      [104, 50], [108, 10], [180, 10], [108, 10], [108, 49],
      [166, 49], [108, 49], [108, 91], [180, 91],
    ],
  },
  {
    letter: 'R',
    points: [
      [204, 50], [206, 10], [241, 10], [261, 16], [276, 30],
      [273, 41], [258, 52], [242, 54], [206, 54], [206, 91],
      [206, 54], [242, 54], [279, 91],
    ],
  },
  {
    letter: 'W',
    points: [
      [300, 51], [307, 10], [320, 91], [341, 42], [358, 91],
      [381, 10], [387, 51],
    ],
  },
  {
    letter: 'I',
    points: [
      [400, 51], [407, 10], [476, 10], [442, 10], [442, 91],
      [407, 91], [476, 91], [476, 51],
    ],
  },
  {
    letter: 'N',
    points: [
      [501, 50], [506, 91], [506, 10], [581, 91], [581, 10],
      [593, 51],
    ],
  },
];

function fail(message) {
  throw new Error(`GERWIN lettering: ${message}`);
}

function assert(value, message) {
  if (!value) fail(message);
}

function interpolateStroke(rawPoints, maxDistance = 11.5) {
  const result = [];
  for (const point of rawPoints) {
    if (result.length === 0) {
      result.push(point);
      continue;
    }
    const previous = result[result.length - 1];
    const dx = point[0] - previous[0];
    const dy = point[1] - previous[1];
    const distance = Math.hypot(dx, dy);
    // A Catmull-Rom curve (T2 in the original) receives relatively even
    // points, so long diagonal connectors do not look unnaturally curved.
    const steps = Math.max(1, Math.ceil(distance / maxDistance));
    for (let i = 1; i <= steps; i++) {
      const t = i / steps;
      result.push([previous[0] + dx * t, previous[1] + dy * t]);
    }
  }
  return result;
}

function roundCoordinate(number) {
  return Math.round(number * 100) / 100;
}

function buildCoordinates(view) {
  const mobile = view === 'mobile';
  // T7() uses a 1400×240 reference area on desktop and its own x7 mapping
  // for mobile: input x 175..445 maps to the centered 74vw/280px word area.
  const startX = mobile ? 175 : 420;
  const horizontalScale = mobile ? 270 / 600 : 0.96;
  const topY = mobile ? 110 : 52;
  const verticalScale = mobile ? 1.04 : 1.20;
  const first = mobile
    ? [[0, 115], [50, 115], [100, 115], [145, 115], [161, 122], [174, 146]]
    : [[0, 115], [100, 115], [220, 115], [330, 115], [399, 115]];
  const last = mobile
    ? [[448, 141], [495, 141], [610, 141], [710, 141], [800, 141]]
    : [[1010, 145], [1090, 145], [1240, 145], [1400, 145]];

  assert(glyphs.map(glyph => glyph.letter).join('') === 'GERWIN', 'wrong glyph order');

  const points = [...first];
  for (const glyph of glyphs) {
    for (const [x, y] of glyph.points) {
      points.push([startX + x * horizontalScale, topY + y * verticalScale]);
    }
  }
  points.push(...last);

  const dense = interpolateStroke(points).map(([x, y]) => ({
    x: roundCoordinate(x),
    y: roundCoordinate(y),
  }));

  assert(dense.length >= 140 && dense.length <= 850,
    `${view} path point count unexpectedly ${dense.length}`);
  assert(dense.every(({ x, y }) => Number.isFinite(x) && Number.isFinite(y)),
    `${view} path contains a non-finite coordinate`);
  assert(dense.every(({ x, y }) => x >= 0 && x <= (mobile ? 800 : 1400)
      && y >= 0 && y <= 240), `${view} path escapes the reference canvas`);

  // Every successive segment must be small enough to allow the original
  // Catmull-Rom interpolation to stay smooth, including connector strokes.
  assert(dense.every((point, index) => {
    if (index === 0) return true;
    return Math.hypot(point.x - dense[index - 1].x,
      point.y - dense[index - 1].y) <= 12;
  }), `${view} has a discontinuity`);

  return dense;
}

function encode(points) {
  return `[${points.map(({ x, y }) => `{x:${x},y:${y}}`).join(',')}]`;
}

// Only target arrays beside the actual original T7 parameters. This ensures
// unrelated React code, index-local.js and existing animations are untouched.
function extractArray(code, name, nextName) {
  const begin = `,${name}=[`;
  const end = `],${nextName}=`;
  const start = code.indexOf(begin);
  assert(start !== -1, `cannot locate ${name} declaration`);
  assert(code.indexOf(begin, start + begin.length) === -1,
    `ambiguous ${name} declaration`);
  const valueStart = start + begin.length - 1;
  const valueEnd = code.indexOf(end, valueStart);
  assert(valueEnd !== -1, `cannot locate end of ${name}`);
  const value = code.slice(valueStart, valueEnd + 1);
  assert(/^\[(?:\{x:-?\d+(?:\.\d+)?,y:-?\d+(?:\.\d+)?\},?)+\]$/.test(value),
    `${name} is not a supported original point array`);
  return { value, valueStart, valueEnd: valueEnd + 1 };
}

const source = await readFile(bundlePath, 'utf8');
assert(source.includes('function T7(){'), 'expected original T7() renderer');
assert(source.includes('const Ps=[{index:0,note:"D3"'), 'expected original five-string audio metadata');
assert(source.includes('T2(v7)') && source.includes('T2(x7)'),
  'renderer no longer consumes the original v7/x7 curves');

const originalDesktop = extractArray(source, 'v7', 'x7');
const originalMobile = extractArray(source, 'x7', 'b7');
const desktop = buildCoordinates('desktop');
const mobile = buildCoordinates('mobile');
const desktopCode = encode(desktop);
const mobileCode = encode(mobile);

const alreadyPatched = originalDesktop.value === desktopCode
  && originalMobile.value === mobileCode;
const notPatched = originalDesktop.value !== desktopCode
  && originalMobile.value !== mobileCode;
assert(alreadyPatched || notPatched,
  'only one lettering array is updated; regenerate the bundle first');

if (notPatched) {
  // Recognize this particular captured reference build, rather than silently
  // overwriting unexpected hand-edited coordinates after a future upgrade.
  assert(originalDesktop.value.startsWith('[{x:0,y:115},{x:160,y:115}')
    && originalDesktop.value.endsWith('{x:1400,y:145}]'),
  'unrecognized source desktop lettering; regenerate the original build');
  assert(originalMobile.value.startsWith('[{x:0,y:115},{x:50,y:115}')
    && originalMobile.value.endsWith('{x:800,y:140}]'),
  'unrecognized source mobile lettering; regenerate the original build');
}

let candidate = source;
// Work from right to left, so offsets calculated from the same original
// bundle remain correct after replacing arrays of different lengths.
for (const { range, replacement } of [
  { range: originalMobile, replacement: mobileCode },
  { range: originalDesktop, replacement: desktopCode },
]) {
  candidate = candidate.slice(0, range.valueStart) + replacement
    + candidate.slice(range.valueEnd);
}

// A production Vite bundle is a regular JS script; syntax-check it in-memory
// before touching the file, so a malformed patch cannot corrupt the output.
new Script(candidate, { filename: 'assets/index-dan.js' });
const checkDesktop = extractArray(candidate, 'v7', 'x7').value;
const checkMobile = extractArray(candidate, 'x7', 'b7').value;
assert(checkDesktop === desktopCode && checkMobile === mobileCode,
  'post-patch integrity check failed');

if (!checkOnly && !alreadyPatched) {
  await writeFile(bundlePath, candidate, 'utf8');
}

console.log(`GERWIN lettering ${checkOnly ? 'check passed' : alreadyPatched ? 'already patched' : 'patched'}: ${desktop.length} desktop and ${mobile.length} mobile curve points; original five-string interaction preserved.`);
