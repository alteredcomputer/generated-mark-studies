//  ALTERED mark studies. All geometry authored on a 24-unit field, stroke = 6 (1:4).
//  Every op is painted into a luminance mask in order: on -> reveal ink, off -> cut void.

const R = (x, y, w, h) => `M${x} ${y}H${x + w}V${y + h}H${x}Z`

const P = pts => `M${pts.map(([x, y]) => `${x} ${y}`).join("L")}Z`

const BAYER = [
    [0, 8, 2, 10],
    [12, 4, 14, 6],
    [3, 11, 1, 9],
    [15, 7, 13, 5]
]

//  Cells bleed by a hair so adjacent blocks fuse instead of showing rasteriser seams.
const cell = (x, y, unit) => R(x - 0.04, y - 0.04, unit + 0.08, unit + 0.08)

const ditherCells = (cells, unit) => {
    const ops = []

    for (let cx = 0; cx < cells; cx++) {
        const threshold = ((cx + 1) / cells) * 16

        for (let cy = 0; cy < cells; cy++) {
            if (BAYER[cy % 4][cx % 4] < threshold) ops.push({ d: cell(cx * unit, cy * unit, unit), on: true })
        }
    }

    return ops
}

const coarseRamp = (() => {
    const columns = [[1], [0, 2], [0, 1, 3], [0, 1, 2, 3]]

    return columns.flatMap((rows, cx) => rows.map(ry => ({ d: cell(cx * 6, ry * 6, 6), on: true })))
})()

const full = R(0, 0, 24, 24)

const STEP = P([[0, 12], [9, 12], [9, 6], [24, 6], [24, 12], [15, 12], [15, 18], [0, 18]])
const STEP_INSET = P([[4, 12], [9, 12], [9, 6], [20, 6], [20, 12], [15, 12], [15, 18], [4, 18]])
const RAMP = P([[0, 15], [6, 15], [18, 3], [24, 3], [24, 9], [18, 9], [6, 21], [0, 21]])
const RAMP_THIN = P([[0, 16], [6, 16], [17, 5], [24, 5], [24, 8], [17, 8], [6, 19], [0, 19]])
const WEDGE_INSET = P([[3, 3], [9, 9], [18, 9], [18, 15], [9, 15], [3, 21]])
//  A 6-unit channel laid on the anti-diagonal. Splits the field into two congruent triangles.
const DIAGONAL = P([[0, 21], [21, 0], [24, 0], [24, 3], [3, 24], [0, 24]])
const WEDGE = P([[0, 3], [6, 9], [24, 9], [24, 15], [6, 15], [0, 21]])
const WEDGE_CLOSED = P([[0, 3], [6, 9], [18, 9], [18, 15], [6, 15], [0, 21]])
const WEDGE_DOWN = P([[3, 0], [9, 6], [9, 24], [15, 24], [15, 6], [21, 0]])
const R_STEM = R(12, 6, 6, 18)
const R_ARM = P([[6, 6], [18, 6], [18, 12], [9, 12], [6, 9]])

const marks = [
    //  Family 1: a solid field split by a stepped seam. The largest family, and the
    //  one that inherits the branching intent of the option glyph.
    { id: "a-deviation", label: "A. Deviation", note: "one bar, one step up", family: "seam", ops: [{ d: STEP, on: true }] },
    {
        id: "a2-deviation-void",
        label: "A2. Deviation / slot",
        note: "inset void, 77% ink, square silhouette",
        family: "seam",
        ops: [{ d: full, on: true }, { d: STEP_INSET, on: false }]
    },
    {
        id: "a4-deviation-cut",
        label: "A4. Deviation / cut",
        note: "seam runs edge to edge, two blocks",
        family: "seam",
        ops: [{ d: full, on: true }, { d: STEP, on: false }]
    },
    { id: "a5-ramp", label: "A5. Ramp", note: "45 deg rise instead of a step", family: "seam", ops: [{ d: RAMP, on: true }] },
    {
        id: "a6-ramp-cut",
        label: "A6. Ramp / cut",
        note: "the 45 deg seam, cut from a solid tile",
        family: "seam",
        ops: [{ d: full, on: true }, { d: RAMP, on: false }]
    },
    {
        id: "a7-ramp-hairline",
        label: "A7. Ramp / hairline",
        note: "3-unit channel, 91% ink",
        family: "seam",
        ops: [{ d: full, on: true }, { d: RAMP_THIN, on: false }]
    },
    {
        id: "a8-diagonal",
        label: "A8. Ramp / pure diagonal",
        note: "no flats, two congruent triangles",
        family: "seam",
        ops: [{ d: full, on: true }, { d: DIAGONAL, on: false }]
    },
    {
        id: "c-interlock",
        label: "C. Interlock / double",
        note: "two jogs, exact halves, 180 deg",
        family: "seam",
        ops: [
            {
                d: P([[0, 0], [12, 0], [12, 6], [18, 6], [18, 12], [6, 12], [6, 18], [12, 18], [12, 24], [0, 24]]),
                on: true
            }
        ]
    },
    {
        id: "c2-interlock-seam",
        label: "C2. Interlock / double, gutter",
        note: "3-unit gutter so both halves read",
        family: "seam",
        ops: [{ d: full, on: true }, { d: "M12 0V6H18V12H6V18H12V24", on: false, stroke: 3 }]
    },
    {
        id: "c3-interlock-z",
        label: "C3. Interlock / single",
        note: "one jog, exact halves, 180 deg",
        family: "seam",
        ops: [{ d: P([[0, 0], [18, 0], [18, 12], [6, 12], [6, 24], [0, 24]]), on: true }]
    },
    {
        id: "c4-interlock-z-seam",
        label: "C4. Interlock / single, gutter",
        note: "87% ink, the most brutal of the family",
        family: "seam",
        ops: [{ d: full, on: true }, { d: "M18 0V12H6V24", on: false, stroke: 3 }]
    },

    //  Family 2: an ordered ramp from scattered blocks into solid ink.
    { id: "b-signal-gain", label: "B. Signal Gain", note: "Bayer ramp, 8 columns of 3", family: "ramp", ops: ditherCells(8, 3) },
    { id: "b2-signal-coarse", label: "B2. Signal Gain / coarse", note: "4 columns, 25-50-75-100", family: "ramp", ops: coarseRamp },
    {
        id: "b3-signal-void",
        label: "B3. Signal Gain / inverted",
        note: "the ramp cut from a solid tile",
        family: "ramp",
        ops: [{ d: full, on: true }, ...coarseRamp.map(op => ({ ...op, on: false }))]
    },

    //  Family 3: convergence. Many in, one out.
    {
        id: "d-aperture",
        label: "D. Aperture",
        note: "45 deg convergence, slot exits right",
        family: "aperture",
        ops: [{ d: full, on: true }, { d: WEDGE, on: false }]
    },
    {
        id: "d2-aperture-closed",
        label: "D2. Aperture / closed",
        note: "slot terminates inside, one block",
        family: "aperture",
        ops: [{ d: full, on: true }, { d: WEDGE_CLOSED, on: false }]
    },
    {
        id: "d3-aperture-down",
        label: "D3. Aperture / vertical",
        note: "capture downward instead of across",
        family: "aperture",
        ops: [{ d: full, on: true }, { d: WEDGE_DOWN, on: false }]
    },
    {
        id: "d4-aperture-inset",
        label: "D4. Aperture / inset",
        note: "void fully enclosed, silhouette intact",
        family: "aperture",
        ops: [{ d: full, on: true }, { d: WEDGE_INSET, on: false }]
    },

    //  Family 4: blocks and layers.
    {
        id: "e-offset-stack",
        label: "E. Offset Stack",
        note: "three layers, one displaced",
        family: "block",
        ops: [
            { d: R(0, 0, 24, 6), on: true },
            { d: R(6, 9, 18, 6), on: true },
            { d: R(0, 18, 24, 6), on: true }
        ]
    },
    {
        id: "f-containment",
        label: "F. Containment",
        note: "notch removed, notch relocated",
        family: "block",
        ops: [{ d: P([[0, 0], [18, 0], [18, 6], [24, 6], [24, 24], [0, 24]]), on: true }, { d: R(6, 9, 6, 6), on: false }]
    },
    {
        id: "g2-gnomon",
        label: "G2. Gnomon",
        note: "24 / 12 / 6, one shared corner",
        family: "block",
        ops: [{ d: full, on: true }, { d: R(12, 12, 12, 12), on: false }, { d: R(18, 18, 6, 6), on: true }]
    },

    //  Family 5: the letterform signature.
    { id: "h-reversed-r", label: "H. Reversed Terminal", note: "the flipped r, promoted", family: "letter", ops: [{ d: R_STEM, on: true }, { d: R_ARM, on: true }] },
    {
        id: "h2-reversed-r-void",
        label: "H2. Reversed Terminal / void",
        note: "same glyph, cut out",
        family: "letter",
        ops: [{ d: full, on: true }, { d: R_STEM, on: false }, { d: R_ARM, on: false }]
    }
].map(m => ({ w: 24, h: 24, ...m }))

const wideMarks = [
    {
        id: "a3-deviation-stairs",
        label: "A3. Deviation / three steps",
        note: "compounding, banner scale only",
        w: 48,
        h: 24,
        ops: [
            {
                d: P([
                    [0, 15], [9, 15], [9, 9], [21, 9], [21, 3], [48, 3],
                    [48, 9], [27, 9], [27, 15], [15, 15], [15, 21], [0, 21]
                ]),
                on: true
            }
        ]
    },
    {
        id: "g-powers-of-two",
        label: "G. Powers of Two",
        note: "sides 3 / 6 / 12 / 24 on one baseline",
        w: 54,
        h: 24,
        ops: [
            { d: R(0, 21, 3, 3), on: true },
            { d: R(6, 18, 6, 6), on: true },
            { d: R(15, 12, 12, 12), on: true },
            { d: R(30, 0, 24, 24), on: true }
        ]
    }
]

let uid = 0

/**
 * Emits the mark as a masked ink rect, positioned and scaled into a parent SVG.
 *
 * @remarks
 * A luminance mask keeps voids genuinely transparent, so every study composites
 * onto any background without a paper-coloured fake.
 */
const markMask = mark => {
    const id = `k${uid++}`

    const body = mark.ops
        .map(op => {
            const paint = op.on ? "#FFFFFF" : "#000000"

            return op.stroke
                ? `<path d="${op.d}" fill="none" stroke="${paint}" stroke-width="${op.stroke}" stroke-linejoin="miter" stroke-linecap="butt"/>`
                : `<path d="${op.d}" fill="${paint}"/>`
        })
        .join("")

    const def = [
        `<mask id="${id}" maskUnits="userSpaceOnUse" x="0" y="0" width="${mark.w}" height="${mark.h}">`,
        `<rect x="0" y="0" width="${mark.w}" height="${mark.h}" fill="#000000"/>${body}</mask>`
    ].join("")

    return { id, def }
}

const renderMark = (mark, { x = 0, y = 0, size = 24, ink = "#FAFAFA" } = {}) => {
    const { id, def } = markMask(mark)

    const scale = size / mark.h

    return [
        def,
        `<g transform="translate(${x} ${y}) scale(${scale})">`,
        `<rect x="0" y="0" width="${mark.w}" height="${mark.h}" fill="${ink}" mask="url(#${id})"/>`,
        `</g>`
    ].join("")
}

const standalone = (mark, { size = 512, ink = "#FAFAFA", paper = null, radius = 0 } = {}) => {
    const w = Math.round(size * (mark.w / mark.h))

    const bg = paper ? `<rect x="0" y="0" width="${w}" height="${size}" rx="${radius}" fill="${paper}"/>` : ""

    return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${size}" viewBox="0 0 ${w} ${size}">${bg}${renderMark(mark, { size, ink })}</svg>`
}

export { marks, wideMarks, renderMark, markMask, standalone, R, P }
