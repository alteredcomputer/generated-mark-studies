//  Regenerates every round's sheets and rebuilds the static gallery in site/.
//
//  Rounds run in order because the gallery reads each round's rasterised sheets
//  off disk. Round 4 has a second pass (sheets-type) that appends the typeface
//  specimens to the same output folder.

import { mkdirSync } from "node:fs"

import { BUILD, sheets, svgs } from "../src/paths.mjs"

const ROUNDS = [
    ["1", "../src/sheets-r1.mjs"],
    ["2", "../src/sheets-r2.mjs"],
    ["3", "../src/sheets-r3.mjs"],
    ["4", "../src/sheets-r4.mjs"],
    ["4 (type)", "../src/sheets-type.mjs"],
    ["5", "../src/sheets-r5.mjs"],
    ["6", "../src/sheets-r6.mjs"]
]

mkdirSync(BUILD, { recursive: true })

for (let r = 1; r <= 6; r++) {
    mkdirSync(sheets(r), { recursive: true })
    mkdirSync(svgs(r), { recursive: true })
}

for (const [label, mod] of ROUNDS) {
    console.log(`\n=== round ${label} ===`)

    await import(mod)
}

console.log("\n=== gallery ===")

await import("../src/site.mjs")

console.log("\ndone. site/ is ready to serve as-is; no build step is needed on deploy.")
