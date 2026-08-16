import { fileURLToPath } from "node:url"
import { dirname, resolve } from "node:path"

const HERE = dirname(fileURLToPath(import.meta.url))

const ROOT = resolve(HERE, "..")

//  Committed, so a clone renders every specimen with no token and no font hunt.
//  Berkeley Mono statics sit at the top level, the Px Grotesk set in fonts/px.
const FONTS = resolve(ROOT, "fonts")

//  Rasterised sheets and per-mark SVGs, regenerated on every build.
const BUILD = resolve(ROOT, "build")

//  The static gallery Vercel serves. Committed, so no build step is needed on deploy.
const SITE = resolve(ROOT, "site")

const EXPORTS = resolve(ROOT, "exports")

const sheets = round => resolve(BUILD, `r${round}`)

const svgs = round => resolve(BUILD, `svg${round}`)

export { ROOT, FONTS, BUILD, SITE, EXPORTS, sheets, svgs }
