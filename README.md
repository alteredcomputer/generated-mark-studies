# generated-mark-studies

Brand mark and wordmark studies for **ALTERED**, for the move from `usealtered.com` to `altered.computer`.

Every study here is generated from geometry rather than drawn. Curves are sampled numerically and offset along mitred normals, stars are unions of triangles, and voids are SVG masks. Changing a parameter re-derives the whole mark, which is the point: nothing is hand-placed, so every proportion is accountable.

Five rounds are preserved, oldest to newest. Round 5 is current.

## Layout

| Path | Contents |
| --- | --- |
| `AGENTS.md` | operating rules. Read first. |
| `docs/` | the knowledge base: brand decisions, the mark spec, typography, the pipeline |
| `src/` | the generator |
| `site/` | the built static gallery, committed and served as-is |
| `exports/` | the canonical mark and its small-size cut as clean, reusable SVG |
| `scripts/` | the full build, and the one-off font derivation |
| `fonts/` | the typefaces, committed |
| `build/` | gitignored. Throwaway rasters |

## Running it

```sh
pnpm install
pnpm build     # regenerates build/ and site/
```

That is everything. The typefaces are in `fonts/`, so there is no fetch step and no token.

`fonts/` holds Berkeley Mono as its variable source plus eight static cuts, and `fonts/px/` holds the Px Grotesk set. Both are licensed retail faces and Px Grotesk Mono Bold is trial-only until the licence is bought. The static Berkeley cuts and the Px Grotesk Screen name fix are derived by `scripts/prepare-fonts.py`, whose outputs are committed; run it only when a weight changes.

Round 2's type studies are set in Archivo and Martian Mono as labelled stand-ins, from the round before Px Grotesk was reachable. Those two are not in the repo, so rebuilding on a machine without them re-renders round 2's labels in the fallback face. Leave those sheets as committed.

`src/fontguard.mjs` throws when a requested face silently falls back, so a specimen can never lie about which typeface it shows.

## Using the output

The SVGs in `exports/` are clean geometry: a few `<path>` elements with three-decimal coordinates, no embedded rasters, no traced outlines. Paste them into a project, open them in Illustrator, or feed them to a favicon generator.

Because the geometry is unit-based on a 48-unit field, any size is exact with no redrawing. 16, 24, 32, 48, 512 and 1024 are all clean multiples.

## Where the mark stands

Locked: expo-out taper, inflection dead centre, bar weight equal to frame weight, star reach around 0.6 of the window half-height, square corners, and Px Grotesk Mono Bold for the logotype.

Open: the exact frame and bar weight, the diagonal spike proportions, and whether the small-size cut becomes the primary mark wherever there is no logotype.

Full detail in `docs/MARK.md`.
