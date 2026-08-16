import { writeFileSync, mkdirSync } from "node:fs"
import { Resvg } from "@resvg/resvg-js"

import { marks, FAMILIES, build, cut, CANON, geometry } from "./marks-r5.mjs"
import { SCHEMES, renderMark, standalone } from "./render.mjs"
import { FONT, assertFaces } from "./fontguard.mjs"

import { sheets, svgs } from "./paths.mjs"

const SHEETS5 = sheets(5)
const SVGS5 = svgs(5)

const D = SCHEMES.dark
const L = SCHEMES.light

const UI = "JetBrains Mono"
const PX = "Px Grotesk Mono Trial"
const ACCENT = "#FF5C3B"

assertFaces([[UI, 700], [PX, 700], ["Px Grotesk Mono", 400], ["Berkeley Mono", 700], ["Px Grotesk Screen", 400]])

const rasterize = (svg, width) => {
    const out = new Resvg(svg, { fitTo: { mode: "width", value: width }, font: FONT }).render()

    return { png: out.asPng(), pixels: out.pixels, width: out.width, height: out.height }
}

const write = (name, svg, width = 1080) => {
    const out = rasterize(svg, width)

    writeFileSync(`${SHEETS5}/${name}.png`, out.png)

    console.log(`  ${name}.png  ${out.width}x${out.height}`)
}

const text = (content, { x, y, size = 15, fill = D.mute, weight = 400, anchor = "start", family = UI, spacing = 0 }) =>
    `<text x="${x}" y="${y}" font-family="${family}" font-size="${size}" font-weight="${weight}" fill="${fill}" text-anchor="${anchor}" letter-spacing="${spacing}">${content}</text>`

const sheet = (w, h, body, bg = D.bg) =>
    `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}"><rect width="${w}" height="${h}" fill="${bg}"/>${body}</svg>`

const header = (title, subtitle) => [
    text(title, { x: 30, y: 50, size: 24, fill: D.fg, weight: 700, spacing: 1.5 }),
    text(subtitle, { x: 30, y: 78, size: 13, fill: D.mute })
]

const pixelView = (mark, px, x, y, scale) => {
    const { pixels } = rasterize(standalone(mark, { size: px, scheme: "dark" }), px)
    const cells = []

    for (let row = 0; row < px; row++)
        for (let col = 0; col < px; col++) {
            const a = pixels[(row * px + col) * 4 + 3] / 255

            if (a > 0.02)
                cells.push(`<rect x="${(x + col * scale).toFixed(2)}" y="${(y + row * scale).toFixed(2)}" width="${scale}" height="${scale}" fill="${D.fg}" fill-opacity="${a.toFixed(3)}"/>`)
        }

    return cells.join("")
}

const markCell = (mark, x, y) => {
    const t = 190
    const parts = []

    const place = (tx, scheme, bg) => {
        const size = t * 0.74

        parts.push(`<rect x="${tx}" y="${y}" width="${t}" height="${t}" fill="${bg}" stroke="${D.line}"/>`)
        parts.push(renderMark(mark, { x: tx + (t - size) / 2, y: y + (t - size) / 2, size, scheme }))
    }

    place(x, "dark", D.bg)
    place(x + t + 14, "light", L.bg)

    const px = x + 2 * t + 28

    parts.push(`<rect x="${px}" y="${y}" width="88" height="88" fill="${D.panel}"/>`)
    parts.push(pixelView(mark, 16, px, y, 5.5))
    parts.push(text("16px", { x: px, y: y + 104, size: 11, fill: D.dim }))
    parts.push(renderMark(mark, { x: px, y: y + 122, size: 16, scheme: "dark" }))
    parts.push(renderMark(mark, { x: px + 28, y: y + 122, size: 24, scheme: "dark" }))
    parts.push(renderMark(mark, { x: px + 66, y: y + 122, size: 32, scheme: "dark" }))
    parts.push(text("16 / 24 / 32", { x: px, y: y + 172, size: 11, fill: D.dim }))

    parts.push(text(mark.label, { x, y: y + t + 28, size: 15, fill: D.fg, weight: 700 }))
    parts.push(text(mark.means, { x, y: y + t + 50, size: 12, fill: D.mute }))

    return parts.join("")
}

const familySheet = family => {
    const set = marks.filter(m => m.family === family.key)
    const cellW = 520
    const cellH = 288
    const top = 128
    const rows = Math.ceil(set.length / 2)

    const parts = header(family.title.toUpperCase(), family.blurb.length > 120 ? `${family.blurb.slice(0, 118)}...` : family.blurb)

    set.forEach((m, i) => parts.push(markCell(m, 30 + (i % 2) * cellW, top + Math.floor(i / 2) * cellH)))

    return sheet(1080, top + rows * cellH + 16, parts.join(""))
}

//  ------------------------------------------------------------- construction

const CONSTRUCT = build({})
const G = geometry(CANON)

const constructionSheet = () => {
    const S = 760
    const u = S / CANON.field
    const ox = 160
    const oy = 130

    const parts = header("CONSTRUCTION / B6", "48-unit field. every dimension below is a simple fraction of it. grid drawn over the ink in accent so both tones stay readable.")

    const px = n => ox + n * u
    const py = n => oy + n * u

    parts.push(`<rect x="${ox}" y="${oy}" width="${S}" height="${S}" fill="#0D0D0D"/>`)

    const grid = (color, opMinor, opMajor) => {
        const out = []

        for (let i = 0; i <= CANON.field; i++) {
            const major = i % 6 === 0
            const w = (major ? 1.5 : 0.8)

            out.push(`<rect x="${(px(i) - w / 2).toFixed(2)}" y="${oy}" width="${w}" height="${S}" fill="${color}" fill-opacity="${major ? opMajor : opMinor}"/>`)
            out.push(`<rect x="${ox}" y="${(py(i) - w / 2).toFixed(2)}" width="${S}" height="${w}" fill="${color}" fill-opacity="${major ? opMajor : opMinor}"/>`)
        }

        return out.join("")
    }

    parts.push(grid(ACCENT, 0.22, 0.7))
    parts.push(renderMark(CONSTRUCT, { x: ox, y: oy, size: S, scheme: "dark" }))

    //  Grid again, masked to the ink, in a darker accent so it reads on white.
    const inkMask = `cm${Date.now()}`

    parts.push(
        `<mask id="${inkMask}" maskUnits="userSpaceOnUse" x="${ox}" y="${oy}" width="${S}" height="${S}"><rect x="${ox}" y="${oy}" width="${S}" height="${S}" fill="#000"/><g>${renderMark(CONSTRUCT, { x: ox, y: oy, size: S, scheme: "dark" })}</g></mask>`
    )
    parts.push(`<g mask="url(#${inkMask})">${grid("#C4361B", 0.35, 0.9)}</g>`)

    for (let i = 0; i <= CANON.field; i += 6) {
        parts.push(text(String(i), { x: px(i), y: oy - 10, size: 11, fill: ACCENT, anchor: "middle" }))
        parts.push(text(String(i), { x: ox - 10, y: py(i) + 4, size: 11, fill: ACCENT, anchor: "end" }))
    }

    const spec = [
        ["field", "48", "1", "the whole tile"],
        ["frame", "6", "1/8", "outer border, locked equal to the bar"],
        ["bar", "6", "1/8", "output channel, same stroke as the frame"],
        ["window", "36", "3/4", "48 - 2 x 6"],
        ["gap", "3", "1/16", "void margin, float attachment"],
        ["mouth", "27", "3/4 win", "intake height at x = 3"],
        ["inflection", "18", "win/2", "throat and star, dead centre"],
        ["star reach", "10.8", "0.6 x 18", "vertical spike tip"],
        ["diag reach", "8.4", "0.78 x 10.8", "diagonal spike tip"],
        ["axis base", "4.8", "1.6 x 3", "vertical spike base width"],
        ["diag base", "3.0", "1.0 x 3", "diagonal spike base width"]
    ]

    const tableTop = oy + S + 84

    parts.push(text("DIMENSION", { x: 30, y: tableTop - 14, size: 12, fill: D.fg, weight: 700, spacing: 1 }))

    spec.forEach(([k, v, frac, why], i) => {
        const col = i % 2
        const row = Math.floor(i / 2)
        const x = 30 + col * 520
        const ly = tableTop + row * 42

        parts.push(text(k, { x, y: ly, size: 13, fill: D.fg }))
        parts.push(text(v, { x: x + 150, y: ly, size: 13, fill: ACCENT, anchor: "end" }))
        parts.push(text(frac, { x: x + 252, y: ly, size: 12, fill: D.mute, anchor: "end" }))
        parts.push(text(why, { x: x + 264, y: ly, size: 11, fill: D.dim }))
    })

    return sheet(1080, tableTop + Math.ceil(spec.length / 2) * 42 + 24, parts.join(""))
}

//  ------------------------------------------------------------- spike anatomy

const anatomySheet = () => {
    const S = 420
    const parts = header("SPIKE ANATOMY", "the star is a union of six triangles sharing one centre. no polygon star, no boolean subtraction.")

    const stages = [
        { label: "1. funnel only", over: { star: null } },
        { label: "2. + vertical pair", over: { diagRatio: 0 } },
        { label: "3. + four diagonals", over: {} }
    ]

    stages.forEach((st, i) => {
        const x = 30 + i * (S + 20)
        const m = build(st.over)

        parts.push(`<rect x="${x}" y="120" width="${S}" height="${S}" fill="${D.bg}" stroke="${D.line}"/>`)
        parts.push(renderMark(m, { x, y: 120, size: S, scheme: "dark" }))
        parts.push(text(st.label, { x, y: 120 + S + 28, size: 14, fill: D.fg, weight: 700 }))
    })

    const notes = [
        "Each spike is a triangle: apex at `length` from the centre, base of `base` across, perpendicular to its own axis.",
        "Vertical pair sits at 90 and 270 degrees. Diagonals sit at 45, 135, 225 and 315.",
        "There is no horizontal spike: the output bar already supplies that axis, which is why the star fuses with it.",
        "All six overlap at the centre and are painted into one mask, so the union is implicit and seam-free."
    ]

    notes.forEach((n, i) => parts.push(text(n, { x: 30, y: 120 + S + 76 + i * 22, size: 12, fill: D.mute })))

    return sheet(1080, 120 + S + 76 + notes.length * 22 + 24, parts.join(""))
}

//  ------------------------------------------------------------- lockup math

const lockupSheet = () => {
    const parts = header("LOCKUP MATHEMATICS", "icon size and gap derived from the type metrics, not eyeballed. Px Grotesk Mono Bold.")

    //  Px Grotesk Mono: cap height is 0.68 em, advance width is 0.60 em.
    const CAP = 0.68
    const ADV = 0.6

    const rows = [
        { size: 54, iconEm: 1.0, gapAdv: 1, label: "icon = 1.00 em, gap = 1 character cell" },
        { size: 54, iconEm: 1.0, gapAdv: 0.5, label: "icon = 1.00 em, gap = 1/2 cell" },
        { size: 54, iconEm: 1.18, gapAdv: 1, label: "icon = 1.18 em (cap + asc + desc), gap = 1 cell" },
        { size: 54, iconEm: CAP, gapAdv: 1, label: "icon = cap height exactly, gap = 1 cell" }
    ]

    let y = 104

    rows.forEach((r, i) => {
        const light = i % 2 === 1
        const tones = light ? L : D
        const h = 150
        const icon = r.size * r.iconEm
        const gap = r.size * ADV * r.gapAdv
        const baseline = y + h / 2 + (r.size * CAP) / 2
        const iconY = baseline - (r.size * CAP) / 2 - (icon - r.size * CAP) / 2

        parts.push(`<rect x="30" y="${y}" width="1020" height="${h}" fill="${tones.bg}" stroke="${D.line}"/>`)
        parts.push(renderMark(CONSTRUCT, { x: 70, y: iconY, size: icon, scheme: light ? "light" : "dark" }))
        parts.push(
            `<text x="${(70 + icon + gap).toFixed(1)}" y="${baseline.toFixed(1)}" font-family="${PX}" font-size="${r.size}" font-weight="700" fill="${tones.fg}">altered</text>`
        )
        parts.push(text(r.label, { x: 1020, y: y + 26, size: 11, fill: tones.mute, anchor: "end" }))

        y += h + 12
    })

    const notes = [
        "Px Grotesk Mono metrics: cap height 0.68 em, advance width 0.60 em, so one character cell = 0.60 em.",
        "Icon = 1.00 em ties the tile to the type size directly: at 54px type the icon is a 54px tile, 48 grid units.",
        "Gap = one character cell keeps the lockup on the monospace rhythm: the icon occupies a whole cell of its own.",
        "Vertical alignment is cap-centred, not baseline-sat: the icon's centre matches the cap band's centre.",
        "One grid unit of the icon = 54 / 48 = 1.125 px at this size, so the 6-unit frame renders 6.75px."
    ]

    notes.forEach((n, i) => parts.push(text(n, { x: 30, y: y + 18 + i * 22, size: 12, fill: D.mute })))

    return sheet(1080, y + 18 + notes.length * 22 + 24, parts.join(""))
}

//  ------------------------------------------------------------- wordmark vs original

const wordmarkSheet = () => {
    const parts = header("WORDMARK / AGAINST THE ORIGINAL", "your original lockup rebuilt in Px Grotesk Mono Bold, then a tracking ladder to match or beat it.")

    let y = 100

    //  Original lockup reconstruction: outlined square with the option glyph, wordmark right.
    const OPT = "M13 30h9l7-11h11 M29 19l0 0"
    const orig = `
      <rect x="30" y="${y}" width="1020" height="190" fill="#000000" stroke="${D.line}"/>
      <rect x="86" y="${y + 45}" width="100" height="100" fill="none" stroke="#FFFFFF" stroke-width="9"/>
      <path d="M108 122 h16 l14 -30 h20" fill="none" stroke="#FFFFFF" stroke-width="9" stroke-linejoin="miter"/>
      <path d="M138 92 h20" fill="none" stroke="#FFFFFF" stroke-width="9"/>
      <text x="222" y="${y + 128}" font-family="${PX}" font-size="76" font-weight="700" fill="#FFFFFF">altered</text>`

    parts.push(orig)
    parts.push(text("reconstruction of your original: outlined square + option glyph + Px Grotesk Mono Bold, tracking 0", { x: 30, y: y + 214, size: 12, fill: D.mute }))

    y += 244

    const ladder = [-3, -1.5, 0, 1.5, 3, 6]

    ladder.forEach(tr => {
        parts.push(`<rect x="30" y="${y}" width="1020" height="104" fill="${D.panel}" stroke="${D.line}"/>`)
        parts.push(
            `<text x="70" y="${y + 72}" font-family="${PX}" font-size="52" font-weight="700" fill="${D.fg}" letter-spacing="${tr}">altered</text>`
        )
        parts.push(text(`tracking ${tr > 0 ? "+" : ""}${tr} px at 52px  =  ${(tr / 52).toFixed(4)} em`, { x: 1020, y: y + 30, size: 11, fill: D.mute, anchor: "end" }))

        y += 114
    })

    const notes = [
        "Px Grotesk Mono is monospaced, so there is no kerning to fix: every advance is already 0.60 em.",
        "Optical spacing in a mono is therefore a global tracking decision, not a per-pair one.",
        "The original reads at roughly tracking 0. Slight positive tracking (+1.5 to +3 px at 52px, 0.03 to 0.06 em)",
        "opens the counters of the double-l and the r without breaking the machined rhythm.",
        "Anything past +6 starts reading as a spaced-out label rather than a wordmark."
    ]

    notes.forEach((n, i) => parts.push(text(n, { x: 30, y: y + 18 + i * 22, size: 12, fill: D.mute })))

    return sheet(1080, y + 18 + notes.length * 22 + 24, parts.join(""))
}

//  ------------------------------------------------------------- avatars

const avatarSheet = (scheme, title) => {
    const cols = 6
    const cellW = 174
    const d = 142
    const top = 118
    const blockH = 198
    const rows = Math.ceil(marks.length / cols)
    const tones = SCHEMES[scheme]

    const parts = header(title, "circle crop on true black.")

    marks.forEach((mark, i) => {
        const cx = 30 + (i % cols) * cellW
        const cy = top + Math.floor(i / cols) * blockH
        const clip = `a5${scheme}${i}`
        const size = d * 0.7

        parts.push(`<clipPath id="${clip}"><circle cx="${cx + d / 2}" cy="${cy + d / 2}" r="${d / 2}"/></clipPath>`)
        parts.push(`<g clip-path="url(#${clip})"><rect x="${cx}" y="${cy}" width="${d}" height="${d}" fill="${tones.bg}"/>`)
        parts.push(renderMark(mark, { x: cx + (d - size) / 2, y: cy + (d - size) / 2, size, scheme }))
        parts.push(`</g>`)
        parts.push(text(mark.id.toUpperCase(), { x: cx + d / 2, y: cy + d + 22, size: 9, fill: D.mute, anchor: "middle" }))
    })

    return sheet(1080, top + rows * blockH + 26, parts.join(""), "#000000")
}

mkdirSync(SHEETS5, { recursive: true })
mkdirSync(SVGS5, { recursive: true })

console.log("round five sheets:")

FAMILIES.forEach((f, i) => write(`${String(i + 1).padStart(2, "0")}-${f.key}`, familySheet(f)))

write("04-construction", constructionSheet())
write("05-anatomy", anatomySheet())
write("06-lockup-math", lockupSheet())
write("07-wordmark", wordmarkSheet())
write("08-avatars-dark", avatarSheet("dark", "AVATAR TEST / DARK"))
write("09-avatars-light", avatarSheet("light", "AVATAR TEST / LIGHT"))

for (const m of marks) writeFileSync(`${SVGS5}/${m.id}.svg`, standalone(m, { size: 512, scheme: "dark" }))

console.log(`svg5: ${marks.length} marks`)
