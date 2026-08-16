import { writeFileSync, mkdirSync } from "node:fs"
import { Resvg } from "@resvg/resvg-js"

import { marks, FAMILIES, converge } from "./marks-r3.mjs"
import { SCHEMES, renderMark, standalone } from "./render.mjs"

import { FONTS, sheets, svgs } from "./paths.mjs"

const SHEETS3 = sheets(3)
const SVGS3 = svgs(3)

const D = SCHEMES.dark
const L = SCHEMES.light

const UI = "JetBrains Mono"

const FONT = { fontDirs: [FONTS, "/usr/share/fonts"], defaultFontFamily: UI, loadSystemFonts: true }

const rasterize = (svg, width) => {
    const out = new Resvg(svg, { fitTo: { mode: "width", value: width }, font: FONT }).render()

    return { png: out.asPng(), pixels: out.pixels, width: out.width, height: out.height }
}

const write = (name, svg, width = 1080) => {
    const out = rasterize(svg, width)

    writeFileSync(`${SHEETS3}/${name}.png`, out.png)

    console.log(`  ${name}.png  ${out.width}x${out.height}`)
}

const text = (content, { x, y, size = 15, fill = D.mute, weight = 400, anchor = "start", family = UI, spacing = 0 }) =>
    `<text x="${x}" y="${y}" font-family="${family}" font-size="${size}" font-weight="${weight}" fill="${fill}" text-anchor="${anchor}" letter-spacing="${spacing}">${content}</text>`

const sheet = (width, height, body, bg = D.bg) =>
    `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}"><rect x="0" y="0" width="${width}" height="${height}" fill="${bg}"/>${body}</svg>`

const header = (title, subtitle) => [
    text(title, { x: 30, y: 50, size: 25, fill: D.fg, weight: 700, spacing: 1.5 }),
    text(subtitle, { x: 30, y: 80, size: 13.5, fill: D.mute })
]

const pixelView = (mark, px, x, y, scale) => {
    const { pixels } = rasterize(standalone(mark, { size: px, scheme: "dark" }), Math.round(px * (mark.w / mark.h)))
    const w = Math.round(px * (mark.w / mark.h))
    const cells = []

    for (let row = 0; row < px; row++) {
        for (let col = 0; col < w; col++) {
            const i = (row * w + col) * 4
            const alpha = pixels[i + 3] / 255

            if (alpha > 0.02)
                cells.push(
                    `<rect x="${(x + col * scale).toFixed(2)}" y="${(y + row * scale).toFixed(2)}" width="${scale}" height="${scale}" fill="${D.fg}" fill-opacity="${alpha.toFixed(3)}"/>`
                )
        }
    }

    return cells.join("")
}

const markCell = (mark, x, y) => {
    const t = 190
    const ar = mark.w / mark.h
    const mw = t * 0.68 * (ar > 1 ? 1 : ar)
    const parts = []

    const place = (tx, scheme, bg) => {
        parts.push(`<rect x="${tx}" y="${y}" width="${t}" height="${t}" rx="0" fill="${bg}"/>`)
        parts.push(`<rect x="${tx}" y="${y}" width="${t}" height="${t}" fill="none" stroke="${D.line}" stroke-width="1"/>`)

        const size = t * 0.66
        const drawW = size * ar

        parts.push(renderMark(mark, { x: tx + (t - drawW) / 2, y: y + (t - size) / 2, size, scheme }))
    }

    place(x, "dark", D.bg)
    place(x + t + 14, "light", L.bg)

    const px = x + 2 * t + 28

    parts.push(`<rect x="${px}" y="${y}" width="${88 * (ar > 1 ? ar : 1)}" height="88" fill="${D.panel}"/>`)
    parts.push(pixelView(mark, 16, px, y, 5.5))
    parts.push(text("16px raster", { x: px, y: y + 106, size: 11, fill: D.dim }))

    parts.push(renderMark(mark, { x: px, y: y + 126, size: 16, scheme: "dark" }))
    parts.push(renderMark(mark, { x: px + 26 * (ar > 1 ? ar : 1), y: y + 126, size: 24, scheme: "dark" }))
    parts.push(renderMark(mark, { x: px + 62 * (ar > 1 ? ar : 1), y: y + 126, size: 32, scheme: "dark" }))
    parts.push(text("actual size", { x: px, y: y + 176, size: 11, fill: D.dim }))

    parts.push(text(mark.label, { x, y: y + t + 30, size: 15, fill: D.fg, weight: 700 }))
    parts.push(text(mark.means, { x, y: y + t + 52, size: 12.5, fill: D.mute }))

    return parts.join("")
}

const familySheet = (family, subset = null, titleSuffix = "") => {
    const set = subset ?? marks.filter(m => m.family === family.key)
    const cols = 2
    const cellW = 520
    const cellH = 290
    const top = 132
    const rows = Math.ceil(set.length / cols)

    const parts = header(`${family.title.toUpperCase()}${titleSuffix}`, family.blurb.length > 118 ? `${family.blurb.slice(0, 116)}...` : family.blurb)

    set.forEach((m, i) => parts.push(markCell(m, 30 + (i % cols) * cellW, top + Math.floor(i / cols) * cellH)))

    return sheet(1080, top + rows * cellH + 16, parts.join(""))
}

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
        const clip = `av3${scheme}${i}`
        const ar = mark.w / mark.h
        const size = d * 0.6
        const drawW = size * ar

        parts.push(`<clipPath id="${clip}"><circle cx="${cx + d / 2}" cy="${cy + d / 2}" r="${d / 2}"/></clipPath>`)
        parts.push(`<g clip-path="url(#${clip})"><rect x="${cx}" y="${cy}" width="${d}" height="${d}" fill="${tones.bg}"/>`)
        parts.push(renderMark(mark, { x: cx + (d - drawW) / 2, y: cy + (d - size) / 2, size, scheme }))
        parts.push(`</g>`)
        parts.push(text(mark.id.split("-")[0].toUpperCase(), { x: cx + d / 2, y: cy + d + 24, size: 12, fill: D.mute, anchor: "middle" }))
    })

    return sheet(1080, top + rows * blockH + 26, parts.join(""), "#000000")
}

//  Easing comparison: the taper curve alone, so the shoulder can be judged directly.

const easingSheet = () => {
    const eases = ["linear", "quadOut", "cubicOut", "quartOut", "expoOut", "circOut"]
    const parts = header("EASING", "the same funnel under six curves. the shoulder is the whole personality of the mark.")

    eases.forEach((ease, i) => {
        const x = 30 + (i % 3) * 350
        const y = 122 + Math.floor(i / 3) * 372
        const m = { id: ease, w: 48, h: 48, ops: converge({ ease, star: "square" }) }

        parts.push(`<rect x="${x}" y="${y}" width="320" height="320" fill="${D.bg}" stroke="${D.line}"/>`)
        parts.push(renderMark(m, { x: x + 20, y: y + 20, size: 280, scheme: "dark" }))
        parts.push(text(ease, { x, y: y + 348, size: 15, fill: D.fg, weight: 700 }))
    })

    return sheet(1080, 122 + 2 * 372 + 20, parts.join(""))
}

//  Wordmark: JetBrains Mono, since round two's stand-ins all lost to it.

const lockupSheet = () => {
    const parts = header("LOCKUPS", "JetBrains Mono, your palette, and the period-placement test you raised.")

    const picks = ["c1-expo-square", "c4-expo-asterisk", "v1-crt-right-square", "u2-tunnel-rays"].map(id => marks.find(m => m.id === id))

    let y = 116

    const word = (x, baseline, size, fill, content, weight = 700, tracking = 0) =>
        `<text x="${x}" y="${baseline}" font-family="${UI}" font-size="${size}" font-weight="${weight}" fill="${fill}" letter-spacing="${tracking}">${content}</text>`

    const dot = (x, baseline, size, fill, scale = 0.12) => {
        const s = size * scale
        const adv = size * 0.6

        return `<rect x="${(x + (adv - s) / 2).toFixed(2)}" y="${(baseline - s).toFixed(2)}" width="${s}" height="${s}" fill="${fill}"/>`
    }

    const rows = [
        { caption: "one line, square period at 0.12em", light: false, h: 150, draw: (bx, by, fill) => word(bx, by, 46, fill, "altered") + dot(bx + 46 * 0.6 * 7, by, 46, fill) + word(bx + 46 * 0.6 * 8, by, 46, fill, "computer", 400) },
        { caption: "period trailing line one: altered. over computer, both 8 characters", light: true, h: 210, draw: (bx, by, fill) => word(bx, by, 46, fill, "altered") + dot(bx + 46 * 0.6 * 7, by, 46, fill) + word(bx, by + 46 * 1.15, 46, fill, "computer", 400) },
        { caption: "period leading line two", light: false, h: 210, draw: (bx, by, fill) => word(bx, by, 46, fill, "altered") + dot(bx, by + 46 * 1.15, 46, fill) + word(bx + 46 * 0.6, by + 46 * 1.15, 46, fill, "computer", 400) }
    ]

    rows.forEach(row => {
        const tones = row.light ? L : D

        parts.push(`<rect x="30" y="${y}" width="1020" height="${row.h}" fill="${tones.bg}" stroke="${D.line}"/>`)
        parts.push(row.draw(70, y + 88, tones.fg))
        parts.push(text(row.caption, { x: 30, y: y + row.h + 24, size: 12, fill: D.mute }))

        y += row.h + 52
    })

    picks.forEach((mark, i) => {
        const light = i % 2 === 1
        const tones = light ? L : D
        const h = 160
        const ar = mark.w / mark.h

        parts.push(`<rect x="30" y="${y}" width="1020" height="${h}" fill="${tones.bg}" stroke="${D.line}"/>`)
        parts.push(renderMark(mark, { x: 70, y: y + 45, size: 70, scheme: light ? "light" : "dark" }))
        parts.push(word(70 + 70 * ar + 34, y + 104, 44, tones.fg, "altered"))
        parts.push(text(mark.label, { x: 1020, y: y + 28, size: 11, fill: tones.mute, anchor: "end" }))

        y += h + 14
    })

    return sheet(1080, y + 20, parts.join(""))
}

mkdirSync(SHEETS3, { recursive: true })
mkdirSync(SVGS3, { recursive: true })

console.log("round three sheets:")

const cFamily = FAMILIES.find(f => f.key === "c")
const cMarks = marks.filter(m => m.family === "c")

write("01-c-easing", familySheet(cFamily, cMarks.slice(0, 8), " / EASINGS"))
write("02-c-variants", familySheet(cFamily, cMarks.slice(8, 16), " / VARIANTS"))
write("03-c-bold", familySheet(cFamily, cMarks.slice(16), " / BOLD"))

FAMILIES.filter(f => f.key !== "c").forEach((f, i) => write(`${String(i + 4).padStart(2, "0")}-${f.key}`, familySheet(f)))

write("07-easing", easingSheet())
write("08-avatars-dark", avatarSheet("dark", "AVATAR TEST / DARK", "circle crop on true black. #FFFFFF on #101010."))
write("09-avatars-light", avatarSheet("light", "AVATAR TEST / LIGHT", "#404040 on #FFFFFF."))
write("10-lockups", lockupSheet())

for (const mark of marks) writeFileSync(`${SVGS3}/${mark.id}.svg`, standalone(mark, { size: 512, scheme: "dark" }))

console.log(`svg3: ${marks.length} marks`)
