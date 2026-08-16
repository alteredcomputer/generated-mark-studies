# Rendering Pipeline

Every study is generated, not drawn. No Illustrator, no hand-placed vertices.

## The chain

1. **Geometry in JavaScript.** Plain ES modules emit SVG path `d` strings on the 48-unit grid. Curves are sampled numerically and offset along mitred normals; stars are unions of triangles. Nothing is hand-placed, so a parameter change re-derives the whole mark.
2. **Composition into one SVG.** Each mark is a list of ops painted into an SVG luminance mask: `on` reveals ink, `off` cuts a void. A masked rect is then filled with the palette colour. This keeps voids genuinely transparent, so a mark composites onto any background without a fake paper-coloured fill, and unions are implicit and seam-free.
3. **Rasterisation with `@resvg/resvg-js`.** A Rust SVG renderer with Node bindings. Contact sheets are themselves SVGs containing every mark, rasterised in one pass.
4. **Deployment.** Inline SVG in a static HTML gallery pushed to Vercel, so the marks stay resolution-independent on a phone.

## What this means for reuse

**The SVG is the source of truth and it is directly reusable.** These are not traced images. Every exported file is clean geometry: a handful of `<path>` elements with integer or three-decimal coordinates, no embedded rasters, no clipping hacks. They can be pasted straight into the repo, opened in Illustrator, or fed to a favicon generator.

Any size can be produced on request: the geometry is unit-based, so a 16px favicon and a 1024px app icon come from the same source with no redrawing. Ask for a size and a polarity and it is one command.

Practical notes for downstream use:

- Voids are produced with `<mask>`. If a consumer needs a single flat `<path>` with no mask (some icon toolchains do), the mask can be flattened to an even-odd path on request.
- Colour is a fill on one rect, so recolouring is a one-attribute change.
- The mark is authored on a 48-unit viewBox. Scaling is exact at any multiple; 16, 24, 32, 48, 512 and 1024 are all clean.

## Source

`src/` holds the whole generator, one module per concern plus one pair of modules per round.

| File | Purpose |
| --- | --- |
| `paths.mjs` | every filesystem location, derived from the repo root |
| `geom.mjs` | primitives: easings and their mirrors, mitred polyline offsetting, funnel sampling, spike and flare stars, frames |
| `render.mjs` | palette-aware mask renderer; resolves tones against the dark/light schemes |
| `fontguard.mjs` | fails the build when a requested face silently falls back |
| `marks-rN.mjs` | the mark definitions for round N |
| `sheets-rN.mjs` | the contact sheets for round N |
| `sheets-type.mjs` | the typeface specimens, appended to round 4 |
| `site.mjs` | assembles `site/` from every round |

```sh
pnpm install
pnpm build        # regenerates build/ and site/
```

`build/` is throwaway and gitignored. `site/` is committed, because Vercel serves it
directly with no build step: `vercel.json` stubs out the install and build commands so a
deploy is a file copy. Without that stub Vercel finds the `build` script and runs the
generator on its own machine, which has none of the system fonts, and every label in the
gallery would be re-rendered in a fallback face.

Rounds 1, 3, 4 and 5 rebuild byte-for-byte identical to what is committed. Round 2 does
not, because its type studies use Archivo and Martian Mono as labelled stand-ins and those
two are not in `fonts/`.

## The font fallback trap

`resvg` substitutes the default family without warning. That is how an early specimen labelled "Px Grotesk Screen 800" was actually JetBrains Mono.

Two causes, both worth knowing:

- **Typographic family names.** A face declaring name IDs 16/17 (`Px Grotesk` / `Screen`) registers under the typographic family, not the legacy family in name ID 1. Requesting `Px Grotesk Screen` then matches nothing. Fix: flatten name IDs 1/2/4/16/17 to the addressable name.
- **Weight class mismatch.** Requesting a weight no registered face declares can fall through to the default rather than snapping to the nearest.

`fontguard.mjs` fingerprints a render of each requested family/weight and compares it to a render of a deliberately missing family. Identical hash means fallback, and the build throws. Always run it before producing a specimen sheet.

Every module that sets type now asserts its own cast: round 5 always did, and rounds 4 and the type sheets were added after a deploy rebuilt them silently in JetBrains Mono.

## The fonts

`fonts/` is committed, so a clone renders every specimen with no token and no font hunt.

| Path | What it is |
| --- | --- |
| `fonts/berkeley-mono-variable.woff2` | the source Berkeley Mono, axes `wght` 100-900, `wdth` 60-100, `slnt` -16-0 |
| `fonts/BerkeleyMono-*.ttf` | six static weights, 400 to 900, `wdth` 100 |
| `fonts/BerkeleyMonoCond-*.ttf` | Bold and Black at `wdth` 80, the source's own Condensed instance |
| `fonts/px/*.otf` | the Px Grotesk set: full-licence Regular and Bold, full-licence Mono Regular, Screen, and the trial cuts |

The `.ttf` cuts and the Screen name fix are produced by `scripts/prepare-fonts.py`, which needs `pip install fonttools brotli`. It is idempotent and its outputs are committed, so it is a one-off rather than a build step. It is Python because fontTools is the only instancer available; the generator stays pure ES modules.

Three things it handles, each a trap that has already cost a render:

- **Variable axes are ignored by `resvg`,** so every weight a sheet asks for has to exist as its own file. `instancer.instantiateVariableFont(font, {"wght": 700, "wdth": 100, "slnt": 0})`, then set `OS/2.usWeightClass` and rewrite name IDs 1/2/4/6 so the face is addressable by family plus weight.
- **A condensed cut needs its own family name.** fontdb keys on family plus weight, so a `wdth` 80 face at weight 700 would collide with the normal 700. Hence `Berkeley Mono Cond` rather than a width axis.
- **Name IDs 16/17 shadow ID 1.** They are dropped on every derived face. Px Grotesk Screen shipped with 16/17 set to `Px Grotesk` / `Screen`, so requesting `Px Grotesk Screen` matched nothing at all.

`woff2` inputs need `flavor = None` before saving as `ttf`, or the file stays compressed and `resvg` will not read it out of a font directory.

Two faces the sheets use are not in `fonts/`: JetBrains Mono, the UI face for every label, comes from system fonts, and round 2's Archivo and Martian Mono stand-ins are not vendored. `assertFaces` skips JetBrains Mono for that reason.

Px Grotesk Screen ships as a single cut with `usWeightClass` 800. Requests for Screen 400 and Screen 800 both resolve to that one file, which is correct, not a fallback.
