# Typography

## Decision

**Px Grotesk Mono Bold** for the logotype. Confirmed by the operator after a direct comparison against Berkeley Mono.

Berkeley Mono is retained for website copy. It is rounder, more even, and more conventional; it reads as an excellent code-editor face. Px Grotesk Mono is squarer and more machined, with a hard angled flag on the `r`, a flatter `t` and a straighter tail on the `a`. That matches the brutalist direction.

**Licensing:** the repo's full licence covers Px Grotesk Regular/Bold and Px Grotesk Mono **Regular**. The **Mono Bold is trial-only**. The operator will buy the licence once the designs are finalised; trial use is acceptable during design.

## Available faces

From `inducingchaos/riley-barabash` at `public/shared/typefaces/`:

| Directory | Contents |
| --- | --- |
| `px-grotesk` | `regular.otf`, `bold.otf` (full licence), `light.woff2` |
| `px-grotesk-trial` | thin, light, regular, bold, black, each with an italic |
| `px-grotesk-mono` | `regular.otf` (full licence) |
| `px-grotesk-mono-trial` | light, regular, bold, each with an italic |
| `px-grotesk-screen` | `regular.otf` |
| `px-grotesk-screen-trial` | `regular.otf` |
| also present | `geist`, `geist-mono`, `hoefler-text`, `saans` |

Berkeley Mono was supplied directly as a variable `.woff2`: axes `wght` 100-900, `wdth` 60-100, `slnt` -16-0.

## Metrics

Cap height is **0.68 em in every Px Grotesk cut and in Berkeley Mono**, so they compare fairly at the same font size with no optical normalisation. Px Grotesk Mono's advance width is **0.60 em**, which defines one character cell.

## Optical spacing

Px Grotesk Mono is monospaced, so **there is no kerning to fix**: every advance is already 0.60 em. Optical spacing is therefore a single global tracking decision, not a per-pair one.

The operator's original wordmark reads at roughly tracking 0. Slight positive tracking, **+1.5 to +3 px at 52px (0.03 to 0.06 em)**, opens the counters of the double-l and the `r` without breaking the machined rhythm. Past +6 it reads as a spaced-out label rather than a wordmark.

## Lockup mathematics

Derived from type metrics, not eyeballed.

- **Icon height = 1.00 em.** At 54px type the icon is a 54px tile, which is 48 grid units. This ties the tile directly to the type size, and since cap height is 0.68 em, the icon overshoots the cap band top and bottom by an equal 0.16 em, which optically centres it against the word.
- **Gap = one character cell = 0.60 em.** In a monospace lockup this keeps the icon on the same rhythm as the letters: the icon occupies a whole cell of its own.
- **Vertical alignment is cap-centred, not baseline-sat.** The icon's centre matches the centre of the cap band.
- **Unit conversion:** one icon grid unit = `fontSize / 48` px. At 54px type, a 6-unit frame renders 6.75px.

Alternatives rendered for comparison: icon at 1.18 em (cap + ascender + descender), icon at exactly cap height (0.68 em), and gap at half a cell.

## Wordmark lockup

Preferred form, per the operator: **period leading line two.**

```
altered
.computer
```

Reads as "altered" then "dot computer". The second line running two characters longer is treated as a deliberate brutalist overhang. A simplified variant with no TLD is also required.

Rejected: the period trailing line one (`altered.` over `computer`), despite its 8-character symmetry, and the single-line form with a square period.

The square-period substitution from earlier rounds is no longer needed now that the real typeface is in use.
