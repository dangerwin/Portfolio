// Rebuild a personalized copy of the *captured original* React production bundle.
// The original `assets/index-local.js` remains unchanged for visual-parity checks.
import { readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { resolve, dirname } from 'node:path';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const source = resolve(root, 'assets/index-local.js');
const output = resolve(root, 'assets/index-dan.js');
let code = await readFile(source, 'utf8');

function once(find, replace) {
  const first = code.indexOf(find);
  if (first === -1 || code.indexOf(find, first + 1) !== -1) {
    throw new Error(`Expected exactly one match for: ${find.slice(0, 120)}`);
  }
  code = code.slice(0, first) + replace + code.slice(first + find.length);
}

function all(find, replace, minimum = 1) {
  const count = code.split(find).length - 1;
  if (count < minimum) throw new Error(`Missing expected source content: ${find}`);
  code = code.split(find).join(replace);
  console.log(`Replaced ${count} occurrence(s): ${find.slice(0, 55)}`);
}

function between(before, after, insertion) {
  const at = code.indexOf(before);
  if (at < 0) throw new Error(`Missing start anchor: ${before}`);
  const start = at + before.length;
  const end = code.indexOf(after, start);
  if (end < 0) throw new Error(`Missing end anchor: ${after}`);
  code = code.slice(0, start) + insertion + code.slice(end);
}

// Preserve layout, animations and components; replace only text and destinations.
all('Mridul Jain', 'Dan Gerwin');
all('Full Stack Developer', 'Computer Engineering Student');
all('Delhi, IN', '4th Year');
all('Web & DevOps', 'UI/UX & Design');
all('20yo Student', '4th Year Student');
all('hello, i am mridul, a student developer building clean, interactive web apps and exploring machine learning & devops.',
  "hello, i'm Dan Gerwin, a 4th-year Computer Engineering student with basic UI/UX design skills who enjoys exploring new technologies.");
all('builds clean, interactive web applications and dev tooling.',
  'i enjoy learning new technologies and applying my knowledge to real projects.');
all('loves minimal design, UI physics, and learning something new daily.',
  'hardworking, adaptable, and eager to keep growing professionally.');
all('open to freelance & collaborations — reach out on', 'let\'s connect and create something — reach out on');
all('https://www.x.com/mridulljain', 'https://github.com/dangerwin');
once('M.jsx("span",{children:"x (twitter)"})', 'M.jsx("span",{children:"github"})');
all('mailto:mriduljain2604@gmail.com', 'mailto:dangerwinmolo05@gmail.com');
all('https://github.com/mridulxjain', 'https://github.com/dangerwin');
// The profile is now Me only, stored as an optimized WebP image.
all('src:"./mridulpfp.jpg"', 'src:"./Portraits/Me.optimized.webp"');
once('className:"h-16 w-16 sm:h-20 sm:w-20 rounded-2xl overflow-hidden border border-grid-strong p-[2px] bg-[var(--bg-surface)] shadow-md"',
  'className:"dan-profile-photo rounded-2xl overflow-hidden border border-grid-strong p-[2px] bg-[var(--bg-surface)] shadow-md"');
// Use the two actual Batman banner images for visibly different themes.
// Dark: red / black Batman art; light: high-contrast monochrome Batman logo.
all('"./bgdark1.webp"', '"./Portraits/4ef04f771f564738378377606ac3fee2.jpg"');
all('"./bglight1.webp"', '"./Portraits/be09b0c53fd695a1f16c50f072cc0307.jpg"');

// Remove the actual reference particle renderer and its leaf/petal generator.
// This removes the effect instead of merely hiding it under CSS.
const fallingStart = code.indexOf('const Ih=34,G3=Array.from(');
const fallingEnd = code.indexOf('const xc=G.createContext({});', fallingStart);
if (fallingStart < 0 || fallingEnd < 0 || code.indexOf('const Ih=34,G3=Array.from(', fallingStart + 1) >= 0) {
  throw new Error('Could not uniquely locate the falling leaf/petal component');
}
code = code.slice(0, fallingStart) + code.slice(fallingEnd);
once(',M.jsx(X3,{theme:a})', '');
all('" mridul"', '" dan gerwin"');
all('"delhi, ind"', '"computer engineering"');
all('"mridul"', '"gerwin"');
once('"IST "', '"LOCAL "');
// An explicit "available for work" claim wasn't provided, so use a factual label.
all('AVAILABLE FOR WORK', 'LEARNING & BUILDING');

// Replace the exact original 4-column tech stack with the user's verified skills.
// Keep the original cards, Tailwind classes, gaps, mouse hover and grid breakpoints.
between('function s7(){const a=', ';return M.jsxs("div",{className:"w-full border-b border-grid"',
  '[{title:"DESIGN",skills:[{name:"UI/UX Basics",icon:"✦"},{name:"Jersey Design",icon:"✦"}]},'+
  '{title:"EDUCATION",skills:[{name:"Computer Engineering",icon:"✦"},{name:"Fourth-year Student",icon:"✦"}]},'+
  '{title:"INTERESTS",skills:[{name:"New Technologies",icon:"✦"},{name:"Real Projects",icon:"✦"}]},'+
  '{title:"STRENGTHS",skills:[{name:"Hardworking",icon:"✦"},{name:"Adaptable",icon:"✦"},{name:"Eager to Learn",icon:"✦"}]}]');
once('children:"Tech Stack"', 'children:"Skills & Interests"');

// Display real technology brand marks, downloaded and stored with the project.
// These technologies are framed as exploration, not unverified mastery.
const techComponent = 'function DanTechStack(){const a=['+
  '{name:"HTML5",icon:"./icons/html5.svg"},'+
  '{name:"CSS3",icon:"./icons/css3.svg"},'+
  '{name:"JavaScript",icon:"./icons/javascript.svg"},'+
  '{name:"Figma",icon:"./icons/figma.svg"},'+
  '{name:"Git",icon:"./icons/git.svg"},'+
  '{name:"GitHub",icon:"./icons/github.svg"}'+
  '];return M.jsxs("section",{className:"w-full border-b border-grid bg-[var(--bg-page)]",children:['+
  'M.jsxs("div",{className:"flex items-center justify-between gap-2 px-4 sm:px-6 py-3 border-b border-grid",children:['+
  'M.jsx("h2",{className:"jura-font text-sm sm:text-base tracking-wider text-main uppercase font-semibold",children:"Tech Stack"}),'+
  'M.jsx("span",{className:"meta-label text-[10px] text-muted",children:"Tools I am exploring"})]}),'+
  'M.jsx("div",{className:"dan-tech-grid",children:a.map((t,i)=>M.jsxs("div",{className:"dan-tech-card",children:['+
  'M.jsx("img",{src:t.icon,alt:t.name+" logo",width:36,height:36,loading:"lazy",decoding:"async"}),'+
  'M.jsx("span",{className:"roboto-mono-font text-xs text-secondary",children:t.name})'+
  ']},i))})'+
  ']})}';
once('function s7(){const a=', techComponent+'function s7(){const a=');

// Keep the reference's original React project card and responsive grid renderer.
// Unknown demo/source links stay absent rather than pointing to someone else's work.
between('function r7(){const a=', ';return M.jsxs("div",{className:"w-full border-b border-grid"',
  '[{name:"SWAM: Salt Water Algae Monitoring System",tagline:"Academic Project · 2025–2026 (In Progress)",'+
  'desc:"Salt Water Algae Monitoring System — an academic project currently in progress.",'+
  'stack:["Academic Project","2025–2026","In Progress"],github:null,live:null}]');

// Add Casmy Sportswear in the same original editorial section style.
const workComponent = 'function DanExperience(){return M.jsxs("section",{className:"w-full border-b border-grid bg-[var(--bg-page)]",children:['+
  'M.jsx("div",{className:"flex items-center justify-between px-4 sm:px-6 py-3 border-b border-grid bg-[var(--bg-page)]",children:M.jsx("h2",{className:"jura-font text-sm sm:text-base tracking-wider text-main uppercase font-semibold",children:"Work Experience"})}),'+
  'M.jsxs("div",{className:"p-5 sm:p-6 space-y-2",children:['+
  'M.jsxs("div",{className:"flex flex-wrap items-center justify-between gap-2",children:['+
  'M.jsx("h3",{className:"jura-font text-xl sm:text-2xl text-main font-semibold tracking-wide",children:"Casmy Sportswear"}),'+
  'M.jsx("span",{className:"meta-label text-[10px] text-muted",children:"2019 — 2022"})]}),'+
  'M.jsx("div",{className:"meta-label text-xs text-purple-400",children:"Designer"}),'+
  'M.jsx("p",{className:"roboto-mono-font text-xs sm:text-sm leading-relaxed text-secondary",children:"Created jersey designs and graphics for different sports and sporting events."})'+
  ']})]})}';
once('function d7({theme:a,onToggleTheme:l})', workComponent+'function d7({theme:a,onToggleTheme:l})');
once('M.jsx(s7,{}),M.jsx(r7,{})', 'M.jsx(s7,{}),M.jsx(DanTechStack,{}),M.jsx(DanExperience,{}),M.jsx(r7,{})');

// Keep the reference quote box, but replace its attribution with Dan's own words.
once('“The journey of a thousand miles begins with a single step.”',
  '“Always learning, always building, always growing.”');
once('~ Lao Tzu', '~ Learning mindset');

// Do not impersonate/link another person's LinkedIn, X, or resume.
once('href:"https://www.linkedin.com/in/mridulxjain/"', 'href:void 0,"aria-disabled":!0');
once('href:"https://twitter.com/mridulljain"', 'href:void 0,"aria-disabled":!0');
once('href:"./resume.html"', 'href:void 0,"aria-disabled":!0');
once('"aria-label":"LinkedIn"', '"aria-label":"LinkedIn URL coming soon"');
once('"aria-label":"Twitter / X"', '"aria-label":"Twitter URL coming soon"');
once('"aria-label":"Resume information (PDF not included)"', '"aria-label":"Resume coming soon"');
once('children:["linkedin",M.jsx("span",{className:r})]', 'children:["linkedin (soon)",M.jsx("span",{className:r})]');
once('children:["twitter",M.jsx("span",{className:r})]', 'children:["twitter (soon)",M.jsx("span",{className:r})]');
once('children:["resume",M.jsx("span",{className:r})]', 'children:["resume (soon)",M.jsx("span",{className:r})]');

// Add a Facebook and direct Gmail action alongside the original footer icons.
const extraContacts = ',M.jsxs("a",{href:"https://www.facebook.com/share/1CX4QhW4NZ/",target:"_blank",rel:"noopener noreferrer",className:a,"aria-label":"Facebook",children:[M.jsxs("span",{className:l,children:["facebook",M.jsx("span",{className:r})]}),M.jsx("span",{children:"f"})]}),'+
  'M.jsxs("a",{href:"https://mail.google.com/mail/?view=cm&fs=1&to=dangerwinmolo05%40gmail.com",target:"_blank",rel:"noopener noreferrer",className:a,"aria-label":"Gmail",children:[M.jsxs("span",{className:l,children:["gmail",M.jsx("span",{className:r})]}),M.jsx(c7,{})]})';
once('M.jsx(f7,{})]})]})]})})}function DanExperience', 'M.jsx(f7,{})]})'+extraContacts+']})]})})}function DanExperience');

// Recolor the *original* five animated canvas strings rather than overlaying
// a static drawing. Dark mode uses bright Batman red for visibility over black;
// light mode uses true black for legibility on white.
// The original geometry, thickness, pluck physics and WebAudio remain intact.
once('V=bt?"rgba(20, 25, 35, ":"rgba(250, 250, 255, "',
  'V=bt?"rgba(0, 0, 0, ":"rgba(242, 43, 54, "');
once('z.strokeStyle=bt?`rgba(99, 102, 241, ${Z.amplitude/20*.4})`:`rgba(255, 255, 255, ${Z.amplitude/20*.6})`',
  'z.strokeStyle=bt?`rgba(0, 0, 0, ${Z.amplitude/20*.45})`:`rgba(255, 52, 63, ${Z.amplitude/20*.65})`');
once('z.strokeStyle=bt?"rgba(0, 0, 0, 0.85)":"rgba(255, 255, 255, 0.95)"',
  'z.strokeStyle=bt?"rgba(0, 0, 0, 0.92)":"rgba(255, 81, 90, 0.95)"');
once('z.fillStyle=bt?"#000000":"#ffffff"',
  'z.fillStyle=bt?"#000000":"#ff515a"');

// Report accidental leaks of the former site's owner or former project links.
const privateLeftovers = [
  'mridul', 'Mridul', 'Delhi', 'whizper.vercel', 'hypenow.lol',
  'nagrik-connect', 'ecoatlass.vercel', 'mriduljain.me'
];
for (const name of privateLeftovers) {
  if (code.includes(name)) throw new Error(`Former reference content remains: ${name}`);
}
await writeFile(output, code, 'utf8');
console.log(`Created ${output} (${code.length} characters) from the original React bundle.`);
