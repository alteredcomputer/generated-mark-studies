//  Round six type sheets. Every word is outlined from the font file and placed by
//  its measured ink, so nothing here can silently fall back to another face.

import { D, L, text, header, sheet, bounds } from "./sheetkit.mjs"
import { INK, seg, tag, dim } from "./annotate.mjs"
import { setLine, metrics } from "./type.mjs"
import { lockup } from "./lockup.mjs"

const n2 = v => String(Number(v.toFixed(2)))

//  Round four's favourite, measured: Berkeley Mono Bold at 42px, a 68px X1, 36px from
//  the icon to the first cell, baseline 54px below the icon's top.
const R4 = { size: 42, icon: 68, gapToCell: 36, baseline: 54 }

const R4_ICON_EM = R4.icon / R4.size

//  The same gap measured to the ink: 36px plus the a's left side bearing.
const r4InkGapEm = () => {
    const a = setLine("bm700", "a", { size: 1 })

    return R4.gapToCell / R4.size + a.ink.x1
}

/** Font size that gives `face` the same cap height as Berkeley Mono at `size`. */
const capMatched = (face, size) => (size * metrics("bm700").cap) / metrics(face).cap

const rowLockup = (parts, box, { y, h, scheme, label, x = 70, ...spec }) => {
    const tones = scheme === "light" ? L : D
    const lk = lockup({ scheme, ...spec })
    const oy = y + (h - lk.height) / 2

    parts.push(`<rect x="30" y="${y}" width="1020" height="${h}" fill="${tones.bg}" stroke="${D.line}"/>`)
    parts.push(lk.body(tones.fg, x, oy))
    parts.push(text(label, { x: 1036, y: y + 22, size: 11, fill: tones.mute, anchor: "end" }))
    box.add(label, x, oy, lk.width, lk.height)

    return { lk, oy }
}

//  --------------------------------------------------------------- mechanics

const mechanicsSheet = x1 => {
    const parts = []
    const box = bounds()
    const size = 96
    const bm = metrics("bm700")

    parts.push(
        header("LOCKUP MECHANICS", [
            "the em is the font size. every letter in a mono gets the same slot, the cell. everything else is a fraction of the em.",
            "Berkeley Mono Bold at 96px, so 1 em = 96px here."
        ])
    )

    //  Panel 1: one em, the vertical proportions, and the cells.
    const y1 = 150
    const base = y1 + 140
    const x0 = 200
    const word = setLine("bm700", "altered", { size, x: x0, baseline: base })

    parts.push(`<rect x="30" y="${y1}" width="1020" height="200" fill="${D.panel}"/>`)

    word.cells.forEach((c, i) => parts.push(`<rect x="${n2(c.x)}" y="${base - size * 0.8}" width="${n2(c.w)}" height="${size}" fill="#FFFFFF" fill-opacity="${i % 2 ? 0.07 : 0.03}"/>`))

    parts.push(`<path d="${word.d}" fill="${D.fg}"/>`)

    const lines = [
        [0, "baseline", D.mute],
        [bm.xHeight, `x-height ${n2(bm.xHeight)}`, INK.curve],
        [bm.cap, `cap ${n2(bm.cap)}`, INK.dim],
        [(base - word.ink.y1) / size, `tallest letter ${n2((base - word.ink.y1) / size)}`, INK.xray]
    ]

    lines.forEach(([v, label, color], i) => {
        const y = base - v * size

        parts.push(seg([x0 - 10, y], [word.cells.at(-1).x + word.cells.at(-1).w + 14, y], { color, width: 1, dash: i ? "4 3" : null, halo: false }))
        parts.push(text(label, { x: word.cells.at(-1).x + word.cells.at(-1).w + 22, y: y + 4 - (i === 3 ? 6 : 0) + (i === 2 ? 6 : 0), size: 11, fill: color }))
    })

    parts.push(dim([x0 - 30, base], [x0 - 30, base - size], null, { off: 0 }))
    parts.push(tag(["1 em", "= 96px", "= font size"], [x0 - 98, base - size / 2], { size: 11 }))

    parts.push(dim([word.cells[0].x, base + 24], [word.cells[0].x + word.cells[0].w, base + 24], `1 cell = ${n2(bm.cell)} em`, { off: 0, labelOff: -14 }))
    box.add("panel 1", 30, y1, 1020, 200)

    //  Panel 2: tracking stretches the line, not the letters.
    const y2 = y1 + 250
    const base2 = y2 + 110
    const tracked = setLine("bm700", "altered", { size, x: x0, baseline: base2, tracking: 0.1 })

    parts.push(text("tracking +0.1 em: 9.6px added after every cell. letters, em, icon and gap stay the same size; only the word gets wider.", { x: 30, y: y2 - 14, size: 12, fill: D.mute }))
    parts.push(`<rect x="30" y="${y2}" width="1020" height="150" fill="${D.panel}"/>`)
    tracked.cells.forEach((c, i) => parts.push(`<rect x="${n2(c.x)}" y="${base2 - size * 0.8}" width="${n2(c.w)}" height="${size}" fill="#FFFFFF" fill-opacity="${i % 2 ? 0.07 : 0.03}"/>`))
    parts.push(`<path d="${tracked.d}" fill="${D.fg}"/>`)
    parts.push(tag(`${n2(word.advance)}px wide at 0, ${n2(tracked.advance)}px at +0.1 em`, [x0 + tracked.advance + 20, base2 - size * 0.3], { size: 11, anchor: "start" }))
    box.add("panel 2", 30, y2, 1020, 150)

    //  Panel 3: the lockup's three numbers.
    const y3 = y2 + 200
    const lk = lockup({ mark: x1, face: "bm700", size: 64, iconEm: R4_ICON_EM, gapEm: r4InkGapEm(), scheme: "dark" })
    const h3 = 210
    const ox = 110
    const oy = y3 + (h3 - lk.height) / 2
    const iconTop = oy - lk.top
    const inkLeft = ox + lk.line.ink.x1
    const cellLeft = ox + lk.line.cells[0].x

    parts.push(text("the three numbers of a lockup, shown on your round four favourite. gap is measured to the a's ink, not its cell.", { x: 30, y: y3 - 14, size: 12, fill: D.mute }))
    parts.push(`<rect x="30" y="${y3}" width="1020" height="${h3}" fill="${D.panel}"/>`)
    parts.push(lk.body(D.fg, ox, oy))

    parts.push(dim([ox - 20, iconTop], [ox - 20, iconTop + lk.icon], null, { off: 0 }))
    parts.push(tag(["icon", `${n2(R4_ICON_EM)} em`], [ox - 52, iconTop + lk.icon / 2], { size: 11 }))
    parts.push(dim([ox + lk.iconW, iconTop + lk.icon + 16], [inkLeft, iconTop + lk.icon + 16], null, { off: 0 }))
    parts.push(tag(`gap ${n2(lk.gap / 64)} em = ${n2(lk.gap / 64 / bm.cell)} cells`, [ox + lk.iconW + lk.gap / 2 + 40, iconTop + lk.icon + 38], { size: 11 }))
    parts.push(seg([cellLeft, iconTop - 6], [cellLeft, iconTop + lk.icon + 6], { color: D.mute, width: 1, dash: "3 3", halo: false }))
    parts.push(text("cell starts", { x: cellLeft - 4, y: iconTop - 10, size: 10, fill: D.mute, anchor: "end" }))

    const cy = iconTop + lk.icon / 2

    parts.push(seg([ox - 6, cy], [ox + lk.width + 20, cy], { color: INK.curve, width: 1, dash: "6 4" }))
    parts.push(tag("icon middle = word's ink middle", [ox + lk.width + 30, cy], { size: 11, color: INK.curve, anchor: "start" }))
    box.add("panel 3", 30, y3, 1020, h3)

    const notes = [
        "em: imagine every letter printed on a card. the font size is how tall the card is. the letters do not fill it: the tallest is 0.73 of it.",
        "cell: in a mono every card is also the same width, 0.6 em here. the letter sits inside with a little space either side.",
        "so an icon of 1.62 em at 42px type is 68px tall, and stays 1.62 em at any size. tracking never changes it, or the gap.",
        `round five's 'one cell' gap was 0.6 em to the start of the cell. the a's own side space adds ${n2(r4InkGapEm() - R4.gapToCell / R4.size)} em on top.`
    ]

    const ny = y3 + h3 + 36

    notes.forEach((n, i) => parts.push(text(n, { x: 30, y: ny + i * 22, size: 12, fill: i ? D.mute : D.fg })))

    const h = ny + notes.length * 22 + 16

    box.check("mechanics", h)

    return sheet(h, parts.join(""))
}

//  --------------------------------------------------------------- centring

const centringSheet = x1 => {
    const parts = []
    const box = bounds()
    const k = 2
    const size = R4.size * k

    parts.push(header("CENTRING", ["your round four favourite at twice size. top: as it was built. bottom: the word's ink middle moved onto the icon's middle."]))

    const rows = [
        { label: "round four, as built: baseline 54px under the icon top", centre: R4.baseline / R4.size, gapEm: R4.gapToCell / R4.size, gapTo: "cell" },
        { label: "ink-centred: tallest letter to baseline, centred on the icon", centre: "ink", gapEm: r4InkGapEm(), gapTo: "ink" }
    ]

    rows.forEach((r, i) => {
        const y = 120 + i * 250
        const h = 220
        const { lk, oy } = rowLockup(parts, box, { y, h, scheme: "light", label: r.label, mark: x1, face: "bm700", size, iconEm: R4_ICON_EM, gapEm: r.gapEm, gapTo: r.gapTo, centre: r.centre, x: 90 })
        const iconTop = oy - lk.top
        const iconMid = iconTop + lk.icon / 2
        const inkMid = iconTop + (lk.line.ink.y1 + lk.line.ink.y2) / 2
        const off = (inkMid - iconMid) / k

        parts.push(seg([60, iconMid], [1000, iconMid], { color: INK.curve, width: 1.2, dash: "6 4" }))
        parts.push(seg([90 + lk.iconW, inkMid], [1000, inkMid], { color: INK.dim, width: 1.2, dash: "2 3" }))
        parts.push(tag(Math.abs(off) < 0.05 ? "middles agree" : `word ${n2(off)}px low at 42px = ${n2((off / R4.icon) * 100)}% of the icon`, [700, y + h - 26], { size: 11 }))
    })

    const h = 120 + 2 * 250

    box.check("centring", h)

    return sheet(h, parts.join(""))
}

//  --------------------------------------------------------------- typefaces

const FACE_ROWS = [
    { face: "bm700", note: "tracking 0" },
    { face: "geist500", note: "tracking 0" },
    { face: "geist700", note: "tracking 0" },
    { face: "px700", note: "tracking 0, trial cut" }
]

const typefaceSheet = x1 => {
    const parts = []
    const box = bounds()
    const size = 56

    parts.push(
        header("TYPEFACES / SAME LOCKUP", [
            `X1 at ${n2(R4_ICON_EM)} em, gap ${n2(r4InkGapEm())} em to the ink, ink-centred: your round four favourite's proportions.`,
            "each face sized to Berkeley Mono's cap height, so the capitals would match. lowercase heights then differ honestly."
        ])
    )

    let y = 130

    for (const scheme of ["dark", "light"])
        for (const r of FACE_ROWS) {
            const s = capMatched(r.face, size)
            const m = metrics(r.face)

            rowLockup(parts, box, { y, h: 130, scheme, label: `${m.name}, ${n2(s)}px, ${r.note}`, mark: x1, face: r.face, size: s, iconEm: (R4_ICON_EM * size) / s, gapEm: (r4InkGapEm() * size) / s })
            y += 140
        }

    const h = y + 10

    box.check("typefaces", h)

    return sheet(h, parts.join(""))
}

//  --------------------------------------------------------------- icon x face

const iconSheet = (face, icons) => {
    const parts = []
    const box = bounds()
    const size = capMatched(face, 56)
    const m = metrics(face)

    parts.push(header(`LOCKUPS / ${m.name.toUpperCase()}`, [`same numbers for every icon: ${n2(R4_ICON_EM)} em, gap ${n2(r4InkGapEm())} em to the ink, ink-centred, tracking 0.`]))

    let y = 110

    icons.forEach((mark, i) => {
        rowLockup(parts, box, { y, h: 140, scheme: i % 2 ? "light" : "dark", label: mark.label, mark, face, size, iconEm: (R4_ICON_EM * 56) / size, gapEm: (r4InkGapEm() * 56) / size })
        y += 150
    })

    const h = y + 10

    box.check(`icons ${face}`, h)

    return sheet(h, parts.join(""))
}

//  --------------------------------------------------------------- spacing

const spacingSheet = x1 => {
    const parts = []
    const box = bounds()
    const size = 48
    const cell = metrics("bm700").cell

    parts.push(
        header("SPACING / ICON SIZE AND GAP", [
            `X1 with Berkeley Mono Bold, ink-centred. gaps run from the icon to the a's ink, counted in cells of ${cell} em.`,
            `your round four favourite sits at ${n2(R4_ICON_EM)} em and ${n2(r4InkGapEm() / cell)} cells.`
        ])
    )

    const rows = [
        ...[1, 1.25, 1.5, R4_ICON_EM].map(e => ({ iconEm: e, gap: 1.5, label: `icon ${n2(e)} em, gap 1.5 cells` })),
        ...[0.75, 1, 1.25, 1.75].map(c => ({ iconEm: R4_ICON_EM, gap: c, label: `icon ${n2(R4_ICON_EM)} em, gap ${c} cells` }))
    ]

    let y = 130

    rows.forEach((r, i) => {
        rowLockup(parts, box, { y, h: 112, scheme: i % 2 ? "light" : "dark", label: r.label, mark: x1, face: "bm700", size, iconEm: r.iconEm, gapEm: r.gap * cell })
        y += 120
    })

    const h = y + 10

    box.check("spacing", h)

    return sheet(h, parts.join(""))
}

//  --------------------------------------------------------------- stacked

const stackedSheet = () => {
    const parts = []
    const box = bounds()
    const size = 56

    parts.push(
        header("TEXT ONLY / STACKED", [
            "altered over .computer, for places with no room for the icon. leading is baseline to baseline, in em.",
            "hanging: line two moved left one cell, so the c sits under the a and the period hangs in the margin."
        ])
    )

    const rows = [
        { face: "bm700", lead: 1.0 },
        { face: "bm700", lead: 1.14, note: "round four" },
        { face: "bm700", lead: 1.25 },
        { face: "bm700", lead: 1.14, hang: true },
        { face: "px700", lead: 1.14 },
        { face: "geist700", lead: 1.14 }
    ]

    let y = 130

    rows.forEach((r, i) => {
        const tones = i % 2 ? L : D
        const s = capMatched(r.face, size)
        const m = metrics(r.face)
        const h = 190
        const x = 120
        const first = setLine(r.face, "altered", { size: s, x, baseline: 0 })
        const block = s * r.lead + (first.ink.y2 - first.ink.y1)
        const b1 = y + (h - block) / 2 - first.ink.y1
        const l1 = setLine(r.face, "altered", { size: s, x, baseline: b1 })
        const l2 = setLine(r.face, ".computer", { size: s, x: r.hang ? x - m.cell * s : x, baseline: b1 + s * r.lead })

        parts.push(`<rect x="30" y="${y}" width="1020" height="${h}" fill="${tones.bg}" stroke="${D.line}"/>`)
        parts.push(`<path d="${l1.d}" fill="${tones.fg}"/><path d="${l2.d}" fill="${tones.fg}"/>`)
        parts.push(text(`${m.name}, leading ${r.lead}${r.hang ? ", hanging period" : ""}${r.note ? `, ${r.note}` : ""}`, { x: 1036, y: y + 22, size: 11, fill: tones.mute, anchor: "end" }))
        box.add(`stacked ${i}`, l2.ink.x1, y, l2.ink.x2 - l2.ink.x1, h)
        y += h + 10
    })

    const h = y + 10

    box.check("stacked", h)

    return sheet(h, parts.join(""))
}

export { mechanicsSheet, centringSheet, typefaceSheet, iconSheet, spacingSheet, stackedSheet, R4, R4_ICON_EM, r4InkGapEm }
