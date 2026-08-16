import { fileURLToPath } from "node:url"
import { dirname, resolve } from "node:path"

const HERE = dirname(fileURLToPath(import.meta.url))

const ROOT = resolve(HERE, "..")

//  Licensed typefaces are gitignored. `pnpm fonts` fetches the Px Grotesk set from
//  the private typeface repo; Berkeley Mono has to be dropped in by hand.
const FONTS = resolve(ROOT, "fonts")

//  Rasterised sheets and per-mark SVGs, regenerated on every build.
const BUILD = resolve(ROOT, "build")

//  The static gallery Vercel serves. Committed, so no build step is needed on deploy.
const SITE = resolve(ROOT, "site")

const EXPORTS = resolve(ROOT, "exports")

const sheets = round => resolve(BUILD, `r${round}`)

const svgs = round => resolve(BUILD, `svg${round}`)

export { ROOT, FONTS, BUILD, SITE, EXPORTS, sheets, svgs }
