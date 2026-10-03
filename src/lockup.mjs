//  Icon plus wordmark, placed by measurement.
//
//  Three numbers define a horizontal lockup, all relative to the type size:
//  icon height in em, gap in em, and how the word is centred against the icon.

import { renderMark } from "./render.mjs"
import { setLine, metrics } from "./type.mjs"

/**
 * @remarks
 * `gapTo` decides what the gap is measured to. "ink" runs from the icon's edge to
 * the first letter's visible edge, so faces with different side bearings get the
 * same visible gap. "cell" runs to the start of the first letter's cell, which is
 * what round four did.
 *
 * `centre` decides the vertical placement. "ink" puts the middle of the word's
 * visible height (tallest ascender to baseline) on the icon's middle. A number
 * reproduces round four instead: the baseline sits that many em below the icon top.
 */
const lockup = ({ mark, face, word = "altered", size, iconEm, gapEm, gapTo = "ink", centre = "ink", tracking = 0, scheme = "dark" }) => {
    const icon = size * iconEm
    const iconW = icon * (mark.w / mark.h)
    const gap = size * gapEm
    const probe = setLine(face, word, { size, tracking })

    const baseline = centre === "ink" ? icon / 2 - (probe.ink.y1 + probe.ink.y2) / 2 : size * centre
    const x = iconW + gap - (gapTo === "ink" ? probe.ink.x1 : 0)
    const line = setLine(face, word, { size, x, baseline, tracking })

    const top = Math.min(0, line.ink.y1)
    const bottom = Math.max(icon, line.ink.y2)

    return {
        body: (fill, ox, oy) =>
            `${renderMark(mark, { x: ox, y: oy - top, size: icon, scheme })}<path d="${line.d}" fill="${fill}" transform="translate(${ox} ${oy - top})"/>`,
        width: line.ink.x2,
        height: bottom - top,
        icon,
        iconW,
        gap,
        line,
        top,
        metrics: metrics(face)
    }
}

export { lockup }
