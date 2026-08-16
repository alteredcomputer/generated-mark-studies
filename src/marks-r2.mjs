//  ALTERED mark studies, round two.
//
//  Field is 24 units unless stated. Stroke is 6 (1:4) unless the concept needs otherwise.
//  Angles are 90 and 45 except in the ANGLE family, which deliberately tests 30 and 22.5.

const R = (x, y, w, h) => `M${round(x)} ${round(y)}H${round(x + w)}V${round(y + h)}H${round(x)}Z`

const P = pts => `M${pts.map(([x, y]) => `${round(x)} ${round(y)}`).join("L")}Z`

const round = n => Number(n.toFixed(3))

/**
 * Expands a centreline polyline into a filled band of a given vertical thickness.
 *
 * @remarks
 * Vertical thickness rather than perpendicular thickness, which is how a
 * typeface handles a diagonal: it keeps horizontal runs and diagonals reading
 * at the same weight instead of making the diagonal look thin.
 */
const band = (pts, t) => {
    const half = t / 2
    const top = pts.map(([x, y]) => [x, y - half])
    const bottom = [...pts].reverse().map(([x, y]) => [x, y + half])

    return P([...top, ...bottom])
}

const rotate = (d, deg, cx = 12, cy = 12) => ({ d, t: `rotate(${deg} ${cx} ${cy})` })

const full = R(0, 0, 24, 24)

const frame = (size, thickness) => [
    { d: R(0, 0, size, size), on: true },
    { d: R(thickness, thickness, size - thickness * 2, size - thickness * 2), on: false }
]

//  ---------------------------------------------------------------- F1 RESOLVE

//  A damped burst settling onto a line. Slope is locked at 4:1 on every swing and
//  the amplitude is multiplied by 3/4 each time, so the decay is a stated ratio
//  rather than a drawn curve.
const damped = (slope = 4, decay = 0.75, swings = 6, start = 8) => {
    const pts = [[0, 12]]
    let amp = start
    let x = 0
    let sign = -1

    for (let i = 0; i < swings; i++) {
        const target = 12 + sign * amp
        const dy = Math.abs(target - pts[pts.length - 1][1])

        x += dy / slope
        pts.push([x, target])
        amp *= decay
        sign *= -1
    }

    pts.push([24, 12])

    return pts
}

const DAMPED = damped()

const COMB = [6, 12, 9, 18, 15, 24, 24, 24].map((h, i) => ({ d: R(i * 3, (24 - h) / 2, 3.04, h), on: true }))

const CONVERGE = [
    { d: band([[0, 3], [6, 9], [24, 9]], 3), on: true },
    { d: band([[0, 12], [24, 12]], 3), on: true },
    { d: band([[0, 21], [6, 15], [24, 15]], 3), on: true }
]

//  ---------------------------------------------------------------- F2 RETURN

const RETURN_SHAFT = [
    { d: R(18, 0, 6, 15), on: true },
    { d: R(6, 9, 18, 6), on: true },
    { d: P([[6, 6], [6, 18], [0, 12]]), on: true }
]

const SPIRAL = { d: "M12 44V12H44V32H24V22H34", stroke: 8, on: true }

//  Interior window of a 4-unit frame: 16 units wide at (4,4).
const INNER = "translate(4 4) scale(0.66667)"

//  ---------------------------------------------------------------- F9 MARKDOWN

//  Datasets are tags, and the tag glyph is the hash. Orthogonal rather than
//  slanted, because a sheared bar cannot land on the lattice at this weight.
const HASH = [
    { d: R(4, 0, 4, 24), on: true },
    { d: R(16, 0, 4, 24), on: true },
    { d: R(0, 4, 24, 4), on: true },
    { d: R(0, 16, 24, 4), on: true }
]

const HASH_SLANT = [
    { d: P([[6, 0], [10, 0], [6, 24], [2, 24]]), on: true },
    { d: P([[18, 0], [22, 0], [18, 24], [14, 24]]), on: true },
    { d: R(0, 5, 24, 4), on: true },
    { d: R(0, 15, 24, 4), on: true }
]

//  ---------------------------------------------------------------- F4 SPARK

const STAR4 = P([[12, 0], [15, 9], [24, 12], [15, 15], [12, 24], [9, 15], [0, 12], [9, 9]])

const BAR_V = R(9.5, 0, 5, 24)

//  ---------------------------------------------------------------- F8 ANGLE

/**
 * The ramp, generalised to any angle.
 *
 * @remarks
 * Rise is capped so the band always keeps at least a 3-unit margin of ink above
 * and below, and the horizontal run is capped at 18 so shallow angles do not
 * push the entry runs off the field. That keeps all four angles comparable.
 */
const angledRamp = (deg, thickness = 6, margin = 3, maxRun = 18) => {
    const riseMax = 24 - margin * 2 - thickness
    const run = Math.min(maxRun, riseMax / Math.tan((deg * Math.PI) / 180))
    const rise = run * Math.tan((deg * Math.PI) / 180)
    const pad = (24 - thickness - rise) / 2
    const flat = (24 - run) / 2
    const lo = 24 - pad - thickness / 2
    const hi = pad + thickness / 2

    return band([[0, lo], [flat, lo], [flat + run, hi], [24, hi]], thickness)
}

const marks = [
    //  F1 RESOLVE -- entropy into order, executed as line rather than dither.
    {
        id: "r1-damped",
        label: "R1. Damped",
        means: "scattered thinking settling onto one line",
        family: "resolve",
        ops: [{ d: band(DAMPED, 3), on: true }]
    },
    {
        id: "r2-damped-cut",
        label: "R2. Damped / cut",
        means: "the same settle, carved out of the slab",
        family: "resolve",
        ops: [{ d: full, on: true }, { d: band(DAMPED, 4), on: false }]
    },
    {
        id: "r3-comb",
        label: "R3. Comb",
        means: "uneven signal compacting into one record",
        family: "resolve",
        ops: COMB
    },
    {
        id: "r4-converge",
        label: "R4. Converge",
        means: "three inputs, one aligned output",
        family: "resolve",
        ops: CONVERGE
    },
    {
        id: "r5-converge-cut",
        label: "R5. Converge / cut",
        means: "the same, as channels through a block",
        family: "resolve",
        ops: [{ d: full, on: true }, ...CONVERGE.map(o => ({ ...o, on: false }))]
    },

    //  F2 RETURN -- recall. the promise is that it comes back.
    { id: "t1-return", label: "T1. Return", means: "what you said comes back to you", family: "return", ops: RETURN_SHAFT },
    {
        id: "t2-return-cut",
        label: "T2. Return / cut",
        means: "the same glyph as a void",
        family: "return",
        ops: [{ d: full, on: true }, ...RETURN_SHAFT.map(o => ({ ...o, on: false }))]
    },
    {
        id: "t3-spiral",
        label: "T3. Spiral",
        means: "kaizen: the same loop, tighter each pass",
        family: "return",
        w: 48,
        h: 48,
        ops: [SPIRAL]
    },
    {
        id: "t4-spiral-cut",
        label: "T4. Spiral / cut",
        means: "the loop as a channel",
        family: "return",
        w: 48,
        h: 48,
        ops: [{ d: R(0, 0, 48, 48), on: true }, { ...SPIRAL, on: false }]
    },

    //  F3 CONTAINER -- the Kortex/option lineage, with the outline problem solved.
    { id: "k1-frame", label: "K1. Frame", means: "the container, nothing else", family: "container", ops: frame(24, 6) },
    {
        id: "k2-frame-core",
        label: "K2. Frame / core",
        means: "one thought held inside the system",
        family: "container",
        ops: [...frame(24, 6), { d: R(9, 9, 6, 6), on: true }]
    },
    {
        id: "k3-frame-port",
        label: "K3. Frame / port",
        means: "a closed system with one way in",
        family: "container",
        ops: [...frame(24, 6), { d: R(0, 9, 6, 6), on: false }]
    },
    {
        id: "k4-frame-chamfer",
        label: "K4. Frame / chamfer",
        means: "the container, altered at one corner",
        family: "container",
        ops: [
            { d: P([[0, 0], [18, 0], [24, 6], [24, 24], [0, 24]]), on: true },
            { d: P([[6, 6], [15, 6], [18, 9], [18, 18], [6, 18]]), on: false }
        ]
    },
    {
        id: "k5-frame-ramp",
        label: "K5. Frame / ramp",
        means: "round one's winner, held inside the lineage container",
        family: "container",
        ops: [...frame(24, 4), { d: full, on: true, t: INNER }, { d: angledRamp(45), on: false, t: INNER }]
    },
    {
        id: "k6-frame-return",
        label: "K6. Frame / return",
        means: "the container and the recall glyph, one object",
        family: "container",
        ops: [...frame(24, 4), ...RETURN_SHAFT.map(o => ({ ...o, t: INNER }))]
    },
    {
        id: "k7-frame-asterisk",
        label: "K7. Frame / asterisk",
        means: "the container holding the wildcard",
        family: "container",
        ops: [...frame(24, 4), { d: BAR_V, on: true, t: INNER }, { ...rotate(BAR_V, 60), t: `${INNER} rotate(60 12 12)` }, { ...rotate(BAR_V, 120), t: `${INNER} rotate(120 12 12)` }].map(o => ({ on: true, ...o }))
    },

    //  F4 SPARK -- the Kortex sparkle, brutalised. see the caveat in the notes.
    { id: "s1-star", label: "S1. Star", means: "the moment a thought lands", family: "spark", ops: [{ d: STAR4, on: true }] },
    {
        id: "s2-star-cut",
        label: "S2. Star / cut",
        means: "the same, punched out of the slab",
        family: "spark",
        ops: [{ d: full, on: true }, { d: STAR4, on: false }]
    },
    {
        id: "s3-asterisk",
        label: "S3. Asterisk",
        means: "the glob character: match anything. also the annotation mark",
        family: "spark",
        ops: [{ d: BAR_V, on: true }, rotate(BAR_V, 60), rotate(BAR_V, 120)].map(o => (o.on === undefined ? { ...o, on: true } : o))
    },
    {
        id: "s4-asterisk-cut",
        label: "S4. Asterisk / cut",
        means: "wildcard as a void",
        family: "spark",
        ops: [
            { d: full, on: true },
            { d: BAR_V, on: false },
            { ...rotate(BAR_V, 60), on: false },
            { ...rotate(BAR_V, 120), on: false }
        ]
    },
    {
        id: "s5-quincunx",
        label: "S5. Quincunx",
        means: "a core and its attached data points",
        family: "spark",
        ops: [
            { d: R(0, 0, 6, 6), on: true },
            { d: R(18, 0, 6, 6), on: true },
            { d: R(9, 9, 6, 6), on: true },
            { d: R(0, 18, 6, 6), on: true },
            { d: R(18, 18, 6, 6), on: true }
        ]
    },

    //  F5 PRIMITIVE -- the data model, made literal. duotone where a second tone earns its place.
    {
        id: "p1-core-attrs",
        label: "P1. Core + attributes",
        means: "a thought with data points attached",
        family: "primitive",
        ops: [
            { d: R(6, 6, 12, 12), on: true },
            { d: R(18, 9, 6, 6), on: true },
            { d: R(9, 18, 6, 6), on: true },
            { d: R(0, 9, 6, 6), on: true }
        ]
    },
    {
        id: "p2-version",
        label: "P2. Version",
        means: "the same thought, reused. compounding, not duplication",
        family: "primitive",
        duotone: [
            { tone: "mute", ops: [{ d: R(0, 0, 18, 18), on: true }] },
            { tone: "fg", ops: [{ d: R(6, 6, 18, 18), on: true }] }
        ]
    },
    {
        id: "p3-layers",
        label: "P3. Layers",
        means: "thought, dataset, system: three tiers of the same object",
        family: "primitive",
        duotone: [
            { tone: "dim", ops: [{ d: R(0, 0, 14, 14), on: true }] },
            { tone: "mute", ops: [{ d: R(5, 5, 14, 14), on: true }] },
            { tone: "fg", ops: [{ d: R(10, 10, 14, 14), on: true }] }
        ]
    },
    {
        id: "p4-version-cut",
        label: "P4. Version / cut",
        means: "two passes of one object, single tone",
        family: "primitive",
        ops: [{ d: R(0, 0, 18, 18), on: true }, { d: R(6, 6, 18, 18), on: true }, { d: R(6, 6, 12, 12), on: false }]
    },

    //  F6 AXIS -- base-layer infrastructure.
    {
        id: "x1-origin",
        label: "X1. Origin",
        means: "the axes everything else is measured against",
        family: "axis",
        ops: [{ d: R(0, 0, 6, 24), on: true }, { d: R(0, 18, 24, 6), on: true }]
    },
    {
        id: "x2-datum",
        label: "X2. Datum",
        means: "a foundation, and the one thing standing on it",
        family: "axis",
        ops: [{ d: R(0, 18, 24, 6), on: true }, { d: R(6, 3, 6, 15), on: true }]
    },
    {
        id: "x3-bracket",
        label: "X3. Bracket",
        means: "scope. the frame you think inside of",
        family: "axis",
        ops: [
            { d: R(0, 0, 6, 24), on: true },
            { d: R(0, 0, 10, 6), on: true },
            { d: R(0, 18, 10, 6), on: true },
            { d: R(18, 0, 6, 24), on: true },
            { d: R(14, 0, 10, 6), on: true },
            { d: R(14, 18, 10, 6), on: true }
        ]
    },
    {
        id: "x4-index",
        label: "X4. Index",
        means: "a key: the thing that makes a store queryable",
        family: "axis",
        ops: [
            { d: R(0, 9, 24, 6), on: true },
            { d: R(9, 15, 3, 6), on: true },
            { d: R(15, 15, 3, 4), on: true },
            { d: R(21, 15, 3, 6), on: true }
        ]
    },

    //  F7 KAI -- the stroke grammar of the character, not the character.
    {
        id: "j1-kai-a",
        label: "J1. Kai / A",
        means: "change: heavy anchor, overhanging bar, detached weight",
        family: "kai",
        ops: [{ d: R(9, 0, 6, 24), on: true }, { d: R(0, 6, 21, 6), on: true }, { d: R(18, 15, 6, 6), on: true }]
    },
    {
        id: "j2-kai-b",
        label: "J2. Kai / B",
        means: "same grammar, kicked at 45",
        family: "kai",
        ops: [
            { d: R(0, 3, 24, 6), on: true },
            { d: R(12, 9, 6, 9), on: true },
            { d: P([[12, 18], [18, 18], [18, 24], [6, 24]]), on: true }
        ]
    },

    //  F9 MARKDOWN -- glyphs the audience already reads, from the syntax the brand lives in.
    { id: "m1-hash", label: "M1. Hash", means: "datasets are tags, and this is the tag glyph", family: "markdown", ops: HASH },
    {
        id: "m2-hash-cut",
        label: "M2. Hash / cut",
        means: "the tag glyph punched out, 56% to 44% inverted",
        family: "markdown",
        ops: [{ d: full, on: true }, ...HASH.map(o => ({ ...o, on: false }))]
    },
    { id: "m3-hash-slant", label: "M3. Hash / slant", means: "the true typographic hash, off the lattice", family: "markdown", ops: HASH_SLANT },
    {
        id: "m4-hash-heavy",
        label: "M4. Hash / heavy",
        means: "same glyph at stroke 6. 75% ink, the brutal cut",
        family: "markdown",
        ops: [
            { d: R(3, 0, 6, 24), on: true },
            { d: R(15, 0, 6, 24), on: true },
            { d: R(0, 3, 24, 6), on: true },
            { d: R(0, 15, 24, 6), on: true }
        ]
    },
    {
        id: "m5-hash-heavy-cut",
        label: "M5. Hash / heavy, cut",
        means: "the four windows left behind by the crossing",
        family: "markdown",
        ops: [
            { d: full, on: true },
            { d: R(3, 0, 6, 24), on: false },
            { d: R(15, 0, 6, 24), on: false },
            { d: R(0, 3, 24, 6), on: false },
            { d: R(0, 15, 24, 6), on: false }
        ]
    },

    //  F8 ANGLE -- the same ramp at angles that are not lattice-aligned.
    {
        id: "y1-ramp-45",
        label: "Y1. Ramp 45",
        means: "control: every vertex on the grid",
        family: "angle",
        ops: [{ d: full, on: true }, { d: angledRamp(45), on: false }]
    },
    {
        id: "y2-ramp-30",
        label: "Y2. Ramp 30",
        means: "one third of a right angle",
        family: "angle",
        ops: [{ d: full, on: true }, { d: angledRamp(30), on: false }]
    },
    {
        id: "y3-ramp-2251",
        label: "Y3. Ramp 22.5",
        means: "one quarter of a right angle",
        family: "angle",
        ops: [{ d: full, on: true }, { d: angledRamp(22.5, 5), on: false }]
    },
    {
        id: "y4-ramp-2to1",
        label: "Y4. Ramp 2:1",
        means: "26.57 deg: off the 45, still fully on the lattice",
        family: "angle",
        ops: [
            { d: full, on: true },
            { d: band([[0, 18], [2, 18], [20, 9], [24, 9]], 6), on: false }
        ]
    }
].map(m => ({ w: 24, h: 24, ...m }))

const FAMILIES = [
    { key: "resolve", title: "R / Resolve", blurb: "Entropy into order, drawn as line rather than dither. This is the Signal Gain story with the small-size problem solved." },
    { key: "return", title: "T / Return", blurb: "Recall. The offer promise is that your thinking comes back, and the keyboard lineage carries over from the option glyph." },
    { key: "container", title: "K / Container", blurb: "The Kortex and option-key lineage, with the failure mode fixed: the frame is thick enough to be the ink, not an outline." },
    { key: "spark", title: "S / Spark", blurb: "The Kortex sparkle, brutalised. Read the caveat before you fall for these." },
    { key: "primitive", title: "P / Primitive", blurb: "The data model made literal: a thought, its attributes, its versions, its tiers. Includes the first duotone studies." },
    { key: "axis", title: "X / Axis", blurb: "Base-layer infrastructure. Origins, foundations, scope and keys." },
    { key: "kai", title: "J / Kai", blurb: "The stroke grammar of the character for change, abstracted. Never the character itself." },
    { key: "markdown", title: "M / Markdown", blurb: "Glyphs your audience already reads fluently, taken from the syntax the whole brand lives in." },
    { key: "angle", title: "Y / Angle", blurb: "The same ramp at 45, 30, 22.5 and 2:1, to settle whether leaving the lattice is worth it." }
]

export { marks, FAMILIES, R, P, band, full, frame, angledRamp }
