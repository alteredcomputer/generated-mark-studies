//  Pulls the Px Grotesk set out of the private typeface repo and prepares static
//  instances. Fonts are never committed: this repository is public and both
//  Px Grotesk and Berkeley Mono are licensed.
//
//  Requires GITHUB_TOKEN with read access to inducingchaos/riley-barabash.
//  Berkeley Mono is not fetchable and must be dropped into fonts/ by hand.

import { mkdirSync, writeFileSync, existsSync } from "node:fs"

import { FONTS } from "../src/paths.mjs"

const TOKEN = process.env.GITHUB_TOKEN ?? process.env.READ_ONLY__GITHUB_TOKEN

const BASE = "https://api.github.com/repos/inducingchaos/riley-barabash/contents/public/shared/typefaces"

const WANTED = [
    ["px-grotesk/regular.otf", "PxGrotesk-Regular.otf"],
    ["px-grotesk/bold.otf", "PxGrotesk-Bold.otf"],
    ["px-grotesk-trial/light.otf", "PxGroteskTrial-Light.otf"],
    ["px-grotesk-trial/regular.otf", "PxGroteskTrial-Regular.otf"],
    ["px-grotesk-trial/bold.otf", "PxGroteskTrial-Bold.otf"],
    ["px-grotesk-trial/black.otf", "PxGroteskTrial-Black.otf"],
    ["px-grotesk-mono/regular.otf", "PxGroteskMono-Regular.otf"],
    ["px-grotesk-mono-trial/light.otf", "PxGroteskMonoTrial-Light.otf"],
    ["px-grotesk-mono-trial/regular.otf", "PxGroteskMonoTrial-Regular.otf"],
    ["px-grotesk-mono-trial/bold.otf", "PxGroteskMonoTrial-Bold.otf"],
    ["px-grotesk-screen/regular.otf", "PxGroteskScreen-Regular.otf"]
]

if (!TOKEN) {
    console.error("GITHUB_TOKEN is not set. Cannot reach the private typeface repo.")
    process.exit(1)
}

mkdirSync(`${FONTS}/px`, { recursive: true })

for (const [path, name] of WANTED) {
    const res = await fetch(`${BASE}/${path}`, {
        headers: { authorization: `Bearer ${TOKEN}`, accept: "application/vnd.github.raw" }
    })

    if (!res.ok) {
        console.error(`  FAILED ${name}: HTTP ${res.status}`)
        continue
    }

    writeFileSync(`${FONTS}/px/${name}`, Buffer.from(await res.arrayBuffer()))
    console.log(`  ${name}`)
}

console.log("\nPost-fetch steps, see docs/PIPELINE.md:")
console.log("  1. Flatten PxGroteskScreen name IDs 16/17, or it silently falls back.")
console.log("  2. Instance Berkeley Mono's variable file to static weights.")

if (!existsSync(`${FONTS}/BerkeleyMono-Bold.ttf`))
    console.log("\nBerkeley Mono is missing. Supply berkeley-mono-variable.woff2 and instance it.")
