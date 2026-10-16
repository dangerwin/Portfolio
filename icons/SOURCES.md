# Technology logo sources and usage notes

Downloaded 2026-10-14 from the public upstream repositories below. The files here are self-contained SVG artwork with no external image, script, or font dependencies. Present them as **Tools I'm exploring**, not claims of proficiency, certification, brand affiliation, or endorsement.

| Local SVG | Verified artwork source | Appearance | License / provenance |
| --- | --- | --- | --- |
| `html5.svg` | [Devicon HTML5 original](https://raw.githubusercontent.com/devicons/devicon/master/icons/html5/html5-original.svg) | Orange and white original logo | Devicon MIT project license; brand rights retained by owners |
| `css3.svg` | [Devicon CSS3 original](https://raw.githubusercontent.com/devicons/devicon/master/icons/css3/css3-original.svg) | Blue/white shield | Devicon MIT project license; brand rights retained by owners |
| `javascript.svg` | [Simple Icons JavaScript](https://raw.githubusercontent.com/simple-icons/simple-icons/develop/icons/javascript.svg) | Original vector path with `#F7DF1E` root fill added | JavaScript icon marked MIT in Simple Icons metadata; [original logo.js](https://github.com/voodootikigod/logo.js) |
| `figma.svg` | [Devicon Figma original](https://raw.githubusercontent.com/devicons/devicon/master/icons/figma/figma-original.svg) | Original five-color icon | Devicon MIT project license; [Figma brand guidelines](https://www.figma.com/using-the-figma-brand/) |
| `git.svg` | [Simple Icons Git](https://raw.githubusercontent.com/simple-icons/simple-icons/develop/icons/git.svg) | Original vector path with `#F03C2E` root fill added | **CC BY 3.0**. Original Git logo by **Jason Long**: [Git logos](https://git-scm.com/community/logos), [license](https://creativecommons.org/licenses/by/3.0/) |
| `github.svg` | [Simple Icons GitHub](https://raw.githubusercontent.com/simple-icons/simple-icons/develop/icons/github.svg) | Original vector path with white root fill for visibility on dark backgrounds | No icon-specific license recorded in Simple Icons metadata; [GitHub brand guidance](https://github.com/logos) applies |

## License and credit details

- [Devicon](https://github.com/devicons/devicon) is distributed under the MIT License (copyright 2015 konpa); the notice is included in `LICENSE-DEVICON.txt`.
- The JavaScript logo is separately MIT-licensed (copyright 2011 Christopher Williams); the notice is included in `LICENSE-JAVASCRIPT.txt`.
- **Git logo attribution:** Git logo by Jason Long, licensed [Creative Commons Attribution 3.0 Unported](https://creativecommons.org/licenses/by/3.0/). The original vector outline comes from Simple Icons; this copy is colored `#F03C2E`.
- The [Simple Icons project](https://simpleicons.org/) uses CC0-1.0, but its [legal disclaimer](https://github.com/simple-icons/simple-icons/blob/develop/DISCLAIMER.md) states that individual icons can have separate licenses and trademark policies. Its metadata lists JavaScript as MIT and Git as CC-BY-3.0.
- The current Simple Icons `develop/icons/css3.svg` returns HTTP 404; its newer `css.svg` represents different CSS branding. This folder uses the recognizable blue CSS3 shield from Devicon instead.

## Offline HTML usage

The six icons work as relative image paths when opening the portfolio using `file://`, without remote fetches:

```html
<img src="./icons/html5.svg" width="28" height="28" alt="HTML5">
<img src="./icons/css3.svg" width="28" height="28" alt="CSS3">
<img src="./icons/javascript.svg" width="28" height="28" alt="JavaScript">
<img src="./icons/figma.svg" width="28" height="28" alt="Figma">
<img src="./icons/git.svg" width="28" height="28" alt="Git">
<img src="./icons/github.svg" width="28" height="28" alt="GitHub">
```
