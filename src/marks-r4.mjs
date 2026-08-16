//  Round four. The thesis is fixed; this round is refinement.
//
//  Base is C11/C12: expo-out taper, floating inside a frame, throat centred at 50%.
//  Everything below varies exactly one thing against that base.

import {
    R, P, EASE, FORMULA, funnelSolid, starSquare, starSmooth, asterisk, spikeStar, flareStar, frameOps
} from "./geom.mjs"

const F = 48

const paint = ds => (Array.isArray(ds) ? ds : [ds]).map(d => ({ d, on: true }))

const BASE = {
    ease: "expoOut",
    frame: 5,
    throat: 8,
    inflect: 0.5,
    mouth: 0.78,
    attach: "float",
    star: "kortex",
    starReach: 0.6,
    padX: 3
}

/**
 * Builds one converge mark.
 *
 * @remarks
 * `attach` decides how the flow meets the container. "float" keeps a void margin
 * all round, which is what stops the eye promoting the background to figure.
 * "left" lets only the intake meet the wall. "both" removes the margin entirely,
 * which is the Kortex arrangement.
 */
const build = (over = {}) => {
    const o = { ...BASE, ...over }
    const win = F - o.frame * 2
    const cy = win / 2
    const xi = win * o.inflect

    const attach = {
        float: { x0: o.padX, x1: win - o.padX, mouth: o.mouth },
        left: { x0: 0, x1: win - o.padX, mouth: 1 },
        both: { x0: 0, x1: win, mouth: 1 }
    }[o.attach]

    const flow = paint(
        funnelSolid({ width: win, height: win, throat: o.throat, inflect: xi, ease: o.ease, ...attach })
    )

    const half = o.throat / 2
    const reach = cy * o.starReach
    const tip = starOps(o.star, { cx: xi, cy, half, reach, win })

    const ops = [...frameOps(F, F, o.frame), ...[...flow, ...tip].map(op => ({ ...op, t: `translate(${o.frame} ${o.frame})` }))]

    return { ops, meta: o }
}

const starOps = (kind, { cx, cy, half, reach, win }) => {
    if (!kind) return []

    if (kind === "axis4") return paint(starSquare(cx, cy, reach))

    if (kind === "kortex")
        return paint(spikeStar({ cx, cy, axis: reach, diag: reach * 0.56, axisBase: half * 2.1, diagBase: half * 1.5 }))

    if (kind === "kortex-tight")
        return paint(spikeStar({ cx, cy, axis: reach, diag: reach * 0.44, axisBase: half * 1.5, diagBase: half * 1.05 }))

    if (kind === "kortex-even")
        return paint(spikeStar({ cx, cy, axis: reach, diag: reach * 0.82, axisBase: half * 1.8, diagBase: half * 1.5 }))

    if (kind === "diagonals")
        return paint(spikeStar({ cx, cy, axis: reach, diag: reach * 0.6, axisBase: half * 2, diagBase: half * 1.5, diagonalsOnly: true }))

    if (kind === "flare") return paint(flareStar({ cx, cy, half, reach, spread: reach * 0.62 }))

    if (kind === "flare-wide") return paint(flareStar({ cx, cy, half, reach, spread: reach * 0.95, ease: 0.3 }))

    if (kind === "flare-kortex")
        return [
            ...paint(flareStar({ cx, cy, half, reach, spread: reach * 0.62 })),
            ...paint(spikeStar({ cx, cy, axis: 0, diag: reach * 0.56, axisBase: 0, diagBase: half * 1.4, diagonalsOnly: true }))
        ]

    if (kind === "smooth") return paint(starSmooth(cx, cy, reach))

    //  Rotation 0 puts one arm on the horizontal, so it fuses with the output bar.
    if (kind === "asterisk-h") return paint(asterisk(cx, cy, reach * 0.72, half * 1.15, 6, 0))

    if (kind === "asterisk-v") return paint(asterisk(cx, cy, reach * 0.72, half * 1.15, 6, 90))

    if (kind === "asterisk-8") return paint(asterisk(cx, cy, reach * 0.72, half * 1.05, 8, 0))

    return []
}

//  --------------------------------------------------------------- oscilloscope

//  Sidebar is a solid strip with two or three small square voids: a period, not a knob.
const scope = ({ strip = 6, dots = 3, dot = 1.5, ...over } = {}) => {
    const o = { ...BASE, ...over }
    const w = F + strip
    const win = F - o.frame * 2
    const inner = build(o)

    const ops = [
        ...frameOps(w, F, o.frame),
        { d: R(F - o.frame, o.frame, o.frame, F - o.frame * 2), on: true },
        ...inner.ops.filter((_, i) => i > 1)
    ]

    const usable = F - o.frame * 2
    const gap = usable / (dots + 1)

    for (let k = 0; k < dots; k++)
        ops.push({ d: R(F + strip / 2 - dot / 2, o.frame + gap * (k + 1) - dot / 2, dot, dot), on: false })

    return { ops, w, h: F }
}

//  --------------------------------------------------------------- small sizes

//  The 16px derivative: no container, negative space filled, flow punched out.
const solidCut = ({ throat = 11, ease = "expoOut", star = "kortex", starReach = 0.86, inflect = 0.5 } = {}) => {
    const cy = F / 2
    const xi = F * inflect

    const flow = paint(funnelSolid({ width: F, height: F, throat, inflect: xi, ease, mouth: 0.96, x0: 0, x1: F }))
    const tip = starOps(star, { cx: xi, cy, half: throat / 2, reach: cy * starReach, win: F })

    return [{ d: R(0, 0, F, F), on: true }, ...[...flow, ...tip].map(op => ({ ...op, on: false }))]
}

const mark = (id, label, means, built) =>
    Array.isArray(built) ? { id, label, means, ops: built, w: F, h: F } : { id, label, means, ops: built.ops, w: built.w ?? F, h: built.h ?? F }

const STAR_KINDS = [
    ["axis4", "S1. Axis four", "round three's star: the two thorns you called out"],
    ["kortex", "S2. Kortex spikes", "long vertical, four diagonals at 45, straight edges"],
    ["kortex-tight", "S3. Kortex / tight", "narrower bases, sharper read"],
    ["kortex-even", "S4. Kortex / even", "diagonals nearly as long as the vertical"],
    ["diagonals", "S5. Diagonals only", "no vertical spike at all"],
    ["flare", "S6. Flare", "tangent to the bar: zero kink at the joint"],
    ["flare-wide", "S7. Flare / wide", "longer tangent run along the bar"],
    ["flare-kortex", "S8. Flare + diagonals", "smooth vertical, brutal diagonals"],
    ["smooth", "S9. Smooth sparkle", "round three's C18 star, for comparison"],
    ["asterisk-h", "S10. Asterisk / arm on bar", "rotated so one stroke fuses with the output"],
    ["asterisk-v", "S11. Asterisk / arm vertical", "unrotated, for comparison"],
    ["asterisk-8", "S12. Asterisk / eight arms", "45 degree intervals, arm on the bar"]
]

const EASE_KINDS = [
    "expoOut", "quartOut", "cubicOut", "quadOut", "arc", "linear",
    "expoIn", "quartIn", "cubicIn", "circIn"
]

const marks = [
    ...STAR_KINDS.map(([kind, label, means]) => mark(`s-${kind}`, label, means, build({ star: kind }))),

    ...EASE_KINDS.map(ease =>
        mark(`e-${ease}`, `E. ${ease}`, `${FORMULA[ease] ?? ease}${ease.endsWith("In") ? " -- the 45 deg mirror of its Out twin" : ""}`, build({ ease }))
    ),

    ...[3, 4, 5, 6, 8].map(t =>
        mark(`f-${t}`, `F. Frame ${t}`, `${((t / F) * 100).toFixed(1)}% of the field`, build({ frame: t }))
    ),

    ...["float", "left", "both"].map(a =>
        mark(
            `a-${a}`,
            `A. Attach ${a}`,
            { float: "void margin all round", left: "intake meets the wall, output does not", both: "no margin: the Kortex arrangement" }[a],
            build({ attach: a })
        )
    ),

    ...[6, 8, 10, 12].map(t =>
        mark(`b-${t}`, `B. Bar ${t}`, `output ${((t / F) * 100).toFixed(1)}% of the field`, build({ throat: t }))
    ),

    ...[0.42, 0.5, 0.58, 0.66].map(i =>
        mark(`p-${String(Math.round(i * 100))}`, `P. Inflection ${Math.round(i * 100)}%`, `throat and star at ${Math.round(i * 100)}% across`, build({ inflect: i }))
    ),

    ...[0.45, 0.6, 0.75, 0.9].map(r =>
        mark(`r-${String(Math.round(r * 100))}`, `R. Star reach ${Math.round(r * 100)}%`, `spike tip at ${Math.round(r * 100)}% of the half height`, build({ starReach: r }))
    ),

    mark("o1-scope-3", "O1. Scope / three dots", "solid strip, three square voids", scope({ dots: 3, dot: 1.5 })),
    mark("o2-scope-2", "O2. Scope / two dots", "two voids, wider spacing", scope({ dots: 2, dot: 2 })),
    mark("o3-scope-wide", "O3. Scope / wide strip", "8-unit strip, three voids", scope({ strip: 8, dots: 3, dot: 2 })),
    mark("o4-scope-flare", "O4. Scope / flare star", "the tangent star on the screen", scope({ dots: 3, dot: 1.5, star: "flare-kortex" })),
    mark("o5-scope-asterisk", "O5. Scope / asterisk", "arm fused to the output bar", scope({ dots: 3, dot: 1.5, star: "asterisk-h" })),
    mark("o6-scope-heavy", "O6. Scope / heavy frame", "frame 6, bar 10", scope({ frame: 6, throat: 10, dots: 3, dot: 2 })),

    mark("x1-cut-kortex", "X1. 16px cut / kortex", "no container, negative space filled", solidCut({ star: "kortex" })),
    mark("x2-cut-flare", "X2. 16px cut / flare", "same, tangent star", solidCut({ star: "flare" })),
    mark("x3-cut-plain", "X3. 16px cut / plain", "no star at all", solidCut({ star: null })),
    mark("x4-cut-heavy", "X4. 16px cut / heavy bar", "throat 14", solidCut({ throat: 14 }))
]

const FAMILIES = [
    { key: "s", title: "S / Inflection point", blurb: "Twelve stars against one base. Straight Kortex spikes, tangent flares that leave the bar at zero degrees, and the asterisk rotated so a stroke fuses with the output." },
    { key: "e", title: "E / Easing", blurb: "Six Out curves with their formulas, then four In curves. Reflecting an Out easing about the 45 degree line yields its In twin, so these four are the mirrors you asked about." },
    { key: "f", title: "F / Frame weight", blurb: "Border thickness as a fraction of the field, from 6.3% to 16.7%." },
    { key: "a", title: "A / Attachment", blurb: "Whether the flow floats inside the container, meets only the left wall, or fills it edge to edge with no margin." },
    { key: "b", title: "B / Bar weight", blurb: "Output thickness swept against a fixed frame." },
    { key: "p", title: "P / Inflection position", blurb: "Where the throat and star sit across the window." },
    { key: "r", title: "R / Star reach", blurb: "Spike length as a fraction of the window half height." },
    { key: "o", title: "O / Oscilloscope", blurb: "The instrument reading: a narrow solid strip with two or three small square voids instead of knobs, and the screen vertically centred." },
    { key: "x", title: "X / Small-size cut", blurb: "The 16px derivative: container removed, negative space filled, flow punched out." }
]

marks.forEach(m => {
    m.family = m.id.split("-")[0].replace(/[0-9]+$/, "")
})

export { marks, FAMILIES, build, scope, solidCut, BASE, F, EASE, FORMULA }
