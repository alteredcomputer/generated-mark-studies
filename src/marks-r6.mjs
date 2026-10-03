//  Round six. X1 is the reference: round four's small-size cut, which the operator
//  rates above everything since. This round reconstructs it exactly, restates it as
//  rules on a 64-unit field, and puts the same glyph inside a frame.

import { marks as r4 } from "./marks-r4.mjs"
import { marks as r5 } from "./marks-r5.mjs"
import { x1, canon, tile, framed } from "./glyph.mjs"

const GLYPHS = {
    x1: x1(),
    canon: canon(),
    d70: canon({ diag: 0.7, id: "d70" }),
    //  X4's heavier bar. Diagonals at 0.7 rise 3.86 units clear of the bar, against
    //  canon's 3.88 at 0.6, so the heavier bar does not swallow them.
    heavy: canon({ bar: 20, diag: 0.7, id: "heavy" })
}

const FRAMES = {
    fa: { field: 64, frame: 8, gap: 8 },
    fb: { field: 64, frame: 8, gap: 4 }
}

const from = (list, id) => {
    const m = list.find(x => x.id === id)

    if (!m) throw new Error(`missing reference mark ${id}`)

    return m
}

const mark = (id, family, label, means, built) => ({ id, family, label, means, ops: built.ops, w: built.w ?? 48, h: built.h ?? 48 })

const marks = [
    mark("x1", "x", "X1 / round four, exact", "48 field, bar 11, reach 0.86. Byte-identical to round four", tile(GLYPHS.x1)),
    mark("canon", "x", "X1 / canon", "64 field, bar 1/4, tip margin 1/16, diagonals 0.6, one triangle", tile(GLYPHS.canon)),

    mark("g-d70", "g", "G. Canon / diagonals 0.7", "same triangle, diagonals at 70% of the vertical", tile(GLYPHS.d70)),
    mark("g-heavy", "g", "G. Heavy / bar 5/16", "X4's bar, diagonals 0.7 so they rise as far as canon's", tile(GLYPHS.heavy)),

    mark("f-a", "f", "FA. Frame 1/8, gap 1/8", "canon glyph at half size: bar = frame = gap = 8 of 64", framed(GLYPHS.canon, FRAMES.fa)),
    mark("f-b", "f", "FB. Frame 1/8, gap 1/16", "canon glyph at 5/8 size: bar 10, a quarter heavier than the frame", framed(GLYPHS.canon, FRAMES.fb)),

    { ...from(r4, "b-6"), id: "r4-b6", family: "ref", label: "B6 / round four", means: "frame 5, bar 6, reach 0.6, star S2" },
    { ...from(r4, "r-75"), id: "r4-r75", family: "ref", label: "R75 / round four", means: "frame 5, bar 8, reach 0.75, star S2" },
    { ...from(r5, "n-b6-cut"), id: "r5-b6-cut", family: "ref", label: "B6 cut / round five", means: "bar 6: the parent's bar kept at full field" },
    { ...from(r5, "n-r75-cut"), id: "r5-r75-cut", family: "ref", label: "R75 cut / round five", means: "bar 8, reach 0.75, diagonals 0.78" }
]

const byId = id => from(marks, id)

const FAMILIES = [
    { key: "x", title: "X / X1, reconstructed and restated", blurb: "Round four's X1 rebuilt number for number, then the same shape restated as rules on a 64-unit field." },
    { key: "g", title: "G / Glyph variants", blurb: "Two changes to canon you asked about: longer diagonals, and X4's heavier bar with the diagonals extended to stay visible." },
    { key: "f", title: "F / Framed, same glyph", blurb: "The canon glyph scaled uniformly into a frame, so the inner shape is identical to the tile's. Only frame and gap differ." },
    { key: "ref", title: "REF / Earlier marks, for comparison", blurb: "Round four's B6 and R75, which you asked to see side by side, and the two round five cuts that replaced X1." }
]

export { marks, byId, FAMILIES, GLYPHS, FRAMES }
