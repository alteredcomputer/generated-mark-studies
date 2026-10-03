//  Shared sheet plumbing from round six on. Rounds one to five keep their own copies
//  so they keep rebuilding byte-for-byte.

import { writeFileSync } from "node:fs"
import { Resvg } from "@resvg/resvg-js"

import { SCHEMES, standalone } from "./render.mjs"
import { FONT } from "./fontguard.mjs"

const D = SCHEMES.dark
const L = SCHEMES.light

const UI = "JetBrains Mono"

const W = 1080

//  JetBrains Mono advances 0.6 em, so label widths are known before rendering.
const textWidth = (content, size) => String(content).length * size * 0.6

const esc = s => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")

const text = (content, { x, y, size = 13, fill = D.mute, weight = 400, anchor = "start", spacing = 0 }) =>
    `<text x="${x}" y="${y}" font-family="${UI}" font-size="${size}" font-weight="${weight}" fill="${fill}" text-anchor="${anchor}" letter-spacing="${spacing}">${esc(content)}</text>`

const header = (title, subtitle) =>
    [
        text(title, { x: 30, y: 50, size: 24, fill: D.fg, weight: 700, spacing: 1.5 }),
        ...[].concat(subtitle).map((line, i) => text(line, { x: 30, y: 78 + i * 20, size: 13, fill: D.mute }))
    ].join("")

const sheet = (h, body, bg = D.bg) =>
    `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${h}" viewBox="0 0 ${W} ${h}"><rect width="${W}" height="${h}" fill="${bg}"/>${body}</svg>`

const rasterize = (svg, width) => {
    const out = new Resvg(svg, { fitTo: { mode: "width", value: width }, font: FONT }).render()

    return { png: out.asPng(), pixels: out.pixels, width: out.width, height: out.height }
}

/**
 * Throws when anything is placed outside the sheet.
 *
 * @remarks
 * Round five shipped a sheet whose third panel ran off the right edge. Layout code
 * reports every box it places here, so an overflow fails the build instead.
 */
const bounds = () => {
    const boxes = []

    return {
        add: (label, x, y, w, h) => boxes.push({ label, x, y, w, h }),
        check: (name, h) => {
            const bad = boxes.filter(b => b.x < 0 || b.y < 0 || b.x + b.w > W + 0.5 || b.y + b.h > h + 0.5)

            if (bad.length) throw new Error(`${name}: outside the sheet: ${bad.map(b => `${b.label} [${b.x},${b.y},${b.w},${b.h}]`).join("; ")}`)
        }
    }
}

const writer = dir => (name, svg) => {
    const out = rasterize(svg, W)

    writeFileSync(`${dir}/${name}.png`, out.png)

    console.log(`  ${name}.png  ${out.width}x${out.height}`)
}

/** A raster of the mark at `px`, redrawn as magnified cells so pixel-fitting is visible. */
const pixelView = (mark, px, x, y, scale, scheme = "dark") => {
    const tones = SCHEMES[scheme]
    const { pixels } = rasterize(standalone(mark, { size: px, scheme }), px)
    const cells = [`<rect x="${x}" y="${y}" width="${px * scale}" height="${px * scale}" fill="${tones.bg}"/>`]

    for (let row = 0; row < px; row++)
        for (let col = 0; col < px; col++) {
            const a = pixels[(row * px + col) * 4 + 3] / 255

            if (a > 0.02)
                cells.push(`<rect x="${(x + col * scale).toFixed(2)}" y="${(y + row * scale).toFixed(2)}" width="${scale}" height="${scale}" fill="${tones.fg}" fill-opacity="${a.toFixed(3)}"/>`)
        }

    const lines = []

    for (let i = 0; i <= px; i++) {
        lines.push(`<rect x="${(x + i * scale - 0.25).toFixed(2)}" y="${y}" width="0.5" height="${px * scale}" fill="#808080" fill-opacity="0.35"/>`)
        lines.push(`<rect x="${x}" y="${(y + i * scale - 0.25).toFixed(2)}" width="${px * scale}" height="0.5" fill="#808080" fill-opacity="0.35"/>`)
    }

    return cells.join("") + lines.join("")
}

export { D, L, UI, W, esc, text, textWidth, header, sheet, rasterize, bounds, writer, pixelView }
