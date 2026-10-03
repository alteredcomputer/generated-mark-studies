//  Construction-drawing primitives: dimension lines, anchor points, X-ray outlines.
//
//  Every stroke is laid twice, a dark halo under a coloured line, so annotations
//  stay readable whether they cross white ink or the dark ground.

import { esc, textWidth } from "./sheetkit.mjs"

const INK = {
    grid: "#FF5C3B",
    gridOnInk: "#C4361B",
    curve: "#14B8FF",
    xray: "#FF3DCB",
    dim: "#F5B700",
    halo: "#101010"
}

const UI = "JetBrains Mono"

const f2 = n => Number(n.toFixed(2))

const seg = (a, b, { color, width = 1.5, dash = null, halo = true }) => {
    const d = `M${f2(a[0])} ${f2(a[1])}L${f2(b[0])} ${f2(b[1])}`
    const dashAttr = dash ? ` stroke-dasharray="${dash}"` : ""
    const under = halo ? `<path d="${d}" stroke="${INK.halo}" stroke-opacity="0.8" stroke-width="${width + 2.5}" fill="none"${dashAttr}/>` : ""

    return `${under}<path d="${d}" stroke="${color}" stroke-width="${width}" fill="none" stroke-linecap="butt"${dashAttr}/>`
}

/** A label on a dark pill, so it reads over anything. `at` is the pill's centre. */
const tag = (content, at, { color = INK.dim, size = 12, anchor = "middle" } = {}) => {
    const lines = [].concat(content)
    const w = Math.max(...lines.map(l => textWidth(l, size))) + 10
    const h = lines.length * (size + 3) + 6
    const x = anchor === "start" ? at[0] : anchor === "end" ? at[0] - w : at[0] - w / 2
    const y = at[1] - h / 2

    return [
        `<rect x="${f2(x)}" y="${f2(y)}" width="${f2(w)}" height="${f2(h)}" rx="3" fill="${INK.halo}" fill-opacity="0.92" stroke="${color}" stroke-width="1"/>`,
        ...lines.map(
            (l, i) =>
                `<text x="${f2(x + w / 2)}" y="${f2(y + 3 + (i + 1) * (size + 3) - 3)}" font-family="${UI}" font-size="${size}" fill="${color}" text-anchor="middle">${esc(l)}</text>`
        )
    ].join("")
}

const sub = (a, b) => [a[0] - b[0], a[1] - b[1]]
const add = (a, b) => [a[0] + b[0], a[1] + b[1]]
const mul = (a, k) => [a[0] * k, a[1] * k]
const unit = a => mul(a, 1 / Math.hypot(a[0], a[1]))

/**
 * A dimension line between two points: extension lines, architect's ticks, label.
 *
 * @remarks
 * `off` pushes the measuring line off the geometry along the left-hand normal of
 * a to b. `labelOff` moves the label further along that normal; zero sits it on
 * the line.
 */
const dim = (a, b, label, { off = 0, color = INK.dim, labelOff = 0, size = 12, labelAt = 0.5 } = {}) => {
    const dir = unit(sub(b, a))
    const n = [dir[1], -dir[0]]
    const pa = add(a, mul(n, off))
    const pb = add(b, mul(n, off))
    const ext = mul(n, Math.sign(off || 1) * 5)
    const tick = mul(unit(add(dir, n)), 5)
    const parts = []

    if (off) {
        parts.push(seg(a, add(pa, ext), { color, width: 0.8 }))
        parts.push(seg(b, add(pb, ext), { color, width: 0.8 }))
    }

    parts.push(seg(pa, pb, { color, width: 1.2 }))
    parts.push(seg(sub(pa, tick), add(pa, tick), { color, width: 1.6 }))
    parts.push(seg(sub(pb, tick), add(pb, tick), { color, width: 1.6 }))

    if (label !== null) {
        const mid = add(pa, mul(sub(pb, pa), labelAt))

        parts.push(tag(label, add(mid, mul(n, labelOff)), { color, size }))
    }

    return parts.join("")
}

const point = (p, { color = INK.curve, r = 4.5 } = {}) =>
    `<circle cx="${f2(p[0])}" cy="${f2(p[1])}" r="${r + 1.5}" fill="${INK.halo}"/><circle cx="${f2(p[0])}" cy="${f2(p[1])}" r="${r}" fill="${color}"/>`

const outline = (pts, { color = INK.xray, width = 1.6, dash = "6 4", close = true } = {}) =>
    pts.map((p, i) => (i === pts.length - 1 && !close ? "" : seg(p, pts[(i + 1) % pts.length], { color, width, dash }))).join("")

/** Unit grid in three weights: every unit, every sixteenth of the field, every eighth. */
const grid = ({ ox, oy, size, field, color = INK.grid, alpha = 1 }) => {
    const u = size / field
    const out = []

    for (let i = 0; i <= field; i++) {
        const eighth = (i * 8) % field === 0
        const sixteenth = (i * 16) % field === 0
        const w = eighth ? 1.4 : sixteenth ? 0.9 : 0.5
        const op = (eighth ? 0.75 : sixteenth ? 0.45 : 0.18) * alpha

        out.push(`<rect x="${f2(ox + i * u - w / 2)}" y="${oy}" width="${w}" height="${size}" fill="${color}" fill-opacity="${op}"/>`)
        out.push(`<rect x="${ox}" y="${f2(oy + i * u - w / 2)}" width="${size}" height="${w}" fill="${color}" fill-opacity="${op}"/>`)
    }

    return out.join("")
}

export { INK, seg, tag, dim, point, outline, grid }
