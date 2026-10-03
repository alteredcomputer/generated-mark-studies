//  Round six construction sheets. Each takes a glyph, so X1 and canon get the same
//  drawings and differ only in their numbers.

import { funnelEdge, EASE } from "./geom.mjs"
import { renderMark } from "./render.mjs"
import { measure, tile, framed, flowPaths } from "./glyph.mjs"
import { D, W, text, header, sheet, bounds } from "./sheetkit.mjs"
import { INK, seg, tag, dim, point, outline, grid } from "./annotate.mjs"

const n2 = v => String(Number(v.toFixed(2)))

//  The fraction a value is of the field, as a reduced n/d when one exists below 64ths.
const frac = (v, field) => {
    for (const d of [2, 4, 8, 16, 32, 64]) {
        const n = (v / field) * d

        if (Math.abs(n - Math.round(n)) < 1e-9) return `${Math.round(n)}/${d}`
    }

    return (v / field).toFixed(3)
}

const ease = t => EASE.expoOut(t)

const MARKERS = [
    [0.1, "50%"],
    [1 / 3, "90%"],
    [2 / 3, "99%"]
]

/** The mark with its grid, drawn so the grid reads on both ink and ground. */
const gridded = (mark, field, ox, oy, size, ink = null) => {
    const id = `gm${ox}${oy}${size}`

    return [
        grid({ ox, oy, size, field }),
        renderMark(mark, { x: ox, y: oy, size, scheme: "dark", ink }),
        `<mask id="${id}" maskUnits="userSpaceOnUse" x="${ox}" y="${oy}" width="${size}" height="${size}"><rect x="${ox}" y="${oy}" width="${size}" height="${size}" fill="#000"/>${renderMark(mark, { x: ox, y: oy, size, scheme: "dark" })}</mask>`,
        `<g mask="url(#${id})">${grid({ ox, oy, size, field, color: INK.gridOnInk })}</g>`
    ].join("")
}

const axisLabels = (field, ox, oy, size) => {
    const u = size / field
    const out = []

    for (let i = 0; i <= field; i += field / 8) {
        out.push(text(n2(i), { x: ox + i * u, y: oy - 8, size: 11, fill: INK.grid, anchor: "middle" }))
        out.push(text(n2(i), { x: ox - 8, y: oy + i * u + 4, size: 11, fill: INK.grid, anchor: "end" }))
    }

    return out.join("")
}

const legend = (y, rows) =>
    rows
        .map(([color, label], i) => `<rect x="30" y="${y + i * 22 - 10}" width="14" height="14" fill="${color}"/>${text(label, { x: 54, y: y + i * 22 + 2, size: 12, fill: D.mute })}`)
        .join("")

//  --------------------------------------------------------------- overall

const overallSheet = (g, title) => {
    const m = measure(g)
    const F = g.field
    const S = 600
    const ox = 210
    const oy = 170
    const u = S / F
    const P = (x, y) => [ox + x * u, oy + y * u]
    const box = bounds()
    const parts = []

    parts.push(
        header(`CONSTRUCTION / ${title}`, [
            `${F}-unit field. orange grid: thin = 1 unit, medium = 1/16 of the field (one pixel at 16px), thick = 1/8.`,
            "blue = the expo-out curve and its anchors. yellow = dimensions, in units, with the fraction of the field."
        ])
    )

    parts.push(gridded(tile(g), F, ox, oy, S))
    parts.push(axisLabels(F, ox, oy, S))
    box.add("field", ox - 40, oy - 20, S + 40, S + 20)

    //  The curve: the funnel's own sampled edge, traced over the ink.
    const edge = funnelEdge({ width: F, height: F, throat: g.bar, inflect: g.inflect, ease: g.ease, mouth: g.mouth, x0: g.x0, x1: g.inflect })
    const top = edge.slice(0, -1)
    const bottom = top.map(([x, y]) => [x, F - y])

    for (const pts of [top, bottom])
        parts.push(`<path d="M${pts.map(p => P(...p).map(n2).join(" ")).join("L")}" fill="none" stroke="${INK.halo}" stroke-width="5"/><path d="M${pts.map(p => P(...p).map(n2).join(" ")).join("L")}" fill="none" stroke="${INK.curve}" stroke-width="2.5"/>`)

    parts.push(outline([P(g.x0, m.top), P(g.inflect, m.top), P(g.inflect, m.barTop), P(g.x0, m.barTop)], { color: INK.curve, width: 1.2, dash: "5 4" }))
    parts.push(outline([P(g.x0, m.barBottom), P(g.inflect, m.barBottom), P(g.inflect, F - m.top), P(g.x0, F - m.top)], { color: INK.curve, width: 1.2, dash: "5 4" }))

    for (const [t, label] of MARKERS) {
        const x = g.x0 + (g.inflect - g.x0) * t
        const p = P(x, m.top + m.drop * ease(t))

        const above = t > 0.5

        parts.push(point(p, { r: 3.5 }))
        parts.push(tag(`${label} at t=${t === 0.1 ? "0.1" : t < 0.5 ? "1/3" : "2/3"}`, [p[0] + (above ? -40 : 8), p[1] + (above ? -22 : 20)], { color: INK.curve, size: 11, anchor: "start" }))
    }

    parts.push(point(P(g.x0, m.top)))
    parts.push(point(P(g.inflect, m.barTop)))
    parts.push(tag(["start, t=0", `(${n2(g.x0)}, ${n2(m.top)})`], [P(g.x0, m.top)[0] + 70, P(g.x0, m.top)[1] + 56], { color: INK.curve, size: 11 }))
    parts.push(tag(["end, t=1", `(${n2(g.inflect)}, ${n2(m.barTop)})`], [P(g.inflect, m.barTop)[0] - 70, P(g.inflect, m.barTop)[1] + 46], { color: INK.curve, size: 11 }))

    //  Dimensions. Left: what sets the curve's box. Right: what sets the bar and star.
    parts.push(dim(P(0, 0), P(F, 0), `field ${F} = 1`, { off: 34, labelOff: 0 }))
    parts.push(dim(P(0, F), P(g.inflect, F), `inflection ${n2(g.inflect)} = ${frac(g.inflect, F)}`, { off: -30 }))
    parts.push(dim(P(g.inflect, F), P(F, F), `output ${n2(F - g.inflect)}`, { off: -30 }))

    parts.push(dim(P(0, 0), P(0, m.top), null, { off: -26 }))
    parts.push(tag(`sliver ${n2(m.top)}`, [ox - 34, oy - 8], { anchor: "end", size: 11 }))
    parts.push(dim(P(0, m.top), P(0, m.barTop), null, { off: -26 }))
    parts.push(tag(["curve drop", n2(m.drop)], [ox - 34, P(0, (m.top + m.barTop) / 2)[1]], { anchor: "end", size: 11 }))
    parts.push(dim(P(0, m.barTop), P(0, m.barBottom), null, { off: -26 }))
    parts.push(tag(["bar", `${n2(g.bar)} = ${frac(g.bar, F)}`], [ox - 34, P(0, m.cy)[1]], { anchor: "end", size: 11 }))

    parts.push(dim(P(F, 0), P(F, m.tipY), null, { off: 22 }))
    parts.push(tag(`tip margin ${n2(m.tipMargin)} = ${frac(m.tipMargin, F)}`, [ox + S + 56, oy + 2], { anchor: "start", size: 11 }))
    parts.push(dim(P(g.inflect, m.tipY), P(g.inflect, m.cy), null, { off: (F - g.inflect) * u + 44 }))
    parts.push(tag(["vertical spike", `${n2(g.vLen)} from centre`, `= ${n2(g.vLen / m.cy)} of half`], [ox + S + 56, P(0, (m.tipY + m.cy) / 2)[1] - 18], { anchor: "start", size: 11 }))
    parts.push(dim(P(F, m.barTop), P(F, m.barBottom), null, { off: 22 }))
    parts.push(tag(["bar", `${n2(g.bar)} = ${frac(g.bar, F)}`], [ox + S + 56, P(0, m.cy)[1] + 26], { anchor: "start", size: 11 }))
    parts.push(dim(P(F, m.barBottom), P(F, F - m.tipY), null, { off: 22 }))
    parts.push(tag(["visible spike", n2(m.vVisible)], [ox + S + 56, P(0, (m.barBottom + F - m.tipY) / 2)[1]], { anchor: "start", size: 11 }))

    box.add("right labels", ox + S + 34, oy, 200, S)

    const ly = oy + S + 76

    parts.push(
        legend(ly, [
            [INK.curve, `the top edge is expoOut stretched into the dashed box: x runs ${n2(g.x0)} to ${n2(g.inflect)}, y drops ${n2(m.drop)}. the bottom edge is its mirror.`],
            [INK.curve, "expoOut is 50% done a tenth of the way across and 99% done two thirds across, so the visible bend is all in the first third."],
            [INK.dim, "the star is drawn on the next sheet, with every triangle shown whole."]
        ])
    )

    const h = ly + 3 * 22 + 20

    box.check(`overall ${title}`, h)

    return sheet(h, parts.join(""))
}

//  --------------------------------------------------------------- star

const SPIKES = g => [
    [90, g.vLen, g.vBase],
    [270, g.vLen, g.vBase],
    [45, g.dLen, g.dBase],
    [135, g.dLen, g.dBase],
    [225, g.dLen, g.dBase],
    [315, g.dLen, g.dBase]
]

const spikeGeometry = (g, c) =>
    SPIKES(g).map(([deg, len, base]) => {
        const r = (deg * Math.PI) / 180
        const d = [Math.cos(r), Math.sin(r)]
        const n = [-d[1], d[0]]

        return {
            deg,
            apex: [c[0] + d[0] * len, c[1] + d[1] * len],
            b1: [c[0] + (n[0] * base) / 2, c[1] + (n[1] * base) / 2],
            b2: [c[0] - (n[0] * base) / 2, c[1] - (n[1] * base) / 2]
        }
    })

/** The dimmed mark plus every triangle whole, under a given mapping and clip. */
const xray = (g, m, P, { ox, oy, size, clip = null, F }) => {
    const c = [g.inflect, m.cy]
    const out = []

    out.push(seg(P(0, m.barTop), P(F, m.barTop), { color: "#9A9A9A", width: 1, dash: "4 4" }))
    out.push(seg(P(0, m.barBottom), P(F, m.barBottom), { color: "#9A9A9A", width: 1, dash: "4 4" }))

    for (const s of spikeGeometry(g, c)) {
        out.push(outline([P(...s.apex), P(...s.b1), P(...s.b2)], { color: INK.xray, width: 1.5 }))
        out.push(seg(P(...s.b1), P(...s.b2), { color: INK.xray, width: 2.2 }))
        out.push(seg(P(...c), P(...s.apex), { color: INK.xray, width: 0.8, dash: "2 3" }))
    }

    out.push(point(P(...c), { color: INK.xray, r: 5 }))

    const body = `${renderMark(tile(g), { x: ox, y: oy, size, scheme: "dark", ink: "#3A3A3A" })}${out.join("")}`

    return clip ? `<g clip-path="url(#${clip})">${body}</g>` : body
}

const starSheet = (g, title) => {
    const m = measure(g)
    const F = g.field
    const S = 560
    const ox = 170
    const oy = 150
    const u = S / F
    const P = (x, y) => [ox + x * u, oy + y * u]
    const c = [g.inflect, m.cy]
    const box = bounds()
    const parts = []

    parts.push(
        header(`STAR / ${title}`, [
            "six triangles sharing one centre, shown whole. dashed pink = the full triangle, including the part hidden inside the bar.",
            "solid pink = each triangle's base, which passes through the centre. grey dashes = the bar's edges."
        ])
    )

    parts.push(`<rect x="${ox}" y="${oy}" width="${S}" height="${S}" fill="${D.bg}"/>`)
    parts.push(xray(g, m, P, { ox, oy, size: S, F }))
    box.add("field", ox, oy, S, S)

    const geo = spikeGeometry(g, c)
    const up = geo.find(s => s.deg === 270)
    const ur = geo.find(s => s.deg === 315)

    parts.push(tag(`centre (${n2(c[0])}, ${n2(c[1])})`, [ox + 70, P(...c)[1]], { color: INK.xray, size: 11 }))

    parts.push(dim(P(...c), P(...up.apex), null, { off: (g.vBase / 2) * u + 22 }))
    parts.push(tag(["vertical length", n2(g.vLen), `= ${n2(g.vLen / m.cy)} x ${n2(m.cy)}`], [P(...c)[0] - (g.vBase / 2) * u - 28, P(c[0], (m.tipY + m.cy) / 2)[1] - 24], { size: 11, anchor: "end" }))

    parts.push(dim(P(c[0], m.barTop), P(...up.apex), null, { off: -((g.vBase / 2) * u + 22) }))
    parts.push(tag(["visible", n2(m.vVisible), `apex ${n2(m.apexV)} deg`], [P(...c)[0] + (g.vBase / 2) * u + 30, P(c[0], (m.tipY + m.barTop) / 2)[1] - 60], { size: 11, anchor: "start" }))

    parts.push(seg(P(c[0] - g.vBase / 2, m.cy), P(c[0] - g.vBase / 2, F), { color: INK.dim, width: 0.7, dash: "2 3" }))
    parts.push(seg(P(c[0] + g.vBase / 2, m.cy), P(c[0] + g.vBase / 2, F), { color: INK.dim, width: 0.7, dash: "2 3" }))
    parts.push(dim(P(c[0] - g.vBase / 2, F), P(c[0] + g.vBase / 2, F), null, { off: -22 }))
    parts.push(tag(`vertical base ${n2(g.vBase)} = ${n2(g.vBase / g.bar)} x bar`, [P(...c)[0], oy + S + 44], { size: 11 }))

    //  Inset: the up-right diagonal, enlarged, from the centre to past its apex.
    const span = g.dLen / Math.SQRT2 + 5
    const I = 300
    const ix = 750
    const iy = 190
    const iu = I / span
    const x0 = c[0] - 2
    const y0 = c[1] - span + 2
    const Q = (x, y) => [ix + (x - x0) * iu, iy + (y - y0) * iu]
    const clip = `si${F}`

    parts.push(`<clipPath id="${clip}"><rect x="${ix}" y="${iy}" width="${I}" height="${I}"/></clipPath>`)
    parts.push(`<rect x="${ix}" y="${iy}" width="${I}" height="${I}" fill="${D.bg}" stroke="${D.line}"/>`)
    parts.push(xray(g, m, Q, { ox: Q(0, 0)[0], oy: Q(0, 0)[1], size: F * iu, clip, F }))
    parts.push(outline([P(x0, y0), P(x0 + span, y0), P(x0 + span, y0 + span), P(x0, y0 + span)], { color: "#9A9A9A", width: 1, dash: "3 3" }))
    parts.push(text(`diagonal, enlarged x${n2(iu / u)}`, { x: ix, y: iy - 12, size: 12, fill: D.mute }))
    box.add("inset", ix, iy - 20, I, I + 20)

    parts.push(`<g clip-path="url(#${clip})">${dim(Q(...c), Q(...ur.apex), null, { off: -16 })}${dim(Q(ur.apex[0], m.barTop), Q(...ur.apex), null, { off: -14 })}</g>`)

    const notes = [
        ["diagonal length", `${n2(g.dLen)} = ${n2(g.dLen / g.vLen)} x vertical`],
        ["diagonal base", `${n2(g.dBase)} = ${n2(g.dBase / g.bar)} x bar`],
        ["apex angle", `${n2(m.apexD)} deg (vertical ${n2(m.apexV)})`],
        ["rises above bar", `${n2(m.dRise)} = length / sqrt 2 - bar / 2`]
    ]

    notes.forEach(([k, v], i) => {
        parts.push(text(k, { x: ix, y: iy + I + 30 + i * 40, size: 12, fill: D.mute }))
        parts.push(text(v, { x: ix, y: iy + I + 47 + i * 40, size: 12, fill: INK.dim }))
    })

    box.add("notes", ix, iy + I, I, 4 * 40 + 20)

    const same = Math.abs(m.apexV - m.apexD) < 0.01
    const ly = oy + S + 92

    parts.push(
        legend(ly, [
            [INK.xray, "each spike: apex at its length from the centre, base perpendicular to its axis and centred on the centre point."],
            [INK.xray, "no horizontal spike: the bar is the horizontal. it hides the inner part of all six triangles, so only the tips show."],
            [INK.dim, same ? "all six are one triangle at two sizes: the diagonal is the vertical scaled down, so the apex angles match." : `apex angles differ: vertical ${n2(m.apexV)} deg, diagonal ${n2(m.apexD)} deg. the diagonals are blunter.`]
        ])
    )

    const h = ly + 3 * 22 + 20

    box.check(`star ${title}`, h)

    return sheet(h, parts.join(""))
}

//  --------------------------------------------------------------- curve

const curveSheet = (g, title) => {
    const m = measure(g)
    const F = g.field
    const parts = []
    const box = bounds()
    const G = 400
    const gx = 70
    const gy = 170

    parts.push(
        header(`CURVE / ${title}`, [
            "left: expoOut on a unit square, 1 - 2^(-10t). right: the same curve stretched into the mark's bottom-left box.",
            "nothing else is done to it. the top edge of the funnel is this, flipped."
        ])
    )

    //  Unit graph.
    parts.push(`<rect x="${gx}" y="${gy}" width="${G}" height="${G}" fill="${D.panel}"/>`)

    for (let i = 0; i <= 10; i++) {
        parts.push(`<rect x="${gx + (i * G) / 10 - 0.4}" y="${gy}" width="0.8" height="${G}" fill="#FFFFFF" fill-opacity="0.08"/>`)
        parts.push(`<rect x="${gx}" y="${gy + (i * G) / 10 - 0.4}" width="${G}" height="0.8" fill="#FFFFFF" fill-opacity="0.08"/>`)
    }

    const gp = (t, v) => [gx + t * G, gy + G - v * G]
    const curve = Array.from({ length: 201 }, (_, i) => gp(i / 200, ease(i / 200)))

    parts.push(`<path d="M${curve.map(p => p.map(n2).join(" ")).join("L")}" fill="none" stroke="${INK.curve}" stroke-width="3"/>`)
    parts.push(point(gp(0, 0)))
    parts.push(point(gp(1, 1)))

    for (const [t, label] of MARKERS) {
        const p = gp(t, ease(t))

        parts.push(seg([p[0], gy + G], p, { color: INK.curve, width: 0.8, dash: "3 3", halo: false }))
        parts.push(seg([gx, p[1]], p, { color: INK.curve, width: 0.8, dash: "3 3", halo: false }))
        parts.push(point(p, { r: 3.5 }))
        parts.push(tag(`${label}`, [p[0] + 26, p[1] + 16], { color: INK.curve, size: 11 }))
    }

    parts.push(text("t: how far across, 0 to 1", { x: gx, y: gy + G + 24, size: 12, fill: D.mute }))
    parts.push(text("ease(t): how far down the drop", { x: gx, y: gy - 12, size: 12, fill: D.mute }))
    box.add("graph", gx, gy - 20, G, G + 30)

    //  Installed: the mark's bottom-left quadrant at the same size, so the shapes match.
    const qx = 560
    const qy = gy
    const span = g.inflect - g.x0
    const u = G / span
    const Q = (x, y) => [qx + (x - g.x0) * u, qy + (y - m.cy) * u]
    const clip = `cq${F}`

    parts.push(`<clipPath id="${clip}"><rect x="${qx}" y="${qy}" width="${G}" height="${(F - m.cy) * u}"/></clipPath>`)
    parts.push(`<g clip-path="url(#${clip})">${renderMark(tile(g), { x: qx - g.x0 * u, y: qy - m.cy * u, size: F * u, scheme: "dark", ink: "#5A5A5A" })}</g>`)
    parts.push(`<rect x="${qx}" y="${qy}" width="${G}" height="${(F - m.cy) * u}" fill="none" stroke="${D.mute}" stroke-width="1"/>`)

    const edge = funnelEdge({ width: F, height: F, throat: g.bar, inflect: g.inflect, ease: g.ease, mouth: g.mouth, x0: g.x0, x1: g.inflect })
        .slice(0, -1)
        .map(([x, y]) => Q(x, F - y))

    parts.push(`<path d="M${edge.map(p => p.map(n2).join(" ")).join("L")}" fill="none" stroke="${INK.curve}" stroke-width="3"/>`)
    parts.push(outline([Q(g.x0, m.barBottom), Q(g.inflect, m.barBottom), Q(g.inflect, F - m.top), Q(g.x0, F - m.top)], { color: INK.curve, width: 1.2, dash: "5 4" }))
    parts.push(point(Q(g.x0, F - m.top)))
    parts.push(point(Q(g.inflect, m.barBottom)))

    for (const [t, label] of MARKERS) {
        const p = Q(g.x0 + span * t, F - m.top - m.drop * ease(t))

        parts.push(point(p, { r: 3.5 }))
        parts.push(tag(label, [p[0] + 26, p[1] + 16], { color: INK.curve, size: 11 }))
    }

    parts.push(dim(Q(g.x0, F - m.top), Q(g.inflect, F - m.top), `x: ${n2(g.x0)} to ${n2(g.inflect)}`, { off: -26 }))
    parts.push(dim(Q(g.inflect, F - m.top), Q(g.inflect, m.barBottom), null, { off: -20 }))
    parts.push(tag(["drop", n2(m.drop)], [Q(g.inflect, 0)[0] - 10, Q(0, (F - m.top + m.barBottom) / 2)[1]], { size: 11, anchor: "end" }))
    parts.push(text("the mark's bottom-left quarter, ink dimmed", { x: qx, y: gy - 12, size: 12, fill: D.mute }))
    box.add("installed", qx, qy - 20, G, G + 60)

    const fy = gy + G + 84
    const lines = [
        [`x = ${n2(g.x0)} + t x ${n2(span)}`, "t runs 0 to 1 across the left half, mouth to inflection"],
        [`y = ${n2(F - m.top)} - ease(t) x ${n2(m.drop)}`, "starts at the mouth edge, ends on the bar's edge"],
        [`start (${n2(g.x0)}, ${n2(F - m.top)})`, `the bottom-left corner, less the ${n2(m.top)} sliver`],
        [`end (${n2(g.inflect)}, ${n2(m.barBottom)})`, "the inflection, on the bar's edge. the bar runs flat from here on"],
        ["the box sets the curve", "change the bar or the sliver and the curve re-stretches to fit"]
    ]

    lines.forEach(([a, b], i) => {
        parts.push(text(a, { x: gx, y: fy + i * 22, size: 12, fill: D.fg }))
        parts.push(text(b, { x: gx + 300, y: fy + i * 22, size: 12, fill: D.mute }))
    })

    const h = fy + lines.length * 22 + 16

    box.check(`curve ${title}`, h)

    return sheet(h, parts.join(""))
}

//  --------------------------------------------------------------- overlay

/** One glyph outlined over another, both at the same display size. */
const overlaySheet = (a, b, labelA, labelB) => {
    const S = 640
    const ox = 220
    const oy = 150
    const parts = []
    const box = bounds()

    parts.push(header(`OVERLAY / ${labelA} AGAINST ${labelB}`, [`yellow = ${labelA}'s void outline. blue = ${labelB}'s. both scaled to the same size, so every gap between the lines is a real difference.`]))
    parts.push(`<rect x="${ox}" y="${oy}" width="${S}" height="${S}" fill="#1E1E1E"/>`)
    parts.push(renderMark(tile(a), { x: ox, y: oy, size: S, scheme: "dark", ink: "#3A3A3A" }))
    box.add("field", ox, oy, S, S)

    for (const [g, color] of [[a, INK.dim], [b, INK.curve]]) {
        const k = S / g.field

        for (const d of flowPaths(g))
            parts.push(`<path d="${d}" fill="none" stroke="${color}" stroke-width="${n2(2 / k)}" stroke-linejoin="round" transform="translate(${ox} ${oy}) scale(${k})"/>`)
    }

    const h = oy + S + 30

    box.check("overlay", h)

    return sheet(h, parts.join(""))
}

//  --------------------------------------------------------------- framed

const framedSheet = (g, cfg, title) => {
    const mark = framed(g, cfg)
    const { field, frame, gap, box: inner, scale, at } = mark.place
    const S = 600
    const ox = 210
    const oy = 150
    const u = S / field
    const P = (x, y) => [ox + x * u, oy + y * u]
    const parts = []
    const box = bounds()

    parts.push(header(`CONSTRUCTION / ${title}`, [`${field}-unit field. the dashed blue square is the canon glyph's whole ${g.field}-unit field, scaled by ${n2(scale)} to fit.`]))
    parts.push(gridded(mark, field, ox, oy, S))
    parts.push(axisLabels(field, ox, oy, S))
    box.add("field", ox - 40, oy - 20, S + 40, S + 20)

    parts.push(outline([P(at, at), P(at + inner, at), P(at + inner, at + inner), P(at, at + inner)], { color: INK.curve, width: 1.6, dash: "6 4" }))

    parts.push(dim(P(0, field), P(frame, field), null, { off: -26 }))
    parts.push(dim(P(frame, field), P(at, field), null, { off: -26 }))
    parts.push(dim(P(at, field), P(at + inner, field), null, { off: -26 }))
    parts.push(tag(`frame ${frame} = ${frac(frame, field)}`, [P(frame / 2, 0)[0], oy + S + 52], { size: 11 }))
    parts.push(tag(`gap ${gap} = ${frac(gap, field)}`, [P(frame + gap / 2, 0)[0] + 70, oy + S + 52], { size: 11 }))
    parts.push(tag(`glyph ${inner} = ${frac(inner, field)}`, [P(at + inner / 2, 0)[0], oy + S + 26], { size: 11 }))

    const m = measure(g)
    const barTop = at + m.barTop * scale
    const barBottom = at + m.barBottom * scale

    parts.push(dim(P(field, barTop), P(field, barBottom), null, { off: 22 }))
    parts.push(tag(["bar", `${n2(g.bar * scale)} = ${frac(g.bar * scale, field)}`, `frame ${frame}`], [ox + S + 34, P(0, field / 2)[1]], { anchor: "start", size: 11 }))
    parts.push(dim(P(field, 0), P(field, frame), null, { off: 22 }))
    parts.push(tag(`frame ${frame}`, [ox + S + 34, P(0, frame / 2)[1] + 4], { anchor: "start", size: 11 }))
    box.add("right labels", ox + S + 34, oy, 160, S)

    const ly = oy + S + 100

    parts.push(
        legend(ly, [
            [INK.curve, `every inner proportion is the tile's: bar, spikes, curve and sliver are all the canon numbers times ${n2(scale)}.`],
            [INK.dim, `the frame and gap are the only new numbers. ${frame} + ${gap} + ${inner} + ${gap} + ${frame} = ${field}.`]
        ])
    )

    const h = ly + 2 * 22 + 20

    box.check(`framed ${title}`, h)

    return sheet(h, parts.join(""))
}

export { overallSheet, starSheet, curveSheet, overlaySheet, framedSheet, frac }
