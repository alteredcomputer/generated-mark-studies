import { writeFileSync } from "node:fs"
import { Resvg } from "@resvg/resvg-js"

import { marks } from "./marks-r4.mjs"
import { SCHEMES, renderMark } from "./render.mjs"
import { FONT, assertFaces } from "./fontguard.mjs"

import { sheets } from "./paths.mjs"

const SHEETS4 = sheets(4)

const D = SCHEMES.dark
const L = SCHEMES.light

const UI = "JetBrains Mono"

const write = (name, svg, width = 1080) => {
    const out = new Resvg(svg, { fitTo: { mode: "width", value: width }, font: FONT }).render()

    writeFileSync(`${SHEETS4}/${name}.png`, out.asPng())

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

const word = (content, { x, y, size, fill, family, weight, spacing = 0 }) =>
    `<text x="${x}" y="${y}" font-family="${family}" font-size="${size}" font-weight="${weight}" fill="${fill}" letter-spacing="${spacing}">${content}</text>`

//  Cap height is 0.68 of the em in both Berkeley Mono and every Px Grotesk cut,
//  so a shared font-size is already an optically fair comparison.

const CANDIDATES = [
    { family: "Px Grotesk Mono Trial", weight: 700, label: "Px Grotesk Mono Bold -- your original wordmark" },
    { family: "Px Grotesk Mono", weight: 400, label: "Px Grotesk Mono Regular (full licence)" },
    { family: "Px Grotesk Mono Trial", weight: 300, label: "Px Grotesk Mono Light" },
    { family: "Berkeley Mono", weight: 700, label: "Berkeley Mono Bold" },
    { family: "Berkeley Mono", weight: 600, label: "Berkeley Mono SemiBold" },
    { family: "Berkeley Mono", weight: 900, label: "Berkeley Mono Black" },
    { family: "Px Grotesk", weight: 700, label: "Px Grotesk Bold (proportional, full licence)" },
    { family: "Px Grotesk Trial", weight: 900, label: "Px Grotesk Black" },
    { family: "Px Grotesk Screen", weight: 800, label: "Px Grotesk Screen" },
    { family: "JetBrains Mono", weight: 700, label: "JetBrains Mono Bold -- the placeholder" }
]

const PX_FAMILY = [
    { family: "Px Grotesk Mono Trial", weight: 300, label: "Mono Light 300" },
    { family: "Px Grotesk Mono Trial", weight: 400, label: "Mono Regular 400" },
    { family: "Px Grotesk Mono Trial", weight: 700, label: "Mono Bold 700" },
    { family: "Px Grotesk Trial", weight: 300, label: "Light 300" },
    { family: "Px Grotesk Trial", weight: 400, label: "Regular 400" },
    { family: "Px Grotesk Trial", weight: 700, label: "Bold 700" },
    { family: "Px Grotesk Trial", weight: 900, label: "Black 900" },
    { family: "Px Grotesk Screen", weight: 800, label: "Screen 800" }
]

//  Every row here is labelled with the face it claims to be, so a fallback would
//  be a lie rather than a cosmetic glitch. The whole cast is checked up front.
assertFaces([...CANDIDATES, ...PX_FAMILY].map(c => [c.family, c.weight]))

const showdown = () => {
    const parts = header("TYPEFACE SHOWDOWN", "one word, matched cap height (0.68 em across all of them), alternating polarity.")

    let y = 100

    CANDIDATES.forEach((c, i) => {
        const light = i % 2 === 1
        const tones = light ? L : D
        const h = 108

        parts.push(`<rect x="30" y="${y}" width="1020" height="${h}" fill="${tones.bg}" stroke="${D.line}"/>`)
        parts.push(word("altered", { x: 66, y: y + 72, size: 52, fill: tones.fg, family: c.family, weight: c.weight }))
        parts.push(text(c.label, { x: 1020, y: y + 28, size: 11, fill: tones.mute, anchor: "end" }))

        y += h + 10
    })

    return sheet(1080, y + 20, parts.join(""))
}

//  Direct head to head at large size, so the letterform differences are unmissable.

const headToHead = () => {
    const parts = header("HEAD TO HEAD", "Px Grotesk Mono Bold against Berkeley Mono Bold, same size, same tracking. note the a, e, r and t.")

    let y = 100

    const pair = [
        { family: "Px Grotesk Mono Trial", weight: 700, label: "Px Grotesk Mono Bold" },
        { family: "Berkeley Mono", weight: 700, label: "Berkeley Mono Bold" }
    ]

    pair.forEach((c, i) => {
        const light = i % 2 === 1
        const tones = light ? L : D

        parts.push(`<rect x="30" y="${y}" width="1020" height="150" fill="${tones.bg}" stroke="${D.line}"/>`)
        parts.push(word("altered", { x: 60, y: y + 105, size: 96, fill: tones.fg, family: c.family, weight: c.weight }))
        parts.push(text(c.label, { x: 1020, y: y + 30, size: 11, fill: tones.mute, anchor: "end" }))

        y += 162
    })

    //  The stacked lockup you chose, in both.
    pair.forEach((c, i) => {
        const light = i % 2 === 1
        const tones = light ? L : D

        parts.push(`<rect x="30" y="${y}" width="1020" height="210" fill="${tones.bg}" stroke="${D.line}"/>`)
        parts.push(word("altered", { x: 66, y: y + 82, size: 54, fill: tones.fg, family: c.family, weight: c.weight }))
        parts.push(word(".computer", { x: 66, y: y + 82 + 54 * 1.16, size: 54, fill: tones.fg, family: c.family, weight: c.weight }))
        parts.push(text(`${c.label} / stacked`, { x: 1020, y: y + 30, size: 11, fill: tones.mute, anchor: "end" }))

        y += 222
    })

    //  Tracking sweep on the leader.
    ;[-2, 0, 3, 7].forEach(tr => {
        parts.push(`<rect x="30" y="${y}" width="1020" height="96" fill="${D.panel}" stroke="${D.line}"/>`)
        parts.push(word("altered", { x: 66, y: y + 64, size: 46, fill: D.fg, family: "Px Grotesk Mono Trial", weight: 700, spacing: tr }))
        parts.push(text(`Px Grotesk Mono Bold / tracking ${tr > 0 ? `+${tr}` : tr}`, { x: 1020, y: y + 26, size: 11, fill: D.mute, anchor: "end" }))

        y += 106
    })

    return sheet(1080, y + 20, parts.join(""))
}

const pxWeights = () => {
    const parts = header("PX GROTESK / FAMILY", "the mono cut and the proportional cut across every weight in the repo.")

    let y = 100

    PX_FAMILY.forEach((r, i) => {
        const light = i % 2 === 1
        const tones = light ? L : D

        parts.push(`<rect x="30" y="${y}" width="1020" height="100" fill="${tones.bg}" stroke="${D.line}"/>`)
        parts.push(word("altered.computer", { x: 60, y: y + 66, size: 44, fill: tones.fg, family: r.family, weight: r.weight }))
        parts.push(text(r.label, { x: 1020, y: y + 26, size: 11, fill: tones.mute, anchor: "end" }))

        y += 110
    })

    return sheet(1080, y + 20, parts.join(""))
}

const finalLockups = () => {
    const parts = header("LOCKUPS / PX GROTESK MONO", "round four finalists against your actual wordmark typeface.")

    const picks = ["s-kortex-tight", "s-flare-kortex", "s-asterisk-h", "e-expoIn", "f-8", "o1-scope-3"]
        .map(id => marks.find(m => m.id === id))
        .filter(Boolean)

    let y = 100

    picks.forEach((mark, i) => {
        const light = i % 2 === 1
        const tones = light ? L : D
        const h = 150
        const ar = mark.w / mark.h
        const size = 72

        parts.push(`<rect x="30" y="${y}" width="1020" height="${h}" fill="${tones.bg}" stroke="${D.line}"/>`)
        parts.push(renderMark(mark, { x: 66, y: y + (h - size) / 2, size, scheme: light ? "light" : "dark" }))
        parts.push(word("altered", { x: 66 + size * ar + 38, y: y + 96, size: 46, fill: tones.fg, family: "Px Grotesk Mono Trial", weight: 700 }))
        parts.push(text(mark.label, { x: 1020, y: y + 28, size: 11, fill: tones.mute, anchor: "end" }))

        y += h + 12
    })

    return sheet(1080, y + 20, parts.join(""))
}

console.log("type sheets:")
write("15-type-showdown", showdown())
write("16-type-headtohead", headToHead())
write("17-type-px-family", pxWeights())
write("18-type-lockups", finalLockups())
