import { writeFileSync, mkdirSync } from "node:fs"
import { Resvg } from "@resvg/resvg-js"

import { marks, FAMILIES, band, full, angledRamp, P, R } from "./marks-r2.mjs"
import { SCHEMES, renderMark, standalone, maskFor } from "./render.mjs"

import { FONTS, sheets, svgs } from "./paths.mjs"

const SHEETS2 = sheets(2)
const SVGS2 = svgs(2)

const D = SCHEMES.dark
const L = SCHEMES.light

const UI = "Archivo"
const MONO = "Martian Mono"

const FONT = { fontDirs: [FONTS, "/usr/share/fonts"], defaultFontFamily: UI, loadSystemFonts: true }

const rasterize = (svg, width) => {
    const out = new Resvg(svg, { fitTo: { mode: "width", value: width }, font: FONT }).render()

    return { png: out.asPng(), pixels: out.pixels, width: out.width, height: out.height }
}

const write = (name, svg, width = 1080) => {
    const out = rasterize(svg, width)

    writeFileSync(`${SHEETS2}/${name}.png`, out.png)

    console.log(`  ${name}.png  ${out.width}x${out.height}`)
}

const text = (content, { x, y, size = 15, fill = D.mute, weight = 400, anchor = "start", family = UI, spacing = 0, opacity = 1 }) =>
    `<text x="${x}" y="${y}" font-family="${family}" font-size="${size}" font-weight="${weight}" fill="${fill}" fill-opacity="${opacity}" text-anchor="${anchor}" letter-spacing="${spacing}">${content}</text>`

const sheet = (width, height, body, bg = D.bg) =>
    `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}"><rect x="0" y="0" width="${width}" height="${height}" fill="${bg}"/>${body}</svg>`

const header = (title, subtitle) => [
    text(title, { x: 30, y: 50, size: 25, fill: D.fg, weight: 700, spacing: 1.5 }),
    text(subtitle, { x: 30, y: 80, size: 14, fill: D.mute })
]

//  --------------------------------------------------------------- family cells

const pixelView = (mark, px, x, y, scale) => {
    const { pixels } = rasterize(standalone(mark, { size: px, scheme: "dark" }), px)
    const cells = []

    for (let row = 0; row < px; row++) {
        for (let col = 0; col < px; col++) {
            const i = (row * px + col) * 4
            const alpha = pixels[i + 3] / 255

            if (alpha > 0.02) {
                const lum = (pixels[i] + pixels[i + 1] + pixels[i + 2]) / 3
                const tone = `rgb(${lum | 0},${lum | 0},${lum | 0})`

                cells.push(
                    `<rect x="${(x + col * scale).toFixed(2)}" y="${(y + row * scale).toFixed(2)}" width="${scale}" height="${scale}" fill="${tone}" fill-opacity="${alpha.toFixed(3)}"/>`
                )
            }
        }
    }

    return cells.join("")
}

const markCell = (mark, x, y) => {
    const t = 190
    const parts = []

    parts.push(`<rect x="${x}" y="${y}" width="${t}" height="${t}" rx="16" fill="${D.bg}"/>`)
    parts.push(`<rect x="${x}" y="${y}" width="${t}" height="${t}" rx="16" fill="none" stroke="${D.line}" stroke-width="1"/>`)
    parts.push(renderMark(mark, { x: x + t * 0.19, y: y + t * 0.19, size: t * 0.62, scheme: "dark" }))

    parts.push(`<rect x="${x + t + 14}" y="${y}" width="${t}" height="${t}" rx="16" fill="${L.bg}"/>`)
    parts.push(renderMark(mark, { x: x + t + 14 + t * 0.19, y: y + t * 0.19, size: t * 0.62, scheme: "light" }))

    const px = x + 2 * t + 28

    parts.push(`<rect x="${px}" y="${y}" width="88" height="88" fill="${D.panel}"/>`)
    parts.push(pixelView(mark, 16, px, y, 5.5))
    parts.push(text("16px raster", { x: px, y: y + 106, size: 11, fill: D.dim }))

    parts.push(renderMark(mark, { x: px, y: y + 126, size: 16, scheme: "dark" }))
    parts.push(renderMark(mark, { x: px + 26, y: y + 126, size: 24, scheme: "dark" }))
    parts.push(renderMark(mark, { x: px + 58, y: y + 126, size: 30, scheme: "dark" }))
    parts.push(text("actual size", { x: px, y: y + 176, size: 11, fill: D.dim }))

    parts.push(text(mark.label, { x, y: y + t + 30, size: 16, fill: D.fg, weight: 700 }))
    parts.push(text(mark.means, { x, y: y + t + 52, size: 13, fill: D.mute }))

    return parts.join("")
}

const familySheet = (family) => {
    const set = marks.filter(m => m.family === family.key)
    const cols = 2
    const cellW = 520
    const cellH = 290
    const top = 122
    const rows = Math.ceil(set.length / cols)

    const parts = header(family.title.toUpperCase(), family.blurb)

    set.forEach((mark, i) => parts.push(markCell(mark, 30 + (i % cols) * cellW, top + Math.floor(i / cols) * cellH)))

    return sheet(1080, top + rows * cellH + 16, parts.join(""))
}

//  ------------------------------------------------------------- avatars

const avatarSheet = (scheme, title, subtitle) => {
    const cols = 5
    const cellW = 208
    const d = 168
    const top = 128
    const blockH = 236
    const rows = Math.ceil(marks.length / cols)
    const tones = SCHEMES[scheme]

    const parts = header(title, subtitle)

    marks.forEach((mark, i) => {
        const cx = 30 + (i % cols) * cellW
        const cy = top + Math.floor(i / cols) * blockH
        const clip = `av${scheme}${i}`

        parts.push(`<clipPath id="${clip}"><circle cx="${cx + d / 2}" cy="${cy + d / 2}" r="${d / 2}"/></clipPath>`)
        parts.push(`<g clip-path="url(#${clip})"><rect x="${cx}" y="${cy}" width="${d}" height="${d}" fill="${tones.bg}"/>`)
        parts.push(renderMark(mark, { x: cx + d * 0.21, y: cy + d * 0.21, size: d * 0.58, scheme }))
        parts.push(`</g>`)
        parts.push(text(mark.id.split("-")[0].toUpperCase(), { x: cx + d / 2, y: cy + d + 24, size: 12, fill: D.mute, anchor: "middle" }))
    })

    return sheet(1080, top + rows * blockH + 26, parts.join(""), "#000000")
}

//  ------------------------------------------------------------- A6 tightening

//  Entry run and channel width are the only two knobs. Everything else, including
//  the vertical margins, falls out of holding the rise at 45 degrees.
const ramp = (thickness, flat) => {
    const run = 24 - flat * 2
    const pad = (24 - thickness - run) / 2
    const centreLo = 24 - pad - thickness / 2
    const centreHi = pad + thickness / 2

    return band([[0, centreLo], [flat, centreLo], [flat + run, centreHi], [24, centreHi]], thickness)
}

const rampMark = (thickness, flat, id, label, means) => ({
    id,
    label,
    means,
    w: 24,
    h: 24,
    ops: [{ d: full, on: true }, { d: ramp(thickness, flat), on: false }]
})

const tighteningSheet = () => {
    const widths = [
        rampMark(3, 6, "w3", "channel 3", "1:8 of the field"),
        rampMark(4, 6, "w4", "channel 4", "1:6"),
        rampMark(5, 6, "w5", "channel 5", "between"),
        rampMark(6, 6, "w6", "channel 6", "1:4, the original A6")
    ]

    const flats = [3, 4, 6, 8].map(f => rampMark(6, f, `f${f}`, `entry ${f}`, `run ${24 - f * 2}, margin ${(24 - 6 - (24 - f * 2)) / 2}`))

    const parts = header("A6 TIGHTENING", "channel width sweep, entry-run sweep, and a corner radius sweep on the winner from round one.")

    let y = 116

    const strip = (set, caption) => {
        parts.push(text(caption, { x: 30, y: y - 8, size: 13, fill: D.fg, weight: 700 }))

        set.forEach((mark, i) => {
            const x = 30 + i * 258

            parts.push(`<rect x="${x}" y="${y}" width="230" height="230" rx="18" fill="${D.bg}"/>`)
            parts.push(`<rect x="${x}" y="${y}" width="230" height="230" rx="18" fill="none" stroke="${D.line}"/>`)
            parts.push(renderMark(mark, { x: x + 44, y: y + 44, size: 142, scheme: "dark" }))
            parts.push(renderMark(mark, { x: x + 4, y: y + 240, size: 16, scheme: "dark" }))
            parts.push(renderMark(mark, { x: x + 28, y: y + 240, size: 24, scheme: "dark" }))
            parts.push(text(mark.label, { x: x + 62, y: y + 256, size: 13, fill: D.fg, weight: 700 }))
            parts.push(text(mark.means, { x: x + 62, y: y + 272, size: 11, fill: D.mute }))
        })

        y += 320
    }

    strip(widths, "CHANNEL WIDTH")
    strip(flats, "ENTRY RUN")

    parts.push(text("CORNER RADIUS, AS A FRACTION OF THE FIELD", { x: 30, y: y - 8, size: 13, fill: D.fg, weight: 700 }))

    const winner = rampMark(6, 6, "win", "", "")

    ;[0, 1, 2, 3, 4].forEach((units, i) => {
        const x = 30 + i * 206
        const size = 186
        const r = (units / 24) * size
        const clip = `rad${i}`

        parts.push(`<clipPath id="${clip}"><rect x="${x}" y="${y}" width="${size}" height="${size}" rx="${r}"/></clipPath>`)
        parts.push(`<g clip-path="url(#${clip})">`)
        parts.push(`<rect x="${x}" y="${y}" width="${size}" height="${size}" fill="${D.bg}"/>`)
        parts.push(renderMark(winner, { x, y, size, scheme: "dark" }))
        parts.push(`</g>`)
        parts.push(text(`${units}u  ${((units / 24) * 100).toFixed(1)}%`, { x, y: y + size + 22, size: 12, fill: D.mute }))
    })

    y += 240

    return sheet(1080, y, parts.join(""))
}

//  ------------------------------------------------------------- type studies

const wordmarkLine = ({ x, y, size, fill, family, weight, tracking, label, second = null, secondWeight = 400 }) => {
    const parts = [
        `<text x="${x}" y="${y}" font-family="${family}" font-size="${size}" font-weight="${weight}" fill="${fill}" letter-spacing="${tracking}">altered</text>`
    ]

    if (second)
        parts.push(
            `<text x="${x}" y="${y + size * 1.12}" font-family="${family}" font-size="${size}" font-weight="${secondWeight}" fill="${fill}" letter-spacing="${tracking}">${second}</text>`
        )

    if (label) parts.push(text(label, { x, y: y + (second ? size * 1.12 : 0) + 30, size: 12, fill: D.mute }))

    return parts.join("")
}

const typeSheet = () => {
    const parts = header(
        "TYPE STUDIES",
        "Px Grotesk was not reachable from this agent, so these are labelled stand-ins. Martian Mono for the mono cut, Archivo for the grotesque."
    )

    let y = 140

    const strip = (caption, rows) => {
        parts.push(text(caption, { x: 30, y, size: 13, fill: D.fg, weight: 700, spacing: 1 }))

        y += 26

        rows.forEach(row => {
            parts.push(`<rect x="30" y="${y}" width="1020" height="${row.h ?? 108}" fill="${row.light ? L.bg : D.panel}"/>`)
            parts.push(
                wordmarkLine({
                    x: 60,
                    y: y + (row.second ? 52 : 68),
                    size: row.size ?? 46,
                    fill: row.light ? L.fg : D.fg,
                    family: row.family,
                    weight: row.weight,
                    tracking: row.tracking,
                    second: row.second,
                    secondWeight: row.secondWeight
                })
            )
            parts.push(text(row.label, { x: 900, y: y + 24, size: 11, fill: row.light ? L.mute : D.mute, anchor: "end" }))

            y += (row.h ?? 108) + 12
        })

        y += 26
    }

    strip("TRACKING, MONO CUT", [
        { family: MONO, weight: 700, tracking: -2, label: "Martian Mono Bold / -2" },
        { family: MONO, weight: 700, tracking: 0, label: "Martian Mono Bold / 0" },
        { family: MONO, weight: 700, tracking: 4, label: "Martian Mono Bold / +4" },
        { family: MONO, weight: 700, tracking: 10, label: "Martian Mono Bold / +10" }
    ])

    strip("WEIGHT + GROTESQUE CUT", [
        { family: MONO, weight: 800, tracking: 2, label: "Martian Mono ExtraBold / +2" },
        { family: UI, weight: 700, tracking: 0, label: "Archivo Bold / 0" },
        { family: UI, weight: 700, tracking: 6, label: "Archivo Bold / +6" },
        { family: "Space Mono", weight: 700, tracking: 2, label: "Space Mono Bold / +2" }
    ])

    strip("STACKED LOCKUP", [
        { family: MONO, weight: 700, tracking: 1, second: ".computer", secondWeight: 400, h: 190, label: "mono, stacked" },
        { family: UI, weight: 700, tracking: 2, second: ".computer", secondWeight: 500, h: 190, light: true, label: "grotesque, stacked, light" }
    ])

    return sheet(1080, y, parts.join(""))
}

//  ------------------------------------------------------------- stroke alignment

const strokeSheet = () => {
    const parts = header("STROKE ALIGNMENT", "SVG only offers a centred stroke. Outer is emulated with paint-order, inner by clipping the stroke to the glyph.")

    const word = (x, y, size, extra, fill = D.fg) =>
        `<text x="${x}" y="${y}" font-family="${MONO}" font-size="${size}" font-weight="700" fill="${fill}" ${extra}>altered</text>`

    let y = 130

    const rows = [
        { label: "no stroke", extra: "" },
        { label: "centred stroke 3", extra: `stroke="${D.fg}" stroke-width="3"` },
        { label: "outer stroke 6 (paint-order)", extra: `stroke="${D.fg}" stroke-width="6" paint-order="stroke fill"` },
        { label: "inner stroke, emulated: mute fill + fg stroke behind", fill: D.mute, extra: `stroke="${D.fg}" stroke-width="5" paint-order="stroke fill"` },
        { label: "outline only, fill none", fill: "none", extra: `stroke="${D.fg}" stroke-width="2"` }
    ]

    rows.forEach(row => {
        parts.push(`<rect x="30" y="${y}" width="1020" height="110" fill="${D.panel}"/>`)
        parts.push(word(60, y + 72, 46, row.extra, row.fill ?? D.fg))
        parts.push(text(row.label, { x: 1020, y: y + 26, size: 11, fill: D.mute, anchor: "end" }))

        y += 122
    })

    return sheet(1080, y + 20, parts.join(""))
}

//  ------------------------------------------------------------- lockups

const lockupSheet = () => {
    const parts = header("LOCKUPS", "round-two finalists set against the wordmark, both polarities, with the square period on the icon grid.")

    const picks = ["k2-frame-core", "r2-damped-cut", "r5-converge-cut", "s5-quincunx", "t2-return-cut", "y1-ramp-45"]
        .map(id => marks.find(m => m.id === id))
        .filter(Boolean)

    let y = 120

    picks.forEach((mark, i) => {
        const light = i % 2 === 1
        const tones = light ? L : D
        const h = 150

        parts.push(`<rect x="30" y="${y}" width="1020" height="${h}" fill="${tones.bg}"/>`)
        if (light) parts.push(`<rect x="30" y="${y}" width="1020" height="${h}" fill="none" stroke="${D.line}"/>`)

        parts.push(renderMark(mark, { x: 70, y: y + 45, size: 60, scheme: light ? "light" : "dark" }))
        parts.push(
            `<text x="160" y="${y + 96}" font-family="${MONO}" font-size="42" font-weight="700" fill="${tones.fg}" letter-spacing="1">altered</text>`
        )
        parts.push(text(mark.label, { x: 1020, y: y + 30, size: 11, fill: tones.mute, anchor: "end" }))

        y += h + 14
    })

    return sheet(1080, y + 20, parts.join(""))
}

mkdirSync(SHEETS2, { recursive: true })
mkdirSync(SVGS2, { recursive: true })

console.log("round two sheets:")

FAMILIES.forEach((f, i) => write(`${String(i + 1).padStart(2, "0")}-${f.key}`, familySheet(f)))

write("10-avatars-dark", avatarSheet("dark", "AVATAR TEST / DARK", "circle crop on true black. background #101010, mark #FFFFFF."))
write("11-avatars-light", avatarSheet("light", "AVATAR TEST / LIGHT", "background #FFFFFF, mark #404040. the polarity that cuts through a dark feed."))
write("12-tightening", tighteningSheet())
write("13-type", typeSheet())
write("14-stroke", strokeSheet())
write("15-lockups", lockupSheet())

for (const mark of marks) {
    writeFileSync(`${SVGS2}/${mark.id}.svg`, standalone(mark, { size: 512, scheme: "dark" }))
}

console.log(`svg2: ${marks.length} marks`)
