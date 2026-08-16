import { createHash } from "node:crypto"
import { Resvg } from "@resvg/resvg-js"

import { FONTS } from "./paths.mjs"

const FONTS_PX = `${FONTS}/px`

const FONT_DIRS = [FONTS, FONTS_PX, "/usr/share/fonts"]

const FONT = { fontDirs: FONT_DIRS, defaultFontFamily: "JetBrains Mono", loadSystemFonts: true }

const stamp = (family, weight) => {
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="620" height="90"><rect width="620" height="90" fill="#000"/><text x="10" y="66" font-family="${family}" font-size="58" font-weight="${weight}" fill="#fff">altered.computer</text></svg>`

    return createHash("md5").update(new Resvg(svg, { font: FONT }).render().asPng()).digest("hex").slice(0, 12)
}

/**
 * Fails loudly when a requested family+weight silently resolves to the fallback.
 *
 * @remarks
 * resvg substitutes the default family without warning, which is how a
 * "Px Grotesk Screen 800" row in an earlier sheet was actually JetBrains Mono.
 * Every face used in a sheet is checked against the fallback fingerprint first.
 */
const assertFaces = (faces, { skip = ["JetBrains Mono"] } = {}) => {
    const fallbacks = new Set([stamp("__definitely_missing__", 400), stamp("__definitely_missing__", 700), stamp("__definitely_missing__", 800), stamp("__definitely_missing__", 900)])
    const bad = []

    for (const [family, weight] of faces) {
        if (skip.includes(family)) continue

        if (fallbacks.has(stamp(family, weight))) bad.push(`${family} ${weight}`)
    }

    if (bad.length) throw new Error(`font fell back to default: ${bad.join(", ")}`)

    return true
}

export { FONT, FONT_DIRS, stamp, assertFaces }
