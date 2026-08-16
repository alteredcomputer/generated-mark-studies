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
pnpm fonts        # needs GITHUB_TOKEN; Berkeley Mono must be added by hand
pnpm build        # regenerates build/ and site/
```

`build/` is throwaway and gitignored. `site/` is committed, because Vercel serves it
directly with no build step.

## The font fallback trap

`resvg` substitutes the default family without warning. That is how an early specimen labelled "Px Grotesk Screen 800" was actually JetBrains Mono.

Two causes, both worth knowing:

- **Typographic family names.** A face declaring name IDs 16/17 (`Px Grotesk` / `Screen`) registers under the typographic family, not the legacy family in name ID 1. Requesting `Px Grotesk Screen` then matches nothing. Fix: flatten name IDs 1/2/4/16/17 to the addressable name.
- **Weight class mismatch.** Requesting a weight no registered face declares can fall through to the default rather than snapping to the nearest.

`fontguard.mjs` fingerprints a render of each requested family/weight and compares it to a render of a deliberately missing family. Identical hash means fallback, and the build throws. Always run it before producing a specimen sheet.

## Font preparation

Variable fonts must be instanced to static faces before use; `resvg` does not honour variation axes. `fontTools` handles this:

- `instancer.instantiateVariableFont(font, {"wght": 700, "wdth": 100, "slnt": 0})`
- Then set `OS/2.usWeightClass` and rewrite name IDs 1/2/4/6 so each instance is addressable by family + weight.
- `woff2` inputs need `flavor = None` before saving as `ttf`.
