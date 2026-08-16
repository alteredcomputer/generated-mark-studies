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
| `scripts/` | font fetching and the full build |
| `fonts/` | gitignored. Licensed typefaces, never committed |
| `build/` | gitignored. Throwaway rasters |

## Running it

```sh
pnpm install
pnpm fonts     # needs GITHUB_TOKEN with read access to the private typeface repo
pnpm build     # regenerates build/ and site/
```

Berkeley Mono cannot be fetched and must be supplied by hand as a variable `.woff2`, then instanced to static weights. Px Grotesk Mono Bold is trial-only until the licence is bought.

Without the fonts the icon sheets still render, but every specimen and label falls back. `src/fontguard.mjs` will throw rather than let that happen silently.

## Using the output

The SVGs in `exports/` are clean geometry: a few `<path>` elements with three-decimal coordinates, no embedded rasters, no traced outlines. Paste them into a project, open them in Illustrator, or feed them to a favicon generator.

Because the geometry is unit-based on a 48-unit field, any size is exact with no redrawing. 16, 24, 32, 48, 512 and 1024 are all clean multiples.

## Where the mark stands

Locked: expo-out taper, inflection dead centre, bar weight equal to frame weight, star reach around 0.6 of the window half-height, square corners, and Px Grotesk Mono Bold for the logotype.

Open: the exact frame and bar weight, the diagonal spike proportions, and whether the small-size cut becomes the primary mark wherever there is no logotype.

Full detail in `docs/MARK.md`.
