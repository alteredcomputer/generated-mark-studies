//  Geometry kit for round three. Everything that follows is generated from these
//  primitives rather than hand-placed, so a parameter change re-derives the whole mark.

const r3 = n => Number(n.toFixed(3))

const R = (x, y, w, h) => `M${r3(x)} ${r3(y)}H${r3(x + w)}V${r3(y + h)}H${r3(x)}Z`

const P = pts => `M${pts.map(([x, y]) => `${r3(x)} ${r3(y)}`).join("L")}Z`

const EASE = {
    linear: t => t,
    quadOut: t => 1 - (1 - t) ** 2,
    cubicOut: t => 1 - (1 - t) ** 3,
    quartOut: t => 1 - (1 - t) ** 4,
    expoOut: t => (t >= 1 ? 1 : 1 - 2 ** (-10 * t)),
    circOut: t => Math.sqrt(1 - (t - 1) ** 2)
}

const sub = (a, b) => [a[0] - b[0], a[1] - b[1]]
const add = (a, b) => [a[0] + b[0], a[1] + b[1]]
const mul = (a, k) => [a[0] * k, a[1] * k]
const len = a => Math.hypot(a[0], a[1])
const norm = a => (len(a) === 0 ? [0, 0] : mul(a, 1 / len(a)))
const dot = (a, b) => a[0] * b[0] + a[1] * b[1]

/**
 * Offsets a polyline by a signed distance using mitred joins.
 *
 * @remarks
 * This is what keeps a diagonal channel the same visual weight as the flat runs
 * either side of it. Offsetting in y alone, which is the cheap way, makes every
 * diagonal look thinner than the horizontals it connects.
 */
const offsetSide = (pts, d, miterLimit = 4) => {
    const normals = []

    for (let i = 0; i < pts.length - 1; i++) {
        const dir = norm(sub(pts[i + 1], pts[i]))

        normals.push([-dir[1], dir[0]])
    }

    const out = [add(pts[0], mul(normals[0], d))]

    for (let i = 1; i < pts.length - 1; i++) {
        const m = norm(add(normals[i - 1], normals[i]))
        const cos = dot(m, normals[i])
        const scale = Math.min(Math.abs(d / (cos || 1)), Math.abs(d) * miterLimit)

        out.push(add(pts[i], mul(m, Math.sign(d) * scale)))
    }

    out.push(add(pts[pts.length - 1], mul(normals[normals.length - 1], d)))

    return out
}

const strokePolyline = (pts, width) => P([...offsetSide(pts, width / 2), ...offsetSide(pts, -width / 2).reverse()])

//  --------------------------------------------------------------- convergence

/**
 * Samples the converging edge of the funnel.
 *
 * @remarks
 * Spread runs from the full window half-height at the mouth down to half the
 * output thickness at the throat, following the supplied easing. Past the
 * throat it is flat, which is the "clarity" half of the story.
 */
/**
 * Samples the converging edge of the funnel.
 *
 * @remarks
 * `mouth` is the fraction of the window height the intake occupies, and `x0`
 * insets it from the left wall. Both exist because a funnel that touches the
 * frame merges with it and the eye flips figure and ground: you stop seeing a
 * funnel and start seeing two wedges of background.
 */
const funnelEdge = ({ width, height, throat, inflect, ease, mouth = 0.82, x0 = 2, x1 = null, steps = 72 }) => {
    const centre = height / 2
    const reach = (height * mouth - throat) / 2
    const e = EASE[ease] ?? EASE.expoOut
    const top = []

    for (let i = 0; i <= steps; i++) {
        const x = x0 + ((inflect - x0) * i) / steps
        const spread = reach * (1 - e(i / steps)) + throat / 2

        top.push([x, centre - spread])
    }

    top.push([x1 ?? width, centre - throat / 2])

    return top
}

const funnelSolid = opts => {
    const top = funnelEdge(opts)
    const bottom = top.map(([x, y]) => [x, opts.height - y]).reverse()

    return P([...top, ...bottom])
}

const funnelStrands = ({ width, height, throat, inflect, ease, count, gauge, mouth = 0.86, x0 = 2, x1 = null }) => {
    const centre = height / 2
    const e = EASE[ease] ?? EASE.expoOut
    const span = height * mouth - gauge
    const paths = []

    for (let k = 0; k < count; k++) {
        const startY = count === 1 ? centre : centre - span / 2 + (span * k) / (count - 1)
        const endY = count === 1 ? centre : centre - (throat - gauge) / 2 + ((throat - gauge) * k) / (count - 1)
        const pts = []

        for (let i = 0; i <= 56; i++) {
            const t = i / 56

            pts.push([x0 + (inflect - x0) * t, startY + (endY - startY) * e(t)])
        }

        pts.push([x1 ?? width, endY])
        paths.push(strokePolyline(pts, gauge))
    }

    return paths
}

//  --------------------------------------------------------------- inflection

const starSquare = (cx, cy, r, waist = 0.28) => {
    const i = r * waist

    return P([
        [cx, cy - r], [cx + i, cy - i], [cx + r, cy], [cx + i, cy + i],
        [cx, cy + r], [cx - i, cy + i], [cx - r, cy], [cx - i, cy - i]
    ])
}

//  Four tips joined by quadratics whose control points sit on the diagonals.
//  Pull toward zero gives a needle-sharp sparkle, toward r gives a rounded quatrefoil.
const starSmooth = (cx, cy, r, pull = 0.22) => {
    const c = r * pull
    const q = (x1, y1, x2, y2) => `Q${r3(x1)} ${r3(y1)} ${r3(x2)} ${r3(y2)}`

    return [
        `M${r3(cx)} ${r3(cy - r)}`,
        q(cx + c, cy - c, cx + r, cy),
        q(cx + c, cy + c, cx, cy + r),
        q(cx - c, cy + c, cx - r, cy),
        q(cx - c, cy - c, cx, cy - r),
        "Z"
    ].join("")
}

const asterisk = (cx, cy, r, gauge, arms = 6, rotation = 0) => {
    const out = []

    for (let k = 0; k < arms / 2; k++) {
        const a = rotation + (k * 180) / (arms / 2)
        const rad = (a * Math.PI) / 180
        const d = [Math.cos(rad), Math.sin(rad)]

        out.push(strokePolyline([[cx - d[0] * r, cy - d[1] * r], [cx + d[0] * r, cy + d[1] * r]], gauge))
    }

    return out
}

//  --------------------------------------------------------------- chrome

const frameOps = (w, h, thickness) => [
    { d: R(0, 0, w, h), on: true },
    { d: R(thickness, thickness, w - thickness * 2, h - thickness * 2), on: false }
]

const knobs = (x, y, w, h, count, round) => {
    const out = []
    const step = h / count

    for (let k = 0; k < count; k++) {
        const cy = y + step * (k + 0.5)
        const s = Math.min(w * 0.62, step * 0.48)

        out.push(
            round
                ? { d: `M${r3(x + w / 2 - s)} ${r3(cy)}a${r3(s)} ${r3(s)} 0 1 0 ${r3(s * 2)} 0a${r3(s)} ${r3(s)} 0 1 0 ${r3(-s * 2)} 0Z`, on: true }
                : { d: R(x + w / 2 - s, cy - s, s * 2, s * 2), on: true }
        )
    }

    return out
}


//  ---------------------------------------------------------------- round four

//  Mirroring an easing about the 45 degree line y = x gives its inverse. For the
//  power family f(t) = 1 - (1 - t)^n the inverse is 1 - (1 - t)^(1/n), which only
//  equals f when n = 1. So no Out curve here is self-symmetric: reflecting one
//  produces the matching In curve, which is a genuinely different silhouette.
const EASE_EXTRA = {
    quadIn: t => t ** 2,
    cubicIn: t => t ** 3,
    quartIn: t => t ** 4,
    expoIn: t => (t <= 0 ? 0 : 2 ** (10 * (t - 1))),
    circIn: t => 1 - Math.sqrt(1 - t ** 2),
    //  circOut already is a true 90 degree arc: the quarter circle centred at (1, 0).
    arc: t => Math.sqrt(1 - (t - 1) ** 2)
}

Object.assign(EASE, EASE_EXTRA)

const FORMULA = {
    linear: "t",
    quadOut: "1-(1-t)^2",
    cubicOut: "1-(1-t)^3",
    quartOut: "1-(1-t)^4",
    expoOut: "1-2^(-10t)",
    circOut: "90 deg arc",
    arc: "90 deg arc",
    quadIn: "t^2",
    cubicIn: "t^3",
    quartIn: "t^4",
    expoIn: "2^(10(t-1))",
    circIn: "1-sqrt(1-t^2)"
}

/**
 * A single tapered spike: apex at `length` from centre, base of `base` across.
 *
 * @remarks
 * Straight-edged on purpose. A union of these reads as an explosion rather than
 * the two thorns a four-point polygon star produced.
 */
const spike = (cx, cy, deg, length, base) => {
    const rad = (deg * Math.PI) / 180
    const d = [Math.cos(rad), Math.sin(rad)]
    const n = [-d[1], d[0]]

    return P([
        [cx + d[0] * length, cy + d[1] * length],
        [cx + n[0] * (base / 2), cy + n[1] * (base / 2)],
        [cx - n[0] * (base / 2), cy - n[1] * (base / 2)]
    ])
}

/**
 * The Kortex reading: long spikes on the vertical, shorter ones on the diagonals.
 * Horizontal is deliberately absent because the output bar already supplies it.
 */
const spikeStar = ({ cx, cy, axis, diag, axisBase, diagBase, diagonalsOnly = false }) => {
    const out = []

    if (!diagonalsOnly) {
        out.push(spike(cx, cy, 90, axis, axisBase))
        out.push(spike(cx, cy, 270, axis, axisBase))
    }

    for (const a of [45, 135, 225, 315]) out.push(spike(cx, cy, a, diag, diagBase))

    return out
}

/**
 * A vertical spike whose flanks arrive tangent to the horizontal bar.
 *
 * @remarks
 * The fix for the kink you spotted: the cubic leaves the bar with a horizontal
 * tangent and reaches the tip with a vertical one, so the joint is G1 continuous
 * instead of meeting the bar at roughly 22 degrees.
 */
const flareSpike = ({ cx, cy, half, reach, spread, dir = -1, ease = 0.45 }) => {
    const yBar = cy + dir * half
    const yTip = cy + dir * reach
    const c = spread * ease

    return [
        `M${r3(cx - spread)} ${r3(yBar)}`,
        `C${r3(cx - spread + c)} ${r3(yBar)} ${r3(cx)} ${r3(cy + dir * reach * 0.52)} ${r3(cx)} ${r3(yTip)}`,
        `C${r3(cx)} ${r3(cy + dir * reach * 0.52)} ${r3(cx + spread - c)} ${r3(yBar)} ${r3(cx + spread)} ${r3(yBar)}`,
        "Z"
    ].join("")
}

const flareStar = ({ cx, cy, half, reach, spread, ease = 0.45 }) => [
    flareSpike({ cx, cy, half, reach, spread, dir: -1, ease }),
    flareSpike({ cx, cy, half, reach, spread, dir: 1, ease })
]

//  Reflection of an easing about the anti-diagonal, the line from top-left to
//  bottom-right of the unit square (y = 1 - x). The map is (x, y) -> (1 - y, 1 - x),
//  so the reflected curve is g(x) = 1 - f^-1(1 - x).
//
//  For f(t) = 1 - (1 - t)^n this collapses to g(t) = t^(1/n): the root curve.
//  For expoOut = 1 - 2^(-10t) it collapses to g(t) = 1 + log2(t) / 10.
//  For the 90 degree arc it collapses to f itself, because the arc's centre (1, 0)
//  is a fixed point of the reflection. The arc is the only self-symmetric curve here.
const EASE_MIRROR = {
    quadOutM: t => t ** (1 / 2),
    cubicOutM: t => t ** (1 / 3),
    quartOutM: t => t ** (1 / 4),
    expoOutM: t => Math.max(0, 1 + Math.log2(Math.max(t, 2 ** -10)) / 10),
    arcM: t => Math.sqrt(1 - (t - 1) ** 2)
}

Object.assign(EASE, EASE_MIRROR)

Object.assign(FORMULA, {
    quadOutM: "t^(1/2)",
    cubicOutM: "t^(1/3)",
    quartOutM: "t^(1/4)",
    expoOutM: "1+log2(t)/10",
    arcM: "90 deg arc (invariant)"
})

export { EASE_EXTRA, EASE_MIRROR, FORMULA, spike, spikeStar, flareSpike, flareStar }

export { R, P, EASE, r3, strokePolyline, funnelSolid, funnelStrands, funnelEdge, starSquare, starSmooth, asterisk, frameOps, knobs }
