# Brand Decisions

## The brief

From the operator's first message, which started the work. Kept because later rounds keep returning to it.

- **Aesthetic:** brutalist, minimalist, technical. Thick, bold, square lines, with most of the icon filled rather than negative space, like Raycast's icon. Square origins, "like concrete brutalism"; at most very softly rounded corners, and square for now. The icon may be wider than tall.
- **Geometry:** "geometrically proportionate and explainable by proportions and perfect angles". Every dimension should have a reason. The operator is not a trained designer and wants each proportion explained.
- **Inspiration:** Pierre Computer Company (pierre.computer) for the markdown-style minimal website and brand feel, without copying it. Raycast for the quality, precision and detail of the software itself. Dan Koe's old Kortex mark, the origin of the square container.
- **Meaning:** ALTERED is a knowledge orchestration infrastructure platform. Thoughts are the base primitive; attributes are data points on thoughts; datasets are tags; systems are composable mini-apps for the mind, like Apple Shortcuts. The icon should be symbolic without being niche: candidates offered were capturing a thought, entropy in a box, transformation of data (in one end, out the other), compounding reuse, and noise into signal (Koa, the iMessage agent, gives founders clarity).
- **The name:** the altered path in life. Self-teaching over school, building over employment, refusing an average result. Stylised ALTERED. Also an altered state of consciousness, which the app gives by organising, versioning and using thoughts.
- **Lore, not furniture:** "knowledge orchestration infrastructure" abbreviates to KOI, and koi are the fish of yin and yang, which mirrors entropy against order. The operator's earlier app was Kyzn, after kaizen, continuous improvement. Both shape the geometry (duality, conversion, improvement) but must never appear literally: KOI collides with Koa, and a CJK glyph reads as unrelated signalling.
- **Action, not decoration:** the mark must imply processing, transformation or input to output. A static object, such as a retro TV on its own, says nothing about outcomes.
- **Exponential, personally:** the operator uses expo-out easing constantly and finds compounding and powers of two meaningful. That is why expoOut is locked.
- **Why replace the old mark:** it looks good as a macOS menu bar icon but crude as a profile picture on a dark background, whatever the texture or shade.

## Domain

Moving from `usealtered.com` to `altered.computer`. Decided; not yet executed.

- `usealtered.com` is retained as a 301 and can keep email/MX until deliverability on the new TLD is proven.
- The `@usealtered` X handle becomes a seam once the site is `altered.computer`. Resolve the handle in the same pass.
- The repo hardcodes the old domain in `.context/_generated/plans/imessage-server-poc.md`: `api.usealtered.com`, the Better Auth `allowedHosts` allowlist, `crossSubDomainCookies` scoping, and the Sendblue webhook origin. Cheap to change pre-launch, expensive after.
- `.computer` reads as a tool studio rather than an infrastructure vendor. Judged acceptable and on-brand: the buyer is a technical founder who prefers instruments.

## What the mark must mean

The operator's ruling, which resolved an apparent contradiction between the name and the offer copy:

> The name is the branch. The product is the convergence. The icon depicts the outcome, not the etymology.

ALTERED means the altered path: self-teaching over school, building over employment, better than average. That widening is the *precondition*. The product's job is to distil that widened, scattered input back into clarity. So the mark shows **many, transformed, one**: a wide uneven intake on the left, a transformation at the inflection, a single clean line out.

This also resolves the tension with the locked offer copy in `.context/strategy-generated/frameworks/OFFER.md`, which promises to eliminate pressure pivots and keep the user locked on the goal. A mark that depicts *branching* would argue for the failure mode the offer sells against. A mark that depicts *convergence* does not.

Consequence: any direction encoding a fork is out. That retired the original option-key glyph on meaning grounds, independently of its rendering problems.

## The old mark, and why it is being replaced

An outlined square containing the macOS option glyph, with the wordmark in Px Grotesk Mono Bold.

Failures:

- **Outline inside an outline.** At avatar size the eye resolves the hollow square first and the glyph second, so there is no single silhouette. Filled forms survive downscaling and circle crops; concentric thin strokes turn to grey mush. This, not colour or texture, is why the profile picture never worked.
- **Not ownable.** The glyph is Apple's option key, and "modifier glyph in a box" is how macOS documents keyboard shortcuts.
- **Depicts a fork**, per the meaning ruling above.

It works as a macOS menu bar template icon, because the whole menu bar is drawn as thin monochrome outlines. That is the one context to keep it in.

## Lineage and references

- **Kortex** (Dan Koe's old mark): a thin outlined rounded square holding a sparkle and a curved swoosh. The operator's original square container came from here. Structurally it depicts the *expansion* of ideas, so ALTERED's version is horizontally reversed. Its outline-plus-thin-interior structure is the exact failure mode to avoid; the fix is a frame thick enough to be the ink rather than an outline.
- **Raycast**: the reference for software quality, precision, and detail, not for visual style.
- **Pierre** (pierre.computer): the reference for markdown-style minimalism in the landing page. Do not build a diff or git-flavoured mark; that is their turf and the most likely accidental copy.
- **Midday.ai**: base-layer inspiration per root `AGENTS.md`.

## Palette

Monochrome. Accents deferred.

| Role | Dark | Light |
| --- | --- | --- |
| Background | `#101010` (`#181818`, `#202020` acceptable) | `#FFFFFF` |
| Foreground | `#FFFFFF` | `#404040` |
| Neutral (duotone, muted text) | `#808080` | `#808080` |

Pure `#000000` and `#FFFFFF` have a place but are not the defaults. Any other HSL lightness expressed as a fraction of 32 or 64 is valid.

Corner radius: square for now. Revisit only if a platform requires rounding; the preferred workaround is a smaller mark on a square-cornered dark tile.

## Rejected concept directions

Recorded so they are not re-proposed. Each was rendered and reviewed.

| Direction | Verdict |
| --- | --- |
| Sparkle / four-point star alone | Universal AI cliché. Out. |
| Hash `#` (tag glyph) | Too generic, no real meaning. Out. |
| Asterisk as the whole mark | Aesthetic but ambiguous. Out as a standalone; survived only as a candidate inflection glyph, later also rejected. |
| Tunnel / one-point perspective | Reads as universe or mysticism, not as the product. Out. |
| Grain / dither ramp | Too much fine detail; drowns at small sizes. Out. |
| Strands / splintered channels | Reads as a splintered stick. Out. |
| Return glyph, spiral, brackets, origin axes, comb, key | All out: no inherent meaning or beginner-tech signalling. |
| Kaizen `改` stroke grammar | Abstraction did not survive. Out. |
| Duotone layer/version stacks | Read as a generic duplicate-layer icon. Out. |
| Powers-of-two bars, offset stack | Read as cell signal bars and a hamburger menu. Out. |
| Oscilloscope / CRT chassis | Interesting, but adds complexity and mutates the proportions. Out of brand scope. |
| Letterform marks (the `r`) | No inherent meaning. Out. |
| Unframed and inverted-unframed full marks | Out at large size. The inverted *small-size cut* survived separately, see `MARK.md`. |

## Correction log

Errors made and corrected during the work. Kept because they encode real constraints.

- The `r` in the original wordmark is **not** mirrored. It is Px Grotesk Mono Bold's own letterform. An earlier round built a "reversed terminal" narrative on this misreading and it was retired.
- An earlier "Px Grotesk Screen 800" specimen was a **silent font fallback to JetBrains Mono**. Cause: the face declares typographic family `Px Grotesk` / subfamily `Screen` in name IDs 16/17, so it registers under `Px Grotesk` and the requested family never matched. Fixed by flattening the name table; a fallback guard now fails the build instead of rendering the wrong face. See `PIPELINE.md`.
- The "45 degree mirror" of an easing was first answered about the wrong diagonal and with the wrong function. The correct treatment is in `MARK.md`.
- Round five's small-size cut re-derived X1 from each framed parent's bar and star instead of reusing X1's numbers, so X1, the operator's favourite, vanished from round five. Reuse a picked mark's exact parameters and assert they match.
- Round five's lockup sheet centred the icon on the baseline instead of the cap band: `iconY = baseline - cap/2 - (icon - cap)/2` reduces to `baseline - icon/2`. Every row's icon sat visibly low.
- Round five's spike anatomy sheet placed three 420px panels on a 1080px sheet; the third ran off the edge. `sheetkit.bounds()` now fails the build on overflow.
- Round five's reconstruction of the original option-key mark was hand-placed and rendered its glyph outside its box. Do not hand-place reconstructions either.
- Px Grotesk Mono's advance is **0.62 em**, not the 0.60 that round five's lockup maths assumed. Metrics are now read from the font files.
- opentype.js 2's `toPathData` drops close-path commands at some coordinates and fills a letter's counter solid. `src/type.mjs` serialises glyph commands itself.
