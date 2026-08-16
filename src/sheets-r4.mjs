import { writeFileSync, mkdirSync } from "node:fs"
import { Resvg } from "@resvg/resvg-js"

import { marks, FAMILIES } from "./marks-r4.mjs"
import { SCHEMES, renderMark, standalone } from "./render.mjs"

import { FONTS, sheets, svgs } from "./paths.mjs"

const SHEETS4 = sheets(4)
const SVGS4 = svgs(4)

const D = SCHEMES.dark
const L = SCHEMES.light

const UI = "JetBrains Mono"
const BM = "Berkeley Mono"

const FONT = { fontDirs: [FONTS, "/usr/share/fonts"], defaultFontFamily: UI, loadSystemFonts: true }

const rasterize = (svg, width) => {
    const out = new Resvg(svg, { fitTo: { mode: "width", value: width }, font: FONT }).render()

    return { png: out.asPng(), pixels: out.pixels, width: out.width, height: out.height }
}

const write = (name, svg, width = 1080) => {
    const out = rasterize(svg, width)

    writeFileSync(`${SHEETS4}/${name}.png`, out.png)

    console.log(`  ${name}.png  ${out.width}x${out.height}`)
}

const text = (content, { x, y, size = 15, fill = D.mute, weight = 400, anchor = "start", family = UI, spacing = 0 }) =>
    `<text x="${x}" y="${y}" font-family="${family}" font-size="${size}" font-weight="${weight}" fill="${fill}" text-anchor="${anchor}" letter-spacing="${spacing}">${content}</text>`

const sheet = (width, height, body, bg = D.bg) =>
    `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}"><rect x="0" y="0" width="${width}" height="${height}" fill="${bg}"/>${body}</svg>`

const header = (title, subtitle) => [
    text(title, { x: 30, y: 50, size: 24, fill: D.fg, weight: 700, spacing: 1.5 }),
    text(subtitle, { x: 30, y: 78, size: 13, fill: D.mute })
]

const pixelView = (mark, px, x, y, scale) => {
    const w = Math.round(px * (mark.w / mark.h))
    const { pixels } = rasterize(standalone(mark, { size: px, scheme: "dark" }), w)
    const cells = []

    for (let row = 0; row < px; row++)
        for (let col = 0; col < w; col++) {
            const alpha = pixels[(row * w + col) * 4 + 3] / 255

            if (alpha > 0.02)
                cells.push(
                    `<rect x="${(x + col * scale).toFixed(2)}" y="${(y + row * scale).toFixed(2)}" width="${scale}" height="${scale}" fill="${D.fg}" fill-opacity="${alpha.toFixed(3)}"/>`
                )
        }

    return cells.join("")
}

const markCell = (mark, x, y) => {
    const t = 190
    const ar = mark.w / mark.h
    const parts = []

    const place = (tx, scheme, bg) => {
        const size = t * 0.72
        const drawW = size * ar

        parts.push(`<rect x="${tx}" y="${y}" width="${t}" height="${t}" fill="${bg}" stroke="${D.line}"/>`)
        parts.push(renderMark(mark, { x: tx + (t - drawW) / 2, y: y + (t - size) / 2, size, scheme }))
    }

    place(x, "dark", D.bg)
    place(x + t + 14, "light", L.bg)

    const px = x + 2 * t + 28

    parts.push(`<rect x="${px}" y="${y}" width="${88 * (ar > 1 ? ar : 1)}" height="88" fill="${D.panel}"/>`)
    parts.push(pixelView(mark, 16, px, y, 5.5))
    parts.push(text("16px", { x: px, y: y + 104, size: 11, fill: D.dim }))

    parts.push(renderMark(mark, { x: px, y: y + 122, size: 16, scheme: "dark" }))
    parts.push(renderMark(mark, { x: px + 28 * (ar > 1 ? ar : 1), y: y + 122, size: 24, scheme: "dark" }))
    parts.push(renderMark(mark, { x: px + 66 * (ar > 1 ? ar : 1), y: y + 122, size: 32, scheme: "dark" }))
    parts.push(text("16 / 24 / 32", { x: px, y: y + 172, size: 11, fill: D.dim }))

    parts.push(text(mark.label, { x, y: y + t + 28, size: 15, fill: D.fg, weight: 700 }))
    parts.push(text(mark.means, { x, y: y + t + 50, size: 12, fill: D.mute }))

    return parts.join("")
}

const familySheet = family => {
    const set = marks.filter(m => m.family === family.key)
    const cols = 2
    const cellW = 520
    const cellH = 288
    const top = 128
    const rows = Math.ceil(set.length / cols)

    const parts = header(family.title.toUpperCase(), family.blurb.length > 120 ? `${family.blurb.slice(0, 118)}...` : family.blurb)

    set.forEach((m, i) => parts.push(markCell(m, 30 + (i % cols) * cellW, top + Math.floor(i / cols) * cellH)))

    return sheet(1080, top + rows * cellH + 16, parts.join(""))
}

const avatarSheet = (scheme, title, subtitle) => {
    const cols = 6
    const cellW = 174
    const d = 142
    const top = 120
    const blockH = 198
    const rows = Math.ceil(marks.length / cols)
    const tones = SCHEMES[scheme]

    const parts = header(title, subtitle)

    marks.forEach((mark, i) => {
        const cx = 30 + (i % cols) * cellW
        const cy = top + Math.floor(i / cols) * blockH
        const clip = `a4${scheme}${i}`
        const ar = mark.w / mark.h
        const size = d * 0.68
        const drawW = size * ar

        parts.push(`<clipPath id="${clip}"><circle cx="${cx + d / 2}" cy="${cy + d / 2}" r="${d / 2}"/></clipPath>`)
        parts.push(`<g clip-path="url(#${clip})"><rect x="${cx}" y="${cy}" width="${d}" height="${d}" fill="${tones.bg}"/>`)
        parts.push(renderMark(mark, { x: cx + (d - drawW) / 2, y: cy + (d - size) / 2, size, scheme }))
        parts.push(`</g>`)
        parts.push(text(mark.id.toUpperCase(), { x: cx + d / 2, y: cy + d + 22, size: 10, fill: D.mute, anchor: "middle" }))
    })

    return sheet(1080, top + rows * blockH + 26, parts.join(""), "#000000")
}

//  --------------------------------------------------------------- Berkeley Mono

const WEIGHTS = [
    [400, "Regular"],
    [500, "Medium"],
    [600, "SemiBold"],
    [700, "Bold"],
    [800, "ExtraBold"],
    [900, "Black"]
]

const typeSheet = () => {
    const parts = header("BERKELEY MONO / WEIGHTS", "the real font, six weights, stacked lockup with the leading period you preferred.")

    let y = 106

    WEIGHTS.forEach(([w, name], i) => {
        const light = i % 2 === 1
        const tones = light ? L : D
        const h = 176
        const size = 44

        parts.push(`<rect x="30" y="${y}" width="1020" height="${h}" fill="${tones.bg}" stroke="${D.line}"/>`)
        parts.push(
            `<text x="70" y="${y + 68}" font-family="${BM}" font-size="${size}" font-weight="${w}" fill="${tones.fg}">altered</text>`
        )
        parts.push(
            `<text x="70" y="${y + 68 + size * 1.14}" font-family="${BM}" font-size="${size}" font-weight="${w}" fill="${tones.fg}">.computer</text>`
        )
        parts.push(text(`${name} ${w}`, { x: 1020, y: y + 30, size: 11, fill: tones.mute, anchor: "end" }))

        y += h + 12
    })

    return sheet(1080, y + 20, parts.join(""))
}

const trackingSheet = () => {
    const parts = header("BERKELEY MONO / TRACKING + WIDTH", "bold and black, tracking sweep, then the condensed 80% width cut. simplified lockup with no TLD.")

    let y = 106

    const rows = [
        { fam: BM, w: 700, tr: -1, label: "Bold / -1" },
        { fam: BM, w: 700, tr: 0, label: "Bold / 0" },
        { fam: BM, w: 700, tr: 3, label: "Bold / +3" },
        { fam: BM, w: 700, tr: 8, label: "Bold / +8" },
        { fam: BM, w: 900, tr: 0, label: "Black / 0" },
        { fam: BM, w: 900, tr: 4, label: "Black / +4" },
        { fam: "Berkeley Mono Cond", w: 700, tr: 0, label: "Condensed Bold / 0" },
        { fam: "Berkeley Mono Cond", w: 900, tr: 2, label: "Condensed Black / +2" }
    ]

    rows.forEach((row, i) => {
        const light = i % 2 === 1
        const tones = light ? L : D
        const h = 104

        parts.push(`<rect x="30" y="${y}" width="1020" height="${h}" fill="${tones.bg}" stroke="${D.line}"/>`)
        parts.push(
            `<text x="70" y="${y + 68}" font-family="${row.fam}" font-size="46" font-weight="${row.w}" fill="${tones.fg}" letter-spacing="${row.tr}">altered</text>`
        )
        parts.push(text(row.label, { x: 1020, y: y + 28, size: 11, fill: tones.mute, anchor: "end" }))

        y += h + 12
    })

    return sheet(1080, y + 20, parts.join(""))
}

const lockupSheet = () => {
    const parts = header("LOCKUPS / BERKELEY MONO", "round four finalists against the real wordmark, both polarities.")

    const picks = ["s-kortex", "s-flare-kortex", "s-asterisk-h", "o1-scope-3", "b-10", "x1-cut-kortex"]
        .map(id => marks.find(m => m.id === id))
        .filter(Boolean)

    let y = 104

    picks.forEach((mark, i) => {
        const light = i % 2 === 1
        const tones = light ? L : D
        const h = 148
        const ar = mark.w / mark.h
        const size = 68

        parts.push(`<rect x="30" y="${y}" width="1020" height="${h}" fill="${tones.bg}" stroke="${D.line}"/>`)
        parts.push(renderMark(mark, { x: 70, y: y + (h - size) / 2, size, scheme: light ? "light" : "dark" }))
        parts.push(
            `<text x="${70 + size * ar + 36}" y="${y + 94}" font-family="${BM}" font-size="42" font-weight="700" fill="${tones.fg}">altered</text>`
        )
        parts.push(text(mark.label, { x: 1020, y: y + 26, size: 11, fill: tones.mute, anchor: "end" }))

        y += h + 12
    })

    return sheet(1080, y + 20, parts.join(""))
}

mkdirSync(SHEETS4, { recursive: true })
mkdirSync(SVGS4, { recursive: true })

console.log("round four sheets:")

FAMILIES.forEach((f, i) => write(`${String(i + 1).padStart(2, "0")}-${f.key}`, familySheet(f)))

write("10-avatars-dark", avatarSheet("dark", "AVATAR TEST / DARK", "circle crop on true black. every variant in this round."))
write("11-avatars-light", avatarSheet("light", "AVATAR TEST / LIGHT", "#404040 on #FFFFFF."))
write("12-type-weights", typeSheet())
write("13-type-tracking", trackingSheet())
write("14-lockups", lockupSheet())

for (const mark of marks) writeFileSync(`${SVGS4}/${mark.id}.svg`, standalone(mark, { size: 512, scheme: "dark" }))

console.log(`svg4: ${marks.length} marks`)
