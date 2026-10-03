# generated-mark-studies

Brand mark and wordmark studies for **ALTERED**, for the move from `usealtered.com` to `altered.computer`.

Every study here is generated from geometry rather than drawn. Curves are sampled numerically and offset along mitred normals, stars are unions of triangles, and voids are SVG masks. Changing a parameter re-derives the whole mark, which is the point: nothing is hand-placed, so every proportion is accountable.

Six rounds are preserved, oldest to newest. Round 6 is current: <https://generated-mark-studies.vercel.app/6/>.

## Layout

| Path | Contents |
| --- | --- |
| `AGENTS.md` | operating rules. Read first. `CLAUDE.md` points to it. |
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

`fonts/` holds Berkeley Mono as its variable source plus eight static cuts, `fonts/px/` the Px Grotesk set, and `fonts/geist-mono/` and `fonts/jetbrains-mono/` the two open-licence faces. Both are licensed retail faces and Px Grotesk Mono Bold is trial-only until the licence is bought. The static Berkeley cuts and the Px Grotesk Screen name fix are derived by `scripts/prepare-fonts.py`, whose outputs are committed; run it only when a weight changes.

Round 2's type studies are set in Archivo and Martian Mono as labelled stand-ins, from the round before Px Grotesk was reachable. Those two are not in the repo, so rebuilding on a machine without them re-renders round 2's labels in the fallback face. Leave those sheets as committed.

`src/fontguard.mjs` throws when a requested face silently falls back, so a specimen can never lie about which typeface it shows.

## Using the output

The SVGs in `exports/` are clean geometry: a few `<path>` elements with three-decimal coordinates, no embedded rasters, no traced outlines. Paste them into a project, open them in Illustrator, or feed them to a favicon generator.

Because the geometry is unit-based, any size is exact with no redrawing. Rounds 1 to 5 use a 48-unit field; round 6's canon uses 64, which maps to whole pixels at every power-of-two size.

## Where the mark stands

Favourite: X1, round four's small-size cut, in a lockup with Berkeley Mono Bold. Locked: expo-out taper, inflection dead centre, diagonals at 0.6 of the vertical with matching apex angles, float attachment and bar equal to frame for framed marks, square corners.

Open: X1 exactly or canon, diagonal length, which framed version, the lockup typeface (Berkeley Mono, Geist Mono or Px Grotesk Mono), lockup spacing, and the stacked text's leading.

Verdicts in `docs/REVIEWS.md`, geometry in `docs/MARK.md`.
