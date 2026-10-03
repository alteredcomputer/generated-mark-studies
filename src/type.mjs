//  Type as outlines, read straight from the font files.
//
//  Lockups from round six on set no <text>: every letter is a path from the face
//  itself. That removes the silent-fallback trap for wordmarks entirely, and it
//  means the ink of a word can be measured and centred rather than assumed from
//  published metrics.

import { readFileSync } from "node:fs"
import opentype from "opentype.js"

import { FONTS } from "./paths.mjs"

const FACES = {
    bm700: { file: "BerkeleyMono-Bold.ttf", name: "Berkeley Mono Bold" },
    bm500: { file: "BerkeleyMono-Medium.ttf", name: "Berkeley Mono Medium" },
    px700: { file: "px/PxGroteskMonoTrial-Bold.otf", name: "Px Grotesk Mono Bold" },
    geist500: { file: "geist-mono/GeistMono-Medium.ttf", name: "Geist Mono Medium" },
    geist700: { file: "geist-mono/GeistMono-Bold.ttf", name: "Geist Mono Bold" }
}

const cache = new Map()

const r3 = n => Number(n.toFixed(3))

//  Serialised by hand: opentype.js 2's own toPathData optimises away close-path
//  commands at some coordinates, which fills a letter's counter solid.
const pathData = commands =>
    commands
        .map(c =>
            c.type === "Z"
                ? "Z"
                : c.type === "Q"
                  ? `Q${r3(c.x1)} ${r3(c.y1)} ${r3(c.x)} ${r3(c.y)}`
                  : c.type === "C"
                    ? `C${r3(c.x1)} ${r3(c.y1)} ${r3(c.x2)} ${r3(c.y2)} ${r3(c.x)} ${r3(c.y)}`
                    : `${c.type}${r3(c.x)} ${r3(c.y)}`
        )
        .join("")

const face = key => {
    if (!cache.has(key)) {
        const buf = readFileSync(`${FONTS}/${FACES[key].file}`)
        const font = opentype.parse(buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength))

        cache.set(key, font)
    }

    return cache.get(key)
}

/** Per-face proportions, all as fractions of the em. */
const metrics = key => {
    const f = face(key)
    const u = f.unitsPerEm
    const os2 = f.tables.os2

    return {
        name: FACES[key].name,
        cell: f.charToGlyph("a").advanceWidth / u,
        cap: os2.sCapHeight / u,
        xHeight: os2.sxHeight / u
    }
}

/**
 * Lays a string out glyph by glyph as one path.
 *
 * @remarks
 * Monospace, so there is no kerning to apply. `tracking` is in em and is added after
 * every glyph, the way CSS letter-spacing does it. Returns the path, the ink box of
 * the actual outlines, and the advance box the cells occupy.
 */
const setLine = (key, content, { size, x = 0, baseline = 0, tracking = 0 }) => {
    const f = face(key)
    const scale = size / f.unitsPerEm
    const parts = []
    const cells = []
    let pen = x
    let ink = null

    for (const ch of content) {
        const glyph = f.charToGlyph(ch)
        const path = glyph.getPath(pen, baseline, size)
        const bb = path.getBoundingBox()

        parts.push(pathData(path.commands))
        cells.push({ ch, x: pen, w: glyph.advanceWidth * scale })

        if (bb.x2 > bb.x1)
            ink = ink
                ? { x1: Math.min(ink.x1, bb.x1), y1: Math.min(ink.y1, bb.y1), x2: Math.max(ink.x2, bb.x2), y2: Math.max(ink.y2, bb.y2) }
                : { x1: bb.x1, y1: bb.y1, x2: bb.x2, y2: bb.y2 }

        pen += glyph.advanceWidth * scale + tracking * size
    }

    return { d: parts.join(""), ink, cells, advance: pen - x, size, baseline }
}

export { FACES, face, metrics, setLine }
