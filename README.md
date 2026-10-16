# Dan Gerwin — Portfolio Source

This private `.source/` folder contains the editable source and assets required to regenerate Dan's portfolio. It is Git-ignored and stays inside the single `DanPortfolio` project folder. Old reference images and duplicate outputs were removed; a new local-only soundtrack player now uses the MP3 under `assets/`, without embedding or publishing the recording.

## Quick preview

Open **`../index.html`** in a browser. It works without a server or npm dependencies.

## Edit and rebuild

You only need Node.js to regenerate the final website. From this folder, run:

```powershell
node scripts/personalize.mjs
node overrides/patch-lettering.mjs
node scripts/build-publish.mjs
```

These steps regenerate the personalized React bundle, install the interactive **GERWIN** string paths, and create a lightweight, completely self-contained `../index.html` in the main `DanPortfolio` folder.

To build directly into a GitHub repository, provide its existing `index.html` destination:

```powershell
node scripts/build-publish.mjs "C:\Users\Yue\Desktop\Dan\DanPortfolio\index.html"
```

If you change only CSS, icons, or image files, `node scripts/build-publish.mjs` is enough.

## Kept files

| File / folder | Reason |
| --- | --- |
| `../index.html` | Final publish-ready website, one level above this source folder |
| `index-linked.html` | Editable HTML document template |
| `assets/index-local.js` | Original compiled React code, required by `personalize.mjs` |
| `assets/index-dan.js` | Personalized bundle used by the page builder |
| `assets/index-BOs8hB4_.css` | Reference layout and styles |
| `assets/click-effect-CaN82RwL.wav` | Short interaction sound |
| `icons/` | Six technology logos, upstream source and license notices |
| `Portraits/Me.optimized.webp` | Profile photo used on the website |
| `Portraits/*.jpg` | Dark and light Batman header images |
| `overrides/dan-tweaks.css` | Responsive portrait and theme styling |
| `overrides/patch-lettering.mjs` | GERWIN desktop/mobile canvas geometry |
| `scripts/personalize.mjs` | Rebuilds your custom profile and sections |
| `scripts/build-publish.mjs` | Embeds CSS, JS, images, sound and SVG icons into one HTML file |
| `overrides/music-player.html`, `.css`, `.js` | Local-only autoplay/loop soundtrack panel; MP3 stays private |
| `assets/The Dark Knight Main Theme - Hans Zimmer.mp3` | Local private recording, not embedded in the HTML or uploaded to Git |
| `favicon.svg` | Portfolio icon |

The commercial soundtrack is **local only** and its player is hidden on GitHub Pages. Autoplay is requested but depends on browser permissions; visitors may need to click Play or interact with the page. An earlier alternative design remains in `legacy-previous-design/`, never deployed or committed to GitHub.

## Publishing note

The reference design and Batman artwork may be subject to third-party rights. Check permissions before deploying publicly. Technology logo licensing and attribution are documented in `icons/SOURCES.md`.
