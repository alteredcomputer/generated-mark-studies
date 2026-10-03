//  Size ladders: each mark large in both polarities, then at its real small sizes,
//  then the 16, 24 and 32px rasters magnified so every pixel can be judged.

import { renderMark } from "./render.mjs"
import { D, L, text, header, sheet, bounds, pixelView } from "./sheetkit.mjs"

const ROW = 300

const ladderRow = (mark, y, box) => {
    const parts = []
    const T = 200
    const ty = y + 44

    parts.push(text(mark.label, { x: 30, y: y + 14, size: 15, fill: D.fg, weight: 700 }))
    parts.push(text(mark.means, { x: 30, y: y + 26 + 4, size: 12, fill: D.mute }))

    const place = (x, scheme) => {
        const tones = scheme === "dark" ? D : L
        const size = T * 0.72

        parts.push(`<rect x="${x}" y="${ty}" width="${T}" height="${T}" fill="${tones.bg}" stroke="${D.line}"/>`)
        parts.push(renderMark(mark, { x: x + (T - size) / 2, y: ty + (T - size) / 2, size, scheme }))
        box.add(`${mark.id} ${scheme}`, x, ty, T, T)
    }

    place(30, "dark")
    place(242, "light")

    //  Real sizes, both polarities, bottoms aligned.
    const sx = 454
    const sw = 168

    for (const [i, scheme] of ["dark", "light"].entries()) {
        const tones = scheme === "dark" ? D : L
        const py = ty + i * 100

        parts.push(`<rect x="${sx}" y="${py}" width="${sw}" height="100" fill="${tones.bg}" stroke="${D.line}"/>`)

        let x = sx + 14

        for (const s of [64, 32, 16]) {
            parts.push(renderMark(mark, { x, y: py + 18 + 64 - s, size: s, scheme }))
            x += s + 18
        }
    }

    parts.push(text("64 / 32 / 16, real size", { x: sx, y: ty + T + 20, size: 11, fill: D.dim }))
    box.add(`${mark.id} sizes`, sx, ty, sw, T)

    const views = [
        [16, 8, 634],
        [24, 5, 774],
        [32, 4, 906]
    ]

    for (const [px, k, x] of views) {
        parts.push(pixelView(mark, px, x, ty, k))
        parts.push(text(`${px}px x${k}`, { x, y: ty + px * k + 20, size: 11, fill: D.dim }))
        box.add(`${mark.id} ${px}px`, x, ty, px * k, px * k)
    }

    return parts.join("")
}

const ladderSheet = (title, subtitle, marks) => {
    const box = bounds()
    const top = 110 + 20 * ([].concat(subtitle).length - 1)
    const parts = [header(title, subtitle)]

    marks.forEach((m, i) => parts.push(ladderRow(m, top + i * ROW, box)))

    const h = top + marks.length * ROW + 10

    box.check(title, h)

    return sheet(h, parts.join(""))
}

/**
 * Avatar crops at three tile sizes.
 *
 * @remarks
 * A square tile's corners reach the crop circle when its side is 1/sqrt 2 of the
 * diameter, 70.7%. Round four used 70%, which is why its corners nearly touched.
 */
const avatarSheet = (marks, fractions) => {
    const box = bounds()
    const d = 150
    const step = 170
    const top = 150
    const block = 230
    const parts = [
        header("AVATARS / TILE SIZE", [
            `circle crop on true black. the tile's corners touch the circle at 1/sqrt 2 = 70.7% of the diameter.`,
            `each row: ${fractions.map(f => `${Math.round(f * 1000) / 10}%`).join(", ")} of the diameter, dark then light.`
        ])
    ]

    marks.forEach((mark, r) => {
        parts.push(text(mark.label, { x: 30, y: top + r * block - 12, size: 13, fill: D.fg, weight: 700 }))

        const cells = [...fractions.map(f => [f, "dark"]), ...fractions.map(f => [f, "light"])]

        cells.forEach(([f, scheme], i) => {
            const tones = scheme === "dark" ? D : L
            const x = 30 + i * step
            const y = top + r * block
            const id = `av${r}${i}`
            const s = d * f

            parts.push(`<clipPath id="${id}"><circle cx="${x + d / 2}" cy="${y + d / 2}" r="${d / 2}"/></clipPath>`)
            parts.push(`<g clip-path="url(#${id})"><rect x="${x}" y="${y}" width="${d}" height="${d}" fill="${tones.bg}"/>${renderMark(mark, { x: x + (d - s) / 2, y: y + (d - s) / 2, size: s, scheme })}</g>`)
            parts.push(text(`${Math.round(f * 1000) / 10}%`, { x: x + d / 2, y: y + d + 20, size: 11, fill: D.mute, anchor: "middle" }))
            box.add(`avatar ${r} ${i}`, x, y, d, d)
        })
    })

    const h = top + marks.length * block

    box.check("avatars", h)

    return sheet(h, parts.join(""), "#000000")
}

export { ladderSheet, avatarSheet }
