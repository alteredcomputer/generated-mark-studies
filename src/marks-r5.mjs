//  Round five. The thesis and most parameters are locked; this round settles the
//  inflection point, the exact mirror question, and the finalist trio.
//
//  CANONICAL GRID -- 48 units, every dimension a simple fraction of the field:
//
//    field        48        1
//    frame         6        1/8      locked: frame and bar carry the same stroke
//    bar (throat)  6        1/8
//    window       36        3/4      = 48 - 2*6
//    gap           3        1/16     void margin between flow and frame
//    inflection   18        window/2 centred, per the lock
//    mouth        27        window*3/4
//    star reach   10.8      0.6 * window/2
//
//  Only 45 and 90 degree angles appear outside the taper, and the taper is a
//  sampled expo-out curve offset along its own normals so the channel holds a
//  constant perpendicular weight.

import { R, P, EASE, FORMULA, funnelSolid, spikeStar, flareStar, starSquare, frameOps } from "./geom.mjs"

const F = 48

const CANON = {
    field: F,
    frame: 6,
    bar: 6,
    gap: 3,
    inflect: 0.5,
    mouthRatio: 0.75,
    ease: "expoOut",
    reach: 0.6,
    diagRatio: 0.78,
    diagBase: 1.0,
    axisBase: 1.6,
    attach: "float",
    star: "kortex",
    //  One unit of overlap into the frame when attached, so abutting fills do not
    //  leave an antialiasing seam where the two paths meet.
    bleed: 1
}

const paint = ds => (Array.isArray(ds) ? ds : [ds]).map(d => ({ d, on: true }))

const geometry = (o) => {
    const win = o.field - o.frame * 2
    const cy = win / 2
    const xi = win * o.inflect
    const half = o.bar / 2
    const reach = cy * o.reach

    const edges = {
        float: { x0: o.gap, x1: win - o.gap, mouth: o.mouthRatio },
        left: { x0: -o.bleed, x1: win - o.gap, mouth: 1 },
        both: { x0: -o.bleed, x1: win + o.bleed, mouth: 1 }
    }[o.attach]

    return { win, cy, xi, half, reach, edges }
}

const starOps = (o, g) => {
    if (!o.star) return []

    if (o.star === "kortex")
        return paint(
            spikeStar({
                cx: g.xi,
                cy: g.cy,
                axis: g.reach,
                diag: g.reach * o.diagRatio,
                axisBase: g.half * o.axisBase,
                diagBase: g.half * o.diagBase
            })
        )

    if (o.star === "axis4") return paint(starSquare(g.xi, g.cy, g.reach))

    if (o.star === "flare") return paint(flareStar({ cx: g.xi, cy: g.cy, half: g.half, reach: g.reach, spread: g.reach * 0.62 }))

    return []
}

const flowOps = (o, g) =>
    paint(funnelSolid({ width: g.win, height: g.win, throat: o.bar, inflect: g.xi, ease: o.ease, ...g.edges }))

/** Framed mark on the canonical grid. */
const build = (over = {}) => {
    const o = { ...CANON, ...over }
    const g = geometry(o)
    const body = [...flowOps(o, g), ...starOps(o, g)]

    return {
        ops: [...frameOps(o.field, o.field, o.frame), ...body.map(op => ({ ...op, t: `translate(${o.frame} ${o.frame})` }))],
        w: o.field,
        h: o.field,
        meta: o
    }
}

/**
 * The small-size derivative of a given framed mark.
 *
 * @remarks
 * Container removed, tile filled, flow punched out. Geometry is re-derived at
 * full field rather than scaled up, so the bar keeps the same absolute weight
 * as its framed parent instead of growing with the container.
 */
const cut = (over = {}) => {
    const o = { ...CANON, ...over, frame: 0 }
    const g = geometry({ ...o, frame: 0 })
    const solid = { ...o, field: o.field }
    const gg = { ...g, win: o.field, cy: o.field / 2, xi: o.field * o.inflect, reach: (o.field / 2) * o.reach }

    const body = [
        ...paint(
            funnelSolid({
                width: o.field,
                height: o.field,
                throat: o.bar,
                inflect: gg.xi,
                ease: o.ease,
                mouth: 1,
                x0: 0,
                x1: o.field
            })
        ),
        ...starOps(solid, gg)
    ]

    return { ops: [{ d: R(0, 0, o.field, o.field), on: true }, ...body.map(op => ({ ...op, on: false }))], w: o.field, h: o.field, meta: o }
}

//  --------------------------------------------------------------- finalists

const FINALISTS = {
    b6: { label: "B6", frame: 6, bar: 6, reach: 0.6, note: "frame and bar both 1/8 of the field" },
    b5: { label: "B5", frame: 5, bar: 5, reach: 0.6, note: "same at 5 units, 10.4% each" },
    r75: { label: "R75", frame: 5, bar: 8, reach: 0.75, note: "round four as-is: bar heavier than frame" },
    heavy: { label: "HEAVY", frame: 8, bar: 8, reach: 0.65, note: "uniform and heavy, R75's mass with B6's logic" }
}

const mark = (id, label, means, built) => ({ id, label, means, ops: built.ops, w: built.w, h: built.h, meta: built.meta })

const finalistMarks = Object.entries(FINALISTS).flatMap(([key, cfg]) => [
    mark(`n-${key}-float`, `${cfg.label} / float`, cfg.note, build(cfg)),
    mark(`n-${key}-both`, `${cfg.label} / attach both`, "no margin, seam-free via 1-unit bleed", build({ ...cfg, attach: "both" })),
    mark(`n-${key}-cut`, `${cfg.label} / small-size cut`, "container removed, flow punched out", cut(cfg))
])

//  --------------------------------------------------------------- star sweep

const STAR_SWEEP = []

for (const diagRatio of [0.6, 0.78, 0.95])
    for (const diagBase of [0.7, 1.0, 1.35])
        STAR_SWEEP.push(
            mark(
                `k-${String(diagRatio).replace(".", "")}-${String(diagBase).replace(".", "")}`,
                `K. diag ${diagRatio} / base ${diagBase}`,
                `diagonal ${Math.round(diagRatio * 100)}% of the vertical, base ${diagBase}x the bar half`,
                build({ diagRatio, diagBase })
            )
        )

STAR_SWEEP.push(mark("k-none", "K. No star", "the control: pure funnel", build({ star: null })))
STAR_SWEEP.push(mark("k-axis4", "K. Axis four", "round four's S1, for reference", build({ star: "axis4" })))
STAR_SWEEP.push(mark("k-long", "K. Long diagonals", "diagonals at 110% of the vertical", build({ diagRatio: 1.1, diagBase: 0.85 })))

//  --------------------------------------------------------------- mirror study

const MIRROR_PAIRS = [
    ["expoOut", "expoOutM"],
    ["quartOut", "quartOutM"],
    ["cubicOut", "cubicOutM"],
    ["arc", "arcM"]
]

const mirrorMarks = MIRROR_PAIRS.flatMap(([a, b]) => [
    mark(`m-${a}`, `M. ${a}`, FORMULA[a], build({ ease: a })),
    mark(`m-${b}`, `M. ${a} mirrored`, `${FORMULA[b]} -- reflected about the top-left to bottom-right diagonal`, build({ ease: b }))
])

const marks = [...finalistMarks, ...STAR_SWEEP, ...mirrorMarks]

marks.forEach(m => {
    m.family = m.id.split("-")[0]
})

const FAMILIES = [
    { key: "n", title: "N / Finalists", blurb: "B6, B5, R75 and a uniform heavy cut, each floating, each attached edge to edge, each with its small-size derivative." },
    { key: "k", title: "K / Inflection sweep", blurb: "Diagonal spike length against base width. The round four stars failed because the diagonals were too stubby to read at all." },
    { key: "m", title: "M / Mirror", blurb: "Each easing beside its true reflection about the top-left to bottom-right diagonal. Concavity and direction preserved, as intended." }
]

export { marks, FAMILIES, build, cut, CANON, FINALISTS, geometry, F }
