//  The X1 family. One master glyph - funnel, bar and star - defined once on its own
//  field and placed into any container. The solid tile and the framed mark carry the
//  same glyph at different scales, so the inner shape cannot drift between them the
//  way it did in round five, where the cut re-derived its own thinner bar.

import { R, funnelSolid, spikeStar, frameOps } from "./geom.mjs"

/**
 * Round four's X1, number for number.
 *
 * @remarks
 * These were picked by eye in round four's `solidCut`, not derived, so several have
 * no clean fraction. The float expressions are kept in round four's exact order so
 * the paths come out byte-identical, which the round six build asserts.
 */
const x1 = () => {
    const field = 48
    const bar = 11
    const half = bar / 2
    const reach = (field / 2) * 0.86

    return {
        id: "x1",
        field,
        bar,
        inflect: field / 2,
        x0: 0,
        x1: field,
        mouth: 0.96,
        ease: "expoOut",
        vLen: reach,
        vBase: half * 2.1,
        dLen: reach * 0.56,
        dBase: half * 1.5
    }
}

/**
 * X1 restated as rules on a 64-unit field.
 *
 * @remarks
 * Every number is a consequence of one rule rather than a pick:
 *
 * - `bar` is a quarter of the field. Centred, its edges land on 3/8 and 5/8, which
 *   are whole pixels at 16px. X1's 11/48 puts them a third of a pixel off.
 * - `tip` is the margin from a vertical spike's apex to the edge: one sixteenth,
 *   which is exactly one pixel at 16px.
 * - Every spike's base is as wide as the bar it grows from.
 * - Diagonals are the vertical spike scaled by `diag`, base included, so all six
 *   spikes are the same triangle and share one apex angle.
 * - `sliver` is the ink left above the mouth at the left edge, in field units.
 */
const canon = ({ field = 64, bar = field / 4, tip = field / 16, diag = 0.6, sliver = 1, id = "canon" } = {}) => {
    const vLen = field / 2 - tip

    return {
        id,
        field,
        bar,
        inflect: field / 2,
        x0: 0,
        x1: field,
        mouth: (field - 2 * sliver) / field,
        ease: "expoOut",
        vLen,
        vBase: bar,
        dLen: vLen * diag,
        dBase: bar * diag,
        rule: { tip, diag, sliver }
    }
}

/** Every derived position the construction sheets annotate, in glyph units. */
const measure = g => {
    const cy = g.field / 2
    const half = g.bar / 2
    const top = cy - (g.field * g.mouth) / 2

    return {
        cy,
        half,
        top,
        barTop: cy - half,
        barBottom: cy + half,
        drop: cy - half - top,
        tipY: cy - g.vLen,
        tipMargin: cy - g.vLen,
        vVisible: g.vLen - half,
        //  How far a diagonal's apex rises above the bar edge: the part you can see.
        dRise: g.dLen / Math.SQRT2 - half,
        apexV: (2 * Math.atan(g.vBase / 2 / g.vLen) * 180) / Math.PI,
        apexD: (2 * Math.atan(g.dBase / 2 / g.dLen) * 180) / Math.PI
    }
}

const flowPaths = g => [
    funnelSolid({
        width: g.field,
        height: g.field,
        throat: g.bar,
        inflect: g.inflect,
        ease: g.ease,
        mouth: g.mouth,
        x0: g.x0,
        x1: g.x1
    }),
    ...spikeStar({ cx: g.inflect, cy: g.field / 2, axis: g.vLen, diag: g.dLen, axisBase: g.vBase, diagBase: g.dBase })
]

/** The solid tile: field filled, glyph punched out. Round four called this the 16px cut. */
const tile = g => ({
    ops: [{ d: R(0, 0, g.field, g.field), on: true }, ...flowPaths(g).map(d => ({ d, on: false }))],
    w: g.field,
    h: g.field
})

/**
 * The same glyph floating inside a frame.
 *
 * @remarks
 * The glyph is scaled uniformly into the box left by the frame and the gap, so its
 * proportions are the tile's exactly. Polarity flips: the tile's voids become ink.
 */
const framed = (g, { field = 64, frame = 8, gap = 8 } = {}) => {
    const box = field - 2 * (frame + gap)
    const scale = box / g.field
    const at = frame + gap

    return {
        ops: [
            ...frameOps(field, field, frame),
            ...flowPaths(g).map(d => ({ d, on: true, t: `translate(${at} ${at}) scale(${scale})` }))
        ],
        w: field,
        h: field,
        place: { field, frame, gap, box, scale, at }
    }
}

export { x1, canon, measure, flowPaths, tile, framed }
