import { writeFileSync, mkdirSync, copyFileSync, readdirSync, rmSync } from "node:fs"

import { marks as marksV1, wideMarks, renderMark as renderV1 } from "./marks-r1.mjs"
import { marks as marksV2, FAMILIES as FAMILIES_V2 } from "./marks-r2.mjs"
import { marks as marksV3, FAMILIES as FAMILIES_V3 } from "./marks-r3.mjs"
import { marks as marksV4, FAMILIES as FAMILIES_V4 } from "./marks-r4.mjs"
import { marks as marksV5, FAMILIES as FAMILIES_V5 } from "./marks-r5.mjs"
import { renderMark as renderV2, SCHEMES } from "./render.mjs"
import { page6 } from "./page-r6.mjs"

import { SITE, sheets } from "./paths.mjs"

const SHEETS1 = sheets(1)
const SHEETS2 = sheets(2)
const SHEETS3 = sheets(3)
const SHEETS4 = sheets(4)
const SHEETS5 = sheets(5)
const SHEETS6 = sheets(6)

const OUT = SITE

const FAMILIES_V1 = [
    { key: "seam", title: "01 / Seam", blurb: "A solid field split by a stepped or ramped seam. Inherits the branching intent of the option glyph." },
    { key: "ramp", title: "02 / Ramp", blurb: "An ordered ramp from scattered blocks into solid ink. Noise resolving into signal." },
    { key: "aperture", title: "03 / Aperture", blurb: "Convergence at 45 degrees. Many in, one out." },
    { key: "block", title: "04 / Block", blurb: "Layers, containment, powers of two." },
    { key: "letter", title: "05 / Letter", blurb: "A letterform study. Round two retired this: the r was never mirrored, it is a heavy mono cut." }
]

const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;700&display=swap');
  :root { --ink:#FFFFFF; --bg:#101010; --panel:#181818; --raised:#202020; --line:#282828; --mute:#808080; --dim:#404040; }
  * { box-sizing:border-box; }
  body { margin:0; background:var(--bg); color:var(--ink); font-family:"JetBrains Mono",ui-monospace,"SF Mono",Menlo,monospace; -webkit-font-smoothing:antialiased; }
  a { color:inherit; }
  header { padding:28px 20px 20px; border-bottom:1px solid var(--line); }
  h1 { margin:0 0 8px; font-size:19px; letter-spacing:2px; font-weight:700; }
  p.lede { margin:0; font-size:13px; line-height:1.6; color:var(--mute); max-width:64ch; }
  nav { display:flex; flex-wrap:wrap; gap:8px; padding:14px 20px; border-bottom:1px solid var(--line); position:sticky; top:0; background:var(--bg); z-index:5; }
  nav a { display:inline-block; padding:8px 14px; border:1px solid var(--line); font-size:12px; text-decoration:none; letter-spacing:1px; }
  nav a.on { background:var(--ink); color:var(--bg); border-color:var(--ink); }
  section { padding:26px 20px; border-bottom:1px solid var(--line); }
  h2 { margin:0 0 6px; font-size:15px; letter-spacing:1px; }
  h2 + p { margin:0 0 20px; font-size:12.5px; line-height:1.6; color:var(--mute); max-width:64ch; }
  .grid { display:grid; gap:22px; grid-template-columns:repeat(auto-fill,minmax(300px,1fr)); }
  .card { margin:0; }
  .pair { display:grid; grid-template-columns:1fr 1fr; gap:8px; }
  .pane { border-radius:14px; overflow:hidden; line-height:0; }
  .pane.d { border:1px solid var(--line); }
  .pane svg { width:100%; height:auto; display:block; }
  .sizes { display:flex; align-items:flex-end; gap:12px; padding:12px 2px 0; min-height:56px; }
  figcaption { padding-top:8px; font-size:12.5px; line-height:1.5; }
  figcaption b { display:block; }
  figcaption span { color:var(--mute); }
  .sheets img { width:100%; height:auto; display:block; border:1px solid var(--line); margin-bottom:18px; border-radius:4px; }
  footer { padding:24px 20px 60px; color:var(--mute); font-size:12px; line-height:1.7; }
  section p { font-size:12.5px; line-height:1.7; color:var(--mute); max-width:78ch; }
  section p b { color:var(--ink); font-weight:700; }
  .tbl { overflow-x:auto; margin:6px 0 18px; }
  table { border-collapse:collapse; font-size:12px; line-height:1.5; min-width:560px; }
  th, td { text-align:left; padding:7px 12px 7px 0; border-bottom:1px solid var(--line); vertical-align:top; }
  th { color:var(--mute); font-weight:400; }
  td:first-child { color:var(--ink); white-space:nowrap; }
  ol.open { font-size:12.5px; line-height:1.8; color:var(--mute); padding-left:20px; max-width:78ch; }
`

const nav = current => `
<nav>
  <a href="/1/" class="${current === 1 ? "on" : ""}">ROUND 1</a>
  <a href="/2/" class="${current === 2 ? "on" : ""}">ROUND 2</a>
  <a href="/3/" class="${current === 3 ? "on" : ""}">ROUND 3</a>
  <a href="/4/" class="${current === 4 ? "on" : ""}">ROUND 4</a>
  <a href="/5/" class="${current === 5 ? "on" : ""}">ROUND 5</a>
  <a href="/6/" class="${current === 6 ? "on" : ""}">ROUND 6</a>
</nav>`

const page = ({ title, lede, current, body }) => `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1"/>
<title>ALTERED / ${title}</title>
<style>${CSS}</style>
</head>
<body>
<header><h1>${title}</h1><p class="lede">${lede}</p></header>
${nav(current)}
${body}
<footer>ALTERED / mark studies. Not brand-final. Generated from alteredcomputer/generated-mark-studies.</footer>
</body>
</html>`

//  ------------------------------------------------------------------- round 1

const tileV1 = (mark, ink, paper, size = 220) => {
    const w = Math.round(size * (mark.w / mark.h))

    return `<svg viewBox="0 0 ${w} ${size}" width="${w}" height="${size}" xmlns="http://www.w3.org/2000/svg"><rect x="0" y="0" width="${w}" height="${size}" fill="${paper}"/>${renderV1(mark, { x: w * 0.19, y: size * 0.19, size: size * 0.62, ink })}</svg>`
}

const bareV1 = (mark, ink, size) => {
    const w = Math.round(size * (mark.w / mark.h))

    return `<svg viewBox="0 0 ${w} ${size}" width="${w}" height="${size}" xmlns="http://www.w3.org/2000/svg">${renderV1(mark, { size, ink })}</svg>`
}

const cardV1 = mark => `
<figure class="card">
  <div class="pair">
    <div class="pane d">${tileV1(mark, "#FAFAFA", "#0A0A0A")}</div>
    <div class="pane">${tileV1(mark, "#0A0A0A", "#EDEAE4")}</div>
  </div>
  <div class="sizes">${[16, 24, 32, 48].map(s => bareV1(mark, "#FAFAFA", s)).join("")}</div>
  <figcaption><b>${mark.label}</b><span>${mark.note}</span></figcaption>
</figure>`

//  ------------------------------------------------------------------- round 2

const tileV2 = (mark, scheme, size = 220) => {
    const w = Math.round(size * (mark.w / mark.h))

    return `<svg viewBox="0 0 ${w} ${size}" width="${w}" height="${size}" xmlns="http://www.w3.org/2000/svg"><rect x="0" y="0" width="${w}" height="${size}" fill="${SCHEMES[scheme].bg}"/>${renderV2(mark, { x: w * 0.19, y: size * 0.19, size: size * 0.62, scheme })}</svg>`
}

const bareV2 = (mark, size) => {
    const w = Math.round(size * (mark.w / mark.h))

    return `<svg viewBox="0 0 ${w} ${size}" width="${w}" height="${size}" xmlns="http://www.w3.org/2000/svg">${renderV2(mark, { size, scheme: "dark" })}</svg>`
}

const cardV2 = mark => `
<figure class="card">
  <div class="pair">
    <div class="pane d">${tileV2(mark, "dark")}</div>
    <div class="pane">${tileV2(mark, "light")}</div>
  </div>
  <div class="sizes">${[16, 24, 32, 48].map(s => bareV2(mark, s)).join("")}</div>
  <figcaption><b>${mark.label}</b><span>${mark.means}</span></figcaption>
</figure>`

const cardV3 = mark => `
<figure class="card">
  <div class="pair">
    <div class="pane d">${tileV2(mark, "dark")}</div>
    <div class="pane">${tileV2(mark, "light")}</div>
  </div>
  <div class="sizes">${[16, 24, 32, 48].map(s => bareV2(mark, s)).join("")}</div>
  <figcaption><b>${mark.label}</b><span>${mark.means}</span></figcaption>
</figure>`

const sheetSection = (dir, files, blurb) => `
<section class="sheets">
  <h2>Sheets</h2>
  <p>${blurb}</p>
  ${files.map(f => `<img src="${dir}/${f}" alt="${f}" loading="lazy"/>`).join("")}
</section>`

const build = () => {
    rmSync(OUT, { recursive: true, force: true })
    mkdirSync(`${OUT}/1/sheets`, { recursive: true })
    mkdirSync(`${OUT}/2/sheets`, { recursive: true })
    mkdirSync(`${OUT}/3/sheets`, { recursive: true })
    mkdirSync(`${OUT}/4/sheets`, { recursive: true })
    mkdirSync(`${OUT}/5/sheets`, { recursive: true })
    mkdirSync(`${OUT}/6/sheets`, { recursive: true })

    const s1 = readdirSync(SHEETS1).filter(f => f.endsWith(".png")).sort()
    const s2 = readdirSync(SHEETS2).filter(f => f.endsWith(".png")).sort()

    for (const f of s1) copyFileSync(`${SHEETS1}/${f}`, `${OUT}/1/sheets/${f}`)
    for (const f of s2) copyFileSync(`${SHEETS2}/${f}`, `${OUT}/2/sheets/${f}`)

    const s3 = readdirSync(SHEETS3).filter(f => f.endsWith(".png")).sort()

    for (const f of s3) copyFileSync(`${SHEETS3}/${f}`, `${OUT}/3/sheets/${f}`)

    const body3 = [
        ...FAMILIES_V3.map(
            f => `<section><h2>${f.title}</h2><p>${f.blurb}</p><div class="grid">${marksV3.filter(m => m.family === f.key).map(cardV3).join("")}</div></section>`
        ),
        sheetSection("sheets", s3, "Easing comparison, avatar tests in both polarities, and the lockups including the period-placement test.")
    ].join("")

    writeFileSync(
        `${OUT}/3/index.html`,
        page({
            title: "ROUND 3 / CONVERGENCE",
            lede: "One thesis: the widened mind converging back into clarity. Wide and many on the left, a transformation at the inflection, one clean line out. Kortex reversed and brutalised. Everything here is generated from a parametric model, so any parameter can be re-swept on request.",
            current: 3,
            body: body3
        })
    )

    const body1 = [
        ...FAMILIES_V1.map(
            f => `<section><h2>${f.title}</h2><p>${f.blurb}</p><div class="grid">${marksV1.filter(m => m.family === f.key).map(cardV1).join("")}</div></section>`
        ),
        `<section><h2>06 / Wide</h2><p>Horizontal studies, for banners and headers rather than avatars.</p><div class="grid">${wideMarks.map(cardV1).join("")}</div></section>`,
        sheetSection("sheets", s1, "Contact sheets: construction diagrams, the avatar test, and the wordmark lockups.")
    ].join("")

    const body2 = [
        ...FAMILIES_V2.map(
            f => `<section><h2>${f.title}</h2><p>${f.blurb}</p><div class="grid">${marksV2.filter(m => m.family === f.key).map(cardV2).join("")}</div></section>`
        ),
        sheetSection("sheets", s2, "Avatar tests in both polarities, the A6 tightening sweeps, type and stroke studies, and lockups.")
    ].join("")

    writeFileSync(
        `${OUT}/1/index.html`,
        page({
            title: "ROUND 1 / MARK STUDIES",
            lede: "24-unit field, 6-unit stroke, 90 and 45 degrees only. Left pane is ink on #0A0A0A, right pane is near-black on bone. Preserved exactly as first delivered, including the palette and the since-corrected note about the r.",
            current: 1,
            body: body1
        })
    )

    writeFileSync(
        `${OUT}/2/index.html`,
        page({
            title: "ROUND 2 / MARK STUDIES",
            lede: "Nine new families, each carrying a stated meaning. Palette is now yours: #FFFFFF on #101010 for dark, #404040 on #FFFFFF for light, #808080 as the duotone neutral. Angles beyond 45 are tested in the last family.",
            current: 2,
            body: body2
        })
    )

    const s4 = readdirSync(SHEETS4).filter(f => f.endsWith(".png")).sort()

    for (const f of s4) copyFileSync(`${SHEETS4}/${f}`, `${OUT}/4/sheets/${f}`)

    const body4 = [
        ...FAMILIES_V4.map(
            f => `<section><h2>${f.title}</h2><p>${f.blurb}</p><div class="grid">${marksV4.filter(m => m.family === f.key).map(cardV3).join("")}</div></section>`
        ),
        sheetSection("sheets", s4, "Avatar tests, Berkeley Mono weight and tracking studies, and the finalist lockups.")
    ].join("")

    writeFileSync(
        `${OUT}/4/index.html`,
        page({
            title: "ROUND 4 / REFINEMENT",
            lede: "The thesis is settled. This round varies exactly one thing at a time against a fixed base: expo-out taper, floating inside a frame, throat and inflection centred at 50%. Twelve inflection-point stars, ten easings including the 45-degree mirrors, and sweeps for frame weight, attachment, bar weight, inflection position and star reach. Wordmark is real Berkeley Mono.",
            current: 4,
            body: body4
        })
    )

    const s5 = readdirSync(SHEETS5).filter(f => f.endsWith(".png")).sort()

    for (const f of s5) copyFileSync(`${SHEETS5}/${f}`, `${OUT}/5/sheets/${f}`)

    const body5 = [
        ...FAMILIES_V5.map(
            f => `<section><h2>${f.title}</h2><p>${f.blurb}</p><div class="grid">${marksV5.filter(m => m.family === f.key).map(cardV3).join("")}</div></section>`
        ),
        sheetSection("sheets", s5, "Construction diagram, spike anatomy, lockup mathematics, the wordmark against your original, and avatar tests.")
    ].join("")

    writeFileSync(
        `${OUT}/5/index.html`,
        page({
            title: "ROUND 5 / CONSTRUCTION",
            lede: "Canonical grid locked: 48-unit field, frame and bar both 6 (one eighth), window 36, inflection dead centre, expo-out taper, star reach 0.6. Finalists are B6, B5, R75 and a uniform heavy cut, each floating, each attached, each with its small-size derivative.",
            current: 5,
            body: body5
        })
    )

    const s6 = readdirSync(SHEETS6).filter(f => f.endsWith(".png")).sort()

    for (const f of s6) copyFileSync(`${SHEETS6}/${f}`, `${OUT}/6/sheets/${f}`)

    writeFileSync(`${OUT}/6/index.html`, page({ title: page6.title, lede: page6.lede, current: 6, body: page6.body({ card: cardV3, sheetSection }) }))

    writeFileSync(`${OUT}/index.html`, `<!doctype html><meta charset="utf-8"><meta http-equiv="refresh" content="0; url=/6/">`)

    console.log(`site: r1 ${marksV1.length + wideMarks.length} marks/${s1.length} sheets · r2 ${marksV2.length}/${s2.length} · r3 ${marksV3.length}/${s3.length}`)
}

build()
