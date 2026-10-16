/**
 * GERWIN — hand-traced, continuous-cord canvas lettering.
 *
 * No dependencies. The canvas's parent owns its dimensions; call
 * `const dispose = setupLettering(canvas)` after the element is in the DOM.
 * Calling dispose() removes all observers/listeners and cancels animation.
 */

const INK = [
  { color: 'rgba(210, 200, 178, 0.34)', width: 0.68 },
  { color: 'rgba(17, 21, 24, 0.93)', width: 1.62 },
  { color: 'rgba(166, 174, 178, 0.66)', width: 1.05 },
  { color: 'rgba(233, 222, 196, 0.76)', width: 0.85 },
  { color: 'rgba(234, 197, 90, 0.96)', width: 1.4 },
  { color: 'rgba(17, 20, 21, 0.88)', width: 1.7 },
  { color: 'rgba(226, 229, 226, 0.84)', width: 1.02 },
  { color: 'rgba(192, 157, 82, 0.73)', width: 1.13 },
  { color: 'rgba(238, 208, 129, 0.38)', width: 0.72 },
];

// Each character is built from hand-shaped open strokes, not browser fonts.
// M: move, L: line, C: cubic Bezier. Coordinates are in a 1 × 1 glyph box.
const GLYPHS = {
  G: [
    [
      ['M', 0.91, 0.16],
      ['C', 0.70, -0.015, 0.34, -0.020, 0.15, 0.19],
      ['C', -0.03, 0.38, 0.015, 0.78, 0.23, 0.90],
      ['C', 0.43, 1.045, 0.82, 0.97, 0.90, 0.71],
      ['L', 0.90, 0.55],
      ['L', 0.54, 0.55],
    ],
  ],
  E: [
    [
      ['M', 0.92, 0.075],
      ['L', 0.12, 0.075],
      ['C', 0.075, 0.29, 0.080, 0.67, 0.12, 0.935],
      ['L', 0.92, 0.935],
    ],
    [
      ['M', 0.13, 0.51],
      ['C', 0.34, 0.496, 0.58, 0.525, 0.80, 0.51],
    ],
  ],
  R: [
    [
      ['M', 0.105, 0.945],
      ['C', 0.075, 0.65, 0.095, 0.32, 0.105, 0.070],
      ['L', 0.54, 0.065],
      ['C', 0.85, 0.065, 0.985, 0.23, 0.89, 0.39],
      ['C', 0.82, 0.54, 0.57, 0.56, 0.12, 0.545],
    ],
    [
      ['M', 0.50, 0.545],
      ['C', 0.67, 0.68, 0.80, 0.84, 0.97, 0.945],
    ],
  ],
  W: [
    [
      ['M', 0.030, 0.065],
      ['C', 0.095, 0.31, 0.16, 0.73, 0.25, 0.94],
      ['C', 0.31, 0.80, 0.43, 0.43, 0.495, 0.29],
      ['C', 0.57, 0.50, 0.65, 0.79, 0.74, 0.94],
      ['C', 0.84, 0.69, 0.92, 0.29, 0.985, 0.065],
    ],
  ],
  I: [
    [
      ['M', 0.14, 0.07],
      ['C', 0.33, 0.065, 0.70, 0.084, 0.88, 0.07],
    ],
    [
      ['M', 0.51, 0.08],
      ['C', 0.48, 0.36, 0.52, 0.67, 0.51, 0.92],
    ],
    [
      ['M', 0.12, 0.935],
      ['C', 0.37, 0.924, 0.68, 0.945, 0.9, 0.935],
    ],
  ],
  N: [
    [
      ['M', 0.095, 0.945],
      ['C', 0.078, 0.69, 0.086, 0.34, 0.095, 0.075],
      ['C', 0.32, 0.35, 0.69, 0.79, 0.91, 0.945],
      ['C', 0.92, 0.63, 0.91, 0.31, 0.915, 0.075],
    ],
  ],
};

const WORD = 'GERWIN';
const GLYPH_RATIO = 0.73;
const LETTER_GAP_RATIO = 0.255;
const TOTAL_UNITS = WORD.length * GLYPH_RATIO + (WORD.length - 1) * LETTER_GAP_RATIO;
const TWO_PI = Math.PI * 2;

function lerp(a, b, t) {
  return a + (b - a) * t;
}

function sampleCommands(commands) {
  const samples = [];
  let lastX = 0;
  let lastY = 0;

  for (const command of commands) {
    const [op, ...v] = command;
    if (op === 'M') {
      lastX = v[0];
      lastY = v[1];
      samples.push({ x: lastX, y: lastY });
      continue;
    }

    const steps = op === 'C' ? 22 : 14;
    const originX = lastX;
    const originY = lastY;

    for (let i = 1; i <= steps; i++) {
      const t = i / steps;
      const u = 1 - t;
      let x;
      let y;

      if (op === 'C') {
        x = u * u * u * originX + 3 * u * u * t * v[0] + 3 * u * t * t * v[2] + t * t * t * v[4];
        y = u * u * u * originY + 3 * u * u * t * v[1] + 3 * u * t * t * v[3] + t * t * t * v[5];
      } else {
        x = lerp(originX, v[0], t);
        y = lerp(originY, v[1], t);
      }

      samples.push({ x, y });
    }

    lastX = op === 'C' ? v[4] : v[0];
    lastY = op === 'C' ? v[5] : v[1];
  }

  return samples;
}

// Geometry and normals are rebuilt only on resize, avoiding path parsing per frame.
function buildGeometry(width, height) {
  const compact = width < 560;
  const targetWidth = width * (compact ? 0.93 : width < 950 ? 0.88 : 0.855);
  const glyphHeight = Math.min(targetWidth / TOTAL_UNITS, height * 0.65, 310);
  const glyphWidth = glyphHeight * GLYPH_RATIO;
  const gap = glyphHeight * LETTER_GAP_RATIO;
  const wordWidth = glyphHeight * TOTAL_UNITS;
  const left = (width - wordWidth) / 2;
  const top = (height - glyphHeight) * 0.49;
  const strands = [];

  for (let letterIndex = 0; letterIndex < WORD.length; letterIndex++) {
    const char = WORD[letterIndex];
    const originX = left + letterIndex * (glyphWidth + gap);

    GLYPHS[char].forEach((commands, strokeIndex) => {
      const glyphPoints = sampleCommands(commands);
      const pts = glyphPoints.map((p, i) => {
        const previous = glyphPoints[Math.max(0, i - 1)];
        const next = glyphPoints[Math.min(glyphPoints.length - 1, i + 1)];
        const dx = (next.x - previous.x) * glyphWidth;
        const dy = (next.y - previous.y) * glyphHeight;
        const inv = 1 / (Math.hypot(dx, dy) || 1);

        return {
          x: originX + p.x * glyphWidth,
          y: top + p.y * glyphHeight,
          nx: -dy * inv,
          ny: dx * inv,
          t: i / Math.max(1, glyphPoints.length - 1),
        };
      });

      strands.push({ pts, letterIndex, strokeIndex });
    });
  }

  return {
    width,
    height,
    glyphHeight,
    glyphWidth,
    wordWidth,
    top,
    left,
    strands,
    spacing: Math.max(0.40, Math.min(1.18, glyphHeight * 0.0051)),
    centerY: top + glyphHeight * 0.55,
  };
}

/** @param {HTMLCanvasElement} canvas */
export function setupLettering(canvas) {
  if (!(canvas instanceof HTMLCanvasElement)) {
    throw new TypeError('setupLettering expects a canvas element');
  }

  const ctx = canvas.getContext('2d', { alpha: true, desynchronized: true });
  if (!ctx) return () => {};

  const reduceMotionQuery = window.matchMedia?.('(prefers-reduced-motion: reduce)');
  let reducedMotion = Boolean(reduceMotionQuery?.matches);
  let size = null;
  let dpr = 1;
  let frameId = 0;
  let stopped = false;
  let visible = true;
  let lastFrame = -Infinity;
  let pointerX = -10000;
  let pointerY = -10000;
  let targetX = -10000;
  let targetY = -10000;
  let hover = 0;
  let targetHover = 0;

  const pending = () => !stopped && visible && !document.hidden;

  function resize() {
    if (stopped) return;
    const rect = canvas.getBoundingClientRect();
    const width = Math.round(rect.width * 100) / 100;
    const height = Math.round(rect.height * 100) / 100;
    if (width < 1 || height < 1) return;

    const nextDpr = Math.min(window.devicePixelRatio || 1, 2);
    if (size?.width === width && size?.height === height && dpr === nextDpr) return;

    dpr = nextDpr;
    canvas.width = Math.max(1, Math.round(width * dpr));
    canvas.height = Math.max(1, Math.round(height * dpr));
    size = buildGeometry(width, height);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    draw(0);
  }

  function drawHorizon(time) {
    const { width, height, centerY, glyphHeight, left, wordWidth } = size;
    const gold = ctx.createLinearGradient(0, 0, width, 0);
    const first = Math.max(0.0, left / width);
    const last = Math.min(1.0, (left + wordWidth) / width);
    gold.addColorStop(0, 'rgba(234,197,90,0.70)');
    gold.addColorStop(Math.max(0.001, first * 0.80), 'rgba(234,197,90,0.50)');
    gold.addColorStop(first, 'rgba(234,197,90,0.30)');
    gold.addColorStop(Math.min(0.999, first + (last - first) * 0.18), 'rgba(171,173,169,0.10)');
    gold.addColorStop(Math.max(0.001, last - (last - first) * 0.16), 'rgba(171,173,169,0.10)');
    gold.addColorStop(last, 'rgba(234,197,90,0.36)');
    gold.addColorStop(Math.min(0.999, last + (1 - last) * 0.65), 'rgba(234,197,90,0.50)');
    gold.addColorStop(1, 'rgba(234,197,90,0.02)');

    // One hairline extends beyond both edges and passes behind every glyph.
    // Close secondary filaments make the central line feel like stretched cord.
    ctx.save();
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    for (let lane = -1; lane <= 1; lane++) {
      ctx.beginPath();
      const step = Math.max(4, width / 150);
      for (let x = -12, i = 0; x <= width + step + 12; x += step, i++) {
        const u = x / width;
        const sway = Math.sin(u * TWO_PI * 1.45 + 0.7) * Math.min(11, glyphHeight * 0.043);
        const sketch = Math.sin(u * 27 + lane * 1.4 + time * 0.00011) * (reducedMotion ? 0.13 : 0.38);
        const y = centerY + sway + lane * Math.max(1.5, glyphHeight * 0.017) + sketch;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.lineWidth = lane === 0 ? 1.05 : 0.57;
      ctx.strokeStyle = lane === 0 ? gold : 'rgba(187,181,161,0.19)';
      ctx.stroke();
    }

    const edgeRadius = Math.max(1.05, Math.min(2.7, glyphHeight * 0.011));
    for (const x of [Math.max(9, width * 0.037), Math.min(width - 9, width * 0.965)]) {
      const u = x / width;
      const y = centerY + Math.sin(u * TWO_PI * 1.45 + 0.7) * Math.min(11, glyphHeight * 0.043);
      ctx.beginPath();
      ctx.arc(x, y, edgeRadius, 0, TWO_PI);
      ctx.fillStyle = 'rgba(234,197,90,0.78)';
      ctx.fill();
    }
    ctx.restore();
  }

  function tracePoints(pts, lane, stroke, time, influenceRadiusSquared) {
    const { spacing, glyphHeight } = size;
    const offset = lane * spacing;
    const phase = stroke.letterIndex * 1.17 + stroke.strokeIndex * 0.81 + lane * 0.32;
    const pointerPower = hover * Math.min(5.5, glyphHeight * 0.026);
    const wavelength = glyphHeight < 88 ? 0.12 : 0.22;

    ctx.beginPath();
    for (let i = 0; i < pts.length; i++) {
      const p = pts[i];
      const noise = Math.sin(p.t * 31 + phase * 3.3) * wavelength
        + Math.sin(p.t * 67 + phase * 1.8) * wavelength * 0.43;
      const breathe = reducedMotion ? 0 : Math.sin(p.t * 11 + phase + time * 0.00049) * spacing * 0.105;
      let x = p.x + p.nx * (offset + noise + breathe);
      let y = p.y + p.ny * (offset + noise + breathe);

      if (pointerPower > 0.015) {
        const dx = pointerX - x;
        const dy = pointerY - y;
        const dist2 = dx * dx + dy * dy;
        if (dist2 < influenceRadiusSquared) {
          const near = Math.pow(1 - dist2 / influenceRadiusSquared, 2);
          const direction = 1 / (Math.sqrt(dist2) + 45);
          x += dx * direction * pointerPower * near;
          y += dy * direction * pointerPower * near;
        }
      }

      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
  }

  function drawLettering(time) {
    const { glyphHeight, strands, spacing } = size;
    const minLineWidth = glyphHeight < 86 ? 0.66 : 0.9;
    const lineScale = Math.min(1.2, Math.max(0.68, glyphHeight / 180));
    const influenceRadiusSquared = Math.pow(Math.max(85, glyphHeight * 1.36), 2);

    ctx.save();
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    // A subdued undertrace separates the graphite filaments from #080b0e.
    for (const stroke of strands) {
      tracePoints(stroke.pts, 0, stroke, time, influenceRadiusSquared);
      ctx.lineWidth = spacing * 10 + Math.max(2.4, glyphHeight * 0.008);
      ctx.strokeStyle = 'rgba(232, 217, 167, 0.080)';
      ctx.stroke();
    }

    // Nine neighboring, independently imperfect threads make each letter.
    for (const stroke of strands) {
      for (let laneIndex = 0; laneIndex < INK.length; laneIndex++) {
        const lane = laneIndex - (INK.length - 1) / 2;
        const ink = INK[laneIndex];
        tracePoints(stroke.pts, lane, stroke, time, influenceRadiusSquared);
        ctx.strokeStyle = ink.color;
        ctx.lineWidth = Math.max(minLineWidth, ink.width * lineScale);
        ctx.stroke();
      }
    }

    // Small irregular bright highlights suggest a hand-pulled metallic wire.
    ctx.lineWidth = Math.max(0.65, lineScale * 0.85);
    ctx.strokeStyle = 'rgba(253, 229, 160, 0.66)';
    for (const stroke of strands) {
      if (stroke.strokeIndex > 0) continue;
      const points = stroke.pts;
      const a = Math.round(points.length * (0.26 + stroke.letterIndex % 3 * 0.075));
      const b = Math.min(points.length - 1, a + Math.max(4, Math.round(points.length * 0.082)));
      ctx.beginPath();
      for (let j = a; j <= b; j++) {
        const p = points[j];
        const x = p.x - p.nx * spacing * 0.15;
        const y = p.y - p.ny * spacing * 0.15;
        if (j === a) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
    }

    ctx.restore();
  }

  function draw(time) {
    if (!size || stopped) return;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, size.width, size.height);
    drawHorizon(time);
    drawLettering(time);
  }

  function tick(time) {
    frameId = 0;
    if (!pending() || reducedMotion) return;
    if (time - lastFrame > 32) {
      lastFrame = time;
      const smoothing = 0.085;
      pointerX = lerp(pointerX, targetX, smoothing);
      pointerY = lerp(pointerY, targetY, smoothing);
      hover = lerp(hover, targetHover, 0.075);
      if (hover < 0.002 && targetHover === 0) hover = 0;
      draw(time);
    }
    frameId = window.requestAnimationFrame(tick);
  }

  function run() {
    if (!pending() || reducedMotion || frameId) return;
    frameId = window.requestAnimationFrame(tick);
  }

  function onPointerMove(event) {
    if (reducedMotion || !size) return;
    const rect = canvas.getBoundingClientRect();
    targetX = event.clientX - rect.left;
    targetY = event.clientY - rect.top;
    const padding = Math.max(24, size.glyphHeight * 0.20);
    targetHover = targetX >= -padding && targetY >= -padding
      && targetX <= size.width + padding && targetY <= size.height + padding ? 1 : 0;
    if (hover < 0.001 && targetHover === 1) {
      pointerX = targetX;
      pointerY = targetY;
    }
    run();
  }

  function onMotionChange(event) {
    reducedMotion = event.matches;
    if (reducedMotion) {
      window.cancelAnimationFrame(frameId);
      frameId = 0;
      hover = 0;
      targetHover = 0;
      draw(0);
    } else {
      run();
    }
  }

  function onVisibilityChange() {
    if (pending()) run();
    else if (frameId) {
      window.cancelAnimationFrame(frameId);
      frameId = 0;
    }
  }

  // The full window listens because the canvas intentionally does not capture
  // clicks, taps or hover that belong to hero navigation and accessibility UI.
  window.addEventListener('pointermove', onPointerMove, { passive: true });
  window.addEventListener('resize', resize, { passive: true });
  document.addEventListener('visibilitychange', onVisibilityChange);
  reduceMotionQuery?.addEventListener?.('change', onMotionChange);
  if (!reduceMotionQuery?.addEventListener && reduceMotionQuery?.addListener) {
    reduceMotionQuery.addListener(onMotionChange);
  }

  const observer = typeof ResizeObserver === 'function'
    ? new ResizeObserver(resize) : null;
  observer?.observe(canvas);

  const intersection = typeof IntersectionObserver === 'function'
    ? new IntersectionObserver(entries => {
      visible = entries[0]?.isIntersecting ?? true;
      onVisibilityChange();
    }, { threshold: 0 }) : null;
  intersection?.observe(canvas);

  resize();
  run();

  return function disposeLettering() {
    if (stopped) return;
    stopped = true;
    window.cancelAnimationFrame(frameId);
    observer?.disconnect();
    intersection?.disconnect();
    window.removeEventListener('pointermove', onPointerMove);
    window.removeEventListener('resize', resize);
    document.removeEventListener('visibilitychange', onVisibilityChange);
    reduceMotionQuery?.removeEventListener?.('change', onMotionChange);
    if (!reduceMotionQuery?.removeEventListener && reduceMotionQuery?.removeListener) {
      reduceMotionQuery.removeListener(onMotionChange);
    }
  };
}
