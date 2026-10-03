//  Round six's gallery page. Numbers are written from the same glyph objects the
//  sheets are drawn from, so a table cannot disagree with its drawing.

import { marks, FAMILIES, GLYPHS, FRAMES } from "./marks-r6.mjs"
import { measure } from "./glyph.mjs"
import { frac } from "./sheets-r6-construct.mjs"
import { R4, R4_ICON_EM, r4InkGapEm } from "./sheets-r6-type.mjs"
import { metrics } from "./type.mjs"

const n2 = v => String(Number(v.toFixed(2)))

const table = (head, rows) =>
    `<div class="tbl"><table><thead><tr>${head.map(h => `<th>${h}</th>`).join("")}</tr></thead><tbody>${rows.map(r => `<tr>${r.map(c => `<td>${c}</td>`).join("")}</tr>`).join("")}</tbody></table></div>`

const img = (file, alt) => `<img src="sheets/${file}.png" alt="${alt}" loading="lazy"/>`

const x1Rows = () => {
    const g = GLYPHS.x1
    const m = measure(g)

    return [
        ["field", "48", "1", "the tile"],
        ["bar", "11", frac(11, 48), "picked by eye in round four"],
        ["inflection", "24", "1/2", "dead centre, locked in round four"],
        ["sliver", n2(m.top), frac(m.top, 48), "mouth set to 0.96 of the height, so 2% of ink is left above and below"],
        ["curve drop", n2(m.drop), frac(m.drop, 48), "from the sliver to the bar's edge: whatever is left"],
        ["vertical spike", n2(g.vLen), frac(g.vLen, 48), "0.86 of the half-height (24), picked by eye"],
        ["tip margin", n2(m.tipMargin), frac(m.tipMargin, 48), "whatever 0.86 leaves"],
        ["vertical base", n2(g.vBase), frac(g.vBase, 48), "2.1 x half the bar, which is 1.05 x the bar"],
        ["diagonal spike", n2(g.dLen), frac(g.dLen, 48), "0.56 x the vertical"],
        ["diagonal base", n2(g.dBase), frac(g.dBase, 48), "1.5 x half the bar, which is 0.75 x the bar"],
        ["apex angles", `${n2(m.apexV)} / ${n2(m.apexD)} deg`, "", "vertical / diagonal: they differ, so the diagonals are blunter"],
        ["diagonal shows", n2(m.dRise), frac(m.dRise, 48), "how far a diagonal's tip rises above the bar"]
    ]
}

const lostRows = () => [
    ["bar", "11 (0.229)", "6 (0.125)", "8 (0.167)"],
    ["vertical spike, of half-height", "0.86", "0.60", "0.75"],
    ["diagonal, of vertical", "0.56", "0.78", "0.78"],
    ["vertical base", "11.55 (1.05 x bar)", "4.8 (0.8 x bar)", "6.4 (0.8 x bar)"],
    ["diagonal base", "8.25 (0.75 x bar)", "3.0 (0.5 x bar)", "4.0 (0.5 x bar)"],
    ["mouth", "0.96", "1.00", "1.00"]
]

const canonRows = () => {
    const a = GLYPHS.x1
    const c = GLYPHS.canon
    const ma = measure(a)
    const mc = measure(c)
    const k = 64 / 48

    return [
        ["bar", n2(a.bar * k), `${c.bar} = 1/4`, "edges land on 3/8 and 5/8: whole pixels at 16px, and at every power of two above"],
        ["vertical spike", n2(a.vLen * k), `${c.vLen} = 7/16`, "chosen so the tip margin is 1/16: one pixel at 16px"],
        ["tip margin", n2(ma.tipMargin * k), `${mc.tipMargin} = 1/16`, "the rule the spike length follows from"],
        ["vertical base", n2(a.vBase * k), `${c.vBase} = bar`, "a spike's base is exactly as wide as the bar it grows from"],
        ["diagonal spike", n2(a.dLen * k), `${n2(c.dLen)} = 0.6 x vertical`, "your K-sweep choice"],
        ["diagonal base", n2(a.dBase * k), `${n2(c.dBase)} = 0.6 x base`, "same 0.6, so all six spikes are one triangle"],
        ["apex angles", `${n2(ma.apexV)} / ${n2(ma.apexD)} deg`, `${n2(mc.apexV)} / ${n2(mc.apexD)} deg`, "now equal, as you asked"],
        ["diagonal shows", n2(ma.dRise * k), n2(mc.dRise), "a little more visible than X1, which you asked for"],
        ["sliver", n2(ma.top * k), `${mc.top} = 1/64`, "the smallest unit; keeps X1's thin wedge at the corners"]
    ]
}

const framedRows = () =>
    Object.entries(FRAMES).map(([key, f]) => {
        const box = f.field - 2 * (f.frame + f.gap)
        const s = box / 64

        return [key.toUpperCase(), `${f.frame} = ${frac(f.frame, 64)}`, `${f.gap} = ${frac(f.gap, 64)}`, `${box} = ${frac(box, 64)}`, n2(s), `${n2(16 * s)} = ${frac(16 * s, 64)}`]
    })

const typeRows = () =>
    ["bm700", "geist500", "geist700", "px700"].map(k => {
        const m = metrics(k)

        return [m.name, n2(m.cell), n2(m.cap), n2(m.xHeight)]
    })

const body = ({ card, sheetSection }) => {
    const bm = metrics("bm700")
    const gapEm = r4InkGapEm()

    return [
        `<section><h2>Read this first</h2>
<p>X1 is rebuilt from round four's own code and the build checks that its paths match round four's byte for byte, so the X1 here is the X1 you picked, not a lookalike. Every sheet is linked from this page; nothing needs to be screenshotted into chat.</p>
<p>Your grid theory was close in spirit but not the cause. X1 was not cropped from a framed design. It was drawn at full field with its own numbers, picked by eye: a bar of 11 and spikes reaching 0.86 of the half-height. Round five's small-size cut threw those away and reused each framed parent's bar (6 or 8) and star (0.6), which is why every round five cut has a bar roughly half as thick. That was my error, and it is why X1 never reappeared.</p></section>`,

        ...FAMILIES.map(f => `<section><h2>${f.title}</h2><p>${f.blurb}</p><div class="grid">${marks.filter(m => m.family === f.key).map(card).join("")}</div></section>`),

        `<section class="sheets"><h2>1 / X1, exactly as round four built it</h2>
<p>The whole mark, the star with every triangle drawn whole, and the expo-out curve on its own. Blue is the curve and its anchors, pink is the X-ray of the spikes, yellow is a measurement.</p>
${img("01-x1-construction", "X1 construction")}${img("02-x1-star", "X1 star")}${img("03-x1-curve", "X1 curve")}
${table(["dimension", "units of 48", "of the field", "where it came from"], x1Rows())}
<p>How the curve is installed: it lives in a box. The box's left edge is the mouth (x = 0), its right edge is the inflection (x = 24), its top is the sliver and its bottom is the bar's edge. Inside that box the edge follows 1 - 2^(-10t), so it is half done a tenth of the way across and 99% done two thirds across. That is why it looks like it stops early: the last third is flat to within a hair.</p></section>`,

        `<section class="sheets"><h2>2 / Why X1 never reached round five</h2>
${img("04-why-lost", "Why X1 was lost")}
${table(["", "X1 (round four)", "B6 cut (round five)", "R75 cut (round five)"], lostRows())}</section>`,

        `<section class="sheets"><h2>3 / Canon: X1 restated as rules</h2>
<p>The same shape on a 64-unit field, with every number following from a rule instead of a pick. The overlay shows how little moved.</p>
<p>Why 64 rather than 48: the sizes this mark ships at are 16, 32, 64, 128, 512 and 1024. On a 64 field one unit is a whole number of pixels at every one of them from 64 up, and an exact quarter or half at 16 and 32. On 48 a unit is a third of a pixel at 16 and two thirds at 32, never whole. What decides crispness is whether an edge lands on a sixteenth of the field, which is one pixel at 16px; 64 writes a sixteenth as 4 units, 48 as 3. X1 never used 48's one advantage, which is thirds. So 64, as you preferred.</p>
${img("05-canon-construction", "Canon construction")}${img("06-canon-star", "Canon star")}${img("07-canon-curve", "Canon curve")}${img("08-overlay", "X1 against canon overlay")}${img("09-x1-vs-canon", "X1 against canon at size")}
${table(["dimension", "X1, in 64ths", "canon", "rule"], canonRows())}</section>`,

        `<section class="sheets"><h2>4 / Glyph variants</h2>
<p>Diagonals at 0.7 instead of 0.6, and X4's heavier bar. With a 5/16 bar the diagonals have to grow to 0.7 just to show as much as canon's do at 0.6 (3.86 units above the bar against 3.88). A 5/16 bar cannot be crisp at 16px: centred, its edges fall on half pixels. Only 1/8, 1/4 and 3/8 can.</p>
${img("10-glyph-variants", "Glyph variants")}</section>`,

        `<section class="sheets"><h2>5 / Framed, with the same glyph</h2>
<p>Built the way you described: the glyph is designed once, then placed in a frame at a uniform scale, so its inside is identical to the tile's. The frame and the gap are the only new numbers. FA puts every number on an eighth and keeps bar equal to frame. FB tightens the gap to a sixteenth so the glyph fills more of the window, at the cost of a bar a quarter heavier than the frame.</p>
${img("11-fa-construction", "FA construction")}${img("12-framed", "Framed variants")}
${table(["", "frame", "gap", "glyph box", "glyph scale", "bar"], framedRows())}</section>`,

        `<section class="sheets"><h2>6 / B6 against R75, round four</h2>
<p>As requested, side by side at 64, 32 and 16. Both are round four's own marks, unchanged.</p>
${img("13-b6-vs-r75", "B6 against R75")}</section>`,

        `<section class="sheets"><h2>7 / Lockups</h2>
<p><b>The em, plainly.</b> Imagine every letter printed on its own card. The font size is how tall the card is: at 42px type, 1 em is 42px. Letters do not fill the card; in Berkeley Mono the tallest lowercase letter, the d, is 0.73 of it, and capitals are 0.68. Everything in a lockup is described in em so it scales with the type.</p>
<p><b>The cell.</b> In a monospace face every card is also the same width: ${n2(bm.cell)} em in Berkeley Mono and Geist Mono, ${n2(metrics("px700").cell)} em in Px Grotesk Mono. That width is one character cell. A letter sits inside its cell with a little empty space on each side, called its side bearing.</p>
<p><b>How round five's gap was made.</b> No space character. It measured 0.6 em, then started the word that far from the icon's edge. The a's own side bearing then added a little more that nobody chose. From this round on, the gap is measured to the a's ink, so it is the gap you actually see, and every typeface gets the same one.</p>
<p><b>What tracking changes.</b> Only the space between letters. The em, the cell, the icon and the gap are all set from the font size, so tracking never moves them. Your round four favourite is: icon ${n2(R4_ICON_EM)} em (${R4.icon}px at ${R4.size}px type), gap ${n2(gapEm)} em to the ink, which is ${n2(gapEm / bm.cell)} cells. Every lockup below holds those numbers unless it says otherwise.</p>
<p><b>Centring.</b> You were right that the word sat low. Round four put the baseline ${R4.baseline}px under the icon's top, which leaves the word's middle 4.8px below the icon's middle at 42px. The fix is the rule you described: take the word's height from the top of its tallest letter to the baseline, and put the middle of that on the middle of the icon.</p>
${img("14-lockup-mechanics", "Lockup mechanics")}${img("15-centring", "Centring")}${img("16-typefaces", "Typefaces")}${img("17-lockups-berkeley", "Lockups, Berkeley Mono")}${img("18-lockups-geist", "Lockups, Geist Mono")}${img("19-lockups-px", "Lockups, Px Grotesk Mono")}${img("20-lockup-spacing", "Lockup spacing")}
${table(["face", "cell (em)", "cap (em)", "x-height (em)"], typeRows())}
<p>One correction to the knowledge base: Px Grotesk Mono's cell is 0.62 em, not 0.60 as round five stated. It is measured from the font file now.</p></section>`,

        `<section class="sheets"><h2>8 / Text only</h2>
<p>The stacked altered over .computer, kept as a candidate asset for places with no room for the icon. Leading is baseline to baseline. The hanging version moves line two left one cell so the c sits under the a.</p>
${img("21-stacked", "Stacked text")}</section>`,

        `<section class="sheets"><h2>9 / Avatars</h2>
<p>A square tile's corners touch a circle crop when the tile is 1/&radic;2 = 70.7% of the diameter. Round four's avatar used 70%, so its corners almost touched, which is likely why it felt big. 62.5% leaves the corners 12% inside the circle.</p>
${img("22-avatars", "Avatars")}</section>`,

        `<section><h2>Open for round seven</h2>
<ol class="open">
<li>X1 exactly, or canon? The difference is under a unit almost everywhere; canon's case is that its bar is crisp at 16px and every number has a reason.</li>
<li>Diagonals at 0.6 or 0.7 of the vertical.</li>
<li>Framed: FA, FB, or neither. Both carry the identical glyph.</li>
<li>Typeface for the lockup: Berkeley Mono Bold, Geist Mono Medium or Bold, or Px Grotesk Mono Bold.</li>
<li>Lockup icon size and gap: keep round four's 1.62 em and 1.57 cells, or a row from the spacing sheet.</li>
<li>Stacked text: which leading, and hanging period or not.</li>
</ol></section>`
    ].join("")
}

const page6 = {
    title: "ROUND 6 / X1",
    lede: "Back to X1, round four's small-size cut. It is rebuilt exactly, every dimension measured and explained, then restated as rules on a 64-unit field and placed inside a frame with its proportions untouched. Lockups compare Berkeley Mono, Geist Mono and Px Grotesk Mono around the same icon, centred on measured ink.",
    body
}

export { page6 }
