//  Round three. One thesis: ALTERED is the convergence of a widened mind back into
//  clarity. Wide, many, uneven on the left. A transformation at the inflection.
//  One clean line out. The Kortex structure, horizontally reversed and brutalised.

import { R, P, strokePolyline, funnelSolid, funnelStrands, starSquare, starSmooth, asterisk, frameOps, knobs } from "./geom.mjs"

const F = 48
const FRAME = 5
const WIN = F - FRAME * 2

//  Everything inside the frame is authored in window coordinates and pushed into place.
const inside = (ops, dx = FRAME, dy = FRAME) => ops.map(o => ({ ...o, t: `translate(${dx} ${dy})` }))

const paint = ds => (Array.isArray(ds) ? ds : [ds]).map(d => ({ d, on: true }))

const inflection = (kind, cx, cy, r, gauge) => {
    if (kind === "square") return paint(starSquare(cx, cy, r))
    if (kind === "smooth") return paint(starSmooth(cx, cy, r))
    if (kind === "sharp") return paint(starSmooth(cx, cy, r, 0.1))
    if (kind === "asterisk") return paint(asterisk(cx, cy, r, gauge, 6, 90))
    if (kind === "asterisk-rot") return paint(asterisk(cx, cy, r, gauge, 6, 0))
    if (kind === "cross") return paint(asterisk(cx, cy, r, gauge, 4, 45))

    return []
}

/**
 * The core generator.
 *
 * @remarks
 * `inflect` is the fraction of the window at which the taper finishes and the
 * single clean output begins. `star` sits on that same point, so the mark always
 * reads left to right as: many, transformed, one.
 */
const converge = ({
    ease = "expoOut",
    inflect = 0.58,
    throat = 6,
    mode = "solid",
    strands = 3,
    gauge = 3,
    star = "square",
    starScale = 0.44,
    frame = FRAME,
    cut = false,
    mouth = 0.7,
    x0 = 3,
    x1 = WIN - 3
} = {}) => {
    const xi = WIN * inflect
    const cy = WIN / 2
    const r = (WIN / 2) * starScale
    const shared = { width: WIN, height: WIN, throat, inflect: xi, ease, mouth, x0, x1 }

    const flow =
        mode === "solid"
            ? paint(funnelSolid(shared))
            : paint(funnelStrands({ ...shared, count: strands, gauge }))

    const tip = inflection(star, xi, cy, r, Math.max(gauge, throat * 0.7))
    const body = [...flow, ...tip]

    //  Cut keeps the tile solid and punches the flow out, so the frame's window
    //  is never subtracted first. Otherwise the void has nothing left to remove.
    if (cut) return [{ d: R(0, 0, F, F), on: true }, ...inside(body.map(o => ({ ...o, on: false })), frame || FRAME, frame || FRAME)]

    return frame ? [...frameOps(F, F, frame), ...inside(body, frame, frame)] : inside(body, 0, 0)
}

//  --------------------------------------------------------------- CRT chrome

const crt = ({ side = "right", strip = 16, round = false, ...rest } = {}) => {
    const w = side === "right" ? F + strip : F
    const h = side === "bottom" ? F + strip : F
    const screen = converge({ ...rest, frame: 0 })

    const ops = [
        ...frameOps(w, h, FRAME),
        side === "right"
            ? { d: R(F - FRAME, FRAME, FRAME, h - FRAME * 2), on: true }
            : { d: R(FRAME, F - FRAME, w - FRAME * 2, FRAME), on: true },
        ...screen,
        ...(side === "right"
            ? knobs(F, FRAME, strip, h - FRAME * 2, 2, round)
            : knobs(FRAME, F, w - FRAME * 2, strip, 2, round).map(o => ({ ...o, d: o.d })))
    ]

    return { ops, w, h }
}

//  Bottom chrome needs the knobs laid along x rather than y, so build it explicitly.
const crtBottom = ({ strip = 16, round = false, ...rest } = {}) => {
    const h = F + strip
    const ops = [
        ...frameOps(F, h, FRAME),
        { d: R(FRAME, F - FRAME, F - FRAME * 2, FRAME), on: true },
        ...converge({ ...rest, frame: 0 })
    ]

    const usable = F - FRAME * 2
    const s = Math.min(strip * 0.3, usable * 0.11)

    ;[0.3, 0.7].forEach(f => {
        const cx = FRAME + usable * f
        const cy = F + (strip - FRAME) / 2

        ops.push(
            round
                ? { d: `M${cx - s} ${cy}a${s} ${s} 0 1 0 ${s * 2} 0a${s} ${s} 0 1 0 ${-s * 2} 0Z`, on: true }
                : { d: R(cx - s, cy - s, s * 2, s * 2), on: true }
        )
    })

    return { ops, w: F, h }
}

//  --------------------------------------------------------------- tunnel

//  Nested rectangles receding toward one vanishing point, joined by rays.
//  Depth as convergence: the altered state, drawn with hard perspective.
const tunnel = ({ rings = 4, vx = 0.62, vy = 0.5, ratio = 0.56, rays = true, gauge = 3 } = {}) => {
    const ops = []
    const px = WIN * vx
    const py = WIN * vy
    const corners = []

    for (let i = 0; i < rings; i++) {
        const k = ratio ** i
        const w = WIN * k
        const h = WIN * k
        const x = px - (px - 0) * k
        const y = py - (py - 0) * k

        corners.push([
            [x, y], [x + w, y], [x + w, y + h], [x, y + h]
        ])

        ops.push({ d: R(x, y, w, h), on: true })
        ops.push({ d: R(x + gauge, y + gauge, w - gauge * 2, h - gauge * 2), on: false })
    }

    if (rays)
        for (let c = 0; c < 4; c++)
            ops.push({ d: strokePolyline([corners[0][c], corners[rings - 1][c]], gauge * 0.8), on: true })

    return [...frameOps(F, F, FRAME), ...inside(ops)]
}

//  --------------------------------------------------------------- grain

//  The dither, rebuilt to the note: bigger cells, a vertical period of 2 or 3 rows,
//  and symmetric about the centre line rather than tapering like a flag.
const grain = ({ cols = 5, rows = 6, period = 3, frame = FRAME } = {}) => {
    const cw = WIN / cols
    const ch = WIN / rows
    const ops = []

    for (let cx = 0; cx < cols; cx++) {
        //  Duty cycle rises column by column and is quantised to the period, so the
        //  ramp has exactly `period + 1` states rather than a smear of thresholds.
        const level = Math.round(((cx + 1) / cols) * period)

        for (let ry = 0; ry < rows; ry++) {
            //  Mirrored index makes the pattern symmetric about the centre line.
            const mirrored = Math.min(ry, rows - 1 - ry)

            //  Phase-shift per column so the ramp reads as grain rather than nested bands.
            if ((mirrored + cx) % period < level) ops.push({ d: R(cx * cw - 0.06, ry * ch - 0.06, cw + 0.12, ch + 0.12), on: true })
        }
    }

    return frame ? [...frameOps(F, F, frame), ...inside(ops)] : inside(ops)
}

const mark = (id, label, means, ops, w = F, h = F) => ({ id, label, means, ops, w, h })

const crtMark = (id, label, means, built) => ({ id, label, means, ops: built.ops, w: built.w, h: built.h })

const marks = [
    //  C -- the thesis, swept across easing, inflection and inflection-point shape.
    mark("c1-expo-square", "C1. Expo / square star", "wide mind, one transformation, one clear line", converge({ ease: "expoOut", star: "square" })),
    mark("c2-expo-smooth", "C2. Expo / smooth star", "the same, with a drawn sparkle at the throat", converge({ ease: "expoOut", star: "smooth" })),
    mark("c3-expo-sharp", "C3. Expo / sharp star", "needle sparkle, pull 0.10", converge({ ease: "expoOut", star: "sharp" })),
    mark("c4-expo-asterisk", "C4. Expo / asterisk", "the wildcard as the moment of change", converge({ ease: "expoOut", star: "asterisk" })),
    mark("c5-expo-asterisk-rot", "C5. Expo / asterisk turned", "same glyph, rotated onto the axis", converge({ ease: "expoOut", star: "asterisk-rot" })),
    mark("c6-linear", "C6. Linear taper", "no curve at all: a straight funnel", converge({ ease: "linear", star: "square" })),
    mark("c7-circ", "C7. Circular taper", "the fullest shoulder of the four easings", converge({ ease: "circOut", star: "square" })),
    mark("c8-quart", "C8. Quartic taper", "between linear and expo", converge({ ease: "quartOut", star: "square" })),
    mark("c9-strands-3", "C9. Three strands", "discrete inputs rather than one mass", converge({ mode: "strands", strands: 3, gauge: 3.4, ease: "expoOut", star: "square" })),
    mark("c10-strands-5", "C10. Five strands", "more inputs, same throat", converge({ mode: "strands", strands: 5, gauge: 2.6, ease: "expoOut", star: "square", starScale: 0.4 })),
    mark("c11-nostar", "C11. No inflection", "control: the funnel alone", converge({ ease: "expoOut", star: null })),
    mark("c12-line-star", "C12. Line and star", "no taper: one line, one transformation", converge({ ease: "expoOut", star: "square", throat: 6, inflect: 0.5, mode: "solid", starScale: 0.5, ...{} })),
    mark("c13-cut", "C13. Inverted", "the whole flow punched out of a solid tile", converge({ ease: "expoOut", star: "square", cut: true })),
    mark("c14-late", "C14. Late inflection", "throat at 72% instead of 58%", converge({ ease: "expoOut", star: "square", inflect: 0.72 })),
    mark("c15-thick", "C15. Heavy output", "throat 9, star scaled with it", converge({ ease: "expoOut", star: "square", throat: 9, starScale: 0.52 })),
    mark("c16-nude", "C16. Unframed", "the flow with no container at all", converge({ ease: "expoOut", star: "square", frame: 0 })),

    //  Bold cut: fewer, heavier elements so the mark still resolves at avatar size.
    mark("c17-bold", "C17. Bold", "heavier throat and a star you can actually see", converge({ ease: "cubicOut", star: "square", throat: 9, starScale: 0.66, mouth: 0.86, inflect: 0.54, x0: 2, x1: WIN - 2 })),
    mark("c18-bold-smooth", "C18. Bold / smooth star", "the same weight with a drawn sparkle", converge({ ease: "cubicOut", star: "smooth", throat: 9, starScale: 0.66, mouth: 0.86, inflect: 0.54, x0: 2, x1: WIN - 2 })),
    mark("c19-bold-nude", "C19. Bold / unframed", "no container, so the flow can fill the tile", converge({ ease: "cubicOut", star: "square", throat: 11, starScale: 0.62, mouth: 0.92, inflect: 0.54, frame: 0, x0: 1, x1: WIN + FRAME * 2 - 1 })),
    mark("c20-bold-cut", "C20. Bold / inverted", "solid tile, flow punched out", converge({ ease: "cubicOut", star: "square", throat: 9, starScale: 0.66, mouth: 0.86, inflect: 0.54, cut: true })),
    mark("c21-bold-strands", "C21. Bold / strands", "three heavy channels instead of one mass", converge({ mode: "strands", strands: 3, gauge: 5, ease: "cubicOut", star: "square", throat: 15, starScale: 0.6, mouth: 0.9, inflect: 0.54 })),
    mark("c22-bold-asterisk", "C22. Bold / asterisk", "wildcard at the throat, at weight", converge({ ease: "cubicOut", star: "asterisk", throat: 9, starScale: 0.7, mouth: 0.86, inflect: 0.54 })),

    //  V -- the CRT reading: the same screen, given controls.
    crtMark("v1-crt-right-square", "V1. CRT / square knobs", "a machine that processes, not a picture of one", crt({ side: "right", round: false, ease: "expoOut", star: "square" })),
    crtMark("v2-crt-right-round", "V2. CRT / round knobs", "same chassis, dial controls", crt({ side: "right", round: true, ease: "expoOut", star: "square" })),
    crtMark("v3-crt-asterisk", "V3. CRT / asterisk", "wildcard on the screen", crt({ side: "right", round: false, ease: "expoOut", star: "asterisk" })),
    crtMark("v4-crt-bottom", "V4. CRT / bottom controls", "controls below the screen", crtBottom({ round: false, ease: "expoOut", star: "square" })),
    crtMark("v5-crt-wide", "V5. CRT / wide", "the cinematic ratio you liked, with a control strip", crt({ side: "right", strip: 30, round: true, ease: "expoOut", star: "square" })),

    //  U -- depth as convergence. The altered state, drawn as hard perspective.
    mark("u1-tunnel", "U1. Tunnel", "one-point perspective: everything recedes to one point", tunnel({ rings: 4, rays: false })),
    mark("u2-tunnel-rays", "U2. Tunnel / rays", "the corners joined, so the recession is explicit", tunnel({ rings: 4, rays: true })),
    mark("u3-tunnel-centre", "U3. Tunnel / centred", "symmetric recession", tunnel({ rings: 4, vx: 0.5, rays: true })),
    mark("u4-tunnel-deep", "U4. Tunnel / deep", "five rings, tighter ratio", tunnel({ rings: 5, ratio: 0.62, rays: true })),

    //  G -- the grain, rebuilt to the note.
    mark("g1-grain-5", "G1. Grain / 5 columns", "3-row period, symmetric about the centre line", grain({ cols: 5, rows: 9, period: 3 })),
    mark("g2-grain-4", "G2. Grain / 4 columns", "coarser still, 3-row period", grain({ cols: 4, rows: 8, period: 4 })),
    mark("g3-grain-6", "G3. Grain / 6 columns", "finer, 2-row period", grain({ cols: 6, rows: 12, period: 3 })),
    mark("g4-grain-nude", "G4. Grain / unframed", "no container", grain({ cols: 6, rows: 9, period: 3, frame: 0 }))
]

const FAMILIES = [
    {
        key: "c",
        title: "C / Converge",
        blurb: "The thesis. Kortex reversed: wide and many on the left, a transformation at the inflection, one clean line out. Swept across four easings, two flow modes and five inflection glyphs."
    },
    { key: "v", title: "V / CRT", blurb: "The same screen given a chassis and controls, so the mark reads as a machine that does something rather than a shape." },
    { key: "u", title: "U / Tunnel", blurb: "Convergence as depth. One-point perspective is the hardest, most ordered way to draw an altered state." },
    { key: "g", title: "G / Grain", blurb: "The dither rebuilt to your note: bigger cells, a vertical period of 2 or 3 rows, symmetric about the centre rather than tapering like a flag." }
]

const familyOf = id => id.split("-")[0].replace(/[0-9]+$/, "")

marks.forEach(m => {
    m.family = familyOf(m.id)
})

export { marks, FAMILIES, converge, tunnel, grain, F, FRAME, WIN }
