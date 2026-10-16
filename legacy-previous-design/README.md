# Dan Gerwin — Portfolio

An **editable, responsive, dark-and-gold portfolio** created from scratch for Dan Gerwin. Its aesthetic is inspired by dark comic-noir design and the original reference's hand-drawn interactive lettering, while using Dan's own images and content.

## Run locally

Install [Node.js](https://nodejs.org/) if not already installed, then in PowerShell:

```powershell
cd "C:\Users\Yue\Desktop\Dan\DanPortfolio"
npm start
```

Open **http://127.0.0.1:5173** in your browser. Stop the server with Ctrl+C. Use `npm test` for automated syntax and HTTP checks. The site has no npm package dependencies; only Google Fonts require a network connection, and system font fallbacks are provided.

## Content

- Name: **Dan Gerwin** — fourth-year Computer Engineering student.
- About: UI/UX design beginner, technology enthusiast, adaptable and eager to learn.
- Skills/interests: UI/UX basics, sportswear graphics, continuous learning and adaptability. No unconfirmed programming languages or design tools are claimed.
- Experience: **Casmy Sportswear**, designer (2019–2022), creating jerseys and sports graphics.
- Project: **SWAM: Salt Water Algae Monitoring System** (academic, 2025–2026, in progress).
- Contact: email, GitHub, Gmail and Facebook use the supplied addresses/URLs. LinkedIn, résumé and Twitter remain **unlinked placeholders**, because no URLs/files were supplied.
- The project visual is deliberately **left blank** for future images.
- The profile shows `Assets/Mask.png` by default; hover, keyboard focus, or tap reveals `Assets/Me.png` with a smooth transition.

## Where to edit

| File | Purpose |
| --- | --- |
| `index.html` | Text, images, navigation, links, project entries |
| `styles.css` | Overall layout, responsive styling, colors, typography |
| `js/main.js` | Menu, scrolling and component setup |
| `js/lettering.js` and `styles/lettering.css` | Interactive hand-drawn **GERWIN** hero lettering |
| `js/profile.js` and `styles/profile.css` | Mask/Me interactive image transition |
| `Assets/Mask.png`, `Assets/Me.png` | Original supplied portraits |

You can replace the empty project image area in `index.html` with a future `<img>` and add styling in `styles.css`. No Three.js is required for this 2D canvas-based effect.

## Notes

This is a new maintainable implementation rather than a copy of the unavailable original React source. It avoids the former website owner's contact details and assets. Reduced-motion preferences, keyboard focus, responsive layout and image descriptions have been considered. A real-browser interaction check is still recommended before publishing.
