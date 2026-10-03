import { writeFileSync, mkdirSync } from "node:fs"
import { Resvg } from "@resvg/resvg-js"

import { marks, wideMarks, renderMark, markMask, standalone } from "./marks-r1.mjs"

import { sheets, svgs } from "./paths.mjs"

const SHEETS1 = sheets(1)
const SVGS1 = svgs(1)

const INK = "#FAFAFA"
const PAPER = "#EDEAE4"
const TILE = "#0A0A0A"
const BG = "#141414"
const MUTED = "#7A7A7A"

//  Shared with the guard so the vendored JetBrains Mono is found on any machine.
import { FONT } from "./fontguard.mjs"

const rasterize = (svg, width) => {
    const out = new Resvg(svg, { fitTo: { mode: "width", value: width }, font: FONT }).render()

    return { png: out.asPng(), pixels: out.pixels, width: out.width, height: out.height }
}

const write = (name, svg, width) => {
    const out = rasterize(svg, width)

    writeFileSync(`${SHEETS1}/${name}.png`, out.png)

    console.log(`  ${name}.png  ${out.width}x${out.height}`)
}

const text = (content, { x, y, size = 16, fill = MUTED, weight = 400, anchor = "start", family = "JetBrains Mono", spacing = 0, opacity = 1 }) =>
    `<text x="${x}" y="${y}" font-family="${family}" font-size="${size}" font-weight="${weight}" fill="${fill}" fill-opacity="${opacity}" text-anchor="${anchor}" letter-spacing="${spacing}">${content}</text>`

const sheet = (width, height, body, bg = BG) =>
    `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}"><rect x="0" y="0" width="${width}" height="${height}" fill="${bg}"/>${body}</svg>`

const header = (title, subtitle) => [
    text(title, { x: 30, y: 52, size: 27, fill: INK, weight: 700, spacing: 2 }),
    text(subtitle, { x: 30, y: 84, size: 14, fill: MUTED })
]

//  Per-mark cell: both polarities, the true 16px raster, and a real-size strip.

const pixelView = (mark, px, x, y, scale, ink = INK) => {
    const { pixels } = rasterize(standalone(mark, { size: px, ink }), px)
    const cells = []

    for (let row = 0; row < px; row++) {
        for (let col = 0; col < px; col++) {
            const alpha = pixels[(row * px + col) * 4 + 3] / 255

            if (alpha > 0.02)
                cells.push(
                    `<rect x="${(x + col * scale).toFixed(2)}" y="${(y + row * scale).toFixed(2)}" width="${scale}" height="${scale}" fill="${ink}" fill-opacity="${alpha.toFixed(3)}"/>`
                )
        }
    }

    return cells.join("")
}

const markCell = (mark, x, y) => {
    const t = 190
    const parts = []

    parts.push(`<rect x="${x}" y="${y}" width="${t}" height="${t}" rx="16" fill="${TILE}"/>`)
    parts.push(renderMark(mark, { x: x + t * 0.19, y: y + t * 0.19, size: t * 0.62, ink: INK }))

    parts.push(`<rect x="${x + t + 14}" y="${y}" width="${t}" height="${t}" rx="16" fill="${PAPER}"/>`)
    parts.push(renderMark(mark, { x: x + t + 14 + t * 0.19, y: y + t * 0.19, size: t * 0.62, ink: TILE }))

    const px = x + 2 * t + 28

    parts.push(`<rect x="${px}" y="${y}" width="88" height="88" fill="#1C1C1C"/>`)
    parts.push(pixelView(mark, 16, px, y, 5.5))
    parts.push(text("16px raster", { x: px, y: y + 106, size: 11, fill: "#6A6A6A" }))

    parts.push(renderMark(mark, { x: px, y: y + 126, size: 16, ink: INK }))
    parts.push(renderMark(mark, { x: px + 26, y: y + 126, size: 24, ink: INK }))
    parts.push(renderMark(mark, { x: px + 58, y: y + 126, size: 30, ink: INK }))
    parts.push(text("actual size", { x: px, y: y + 176, size: 11, fill: "#6A6A6A" }))

    parts.push(text(mark.label, { x, y: y + t + 30, size: 17, fill: INK, weight: 700 }))
    parts.push(text(mark.note, { x, y: y + t + 54, size: 13, fill: MUTED }))

    return parts.join("")
}

const familySheet = (title, subtitle, set) => {
    const cols = 2
    const cellW = 520
    const cellH = 292
    const top = 118
    const rows = Math.ceil(set.length / cols)

    const parts = header(title, subtitle)

    set.forEach((mark, i) => {
        parts.push(markCell(mark, 30 + (i % cols) * cellW, top + Math.floor(i / cols) * cellH))
    })

    return sheet(1080, top + rows * cellH + 20, parts.join(""))
}

//  Construction diagrams: the mark under its own grid, so every edge is accountable.

const gridLines = (unitPx, color, opMinor, opMajor) => {
    const out = []

    for (let i = 0; i <= 24; i++) {
        const major = i % 6 === 0
        const op = major ? opMajor : opMinor
        const w = (major ? 1.6 : 1) / unitPx

        out.push(`<rect x="${(i - w / 2).toFixed(3)}" y="0" width="${w.toFixed(3)}" height="24" fill="${color}" fill-opacity="${op}"/>`)
        out.push(`<rect x="0" y="${(i - w / 2).toFixed(3)}" width="24" height="${w.toFixed(3)}" fill="${color}" fill-opacity="${op}"/>`)
    }

    return out.join("")
}

const constructionCell = (mark, x, y, size) => {
    const u = size / 24
    const { id, def } = markMask(mark)
    const frame = `<g transform="translate(${x} ${y}) scale(${u})">`

    const parts = [
        def,
        `<rect x="${x}" y="${y}" width="${size}" height="${size}" fill="#0D0D0D"/>`,
        //  Grid on the void, then ink over it, then the grid again inside the ink in a darker tone.
        `${frame}${gridLines(u, "#FF5C3B", 0.4, 0.95)}</g>`,
        `${frame}<rect x="0" y="0" width="24" height="24" fill="${PAPER}" mask="url(#${id})"/></g>`,
        `${frame}<g mask="url(#${id})">${gridLines(u, "#C4361B", 0.45, 0.95)}</g></g>`
    ]

    for (let i = 0; i <= 24; i += 6) {
        parts.push(text(String(i), { x: x + i * u, y: y - 10, size: 11, fill: "#FF5C3B", anchor: "middle", opacity: 0.8 }))
        parts.push(text(String(i), { x: x - 12, y: y + i * u + 4, size: 11, fill: "#FF5C3B", anchor: "end", opacity: 0.8 }))
    }

    parts.push(text(mark.label, { x, y: y + size + 30, size: 17, fill: INK, weight: 700 }))
    parts.push(text(mark.note, { x, y: y + size + 52, size: 13, fill: MUTED }))

    return parts.join("")
}

const constructionSheet = ids => {
    const set = ids.map(id => marks.find(m => m.id === id))
    const size = 400
    const cols = 2
    const cellW = 510
    const cellH = size + 92
    const top = 140
    const rows = Math.ceil(set.length / cols)

    const parts = header("CONSTRUCTION", "24-unit field, 6-unit stroke. every vertex lands on a multiple of 3, most on 6. no arbitrary curves, no optical fudging.")

    set.forEach((mark, i) => {
        parts.push(constructionCell(mark, 46 + (i % cols) * cellW, top + Math.floor(i / cols) * cellH, size))
    })

    return sheet(1080, top + rows * cellH + 20, parts.join(""))
}

//  Avatars: circle crop on a true-black feed, both polarities.

const avatarSheet = (tileColor, inkColor, title, subtitle) => {
    const cols = 5
    const cellW = 208
    const d = 168
    const top = 132
    const blockH = 236
    const rows = Math.ceil(marks.length / cols)

    const parts = header(title, subtitle)

    const block = (offsetY, tile, ink) => {
        marks.forEach((mark, i) => {
            const cx = 30 + (i % cols) * cellW
            const cy = offsetY + Math.floor(i / cols) * blockH
            const clip = `c${offsetY}-${i}`

            parts.push(`<clipPath id="${clip}"><circle cx="${cx + d / 2}" cy="${cy + d / 2}" r="${d / 2}"/></clipPath>`)
            parts.push(`<g clip-path="url(#${clip})"><rect x="${cx}" y="${cy}" width="${d}" height="${d}" fill="${tile}"/>`)
            parts.push(renderMark(mark, { x: cx + d * 0.21, y: cy + d * 0.21, size: d * 0.58, ink }))
            parts.push(`</g>`)
            parts.push(text(mark.id.split("-")[0].toUpperCase(), { x: cx + d / 2, y: cy + d + 24, size: 13, fill: "#8A8A8A", anchor: "middle" }))
        })
    }

    block(top, tileColor, inkColor)

    return sheet(1080, top + rows * blockH + 30, parts.join(""), "#000000")
}

//  Wordmark. JetBrains Mono stands in for Berkeley Mono v2; the mirrored r is the signature.

const wordmark = ({ x, y, size, ink, stacked = false, dot = false, mark = null, weight = 700 }) => {
    const advance = size * 0.6
    const parts = []

    let cursor = x

    if (mark) {
        parts.push(renderMark(mark, { x: cursor, y: y - size * 0.74, size: size * 0.96, ink }))
        cursor += size * 0.96 + size * 0.4
    }

    const base = cursor

    const set = (glyphs, w, baseline = y) =>
        glyphs.split("").forEach(g => {
            parts.push(text(g, { x: cursor, y: baseline, size, fill: ink, weight: w }))
            cursor += advance
        })

    set("alte", weight)

    parts.push(
        `<g transform="translate(${(cursor + advance).toFixed(2)} 0) scale(-1 1)">${text("r", { x: 0, y, size, fill: ink, weight })}</g>`
    )
    cursor += advance

    set("ed", weight)

    if (dot) {
        const s = size * 0.15
        const place = (cx, cy) => `<rect x="${(cx + (advance - s) / 2).toFixed(2)}" y="${(cy - s).toFixed(2)}" width="${s}" height="${s}" fill="${ink}"/>`

        if (stacked) {
            const y2 = y + size * 1.15

            parts.push(place(base, y2))
            cursor = base + advance
            set("computer", 400, y2)
        } else {
            parts.push(place(cursor, y))
            cursor += advance
            set("computer", 400)
        }
    }

    return parts.join("")
}

const lockupSheet = () => {
    const parts = header("WIDE STUDIES + LOCKUPS", "wordmark in JetBrains Mono as a stand-in for Berkeley Mono v2. the period is a square on the same grid.")

    let y = 128

    wideMarks.forEach(mark => {
        parts.push(`<rect x="30" y="${y}" width="1020" height="190" fill="${TILE}"/>`)
        parts.push(renderMark(mark, { x: 90, y: y + 45, size: 100, ink: INK }))
        parts.push(text(mark.label, { x: 30, y: y + 216, size: 17, fill: INK, weight: 700 }))
        parts.push(text(mark.note, { x: 30, y: y + 238, size: 13, fill: MUTED }))

        y += 280
    })

    const pick = id => marks.find(m => m.id === id)

    const lockups = [
        { caption: "one line, square period", h: 170, fn: o => wordmark({ ...o, dot: true }) },
        { caption: "stacked, the square period anchors the second line", h: 240, fn: o => wordmark({ ...o, dot: true, stacked: true }) },
        { caption: "icon lockup: A2 Deviation / slot", h: 170, fn: o => wordmark({ ...o, mark: pick("a2-deviation-void") }) },
        { caption: "icon lockup: C4 Interlock / single, gutter", h: 170, fn: o => wordmark({ ...o, mark: pick("c4-interlock-z-seam") }) },
        { caption: "icon lockup: D2 Aperture / closed", h: 170, fn: o => wordmark({ ...o, mark: pick("d2-aperture-closed") }) },
        { caption: "icon lockup: A6 Ramp / cut", h: 170, fn: o => wordmark({ ...o, mark: pick("a6-ramp-cut") }) }
    ]

    lockups.forEach(({ caption, fn, h }, i) => {
        const dark = i % 2 === 0

        parts.push(`<rect x="30" y="${y}" width="1020" height="${h}" fill="${dark ? TILE : PAPER}"/>`)
        parts.push(fn({ x: 90, y: y + (h === 240 ? 88 : 104), size: 54, ink: dark ? INK : TILE }))
        parts.push(text(caption, { x: 30, y: y + h + 24, size: 13, fill: MUTED }))

        y += h + 60
    })

    return sheet(1080, y + 10, parts.join(""))
}

mkdirSync(SHEETS1, { recursive: true })
mkdirSync(SVGS1, { recursive: true })

const byFamily = f => marks.filter(m => m.family === f)

console.log("sheets:")

const seam = byFamily("seam")

write("01-seam-step", familySheet("FAMILY 1A / THE STEP", "a solid field split by a stepped seam. inherits the branching intent of the option glyph.", seam.slice(0, 3)), 1080)
write("02-seam-ramp", familySheet("FAMILY 1B / THE RAMP", "the same idea with a 45 degree rise instead of a right-angle step.", seam.slice(3, 7)), 1080)
write("03-seam-interlock", familySheet("FAMILY 1C / THE INTERLOCK", "exact halves under 180 degree rotation, then the same seams opened into gutters.", seam.slice(7)), 1080)
write("04-ramp-aperture", familySheet("FAMILY 2 / RAMP + FAMILY 3 / APERTURE", "noise resolving into signal, and many-in one-out convergence.", [...byFamily("ramp"), ...byFamily("aperture")]), 1080)
write("05-block-letter", familySheet("FAMILY 4 / BLOCK + FAMILY 5 / LETTER", "layers, containment, powers of two, and the flipped r promoted to a mark.", [...byFamily("block"), ...byFamily("letter")]), 1080)
write("06-avatars-dark", avatarSheet(TILE, INK, "AVATAR TEST / DARK TILE", "circle crop on a true-black feed. this is the test the current mark fails."), 1080)
write("06b-avatars-inverted", avatarSheet(PAPER, TILE, "AVATAR TEST / INVERTED", "near-black on bone. out-contrasts every avatar around it in a dark feed."), 1080)
write("07-construction", constructionSheet(["a2-deviation-void", "a4-deviation-cut", "a6-ramp-cut", "a7-ramp-hairline", "a8-diagonal", "d2-aperture-closed"]), 1080)
write("08-wide-lockups", lockupSheet(), 1080)

for (const mark of [...marks, ...wideMarks]) {
    writeFileSync(`${SVGS1}/${mark.id}.svg`, standalone(mark, { size: 512, ink: INK }))
    writeFileSync(`${SVGS1}/${mark.id}-tile.svg`, standalone(mark, { size: 512, ink: INK, paper: TILE, radius: 42 }))
}

console.log(`svg: ${marks.length + wideMarks.length} marks x 2 variants`)
