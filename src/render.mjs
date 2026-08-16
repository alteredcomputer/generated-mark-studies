//  Palette-aware renderer. Tones resolve against the active scheme rather than
//  being hard-coded, so every study can be shown in both polarities from one source.

const SCHEMES = {
    dark: { bg: "#101010", panel: "#181818", raised: "#202020", fg: "#FFFFFF", mute: "#808080", dim: "#404040", line: "#282828" },
    light: { bg: "#FFFFFF", panel: "#F4F4F4", raised: "#EAEAEA", fg: "#404040", mute: "#808080", dim: "#BFBFBF", line: "#DCDCDC" }
}

let uid = 0

const paintOps = (ops, onColor, offColor) =>
    ops
        .map(op => {
            const paint = op.on ? onColor : offColor

            const el = op.stroke
                ? `<path d="${op.d}" fill="none" stroke="${paint}" stroke-width="${op.stroke}" stroke-linejoin="miter" stroke-linecap="butt"/>`
                : `<path d="${op.d}" fill="${paint}"/>`

            return op.t ? `<g transform="${op.t}">${el}</g>` : el
        })
        .join("")

const maskFor = (ops, w, h) => {
    const id = `k${uid++}`

    const def = [
        `<mask id="${id}" maskUnits="userSpaceOnUse" x="0" y="0" width="${w}" height="${h}">`,
        `<rect x="0" y="0" width="${w}" height="${h}" fill="#000000"/>`,
        paintOps(ops, "#FFFFFF", "#000000"),
        `</mask>`
    ].join("")

    return { id, def }
}

/**
 * Places a mark into a parent SVG at a given position and size.
 *
 * @remarks
 * Duotone marks paint one masked rect per layer, so a second tone never
 * depends on the background colour showing through.
 */
const renderMark = (mark, { x = 0, y = 0, size = 24, scheme = "dark", ink = null } = {}) => {
    const tones = SCHEMES[scheme]
    const scale = size / mark.h
    const open = `<g transform="translate(${x} ${y}) scale(${scale})">`

    const layers = mark.duotone ?? [{ tone: "fg", ops: mark.ops }]

    const body = layers
        .map(layer => {
            const { id, def } = maskFor(layer.ops, mark.w, mark.h)
            const color = ink && layer.tone === "fg" ? ink : tones[layer.tone] ?? tones.fg

            return `${def}${open}<rect x="0" y="0" width="${mark.w}" height="${mark.h}" fill="${color}" mask="url(#${id})"/></g>`
        })
        .join("")

    return body
}

const standalone = (mark, { size = 512, scheme = "dark", tile = false, radius = 0 } = {}) => {
    const tones = SCHEMES[scheme]
    const w = Math.round(size * (mark.w / mark.h))
    const bg = tile ? `<rect x="0" y="0" width="${w}" height="${size}" rx="${radius}" fill="${tones.bg}"/>` : ""

    return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${size}" viewBox="0 0 ${w} ${size}">${bg}${renderMark(mark, { size, scheme })}</svg>`
}

export { SCHEMES, renderMark, standalone, maskFor, paintOps }
