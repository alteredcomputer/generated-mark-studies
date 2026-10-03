//  Round six sheets. Construction first, because the operator asked to see exactly
//  how X1 is built before choosing what to change.

import { mkdirSync, writeFileSync } from "node:fs"

import { marks, byId, GLYPHS, FRAMES } from "./marks-r6.mjs"
import { standalone } from "./render.mjs"
import { writer } from "./sheetkit.mjs"
import { overallSheet, starSheet, curveSheet, overlaySheet, framedSheet } from "./sheets-r6-construct.mjs"
import { ladderSheet, avatarSheet } from "./sheets-r6-ladder.mjs"
import { mechanicsSheet, centringSheet, typefaceSheet, iconSheet, spacingSheet, stackedSheet } from "./sheets-r6-type.mjs"

import { sheets, svgs } from "./paths.mjs"

const SHEETS6 = sheets(6)
const SVGS6 = svgs(6)

mkdirSync(SHEETS6, { recursive: true })
mkdirSync(SVGS6, { recursive: true })

const write = writer(SHEETS6)

console.log("round six sheets:")

write("01-x1-construction", overallSheet(GLYPHS.x1, "X1, ROUND FOUR EXACT"))
write("02-x1-star", starSheet(GLYPHS.x1, "X1, ROUND FOUR EXACT"))
write("03-x1-curve", curveSheet(GLYPHS.x1, "X1, ROUND FOUR EXACT"))
write(
    "04-why-lost",
    ladderSheet("WHY X1 NEVER REACHED ROUND FIVE", ["round five's cut kept its framed parent's bar and star instead of X1's.", "same field, same curve; the bar fell from 11 to 6 or 8 and the spikes from 0.86 to 0.6 or 0.75 of the half-height."], ["x1", "r5-b6-cut", "r5-r75-cut"].map(byId))
)
write("05-canon-construction", overallSheet(GLYPHS.canon, "X1 CANON"))
write("06-canon-star", starSheet(GLYPHS.canon, "X1 CANON"))
write("07-canon-curve", curveSheet(GLYPHS.canon, "X1 CANON"))
write("08-overlay", overlaySheet(GLYPHS.x1, GLYPHS.canon, "X1", "CANON"))
write("09-x1-vs-canon", ladderSheet("X1 AGAINST CANON", ["the same shape, restated as rules. watch the bar's edges in the 16px view: canon's land on whole pixels."], ["x1", "canon"].map(byId)))
write("10-glyph-variants", ladderSheet("GLYPH VARIANTS", ["canon against the two changes you asked about: longer diagonals, and X4's heavier bar with extended diagonals."], ["canon", "g-d70", "g-heavy"].map(byId)))
write("11-fa-construction", framedSheet(GLYPHS.canon, FRAMES.fa, "FA"))
write("12-framed", ladderSheet("FRAMED / SAME GLYPH", ["the canon glyph inside a frame, scaled uniformly. round four's B6 below for comparison."], ["f-a", "f-b", "r4-b6"].map(byId)))
write("13-b6-vs-r75", ladderSheet("ROUND FOUR / B6 AGAINST R75", ["as requested: the two round four favourites side by side at 64, 32 and 16."], ["r4-b6", "r4-r75"].map(byId)))

const LOCKUP_ICONS = ["x1", "canon", "f-a", "r4-b6", "r4-r75"].map(byId)

write("14-lockup-mechanics", mechanicsSheet(byId("x1")))
write("15-centring", centringSheet(byId("x1")))
write("16-typefaces", typefaceSheet(byId("x1")))
write("17-lockups-berkeley", iconSheet("bm700", LOCKUP_ICONS))
write("18-lockups-geist", iconSheet("geist700", LOCKUP_ICONS))
write("19-lockups-px", iconSheet("px700", LOCKUP_ICONS))
write("20-lockup-spacing", spacingSheet(byId("x1")))
write("21-stacked", stackedSheet())
write("22-avatars", avatarSheet(["x1", "canon"].map(byId), [0.7, 0.625, 0.5]))

for (const m of marks) writeFileSync(`${SVGS6}/${m.id}.svg`, standalone(m, { size: 512, scheme: "dark" }))

console.log(`svg6: ${marks.length} marks`)
